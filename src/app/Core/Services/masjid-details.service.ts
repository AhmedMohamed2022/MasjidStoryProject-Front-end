// File: src/app/features/masjid-detail/masjid-detail.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MasjidDetailsViewModel } from '../Models/masjid-details.model';
import { environment } from '../environments/environment';
import { ApiResponse } from '../Models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MasjidDetailService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMasjidDetails(
    id: number,
    lang?: string
  ): Observable<ApiResponse<MasjidDetailsViewModel>> {
    let params = new HttpParams();
    if (lang) {
      params = params.set('lang', lang);
    }

    return this.http
      .get<ApiResponse<MasjidDetailsViewModel>>(
        `${this.apiUrl}/api/Masjid/${id}/details`,
        { params }
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            // Prepend API URL to media URLs
            response.data.mediaUrls = response.data.mediaUrls.map((url) =>
              url.startsWith('http') ? url : `${this.apiUrl}${url}`
            );
            // Do the same for story images
            if (response.data.stories) {
              response.data.stories = response.data.stories.map((story) => ({
                ...story,
                imageUrl: story.imageUrl
                  ? story.imageUrl.startsWith('http')
                    ? story.imageUrl
                    : `${this.apiUrl}${story.imageUrl}`
                  : undefined,
              }));
            }
          }
          return response;
        })
      );
  }
}
