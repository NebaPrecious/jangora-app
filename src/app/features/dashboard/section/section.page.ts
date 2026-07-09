import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonProgressBar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  homeOutline,
  receiptOutline,
  walletOutline,
  pieChartOutline,
  chatbubbleEllipsesOutline,
  addOutline,
  removeOutline,
  sparklesOutline,
} from 'ionicons/icons';

interface SectionRouteData {
  title?: string;
  description?: string;
  icon?: string;
  showQuickActions?: boolean;
}

@Component({
  selector: 'app-dashboard-section',
  standalone: true,
  templateUrl: './section.page.html',
  styleUrls: ['./section.page.scss'],
  imports: [CommonModule, IonContent, IonIcon, IonProgressBar],
})
export class SectionPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = 'home';

  tabs = [
    { id: 'home', label: 'Home', icon: 'home-outline' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt-outline' },
    { id: 'savings', label: 'Savings', icon: 'wallet-outline' },
    { id: 'budget', label: 'Budget', icon: 'pie-chart-outline' },
    { id: 'chat', label: 'Chat', icon: 'chatbubble-ellipses-outline' },
  ];

  quickActions = [
    { label: 'Add Expense', icon: 'remove-outline', action: 'add-expense' },
    { label: 'Add Savings', icon: 'add-outline', action: 'add-savings' },
  ];

  sectionTitle = 'Expenses';
  sectionDescription = 'Track your spending with clarity and calm.';
  sectionIcon = 'receipt-outline';
  showQuickActions = true;

  constructor() {
    addIcons({
      homeOutline,
      receiptOutline,
      walletOutline,
      pieChartOutline,
      chatbubbleEllipsesOutline,
      addOutline,
      removeOutline,
      sparklesOutline,
    });

    const currentPath = this.router.url.replace('/', '');
    this.activeTab = currentPath || 'home';
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const section = (data as { section?: SectionRouteData }).section;
      this.sectionTitle = section?.title ?? 'Expenses';
      this.sectionDescription = section?.description ?? 'Track your spending with clarity and calm.';
      this.sectionIcon = section?.icon ?? 'receipt-outline';
      this.showQuickActions = section?.showQuickActions ?? true;
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    void this.router.navigateByUrl(`/${tab}`);
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'add-expense':
        void this.router.navigateByUrl('/expenses');
        break;
      case 'add-savings':
        void this.router.navigateByUrl('/savings');
        break;
      default:
        break;
    }
  }
}
