import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StoryViewModel } from '../../Core/Models/story.model';
import { StoryService } from '../../Core/Services/story-detail.service';
import { environment } from '../../Core/environments/environment';
import { PaginatedResponse } from '../../Core/Models/paginated-response.model';

@Component({
  selector: 'app-stories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './stories-list.component.html',
  styleUrls: ['./stories-list.component.css'],
})
export class StoriesListComponent implements OnInit {
  private storyService = inject(StoryService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  stories: StoryViewModel[] = [];
  loading = true;
  error = '';
  paginationText = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 3;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  ngOnInit(): void {
    this.loadStories();
    this.updatePaginationText();

    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updatePaginationText();
    });
  }

  async loadStories(page: number = 1): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      const response: PaginatedResponse<StoryViewModel> =
        await this.storyService.getStoriesPaginated(page, this.pageSize);

      this.stories = response.items;
      this.currentPage = response.pageNumber;
      this.totalCount = response.totalCount;
      this.totalPages = response.totalPages;
      this.hasPreviousPage = response.hasPreviousPage;
      this.hasNextPage = response.hasNextPage;

      this.updatePaginationText();
    } catch (error) {
      this.translate.get('STORIES_LIST_ERROR').subscribe((text: string) => {
        this.error = text;
      });
      console.error('Error loading stories:', error);
    } finally {
      this.loading = false;
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadStories(page);
    }
  }

  navigateToStory(id: number): void {
    this.router.navigate(['/story-details', id]);
  }

  getStoryExcerpt(content: string): string {
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  formatDate(date: string): string {
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  refreshStories(): void {
    this.loadStories(this.currentPage);
  }

  trackByStoryId(index: number, story: StoryViewModel): number {
    return story.id;
  }

  getFullImageUrl(url: string): string {
    if (!url) return 'assets/default-story.png';
    if (url.startsWith('http')) return url;
    return environment.apiUrl.replace(/\/$/, '') + url;
  }

  // Math property for template access
  get Math() {
    return Math;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a window of pages around current page
      let start = Math.max(
        1,
        this.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Pagination display getters for template
  get showingStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  get showingTotal(): number {
    return this.totalCount;
  }

  get paginationParams(): { start: number; end: number; total: number } {
    return {
      start: this.showingStart,
      end: this.showingEnd,
      total: this.showingTotal,
    };
  }

  get currentPaginationText(): string {
    return this.paginationText;
  }

  updatePaginationText(): void {
    const params = this.paginationParams;

    this.translate.get('STORIES_LIST_SHOWING').subscribe((rawText: string) => {
      // Manual interpolation since translate.get with params is not working
      let interpolatedText = rawText;
      interpolatedText = interpolatedText.replace(
        '{start}',
        params.start.toString()
      );
      interpolatedText = interpolatedText.replace(
        '{end}',
        params.end.toString()
      );
      interpolatedText = interpolatedText.replace(
        '{total}',
        params.total.toString()
      );

      this.paginationText = interpolatedText;
    });
  }
}
