import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../Core/Services/event.service';
import { AuthService } from '../../Core/Services/auth.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';
import { EventViewModel } from '../../Core/Models/event.model';

@Component({
  selector: 'app-my-events',
  imports: [CommonModule],
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css'],
})
export class MyEventsComponent implements OnInit {
  registeredEvents: EventViewModel[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyEvents();
    // Only load registrations if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.userRegistrationService.refreshRegistrations();
    }
  }

  loadMyEvents(): void {
    this.loading = true;
    this.error = null;

    this.eventService.getMyRegistrations().subscribe({
      next: (events) => {
        // Ensure all events show as registered
        this.registeredEvents = events.map((event) => ({
          ...event,
          isUserRegistered: true,
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading registered events:', error);
        this.error = 'Failed to load your registered events';
        this.loading = false;
      },
    });
  }

  navigateToEventDetails(eventId: number): void {
    this.router.navigate(['/event-details', eventId]);
  }

  navigateToMasjid(masjidId: number): void {
    if (masjidId) {
      this.router.navigate(['/masjid', masjidId]);
    }
  }

  navigateToAllEvents(): void {
    this.router.navigate(['/upcoming-events']);
  }

  formatEventDate(date: string): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatEventTime(date: string): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  getEventDay(date: string): string {
    return new Date(date).getDate().toString();
  }

  getEventMonth(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short' });
  }

  isEventUpcoming(date: string): boolean {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now;
  }

  isEventToday(date: string): boolean {
    const eventDate = new Date(date);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }

  isEventPast(date: string): boolean {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate < now;
  }

  getEventStatus(date: string): string {
    if (this.isEventToday(date)) {
      return 'today';
    } else if (this.isEventUpcoming(date)) {
      return 'upcoming';
    } else {
      return 'past';
    }
  }

  getEventStatusText(date: string): string {
    const status = this.getEventStatus(date);
    switch (status) {
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'past':
        return 'Past Event';
      default:
        return '';
    }
  }

  getDaysUntilEvent(date: string): number {
    const eventDate = new Date(date);
    const today = new Date();
    const timeDiff = eventDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  getDaysUntilEventText(date: string): string {
    const days = this.getDaysUntilEvent(date);
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Tomorrow';
    } else if (days > 1) {
      return `In ${days} days`;
    } else {
      const pastDays = Math.abs(days);
      return pastDays === 1 ? 'Yesterday' : `${pastDays} days ago`;
    }
  }

  refreshEvents(): void {
    this.loadMyEvents();
  }

  // Group events by status
  get upcomingEvents(): EventViewModel[] {
    return this.registeredEvents.filter((event) =>
      this.isEventUpcoming(event.eventDate)
    );
  }

  get todayEvents(): EventViewModel[] {
    return this.registeredEvents.filter((event) =>
      this.isEventToday(event.eventDate)
    );
  }

  get pastEvents(): EventViewModel[] {
    return this.registeredEvents.filter((event) =>
      this.isEventPast(event.eventDate)
    );
  }

  get hasEvents(): boolean {
    return this.registeredEvents.length > 0;
  }
}
