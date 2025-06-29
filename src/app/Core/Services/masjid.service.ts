import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { MasjidViewModel } from '../Models/masjid.model';
import { MasjidDetailsViewModel } from '../Models/masjid-details.model';
import { ApiResponse } from '../Models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class MasjidService {
  private apiUrl = `${environment.apiUrl}/api/Masjid`;

  constructor(private http: HttpClient) {}

  getAllMasjids(): Observable<MasjidViewModel[]> {
    return this.http
      .get<ApiResponse<MasjidViewModel[]>>(`${this.apiUrl}/getAll`)
      .pipe(
        map((response) => response.data || []),
        catchError(this.handleError)
      );
  }

  getMasjidById(id: number): Observable<MasjidViewModel> {
    return this.http
      .get<ApiResponse<MasjidViewModel>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  searchMasjids(
    query?: string,
    page: number = 1,
    size: number = 10
  ): Observable<MasjidViewModel[]> {
    let url = `${this.apiUrl}/search?page=${page}&size=${size}`;
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }
    return this.http.get<ApiResponse<MasjidViewModel[]>>(url).pipe(
      map((response) => response.data || []),
      catchError(this.handleError)
    );
  }

  createMasjid(masjidData: any, mediaFiles?: File[]): Observable<any> {
    const formData = new FormData();

    // Add masjid data
    Object.keys(masjidData).forEach((key) => {
      if (masjidData[key] !== null && masjidData[key] !== undefined) {
        formData.append(key, masjidData[key]);
      }
    });

    // Add media files if any
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        formData.append(`MediaFiles`, file);
      });
    }

    return this.http
      .post(`${this.apiUrl}/create`, formData)
      .pipe(catchError(this.handleError));
  }

  updateMasjid(
    id: number,
    masjidData: any,
    mediaFiles?: File[],
    mediaIdsToDelete?: number[]
  ): Observable<any> {
    const formData = new FormData();

    // Add the ID first
    formData.append('Id', id.toString());

    // Add masjid data
    Object.keys(masjidData).forEach((key) => {
      if (masjidData[key] !== null && masjidData[key] !== undefined) {
        formData.append(key, masjidData[key]);
      }
    });

    // Add new media files if any
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        formData.append(`NewMediaFiles`, file);
      });
    }

    // Add media IDs to delete if any
    if (mediaIdsToDelete && mediaIdsToDelete.length > 0) {
      mediaIdsToDelete.forEach((mediaId) => {
        formData.append(`MediaIdsToDelete`, mediaId.toString());
      });
    }

    return this.http
      .put(`${this.apiUrl}/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  deleteMasjid(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getMasjidDetails(
    id: number,
    lang?: string
  ): Observable<MasjidDetailsViewModel> {
    let url = `${this.apiUrl}/${id}/details`;
    if (lang) {
      url += `?lang=${lang}`;
    }
    return this.http.get<ApiResponse<MasjidDetailsViewModel>>(url).pipe(
      map((response) => response.data),
      catchError(this.handleError)
    );
  }

  registerVisit(masjidId: number): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${masjidId}/visit`, {})
      .pipe(catchError(this.handleError));
  }

  getFeaturedMasjids(): Observable<MasjidViewModel[]> {
    return this.http
      .get<ApiResponse<MasjidViewModel[]>>(`${this.apiUrl}/featured`)
      .pipe(
        map((response) => response.data || []),
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
