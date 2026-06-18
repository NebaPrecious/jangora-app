import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },

  {
    path: 'splash',
    loadComponent: () =>
      import('./features/auth/splash/splash.page').then(
        (m) => m.SplashPage,
      ),
  },

  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding/onboarding.page').then(
        (m) => m.OnboardingPage,
      ),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then(
        (m) => m.LoginPage,
      ),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then(
        (m) => m.RegisterPage,
      ),
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './features/auth/forgot-password/forgot-password.page'
      ).then((m) => m.ForgotPasswordPage),
  },
];