import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../Models/api-response.model';
import { environment } from '../environments/environment';

export interface CityViewModel {
  id: number;
  name: string;
  countryId: number;
  countryName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private apiUrl = `${environment.apiUrl}/api/city`;

  constructor(private http: HttpClient) {}

  getAllCities(): Observable<CityViewModel[]> {
    return this.http
      .get<ApiResponse<CityViewModel[]>>(`${this.apiUrl}/all`)
      .pipe(map((response) => response.data));
  }

  getCitiesByCountry(countryId: number): Observable<CityViewModel[]> {
    return this.http
      .get<ApiResponse<CityViewModel[]>>(
        `${this.apiUrl}/bycountry/${countryId}`
      )
      .pipe(map((response) => response.data));
  }
}
