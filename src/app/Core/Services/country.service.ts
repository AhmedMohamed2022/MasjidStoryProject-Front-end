import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CountryViewModel } from '../Models/masjid.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  // Seeded data matching the backend database
  private readonly seededCountries: CountryViewModel[] = [
    { id: 1, name: 'Egypt', code: 'EG' },
    { id: 2, name: 'Iraq', code: 'IR' },
  ];

  constructor() {}

  getAllCountries(): Observable<CountryViewModel[]> {
    // Return seeded data directly without API call
    return of(this.seededCountries);
  }

  getCountryById(id: number): Observable<CountryViewModel | null> {
    const country = this.seededCountries.find((c) => c.id === id);
    return of(country || null);
  }
}
