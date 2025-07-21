import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommunityService } from '../../Core/Services/community.service';
import { AuthService } from '../../Core/Services/auth.service';
import { CommunityViewModel } from '../../Core/Models/community.model';
import { CommentService } from '../../Core/Services/comment.service';
import { LikeService } from '../../Core/Services/like.service';
import { CommentViewModel } from '../../Core/Models/comment.model';

@Component({
  selector: 'app-community-details',
  templateUrl: './community-details.component.html',
  styleUrls: ['./community-details.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class CommunityDetailsComponent implements OnInit {
  community: CommunityViewModel | null = null;
  loading = false;
  error = '';
  isAuthenticated = false;
  membershipLoading = false;

  // Comments and Likes properties
  newComment = '';
  submittingComment = false;
  commentError = '';
  togglingLike = false;
  communityComments: CommentViewModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private authService: AuthService,
    private commentService: CommentService,
    private likeService: LikeService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadCommunity();
  }

  loadCommunity() {
    const communityId = this.route.snapshot.paramMap.get('id');
    if (!communityId) {
      this.translate
        .get('COMMUNITY_DETAILS.ERROR')
        .subscribe((text: string) => {
          this.error = text;
        });
      return;
    }
    this.loading = true;
    this.error = '';
    this.communityService.getCommunityById(+communityId).subscribe({
      next: (community) => {
        this.community = community;
        this.loading = false;

        // Load comments and likes after community is loaded
        this.loadComments();
        this.loadLikeStatus();
      },
      error: (err) => {
        this.translate
          .get('COMMUNITY_DETAILS.ERROR')
          .subscribe((text: string) => {
            this.error = err.message || text;
          });
        this.loading = false;
      },
    });
  }

  toggleMembership() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.community) return;
    const action$ = this.community.isUserMember
      ? this.communityService.leaveCommunity(this.community.id)
      : this.communityService.joinCommunity(this.community.id);
    this.membershipLoading = true;
    action$.subscribe({
      next: () => {
        if (this.community) {
          this.community.isUserMember = !this.community.isUserMember;
          this.community.memberCount += this.community.isUserMember ? 1 : -1;
        }
        this.membershipLoading = false;
      },
      error: (err) => {
        this.translate
          .get('COMMUNITY_DETAILS.ERROR')
          .subscribe((text: string) => {
            alert(
              err.message ||
                text ||
                this.translate.instant('COMMON.ERROR_GENERIC')
            );
          });
        this.membershipLoading = false;
      },
    });
  }

  goToMasjid() {
    if (this.community) {
      this.router.navigate(['/masjid', this.community.masjidId]);
    }
  }

  goBack() {
    window.history.back();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getLanguageFlag(languageCode: string): string {
    return languageCode === 'ar' ? 'AR' : 'EN';
  }

  getLanguageName(languageCode: string): string {
    return languageCode === 'ar' ? 'Arabic' : 'English';
  }

  shareCommunity() {
    if (navigator.share) {
      navigator.share({
        title: this.community?.title,
        text: this.community?.content,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.translate
        .get('COMMUNITY_DETAILS.LINK_COPIED')
        .subscribe((text: string) => {
          alert(text || this.translate.instant('COMMON.SUCCESS_GENERIC'));
        });
    }
  }

  // Comments and Likes Methods
  loadComments(): void {
    if (!this.community) return;

    this.commentService
      .getCommentsByContent(this.community.id, 'Community')
      .subscribe({
        next: (comments) => {
          this.communityComments = comments;
          if (this.community) {
            this.community.comments = comments;
          }
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        },
      });
  }

  addComment(): void {
    if (!this.community || !this.newComment.trim() || this.submittingComment)
      return;

    this.submittingComment = true;
    this.commentError = '';

    const commentData = {
      contentId: this.community.id,
      contentType: 'Community',
      content: this.newComment.trim(),
    };

    this.commentService.addComment(commentData).subscribe({
      next: (newComment) => {
        this.communityComments.unshift(newComment);
        if (this.community) {
          this.community.comments = this.communityComments;
        }
        this.newComment = '';
        this.submittingComment = false;
      },
      error: (error) => {
        this.translate
          .get('COMMUNITY_DETAILS.ERROR')
          .subscribe((text: string) => {
            this.commentError = error.message || text;
          });
        this.submittingComment = false;
      },
    });
  }

  toggleLike(): void {
    if (!this.community || this.togglingLike) return;

    this.togglingLike = true;
    this.likeService.toggleLike(this.community.id, 'Community').subscribe({
      next: (response) => {
        if (this.community) {
          this.community.isLikedByCurrentUser = response.liked;
          // Update like count
          this.likeService
            .getLikeCount(this.community.id, 'Community')
            .subscribe({
              next: (countResponse) => {
                if (this.community) {
                  this.community.likeCount = countResponse.count;
                }
              },
            });
        }
        this.togglingLike = false;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.togglingLike = false;
      },
    });
  }

  loadLikeStatus(): void {
    if (!this.community || !this.isAuthenticated) return;

    this.likeService.getLikeStatus(this.community.id, 'Community').subscribe({
      next: (response) => {
        if (this.community) {
          this.community.isLikedByCurrentUser = response.isLiked;
        }
      },
      error: (error) => {
        console.error('Error loading like status:', error);
      },
    });
  }

  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
