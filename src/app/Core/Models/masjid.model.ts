export interface CountryViewModel {
  id: number;
  name: string;
  code: string;
}

export interface CityViewModel {
  id: number;
  name: string;
  countryId: number;
}

export interface MediaViewModel {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  masjidId?: number;
  storyId?: number;
  uploadDate: Date;
}

export interface MasjidContentViewModel {
  languageId: number;
  name: string;
  description: string;
}

export interface MasjidViewModel {
  id: number;
  shortName: string;
  address: string;
  archStyle: string;
  latitude?: number;
  longitude?: number;
  countryId: number;
  countryName: string;
  cityId: number;
  cityName: string;
  yearOfEstablishment?: number;
  dateOfRecord: Date;
  mediaItems?: MediaViewModel[];
  contents?: MasjidContentViewModel[];
  localizedName?: string;
}

export interface MasjidCreateViewModel {
  address: string;
  archStyle: string;
  latitude?: number;
  longitude?: number;
  countryId: number;
  cityId: number;
  yearOfEstablishment?: number;
  contents: MasjidContentViewModel[];
}

export interface MasjidEditViewModel extends MasjidCreateViewModel {
  id: number;
}

export function getTranslatedMasjidName(
  contents: MasjidContentViewModel[] | undefined,
  lang: string
): string {
  if (!contents || contents.length === 0) return '';
  const langId = lang === 'ar' ? 2 : 1;
  const found = contents.find((c) => c.languageId === langId);
  return found?.name || contents[0].name;
}
