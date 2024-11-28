import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Notification {
  message: string;
  from: {
    _id: string;
    name: string;
  };
  createdAt: Date;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  errorMessage: string = '';
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        console.log('Raw notifications:', notifications);
        this.notifications = notifications;
        console.log('Processed notifications:', this.notifications);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load notifications';
        console.error('Error loading notifications:', error);
      }
    });
  }
}