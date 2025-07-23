import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventService } from '../../Core/Services/event.service';
import { AuthService } from '../../Core/Services/auth.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';
import { EventViewModel } from '../../Core/Models/event.model';

@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.css'],
})
export class UpcomingEventsComponent implements OnInit {
  events: EventViewModel[] = [];
  loading = false;
  error = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    // Only load registrations if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.userRegistrationService.refreshRegistrations();
    }
    this.translate.onLangChange.subscribe(() => {
      this.loadEvents();
    });
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getUpcomingEvents(this.translate.currentLang).subscribe({
      next: (events) => {
        // Update registration status for each event
        this.events = events.map((event) => ({
          ...event,
          isUserRegistered: this.userRegistrationService.isUserRegistered(
            event.id
          ),
        }));
        this.loading = false;
      },
      error: (error) => {
        this.translate
          .get('UPCOMING_EVENTS_ERROR')
          .subscribe((text: string) => {
            this.error = text;
          });
        this.loading = false;
        console.error('Error loading events:', error);
      },
    });
  }

  registerForEvent(eventId: number): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.userRegistrationService.registerToEvent(eventId).subscribe({
      next: (message) => {
        // Update the event's registration status locally
        const event = this.events.find((e) => e.id === eventId);
        if (event) {
          event.isUserRegistered = true;
        }
        this.translate
          .get('UPCOMING_EVENTS.REGISTRATION_SUCCESS')
          .subscribe((text: string) => {
            alert(text);
          });
      },
      error: (error) => {
        this.translate
          .get('UPCOMING_EVENTS.REGISTRATION_FAILED')
          .subscribe((text: string) => {
            alert(text);
          });
        console.error('Registration error:', error);
      },
    });
  }

  formatDate(dateString: string): string {
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
