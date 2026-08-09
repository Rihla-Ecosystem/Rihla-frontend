import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const API = 'http://localhost:3000';

const run = async () => {
  const browser = await chromium.launch();
  const apiCtx = await browser.newContext();
  const loginRes = await apiCtx.request.post(API + '/api/auth/login', {
    data: { email: 'admin@example.com', password: 'Admin1234!' },
  });
  const body = await loginRes.json();
  const access = body?.accessToken || body?.token || body?.access_token;

  const routes = [
    ['login', '/login', false],
    ['home', '/app', true],
    ['explore', '/app/explore', true],
    ['rafiq', '/app/rafiq', true],
    ['safety', '/app/safety', true],
    ['wallet', '/app/wallet', true],
    ['profile', '/app/profile', true],
  ];

  for (const vp of [375, 768]) {
    console.log(`\n=== ${vp}px ===`);
    for (const [name, path, authed] of routes) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp, height: 900 });
      await page.addInitScript((t) => {
        localStorage.setItem('token', t);
        localStorage.setItem('accessToken', t);
        localStorage.setItem('auth-token', t);
      }, access || '');
      let status;
      try {
        const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(1500);
        status = res?.status();
      } catch (e) {
        status = 'ERR ' + e.message.slice(0, 100);
      }
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const offenders = [];
        if (doc.scrollWidth > doc.clientWidth + 1) {
          offenders.push(`<html> scrollWidth=${doc.scrollWidth} clientWidth=${doc.clientWidth}`);
        }
        const els = Array.from(document.querySelectorAll('body *'));
        for (const el of els) {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (r.right > doc.clientWidth + 2 && cs.position !== 'fixed' && cs.position !== 'absolute') {
            const cls = (el.className && typeof el.className === 'string') ? el.className.slice(0, 50) : el.tagName;
            offenders.push(`right=${Math.round(r.right)} ${el.tagName}.${cls}`);
          }
        }
        return { clientWidth: doc.clientWidth, scrollWidth: doc.scrollWidth, offenders: offenders.slice(0, 6) };
      });
      const report = overflow.scrollWidth > overflow.clientWidth + 1
        ? `OVERFLOW scrollW=${overflow.scrollWidth} clientW=${overflow.clientWidth} :: ${overflow.offenders.join(' | ')}`
        : 'OK no horizontal overflow';
      console.log(`${name}: ${status} - ${report}`);
      await page.close();
    }
  }
  await browser.close();
};

run();
