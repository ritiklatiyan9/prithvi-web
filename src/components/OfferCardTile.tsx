import { Link } from "react-router-dom";
import { api, type OfferCard } from "../lib/api";

const Stars = ({ rating }: { rating: number }): JSX.Element => (
  <span className="text-xs font-bold text-gold" aria-label={`${rating} out of 5`}>
    ★ {rating.toFixed(1)}
  </span>
);

export const OfferCardTile = ({
  offer,
  index,
}: {
  offer: OfferCard;
  index: number;
}): JSX.Element => (
  <Link
    to={`/offers/${offer.slug}`}
    onClick={() => api.track("CLICK", { offerId: offer.id })}
    className="glass-card group block overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow-purple animate-float-up"
    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
  >
    {/* Thumbnail */}
    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-royal/40 via-navy-surface to-gold/20">
      {offer.thumbnailUrl ? (
        <img
          src={offer.thumbnailUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-5xl">🎁</div>
      )}
      {offer.featured && (
        <span className="chip absolute left-3 top-3 bg-gradient-to-r from-gold-light to-gold-deep text-[#241A00] shadow-glow">
          ★ FEATURED
        </span>
      )}
      <span className="chip absolute right-3 top-3 bg-navy/80 text-cyan backdrop-blur">
        {offer.category.title}
      </span>
    </div>

    <div className="space-y-2 p-4">
      <div className="flex items-start gap-2">
        {offer.logoUrl && (
          <img src={offer.logoUrl} alt="" loading="lazy" className="h-9 w-9 rounded-lg object-cover" />
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold">{offer.title}</h3>
          {offer.appName && <p className="truncate text-xs text-slate-400">{offer.appName}</p>}
        </div>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
        {offer.shortDescription}
      </p>
      <div className="flex items-center gap-2 pt-1">
        <span className="chip bg-gradient-to-r from-gold-light to-gold-deep text-[#241A00]">
          🪙 {offer.rewardLabel ?? offer.rewardAmount}
        </span>
        {offer.estimatedTime && (
          <span className="chip border border-navy-border text-slate-300">
            ⏱ {offer.estimatedTime}
          </span>
        )}
        <span className="ml-auto">{offer.rating != null && <Stars rating={offer.rating} />}</span>
      </div>
      <div className="pt-2">
        <span className="block w-full rounded-xl bg-gradient-to-r from-gold-light via-gold to-gold-deep py-2.5 text-center text-sm font-extrabold text-[#241A00] shadow-glow transition-shadow group-hover:shadow-lg">
          VIEW OFFER →
        </span>
      </div>
    </div>
  </Link>
);
