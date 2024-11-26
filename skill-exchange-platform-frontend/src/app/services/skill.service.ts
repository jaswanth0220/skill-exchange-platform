// skill.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
// import { Skill } from '../models/skill.model';
import { User } from '../models/user.model';
import { Skill } from '../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) { }

  // skill.service.ts
  getSkills(): Observable<Skill[]> {
    return this.http.get<User[]>(`${this.apiUrl}`).pipe(
      map(users => {
        const allSkills: Skill[] = [];
        users.forEach(user => {
          if (user.offeredSkills && user.offeredSkills.length > 0) {
            const userSkills = user.offeredSkills.map(skill => ({
              ...skill,
              userId: user._id, // MongoDB _id
              offeredBy: user.name,
              location: user.location
            }));
            allSkills.push(...userSkills);
          }
        });
        console.log('Mapped skills:', allSkills); // Debug log
        return allSkills;
      }),
      catchError(error => {
        console.error('Error fetching skills:', error);
        throw error;
      })
    );
  }
}