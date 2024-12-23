import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { catchError } from 'rxjs/operators';

export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  receiver: string;
  content: string;
  createdAt: Date;
  read: boolean;
  roomId: string;
}
export interface ChatParticipant {
  _id: string;
  name: string;
  profilePicture?: string;
}

export interface ChatRoom {
  _id: string;
  participants: any[];
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  unreadCount: number;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/chat';
  private socket: Socket;
  private newMessageSubject = new Subject<Message>();

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['websocket']
    });

    this.socket.on('newMessage', (message: Message) => {
      console.log('New message received in service:', message);
      this.newMessageSubject.next(message);
      this.getChatRooms().subscribe();
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getChatRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching chat rooms:', error);
        throw error;
      })
    );
  }

  getMessages(roomId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/rooms/${roomId}/messages`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching messages:', error);
        throw error;
      })
    );
  }

  getNewMessages(): Observable<Message> {
    return this.newMessageSubject.asObservable();
  }

  sendMessage(roomId: string, content: string): Observable<Message> {
    const message = { roomId, content };
    return new Observable(observer => {
      this.socket.emit('sendMessage', message, (response: any) => {
        if (response.error) {
          observer.error(response.error);
        } else {
          observer.next(response);
          observer.complete();
        }
      });
    });
  }

  createChatRoom(userId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(
      `${this.apiUrl}/rooms`, 
      { userId }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error creating chat room:', error);
        throw error;
      })
    );
  }

  joinRoom(roomId: string): void {
    console.log('Joining room:', roomId);
    this.socket.emit('joinRoom', roomId);
  }

  markMessagesAsRead(roomId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/rooms/${roomId}/read`, {}, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error marking messages as read:', error);
        throw error;
      })
    );
  }

  getTotalUnreadCount(): Observable<number> {
    return this.getChatRooms().pipe(
      map(rooms => rooms.reduce((total, room) => total + (room.unreadCount || 0), 0))
    );
  }
}