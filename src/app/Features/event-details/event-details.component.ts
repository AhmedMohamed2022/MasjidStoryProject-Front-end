import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventViewModel } from '../../Core/Models/event.model';
import { EventService } from '../../Core/Services/event.service';
import { AuthService } from '../../Core/Services/auth.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
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
}
