import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../Models/api-response.model';
import { environment } from '../environments/environment';

export interface LanguageViewModel {
  id: number;
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private apiUrl = `${environment.apiUrl}/api/language`;

  constructor(private http: HttpClient) {}

  getAllLanguages(): Observable<LanguageViewModel[]> {
    return this.http
      .get<ApiResponse<LanguageViewModel[]>>(`${this.apiUrl}/all`)
      .pipe(map((response) => response.data));
  }

  getLanguageById(id: number): Observable<LanguageViewModel> {
    return this.http
      .get<ApiResponse<LanguageViewModel>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }
}
