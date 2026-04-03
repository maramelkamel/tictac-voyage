// src/pages/admin/clients/ClientsAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_CLIENTS = 'http://localhost:5000/api/clients';
const API_OMRA    = 'http://localhost:5000/api/omra/reservations';
const API_VOYAGE  = 'http://localhost:5000/api/voyage-reservations';
const API_CIRCUIT = 'http://localhost:5000/api/circuit-reservations';
const API_TRANS   = 'http://localhost:5000/api/requests';
const API_CUSTOM  = 'http://localhost:5000/api/custom-trips';

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const MARITAL = {
  celibataire: 'Célibataire',
  marie:       'Marié(e)',
  divorce:     'Divorcé(e)',
  veuf:        'Veuf/Veuve',
};

// ── Loyalty level (same logic as ClientProfile) ───────────────────
const getLoyaltyLevel = (total) => {
  if (total === 0) return { label: 'Nouveau client', color: '#64748b', bg: '#f1f5f9', icon: '🌱' };
  if (total === 1) return { label: 'Niveau 1 ⭐',    color: '#0e7490', bg: '#e0fbfc', icon: '⭐' };
  if (total <= 3)  return { label: 'Niveau 2 ⭐⭐',  color: '#c2410c', bg: '#fff7ed', icon: '⭐⭐' };
  return                  { label: 'Niveau 3 ⭐⭐⭐', color: '#7c3aed', bg: '#f5f3ff', icon: '⭐⭐⭐' };
};

/* ══════════════════════════════════════════════════════════════
   CLIENT DETAIL PANEL
   ══════════════════════════════════════════════════════════════ */
const ClientDetail = ({ client, reservationCount, onClose, onDelete, isMain }) => {
  const initials = `${client.first_name?.[0]||''}${client.last_name?.[0]||''}`.toUpperCase();
  const loyalty  = getLoyaltyLevel(reservationCount);

  const InfoRow = ({ icon, label, value }) => value ? (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'var(--g50)', border:'1px solid var(--g100)' }}>
      <span style={{ fontSize:12, color:'var(--g500)' }}>{icon} {label}</span>
      <span style={{ fontSize:13, fontWeight:600, color:'var(--g800)' }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ width:320, flexShrink:0, borderLeft:'1px solid var(--g200)', display:'flex', flexDirection:'column', background:'#fff', animation:'alModalIn .25s var(--ease)', overflowY:'auto' }}>

      {/* Header gradient */}
      <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, background:'linear-gradient(135deg,var(--primary),var(--secondary))', flexShrink:0 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,.25)', border:'3px solid rgba(255,255,255,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff' }}>
          {initials || '?'}
        </div>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontWeight:800, fontSize:17, color:'#fff' }}>{client.first_name} {client.last_name}</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.8)', marginTop:4 }}>{client.email}</p>
        </div>
        <span style={{ padding:'4px 14px', borderRadius:999, background:loyalty.bg, color:loyalty.color, fontSize:12, fontWeight:700 }}>
          {loyalty.icon} {loyalty.label}
        </span>
        <div style={{ display:'flex', gap:16, marginTop:4 }}>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1 }}>{reservationCount}</p>
            <p style={{ fontSize:10, color:'rgba(255,255,255,.75)', marginTop:2 }}>Réservations</p>
          </div>
        </div>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:28, height:28, borderRadius:'50%', border:'none', background:'rgba(255,255,255,.2)', cursor:'pointer', color:'#fff', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
      </div>

      {/* Info */}
      <div style={{ padding:'18px', display:'flex', flexDirection:'column', gap:8, flex:1, position:'relative' }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Informations</p>
        <InfoRow icon="📞" label="Téléphone"    value={client.phone || null}/>
        <InfoRow icon="🏙️" label="Ville"         value={client.city  || null}/>
        <InfoRow icon="💍" label="Situation"     value={MARITAL[client.marital_status] || null}/>
        <InfoRow icon="👶" label="Enfants"       value={client.number_of_children > 0 ? `${client.number_of_children}` : null}/>
        <InfoRow icon="📅" label="Inscrit le"    value={fDate(client.created_at)}/>
      </div>

      {/* Footer */}
      <div style={{ padding:'14px 18px', borderTop:'1px solid var(--g100)', position:'sticky', bottom:0, background:'#fff' }}>
        {isMain ? (
          <button className="al-btn al-btn--danger" style={{ width:'100%' }}
            onClick={() => { onDelete(client); onClose(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            Supprimer ce client
          </button>
        ) : (
          <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, fontSize:12, color:'#991b1b', textAlign:'center' }}>
            🔒 Seul l'admin principal peut supprimer un client
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */
const ClientsAdmin = () => {
  const [clients,   setClients]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [search,    setSearch]    = useState('');

  // reservation counts per email
  const [resCounts, setResCounts] = useState({});

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // ── Fetch all clients + aggregate reservation counts ─────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, omraRes, voyageRes, circuitRes, transRes, customRes] = await Promise.all([
        fetch(API_CLIENTS).then(r => r.json()).catch(() => ({})),
        fetch(API_OMRA).then(r => r.json()).catch(() => ({})),
        fetch(API_VOYAGE).then(r => r.json()).catch(() => ({})),
        fetch(API_CIRCUIT).then(r => r.json()).catch(() => ({})),
        fetch(API_TRANS).then(r => r.json()).catch(() => ({})),
        fetch(API_CUSTOM).then(r => r.json()).catch(() => ({})),
      ]);

      setClients(cRes.data || []);

      // Build email → count map
      const counts = {};
      const allRes = [
        ...(omraRes.data    || []),
        ...(voyageRes.data  || []),
        ...(circuitRes.data || []),
        ...(transRes.data   || []),
        ...(customRes.data  || []),
      ];
      allRes.forEach(r => {
        const e = (r.email || '').toLowerCase();
        if (e) counts[e] = (counts[e] || 0) + 1;
      });
      setResCounts(counts);
    } catch { notify('Impossible de charger les clients', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (client) => {
    if (!isMain) { notify('❌ Seul l\'administrateur principal peut supprimer un client', 'error'); return; }
    if (!window.confirm(`Supprimer le client ${client.first_name} ${client.last_name} ? Cette action est irréversible.`)) return;
    try {
      const r = await fetch(`${API_CLIENTS}/${client.id}`, { method:'DELETE' });
      const j = await r.json();
      if (j.success) { notify('Client supprimé'); fetchAll(); setSelected(null); }
      else notify(j.message || 'Erreur suppression', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !search ||
      (c.first_name || '').toLowerCase().includes(q) ||
      (c.last_name  || '').toLowerCase().includes(q) ||
      (c.email      || '').toLowerCase().includes(q) ||
      (c.phone      || '').toLowerCase().includes(q) ||
      (c.city       || '').toLowerCase().includes(q);
  });

  // ── Loyalty breakdown for stats ───────────────────────────────
  const loyaltyBreakdown = clients.reduce((acc, c) => {
    const count = resCounts[(c.email || '').toLowerCase()] || 0;
    const lvl   = getLoyaltyLevel(count);
    acc[lvl.label] = (acc[lvl.label] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label:'Total clients',   value: clients.length,                              color:'blue',
      icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></> },
    { label:'🌱 Nouveaux',     value: loyaltyBreakdown['Nouveau client'] || 0,     color:'gray',
      icon: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
    { label:'⭐ Niveau 1',     value: loyaltyBreakdown['Niveau 1 ⭐']    || 0,     color:'teal',
      icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></> },
    { label:'⭐⭐ Niveau 2',   value: loyaltyBreakdown['Niveau 2 ⭐⭐']  || 0,     color:'orange',
      icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></> },
    { label:'⭐⭐⭐ Niveau 3', value: loyaltyBreakdown['Niveau 3 ⭐⭐⭐'] || 0,     color:'violet',
      icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></> },
  ];

  return (
    <AdminLayout title="Clients"
      breadcrumb={[{ label:'Clients', active:true }]}
      actions={
        <button className="al-btn al-btn--ghost" onClick={fetchAll}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Actualiser
        </button>
      }
      toast={toast}>

      {/* Stats with loyalty breakdown */}
      <div className="al-stats">
        {stats.map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg>
            </div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Table + detail panel */}
      <div style={{ display:'flex', margin:'0 0 32px' }}>

        <div style={{ flex:1, minWidth:0, margin:'0 0 0 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

          {/* Toolbar */}
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Rechercher par nom, email, ville..." value={search} onChange={e => setSearch(e.target.value)}/>
              {search && <button className="al-search__clear" onClick={() => setSearch('')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
            </div>
            <p style={{ fontSize:13, color:'var(--g400)', marginLeft:'auto', flexShrink:0 }}>
              {filtered.length} client{filtered.length!==1?'s':''}{search ? ` sur ${clients.length}` : ''}
            </p>
          </div>

          {/* Table */}
          {loading ? (
            <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
              <p className="al-empty__title">Aucun client trouvé</p>
              <p className="al-empty__sub">{search ? 'Modifiez votre recherche.' : 'Aucun client inscrit pour l\'instant.'}</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr><th>Client</th><th>Contact</th><th>Ville</th><th>Niveau fidélité</th><th>Réservations</th><th>Inscrit le</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const email   = (c.email || '').toLowerCase();
                    const count   = resCounts[email] || 0;
                    const loyalty = getLoyaltyLevel(count);
                    const initials = `${c.first_name?.[0]||''}${c.last_name?.[0]||''}`.toUpperCase();
                    const isSel   = selected?.id === c.id;
                    return (
                      <tr key={c.id} className={`al-row ${isSel?'al-row--selected':''}`} style={{ cursor:'pointer' }} onClick={() => setSelected(isSel?null:c)}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                              {initials || '?'}
                            </div>
                            <div>
                              <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>{c.first_name} {c.last_name}</p>
                              <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>#{c.id}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p style={{ fontSize:13, color:'var(--g700)' }}>{c.email}</p>
                          {c.phone && <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{c.phone}</p>}
                        </td>
                        <td><span style={{ fontSize:12, color:'var(--g600)' }}>{c.city || '—'}</span></td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:loyalty.bg, color:loyalty.color }}>
                            {loyalty.icon} {loyalty.label}
                          </span>
                        </td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, background:'rgba(15,76,92,.08)', color:'var(--primary)', fontSize:12, fontWeight:700 }}>
                            {count} réservation{count!==1?'s':''}
                          </span>
                        </td>
                        <td><span style={{ fontSize:12, color:'var(--g500)' }}>{fDate(c.created_at)}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="al-action-btn al-action-btn--edit" onClick={() => setSelected(isSel?null:c)} title="Voir le détail">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(c)}
                              title={isMain?'Supprimer ce client':'Réservé à l\'administrateur principal'}
                              style={{ opacity:isMain?1:0.4, cursor:isMain?'pointer':'not-allowed' }}>
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
            <p className="al-count">{filtered.length} client{filtered.length!==1?'s':''}</p>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width:320, flexShrink:0, margin:'0 32px 0 16px' }}>
            <ClientDetail
              client={selected}
              reservationCount={resCounts[(selected.email||'').toLowerCase()] || 0}
              onClose={() => setSelected(null)}
              onDelete={handleDelete}
              isMain={isMain}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ClientsAdmin;