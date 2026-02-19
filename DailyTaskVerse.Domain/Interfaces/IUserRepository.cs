using DailyTaskVerse.Domain.Entities;

namespace DailyTaskVerse.Domain.Interfaces;

public interface IUserRepository
{
    Task<int> GetTotalCountAsync();
    Task<int> GetActiveCountAsync(DateTime since);
    Task<List<ApplicationUser>> GetAllWithTaskCountAsync();
}
