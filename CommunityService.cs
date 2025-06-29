using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CommunityService.Models;
using CommunityService.Repositories;
using CommunityService.ViewModels;

namespace CommunityService.Services
{
    public class CommunityService
    {
        private readonly ICommunityRepository _repo;
        private readonly IMemberRepository _memberRepo;

        public CommunityService(ICommunityRepository repo, IMemberRepository memberRepo)
        {
            _repo = repo;
            _memberRepo = memberRepo;
        }

        public async Task<List<CommunityViewModel>> GetUserCommunitiesAsync(string userId)
        {
            var memberships = await _memberRepo.FindAsync(m => m.UserId == userId, m => m.Community);
            var communities = memberships.Select(m => m.Community).Distinct().ToList();

            return communities.Select(c => c.ToViewModel(userId)).ToList();
        }

        public async Task<bool> UpdateCommunityAsync(int id, CommunityCreateViewModel model, string userId)
        {
            var community = await _repo.GetByIdAsync(id);
            if (community == null || community.CreatedById != userId) return false;

            community.Title = model.Title;
            community.Content = model.Content;
            community.MasjidId = model.MasjidId;
            community.LanguageId = model.LanguageId;

            _repo.Update(community);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCommunityAsync(int id, string userId)
        {
            var community = await _repo.GetByIdAsync(id);
            if (community == null || community.CreatedById != userId) return false;

            // First, delete all community members
            var members = await _memberRepo.FindAsync(m => m.CommunityId == id);
            foreach (var member in members)
            {
                _memberRepo.Delete(member);
            }

            // Then delete the community
            _repo.Delete(community);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<List<CommunityViewModel>> GetAllCommunitiesAsync()
        {
            var communities = await _repo.FindAsync(
                c => true, // Get all communities
                c => c.Language, c => c.Masjid, c => c.CreatedBy, c => c.CommunityMembers
            );

            return communities.Select(c => c.ToViewModel(null)).ToList();
        }
    }
} 