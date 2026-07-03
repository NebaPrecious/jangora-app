import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  styleUrls: ['./goal.page.scss'],
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
export class GoalPage {

  selectedGoals: string[] = [];

  goals = [
    '💰 Save More',
    '📊 Budget Better',
    '🛡 Build Emergency Fund',
    '📈 Grow Wealth',
    '🎯 Become Debt Free',
    '🚀 Increase My Income'
  ];

  constructor(private router: Router) {}

  toggleGoal(goal: string) {
    const index = this.selectedGoals.indexOf(goal);

    if (index > -1) {
      this.selectedGoals.splice(index, 1);
    } else {
      this.selectedGoals.push(goal);
    }
  }

  isSelected(goal: string): boolean {
    return this.selectedGoals.includes(goal);
  }

  continue() {
    localStorage.setItem('primaryGoals', JSON.stringify(this.selectedGoals));
    this.router.navigateByUrl('/currency');
  }
}