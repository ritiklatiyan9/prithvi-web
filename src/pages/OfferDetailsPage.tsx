import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type OfferDetails } from "../lib/api";

export const OfferDetailsPage = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setOffer(null);
    setError(null);
    api
      .offer(slug)
      .then((data) => {
        setOffer(data);
        document.title = `${data.title} — RewardHub Offers`;
        api.track("VIEW", { offerId: data.id });
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Offer not found"),
      );
  }, [slug]);

  const download = (): void => {
    if (!offer) return;
    api.track("DOWNLOAD", { offerId: offer.id });
    // keepalive on the tracking request lets it complete through the redirect.
    window.location.href = offer.playStoreUrl;
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-4xl">🗺️</p>
        <p className="mt-3 font-display text-lg font-bold">This offer has moved on</p>
        <p className="mt-1 text-sm text-slate-400">{error}</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-gold-light to-gold-deep px-6 py-2.5 text-sm font-extrabold text-[#241A00] shadow-glow"
        >
          Browse live offers
        </Link>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="skeleton h-56" />
        <div className="skeleton h-24" />
        <div className="skeleton h-40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <Link to="/" className="text-sm text-slate-400 hover:text-gold">
        ← All offers
      </Link>

      {/* Banner */}
      <div className="glass-card relative mt-4 h-52 overflow-hidden sm:h-64 animate-float-up">
        {offer.bannerUrl ?? offer.thumbnailUrl ? (
          <img
            src={offer.bannerUrl ?? offer.thumbnailUrl ?? ""}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-royal/40 via-navy-surface to-gold/20 text-6xl">
            🎁
          </div>
        )}
      </div>

      {/* Identity + reward */}
      <div className="glass-card -mt-8 relative z-10 mx-3 p-5 animate-float-up sm:mx-6">
        <div className="flex flex-wrap items-center gap-4">
          {offer.logoUrl && (
            <img src={offer.logoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-extrabold sm:text-2xl">{offer.title}</h1>
            <p className="text-sm text-slate-400">
              {offer.appName ?? offer.category.title}
              {offer.rating != null && (
                <span className="ml-2 font-bold text-gold">★ {offer.rating.toFixed(1)}</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Reward</p>
            <p className="font-display text-xl font-extrabold text-gold">
              🪙 {offer.rewardLabel ?? offer.rewardAmount}
            </p>
            {offer.estimatedTime && (
              <p className="text-xs text-slate-400">⏱ {offer.estimatedTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mt-8 space-y-6">
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-gold">
            About this offer
          </h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-300">
            {offer.description}
          </p>
        </div>

        {offer.features.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-cyan">
              Features
            </h2>
            <ul className="mt-3 space-y-2">
              {offer.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-emeraldx">✔</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {offer.instructions.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-royal">
              How to complete it
            </h2>
            <ol className="mt-3 space-y-3">
              {offer.instructions.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-xs font-extrabold text-[#241A00]">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {offer.requirements.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-300">
              Requirements
            </h2>
            <ul className="mt-3 space-y-2">
              {offer.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-2 text-sm text-slate-400">
                  <span className="text-cyan">•</span> {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {offer.warning && (
          <div className="rounded-2xl border border-hot/40 bg-hot/10 p-4 text-sm text-orange-200">
            ⚠️ {offer.warning}
          </div>
        )}

        {offer.terms && (
          <details className="glass-card p-5 text-sm text-slate-400">
            <summary className="cursor-pointer font-display font-bold text-slate-300">
              Terms & conditions
            </summary>
            <p className="mt-2 whitespace-pre-line leading-relaxed">{offer.terms}</p>
          </details>
        )}
      </section>

      {/* Sticky download CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-navy-border bg-navy/90 p-4 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={download}
            className="w-full rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-deep py-4 font-display text-base font-extrabold text-[#241A00] shadow-glow transition-transform active:scale-[0.98]"
          >
            ⬇ DOWNLOAD ON GOOGLE PLAY
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Opens the official Play Store listing
          </p>
        </div>
      </div>
    </div>
  );
};
