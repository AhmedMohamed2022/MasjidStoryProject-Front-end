// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../Core/Services/auth.service';
import { UserRegistrationService } from '../../../Core/Services/user-registration.service';
import { NotificationDropdownComponent } from '../NotificationDropdown/notification-dropdown.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationDropdownComponent,
    TranslateModule,
  ],
  templateUrl: './Header.component.html',
  styleUrls: ['./Header.component.css'],
})
export class HeaderComponent {
  isMenuCollapsed = true;
  isEventsDropdownCollapsed = true;
  isUserDropdownCollapsed = true;
  isAdminDropdownCollapsed = true;
  isLanguageDropdownCollapsed = true;
  currentLang = 'en';

  constructor(
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router,
    private translate: TranslateService
  ) {
    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();
    const lang = browserLang && browserLang.match(/en|ar/) ? browserLang : 'en';
    this.currentLang = lang;
    translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  switchLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.closeAllMenus();
  }

  toggleLanguageDropdown(): void {
    this.isLanguageDropdownCollapsed = !this.isLanguageDropdownCollapsed;
    this.isEventsDropdownCollapsed = true;
    this.isUserDropdownCollapsed = true;
    this.isAdminDropdownCollapsed = true;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this.toggleBodyScroll();
  }

  closeAllMenus(): void {
    this.isMenuCollapsed = true;
    this.isEventsDropdownCollapsed = true;
    this.isUserDropdownCollapsed = true;
    this.isAdminDropdownCollapsed = true;
    this.enableBodyScroll();
  }

  toggleEventsDropdown(): void {
    this.isEventsDropdownCollapsed = !this.isEventsDropdownCollapsed;
    this.isUserDropdownCollapsed = true; // Close other dropdown
    this.isAdminDropdownCollapsed = true; // Close other dropdown
  }

  toggleUserDropdown(): void {
    this.isUserDropdownCollapsed = !this.isUserDropdownCollapsed;
    this.isEventsDropdownCollapsed = true; // Close other dropdown
    this.isAdminDropdownCollapsed = true; // Close other dropdown
  }

  toggleAdminDropdown(): void {
    this.isAdminDropdownCollapsed = !this.isAdminDropdownCollapsed;
    this.isEventsDropdownCollapsed = true; // Close other dropdown
    this.isUserDropdownCollapsed = true; // Close other dropdown
  }

  logout(): void {
    this.authService.logout();
    // Clear user registrations on logout
    this.userRegistrationService.clearRegistrations();
    this.closeAllMenus();
    this.router.navigate(['/']);
  }

  private toggleBodyScroll(): void {
    if (!this.isMenuCollapsed) {
      // Menu is opening
      document.body.classList.add('mobile-menu-open');
    } else {
      // Menu is closing
      this.enableBodyScroll();
    }
  }

  private enableBodyScroll(): void {
    document.body.classList.remove('mobile-menu-open');
  }
}
