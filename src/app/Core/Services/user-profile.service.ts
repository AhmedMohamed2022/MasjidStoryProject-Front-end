import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ApiResponse } from '../Models/api-response.model';
import { UserProfile } from '../Models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http
      .get<ApiResponse<UserProfile>>(`${this.apiUrl}/user/me`)
      .pipe(
        map((res) => res.data!),
        catchError((err) => throwError(() => err))
      );
  }

  updateProfile(formData: FormData): Observable<string> {
    return this.http
      .put<ApiResponse<string>>(`${this.apiUrl}/user/update`, formData)
      .pipe(
        map((res) => res.data!),
        catchError((err) => throwError(() => err))
      );
  }
}
