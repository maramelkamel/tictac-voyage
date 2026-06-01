import React from 'react';

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const formatCategory = (category) => ({
  omra:                         'Omra',
  hotels:                       'Hotels',
  vols:                         'Vols',
  circuits:                     'Circuits',
  voyages_internationaux:       'Voyages internationaux',
  voyages_sur_mesure:           'Voyages sur mesure',
  transfert_mise_a_disposition: 'Transport',
}[category] || category || 'Promotion');

export default function Mypromotions({ promotions, notify }) {
  const handleCopy = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      notify(`Code ${code} copié`);
    } catch {
      notify('Impossible de copier le code', 'error');
    }
  };

  return (
    <div className="cp-promo-tab">
      <div className="cp-promo-banner">
        <div>
          <p className="cp-promo-banner__label">Promotions actives</p>
          <p className="cp-promo-banner__title">Nos promotions</p>
          <p className="cp-promo-banner__sub">
            {promotions.length} promotion{promotions.length !== 1 ? 's' : ''} disponible{promotions.length !== 1 ? 's' : ''} pour votre compte
          </p>
        </div>
        <div className="cp-promo-banner__badge">
          <i className="fas fa-ticket-alt" style={{ fontSize: 18 }} />
          <span>Codes promo visibles ici</span>
        </div>
      </div>

      {promotions.length === 0 ? (
        <div className="cp-empty">
          <i className="fas fa-percent cp-empty__icon" />
          <p className="cp-empty__title">Aucune promotion active pour le moment</p>
          <p className="cp-empty__sub">Les nouvelles offres et leurs codes promo apparaîtront ici automatiquement.</p>
        </div>
      ) : (
        <div className="cp-promo-grid">
          {promotions.map((promo) => {
            const discountLabel = promo.type_reduction === 'pourcentage'
              ? `${promo.valeur_reduction}%`
              : `${Number(promo.valeur_reduction || 0).toLocaleString('fr-FR')} TND`;
            return (
              <div key={promo.id} className="cp-promo-card">
                <div className="cp-promo-card__header">
                  <div className="cp-promo-card__header-inner">
                    <div>
                      <p className="cp-promo-card__cat">{formatCategory(promo.categorie)}</p>
                      <p className="cp-promo-card__title">{promo.titre}</p>
                    </div>
                    <span className="cp-promo-card__discount">-{discountLabel}</span>
                  </div>
                </div>
                <div className="cp-promo-card__body">
                  {promo.description && <p className="cp-promo-card__desc">{promo.description}</p>}
                  <div className="cp-promo-code-box">
                    <p className="cp-promo-code-box__label">Code promo</p>
                    <div className="cp-promo-code-box__row">
                      <span className="cp-promo-code-box__code">
                        {promo.code_promo || 'Aucun code requis'}
                      </span>
                      {promo.code_promo && (
                        <button onClick={() => handleCopy(promo.code_promo)} className="cp-btn-copy-promo">
                          Copier
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="cp-promo-card__dates">
                    <span>Du {fDate(promo.date_debut)}</span>
                    <span>Au {fDate(promo.date_fin)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}