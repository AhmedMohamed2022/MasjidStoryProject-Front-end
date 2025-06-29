import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateUtilityService {
  /**
   * Formats a date string to relative time in user's local timezone
   * @param dateString - Date string from backend (assumed to be UTC)
   * @returns Formatted relative time string
   */
  formatRelativeTime(dateString: string): string {
    try {
      // Parse the date string from backend
      const utcDate = new Date(dateString);

      // Validate the date
      if (isNaN(utcDate.getTime())) {
        console.warn('Invalid date format:', dateString);
        return 'Unknown time';
      }

      // Get current time
      const now = new Date();

      // Calculate the difference in milliseconds
      const diffInMs = now.getTime() - utcDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      // For older dates, show the actual date in user's local timezone
      return utcDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year:
          utcDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error(
        'Error formatting relative time:',
        error,
        'Date string:',
        dateString
      );
      return 'Unknown time';
    }
  }

  /**
   * Formats a date string to a readable date format
   * @param dateString - Date string from backend
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  /**
   * Gets the current timezone offset in hours
   * @returns Timezone offset in hours
   */
  getTimezoneOffset(): number {
    return new Date().getTimezoneOffset() / 60;
  }

  /**
   * Converts a UTC date string to local time
   * @param dateString - UTC date string
   * @returns Local date object
   */
  utcToLocal(dateString: string): Date {
    const utcDate = new Date(dateString);
    return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
  }
}
