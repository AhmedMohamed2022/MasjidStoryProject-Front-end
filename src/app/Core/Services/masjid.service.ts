import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasjidViewModel } from '../Models/masjid.model';
import { ApiResponse } from '../Models/api-response.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MasjidService {
  private apiUrl = `${environment.apiUrl}/api/masjid`;

  constructor(private http: HttpClient) {}

  getAllMasjids(): Observable<MasjidViewModel[]> {
    return this.http
      .get<ApiResponse<MasjidViewModel[]>>(`${this.apiUrl}/getAll`)
      .pipe(map((response) => response.data));
  }

  getMasjidById(id: number): Observable<MasjidViewModel> {
    return this.http
      .get<ApiResponse<MasjidViewModel>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  searchMasjids(
    query: string,
    page: number = 1,
    size: number = 10
  ): Observable<MasjidViewModel[]> {
    return this.http
      .get<ApiResponse<MasjidViewModel[]>>(
        `${this.apiUrl}/search?query=${encodeURIComponent(
          query
        )}&page=${page}&size=${size}`
      )
      .pipe(map((response) => response.data));
  }

  getFeaturedMasjids(): Observable<MasjidViewModel[]> {
    return this.http
      .get<ApiResponse<MasjidViewModel[]>>(`${this.apiUrl}/featured`)
      .pipe(map((response) => response.data));
  }
}
