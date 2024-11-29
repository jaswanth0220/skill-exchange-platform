import { Component, OnInit } from '@angular/core';
import { RouterOutlet,RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';
import { NotificationsComponent } from "./components/notifications/notifications.component";
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ChatService } from './services/chat.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NotificationsComponent, ClickOutsideDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'skill-exchange-platform-frontend';
  isAuthenticated:boolean = false;
  showNotifications = false;
  unreadCount = 0;
  unreadMessagesCount = 0;

  constructor(
    private authService:AuthService,
    private notificationService: NotificationService,
    private chatService: ChatService
  ){
  }

  ngOnInit() {
    this.authService.getAuthStatus().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.loadUnreadCount();
        this.loadUnreadMessages();
        this.chatService.getNewMessages().subscribe(() => {
          this.loadUnreadMessages();
        });
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
  loadUnreadMessages() {
    this.chatService.getTotalUnreadCount().subscribe({
      next: (count) => {
        this.unreadMessagesCount = count;
      },
      error: (error) => {
        console.error('Error loading unread messages count:', error);
      }
    });
  }
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadUnreadCount();
    }
  }
  logout(){
    this.authService.logout();
  }
}
