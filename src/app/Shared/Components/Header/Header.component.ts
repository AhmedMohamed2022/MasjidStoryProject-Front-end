// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../Core/Services/auth.service';
import { UserRegistrationService } from '../../../Core/Services/user-registration.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './Header.component.html',
  styleUrls: ['./Header.component.css'],
})
export class HeaderComponent {
  isMenuCollapsed = true;
  isEventsDropdownCollapsed = true;
  isUserDropdownCollapsed = true;
  isAdminDropdownCollapsed = true;

  constructor(
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router
  ) {}

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
  }

  closeAllMenus(): void {
    this.isMenuCollapsed = true;
    this.isEventsDropdownCollapsed = true;
    this.isUserDropdownCollapsed = true;
    this.isAdminDropdownCollapsed = true;
  }

  openEventsDropdown(): void {
    this.isEventsDropdownCollapsed = false;
    this.isUserDropdownCollapsed = true;
    this.isAdminDropdownCollapsed = true;
  }

  closeEventsDropdown(): void {
    this.isEventsDropdownCollapsed = true;
  }

  openAdminDropdown(): void {
    this.isAdminDropdownCollapsed = false;
    this.isEventsDropdownCollapsed = true;
    this.isUserDropdownCollapsed = true;
  }

  closeAdminDropdown(): void {
    this.isAdminDropdownCollapsed = true;
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
}
