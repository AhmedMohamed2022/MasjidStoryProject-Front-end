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
        community.isUserMember = !community.isUserMember;
        community.memberCount += community.isUserMember ? 1 : -1;
      },
      error: (err) => {
        alert(err.message || 'Failed to update membership');
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
}
