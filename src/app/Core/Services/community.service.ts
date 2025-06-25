import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ApiResponse,
  CommunityViewModel,
  CommunityCreateViewModel,
} from '../Models/community.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private apiUrl = `${environment.apiUrl}/api/community`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      // Network error or CORS issue
      errorMessage =
        'Unable to connect to server. Please check your connection.';
    } else if (error.status === 401) {
      errorMessage = 'You are not authorized. Please login again.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Bad request';
    } else {
      // Server-side error
      errorMessage =
        error.error?.message || `Server returned code: ${error.status}`;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Get all communities for a specific masjid
  getMasjidCommunities(masjidId: number): Observable<CommunityViewModel[]> {
    return this.http
      .get<ApiResponse<CommunityViewModel[]>>(
        `${this.apiUrl}/masjid/${masjidId}`,
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => response.data || []),
        catchError(this.handleError)
      );
  }

  // Get community by ID
  getCommunityById(id: number): Observable<CommunityViewModel> {
    return this.http
      .get<ApiResponse<CommunityViewModel>>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('Community not found');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  // Create new community
  createCommunity(community: CommunityCreateViewModel): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/create`, community, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data || 'Community created successfully'),
        catchError(this.handleError)
      );
  }

  // Join community
  joinCommunity(communityId: number): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(
        `${this.apiUrl}/${communityId}/join`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => response.data || 'Successfully joined community'),
        catchError(this.handleError)
      );
  }

  // Leave community
  leaveCommunity(communityId: number): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(
        `${this.apiUrl}/${communityId}/leave`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => response.data || 'Successfully left community'),
        catchError(this.handleError)
      );
  }

  // Get user's communities
  getMyCommunities(): Observable<CommunityViewModel[]> {
    return this.http
      .get<ApiResponse<CommunityViewModel[]>>(`${this.apiUrl}/my-communities`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data || []),
        catchError(this.handleError)
      );
  }
}
