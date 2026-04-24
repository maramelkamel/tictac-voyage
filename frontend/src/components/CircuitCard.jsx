import React from 'react';

const CircuitCard = ({
  circuit,
  onDetails,
  onReserve,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  const {
    title,
    subtitle,
    image,
    price,
    oldPrice,
    duration,
    rating,
    avis,
    badge,
    tag,
    description,
    departure,
    places,
    highlights = [],
  } = circuit;

  const isFull = places <= 0;
  const isLow = places > 0 && places <= 5;

  return (
    <article className={`ci-omra-card${isFull ? ' ci-omra-card--full' : ''}`}>
      <div className="ci-omra-card__img">
        <img src={image} alt={title} loading="lazy" />

        {tag && <span className="ci-omra-card__tag">{tag}</span>}
        {badge && <span className="ci-omra-card__badge">{badge}</span>}

        <button
          className={`ci-omra-card__heart${isFavorite ? ' ci-omra-card__heart--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle && onFavoriteToggle(circuit);
          }}
          aria-label={isFavorite ? `Retirer ${title} des favoris` : `Ajouter ${title} aux favoris`}
        >
          <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'} />
        </button>

        <div className="ci-omra-card__rating">
          <span>★ {rating}</span>
          <span className="ci-omra-card__rating-count">({avis})</span>
        </div>

        <div className="ci-omra-card__duration">🕐 {duration}</div>
      </div>

      <div className="ci-omra-card__body">
        {subtitle && <p className="ci-omra-card__subtitle">{subtitle}</p>}
        <h3 className="ci-omra-card__title">{title}</h3>
        <p className="ci-omra-card__desc">{description}</p>

        {highlights.length > 0 && (
          <div className="ci-omra-card__highlights">
            {highlights.slice(0, 3).map((item, index) => (
              <span key={index} className="ci-omra-card__highlight">
                ✓ {item}
              </span>
            ))}
          </div>
        )}

        <div className="ci-omra-card__meta">
          <span>✈️ {departure || 'Tunis'}</span>
          <span className={isFull ? 'is-full' : isLow ? 'is-low' : ''}>
            {isFull ? 'Complet' : isLow ? `Plus que ${places} places` : `👥 ${places} places`}
          </span>
        </div>

        <div className="ci-omra-card__footer">
          <div>
            <span className="ci-omra-card__price-from">A partir de</span>
            <div className="ci-omra-card__price-row">
              <span className="ci-omra-card__price-value">{price.toLocaleString('fr-FR')} DT</span>
              {oldPrice && (
                <span className="ci-omra-card__old-price">{oldPrice.toLocaleString('fr-FR')} DT</span>
              )}
            </div>
            <span className="ci-omra-card__price-per">/ personne</span>
          </div>

          <div className="ci-omra-card__actions">
            <button
              className="ci-omra-card__btn-details"
              onClick={() => onDetails && onDetails(circuit)}
              aria-label={`Voir les details de ${title}`}
            >
              Details
            </button>
            <button
              className="ci-omra-card__btn-reserve"
              onClick={() => !isFull && onReserve && onReserve(circuit)}
              aria-label={`Reserver ${title}`}
              disabled={isFull}
            >
              {isFull ? 'Complet' : 'Reserver'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CircuitCard;
