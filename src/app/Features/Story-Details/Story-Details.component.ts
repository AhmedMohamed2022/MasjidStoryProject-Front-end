// src/app/features/story-detail/story-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  StoryViewModel,
  CommentViewModel,
  CommentCreateViewModel,
  LikeCreateViewModel,
} from '../../Core/Models/story.model';
import { AuthService } from '../../Core/Services/auth.service';
import { StoryService } from '../../Core/Services/story-detail.service';
import { environment } from '../../Core/environments/environment';

@Component({
  selector: 'app-story-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Add RouterModule
  templateUrl: './Story-Details.component.html',
  styleUrl: './Story-Details.component.css',
})
export class StoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storyService = inject(StoryService);
  private authService = inject(AuthService);

  story: StoryViewModel | null = null;
  relatedStories: StoryViewModel[] = [];
  loading = true;
  error = '';
  newComment: string | null = '';
  submittingComment = false;
  togglingLike = false;
  commentError: string = '';

  ngOnInit(): void {
    const storyId = this.route.snapshot.params['id'];
    console.log('Story ID from route:', storyId);
    if (storyId) {
      this.loadStory(parseInt(storyId));
    } else {
      console.error('No story ID found in route');
      this.error = 'No story ID provided';
      this.loading = false;
    }
  }

  async loadStory(id: number): Promise<void> {
    try {
      this.loading = true;
      console.log('Loading story with ID:', id);
      this.story = await this.storyService.getStoryById(id);
      this.loadRelatedStories(); // Load related stories when a story is loaded
      console.log('Loaded Story:', this.story);
    } catch (error) {
      this.error = 'Failed to load story. Please try again.';
      console.error('Error loading story:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadRelatedStories(): Promise<void> {
    if (!this.story) return;

    try {
      const stories = await this.storyService.getRelatedStories(this.story.id);

      // Filter out the current story if it's in the related stories
      this.relatedStories = stories.filter((s) => s.id !== this.story?.id);

      console.log('Related Stories:', this.relatedStories);
    } catch (error) {
      console.error('Error loading related stories:', error);
      // Set empty array on error
      this.relatedStories = [];
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  async toggleLike(): Promise<void> {
    if (!this.isAuthenticated) {
      console.warn('User not authenticated, redirecting to login');
      // Store the current URL and redirect to login
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    if (!this.story || this.togglingLike) return;

    try {
      this.togglingLike = true;
      const likeData: LikeCreateViewModel = { storyId: this.story.id };
      await this.storyService.toggleLike(likeData);

      // Update local state
      if (this.story.isLikedByCurrentUser) {
        this.story.likeCount--;
        this.story.isLikedByCurrentUser = false;
      } else {
        this.story.likeCount++;
        this.story.isLikedByCurrentUser = true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      this.togglingLike = false;
    }
  }

  async addComment(): Promise<void> {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    if (!this.story || !this.newComment?.trim() || this.submittingComment) {
      return;
    }

    try {
      this.submittingComment = true;
      this.commentError = '';

      const commentData: CommentCreateViewModel = {
        storyId: this.story.id,
        content: this.newComment.trim(),
      };

      const newComment = await this.storyService.addComment(commentData);

      // Add the new comment to the beginning of the comments array
      if (this.story.comments) {
        this.story.comments.unshift(newComment);
      } else {
        this.story.comments = [newComment];
      }

      // Clear the comment input
      this.newComment = '';
    } catch (error) {
      console.error('Error adding comment:', error);
      this.commentError = 'Failed to post comment. Please try again.';
    } finally {
      this.submittingComment = false;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  navigateToMasjid(masjidId: number): void {
    this.router.navigate(['/masjid', masjidId]);
  }

  navigateToStory(storyId: number): void {
    this.router.navigate(['/story-details', storyId]);
  }

  shareStory(): void {
    if (navigator.share) {
      navigator
        .share({
          title: this.story?.title,
          text: `Check out this story about ${this.story?.masjidName}`,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          // Show toast or alert that URL was copied
          alert('Story link copied to clipboard!');
        })
        .catch((err) => console.error('Failed to copy URL', err));
    }
  }

  getFullImageUrl(url: string): string {
    if (!url) return 'assets/default-story.png';
    if (url.startsWith('http')) return url;
    return environment.apiUrl.replace(/\/$/, '') + url;
  }
}
