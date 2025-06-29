import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommunityService } from '../../Core/Services/community.service';
import { AuthService } from '../../Core/Services/auth.service';
import { CommunityViewModel } from '../../Core/Models/community.model';

@Component({
  selector: 'app-my-communities',
  templateUrl: './my-communities.component.html',
  styleUrls: ['./my-communities.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class MyCommunitiesComponent implements OnInit {
  communities: CommunityViewModel[] = [];
  loading = false;
  error = '';
  currentUser: any;

  constructor(
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
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
        this.error = error.message || 'Failed to load your communities.';
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
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getMemberCountText(memberCount: number): string {
    if (memberCount === 0) return 'No members';
    if (memberCount === 1) return '1 member';
    return `${memberCount} members`;
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
}
