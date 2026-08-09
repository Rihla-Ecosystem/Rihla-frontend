/**
 * RIHLA - ENV API DEBUG SCRIPT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Paste this entire file in the browser DevTools console.
 * It will test the /env endpoint and show exactly what the backend returns.
 */

(async function debugEnvApi() {
  const BASE_URL = 'http://localhost:3000/api';

  // Try to get a stored auth token
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('rihla_token') ||
    sessionStorage.getItem('accessToken') ||
    null;

  // Test coordinates (Cairo, Egypt)
  const lat = 30.0444;
  const lon = 31.2357;

  console.group('%c🔍 Rihla ENV API Debug', 'color: #7c5cbf; font-size: 14px; font-weight: bold');
  console.log('Base URL:', BASE_URL);
  console.log('Token found:', token ? `✅ ${token.substring(0, 20)}...` : '❌ No token in storage');
  console.log('Test coords: lat =', lat, ', lon =', lon);
  console.groupEnd();

  // ── Test 1: Raw /env endpoint ──────────────────────────────────────────────
  console.group('%c📡 Test 1 — GET /env', 'color: #2563eb; font-weight: bold');
  try {
    const url = `${BASE_URL}/env?lat=${lat}&lon=${lon}`;
    console.log('Fetching:', url);

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log('HTTP Status:', res.status, res.statusText);

    const raw = await res.text();
    console.log('Raw response text (first 2000 chars):', raw.substring(0, 2000));

    try {
      const json = JSON.parse(raw);
      console.log('%c✅ Parsed JSON:', 'color: green; font-weight: bold', json);
      console.log('Top-level keys:', Object.keys(json));

      // Check for common temperature fields
      const tempPaths = [
        ['temperature'],
        ['temp'],
        ['temp_c'],
        ['weather', 'temperature'],
        ['weather', 'temp'],
        ['weather', 'temp_c'],
        ['current', 'temp'],
        ['current', 'temperature'],
        ['main', 'temp'],
        ['current_weather', 'temperature'],
        ['data', 'temperature'],
        ['data', 'weather', 'temperature'],
        ['overview', 'temperature'],
      ];

      console.group('🌡 Searching for temperature in response...');
      let found = false;
      for (const path of tempPaths) {
        let obj = json;
        for (const key of path) {
          obj = obj?.[key];
        }
        if (obj !== undefined && obj !== null) {
          console.log(`%c✅ Found at [${path.join('.')}] = ${obj}`, 'color: green');
          found = true;
        }
      }
      if (!found) {
        console.warn('❌ Temperature not found in any known path.');
        console.log('Full JSON dump for manual inspection:', JSON.stringify(json, null, 2));
      }
      console.groupEnd();

    } catch (parseErr) {
      console.error('❌ Failed to parse JSON:', parseErr.message);
      console.log('Raw response was:', raw);
    }

  } catch (fetchErr) {
    console.error('%c❌ Fetch failed — is the backend running on port 3000?', 'color: red; font-weight: bold');
    console.error(fetchErr.message);
    console.log('%c👉 Run: curl http://localhost:3000/api/env?lat=30.04&lon=31.23', 'color: orange');
  }
  console.groupEnd();

  // ── Test 2: Check /health or / to confirm backend is alive ────────────────
  console.group('%c🏥 Test 2 — Backend health check', 'color: #059669; font-weight: bold');
  for (const endpoint of ['/health', '/status', '/']) {
    try {
      const r = await fetch(`${BASE_URL}${endpoint}`, { signal: AbortSignal.timeout(3000) });
      console.log(`GET ${endpoint} →`, r.status, r.statusText);
      if (r.ok) {
        const t = await r.text();
        console.log(`Response:`, t.substring(0, 200));
        break;
      }
    } catch (e) {
      console.warn(`GET ${endpoint} →`, e.message);
    }
  }
  console.groupEnd();

  // ── Test 3: Check auth token validity ─────────────────────────────────────
  if (token) {
    console.group('%c🔑 Test 3 — Auth token check (/auth/me or /users/me)', 'color: #d97706; font-weight: bold');
    for (const endpoint of ['/auth/me', '/users/me', '/me']) {
      try {
        const r = await fetch(`${BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(3000),
        });
        console.log(`GET ${endpoint} →`, r.status, r.statusText);
        if (r.ok) {
          console.log('User data:', await r.json());
          break;
        } else if (r.status === 401) {
          console.warn('Token is EXPIRED or INVALID');
          break;
        }
      } catch (e) {
        console.warn(`GET ${endpoint} →`, e.message);
      }
    }
    console.groupEnd();
  }

  console.log('%c━━━ Debug complete. Share the output above. ━━━', 'color: #7c5cbf; font-weight: bold');
})();
