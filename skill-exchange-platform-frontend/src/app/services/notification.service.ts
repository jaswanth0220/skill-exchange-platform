// notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any[]> {
    const userId = localStorage.getItem('userId');
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/notifications`).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        throw error;
      })
    );
  }

  sendContactRequest(userId: string, skillId: string, message: string): Observable<any> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    return this.http.post(`${this.apiUrl}/${userId}/contact`, {
      skillId,
      message,
      fromUser: {
        _id: currentUser._id,
        name: currentUser.name
      }
    }).pipe(
      catchError(error => {
        console.error('Error sending contact request:', error);
        throw error;
      })
    );
  }

  markNotificationsAsRead(): Observable<any> {
    const userId = localStorage.getItem('userId');
    return this.http.put(`${this.apiUrl}/${userId}/notifications/read`, {}).pipe(
      catchError(error => {
        console.error('Error marking notifications as read:', error);
        throw error;
      })
    );
  }
}