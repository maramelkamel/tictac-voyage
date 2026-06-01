// src/pages/admin/admins/AdminsAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

// Base URL for all admin-auth API calls.
const API      = 'http://localhost:5000/api/admin-auth';

// Formats a date string as DD/MM/YYYY for French locale display.
const fDate    = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

// Retrieves the admin JWT from localStorage for use in Authorization headers.
const getToken = () => localStorage.getItem('adminToken') || '';



const ModalField = ({ label, req, children }) => (
  <div className="al-field">
    <label className="al-label">{label}{req && <span className="al-required"> *</span>}</label>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   AdminModal — Create / Edit admin dialog
   ══════════════════════════════════════════════════════════════ */
const AdminModal = ({ admin, onClose, onSaved, notify }) => {
  // Derive mode from whether an existing admin was passed in.
  const isEdit = !!admin;

  const [form, setForm] = useState({
    first_name:  admin?.first_name  || '',
    last_name:   admin?.last_name   || '',
    email:       admin?.email       || '',
    occupation:  admin?.occupation  || '',
    password:    '',
    // Default is_active to true for new admins; preserve the stored value for edits.
    is_active:   admin?.is_active   !== false,
  });

  const [showPw,  setShowPw]  = useState(false); 
  const [loading, setLoading] = useState(false); 
  
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));




  // Validates the form and POSTs (create) or PUTs (edit) to the API.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!form.first_name || !form.last_name || !form.email) {
      notify('Prénom, nom et email sont obligatoires', 'error'); return;
    }
    if (!isEdit && !form.password) {
      // Password is required when creating a new admin — optional when editing.
      notify('Mot de passe obligatoire pour la création', 'error'); return;
    }
    if (form.password && form.password.length < 8) {
      notify('Mot de passe trop court (min 8 caractères)', 'error'); return;
    }

    setLoading(true);
    try {
      const body = { ...form };
      // Omit the password field entirely when editing and the field is blank,
      // so the backend doesn't overwrite the existing hash with an empty string.
      if (!body.password) delete body.password;

      const res = await fetch(
        // Dynamic URL: POST to /admins for create, PUT to /admins/:id for edit.
        isEdit ? `${API}/admins/${admin.id}` : `${API}/admins`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();

      if (json.success) {
        notify(isEdit ? 'Admin mis à jour ✅' : 'Admin créé ✅');
        onSaved(); 
      } else {
        notify(json.message || 'Erreur', 'error');
      }
    } catch { notify('Erreur réseau', 'error'); }
    finally   { setLoading(false); }
  };

  return (
    
    <div className="al-overlay" onClick={onClose}>
      
      <div className="al-modal" style={{ maxWidth:540 }} onClick={e => e.stopPropagation()}>

        {/* Modal header — title changes based on create vs edit mode */}
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h2>{isEdit ? 'Modifier l\'admin' : 'Nouvel administrateur'}</h2>
          </div>
          {/* X button — dismisses the modal without saving */}
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form className="al-form" onSubmit={handleSubmit}>

          {/* First name + last name — displayed side-by-side via a two-column grid */}
          <div className="al-row-2">
            <ModalField label="Prénom" req>
              <input className="al-input" value={form.first_name} onChange={e=>set('first_name',e.target.value)} placeholder="Mohamed" required/>
            </ModalField>
            <ModalField label="Nom" req>
              <input className="al-input" value={form.last_name} onChange={e=>set('last_name',e.target.value)} placeholder="Ben Ali" required/>
            </ModalField>
          </div>

          <ModalField label="Email" req>
            <input className="al-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="admin@tictac.tn" required/>
          </ModalField>

          {/* Optional — helps the main admin identify each person's role in the agency */}
          <ModalField label="Poste / Occupation">
            <input className="al-input" value={form.occupation} onChange={e=>set('occupation',e.target.value)} placeholder="Ex: Responsable commercial, Agent de réservation..."/>
          </ModalField>

          {/* Password field — required label changes dynamically based on mode */}
          <ModalField label={isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'} req={!isEdit}>
            <div style={{ position:'relative' }}>
              <input className="al-input" type={showPw?'text':'password'} value={form.password}
                onChange={e=>set('password',e.target.value)}
                placeholder={isEdit ? 'Laisser vide pour conserver' : 'Min. 8 caractères'}
                style={{ paddingRight:44 }}/>
              {/* Eye toggle for password visibility */}
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:4 }}>
                {showPw
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </ModalField>

          {/* Active/inactive toggle — only shown in edit mode.
              Deactivating an admin prevents them from logging in without deleting their account. */}
          {isEdit && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)}
                style={{ width:16, height:16, cursor:'pointer', accentColor:'var(--primary)' }}/>
              <label htmlFor="is_active" className="al-label" style={{ cursor:'pointer', marginBottom:0 }}>Compte actif</label>
            </div>
          )}

          {/* Footer buttons — Cancel discards changes; Submit sends the request */}
          <div className="al-form-footer">
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="al-btn al-btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (isEdit ? '✏️ Mettre à jour' : '➕ Créer l\'admin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   AdminsAdmin — main page component
   Renders the admin list table, stats bar, and controls the modal state.
   ══════════════════════════════════════════════════════════════ */
const AdminsAdmin = () => {
  const [admins,    setAdmins]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);  // { msg, type } or null
  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);  // null = create mode, object = edit mode

  // Read the currently logged-in admin from localStorage 
  const me = (() => { try { return JSON.parse(localStorage.getItem('admin') || '{}'); } catch { return {}; } })();

  
  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // Fetches the full admin list from the API and updates state.
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/admins`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const j = await r.json();
      setAdmins(j.data || []);
    } catch { notify('Impossible de charger les admins', 'error'); }
    finally   { setLoading(false); }
  };

  
  useEffect(() => { fetchAdmins(); }, []);

  // Prompts for confirmation then sends a DELETE request.
  const handleDelete = async (admin) => {
    if (!window.confirm(`Supprimer l'admin ${admin.first_name} ${admin.last_name} ?`)) return;
    const r    = await fetch(`${API}/admins/${admin.id}`, { method:'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    const json = await r.json();
    if (json.success) { notify('Admin supprimé'); fetchAdmins(); }
    else notify(json.message || 'Erreur', 'error');
  };

  return (
    <AdminLayout title="Gestion des Admins"
      breadcrumb={[{ label:'Admins', active:true }]}
      // "Nouvel admin" button — opens the modal in create mode (editAdmin = null)
      actions={
        <button className="al-btn al-btn--primary" onClick={() => { setEditAdmin(null); setShowModal(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nouvel admin
        </button>
      }
      toast={toast}>

      {/* Information banner — explains the current user's permissions at a glance */}
      <div style={{ margin:'0 32px 20px', padding:'14px 20px', background:'#e0fbfc', border:'1px solid #a5f3fc', borderRadius:12, display:'flex', alignItems:'flex-start', gap:12 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="2" style={{ width:20, height:20, flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'#0e7490', marginBottom:3 }}>Gestion des accès administrateurs</p>
          <p style={{ fontSize:12, color:'#0e7490', lineHeight:1.5 }}>
            Vous êtes connecté en tant qu'<strong>Admin Principal</strong>. Vous pouvez créer, modifier et désactiver les comptes des autres administrateurs. L'admin principal ne peut pas être supprimé.
          </p>
        </div>
      </div>

      
      <div className="al-stats">
        {[
          { label:'Total admins',    value:admins.length,                             color:'blue',   icon:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></> },
          { label:'Actifs',          value:admins.filter(a=>a.is_active).length,      color:'green',  icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
          { label:'Désactivés',      value:admins.filter(a=>!a.is_active).length,     color:'orange', icon:<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></> },
          { label:'Admins standard', value:admins.filter(a=>a.role==='admin').length, color:'teal',   icon:<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* ── Admin list table ── */}
      <div className="al-card">
        <div className="al-toolbar">
          <p style={{ fontSize:15, fontWeight:700, color:'var(--g800)', flex:1 }}>Liste des administrateurs</p>
          {/* Manual refresh button — re-fetches the list without a full page reload */}
          <button className="al-btn al-btn--ghost" onClick={fetchAdmins}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>Actualiser
          </button>
        </div>

        {/* Conditional rendering: spinner → empty state → table */}
        {loading ? (
          <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
        ) : admins.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
            <p className="al-empty__title">Aucun admin</p>
          </div>
        ) : (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr><th>Administrateur</th><th>Email</th><th>Poste</th><th>Rôle</th><th>Statut</th><th>Créé le</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {admins.map(a => {
                  // isMe      – true if this row belongs to the currently logged-in admin
                  // isMainRow – true if this admin has the 'main' (super-admin) role
                  // initials  – two-letter avatar fallback derived from the admin's name
                  const isMe      = a.email === me.email;
                  const isMainRow = a.role === 'main';
                  const initials  = `${a.first_name?.[0]||''}${a.last_name?.[0]||''}`.toUpperCase();

                  return (
                    <tr key={a.id} className="al-row">
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          {/* Avatar circle — purple gradient for main admin, teal for others */}
                          <div style={{ width:38, height:38, borderRadius:'50%', background:isMainRow?'linear-gradient(135deg,#7c3aed,#4c1d95)':'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>
                              {a.first_name} {a.last_name}
                              {/* "Vous" badge marks the current session's own row */}
                              {isMe && <span style={{ marginLeft:6, fontSize:10, padding:'1px 6px', borderRadius:999, background:'#e0fbfc', color:'#0e7490', fontWeight:700 }}>Vous</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize:13, color:'var(--g600)' }}>{a.email}</span></td>
                      <td><span style={{ fontSize:12, color:'var(--g500)' }}>{a.occupation || '—'}</span></td>
                      <td>
                        {/* Role badge — crown emoji + purple for main admin, wrench + grey for standard */}
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:isMainRow?'#f5f3ff':'#f1f5f9', color:isMainRow?'#7c3aed':'#475569' }}>
                          {isMainRow ? '👑 Principal' : '🔧 Admin'}
                        </span>
                      </td>
                      <td>
                        {/* Status pill — green for active, red for deactivated */}
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:a.is_active?'#d1fae5':'#fee2e2', color:a.is_active?'#065f46':'#991b1b' }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background:a.is_active?'#10b981':'#e92f64' }}/>
                          {a.is_active ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td><span style={{ fontSize:12, color:'var(--g400)' }}>{fDate(a.created_at)}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          {/* Edit button — disabled for the main admin row unless the current
                              user IS the main admin editing their own profile. */}
                          <button className="al-action-btn al-action-btn--edit"
                            onClick={() => { setEditAdmin(a); setShowModal(true); }}
                            title="Modifier" disabled={isMainRow && !isMe}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          {/* Delete button — hidden for the main admin and for the current user's
                              own row to prevent self-deletion and orphaned super-admin slots. */}
                          {!isMainRow && !isMe && (
                            <button className="al-action-btn al-action-btn--delete" onClick={() => handleDelete(a)} title="Supprimer">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer — shows a count with correct French plural */}
        <div className="al-table-footer">
          <p className="al-count">{admins.length} administrateur{admins.length!==1?'s':''}</p>
        </div>
      </div>

      {/* Modal — rendered conditionally; `editAdmin` drives create vs edit mode */}
      {showModal && (
        <AdminModal admin={editAdmin}
          onClose={() => { setShowModal(false); setEditAdmin(null); }}
          onSaved={() => { setShowModal(false); setEditAdmin(null); fetchAdmins(); }}
          notify={notify}/>
      )}
    </AdminLayout>
  );
};

export default AdminsAdmin;