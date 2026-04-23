import React from 'react';
import PromotionCard from './PromotionCard';
import PromotionBanner from './PromotionBanner';
import '../../../styles/PromotionCard.css';

export default function PromotionsSection({
  promos,
  titre = 'Offres speciales en cours',
  showCards = true,
}) {
  if (!promos || promos.length === 0) return null;

  const banners = promos.filter((promo) => promo.display_mode === 'banner');
  const cards = showCards
    ? promos.filter((promo) => promo.display_mode !== 'banner')
    : [];

  if (banners.length === 0 && cards.length === 0) return null;

  return (
    <section className="promotions-section">
      <div className="promotions-section__header">
        <span className="promotions-section__icon">🏷️</span>
        <div>
          <h2 className="promotions-section__title">{titre}</h2>
          <p className="promotions-section__subtitle">
            Les offres actives configurees pour cette page apparaissent ici automatiquement.
          </p>
        </div>
      </div>

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
    </section>
  );
}
