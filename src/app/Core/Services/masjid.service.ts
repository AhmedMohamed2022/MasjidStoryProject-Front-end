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

  getAllMasjids(languageCode: string = 'en'): Observable<MasjidViewModel[]> {
    return this.http
      .get<ApiResponse<MasjidViewModel[]>>(
        `${this.apiUrl}/getAll?languageCode=${languageCode}`
      )
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
    size: number = 10,
    languageCode: string = 'en'
  ): Observable<MasjidViewModel[]> {
    let url = `${this.apiUrl}/search?page=${page}&size=${size}&languageCode=${languageCode}`;
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

    // Add basic masjid properties (exclude Contents array)
    const basicProperties = [
      'archStyle',
      'latitude',
      'longitude',
      'countryId',
      'cityId',
      'yearOfEstablishment',
    ];
    basicProperties.forEach((key) => {
      const value = masjidData[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // Handle Contents array properly (PascalCase)
    if (masjidData.Contents && Array.isArray(masjidData.Contents)) {
      masjidData.Contents.forEach((content: any, idx: number) => {
        // Only add complete entries
        if (
          content.LanguageId &&
          content.Name &&
          content.Description &&
          content.Address
        ) {
          formData.append(
            `Contents[${idx}].LanguageId`,
            content.LanguageId.toString()
          );
          formData.append(`Contents[${idx}].Name`, content.Name);
          formData.append(`Contents[${idx}].Description`, content.Description);
          formData.append(`Contents[${idx}].Address`, content.Address);
        }
      });
    }

    // Add media files if any
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file) => {
        formData.append('MediaFiles', file);
      });
    }

    // Debug: Log all FormData entries
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
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
    formData.append('Id', id.toString());

    // Add basic masjid properties (exclude Contents array)
    const basicProperties = [
      'archStyle',
      'latitude',
      'longitude',
      'countryId',
      'cityId',
      'yearOfEstablishment',
    ];
    basicProperties.forEach((key) => {
      const value = masjidData[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // Handle Contents array properly (PascalCase)
    if (masjidData.Contents && Array.isArray(masjidData.Contents)) {
      masjidData.Contents.forEach((content: any, idx: number) => {
        // Only add complete entries
        if (
          content.LanguageId &&
          content.Name &&
          content.Description &&
          content.Address
        ) {
          formData.append(
            `Contents[${idx}].LanguageId`,
            content.LanguageId.toString()
          );
          formData.append(`Contents[${idx}].Name`, content.Name);
          formData.append(`Contents[${idx}].Description`, content.Description);
          formData.append(`Contents[${idx}].Address`, content.Address);
        }
      });
    }

    // Add new media files if any
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file) => {
        formData.append('NewMediaFiles', file);
      });
    }

    // Add media IDs to delete if any
    if (mediaIdsToDelete && mediaIdsToDelete.length > 0) {
      mediaIdsToDelete.forEach((mediaId) => {
        formData.append('MediaIdsToDelete', mediaId.toString());
      });
    }

    // Debug: Log all FormData entries
    console.log('FormData entries for update:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
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
