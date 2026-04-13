// src/components/FlightCard.jsx
import React from 'react';

// ── Helpers ────────────────────────────────────────────────────
const fmtDuration = (dur) => {
  if (!dur) return '—';
  const h = dur.match(/(\d+)H/)?.[1];
  const m = dur.match(/(\d+)M/)?.[1];
  return [h ? `${h}h` : '', m ? `${m}min` : ''].filter(Boolean).join(' ') || dur;
};

const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
};

const CABIN_LABELS = {
  economy:         'Économique',
  premium_economy: 'Premium Éco',
  business:        'Affaires',
  first:           'Première',
};

// ── FlightCard ─────────────────────────────────────────────────
const FlightCard = ({ offer, onSelect }) => {
  const totalPrice = parseFloat(offer.total_amount ?? '0');
  const currency   = offer.total_currency ?? 'TND';
  const s          = offer._summary ?? {};

  const stops = s.stops ?? 0;
  const stopsLabel =
    stops === 0 ? 'Direct' :
    stops === 1 ? '1 escale' :
    `${stops} escales`;

  // Seats urgency color
  const seats = s.available_seats;
  const seatsColor =
    seats === null ? '#94a3b8' :
    seats <= 3     ? '#dc2626' :
    seats <= 7     ? '#f97316' :
    '#16a34a';

  return (
    <div style={{
      background:   '#fff',
      borderRadius: 16,
      border:       '1px solid #f1f5f9',
      boxShadow:    '0 2px 12px rgba(0,0,0,0.06)',
      overflow:     'hidden',
      transition:   'box-shadow .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Main row */}
      <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>

        {/* Airline logo */}
        <div style={{ minWidth: 52, textAlign: 'center', flexShrink: 0 }}>
          {s.airline_logo ? (
            <img src={s.airline_logo} alt={s.airline_name}
              style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8,
                border: '1px solid #f1f5f9', padding: 4 }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0f9ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-plane" style={{ color: '#0369a1', fontSize: 16 }} />
            </div>
          )}
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', margin: '4px 0 0', letterSpacing: 1 }}>
            {s.airline_iata}
          </p>
        </div>

        {/* Route */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
          {/* Depart */}
          <div style={{ textAlign: 'center', minWidth: 64 }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#0a2832', margin: 0, lineHeight: 1 }}>
              {fmtTime(s.departing_at)}
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--secondary, #e67e22)', margin: '2px 0' }}>
              {s.origin_iata}
            </p>
            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{fmtDate(s.departing_at)}</p>
          </div>

          {/* Timeline */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDuration(s.duration)}</span>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <i className="fas fa-plane" style={{ fontSize: 11, color: '#94a3b8', margin: '0 6px' }} />
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: stops === 0 ? '#f0fdf4' : '#fff8e1',
              color:      stops === 0 ? '#16a34a' : '#b07d00',
            }}>
              {stopsLabel}
            </span>
          </div>

          {/* Arrive */}
          <div style={{ textAlign: 'center', minWidth: 64 }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#0a2832', margin: 0, lineHeight: 1 }}>
              {fmtTime(s.arriving_at)}
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--secondary, #e67e22)', margin: '2px 0' }}>
              {s.destination_iata}
            </p>
            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{fmtDate(s.arriving_at)}</p>
          </div>
        </div>

        {/* Cabin */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <span style={{ display: 'inline-block', background: '#f0f9ff', color: '#0369a1',
            borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
            {CABIN_LABELS[offer.cabin_class] ?? offer.cabin_class ?? 'Economy'}
          </span>
          {s.airline_name && (
            <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0', fontWeight: 600 }}>
              {s.airline_name}
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div style={{ textAlign: 'right', minWidth: 140, flexShrink: 0 }}>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--secondary, #e67e22)', margin: '0 0 6px' }}>
            {isNaN(totalPrice) ? '—' : totalPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 4 }}>{currency}</span>
          </p>
          <button onClick={() => onSelect(offer)}
            style={{
              background:   'linear-gradient(135deg, #A01238,  #A01238)',
              color:        '#fff', border: 'none', padding: '10px 20px',
              borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              whiteSpace:   'nowrap',
            }}>
            Sélectionner →
          </button>
        </div>
      </div>

      {/* Footer bar — bagages + places */}
      <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9',
        padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

        {/* Baggage */}
        {s.baggage_included !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
            color: s.baggage_included ? '#16a34a' : '#94a3b8' }}>
            <i className={`fas ${s.baggage_included ? 'fa-check-circle' : 'fa-times-circle'}`}
              style={{ fontSize: 13 }} />
            {s.baggage_included
              ? `Bagage inclus${s.checked_bags ? ` (${s.checked_bags}×${s.carry_on_bags ? ' + cabine' : ''})` : ''}`
              : 'Sans bagage'}
          </span>
        )}

        {/* Carry-on only */}
        {s.baggage_included && s.carry_on_bags > 0 && s.checked_bags === 0 && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="fas fa-suitcase" style={{ fontSize: 12 }} />
            Bagage cabine uniquement
          </span>
        )}

        {/* Available seats */}
        {seats !== null && (
          <span style={{ fontSize: 12, fontWeight: 700, color: seatsColor, marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="fas fa-chair" style={{ fontSize: 11 }} />
            {seats <= 3
              ? `⚡ Plus que ${seats} place${seats > 1 ? 's' : ''} !`
              : `${seats} places disponibles`}
          </span>
        )}

        {/* Taxes label */}
        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: seats === null ? 'auto' : 0 }}>
          <i className="fas fa-lock" style={{ marginRight: 4, fontSize: 10 }} />
          Taxes incluses
        </span>
      </div>
    </div>
  );
};

export default FlightCard;