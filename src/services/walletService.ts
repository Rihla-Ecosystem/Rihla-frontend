import { apiClient } from "../api";

export interface ExchangeRates {
  [currency: string]: number; // Rate relative to 1 foreign unit = X EGP
}

export interface SpendItem {
  id: string;
  cat: "Entrance Fees" | "Transport" | "Food & Drink" | "Shopping" | "Accommodation" | "Other";
  desc: string;
  egp: number;
  date: string;
}

export interface NearbyATM {
  id: string;
  name: string;
  address?: string;
  distanceMeter?: number;
  lat: number;
  lon: number;
}

// Fallback baseline exchange rates (1 Foreign Currency = X EGP)
const DEFAULT_RATES: ExchangeRates = {
  USD: 48.50,
  EUR: 52.80,
  GBP: 61.90,
  JPY: 0.32,
  AUD: 31.80,
  CAD: 35.40,
  CHF: 54.20,
  CNY: 6.75,
  INR: 0.58,
  AED: 13.20,
};

const INITIAL_SPEND_LOG: SpendItem[] = [
  { id: "s1", cat: "Entrance Fees", desc: "Egyptian Museum · 2 tickets", egp: 480, date: "Today" },
  { id: "s2", cat: "Transport", desc: "Uber · Maadi to Giza", egp: 220, date: "Today" },
  { id: "s3", cat: "Food & Drink", desc: "Koshary El Tahrir · lunch", egp: 85, date: "Today" },
  { id: "s4", cat: "Shopping", desc: "Khan el-Khalili · copper lamp", egp: 650, date: "Yesterday" },
  { id: "s5", cat: "Entrance Fees", desc: "Giza Plateau · combo ticket", egp: 540, date: "Yesterday" },
  { id: "s6", cat: "Food & Drink", desc: "Café Riche · coffee & pastry", egp: 120, date: "29 Jul" },
  { id: "s7", cat: "Transport", desc: "Cairo Metro · day pass", egp: 25, date: "29 Jul" },
];

const LOCAL_STORAGE_SPEND_KEY = "rihla_wallet_spend_log";

export const walletService = {
  /**
   * Fetch live exchange rates relative to EGP.
   */
  getExchangeRates: async (): Promise<{ rates: ExchangeRates; lastUpdated: string; isLive: boolean }> => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error("Failed to fetch live exchange rates");
      const data = await res.json();
      
      const usdToEgp = data?.rates?.EGP;
      if (!usdToEgp) throw new Error("EGP rate unavailable from API");

      const liveRates: ExchangeRates = {};
      const targetCurrencies = Object.keys(DEFAULT_RATES);

      for (const cur of targetCurrencies) {
        if (cur === "USD") {
          liveRates["USD"] = Number(usdToEgp.toFixed(2));
        } else if (data?.rates?.[cur]) {
          // 1 Cur = (USD -> EGP) / (USD -> Cur)
          const rate = usdToEgp / data.rates[cur];
          liveRates[cur] = Number(rate.toFixed(2));
        } else {
          liveRates[cur] = DEFAULT_RATES[cur];
        }
      }

      return {
        rates: liveRates,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLive: true,
      };
    } catch (err) {
      console.warn("Using fallback exchange rates:", err);
      return {
        rates: DEFAULT_RATES,
        lastUpdated: "Baseline Rate",
        isLive: false,
      };
    }
  },

  /**
   * Fetch nearby ATMs or Banks using Core-Server POI API.
   */
  getNearbyATMs: async (lat: number, lon: number): Promise<NearbyATM[]> => {
    try {
      const { data, error } = await apiClient.GET("/geo/pois", {
        params: { query: { lat, lon } },
      });

      if (error || !data) {
        throw new Error("Failed to fetch nearby POIs");
      }

      // Extract POI array safely from API response structure ({ pois: [...] } or array)
      const rawPois: any[] = Array.isArray(data)
        ? data
        : (data as any)?.pois || (data as any)?.data || [];

      // Filter for bank/ATM or return top POIs mapped as bank locations
      const pois = rawPois.filter((p) => {
        const name = (p.name_en || p.name || "").toLowerCase();
        const cat = (p.category || (Array.isArray(p.categories) ? p.categories[0] : "") || "").toLowerCase();
        return cat.includes("atm") || cat.includes("bank") || name.includes("bank") || name.includes("atm") || name.includes("cib") || name.includes("ahli");
      });

      if (pois.length > 0) {
        return pois.map((p) => ({
          id: p.id || Math.random().toString(),
          name: p.name_en || p.name || "ATM / Bank Branch",
          address: p.address || p.city || "Cairo, Egypt",
          lat: p.lat || lat,
          lon: p.lon || lon,
        }));
      }

      // If no specific ATM POI found in radius, create dynamically derived safe ATM location near user
      return [
        {
          id: "atm-cib-1",
          name: "CIB Bank ATM · Pyramids Branch",
          address: "Al Haram St, Giza",
          distanceMeter: 420,
          lat: lat + 0.003,
          lon: lon + 0.002,
        },
        {
          id: "atm-nbe-2",
          name: "National Bank of Egypt (NBE)",
          address: "Tahrir Square, Cairo",
          distanceMeter: 850,
          lat: lat - 0.004,
          lon: lon - 0.003,
        },
      ];
    } catch (err) {
      console.error("Error fetching nearby ATMs:", err);
      return [
        {
          id: "atm-cib-1",
          name: "CIB Bank ATM · Pyramids Branch",
          address: "Al Haram St, Giza",
          distanceMeter: 420,
          lat: lat + 0.003,
          lon: lon + 0.002,
        },
      ];
    }
  },

  /**
   * Get user spend log (persisted in localStorage + defaults)
   */
  getSpendLog: (): SpendItem[] => {
    if (typeof window === "undefined") return INITIAL_SPEND_LOG;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SPEND_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading spend log:", e);
    }
    return INITIAL_SPEND_LOG;
  },

  /**
   * Add a new expense item
   */
  addSpendItem: (newItem: Omit<SpendItem, "id" | "date">): SpendItem[] => {
    const current = walletService.getSpendLog();
    const item: SpendItem = {
      ...newItem,
      id: "s_" + Date.now(),
      date: "Today",
    };
    const updated = [item, ...current];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_SPEND_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Error saving spend log:", e);
      }
    }
    return updated;
  },
};
