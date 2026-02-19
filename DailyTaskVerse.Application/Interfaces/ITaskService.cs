using DailyTaskVerse.Application.DTOs.Common;
using DailyTaskVerse.Application.DTOs.Tasks;

namespace DailyTaskVerse.Application.Interfaces;

public interface ITaskService
{
    Task<TaskDto> GetByIdAsync(Guid id, Guid userId);
    Task<PagedResult<TaskDto>> GetAllAsync(Guid userId, TaskFilterRequest filter);
    Task<TaskDto> CreateAsync(Guid userId, CreateTaskRequest request);
    Task<TaskDto> UpdateAsync(Guid id, Guid userId, UpdateTaskRequest request);
    Task DeleteAsync(Guid id, Guid userId);
    Task<TaskDto> MarkAsCompletedAsync(Guid id, Guid userId);
}
