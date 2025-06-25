import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-Search-Masjid',
  imports: [CommonModule, FormsModule],
  templateUrl: './Search-Masjid.component.html',
  styleUrls: ['./Search-Masjid.component.css'],
})
export class SearchMasjidComponent implements OnInit {
  searchTerm: string = '';
  searchResults: any[] = [];
  loading = false;

  onSearch(): void {
    // TODO: Implement search logic
    this.loading = true;
    // Add search implementation here
  }
  ngOnInit(): void {}
}
