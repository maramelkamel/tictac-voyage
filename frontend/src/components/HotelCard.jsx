import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HotelCard = ({ hotel, searchParams, onSelect }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('hotels');
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : i18n.resolvedLanguage === 'ar' ? 'ar-TN' : 'fr-FR';

  const {
    id,
    name = 'Hotel',
    photos = [],
    main_image,
    star_rating = 0,
    review_score = 0,
    city = '',
    country = '',
    amenities = [],
    total_amount = 0,
    total_currency = 'TND',
  } = hotel;

  const photo = main_image || photos?.[0] || '';
  const stars = Math.max(0, Math.round(Number(star_rating) || 0));
  const destination = [city, country].filter(Boolean).join(', ');
  const price = Number(total_amount || 0);

  const handleViewDetails = () => {
    if (onSelect) onSelect(hotel);
    navigate(`/hotels/${id}`, {
      state: { hotel, searchParams },
    });
  };

  return (
    <div className="hotel-card" onClick={handleViewDetails}>
      <div className="hotel-card__img-wrap">
        {photo ? (
          <img src={photo} alt={name} className="hotel-card__img" />
        ) : (
          <div className="hotel-card__img-placeholder">🏨</div>
        )}
        {stars > 0 && (
          <div className="hotel-card__stars-badge">
            {'⭐'.repeat(Math.min(stars, 5))}
          </div>
        )}
      </div>

      <div className="hotel-card__body">
        <div className="hotel-card__name">{name}</div>

        {destination && (
          <div className="hotel-card__location">
            <span className="hotel-card__location-icon">📍</span>
            {destination}
          </div>
        )}

        {review_score > 0 && (
          <div className="hotel-card__rating">
            {t('ratingLabel', { score: review_score })}
          </div>
        )}

        {amenities.length > 0 && (
          <div className="hotel-card__amenities">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="hotel-card__amenity-tag">
                {typeof amenity === 'string' ? amenity : amenity?.description || amenity?.type}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="hotel-card__amenity-tag hotel-card__amenity-more">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="hotel-card__footer">
          <div className="hotel-card__price-block">
            {price > 0 ? (
              <>
                <span className="hotel-card__price">
                  {price.toLocaleString(locale, { minimumFractionDigits: 0 })}
                </span>
                <span className="hotel-card__currency"> {total_currency}</span>
                <div className="hotel-card__price-label">{t('fromStay')}</div>
              </>
            ) : (
              <span className="hotel-card__price-na">{t('priceUnavailable')}</span>
            )}
          </div>
          <button
            className="hotel-card__cta"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            {t('viewDetails')}
          </button>
        </div>
      </div>

      <style>{`
        .hotel-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .hotel-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .hotel-card__img-wrap {
          position: relative;
          height: 200px;
          background: var(--gray-100);
          overflow: hidden;
        }
        .hotel-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .hotel-card:hover .hotel-card__img {
          transform: scale(1.04);
        }
        .hotel-card__img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          background: var(--gray-50);
          color: var(--gray-300);
        }
        .hotel-card__stars-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.92);
          border-radius: var(--radius-full);
          padding: 4px 10px;
          font-size: 12px;
          backdrop-filter: blur(4px);
        }
        .hotel-card__body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .hotel-card__name {
          font-size: 16px;
          font-weight: 700;
          color: var(--primary);
          line-height: 1.3;
        }
        .hotel-card__location,
        .hotel-card__rating {
          font-size: 13px;
          color: var(--gray-400);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .hotel-card__amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .hotel-card__amenity-tag {
          background: var(--gray-50);
          color: var(--gray-500);
          font-size: 11px;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--gray-100);
        }
        .hotel-card__amenity-more {
          background: var(--primary);
          color: var(--white);
          border-color: var(--primary);
        }
        .hotel-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid var(--gray-100);
          gap: 12px;
        }
        .hotel-card__price {
          font-size: 20px;
          font-weight: 800;
          color: var(--primary);
        }
        .hotel-card__currency {
          font-size: 12px;
          color: var(--gray-400);
        }
        .hotel-card__price-label,
        .hotel-card__price-na {
          font-size: 12px;
          color: var(--gray-300);
        }
        .hotel-card__cta {
          background: var(--accent);
          color: var(--white);
          border: none;
          border-radius: var(--radius-full);
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.15s ease;
          white-space: nowrap;
        }
        .hotel-card__cta:hover {
          background: var(--accent-dark);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default HotelCard;
