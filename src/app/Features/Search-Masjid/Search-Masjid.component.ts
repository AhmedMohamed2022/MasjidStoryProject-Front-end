import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MasjidViewModel,
  CountryViewModel,
  CityViewModel,
  getTranslatedMasjidName,
  getTranslatedMasjidAddress,
} from '../../Core/Models/masjid.model';
import { MasjidService } from '../../Core/Services/masjid.service';
import { CountryService } from '../../Core/Services/country.service';
import { CityService } from '../../Core/Services/city.service';

@Component({
  selector: 'app-search-masjid',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './Search-Masjid.component.html',
  styleUrls: ['./Search-Masjid.component.css'],
})
export class SearchMasjidComponent implements OnInit {
  // Search and filter properties
  searchTerm: string = '';
  selectedCountry: string = '';
  selectedCity: string = '';
  selectedArchStyle: string = '';
  sortBy: string = 'name';

  // Data properties
  masjids: MasjidViewModel[] = [];
  countries: CountryViewModel[] = [];
  cities: CityViewModel[] = [];

  // Loading and error states
  loading: boolean = false;
  error: string | null = null;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 1;
  totalItems: number = 0;

  // Architectural style options (keys)
  archStyleOptions = [
    { key: 'ISLAMIC', label: 'ARCH_STYLE.ISLAMIC' },
    { key: 'FATIMID', label: 'ARCH_STYLE.FATIMID' },
    { key: 'MODERN_ISLAMIC', label: 'ARCH_STYLE.MODERN_ISLAMIC' },
    { key: 'CONTEMPORARY', label: 'ARCH_STYLE.CONTEMPORARY' },
    { key: 'MODERN', label: 'ARCH_STYLE.MODERN' },
    { key: 'AGHLABID', label: 'ARCH_STYLE.AGHLABID' },
    { key: 'SAFAVID', label: 'ARCH_STYLE.SAFAVID' },
    { key: 'OTTOMAN', label: 'ARCH_STYLE.OTTOMAN' },
    { key: 'UMAYYAD', label: 'ARCH_STYLE.UMAYYAD' },
    { key: 'SUDANESE_ISLAMIC', label: 'ARCH_STYLE.SUDANESE_ISLAMIC' },
    { key: 'MAMLUK', label: 'ARCH_STYLE.MAMLUK' },
    { key: 'MOORISH', label: 'ARCH_STYLE.MOORISH' },
    { key: 'MUGHAL', label: 'ARCH_STYLE.MUGHAL' },
    { key: 'SELJUK', label: 'ARCH_STYLE.SELJUK' },
    { key: 'PERSIAN', label: 'ARCH_STYLE.PERSIAN' },
    { key: 'INDONESIAN', label: 'ARCH_STYLE.INDONESIAN' },
    { key: 'CHINESE', label: 'ARCH_STYLE.CHINESE' },
    { key: 'YEMENI', label: 'ARCH_STYLE.YEMENI' },
    { key: 'SUDANO_SAHELIAN', label: 'ARCH_STYLE.SUDANO_SAHELIAN' },
    { key: 'TRADITIONAL', label: 'ARCH_STYLE.TRADITIONAL' },
    { key: 'OTHER', label: 'ARCH_STYLE.OTHER' },
  ];

  constructor(
    private masjidService: MasjidService,
    private countryService: CountryService,
    private cityService: CityService,
    public router: Router,
    public translate: TranslateService // make public for template
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadMasjids();
    this.translate.onLangChange.subscribe(() => {
      this.loadCountries();
      this.loadCities();
      this.loadMasjids();
    });
  }

  loadCountries(): void {
    this.countryService.getAllCountries(this.translate.currentLang).subscribe({
      next: (countries: CountryViewModel[]) => {
        this.countries = countries;
      },
      error: (error: any) => {
        console.error('Error loading countries:', error);
      },
    });
  }

  loadCities(): void {
    if (this.selectedCountry) {
      this.cityService
        .getCitiesByCountry(
          parseInt(this.selectedCountry),
          this.translate.currentLang
        )
        .subscribe({
          next: (cities: CityViewModel[]) => {
            this.cities = cities;
          },
          error: (error: any) => {
            console.error('Error loading cities:', error);
            this.cities = [];
          },
        });
    } else {
      this.cities = [];
    }
  }

  loadMasjids(): void {
    this.loading = true;
    this.error = null;

    this.masjidService
      .searchMasjids(
        this.searchTerm,
        this.currentPage,
        this.pageSize,
        this.translate.currentLang
      )
      .subscribe({
        next: (masjids: MasjidViewModel[]) => {
          this.masjids = masjids;
          this.applyFilters();
          this.applySorting();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading masjids:', error);
          this.translate
            .get('SEARCH_MASJID_ERROR')
            .subscribe((text: string) => {
              this.error = text;
            });
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadMasjids();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadCities();
    this.loadMasjids();
  }

  onSortChange(): void {
    this.applySorting();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCountry = '';
    this.selectedCity = '';
    this.selectedArchStyle = '';
    this.currentPage = 1;
    this.loadCities();
    this.loadMasjids();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMasjids();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  applyFilters(): void {
    let filteredMasjids = [...this.masjids];

    // Filter by country
    if (this.selectedCountry) {
      filteredMasjids = filteredMasjids.filter(
        (masjid) => masjid.countryId === parseInt(this.selectedCountry)
      );
    }

    // Filter by city
    if (this.selectedCity) {
      filteredMasjids = filteredMasjids.filter(
        (masjid) => masjid.cityId === parseInt(this.selectedCity)
      );
    }

    // Filter by architectural style
    if (this.selectedArchStyle) {
      filteredMasjids = filteredMasjids.filter(
        (masjid) =>
          masjid.archStyle?.toLowerCase() ===
          this.selectedArchStyle.toLowerCase()
      );
    }

    this.masjids = filteredMasjids;
    this.totalItems = this.masjids.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  applySorting(): void {
    const lang = this.translate.currentLang || 'en';
    switch (this.sortBy) {
      case 'name':
        this.masjids.sort((a, b) =>
          getTranslatedMasjidName(a.contents, lang).localeCompare(
            getTranslatedMasjidName(b.contents, lang)
          )
        );
        break;
      case 'country':
        this.masjids.sort((a, b) => a.countryName.localeCompare(b.countryName));
        break;
      case 'city':
        this.masjids.sort((a, b) => a.cityName.localeCompare(b.cityName));
        break;
      case 'year':
        this.masjids.sort((a, b) => {
          const yearA = a.yearOfEstablishment || 0;
          const yearB = b.yearOfEstablishment || 0;
          return yearB - yearA; // Newest first
        });
        break;
      default:
        this.masjids.sort((a, b) =>
          getTranslatedMasjidName(a.contents, lang).localeCompare(
            getTranslatedMasjidName(b.contents, lang)
          )
        );
    }
  }

  navigateToMasjid(masjidId: number): void {
    this.router.navigate(['/masjid', masjidId]);
  }

  navigateToMasjidEvents(masjidId: number): void {
    this.router.navigate(['/masjid', masjidId], { fragment: 'events' });
  }

  // Expose the helpers for template
  public getTranslatedMasjidName = getTranslatedMasjidName;
  public getTranslatedMasjidAddress = getTranslatedMasjidAddress;
}
