import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type OfferCard, type OfferCategory, type SortOption } from "../lib/api";
import { OfferCardTile } from "../components/OfferCardTile";

const SORTS: { value: SortOption; label: string }[] = [
  { value: "priority", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "reward", label: "Highest reward" },
];

export const OffersPage = (): JSX.Element => {
  const [categories, setCategories] = useState<OfferCategory[]>([]);
  const [offers, setOffers] = useState<OfferCard[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  // Initial category comes from ?category=<slug> so the app's "Explore offers"
  // button can deep-link straight to a category (e.g. /?category=feedback-zone).
  const [category, setCategory] = useState<string | null>(searchParams.get("category"));
  const [sort, setSort] = useState<SortOption>("priority");

  const sentinel = useRef<HTMLDivElement>(null);

  // Keep the URL in sync so the filter is shareable and survives refresh.
  const selectCategory = (slug: string | null): void => {
    setCategory(slug);
    setSearchParams(slug ? { category: slug } : {}, { replace: true });
  };

  useEffect(() => {
    document.title = "RewardHub Offers — Earn real rewards for trying apps";
    void api.categories().then(setCategories).catch(() => undefined);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.offers({
          page: pageToLoad,
          search: debounced || undefined,
          category: category ?? undefined,
          sort,
        });
        setOffers((current) => (replace ? result.items : [...current, ...result.items]));
        setHasMore(pageToLoad < result.meta.totalPages);
        setPage(pageToLoad);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [debounced, category, sort],
  );

  // Reload from page 1 whenever filters change.
  useEffect(() => {
    void loadPage(1, true);
  }, [loadPage]);

  // Infinite scroll
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          void loadPage(page + 1, false);
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, page, loadPage]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      {/* Hero */}
      <header className="py-10 text-center sm:py-14">
        <p className="chip mx-auto mb-4 border border-gold/40 bg-gold/10 text-gold">
          🔥 Fresh offers every week
        </p>
        <h1 className="font-display text-3xl font-extrabold sm:text-5xl">
          Earn <span className="bg-gradient-to-r from-gold-light to-gold-deep bg-clip-text text-transparent">real rewards</span>
          <br className="hidden sm:block" /> for trying apps
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Pick an offer, install the app from Google Play, complete the task — the
          reward lands in your RewardHub vault.
        </p>
      </header>

      {/* Controls */}
      <div className="glass-card sticky top-3 z-10 mb-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search offers…"
          className="w-full rounded-xl border border-navy-border bg-navy px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-royal sm:max-w-xs"
        />
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => selectCategory(null)}
            className={`chip shrink-0 border transition-colors ${
              category === null
                ? "border-gold bg-gold/15 text-gold"
                : "border-navy-border text-slate-300 hover:border-slate-500"
            }`}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => selectCategory(category === item.slug ? null : item.slug)}
              className={`chip shrink-0 border transition-colors ${
                category === item.slug
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-navy-border text-slate-300 hover:border-slate-500"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className="rounded-xl border border-navy-border bg-navy px-3 py-2.5 text-sm outline-none focus:border-royal"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {error && offers.length === 0 ? (
        <div className="glass-card mx-auto max-w-md p-10 text-center">
          <p className="text-4xl">🛰️</p>
          <p className="mt-3 font-display font-bold">Connection interrupted</p>
          <p className="mt-1 text-sm text-slate-400">{error}</p>
          <button
            onClick={() => void loadPage(1, true)}
            className="mt-5 rounded-xl bg-gradient-to-r from-gold-light to-gold-deep px-6 py-2.5 text-sm font-extrabold text-[#241A00] shadow-glow"
          >
            Try again
          </button>
        </div>
      ) : offers.length === 0 && !loading ? (
        <div className="glass-card mx-auto max-w-md p-10 text-center">
          <p className="text-4xl">💎</p>
          <p className="mt-3 font-display font-bold">No offers match</p>
          <p className="mt-1 text-sm text-slate-400">
            Try a different search or category — new treasure drops weekly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, index) => (
            <OfferCardTile key={offer.id} offer={offer} index={index} />
          ))}
          {loading &&
            Array.from({ length: offers.length === 0 ? 6 : 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="skeleton h-80" />
            ))}
        </div>
      )}

      <div ref={sentinel} className="h-2" />
      {!hasMore && offers.length > 0 && (
        <p className="mt-8 text-center text-xs text-slate-500">
          You've seen every live offer — check back soon 🎉
        </p>
      )}
    </div>
  );
};
