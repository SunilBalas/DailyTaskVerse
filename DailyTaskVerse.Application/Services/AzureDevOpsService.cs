using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.DataProtection;
using DailyTaskVerse.Application.DTOs.AzureDevOps;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.Application.Services;

public class AzureDevOpsService : IAzureDevOpsService
{
    private readonly IAzureDevOpsSettingsRepository _settingsRepository;
    private readonly IDataProtector _protector;
    private readonly IHttpClientFactory _httpClientFactory;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public AzureDevOpsService(
        IAzureDevOpsSettingsRepository settingsRepository,
        IDataProtectionProvider dataProtectionProvider,
        IHttpClientFactory httpClientFactory)
    {
        _settingsRepository = settingsRepository;
        _protector = dataProtectionProvider.CreateProtector("AzureDevOpsPat");
        _httpClientFactory = httpClientFactory;
    }

    public async Task<AzureDevOpsSettingsDto> GetSettingsAsync(Guid userId)
    {
        var settings = await _settingsRepository.GetByUserIdAsync(userId);
        if (settings == null)
            return new AzureDevOpsSettingsDto { IsConnected = false };

        return MapToDto(settings);
    }

    public async Task<AzureDevOpsSettingsDto> SaveSettingsAsync(Guid userId, SaveAzureDevOpsSettingsRequest request)
    {
        var orgUrl = request.OrganizationUrl.TrimEnd('/');

        // Validate connection first
        var isValid = await TestConnectionAsync(orgUrl, request.Pat);
        if (!isValid)
            throw new UnauthorizedAccessException("Failed to connect to Azure DevOps. Please check your organization URL and PAT.");

        var encryptedPat = _protector.Protect(request.Pat);
        var projectIdsJson = JsonSerializer.Serialize(request.SelectedProjectIds);
        var projectNamesJson = JsonSerializer.Serialize(request.SelectedProjectNames);

        var existing = await _settingsRepository.GetByUserIdAsync(userId);
        if (existing != null)
        {
            existing.OrganizationUrl = orgUrl;
            existing.EncryptedPat = encryptedPat;
            existing.SelectedProjectIds = projectIdsJson;
            existing.SelectedProjectNames = projectNamesJson;
            existing.IsConnected = true;
            await _settingsRepository.UpdateAsync(existing);
            return MapToDto(existing);
        }

        var settings = new AzureDevOpsSettings
        {
            Id = Guid.NewGuid(),
            OrganizationUrl = orgUrl,
            EncryptedPat = encryptedPat,
            SelectedProjectIds = projectIdsJson,
            SelectedProjectNames = projectNamesJson,
            IsConnected = true,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _settingsRepository.CreateAsync(settings);
        return MapToDto(settings);
    }

    public async Task<bool> TestConnectionAsync(string organizationUrl, string pat)
    {
        try
        {
            var client = CreateHttpClient(organizationUrl.TrimEnd('/'), pat);
            var response = await client.GetAsync("_apis/projects?$top=1&api-version=7.0");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<List<AzureDevOpsProjectDto>> GetProjectsAsync(Guid userId, string? organizationUrl = null, string? pat = null)
    {
        HttpClient client;

        if (!string.IsNullOrEmpty(organizationUrl) && !string.IsNullOrEmpty(pat))
        {
            client = CreateHttpClient(organizationUrl.TrimEnd('/'), pat);
        }
        else
        {
            client = await CreateAuthenticatedClientAsync(userId);
        }

        var projects = new List<AzureDevOpsProjectDto>();
        var url = "_apis/projects?api-version=7.0&$top=100";

        while (!string.IsNullOrEmpty(url))
        {
            var response = await client.GetAsync(url);
            await EnsureSuccessOrThrow(response);

            var result = await response.Content.ReadFromJsonAsync<AzureDevOpsListResponse<AzureDevOpsProjectApiModel>>(JsonOptions);
            if (result?.Value != null)
            {
                projects.AddRange(result.Value.Select(p => new AzureDevOpsProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    State = p.State
                }));
            }

            url = null; // Azure DevOps projects API doesn't use continuationToken in the same way
            // If there are more projects, the response includes a continuationToken header
            if (response.Headers.TryGetValues("x-ms-continuationtoken", out var tokens))
            {
                var token = tokens.FirstOrDefault();
                if (!string.IsNullOrEmpty(token))
                    url = $"_apis/projects?api-version=7.0&$top=100&continuationToken={token}";
            }
        }

        return projects.OrderBy(p => p.Name).ToList();
    }

    public async Task<List<AzureDevOpsWorkItemDto>> GetWorkItemsAsync(Guid userId, string? projectName = null, string? search = null, string? state = null, string? type = null)
    {
        var settings = await _settingsRepository.GetByUserIdAsync(userId);
        if (settings == null || !settings.IsConnected)
            throw new InvalidOperationException("Azure DevOps is not connected. Please configure it in Settings.");

        var client = await CreateAuthenticatedClientAsync(userId);
        var selectedProjects = !string.IsNullOrEmpty(settings.SelectedProjectNames)
            ? JsonSerializer.Deserialize<List<string>>(settings.SelectedProjectNames) ?? new List<string>()
            : new List<string>();

        if (!string.IsNullOrEmpty(projectName))
            selectedProjects = new List<string> { projectName };

        if (selectedProjects.Count == 0)
            return new List<AzureDevOpsWorkItemDto>();

        var allWorkItems = new List<AzureDevOpsWorkItemDto>();

        foreach (var project in selectedProjects)
        {
            var wiql = BuildWiqlQuery(search, state, type);

            var wiqlRequest = new { query = wiql };
            var response = await client.PostAsJsonAsync($"{Uri.EscapeDataString(project)}/_apis/wit/wiql?api-version=7.0&$top=200", wiqlRequest);
            await EnsureSuccessOrThrow(response);

            var wiqlResult = await response.Content.ReadFromJsonAsync<WiqlResponse>(JsonOptions);
            if (wiqlResult?.WorkItems == null || wiqlResult.WorkItems.Count == 0)
                continue;

            var ids = wiqlResult.WorkItems.Select(wi => wi.Id).ToList();

            // Fetch work items in batches of 200
            for (int i = 0; i < ids.Count; i += 200)
            {
                var batch = ids.Skip(i).Take(200);
                var idsParam = string.Join(",", batch);
                var fields = "System.Id,System.Title,System.WorkItemType,System.State,System.AssignedTo,System.AreaPath,System.IterationPath,System.ChangedDate";

                var detailsResponse = await client.GetAsync($"{Uri.EscapeDataString(project)}/_apis/wit/workitems?ids={idsParam}&fields={fields}&api-version=7.0");
                await EnsureSuccessOrThrow(detailsResponse);

                var detailsResult = await detailsResponse.Content.ReadFromJsonAsync<AzureDevOpsListResponse<WorkItemApiModel>>(JsonOptions);
                if (detailsResult?.Value != null)
                {
                    allWorkItems.AddRange(detailsResult.Value.Select(wi => MapWorkItemToDto(wi, project)));
                }
            }
        }

        return allWorkItems.OrderByDescending(wi => wi.ChangedDate).ToList();
    }

    public async Task<List<AzureDevOpsCommentDto>> GetWorkItemCommentsAsync(Guid userId, string projectName, int workItemId)
    {
        var client = await CreateAuthenticatedClientAsync(userId);

        var response = await client.GetAsync($"{Uri.EscapeDataString(projectName)}/_apis/wit/workitems/{workItemId}/comments?api-version=7.0-preview.4&order=asc");
        await EnsureSuccessOrThrow(response);

        var result = await response.Content.ReadFromJsonAsync<CommentsResponse>(JsonOptions);
        if (result?.Comments == null)
            return new List<AzureDevOpsCommentDto>();

        return result.Comments.Select(c => new AzureDevOpsCommentDto
        {
            Id = c.Id,
            Text = c.Text,
            CreatedBy = c.CreatedBy?.DisplayName ?? "Unknown",
            CreatedDate = c.CreatedDate
        }).ToList();
    }

    public async Task DeleteSettingsAsync(Guid userId)
    {
        await _settingsRepository.DeleteAsync(userId);
    }

    // --- Private helpers ---

    private HttpClient CreateHttpClient(string organizationUrl, string pat)
    {
        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(organizationUrl.TrimEnd('/') + "/");
        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($":{pat}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return client;
    }

    private async Task<HttpClient> CreateAuthenticatedClientAsync(Guid userId)
    {
        var settings = await _settingsRepository.GetByUserIdAsync(userId);
        if (settings == null || !settings.IsConnected)
            throw new InvalidOperationException("Azure DevOps is not connected.");

        var pat = _protector.Unprotect(settings.EncryptedPat);
        return CreateHttpClient(settings.OrganizationUrl, pat);
    }

    private static string BuildWiqlQuery(string? search, string? state, string? type)
    {
        var conditions = new List<string> { "[System.AssignedTo] = @Me" };

        if (!string.IsNullOrWhiteSpace(state))
            conditions.Add($"[System.State] = '{EscapeWiql(state)}'");

        if (!string.IsNullOrWhiteSpace(type))
            conditions.Add($"[System.WorkItemType] = '{EscapeWiql(type)}'");

        if (!string.IsNullOrWhiteSpace(search))
            conditions.Add($"[System.Title] CONTAINS '{EscapeWiql(search)}'");

        var where = string.Join(" AND ", conditions);
        return $"SELECT [System.Id] FROM WorkItems WHERE {where} ORDER BY [System.ChangedDate] DESC";
    }

    private static string EscapeWiql(string value)
    {
        return value.Replace("'", "''");
    }

    private static AzureDevOpsWorkItemDto MapWorkItemToDto(WorkItemApiModel wi, string projectName)
    {
        var fields = wi.Fields;
        return new AzureDevOpsWorkItemDto
        {
            Id = wi.Id,
            Title = fields?.Title ?? string.Empty,
            WorkItemType = fields?.WorkItemType ?? string.Empty,
            State = fields?.State ?? string.Empty,
            AssignedTo = fields?.AssignedTo?.DisplayName,
            AreaPath = fields?.AreaPath,
            IterationPath = fields?.IterationPath,
            ChangedDate = fields?.ChangedDate,
            ProjectName = projectName
        };
    }

    private static async Task EnsureSuccessOrThrow(HttpResponseMessage response)
    {
        if (response.IsSuccessStatusCode) return;

        var content = await response.Content.ReadAsStringAsync();

        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            throw new UnauthorizedAccessException("Authentication failed. Your PAT may be expired or invalid.");

        if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
            throw new UnauthorizedAccessException("Insufficient permissions. Please check your PAT scopes.");

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            throw new KeyNotFoundException("Resource not found. Please check the organization URL and project name.");

        throw new InvalidOperationException($"Azure DevOps API error ({(int)response.StatusCode}): {content}");
    }

    private static AzureDevOpsSettingsDto MapToDto(AzureDevOpsSettings settings)
    {
        return new AzureDevOpsSettingsDto
        {
            OrganizationUrl = settings.OrganizationUrl,
            SelectedProjectIds = !string.IsNullOrEmpty(settings.SelectedProjectIds)
                ? JsonSerializer.Deserialize<List<string>>(settings.SelectedProjectIds) ?? new List<string>()
                : new List<string>(),
            SelectedProjectNames = !string.IsNullOrEmpty(settings.SelectedProjectNames)
                ? JsonSerializer.Deserialize<List<string>>(settings.SelectedProjectNames) ?? new List<string>()
                : new List<string>(),
            IsConnected = settings.IsConnected
        };
    }

    // --- API response models ---

    private class AzureDevOpsListResponse<T>
    {
        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("value")]
        public List<T> Value { get; set; } = new();
    }

    private class AzureDevOpsProjectApiModel
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; } = string.Empty;
    }

    private class WiqlResponse
    {
        [JsonPropertyName("workItems")]
        public List<WiqlWorkItem> WorkItems { get; set; } = new();
    }

    private class WiqlWorkItem
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
    }

    private class WorkItemApiModel
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("fields")]
        public WorkItemFields? Fields { get; set; }
    }

    private class WorkItemFields
    {
        [JsonPropertyName("System.Title")]
        public string? Title { get; set; }

        [JsonPropertyName("System.WorkItemType")]
        public string? WorkItemType { get; set; }

        [JsonPropertyName("System.State")]
        public string? State { get; set; }

        [JsonPropertyName("System.AssignedTo")]
        public IdentityRef? AssignedTo { get; set; }

        [JsonPropertyName("System.AreaPath")]
        public string? AreaPath { get; set; }

        [JsonPropertyName("System.IterationPath")]
        public string? IterationPath { get; set; }

        [JsonPropertyName("System.ChangedDate")]
        public DateTime? ChangedDate { get; set; }
    }

    private class IdentityRef
    {
        [JsonPropertyName("displayName")]
        public string? DisplayName { get; set; }
    }

    private class CommentsResponse
    {
        [JsonPropertyName("comments")]
        public List<CommentApiModel> Comments { get; set; } = new();
    }

    private class CommentApiModel
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("createdBy")]
        public IdentityRef? CreatedBy { get; set; }

        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }
    }

}
