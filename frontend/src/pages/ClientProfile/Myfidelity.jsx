import React from 'react';
import { getClientLevelInfo, getNextDiscount } from './helpers';

export default function Myfidelity({ totalRes, handleTabChange }) {
  const loyalty      = getClientLevelInfo(totalRes);
  const nextDiscount = getNextDiscount(totalRes);
  const progressPct  = loyalty.next
    ? Math.min(100, Math.round(((totalRes - loyalty.min) / (loyalty.next - loyalty.min)) * 100))
    : 100;

  return (
    <div className="cp-fidelite">
      {/* Hero */}
      <div className="cp-loyalty-hero" style={{ background: `linear-gradient(135deg,${loyalty.color},${loyalty.color}cc)` }}>
        <div>
          <p className="cp-loyalty-hero__label">Votre niveau actuel</p>
          <p className="cp-loyalty-hero__level">{loyalty.icon} {loyalty.label}</p>
          <p className="cp-loyalty-hero__total">{totalRes} réservation{totalRes !== 1 ? 's' : ''} au total</p>
        </div>
        {loyalty.next && (
          <div className="cp-loyalty-progress">
            <p className="cp-loyalty-progress__label">Progression vers le niveau suivant</p>
            <div className="cp-loyalty-progress__track">
              <div className="cp-loyalty-progress__fill" style={{ width: `${progressPct}%` }}/>
            </div>
            <p className="cp-loyalty-progress__next">{loyalty.nextLabel}</p>
          </div>
        )}
      </div>

      {/* Prochaine réduction */}
      <div className="cp-discount-card">
        <div className="cp-discount-card__icon"><i className="fas fa-tag"/></div>
        <div>
          <p className="cp-discount-card__title">
            Prochaine réduction : <span className="cp-discount-card__pct">{nextDiscount.pct}%</span>
          </p>
          <p className="cp-discount-card__sub">
            Plus que <strong>{nextDiscount.remaining}</strong> réservation{nextDiscount.remaining > 1 ? 's' : ''} pour débloquer votre réduction à la réservation n°{nextDiscount.at}
          </p>
        </div>
      </div>

      {/* Lien promotions */}
      <div className="cp-promo-link-card">
        <div>
          <p className="cp-promo-link-card__title">Nos promotions</p>
          <p className="cp-promo-link-card__sub">Retrouvez toutes les promotions actives et leurs codes promo dans votre espace client.</p>
        </div>
        <button onClick={() => handleTabChange('promotions')} className="cp-btn-promo-link">Nos promotions</button>
      </div>

      {/* Règles */}
      <div className="cp-rules-card">
        <div className="cp-rules-card__header">
          <h3 className="cp-rules-card__title">📋 Règles du programme de fidélité</h3>
        </div>
        <div className="cp-rules-card__body">
          {[
            { icon: '🌱',    level: 'Niveau 0',     rule: "Nouveau client jusqu'à 2 réservations" },
            { icon: '⭐',    level: 'Niveau 1 ⭐',   rule: 'À partir de 3 réservations' },
            { icon: '⭐⭐',  level: 'Niveau 2 ⭐⭐',  rule: 'Après 5 réservations, dès la 6ème réservation' },
            { icon: '⭐⭐⭐', level: 'Niveau 3 ⭐⭐⭐', rule: 'À partir de 10 réservations' },
          ].map(item => (
            <div key={item.level} className={`cp-rule-row ${loyalty.label.includes(item.level) ? 'cp-rule-row--active' : 'cp-rule-row--default'}`}>
              <span className="cp-rule-row__icon">{item.icon}</span>
              <div>
                <p className="cp-rule-row__level">{item.level}</p>
                <p className="cp-rule-row__rule">{item.rule}</p>
              </div>
            </div>
          ))}

          <div className="cp-auto-discounts">
            <p className="cp-auto-discounts__title">🎁 Réductions automatiques</p>
            {[
              { at: '5ème réservation',     pct: '10%', desc: 'Réduction de 10% sur la 6ème réservation' },
              { at: '10ème réservation',    pct: '20%', desc: 'Réduction de 20% sur la 11ème réservation' },
              { at: 'Toutes les 3 ensuite', pct: '5%',  desc: 'Réduction de 5% toutes les 3 réservations après la 10ème' },
            ].map(r => (
              <div key={r.at} className="cp-auto-discount-row">
                <span className="cp-auto-discount-row__badge">{r.pct}</span>
                <div>
                  <p className="cp-auto-discount-row__at">{r.at}</p>
                  <p className="cp-auto-discount-row__desc">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}