import React from 'react';

const VoyageCard = ({ voyage, onDetails, onReserver }) => {
  const {
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
    <article className="omra-card">

      {/* ── Image ── */}
      <div className="omra-card__img">
        <img src={image} alt={titre} loading="lazy" />

        {badge && (
          <span className="omra-card__badge">{badge}</span>
        )}

        <div className="omra-card__rating">
          ⭐ {rating}
          <span style={{ opacity: 0.65, fontSize: '11px', marginLeft: 2 }}>({avis})</span>
        </div>

        <div className="omra-card__duration">
          🕐 {duree}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="omra-card__body">
        <p className="omra-card__dest">{pays} · {destination}</p>
        <h3 className="omra-card__title">{titre}</h3>
        <p className="omra-card__desc">{description}</p>

        <div className="omra-card__meta">
          <span>✈️ {depart}</span>
          <span>👥 {places} places</span>
        </div>

        {/* ── Footer ── */}
        <div className="omra-card__footer">
          <div>
            <span className="omra-card__price-from">À partir de</span>
            <div className="omra-card__price-value">
              {prix.toLocaleString('fr-FR')} TND
            </div>
            <span className="omra-card__price-per">/ personne</span>
          </div>

          <div className="omra-card__actions">
            <button
              className="omra-card__btn-details"
              onClick={() => onDetails && onDetails(voyage)}
              aria-label={`Voir les détails de ${titre}`}
            >
              Détails
            </button>
            <button
              className="omra-card__btn-reserve"
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