import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  EventCreateViewModel,
  EventViewModel,
} from '../Models/event.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/event`;

  constructor(private http: HttpClient) {}

  getUpcomingEvents(languageCode?: string): Observable<EventViewModel[]> {
    let url = `${this.apiUrl}/upcoming`;
    if (languageCode) {
      url += `?languageCode=${languageCode}`;
    }
    return this.http
      .get<ApiResponse<EventViewModel[]>>(url)
      .pipe(map((response) => response.data));
  }

  getEventDetails(
    id: number,
    languageCode?: string
  ): Observable<EventViewModel> {
    let url = `${this.apiUrl}/${id}`;
    if (languageCode) {
      url += `?languageCode=${languageCode}`;
    }
    return this.http
      .get<ApiResponse<EventViewModel>>(url)
      .pipe(map((response) => response.data));
  }

  getMasjidEvents(
    masjidId: number,
    languageCode?: string
  ): Observable<EventViewModel[]> {
    let url = `${this.apiUrl}/masjid/${masjidId}`;
    if (languageCode) {
      url += `?languageCode=${languageCode}`;
    }
    return this.http
      .get<ApiResponse<EventViewModel[]>>(url)
      .pipe(map((response) => response.data));
  }

  createEvent(event: EventCreateViewModel): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/create`, event)
      .pipe(map((response) => response.data));
  }

  registerToEvent(id: number): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/${id}/register`, {})
      .pipe(map((response) => response.data));
  }

  getMyRegistrations(languageCode?: string): Observable<EventViewModel[]> {
    let url = `${this.apiUrl}/my-registrations`;
    if (languageCode) {
      url += `?languageCode=${languageCode}`;
    }
    return this.http
      .get<ApiResponse<EventViewModel[]>>(url)
      .pipe(map((response) => response.data));
  }

  updateEvent(id: number, event: EventCreateViewModel): Observable<string> {
    return this.http
      .put<ApiResponse<string>>(`${this.apiUrl}/update/${id}`, event)
      .pipe(map((response) => response.data));
  }

  deleteEvent(id: number): Observable<string> {
    return this.http
      .delete<ApiResponse<string>>(`${this.apiUrl}/delete/${id}`)
      .pipe(map((response) => response.data));
  }
}
