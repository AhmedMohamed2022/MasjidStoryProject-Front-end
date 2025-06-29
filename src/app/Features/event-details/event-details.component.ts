import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventViewModel } from '../../Core/Models/event.model';
import { EventService } from '../../Core/Services/event.service';
import { AuthService } from '../../Core/Services/auth.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';
import { CommentService } from '../../Core/Services/comment.service';
import { LikeService } from '../../Core/Services/like.service';
import { CommentViewModel } from '../../Core/Models/comment.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
})
export class EventDetailsComponent implements OnInit {
  event: EventViewModel | null = null;
  loading = false;
  error = '';
  eventId: number = 0;
  registering = false;
  deleting = false;

  // Comments and Likes properties
  newComment = '';
  submittingComment = false;
  commentError = '';
  togglingLike = false;
  eventComments: CommentViewModel[] = [];

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private commentService: CommentService,
    private likeService: LikeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const eventId = +params['id'];
      if (eventId) {
        this.loadEventDetails(eventId);
        // Only load registrations if user is authenticated
        if (this.authService.isAuthenticated()) {
          this.userRegistrationService.refreshRegistrations();
        }
      }
    });
  }

  loadEventDetails(eventId: number): void {
    this.loading = true;
    this.eventService.getEventDetails(eventId).subscribe({
      next: (event) => {
        event.isUserRegistered = this.userRegistrationService.isUserRegistered(
          event.id
        );
        this.event = event;
        this.loading = false;

        // Load comments and likes after event is loaded
        this.loadComments();
        this.loadLikeStatus();
      },
      error: (error) => {
        this.error = 'Failed to load event details';
        this.loading = false;
        console.error('Error loading event:', error);
      },
    });
  }

  registerForEvent(): void {
    if (!this.event || this.registering) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.registering = true;
    this.userRegistrationService.registerToEvent(this.event.id).subscribe({
      next: (message) => {
        if (this.event) {
          this.event.isUserRegistered = true;
        }
        this.registering = false;
        alert('Registered successfully!');
      },
      error: (error) => {
        this.registering = false;
        alert('Registration failed. You may already be registered.');
        console.error('Registration error:', error);
      },
    });
  }

  editEvent(): void {
    if (!this.event) return;
    this.router.navigate(['/edit-event', this.event.id]);
  }

  deleteEvent(): void {
    if (!this.event || this.deleting) return;

    if (
      !confirm(
        'Are you sure you want to delete this event? This action cannot be undone.'
      )
    ) {
      return;
    }

    this.deleting = true;
    this.eventService.deleteEvent(this.event.id).subscribe({
      next: (message) => {
        alert('Event deleted successfully!');
        this.router.navigate(['/upcoming-events']);
      },
      error: (error) => {
        alert('Failed to delete event. You may not have permission.');
        console.error('Delete error:', error);
        this.deleting = false;
      },
    });
  }

  navigateToMasjid(masjidId: number | undefined): void {
    if (masjidId) {
      this.router.navigate(['/masjid', masjidId]);
    }
  }

  shareEvent(): void {
    if (navigator.share) {
      navigator
        .share({
          title: this.event?.title,
          text: `Check out this event: ${this.event?.title}`,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert('Event link copied to clipboard!'))
        .catch((err) => console.error('Failed to copy URL', err));
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get isEventCreator(): boolean {
    if (!this.event || !this.isAuthenticated) return false;
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.email === this.event.createdByName; // Assuming createdByName is email
  }

  get isEventPast(): boolean {
    if (!this.event) return false;
    const eventDate = new Date(this.event.eventDate);
    const now = new Date();
    return eventDate < now;
  }

  get isEventToday(): boolean {
    if (!this.event) return false;
    const eventDate = new Date(this.event.eventDate);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  getEventStatusClass(): string {
    if (this.isEventPast) {
      return 'status-past';
    } else if (this.isEventToday) {
      return 'status-today';
    } else {
      return 'status-upcoming';
    }
  }

  getEventStatusIcon(): string {
    if (this.isEventPast) {
      return 'fa-calendar-times';
    } else if (this.isEventToday) {
      return 'fa-calendar-day';
    } else {
      return 'fa-calendar-alt';
    }
  }

  getEventStatusText(): string {
    if (this.isEventPast) {
      return 'Past Event';
    } else if (this.isEventToday) {
      return 'Today';
    } else {
      return 'Upcoming';
    }
  }

  // Comments and Likes Methods
  loadComments(): void {
    if (!this.event) return;

    this.commentService.getCommentsByContent(this.event.id, 'Event').subscribe({
      next: (comments) => {
        this.eventComments = comments;
        if (this.event) {
          this.event.comments = comments;
        }
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      },
    });
  }

  addComment(): void {
    if (!this.event || !this.newComment.trim() || this.submittingComment)
      return;

    this.submittingComment = true;
    this.commentError = '';

    const commentData = {
      contentId: this.event.id,
      contentType: 'Event',
      content: this.newComment.trim(),
    };

    this.commentService.addComment(commentData).subscribe({
      next: (newComment) => {
        this.eventComments.unshift(newComment);
        if (this.event) {
          this.event.comments = this.eventComments;
        }
        this.newComment = '';
        this.submittingComment = false;
      },
      error: (error) => {
        this.commentError = error.message || 'Failed to add comment';
        this.submittingComment = false;
      },
    });
  }

  toggleLike(): void {
    if (!this.event || this.togglingLike) return;

    this.togglingLike = true;
    this.likeService.toggleLike(this.event.id, 'Event').subscribe({
      next: (response) => {
        if (this.event) {
          this.event.isLikedByCurrentUser = response.liked;
          // Update like count
          this.likeService.getLikeCount(this.event.id, 'Event').subscribe({
            next: (countResponse) => {
              if (this.event) {
                this.event.likeCount = countResponse.count;
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
    if (!this.event || !this.isAuthenticated) return;

    this.likeService.getLikeStatus(this.event.id, 'Event').subscribe({
      next: (response) => {
        if (this.event) {
          this.event.isLikedByCurrentUser = response.isLiked;
        }
      },
      error: (error) => {
        console.error('Error loading like status:', error);
      },
    });
  }
}
