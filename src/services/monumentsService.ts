import { type RihlaSite } from '@/app/data/rihla-data';

export interface MonumentPrice {
  adult: number | null;
  student: number | null;
}

export interface MonumentPrices {
  egyptian: MonumentPrice | null;
  foreigner: MonumentPrice | null;
}

export interface MonumentOpeningHours {
  ramadan?: string | null;
  summer?: string | null;
  winter?: string | null;
}

export interface Monument {
  id: string;
  title: string;
  category: string;
  governorate: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  prices: MonumentPrices;
  opening_hours: MonumentOpeningHours;
  images: string[];
  url: string;
  description: string;
}

let cache: Monument[] | null = null;

export const monumentsService = {
  getMonuments: async (): Promise<Monument[]> => {
    if (cache) return cache;
    const response = await fetch("/egymonuments.clean.json");
    if (!response.ok) throw new Error("Failed to load monuments catalog");
    cache = (await response.json()) as Monument[];
    return cache;
  },
};

/**
 * Ported from Project B's egymonuments.ts — normalizes a monument name for fuzzy lookup.
 */
export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type AliasGroup = { monument: string; aliases: string[] };

const ALIAS_GROUPS: AliasGroup[] = [
  { monument: "giza plateau", aliases: ["pyramids of giza", "giza pyramids", "pyramids"] },
  { monument: "valley of kings", aliases: ["valley of the kings"] },
  { monument: "valley of the queens", aliases: ["valley of queens"] },
  { monument: "mernpetah", aliases: ["merenptah"] },
  { monument: "deir el madina", aliases: ["deir el medina", "deir el-medina"] },
  { monument: "the temple of horus", aliases: ["temple of horus", "temple of horus at edfu", "edfu temple"] },
  { monument: "tombs of the nobles", aliases: ["tombs of nobles"] },
  { monument: "mosque madrassa sultan hassan", aliases: ["sultan hassan mosque", "mosque of sultan hassan", "madrasa sultan hassan"] },
  { monument: "samaan monastery", aliases: ["st simeon monastery", "monastery of saint simeon", "anba simaan"] },
  { monument: "al matariyyah obelisk", aliases: ["matariya obelisk", "obelisk of matariya"] },
  { monument: "suez canal museum", aliases: ["ismailia museum"] },
  { monument: "al mualla tombs", aliases: ["el moalla tombs"] },
  { monument: "el-tod temple", aliases: ["temple of tod"] },
  { monument: "gebel al-silsila", aliases: ["gebel el silsila"] },
  { monument: "rawda island nilometer", aliases: ["nilometer of rhoda", "rawda nilometer"] },
  { monument: "abu simbel temple", aliases: ["abu simbel", "temple of abu simbel"] },
  { monument: "karnak temple", aliases: ["karnak", "great temple of karnak"] },
  { monument: "philae temple", aliases: ["philae", "temple of philae"] },
  { monument: "kom ombo temple", aliases: ["kom ombo", "temple of kom ombo"] },
  { monument: "egyptian museum", aliases: ["the egyptian museum", "museum of egyptian antiquities"] },
];

export function buildMonumentLookup(monuments: Monument[]): Map<string, Monument> {
  const lookup = new Map<string, Monument>();
  for (const monument of monuments) {
    lookup.set(normalizeName(monument.title), monument);
  }
  for (const group of ALIAS_GROUPS) {
    const target = lookup.get(group.monument) || monuments.find(
      (m) => normalizeName(m.title) === group.monument
    );
    if (!target) continue;
    for (const alias of group.aliases) {
      if (!lookup.has(normalizeName(alias))) lookup.set(normalizeName(alias), target);
    }
  }
  return lookup;
}

/**
 * Enriches a RihlaSite's admission/hours strings from the monument ticket catalog.
 */
export function applyMonumentToSite(
  site: RihlaSite,
  monument: Monument | undefined
): RihlaSite {
  if (!monument) return site;
  const next: RihlaSite = { ...site };

  if (monument.prices?.foreigner?.adult != null) {
    let admission = `LE ${monument.prices.foreigner.adult} (foreign adult)`;
    if (monument.prices.foreigner.student != null) {
      admission += ` · LE ${monument.prices.foreigner.student} (foreign student)`;
    }
    next.admission = admission;
  }

  const hours = monument.opening_hours?.winter || monument.opening_hours?.summer;
  if (hours) next.hours = hours;

  if (!next.img && monument.images?.[0]) next.img = monument.images[0];
  if (!next.story && monument.description) next.story = monument.description;

  return next;
}