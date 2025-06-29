using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Models.Entities;
using Repositories.Interfaces;
using Services.Interfaces;
using System.IO;
using ViewModels;
using ViewModels.Media;

namespace Services
{
    public class MediaService : IMediaService
    {
        private readonly IMediaRepository _repository;
        private readonly IWebHostEnvironment _env;

        public MediaService(IMediaRepository repository, IWebHostEnvironment env)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _env = env ?? throw new ArgumentNullException(nameof(env));
        }

        public async Task<bool> UploadMediaAsync(MediaCreateViewModel model)
        {
            try
            {
                await _repository.AddAsync(model);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Media upload failed: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteMediaAsync(int id)
        {
            try
            {
                return await _repository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Media deletion failed: {ex.Message}");
                throw;
            }
        }

        public async Task<List<MediaViewModel>> GetMediaByMasjidIdAsync(int masjidId)
        {
            return await _repository.GetByMasjidIdAsync(masjidId);
        }

        public async Task<List<MediaViewModel>> GetMediaByStoryIdAsync(int storyId)
        {
            return await _repository.GetByStoryIdAsync(storyId);
        }

        public async Task<List<MediaViewModel>> GetMediaForMasjidAsync(int masjidId)
        {
            try
            {
                var mediaItems = await _repository.GetByMasjidIdAsync(masjidId);
                return mediaItems.Select(m => new MediaViewModel
                {
                    Id = m.Id,
                    FileUrl = m.FileUrl,
                    FileName = m.FileName,
                    FileSize = m.FileSize,
                    ContentType = m.ContentType,
                    MediaType = m.MediaType,
                    MasjidId = m.MasjidId,
                    StoryId = m.StoryId,
                    UploadDate = m.UploadDate
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting media for masjid {masjidId}: {ex.Message}");
                return new List<MediaViewModel>();
            }
        }

        public async Task<string?> UploadUserProfilePictureAsync(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return null;

                // Validate image file
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                    return null;

                var uploadsPath = Path.Combine(_env.WebRootPath, "uploads", "profile");
                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return $"/uploads/profile/{fileName}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading profile picture: {ex.Message}");
                return null;
            }
        }

        public async Task<string?> UploadToPathAsync(IFormFile file, string folder = "general")
        {
            try
            {
                if (file == null || file.Length == 0)
                    return null;

                var uploadsRoot = Path.Combine(_env.WebRootPath, "uploads", folder);
                if (!Directory.Exists(uploadsRoot))
                    Directory.CreateDirectory(uploadsRoot);

                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsRoot, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return $"/uploads/{folder}/{fileName}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading file to {folder}: {ex.Message}");
                return null;
            }
        }
    }
} 