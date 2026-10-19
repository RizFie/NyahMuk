import { isMockMode } from './config';

export function photoSrc(photoUrl: string): string {
  let path = photoUrl;
  let isAbsolute = false;
  try {
    path = new URL(photoUrl).pathname;
    isAbsolute = true;
  } catch {
    // Relative photo URLs are already usable as paths.
  }

  if (isMockMode()) {
    return isAbsolute ? photoUrl : path;
  }

  return `/backend${path}`;
}
