import { BrowserRouter, Route, Routes } from "react-router-dom";
import { OfferDetailsPage } from "./pages/OfferDetailsPage";
import { OffersPage } from "./pages/OffersPage";

const Header = (): JSX.Element => (
  <header className="border-b border-navy-border/60 bg-navy/70 backdrop-blur">
    <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light to-gold-deep text-base shadow-glow">
        🪙
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">
        RewardHub <span className="text-gold">Offers</span>
      </span>
    </div>
  </header>
);

export const App = (): JSX.Element => (
  <BrowserRouter>
    <Header />
    <Routes>
      <Route path="/" element={<OffersPage />} />
      <Route path="/offers/:slug" element={<OfferDetailsPage />} />
      <Route path="*" element={<OffersPage />} />
    </Routes>
  </BrowserRouter>
);
