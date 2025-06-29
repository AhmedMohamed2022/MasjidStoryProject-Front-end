import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CityViewModel } from '../Models/masjid.model';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  // Seeded data matching the backend database
  private readonly seededCities: CityViewModel[] = [
    { id: 1, name: 'Cairo', countryId: 1 },
    { id: 2, name: 'Bagdad', countryId: 2 },
  ];

  constructor() {}

  getAllCities(): Observable<CityViewModel[]> {
    // Return seeded data directly without API call
    return of(this.seededCities);
  }

  getCitiesByCountry(countryId: number): Observable<CityViewModel[]> {
    // Filter cities by country ID
    const cities = this.seededCities.filter(
      (city) => city.countryId === countryId
    );
    return of(cities);
  }

  getCityById(id: number): Observable<CityViewModel | null> {
    const city = this.seededCities.find((c) => c.id === id);
    return of(city || null);
  }
}
