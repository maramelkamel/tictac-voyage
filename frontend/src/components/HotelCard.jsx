// src/components/HotelCard.jsx
import React, { useState } from 'react';

// ── Helpers ────────────────────────────────────────────────────
const fmtPrice = (amount, currency = 'TND') => {
  const n = parseFloat(amount || 0);
  return isNaN(n) ? '—' : n.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
};

const StarRating = ({ stars, size = 12 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width={size} height={size}
        fill={i <= stars ? '#f59e0b' : 'none'}
        stroke={i <= stars ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
);

// ── HotelCard ──────────────────────────────────────────────────
const HotelCard = ({ hotel, checkIn, checkOut, onSelect }) => {
  const [imgErr, setImgErr] = useState(false);
  const price    = parseFloat(hotel.total_amount || 0);
  const currency = hotel.total_currency || 'TND';

  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 1;

  const pricePerNight = nights > 0 ? (price / nights) : price;

  return (
    <div style={{
      background:   '#fff',
      borderRadius: 16,
      border:       '1px solid #f1f5f9',
      boxShadow:    '0 2px 12px rgba(0,0,0,0.06)',
      overflow:     'hidden',
      display:      'flex',
      transition:   'box-shadow .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Image */}
      <div style={{ width: 220, minWidth: 220, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {hotel.main_image && !imgErr ? (
          <img
            src={hotel.main_image}
            alt={hotel.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', minHeight: 160,
            background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" width="40" height="40">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}
        {/* Stars overlay */}
        <div style={{ position: 'absolute', bottom: 8, left: 8,
          background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '4px 8px' }}>
          <StarRating stars={hotel.stars} />
        </div>
        {/* Override badge */}
        {hotel._price_overridden && (
          <div style={{ position: 'absolute', top: 8, left: 8,
            background: '#d97706', color: '#fff', borderRadius: 6,
            padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
            Prix spécial
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a2832', margin: '0 0 4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {hotel.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  width="12" height="12" style={{ marginRight: 3, verticalAlign: 'middle' }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {hotel.city || hotel.destination_name}
              </span>
              {hotel.category_name && (
                <span style={{ background: '#f0f9ff', color: '#0369a1', borderRadius: 6,
                  padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  {hotel.category_name}
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
              {nights > 1 ? `${nights} nuits` : 'par nuit'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--secondary, #e67e22)', lineHeight: 1 }}>
              {fmtPrice(price, currency)}
              <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 4 }}>{currency}</span>
            </div>
            {nights > 1 && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                ≈ {fmtPrice(pricePerNight)} TND/nuit
              </div>
            )}
          </div>
        </div>

        {/* Description excerpt */}
        {hotel.description && (
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden' }}>
            {hotel.description}
          </p>
        )}

        {/* Facilities chips */}
        {hotel.facilities?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hotel.facilities.slice(0, 5).map((f, i) => (
              <span key={i} style={{ fontSize: 11, background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 6, padding: '2px 8px', color: '#64748b' }}>
                {f}
              </span>
            ))}
            {hotel.facilities.length > 5 && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>+{hotel.facilities.length - 5}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Board */}
            {hotel.board_name && (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a',
                display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
                {hotel.board_name}
              </span>
            )}
            {/* Available rooms */}
            {hotel.available_rooms > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600,
                color: hotel.available_rooms <= 3 ? '#dc2626' : '#64748b',
                display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                {hotel.available_rooms <= 3
                  ? `⚡ Plus que ${hotel.available_rooms} chambre${hotel.available_rooms > 1 ? 's' : ''} !`
                  : `${hotel.available_rooms} chambres`}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                width="10" height="10" style={{ marginRight: 3 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Taxes incluses
            </span>
            <button onClick={() => onSelect(hotel)}
              style={{
                background:   'linear-gradient(135deg, var(--secondary, #e67e22), #d35400)',
                color:        '#fff', border: 'none', padding: '9px 18px',
                borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                whiteSpace:   'nowrap',
              }}>
              Voir →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;