import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import {
  NotificationService,
  NotificationViewModel,
} from '../../../Core/Services/notification.service';
import { AuthService } from '../../../Core/Services/auth.service';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  notifications: NotificationViewModel[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  loading = false;
  error = '';
  isAuthenticated = false;

  private unreadCountSubscription?: Subscription;
  private refreshSubscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    if (this.isAuthenticated) {
      this.loadNotifications();
      this.loadUnreadCount();

      // Refresh notifications every 30 seconds
      this.refreshSubscription = interval(30000).subscribe(() => {
        this.loadUnreadCount();
      });
    }
  }

  ngOnDestroy(): void {
    this.unreadCountSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = '';

    this.notificationService.getUserNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.error = error.message || 'Failed to load notifications.';
        this.loading = false;
      },
    });
  }

  loadUnreadCount(): void {
    this.unreadCountSubscription = this.notificationService
      .getUnreadCount()
      .subscribe({
        next: (count) => {
          this.unreadCount = count;
        },
        error: (error) => {
          console.error('Error loading unread count:', error);
        },
      });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: NotificationViewModel): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.loadUnreadCount();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        },
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(
          (notification) => (notification.isRead = true)
        );
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      },
    });
  }

  deleteNotification(notification: NotificationViewModel, event: Event): void {
    event.stopPropagation();

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          (n) => n.id !== notification.id
        );
        this.loadUnreadCount();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      },
    });
  }

  navigateToContent(notification: NotificationViewModel): void {
    this.markAsRead(notification);

    if (notification.contentId) {
      switch (notification.contentType) {
        case 'Story':
          this.router.navigate(['/story-details', notification.contentId]);
          break;
        case 'Event':
          this.router.navigate(['/event-details', notification.contentId]);
          break;
        case 'Community':
          this.router.navigate(['/community-details', notification.contentId]);
          break;
      }
    }

    this.isDropdownOpen = false;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'Like':
        return 'fas fa-heart';
      case 'Comment':
        return 'fas fa-comment';
      case 'Approval':
        return 'fas fa-check-circle';
      case 'General':
        return 'fas fa-bell';
      default:
        return 'fas fa-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'Like':
        return 'text-danger';
      case 'Comment':
        return 'text-primary';
      case 'Approval':
        return 'text-success';
      case 'General':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  }

  formatDate(date: string): string {
    // Ensure the date is parsed as UTC by adding 'Z' if it doesn't have timezone info
    const dateString = date.includes('Z') ? date : date + 'Z';
    const dateObj = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - dateObj.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}
