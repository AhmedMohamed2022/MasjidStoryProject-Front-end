export interface UserProfile {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  profilePictureUrl: string;
}

export interface UserProfileUpdate {
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  profilePicture?: File | null;
}

export interface StoryProfileItem {
  id: string;
  title: string;
  createdAt: string;
  approved: boolean;
  authorName: string;
}

export interface CommentProfileItem {
  id: string;
  storyTitle: string;
  content: string;
  createdAt: string;
}

export interface EventProfileItem {
  id: string;
  name: string;
  date: string;
}

export interface CommunityProfileItem {
  id: string;
  name: string;
  joinedAt: string;
}
