import {
  Component,
  OnInit,
  AfterViewInit,
  Renderer2,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
  ValidatorFn,
  FormControl,
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
  MasjidContentViewModel,
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Custom validator: at least one name must be filled
function atLeastOneNameValidator(): ValidatorFn {
  return (formArray: AbstractControl) => {
    const arr = formArray as FormArray;
    const hasName = arr.controls.some(
      (group: AbstractControl) =>
        group.get('name')?.value && group.get('name')?.value.trim() !== ''
    );
    return hasName ? null : { atLeastOneName: true };
  };
}

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
    TranslateModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  // Tab management
  selectedTab = 0;
  tabs = [
    { label: 'ADMIN_DASHBOARD.TAB_PENDING_STORIES', icon: 'hourglass_empty' },
    { label: 'ADMIN_DASHBOARD.TAB_ALL_STORIES', icon: 'library_books' },
    { label: 'ADMIN_DASHBOARD.TAB_MASJIDS', icon: 'mosque' },
    { label: 'ADMIN_DASHBOARD.TAB_EVENTS', icon: 'event' },
    { label: 'ADMIN_DASHBOARD.TAB_COMMUNITIES', icon: 'groups' },
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
  languages = [
    { id: 1, code: 'en', name: 'English' },
    { id: 2, code: 'ar', name: 'Arabic' },
  ];

  get communityContents(): FormArray {
    return this.communityForm.get('contents') as FormArray;
  }

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

  // Add a getter for the contents FormArray
  get contentsArray(): FormArray {
    return this.masjidForm.get('contents') as FormArray;
  }

  // Add a getter for the event contents FormArray
  get eventContents(): FormArray {
    return this.eventForm.get('contents') as FormArray;
  }

  displayedColumns: string[] = ['title', 'author', 'date', 'actions'];

  @ViewChildren('animatedNumber', { read: ElementRef })
  animatedNumbers!: QueryList<ElementRef>;

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
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.masjidForm = this.fb.group({
      contents: this.fb.array(
        [
          this.fb.group({ languageId: 1, name: '', description: '' }), // English
          this.fb.group({ languageId: 2, name: '', description: '' }), // Arabic
        ],
        { validators: atLeastOneNameValidator() }
      ),
      address: [''],
      archStyle: [''],
      latitude: [null],
      longitude: [null],
      countryId: [null, Validators.required],
      cityId: [null, Validators.required],
      yearOfEstablishment: [null],
    });

    this.eventForm = this.fb.group({
      eventDate: ['', Validators.required],
      masjidId: [null],
      contents: this.fb.array([]),
    });
    this.initEventContents();

    this.communityForm = this.fb.group({
      masjidId: [null, Validators.required],
      contents: this.fb.array([]),
    });
    this.initCommunityContents();
  }

  initCommunityContents(): void {
    const contentsArray = this.communityForm.get('contents') as FormArray;
    contentsArray.clear();
    this.languages.forEach((lang) => {
      contentsArray.push(
        this.fb.group({
          languageId: [lang.id, Validators.required],
          title: [
            '',
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(200),
            ],
          ],
          content: [
            '',
            [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(2000),
            ],
          ],
        })
      );
    });
  }

  initEventContents(): void {
    const contentsArray = this.eventForm.get('contents') as FormArray;
    contentsArray.clear();
    this.languages.forEach((lang) => {
      contentsArray.push(
        this.fb.group({
          languageId: [lang.id, Validators.required],
          title: ['', Validators.required],
          description: ['', Validators.required],
        })
      );
    });
  }

  ngAfterViewInit(): void {
    this.animateAllNumbers();
  }

  ngOnInit(): void {
    // Handle query parameters for tab navigation
    this.activatedRoute.queryParams.subscribe((params) => {
      const tabParam = params['tab'];
      if (tabParam) {
        const tabIndex = parseInt(tabParam);
        if (tabIndex >= 0 && tabIndex < this.tabs.length) {
          this.selectedTab = tabIndex;
        }
      }
    });

    // Load all statistics and data for dashboard
    this.loadAllDashboardStats();
    this.translate.onLangChange.subscribe(() => {
      this.loadAllDashboardStats();
      if (this.showCreateForm || this.showEditForm) {
        this.loadCountries();
        this.loadCities();
      }
    });
  }

  loadAllDashboardStats() {
    this.loadPendingStories(true);
    this.loadAllStories(true);
    this.loadMasjids(true);
    this.loadEvents();
    this.loadCommunities();
  }

  animateAllNumbers() {
    setTimeout(() => {
      this.animatedNumbers?.forEach((el) => {
        const target = +el.nativeElement.getAttribute('data-target');
        this.animateNumber(el.nativeElement, target);
      });
    }, 100);
  }

  animateNumber(element: HTMLElement, target: number) {
    let start = 0;
    const duration = 700;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      element.textContent = value.toString();
      if (progress < 1) {
        requestAnimationFrame((t) => step(t, startTime));
      } else {
        element.textContent = target.toString();
      }
    };
    requestAnimationFrame((t) => step(t, t));
  }

  onTabChange(index: number) {
    this.selectedTab = index;
    // No need to reload stats here, as all are loaded in ngOnInit and on language change
  }

  // Stories methods
  async loadPendingStories(animate = false) {
    this.pendingLoading = true;
    this.pendingError = '';
    try {
      this.pendingStories = await this.storyService.getPendingStories(
        this.translate.currentLang
      );
      if (animate) this.animateAllNumbers();
    } catch (err) {
      this.pendingError = 'Failed to load pending stories.';
    } finally {
      this.pendingLoading = false;
    }
  }

  async loadAllStories(animate = false) {
    this.allStoriesLoading = true;
    this.allStoriesError = '';
    try {
      this.allStories = await this.storyService.getAllStories(
        this.translate.currentLang
      );
      if (animate) this.animateAllNumbers();
    } catch (err) {
      this.allStoriesError = 'Failed to load all stories.';
    } finally {
      this.allStoriesLoading = false;
    }
  }

  async approveStory(story: StoryViewModel) {
    if (
      !this.translate.instant('ADMIN_DASHBOARD.STORIES_APPROVE_CONFIRM', {
        title: story.localizedTitle,
      })
    )
      return;
    try {
      await this.storyService.approveStory(story.id);
      this.snackBar.open(
        this.translate.instant('ADMIN_DASHBOARD.STORY_APPROVED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 2000 }
      );
      if (this.selectedTab === 0) this.loadPendingStories();
      if (this.selectedTab === 1) this.loadAllStories();
    } catch (err) {
      this.snackBar.open(
        this.translate.instant('ADMIN_DASHBOARD.STORY_APPROVE_FAILED'),
        this.translate.instant('COMMON.CLOSE'),
        {
          duration: 3000,
        }
      );
    }
  }

  async deleteStory(story: StoryViewModel) {
    try {
      await this.storyService.deleteStory(story.id);
      this.snackBar.open(
        this.translate.instant('ADMIN_DASHBOARD.STORY_DELETED'),
        this.translate.instant('COMMON.CLOSE'),
        {
          duration: 3000,
        }
      );
      this.loadPendingStories();
      this.loadAllStories();
    } catch (error) {
      this.snackBar.open(
        this.translate.instant('ADMIN_DASHBOARD.STORY_DELETE_FAILED'),
        this.translate.instant('COMMON.CLOSE'),
        {
          duration: 3000,
        }
      );
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

    if (
      confirm(
        this.translate.instant('ADMIN_DASHBOARD.STORIES_BULK_APPROVE_CONFIRM', {
          count: this.selectedStories.length,
        })
      )
    ) {
      try {
        const promises = this.selectedStories.map((storyId) =>
          this.storyService.approveStory(storyId)
        );
        await Promise.all(promises);

        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.STORIES_BULK_APPROVED', {
            count: this.selectedStories.length,
          }),
          this.translate.instant('COMMON.CLOSE'),
          {
            duration: 3000,
          }
        );

        this.selectedStories = [];
        this.updateSelectionState();
        this.loadPendingStories();
        this.loadAllStories();
      } catch (error) {
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.STORIES_BULK_APPROVE_FAILED'),
          this.translate.instant('COMMON.CLOSE'),
          {
            duration: 3000,
          }
        );
      }
    }
  }

  async bulkDeleteStories() {
    if (this.selectedStories.length === 0) return;

    if (
      confirm(
        this.translate.instant('ADMIN_DASHBOARD.STORIES_BULK_DELETE_CONFIRM', {
          count: this.selectedStories.length,
        })
      )
    ) {
      try {
        const promises = this.selectedStories.map((storyId) =>
          this.storyService.deleteStory(storyId)
        );
        await Promise.all(promises);

        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.STORIES_BULK_DELETED', {
            count: this.selectedStories.length,
          }),
          this.translate.instant('COMMON.CLOSE'),
          {
            duration: 3000,
          }
        );

        this.selectedStories = [];
        this.updateSelectionState();
        this.loadPendingStories();
        this.loadAllStories();
      } catch (error) {
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.STORIES_BULK_DELETE_FAILED'),
          this.translate.instant('COMMON.CLOSE'),
          {
            duration: 3000,
          }
        );
      }
    }
  }

  // Masjids methods
  async loadMasjids(animate = false) {
    this.masjidsLoading = true;
    this.masjidsError = '';
    try {
      this.masjids =
        (await this.masjidService
          .getAllMasjids(this.translate.currentLang)
          .toPromise()) || [];
      if (animate) this.animateAllNumbers();
    } catch (err) {
      this.masjidsError = 'Failed to load masjids.';
    } finally {
      this.masjidsLoading = false;
    }
  }

  loadCountries(): void {
    this.countryService.getAllCountries(this.translate.currentLang).subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (error) => {
        this.countries = [];
      },
    });
  }

  loadCities(): void {
    const countryId = this.masjidForm.get('countryId')?.value;
    if (countryId) {
      this.cityService
        .getCitiesByCountry(countryId, this.translate.currentLang)
        .subscribe({
          next: (cities) => {
            this.cities = cities;
          },
          error: (error) => {
            console.error('Error loading cities:', error);
            this.cities = [];
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
          this.translate.instant('ADMIN_DASHBOARD.FILE_TOO_LARGE', {
            files: invalidFiles.join(', '),
          }),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 5000 }
        );
      }

      if (validFiles.length > 0) {
        const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.FILES_SELECTED', {
            count: validFiles.length,
            size: this.formatFileSize(totalSize),
          }),
          this.translate.instant('COMMON.CLOSE'),
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
    this.masjidForm.setControl(
      'contents',
      this.fb.array(
        [
          this.fb.group({ languageId: 1, name: '', description: '' }),
          this.fb.group({ languageId: 2, name: '', description: '' }),
        ],
        { validators: atLeastOneNameValidator() }
      )
    );
    this.selectedFiles = [];
    this.loadCountries(); // Ensure countries are loaded when form is shown
  }

  showEditMasjidForm(masjid: MasjidViewModel): void {
    this.editingMasjid = masjid;
    this.showEditForm = true;
    this.showCreateForm = false;
    this.selectedFiles = [];
    this.selectedMediaToDelete = [];
    // Patch per-language fields
    const contents = masjid.contents || [];
    const en = contents.find((c) => c.languageId === 1) || {
      languageId: 1,
      name: '',
      description: '',
    };
    const ar = contents.find((c) => c.languageId === 2) || {
      languageId: 2,
      name: '',
      description: '',
    };
    this.masjidForm.patchValue({
      contents: [en, ar],
      address: masjid.address,
      archStyle: masjid.archStyle,
      latitude: masjid.latitude,
      longitude: masjid.longitude,
      countryId: masjid.countryId,
      cityId: masjid.cityId,
      yearOfEstablishment: masjid.yearOfEstablishment,
    });
    this.loadCountries(); // Ensure countries are loaded when editing
    this.loadCities();
  }

  onSubmit(): void {
    if (this.masjidForm.valid) {
      this.isSubmitting = true;
      const formData = this.masjidForm.value;
      // Prepare contents array for backend
      formData.contents = formData.contents.map((c: any) => ({
        languageId: c.languageId,
        name: c.name,
        description: c.description,
      }));
      if (this.showCreateForm) {
        this.createMasjid(formData);
      } else if (this.showEditForm) {
        this.updateMasjid(formData);
      }
    } else {
      this.masjidForm.get('contents')?.markAsTouched();
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
        this.masjidForm.setControl(
          'contents',
          this.fb.array(
            [
              this.fb.group({ languageId: 1, name: '', description: '' }),
              this.fb.group({ languageId: 2, name: '', description: '' }),
            ],
            { validators: atLeastOneNameValidator() }
          )
        );
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
          this.masjidForm.setControl(
            'contents',
            this.fb.array(
              [
                this.fb.group({ languageId: 1, name: '', description: '' }),
                this.fb.group({ languageId: 2, name: '', description: '' }),
              ],
              { validators: atLeastOneNameValidator() }
            )
          );
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
      confirm(
        this.translate.instant('ADMIN_DASHBOARD.MASJID_DELETE_CONFIRM', {
          name: masjid.shortName,
        })
      )
    ) {
      this.masjidService.deleteMasjid(masjid.id).subscribe({
        next: () => {
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.MASJID_DELETED'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 2000,
            }
          );
          this.loadMasjids();
        },
        error: (error) => {
          console.error('Error deleting masjid:', error);
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.MASJID_DELETE_FAILED'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 3000,
            }
          );
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
    this.masjidForm.setControl(
      'contents',
      this.fb.array(
        [
          this.fb.group({ languageId: 1, name: '', description: '' }),
          this.fb.group({ languageId: 2, name: '', description: '' }),
        ],
        { validators: atLeastOneNameValidator() }
      )
    );
    this.selectedFiles = [];
    this.selectedMediaToDelete = [];
  }

  // Events methods
  async loadEvents() {
    this.eventsLoading = true;
    this.eventsError = '';
    try {
      this.eventService
        .getUpcomingEvents(this.translate.currentLang)
        .subscribe({
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

  // Patch for create
  openCreateEventForm(): void {
    this.showCreateEventForm = true;
    this.showEditEventForm = false;
    this.eventForm.reset();
    this.initEventContents();
  }

  // Patch event form for editing
  openEditEventForm(event: EventViewModel): void {
    this.editingEvent = event;
    this.showEditEventForm = true;
    this.showCreateEventForm = false;

    // Patch date/time
    const eventDateTime = new Date(event.eventDate);
    const eventDateLocal = eventDateTime.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

    this.eventForm.patchValue({
      eventDate: eventDateLocal,
      masjidId: event.masjidId,
    });
    this.patchEventContentsArray(event.contents || [], event);
  }

  // Patch multilingual contents
  patchEventContentsArray(contents: any[], event: EventViewModel): void {
    const contentsArray = this.eventForm.get('contents') as FormArray;
    contentsArray.clear();
    this.languages.forEach((lang) => {
      let existing = contents.find((c: any) => c.languageId === lang.id);
      // Fallback for legacy events: use localizedTitle/Description for English if no contents
      if (!existing && lang.code === 'en' && event) {
        existing = {
          languageId: lang.id,
          title: event.localizedTitle || '',
          description: event.localizedDescription || '',
        };
      }
      if (!existing) {
        existing = {
          languageId: lang.id,
          title: '',
          description: '',
        };
      }
      contentsArray.push(
        this.fb.group({
          languageId: [lang.id, Validators.required],
          title: [existing.title, Validators.required],
          description: [existing.description, Validators.required],
        })
      );
    });
  }

  // Submission logic for multilingual event
  onSubmitEvent(): void {
    if (this.eventForm.valid) {
      this.isSubmitting = true;
      const formValue = this.eventForm.value;
      const eventData: EventCreateViewModel = {
        eventDate: new Date(formValue.eventDate).toISOString(),
        masjidId: formValue.masjidId,
        contents: formValue.contents,
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
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.EVENT_CREATED'),
          this.translate.instant('COMMON.CLOSE'),
          {
            duration: 2000,
          }
        );
        this.showCreateEventForm = false;
        this.eventForm.reset();
        this.loadEvents();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.EVENT_CREATE_FAILED'),
          this.translate.instant('COMMON.CLOSE'),
          {
            duration: 3000,
          }
        );
        this.isSubmitting = false;
      },
    });
  }

  updateEvent(formData: EventCreateViewModel): void {
    if (!this.editingEvent) return;

    this.eventService.updateEvent(this.editingEvent.id, formData).subscribe({
      next: (response) => {
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.EVENT_UPDATED'),
          this.translate.instant('COMMON.CLOSE'),
          {
            duration: 2000,
          }
        );
        this.showEditEventForm = false;
        this.editingEvent = null;
        this.eventForm.reset();
        this.loadEvents();
        this.isSubmitting = false;
      },
      error: (error) => {
        if (error.status === 403) {
          this.snackBar.open(
            'You do not have permission to edit this event. Only the creator or an admin can edit events.',
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000 }
          );
        } else {
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.EVENT_UPDATE_FAILED'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000 }
          );
        }
        this.isSubmitting = false;
      },
    });
  }

  deleteEvent(event: EventViewModel): void {
    if (
      confirm(
        this.translate.instant('ADMIN_DASHBOARD.EVENT_DELETE_CONFIRM', {
          title: event.title,
        })
      )
    ) {
      this.eventService.deleteEvent(event.id).subscribe({
        next: () => {
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.EVENT_DELETED'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 2000,
            }
          );
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.EVENT_DELETE_FAILED'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 3000,
            }
          );
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
          communities.forEach((community, idx) => {
            if (!community.contents) {
              console.warn(
                `Community at index ${idx} is missing contents`,
                community
              );
            }
            if (!community.comments) {
              console.warn(
                `Community at index ${idx} is missing comments`,
                community
              );
              community.comments = [];
            }
            // Defensive: set content for display
            const langCode = this.translate.currentLang || 'en';
            let translation = community.contents?.find((c) =>
              langCode === 'ar' ? c.languageId === 2 : c.languageId === 1
            );
            if (
              !translation &&
              community.contents &&
              community.contents.length > 0
            ) {
              translation = community.contents[0];
            }
            community.content = translation?.content || '';
          });
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
    this.initCommunityContents();
  }

  openEditCommunityForm(community: CommunityViewModel): void {
    this.editingCommunity = community;
    this.showEditCommunityForm = true;
    this.showCreateCommunityForm = false;

    // Patch per-language fields
    const contents = (community as any).contents || [];
    const en = contents.find((c: any) => c.languageId === 1) || {
      languageId: 1,
      title: '',
      content: '',
    };
    const ar = contents.find((c: any) => c.languageId === 2) || {
      languageId: 2,
      title: '',
      content: '',
    };
    this.communityForm.patchValue({
      masjidId: community.masjidId,
      contents: [en, ar],
    });
  }

  onSubmitCommunity(): void {
    if (this.communityForm.valid) {
      this.isSubmitting = true;
      const formData = this.communityForm.value;
      const communityData: CommunityCreateViewModel = {
        masjidId: formData.masjidId,
        contents: formData.contents.map((c: any) => ({
          languageId: c.languageId,
          title: c.title?.trim(),
          content: c.content?.trim(),
        })),
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
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.COMMUNITY_CREATED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 2000 }
        );
        this.showCreateCommunityForm = false;
        this.communityForm.reset();
        this.initCommunityContents();
        this.loadCommunities();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating community:', error);
        this.snackBar.open(
          this.translate.instant('ADMIN_DASHBOARD.COMMUNITY_CREATE_FAILED'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000 }
        );
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
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.COMMUNITY_UPDATED'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 2000 }
          );
          this.showEditCommunityForm = false;
          this.editingCommunity = null;
          this.communityForm.reset();
          this.initCommunityContents();
          this.loadCommunities();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating community:', error);
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.COMMUNITY_UPDATE_FAILED'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000 }
          );
          this.isSubmitting = false;
        },
      });
  }

  deleteCommunity(community: CommunityViewModel): void {
    if (
      confirm(
        this.translate.instant('ADMIN_DASHBOARD.COMMUNITY_DELETE_CONFIRM', {
          name: community.title,
        })
      )
    ) {
      this.communityService.deleteCommunity(community.id).subscribe({
        next: () => {
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.COMMUNITY_DELETED'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 2000,
            }
          );
          this.loadCommunities();
        },
        error: (error) => {
          console.error('Error deleting community:', error);
          this.snackBar.open(
            this.translate.instant('ADMIN_DASHBOARD.COMMUNITY_DELETE_FAILED'),
            this.translate.instant('COMMON.CLOSE'),
            {
              duration: 3000,
            }
          );
        },
      });
    }
  }

  cancelCommunityForm(): void {
    this.showCreateCommunityForm = false;
    this.showEditCommunityForm = false;
    this.editingCommunity = null;
    this.communityForm.reset();
    this.initCommunityContents();
  }

  // Helper method to convert language code to language ID
  private getLanguageIdFromCode(languageCode: string): number {
    switch (languageCode.toLowerCase()) {
      case 'ar':
        return 2; // Arabic
      case 'en':
        return 1; // English
      default:
        return 1; // Default to English
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

  asFormControl(ctrl: AbstractControl | null): FormControl {
    return ctrl as FormControl;
  }

  getCommunityLanguageCode(community: CommunityViewModel): string {
    const langCode = this.translate.currentLang || 'en';
    let translation = community.contents?.find((c) =>
      langCode === 'ar' ? c.languageId === 2 : c.languageId === 1
    );
    if (!translation && community.contents && community.contents.length > 0) {
      translation = community.contents[0];
    }
    if (translation?.languageId === 2) return 'ar';
    return 'en';
  }

  getLanguageFlag(languageCode: string): string {
    return languageCode === 'ar' ? 'AR' : 'EN';
  }

  getMasjidName(masjid: any): string {
    const lang = this.translate.currentLang || 'en';
    const content = masjid.contents?.find((c: any) =>
      lang === 'ar' ? c.languageId === 2 : c.languageId === 1
    );
    return content?.name || masjid.localizedName || 'Unnamed Masjid';
  }
}
