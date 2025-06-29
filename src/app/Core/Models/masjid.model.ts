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
}

export interface MasjidCreateViewModel {
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
}

export interface MasjidEditViewModel extends MasjidCreateViewModel {
  id: number;
}
