import React from 'react';
import PromotionCard   from './PromotionCard';
import PromotionBanner from './PromotionBanner';
import '../../../styles/PromotionCard.css';

export default function PromotionsSection({ promos, titre = 'Offres spéciales en cours' }) {
  if (!promos || promos.length === 0) return null;

  const banners = promos.filter(p => p.display_mode === 'banner');
  const cards   = promos.filter(p => p.display_mode !== 'banner');

  return (
    <section className="promotions-section">
      <div className="promotions-section__header">
        <span className="promotions-section__icon">🏷️</span>
        <div>
          <h2 className="promotions-section__title">{titre}</h2>
          <p className="promotions-section__subtitle">
            Les offres actives de cette page apparaissent ici automatiquement.
          </p>
        </div>
      </div>

      {banners.length > 0 && (
        <div className="promotions-section__stack">
          {banners.map(p => <PromotionBanner key={p.id} promo={p} />)}
        </div>
      )}

      {cards.length > 0 && (
        <div className="promotions-section__grid">
          {cards.map(p => <PromotionCard key={p.id} promo={p} />)}
        </div>
      )}
    </section>
  );
}
