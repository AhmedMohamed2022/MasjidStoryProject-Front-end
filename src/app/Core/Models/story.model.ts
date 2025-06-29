// export interface StoryViewModel {
//   id: number;
//   title: string;
//   content: string;
//   datePublished: Date;
//   isApproved: boolean;
//   masjidName: string;
//   authorFullName: string;
//   languageCode: string;
//   likeCount: number;
//   isLikedByCurrentUser: boolean;
//   comments: CommentViewModel[];
// }
// export interface CommentViewModel {
//   id: number;
//   content: string;
//   dateCreated: Date;
//   authorFullName: string;
// }
// src/app/core/models/story.models.ts

export interface StoryViewModel {
  id: number;
  title: string;
  content: string;
  datePublished: string;
  isApproved: boolean;
  masjidName: string;
  authorFullName: string;
  languageCode: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  comments: CommentViewModel[];
  tags: string[];
  imageUrls: string[];
}

export interface CommentViewModel {
  id: number;
  content: string;
  datePosted: string;
  userName: string;
  storyId: number;
}

export interface CommentCreateViewModel {
  storyId: number;
  content: string;
}

export interface LikeCreateViewModel {
  storyId: number;
}

export interface StoryCreateViewModel {
  title: string;
  content: string;
  tags: string[];
  storyImages: File[];
  masjidId?: number;
  languageId?: number;
}
