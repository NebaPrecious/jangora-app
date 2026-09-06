import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationFocusService {
  blurActiveElement(): void {
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }
}
