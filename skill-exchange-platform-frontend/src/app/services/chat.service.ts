import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { catchError } from 'rxjs/operators';

export interface Message {
  _id: string;
  sender: string;
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
  participants: ChatParticipant[];
  lastMessage?: Message;
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
      }
    });

    this.socket.on('newMessage', (message: Message) => {
      this.newMessageSubject.next(message);
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
    return new Observable(observer => {
      this.socket.emit('sendMessage', { roomId, content }, (response: Message) => {
        observer.next(response);
        observer.complete();
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
}