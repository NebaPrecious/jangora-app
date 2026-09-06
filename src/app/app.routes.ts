import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

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
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.page').then( m => m.VerifyEmailPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/dashboard/home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./features/expenses/list/expenses-list.page').then((m) => m.ExpensesListPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'expenses/add',
    loadComponent: () =>
      import('./features/expenses/form/expense-form.page').then((m) => m.ExpenseFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'expenses/:id',
    loadComponent: () =>
      import('./features/expenses/detail/expense-detail.page').then((m) => m.ExpenseDetailPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'expenses/:id/edit',
    loadComponent: () =>
      import('./features/expenses/form/expense-form.page').then((m) => m.ExpenseFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/history/transactions-history.page').then((m) => m.TransactionsHistoryPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'savings',
    loadComponent: () =>
      import('./features/savings/home/savings-home.page').then((m) => m.SavingsHomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'savings/goals/new',
    loadComponent: () =>
      import('./features/savings/goal-form/savings-goal-form.page').then((m) => m.SavingsGoalFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'savings/goals/:id',
    loadComponent: () =>
      import('./features/savings/goal-detail/savings-goal-detail.page').then((m) => m.SavingsGoalDetailPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'savings/goals/:id/edit',
    loadComponent: () =>
      import('./features/savings/goal-form/savings-goal-form.page').then((m) => m.SavingsGoalFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'savings/add',
    loadComponent: () =>
      import('./features/savings/add-savings/add-savings.page').then((m) => m.AddSavingsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'savings/daily',
    loadComponent: () =>
      import('./features/savings/daily-savings/daily-savings.page').then((m) => m.DailySavingsPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'budget',
    loadComponent: () =>
      import('./features/dashboard/section/section.page').then((m) => m.SectionPage),
    canActivate: [AuthGuard],
    data: {
      section: {
        title: 'Budget',
        description: 'See the monthly plan and keep your spending on track.',
        icon: 'pie-chart-outline',
        showQuickActions: false,
      },
    },
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./features/dashboard/section/section.page').then((m) => m.SectionPage),
    canActivate: [AuthGuard],
    data: {
      section: {
        title: 'Chat',
        description: 'Ask Jangora for personalized money insights and nudges.',
        icon: 'chatbubble-ellipses-outline',
        showQuickActions: false,
      },
    },
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/settings/profile/profile.page').then( m => m.ProfilePage),
    canActivate: [AuthGuard],
  },
];
