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

  getUpcomingEvents(): Observable<EventViewModel[]> {
    return this.http
      .get<ApiResponse<EventViewModel[]>>(`${this.apiUrl}/upcoming`)
      .pipe(map((response) => response.data));
  }

  getEventDetails(id: number): Observable<EventViewModel> {
    return this.http
      .get<ApiResponse<EventViewModel>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  getMasjidEvents(masjidId: number): Observable<EventViewModel[]> {
    return this.http
      .get<ApiResponse<EventViewModel[]>>(`${this.apiUrl}/masjid/${masjidId}`)
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

  getMyRegistrations(): Observable<EventViewModel[]> {
    return this.http
      .get<ApiResponse<EventViewModel[]>>(`${this.apiUrl}/my-registrations`)
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
