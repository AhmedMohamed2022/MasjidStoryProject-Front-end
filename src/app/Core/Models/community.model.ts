export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CommunityContentViewModel {
  languageId: number;
  title: string;
  content: string;
}

export interface CommunityViewModel {
  id: number;
  title: string;
  content: string;
  masjidId: number;
  masjidName: string;
  languageCode: string;
  createdByName: string;
  dateCreated: Date;
  isUserMember: boolean;
  memberCount: number;
  comments?: any[];
  isLikedByCurrentUser?: boolean;
  likeCount?: number;
  contents?: CommunityContentViewModel[];
}

export interface CommunityContentCreateViewModel {
  languageId: number;
  title: string;
  content: string;
}

export interface CommunityCreateViewModel {
  masjidId: number;
  contents: CommunityContentCreateViewModel[];
}

export interface LanguageViewModel {
  id: number;
  name: string;
  code: string;
}

// export interface MasjidViewModel {
//   id: number;
//   shortName: string;
//   fullName: string;
//   city: string;
//   country: string;
// }
