export interface MasjidViewModel {
  id: number;
  shortName: string;
  address: string;
  archStyle: string;
  latitude?: number;
  longitude?: number;
  countryName: string;
  cityName: string;
  yearOfEstablishment?: number;
  dateOfRecord: Date;
}
