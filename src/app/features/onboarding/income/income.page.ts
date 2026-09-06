import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationFocusService } from '../../../core/services/navigation-focus.service';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonProgressBar,
  IonFooter
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-income',
  templateUrl: './income.page.html',
  styleUrls: ['./income.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonProgressBar,
    IonFooter
  ]
})
export class IncomePage {

  selectedIncome = '';
  isNavigating = false;

  incomeRanges = [
    'Under 100,000',
    '100,000 - 300,000',
    '300,000 - 500,000',
    '500,000 - 1,000,000',
    '1,000,000 - 3,000,000',
    'Above 3,000,000'
  ];

  constructor(
    private router: Router,
    private readonly navigationFocusService: NavigationFocusService,
  ) {}

  selectIncome(range: string) {
    this.selectedIncome = range;
  }

  async continue() {
    if (this.isNavigating || !this.selectedIncome) return;
    this.isNavigating = true;
    this.navigationFocusService.blurActiveElement();
    localStorage.setItem('incomeRange', this.selectedIncome);
    await this.router.navigateByUrl('/notifications');
  }
}
