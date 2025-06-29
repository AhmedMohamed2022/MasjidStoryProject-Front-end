import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StoryService } from '../../Core/Services/story-detail.service';
import { StoryViewModel } from '../../Core/Models/story.model';
import { environment } from '../../Core/environments/environment';

@Component({
  selector: 'app-my-stories',
  imports: [CommonModule],
  templateUrl: './my-stories.component.html',
  styleUrls: ['./my-stories.component.css'],
})
export class MyStoriesComponent implements OnInit {
  stories: StoryViewModel[] = [];
  loading = true;
  error = '';
  success = '';

  constructor(private router: Router, private storyService: StoryService) {}

  ngOnInit(): void {
    this.loadMyStories();
  }

  async loadMyStories(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      // Load user's stories
      this.stories = await this.storyService.getUserStories();

      // Process image URLs to ensure they have the correct base URL
      this.stories.forEach((story) => {
        if (story.imageUrls) {
          story.imageUrls = story.imageUrls.map((url) =>
            this.getFullImageUrl(url)
          );
        }
      });
    } catch (err) {
      this.error = 'Failed to load your stories.';
      console.error('Error loading stories:', err);
    } finally {
      this.loading = false;
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

  onViewStory(storyId: number): void {
    this.router.navigate(['/story-details', storyId]);
  }

  onEditStory(storyId: number): void {
    this.router.navigate(['/edit-story', storyId]);
  }

  async onDeleteStory(storyId: number): Promise<void> {
    if (
      !confirm(
        'Are you sure you want to delete this story? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await this.storyService.deleteStory(storyId);
      this.success = 'Story deleted successfully!';
      this.stories = this.stories.filter((story) => story.id !== storyId);

      setTimeout(() => {
        this.success = '';
      }, 3000);
    } catch (err) {
      this.error = 'Failed to delete story.';
      console.error('Error deleting story:', err);

      setTimeout(() => {
        this.error = '';
      }, 3000);
    }
  }

  onCreateNewStory(): void {
    this.router.navigate(['/create-story']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'fas fa-check-circle';
      case 'pending':
        return 'fas fa-clock';
      case 'rejected':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  clearSuccess(): void {
    this.success = '';
  }

  clearError(): void {
    this.error = '';
  }
}
