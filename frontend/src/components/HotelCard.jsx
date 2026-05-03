import React, { useState } from 'react';

// ─── Meal plan multipliers ────────────────────────────────────
// base_price from DB = Room Only price; others are calculated from it.
const DEFAULT_PLANS = [
  { key: 'Room Only',        label: 'RO',  fullLabel: 'Room Only',        multiplier: 1.00 },
  { key: 'Bed & Breakfast',  label: 'B&B', fullLabel: 'Bed & Breakfast',  multiplier: 1.12 },
  { key: 'Half Board',       label: 'HB',  fullLabel: 'Half Board',       multiplier: 1.25 },
  { key: 'Full Board',       label: 'FB',  fullLabel: 'Full Board',       multiplier: 1.38 },
  { key: 'All Inclusive',    label: 'AI',  fullLabel: 'All Inclusive',    multiplier: 1.55 },
];

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
    meal_plans = [],
    occupancy_percentage = 0,
    available_rooms = 0,
    reservation_count = 0,
    stars = 3,
  } = hotel;

  // Build available plans for this hotel (filter DEFAULT_PLANS to those the hotel supports,
  // or show all if hotel.meal_plans is empty)
  const availablePlans = DEFAULT_PLANS.filter(p =>
    meal_plans.length === 0 || meal_plans.includes(p.key)
  );

  const [selectedPlan, setSelectedPlan] = useState(availablePlans[0] || DEFAULT_PLANS[0]);

  const adjustedPrice = Math.round(Number(base_price || 0) * selectedPlan.multiplier);
  const adjustedOldPrice = old_price
    ? Math.round(Number(old_price) * selectedPlan.multiplier)
    : null;

  const occupancy = Math.min(100, Math.round(Number(occupancy_percentage) || 0));
  const isHighDemand = occupancy >= 70;

  return (
    <article className="omra-card">
      {/* ── Image ─────────────────────────────────────────── */}
      <div className="omra-card__img">
        <img src={image_url} alt={name} loading="lazy" />

        {badge && <span className="omra-card__badge">{badge}</span>}

        <button
          className={`omra-card__heart ${isFavorite ? 'omra-card__heart--active' : ''}`}
          onClick={e => { e.stopPropagation(); onFavoriteToggle && onFavoriteToggle(hotel); }}
          aria-label={isFavorite ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
        >
          <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'} />
        </button>

        <div className="omra-card__rating">
          <i className="fas fa-star" />
          {rating}
          <span style={{ opacity: 0.65, fontSize: 11, marginLeft: 2 }}>({reviews || 0})</span>
        </div>

        {/* Star badges */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          background: 'rgba(10,40,50,0.75)', backdropFilter: 'blur(8px)',
          color: '#fbbf24', fontSize: 10, fontWeight: 700,
          padding: '4px 10px', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          {'★'.repeat(stars)}
        </div>

        <div className="omra-card__duration">
          <i className="fas fa-door-open" />
          {available_rooms} room{available_rooms !== 1 ? 's' : ''} left
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="omra-card__body">
        <p className="omra-card__dest">
          <i className="fas fa-map-marker-alt" style={{ marginRight: 4, fontSize: 10 }} />
          {city}
        </p>
        <h3 className="omra-card__title">{name}</h3>
        <p style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {subtitle || 'Selected by Tictac Voyages'}
        </p>
        <p className="omra-card__desc">{description}</p>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {amenities.slice(0, 3).map(a => (
              <span key={a} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', background: 'rgba(15,76,92,0.06)',
                borderRadius: 8, fontSize: 11, color: 'var(--primary)', fontWeight: 600,
              }}>
                <i className="fas fa-check" style={{ color: 'var(--secondary)', fontSize: 9 }} />
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span style={{ padding: '4px 10px', background: 'var(--gray-100)', borderRadius: 8, fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Occupancy bar */}
        {Number(reservation_count) > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)' }}>
                {isHighDemand ? '🔥 High demand' : 'Popularity'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: isHighDemand ? '#f97316' : 'var(--gray-500)' }}>
                {occupancy}% booked
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: 'var(--gray-100)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${occupancy}%`, borderRadius: 999,
                background: isHighDemand
                  ? 'linear-gradient(90deg, #f97316, #e92f64)'
                  : 'linear-gradient(90deg, #1ECAD3, #0F4C5C)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}

        {/* ── Meal Plan Selector ─────────────────────────── */}
        <div style={{
          background: 'var(--gray-50)',
          border: '1px solid var(--gray-100)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Meal Plan — price adjusts automatically
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {availablePlans.map(plan => (
              <button
                key={plan.key}
                onClick={() => setSelectedPlan(plan)}
                title={plan.fullLabel}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: selectedPlan.key === plan.key
                    ? '1.5px solid var(--secondary)'
                    : '1.5px solid var(--gray-200)',
                  background: selectedPlan.key === plan.key
                    ? 'rgba(30,202,211,0.12)'
                    : '#fff',
                  color: selectedPlan.key === plan.key
                    ? 'var(--primary)'
                    : 'var(--gray-500)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {plan.label === 'All Inclusive' ? '🍽 AI' : plan.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
            {selectedPlan.fullLabel}
            {selectedPlan.multiplier > 1 && (
              <span style={{ color: 'var(--secondary)', fontWeight: 700, marginLeft: 6 }}>
                +{Math.round((selectedPlan.multiplier - 1) * 100)}% included
              </span>
            )}
          </p>
        </div>

        {/* ── Footer: price + buttons ────────────────────── */}
        <div className="omra-card__footer">
          <div>
            {adjustedOldPrice ? (
              <span className="omra-card__price-from" style={{ textDecoration: 'line-through', color: 'var(--gray-300)' }}>
                {adjustedOldPrice.toLocaleString('fr-FR')} {currency}
              </span>
            ) : (
              <span className="omra-card__price-from">From</span>
            )}
            <div className="omra-card__price-value" style={{ transition: 'all 0.2s ease' }}>
              {adjustedPrice.toLocaleString('fr-FR')} {currency}
            </div>
            <span className="omra-card__price-per">/ night · {selectedPlan.label}</span>
          </div>

          <div className="omra-card__actions">
            <button className="omra-card__btn-details" onClick={() => onDetails && onDetails(hotel)}>
              Details
            </button>
            <button
              className="omra-card__btn-reserve"
              onClick={() => onReserve && onReserve({ ...hotel, _selectedPlan: selectedPlan.key, _adjustedPrice: adjustedPrice })}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;