import React from 'react';

const COLORS = {
  omra:                   { bg:'#FFF3E0', border:'#FFB74D', accent:'#E65100', icon:'🕌' },
  hotels:                 { bg:'#E3F2FD', border:'#64B5F6', accent:'#1565C0', icon:'🏨' },
  vols:                   { bg:'#FFEBEE', border:'#EF9A9A', accent:'#B71C1C', icon:'✈️' },
  circuits:               { bg:'#E8F5E9', border:'#81C784', accent:'#1B5E20', icon:'🗺️' },
  voyages_internationaux: { bg:'#F3E5F5', border:'#CE93D8', accent:'#4A148C', icon:'🌍' },
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
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderLeft: `5px solid ${c.accent}`, borderRadius: 10,
      padding: '14px 20px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:26 }}>{c.icon}</span>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:c.accent }}>{titre}</div>
          {description && <div style={{ fontSize:12, color:'#555', marginTop:2 }}>{description}</div>}
          <div style={{ fontSize:11, color:'#777', marginTop:3 }}>
            Valable du {fmt(date_debut)} au {fmt(date_fin)}
            {code_promo && <> · Code : <strong>{code_promo}</strong></>}
          </div>
        </div>
      </div>
      <div style={{
        fontSize:22, fontWeight:800, color:c.accent,
        background:'#fff', border:`1.5px solid ${c.border}`,
        borderRadius:8, padding:'5px 14px', flexShrink:0,
      }}>
        {red}
      </div>
    </div>
  );
}