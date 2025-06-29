import { CommentViewModel } from './comment.model';

export interface EventViewModel {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  masjidName: string;
  masjidId?: number;
  createdByName: string;
  isUserRegistered: boolean;
  comments?: any[];
  isLikedByCurrentUser?: boolean;
  likeCount?: number;
}

export interface EventCreateViewModel {
  title: string;
  description: string;
  eventDate: string;
  masjidId?: number;
  languageId?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
