'use client';

import { useSyncExternalStore } from 'react';
import { ALL_SITES, type RihlaSite } from '@/app/data/rihla-data';
import type { TripHistoryItem, UserBadgeItem } from '@/services/historyService';
import type { Journey } from '@/lib/api/journeys';
import type { TokenPackage } from '@/lib/api/wallet';

// ---------------------------------------------------------------------------
// Demo Store
// A client-side, localStorage-backed store that simulates a complete user
// journey (visits, XP, badges, quests, wallet) so every page can be demoed
// end-to-end without a backend. Real API data is always the default; Demo
// Mode is an optional fallback toggled from the Test Hub.
// ---------------------------------------------------------------------------

export interface DemoVisit {
  id: string;
  siteId: number;
  siteName: string;
  siteAr?: string;
  gov: string;
  cat: string;
  img: string;
  visitedAt: string;
  xp: number;
  badge?: string | null;
  story: string;
  rafiqNote: string;
  tags: string[];
}

export interface DemoQuest {
  completedSteps: number;
  totalSteps: number;
  isCompleted: boolean;
}

export interface DemoState {
  mode: 'off' | 'on';
  visits: DemoVisit[];
  xp: number;
  badges: string[];
  quests: Record<string, DemoQuest>;
  walletBalance: number;
  lifetimeTokens: number;
}

const STORAGE_KEY = 'rihla_demo_data';

const DEFAULTS: DemoState = {
  mode: 'off',
  visits: [],
  xp: 0,
  badges: [],
  quests: {},
  walletBalance: 0,
  lifetimeTokens: 0,
};

// Great Pyramid of Giza — not part of ALL_SITES (only lives in the offline
// guidebook), so define it here for the demo visit catalog.
const EXTRA_SITES: RihlaSite[] = [
  {
    id: 1001,
    name: 'Great Pyramid of Giza',
    nameAr: 'الهرم الأكبر',
    cat: 'Archaeological',
    dist: '0 km',
    rating: 5,
    reviews: 4100,
    img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop',
    imgs: [],
    tag: 'Icon',
    scam: false,
    gov: 'Giza',
    built: 'c. 2560 BCE',
    dynasty: 'Old Kingdom · 4th Dynasty',
    hours: '8:00 AM – 5:00 PM',
    admission: 'EGP 600 (plateau) · EGP 400 (student)',
    duration: '2–3 hours',
    bestTime: 'Opening at 8:00 AM — you\'ll have the plateau nearly to yourself',
    accessibility: 'Partially accessible',
    story:
      'Built for Pharaoh Khufu around 2560 BCE, the Great Pyramid is the last surviving Wonder of the Ancient World. Some 2.3 million limestone blocks, each averaging 2.5 tonnes, were moved and stacked to a height of 146.6 metres.',
    rafiqInsight:
      'The casing stones that once covered it were so precisely cut that a single sheet of paper could not fit between them. Go early: sunrise from the plateau is unbeatable.',
    scamDetail: null,
    tips: ['Go at 8:00 AM sharp to beat tour groups', 'Cameras on tripods need a permit'],
    nearby: [1, 2, 3],
  },
];

export const VISITABLE_SITES: RihlaSite[] = [...EXTRA_SITES, ...ALL_SITES];

const GOVERNORATE_QUEST: Record<string, string> = {
  Giza: 'giza-plateau',
  Cairo: 'coptic-islamic-cairo',
  Luxor: 'karnak-luxor',
  Aswan: 'abu-simbel-nubia',
};

// Quest catalog used to build demo journeys (mirrors /app/quests OFFLINE_QUESTS).
const DEMO_QUEST_CATALOG: Array<{ slug: string; title: string; description: string; xpReward: number; totalSteps: number }> = [
  { slug: 'scam-smart-traveler', title: 'The Smart Traveler', description: 'Learn to spot the classic bazaar tricks before they spot you.', xpReward: 150, totalSteps: 5 },
  { slug: 'taxi-tricks', title: 'Taxi Tricks & Fair Fares', description: 'Master the meter, the fare, and the "friend discount" that never was.', xpReward: 120, totalSteps: 4 },
  { slug: 'street-money-exchange', title: 'Street Money Exchange', description: 'Why that "great rate" on the street is the most expensive deal in Cairo.', xpReward: 100, totalSteps: 3 },
  { slug: 'fake-guide-papyrus', title: 'The Fake Guide & the Papyrus', description: 'The "official guide" who materialises at your elbow — and how to decline.', xpReward: 100, totalSteps: 3 },
  { slug: 'atm-card-scam', title: 'ATM & Card Cloning', description: 'Protect your card at Cairo ATMs and in restaurants with card readers.', xpReward: 130, totalSteps: 4 },
  { slug: 'giza-plateau', title: 'The Giza Plateau', description: 'Pyramids, the Sphinx, and the plateau\'s hidden corners.', xpReward: 200, totalSteps: 6 },
  { slug: 'karnak-luxor', title: 'Karnak & Luxor', description: 'The great temple complex and the avenue of sphinxes.', xpReward: 180, totalSteps: 5 },
  { slug: 'abu-simbel-nubia', title: 'Abu Simbel & Nubia', description: 'The relocated temples of Ramesses II — a marvel of ancient and modern engineering.', xpReward: 180, totalSteps: 4 },
  { slug: 'coptic-islamic-cairo', title: 'Coptic & Islamic Cairo', description: 'Churches, mosques, and a thousand years of layered faith in Old Cairo.', xpReward: 160, totalSteps: 5 },
];

const DEMO_PACKAGES: TokenPackage[] = [
  { id: 'demo-starter', name: 'Starter Pack', tokens: 500, price: 99 },
  { id: 'demo-explorer', name: 'Explorer Pack', tokens: 1200, price: 199, popular: true },
  { id: 'demo-royal', name: 'Royal Pack', tokens: 3000, price: 449 },
];

let cache: DemoState | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  if (cache) return cache;
  let base: DemoState = {
    ...DEFAULTS,
    visits: [],
    badges: [],
    quests: {},
  };
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        base = {
          ...DEFAULTS,
          ...parsed,
          visits: Array.isArray(parsed.visits) ? parsed.visits : [],
          badges: Array.isArray(parsed.badges) ? parsed.badges : [],
          quests: parsed.quests && typeof parsed.quests === 'object' ? parsed.quests : {},
        };
      }
    } catch {
      /* ignore */
    }
  }
  cache = base;
  return base;
}

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: DemoState) {
  cache = next;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    /* ignore */
  }
  emit();
}

export function getDemoStore(): DemoState {
  return read();
}

export function setDemoMode(mode: DemoState['mode']): DemoState {
  const next = { ...read(), mode };
  persist(next);
  return next;
}

function visitXp(site: RihlaSite): number {
  return Math.round((site.rating ?? 4.5) * 40);
}

export function recordVisit(site: RihlaSite): DemoState {
  const state = read();
  const xp = visitXp(site);
  const id = `demo-${Date.now()}`;
  const visitedAt = new Date().toISOString();
  const gov = site.gov || 'Egypt';

  const visit: DemoVisit = {
    id,
    siteId: site.id,
    siteName: site.name,
    siteAr: site.nameAr,
    gov,
    cat: site.cat || 'Archaeological',
    img:
      site.img ||
      'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop',
    visitedAt,
    xp,
    story: site.story?.split('\n\n')[0]?.trim() || 'A memorable historical exploration recorded in your journey log.',
    rafiqNote: site.rafiqInsight?.trim() || 'Rafiq provided AI guidance and context for this destination.',
    tags: [site.cat || 'Exploration', gov],
  };

  const badges = [...state.badges];
  const prevCount = badges.length;
  if (badges.length === 0) badges.push('First Steps');
  const govBadge = `${gov} Explorer`;
  if (state.visits.every((v) => v.gov !== gov) && !badges.includes(govBadge)) {
    badges.push(govBadge);
  }
  const newlyAwarded = badges[prevCount] || (badges.length === 1 ? 'First Steps' : null);
  visit.badge = newlyAwarded || null;

  const questSlug = GOVERNORATE_QUEST[gov] || 'scam-smart-traveler';
  const catalog = DEMO_QUEST_CATALOG.find((q) => q.slug === questSlug);
  const quests = { ...state.quests };
  const current = quests[questSlug] || {
    completedSteps: 0,
    totalSteps: catalog?.totalSteps ?? 3,
    isCompleted: false,
  };
  quests[questSlug] = {
    ...current,
    completedSteps: Math.min(current.completedSteps + 1, current.totalSteps),
    isCompleted: current.completedSteps + 1 >= current.totalSteps,
  };

  const next: DemoState = {
    ...state,
    visits: [...state.visits, visit],
    xp: state.xp + xp,
    badges,
    quests,
    lifetimeTokens: state.lifetimeTokens + xp,
  };
  persist(next);
  return next;
}

export function advanceQuest(slug: string): DemoState {
  const state = read();
  const catalog = DEMO_QUEST_CATALOG.find((q) => q.slug === slug);
  const current = state.quests[slug] || {
    completedSteps: 0,
    totalSteps: catalog?.totalSteps ?? 3,
    isCompleted: false,
  };
  const quests = {
    ...state.quests,
    [slug]: {
      ...current,
      completedSteps: Math.min(current.completedSteps + 1, current.totalSteps),
      isCompleted: current.completedSteps + 1 >= current.totalSteps,
    },
  };
  const next = { ...state, quests };
  persist(next);
  return next;
}

export function addTokens(amount: number): DemoState {
  const state = read();
  const next = {
    ...state,
    walletBalance: state.walletBalance + amount,
    lifetimeTokens: state.lifetimeTokens + amount,
  };
  persist(next);
  return next;
}

export function resetDemo(): DemoState {
  const next: DemoState = {
    mode: 'on',
    visits: [],
    xp: 0,
    badges: [],
    quests: {},
    walletBalance: 0,
    lifetimeTokens: 0,
  };
  persist(next);
  return next;
}

export function subscribeDemoStore(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useDemoStore(): DemoState {
  return useSyncExternalStore(subscribeDemoStore, read, () => DEFAULTS);
}

// ---------------------------------------------------------------------------
// Adapters — convert the demo store into the exact shapes each page expects.
// ---------------------------------------------------------------------------

export function demoProfile() {
  const state = read();
  const level = 1 + Math.floor(state.xp / 500);
  return {
    id: 'demo-user',
    email: 'demo@rihla.test',
    displayName: 'Demo Traveler',
    avatarUrl: null,
    bio: 'Exploring Egypt in Demo Mode',
    nationality: 'Egypt',
    language: ['English'],
    xp: state.xp,
    level,
    createdAt: new Date().toISOString(),
  };
}

export function demoTrips(): TripHistoryItem[] {
  return read().visits.map((v) => ({
    id: v.id,
    userId: 'demo-user',
    title: v.siteName,
    destination: v.gov,
    startDate: v.visitedAt,
    endDate: new Date(new Date(v.visitedAt).getTime() + 45 * 60 * 1000).toISOString(),
    itinerary: {
      siteAr: v.siteAr || '',
      category: v.cat,
      image: v.img,
      xp: v.xp,
      badge: v.badge || null,
      story: v.story,
      rafiqNote: v.rafiqNote,
      tags: v.tags,
    },
    notes: v.story,
    createdAt: v.visitedAt,
    updatedAt: v.visitedAt,
  }));
}

export function demoBadges(): UserBadgeItem[] {
  return read().badges.map((name, i) => ({
    id: i + 1,
    name,
    description: 'Earned by exploring',
    criteriaType: 'visit',
    criteriaValue: 1,
    awardedAt: new Date().toISOString(),
  }));
}

export function demoJourneys(): Journey[] {
  const state = read();
  return DEMO_QUEST_CATALOG.map((q, i) => {
    const prog = state.quests[q.slug] || { completedSteps: 0, totalSteps: q.totalSteps, isCompleted: false };
    return {
      id: `demo-${q.slug}`,
      slug: q.slug,
      title: q.title,
      description: q.description,
      xpReward: q.xpReward,
      isActive: false,
      steps: [],
      completedSteps: prog.completedSteps,
      totalSteps: prog.totalSteps,
      isCompleted: prog.isCompleted,
      startedAt: null,
      completedAt: prog.isCompleted ? new Date().toISOString() : null,
      nextStep: prog.completedSteps < prog.totalSteps ? prog.completedSteps + 1 : null,
      // keep order deterministic
      sortIndex: i,
    } as Journey & { sortIndex: number };
  });
}

export function demoWallet(): {
  balance: number;
  lifetimeTokens: number;
  transactions: { id: string; type: "purchase" | "reward"; amount: number; description: string; timestamp: string }[];
  packages: TokenPackage[];
} {
  const state = read();
  const transactions: { id: string; type: "purchase" | "reward"; amount: number; description: string; timestamp: string }[] = [
    ...state.visits.map((v) => ({
      id: `demo-tx-${v.id}`,
      type: 'reward' as const,
      amount: v.xp,
      description: `Visited ${v.siteName}`,
      timestamp: new Date(v.visitedAt).toLocaleString(),
    })),
    ...(state.walletBalance > 0
      ? [
          {
            id: 'demo-tx-wallet',
            type: 'purchase' as const,
            amount: state.walletBalance,
            description: 'Demo wallet credit',
            timestamp: new Date().toLocaleString(),
          },
        ]
      : []),
  ];
  return {
    balance: state.walletBalance,
    lifetimeTokens: state.lifetimeTokens,
    transactions,
    packages: DEMO_PACKAGES,
  };
}

export function demoSummary(): string {
  const state = read();
  if (state.visits.length === 0) return 'Your Egyptian story is worth sharing.';
  return `From the Sphinx to ${state.visits[state.visits.length - 1].siteName}, you've logged ${state.visits.length} site${state.visits.length > 1 ? 's' : ''} across Egypt — every one a story Rafiq helped tell.`;
}
