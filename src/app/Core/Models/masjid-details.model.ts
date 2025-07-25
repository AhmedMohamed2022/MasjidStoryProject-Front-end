export interface MasjidDetailsViewModel {
  id: number;
  shortName: string;
  archStyle: string;
  latitude?: number;
  longitude?: number;
  yearOfEstablishment?: number;
  countryName: string;
  cityName: string;
  localizedName: string;
  localizedDescription: string;
  localizedAddress?: string;
  mediaUrls: string[];
  stories: StorySummaryViewModel[];
  totalVisits: number;
  upcomingEventCount: number;
}

export interface StorySummaryViewModel {
  id: number;
  title: string;
  authorName: string;
  datePublished: string;
  summary: string;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
}
