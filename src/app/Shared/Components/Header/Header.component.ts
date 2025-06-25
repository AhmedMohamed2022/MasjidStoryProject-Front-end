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

  constructor(
    private authService: AuthService,
    private userRegistrationService: UserRegistrationService,
    private router: Router
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  toggleEventsDropdown(): void {
    this.isEventsDropdownCollapsed = !this.isEventsDropdownCollapsed;
    this.isUserDropdownCollapsed = true; // Close other dropdown
  }

  toggleUserDropdown(): void {
    this.isUserDropdownCollapsed = !this.isUserDropdownCollapsed;
    this.isEventsDropdownCollapsed = true; // Close other dropdown
  }

  logout(): void {
    this.authService.logout();
    // Clear user registrations on logout
    this.userRegistrationService.clearRegistrations();
    this.isMenuCollapsed = true;
    this.isEventsDropdownCollapsed = true;
    this.isUserDropdownCollapsed = true;
    this.router.navigate(['/']);
  }
}
