import { Injectable } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { auth } from '../firebase/firebase.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authStateSubject = new BehaviorSubject<User | null>(null);
  readonly authState$ = this.authStateSubject.asObservable();

  private authReadyResolver: (() => void) | null = null;
  private readonly authReadyPromise = new Promise<void>((resolve) => {
    this.authReadyResolver = resolve;
  });

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.authStateSubject.next(user);
      if (this.authReadyResolver) {
        this.authReadyResolver();
        this.authReadyResolver = null;
      }
    });
  }

  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async logout() {
    return signOut(auth);
  }

  async sendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found.');
    }

    await sendEmailVerification(user);
  }

  async reloadUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    await user.reload();
    this.authStateSubject.next(auth.currentUser);
    return auth.currentUser;
  }

  async checkEmailVerified(): Promise<boolean> {
    const user = await this.reloadUser();
    return user?.emailVerified ?? false;
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    return user ? user.getIdToken() : null;
  }

  async isAuthenticated(): Promise<boolean> {
    await this.authReadyPromise;
    return !!this.authStateSubject.getValue();
  }
}
