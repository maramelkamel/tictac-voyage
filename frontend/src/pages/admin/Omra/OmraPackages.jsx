// src/pages/admin/Omra/OmraPackages.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_PKG    = 'http://localhost:5000/api/omra/packages';
const COVERS_API = 'http://localhost:5000/api/omra/packages/omra-covers';
const fPrice     = (p) => p ? Number(p).toLocaleString('fr-TN') + ' TND' : '—';

const EMPTY = {
  title:'', subtitle:'', description:'', image_url:'', price:'', old_price:'',
  duration:'', departure:'', spots:'50', badge:'', is_active:true,
};

const DEFAULT_COVERS = {
  hero: {
    bg_image:     '',
    tag:          'Pelerinage et Spiritualite',
    title:        'Votre Voyage',
    title_accent: 'Spirituel Ideal',
    sub:          'Accomplissez votre Omra en toute serenite avec nos forfaits tout compris, concus pour une experience spirituelle inoubliable.',
  },
};

/* ══════════════════════════════════════════════════════════════
   MODAL FIELD HELPER
   ══════════════════════════════════════════════════════════════ */
const ModalField = ({ label, req, children }) => (
  <div className="al-field">
    <label className="al-label">{label} {req && <span className="al-required">*</span>}</label>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MODAL COVERS — Hero Omra
   ══════════════════════════════════════════════════════════════ */
const CoversModal = ({ covers, onClose, onSaved, notify }) => {
  const [form, setForm] = useState({
    hero: { ...DEFAULT_COVERS.hero, ...(covers?.hero || {}) },
  });
  const [loading, setLoading] = useState(false);

  const setHero = (key, val) => setForm(p => ({ ...p, hero: { ...p.hero, [key]: val } }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(COVERS_API, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        notify('Apparence mise à jour ✅');
        onSaved(form);
      } else {
        notify(json.message || 'Erreur', 'error');
      }
    } catch {
      notify('Erreur réseau', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div
        className="al-modal"
        style={{ maxWidth: 760, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon" style={{ background: 'linear-gradient(135deg,#be185d,#e8306a)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <div>
              <h2>Apparence de la page Omra</h2>
              <p style={{ fontSize:12, color:'var(--g400)', marginTop:2 }}>
                Modifiez le bandeau hero de la page Omra
              </p>
            </div>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Tab bar (single tab: hero) ── */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--g200)', flexShrink: 0 }}>
          <div style={{ display: 'flex' }}>
            <button
              type="button"
              style={{
                padding: '12px 20px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                color: 'var(--primary)',
                borderBottom: '2px solid var(--primary)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              🖼️ Hero (Bandeau)
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Aperçu live hero */}
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>
              Aperçu du bandeau hero
            </p>
            <div style={{
              borderRadius: 16, overflow: 'hidden', position: 'relative', height: 200,
              background: 'linear-gradient(135deg,#7c1034 0%,#b91c4a 50%,#7c1034 100%)',
              border: '2px solid var(--g200)', boxShadow: '0 4px 20px rgba(0,0,0,.1)',
            }}>
              {form.hero.bg_image && (
                <img
                  src={form.hero.bg_image} alt="hero bg"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.4 }}
                  onError={e => { e.target.style.display='none'; }}
                />
              )}
              <div style={{ position:'absolute', inset:0, background:'rgba(10,10,30,.55)' }}/>
              {/* Motif géométrique décoratif */}
              <div style={{
                position:'absolute', inset:0, opacity:.08,
                backgroundImage:'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)',
                backgroundSize:'40px 40px',
              }}/>
              <div style={{
                position:'relative', padding:'28px 32px',
                display:'flex', flexDirection:'column', justifyContent:'center',
                height:'100%', color:'#fff',
              }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)',
                  border:'1px solid rgba(255,255,255,.25)', borderRadius:999,
                  padding:'4px 14px', fontSize:11, fontWeight:700, color:'#fff',
                  width:'fit-content', marginBottom:12,
                }}>
                  🕋 {form.hero.tag || 'Pelerinage et Spiritualite'}
                </span>
                <h1 style={{ fontSize:24, fontWeight:900, lineHeight:1.2, margin:0 }}>
                  {form.hero.title || 'Votre Voyage'}
                  <br/>
                  <span style={{ color:'#f472b6' }}>
                    {form.hero.title_accent || 'Spirituel Ideal'}
                  </span>
                </h1>
                <p style={{ fontSize:12, color:'rgba(255,255,255,.8)', marginTop:8, lineHeight:1.5, maxWidth:480 }}>
                  {form.hero.sub || 'Accomplissez votre Omra en toute serenite...'}
                </p>
              </div>
            </div>
          </div>

          {/* Image de fond */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', paddingBottom:8, borderBottom:'1px solid var(--g100)' }}>
              🖼️ Image de fond du bandeau
            </p>
            <div className="al-field">
              <label className="al-label">URL de l'image de fond</label>
              <input
                className="al-input"
                placeholder="https://images.unsplash.com/..."
                value={form.hero.bg_image}
                onChange={e => setHero('bg_image', e.target.value)}
              />
            </div>
            {/* Suggestions */}
            <div>
              <p style={{ fontSize:11, color:'var(--g400)', marginBottom:6 }}>Suggestions rapides :</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[
                  { label:'La Mecque',    url:'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=80' },
                  { label:'Kaaba',        url:'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1600&q=80' },
                  { label:'Médine',       url:'https://images.unsplash.com/photo-1574483074773-65a6d6083e28?w=1600&q=80' },
                  { label:'Pèlerins',     url:'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1600&q=80' },
                  { label:'Mosquée',      url:'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1600&q=80' },
                ].map(s => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setHero('bg_image', s.url)}
                    style={{
                      padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:600,
                      border:'1.5px solid var(--g200)',
                      background: form.hero.bg_image === s.url ? 'rgba(232,48,106,.1)' : 'var(--g50)',
                      color: form.hero.bg_image === s.url ? '#e8306a' : 'var(--g600)',
                      borderColor: form.hero.bg_image === s.url ? '#e8306a' : 'var(--g200)',
                      cursor:'pointer', transition:'all .15s',
                    }}
                    onMouseEnter={e => { if(form.hero.bg_image !== s.url){ e.currentTarget.style.borderColor='#e8306a'; e.currentTarget.style.color='#e8306a'; }}}
                    onMouseLeave={e => { if(form.hero.bg_image !== s.url){ e.currentTarget.style.borderColor='var(--g200)'; e.currentTarget.style.color='var(--g600)'; }}}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Textes */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', paddingBottom:8, borderBottom:'1px solid var(--g100)' }}>
              ✍️ Textes du bandeau
            </p>
            <div className="al-field">
              <label className="al-label">Tag / Étiquette (au-dessus du titre)</label>
              <input
                className="al-input"
                placeholder="Ex: Pelerinage et Spiritualite"
                value={form.hero.tag}
                onChange={e => setHero('tag', e.target.value)}
              />
            </div>
            <div className="al-row-2">
              <div className="al-field">
                <label className="al-label">Titre principal</label>
                <input
                  className="al-input"
                  placeholder="Ex: Votre Voyage"
                  value={form.hero.title}
                  onChange={e => setHero('title', e.target.value)}
                />
              </div>
              <div className="al-field">
                <label className="al-label">Titre accentué (en couleur)</label>
                <input
                  className="al-input"
                  placeholder="Ex: Spirituel Ideal"
                  value={form.hero.title_accent}
                  onChange={e => setHero('title_accent', e.target.value)}
                />
              </div>
            </div>
            <div className="al-field">
              <label className="al-label">Sous-titre / description</label>
              <textarea
                className="al-textarea"
                rows={3}
                placeholder="Ex: Accomplissez votre Omra en toute serenite..."
                value={form.hero.sub}
                onChange={e => setHero('sub', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="al-form-footer" style={{ flexShrink:0, borderTop:'1px solid var(--g200)', padding:'16px 24px' }}>
          <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
          <button
            type="button"
            className="al-btn al-btn--primary"
            disabled={loading}
            onClick={handleSave}
            style={{ background:'linear-gradient(135deg,#be185d,#e8306a)', borderColor:'transparent' }}
          >
            {loading ? 'Enregistrement...' : '💾 Enregistrer l\'apparence'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL CRÉATION / ÉDITION FORFAIT
   ══════════════════════════════════════════════════════════════ */
const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const [form, setForm] = useState(pkg ? {
    title:       pkg.title       || '',
    subtitle:    pkg.subtitle    || '',
    description: pkg.description || '',
    image_url:   pkg.image_url   || '',
    price:       pkg.price       || '',
    old_price:   pkg.old_price   || '',
    duration:    pkg.duration    || '',
    departure:   pkg.departure   || '',
    spots:       pkg.spots       || '50',
    badge:       pkg.badge       || '',
    is_active:   pkg.is_active   !== false,
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.duration) {
      notify('Titre, prix et durée sont obligatoires', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(pkg ? `${API_PKG}/${pkg.id}` : API_PKG, {
        method:  pkg ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price:     Number(form.price),
          old_price: form.old_price ? Number(form.old_price) : null,
          duration:  Number(form.duration),
          spots:     Number(form.spots) || 50,
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(pkg ? 'Forfait mis à jour ✅' : 'Forfait créé ✅');
        onSaved();
      } else notify(json.message || 'Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
              </svg>
            </div>
            <h2>{pkg ? 'Modifier le forfait' : 'Nouveau forfait Omra'}</h2>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <form className="al-form" onSubmit={handleSubmit}>
          <div className="al-field">
            <label className="al-label">Titre <span className="al-required">*</span></label>
            <input className="al-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Omra Ramadan Premium" required/>
          </div>
          <div className="al-field">
            <label className="al-label">Sous-titre</label>
            <input className="al-input" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Ex: Hôtel 5★ · Médine & La Mecque"/>
          </div>
          <div className="al-field">
            <label className="al-label">Description</label>
            <textarea className="al-textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description du forfait..."/>
          </div>
          <div className="al-field">
            <label className="al-label">URL de l'image</label>
            <input className="al-input" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..."/>
            {form.image_url && (
              <img src={form.image_url} alt="preview"
                style={{ marginTop:8, width:'100%', height:120, objectFit:'cover', borderRadius:8, border:'1.5px solid var(--g200)' }}
                onError={e => e.target.style.display='none'}/>
            )}
          </div>
          <div className="al-row-2">
            <div className="al-field">
              <label className="al-label">Prix (TND) <span className="al-required">*</span></label>
              <input className="al-input" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="3500" required/>
            </div>
            <div className="al-field">
              <label className="al-label">Ancien prix (TND)</label>
              <input className="al-input" type="number" min="0" step="0.01" value={form.old_price} onChange={e => set('old_price', e.target.value)} placeholder="4000 (optionnel)"/>
            </div>
          </div>
          <div className="al-row-2">
            <div className="al-field">
              <label className="al-label">Durée (jours) <span className="al-required">*</span></label>
              <input className="al-input" type="number" min="1" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="14" required/>
            </div>
            <div className="al-field">
              <label className="al-label">Date de départ</label>
              <input className="al-input" value={form.departure} onChange={e => set('departure', e.target.value)} placeholder="Ex: 15 Mars 2026"/>
            </div>
          </div>
          <div className="al-row-2">
            <div className="al-field">
              <label className="al-label">Places disponibles</label>
              <input className="al-input" type="number" min="0" value={form.spots} onChange={e => set('spots', e.target.value)} placeholder="50"/>
            </div>
            <div className="al-field">
              <label className="al-label">Badge</label>
              <select className="al-select" value={form.badge} onChange={e => set('badge', e.target.value)}>
                <option value="">Aucun</option>
                <option value="Populaire">⭐ Populaire</option>
                <option value="Nouveau">✨ Nouveau</option>
                <option value="Promo">🔥 Promo</option>
                <option value="VIP">👑 VIP</option>
                <option value="Dernières places">⚡ Dernières places</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
              style={{ width:16, height:16, cursor:'pointer', accentColor:'var(--primary)' }}/>
            <label htmlFor="is_active" className="al-label" style={{ cursor:'pointer', marginBottom:0 }}>
              Forfait actif (visible sur le site public)
            </label>
          </div>
          <div className="al-form-footer">
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="al-btn al-btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (pkg ? '✏️ Mettre à jour' : '➕ Créer le forfait')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PANNEAU DÉTAIL LATÉRAL
   ══════════════════════════════════════════════════════════════ */
const OmraDetail = ({ pkg, onClose, onEdit, onDelete, isMain }) => {
  const avail  = pkg.available_spots !== undefined ? Number(pkg.available_spots) : Number(pkg.spots);
  const isFull = avail <= 0;
  const isLow  = avail <= 5 && avail > 0;

  const InfoRow = ({ icon, label, value }) => value ? (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'var(--g50)', border:'1px solid var(--g100)' }}>
      <span style={{ fontSize:12, color:'var(--g500)' }}>{icon} {label}</span>
      <span style={{ fontSize:13, fontWeight:700, color:'var(--g800)' }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ width:330, flexShrink:0, borderLeft:'1px solid var(--g200)', display:'flex', flexDirection:'column', background:'#fff', animation:'alModalIn .25s var(--ease)', overflowY:'auto' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:2 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em' }}>Détails forfait</p>
        <button className="al-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div style={{ width:'100%', height:170, background:'var(--g100)', flexShrink:0, position:'relative', overflow:'hidden' }}>
        {pkg.image_url ? (
          <img src={pkg.image_url} alt={pkg.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e=>e.target.style.display='none'}/>
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, background:'linear-gradient(135deg,var(--primary),var(--secondary))' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="1.2" style={{ width:48, height:48 }}>
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
            </svg>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.7)' }}>Forfait Omra</p>
          </div>
        )}
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:6, flexWrap:'wrap' }}>
          <span style={{ padding:'3px 9px', borderRadius:999, background:pkg.is_active?'#10b981':'#94a3b8', color:'#fff', fontSize:11, fontWeight:700, boxShadow:'0 2px 8px rgba(0,0,0,.2)' }}>
            {pkg.is_active ? '● Actif' : '● Inactif'}
          </span>
          {pkg.badge && (
            <span style={{ padding:'3px 9px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:11, fontWeight:700, boxShadow:'0 2px 8px rgba(0,0,0,.15)' }}>
              {pkg.badge}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding:'18px 18px 12px', display:'flex', flexDirection:'column', gap:18, flex:1 }}>
        <div>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--g900)', lineHeight:1.3 }}>{pkg.title}</h3>
          {pkg.subtitle && <p style={{ fontSize:12, color:'var(--g500)', marginTop:4 }}>{pkg.subtitle}</p>}
        </div>
        {pkg.description && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Description</p>
            <p style={{ fontSize:13, color:'var(--g600)', lineHeight:1.65 }}>{pkg.description}</p>
          </div>
        )}
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Tarif</p>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{fPrice(pkg.price)}</span>
            {pkg.old_price && <span style={{ fontSize:13, color:'var(--g400)', textDecoration:'line-through' }}>{fPrice(pkg.old_price)}</span>}
          </div>
          {pkg.old_price && (
            <span style={{ marginTop:4, display:'inline-block', fontSize:11, fontWeight:700, color:'#059669', background:'#d1fae5', padding:'2px 8px', borderRadius:999 }}>
              -{Math.round((1 - pkg.price / pkg.old_price) * 100)}% de réduction
            </span>
          )}
        </div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Informations</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <InfoRow icon="🗓" label="Durée"  value={pkg.duration ? `${pkg.duration} jour${pkg.duration > 1 ? 's' : ''}` : null}/>
            <InfoRow icon="✈️" label="Départ" value={pkg.departure || null}/>
          </div>
        </div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Disponibilité</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:isFull?'#fee2e2':isLow?'#fff7ed':'#d1fae5', border:`1px solid ${isFull?'#fca5a5':isLow?'#fed7aa':'#a7f3d0'}` }}>
              <span style={{ fontSize:12, color:isFull?'#991b1b':isLow?'#92400e':'#065f46' }}>🪑 Places disponibles</span>
              <span style={{ fontSize:13, fontWeight:800, color:isFull?'#e92f64':isLow?'#f97316':'#065f46' }}>
                {isFull ? 'Complet' : `${avail} / ${pkg.spots}`}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'rgba(15,76,92,.05)', border:'1px solid rgba(15,76,92,.1)' }}>
              <span style={{ fontSize:12, color:'var(--g500)' }}>📋 Réservations</span>
              <span style={{ fontSize:13, fontWeight:800, color:'var(--primary)' }}>
                {pkg.reservation_count || 0} inscrit{pkg.reservation_count > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 18px', borderTop:'1px solid var(--g100)', display:'flex', gap:8, position:'sticky', bottom:0, background:'#fff' }}>
        <button className="al-btn al-btn--primary" style={{ flex:1 }} onClick={() => { onEdit(pkg); onClose(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}>
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Modifier
        </button>
        <button
          className="al-btn al-btn--danger"
          onClick={() => { onDelete(pkg.id); onClose(); }}
          title={isMain ? 'Supprimer ce forfait' : 'Réservé à l\'administrateur principal'}
          style={{ opacity: isMain ? 1 : 0.4, cursor: isMain ? 'pointer' : 'not-allowed' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}>
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          {isMain ? 'Supprimer' : 'Supprimer 🔒'}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const OmraPackages = () => {
  const [packages,    setPackages]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [showCovers,  setShowCovers]  = useState(false);
  const [editPkg,     setEditPkg]     = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [covers,      setCovers]      = useState(null);

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const r = await fetch(API_PKG);
      const j = await r.json();
      setPackages(j.data || []);
    } catch { notify('Impossible de charger les forfaits', 'error'); }
    finally { setLoading(false); }
  };

  const fetchCovers = async () => {
    try {
      const r = await fetch(COVERS_API);
      const j = await r.json();
      if (j.success) setCovers(j.data);
    } catch { /* silently ignore */ }
  };

  useEffect(() => { fetchPackages(); fetchCovers(); }, []);

  const handleDelete = async (id) => {
    if (!isMain) {
      notify('❌ Seul l\'administrateur principal peut supprimer un forfait', 'error');
      return;
    }
    if (!window.confirm('Supprimer ce forfait ? Les réservations existantes ne seront pas supprimées.')) return;
    const r = await fetch(`${API_PKG}/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (j.success) { notify('Forfait supprimé'); fetchPackages(); setSelected(null); }
    else notify('Erreur suppression', 'error');
  };

  const stats = {
    total:    packages.length,
    active:   packages.filter(p => p.is_active).length,
    inactive: packages.filter(p => !p.is_active).length,
    totalRes: packages.reduce((a, p) => a + (parseInt(p.reservation_count) || 0), 0),
  };

  return (
    <AdminLayout
      title="Forfaits Omra"
      breadcrumb={[{ label: 'Omra' }, { label: 'Forfaits', active: true }]}
      actions={
        <div style={{ display:'flex', gap:8 }}>
          {/* ── Bouton Apparence page (comme Circuits) ── */}
          <button
            className="al-btn al-btn--ghost"
            onClick={() => setShowCovers(true)}
            title="Modifier l'apparence de la page Omra (hero)"
            style={{ display:'flex', alignItems:'center', gap:6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:15, height:15 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            Apparence page
          </button>
          <button className="al-btn al-btn--primary" onClick={() => { setEditPkg(null); setShowModal(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Nouveau forfait
          </button>
        </div>
      }
      toast={toast}
    >
      <div className="al-stats al-stats--4">
        {[
          { label:'Total forfaits',     value:stats.total,    color:'blue',
            icon:<><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></> },
          { label:'Actifs',             value:stats.active,   color:'green',
            icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
          { label:'Inactifs',           value:stats.inactive, color:'gray',
            icon:<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></> },
          { label:'Total réservations', value:stats.totalRes, color:'teal',
            icon:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* ── Mini preview du hero actuel (comme Circuits) ── */}
      {covers && (
        <div style={{ margin:'0 32px 16px' }}>
          <div
            onClick={() => setShowCovers(true)}
            style={{
              borderRadius:12, overflow:'hidden', position:'relative', height:70,
              cursor:'pointer', border:'1.5px solid var(--g200)',
              background:'linear-gradient(135deg,#7c1034,#b91c4a)',
              transition:'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
          >
            {covers.hero?.bg_image && (
              <img
                src={covers.hero.bg_image} alt="hero"
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.4 }}
                onError={e => { e.target.style.display='none'; }}
              />
            )}
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.35)' }}/>
            <div style={{ position:'relative', padding:'10px 14px', display:'flex', alignItems:'center', gap:8, height:'100%' }}>
              <span style={{ fontSize:20 }}>🕋</span>
              <div>
                <p style={{ fontSize:12, fontWeight:700, color:'#fff', margin:0 }}>
                  {covers.hero?.title || 'Votre Voyage'}{' '}
                  <span style={{ color:'#f9a8d4' }}>{covers.hero?.title_accent || 'Spirituel Ideal'}</span>
                </p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,.7)', margin:0 }}>Hero Omra · Cliquer pour modifier</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width:14, height:14, marginLeft:'auto', opacity:.7 }}>
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', margin:'0 32px 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'0 4px 12px rgba(15,76,92,.08)', overflow:'hidden' }}>
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
          <div className="al-toolbar">
            <p style={{ fontSize:15, fontWeight:700, color:'var(--g800)', flex:1 }}>Liste des forfaits</p>
            <button className="al-btn al-btn--ghost" onClick={fetchPackages}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
          ) : packages.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
              <p className="al-empty__title">Aucun forfait</p>
              <p className="al-empty__sub">Créez votre premier forfait Omra.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Forfait</th><th>Prix</th><th>Durée</th><th>Départ</th>
                    <th>Places dispo</th><th>Réservations</th><th>Statut</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(pkg => {
                    const avail  = pkg.available_spots !== undefined ? Number(pkg.available_spots) : Number(pkg.spots);
                    const total  = Number(pkg.spots);
                    const isFull = avail <= 0;
                    const isLow  = avail <= 5 && avail > 0;
                    const isSel  = selected?.id === pkg.id;
                    return (
                      <tr key={pkg.id} className={`al-row ${isSel ? 'al-row--selected' : ''}`} style={{ cursor:'pointer' }} onClick={() => setSelected(isSel ? null : pkg)}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            {pkg.image_url
                              ? <img src={pkg.image_url} alt={pkg.title} style={{ width:44, height:44, borderRadius:8, objectFit:'cover', flexShrink:0, border:'1.5px solid var(--g200)' }} onError={e=>e.target.style.display='none'}/>
                              : <div style={{ width:44, height:44, borderRadius:8, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width:20, height:20 }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                                </div>
                            }
                            <div>
                              <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>
                                {pkg.title}
                                {pkg.badge && <span style={{ marginLeft:7, padding:'2px 7px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:10, fontWeight:700 }}>{pkg.badge}</span>}
                              </p>
                              {pkg.subtitle && <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{pkg.subtitle}</p>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <p style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{fPrice(pkg.price)}</p>
                          {pkg.old_price && <p style={{ fontSize:11, color:'var(--g400)', textDecoration:'line-through' }}>{fPrice(pkg.old_price)}</p>}
                        </td>
                        <td><span style={{ fontWeight:600, fontSize:13 }}>{pkg.duration} j</span></td>
                        <td><span style={{ fontSize:12, color:'var(--g600)' }}>{pkg.departure || '—'}</span></td>
                        <td>
                          <span style={{ fontWeight:700, fontSize:13, color:isFull?'#e92f64':isLow?'#f97316':'#065f46' }}>
                            {isFull ? '❌ Complet' : `${avail} / ${total}`}
                          </span>
                          {isLow && <p style={{ fontSize:10, color:'#f97316', marginTop:2 }}>🔥 Presque complet</p>}
                        </td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, background:'rgba(15,76,92,.08)', color:'var(--primary)', fontSize:12, fontWeight:700 }}>
                            {pkg.reservation_count || 0} inscrit{pkg.reservation_count > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:pkg.is_active?'#d1fae5':'var(--g100)', color:pkg.is_active?'#065f46':'var(--g500)' }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:pkg.is_active?'#10b981':'var(--g400)' }}/>
                            {pkg.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="al-action-btn al-action-btn--edit" onClick={() => { setEditPkg(pkg); setShowModal(true); }} title="Modifier">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(pkg.id)}
                              title={isMain ? 'Supprimer' : 'Réservé à l\'administrateur principal'}
                              style={{ opacity: isMain ? 1 : 0.4, cursor: isMain ? 'pointer' : 'not-allowed' }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="al-table-footer">
            <p className="al-count">{packages.length} forfait{packages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {selected && (
          <OmraDetail
            pkg={selected}
            onClose={() => setSelected(null)}
            onEdit={(p) => { setEditPkg(p); setShowModal(true); }}
            onDelete={handleDelete}
            isMain={isMain}
          />
        )}
      </div>

      {showModal && (
        <PkgModal
          pkg={editPkg}
          onClose={() => { setShowModal(false); setEditPkg(null); }}
          onSaved={() => { setShowModal(false); setEditPkg(null); fetchPackages(); }}
          notify={notify}
        />
      )}

      {showCovers && (
        <CoversModal
          covers={covers}
          onClose={() => setShowCovers(false)}
          onSaved={(newCovers) => { setCovers(newCovers); setShowCovers(false); }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default OmraPackages;