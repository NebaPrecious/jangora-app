import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { isBackendApiUrl } from '../api/api.config';

export const firebaseAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isBackendApiUrl(request.url)) {
    return next(request);
  }

  const authService = inject(AuthService);

  return from(authService.waitForAuthReady()).pipe(
    switchMap((firebaseUser) => from(firebaseUser ? firebaseUser.getIdToken() : Promise.resolve(null))),
    switchMap((idToken) => {
      if (!idToken) {
        return next(request);
      }

      return next(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${idToken}`,
          },
        }),
      );
    }),
  );
};
