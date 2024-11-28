import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadUserDetails(userId);
      }
    });
  }

  private loadUserDetails(userId: string): void {
    this.isLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load user details';
        console.error('Error loading user details:', error);
        this.router.navigate(['/']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  startChat(): void {
    if (!this.user) return;
    
    this.chatService.createChatRoom(this.user._id).subscribe({
      next: (chatRoom) => {
        this.router.navigate(['/chat'], { queryParams: { room: chatRoom._id } });
      },
      error: (error) => {
        console.error('Error creating chat room:', error);
        alert('Failed to start chat');
      }
    });
  }
}