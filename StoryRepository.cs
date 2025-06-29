using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Models;
using Models.Entities;
using Repositories;
using Repositories.Interfaces;
using System;
using System.Linq;

namespace StoryRepository
{
    public class StoryRepository : IStoryRepository
    {
        private readonly IBaseRepository<Story> _baseRepo;
        private readonly IBaseRepository<Media> _mediaRepo;
        private readonly IBaseRepository<Tag> _tagRepo;
        private readonly IBaseRepository<StoryTag> _storyTagRepo;
        private readonly ApplicationDbContext _context;

        public StoryRepository(
            IBaseRepository<Story> baseRepo,
            IBaseRepository<Media> mediaRepo,
            IBaseRepository<Tag> tagRepo,
            IBaseRepository<StoryTag> storyTagRepo,
            ApplicationDbContext context)
        {
            _baseRepo = baseRepo;
            _mediaRepo = mediaRepo;
            _tagRepo = tagRepo;
            _storyTagRepo = storyTagRepo;
            _context = context;
        }

        public async Task AddStoryAsync(StoryCreateViewModel model, string userId, List<string> imageUrls)
        {
            var entity = model.ToEntity(userId);

            // Save the Story first
            await _baseRepo.AddAsync(entity);
            await _baseRepo.SaveChangesAsync(); // get generated ID

            // Save media (images)
            if (imageUrls != null)
            {
                foreach (var url in imageUrls)
                {
                    await _mediaRepo.AddAsync(new Media
                    {
                        StoryId = entity.Id,
                        FileUrl = url,
                        MediaType = "Image",
                        DateUploaded = DateTime.UtcNow
                    });
                }
            }

            // Save tags (reuse or create)
            if (model.Tags?.Any() == true)
            {
                foreach (var tagName in model.Tags)
                {
                    var tag = (await _tagRepo.FindAsync(t => t.Name == tagName)).FirstOrDefault();
                    if (tag == null)
                    {
                        tag = new Tag { Name = tagName };
                        await _tagRepo.AddAsync(tag);
                        await _tagRepo.SaveChangesAsync();
                    }

                    await _storyTagRepo.AddAsync(new StoryTag
                    {
                        StoryId = entity.Id,
                        TagId = tag.Id
                    });
                }
            }

            await _mediaRepo.SaveChangesAsync();
            await _storyTagRepo.SaveChangesAsync();
        }

        public async Task AddStoryAsync(StoryCreateViewModel model)
        {
            var entity = model.ToEntity();
            await _baseRepo.AddAsync(entity);
            await _baseRepo.SaveChangesAsync();
        }

        public async Task<StoryViewModel?> GetByIdAsync(int id, string? currentUserId = null)
        {
            var story = await _baseRepo.GetFirstOrDefaultAsync(
                s => s.Id == id,
                s => s.ApplicationUser,
                s => s.Masjid,
                s => s.Masjid.Contents,
                s => s.Language,
                s => s.Likes,
                s => s.Comments,
                s => s.MediaItems,
                s => s.StoryTags
            );

            return story?.ToViewModel(currentUserId);
        }

        public async Task<List<StoryViewModel>> GetAllAsync()
        {
            var stories = await _baseRepo.GetAllAsync(
                s => s.ApplicationUser,
                s => s.Masjid,
                s => s.Masjid.Contents,
                s => s.Language,
                s => s.MediaItems,
                s => s.StoryTags
            );

            return stories.Where(s => s.IsApproved == true).Select(s => s.ToViewModel()).ToList();
        }

        public async Task<bool> UpdateAsync(StoryEditViewModel model)
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
            // Load story with all dependent collections
            var story = await _baseRepo.GetFirstOrDefaultAsync(
                s => s.Id == id,
                s => s.Comments,
                s => s.Likes,
                s => s.StoryTags,
                s => s.MediaItems
            );

            if (story == null)
                return false;

            // Delete comments
            if (story.Comments != null)
            {
                foreach (var comment in story.Comments.ToList())
                    _context.Remove(comment);
            }

            // Delete likes
            if (story.Likes != null)
            {
                foreach (var like in story.Likes.ToList())
                    _context.Remove(like);
            }

            // Delete story tags
            if (story.StoryTags != null)
            {
                foreach (var tag in story.StoryTags.ToList())
                    _context.Remove(tag);
            }

            // Media items will be automatically deleted by cascade delete
            // No need to manually delete them

            // Finally delete the story itself
            _baseRepo.Delete(story);
            await _baseRepo.SaveChangesAsync();
            return true;
        }

        public async Task<List<StoryViewModel>> GetPendingAsync()
        {
            var stories = await _baseRepo.FindAsync(
                s => !s.IsApproved,
                s => s.ApplicationUser,
                s => s.Masjid,
                s => s.Masjid.Contents,
                s => s.Language,
                s => s.MediaItems,
                s => s.StoryTags
            );

            return stories.Select(s => s.ToViewModel()).ToList();
        }

        public async Task<List<StoryViewModel>> GetLatestApprovedStoriesAsync(int count)
        {
            var stories = await _baseRepo.FindAsync(
                s => s.IsApproved,
                s => s.ApplicationUser,
                s => s.Masjid,
                s => s.Masjid.Contents,
                s => s.Language,
                s => s.MediaItems,
                s => s.StoryTags
            );

            return stories.OrderByDescending(s => s.DatePublished)
                .Take(count)
                .Select(s => s.ToViewModel())
                .ToList();
        }

        public async Task<List<StoryViewModel>> GetRelatedStoriesAsync(int storyId)
        {
            var refStory = await _baseRepo.GetFirstOrDefaultAsync(
                s => s.Id == storyId,
                s => s.Masjid,
                s => s.Masjid.Contents,
                s => s.Language
            );

            if (refStory == null) return new();

            var related = await _baseRepo.FindAsync(
                s => s.Id != storyId && s.IsApproved &&
                     (s.MasjidId == refStory.MasjidId || s.LanguageId == refStory.LanguageId),
                s => s.ApplicationUser,
                s => s.Masjid,
                s => s.Masjid.Contents,
                s => s.Language,
                s => s.MediaItems,
                s => s.StoryTags
            );

            return related.OrderByDescending(s => s.DatePublished)
                .Take(3)
                .Select(s => s.ToViewModel())
                .ToList();
        }

        public async Task<bool> ApproveAsync(int id)
        {
            var story = await _baseRepo.GetByIdAsync(id);
            if (story == null) return false;

            story.IsApproved = true;
            _baseRepo.Update(story);
            await _baseRepo.SaveChangesAsync();
            return true;
        }

        public async Task<StoryEditViewModel?> GetEditByIdAsync(int id)
        {
            var entity = await _baseRepo.GetFirstOrDefaultAsync(
                s => s.Id == id,
                s => s.MediaItems
            );

            return entity?.ToEditViewModel();
        }
    }
} 