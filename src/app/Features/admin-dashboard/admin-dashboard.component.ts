import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MapPickerComponent } from '../../Shared/Components/map-picker/map-picker.component';

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
import { environment } from '../../Core/environments/environment';

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
    MapPickerComponent,
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

  // Bulk operations state
  selectedStories: number[] = [];
  allSelected = false;
  someSelected = false;

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
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.masjidForm = this.fb.group({
      shortName: ['', Validators.required],
      address: [''],
      archStyle: [''],
      description: [''],
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
    // Handle query parameters for tab navigation
    this.activatedRoute.queryParams.subscribe((params) => {
      const tabParam = params['tab'];
      if (tabParam) {
        const tabIndex = parseInt(tabParam);
        if (tabIndex >= 0 && tabIndex < this.tabs.length) {
          this.selectedTab = tabIndex;
          this.onTabChange(tabIndex);
        }
      }
    });

    // Load initial data
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
    try {
      await this.storyService.deleteStory(story.id);
      this.snackBar.open('Story deleted successfully', 'Close', {
        duration: 3000,
      });
      this.loadPendingStories();
      this.loadAllStories();
    } catch (error) {
      this.snackBar.open('Failed to delete story', 'Close', {
        duration: 3000,
      });
    }
  }

  // Helper method to parse change reasons
  getChangeReasons(changeReason: string): string[] {
    if (!changeReason) return [];
    return changeReason.split(',').map((reason) => reason.trim());
  }

  // Navigate to story details
  viewStory(story: StoryViewModel) {
    this.router.navigate(['/story-details', story.id]);
  }

  // Bulk operations methods
  toggleStorySelection(storyId: number, event: any) {
    if (event.checked) {
      this.selectedStories.push(storyId);
    } else {
      this.selectedStories = this.selectedStories.filter(
        (id) => id !== storyId
      );
    }
    this.updateSelectionState();
  }

  isStorySelected(storyId: number): boolean {
    return this.selectedStories.includes(storyId);
  }

  toggleAllStories(event: any) {
    if (event.checked) {
      this.selectedStories = this.pendingStories.map((story) => story.id);
    } else {
      this.selectedStories = [];
    }
    this.updateSelectionState();
  }

  updateSelectionState() {
    const totalStories = this.pendingStories.length;
    const selectedCount = this.selectedStories.length;

    this.allSelected = selectedCount === totalStories && totalStories > 0;
    this.someSelected = selectedCount > 0 && selectedCount < totalStories;
  }

  async bulkApproveStories() {
    if (this.selectedStories.length === 0) return;

    if (confirm(`Approve ${this.selectedStories.length} stories?`)) {
      try {
        const promises = this.selectedStories.map((storyId) =>
          this.storyService.approveStory(storyId)
        );
        await Promise.all(promises);

        this.snackBar.open(
          `${this.selectedStories.length} stories approved successfully`,
          'Close',
          {
            duration: 3000,
          }
        );

        this.selectedStories = [];
        this.updateSelectionState();
        this.loadPendingStories();
        this.loadAllStories();
      } catch (error) {
        this.snackBar.open('Failed to approve some stories', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  async bulkDeleteStories() {
    if (this.selectedStories.length === 0) return;

    if (
      confirm(
        `Delete ${this.selectedStories.length} stories? This cannot be undone.`
      )
    ) {
      try {
        const promises = this.selectedStories.map((storyId) =>
          this.storyService.deleteStory(storyId)
        );
        await Promise.all(promises);

        this.snackBar.open(
          `${this.selectedStories.length} stories deleted successfully`,
          'Close',
          {
            duration: 3000,
          }
        );

        this.selectedStories = [];
        this.updateSelectionState();
        this.loadPendingStories();
        this.loadAllStories();
      } catch (error) {
        this.snackBar.open('Failed to delete some stories', 'Close', {
          duration: 3000,
        });
      }
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
    this.countryService.getAllCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        // Fallback to basic countries if API fails
        this.countries = [
          { id: 1, name: 'Egypt', code: 'EG' },
          { id: 2, name: 'Saudi Arabia', code: 'SA' },
          { id: 3, name: 'United Arab Emirates', code: 'AE' },
          { id: 4, name: 'Qatar', code: 'QA' },
          { id: 5, name: 'Kuwait', code: 'KW' },
          { id: 6, name: 'Bahrain', code: 'BH' },
          { id: 7, name: 'Oman', code: 'OM' },
          { id: 8, name: 'Jordan', code: 'JO' },
          { id: 9, name: 'Lebanon', code: 'LB' },
          { id: 10, name: 'Syria', code: 'SY' },
          { id: 11, name: 'Iraq', code: 'IQ' },
          { id: 12, name: 'Yemen', code: 'YE' },
          { id: 13, name: 'Palestine', code: 'PS' },
          { id: 14, name: 'Morocco', code: 'MA' },
          { id: 15, name: 'Algeria', code: 'DZ' },
          { id: 16, name: 'Tunisia', code: 'TN' },
          { id: 17, name: 'Libya', code: 'LY' },
          { id: 18, name: 'Sudan', code: 'SD' },
          { id: 19, name: 'Somalia', code: 'SO' },
          { id: 20, name: 'Djibouti', code: 'DJ' },
          { id: 21, name: 'Comoros', code: 'KM' },
          { id: 22, name: 'Chad', code: 'TD' },
          { id: 23, name: 'Mauritania', code: 'MR' },
        ];
      },
    });
  }

  loadCities(): void {
    const countryId = this.masjidForm.get('countryId')?.value;
    if (countryId) {
      this.cityService.getCitiesByCountry(countryId).subscribe({
        next: (cities) => {
          this.cities = cities;
        },
        error: (error) => {
          console.error('Error loading cities:', error);
          // Fallback to basic cities if API fails
          this.cities = this.getFallbackCities(countryId);
        },
      });
    } else {
      this.cities = [];
    }
  }

  private getFallbackCities(countryId: number): CityViewModel[] {
    const fallbackCities: { [key: number]: CityViewModel[] } = {
      1: [
        // Egypt
        { id: 1, name: 'Cairo', countryId: 1 },
        { id: 2, name: 'Alexandria', countryId: 1 },
        { id: 3, name: 'Giza', countryId: 1 },
        { id: 4, name: 'Sharm El Sheikh', countryId: 1 },
        { id: 5, name: 'Luxor', countryId: 1 },
        { id: 6, name: 'Aswan', countryId: 1 },
        { id: 7, name: 'Hurghada', countryId: 1 },
      ],
      2: [
        // Saudi Arabia
        { id: 8, name: 'Riyadh', countryId: 2 },
        { id: 9, name: 'Jeddah', countryId: 2 },
        { id: 10, name: 'Mecca', countryId: 2 },
        { id: 11, name: 'Medina', countryId: 2 },
        { id: 12, name: 'Dammam', countryId: 2 },
        { id: 13, name: 'Taif', countryId: 2 },
        { id: 14, name: 'Abha', countryId: 2 },
      ],
      3: [
        // UAE
        { id: 15, name: 'Dubai', countryId: 3 },
        { id: 16, name: 'Abu Dhabi', countryId: 3 },
        { id: 17, name: 'Sharjah', countryId: 3 },
        { id: 18, name: 'Ajman', countryId: 3 },
        { id: 19, name: 'Ras Al Khaimah', countryId: 3 },
        { id: 20, name: 'Fujairah', countryId: 3 },
      ],
      4: [
        // Qatar
        { id: 21, name: 'Doha', countryId: 4 },
        { id: 22, name: 'Al Wakrah', countryId: 4 },
        { id: 23, name: 'Al Khor', countryId: 4 },
        { id: 24, name: 'Lusail', countryId: 4 },
      ],
      5: [
        // Kuwait
        { id: 25, name: 'Kuwait City', countryId: 5 },
        { id: 26, name: 'Salmiya', countryId: 5 },
        { id: 27, name: 'Hawally', countryId: 5 },
        { id: 28, name: 'Jahra', countryId: 5 },
      ],
      6: [
        // Bahrain
        { id: 29, name: 'Manama', countryId: 6 },
        { id: 30, name: 'Muharraq', countryId: 6 },
        { id: 31, name: 'Riffa', countryId: 6 },
        { id: 32, name: 'Hamad Town', countryId: 6 },
      ],
      7: [
        // Oman
        { id: 33, name: 'Muscat', countryId: 7 },
        { id: 34, name: 'Salalah', countryId: 7 },
        { id: 35, name: 'Sohar', countryId: 7 },
        { id: 36, name: 'Nizwa', countryId: 7 },
      ],
      8: [
        // Jordan
        { id: 37, name: 'Amman', countryId: 8 },
        { id: 38, name: 'Zarqa', countryId: 8 },
        { id: 39, name: 'Irbid', countryId: 8 },
        { id: 40, name: 'Aqaba', countryId: 8 },
        { id: 41, name: 'Petra', countryId: 8 },
      ],
      9: [
        // Lebanon
        { id: 42, name: 'Beirut', countryId: 9 },
        { id: 43, name: 'Tripoli', countryId: 9 },
        { id: 44, name: 'Sidon', countryId: 9 },
        { id: 45, name: 'Tyre', countryId: 9 },
        { id: 46, name: 'Baalbek', countryId: 9 },
      ],
      10: [
        // Syria
        { id: 47, name: 'Damascus', countryId: 10 },
        { id: 48, name: 'Aleppo', countryId: 10 },
        { id: 49, name: 'Homs', countryId: 10 },
        { id: 50, name: 'Latakia', countryId: 10 },
        { id: 51, name: 'Hama', countryId: 10 },
      ],
      11: [
        // Iraq
        { id: 52, name: 'Baghdad', countryId: 11 },
        { id: 53, name: 'Basra', countryId: 11 },
        { id: 54, name: 'Mosul', countryId: 11 },
        { id: 55, name: 'Erbil', countryId: 11 },
        { id: 56, name: 'Najaf', countryId: 11 },
        { id: 57, name: 'Karbala', countryId: 11 },
        { id: 58, name: 'Samarra', countryId: 11 },
      ],
      12: [
        // Yemen
        { id: 59, name: "Sana'a", countryId: 12 },
        { id: 60, name: 'Aden', countryId: 12 },
        { id: 61, name: 'Taiz', countryId: 12 },
        { id: 62, name: 'Hodeidah', countryId: 12 },
        { id: 63, name: 'Ibb', countryId: 12 },
      ],
      13: [
        // Palestine
        { id: 64, name: 'Jerusalem', countryId: 13 },
        { id: 65, name: 'Gaza', countryId: 13 },
        { id: 66, name: 'Ramallah', countryId: 13 },
        { id: 67, name: 'Bethlehem', countryId: 13 },
        { id: 68, name: 'Hebron', countryId: 13 },
        { id: 69, name: 'Nablus', countryId: 13 },
      ],
      14: [
        // Morocco
        { id: 70, name: 'Casablanca', countryId: 14 },
        { id: 71, name: 'Rabat', countryId: 14 },
        { id: 72, name: 'Fez', countryId: 14 },
        { id: 73, name: 'Marrakech', countryId: 14 },
        { id: 74, name: 'Tangier', countryId: 14 },
        { id: 75, name: 'Agadir', countryId: 14 },
      ],
      15: [
        // Algeria
        { id: 76, name: 'Algiers', countryId: 15 },
        { id: 77, name: 'Oran', countryId: 15 },
        { id: 78, name: 'Constantine', countryId: 15 },
        { id: 79, name: 'Annaba', countryId: 15 },
        { id: 80, name: 'Batna', countryId: 15 },
      ],
      16: [
        // Tunisia
        { id: 81, name: 'Tunis', countryId: 16 },
        { id: 82, name: 'Sfax', countryId: 16 },
        { id: 83, name: 'Sousse', countryId: 16 },
        { id: 84, name: 'Kairouan', countryId: 16 },
        { id: 85, name: 'Gabès', countryId: 16 },
      ],
      17: [
        // Libya
        { id: 86, name: 'Tripoli', countryId: 17 },
        { id: 87, name: 'Benghazi', countryId: 17 },
        { id: 88, name: 'Misrata', countryId: 17 },
        { id: 89, name: 'Tobruk', countryId: 17 },
        { id: 90, name: 'Sabha', countryId: 17 },
      ],
      18: [
        // Sudan
        { id: 91, name: 'Khartoum', countryId: 18 },
        { id: 92, name: 'Omdurman', countryId: 18 },
        { id: 93, name: 'Port Sudan', countryId: 18 },
        { id: 94, name: 'Kassala', countryId: 18 },
        { id: 95, name: 'El Obeid', countryId: 18 },
      ],
      19: [
        // Somalia
        { id: 96, name: 'Mogadishu', countryId: 19 },
        { id: 97, name: 'Hargeisa', countryId: 19 },
        { id: 98, name: 'Bosaso', countryId: 19 },
        { id: 99, name: 'Kismayo', countryId: 19 },
      ],
      20: [
        // Djibouti
        { id: 100, name: 'Djibouti City', countryId: 20 },
        { id: 101, name: 'Ali Sabieh', countryId: 20 },
        { id: 102, name: 'Tadjourah', countryId: 20 },
      ],
      21: [
        // Comoros
        { id: 103, name: 'Moroni', countryId: 21 },
        { id: 104, name: 'Mutsamudu', countryId: 21 },
        { id: 105, name: 'Fomboni', countryId: 21 },
      ],
      22: [
        // Chad
        { id: 106, name: "N'Djamena", countryId: 22 },
        { id: 107, name: 'Moundou', countryId: 22 },
        { id: 108, name: 'Sarh', countryId: 22 },
      ],
      23: [
        // Mauritania
        { id: 109, name: 'Nouakchott', countryId: 23 },
        { id: 110, name: 'Nouadhibou', countryId: 23 },
        { id: 111, name: 'Rosso', countryId: 23 },
      ],
    };

    return fallbackCities[countryId] || [];
  }

  onCountryChange(): void {
    this.loadCities();
  }

  onLocationSelected(location: { lat: number; lng: number }): void {
    this.masjidForm.patchValue({
      latitude: location.lat,
      longitude: location.lng,
    });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      Array.from(files).forEach((file: any) => {
        if (file.size > maxFileSize) {
          invalidFiles.push(`${file.name} (${this.formatFileSize(file.size)})`);
        } else {
          validFiles.push(file);
        }
      });

      this.selectedFiles = validFiles;

      // Show feedback to user
      if (invalidFiles.length > 0) {
        this.snackBar.open(
          `Some files were too large (max 10MB): ${invalidFiles.join(', ')}`,
          'Close',
          { duration: 5000 }
        );
      }

      if (validFiles.length > 0) {
        const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
        this.snackBar.open(
          `${validFiles.length} file(s) selected (${this.formatFileSize(
            totalSize
          )})`,
          'Close',
          { duration: 3000 }
        );
      }
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    // Get the full masjid details including description
    this.masjidService.getMasjidDetails(masjid.id).subscribe({
      next: (response) => {
        this.masjidForm.patchValue({
          shortName: response.localizedName || masjid.shortName,
          address: masjid.address,
          archStyle: masjid.archStyle,
          description: response.localizedDescription || '',
          latitude: masjid.latitude,
          longitude: masjid.longitude,
          countryId: masjid.countryId,
          cityId: masjid.cityId,
          yearOfEstablishment: masjid.yearOfEstablishment,
        });
        this.loadCities();
      },
      error: (error) => {
        console.error('Error loading masjid details:', error);
        // Fallback to basic data if API call fails
        this.masjidForm.patchValue({
          shortName: masjid.shortName,
          address: masjid.address,
          archStyle: masjid.archStyle,
          description: '',
          latitude: masjid.latitude,
          longitude: masjid.longitude,
          countryId: masjid.countryId,
          cityId: masjid.cityId,
          yearOfEstablishment: masjid.yearOfEstablishment,
        });
        this.loadCities();
      },
    });
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
        // Show the detailed response message from backend
        const message =
          response.data || response.message || 'Masjid created successfully!';
        this.snackBar.open(message, 'Close', {
          duration: 5000, // Longer duration to read processing details
        });
        this.showCreateForm = false;
        this.masjidForm.reset();
        this.selectedFiles = [];
        this.loadMasjids();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating masjid:', error);
        const errorMessage = error.error?.message || 'Failed to create masjid.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
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
          // Show the detailed response message from backend
          const message =
            response.data || response.message || 'Masjid updated successfully!';
          this.snackBar.open(message, 'Close', {
            duration: 5000, // Longer duration to read processing details
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
          const errorMessage =
            error.error?.message || 'Failed to update masjid.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
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

  getFullImageUrl(url: string): string {
    if (!url) return 'public/default-story.png';
    if (url.startsWith('http')) return url;
    return environment.apiUrl.replace(/\/$/, '') + url;
  }
}
