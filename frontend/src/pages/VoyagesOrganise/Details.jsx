import React from 'react';

const Details = ({ voyage, onClose, onReserver }) => {
  if (!voyage) return null;

  const {
    titre,
    destination,
    pays,
    image,
    prix,
    duree,
    rating,
    avis,
    description,
    depart,
    programme = [],
    inclus = [],
    nonInclus = [],
  } = voyage;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* ── Header image ── */}
        <div className="modal-header">
          <img src={image} alt={titre} />
          <div className="modal-header-overlay" />
          <div className="modal-header-content">
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#e0c070', marginBottom: 6, textTransform: 'uppercase' }}>
              {pays} · {destination}
            </p>
            <h2>{titre}</h2>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
              <span>⭐ {rating} ({avis} avis)</span>
              <span>·</span>
              <span>🕐 {duree}</span>
              <span>·</span>
              <span>✈️ {depart}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">

          {/* Highlights */}
          <div className="details-highlights">
            <div className="highlight-box">
              <div className="hb-icon">🏖️</div>
              <span className="hb-label">Destination</span>
              <div className="hb-val">{pays}</div>
            </div>
            <div className="highlight-box">
              <div className="hb-icon">📅</div>
              <span className="hb-label">Durée</span>
              <div className="hb-val">{duree}</div>
            </div>
            <div className="highlight-box">
              <div className="hb-icon">✈️</div>
              <span className="hb-label">Départ</span>
              <div className="hb-val" style={{ fontSize: '1rem' }}>{depart}</div>
            </div>
          </div>

          {/* Description */}
          <div className="details-section">
            <h3>À propos</h3>
            <p>{description}</p>
          </div>

          {/* Programme */}
          {programme.length > 0 && (
            <div className="details-section">
              <h3>Programme</h3>
              <ul className="programme-list">
                {programme.map((item, i) => (
                  <li key={i}>
                    <span className="programme-day">Jour {i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Inclus */}
          {inclus.length > 0 && (
            <div className="details-section">
              <h3>Inclus</h3>
              <div className="inclus-list">
                {inclus.map((item, i) => (
                  <span key={i} className="inclus-tag">✓ {item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Non inclus */}
          {nonInclus.length > 0 && (
            <div className="details-section">
              <h3>Non inclus</h3>
              <div className="inclus-list">
                {nonInclus.map((item, i) => (
                  <span key={i} className="inclus-tag" style={{ background: '#f9ece8', color: '#8a3020' }}>
                    ✕ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <div>
            <div style={{ fontSize: '0.75rem', color: '#8a8aaa', marginBottom: 2 }}>Prix par personne</div>
            <div className="modal-price">
              {prix.toLocaleString('fr-FR')} TND <span>/ pers.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-details" onClick={onClose}>Fermer</button>
            <button className="btn-reserver" onClick={() => { onClose(); onReserver(voyage); }}>
              Réserver maintenant
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Details;