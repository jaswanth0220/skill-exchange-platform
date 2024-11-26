import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  currentStep = 1;
  showError = false;
  showSuccess = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      location: ['', Validators.required],
      bio: ['', [Validators.required, Validators.maxLength(500)]],
      offeredSkills: this.fb.array([this.fb.control('', Validators.required)]),
      desiredSkills: this.fb.array([this.fb.control('', Validators.required)]),
    });
  }
  nextStep(): void {
    if (this.isFirstStepValid()) {
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    this.currentStep = 1;
  }

  public isFirstStepValid(): boolean {
    const firstStepControls = ['name', 'email', 'password', 'location'];
    return firstStepControls.every(control =>
      this.signupForm.get(control)?.valid
    );
  }
  get formControls() {
    return this.signupForm.controls;
  }

  get offeredSkills(): FormArray {
    return this.signupForm.get('offeredSkills') as FormArray;
  }

  get desiredSkills(): FormArray {
    return this.signupForm.get('desiredSkills') as FormArray;
  }

  addOfferedSkill(): void {
    this.offeredSkills.push(this.fb.control('', Validators.required));
  }

  removeOfferedSkill(index: number): void {
    this.offeredSkills.removeAt(index);
  }

  addDesiredSkill(): void {
    this.desiredSkills.push(this.fb.control('', Validators.required));
  }

  removeDesiredSkill(index: number): void {
    this.desiredSkills.removeAt(index);
  }
  signup(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const formData = this.signupForm.value;
      
      const formattedOfferedSkills = formData.offeredSkills.map((skill: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: skill,
        description: `Proficient in ${skill}`,
        offeredBy: formData.name,
        location: formData.location,
        level: 'Intermediate',
        availableTimes: []
      }));

      const signupData = {
        ...formData,
        offeredSkills: formattedOfferedSkills
      };

      this.authService.signup(signupData).subscribe({
        next: () => {
          this.successMessage = 'Sign up successful! Redirecting to login...';
          this.showSuccess = true;
          setTimeout(() => {
            this.showSuccess = false;
            this.successMessage = '';
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Signup failed. Please try again.';
          this.showError = true;
          this.isLoading = false;
          setTimeout(() => {
            this.showError = false;
            this.errorMessage = '';
          }, 3000);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
