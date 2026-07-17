import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';

import {
  IonContent,
  IonIcon,
  IonProgressBar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  homeOutline,
  receiptOutline,
  walletOutline,
  pieChartOutline,
  chatbubbleEllipsesOutline,
  notificationsOutline,
  addOutline,
  removeOutline,
  sparklesOutline,
  trendingUpOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonProgressBar
  ]
})
export class HomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userStateService = inject(UserStateService);
  private readonly userPreferencesService = inject(UserPreferencesService);

  userName = 'there';
  currency = localStorage.getItem('currency') || 'XAF';

  totalBalance = 2845000;
  monthlySpent = 125000;
  monthlyBudget = 250000;
  savingsProgress = 72;

  activeTab = 'home';

  tabs = [
    { id: 'home', label: 'Home', icon: 'home-outline' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt-outline' },
    { id: 'savings', label: 'Savings', icon: 'wallet-outline' },
    { id: 'budget', label: 'Budget', icon: 'pie-chart-outline' },
    { id: 'chat', label: 'Chat', icon: 'chatbubble-ellipses-outline' }
  ];

  quickActions = [
    { label: 'Add Expense', icon: 'remove-outline', action: 'add-expense' },
    { label: 'Add Savings', icon: 'add-outline', action: 'add-savings' },
    { label: 'View Budget', icon: 'pie-chart-outline', action: 'view-budget' }
  ];

  recentTransactions = [
    { title: 'Transport', category: 'Expense', amount: 1500, type: 'expense' },
    { title: 'Lunch', category: 'Food', amount: 2500, type: 'expense' },
    { title: 'Savings Deposit', category: 'Savings', amount: 10000, type: 'income' }
  ];

  constructor() {
    addIcons({
      homeOutline,
      receiptOutline,
      walletOutline,
      pieChartOutline,
      chatbubbleEllipsesOutline,
      notificationsOutline,
      addOutline,
      removeOutline,
      sparklesOutline,
      trendingUpOutline,
      chevronForwardOutline
    });

    const currentPath = this.router.url.replace('/', '');
    this.activeTab = currentPath || 'home';
  }

  ngOnInit(): void {
    const backendUser = this.userStateService.getUser();
    const firebaseUser = this.authService.getCurrentUser();
    const preferences = this.userPreferencesService.getPreferences();

    this.userName =
      [backendUser?.firstName, backendUser?.lastName].filter(Boolean).join(' ').trim() ||
      backendUser?.firstName ||
      firebaseUser?.displayName ||
      firebaseUser?.email?.split('@')[0] ||
      'there';

    this.currency = preferences?.preferredCurrency || localStorage.getItem('currency') || 'XAF';
  }

  get budgetUsedPercentage(): number {
    if (this.monthlyBudget === 0) return 0;
    return this.monthlySpent / this.monthlyBudget;
  }

  get budgetLeft(): number {
    return this.monthlyBudget - this.monthlySpent;
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    void this.router.navigateByUrl(`/${tab}`);
  }

  goToProfile(): void {
    void this.router.navigateByUrl('/profile');
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'add-expense':
        void this.router.navigateByUrl('/expenses');
        break;
      case 'add-savings':
        void this.router.navigateByUrl('/savings');
        break;
      case 'view-budget':
        void this.router.navigateByUrl('/budget');
        break;
      default:
        break;
    }
  }

  formatMoney(amount: number): string {
    return `${this.currency || 'XAF'} ${Number(amount || 0).toLocaleString()}`;
  }

}
