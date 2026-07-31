'use client';

import { AppShell } from '@/app/components/layout/AppShell';
import { usePathname, useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const getPageFromPath = (path: string): string => {
    if (path === '/app' || path === '/app/' || path.startsWith('/app/home')) return 'home';
    if (path.startsWith('/app/explore')) return 'explore';
    if (path.startsWith('/app/rafiq')) return 'rafiq';
    if (path.startsWith('/app/safety')) return 'safety';
    if (path.startsWith('/app/history')) return 'history';
    if (path.startsWith('/app/wallet')) return 'wallet';
    if (path.startsWith('/app/profile')) return 'profile';
    if (path.startsWith('/app/settings')) return 'settings';
    return 'home';
  };

  const activePage = getPageFromPath(pathname);

  const setPage = (page: string) => {
    const path = page === 'home' ? '/app' : `/app/${page}`;
    router.push(path);
  };

  const go = (screen: string) => {
    switch (screen) {
      case 'landing':
        router.push('/');
        break;
      case 'signup':
        router.push('/signup');
        break;
      case 'login':
        router.push('/login');
        break;
      case 'arrival':
        router.push('/arrival');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <AppShell activePage={activePage} setPage={setPage} go={go}>
      {children}
    </AppShell>
  );
}
