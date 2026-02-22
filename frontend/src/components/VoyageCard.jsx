import React from 'react';

const VoyageCard = ({ voyage, onDetails, onReserver }) => {
  const {
    id,
    titre,
    destination,
    pays,
    image,
    prix,
    duree,
    rating,
    avis,
    badge,
    description,
    depart,
    places,
  } = voyage;

  return (
    <article className="voyage-card">

      {/* ── Image ── */}
      <div className="card-img">
        <img src={image} alt={titre} loading="lazy" />

        {badge && <span className="card-badge">{badge}</span>}

        <div className="card-rating">
          ⭐ {rating}
          <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({avis})</span>
        </div>

        <div className="card-duration">
          🕐 {duree}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="card-body">
        <p className="card-dest">{pays} · {destination}</p>
        <h3 className="card-title">{titre}</h3>
        <p className="card-desc">{description}</p>

        <div className="card-meta">
          <span>✈️ {depart}</span>
          <span>👥 {places} places restantes</span>
        </div>

        {/* ── Footer ── */}
        <div className="card-footer">
          <div className="card-price">
            <span className="card-price-from">À partir de</span>
            <span className="card-price-value">{prix.toLocaleString('fr-FR')} TND</span>
            <span className="card-price-per">/ personne</span>
          </div>

          <div className="card-actions">
            <button
              className="btn-details"
              onClick={() => onDetails && onDetails(voyage)}
              aria-label={`Voir les détails de ${titre}`}
            >
              Détails
            </button>
            <button
              className="btn-reserver"
              onClick={() => onReserver && onReserver(voyage)}
              aria-label={`Réserver ${titre}`}
            >
              Réserver
            </button>
          </div>
        </div>
      </div>

    </article>
  );
};

export default VoyageCard;