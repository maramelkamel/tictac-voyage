// src/pages/admin/clients/ClientsAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API    = 'http://localhost:5000/api/clients';
const fDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT    = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';

const MARITAL = { celibataire:'Célibataire', marie:'Marié(e)', divorce:'Divorcé(e)', veuf:'Veuf/Veuve' };

/* ══════════════════════════════════════════════════════════════
   CLIENT DETAIL PANEL
   ══════════════════════════════════════════════════════════════ */
const ClientDetail = ({ client, onClose, onDelete, isMain }) => {
  const initials = `${client.first_name?.[0]||''}${client.last_name?.[0]||''}`.toUpperCase();

  const InfoRow = ({ icon, label, value }) => value ? (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'var(--g50)', border:'1px solid var(--g100)' }}>
      <span style={{ fontSize:12, color:'var(--g500)' }}>{icon} {label}</span>
      <span style={{ fontSize:13, fontWeight:600, color:'var(--g800)' }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ width:320, flexShrink:0, borderLeft:'1px solid var(--g200)', display:'flex', flexDirection:'column', background:'#fff', animation:'alModalIn .25s var(--ease)', overflowY:'auto' }}>

      {/* Header */}
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:2 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em' }}>Fiche client</p>
        <button className="al-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Avatar + name */}
      <div style={{ padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12, background:'linear-gradient(135deg,var(--primary),var(--secondary))', borderBottom:'1px solid var(--g100)' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,.25)', border:'3px solid rgba(255,255,255,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff' }}>
          {initials || '?'}
        </div>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontWeight:800, fontSize:17, color:'#fff' }}>{client.first_name} {client.last_name}</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.8)', marginTop:4 }}>{client.email}</p>
        </div>
        <span style={{ padding:'4px 12px', borderRadius:999, background:'rgba(255,255,255,.2)', color:'#fff', fontSize:11, fontWeight:600 }}>
          Client depuis le {fDate(client.created_at)}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding:'18px', display:'flex', flexDirection:'column', gap:8, flex:1 }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Informations</p>
        <InfoRow icon="📞" label="Téléphone"     value={client.phone || null}/>
        <InfoRow icon="🏙️" label="Ville"          value={client.city  || null}/>
        <InfoRow icon="💍" label="Situation"      value={MARITAL[client.marital_status] || null}/>
        <InfoRow icon="👶" label="Enfants"        value={client.number_of_children ? `${client.number_of_children}` : null}/>
        <InfoRow icon="📅" label="Inscrit le"     value={fDate(client.created_at)}/>
        <InfoRow icon="🔄" label="Mis à jour le"  value={fDate(client.updated_at)}/>
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

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const r = await fetch(API);
      const j = await r.json();
      setClients(j.data || []);
    } catch { notify('Impossible de charger les clients', 'error'); }
    finally   { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDelete = async (client) => {
    if (!isMain) { notify('❌ Seul l\'administrateur principal peut supprimer un client', 'error'); return; }
    if (!window.confirm(`Supprimer le client ${client.first_name} ${client.last_name} ? Cette action est irréversible.`)) return;
    try {
      const r = await fetch(`${API}/${client.id}`, { method:'DELETE' });
      const j = await r.json();
      if (j.success) { notify('Client supprimé'); fetchClients(); setSelected(null); }
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

  const stats = {
    total:  clients.length,
    cities: [...new Set(clients.map(c => c.city).filter(Boolean))].length,
    recent: clients.filter(c => {
      const d = new Date(c.created_at);
      const now = new Date();
      return (now - d) / (1000 * 60 * 60 * 24) <= 30;
    }).length,
  };

  return (
    <AdminLayout title="Clients"
      breadcrumb={[{ label:'Clients', active:true }]}
      actions={
        <button className="al-btn al-btn--ghost" onClick={fetchClients}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Actualiser
        </button>
      }
      toast={toast}>

      {/* Stats */}
      <div className="al-stats">
        {[
          { label:'Total clients',    value:stats.total,  color:'blue',
            icon:<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></> },
          { label:'Villes différentes', value:stats.cities, color:'teal',
            icon:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></> },
          { label:'Nouveaux (30 j)',  value:stats.recent, color:'green',
            icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Table + detail panel */}
      <div style={{ display:'flex', margin:'0 0 32px', transition:'all .3s' }}>

        <div style={{ flex:1, minWidth:0, margin:'0 0 0 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

          {/* Toolbar */}
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Rechercher par nom, email, ville..." value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && <button className="al-search__clear" onClick={()=>setSearch('')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
            </div>
            <p style={{ fontSize:13, color:'var(--g400)', marginLeft:'auto' }}>
              {filtered.length} client{filtered.length!==1?'s':''} {search ? `sur ${clients.length}` : ''}
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
                  <tr><th>Client</th><th>Contact</th><th>Ville</th><th>Situation</th><th>Inscrit le</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const initials = `${c.first_name?.[0]||''}${c.last_name?.[0]||''}`.toUpperCase();
                    const isSel    = selected?.id === c.id;
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
                          <span style={{ fontSize:12, color:'var(--g600)' }}>{MARITAL[c.marital_status] || '—'}</span>
                          {c.number_of_children > 0 && <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{c.number_of_children} enfant{c.number_of_children>1?'s':''}</p>}
                        </td>
                        <td><span style={{ fontSize:12, color:'var(--g500)' }}>{fDate(c.created_at)}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="al-action-btn al-action-btn--edit"
                              onClick={() => setSelected(isSel?null:c)} title="Voir le détail">
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
            <ClientDetail client={selected} onClose={() => setSelected(null)} onDelete={handleDelete} isMain={isMain}/>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ClientsAdmin;