import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface LikeCreateViewModel {
  contentId: number;
  contentType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private apiUrl = `${environment.apiUrl}/api/like`;

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
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage =
        'Unable to connect to server. Please check your connection.';
    } else if (error.status === 401) {
      errorMessage = 'You are not authorized. Please login again.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Bad request';
    } else {
      errorMessage =
        error.error?.message || `Server returned code: ${error.status}`;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Toggle like on content
  toggleLike(
    contentId: number,
    contentType: string
  ): Observable<{ success: boolean; liked: boolean }> {
    const likeData: LikeCreateViewModel = { contentId, contentType };
    return this.http
      .post<{ success: boolean; liked: boolean }>(
        `${this.apiUrl}/toggle`,
        likeData,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  // Get like count for content
  getLikeCount(
    contentId: number,
    contentType: string
  ): Observable<{ success: boolean; count: number }> {
    return this.http
      .get<{ success: boolean; count: number }>(
        `${this.apiUrl}/count/${contentType}/${contentId}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  // Check if user has liked the content
  getLikeStatus(
    contentId: number,
    contentType: string
  ): Observable<{ success: boolean; isLiked: boolean }> {
    return this.http
      .get<{ success: boolean; isLiked: boolean }>(
        `${this.apiUrl}/status/${contentType}/${contentId}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }
}
