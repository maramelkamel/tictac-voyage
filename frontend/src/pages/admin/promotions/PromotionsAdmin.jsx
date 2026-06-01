import React, { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';

const CATEGORIES = [
  { value: 'omra',                   label: 'Omra' },
  { value: 'hotels',                 label: 'Hôtels' },
  { value: 'vols',                   label: 'Vols' },
  { value: 'circuits',               label: 'Circuits' },
  { value: 'voyages_internationaux', label: 'Voyages internationaux' },
  { value: 'voyages_sur_mesure',     label: 'Voyages sur mesure' },
  { value: 'transfert_mise_a_disposition', label: 'Transfert et mise a dispo' },
];

const BADGE_STYLE = {
  omra:                   { background:'#FFF3E0', color:'#E65100' },
  hotels:                 { background:'#E3F2FD', color:'#1565C0' },
  vols:                   { background:'#FFEBEE', color:'#B71C1C' },
  circuits:               { background:'#E8F5E9', color:'#1B5E20' },
  voyages_internationaux: { background:'#F3E5F5', color:'#4A148C' },
  voyages_sur_mesure:     { background:'#E0F2FE', color:'#0C4A6E' },
  transfert_mise_a_disposition: { background:'#ECFCCB', color:'#3F6212' },
};

const empty = {
  titre:'', description:'', categorie:'', type_reduction:'pourcentage',
  valeur_reduction:'', code_promo:'', date_debut:'', date_fin:'',
  is_active: true, afficher_accueil: false, display_mode:'card', image_url:'',
};

const API = 'http://localhost:5000/api/promotions';

export default function PromotionsAdmin() {
  const [promos,   setPromos]   = useState([]); //liste promos
  const [form,     setForm]     = useState(empty);//val form saisie
  const [editId,   setEditId]   = useState(null);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [blasting, setBlasting] = useState(null); // id promo email en cours d envoi


  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  //get api/promotions
  const fetchAll = () => {
    setLoading(true);
    fetch(API)
      .then(r => r.json())
      .then(data => setPromos(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => showToast('Impossible de charger les promotions', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
//create ou edite
  const handleSubmit = async () => {
    setError('');
    if (!form.titre)           return setError('Le titre est obligatoire.');
    if (!form.categorie)       return setError('La catégorie est obligatoire.');
    if (!form.valeur_reduction) return setError('La valeur de réduction est obligatoire.');
    if (!form.date_debut)      return setError('La date de début est obligatoire.');
    if (!form.date_fin)        return setError('La date de fin est obligatoire.');

    const url    = editId ? `${API}/${editId}` : API;
    const method = editId ? 'PUT' : 'POST';
    try {
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || data.message || 'Erreur lors de la sauvegarde.');
      showToast(editId ? 'Promotion modifiée ✅' : 'Promotion créée ✅');
      setForm(empty); setEditId(null); fetchAll();
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    }
  };
//préremplie de promo choisie
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
    if (!window.confirm('Supprimer cette promotion définitivement ?')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      showToast('Promotion supprimée.', 'error');
      if (editId === id) { setForm(empty); setEditId(null); }
      fetchAll();
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };
//active ou nn
  const handleToggle = async (id) => {
    try {
      await fetch(`${API}/${id}/toggle`, { method: 'PATCH' });
      fetchAll();
    } catch {
      showToast('Erreur lors du changement de statut.', 'error');
    }
  };

  // envoi mail a tous les clients
    const handleSendBlast = async (id, titre) => {
    if (!window.confirm(
      `📧 Envoyer la promotion "${titre}" par email à TOUS les clients ?\n\nCette action est irréversible.`
    )) return;

    setBlasting(id);
    try {
      const res  = await fetch(`${API}/${id}/send-blast`, { method: 'POST' });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(json?.message || 'Erreur lors de l\'envoi.', 'error');
        return;
      }
      if (json?.success) {
        showToast(json.message || `✅ Promotion envoyée à tous les clients !`, 'success');
        fetchAll();
      } else {
        showToast(json?.message || 'Erreur lors de l\'envoi.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de l\'envoi.', 'error');
    } finally {
      setBlasting(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <AdminLayout
      title="Promotions"
      breadcrumb={[{ label: 'Promotions', active: true }]}
      toast={toast}
    >
      <div style={{ padding: '24px 32px 48px' }}>

       
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
              <button className="al-modal__close" onClick={() => { setForm(empty); setEditId(null); setError(''); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          <div className="al-form">

            {/* Error */}
            {error && (
              <div style={{ padding:'12px 16px', background:'#fff1f2', border:'1px solid #fca5a5', borderRadius:10, color:'#b91c1c', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Titre + Catégorie */}
            <div className="al-row-2">
              <div className="al-field">
                <label className="al-label">Titre <span className="al-required">*</span></label>
                <input
                  className="al-input"
                  name="titre"
                  value={form.titre}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="Ex : Offre Ramadan — 15% sur Omra"
                />
              </div>
              <div className="al-field">
                <label className="al-label">Catégorie <span className="al-required">*</span></label>
                <select className="al-select" name="categorie" value={form.categorie} onChange={handleChange}>
                  <option value="">— Choisir —</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="al-field">
              <label className="al-label">Description</label>
              <textarea
                className="al-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez cette offre en détail..."
                rows={3}
              />
            </div>

            {/* Type réduction + valeur + code */}
            <div className="al-row-3">
              <div className="al-field">
                <label className="al-label">Type de réduction <span className="al-required">*</span></label>
                <div style={{ display:'flex', gap:16, marginTop:6 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                    <input type="radio" name="type_reduction" value="pourcentage"
                      checked={form.type_reduction === 'pourcentage'} onChange={handleChange}/>
                    Pourcentage
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                    <input type="radio" name="type_reduction" value="montant_fixe"
                      checked={form.type_reduction === 'montant_fixe'} onChange={handleChange}/>
                    Montant fixe
                  </label>
                </div>
              </div>
              <div className="al-field">
                <label className="al-label">
                  Valeur {form.type_reduction === 'pourcentage' ? '(%)' : '(DT)'} <span className="al-required">*</span>
                </label>
                <input
                  className="al-input"
                  type="number"
                  name="valeur_reduction"
                  value={form.valeur_reduction}
                  onChange={handleChange}
                  min="0"
                  max={form.type_reduction === 'pourcentage' ? 100 : undefined}
                  placeholder={form.type_reduction === 'pourcentage' ? 'Ex : 15' : 'Ex : 200'}
                />
              </div>
              <div className="al-field">
                <label className="al-label">Code promo</label>
                <input
                  className="al-input"
                  name="code_promo"
                  value={form.code_promo}
                  onChange={handleChange}
                  placeholder="Ex : RAMADAN25"
                  style={{ textTransform:'uppercase' }}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="al-row-2">
              <div className="al-field">
                <label className="al-label">Date début <span className="al-required">*</span></label>
                <input className="al-input" type="date" name="date_debut" value={form.date_debut} onChange={handleChange}/>
              </div>
              <div className="al-field">
                <label className="al-label">Date fin <span className="al-required">*</span></label>
                <input className="al-input" type="date" name="date_fin" value={form.date_fin} min={form.date_debut} onChange={handleChange}/>
              </div>
            </div>

            {/* Image */}
            <div className="al-field">
              <label className="al-label">URL de l'image (optionnel)</label>
              <input className="al-input" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..."/>
              {form.image_url && (
                <img src={form.image_url} alt="preview"
                  style={{ marginTop:8, width:'100%', height:100, objectFit:'cover', borderRadius:8, border:'1.5px solid #e2e8f0' }}
                  onError={e => e.target.style.display='none'}/>
              )}
            </div>

            {/* Mode d'affichage */}
            <div className="al-field">
              <label className="al-label">Mode d'affichage</label>
              <div style={{ display:'flex', gap:16, marginTop:6 }}>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                  <input type="radio" name="display_mode" value="card"
                    checked={form.display_mode === 'card'} onChange={handleChange}/>
                  🃏 Carte
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                  <input type="radio" name="display_mode" value="banner"
                    checked={form.display_mode === 'banner'} onChange={handleChange}/>
                  📢 Bandeau
                </label>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}
                  style={{ width:15, height:15, accentColor:'#0F4C5C' }}/>
                Promotion active
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                <input type="checkbox" name="afficher_accueil" checked={form.afficher_accueil} onChange={handleChange}
                  style={{ width:15, height:15, accentColor:'#0F4C5C' }}/>
                Afficher sur la page d'accueil
              </label>
            </div>

            {/* Footer boutons */}
            <div className="al-form-footer">
              {editId && (
                <button className="al-btn al-btn--ghost" onClick={() => { setForm(empty); setEditId(null); setError(''); }}>
                  Annuler
                </button>
              )}
              <button className="al-btn al-btn--primary" onClick={handleSubmit}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                {editId ? 'Enregistrer les modifications' : 'Créer la promotion'}
              </button>
            </div>
          </div>
        </div>

        {/* TABLEAU DES PROMOTIONS */}
        <div className="al-card">
          <div className="al-toolbar">
            <h3 style={{ fontWeight:700, fontSize:15, color:'#0f172a', flex:1 }}>
              Toutes les promotions
              <span style={{ marginLeft:8, fontSize:12, background:'#f1f5f9', color:'#64748b', padding:'2px 8px', borderRadius:20, fontWeight:500 }}>
                {promos.length}
              </span>
            </h3>
            <button className="al-btn al-btn--ghost" onClick={fetchAll} style={{ fontSize:12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}>
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Actualiser
            </button>
          </div>

          {/* Info banner about blast */}
          <div style={{ margin:'0 20px 16px', padding:'12px 16px', background:'#e0fbfc', border:'1px solid #a5f3fc', borderRadius:10, display:'flex', alignItems:'center', gap:10, fontSize:12, color:'#0e7490' }}>
            <span style={{ fontSize:16 }}>📧</span>
            <span>Le bouton <strong>📧 Email</strong> envoie la promotion par email à tous vos clients enregistrés.</span>
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
                    {['Titre', 'Catégorie', 'Réduction', 'Mode', 'Dates', 'Accueil', 'Statut', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {promos.map(p => {
                    const isBlasting = blasting === p.id;
                    return (
                      <tr key={p.id} className="al-row">

                        {/* Titre */}
                        <td>
                          <div>
                            <p style={{ fontWeight:600, fontSize:13, color:'#0f172a', marginBottom:2 }}>{p.titre}</p>
                            {p.code_promo && (
                              <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:4, background:'#f0fdf4', color:'#065f46', border:'1px solid #bbf7d0', letterSpacing:1 }}>
                                {p.code_promo}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Catégorie */}
                        <td>
                          <span className="al-badge-pill" style={BADGE_STYLE[p.categorie] || {}}>
                            {CATEGORIES.find(c => c.value === p.categorie)?.label || p.categorie}
                          </span>
                        </td>

                        {/* Réduction */}
                        <td>
                          <span style={{ fontWeight:800, color:'#e92f64', fontSize:15 }}>
                            {p.type_reduction === 'pourcentage'
                              ? `−${p.valeur_reduction}%`
                              : `−${p.valeur_reduction} DT`}
                          </span>
                        </td>

                        {/* Mode */}
                        <td>
                          <span style={{ fontSize:12, color:'#64748b' }}>
                            {p.display_mode === 'banner' ? '📢 Bandeau' : '🃏 Carte'}
                          </span>
                        </td>

                        {/* Dates */}
                        <td>
                          <p style={{ fontSize:11, color:'#64748b', lineHeight:1.6 }}>
                            {p.date_debut?.slice(0,10)}<br/>
                            <span style={{ color:'#94a3b8' }}>→</span> {p.date_fin?.slice(0,10)}
                          </p>
                        </td>

                        {/* Accueil */}
                        <td style={{ textAlign:'center' }}>
                          {p.afficher_accueil
                            ? <span style={{ color:'#059669', fontSize:18 }}>✓</span>
                            : <span style={{ color:'#cbd5e1', fontSize:16 }}>—</span>}
                        </td>

                        {/* Statut toggle */}
                        <td>
                          <button
                            onClick={() => handleToggle(p.id)}
                            style={{
                              padding:'4px 12px', border:'none', borderRadius:12,
                              background: p.is_active ? '#d1fae5' : '#f1f5f9',
                              color:      p.is_active ? '#065f46' : '#64748b',
                              fontSize:11, fontWeight:700, cursor:'pointer',
                              display:'flex', alignItems:'center', gap:5,
                            }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background: p.is_active ? '#10b981' : '#94a3b8' }}/>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display:'flex', gap:6, alignItems:'center' }}>

                            {/* Modifier */}
                            <button
                              className="al-action-btn al-action-btn--edit"
                              onClick={() => handleEdit(p)}
                              title="Modifier">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>

                            {/* Supprimer */}
                            <button
                              className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(p.id)}
                              title="Supprimer">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>

                            {/* ── Envoyer par email (blast) ── */}
                            <button
                              type="button"
                              onClick={() => handleSendBlast(p.id, p.titre)}
                              disabled={isBlasting}
                              title={isBlasting ? 'Envoi en cours...' : 'Envoyer à tous les clients par email'}
                              style={{
                                display:        'flex',
                                alignItems:     'center',
                                justifyContent: 'center',
                                gap:            4,
                                width:          32,
                                height:         32,
                                borderRadius:   8,
                                border:         'none',
                                background:     isBlasting
                                  ? '#e2e8f0'
                                  : 'linear-gradient(135deg,#e92f64,#f43f5e)',
                                color:          isBlasting ? '#94a3b8' : '#fff',
                                fontSize:       14,
                                cursor:         isBlasting ? 'not-allowed' : 'pointer',
                                opacity:        isBlasting ? 0.7 : 1,
                                transition:     'all .2s',
                                flexShrink:     0,
                              }}>
                              {isBlasting
                                ? <div style={{ width:14, height:14, border:'2px solid #94a3b8', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
                                : <span>📧</span>
                              }
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="al-table-footer">
            <p className="al-count">{promos.length} promotion{promos.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
}
