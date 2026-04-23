import React from 'react';

const COLORS = {
  omra:                        { bg:'#fff7ed', border:'#fdba74', accent:'#c2410c', icon:'🕋' },
  hotels:                      { bg:'#eff6ff', border:'#93c5fd', accent:'#1d4ed8', icon:'🏨' },
  vols:                        { bg:'#fff1f5', border:'#f9a8d4', accent:'#db2777', icon:'✈️' },
  circuits:                    { bg:'#ecfdf5', border:'#86efac', accent:'#15803d', icon:'🗺️' },
  voyages_internationaux:      { bg:'#f5f3ff', border:'#c4b5fd', accent:'#6d28d9', icon:'🌍' },
  voyages_sur_mesure:          { bg:'#fdf2f8', border:'#f9a8d4', accent:'#be185d', icon:'🧭' },
  transfert_mise_a_disposition:{ bg:'#ecfeff', border:'#67e8f9', accent:'#0f766e', icon:'🚘' },
  transport:                   { bg:'#ecfeff', border:'#67e8f9', accent:'#0f766e', icon:'🚘' },
};

export default function PromotionBanner({ promo }) {
  const { titre, description, categorie, type_reduction,
          valeur_reduction, code_promo, date_debut, date_fin } = promo;
  const c   = COLORS[categorie] || COLORS.omra;
  const red = type_reduction === 'pourcentage'
    ? `-${valeur_reduction}%` : `-${valeur_reduction} DT`;
  const fmt = d => new Date(d).toLocaleDateString('fr-FR',
    { day: '2-digit', month: 'short' });

  return (
    <article className="promo-banner" style={{
      background: c.bg,
      borderColor: c.border,
      boxShadow: `0 18px 36px ${c.border}33`,
    }}>
      <div className="promo-banner__content">
        <div className="promo-banner__icon" style={{ color: c.accent, background: `${c.border}33` }}>{c.icon}</div>
        <div className="promo-banner__copy">
          <div className="promo-banner__title" style={{ color: c.accent }}>{titre}</div>
          {description && <div className="promo-banner__desc">{description}</div>}
          <div className="promo-banner__meta">
            Valable du {fmt(date_debut)} au {fmt(date_fin)}
            {code_promo && <> • Code : <strong>{code_promo}</strong></>}
          </div>
        </div>
      </div>
      <div className="promo-banner__discount" style={{ color: c.accent, borderColor: c.border }}>
        {red}
      </div>
    </article>
  );
}
