// src/pages/admin/Omra/OmraPackages.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_PKG       = 'http://localhost:5000/api/omra/packages';
const API_PKG_ADMIN = 'http://localhost:5000/api/omra/packages';

const fPrice = (p) => p ? Number(p).toLocaleString('fr-TN') + ' TND' : '—';

/* ── Package Modal ──────────────────────────────────────────── */
const EMPTY = { title:'', subtitle:'', description:'', image_url:'', price:'', old_price:'', duration:'', departure:'', spots:'50', badge:'', is_active:true };

const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const [form, setForm] = useState(pkg ? {
    title:      pkg.title       || '',
    subtitle:   pkg.subtitle    || '',
    description:pkg.description || '',
    image_url:  pkg.image_url   || '',
    price:      pkg.price       || '',
    old_price:  pkg.old_price   || '',
    duration:   pkg.duration    || '',
    departure:  pkg.departure   || '',
    spots:      pkg.spots       || '50',
    badge:      pkg.badge       || '',
    is_active:  pkg.is_active   !== false,
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
    finally   { setLoading(false); }
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
                style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1.5px solid var(--g200)' }}
                onError={e => e.target.style.display = 'none'}/>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}/>
            <label htmlFor="is_active" className="al-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
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
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const OmraPackages = () => {
  const [packages,  setPackages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editPkg,   setEditPkg]   = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const r = await fetch(API_PKG_ADMIN);
      const j = await r.json();
      setPackages(j.data || []);
    } catch { notify('Impossible de charger les forfaits', 'error'); }
    finally   { setLoading(false); }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce forfait ? Les réservations existantes ne seront pas supprimées.')) return;
    const r = await fetch(`${API_PKG}/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (j.success) { notify('Forfait supprimé'); fetchPackages(); }
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
        <button className="al-btn al-btn--primary" onClick={() => { setEditPkg(null); setShowModal(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau forfait
        </button>
      }
      toast={toast}
    >

      {/* Stats */}
      <div className="al-stats al-stats--4">
        {[
          { label: 'Total forfaits', value: stats.total,    color: 'blue',
            icon: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></> },
          { label: 'Actifs',         value: stats.active,   color: 'green',
            icon: <><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
          { label: 'Inactifs',       value: stats.inactive, color: 'gray',
            icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></> },
          { label: 'Total réservations', value: stats.totalRes, color: 'teal',
            icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg>
            </div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="al-card">
        <div className="al-toolbar">
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--g800)', flex: 1 }}>Liste des forfaits</p>
          <button className="al-btn al-btn--ghost" onClick={fetchPackages}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="al-loading">
            <div className="al-spinner-wrap"><div className="al-spinner"/></div>
            <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <p className="al-empty__title">Aucun forfait</p>
            <p className="al-empty__sub">Créez votre premier forfait Omra.</p>
          </div>
        ) : (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Forfait</th>
                  <th>Prix</th>
                  <th>Durée</th>
                  <th>Départ</th>
                  <th>Places dispo</th>
                  <th>Réservations</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id} className="al-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {pkg.image_url
                          ? <img src={pkg.image_url} alt={pkg.title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--g200)' }} onError={e => e.target.style.display = 'none'}/>
                          : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                            </div>
                        }
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>
                            {pkg.title}
                            {pkg.badge && <span style={{ marginLeft: 7, padding: '2px 7px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 10, fontWeight: 700 }}>{pkg.badge}</span>}
                          </p>
                          {pkg.subtitle && <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{pkg.subtitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{fPrice(pkg.price)}</p>
                      {pkg.old_price && <p style={{ fontSize: 11, color: 'var(--g400)', textDecoration: 'line-through' }}>{fPrice(pkg.old_price)}</p>}
                    </td>
                    <td><span style={{ fontWeight: 600, fontSize: 13 }}>{pkg.duration} j</span></td>
                    <td><span style={{ fontSize: 12, color: 'var(--g600)' }}>{pkg.departure || '—'}</span></td>
                    <td>
                      {(() => {
                        const avail = pkg.available_spots !== undefined ? Number(pkg.available_spots) : Number(pkg.spots);
                        const total = Number(pkg.spots);
                        const isFull = avail <= 0;
                        const isLow  = avail <= 5 && avail > 0;
                        return (
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: isFull ? '#e92f64' : isLow ? '#f97316' : '#065f46' }}>
                              {isFull ? '❌ Complet' : `${avail} / ${total}`}
                            </span>
                            {isLow && <p style={{ fontSize: 10, color: '#f97316', marginTop: 2 }}>🔥 Presque complet</p>}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(15,76,92,.08)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                        {pkg.reservation_count || 0} inscrit{pkg.reservation_count > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: pkg.is_active ? '#d1fae5' : 'var(--g100)', color: pkg.is_active ? '#065f46' : 'var(--g500)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: pkg.is_active ? '#10b981' : 'var(--g400)' }}/>
                        {pkg.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="al-action-btn al-action-btn--edit" onClick={() => { setEditPkg(pkg); setShowModal(true); }} title="Modifier">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="al-action-btn al-action-btn--delete" onClick={() => handleDelete(pkg.id)} title="Supprimer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="al-table-footer">
          <p className="al-count">{packages.length} forfait{packages.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {showModal && (
        <PkgModal
          pkg={editPkg}
          onClose={() => { setShowModal(false); setEditPkg(null); }}
          onSaved={() => { setShowModal(false); setEditPkg(null); fetchPackages(); }}
          notify={notify}
        />
      )}

    </AdminLayout>
  );
};

export default OmraPackages;