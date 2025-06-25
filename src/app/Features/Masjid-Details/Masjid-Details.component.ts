// File: src/app/features/masjid-detail/masjid-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MasjidDetailService } from '../../Core/Services/masjid-details.service';
import { MasjidDetailsViewModel } from '../../Core/Models/masjid-details.model';
import { MasjidEventsComponent } from '../masjid-events/masjid-events.component';
import { CommunityListComponent } from '../community-list/community-list.component';

@Component({
  selector: 'app-masjid-detail',
  standalone: true,
  imports: [CommonModule, MasjidEventsComponent, CommunityListComponent],
  templateUrl: './Masjid-Details.component.html',
  styleUrls: ['./Masjid-Details.component.css'],
})
export class MasjidDetailComponent implements OnInit, OnDestroy {
  masjid: MasjidDetailsViewModel | null = null;
  loading = true;
  error = '';
  currentImageIndex = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private masjidService: MasjidDetailService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadMasjidDetails(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMasjidDetails(id: number): void {
    this.loading = true;
    this.error = '';

    this.masjidService
      .getMasjidDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Masjid details loaded:', response.data);
            this.masjid = response.data;
          } else {
            this.error = response.message || 'Failed to load masjid details';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load masjid details. Please try again.';
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

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }

      return date.toLocaleDateString('en-US', {
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
}
