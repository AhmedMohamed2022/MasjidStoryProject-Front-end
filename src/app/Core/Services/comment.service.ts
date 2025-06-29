import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface CommentViewModel {
  id: number;
  content: string;
  datePosted: Date;
  userName: string;
  contentId: number;
  contentType: string;
}

export interface CommentCreateViewModel {
  contentId: number;
  contentType: string;
  content: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/api/comment`;

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

  // Get comments by content type and ID
  getCommentsByContent(
    contentId: number,
    contentType: string
  ): Observable<CommentViewModel[]> {
    return this.http
      .get<CommentViewModel[]>(
        `${this.apiUrl}/${contentType.toLowerCase()}/${contentId}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  // Add a new comment
  addComment(comment: CommentCreateViewModel): Observable<CommentViewModel> {
    return this.http
      .post<ApiResponse<CommentViewModel>>(`${this.apiUrl}/add`, comment, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError)
      );
  }

  // Update a comment
  updateComment(commentId: number, content: string): Observable<any> {
    return this.http
      .put(
        `${this.apiUrl}/${commentId}`,
        { id: commentId, content },
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  // Delete a comment
  deleteComment(commentId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${commentId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
