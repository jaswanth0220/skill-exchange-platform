import { Component, OnInit } from '@angular/core';
import { RouterOutlet,RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';
import { NotificationsComponent } from "./components/notifications/notifications.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NotificationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'skill-exchange-platform-frontend';
  isAuthenticated:boolean = false;
  showNotifications = false;
  unreadCount = 0;

  constructor(private authService:AuthService,private notificationService: NotificationService){
  }

  ngOnInit() {
    this.authService.getAuthStatus().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.loadUnreadCount();
      }
    });
  }
  loadUnreadCount() {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.unreadCount = notifications.filter(n => !n.read).length;
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
  logout(){
    this.authService.logout();
  }
}
