import React from 'react';
import PromotionCard   from './PromotionCard';
import PromotionBanner from './PromotionBanner';

export default function PromotionsSection({ promos, titre = 'Offres spéciales en cours' }) {
  if (!promos || promos.length === 0) return null;

  const banners = promos.filter(p => p.display_mode === 'banner');
  const cards   = promos.filter(p => p.display_mode !== 'banner');

  return (
    <div style={{ margin: '0 0 28px' }}>
      <h2 style={{
        fontSize: 18, fontWeight: 700, marginBottom: 14,
        color: '#0F4C5C', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        🏷️ {titre}
      </h2>

      {banners.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          marginBottom: cards.length > 0 ? 14 : 0,
        }}>
          {banners.map(p => <PromotionBanner key={p.id} promo={p} />)}
        </div>
      )}

      {cards.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {cards.map(p => <PromotionCard key={p.id} promo={p} />)}
        </div>
      )}
    </div>
  );
}