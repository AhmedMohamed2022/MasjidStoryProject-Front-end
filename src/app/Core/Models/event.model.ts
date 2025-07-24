import { CommentViewModel } from './comment.model';

export interface EventViewModel {
  id: number;
  localizedTitle: string;
  localizedDescription: string;
  eventDate: string;
  masjidName: string;
  masjidId?: number;
  createdByName: string;
  createdById: string;
  isUserRegistered: boolean;
  comments?: any[];
  isLikedByCurrentUser?: boolean;
  likeCount?: number;
  // Optionally keep old fields for compatibility
  title?: string;
  description?: string;
  contents?: EventContentViewModel[];
}

export interface EventCreateViewModel {
  title?: string;
  description?: string;
  eventDate: string;
  masjidId?: number;
  languageId?: number;
  contents?: EventContentViewModel[];
}

export interface EventContentViewModel {
  languageId: number;
  title: string;
  description: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
