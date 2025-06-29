using Repositories.Interfaces;
using ViewModels;
using Models.Entities;
using System.Linq.Expressions;
using Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace Repositories.Implementations
{
    public class MasjidRepository : IMasjidRepository
    {
        private readonly IBaseRepository<Masjid> _baseRepo;
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public MasjidRepository(IBaseRepository<Masjid> baseRepo, ApplicationDbContext context, IWebHostEnvironment env)
        {
            _baseRepo = baseRepo;
            _context = context;
            _env = env;
        }

        public async Task<List<MasjidViewModel>> GetAllAsync()
        {
            var list = await _baseRepo.GetAllAsync(m => m.Country, m => m.City, m => m.MediaItems);
            return list.Select(m => m.ToViewModel()).ToList();
        }

        public async Task<List<Masjid>> GetAllAsync(params Expression<Func<Masjid, object>>[] includes)
        {
            return await _baseRepo.GetAllAsync(includes);
        }

        public async Task<List<MasjidViewModel>> GetFilteredAsync(string? search, int pageNumber, int pageSize)
        {
            Expression<Func<Masjid, bool>> filter = m =>
                string.IsNullOrEmpty(search) || m.ShortName.Contains(search);

            var masjids = await _baseRepo.GetListWithIncludePagedAsync(
                filter,
                pageNumber,
                pageSize,
                m => m.Country,
                m => m.City,
                m => m.MediaItems
            );

            return masjids.Select(m => m.ToViewModel()).ToList();
        }

        public async Task<MasjidViewModel?> GetByIdAsync(int id)
        {
            var entity = await _baseRepo.GetFirstOrDefaultAsync(
                m => m.Id == id,
                m => m.Country, m => m.City, m => m.MediaItems);
            return entity?.ToViewModel();
        }

        public async Task<MasjidEditViewModel?> GetEditByIdAsync(int id)
        {
            var entity = await _baseRepo.GetByIdAsync(id);
            return entity == null ? null : new MasjidEditViewModel
            {
                Id = entity.Id,
                ShortName = entity.ShortName,
                Address = entity.Address,
                ArchStyle = entity.ArchStyle,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude,
                CountryId = entity.CountryId,
                CityId = entity.CityId,
                YearOfEstablishment = entity.YearOfEstablishment
            };
        }

        public async Task<int> AddAsync(MasjidCreateViewModel model)
        {
            var entity = model.ToEntity();
            await _baseRepo.AddAsync(entity);
            await _baseRepo.SaveChangesAsync();

            // Add default MasjidContent (e.g., for English)
            var defaultLanguage = await _context.Languages.FirstOrDefaultAsync(l => l.Code == "en");
            if (defaultLanguage != null)
            {
                var content = new MasjidContent
                {
                    MasjidId = entity.Id,
                    LanguageId = defaultLanguage.Id,
                    Name = entity.ShortName,
                    Description = entity.Address // or any default description
                };
                _context.MasjidContents.Add(content);
                await _context.SaveChangesAsync();
            }

            return entity.Id; // Return the created masjid ID
        }

        public async Task<bool> UpdateAsync(MasjidEditViewModel model)
        {
            var entity = await _baseRepo.GetByIdAsync(model.Id);
            if (entity == null) return false;
            
            model.UpdateEntity(entity);
            _baseRepo.Update(entity);
            await _baseRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Masjids
                .Include(m => m.MediaItems)
                .FirstOrDefaultAsync(m => m.Id == id);
                
            if (entity == null) return false;

            // Delete physical media files before deleting the masjid
            await DeleteMediaFiles(entity.MediaItems);

            // Delete the masjid (media will be cascade deleted from DB)
            _baseRepo.Delete(entity);
            await _baseRepo.SaveChangesAsync();
            return true;
        }

        private async Task DeleteMediaFiles(ICollection<Media> mediaItems)
        {
            if (mediaItems == null || !mediaItems.Any()) return;

            foreach (var media in mediaItems)
            {
                try
                {
                    // Remove /uploads/ prefix to get relative path
                    var relativePath = media.FileUrl.TrimStart('/');
                    var fullPath = Path.Combine(_env.WebRootPath, relativePath);
                    
                    if (File.Exists(fullPath))
                    {
                        File.Delete(fullPath);
                    }
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the deletion
                    // You might want to add proper logging here
                    Console.WriteLine($"Failed to delete media file: {media.FileUrl}, Error: {ex.Message}");
                }
            }
        }

        public async Task<MasjidDetailsViewModel?> GetMasjidDetailsAsync(int id, string? languageCode = null)
        {
            var masjid = await _context.Masjids
                .Where(m => m.Id == id)
                .Include(m => m.Country)
                .Include(m => m.City)
                .Include(m => m.Contents)
                .Include(m => m.MediaItems)
                .Include(m => m.Visits)
                .Include(m => m.Events)
                .Include(m => m.Stories)
                    .ThenInclude(s => s.ApplicationUser)
                .Include(m => m.Stories)
                    .ThenInclude(s => s.Likes)
                .Include(m => m.Stories)
                    .ThenInclude(s => s.Comments)
                .FirstOrDefaultAsync();

            return masjid?.ToDetailsViewModel(languageCode);
        }
    }
} 