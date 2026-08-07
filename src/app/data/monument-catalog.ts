import { type RihlaSite, ALL_SITES } from '@/app/data/rihla-data';
import { type Monument, normalizeName } from '@/services/monumentsService';
import { calculateDistanceKm } from '@/lib/poiMapping';

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function monumentToSite(m: Monument, index: number, origin: { lat: number; lon: number }): RihlaSite {
  const km = calculateDistanceKm(origin.lat, origin.lon, m.latitude, m.longitude);
  return {
    id: index + 1,
    name: m.title,
    nameAr: '',
    cat: m.category || 'archaeological',
    dist: formatDistanceKm(km),
    rating: 4.5,
    reviews: 0,
    img: m.images?.[0] || '',
    imgs: m.images || [],
    tag: m.category || 'archaeological',
    scam: false,
    gov: m.governorate || '',
    built: '',
    dynasty: '',
    hours: '',
    admission: '',
    duration: '',
    bestTime: 'year-round',
    accessibility: '',
    story: m.description || '',
    rafiqInsight: '',
    scamDetail: null,
    tips: [],
    nearby: [],
    lat: m.latitude,
    lon: m.longitude,
  };
}

export const GENERIC_VISITOR_TIPS = [
  'Buy tickets only from the official gate — never from touts outside the entrance.',
  'Carry small Egyptian pound bills; many sites do not accept cards at the gate.',
  'Arrive early (before 9 AM) to beat the heat and the tour-group crowds.',
  'Keep your ticket stub until you leave — staff may check it again inside.',
  'Water, sunscreen and a hat are essential year-round in Egypt.',
];

const GENERIC_INSIGHT =
  'This is one of Egypt’s protected heritage sites. Rihla recommends booking a licensed guide at the official desk if you want the full history explained on the spot.';

/**
 * Builds a fully-populated RihlaSite for a monument, merging rich narrative
 * fields from the curated ALL_SITES catalog (matched by name, else governorate).
 * Un-curated monuments receive a generic visitor-tips + insight fallback so the
 * detail view never renders empty.
 */
export function buildMonumentSite(m: Monument, index: number, origin: { lat: number; lon: number }): RihlaSite {
  const base = monumentToSite(m, index, origin);

  const curated =
    ALL_SITES.find((s) => normalizeName(s.name) === normalizeName(m.title)) ??
    ALL_SITES.find((s) => (s.gov || '').toLowerCase() === (m.governorate || '').toLowerCase());

  if (!curated) {
    return {
      ...base,
      nameAr: base.nameAr,
      tag: base.cat,
      rating: base.rating,
      reviews: base.reviews,
      bestTime: 'year-round',
      rafiqInsight: GENERIC_INSIGHT,
      scamDetail: null,
      tips: GENERIC_VISITOR_TIPS,
      story: base.story || `${m.title} is one of Egypt's protected heritage sites, listed in the national monuments catalog.`,
    };
  }

  return {
    ...base,
    nameAr: curated.nameAr,
    rating: curated.rating,
    reviews: curated.reviews,
    img: base.img || curated.img,
    imgs: base.imgs.length ? base.imgs : curated.imgs,
    tag: curated.tag || base.tag,
    scam: curated.scam,
    built: curated.built,
    dynasty: curated.dynasty,
    duration: curated.duration,
    bestTime: curated.bestTime,
    accessibility: curated.accessibility,
    story: curated.story || base.story,
    rafiqInsight: curated.rafiqInsight || GENERIC_INSIGHT,
    scamDetail: curated.scamDetail,
    tips: curated.tips.length ? curated.tips : GENERIC_VISITOR_TIPS,
    nearby: curated.nearby,
  };
}

/**
 * True when this monument matches a curated site that has a documented scam
 * pattern (matched by name so the scam alert is per-site, not per-governorate).
 */
export function isScamSite(m: Monument): boolean {
  return ALL_SITES.some(
    (s) => s.scam && normalizeName(s.name) === normalizeName(m.title)
  );
}
