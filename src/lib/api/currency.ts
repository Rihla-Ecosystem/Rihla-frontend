import { apiClient } from './client';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number> | null;
  retrievedAt: string | null;
  source: string | null;
  nextUpdateAt: string | null;
  available: boolean;
  stale?: boolean;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  minorUnit: string;
  denominations: { value: number; unit: string; type: string }[];
  supportedCurrencies: string[];
}

export interface CurrencyMeta {
  name: string;
  iso_code: string;
  symbol: string;
  issuing_authority: string;
}

export interface CoinItem {
  id: string;
  denomination: string;
  value_in_egp: number;
  type: string;
  material: string;
  obverse_design: string;
  reverse_design: string;
  image_url_front: string;
  image_url_back: string;
}

export interface BanknoteItem {
  id: string;
  denomination: string;
  value_in_egp: number;
  substrate: string;
  dimensions_mm: string;
  obverse_design: string;
  reverse_design: string;
  image_url_front: string;
  image_url_back: string;
}

export interface EgyptianCurrency {
  currency: CurrencyMeta;
  coins: CoinItem[];
  banknotes: BanknoteItem[];
}

// Approximate fallback rates (foreign unit per 1 EGP) used when the live rate
// provider is unreachable or the user is not authenticated — keeps the rates
// section and converter functional offline.
export const FALLBACK_RATES: Record<string, number> = {
  USD: 0.0203,
  EUR: 0.0187,
  GBP: 0.0159,
  SAR: 0.0762,
  AED: 0.0746,
};

export function fallbackRatesNow(base = "EGP"): ExchangeRates {
  return {
    base,
    rates: { ...FALLBACK_RATES },
    retrievedAt: null,
    source: "offline-approx",
    nextUpdateAt: null,
    available: true,
    stale: true,
  };
}

export const currencyApi = {
  getRates: async (base = "EGP"): Promise<ExchangeRates> => {
    // Keyless public provider (same data source the backend uses). Tried first
    // so the live feed works even when the backend lacks EXCHANGE_RATES_API_KEY.
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const body = (await response.json()) as {
          result?: string;
          base_code?: string;
          rates?: Record<string, number>;
          time_last_update_utc?: string | null;
          time_next_update_unix?: number | null;
        };
        if (body?.result === "success" && body.rates && typeof body.rates.EGP === "number") {
          return {
            base,
            rates: body.rates,
            retrievedAt: body.time_last_update_utc ?? new Date().toISOString(),
            source: "open.er-api.com",
            nextUpdateAt: body.time_next_update_unix
              ? new Date(body.time_next_update_unix * 1000).toISOString()
              : null,
            available: true,
          };
        }
      }
    } catch {
      // Fall through to the authenticated backend endpoint.
    }

    const { data } = await apiClient.get<ExchangeRates>("/currency/rates", {
      params: { base },
    });
    return data;
  },
  getInfo: async (): Promise<CurrencyInfo> => {
    const { data } = await apiClient.get<CurrencyInfo>("/currency/info");
    return data;
  },
  getCatalog: async (): Promise<EgyptianCurrency | null> => {
    try {
      const response = await fetch("/CurrunciesEG.json");
      if (!response.ok) return null;
      return (await response.json()) as EgyptianCurrency;
    } catch {
      return null;
    }
  },
};
