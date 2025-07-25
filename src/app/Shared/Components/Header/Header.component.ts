// src/app/shared/header/header.component.ts
import {
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
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
export class HeaderComponent implements AfterViewInit {
  isMenuCollapsed = true;
  isEventsDropdownCollapsed = true;
  isUserDropdownCollapsed = true;
  isAdminDropdownCollapsed = true;
  isLanguageDropdownCollapsed = true;
  currentLang = 'en';

  @ViewChild('userMenu') userMenuRef!: ElementRef;
  @ViewChild('languageMenu') languageMenuRef!: ElementRef;

  constructor(
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router,
    private translate: TranslateService,
    private eRef: ElementRef,
    private renderer: Renderer2
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

  ngAfterViewInit(): void {
    // nothing for now
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Only close language dropdown if open and click is outside language switcher
    if (!this.isLanguageDropdownCollapsed) {
      const langSwitcher =
        this.eRef.nativeElement.querySelector('.language-switcher');
      if (langSwitcher && !langSwitcher.contains(event.target)) {
        this.closeLanguageDropdown();
      }
    }
    // Close user dropdown if open and click is outside user dropdown
    if (!this.isUserDropdownCollapsed) {
      const userDropdown =
        this.eRef.nativeElement.querySelector('.user-dropdown');
      if (userDropdown && !userDropdown.contains(event.target)) {
        this.closeUserDropdown();
      }
    }
    // Close events dropdown if open and click is outside events dropdown
    if (!this.isEventsDropdownCollapsed) {
      const eventsDropdown =
        this.eRef.nativeElement.querySelector('.nav-item.dropdown');
      if (eventsDropdown && !eventsDropdown.contains(event.target)) {
        this.closeEventsDropdown();
      }
    }
    // Close admin dropdown if open and click is outside admin dropdown
    if (!this.isAdminDropdownCollapsed) {
      const adminDropdown =
        this.eRef.nativeElement.querySelector('.admin-dropdown');
      if (adminDropdown && !adminDropdown.contains(event.target)) {
        this.closeAdminDropdown();
      }
    }
  }

  @HostListener('document:focusin', ['$event'])
  onDocumentFocusIn(event: FocusEvent) {
    if (!this.isUserDropdownCollapsed) {
      const userDropdown =
        this.eRef.nativeElement.querySelector('.user-dropdown');
      if (userDropdown && !userDropdown.contains(event.target)) {
        this.closeUserDropdown();
      }
    }
    if (!this.isEventsDropdownCollapsed) {
      const eventsDropdown =
        this.eRef.nativeElement.querySelector('.nav-item.dropdown');
      if (eventsDropdown && !eventsDropdown.contains(event.target)) {
        this.closeEventsDropdown();
      }
    }
    if (!this.isAdminDropdownCollapsed) {
      const adminDropdown =
        this.eRef.nativeElement.querySelector('.admin-dropdown');
      if (adminDropdown && !adminDropdown.contains(event.target)) {
        this.closeAdminDropdown();
      }
    }
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
    setTimeout(() => {
      if (!this.isLanguageDropdownCollapsed) {
        this.adjustLanguageMenuPosition();
      } else {
        this.resetLanguageMenuPosition();
      }
    }, 0);
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
    setTimeout(() => {
      if (!this.isUserDropdownCollapsed) {
        this.adjustUserMenuPosition();
      } else {
        this.resetUserMenuPosition();
      }
    }, 0);
  }

  adjustUserMenuPosition(): void {
    if (!this.userMenuRef) return;
    const menu: HTMLElement = this.userMenuRef.nativeElement;
    // Reset any previous transform
    this.renderer.setStyle(menu, 'transform', 'translateY(0)');
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    // For RTL
    const isRTL =
      document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    if (isRTL && rect.left < 0) {
      const shift = Math.abs(rect.left) + 8;
      this.renderer.setStyle(
        menu,
        'transform',
        `translateY(0) translateX(${shift}px)`
      );
    } else if (!isRTL && rect.right > vw) {
      const shift = rect.right - vw + 8;
      this.renderer.setStyle(
        menu,
        'transform',
        `translateY(0) translateX(-${shift}px)`
      );
    }
  }

  resetUserMenuPosition(): void {
    if (!this.userMenuRef) return;
    const menu: HTMLElement = this.userMenuRef.nativeElement;
    this.renderer.setStyle(menu, 'transform', 'translateY(0)');
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

  closeEventsDropdown() {
    this.isEventsDropdownCollapsed = true;
  }
  closeAdminDropdown() {
    this.isAdminDropdownCollapsed = true;
  }
  closeUserDropdown() {
    this.isUserDropdownCollapsed = true;
  }
  closeLanguageDropdown() {
    this.isLanguageDropdownCollapsed = true;
  }

  adjustLanguageMenuPosition(): void {
    if (!this.languageMenuRef) return;
    const menu: HTMLElement = this.languageMenuRef.nativeElement;
    // Reset any previous transform
    this.renderer.setStyle(menu, 'transform', 'translateY(0)');
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    // For RTL
    const isRTL =
      document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    if (isRTL && rect.left < 0) {
      const shift = Math.abs(rect.left) + 8;
      this.renderer.setStyle(
        menu,
        'transform',
        `translateY(0) translateX(${shift}px)`
      );
    } else if (!isRTL && rect.right > vw) {
      const shift = rect.right - vw + 8;
      this.renderer.setStyle(
        menu,
        'transform',
        `translateY(0) translateX(-${shift}px)`
      );
    }
    // On mobile, make it fixed and full width
    if (window.innerWidth <= 600) {
      this.renderer.setStyle(menu, 'position', 'fixed');
      this.renderer.setStyle(menu, 'left', '0');
      this.renderer.setStyle(menu, 'right', '0');
      this.renderer.setStyle(menu, 'top', '56px');
      this.renderer.setStyle(menu, 'width', '100vw');
      this.renderer.setStyle(menu, 'z-index', '2000');
      this.renderer.setStyle(menu, 'background', '#fff');
      this.renderer.setStyle(menu, 'box-shadow', '0 4px 24px rgba(0,0,0,0.18)');
    } else {
      this.renderer.removeStyle(menu, 'position');
      this.renderer.removeStyle(menu, 'left');
      this.renderer.removeStyle(menu, 'right');
      this.renderer.removeStyle(menu, 'top');
      this.renderer.removeStyle(menu, 'width');
      this.renderer.removeStyle(menu, 'z-index');
      this.renderer.removeStyle(menu, 'background');
      this.renderer.removeStyle(menu, 'box-shadow');
    }
  }

  resetLanguageMenuPosition(): void {
    if (!this.languageMenuRef) return;
    const menu: HTMLElement = this.languageMenuRef.nativeElement;
    this.renderer.setStyle(menu, 'transform', 'translateY(0)');
    this.renderer.removeStyle(menu, 'position');
    this.renderer.removeStyle(menu, 'left');
    this.renderer.removeStyle(menu, 'right');
    this.renderer.removeStyle(menu, 'top');
    this.renderer.removeStyle(menu, 'width');
    this.renderer.removeStyle(menu, 'z-index');
    this.renderer.removeStyle(menu, 'background');
    this.renderer.removeStyle(menu, 'box-shadow');
  }
}
