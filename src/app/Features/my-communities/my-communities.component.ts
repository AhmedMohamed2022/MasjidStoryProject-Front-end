import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommunityService } from '../../Core/Services/community.service';
import { AuthService } from '../../Core/Services/auth.service';
import { CommunityViewModel } from '../../Core/Models/community.model';

@Component({
  selector: 'app-my-communities',
  templateUrl: './my-communities.component.html',
  styleUrls: ['./my-communities.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class MyCommunitiesComponent implements OnInit {
  communities: CommunityViewModel[] = [];
  loading = false;
  error = '';
  currentUser: any;

  constructor(
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      // Optionally, reload communities if API returns language-specific data
      // this.loadMyCommunities();
    });
    this.loadMyCommunities();
  }

  loadMyCommunities(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = '';

    this.communityService.getMyCommunities().subscribe({
      next: (response) => {
        this.communities = response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading my communities:', error);
        this.translate.get('MY_COMMUNITIES.ERROR').subscribe((text: string) => {
          this.error = error.message || text;
        });
        this.loading = false;
      },
    });
  }

  navigateToCommunity(communityId: number): void {
    this.router.navigate(['/community-details', communityId]);
  }

  navigateToCreateCommunity(): void {
    this.router.navigate(['/community/create']);
  }

  navigateToAllCommunities(): void {
    this.router.navigate(['/communities']);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getMemberCountText(memberCount: number): string {
    if (memberCount === 0)
      return this.translate.instant('MY_COMMUNITIES.NO_MEMBERS');
    if (memberCount === 1)
      return this.translate.instant('MY_COMMUNITIES.ONE_MEMBER');
    return this.translate.instant('MY_COMMUNITIES.MEMBERS', {
      count: memberCount,
    });
  }

  getLanguageDisplayName(languageCode: string): string {
    const languageMap: { [key: string]: string } = {
      en: 'English',
      ar: 'العربية',
      fr: 'Français',
      es: 'Español',
      de: 'Deutsch',
      tr: 'Türkçe',
      ur: 'اردو',
      bn: 'বাংলা',
      id: 'Bahasa Indonesia',
      ms: 'Bahasa Melayu',
    };
    return languageMap[languageCode] || languageCode.toUpperCase();
  }

  refreshCommunities(): void {
    this.loadMyCommunities();
  }

  getTranslatedField(
    community: CommunityViewModel,
    field: 'title' | 'content'
  ): string {
    const langCode = this.translate.currentLang || 'en';
    let translation = community.contents?.find((c) =>
      langCode === 'ar' ? c.languageId === 2 : c.languageId === 1
    );
    if (!translation && community.contents && community.contents.length > 0) {
      translation = community.contents[0];
    }
    return translation?.[field] || (community as any)[field] || '';
  }
}
