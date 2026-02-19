import { useState, useRef, useEffect } from 'react';

const CardStyle = ({
  type = 'hotel',
  image,
  title,
  description,
  location,
  rating,
  badge,
  badgeType = 'default',
  amenities = [],
  price,
  currency = 'TND',
  priceUnit = '/ nuit',
  priceOptions = [
    { label: 'LPD', value: 180 },
    { label: 'DP', value: 250 },
    { label: 'PC', value: 320 },
    { label: 'AI', value: 420 },
  ],
  stars = 5,
  onDetailsClick = () => {},
  onReserveClick = () => {},
  onFavoriteClick = () => {},
  isFavorite = false,
}) => {
  const [currentPrice, setCurrentPrice] = useState(priceOptions[0]?.value || price || 0);
  const [activeOption, setActiveOption] = useState(priceOptions[0]?.label || 'LPD');
  const [favorite, setFavorite] = useState(isFavorite);
  const [isHovered, setIsHovered] = useState(false);
  const priceRef = useRef(null);

  useEffect(() => {
    if (priceRef.current) {
      priceRef.current.style.opacity = '1';
      priceRef.current.style.transform = 'translateY(0)';
    }
  }, []);

  const toggleFavorite = () => {
    setFavorite(!favorite);
    onFavoriteClick(!favorite);
  };

  const handlePriceChange = (option) => {
    setActiveOption(option.label);
    if (priceRef.current) {
      priceRef.current.style.opacity = '0';
      priceRef.current.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        setCurrentPrice(option.value);
        if (priceRef.current) {
          priceRef.current.style.opacity = '1';
          priceRef.current.style.transform = 'translateY(0)';
        }
      }, 150);
    } else {
      setCurrentPrice(option.value);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <i
        key={i}
        className={i < stars ? 'fas fa-star' : 'far fa-star'}
        style={{ color: 'var(--gold)', fontSize: '12px' }}
      />
    ));
  };

  return (
    <article
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-100)',
        overflow: 'hidden',
        transition: 'all var(--duration) var(--ease)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        borderColor: isHovered ? 'var(--secondary)' : 'var(--gray-100)',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={image}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s var(--ease)',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />

        {/* Badge */}
        {badge && (
          <span
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '6px 14px',
              background: badgeType === 'promo' 
                ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' 
                : badgeType === 'new' 
                ? 'var(--secondary)' 
                : 'var(--accent)',
              color: badgeType === 'promo' ? 'var(--gray-800)' : 'var(--white)',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {badge}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '38px',
            height: '38px',
            background: 'var(--white)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: favorite ? 'var(--accent)' : 'var(--gray-400)',
            fontSize: '14px',
            boxShadow: 'var(--shadow-md)',
            transition: 'all var(--duration) var(--ease)',
            transform: favorite ? 'scale(1.1)' : 'scale(1)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Ajouter aux favoris"
        >
          <i className={favorite ? 'fas fa-heart' : 'far fa-heart'} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '24px' }}>
        {/* Meta Info */}
        {type === 'hotel' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>{renderStars()}</div>
            {rating && (
              <span
                style={{
                  padding: '4px 10px',
                  background: 'var(--primary)',
                  color: 'var(--white)',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {rating}
              </span>
            )}
          </div>
        )}

        {/* Title & Location */}
        <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '6px', lineHeight: 1.3 }}>
          {title}
        </h3>

        {location && (
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray-400)', marginBottom: '12px' }}>
            <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent)', fontSize: '12px' }} />
            {location}
          </p>
        )}

        {/* Description */}
        {description && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--gray-500)',
              lineHeight: 1.6,
              marginBottom: '16px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {amenities.map((amenity, idx) => (
              <span
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  color: 'var(--gray-500)',
                }}
              >
                <i className={amenity.icon} style={{ color: 'var(--secondary)', fontSize: '10px' }} />
                {amenity.name}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--gray-100)', margin: '16px 0' }} />

        {/* Price Section */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '10px' }}>
            Sélectionnez une formule
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {priceOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handlePriceChange(option)}
                style={{
                  padding: '10px 16px',
                  background: activeOption === option.label ? 'var(--secondary)' : 'transparent',
                  border: `2px solid ${activeOption === option.label ? 'var(--secondary)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: activeOption === option.label ? 'var(--white)' : 'var(--gray-600)',
                  transition: 'all var(--duration) var(--ease)',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '16px' }}>
            <span
              ref={priceRef}
              style={{
                fontSize: '30px',
                fontWeight: 800,
                color: 'var(--accent)',
                transition: 'opacity 0.15s var(--ease), transform 0.15s var(--ease)',
              }}
            >
              {currentPrice}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>{currency}</span>
            <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{priceUnit}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onDetailsClick}
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'transparent',
              color: 'var(--primary)',
              border: '2px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all var(--duration) var(--ease)',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-info-circle" /> Détails
          </button>
          <button
            onClick={onReserveClick}
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'transparent',
              color: 'var(--accent)',
              border: '2px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all var(--duration) var(--ease)',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-check" /> Réserver
          </button>
        </div>
      </div>
    </article>
  );
};

export default CardStyle;
