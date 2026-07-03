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
  
  {
    path: 'welcome',
    loadComponent: () => import('./features/auth/welcome/welcome.page').then( m => m.WelcomePage)
  },
  {
    path: 'goal',
    loadComponent: () => import('./features/onboarding/goal/goal.page').then( m => m.GoalPage)
  },
  {
    path: 'currency',
    loadComponent: () => import('./features/onboarding/currency/currency.page').then( m => m.CurrencyPage)
  },
  {
    path: 'income',
    loadComponent: () => import('./features/onboarding/income/income.page').then( m => m.IncomePage)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/onboarding/notifications/notifications.page').then( m => m.NotificationsPage)
  },
  {
    path: 'ai-introduction',
    loadComponent: () => import('./features/onboarding/ai-introduction/ai-introduction.page').then( m => m.AiIntroductionPage)
  },
  {
  path: 'goal',
  loadComponent: () =>
    import('./features/onboarding/goal/goal.page').then(
      (m) => m.GoalPage
    ),
  },
  {
  path: 'currency',
  loadComponent: () =>
    import('./features/onboarding/currency/currency.page').then(
      (m) => m.CurrencyPage
    ),
},
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.page').then( m => m.VerifyEmailPage)
  },
];
