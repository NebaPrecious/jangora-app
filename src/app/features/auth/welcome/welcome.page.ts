import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationFocusService } from '../../../core/services/navigation-focus.service';

import {
  IonContent,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton
  ]
})
export class WelcomePage {
  isNavigating = false;

  constructor(
    private router: Router,
    private readonly navigationFocusService: NavigationFocusService,
  ) {}

  async goToGoal() {
    if (this.isNavigating) return;
    this.isNavigating = true;
    this.navigationFocusService.blurActiveElement();
    await this.router.navigateByUrl('/goal');
  }

}
