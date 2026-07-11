import { getSessionId } from "./session";

// Dev: the Vite proxy forwards /api to the local backend.
// Prod: set VITE_API_BASE_URL to the deployed API origin + /api/v1.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export interface OfferCategory {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  featured: boolean;
  offerCount: number;
}

export interface OfferCard {
  id: string;
  slug: string;
  title: string;
  appName: string | null;
  logoUrl: string | null;
  thumbnailUrl: string | null;
  shortDescription: string;
  rewardAmount: number;
  rewardLabel: string | null;
  estimatedTime: string | null;
  rating: number | null;
  featured: boolean;
  category: { id: string; slug: string; title: string };
}

export interface OfferDetails extends OfferCard {
  bannerUrl: string | null;
  description: string;
  features: string[];
  instructions: string[];
  requirements: string[];
  terms: string | null;
  warning: string | null;
  playStoreUrl: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

const request = async <T>(path: string): Promise<ApiSuccess<T>> => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return (await response.json()) as ApiSuccess<T>;
};

export type SortOption = "priority" | "newest" | "reward";

export const api = {
  categories: async (): Promise<OfferCategory[]> =>
    (await request<OfferCategory[]>("/hot-offers/categories")).data,

  offers: async (params: {
    page: number;
    category?: string;
    search?: string;
    sort?: SortOption;
  }): Promise<{ items: OfferCard[]; meta: PageMeta }> => {
    const query = new URLSearchParams({ page: String(params.page), limit: "12" });
    if (params.category) query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    const result = await request<OfferCard[]>(`/hot-offers/offers?${query}`);
    return { items: result.data, meta: result.meta! };
  },

  offer: async (slug: string): Promise<OfferDetails> =>
    (await request<OfferDetails>(`/hot-offers/offers/${slug}`)).data,

  /** Fire-and-forget analytics; never throws, never blocks or breaks the funnel. */
  track: (type: "VIEW" | "CLICK" | "DOWNLOAD", target: { offerId?: string; categoryId?: string }): void => {
    try {
      void fetch(`${API_BASE}/hot-offers/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, source: "WEBSITE", sessionId: getSessionId(), ...target }),
        keepalive: true, // survives the Play Store redirect
      }).catch(() => undefined);
    } catch {
      /* analytics must never break the page */
    }
  },
};
