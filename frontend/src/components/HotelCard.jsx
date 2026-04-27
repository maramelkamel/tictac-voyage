import React, { useMemo, useState } from 'react';

const StarRow = ({ stars = 4 }) => (
  <span style={{ display: 'inline-flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ color: i <= stars ? '#f59e0b' : '#e2e8f0', fontSize: 12 }}>★</span>
    ))}
  </span>
);

const HotelCard = ({
  hotel,
  onDetails,
  onReserver,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  const [selectedPension, setSelectedPension] = useState(() => hotel?.priceOptions?.[0]?.label || 'LPD');

  const selected = useMemo(() => {
    const opts = Array.isArray(hotel?.priceOptions) ? hotel.priceOptions : [];
    return opts.find((o) => o.label === selectedPension) || opts[0] || { label: selectedPension, value: 0 };
  }, [hotel, selectedPension]);

  const price = Number(selected?.value || 0);

  return (
    <article className="omra-card">
      <div className="omra-card__img">
        <img src={hotel.image} alt={hotel.title} loading="lazy" />

        {hotel.badge && <span className="omra-card__badge">{hotel.badge}</span>}

        <button
          className={`omra-card__heart ${isFavorite ? 'omra-card__heart--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle && onFavoriteToggle(hotel);
          }}
          aria-label={isFavorite ? `Retirer ${hotel.title} des favoris` : `Ajouter ${hotel.title} aux favoris`}
        >
          <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'} />
        </button>

        <div className="omra-card__rating" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarRow stars={hotel.stars} />
          <span style={{ opacity: 0.7, fontSize: 11 }}>{hotel.stars}★</span>
        </div>

        <div className="omra-card__duration">🏨 Tunisie</div>
      </div>

      <div className="omra-card__body">
        <p className="omra-card__dest">{hotel.location}</p>
        <h3 className="omra-card__title">{hotel.title}</h3>
        <p className="omra-card__desc">{hotel.description}</p>

        <div className="omra-card__meta">
          <span>📍 {hotel.city || hotel.location}</span>
          <span>{hotel.stars}★</span>
        </div>

        <div className="omra-card__footer">
          <div style={{ minWidth: 0 }}>
            <span className="omra-card__price-from">À partir de</span>
            <div className="omra-card__price-value">
              {price.toLocaleString('fr-FR')} TND
            </div>
            <span className="omra-card__price-per">/ nuit · {selected.label}</span>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {(hotel.priceOptions || []).map((p) => {
                const active = p.label === selectedPension;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedPension(p.label); }}
                    title={p.label}
                    style={{
                      border: active ? '1.5px solid var(--secondary)' : '1.5px solid var(--g200, #e2e8f0)',
                      background: active ? 'rgba(30,202,211,.12)' : '#fff',
                      color: active ? 'var(--primary)' : 'var(--g600, #64748b)',
                      padding: '5px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="omra-card__actions">
            <button className="omra-card__btn-details" onClick={() => onDetails && onDetails(hotel)}>
              Détails
            </button>
            <button className="omra-card__btn-reserve" onClick={() => onReserver && onReserver(hotel, selectedPension)}>
              Réserver
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;

