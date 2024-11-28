import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadChatRooms();
    
    // Subscribe to new messages
    this.chatService.getNewMessages().subscribe(message => {
      console.log('Received message in component:', message);
      if (this.currentRoom && message.roomId === this.currentRoom._id) {
        // Check if message already exists
        if (!this.messages.some(m => m._id === message._id)) {
          this.messages = [...this.messages, message];
          this.changeDetectorRef.detectChanges();
          this.scrollToBottom();
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

  private scrollToBottom(): void {
    setTimeout(() => {
      const messageContainer = document.querySelector('.overflow-y-auto');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 0);
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
    this.chatService.joinRoom(room._id); // Join the socket room
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
    this.newMessage = ''; // Clear input immediately

    this.chatService.sendMessage(this.currentRoom._id, content).subscribe({
      next: (message) => {
        // Message will be added through the socket subscription
        console.log('Message sent successfully:', message);
      },
      error: (error) => {
        this.errorMessage = 'Failed to send message';
        console.error('Error sending message:', error);
      }
    });
  }
}