using ViewModels.Media;
using Microsoft.AspNetCore.Http;

namespace Services.Interfaces
{
    public interface IMediaService
    {
        Task<bool> UploadMediaAsync(MediaCreateViewModel model);
        Task<bool> DeleteMediaAsync(int id);
        Task<List<MediaViewModel>> GetMediaByMasjidIdAsync(int masjidId);
        Task<List<MediaViewModel>> GetMediaByStoryIdAsync(int storyId);
        Task<List<MediaViewModel>> GetMediaForMasjidAsync(int masjidId);
        Task<string?> UploadUserProfilePictureAsync(IFormFile file);
        Task<string?> UploadToPathAsync(IFormFile file, string folder = "general");
    }
} 