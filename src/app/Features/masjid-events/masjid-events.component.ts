// File: src/app/features/masjid-events/masjid-events.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventService } from '../../Core/Services/event.service';
import { EventViewModel } from '../../Core/Models/event.model';
import { AuthService } from '../../Core/Services/auth.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';
import { MasjidDetailService } from '../../Core/Services/masjid-details.service';

@Component({
  selector: 'app-masjid-events',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './masjid-events.component.html',
  styleUrls: ['./masjid-events.component.css'],
})
export class MasjidEventsComponent implements OnInit, OnDestroy {
  @Input() masjidId?: number;
  @Input() masjidName: string = '';

  events: EventViewModel[] = [];
  loading = true;
  error = '';
  registering: { [key: number]: boolean } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private masjidService: MasjidDetailService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const masjidId = +params['id'];
      if (masjidId) {
        this.masjidId = masjidId;
        this.loadMasjidEvents(masjidId);
        this.loadMasjidName(masjidId);
        // Only load registrations if user is authenticated
        if (this.authService.isAuthenticated()) {
          this.userRegistrationService.refreshRegistrations();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadMasjidEvents(masjidId: number): void {
    if (!masjidId) {
      this.error = 'Masjid ID is required';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    this.eventService
      .getMasjidEvents(masjidId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            // Update registration status for each event
            this.events = response.map((event) => ({
              ...event,
              isUserRegistered: this.userRegistrationService.isUserRegistered(
                event.id
              ),
            }));
          } else {
            this.error = response || 'Failed to load events';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load events. Please try again.';
          this.loading = false;
          console.error('Error loading masjid events:', err);
        },
      });
  }

  registerForEvent(eventId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.registering[eventId] = true;

    this.userRegistrationService
      .registerToEvent(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Update the event's registration status locally
          const event = this.events.find((e) => e.id === eventId);
          if (event) {
            event.isUserRegistered = true;
          }
          this.registering[eventId] = false;
        },
        error: (err) => {
          console.error('Error registering for event:', err);
          this.registering[eventId] = false;
        },
      });
  }

  navigateToEventDetails(eventId: number): void {
    this.router.navigate(['/event-details', eventId]);
  }

  navigateToAllEvents(): void {
    this.router.navigate(['/upcoming-events']);
  }

  goBack(): void {
    if (this.masjidId) {
      this.router.navigate(['/masjid', this.masjidId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Get current language for proper localization
      const currentLang = this.translate.currentLang || 'en';
      const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

      return date.toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Get current language for proper localization
      const currentLang = this.translate.currentLang || 'en';
      const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }

  getEventDay(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.getDate().toString().padStart(2, '0');
    } catch (error) {
      return '';
    }
  }

  getEventMonth(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Get current language for proper localization
      const currentLang = this.translate.currentLang || 'en';
      const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

      return date.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
    } catch (error) {
      return '';
    }
  }

  isEventPast(dateString: string): boolean {
    if (!dateString) return false;

    try {
      const eventDate = new Date(dateString);
      const now = new Date();
      return eventDate < now;
    } catch (error) {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  trackByEventId(index: number, event: EventViewModel): number {
    return event.id;
  }

  private loadMasjidName(masjidId: number): void {
    this.masjidService
      .getMasjidDetails(masjidId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.masjidName = response.data.shortName;
          }
        },
        error: (error) => {
          console.error('Error loading masjid name:', error);
        },
      });
  }
}
