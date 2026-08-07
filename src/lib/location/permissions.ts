export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

/**
 * Resolves the browser's current geolocation permission state.
 */
export function permissionState(): PermissionState {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return 'unsupported';
  const api = navigator.permissions;
  if (!api || typeof api.query !== 'function') {
    return 'prompt';
  }
  return 'prompt'; // resolved asynchronously via requestPermission()
}

/**
 * Requests geolocation permission, resolving once granted (or denied).
 * Resolves `true` when the browser will allow position reads.
 */
export function requestPermission(timeoutMs = 10_000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      resolve(false);
      return;
    }

    const finish = (ok: boolean) => {
      clearTimeout(timer);
      resolve(ok);
    };

    const timer = setTimeout(() => {
      // If the browser didn't answer (e.g. headless / non-blocking prompt),
      // fall back to a direct getCurrentPosition probe.
      probe(finish);
    }, timeoutMs);

    const probe = (done: (ok: boolean) => void) => {
      navigator.geolocation.getCurrentPosition(
        () => done(true),
        () => done(false),
        { enableHighAccuracy: false, timeout: 5_000, maximumAge: 0 }
      );
    };

    const permissions = navigator.permissions;
    if (permissions && typeof permissions.query === 'function') {
      permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          if (status.state === 'granted') {
            finish(true);
            return;
          }
          if (status.state === 'denied') {
            finish(false);
            return;
          }
          // 'prompt' — must trigger a user gesture; probe it directly.
          probe(finish);
        })
        .catch(() => probe(finish));
    } else {
      probe(finish);
    }
  });
}
