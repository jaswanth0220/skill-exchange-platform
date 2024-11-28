// user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute,Router } from '@angular/router';
import { User } from '../../models/user.model';
// import { UserProfileService } from '../../services/user-profile.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  previewImage: string | ArrayBuffer | null = null;
  isCurrentUserProfile = false;
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router 
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id']; 
      console.log('Route parameter userId:', userId);

      // Validate the userId
      if (userId && userId !== 'undefined') {
        // Viewing another user's profile
        this.loadUserProfile(userId);
      } else {
        // If no valid user ID, try to load current user's profile or redirect
        this.loadCurrentUserProfile();
      }
    });
  }
  private loadCurrentUserProfile(): void {
    this.isLoading = true;
    this.isCurrentUserProfile = true;
    this.userService.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.initializeFormWithUser(user);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile';
        console.error('Error loading profile:', error);
        // Redirect to home or login if profile can't be loaded
        this.router.navigate(['/']);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  private loadUserProfile(userId: string): void {
    console.log('Loading user profile:', userId);
    this.isLoading = true;
    this.isCurrentUserProfile = false;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.initializeFormWithUser(user);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load user profile';
        console.error('Error loading user profile:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  private initializeFormWithUser(user: User): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio
    });
    
    // Disable form for non-current user profiles
    if (!this.isCurrentUserProfile) {
      this.profileForm.disable();
    }
  }
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();
  
      // Preview the image
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
  
      // Update the form value for profile image
      this.profileForm.patchValue({ profileImage: file });
    }
  }
  
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      location: ['', Validators.required],
      bio: ['', [Validators.required, Validators.maxLength(500)]],
      profileImage: [null]
    });
  }

  
  openModal(): void {
    if (this.user) {
      // Reset form with current user data
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        location: this.user.location,
        bio: this.user.bio
      });
      
      const modal = document.getElementById('edit_profile_modal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }
  }

  closeModal(): void {
    const modal = document.getElementById('edit_profile_modal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.errorMessage = '';
  }

  async updateProfile(): Promise<void> {
    if (!this.isCurrentUserProfile) return;
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      try {
        const updatedUser: User = {
          ...this.user,
          ...this.profileForm.value,
        };
  
        // If there's a profile image to upload, update it
        if (this.profileForm.value.profileImage) {
          await this.userService.updateProfilePicture(this.profileForm.value.profileImage).toPromise();
        }
  
        await this.userService.updateUser(updatedUser).toPromise();
        this.user = await firstValueFrom(this.userService.getUser());
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => (this.successMessage = ''), 3000); // Clear after 3 seconds
        this.closeModal();
      } catch (error: any) {
        this.errorMessage = error?.message || 'Failed to update profile';
      } finally {
        this.isLoading = false;
      }
    }
  }
  
  
  get formControls() {
    return this.profileForm.controls;
  }
}