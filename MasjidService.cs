using Services.Interfaces;
using ViewModels;
using Models.Entities;
using Models.Extensions;
using Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class MasjidService : IMasjidService
    {
        private readonly IMasjidRepository _repository;
        private readonly ApplicationDbContext _context;

        public MasjidService(IMasjidRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<List<MasjidViewModel>> GetAllMasjidsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<List<MasjidViewModel>> GetMasjidsPagedAsync(string? search, int page, int size)
        {
            return await _repository.GetFilteredAsync(search, page, size);
        }

        public async Task<MasjidViewModel> GetMasjidByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<int> AddMasjidAsync(MasjidCreateViewModel model)
        {
            return await _repository.AddAsync(model);
        }

        public async Task<bool> UpdateMasjidAsync(MasjidEditViewModel model)
        {
            return await _repository.UpdateAsync(model);
        }

        public async Task<bool> DeleteMasjidAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<MasjidDetailsViewModel> GetMasjidDetailsAsync(int id, string? languageCode = null)
        {
            return await _repository.GetMasjidDetailsAsync(id, languageCode);
        }

        public async Task<bool> RegisterVisitAsync(int masjidId, string userId)
        {
            var masjid = await _context.Masjids.FindAsync(masjidId);
            if (masjid == null) return false;

            var visit = new MasjidVisit
            {
                MasjidId = masjidId,
                UserId = userId,
                VisitDate = DateTime.UtcNow
            };

            _context.MasjidVisits.Add(visit);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MasjidViewModel>> GetFeaturedMasjidsAsync()
        {
            // Get masjids with most visits in the last 30 days
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            
            var featuredMasjids = await _context.Masjids
                .Include(m => m.Country)
                .Include(m => m.City)
                .Include(m => m.MediaItems)
                .Include(m => m.Visits.Where(v => v.VisitDate >= thirtyDaysAgo))
                .OrderByDescending(m => m.Visits.Count)
                .Take(10)
                .ToListAsync();

            return featuredMasjids.Select(m => m.ToViewModel()).ToList();
        }
    }
} 