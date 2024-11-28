import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SkillListingComponent } from './components/skill-listing/skill-listing.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
  { path: 'profile/:id', component: UserProfileComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'skills', component: SkillListingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' },
];
