import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../Core/Services/event.service';
import { MasjidService } from '../../Core/Services/masjid.service';
import {
  LanguageService,
  LanguageViewModel,
} from '../../Core/Services/language.service';
import { EventCreateViewModel } from '../../Core/Models/event.model';
import { MasjidViewModel } from '../../Core/Models/masjid.model';

// You'll need to create this interface or import it from your existing code
// interface LanguageViewModel {
//   id: number;
//   name: string;
//   code: string;
// }

@Component({
  selector: 'app-create-event',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
})
export class CreateEventComponent implements OnInit {
  event: EventCreateViewModel = {
    title: '',
    description: '',
    eventDate: '',
    masjidId: undefined,
    languageId: undefined,
  };

  masjids: MasjidViewModel[] = [];
  languages: LanguageViewModel[] = [];

  loading = false;
  loadingMasjids = true;
  loadingLanguages = true;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private eventService: EventService,
    private masjidService: MasjidService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMasjids();
    this.loadLanguages();
    this.setMinDate();
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
        // Fallback to mock data if API fails
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
        // Fallback to mock data if API fails
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

  setMinDate(): void {
    // Set minimum date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}T00:00`;

    const dateInput = document.getElementById('eventDate') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = minDate;
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Convert date to ISO string if needed
    const eventToCreate = {
      ...this.event,
      eventDate: new Date(this.event.eventDate).toISOString(),
    };

    this.eventService.createEvent(eventToCreate).subscribe({
      next: (response) => {
        this.success = 'Event created successfully!';
        this.loading = false;

        // Redirect to events page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/events']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.error = 'Failed to create event. Please try again.';
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
    this.router.navigate(['/events']);
  }

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.success = null;
  }
}
