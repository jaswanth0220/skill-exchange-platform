import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      catchError((error) => {
        console.error('Failed to fetch user profile', error);
        return throwError(() => new Error('Failed to fetch user profile.'));
      })
    );
  }

  getUser(): Observable<User> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      catchError((error) => {
        console.error('Failed to fetch user profile', error);
        return throwError(() => new Error('Failed to fetch user profile.'));
      })
    );
  }
  /**
   * Update the user profile on the backend.
   * @param updatedUser - The user object with updated data.
   * @returns {Observable<any>} - The response from the server.
   */
  updateUser(updatedUser: User): Observable<any> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.put(`${this.apiUrl}/${userId}`, updatedUser).pipe(
      catchError((error) => {
        console.error('Failed to update user profile', error);
        return throwError(() => new Error('Failed to update user profile.'));
      })
    );
  }

  /**
   * Update the profile picture by uploading a file.
   * @param file - The profile picture file to upload.
   * @returns {Observable<any>} - The response from the server.
   */
  updateProfilePicture(file: File): Observable<any> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.http.post(`${this.apiUrl}/${userId}/profile-picture`, formData).pipe(
      catchError((error) => {
        console.error('Failed to upload profile picture', error);
        return throwError(() => new Error('Failed to upload profile picture.'));
      })
    );
  }
}