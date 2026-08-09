import { apiClient } from './client';

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency?: string;
  popular?: boolean;
}

interface BackendPackage {
  id: number;
  name: string;
  code?: string | null;
  price: string;
  currency?: string;
  tokens: number;
}

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

export const walletApi = {
  getBalance: async (): Promise<{ balance: number; lifetimeTokens: number }> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { balance: number; status?: string };
    }>("/tokens/wallet");
    return {
      balance: data?.data?.balance ?? 0,
      lifetimeTokens: data?.data?.balance ?? 0,
    };
  },

  getPackages: async (): Promise<TokenPackage[]> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: BackendPackage[];
    }>("/token-packages");
    return (data?.data || []).map((p) => ({
      id: String(p.id),
      name: p.name,
      tokens: p.tokens,
      price: Number(p.price),
      currency: p.currency || 'USD',
      popular: String(p.code || "").toLowerCase().includes("explorer"),
    }));
  },

  purchasePackage: async (
    packageId: string,
    user?: { displayName?: string; email?: string } | null
  ): Promise<{ success: boolean; message?: string; checkoutUrl?: string }> => {
    const name = user?.displayName || user?.email || "Rihla Traveler";
    const [first, ...rest] = name.split(" ");
    const { data } = await apiClient.post<{
      success: boolean;
      data?: { packageName?: string; checkoutUrl?: string };
    }>("/payments/intention", {
      tokenPackageId: Number(packageId),
      billing_data: {
        first_name: first || "Rihla",
        last_name: rest.join(" ") || "Traveler",
        email: user?.email || "traveler@rihla.local",
        phone_number: "01000000000",
        city: "Cairo",
        country: "EG",
      },
    });
    return {
      success: !!data?.success,
      message: data?.data?.packageName,
      checkoutUrl: data?.data?.checkoutUrl,
    };
  },
};

interface BackendPackage {
  id: number;
  name: string;
  code?: string | null;
  price: string;
  tokens: number;
}
