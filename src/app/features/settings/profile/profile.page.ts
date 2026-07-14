import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth.service';
import { UserStateService } from '../../../core/services/user-state.service';
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
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, CommonModule]
})
export class ProfilePage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userStateService = inject(UserStateService);

  userName = 'Precious';
  userEmail = 'precious@example.com';
  preferredCurrency = localStorage.getItem('currency') || 'XAF';
  monthlyIncome = 450000;

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

  ngOnInit(): void {
    const backendUser = this.userStateService.getUser();
    if (backendUser) {
      this.userName = `${backendUser.firstName} ${backendUser.lastName}`.trim() || 'User';
      this.userEmail = backendUser.email;
    } else {
      const currentUser = this.authService.getCurrentUser();
      this.userName = currentUser?.displayName || 'Precious';
      this.userEmail = currentUser?.email || this.userEmail;
    }
  }

  goBack(): void {
    void this.router.navigateByUrl('/home');
  }

  formatMoney(amount: number): string {
    return `${this.preferredCurrency} ${amount.toLocaleString()}`;
  }

  async handleLogout(): Promise<void> {
    await this.authService.logout();
    this.userStateService.clearUser();
    localStorage.removeItem('registeredEmail');
    void this.router.navigateByUrl('/login');
  }

}
