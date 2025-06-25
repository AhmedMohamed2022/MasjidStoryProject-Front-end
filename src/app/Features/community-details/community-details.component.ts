import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityService } from '../../Core/Services/community.service';
import { AuthService } from '../../Core/Services/auth.service';
import { CommunityViewModel } from '../../Core/Models/community.model';

@Component({
  selector: 'app-community-details',
  templateUrl: './community-details.component.html',
  styleUrls: ['./community-details.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CommunityDetailsComponent implements OnInit {
  community: CommunityViewModel | null = null;
  loading = false;
  error = '';
  isAuthenticated = false;
  membershipLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadCommunity();
  }

  loadCommunity() {
    const communityId = this.route.snapshot.paramMap.get('id');
    if (!communityId) {
      this.error = 'Community ID not found';
      return;
    }
    this.loading = true;
    this.error = '';
    this.communityService.getCommunityById(+communityId).subscribe({
      next: (community) => {
        this.community = community;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load community';
        this.loading = false;
      },
    });
  }

  toggleMembership() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.community) return;
    const action$ = this.community.isUserMember
      ? this.communityService.leaveCommunity(this.community.id)
      : this.communityService.joinCommunity(this.community.id);
    this.membershipLoading = true;
    action$.subscribe({
      next: () => {
        if (this.community) {
          this.community.isUserMember = !this.community.isUserMember;
          this.community.memberCount += this.community.isUserMember ? 1 : -1;
        }
        this.membershipLoading = false;
      },
      error: (err) => {
        alert(err.message || 'Failed to update membership');
        this.membershipLoading = false;
      },
    });
  }

  goToMasjid() {
    if (this.community) {
      this.router.navigate(['/masjid', this.community.masjidId]);
    }
  }

  goBack() {
    window.history.back();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getLanguageFlag(languageCode: string): string {
    return languageCode === 'ar' ? 'AR' : 'EN';
  }

  getLanguageName(languageCode: string): string {
    return languageCode === 'ar' ? 'Arabic' : 'English';
  }

  shareCommunity() {
    if (navigator.share) {
      navigator.share({
        title: this.community?.title,
        text: this.community?.content,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }
}
