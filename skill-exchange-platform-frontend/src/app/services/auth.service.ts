import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/users'; // Replace with your backend API URL
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null); // Store user data locally

  constructor(private http: HttpClient, private router: Router) {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.isAuthenticated.next(true);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  getCurrentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData).pipe(
      catchError((err) => {
        console.error('Signup failed', err);
        return throwError(() => new Error('Signup failed. Please try again.'));
      })
    );
  }

  // auth.service.ts
login(credentials: { email: string; password: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
    tap((response: any) => {
      if (response?.user && response?.token) {
        localStorage.setItem('userId', response.user._id);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token); // Store the JWT token
        this.isAuthenticated.next(true);
        this.currentUserSubject.next(response.user);
      } else {
        throw new Error('Invalid response format from server');
      }
    }),
    catchError((err) => {
      console.error('Login failed', err);
      localStorage.removeItem('userId');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token'); // Remove token on error
      this.isAuthenticated.next(false);
      this.currentUserSubject.next(null);
      return throwError(() => new Error(err?.error?.message || 'Login failed. Please try again.'));
    })
  );
}

  logout(): void {
    localStorage.removeItem('currentUser');
    this.isAuthenticated.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }
}
