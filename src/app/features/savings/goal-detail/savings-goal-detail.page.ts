import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonProgressBar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkCircleOutline, createOutline, trashOutline, walletOutline } from 'ionicons/icons';

import { DailySavings, SavingsGoal, SavingsService } from '../../../core/services/savings.service';

@Component({
  selector: 'app-savings-goal-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonProgressBar,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './savings-goal-detail.page.html',
  styleUrls: ['./savings-goal-detail.page.scss'],
})
export class SavingsGoalDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly savingsService = inject(SavingsService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  goalId = '';
  goal: SavingsGoal | null = null;
  deposits: DailySavings[] = [];
  isLoading = true;
  isDeleting = false;
  isCompleting = false;
  errorMessage = '';

  constructor() {
    addIcons({ addOutline, checkmarkCircleOutline, createOutline, trashOutline, walletOutline });
  }

  async ngOnInit(): Promise<void> {
    this.goalId = this.route.snapshot.paramMap.get('id') || '';
    await this.loadGoal();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadGoal(false);
  }

  async loadGoal(showLoading = true): Promise<void> {
    if (!this.goalId) {
      this.errorMessage = 'Savings goal was not found.';
      this.isLoading = false;
      return;
    }

    this.isLoading = showLoading;
    this.errorMessage = '';

    try {
      const [goal, daily] = await Promise.all([
        this.savingsService.getGoalById(this.goalId),
        this.savingsService.getDailySavings(),
      ]);
      this.goal = goal;
      this.deposits = daily.entries.filter((entry) => entry.goalId === goal.id).slice(0, 8);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not load this savings goal.';
    } finally {
      this.isLoading = false;
    }
  }

  addSavings(): void {
    void this.router.navigate(['/savings/add'], { queryParams: { goalId: this.goalId } });
  }

  editGoal(): void {
    void this.router.navigateByUrl(`/savings/goals/${this.goalId}/edit`);
  }

  async completeGoal(): Promise<void> {
    if (!this.goal || this.isCompleting) return;
    this.isCompleting = true;
    this.errorMessage = '';

    try {
      this.goal = await this.savingsService.completeGoal(this.goal.id);
      await this.showToast('Savings goal marked complete.');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not complete this goal.';
    } finally {
      this.isCompleting = false;
    }
  }

  async confirmDelete(): Promise<void> {
    if (!this.goal || this.isDeleting) return;

    const alert = await this.alertController.create({
      header: 'Delete savings goal?',
      message: 'Your linked savings history will stay safe, but this goal will be removed.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => void this.deleteGoal() },
      ],
    });
    await alert.present();
  }

  progress(): number {
    if (!this.goal) return 0;
    const target = Number(this.goal.targetAmount || 0);
    if (!target) return 0;
    return Math.max(0, Math.min(Number(this.goal.currentAmount || 0) / target, 1));
  }

  progressPercent(): number {
    return Math.round(this.progress() * 100);
  }

  remaining(): number {
    if (!this.goal) return 0;
    return Math.max(Number(this.goal.targetAmount || 0) - Number(this.goal.currentAmount || 0), 0);
  }

  formatMoney(amount: string | number, currency = this.goal?.currency || 'XAF'): string {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }

  formatDate(date: string | null): string {
    if (!date) return 'No target date';
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
  }

  trackByEntryId(_: number, entry: DailySavings): string {
    return entry.id;
  }

  private async deleteGoal(): Promise<void> {
    if (!this.goal) return;
    this.isDeleting = true;
    this.errorMessage = '';

    try {
      await this.savingsService.deleteGoal(this.goal.id);
      await this.showToast('Savings goal deleted.');
      await this.router.navigateByUrl('/savings');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'We could not delete this goal.';
    } finally {
      this.isDeleting = false;
    }
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1800, position: 'bottom', color: 'success' });
    await toast.present();
  }
}
