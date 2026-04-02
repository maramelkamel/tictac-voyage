// src/pages/admin/surMesure/SurMesureAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API = 'http://localhost:5000/api/custom-trips';

const STATUS = {
  pending:   { label:'En attente', bg:'#fff7ed', color:'#c2410c', dot:'#f97316' },
  confirmed: { label:'Confirmée',  bg:'#d1fae5', color:'#065f46', dot:'#10b981' },
  cancelled: { label:'Annulée',    bg:'#fee2e2', color:'#991b1b', dot:'#E92F64' },
  completed: { label:'Terminée',   bg:'#e0fbfc', color:'#0e7490', dot:'#0e7490' },
};

const fDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT    = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';
const nights = (dep, ret) => {
  if (!dep || !ret) return 0;
  return Math.ceil(Math.abs(new Date(ret) - new Date(dep)) / 86400000);
};

const Badge = ({ s }) => {
  const m = STATUS[s] || { label:s, bg:'var(--g100)', color:'var(--g600)', dot:'var(--g400)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:m.dot, flexShrink:0 }}/>{m.label}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   DETAIL PANEL
   ══════════════════════════════════════════════════════════════ */
const DetailPanel = ({ req, onClose, onStatusChange, onSendQuote, isMain }) => {
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteMsg,   setQuoteMsg]   = useState('');
  const [sending,    setSending]    = useState(false);

  // Sync local state when req changes
  useEffect(() => {
    if (req) {
      setQuotePrice(req.quoted_price ? String(req.quoted_price) : '');
      setQuoteMsg(req.admin_message || '');
    }
  }, [req?.id]);

  if (!req) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, height:'100%', padding:32, textAlign:'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--g300)" strokeWidth="1" style={{ width:56, height:56 }}>
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
      <p style={{ fontSize:14, fontWeight:600, color:'var(--g400)', lineHeight:1.6 }}>Cliquez sur une demande<br/>pour voir les détails</p>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', paddingBottom:8, borderBottom:'1px solid var(--g100)' }}>{title}</p>
      {children}
    </div>
  );

  const Grid  = ({ children })            => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>{children}</div>;
  const Item  = ({ label, value, full, accent }) => value ? (
    <div style={{ display:'flex', flexDirection:'column', gap:3, gridColumn:full?'1 / -1':undefined }}>
      <span style={{ fontSize:10, fontWeight:600, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:500, color:accent||'var(--g700)' }}>{value}</span>
    </div>
  ) : null;
  const OptionTag = ({ label, icon }) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:8, background:'rgba(15,76,92,.07)', color:'var(--primary)', fontSize:12, fontWeight:600 }}>
      {icon} {label}
    </span>
  );

  const n             = nights(req.departure_date, req.return_date);
  const quoteAlreadySent = !!(req.quoted_price || req.admin_message);

  const handleSend = async () => {
    if (!quotePrice && !quoteMsg) return;
    setSending(true);
    await onSendQuote(req.id, quotePrice, quoteMsg);
    setSending(false);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'flex-start', gap:14, flexShrink:0, background:'#fff' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width:22, height:22 }}>
            <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
          </svg>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:800, fontSize:16, color:'var(--g900)' }}>{req.destination}</p>
          <p style={{ fontSize:12, color:'var(--g400)', marginTop:3 }}>#{req.id} · {fDate(req.departure_date)} → {fDate(req.return_date)} · {n} nuit{n>1?'s':''}</p>
        </div>
        <Badge s={req.status}/>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid var(--g200)', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2" style={{ width:14, height:14 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'18px 20px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Contact */}
        {(req.full_name || req.email || req.phone) && (
          <Section title="Contact client">
            <Grid>
              {req.full_name && <Item label="Nom"       value={req.full_name} full/>}
              {req.email     && <Item label="E-mail"    value={req.email}/>}
              {req.phone     && <Item label="Téléphone" value={req.phone}/>}
            </Grid>
          </Section>
        )}

        {/* Voyage */}
        <Section title="Voyage">
          <Grid>
            <Item label="Destination" value={req.destination}/>
            <Item label="Voyageurs"   value={`${req.number_of_persons} personne${req.number_of_persons>1?'s':''}`}/>
            <Item label="Départ"      value={fDate(req.departure_date)}/>
            <Item label="Retour"      value={fDate(req.return_date)}/>
            <Item label="Durée"       value={`${n} nuit${n>1?'s':''}`}/>
            {req.max_budget && <Item label="Budget max" value={`${Number(req.max_budget).toLocaleString('fr-FR')} €`} accent="var(--primary)"/>}
          </Grid>
        </Section>

        {/* Options */}
        <Section title="Options demandées">
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {req.include_hotel     && <OptionTag icon="🏨" label="Hôtel"/>}
            {req.include_transport && <OptionTag icon="✈️" label="Transport"/>}
            {req.include_guide     && <OptionTag icon="🧭" label="Guide"/>}
            {!req.include_hotel && !req.include_transport && !req.include_guide && <span style={{ fontSize:13, color:'var(--g400)' }}>Aucune option</span>}
          </div>
        </Section>

        {/* Hôtel */}
        {req.include_hotel && (
          <Section title="🏨 Hébergement">
            <Grid>
              <Item label="Catégorie" value={req.hotel_category?`${req.hotel_category} étoiles`:null}/>
              <Item label="Chambre"   value={req.room_type}/>
              <Item label="Pension"   value={req.pension}/>
            </Grid>
          </Section>
        )}

        {/* Transport */}
        {req.include_transport && (
          <Section title="✈️ Transport">
            <Grid>
              <Item label="Type"        value={req.transport_type}/>
              <Item label="Ville départ" value={req.departure_city}/>
              <Item label="Bagages"     value={req.luggage}/>
            </Grid>
          </Section>
        )}

        {/* Guide */}
        {req.include_guide && (
          <Section title="🧭 Guide touristique">
            <Grid>
              <Item label="Langue" value={req.guide_language}/>
              <Item label="Durée"  value={req.guide_duration}/>
            </Grid>
          </Section>
        )}

        {/* ── OFFRE DÉJÀ ENVOYÉE ── */}
        {quoteAlreadySent && (
          <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#d1fae5,#ecfdf5)', border:'1.5px solid #a7f3d0', borderRadius:12 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#065f46', marginBottom:8 }}>✅ Offre envoyée au client</p>
            {req.quoted_price && (
              <p style={{ fontSize:18, fontWeight:800, color:'#065f46', marginBottom:4 }}>
                💰 {Number(req.quoted_price).toLocaleString('fr-TN')} TND
              </p>
            )}
            {req.admin_message && (
              <p style={{ fontSize:13, color:'#065f46', lineHeight:1.6, fontStyle:'italic' }}>"{req.admin_message}"</p>
            )}
          </div>
        )}

        {/* ── ENVOYER UNE OFFRE ── */}
        <Section title={quoteAlreadySent ? '✏️ Modifier l\'offre' : '💰 Envoyer une offre au client'}>
          <p style={{ fontSize:12, color:'var(--g400)', lineHeight:1.5 }}>
            Le client verra ce prix et ce message dans son espace personnel.
          </p>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--g500)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>
              Prix proposé (TND)
            </label>
            <input
              type="number" min="0" step="0.01" placeholder="Ex: 1500"
              value={quotePrice} onChange={e => setQuotePrice(e.target.value)}
              style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid var(--g200)', fontSize:14, fontWeight:700, color:'#0F4C5C', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='var(--primary)'}
              onBlur={e=>e.target.style.borderColor='var(--g200)'}
            />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--g500)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>
              Message au client
            </label>
            <textarea
              rows={3} placeholder="Ex: Nous avons préparé un programme sur mesure pour vous..."
              value={quoteMsg} onChange={e => setQuoteMsg(e.target.value)}
              style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid var(--g200)', fontSize:13, color:'var(--g700)', outline:'none', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', lineHeight:1.5 }}
              onFocus={e=>e.target.style.borderColor='var(--primary)'}
              onBlur={e=>e.target.style.borderColor='var(--g200)'}
            />
          </div>
          <button onClick={handleSend} disabled={sending || (!quotePrice && !quoteMsg)}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 20px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#0F4C5C,#1a6b80)', color:'#fff', fontSize:13, fontWeight:700, cursor:(sending||(!quotePrice&&!quoteMsg))?'not-allowed':'pointer', opacity:(sending||(!quotePrice&&!quoteMsg))?0.6:1, fontFamily:'inherit', width:'100%' }}>
            {sending ? '⏳ Envoi...' : (quoteAlreadySent ? '✏️ Mettre à jour l\'offre' : '📤 Envoyer l\'offre')}
          </button>
        </Section>

        {/* Changer le statut */}
        <Section title="Changer le statut">
          {!isMain && (
            <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, fontSize:12, color:'#991b1b', marginBottom:4 }}>
              🔒 L'annulation est réservée à l'administrateur principal.
            </div>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {Object.entries(STATUS).map(([key, meta]) => {
              const blocked = key==='cancelled' && !isMain;
              return (
                <button key={key} onClick={() => onStatusChange(req.id, key)}
                  title={blocked?'Réservé à l\'administrateur principal':''}
                  style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:8, border:`1.5px solid ${req.status===key?meta.color:'var(--g200)'}`, background:req.status===key?meta.bg:'#fff', fontSize:12, fontWeight:600, cursor:blocked?'not-allowed':'pointer', opacity:blocked?0.4:1, fontFamily:'inherit', color:req.status===key?meta.color:'var(--g600)', transition:'all .2s' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:meta.dot }}/>
                  {meta.label} {blocked && '🔒'}
                </button>
              );
            })}
          </div>
        </Section>

        <div style={{ padding:'12px 14px', background:'var(--g50)', borderRadius:10, fontSize:11, color:'var(--g400)' }}>
          <p>Reçue le {fDT(req.created_at)}</p>
          {req.updated_at !== req.created_at && <p style={{ marginTop:4 }}>Mise à jour le {fDT(req.updated_at)}</p>}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */
const SurMesureAdmin = () => {
  const [trips,        setTrips]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [filterStatus, setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const r = await fetch(API);
      const j = await r.json();
      setTrips(j.data || []);
    } catch { notify('Impossible de charger les demandes', 'error'); }
    finally   { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleStatusChange = async (id, status) => {
    if (status==='cancelled' && !isMain) {
      notify('❌ Seul l\'administrateur principal peut annuler une demande', 'error'); return;
    }
    try {
      const r = await fetch(`${API}/${id}/status`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ status }) });
      const j = await r.json();
      if (j.success) {
        notify(`Statut : ${STATUS[status]?.label}`);
        fetchTrips();
        if (selected?.id===id) setSelected(p => ({ ...p, status }));
      } else notify('Erreur mise à jour', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!isMain) { notify('❌ Seul l\'administrateur principal peut supprimer une demande', 'error'); return; }
    if (!window.confirm('Supprimer cette demande définitivement ?')) return;
    try {
      const r = await fetch(`${API}/${id}`, { method:'DELETE' });
      if (r.ok) { notify('Demande supprimée'); fetchTrips(); if (selected?.id===id) setSelected(null); }
      else notify('Erreur suppression', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  const handleSendQuote = async (id, quoted_price, admin_message) => {
    try {
      const r = await fetch(`${API}/${id}/quote`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ quoted_price: Number(quoted_price)||null, admin_message: admin_message||null }),
      });
      const j = await r.json();
      if (j.success) {
        notify('💰 Offre envoyée au client !');
        fetchTrips();
        if (selected?.id===id) setSelected(p => ({ ...p, quoted_price, admin_message }));
      } else notify(j.message || 'Erreur envoi', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  const filtered = trips.filter(r => {
    const q = search.toLowerCase();
    return ((r.destination||'').toLowerCase().includes(q)) && (filterStatus==='all' || r.status===filterStatus);
  });

  const stats = {
    total:     trips.length,
    pending:   trips.filter(r => r.status==='pending').length,
    confirmed: trips.filter(r => r.status==='confirmed').length,
    completed: trips.filter(r => r.status==='completed').length,
    cancelled: trips.filter(r => r.status==='cancelled').length,
  };

  const OptionIcons = ({ trip }) => (
    <div style={{ display:'flex', gap:4 }}>
      {trip.include_hotel     && <span title="Hôtel"     style={{ fontSize:14 }}>🏨</span>}
      {trip.include_transport && <span title="Transport" style={{ fontSize:14 }}>✈️</span>}
      {trip.include_guide     && <span title="Guide"     style={{ fontSize:14 }}>🧭</span>}
    </div>
  );

  return (
    <AdminLayout title="Voyages sur Mesure"
      breadcrumb={[{ label:'Voyage sur Mesure' }, { label:'Demandes', active:true }]}
      actions={
        <button className="al-btn al-btn--ghost" onClick={fetchTrips}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Actualiser
        </button>
      }
      toast={toast}>

      <div className="al-stats">
        {[
          { label:'Total',      value:stats.total,     color:'blue',   key:'all',       icon:<path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/> },
          { label:'En attente', value:stats.pending,   color:'orange', key:'pending',   icon:<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
          { label:'Confirmées', value:stats.confirmed, color:'green',  key:'confirmed', icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
          { label:'Terminées',  value:stats.completed, color:'teal',   key:'completed', icon:<path d="M20 6L9 17l-5-5"/> },
          { label:'Annulées',   value:stats.cancelled, color:'red',    key:'cancelled', icon:<><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}
            style={{ cursor:'pointer', outline:filterStatus===s.key?'2px solid var(--secondary)':'none', outlineOffset:2 }}
            onClick={() => setFilter(s.key)}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 400px':'1fr', gap:0, margin:'0 0 32px', transition:'grid-template-columns .3s' }}>
        <div style={{ margin:'0 0 0 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Rechercher une destination..." value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && <button className="al-search__clear" onClick={()=>setSearch('')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
            </div>
            <div className="al-filter-tabs">
              {[{v:'all',l:'Tous'},{v:'pending',l:'⏳ Attente'},{v:'confirmed',l:'✅ Confirmés'},{v:'completed',l:'🏁 Terminés'},{v:'cancelled',l:'❌ Annulés'}].map(({v,l}) => (
                <button key={v} className={`al-filter-tab ${filterStatus===v?'active':''}`} onClick={()=>setFilter(v)}>
                  {l}<span className="al-filter-tab__count">{v==='all'?trips.length:trips.filter(r=>r.status===v).length}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
          ) : filtered.length===0 ? (
            <div className="al-empty"><div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div><p className="al-empty__title">Aucune demande</p><p className="al-empty__sub">Modifiez vos filtres.</p></div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead><tr><th>Destination</th><th>Dates</th><th>Voyageurs</th><th>Options</th><th>Budget max</th><th>Offre</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(r => {
                    const isSel = selected?.id===r.id;
                    const n     = nights(r.departure_date, r.return_date);
                    const hasQuote = !!(r.quoted_price || r.admin_message);
                    return (
                      <tr key={r.id} className="al-row" style={{ cursor:'pointer', background:isSel?'#e0fbfc':undefined }} onClick={() => setSelected(isSel?null:r)}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width:18, height:18 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <div>
                              <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>{r.destination}</p>
                              <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{n} nuit{n>1?'s':''}</p>
                            </div>
                          </div>
                        </td>
                        <td><p style={{ fontSize:12, fontWeight:600, color:'var(--g700)' }}>{fDate(r.departure_date)}</p><p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>→ {fDate(r.return_date)}</p></td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ width:13, height:13 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                            <span style={{ fontWeight:600, fontSize:13, color:'var(--primary)' }}>{r.number_of_persons}</span>
                          </div>
                        </td>
                        <td><OptionIcons trip={r}/></td>
                        <td>{r.max_budget ? <span style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{Number(r.max_budget).toLocaleString('fr-FR')} €</span> : <span style={{ color:'var(--g300)' }}>—</span>}</td>
                        <td>
                          {hasQuote
                            ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:999, background:'#d1fae5', color:'#065f46', fontSize:11, fontWeight:700 }}>
                                💰 {r.quoted_price ? `${Number(r.quoted_price).toLocaleString('fr-TN')} TND` : 'Envoyée'}
                              </span>
                            : <span style={{ color:'var(--g300)', fontSize:12 }}>—</span>
                          }
                        </td>
                        <td><Badge s={r.status}/></td>
                        <td onClick={e=>e.stopPropagation()}>
                          <div style={{ display:'flex', gap:6 }}>
                            <select value={r.status} onChange={e=>handleStatusChange(r.id,e.target.value)}
                              style={{ padding:'5px 8px', borderRadius:7, border:'1.5px solid var(--g200)', fontSize:12, fontFamily:'inherit', cursor:'pointer', background:'#fff', outline:'none' }}>
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmer</option>
                              <option value="completed">Terminer</option>
                              <option value="cancelled" disabled={!isMain} style={{ color:!isMain?'#ccc':undefined }}>
                                {isMain?'Annuler':'Annuler 🔒'}
                              </option>
                            </select>
                            <button className="al-action-btn al-action-btn--delete" onClick={() => handleDelete(r.id)}
                              title={isMain?'Supprimer':'Réservé à l\'administrateur principal'}
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
          <div className="al-table-footer"><p className="al-count">{filtered.length} demande{filtered.length!==1?'s':''}{(search||filterStatus!=='all')?` sur ${trips.length} au total`:''}</p></div>
        </div>

        {selected && (
          <div style={{ margin:'0 32px 0 16px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <DetailPanel req={selected} onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange} onSendQuote={handleSendQuote} isMain={isMain}/>
          </div>
        )}
      </div>

      {!selected && !loading && filtered.length>0 && (
        <div style={{ margin:'-20px 32px 0', padding:'14px 20px', borderRadius:12, background:'var(--g50)', border:'1px dashed var(--g200)', textAlign:'center', fontSize:13, color:'var(--g400)' }}>
          👆 Cliquez sur une ligne pour voir les détails et envoyer une offre
        </div>
      )}
    </AdminLayout>
  );
};

export default SurMesureAdmin;