using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.DTOs.AzureDevOps;
using DailyTaskVerse.Application.Interfaces;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AzureDevOpsController : ControllerBase
{
    private readonly IAzureDevOpsService _azureDevOpsService;

    public AzureDevOpsController(IAzureDevOpsService azureDevOpsService)
    {
        _azureDevOpsService = azureDevOpsService;
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetSettings(Guid userId)
    {
        var result = await _azureDevOpsService.GetSettingsAsync(userId);
        return Ok(result);
    }

    [HttpPost("{userId:guid}")]
    public async Task<IActionResult> SaveSettings(Guid userId, SaveAzureDevOpsSettingsRequest request)
    {
        var result = await _azureDevOpsService.SaveSettingsAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("{userId:guid}/test-connection")]
    public async Task<IActionResult> TestConnection(Guid userId, TestConnectionRequest request)
    {
        var success = await _azureDevOpsService.TestConnectionAsync(request.OrganizationUrl, request.Pat);
        return Ok(new { success });
    }

    [HttpGet("{userId:guid}/projects")]
    public async Task<IActionResult> GetProjects(Guid userId, [FromQuery] string? organizationUrl = null, [FromQuery] string? pat = null)
    {
        var result = await _azureDevOpsService.GetProjectsAsync(userId, organizationUrl, pat);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/work-items")]
    public async Task<IActionResult> GetWorkItems(Guid userId, [FromQuery] string? projectName = null, [FromQuery] string? search = null, [FromQuery] string? state = null, [FromQuery] string? type = null)
    {
        var result = await _azureDevOpsService.GetWorkItemsAsync(userId, projectName, search, state, type);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/work-items/{projectName}/{workItemId:int}/comments")]
    public async Task<IActionResult> GetComments(Guid userId, string projectName, int workItemId)
    {
        var result = await _azureDevOpsService.GetWorkItemCommentsAsync(userId, projectName, workItemId);
        return Ok(result);
    }

    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> DeleteSettings(Guid userId)
    {
        await _azureDevOpsService.DeleteSettingsAsync(userId);
        return NoContent();
    }
}
