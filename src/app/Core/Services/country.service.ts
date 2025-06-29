import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../Models/api-response.model';
import { environment } from '../environments/environment';

export interface CountryViewModel {
  id: number;
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private apiUrl = `${environment.apiUrl}/api/country`;

  constructor(private http: HttpClient) {}

  getAllCountries(): Observable<CountryViewModel[]> {
    return this.http
      .get<ApiResponse<CountryViewModel[]>>(`${this.apiUrl}/all`)
      .pipe(map((response) => response.data));
  }
}
