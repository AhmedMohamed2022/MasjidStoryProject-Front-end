export interface CommentViewModel {
  id: number;
  content: string;
  datePosted: Date;
  userName: string;
  contentId: number;
  contentType: string;
}

export interface CommentCreateViewModel {
  contentId: number;
  contentType: string;
  content: string;
}

export interface CommentEditViewModel {
  id: number;
  content: string;
}
