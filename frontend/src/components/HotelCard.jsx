import React, { useEffect, useMemo, useState } from 'react';

const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#0f4c5c"/>
        <stop offset="55%" stop-color="#1a6b80"/>
        <stop offset="100%" stop-color="#e8306a"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <g fill="#ffffff" fill-opacity="0.9">
      <rect x="378" y="228" width="444" height="344" rx="24"/>
      <rect x="430" y="286" width="140" height="140" rx="18" fill-opacity="0.18"/>
      <path d="M430 470l92-92 66 66 82-100 100 126H430z" fill="#0f4c5c" fill-opacity="0.28"/>
    </g>
    <text x="600" y="655" text-anchor="middle" fill="#ffffff" font-size="46" font-family="Arial, sans-serif" font-weight="700">
      Hotel Tictac Voyages
    </text>
  </svg>
`)}`;

const DEFAULT_PLANS = [
  { key: 'room-only', label: 'RO', fullLabel: 'Chambre seule', multiplier: 1 },
  { key: 'bed-breakfast', label: 'B&B', fullLabel: 'Petit-dejeuner', multiplier: 1.12 },
  { key: 'half-board', label: 'DP', fullLabel: 'Demi-pension', multiplier: 1.25 },
  { key: 'full-board', label: 'PC', fullLabel: 'Pension complete', multiplier: 1.38 },
  { key: 'all-inclusive', label: 'AI', fullLabel: 'All inclusive', multiplier: 1.55 },
];

const normalizePlanKey = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getPlanConfig = (value) => {
  const normalized = normalizePlanKey(value);
  const aliases = {
    'room-only': 'room-only',
    'chambre-seule': 'room-only',
    'sans-repas': 'room-only',
    'bed-and-breakfast': 'bed-breakfast',
    'bed-breakfast': 'bed-breakfast',
    'petit-dejeuner': 'bed-breakfast',
    'petit-dejeuner-inclus': 'bed-breakfast',
    'half-board': 'half-board',
    'demi-pension': 'half-board',
    'full-board': 'full-board',
    'pension-complete': 'full-board',
    'all-inclusive': 'all-inclusive',
    'tout-compris': 'all-inclusive',
  };

  const key = aliases[normalized] || normalized;
  return DEFAULT_PLANS.find((plan) => plan.key === key) || {
    key: normalized || 'custom-plan',
    label: String(value || 'Plan'),
    fullLabel: String(value || 'Plan'),
    multiplier: 1,
  };
};

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
    base_price,
    old_price,
    currency = 'TND',
    amenities = [],
    meal_plans = [],
    occupancy_percentage = 0,
    available_rooms = 0,
    reservation_count = 0,
    stars = 3,
    gallery = [],
  } = hotel;

  const cardImage = image_url || gallery.find(Boolean) || PLACEHOLDER_IMAGE;
  const availablePlans = useMemo(() => {
    if (!meal_plans.length) return DEFAULT_PLANS;
    return meal_plans.map(getPlanConfig);
  }, [meal_plans]);

  const [selectedPlan, setSelectedPlan] = useState(availablePlans[0] || DEFAULT_PLANS[0]);

  useEffect(() => {
    setSelectedPlan(availablePlans[0] || DEFAULT_PLANS[0]);
  }, [availablePlans]);

  const adjustedPrice = Math.round(Number(base_price || 0) * selectedPlan.multiplier);
  const adjustedOldPrice = old_price
    ? Math.round(Number(old_price) * selectedPlan.multiplier)
    : null;

  const occupancy = Math.min(100, Math.round(Number(occupancy_percentage) || 0));
  const isHighDemand = occupancy >= 70;
  const starCount = Math.max(1, Math.min(5, Number(stars || 0)));

  return (
    <article className="omra-card">
      <div className="omra-card__img">
        <img
          src={cardImage}
          alt={name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />

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

        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            background: 'rgba(10,40,50,0.75)',
            backdropFilter: 'blur(8px)',
            color: '#fbbf24',
            fontSize: 10,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {'★'.repeat(starCount)}
        </div>

        <div className="omra-card__duration">
          <i className="fas fa-door-open" />
          {available_rooms} chambre{available_rooms !== 1 ? 's' : ''} libre{available_rooms !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="omra-card__body">
        <p className="omra-card__dest">
          <i className="fas fa-map-marker-alt" style={{ marginRight: 4, fontSize: 10 }} />
          {city}
        </p>
        <h3 className="omra-card__title">{name}</h3>
        <p style={{ fontSize: 12, color: '#e8306a', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {subtitle || 'Selection Tictac Voyages'}
        </p>
        <p className="omra-card__desc">{description}</p>

        {amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {amenities.slice(0, 3).map((item) => (
              <span
                key={item}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  background: 'rgba(15,76,92,0.06)',
                  borderRadius: 8,
                  fontSize: 11,
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}
              >
                <i className="fas fa-check" style={{ color: '#e8306a', fontSize: 9 }} />
                {item}
              </span>
            ))}
            {amenities.length > 3 && (
              <span
                style={{
                  padding: '4px 10px',
                  background: 'var(--gray-100)',
                  borderRadius: 8,
                  fontSize: 11,
                  color: 'var(--gray-400)',
                  fontWeight: 600,
                }}
              >
                +{amenities.length - 3} autres
              </span>
            )}
          </div>
        )}

        {Number(reservation_count) > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)' }}>
                {isHighDemand ? 'Forte demande' : 'Popularite'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: isHighDemand ? '#f97316' : 'var(--gray-500)' }}>
                {occupancy}% reserve
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: 'var(--gray-100)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${occupancy}%`,
                  borderRadius: 999,
                  background: isHighDemand
                    ? 'linear-gradient(90deg, #f97316, #e92f64)'
                    : 'linear-gradient(90deg, #f79ab5, #e8306a)',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-100)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Formule choisie - le prix se met a jour automatiquement
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {availablePlans.map((plan) => (
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
                    ? '1.5px solid #e8306a'
                    : '1.5px solid var(--gray-200)',
                  background: selectedPlan.key === plan.key ? 'rgba(232,48,106,0.1)' : '#fff',
                  color: selectedPlan.key === plan.key ? '#b72754' : 'var(--gray-500)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {plan.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
            {selectedPlan.fullLabel}
            {selectedPlan.multiplier > 1 && (
              <span style={{ color: '#e8306a', fontWeight: 700, marginLeft: 6 }}>
                +{Math.round((selectedPlan.multiplier - 1) * 100)}%
              </span>
            )}
          </p>
        </div>

        <div className="omra-card__footer">
          <div>
            {adjustedOldPrice ? (
              <span className="omra-card__price-from" style={{ textDecoration: 'line-through', color: 'var(--gray-300)' }}>
                {adjustedOldPrice.toLocaleString('fr-FR')} {currency}
              </span>
            ) : (
              <span className="omra-card__price-from">A partir de</span>
            )}
            <div className="omra-card__price-value" style={{ transition: 'all 0.2s ease' }}>
              {adjustedPrice.toLocaleString('fr-FR')} {currency}
            </div>
            <span className="omra-card__price-per">/ nuit · {selectedPlan.fullLabel}</span>
          </div>

          <div className="omra-card__actions">
            <button className="omra-card__btn-details" onClick={() => onDetails && onDetails(hotel)}>
              Details
            </button>
            <button
              className="omra-card__btn-reserve"
              onClick={() => onReserve && onReserve({ ...hotel, _selectedPlan: selectedPlan.key, _adjustedPrice: adjustedPrice })}
            >
              Reserver
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
