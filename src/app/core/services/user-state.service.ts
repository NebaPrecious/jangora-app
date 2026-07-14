import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BackendUser } from './api-auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private readonly userSubject = new BehaviorSubject<BackendUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  getUser(): BackendUser | null {
    return this.userSubject.getValue();
  }

  setUser(user: BackendUser | null): void {
    this.userSubject.next(user);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}
