// src/pages/admin/Circuits/CircuitPackages.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API = 'http://localhost:5000/api/circuits';
const fPrice = (p) => p ? Number(p).toLocaleString('fr-TN') + ' DT' : '—';

const EMPTY = { title:'', subtitle:'', description:'', image_url:'', price:'', old_price:'', duration:'', nights:'', region:'nord', departure:'', spots:'20', rating:'5.0', reviews:'0', badge:'', tag:'', tag_color:'teal', difficulty:'Facile', group_size:'', is_active:true };

const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const [form, setForm] = useState(pkg ? {
    title: pkg.title||'', subtitle: pkg.subtitle||'', description: pkg.description||'',
    image_url: pkg.image_url||'', price: pkg.price||'', old_price: pkg.old_price||'',
    duration: pkg.duration||'', nights: pkg.nights||'', region: pkg.region||'nord',
    departure: pkg.departure||'', spots: pkg.spots||'20', rating: pkg.rating||'5.0',
    reviews: pkg.reviews||'0', badge: pkg.badge||'', tag: pkg.tag||'',
    tag_color: pkg.tag_color||'teal', difficulty: pkg.difficulty||'Facile',
    group_size: pkg.group_size||'', is_active: pkg.is_active !== false,
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.duration) { notify('Titre, prix et durée obligatoires', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch(pkg ? `${API}/${pkg.id}` : API, {
        method: pkg ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price), old_price: form.old_price ? Number(form.old_price) : null, duration: Number(form.duration), nights: form.nights ? Number(form.nights) : Number(form.duration) - 1, spots: Number(form.spots)||20 }),
      });
      const json = await res.json();
      if (json.success) { notify(pkg ? 'Circuit mis à jour ✅' : 'Circuit créé ✅'); onSaved(); }
      else notify(json.message || 'Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
    finally { setLoading(false); }
  };

  const F = ({ label, req, children }) => (
    <div className="al-field"><label className="al-label">{label} {req && <span className="al-required">*</span>}</label>{children}</div>
  );

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{ maxWidth:720 }} onClick={e => e.stopPropagation()}>
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg></div>
            <h2>{pkg ? 'Modifier le circuit' : 'Nouveau Circuit'}</h2>
          </div>
          <button className="al-modal__close" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <form className="al-form" onSubmit={handleSubmit}>
          <F label="Titre" req><input className="al-input" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Ex: Sahara & Dunes d'Or" required/></F>
          <F label="Sous-titre"><input className="al-input" value={form.subtitle} onChange={e=>set('subtitle',e.target.value)} placeholder="Douz · Grand Erg · Ksar Ghilane · 5 jours"/></F>
          <F label="Description"><textarea className="al-textarea" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Description du circuit..."/></F>
          <F label="URL de l'image">
            <input className="al-input" value={form.image_url} onChange={e=>set('image_url',e.target.value)} placeholder="https://..."/>
            {form.image_url && <img src={form.image_url} alt="preview" style={{ marginTop:8, width:'100%', height:120, objectFit:'cover', borderRadius:8, border:'1.5px solid var(--g200)' }} onError={e=>e.target.style.display='none'}/>}
          </F>
          <div className="al-row-2">
            <F label="Prix (DT)" req><input className="al-input" type="number" min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="680" required/></F>
            <F label="Ancien prix (DT)"><input className="al-input" type="number" min="0" step="0.01" value={form.old_price} onChange={e=>set('old_price',e.target.value)} placeholder="780 (optionnel)"/></F>
          </div>
          <div className="al-row-2">
            <F label="Durée (jours)" req><input className="al-input" type="number" min="1" value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="5" required/></F>
            <F label="Nuits"><input className="al-input" type="number" min="0" value={form.nights} onChange={e=>set('nights',e.target.value)} placeholder="4 (auto si vide)"/></F>
          </div>
          <div className="al-row-2">
            <F label="Région">
              <select className="al-select" value={form.region} onChange={e=>set('region',e.target.value)}>
                <option value="nord">🏛️ Circuit Nord</option>
                <option value="sud">🏜️ Circuit Sud</option>
              </select>
            </F>
            <F label="Ville de départ"><input className="al-input" value={form.departure} onChange={e=>set('departure',e.target.value)} placeholder="Tunis ou Sfax"/></F>
          </div>
          <div className="al-row-2">
            <F label="Places"><input className="al-input" type="number" min="0" value={form.spots} onChange={e=>set('spots',e.target.value)} placeholder="20"/></F>
            <F label="Difficulté">
              <select className="al-select" value={form.difficulty} onChange={e=>set('difficulty',e.target.value)}>
                <option value="Facile">🟢 Facile</option>
                <option value="Modéré">🟡 Modéré</option>
                <option value="Aventure">🔴 Aventure</option>
              </select>
            </F>
          </div>
          <div className="al-row-2">
            <F label="Tag / Catégorie"><input className="al-input" value={form.tag} onChange={e=>set('tag',e.target.value)} placeholder="Patrimoine, Nature, Aventure..."/></F>
            <F label="Couleur tag">
              <select className="al-select" value={form.tag_color} onChange={e=>set('tag_color',e.target.value)}>
                <option value="teal">Teal</option><option value="blue">Blue</option><option value="green">Green</option>
                <option value="orange">Orange</option><option value="accent">Rose</option><option value="violet">Violet</option>
              </select>
            </F>
          </div>
          <div className="al-row-2">
            <F label="Taille groupe"><input className="al-input" value={form.group_size} onChange={e=>set('group_size',e.target.value)} placeholder="2 – 15 personnes"/></F>
            <F label="Badge">
              <select className="al-select" value={form.badge} onChange={e=>set('badge',e.target.value)}>
                <option value="">Aucun</option><option value="Populaire">⭐ Populaire</option>
                <option value="Nouveau">✨ Nouveau</option><option value="Promo">🔥 Promo</option><option value="VIP">👑 VIP</option>
              </select>
            </F>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ width:16, height:16, cursor:'pointer', accentColor:'var(--primary)' }}/>
            <label htmlFor="is_active" className="al-label" style={{ cursor:'pointer', marginBottom:0 }}>Circuit actif (visible sur le site public)</label>
          </div>
          <div className="al-form-footer">
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="al-btn al-btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (pkg ? '✏️ Mettre à jour' : '➕ Créer le circuit')}
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
const CircuitDetail = ({ circuit, onClose, onEdit, onDelete, isMain }) => {
  const avail  = circuit.available_spots !== undefined ? Number(circuit.available_spots) : Number(circuit.spots);
  const isFull = avail <= 0;
  const isLow  = avail <= 5 && avail > 0;

  const difficultyColor = { Facile:'#065f46', Modéré:'#92400e', Aventure:'#991b1b' };
  const difficultyBg    = { Facile:'#d1fae5', Modéré:'#fef3c7', Aventure:'#fee2e2' };
  const difficultyIcon  = { Facile:'🟢', Modéré:'🟡', Aventure:'🔴' };

  const InfoRow = ({ icon, label, value }) => value ? (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'var(--g50)', border:'1px solid var(--g100)' }}>
      <span style={{ fontSize:12, color:'var(--g500)' }}>{icon} {label}</span>
      <span style={{ fontSize:13, fontWeight:700, color:'var(--g800)' }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ width:330, flexShrink:0, borderLeft:'1px solid var(--g200)', display:'flex', flexDirection:'column', background:'#fff', animation:'alModalIn .25s var(--ease)', overflowY:'auto' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:2 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em' }}>Détails circuit</p>
        <button className="al-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div style={{ width:'100%', height:170, background:'var(--g100)', flexShrink:0, position:'relative', overflow:'hidden' }}>
        {circuit.image_url ? (
          <img src={circuit.image_url} alt={circuit.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e=>e.target.style.display='none'}/>
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,var(--primary),var(--secondary))' }}>
            <span style={{ fontSize:40 }}>{circuit.region === 'nord' ? '🏛️' : '🏜️'}</span>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.7)' }}>{circuit.region === 'nord' ? 'Circuit Nord' : 'Circuit Sud'}</p>
          </div>
        )}
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:6, flexWrap:'wrap' }}>
          <span style={{ padding:'3px 9px', borderRadius:999, background:circuit.is_active?'#10b981':'#94a3b8', color:'#fff', fontSize:11, fontWeight:700, boxShadow:'0 2px 8px rgba(0,0,0,.2)' }}>
            {circuit.is_active ? '● Actif' : '● Inactif'}
          </span>
          {circuit.badge && (
            <span style={{ padding:'3px 9px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:11, fontWeight:700, boxShadow:'0 2px 8px rgba(0,0,0,.15)' }}>
              {circuit.badge}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding:'18px 18px 12px', display:'flex', flexDirection:'column', gap:18, flex:1 }}>
        <div>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--g900)', lineHeight:1.3 }}>{circuit.title}</h3>
          {circuit.subtitle && <p style={{ fontSize:12, color:'var(--g500)', marginTop:4 }}>{circuit.subtitle}</p>}
          <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
            <span style={{ padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:circuit.region==='nord'?'#e0fbfc':'#fff7ed', color:circuit.region==='nord'?'#0e7490':'#c2410c' }}>
              {circuit.region === 'nord' ? '🏛️ Nord' : '🏜️ Sud'}
            </span>
            {circuit.tag && <span style={{ padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:'var(--g100)', color:'var(--g600)' }}>{circuit.tag}</span>}
          </div>
        </div>
        {circuit.description && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Description</p>
            <p style={{ fontSize:13, color:'var(--g600)', lineHeight:1.65 }}>{circuit.description}</p>
          </div>
        )}
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Tarif</p>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{fPrice(circuit.price)}</span>
            {circuit.old_price && <span style={{ fontSize:13, color:'var(--g400)', textDecoration:'line-through' }}>{fPrice(circuit.old_price)}</span>}
          </div>
          {circuit.old_price && (
            <span style={{ marginTop:4, display:'inline-block', fontSize:11, fontWeight:700, color:'#059669', background:'#d1fae5', padding:'2px 8px', borderRadius:999 }}>
              -{Math.round((1 - circuit.price / circuit.old_price) * 100)}% de réduction
            </span>
          )}
        </div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Informations</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <InfoRow icon="🗓"  label="Durée"   value={circuit.duration ? `${circuit.duration} j / ${circuit.nights ?? circuit.duration - 1} n` : null}/>
            <InfoRow icon="✈️"  label="Départ"  value={circuit.departure || null}/>
            <InfoRow icon="👥"  label="Groupe"  value={circuit.group_size || null}/>
            {circuit.difficulty && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:difficultyBg[circuit.difficulty]||'var(--g50)', border:'1px solid var(--g100)' }}>
                <span style={{ fontSize:12, color:'var(--g500)' }}>🎯 Difficulté</span>
                <span style={{ fontSize:13, fontWeight:700, color:difficultyColor[circuit.difficulty]||'var(--g800)' }}>
                  {difficultyIcon[circuit.difficulty]} {circuit.difficulty}
                </span>
              </div>
            )}
          </div>
        </div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Disponibilité</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:isFull?'#fee2e2':isLow?'#fff7ed':'#d1fae5', border:`1px solid ${isFull?'#fca5a5':isLow?'#fed7aa':'#a7f3d0'}` }}>
              <span style={{ fontSize:12, color:isFull?'#991b1b':isLow?'#92400e':'#065f46' }}>🪑 Places disponibles</span>
              <span style={{ fontSize:13, fontWeight:800, color:isFull?'#e92f64':isLow?'#f97316':'#065f46' }}>
                {isFull ? 'Complet' : `${avail} / ${circuit.spots}`}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'rgba(15,76,92,.05)', border:'1px solid rgba(15,76,92,.1)' }}>
              <span style={{ fontSize:12, color:'var(--g500)' }}>📋 Réservations</span>
              <span style={{ fontSize:13, fontWeight:800, color:'var(--primary)' }}>
                {circuit.reservation_count || 0} inscrit{circuit.reservation_count > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer boutons */}
      <div style={{ padding:'14px 18px', borderTop:'1px solid var(--g100)', display:'flex', gap:8, position:'sticky', bottom:0, background:'#fff' }}>
        <button className="al-btn al-btn--primary" style={{ flex:1 }} onClick={() => { onEdit(circuit); onClose(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}>
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Modifier
        </button>
        <button
          className="al-btn al-btn--danger"
          onClick={() => { onDelete(circuit.id); onClose(); }}
          title={isMain ? 'Supprimer ce circuit' : 'Réservé à l\'administrateur principal'}
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
   MAIN
   ══════════════════════════════════════════════════════════════ */
const CircuitPackages = () => {
  const [circuits,  setCircuits]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editPkg,   setEditPkg]   = useState(null);
  const [selected,  setSelected]  = useState(null);

  // ── Role check ────────────────────────────────────────────────
  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchCircuits = async () => {
    try { setLoading(true); const r = await fetch(API); const j = await r.json(); setCircuits(j.data || []); }
    catch { notify('Impossible de charger les circuits', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCircuits(); }, []);

  // ── Delete guarded by role ─────────────────────────────────────
  const handleDelete = async (id) => {
    if (!isMain) {
      notify('❌ Seul l\'administrateur principal peut supprimer un circuit', 'error');
      return;
    }
    if (!window.confirm('Supprimer ce circuit ?')) return;
    const r = await fetch(`${API}/${id}`, { method:'DELETE' });
    const j = await r.json();
    if (j.success) { notify('Circuit supprimé'); fetchCircuits(); setSelected(null); }
    else notify('Erreur suppression', 'error');
  };

  const stats = {
    total:    circuits.length,
    nord:     circuits.filter(c => c.region === 'nord').length,
    sud:      circuits.filter(c => c.region === 'sud').length,
    active:   circuits.filter(c => c.is_active).length,
    totalRes: circuits.reduce((a, c) => a + (parseInt(c.reservation_count)||0), 0),
  };

  return (
    <AdminLayout title="Circuits Tunisie"
      breadcrumb={[{ label:'Circuits' }, { label:'Catalogue', active:true }]}
      actions={
        <button className="al-btn al-btn--primary" onClick={() => { setEditPkg(null); setShowModal(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau circuit
        </button>
      }
      toast={toast}>

      <div className="al-stats al-stats--4">
        {[
          { label:'Total circuits',     value:stats.total,    color:'blue',   icon:<><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></> },
          { label:'🏛️ Nord',            value:stats.nord,     color:'teal',   icon:<><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></> },
          { label:'🏜️ Sud',             value:stats.sud,      color:'orange', icon:<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></> },
          { label:'Total réservations', value:stats.totalRes, color:'green',  icon:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', margin:'0 32px 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'0 4px 12px rgba(15,76,92,.08)', overflow:'hidden' }}>
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
          <div className="al-toolbar">
            <p style={{ fontSize:15, fontWeight:700, color:'var(--g800)', flex:1 }}>Liste des circuits</p>
            <button className="al-btn al-btn--ghost" onClick={fetchCircuits}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>Actualiser
            </button>
          </div>

          {loading ? (
            <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
          ) : circuits.length === 0 ? (
            <div className="al-empty"><div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div><p className="al-empty__title">Aucun circuit</p><p className="al-empty__sub">Créez votre premier circuit touristique.</p></div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead><tr><th>Circuit</th><th>Région</th><th>Prix</th><th>Durée</th><th>Places</th><th>Réservations</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {circuits.map(c => {
                    const avail  = c.available_spots !== undefined ? Number(c.available_spots) : Number(c.spots);
                    const isFull = avail <= 0;
                    const isLow  = avail <= 5 && avail > 0;
                    const isSel  = selected?.id === c.id;
                    return (
                      <tr key={c.id} className={`al-row ${isSel ? 'al-row--selected' : ''}`} style={{ cursor:'pointer' }} onClick={() => setSelected(isSel ? null : c)}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            {c.image_url
                              ? <img src={c.image_url} alt={c.title} style={{ width:44, height:44, borderRadius:8, objectFit:'cover', flexShrink:0, border:'1.5px solid var(--g200)' }} onError={e=>e.target.style.display='none'}/>
                              : <div style={{ width:44, height:44, borderRadius:8, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:20 }}>{c.region==='nord'?'🏛️':'🏜️'}</span></div>
                            }
                            <div>
                              <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>
                                {c.title}
                                {c.badge && <span style={{ marginLeft:7, padding:'2px 7px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:10, fontWeight:700 }}>{c.badge}</span>}
                              </p>
                              {c.tag && <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{c.tag}</p>}
                            </div>
                          </div>
                        </td>
                        <td><span style={{ padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:c.region==='nord'?'#e0fbfc':'#fff7ed', color:c.region==='nord'?'#0e7490':'#c2410c' }}>{c.region==='nord'?'🏛️ Nord':'🏜️ Sud'}</span></td>
                        <td><p style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{fPrice(c.price)}</p>{c.old_price && <p style={{ fontSize:11, color:'var(--g400)', textDecoration:'line-through' }}>{fPrice(c.old_price)}</p>}</td>
                        <td><span style={{ fontWeight:600, fontSize:13 }}>{c.duration} j / {c.nights||c.duration-1} n</span></td>
                        <td>
                          <span style={{ fontWeight:700, fontSize:13, color:isFull?'#e92f64':isLow?'#f97316':'#065f46' }}>{isFull?'❌ Complet':`${avail} / ${c.spots}`}</span>
                          {isLow && <p style={{ fontSize:10, color:'#f97316', marginTop:2 }}>🔥 Presque complet</p>}
                        </td>
                        <td><span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, background:'rgba(15,76,92,.08)', color:'var(--primary)', fontSize:12, fontWeight:700 }}>{c.reservation_count||0} inscrit{c.reservation_count>1?'s':''}</span></td>
                        <td><span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:c.is_active?'#d1fae5':'var(--g100)', color:c.is_active?'#065f46':'var(--g500)' }}><span style={{ width:6, height:6, borderRadius:'50%', background:c.is_active?'#10b981':'var(--g400)' }}/>{c.is_active?'Actif':'Inactif'}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="al-action-btn al-action-btn--edit" onClick={() => { setEditPkg(c); setShowModal(true); }} title="Modifier">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            {/* ── Delete: grayed out for non-main ── */}
                            <button
                              className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(c.id)}
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
          <div className="al-table-footer"><p className="al-count">{circuits.length} circuit{circuits.length!==1?'s':''}</p></div>
        </div>

        {selected && (
          <CircuitDetail
            circuit={selected}
            onClose={() => setSelected(null)}
            onEdit={(c) => { setEditPkg(c); setShowModal(true); }}
            onDelete={handleDelete}
            isMain={isMain}
          />
        )}
      </div>

      {showModal && <PkgModal pkg={editPkg} onClose={() => { setShowModal(false); setEditPkg(null); }} onSaved={() => { setShowModal(false); setEditPkg(null); fetchCircuits(); }} notify={notify}/>}
    </AdminLayout>
  );
};

export default CircuitPackages;