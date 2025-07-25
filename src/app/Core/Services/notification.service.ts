import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface NotificationViewModel {
  id: number;
  userId: string;
  title: string;
  messageKey?: string; // i18n key
  messageVariables?: { [key: string]: string }; // i18n variables
  message?: string; // Obsolete
  type: string; // "Like", "Comment", "Approval", "General"
  contentType: string; // "Story", "Event", "Community"
  contentId?: number;
  isRead: boolean;
  dateCreated: string;
  senderName: string;
}

export interface NotificationCreateViewModel {
  userId: string;
  title: string;
  message: string;
  type: string;
  contentType: string;
  contentId?: number;
  senderName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notification`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

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

  // Get user's notifications
  getUserNotifications(): Observable<NotificationViewModel[]> {
    return this.http
      .get<NotificationViewModel[]>(`${this.apiUrl}/my-notifications`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((notifications) => {
          // Parse dateCreated strings to Date objects
          return notifications.map((notification) => ({
            ...notification,
            dateCreated: new Date(notification.dateCreated).toISOString(),
          }));
        }),
        catchError(this.handleError)
      );
  }

  // Get unread count
  getUnreadCount(): Observable<number> {
    return this.http
      .get<{ success: boolean; count: number }>(`${this.apiUrl}/unread-count`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          this.unreadCountSubject.next(response.count);
          return response.count;
        }),
        catchError(this.handleError)
      );
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/mark-read/${notificationId}`,
        {},
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        map(() => {
          // Update unread count
          this.getUnreadCount().subscribe();
        }),
        catchError(this.handleError)
      );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/mark-all-read`,
        {},
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        map(() => {
          this.unreadCountSubject.next(0);
        }),
        catchError(this.handleError)
      );
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${notificationId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(() => {
          // Update unread count
          this.getUnreadCount().subscribe();
        }),
        catchError(this.handleError)
      );
  }

  // Create notification (for admin use)
  createNotification(
    notification: NotificationCreateViewModel
  ): Observable<NotificationViewModel> {
    return this.http
      .post<ApiResponse<NotificationViewModel>>(
        `${this.apiUrl}/create`,
        notification,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError)
      );
  }

  // Update unread count manually
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
