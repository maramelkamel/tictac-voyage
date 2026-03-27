import React from 'react';
import '../styles/PromotionCard.css';

const BADGE = {
  omra:                   { cls: 'badge-orange', label: 'Omra' },
  hotels:                 { cls: 'badge-blue',   label: 'Hôtels' },
  vols:                   { cls: 'badge-red',    label: 'Vols' },
  circuits:               { cls: 'badge-green',  label: 'Circuits' },
  voyages_internationaux: { cls: 'badge-purple', label: 'Voyages internationaux' },
};

export default function PromotionCard({ promo }) {
  const { titre, description, categorie, type_reduction,
          valeur_reduction, code_promo, date_debut, date_fin, image_url } = promo;
  const b   = BADGE[categorie] || { cls: '', label: categorie };
  const red = type_reduction === 'pourcentage'
    ? `-${valeur_reduction}%` : `-${valeur_reduction} DT`;
  const fmt = d => new Date(d).toLocaleDateString('fr-FR',
    { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="promo-card">
      {image_url && <img src={image_url} alt={titre} className="promo-card__img" />}
      <div className="promo-card__body">
        <span className={`promo-badge ${b.cls}`}>{b.label}</span>
        <h3 className="promo-card__title">{titre}</h3>
        {description && <p className="promo-card__desc">{description}</p>}
        <div className="promo-card__reduction">{red}</div>
        <div className="promo-card__dates">Du {fmt(date_debut)} au {fmt(date_fin)}</div>
        {code_promo && (
          <div className="promo-card__code">
            Code : <strong>{code_promo}</strong>
          </div>
        )}
      </div>
    </div>
  );
}