import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MasjidService } from '../../Core/Services/masjid.service';
import { CountryService } from '../../Core/Services/country.service';
import { CityService } from '../../Core/Services/city.service';
import { StoryService } from '../../Core/Services/story-detail.service';
import { EventService } from '../../Core/Services/event.service';
import { CommunityService } from '../../Core/Services/community.service';
import {
  MasjidViewModel,
  CountryViewModel,
  CityViewModel,
} from '../../Core/Models/masjid.model';
import { StoryViewModel } from '../../Core/Models/story.model';
import {
  EventViewModel,
  EventCreateViewModel,
} from '../../Core/Models/event.model';
import {
  CommunityViewModel,
  CommunityCreateViewModel,
} from '../../Core/Models/community.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  // Tab management
  selectedTab = 0;
  tabs = [
    { label: 'Pending Stories', icon: 'hourglass_empty' },
    { label: 'All Stories', icon: 'library_books' },
    { label: 'Masjids', icon: 'mosque' },
    { label: 'Events', icon: 'event' },
    { label: 'Communities', icon: 'groups' },
  ];

  // Stories state
  pendingStories: StoryViewModel[] = [];
  allStories: StoryViewModel[] = [];
  pendingLoading = false;
  allStoriesLoading = false;
  pendingError = '';
  allStoriesError = '';

  // Masjids state
  masjids: MasjidViewModel[] = [];
  masjidsLoading = false;
  masjidsError = '';

  // Events state
  events: EventViewModel[] = [];
  eventsLoading = false;
  eventsError = '';
  showCreateEventForm = false;
  showEditEventForm = false;
  editingEvent: EventViewModel | null = null;
  eventForm: FormGroup;

  // Communities state
  communities: CommunityViewModel[] = [];
  communitiesLoading = false;
  communitiesError = '';
  showCreateCommunityForm = false;
  showEditCommunityForm = false;
  editingCommunity: CommunityViewModel | null = null;
  communityForm: FormGroup;

  // Masjid form state
  masjidForm: FormGroup;
  countries: CountryViewModel[] = [];
  cities: CityViewModel[] = [];
  selectedFiles: File[] = [];
  isSubmitting = false;
  showCreateForm = false;
  showEditForm = false;
  editingMasjid: MasjidViewModel | null = null;
  selectedMediaToDelete: number[] = [];

  displayedColumns: string[] = ['title', 'author', 'date', 'actions'];

  constructor(
    private fb: FormBuilder,
    private masjidService: MasjidService,
    private countryService: CountryService,
    private cityService: CityService,
    private storyService: StoryService,
    private eventService: EventService,
    private communityService: CommunityService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.masjidForm = this.fb.group({
      shortName: ['', Validators.required],
      address: [''],
      archStyle: [''],
      latitude: [null],
      longitude: [null],
      countryId: [null, Validators.required],
      cityId: [null, Validators.required],
      yearOfEstablishment: [null],
    });

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      masjidId: [null],
      languageId: [null],
    });

    this.communityForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      masjidId: [null, Validators.required],
      languageId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadMasjids();
    this.loadPendingStories();
  }

  onTabChange(index: number) {
    this.selectedTab = index;
    switch (index) {
      case 0:
        this.loadPendingStories();
        break;
      case 1:
        this.loadAllStories();
        break;
      case 2:
        this.loadMasjids();
        break;
      case 3:
        this.loadEvents();
        break;
      case 4:
        this.loadCommunities();
        break;
    }
  }

  // Stories methods
  async loadPendingStories() {
    this.pendingLoading = true;
    this.pendingError = '';
    try {
      this.pendingStories = await this.storyService.getPendingStories();
    } catch (err) {
      this.pendingError = 'Failed to load pending stories.';
    } finally {
      this.pendingLoading = false;
    }
  }

  async loadAllStories() {
    this.allStoriesLoading = true;
    this.allStoriesError = '';
    try {
      this.allStories = await this.storyService.getAllStories();
    } catch (err) {
      this.allStoriesError = 'Failed to load all stories.';
    } finally {
      this.allStoriesLoading = false;
    }
  }

  async approveStory(story: StoryViewModel) {
    if (!confirm(`Approve story "${story.title}"?`)) return;
    try {
      await this.storyService.approveStory(story.id);
      this.snackBar.open('Story approved!', 'Close', { duration: 2000 });
      if (this.selectedTab === 0) this.loadPendingStories();
      if (this.selectedTab === 1) this.loadAllStories();
    } catch (err) {
      this.snackBar.open('Failed to approve story.', 'Close', {
        duration: 3000,
      });
    }
  }

  async deleteStory(story: StoryViewModel) {
    if (!confirm(`Delete story "${story.title}"? This cannot be undone.`))
      return;
    try {
      await this.storyService.deleteStory(story.id);
      this.snackBar.open('Story deleted.', 'Close', { duration: 2000 });
      if (this.selectedTab === 0) this.loadPendingStories();
      if (this.selectedTab === 1) this.loadAllStories();
    } catch (err) {
      this.snackBar.open('Failed to delete story.', 'Close', {
        duration: 3000,
      });
    }
  }

  // Masjids methods
  async loadMasjids() {
    this.masjidsLoading = true;
    this.masjidsError = '';
    try {
      this.masjids =
        (await this.masjidService.getAllMasjids().toPromise()) || [];
    } catch (err) {
      this.masjidsError = 'Failed to load masjids.';
    } finally {
      this.masjidsLoading = false;
    }
  }

  loadCountries(): void {
    this.countries = [
      { id: 1, name: 'Egypt', code: 'EG' },
      { id: 2, name: 'Saudi Arabia', code: 'SA' },
    ];
  }

  loadCities(): void {
    const countryId = this.masjidForm.get('countryId')?.value;
    if (countryId) {
      this.cities = [
        { id: 1, name: 'Cairo', countryId: 1 },
        { id: 2, name: 'Alexandria', countryId: 1 },
        { id: 3, name: 'Riyadh', countryId: 2 },
        { id: 4, name: 'Jeddah', countryId: 2 },
      ].filter((city) => city.countryId === countryId);
    } else {
      this.cities = [];
    }
  }

  onCountryChange(): void {
    this.loadCities();
    this.masjidForm.patchValue({ cityId: null });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  showCreateMasjidForm(): void {
    this.showCreateForm = true;
    this.showEditForm = false;
    this.masjidForm.reset();
    this.selectedFiles = [];
  }

  showEditMasjidForm(masjid: MasjidViewModel): void {
    this.editingMasjid = masjid;
    this.showEditForm = true;
    this.showCreateForm = false;
    this.selectedFiles = [];
    this.selectedMediaToDelete = [];

    this.masjidForm.patchValue({
      shortName: masjid.shortName,
      address: masjid.address,
      archStyle: masjid.archStyle,
      latitude: masjid.latitude,
      longitude: masjid.longitude,
      countryId: masjid.countryId,
      cityId: masjid.cityId,
      yearOfEstablishment: masjid.yearOfEstablishment,
    });

    this.loadCities();
  }

  onSubmit(): void {
    if (this.masjidForm.valid) {
      this.isSubmitting = true;
      const formData = this.masjidForm.value;

      if (this.showCreateForm) {
        this.createMasjid(formData);
      } else if (this.showEditForm) {
        this.updateMasjid(formData);
      }
    }
  }

  createMasjid(formData: any): void {
    this.masjidService.createMasjid(formData, this.selectedFiles).subscribe({
      next: (response) => {
        this.snackBar.open('Masjid created successfully!', 'Close', {
          duration: 2000,
        });
        this.showCreateForm = false;
        this.masjidForm.reset();
        this.selectedFiles = [];
        this.loadMasjids();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating masjid:', error);
        this.snackBar.open('Failed to create masjid.', 'Close', {
          duration: 3000,
        });
        this.isSubmitting = false;
      },
    });
  }

  updateMasjid(formData: any): void {
    if (!this.editingMasjid) return;

    this.masjidService
      .updateMasjid(
        this.editingMasjid.id,
        formData,
        this.selectedFiles,
        this.selectedMediaToDelete
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open('Masjid updated successfully!', 'Close', {
            duration: 2000,
          });
          this.showEditForm = false;
          this.editingMasjid = null;
          this.masjidForm.reset();
          this.selectedFiles = [];
          this.selectedMediaToDelete = [];
          this.loadMasjids();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating masjid:', error);
          this.snackBar.open('Failed to update masjid.', 'Close', {
            duration: 3000,
          });
          this.isSubmitting = false;
        },
      });
  }

  deleteMasjid(masjid: MasjidViewModel): void {
    if (
      confirm(`Delete masjid "${masjid.shortName}"? This cannot be undone.`)
    ) {
      this.masjidService.deleteMasjid(masjid.id).subscribe({
        next: () => {
          this.snackBar.open('Masjid deleted successfully!', 'Close', {
            duration: 2000,
          });
          this.loadMasjids();
        },
        error: (error) => {
          console.error('Error deleting masjid:', error);
          this.snackBar.open('Failed to delete masjid.', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  onMediaDeleteSelect(mediaId: number, event: any): void {
    if (event.target.checked) {
      this.selectedMediaToDelete.push(mediaId);
    } else {
      this.selectedMediaToDelete = this.selectedMediaToDelete.filter(
        (id) => id !== mediaId
      );
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingMasjid = null;
    this.masjidForm.reset();
    this.selectedFiles = [];
    this.selectedMediaToDelete = [];
  }

  // Events methods
  async loadEvents() {
    this.eventsLoading = true;
    this.eventsError = '';
    try {
      // For admin dashboard, we'll get all events (not just upcoming)
      // Since the backend doesn't have a specific "all events" endpoint,
      // we'll use the upcoming events for now and can extend later
      this.eventService.getUpcomingEvents().subscribe({
        next: (events) => {
          this.events = events;
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.eventsError = 'Failed to load events.';
        },
        complete: () => {
          this.eventsLoading = false;
        },
      });
    } catch (err) {
      this.eventsError = 'Failed to load events.';
      this.eventsLoading = false;
    }
  }

  openCreateEventForm(): void {
    this.showCreateEventForm = true;
    this.showEditEventForm = false;
    this.eventForm.reset();
  }

  openEditEventForm(event: EventViewModel): void {
    this.editingEvent = event;
    this.showEditEventForm = true;
    this.showCreateEventForm = false;

    // Parse the event date to extract date and time
    const eventDateTime = new Date(event.eventDate);
    const eventDate = eventDateTime.toISOString().split('T')[0]; // YYYY-MM-DD format
    const eventTime = eventDateTime.toTimeString().split(' ')[0]; // HH:MM:SS format

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      eventDate: eventDate,
      eventTime: eventTime,
      masjidId: event.masjidId,
      languageId: null, // Not available in EventViewModel
    });
  }

  onSubmitEvent(): void {
    if (this.eventForm.valid) {
      this.isSubmitting = true;
      const formData = this.eventForm.value;

      // Combine date and time into a single datetime string
      const eventDate = formData.eventDate;
      const eventTime = formData.eventTime;
      const combinedDateTime = `${eventDate}T${eventTime}`;

      const eventData: EventCreateViewModel = {
        title: formData.title,
        description: formData.description,
        eventDate: combinedDateTime,
        masjidId: formData.masjidId,
        languageId: formData.languageId,
      };

      if (this.showCreateEventForm) {
        this.createEvent(eventData);
      } else if (this.showEditEventForm) {
        this.updateEvent(eventData);
      }
    }
  }

  createEvent(formData: EventCreateViewModel): void {
    this.eventService.createEvent(formData).subscribe({
      next: (response) => {
        this.snackBar.open('Event created successfully!', 'Close', {
          duration: 2000,
        });
        this.showCreateEventForm = false;
        this.eventForm.reset();
        this.loadEvents();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.snackBar.open('Failed to create event.', 'Close', {
          duration: 3000,
        });
        this.isSubmitting = false;
      },
    });
  }

  updateEvent(formData: EventCreateViewModel): void {
    if (!this.editingEvent) return;

    this.eventService.updateEvent(this.editingEvent.id, formData).subscribe({
      next: (response) => {
        this.snackBar.open('Event updated successfully!', 'Close', {
          duration: 2000,
        });
        this.showEditEventForm = false;
        this.editingEvent = null;
        this.eventForm.reset();
        this.loadEvents();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.snackBar.open('Failed to update event.', 'Close', {
          duration: 3000,
        });
        this.isSubmitting = false;
      },
    });
  }

  deleteEvent(event: EventViewModel): void {
    if (confirm(`Delete event "${event.title}"? This cannot be undone.`)) {
      this.eventService.deleteEvent(event.id).subscribe({
        next: () => {
          this.snackBar.open('Event deleted successfully!', 'Close', {
            duration: 2000,
          });
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.snackBar.open('Failed to delete event.', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  cancelEventForm(): void {
    this.showCreateEventForm = false;
    this.showEditEventForm = false;
    this.editingEvent = null;
    this.eventForm.reset();
  }

  // Communities methods
  async loadCommunities() {
    this.communitiesLoading = true;
    this.communitiesError = '';
    try {
      // Use the new getAllCommunities endpoint for admin dashboard
      this.communityService.getAllCommunities().subscribe({
        next: (communities) => {
          this.communities = communities;
        },
        error: (error) => {
          console.error('Error loading communities:', error);
          this.communitiesError = 'Failed to load communities.';
        },
        complete: () => {
          this.communitiesLoading = false;
        },
      });
    } catch (err) {
      this.communitiesError = 'Failed to load communities.';
      this.communitiesLoading = false;
    }
  }

  openCreateCommunityForm(): void {
    this.showCreateCommunityForm = true;
    this.showEditCommunityForm = false;
    this.communityForm.reset();
  }

  openEditCommunityForm(community: CommunityViewModel): void {
    this.editingCommunity = community;
    this.showEditCommunityForm = true;
    this.showCreateCommunityForm = false;

    this.communityForm.patchValue({
      title: community.title,
      content: community.content,
      masjidId: community.masjidId,
      languageId: this.getLanguageIdFromCode(community.languageCode),
    });
  }

  onSubmitCommunity(): void {
    if (this.communityForm.valid) {
      this.isSubmitting = true;
      const formData = this.communityForm.value;

      const communityData: CommunityCreateViewModel = {
        title: formData.title,
        content: formData.content,
        masjidId: formData.masjidId,
        languageId: formData.languageId,
      };

      if (this.showCreateCommunityForm) {
        this.createCommunity(communityData);
      } else if (this.showEditCommunityForm) {
        this.updateCommunity(communityData);
      }
    }
  }

  createCommunity(formData: CommunityCreateViewModel): void {
    this.communityService.createCommunity(formData).subscribe({
      next: (response) => {
        this.snackBar.open('Community created successfully!', 'Close', {
          duration: 2000,
        });
        this.showCreateCommunityForm = false;
        this.communityForm.reset();
        this.loadCommunities();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating community:', error);
        this.snackBar.open('Failed to create community.', 'Close', {
          duration: 3000,
        });
        this.isSubmitting = false;
      },
    });
  }

  updateCommunity(formData: CommunityCreateViewModel): void {
    if (!this.editingCommunity) return;

    this.communityService
      .updateCommunity(this.editingCommunity.id, formData)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Community updated successfully!', 'Close', {
            duration: 2000,
          });
          this.showEditCommunityForm = false;
          this.editingCommunity = null;
          this.communityForm.reset();
          this.loadCommunities();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating community:', error);
          this.snackBar.open('Failed to update community.', 'Close', {
            duration: 3000,
          });
          this.isSubmitting = false;
        },
      });
  }

  deleteCommunity(community: CommunityViewModel): void {
    if (
      confirm(`Delete community "${community.title}"? This cannot be undone.`)
    ) {
      this.communityService.deleteCommunity(community.id).subscribe({
        next: () => {
          this.snackBar.open('Community deleted successfully!', 'Close', {
            duration: 2000,
          });
          this.loadCommunities();
        },
        error: (error) => {
          console.error('Error deleting community:', error);
          this.snackBar.open('Failed to delete community.', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  cancelCommunityForm(): void {
    this.showCreateCommunityForm = false;
    this.showEditCommunityForm = false;
    this.editingCommunity = null;
    this.communityForm.reset();
  }

  // Helper method to convert language code to language ID
  private getLanguageIdFromCode(languageCode: string): number {
    // Simple mapping - you might want to load languages from a service
    switch (languageCode.toLowerCase()) {
      case 'ar':
        return 1; // Arabic
      case 'en':
        return 2; // English
      default:
        return 2; // Default to English
    }
  }

  navigateToCreateEvent(): void {
    this.router.navigate(['/create-event']);
  }

  navigateToCreateCommunity(): void {
    this.router.navigate(['/community-create']);
  }
}
