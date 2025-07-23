import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventService } from '../../Core/Services/event.service';
import { AuthService } from '../../Core/Services/auth.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';
import { EventViewModel } from '../../Core/Models/event.model';

@Component({
  selector: 'app-my-events',
  imports: [CommonModule, TranslateModule],
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
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadMyEvents();
    // Only load registrations if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.userRegistrationService.refreshRegistrations();
    }
    this.translate.onLangChange.subscribe(() => {
      this.loadMyEvents();
    });
  }

  loadMyEvents(): void {
    this.loading = true;
    this.error = null;

    this.eventService.getMyRegistrations(this.translate.currentLang).subscribe({
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
        this.translate.get('MY_EVENTS_ERROR').subscribe((text: string) => {
          this.error = text;
        });
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
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return eventDate.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatEventTime(date: string): string {
    const eventDate = new Date(date);
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return eventDate.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  getEventDay(date: string): string {
    return new Date(date).getDate().toString();
  }

  getEventMonth(date: string): string {
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return new Date(date).toLocaleDateString(locale, { month: 'short' });
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
      return this.translate.instant('MY_EVENTS_TODAY');
    } else if (days === 1) {
      return this.translate.instant('MY_EVENTS_TOMORROW');
    } else if (days > 1) {
      return this.translate.instant('MY_EVENTS_IN_DAYS', { count: days });
    } else {
      const pastDays = Math.abs(days);
      return pastDays === 1
        ? this.translate.instant('MY_EVENTS_YESTERDAY')
        : this.translate.instant('MY_EVENTS_DAYS_AGO', { count: pastDays });
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
