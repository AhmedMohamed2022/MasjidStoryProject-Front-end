using Microsoft.AspNetCore.Hosting;
using Models.Entities;
using Repositories.Implementations;
using Repositories.Interfaces;
using ViewModels;

namespace Repositories.Implementations
{
    public class MediaRepository : IMediaRepository
    {
        private readonly IBaseRepository<Media> _baseRepo;
        private readonly IWebHostEnvironment _env;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
        private const int MaxFileSizeMB = 10;

        public MediaRepository(IBaseRepository<Media> baseRepo, IWebHostEnvironment env)
        {
            _baseRepo = baseRepo;
            _env = env;
        }

        public async Task<MediaViewModel?> GetByIdAsync(int id)
        {
            var media = await _baseRepo.GetByIdAsync(id);
            return media?.ToViewModel();
        }

        public async Task AddAsync(MediaCreateViewModel model)
        {
            try
            {
                if (model.File == null || model.File.Length == 0)
                    throw new ArgumentException("No file provided");

                // Validate file size
                if (model.File.Length > MaxFileSizeMB * 1024 * 1024)
                    throw new ArgumentException($"File size exceeds {MaxFileSizeMB}MB limit");

                // Validate file extension
                var extension = Path.GetExtension(model.File.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(extension))
                    throw new ArgumentException($"File type not allowed. Allowed types: {string.Join(", ", _allowedExtensions)}");

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");
                
                // Create uploads directory if it doesn't exist
                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.File.CopyToAsync(stream);
                }

                // Create media entity
                var media = new Media
                {
                    FileUrl = $"/uploads/{fileName}",
                    FileName = model.File.FileName,
                    FileSize = model.File.Length,
                    ContentType = model.File.ContentType,
                    MediaType = "Image",
                    MasjidId = model.MasjidId,
                    StoryId = model.StoryId,
                    DateUploaded = DateTime.UtcNow,
                    UploadDate = DateTime.UtcNow
                };

                await _baseRepo.AddAsync(media);
                await _baseRepo.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Media upload failed: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var media = await _baseRepo.GetByIdAsync(id);
            if (media == null) return false;

            // Delete physical file
            var filePath = Path.Combine(_env.WebRootPath, media.FileUrl.TrimStart('/'));
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            _baseRepo.Delete(media);
            await _baseRepo.SaveChangesAsync();
            return true;
        }

        public async Task<List<MediaViewModel>> GetByMasjidIdAsync(int masjidId)
        {
            var mediaItems = await _baseRepo.FindAsync(m => m.MasjidId == masjidId);
            return mediaItems.Select(m => m.ToViewModel()).ToList();
        }

        public async Task<List<MediaViewModel>> GetByStoryIdAsync(int storyId)
        {
            var mediaItems = await _baseRepo.FindAsync(m => m.StoryId == storyId);
            return mediaItems.Select(m => m.ToViewModel()).ToList();
        }
    }
} 