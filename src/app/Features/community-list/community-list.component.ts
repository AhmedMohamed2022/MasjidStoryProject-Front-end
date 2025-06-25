import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunityService } from '../../Core/Services/community.service';
import { AuthService } from '../../Core/Services/auth.service';
import { CommunityViewModel } from '../../Core/Models/community.model';

@Component({
  selector: 'app-community-list',
  templateUrl: './community-list.component.html',
  styleUrls: ['./community-list.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CommunityListComponent implements OnInit {
  @Input() masjidId!: number;
  @Input() masjidName: string = '';

  communities: CommunityViewModel[] = [];
  loading = false;
  error = '';
  isAuthenticated = false;

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadCommunities();
  }

  loadCommunities() {
    this.loading = true;
    this.error = '';
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
    this.router.navigate(['/community/create'], {
      queryParams: { masjidId: this.masjidId },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getLanguageFlag(languageCode: string): string {
    return languageCode === 'ar' ? 'AR' : 'EN';
  }
}
