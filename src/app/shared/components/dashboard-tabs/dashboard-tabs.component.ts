import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chatbubbleEllipsesOutline,
  homeOutline,
  pieChartOutline,
  receiptOutline,
  walletOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard-tabs',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './dashboard-tabs.component.html',
  styleUrls: ['./dashboard-tabs.component.scss'],
})
export class DashboardTabsComponent {
  private readonly router = inject(Router);

  readonly tabs = [
    { id: 'home', label: 'Home', icon: 'home-outline', route: '/home' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt-outline', route: '/expenses' },
    { id: 'savings', label: 'Savings', icon: 'wallet-outline', route: '/savings' },
    { id: 'budget', label: 'Budget', icon: 'pie-chart-outline', route: '/budget' },
    { id: 'chat', label: 'Chat', icon: 'chatbubble-ellipses-outline', route: '/chat' },
  ];

  constructor() {
    addIcons({
      chatbubbleEllipsesOutline,
      homeOutline,
      pieChartOutline,
      receiptOutline,
      walletOutline,
    });
  }

  get activeTab(): string {
    const firstSegment = this.router.url.split('?')[0].split('/').filter(Boolean)[0];
    return firstSegment === 'dashboard' ? 'home' : firstSegment || 'home';
  }

  setTab(route: string): void {
    void this.router.navigateByUrl(route);
  }
}
