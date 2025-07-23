// src/app/core/services/home.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../Models/api-response.model';
import { MasjidViewModel } from '../Models/masjid.model';
import { StoryViewModel } from '../Models/story.model';
import { EventViewModel } from '../Models/event.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFeaturedMasjids(): Observable<MasjidViewModel[]> {
    return this.http
      .get<ApiResponse<MasjidViewModel[]>>(`${this.apiUrl}/api/masjid/featured`)
      .pipe(map((response) => response.data));
  }

  getLatestStories(): Observable<StoryViewModel[]> {
    return this.http
      .get<ApiResponse<StoryViewModel[]>>(`${this.apiUrl}/api/story/latest`)
      .pipe(map((response) => response.data));
  }

  getUpcomingEvents(languageCode?: string): Observable<EventViewModel[]> {
    let url = `${this.apiUrl}/api/event/upcoming`;
    if (languageCode) {
      url += `?languageCode=${languageCode}`;
    }
    return this.http
      .get<ApiResponse<EventViewModel[]>>(url)
      .pipe(map((response) => response.data));
  }
}
