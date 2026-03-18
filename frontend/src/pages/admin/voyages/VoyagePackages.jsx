// src/pages/admin/Voyages/VoyagePackages.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API = 'http://localhost:5000/api/voyages-organises';
const fPrice = (p) => p ? Number(p).toLocaleString('fr-TN') + ' TND' : '—';

const EMPTY = {
  title:'', subtitle:'', description:'', image_url:'', pays:'', destination:'',
  price:'', old_price:'', duration:'', departure:'', spots:'30',
  continent:'', saison:'', budget:'', categorie:'', badge:'', is_active: true,
};

/* ── Modal ── */
const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const [form,    setForm]    = useState(pkg ? {
    title:       pkg.title       || '',
    subtitle:    pkg.subtitle    || '',
    description: pkg.description || '',
    image_url:   pkg.image_url   || '',
    pays:        pkg.pays        || '',
    destination: pkg.destination || '',
    price:       pkg.price       || '',
    old_price:   pkg.old_price   || '',
    duration:    pkg.duration    || '',
    departure:   pkg.departure   || '',
    spots:       pkg.spots       || '30',
    continent:   pkg.continent   || '',
    saison:      pkg.saison      || '',
    budget:      pkg.budget      || '',
    categorie:   pkg.categorie   || '',
    badge:       pkg.badge       || '',
    is_active:   pkg.is_active !== false,
  } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.duration) {
      notify('Titre, prix et durée sont obligatoires', 'error'); return;
    }
    setLoading(true);
    try {
      const res  = await fetch(pkg ? `${API}/${pkg.id}` : API, {
        method:  pkg ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price:     Number(form.price),
          old_price: form.old_price ? Number(form.old_price) : null,
          duration:  Number(form.duration),
          spots:     Number(form.spots) || 30,
        }),
      });
      const json = await res.json();
      if (json.success) { notify(pkg ? 'Voyage mis à jour ✅' : 'Voyage créé ✅'); onSaved(); }
      else notify(json.message || 'Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
    finally   { setLoading(false); }
  };

  const Field = ({ label, req, children }) => (
    <div className="al-field">
      <label className="al-label">{label} {req && <span className="al-required">*</span>}</label>
      {children}
    </div>
  );

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <h2>{pkg ? 'Modifier le voyage' : 'Nouveau Voyage Organisé'}</h2>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form className="al-form" onSubmit={handleSubmit}>
          <Field label="Titre" req><input className="al-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Istanbul l'Éternelle" required/></Field>
          <Field label="Sous-titre"><input className="al-input" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Hôtel 4★ · Vol inclus · 7 jours"/></Field>
          <Field label="Description"><textarea className="al-textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description du voyage..."/></Field>
          <Field label="URL de l'image">
            <input className="al-input" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..."/>
            {form.image_url && <img src={form.image_url} alt="preview" style={{ marginTop:8, width:'100%', height:120, objectFit:'cover', borderRadius:8, border:'1.5px solid var(--g200)' }} onError={e => e.target.style.display='none'}/>}
          </Field>

          <div className="al-row-2">
            <Field label="Pays"><input className="al-input" value={form.pays} onChange={e => set('pays', e.target.value)} placeholder="Turquie"/></Field>
            <Field label="Destination"><input className="al-input" value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Istanbul"/></Field>
          </div>

          <div className="al-row-2">
            <Field label="Prix (TND)" req><input className="al-input" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="1890" required/></Field>
            <Field label="Ancien prix (TND)"><input className="al-input" type="number" min="0" step="0.01" value={form.old_price} onChange={e => set('old_price', e.target.value)} placeholder="2200 (optionnel)"/></Field>
          </div>

          <div className="al-row-2">
            <Field label="Durée (jours)" req><input className="al-input" type="number" min="1" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="7" required/></Field>
            <Field label="Date / Ville de départ"><input className="al-input" value={form.departure} onChange={e => set('departure', e.target.value)} placeholder="Tunis ou 15 Mars 2026"/></Field>
          </div>

          <div className="al-row-2">
            <Field label="Places disponibles"><input className="al-input" type="number" min="0" value={form.spots} onChange={e => set('spots', e.target.value)} placeholder="30"/></Field>
            <Field label="Badge">
              <select className="al-select" value={form.badge} onChange={e => set('badge', e.target.value)}>
                <option value="">Aucun</option>
                <option value="Populaire">⭐ Populaire</option>
                <option value="Nouveau">✨ Nouveau</option>
                <option value="Promo">🔥 Promo</option>
                <option value="VIP">👑 VIP</option>
              </select>
            </Field>
          </div>

          <div className="al-row-2">
            <Field label="Continent">
              <select className="al-select" value={form.continent} onChange={e => set('continent', e.target.value)}>
                <option value="">—</option>
                <option value="europe">Europe</option>
                <option value="asie">Asie</option>
                <option value="afrique">Afrique</option>
                <option value="amerique">Amérique</option>
                <option value="ocean">Océanie</option>
              </select>
            </Field>
            <Field label="Saison">
              <select className="al-select" value={form.saison} onChange={e => set('saison', e.target.value)}>
                <option value="">—</option>
                <option value="ete">Été</option>
                <option value="hiver">Hiver</option>
                <option value="printemps">Printemps</option>
                <option value="automne">Automne</option>
                <option value="toute-annee">Toute l'année</option>
              </select>
            </Field>
          </div>

          <div className="al-row-2">
            <Field label="Budget">
              <select className="al-select" value={form.budget} onChange={e => set('budget', e.target.value)}>
                <option value="">—</option>
                <option value="economique">Économique</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxe">Luxe</option>
              </select>
            </Field>
            <Field label="Catégorie (filtre)">
              <input className="al-input" value={form.categorie} onChange={e => set('categorie', e.target.value)} placeholder="Famille, Culture, Détente..."/>
            </Field>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width:16, height:16, cursor:'pointer', accentColor:'var(--primary)' }}/>
            <label htmlFor="is_active" className="al-label" style={{ cursor:'pointer', marginBottom:0 }}>Voyage actif (visible sur le site public)</label>
          </div>

          <div className="al-form-footer">
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="al-btn al-btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (pkg ? '✏️ Mettre à jour' : '➕ Créer le voyage')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════════════ */
const VoyagePackages = () => {
  const [voyages,   setVoyages]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editPkg,   setEditPkg]   = useState(null);

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchVoyages = async () => {
    try {
      setLoading(true);
      const r = await fetch(API);
      const j = await r.json();
      setVoyages(j.data || []);
    } catch { notify('Impossible de charger les voyages', 'error'); }
    finally   { setLoading(false); }
  };

  useEffect(() => { fetchVoyages(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce voyage ?')) return;
    const r = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (j.success) { notify('Voyage supprimé'); fetchVoyages(); }
    else notify('Erreur suppression', 'error');
  };

  const stats = {
    total:    voyages.length,
    active:   voyages.filter(v => v.is_active).length,
    inactive: voyages.filter(v => !v.is_active).length,
    totalRes: voyages.reduce((a, v) => a + (parseInt(v.reservation_count) || 0), 0),
  };

  return (
    <AdminLayout
      title="Voyages Organisés"
      breadcrumb={[{ label: 'Voyages Organisés' }, { label: 'Catalogue', active: true }]}
      actions={
        <button className="al-btn al-btn--primary" onClick={() => { setEditPkg(null); setShowModal(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau voyage
        </button>
      }
      toast={toast}
    >

      {/* Stats */}
      <div className="al-stats al-stats--4">
        {[
          { label: 'Total voyages',      value: stats.total,    color: 'blue',
            icon: <><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></> },
          { label: 'Actifs',             value: stats.active,   color: 'green',
            icon: <><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
          { label: 'Inactifs',           value: stats.inactive, color: 'gray',
            icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></> },
          { label: 'Total réservations', value: stats.totalRes, color: 'teal',
            icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="al-card">
        <div className="al-toolbar">
          <p style={{ fontSize:15, fontWeight:700, color:'var(--g800)', flex:1 }}>Liste des voyages</p>
          <button className="al-btn al-btn--ghost" onClick={fetchVoyages}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
        ) : voyages.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
            <p className="al-empty__title">Aucun voyage</p>
            <p className="al-empty__sub">Créez votre premier voyage organisé.</p>
          </div>
        ) : (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr><th>Voyage</th><th>Prix</th><th>Durée</th><th>Départ</th><th>Places dispo</th><th>Réservations</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {voyages.map(v => {
                  const avail = v.available_spots !== undefined ? Number(v.available_spots) : Number(v.spots);
                  const isFull = avail <= 0;
                  const isLow  = avail <= 5 && avail > 0;
                  return (
                    <tr key={v.id} className="al-row">
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          {v.image_url
                            ? <img src={v.image_url} alt={v.title} style={{ width:44, height:44, borderRadius:8, objectFit:'cover', flexShrink:0, border:'1.5px solid var(--g200)' }} onError={e => e.target.style.display='none'}/>
                            : <div style={{ width:44, height:44, borderRadius:8, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width:20, height:20 }}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
                              </div>
                          }
                          <div>
                            <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>
                              {v.title}
                              {v.badge && <span style={{ marginLeft:7, padding:'2px 7px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:10, fontWeight:700 }}>{v.badge}</span>}
                            </p>
                            <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{v.pays} {v.destination ? `· ${v.destination}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{fPrice(v.price)}</p>
                        {v.old_price && <p style={{ fontSize:11, color:'var(--g400)', textDecoration:'line-through' }}>{fPrice(v.old_price)}</p>}
                      </td>
                      <td><span style={{ fontWeight:600, fontSize:13 }}>{v.duration} j</span></td>
                      <td><span style={{ fontSize:12, color:'var(--g600)' }}>{v.departure || '—'}</span></td>
                      <td>
                        <span style={{ fontWeight:700, fontSize:13, color: isFull ? '#e92f64' : isLow ? '#f97316' : '#065f46' }}>
                          {isFull ? '❌ Complet' : `${avail} / ${v.spots}`}
                        </span>
                        {isLow && <p style={{ fontSize:10, color:'#f97316', marginTop:2 }}>🔥 Presque complet</p>}
                      </td>
                      <td>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, background:'rgba(15,76,92,.08)', color:'var(--primary)', fontSize:12, fontWeight:700 }}>
                          {v.reservation_count || 0} inscrit{v.reservation_count > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background: v.is_active ? '#d1fae5' : 'var(--g100)', color: v.is_active ? '#065f46' : 'var(--g500)' }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background: v.is_active ? '#10b981' : 'var(--g400)' }}/>
                          {v.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="al-action-btn al-action-btn--edit" onClick={() => { setEditPkg(v); setShowModal(true); }} title="Modifier">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="al-action-btn al-action-btn--delete" onClick={() => handleDelete(v.id)} title="Supprimer">
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
          <p className="al-count">{voyages.length} voyage{voyages.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {showModal && (
        <PkgModal
          pkg={editPkg}
          onClose={() => { setShowModal(false); setEditPkg(null); }}
          onSaved={() => { setShowModal(false); setEditPkg(null); fetchVoyages(); }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default VoyagePackages;