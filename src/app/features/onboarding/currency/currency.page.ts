import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationFocusService } from '../../../core/services/navigation-focus.service';

import {
  IonContent,
  IonButton,
  IonProgressBar,
  IonSearchbar,
  IonBackButton,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonFooter
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.page.html',
  styleUrls: ['./currency.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonProgressBar,
    IonSearchbar,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonFooter
  ]
})
export class CurrencyPage {

  selectedCurrency = '';
  currencySearch = '';
  isNavigating = false;

  currencies = [
    { code: 'XAF', name: 'Central African CFA Franc' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'GHS', name: 'Ghanaian Cedi' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'UGX', name: 'Ugandan Shilling' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'RWF', name: 'Rwandan Franc' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' }
  ];

  filteredCurrencies = [...this.currencies];

  constructor(
    private router: Router,
    private readonly navigationFocusService: NavigationFocusService,
  ) {}

  filterCurrencies() {
    const search = this.currencySearch.toLowerCase();

    this.filteredCurrencies = this.currencies.filter(currency =>
      currency.code.toLowerCase().includes(search) ||
      currency.name.toLowerCase().includes(search)
    );
  }

  selectCurrency(code: string) {
    this.selectedCurrency = code;
  }

  async continue() {
    if (this.isNavigating || !this.selectedCurrency) return;
    this.isNavigating = true;
    this.navigationFocusService.blurActiveElement();
    localStorage.setItem('currency', this.selectedCurrency);
    await this.router.navigateByUrl('/income');
  }
}
