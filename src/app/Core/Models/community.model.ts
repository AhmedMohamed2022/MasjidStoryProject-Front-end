export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
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
}

export interface CommunityCreateViewModel {
  title: string;
  content: string;
  masjidId: number;
  languageId: number;
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
