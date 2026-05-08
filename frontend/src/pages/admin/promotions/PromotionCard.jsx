import React from 'react';
import '../../../styles/PromotionCard.css';

const BADGE = {
  omra:                         { cls: 'badge-orange', label: 'Omra' },
  hotels:                       { cls: 'badge-blue',   label: 'Hôtels' },
  vols:                         { cls: 'badge-red',    label: 'Billetterie' },
  circuits:                     { cls: 'badge-green',  label: 'Circuits' },
  voyages_internationaux:       { cls: 'badge-purple', label: 'Voyages organisés' },
  voyages_sur_mesure:           { cls: 'badge-pink',   label: 'Voyages sur mesure' },
  transfert_mise_a_disposition: { cls: 'badge-cyan',   label: 'Transport' },
  transport:                    { cls: 'badge-cyan',   label: 'Transport' },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PromotionCard({ promo }) {
  const {
    titre, description, categorie,
    type_reduction, valeur_reduction,
    date_debut, date_fin, image_url,
    /* code_promo intentionally NOT destructured — never shown on frontend */
  } = promo;

  const b   = BADGE[categorie] || { cls: 'badge-pink', label: categorie };
  const red = type_reduction === 'pourcentage'
    ? `-${valeur_reduction}%`
    : `-${valeur_reduction} DT`;

  return (
    <div className="promo-card">
      {image_url && (
        <div className="promo-card__img-wrap">
          <img src={image_url} alt={titre} className="promo-card__img" />
          <div className="promo-card__discount-overlay">{red}</div>
        </div>
      )}

      <div className="promo-card__body">
        <span className={`promo-badge ${b.cls}`}>{b.label}</span>

        {!image_url && (
          <div className="promo-card__reduction">{red}</div>
        )}

        <h3 className="promo-card__title">{titre}</h3>
        {description && <p className="promo-card__desc">{description}</p>}

        <div className="promo-card__dates">
          📅 Du {fmtDate(date_debut)} au {fmtDate(date_fin)}
        </div>
      </div>
    </div>
  );
}