using ViewModels;
using Models.Entities;

namespace Repositories.Interfaces
{
    public interface IMediaRepository
    {
        Task<MediaViewModel?> GetByIdAsync(int id);
        Task AddAsync(MediaCreateViewModel model);
        Task<bool> DeleteAsync(int id);
        Task<List<MediaViewModel>> GetByMasjidIdAsync(int masjidId);
        Task<List<MediaViewModel>> GetByStoryIdAsync(int storyId);
    }
} 