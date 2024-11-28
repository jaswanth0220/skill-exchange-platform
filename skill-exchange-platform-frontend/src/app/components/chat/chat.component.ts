import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message, ChatRoom } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  currentUser: any;
  chatRooms: ChatRoom[] = [];
  currentRoom: ChatRoom | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private chatService: ChatService, 
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadChatRooms();
    
    this.chatService.getNewMessages().subscribe(message => {
      if (this.currentRoom && message.roomId === this.currentRoom._id) {
        // Only add the message if it's not already in the array
        if (!this.messages.some(m => m._id === message._id)) {
          this.messages = [...this.messages, message];
        }
      }
    });

    // Handle room parameter from URL
    this.route.queryParams.subscribe(params => {
      const roomId = params['room'];
      if (roomId) {
        this.chatService.getChatRooms().subscribe({
          next: (rooms) => {
            const room = rooms.find(r => r._id === roomId);
            if (room) {
              this.selectRoom(room);
            }
          }
        });
      }
    });
  }

  loadChatRooms(): void {
    this.isLoading = true;
    this.chatService.getChatRooms().subscribe({
      next: (rooms) => {
        this.chatRooms = rooms;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load chat rooms';
        this.isLoading = false;
      }
    });
  }

  selectRoom(room: ChatRoom): void {
    this.currentRoom = room;
    this.messages = [];
    this.loadMessages(room._id);
  }

  loadMessages(roomId: string): void {
    this.isLoading = true;
    this.chatService.getMessages(roomId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load messages';
        this.isLoading = false;
      }
    });
  }

  getOtherParticipantName(room: ChatRoom): string {
    if (!room || !room.participants) return 'Unknown';
    const otherParticipant = room.participants.find(p => p._id !== this.currentUser?._id);
    return otherParticipant?.name || 'Unknown';
  }

  sendMessage(): void {
    if (!this.currentRoom || !this.newMessage.trim()) return;
    const content = this.newMessage.trim();
    this.newMessage = '';
    this.chatService.sendMessage(this.currentRoom._id, content).subscribe({
      next: (message) => {
        if (!this.messages.some(m => m._id === message._id)) {
          this.messages = [...this.messages, message];
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to send message';
      }
    });
  }
}