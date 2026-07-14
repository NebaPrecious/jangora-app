import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/auth/auth.service';
import { ApiAuthService } from './core/services/api-auth.service';
import { UserStateService } from './core/services/user-state.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly authService: AuthService,
    private readonly apiAuthService: ApiAuthService,
    private readonly userStateService: UserStateService,
  ) {}

  ngOnInit(): void {
    void this.restoreUserSession();
  }

  private async restoreUserSession(): Promise<void> {
    const firebaseUser = await this.authService.waitForAuthReady();

    if (!firebaseUser) {
      this.userStateService.clearUser();
      return;
    }

    try {
      const backendUser = await this.apiAuthService.restoreBackendUser();
      this.userStateService.setUser(backendUser);
    } catch (error: unknown) {
      this.userStateService.clearUser();
      console.warn('Unable to restore backend user session:', error);
    }
  }
}
