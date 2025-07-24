import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommunityService } from '../../Core/Services/community.service';
import { AuthService } from '../../Core/Services/auth.service';
import { CommunityViewModel } from '../../Core/Models/community.model';

@Component({
  selector: 'app-community-list',
  templateUrl: './community-list.component.html',
  styleUrls: ['./community-list.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class CommunityListComponent implements OnInit {
  @Input() masjidId?: number;
  @Input() masjidName: string = '';

  communities: CommunityViewModel[] = [];
  loading = false;
  error = '';
  isAuthenticated = false;
  isFilteredByMasjid = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();

    // Check if masjidId is provided via route parameter
    this.route.params.subscribe((params) => {
      if (params['masjidId']) {
        this.masjidId = +params['masjidId'];
        this.isFilteredByMasjid = true;
      }
    });

    this.translate.onLangChange.subscribe(() => {
      // Optionally, reload communities if API returns language-specific data
      // this.loadCommunities();
    });

    this.loadCommunities();
  }

  loadCommunities() {
    this.loading = true;
    this.error = '';

    if (this.masjidId) {
      // Load communities for specific masjid
      this.communityService.getMasjidCommunities(this.masjidId).subscribe({
        next: (communities) => {
          this.communities = communities;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load communities';
          this.loading = false;
        },
      });
    } else {
      // Load all communities
      this.communityService.getAllCommunities().subscribe({
        next: (communities) => {
          this.communities = communities;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load communities';
          this.loading = false;
        },
      });
    }
  }

  toggleMembership(community: CommunityViewModel) {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    const action$ = community.isUserMember
      ? this.communityService.leaveCommunity(community.id)
      : this.communityService.joinCommunity(community.id);
    action$.subscribe({
      next: () => {
        // Fetch the updated community by ID and update the card
        this.communityService.getCommunityById(community.id).subscribe({
          next: (updatedCommunity) => {
            Object.assign(community, updatedCommunity);
            const key = community.isUserMember
              ? 'COMMUNITY_LIST.MEMBERSHIP_JOIN_SUCCESS'
              : 'COMMUNITY_LIST.MEMBERSHIP_LEAVE_SUCCESS';
            this.translate.get(key).subscribe((text) => {
              alert(text || this.translate.instant('COMMON.SUCCESS_GENERIC'));
            });
          },
          error: () => {
            // Fallback to local update if fetch fails
            community.isUserMember = !community.isUserMember;
            community.memberCount += community.isUserMember ? 1 : -1;
          },
        });
      },
      error: (err) => {
        this.translate
          .get('COMMUNITY_LIST.MEMBERSHIP_UPDATE_FAILED')
          .subscribe((text) => {
            alert(text || this.translate.instant('COMMON.ERROR_GENERIC'));
          });
      },
    });
  }

  viewCommunity(communityId: number) {
    this.router.navigate(['/community-details', communityId]);
  }

  createCommunity() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    const queryParams: any = {};
    if (this.masjidId) {
      queryParams.masjidId = this.masjidId;
    }

    this.router.navigate(['/community/create'], { queryParams });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);

    // Get current language for proper localization
    const currentLang = this.translate.currentLang || 'en';
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getLanguageFlag(languageCode: string): string {
    return languageCode === 'ar' ? 'AR' : 'EN';
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
}
