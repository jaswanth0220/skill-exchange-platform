import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'https://example.com/api/user-profile';
  constructor(private http: HttpClient) { }
  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, profileData);
  }
  updateProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.http.post(`${this.apiUrl}/upload-profile-picture`, formData);
  }
}
