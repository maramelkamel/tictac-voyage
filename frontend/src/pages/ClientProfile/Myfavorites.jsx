import React from 'react';
import { getFavoritePath } from '../../utils/favorites';

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const typeMap = {
  omra:    { label: '🕌 Omra',    bg: '#f5f3ff', color: '#7c3aed' },
  voyage:  { label: '🏖️ Voyage',  bg: '#ede9fe', color: '#4338ca' },
  circuit: { label: '🗺️ Circuit', bg: '#d1fae5', color: '#059669' },
};

export default function Myfavorites({ favorites, navigate }) {
  const handleOpen = (favorite) => {
    const path = favorite.item_data?.detailPath || getFavoritePath(favorite.item_type, favorite.item_id);
    if (path) navigate(path);
  };

  if (favorites.length === 0) {
    return (
      <div className="cp-empty">
        <i className="fas fa-heart cp-empty__icon" style={{ color: '#fca5a5' }} />
        <p className="cp-empty__title">Aucun favori pour l'instant</p>
        <p className="cp-empty__sub">
          Cliquez sur le ❤️ dans les cartes pour sauvegarder vos préférés
        </p>
      </div>
    );
  }

  return (
    <div className="cp-fav-grid">
      {favorites.map(fav => {
        const data = fav.item_data || {};
        const tm   = typeMap[fav.item_type] || { label: fav.item_type, bg: '#f1f5f9', color: '#64748b' };
        return (
          <div key={fav.id} className="cp-fav-card" onClick={() => handleOpen(fav)}>
            {data.image && (
              <img src={data.image} alt={data.title} className="cp-fav-card__img" />
            )}
            <div className="cp-fav-card__body">
              <div className="cp-fav-card__top">
                <span
                  className="cp-fav-card__type-badge"
                  style={{ background: tm.bg, color: tm.color }}
                >
                  {tm.label}
                </span>
                <i className="fas fa-heart cp-fav-card__heart" />
              </div>
              <p className="cp-fav-card__title">{data.title || '—'}</p>
              {(data.pays || data.destination || data.subtitle || data.region) && (
                <p className="cp-fav-card__sub">
                  {[data.pays, data.destination, data.subtitle, data.region]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              )}
              {data.price && (
                <p className="cp-fav-card__price">
                  {Number(data.price).toLocaleString('fr-TN')} TND
                </p>
              )}
              <p className="cp-fav-card__date">Ajouté le {fDate(fav.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}