import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, createOutline, refreshOutline, repeatOutline, trashOutline } from 'ionicons/icons';

import { Expense, ExpensesService } from '../../../core/services/expenses.service';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './expense-detail.page.html',
  styleUrls: ['./expense-detail.page.scss'],
})
export class ExpenseDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly expensesService = inject(ExpensesService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  expense: Expense | null = null;
  isLoading = true;
  isDeleting = false;
  errorMessage = '';

  constructor() {
    addIcons({ calendarOutline, createOutline, refreshOutline, repeatOutline, trashOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.loadExpense();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadExpense(false);
  }

  async loadExpense(showLoading = true): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'We could not find this expense.';
      this.isLoading = false;
      return;
    }

    this.isLoading = showLoading;
    this.errorMessage = '';

    try {
      this.expense = await this.expensesService.getExpenseById(id);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load this expense.';
    } finally {
      this.isLoading = false;
    }
  }

  editExpense(): void {
    if (this.expense) {
      void this.router.navigateByUrl(`/expenses/${this.expense.id}/edit`);
    }
  }

  async confirmDelete(): Promise<void> {
    if (!this.expense || this.isDeleting) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Delete expense?',
      message: 'This expense will be removed from your records.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteExpense();
          },
        },
      ],
    });

    await alert.present();
  }

  goBack(): void {
    this.location.back();
  }

  formatMoney(amount: string | number, currency = this.expense?.currency || 'XAF'): string {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }

  formatDateTime(date: string | undefined): string {
    if (!date) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  }

  private async deleteExpense(): Promise<void> {
    if (!this.expense) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    try {
      await this.expensesService.deleteExpense(this.expense.id);
      await this.showToast('Expense deleted successfully.');
      await this.router.navigateByUrl('/expenses');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not delete this expense. Please try again.';
    } finally {
      this.isDeleting = false;
    }
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }
}
