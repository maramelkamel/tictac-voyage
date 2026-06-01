import React, { useState } from 'react';
import PromotionCard from './PromotionCard';
import PromotionBanner from './PromotionBanner';
import '../../../styles/PromotionCard.css';
//les promo affiché dans page client 
export default function PromotionsSection({
  promos,
  titre = 'Offres spéciales en cours',
  
  showCards,
}) {
  const [open, setOpen] = useState(false);
//promo vide donc pas aff snn clic btn affiche details
  if (!promos || promos.length === 0) return null;

  const banners = promos.filter((p) => p.display_mode === 'banner');
  const cards   = promos.filter((p) => p.display_mode !== 'banner');
  const count   = promos.length;

  return (
    <section className="promotions-section">

      {/* ── TEASER TRIGGER ──────────────────────────────────── */}
      <button
        type="button"
        className={`promos-trigger ${open ? 'promos-trigger--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {/* left */}
        <div className="promos-trigger__left">
          <div className="promos-trigger__gift">🎁</div>
          <div className="promos-trigger__text">
            <span className="promos-trigger__title">{titre}</span>
            <span className="promos-trigger__sub">
              {open
                ? 'Cliquez pour masquer les offres'
                : 'Les offres actives configurées pour cette page apparaissent quand tu cliques'}
            </span>
          </div>
        </div>

        {/* right */}
        <div className="promos-trigger__right">
          <span className="promos-trigger__badge">{count} offre{count > 1 ? 's' : ''}</span>
          <svg
            className={`promos-trigger__chevron ${open ? 'promos-trigger__chevron--up' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

    
      {open && (
        <div className="promos-drawer">
          <div className="promos-drawer__rule" />

          {banners.length > 0 && (
            <div className="promotions-section__stack">
              {banners.map((promo) => (
                <PromotionBanner key={promo.id} promo={promo} />
              ))}
            </div>
          )}

          {cards.length > 0 && (
            <div className="promotions-section__grid">
              {cards.map((promo) => (
                <PromotionCard key={promo.id} promo={promo} />
              ))}
            </div>
          )}

          <p className="promos-drawer__note">
            Ces offres sont mises à jour automatiquement par votre équipe
          </p>
        </div>
      )}
    </section>
  );
}