import React from 'react';

const HotelCard = ({
  hotel,
  onDetails,
  onReserve,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  const {
    name,
    subtitle,
    city,
    image_url,
    rating,
    reviews,
    badge,
    description,
    address,
    base_price,
    old_price,
    currency = 'TND',
    amenities = [],
    occupancy_percentage = 0,
    available_rooms = 0,
    reservation_count = 0,
  } = hotel;

  const isPopular = Number(reservation_count) > 0;

  return (
    <article className="omra-card">
      <div className="omra-card__img">
        <img src={image_url} alt={name} loading="lazy" />

        {badge && <span className="omra-card__badge">{badge}</span>}

        <button
          className={`omra-card__heart ${isFavorite ? 'omra-card__heart--active' : ''}`}
          onClick={(event) => {
            event.stopPropagation();
            onFavoriteToggle && onFavoriteToggle(hotel);
          }}
          aria-label={isFavorite ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
        >
          <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'} />
        </button>

        <div className="omra-card__rating">
          <i className="fas fa-star" />
          {rating}
          <span style={{ opacity: 0.65, fontSize: 11, marginLeft: 2 }}>({reviews || 0})</span>
        </div>

        <div className="omra-card__duration">
          <i className="fas fa-bed" />
          {available_rooms} room{available_rooms > 1 ? 's' : ''} left
        </div>
      </div>

      <div className="omra-card__body">
        <p className="omra-card__dest">{city}</p>
        <h3 className="omra-card__title">{name}</h3>
        <p style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {subtitle || 'Hotel selectionne par Tictac Voyages'}
        </p>
        <p className="omra-card__desc">{description}</p>

        <div className="omra-card__meta">
          <span><i className="fas fa-map-marker-alt" /> {address}</span>
          <span><i className="fas fa-fire" /> {Math.round(Number(occupancy_percentage) || 0)}% reserve</span>
        </div>

        {amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
            {amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  background: 'rgba(15,76,92,0.06)',
                  borderRadius: 8,
                  fontSize: 11,
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}
              >
                <i className="fas fa-check" style={{ color: 'var(--secondary)', fontSize: 10 }} />
                {amenity}
              </span>
            ))}
          </div>
        )}

        {isPopular && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>Popularite</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#f97316' }}>
                {reservation_count} reservation{reservation_count > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--gray-100)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Number(occupancy_percentage) || 0)}%`,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #1ECAD3, #E92F64)',
                }}
              />
            </div>
          </div>
        )}

        <div className="omra-card__footer">
          <div>
            {old_price ? (
              <span className="omra-card__price-from" style={{ textDecoration: 'line-through' }}>
                {Number(old_price).toLocaleString('fr-FR')} {currency}
              </span>
            ) : (
              <span className="omra-card__price-from">A partir de</span>
            )}
            <div className="omra-card__price-value">
              {Number(base_price || 0).toLocaleString('fr-FR')} {currency}
            </div>
            <span className="omra-card__price-per">/ nuit estimee</span>
          </div>

          <div className="omra-card__actions">
            <button className="omra-card__btn-details" onClick={() => onDetails && onDetails(hotel)}>
              Details
            </button>
            <button className="omra-card__btn-reserve" onClick={() => onReserve && onReserve(hotel)}>
              Reserver
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
