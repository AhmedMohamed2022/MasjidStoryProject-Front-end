import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../Core/Services/user-profile.service';
import { StoryService } from '../../Core/Services/story-detail.service';
import { CommunityService } from '../../Core/Services/community.service';
import { EventService } from '../../Core/Services/event.service';
import { UserRegistrationService } from '../../Core/Services/user-registration.service';
import {
  UserProfile,
  UserProfileUpdate,
} from '../../Core/Models/user-profile.model';
import {
  StoryViewModel,
  CommentViewModel,
} from '../../Core/Models/story.model';
import { CommunityViewModel } from '../../Core/Models/community.model';
import { EventViewModel } from '../../Core/Models/event.model';
import { environment } from '../../Core/environments/environment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  profile: UserProfile | null = null;
  editMode = false;
  loading = true;
  error: string | null = null;
  updateSuccess: boolean | null = null;

  stories: StoryViewModel[] = [];
  comments: CommentViewModel[] = [];
  events: EventViewModel[] = [];
  communities: CommunityViewModel[] = [];

  // For edit form
  editForm: UserProfileUpdate = {
    firstName: '',
    lastName: '',
    profilePictureUrl: '',
    profilePicture: null,
  };

  imagePreview: string | ArrayBuffer | null = null;

  activeTab: 'stories' | 'comments' | 'events' | 'communities' = 'stories';

  constructor(
    private userProfileService: UserProfileService,
    private storyService: StoryService,
    private communityService: CommunityService,
    private eventService: EventService,
    private userRegistrationService: UserRegistrationService
  ) {
    this.fetchAll();
  }

  getProfileImageUrl(): string {
    if (this.editMode && this.imagePreview) {
      return this.imagePreview as string;
    }
    if (!this.profile?.profilePictureUrl) return 'assets/default-profile.png';
    // Prepend backend URL if not already absolute
    if (this.profile.profilePictureUrl.startsWith('http')) {
      return this.profile.profilePictureUrl;
    }
    return (
      environment.apiUrl.replace(/\/$/, '') + this.profile.profilePictureUrl
    );
  }

  getEditFormImageUrl(): string {
    if (this.imagePreview) {
      return this.imagePreview as string;
    }
    if (this.editForm.profilePictureUrl) {
      if (this.editForm.profilePictureUrl.startsWith('http')) {
        return this.editForm.profilePictureUrl;
      }
      return (
        environment.apiUrl.replace(/\/$/, '') + this.editForm.profilePictureUrl
      );
    }
    return 'assets/default-profile.png';
  }

  fetchAll() {
    this.loading = true;
    this.error = null;
    this.userProfileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        const [firstName, ...rest] = profile.fullName.split(' ');
        this.editForm.firstName = firstName;
        this.editForm.lastName = rest.join(' ');
        this.editForm.profilePictureUrl = profile.profilePictureUrl;
        this.editForm.profilePicture = null;
        this.imagePreview = null;
        this.loading = false;
        this.fetchStoriesAndComments();
        this.fetchEvents();
        this.fetchCommunities();
      },
      error: (err) => {
        this.error = 'Failed to load profile.';
        this.loading = false;
      },
    });
  }

  fetchStoriesAndComments() {
    this.storyService.getAllStories().then((stories) => {
      if (this.profile) {
        this.stories = stories.filter(
          (s) => s.authorFullName === this.profile?.fullName
        );
        // Flatten all comments for this user
        this.comments = stories
          .flatMap((s) =>
            s.comments.map((c) => ({ ...c, storyTitle: s.title }))
          )
          .filter((c) => c.userName === this.profile?.userName);
      }
    });
  }

  fetchEvents() {
    this.eventService.getMyRegistrations().subscribe({
      next: (events) => (this.events = events),
      error: () => {},
    });
  }

  fetchCommunities() {
    this.communityService.getMyCommunities().subscribe({
      next: (communities) => (this.communities = communities),
      error: () => {},
    });
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    this.updateSuccess = null;
    if (this.profile) {
      const [firstName, ...rest] = this.profile.fullName.split(' ');
      this.editForm.firstName = firstName;
      this.editForm.lastName = rest.join(' ');
      this.editForm.profilePictureUrl = this.profile.profilePictureUrl;
      this.editForm.profilePicture = null;
      this.imagePreview = null;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.editForm.profilePicture = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = reader.result);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onUpdateProfile() {
    const formData = new FormData();
    formData.append('FirstName', this.editForm.firstName);
    formData.append('LastName', this.editForm.lastName);
    formData.append('ProfilePictureUrl', this.editForm.profilePictureUrl || '');
    if (this.editForm.profilePicture) {
      formData.append('ProfilePicture', this.editForm.profilePicture);
    }
    this.userProfileService.updateProfile(formData).subscribe({
      next: () => {
        this.updateSuccess = true;
        this.editMode = false;
        this.fetchAll();
      },
      error: () => {
        this.updateSuccess = false;
      },
    });
  }

  setTab(tab: 'stories' | 'comments' | 'events' | 'communities') {
    this.activeTab = tab;
  }
}
