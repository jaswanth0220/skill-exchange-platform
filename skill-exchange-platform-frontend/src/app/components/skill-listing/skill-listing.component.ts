import { Component, OnInit } from '@angular/core';
import { SkillService } from '../../services/skill.service';
import { Skill } from '../../models/skill.model';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-skill-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-listing.component.html',
  styleUrl: './skill-listing.component.css'
})
export class SkillListingComponent implements OnInit {
  skills: Skill[] = [];
  originalSkills: Skill[] = [];
  isLoading = false;
  errorMessage = '';
  currentLocationFilter = '';
  currentLevelFilter = '';
  showSuccessMessage: boolean;

  constructor(
    private skillService: SkillService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.showSuccessMessage = false;
  }

  contactTeacher(skill: Skill): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.notificationService.sendContactRequest(
      skill.userId, // Add userId to skill interface
      skill.id,
      skill.name
    ).subscribe({
      next: () => {
        // Show success message
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
      },
      error: (error) => {
        console.error('Failed to send contact request:', error);
        this.errorMessage = 'Failed to send contact request';
      }
    });
  }

  ngOnInit() {
    this.loadSkills();
  }

  private loadSkills() {
    this.isLoading = true;
    this.skillService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills;
        this.originalSkills = [...skills];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load skills';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  private applyFilters(): void {
    this.skills = this.originalSkills.filter(skill => {
      const matchesLocation = !this.currentLocationFilter || 
        skill.location.toLowerCase().includes(this.currentLocationFilter.toLowerCase());
      const matchesLevel = !this.currentLevelFilter || 
        skill.level === this.currentLevelFilter;
      return matchesLocation && matchesLevel;
    });
  }

  filterByLocation(event: Event): void {
    this.currentLocationFilter = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  filterByLevel(event: Event): void {
    this.currentLevelFilter = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
}
