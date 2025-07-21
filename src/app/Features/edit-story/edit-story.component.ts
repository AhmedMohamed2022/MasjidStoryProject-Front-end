import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StoryService } from '../../Core/Services/story-detail.service';
import { MasjidService } from '../../Core/Services/masjid.service';
import {
  LanguageService,
  LanguageViewModel,
} from '../../Core/Services/language.service';
import {
  StoryViewModel,
  StoryEditViewModel,
  MediaViewModel,
} from '../../Core/Models/story.model';
import { MasjidViewModel } from '../../Core/Models/masjid.model';
import { environment } from '../../Core/environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-story',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './edit-story.component.html',
  styleUrls: ['./edit-story.component.css'],
})
export class EditStoryComponent implements OnInit {
  story: StoryEditViewModel = {
    id: 0,
    title: '',
    content: '',
    masjidId: 0,
    languageId: undefined,
    isApproved: false,
    newStoryImages: [],
    keepMediaIds: [],
    removeMediaIds: [],
    originalTitle: '',
    originalContent: '',
    requiresReapproval: false,
    changeReason: '',
  };

  originalStory: StoryViewModel | null = null;
  masjids: MasjidViewModel[] = [];
  languages: LanguageViewModel[] = [];
  tags: string[] = [];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: MediaViewModel[] = [];
  imagesToDelete: number[] = [];

  loading = false;
  loadingStory = true;
  loadingMasjids = false;
  loadingLanguages = false;
  loadingTags = false;
  success = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storyService: StoryService,
    private masjidService: MasjidService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    const storyId = this.route.snapshot.params['id'];
    if (storyId) {
      // Load data first, then load story
      this.loadDataAndStory(storyId);
    } else {
      this.loadMasjids();
      this.loadLanguages();
      this.loadTags();
    }
  }

  async loadDataAndStory(storyId: number): Promise<void> {
    // Load all data first
    await Promise.all([
      this.loadMasjidsAsync(),
      this.loadLanguagesAsync(),
      this.loadTagsAsync(),
    ]);

    // Then load the story
    await this.loadStory(storyId);
  }

  async loadMasjidsAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.loadingMasjids = true;
      this.masjidService.getAllMasjids().subscribe({
        next: (masjids) => {
          this.masjids = masjids;
          this.loadingMasjids = false;
          resolve();
        },
        error: () => {
          this.loadingMasjids = false;
          this.masjids = [];
          resolve();
        },
      });
    });
  }

  async loadLanguagesAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.loadingLanguages = true;
      this.languageService.getAllLanguages().subscribe({
        next: (languages) => {
          this.languages = languages;
          this.loadingLanguages = false;
          resolve();
        },
        error: () => {
          this.loadingLanguages = false;
          this.languages = [];
          resolve();
        },
      });
    });
  }

  async loadTagsAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.loadingTags = true;
      this.storyService
        .getAllTags()
        .then((tags) => {
          this.tags = tags;
          this.loadingTags = false;
          resolve();
        })
        .catch(() => {
          this.loadingTags = false;
          this.tags = [];
          resolve();
        });
    });
  }

  loadMasjids(): void {
    this.loadingMasjids = true;
    this.masjidService.getAllMasjids().subscribe({
      next: (masjids) => {
        this.masjids = masjids;
        this.loadingMasjids = false;
      },
      error: () => {
        this.loadingMasjids = false;
        this.masjids = [];
      },
    });
  }

  loadLanguages(): void {
    this.loadingLanguages = true;
    this.languageService.getAllLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
        this.loadingLanguages = false;
      },
      error: () => {
        this.loadingLanguages = false;
        this.languages = [];
      },
    });
  }

  loadTags(): void {
    this.loadingTags = true;
    this.storyService
      .getAllTags()
      .then((tags) => {
        this.tags = tags;
        this.loadingTags = false;
      })
      .catch(() => {
        this.loadingTags = false;
        this.tags = [];
      });
  }

  async loadStory(storyId: number): Promise<void> {
    try {
      this.loadingStory = true;
      this.originalStory = await this.storyService.getStoryById(storyId);

      // Process image URLs to ensure they have the correct base URL
      if (this.originalStory.mediaItems) {
        this.originalStory.mediaItems = this.originalStory.mediaItems.map(
          (media) => ({
            ...media,
            fileUrl: this.getFullImageUrl(media.fileUrl),
          })
        );
      }

      // Find masjid ID by name
      const masjid = this.masjids.find(
        (m) => m.shortName === this.originalStory?.masjidName
      );

      // Find language ID by code
      const language = this.languages.find(
        (l) => l.code === this.originalStory?.languageCode
      );

      // Populate the form with existing story data
      this.story = {
        id: this.originalStory.id,
        title: this.originalStory.title,
        content: this.originalStory.content,
        masjidId: masjid?.id || 0,
        languageId: language?.id || undefined,
        isApproved: this.originalStory.isApproved,
        newStoryImages: [],
        keepMediaIds: this.originalStory.mediaItems?.map((m) => m.id) || [],
        removeMediaIds: [],
        originalTitle: this.originalStory.title,
        originalContent: this.originalStory.content,
        requiresReapproval: false,
        changeReason: '',
      };

      // Set existing images
      this.existingImages = this.originalStory.mediaItems || [];
      this.imagePreviews = [...this.existingImages.map((img) => img.fileUrl)];
    } catch (err) {
      this.error = 'Failed to load story.';
      console.error('Error loading story:', err);
    } finally {
      this.loadingStory = false;
    }
  }

  getFullImageUrl(url: string): string {
    if (!url) return '';

    // If the URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, add the backend base URL
    if (url.startsWith('/')) {
      return `${environment.apiUrl}${url}`;
    }

    // If it doesn't start with /, add the uploads path
    return `${environment.apiUrl}/uploads/${url}`;
  }

  onTagToggle(tag: string): void {
    // Tags are not part of StoryEditViewModel in backend
    // This is just for UI display
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.story.newStoryImages = [...this.selectedFiles];

      // Create previews for new images
      this.selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreviews.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    if (index < this.existingImages.length) {
      // Mark existing image for deletion
      const mediaToRemove = this.existingImages[index];
      this.story.removeMediaIds = this.story.removeMediaIds || [];
      this.story.removeMediaIds.push(mediaToRemove.id);

      // Remove from existing images array
      this.existingImages.splice(index, 1);

      // Update keepMediaIds to exclude the removed image
      this.story.keepMediaIds = this.existingImages.map((img) => img.id);
    } else {
      // Remove new image
      const newImageIndex = index - this.existingImages.length;
      this.selectedFiles.splice(newImageIndex, 1);
      this.story.newStoryImages = [...this.selectedFiles];
    }
    this.imagePreviews.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    if (!this.originalStory) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      // Update keepMediaIds to only include images that should be kept
      this.story.keepMediaIds = this.existingImages.map((img) => img.id);

      // Set original content for comparison
      this.story.originalTitle = this.originalStory.title;
      this.story.originalContent = this.originalStory.content;

      // Call update service
      const response = await this.storyService.updateStory(
        this.originalStory.id,
        this.story
      );

      this.success = response;

      // Check if the response indicates re-approval is needed
      if (response.includes('pending for admin approval')) {
        this.success +=
          ' You will be notified once an admin reviews your changes.';
      }

      setTimeout(() => {
        this.router.navigate(['/story-details', this.originalStory!.id]);
      }, 3000); // Give user more time to read the message
    } catch (err) {
      this.error = 'Failed to update story.';
      console.error('Error updating story:', err);
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.router.navigate([
      '/story-details',
      this.originalStory?.id || '/stories',
    ]);
  }

  clearSuccess(): void {
    this.success = '';
  }

  clearError(): void {
    this.error = '';
  }
}
