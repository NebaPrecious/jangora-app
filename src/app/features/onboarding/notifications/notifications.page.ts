import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonProgressBar,
  IonIcon,
  IonFooter
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  walletOutline,
  calendarOutline,
  analyticsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonProgressBar,
    IonIcon,
    IonFooter
  ]
})
export class NotificationsPage {

  notifications = [
    {
      title: 'Smart Reminders',
      subtitle: 'Never miss a financial task',
      icon: 'notifications-outline'
    },
    {
      title: 'Savings Goal Alerts',
      subtitle: 'Stay on track with your goals',
      icon: 'wallet-outline'
    },
    {
      title: 'Bill Payment Reminders',
      subtitle: 'Avoid late payment fees',
      icon: 'calendar-outline'
    },
    {
      title: 'Weekly Financial Summary',
      subtitle: 'Receive your weekly money report',
      icon: 'analytics-outline'
    }
  ];

  selected: string[] = [];

  constructor(private router: Router) {
    addIcons({
      notificationsOutline,
      walletOutline,
      calendarOutline,
      analyticsOutline
    });
  }

  toggle(item: string) {
    const index = this.selected.indexOf(item);

    if (index > -1) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push(item);
    }
  }

  isSelected(item: string) {
    return this.selected.includes(item);
  }

  continue() {
    localStorage.setItem('notifications', JSON.stringify(this.selected));
    this.router.navigateByUrl('/ai-introduction');
  }
}