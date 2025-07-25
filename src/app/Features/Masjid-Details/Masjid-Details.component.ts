// File: src/app/features/masjid-detail/masjid-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MasjidDetailService } from '../../Core/Services/masjid-details.service';
import { MasjidDetailsViewModel } from '../../Core/Models/masjid-details.model';
import { MasjidEventsComponent } from '../masjid-events/masjid-events.component';
import { CommunityListComponent } from '../community-list/community-list.component';
import { MapPickerComponent } from '../../Shared/Components/map-picker/map-picker.component';
import { MasjidService } from '../../Core/Services/masjid.service';

@Component({
  selector: 'app-masjid-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MasjidEventsComponent,
    CommunityListComponent,
    MapPickerComponent,
  ],
  templateUrl: './Masjid-Details.component.html',
  styleUrls: ['./Masjid-Details.component.css'],
})
export class MasjidDetailComponent implements OnInit, OnDestroy {
  masjid: MasjidDetailsViewModel | null = null;
  loading = true;
  error = '';
  currentImageIndex = 0;
  private destroy$ = new Subject<void>();
  private langSub?: Subscription;
  private masjidId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private masjidService: MasjidDetailService,
    private masjidApiService: MasjidService, // Inject MasjidService
    public translate: TranslateService // make public for template
  ) {}
  // public test() {
  //   console.log('Masjid details loaded:', this.masjid?.stories);
  // }
  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.masjidId = id;
        this.loadMasjidDetails(id);
      }
    });
    // Listen for language changes
    this.langSub = this.translate.onLangChange.subscribe(() => {
      if (this.masjidId) {
        this.loadMasjidDetails(this.masjidId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.langSub) this.langSub.unsubscribe();
  }

  private loadMasjidDetails(id: number): void {
    this.loading = true;
    this.error = '';
    const lang = this.translate.currentLang || 'en';
    this.masjidService
      .getMasjidDetails(id, lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.masjid = response.data;
            // Register the visit
            this.masjidApiService.registerVisit(id).subscribe({
              next: () => {},
              error: (err) => {
                console.error('Error registering visit:', err);
              },
            });
          } else {
            this.translate
              .get('MASJID_DETAILS.ERROR_GENERAL')
              .subscribe((text: string) => {
                this.error = response.message || text;
              });
          }
          this.loading = false;
        },
        error: (err) => {
          this.translate
            .get('MASJID_DETAILS.ERROR_GENERAL')
            .subscribe((text: string) => {
              this.error = text;
            });
          this.loading = false;
          console.error('Error loading masjid details:', err);
        },
      });
  }

  nextImage(): void {
    if (this.masjid && this.masjid.mediaUrls.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.masjid.mediaUrls.length;
    }
  }

  previousImage(): void {
    if (this.masjid && this.masjid.mediaUrls.length > 0) {
      this.currentImageIndex =
        this.currentImageIndex === 0
          ? this.masjid.mediaUrls.length - 1
          : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  navigateToStory(storyId: number): void {
    this.router.navigate(['/story-details', storyId]);
  }

  onStoryKeyPress(event: KeyboardEvent, storyId: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateToStory(storyId);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }

      // Get current language for proper localization
      const currentLang = this.translate.currentLang || 'en';
      const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  getDisplayDescription(): string {
    if (!this.masjid) return '';

    const description = this.masjid.localizedDescription?.trim();

    // If no description or description is just the address, provide a fallback
    if (!description || description === this.masjid.localizedAddress) {
      return this.translate.instant('MASJID_DETAILS.FALLBACK_DESCRIPTION', {
        address: this.masjid.localizedAddress,
      });
    }

    return description;
  }
}
