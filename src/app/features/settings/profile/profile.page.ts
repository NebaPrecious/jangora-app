import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { ApiAuthService, BackendUser } from '../../../core/services/api-auth.service';
import { BackendUserPreferences, UserPreferencesService } from '../../../core/services/user-preferences.service';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  chevronForwardOutline,
  lockClosedOutline,
  mailOutline,
  notificationsOutline,
  personOutline,
  settingsOutline,
  logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, CommonModule, FormsModule, IonButton, IonInput, IonSpinner]
})
export class ProfilePage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly apiAuthService = inject(ApiAuthService);
  private readonly userStateService = inject(UserStateService);
  private readonly userPreferencesService = inject(UserPreferencesService);

  userName = 'there';
  userEmail = '';
  verificationStatus = 'Unknown';
  preferredCurrency = localStorage.getItem('currency') || 'XAF';
  incomeRange = 'Not set';
  goalsSummary = 'Not set';
  notificationsSummary = 'Not set';

  isLoading = true;
  isEditing = false;
  isSaving = false;
  message = '';
  errorMessage = '';

  editFirstName = '';
  editLastName = '';
  editProfileImageUrl = '';

  constructor() {
    addIcons({
      cashOutline,
      chevronForwardOutline,
      lockClosedOutline,
      mailOutline,
      notificationsOutline,
      personOutline,
      settingsOutline,
      logOutOutline
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadProfileState();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadProfileState(): Promise<void> {
    const backendUser = this.userStateService.getUser();
    let preferences = this.userPreferencesService.getPreferences();

    if (!preferences) {
      try {
        preferences = await this.userPreferencesService.getMyPreferences();
      } catch {
        preferences = null;
      }
    }

    this.applyUser(backendUser);
    this.applyPreferences(preferences);
  }

  private applyUser(backendUser: BackendUser | null): void {
    if (backendUser) {
      this.userName = `${backendUser.firstName} ${backendUser.lastName}`.trim() || 'User';
      this.userEmail = backendUser.email;
      this.editFirstName = backendUser.firstName;
      this.editLastName = backendUser.lastName;
      this.editProfileImageUrl = backendUser.profileImageUrl || '';
    } else {
      const currentUser = this.authService.getCurrentUser();
      this.userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'there';
      this.userEmail = currentUser?.email || 'Not available';
      this.editFirstName = currentUser?.displayName?.split(' ')[0] || '';
      this.editLastName = currentUser?.displayName?.split(' ').slice(1).join(' ') || '';
    }

    this.verificationStatus = this.authService.getCurrentUser()?.emailVerified ? 'Verified' : 'Not verified';
  }

  private applyPreferences(preferences: BackendUserPreferences | null): void {
    this.preferredCurrency = preferences?.preferredCurrency || localStorage.getItem('currency') || 'XAF';
    this.incomeRange = preferences?.incomeRange || localStorage.getItem('incomeRange') || 'Not set';
    this.goalsSummary = preferences?.primaryGoals?.length ? preferences.primaryGoals.join(', ') : 'Not set';
    this.notificationsSummary = preferences?.notificationPreferences?.length
      ? preferences.notificationPreferences.join(', ')
      : 'None selected';
  }

  goBack(): void {
    void this.router.navigateByUrl('/home');
  }

  startEditing(): void {
    this.isEditing = true;
    this.message = '';
    this.errorMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.applyUser(this.userStateService.getUser());
  }

  async saveProfile(): Promise<void> {
    if (!this.editFirstName.trim() || !this.editLastName.trim()) {
      this.errorMessage = 'Please enter your first and last name.';
      return;
    }

    this.isSaving = true;
    this.message = '';
    this.errorMessage = '';

    try {
      const updatedUser = await this.apiAuthService.updateCurrentUser({
        firstName: this.editFirstName.trim(),
        lastName: this.editLastName.trim(),
        profileImageUrl: this.editProfileImageUrl.trim() || null,
      });
      this.userStateService.setUser(updatedUser);
      this.applyUser(updatedUser);
      this.isEditing = false;
      this.message = 'Profile updated successfully.';
    } catch {
      this.errorMessage = 'We could not update your profile. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  async handleLogout(): Promise<void> {
    await this.authService.logout();
    this.userStateService.clearUser();
    this.userPreferencesService.clearPreferences();
    localStorage.removeItem('registeredEmail');
    void this.router.navigateByUrl('/login');
  }

}
