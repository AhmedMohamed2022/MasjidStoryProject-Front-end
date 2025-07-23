import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MasjidViewModel,
  getTranslatedMasjidName,
} from '../../Core/Models/masjid.model';
import { StoryViewModel } from '../../Core/Models/story.model';
import { EventViewModel } from '../../Core/Models/event.model';
import { HomeService } from '../../Core/Services/Home.service';
import { AuthService } from '../../Core/Services/auth.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TranslateModule],
  templateUrl: './Home.component.html',
  styleUrls: ['./Home.component.css'],
})
export class HomeComponent implements OnInit {
  featuredMasjids: MasjidViewModel[] = [];
  latestStories: StoryViewModel[] = [];
  upcomingEvents: EventViewModel[] = [];

  loadingMasjids = true;
  loadingStories = true;
  loadingEvents = true;

  masjidError: string | null = null;
  storyError: string | null = null;
  eventError: string | null = null;

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedMasjids();
    this.loadLatestStories();
    this.loadUpcomingEvents();
    // Only load registrations if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.userRegistrationService.refreshRegistrations();
    }

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.loadFeaturedMasjids();
      this.loadLatestStories();
      this.loadUpcomingEvents();
    });
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  loadFeaturedMasjids(): void {
    this.homeService.getFeaturedMasjids().subscribe({
      next: (masjids) => {
        this.featuredMasjids = masjids.slice(0, 6); // Show only 6
        console.log('Loaded featured masjids:', this.featuredMasjids);
        this.loadingMasjids = false;
      },
      error: (error) => {
        console.error('Error loading featured masjids:', error);
        this.translate
          .get('HOME.ERROR_LOADING_MASJIDS')
          .subscribe((text: string) => {
            this.masjidError = text;
          });
        this.loadingMasjids = false;
      },
    });
  }

  loadLatestStories(): void {
    this.homeService.getLatestStories().subscribe({
      next: (stories) => {
        this.latestStories = stories.slice(0, 4); // Show only 4
        this.loadingStories = false;
      },
      error: (error) => {
        console.error('Error loading latest stories:', error);
        this.translate
          .get('HOME.ERROR_LOADING_STORIES')
          .subscribe((text: string) => {
            this.storyError = text;
          });
        this.loadingStories = false;
      },
    });
  }

  loadUpcomingEvents(): void {
    this.homeService.getUpcomingEvents(this.translate.currentLang).subscribe({
      next: (events) => {
        // Update registration status for each event
        this.upcomingEvents = events.slice(0, 6).map((event) => ({
          ...event,
          isUserRegistered: this.userRegistrationService.isUserRegistered(
            event.id
          ),
        }));
        this.loadingEvents = false;
      },
      error: (error) => {
        console.error('Error loading upcoming events:', error);
        this.translate
          .get('HOME.ERROR_LOADING_EVENTS')
          .subscribe((text: string) => {
            this.eventError = text;
          });
        this.loadingEvents = false;
      },
    });
  }

  navigateToExplore(): void {
    this.router.navigate(['/search-masjid']);
  }

  navigateToMasjid(id: number): void {
    this.router.navigate(['/masjid', id]);
  }

  navigateToStory(id: number): void {
    this.router.navigate(['/story-details', id]);
  }

  navigateToAllEvents(): void {
    this.router.navigate(['/upcoming-events']);
  }

  navigateToEventDetails(eventId: number): void {
    this.router.navigate(['/event-details', eventId]);
  }

  navigateToMasjidEvents(masjidId: number): void {
    this.router.navigate(['/masjid', masjidId], { fragment: 'events' });
  }

  navigateToCreateEvent(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/create-event']);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/create-event' },
      });
    }
  }

  navigateToMyEvents(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/my-events']);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/my-events' },
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToAllMasjids(): void {
    this.router.navigate(['/search-masjid']);
  }

  navigateToSearch(): void {
    this.router.navigate(['/search-masjid']);
  }

  getStoryExcerpt(content: string): string {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  getEventStatus(date: string): string {
    if (this.isEventToday(date)) {
      return 'today';
    } else if (this.isEventUpcoming(date)) {
      return 'upcoming';
    } else {
      return 'past';
    }
  }

  getEventStatusIcon(date: string): string {
    const status = this.getEventStatus(date);
    switch (status) {
      case 'today':
        return 'fa-calendar-day';
      case 'upcoming':
        return 'fa-calendar-alt';
      case 'past':
        return 'fa-calendar-times';
      default:
        return 'fa-calendar';
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

  formatEventTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Expose the helper for template
  public getTranslatedMasjidName = getTranslatedMasjidName;
}
