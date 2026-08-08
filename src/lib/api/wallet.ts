import { apiClient } from './client';

export interface WalletTransaction {
  id: string;
  type: "purchase" | "spend" | "reward";
  amount: number;
  description: string;
  timestamp: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
}

interface BackendTx {
  id: string;
  type?: string | null;
  source?: string | null;
  tokens?: number | null;
  createdAt?: string | null;
}

interface BackendPackage {
  id: number;
  name: string;
  code?: string | null;
  price: string;
  tokens: number;
}

function mapTx(tx: BackendTx): WalletTransaction {
  const rawType = String(tx.type || "").toLowerCase();
  let type: WalletTransaction["type"] = "spend";
  if (rawType === "grant" || rawType === "bonus" || rawType === "refund") {
    type = "reward";
  } else if (rawType === "adjustment") {
    type = (tx.tokens ?? 0) >= 0 ? "reward" : "spend";
  } else if (rawType === "consume") {
    type = "spend";
  }
  const rawSource = String(tx.source || "token").toLowerCase();
  const description = rawSource === "purchase" ? "Package purchase" : `Used for ${rawSource}`;
  return {
    id: tx.id,
    type,
    amount: Math.abs(tx.tokens ?? 0),
    description,
    timestamp: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "",
  };
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

  getTransactions: async (): Promise<WalletTransaction[]> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { items?: BackendTx[] };
    }>("/tokens/transactions", { params: { page: 1, limit: 20 } });
    return (data?.data?.items || []).map(mapTx);
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
