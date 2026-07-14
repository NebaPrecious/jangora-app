import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

export function isBackendApiUrl(url: string): boolean {
  return url === API_BASE_URL || url.startsWith(`${API_BASE_URL}/`);
}
