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
  IonFooter
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-ai-introduction',
  templateUrl: './ai-introduction.page.html',
  styleUrls: ['./ai-introduction.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
export class AiIntroductionPage {

  loading = false;

  constructor(private router: Router) {}

  async continue() {
    this.loading = true;

    await new Promise(resolve => setTimeout(resolve, 700));

    this.router.navigateByUrl('/register');
  }
}