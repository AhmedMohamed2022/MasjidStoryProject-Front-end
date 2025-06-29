import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StoryViewModel } from '../../Core/Models/story.model';
import { StoryService } from '../../Core/Services/story-detail.service';
import { environment } from '../../Core/environments/environment';

@Component({
  selector: 'app-stories-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stories-list.component.html',
  styleUrls: ['./stories-list.component.css'],
})
export class StoriesListComponent implements OnInit {
  private storyService = inject(StoryService);
  private router = inject(Router);

  stories: StoryViewModel[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadStories();
  }

  async loadStories(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';
      console.log('Loading stories...');
      this.stories = await this.storyService.getAllStories();
      console.log('Stories loaded:', this.stories);
    } catch (error) {
      this.error = 'Failed to load stories. Please try again.';
      console.error('Error loading stories:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateToStory(id: number): void {
    this.router.navigate(['/story-details', id]);
  }

  getStoryExcerpt(content: string): string {
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  refreshStories(): void {
    this.loadStories();
  }

  trackByStoryId(index: number, story: StoryViewModel): number {
    return story.id;
  }

  getFullImageUrl(url: string): string {
    if (!url) return 'assets/default-story.png';
    if (url.startsWith('http')) return url;
    return environment.apiUrl.replace(/\/$/, '') + url;
  }
}
