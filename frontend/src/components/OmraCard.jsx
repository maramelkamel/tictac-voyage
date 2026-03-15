import { useState } from 'react';

const OmraCard = ({ pkg, onDetails, onReserve }) => {
  const [hovered,  setHovered]  = useState(false);
  const [favorite, setFavorite] = useState(false);

  const badgeColors = {
    promo:   'linear-gradient(135deg, #D4A017, #F0C040)',
    new:     'var(--secondary)',
    default: 'var(--accent)',
  };
  const badgeTextColors = {
    promo:   '#5a3e00',
    new:     'var(--white)',
    default: 'var(--white)',
  };

  // ── Available spots logic ──────────────────────────────────────
  // Backend now returns available_spots = spots - confirmed reservations
  const totalSpots     = Number(pkg.spots)           || 0;
  const availableSpots = pkg.available_spots !== undefined
    ? Number(pkg.available_spots)
    : totalSpots;
  const isFull        = availableSpots <= 0;
  const isAlmostFull  = availableSpots <= 5 && availableSpots > 0;
  const fillPercent   = totalSpots > 0
    ? Math.min(100, Math.round(((totalSpots - availableSpots) / totalSpots) * 100))
    : 0;

  // Color of the progress bar
  const barColor = isFull ? '#e92f64'
    : isAlmostFull ? '#f97316'
    : '#10b981';

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)',
        borderRadius: '20px',
        border: `1px solid ${hovered ? 'var(--secondary)' : 'var(--gray-100)'}`,
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 24px 56px rgba(15,76,92,0.18)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        opacity: isFull ? 0.75 : 1,
      }}
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={pkg.image}
          alt={pkg.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: hovered ? 'scale(1.09)' : 'scale(1)',
            filter: isFull ? 'grayscale(30%)' : 'none',
          }}
        />

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,40,50,0.55) 0%, transparent 55%)' }} />

        {/* Badge */}
        {pkg.badge && (
          <span style={{
            position: 'absolute', top: 16, left: 16,
            padding: '6px 14px',
            background: badgeColors[pkg.badgeType] || 'var(--accent)',
            color: badgeTextColors[pkg.badgeType] || 'var(--white)',
            fontSize: '11px', fontWeight: 700, borderRadius: '8px',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {pkg.badge}
          </span>
        )}

        {/* Complet badge — shows when full */}
        {isFull && (
          <span style={{
            position: 'absolute', top: 16, right: 14,
            padding: '6px 14px', background: '#e92f64', color: '#fff',
            fontSize: '11px', fontWeight: 700, borderRadius: '8px',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Complet
          </span>
        )}

        {/* Favorite button — only when not full */}
        {!isFull && (
          <button
            onClick={() => setFavorite(f => !f)}
            aria-label="Ajouter aux favoris"
            style={{
              position: 'absolute', top: 12, right: 14,
              width: 38, height: 38,
              background: 'rgba(255,255,255,0.92)', borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: favorite ? '#e53e3e' : 'var(--gray-400)', fontSize: 15,
              transition: 'all 0.25s ease',
              transform: favorite ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <i className={favorite ? 'fas fa-heart' : 'far fa-heart'} />
          </button>
        )}

        {/* Duration pill */}
        <div style={{
          position: 'absolute', bottom: 14, left: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50,
          padding: '5px 12px', color: 'var(--white)', fontSize: 12, fontWeight: 600,
        }}>
          <i className="fas fa-calendar-alt" style={{ fontSize: 11 }} />
          {pkg.duration} jours
        </div>

        {/* Spots pill — bottom right of image */}
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 5,
          background: isFull ? 'rgba(233,47,100,0.9)' : isAlmostFull ? 'rgba(249,115,22,0.9)' : 'rgba(16,185,129,0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 50, padding: '5px 12px',
          color: '#fff', fontSize: 11, fontWeight: 700,
        }}>
          <i className={isFull ? 'fas fa-times-circle' : 'fas fa-users'} style={{ fontSize: 10 }} />
          {isFull ? 'Complet' : `${availableSpots} place${availableSpots > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <i key={i} className={i < Math.floor(pkg.rating) ? 'fas fa-star' : 'far fa-star'}
                style={{ color: '#D4A017', fontSize: 11 }} />
            ))}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{pkg.rating}</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>({pkg.reviews} avis)</span>
        </div>

        {/* Title & subtitle */}
        <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--gray-800)', marginBottom: 3, lineHeight: 1.2 }}>
          {pkg.title}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {pkg.subtitle}
        </p>

        {/* Departure */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-400)', marginBottom: 14 }}>
          <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent)', fontSize: 11 }} />
          Départ : {pkg.departure}
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.65, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {pkg.description}
        </p>

        {/* ── Availability progress bar ── */}
        {!isFull && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}>
                Disponibilité
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>
                {availableSpots} / {totalSpots} place{totalSpots > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${fillPercent}%`,
                background: barColor,
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
            {isAlmostFull && (
              <p style={{ fontSize: 11, color: '#f97316', fontWeight: 600, marginTop: 4 }}>
                🔥 Plus que {availableSpots} place{availableSpots > 1 ? 's' : ''} disponible{availableSpots > 1 ? 's' : ''} !
              </p>
            )}
          </div>
        )}

        {/* Full notice */}
        {isFull && (
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            background: '#fff1f5', border: '1px solid #fca5c0',
            borderRadius: 10, fontSize: 12, color: '#e92f64', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="fas fa-times-circle" />
            Ce forfait est complet. Contactez-nous pour être sur liste d'attente.
          </div>
        )}

        {/* Includes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
          {pkg.includes.map((inc, i) => (
            <span key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', background: 'rgba(15,76,92,0.06)',
              borderRadius: 8, fontSize: 11, color: 'var(--primary)', fontWeight: 600,
            }}>
              <i className={inc.icon} style={{ color: 'var(--secondary)', fontSize: 10 }} />
              {inc.label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 0 18px' }} />

        {/* Price + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 'auto' }}>

          {/* Price */}
          <div>
            {pkg.oldPrice && (
              <span style={{ fontSize: 13, color: 'var(--gray-400)', textDecoration: 'line-through', display: 'block', lineHeight: 1 }}>
                {pkg.oldPrice.toLocaleString('fr-TN')} TND
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: isFull ? 'var(--gray-400)' : 'var(--accent)', lineHeight: 1.1 }}>
                {pkg.price.toLocaleString('fr-TN')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isFull ? 'var(--gray-400)' : 'var(--accent)' }}>TND</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>/ personne</span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 9 }}>
            <button
              onClick={() => onDetails && onDetails(pkg)}
              style={{
                padding: '11px 17px', fontSize: 13, fontWeight: 600,
                background: 'transparent', color: 'var(--primary)',
                border: '2px solid var(--gray-200)', borderRadius: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.22s ease', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(15,76,92,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <i className="fas fa-info-circle" /> Détails
            </button>

            <button
              onClick={() => !isFull && onReserve && onReserve(pkg)}
              disabled={isFull}
              style={{
                padding: '11px 17px', fontSize: 13, fontWeight: 700,
                background: isFull ? 'var(--gray-200)' : 'var(--secondary)',
                color: isFull ? 'var(--gray-400)' : 'var(--white)',
                border: `2px solid ${isFull ? 'var(--gray-200)' : 'var(--secondary)'}`,
                borderRadius: 12,
                cursor: isFull ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.22s ease', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!isFull) { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; } }}
              onMouseLeave={e => { if (!isFull) { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--secondary)'; } }}
            >
              <i className={isFull ? 'fas fa-ban' : 'fas fa-kaaba'} />
              {isFull ? 'Complet' : 'Réserver'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default OmraCard;