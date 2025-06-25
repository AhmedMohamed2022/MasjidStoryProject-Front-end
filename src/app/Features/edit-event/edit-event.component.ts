import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../Core/Services/event.service';
import { MasjidService } from '../../Core/Services/masjid.service';
import {
  LanguageService,
  LanguageViewModel,
} from '../../Core/Services/language.service';
import {
  EventCreateViewModel,
  EventViewModel,
} from '../../Core/Models/event.model';
import { MasjidViewModel } from '../../Core/Models/masjid.model';
import { AuthService } from '../../Core/Services/auth.service';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
})
export class EditEventComponent implements OnInit {
  event: EventCreateViewModel = {
    title: '',
    description: '',
    eventDate: '',
    masjidId: undefined,
    languageId: undefined,
  };

  originalEvent: EventViewModel | null = null;
  masjids: MasjidViewModel[] = [];
  languages: LanguageViewModel[] = [];
  eventId: number = 0;
  loading = false;
  loadingEvent = true;
  loadingMasjids = true;
  loadingLanguages = true;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private eventService: EventService,
    private masjidService: MasjidService,
    private languageService: LanguageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.eventId) {
      this.loadEventForEdit();
      this.loadMasjids();
      this.loadLanguages();
    }
  }

  loadEventForEdit(): void {
    this.loadingEvent = true;
    this.eventService.getEventDetails(this.eventId).subscribe({
      next: (event) => {
        this.originalEvent = event;

        // Check if user is the creator
        if (!this.isEventCreator(event)) {
          this.error = 'You can only edit events you created.';
          this.loadingEvent = false;
          return;
        }

        // Populate form with existing data
        this.event = {
          title: event.title,
          description: event.description,
          eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
          masjidId: event.masjidId,
          languageId: undefined, // Add if available in your model
        };

        this.loadingEvent = false;
      },
      error: (error) => {
        this.error = 'Failed to load event for editing';
        this.loadingEvent = false;
        console.error('Error loading event:', error);
      },
    });
  }

  isEventCreator(event: EventViewModel): boolean {
    if (!this.authService.isAuthenticated()) return false;
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.email === event.createdByName;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.eventService.updateEvent(this.eventId, this.event).subscribe({
      next: (response) => {
        this.success = 'Event updated successfully!';
        this.loading = false;

        // Redirect to event details after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/event-details', this.eventId]);
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.error = 'Failed to update event. Please try again.';
        this.loading = false;
      },
    });
  }

  isFormValid(): boolean {
    if (!this.event.title.trim()) {
      this.error = 'Title is required';
      return false;
    }

    if (!this.event.description.trim()) {
      this.error = 'Description is required';
      return false;
    }

    if (!this.event.eventDate) {
      this.error = 'Event date is required';
      return false;
    }

    // Check if date is in the future
    const eventDate = new Date(this.event.eventDate);
    const now = new Date();
    if (eventDate <= now) {
      this.error = 'Event date must be in the future';
      return false;
    }

    return true;
  }

  onCancel(): void {
    this.router.navigate(['/event-details', this.eventId]);
  }

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.success = null;
  }

  loadMasjids(): void {
    this.masjidService.getAllMasjids().subscribe({
      next: (masjids) => {
        this.masjids = masjids;
        this.loadingMasjids = false;
      },
      error: (error) => {
        console.error('Error loading masjids:', error);
        this.loadingMasjids = false;
        this.loadMockMasjids();
      },
    });
  }

  loadMockMasjids(): void {
    setTimeout(() => {
      this.masjids = [
        {
          id: 1,
          shortName: 'Al-Azhar',
          address: 'Cairo, Egypt',
          archStyle: 'Islamic',
          countryName: 'Egypt',
          cityName: 'Cairo',
          yearOfEstablishment: 970,
          dateOfRecord: new Date(),
        },
        {
          id: 2,
          shortName: 'Hagia Sophia',
          address: 'Istanbul, Turkey',
          archStyle: 'Byzantine',
          countryName: 'Turkey',
          cityName: 'Istanbul',
          yearOfEstablishment: 537,
          dateOfRecord: new Date(),
        },
        {
          id: 3,
          shortName: 'Blue Mosque',
          address: 'Istanbul, Turkey',
          archStyle: 'Ottoman',
          countryName: 'Turkey',
          cityName: 'Istanbul',
          yearOfEstablishment: 1616,
          dateOfRecord: new Date(),
        },
      ];
      this.loadingMasjids = false;
    }, 1000);
  }

  loadLanguages(): void {
    this.languageService.getAllLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
        this.loadingLanguages = false;
      },
      error: (error) => {
        console.error('Error loading languages:', error);
        this.loadingLanguages = false;
        this.loadMockLanguages();
      },
    });
  }

  loadMockLanguages(): void {
    setTimeout(() => {
      this.languages = [
        { id: 1, name: 'English', code: 'en' },
        { id: 2, name: 'Arabic', code: 'ar' },
        { id: 3, name: 'Turkish', code: 'tr' },
      ];
      this.loadingLanguages = false;
    }, 1000);
  }
}
