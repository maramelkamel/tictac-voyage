// src/components/AdvancedFilters.jsx
import React from 'react';

// ── Options defined here so they always have a correct empty default ──
// Previously imported from voyageSurMesureData which might be missing the '' entry,
// causing the select to have no "All" option and always filter.

const CONTINENT_OPTIONS = [
  { value: '',         label: 'Tous les continents', icon: '🌍' },
  { value: 'europe',   label: 'Europe',               icon: '🏰' },
  { value: 'asie',     label: 'Asie',                 icon: '🏯' },
  { value: 'afrique',  label: 'Afrique',              icon: '🌍' },
  { value: 'amerique', label: 'Amérique',             icon: '🗽' },
  { value: 'ocean',    label: 'Océanie',              icon: '🏝️' },
];

const SAISON_OPTIONS = [
  { value: '',              label: 'Toutes saisons' },
  { value: 'ete',           label: '☀️ Été' },
  { value: 'hiver',         label: '❄️ Hiver' },
  { value: 'printemps',     label: '🌸 Printemps' },
  { value: 'automne',       label: '🍂 Automne' },
  { value: 'toute-annee',   label: '📅 Toute l\'année' },
];

const BUDGET_OPTIONS = [
  { value: '',           label: 'Tous les budgets', icon: '' },
  { value: 'economique', label: 'Économique',        icon: '💚', sub: '< 800 TND' },
  { value: 'standard',   label: 'Standard',          icon: '💛', sub: '800–1500 TND' },
  { value: 'premium',    label: 'Premium',           icon: '🧡', sub: '1500–3000 TND' },
  { value: 'luxe',       label: 'Luxe',              icon: '💜', sub: '> 3000 TND' },
];

const AdvancedFilters = ({
  showFilters,
  continent,    setContinent,
  saison,       setSaison,
  budget,       setBudget,
  activeFilterCount,
  clearFilters,
  setVisibleCount,
}) => {
  if (!showFilters) return null;

  const handleChange = (setter, value) => {
    setter(value);
    setVisibleCount(6);
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    fontSize: 13,
    color: '#1e293b',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    transition: 'border-color .2s',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  };

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px', marginBottom: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>

        {/* Continent */}
        <div>
          <label style={labelStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}>
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/>
            </svg>
            Continent
          </label>
          <div style={{ position: 'relative' }}>
            <select value={continent} onChange={e => handleChange(setContinent, e.target.value)}
              style={{ ...selectStyle, paddingRight: 32, borderColor: continent ? '#0F4C5C' : '#e2e8f0' }}
              onFocus={e => e.target.style.borderColor='#1ECAD3'}
              onBlur={e => e.target.style.borderColor=continent?'#0F4C5C':'#e2e8f0'}>
              {CONTINENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, pointerEvents:'none' }}><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

        {/* Saison */}
        <div>
          <label style={labelStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}>
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Saison
          </label>
          <div style={{ position: 'relative' }}>
            <select value={saison} onChange={e => handleChange(setSaison, e.target.value)}
              style={{ ...selectStyle, paddingRight: 32, borderColor: saison ? '#0F4C5C' : '#e2e8f0' }}
              onFocus={e => e.target.style.borderColor='#1ECAD3'}
              onBlur={e => e.target.style.borderColor=saison?'#0F4C5C':'#e2e8f0'}>
              {SAISON_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, pointerEvents:'none' }}><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label style={labelStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}>
              <rect x="2" y="3" width="20" height="18" rx="2"/>
              <path d="M2 9h20M9 21V9"/>
            </svg>
            Budget
          </label>
          <div style={{ position: 'relative' }}>
            <select value={budget} onChange={e => handleChange(setBudget, e.target.value)}
              style={{ ...selectStyle, paddingRight: 32, borderColor: budget ? '#0F4C5C' : '#e2e8f0' }}
              onFocus={e => e.target.style.borderColor='#1ECAD3'}
              onBlur={e => e.target.style.borderColor=budget?'#0F4C5C':'#e2e8f0'}>
              {BUDGET_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.icon} {o.label}{o.sub ? ` (${o.sub})` : ''}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, pointerEvents:'none' }}><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {continent && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background:'#e0fbfc', color:'#0e7490', fontSize:12, fontWeight:600 }}>
              🌍 {CONTINENT_OPTIONS.find(o=>o.value===continent)?.label}
              <button onClick={() => handleChange(setContinent, '')} style={{ background:'none', border:'none', cursor:'pointer', color:'#0e7490', fontSize:12, fontWeight:800, padding:0 }}>✕</button>
            </span>
          )}
          {saison && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:12, fontWeight:600 }}>
              {SAISON_OPTIONS.find(o=>o.value===saison)?.label}
              <button onClick={() => handleChange(setSaison, '')} style={{ background:'none', border:'none', cursor:'pointer', color:'#c2410c', fontSize:12, fontWeight:800, padding:0 }}>✕</button>
            </span>
          )}
          {budget && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background:'#f5f3ff', color:'#7c3aed', fontSize:12, fontWeight:600 }}>
              {BUDGET_OPTIONS.find(o=>o.value===budget)?.label}
              <button onClick={() => handleChange(setBudget, '')} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:12, fontWeight:800, padding:0 }}>✕</button>
            </span>
          )}
          <button onClick={clearFilters}
            style={{ fontSize:11, color:'#e92f64', background:'none', border:'1px solid #fecaca', borderRadius:999, cursor:'pointer', fontWeight:700, padding:'3px 10px', fontFamily:'inherit' }}>
            Réinitialiser ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;