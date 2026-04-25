// src/components/CircuitCard.jsx
import { useState } from 'react';

const DIFF_META = {
  Facile:   { color: '#10b981', bg: '#d1fae5', icon: '🟢' },
  Modere:   { color: '#f97316', bg: '#fff7ed', icon: '🟡' },
  'Modéré': { color: '#f97316', bg: '#fff7ed', icon: '🟡' },
  Aventure: { color: '#E92F64', bg: 'rgba(233,47,100,.1)', icon: '🔴' },
};

const TAG_COLORS = {
  teal:   { bg: 'rgba(30,202,211,.15)',  color: '#0e7490' },
  blue:   { bg: 'rgba(59,130,246,.13)',  color: '#1d4ed8' },
  green:  { bg: 'rgba(16,185,129,.13)',  color: '#065f46' },
  orange: { bg: 'rgba(249,115,22,.13)',  color: '#c2410c' },
  accent: { bg: 'rgba(233,47,100,.13)',  color: '#E92F64' },
  violet: { bg: 'rgba(139,92,246,.13)',  color: '#5b21b6' },
};

const CircuitCard = ({
  circuit,
  onDetails,
  onReserve,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  const [hovered, setHovered] = useState(false);

  const {
    title, subtitle, description, image, price, oldPrice,
    duration, rating, avis, places, badge, difficulty,
    group, highlights = [], tag, tagColor, departure,
    reservation_count,
  } = circuit;

  /* ── Spots (same logic as OmraCard) ─────────────────────────── */
  const totalSpots     = (Number(places) || 0) + (Number(reservation_count) || 0);
  const availableSpots = Number(places) || 0;
  const isFull         = availableSpots <= 0;
  const isAlmostFull   = availableSpots <= 5 && availableSpots > 0;
  const fillPercent    = totalSpots > 0
    ? Math.min(100, Math.round(((totalSpots - availableSpots) / totalSpots) * 100))
    : 0;
  const barColor = isFull ? '#e92f64' : isAlmostFull ? '#f97316' : '#10b981';

  const diffMeta = DIFF_META[difficulty] || DIFF_META.Facile;
  const tagMeta  = TAG_COLORS[tagColor]  || TAG_COLORS.teal;

  return (
    <article
      className={`ci-omra-card${isFull ? ' ci-omra-card--full' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 24px 56px rgba(15,76,92,0.18)'
          : '0 2px 12px rgba(0,0,0,0.05)',
        border: `1.5px solid ${hovered ? 'var(--ci-secondary)' : 'rgba(15,76,92,0.08)'}`,
      }}
    >
      {/* ══ IMAGE ══════════════════════════════════════════════════ */}
      <div className="ci-omra-card__img">
        <img
          src={image}
          alt={title}
          loading="lazy"
          style={{
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            filter: isFull ? 'grayscale(28%)' : 'none',
          }}
        />

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,40,50,.6) 0%, transparent 55%)',
        }} />

        {/* Tag */}
        {tag && (
          <span className="ci-omra-card__tag"
            style={{ background: tagMeta.bg, color: tagMeta.color }}>
            {tag}
          </span>
        )}

        {/* Badge */}
        {badge && <span className="ci-omra-card__badge">{badge}</span>}

        {/* Complet overlay */}
        {isFull && (
          <span style={{
            position: 'absolute', top: 14, right: 14,
            padding: '5px 13px', background: '#e92f64', color: '#fff',
            fontSize: 11, fontWeight: 700, borderRadius: 8,
            textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            Complet
          </span>
        )}

        {/* Heart button — only when not full */}
        {!isFull && (
          <button
            className={`ci-omra-card__heart${isFavorite ? ' ci-omra-card__heart--active' : ''}`}
            onClick={e => { e.stopPropagation(); onFavoriteToggle && onFavoriteToggle(circuit); }}
            aria-label={isFavorite ? `Retirer ${title} des favoris` : `Ajouter ${title} aux favoris`}
          >
            <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'} />
          </button>
        )}

        {/* Rating pill */}
        <div className="ci-omra-card__rating" style={{ right: isFull ? 14 : 60 }}>
          <span>★ {rating}</span>
          <span className="ci-omra-card__rating-count">({avis})</span>
        </div>

        {/* Duration — bottom left */}
        <div style={{
          position: 'absolute', bottom: 13, left: 14,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,.25)', borderRadius: 50,
          padding: '5px 12px', color: '#fff', fontSize: 12, fontWeight: 600,
        }}>
          <i className="fas fa-calendar-alt" style={{ fontSize: 11 }} />
          {duration}
        </div>

        {/* Spots pill — bottom right */}
        <div style={{
          position: 'absolute', bottom: 13, right: 14,
          display: 'flex', alignItems: 'center', gap: 5,
          background: isFull
            ? 'rgba(233,47,100,.9)'
            : isAlmostFull ? 'rgba(249,115,22,.9)' : 'rgba(16,185,129,.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 50, padding: '5px 12px',
          color: '#fff', fontSize: 11, fontWeight: 700,
        }}>
          <i className={isFull ? 'fas fa-times-circle' : 'fas fa-users'} style={{ fontSize: 10 }} />
          {isFull ? 'Complet' : `${availableSpots} place${availableSpots > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* ══ BODY ═══════════════════════════════════════════════════ */}
      <div className="ci-omra-card__body">

        {/* Stars row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <i key={i}
                className={i < Math.floor(rating) ? 'fas fa-star' : 'far fa-star'}
                style={{ color: '#D4A017', fontSize: 11 }}
              />
            ))}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ci-primary)' }}>{rating}</span>
          <span style={{ fontSize: 12, color: 'var(--ci-g400)' }}>({avis} avis)</span>
        </div>

        {/* Title */}
        <h3 className="ci-omra-card__title">{title}</h3>

        {/* Subtitle */}
        {subtitle && <p className="ci-omra-card__subtitle">{subtitle}</p>}

        {/* Departure */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--ci-g400)', marginBottom: 12,
        }}>
          <i className="fas fa-map-marker-alt" style={{ color: 'var(--ci-accent)', fontSize: 11 }} />
          Départ : {departure || 'Tunis'}
        </div>

        {/* Description */}
        <p className="ci-omra-card__desc">{description}</p>

        {/* Difficulty + Group */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 14, flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 999,
            background: diffMeta.bg, color: diffMeta.color,
            fontSize: 11, fontWeight: 700,
          }}>
            {diffMeta.icon} {difficulty}
          </span>
          {group && (
            <span style={{
              fontSize: 12, color: 'var(--ci-g500)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <i className="fas fa-users" style={{ fontSize: 11, color: 'var(--ci-g400)' }} />
              {group}
            </span>
          )}
        </div>

        {/* Highlights — replaces OmraCard's includes */}
        {highlights.length > 0 && (
          <div className="ci-omra-card__highlights">
            {highlights.slice(0, 4).map((h, i) => (
              <span key={i} className="ci-omra-card__highlight">
                <i className="fas fa-check" style={{ fontSize: 9, color: 'var(--ci-secondary)' }} />
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Availability progress bar */}
        {!isFull && totalSpots > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 5,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ci-g500)' }}>
                Disponibilité
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>
                {availableSpots} / {totalSpots} place{totalSpots > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ height: 5, background: 'var(--ci-g100)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${fillPercent}%`,
                background: barColor, borderRadius: 99,
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
            Ce circuit est complet. Contactez-nous pour être sur liste d'attente.
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--ci-g100)', margin: '0 0 18px' }} />

        {/* Price + Actions */}
        <div className="ci-omra-card__footer">
          <div>
            {oldPrice && (
              <span style={{
                fontSize: 13, color: 'var(--ci-g400)',
                textDecoration: 'line-through', display: 'block', lineHeight: 1,
              }}>
                {oldPrice.toLocaleString('fr-TN')} DT
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{
                fontSize: 28, fontWeight: 900, lineHeight: 1.1,
                color: isFull ? 'var(--ci-g400)' : 'var(--ci-accent)',
              }}>
                {price.toLocaleString('fr-TN')}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isFull ? 'var(--ci-g400)' : 'var(--ci-accent)',
              }}>
                DT
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--ci-g400)' }}>/ personne</span>
          </div>

          <div className="ci-omra-card__actions">
            <button
              className="ci-omra-card__btn-details"
              onClick={() => onDetails && onDetails(circuit)}
            >
              <i className="fas fa-info-circle" /> Détails
            </button>
            <button
              className="ci-omra-card__btn-reserve"
              onClick={() => !isFull && onReserve && onReserve(circuit)}
              disabled={isFull}
            >
              <i className={isFull ? 'fas fa-ban' : 'fas fa-arrow-right'} />
              {isFull ? 'Complet' : 'Réserver'}
            </button>
          </div>
        </div>

      </div>
    </article>
  );
};

export default CircuitCard;