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

export interface StoryContentViewModel {
  languageId: number;
  title: string;
  content: string;
}

export interface StoryViewModel {
  id: number;
  localizedTitle: string;
  localizedContent: string;
  datePublished: string;
  isApproved: boolean;
  masjidName: string;
  authorFullName: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  comments: CommentViewModel[];
  tags: string[];
  mediaItems: MediaViewModel[];
  imageUrls: string[];
  changeReason?: string;
  contents: StoryContentViewModel[];
}

export interface MediaViewModel {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  masjidId?: number;
  storyId?: number;
  uploadDate: string;
}

export interface CommentViewModel {
  id: number;
  content: string;
  datePosted: string;
  userName: string;
  contentId: number;
  contentType: string;
}

export interface CommentCreateViewModel {
  contentId: number;
  contentType: string; // "Story", "Event", "Community"
  content: string;
}

export interface LikeCreateViewModel {
  contentId: number;
  contentType: string; // "Story", "Event", "Community"
}

export interface StoryCreateViewModel {
  masjidId: number;
  contents: StoryContentViewModel[];
  tags: string[];
  storyImages: File[];
}

export interface StoryEditViewModel {
  id: number;
  masjidId: number;
  contents: StoryContentViewModel[];
  isApproved: boolean;
  newStoryImages?: File[];
  keepMediaIds?: number[];
  removeMediaIds?: number[];
  originalTitle?: string;
  originalContent?: string;
  requiresReapproval?: boolean;
  changeReason?: string;
}
