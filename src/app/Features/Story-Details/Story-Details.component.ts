// src/app/features/story-detail/story-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './Story-Details.component.html',
  styleUrl: './Story-Details.component.css',
})
export class StoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storyService = inject(StoryService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  story: StoryViewModel | null = null;
  relatedStories: StoryViewModel[] = [];
  loading = true;
  error = '';
  newComment: string | null = '';
  submittingComment = false;
  togglingLike = false;
  commentError: string = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const storyId = params.get('id');
      if (storyId) {
        this.loadStory(parseInt(storyId));
      } else {
        this.error = this.translate.instant('STORY_DETAILS.NO_STORY_ID');
        this.loading = false;
      }
    });
    this.translate.onLangChange.subscribe(() => {
      const storyId = this.route.snapshot.paramMap.get('id');
      if (storyId) {
        this.loadStory(parseInt(storyId));
      }
    });
  }

  async loadStory(id: number): Promise<void> {
    try {
      this.loading = true;
      this.story = await this.storyService.getStoryById(
        id,
        this.translate.currentLang
      );
      this.loadRelatedStories();
    } catch (error) {
      this.translate.get('STORY_DETAILS.ERROR').subscribe((text: string) => {
        this.error = text;
      });
    } finally {
      this.loading = false;
    }
  }

  async loadRelatedStories(): Promise<void> {
    if (!this.story) return;
    try {
      const stories = await this.storyService.getRelatedStories(
        this.story.id,
        this.translate.currentLang
      );
      this.relatedStories = stories.filter((s) => s.id !== this.story?.id);
    } catch (error) {
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
      const likeData: LikeCreateViewModel = {
        contentId: this.story.id,
        contentType: 'Story',
      };
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
        contentId: this.story.id,
        contentType: 'Story',
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
      this.translate
        .get('STORY_DETAILS.COMMENT_ERROR')
        .subscribe((text: string) => {
          this.commentError = text;
        });
    } finally {
      this.submittingComment = false;
    }
  }

  formatDate(date: string): string {
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(date: string): string {
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return new Date(date).toLocaleTimeString(locale, {
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
          title: this.story?.localizedTitle,
          text: this.translate.instant('STORY_DETAILS.SHARE_TEXT', {
            masjidName: this.story?.masjidName,
          }),
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          this.translate
            .get('STORY_DETAILS.LINK_COPIED')
            .subscribe((text: string) => {
              alert(text || this.translate.instant('COMMON.SUCCESS_GENERIC'));
            });
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
