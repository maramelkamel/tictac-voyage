import React, { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';

const CATEGORIES = [
  { value: 'omra',                   label: 'Omra' },
  { value: 'hotels',                 label: 'Hôtels' },
  { value: 'vols',                   label: 'Vols' },
  { value: 'circuits',               label: 'Circuits' },
  { value: 'voyages_internationaux', label: 'Voyages internationaux' },
];

const BADGE_STYLE = {
  omra:                   { background:'#FFF3E0', color:'#E65100' },
  hotels:                 { background:'#E3F2FD', color:'#1565C0' },
  vols:                   { background:'#FFEBEE', color:'#B71C1C' },
  circuits:               { background:'#E8F5E9', color:'#1B5E20' },
  voyages_internationaux: { background:'#F3E5F5', color:'#4A148C' },
};

const empty = {
  titre:'', description:'', categorie:'', type_reduction:'pourcentage',
  valeur_reduction:'', code_promo:'', date_debut:'', date_fin:'',
  is_active: true, afficher_accueil: false, display_mode:'card', image_url:'',
};

const API = 'http://localhost:5000/api/promotions';

export default function PromotionsAdmin() {
  const [promos,  setPromos]  = useState([]);
  const [form,    setForm]    = useState(empty);
  const [editId,  setEditId]  = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = () => {
    setLoading(true);
    fetch(API).then(r => r.json()).then(setPromos).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setError('');
    const url    = editId ? `${API}/${editId}` : API;
    const method = editId ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Erreur.');
    showToast(editId ? 'Promotion modifiée.' : 'Promotion créée.');
    setForm(empty); setEditId(null); fetchAll();
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      ...p,
      date_debut: p.date_debut?.slice(0, 10),
      date_fin:   p.date_fin?.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette promotion ?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    showToast('Promotion supprimée.', 'error');
    fetchAll();
  };

  const handleToggle = async (id) => {
    await fetch(`${API}/${id}/toggle`, { method: 'PATCH' });
    fetchAll();
  };

  return (
    <AdminLayout
      title="Promotions"
      breadcrumb={[{ label: 'Promotions', active: true }]}
      toast={toast}
    >
      <div style={{ padding: '24px 32px 48px' }}>

        {/* ── Formulaire ── */}
        <div className="al-card" style={{ marginBottom: 32 }}>
          <div className="al-modal__header" style={{ borderRadius: 0 }}>
            <div className="al-modal__title-wrap">
              <div className="al-modal__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                </svg>
              </div>
              <h2>{editId ? 'Modifier la promotion' : 'Nouvelle promotion'}</h2>
            </div>
            {editId && (
              <button className="al-modal__close" onClick={() => { setForm(empty); setEditId(null); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          <div className="al-form">
            {error && (
              <div style={{ padding:'10px 14px', background:'#fff1f2', border:'1px solid #fca5a5', borderRadius:8, color:'#b91c1c', fontSize:13 }}>
                {error}
              </div>
            )}

            <div className="al-row-2">
              <div className="al-field">
                <label className="al-label">Titre <span className="al-required">*</span></label>
                <input className="al-input" name="titre" value={form.titre} onChange={handleChange} maxLength={150} placeholder="Ex : Offre Ramadan — 15% sur Omra" />
              </div>
              <div className="al-field">
                <label className="al-label">Catégorie <span className="al-required">*</span></label>
                <select className="al-select" name="categorie" value={form.categorie} onChange={handleChange}>
                  <option value="">— Choisir —</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="al-field">
              <label className="al-label">Description</label>
              <textarea className="al-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Détails de l'offre..." />
            </div>

            <div className="al-row-3">
              <div className="al-field">
                <label className="al-label">Type de réduction <span className="al-required">*</span></label>
                <div style={{ display:'flex', gap:16, marginTop:4 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                    <input type="radio" name="type_reduction" value="pourcentage" checked={form.type_reduction==='pourcentage'} onChange={handleChange} />
                    Pourcentage
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                    <input type="radio" name="type_reduction" value="montant_fixe" checked={form.type_reduction==='montant_fixe'} onChange={handleChange} />
                    Montant fixe
                  </label>
                </div>
              </div>
              <div className="al-field">
                <label className="al-label">
                  Valeur {form.type_reduction === 'pourcentage' ? '(%)' : '(DT)'} <span className="al-required">*</span>
                </label>
                <input className="al-input" type="number" name="valeur_reduction"
                  value={form.valeur_reduction} onChange={handleChange}
                  min="0" max={form.type_reduction === 'pourcentage' ? 100 : undefined}
                  placeholder={form.type_reduction === 'pourcentage' ? 'Ex : 15' : 'Ex : 200'} />
              </div>
              <div className="al-field">
                <label className="al-label">Code promo</label>
                <input className="al-input" name="code_promo" value={form.code_promo} onChange={handleChange} placeholder="Ex : RAMADAN25" />
              </div>
            </div>

            <div className="al-row-2">
              <div className="al-field">
                <label className="al-label">Date début <span className="al-required">*</span></label>
                <input className="al-input" type="date" name="date_debut" value={form.date_debut} onChange={handleChange} />
              </div>
              <div className="al-field">
                <label className="al-label">Date fin <span className="al-required">*</span></label>
                <input className="al-input" type="date" name="date_fin" value={form.date_fin} min={form.date_debut} onChange={handleChange} />
              </div>
            </div>

            <div className="al-field">
              <label className="al-label">URL de l'image (optionnel)</label>
              <input className="al-input" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." />
            </div>

            {/* Mode d'affichage */}
            <div className="al-field">
              <label className="al-label">Mode d'affichage</label>
              <div style={{ display:'flex', gap:16, marginTop:4 }}>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                  <input type="radio" name="display_mode" value="card" checked={form.display_mode==='card'} onChange={handleChange} />
                  🃏 Carte
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                  <input type="radio" name="display_mode" value="banner" checked={form.display_mode==='banner'} onChange={handleChange} />
                  📢 Bandeau
                </label>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                Promotion active
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" name="afficher_accueil" checked={form.afficher_accueil} onChange={handleChange} />
                Afficher sur la page d'accueil
              </label>
            </div>

            <div className="al-form-footer">
              {editId && (
                <button className="al-btn al-btn--ghost" onClick={() => { setForm(empty); setEditId(null); }}>
                  Annuler
                </button>
              )}
              <button className="al-btn al-btn--primary" onClick={handleSubmit}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                {editId ? 'Enregistrer les modifications' : 'Créer la promotion'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Tableau ── */}
        <div className="al-card">
          <div className="al-toolbar">
            <h3 style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>
              Toutes les promotions
              <span style={{ marginLeft:8, fontSize:12, background:'#f1f5f9', color:'#64748b', padding:'2px 8px', borderRadius:20, fontWeight:500 }}>
                {promos.length}
              </span>
            </h3>
          </div>
          <div className="al-table-wrap">
            {loading ? (
              <div className="al-loading">
                <div className="al-spinner-wrap"><div className="al-spinner"/></div>
                <p style={{ fontSize:13, color:'#94a3b8' }}>Chargement...</p>
              </div>
            ) : promos.length === 0 ? (
              <div className="al-empty">
                <div className="al-empty__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                  </svg>
                </div>
                <p className="al-empty__title">Aucune promotion</p>
                <p className="al-empty__sub">Créez votre première promotion ci-dessus.</p>
              </div>
            ) : (
              <table className="al-table">
                <thead>
                  <tr>
                    {['Titre','Catégorie','Réduction','Mode','Dates','Accueil','Statut','Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {promos.map(p => (
                    <tr key={p.id} className="al-row">
                      <td style={{ fontWeight:600, fontSize:13, maxWidth:180 }}>{p.titre}</td>
                      <td>
                        <span className="al-badge-pill" style={BADGE_STYLE[p.categorie]}>
                          {CATEGORIES.find(c => c.value === p.categorie)?.label || p.categorie}
                        </span>
                      </td>
                      <td style={{ fontWeight:700, color:'#e92f64', fontSize:14 }}>
                        {p.type_reduction === 'pourcentage'
                          ? `-${p.valeur_reduction}%`
                          : `-${p.valeur_reduction} DT`}
                      </td>
                      <td>
                        <span style={{ fontSize:12 }}>
                          {p.display_mode === 'banner' ? '📢 Bandeau' : '🃏 Carte'}
                        </span>
                      </td>
                      <td style={{ fontSize:12, color:'#64748b' }}>
                        {p.date_debut?.slice(0,10)} → {p.date_fin?.slice(0,10)}
                      </td>
                      <td style={{ textAlign:'center' }}>
                        {p.afficher_accueil
                          ? <span style={{ color:'#059669', fontSize:16 }}>✓</span>
                          : <span style={{ color:'#cbd5e1', fontSize:16 }}>—</span>}
                      </td>
                      <td>
                        <button onClick={() => handleToggle(p.id)} style={{
                          padding:'4px 12px', border:'none', borderRadius:12,
                          background: p.is_active ? '#d1fae5' : '#f1f5f9',
                          color: p.is_active ? '#065f46' : '#64748b',
                          fontSize:11, fontWeight:700, cursor:'pointer',
                        }}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="al-action-btn al-action-btn--edit" onClick={() => handleEdit(p)} title="Modifier">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button className="al-action-btn al-action-btn--delete" onClick={() => handleDelete(p.id)} title="Supprimer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}