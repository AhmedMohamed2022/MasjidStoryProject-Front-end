import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './Footer.component.html',
  styleUrls: ['./Footer.component.css'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
