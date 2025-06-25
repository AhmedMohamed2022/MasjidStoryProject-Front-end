import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventService } from './event.service';

export interface UserRegistration {
  eventId: number;
  registeredAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  private userRegistrationsSubject = new BehaviorSubject<UserRegistration[]>(
    []
  );
  public userRegistrations$ = this.userRegistrationsSubject.asObservable();

  private registeredEventIds = new Set<number>();

  constructor(private eventService: EventService) {}

  /**
   * Load user's registered events from the server
   */
  loadUserRegistrations(): void {
    this.eventService.getMyRegistrations().subscribe({
      next: (events) => {
        const registrations: UserRegistration[] = events.map((event) => ({
          eventId: event.id,
          registeredAt: new Date(),
        }));

        this.updateRegistrations(registrations);
      },
      error: (error) => {
        console.error('Error loading user registrations:', error);
        this.clearRegistrations();
      },
    });
  }

  /**
   * Register user to an event
   */
  registerToEvent(eventId: number): Observable<string> {
    return new Observable((observer) => {
      this.eventService.registerToEvent(eventId).subscribe({
        next: (message) => {
          // Add to local registrations
          this.addRegistration(eventId);
          observer.next(message);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  /**
   * Check if user is registered to an event
   */
  isUserRegistered(eventId: number): boolean {
    return this.registeredEventIds.has(eventId);
  }

  /**
   * Get all registered event IDs
   */
  getRegisteredEventIds(): Set<number> {
    return new Set(this.registeredEventIds);
  }

  /**
   * Get user registrations as observable
   */
  getUserRegistrations(): Observable<UserRegistration[]> {
    return this.userRegistrations$;
  }

  /**
   * Update event registration status in a list of events
   */
  updateEventsWithRegistrationStatus(events: any[]): any[] {
    return events.map((event) => ({
      ...event,
      isUserRegistered: this.isUserRegistered(event.id),
    }));
  }

  /**
   * Refresh registrations (useful after login/logout)
   */
  refreshRegistrations(): void {
    this.loadUserRegistrations();
  }

  /**
   * Clear all registrations (useful on logout)
   */
  clearRegistrations(): void {
    this.registeredEventIds.clear();
    this.userRegistrationsSubject.next([]);
  }

  /**
   * Add a registration locally
   */
  private addRegistration(eventId: number): void {
    if (!this.registeredEventIds.has(eventId)) {
      this.registeredEventIds.add(eventId);
      const newRegistration: UserRegistration = {
        eventId,
        registeredAt: new Date(),
      };

      const currentRegistrations = this.userRegistrationsSubject.value;
      this.userRegistrationsSubject.next([
        ...currentRegistrations,
        newRegistration,
      ]);
    }
  }

  /**
   * Update registrations list
   */
  private updateRegistrations(registrations: UserRegistration[]): void {
    this.registeredEventIds.clear();
    registrations.forEach((reg) => this.registeredEventIds.add(reg.eventId));
    this.userRegistrationsSubject.next(registrations);
  }
}
