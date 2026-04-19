// src/pages/admin/flight/FlightReservations.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_RES = 'http://localhost:5000/api/flights/reservations';

// ── Constants ──────────────────────────────────────────────────
const STATUS_MAP = {
  pending:   { label: 'En attente', bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  confirmed: { label: 'Confirmée',  bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  cancelled: { label: 'Annulée',    bg: '#fee2e2', color: '#991b1b', dot: '#E92F64' },
  completed: { label: 'Terminée',   bg: '#e0fbfc', color: '#0e7490', dot: '#0e7490' },
};

const CABIN_LABELS = {
  economy: 'Économique', premium_economy: 'Premium Éco',
  business: 'Affaires',  first: 'Première',
};

const fDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR')  : '—';
const fDT    = (d) => d ? new Date(d).toLocaleString('fr-FR')      : '—';
const fPrice = (p) => p != null ? `${Number(p).toLocaleString('fr-TN', { minimumFractionDigits:2 })} TND` : '—';
const fTime  = (d) => d ? new Date(d).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '—';

const parsePax = (passengers) => {
  try {
    const arr = typeof passengers === 'string' ? JSON.parse(passengers) : passengers;
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
};

// ── Sub-components ─────────────────────────────────────────────
const StatusBadge = ({ s }) => {
  const m = STATUS_MAP[s] || { label:s, bg:'var(--g100)', color:'var(--g600)', dot:'var(--g400)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:m.dot, flexShrink:0 }}/>
      {m.label}
    </span>
  );
};

const PaymentCell = ({ method, status }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600,
      background:method==='online'?'#eff6ff':'#fff7ed', color:method==='online'?'#1d4ed8':'#c2410c' }}>
      {method==='online'?'💳 En ligne':'🏪 Agence'}
    </span>
    {status==='paid' && <span style={{ fontSize:10, fontWeight:700, color:'#065f46', paddingLeft:2 }}>✓ Payé</span>}
  </div>
);

// ── Detail Panel ───────────────────────────────────────────────
const ResDetail = ({ res, onClose, onStatusChange, isMain }) => {
  if (!res) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:32, textAlign:'center' }}>
      <p style={{ fontSize:14, fontWeight:600, color:'var(--g400)', lineHeight:1.6 }}>
        Cliquez sur une réservation<br/>pour voir les détails
      </p>
    </div>
  );

  const isAgencyPending = res.payment_method === 'agency' && res.status === 'pending';
  const pax = parsePax(res.passengers);

  const Section = ({ title, children }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', paddingBottom:8, borderBottom:'1px solid var(--g100)' }}>{title}</p>
      {children}
    </div>
  );

  const Item = ({ label, value }) => !value ? null : (
    <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
      <span style={{ fontSize:10, fontWeight:600, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:500, color:'var(--g700)' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'flex-start', gap:14, flexShrink:0 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
          ✈️
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:800, fontSize:16, color:'var(--g900)' }}>{res.origin_iata||'?'} → {res.destination_iata||'?'}</p>
          <p style={{ fontSize:12, color:'var(--g400)', marginTop:3 }}>#{res.id} · {res.airline_name||'Compagnie inconnue'}</p>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid var(--g200)', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
      </div>

      {isAgencyPending && (
        <div style={{ margin:'12px 20px 0', padding:'12px 16px', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>🏪</span>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#c2410c' }}>Paiement à l'agence — En attente</p>
            <p style={{ fontSize:11, color:'#92400e', marginTop:2 }}>Confirmez après réception du paiement.</p>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'18px 20px', display:'flex', flexDirection:'column', gap:20 }}>
        <Section title="Itinéraire">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Item label="Origine"   value={res.origin_iata}/>
            <Item label="Destination" value={res.destination_iata}/>
            <Item label="Départ"    value={fDT(res.departing_at)}/>
            <Item label="Arrivée"   value={fDT(res.arriving_at)}/>
            <Item label="Compagnie" value={res.airline_name}/>
            <Item label="Vol"       value={res.flight_number}/>
            <Item label="Classe"    value={CABIN_LABELS[res.cabin_class]||res.cabin_class}/>
          </div>
        </Section>

        {pax.length > 0 && (
          <Section title={`Passagers (${pax.length})`}>
            {pax.map((p, i) => (
              <div key={i} style={{ padding:'8px 12px', background:'var(--g50)', borderRadius:8, fontSize:13, color:'var(--g700)', display:'flex', justifyContent:'space-between' }}>
                <span>{p.given_name} {p.family_name}</span>
                <span style={{ fontSize:11, color:'var(--g400)' }}>{p.email||''}</span>
              </div>
            ))}
          </Section>
        )}

        {/* Client info from JOIN */}
        {(res.client_first_name || res.client_email) && (
          <Section title="Client">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Item label="Nom"   value={`${res.client_first_name||''} ${res.client_last_name||''}`.trim()}/>
              <Item label="Email" value={res.client_email}/>
              <Item label="Tél."  value={res.client_phone}/>
            </div>
          </Section>
        )}

        <Section title="Paiement">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Item label="Total"  value={fPrice(res.total_price)}/>
            <Item label="Devise" value={res.currency}/>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginTop:4 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:600,
              background:res.payment_method==='online'?'#eff6ff':'#fff7ed', color:res.payment_method==='online'?'#1d4ed8':'#c2410c' }}>
              {res.payment_method==='online'?'💳 Paiement en ligne':"🏪 Paiement à l'agence"}
            </span>
            {res.payment_status==='paid' && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:8, background:'#d1fae5', color:'#065f46', fontSize:12, fontWeight:700 }}>✓ Payé</span>
            )}
          </div>
        </Section>

        <Section title="Changer le statut">
          {!isMain && (
            <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, fontSize:12, color:'#991b1b', marginBottom:8 }}>
              🔒 L'annulation est réservée à l'administrateur principal.
            </div>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {Object.entries(STATUS_MAP).map(([key, meta]) => {
              const blocked = key === 'cancelled' && !isMain;
              return (
                <button key={key}
                  onClick={() => !blocked && onStatusChange(res.id, key)}
                  style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:8,
                    border:`1.5px solid ${res.status===key?meta.color:'var(--g200)'}`,
                    background:res.status===key?meta.bg:'#fff',
                    fontSize:12, fontWeight:600,
                    cursor:blocked?'not-allowed':'pointer',
                    opacity:blocked?0.4:1,
                    fontFamily:'inherit', color:res.status===key?meta.color:'var(--g600)',
                  }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:meta.dot }}/>
                  {meta.label} {blocked&&'🔒'}
                </button>
              );
            })}
          </div>
        </Section>

        {res.notes && (
          <Section title="Remarques">
            <p style={{ fontSize:13, color:'var(--g600)', lineHeight:1.6, background:'var(--g50)', padding:'10px 14px', borderRadius:8 }}>{res.notes}</p>
          </Section>
        )}

        <div style={{ padding:'12px 14px', background:'var(--g50)', borderRadius:10, fontSize:11, color:'var(--g400)' }}>
          <p>Réservée le {fDT(res.created_at)}</p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════
const FlightReservations = () => {
  const [reservations,  setReservations]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState('');   // ← new: surfaces API errors
  const [toast,         setToast]         = useState(null);
  const [selectedRes,   setSelectedRes]   = useState(null);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search,        setSearch]        = useState('');

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const getAdminToken = () => localStorage.getItem('adminToken') || '';

  const notify = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReservations = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const token = getAdminToken();
      const r = await fetch(API_RES, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ── BUG FIX: parse the response and check success flag ────────
      // Previously: just did j.data || [] — silently showed empty when auth failed
      const j = await r.json();

      if (!r.ok || !j.success) {
        // Surface the real error (e.g. "Token invalide ou expiré")
        setFetchError(j.message || `Erreur ${r.status}`);
        setReservations([]);
        return;
      }

      setReservations(j.data || []);
    } catch (err) {
      setFetchError('Impossible de joindre le serveur. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleStatusChange = async (id, status) => {
    if (status === 'cancelled' && !isMain) {
      notify("❌ Seul l'administrateur principal peut annuler", 'error');
      return;
    }
    try {
      const r = await fetch(`${API_RES}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${getAdminToken()}` },
        body: JSON.stringify({ status }),
      });
      const j = await r.json();
      if (j.success) {
        notify(`Statut mis à jour : ${STATUS_MAP[status]?.label}`);
        fetchReservations();
        if (selectedRes?.id === id) setSelectedRes(p => ({ ...p, status }));
      } else {
        notify(j.message || 'Erreur', 'error');
      }
    } catch {
      notify('Erreur réseau', 'error');
    }
  };

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = reservations.filter(r => {
    const q   = search.toLowerCase();
    const pax = parsePax(r.passengers);
    const paxStr = pax.map(p => `${p.given_name||''} ${p.family_name||''}`).join(' ').toLowerCase();
    return (
      (!search || paxStr.includes(q) ||
        (r.origin_iata||'').toLowerCase().includes(q) ||
        (r.destination_iata||'').toLowerCase().includes(q) ||
        (r.airline_name||'').toLowerCase().includes(q) ||
        (r.client_email||'').toLowerCase().includes(q)) &&
      (filterStatus  === 'all' || r.status         === filterStatus) &&
      (filterPayment === 'all' || r.payment_method === filterPayment)
    );
  });

  // ── Stats ─────────────────────────────────────────────────────
  const stats = {
    total:         reservations.length,
    pending:       reservations.filter(r => r.status === 'pending').length,
    confirmed:     reservations.filter(r => r.status === 'confirmed').length,
    agencyPending: reservations.filter(r => r.payment_method === 'agency' && r.status === 'pending').length,
    revenue:       reservations.filter(r => r.payment_status === 'paid')
                    .reduce((s, r) => s + parseFloat(r.total_price || 0), 0),
  };

  return (
    <AdminLayout
      title="Réservations Vols"
      breadcrumb={[{ label:'Vols' }, { label:'Réservations', active:true }]}
      actions={
        <button className="al-btn al-btn--ghost" onClick={fetchReservations}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Actualiser
        </button>
      }
      toast={toast}
    >
      {/* ── Stats ── */}
      <div className="al-stats">
        {[
          { label:'Total réservations', value:stats.total,     color:'blue',   icon:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
          { label:'En attente',         value:stats.pending,   color:'orange', icon:<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
          { label:'Confirmées',         value:stats.confirmed, color:'green',  icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
          { label:'CA encaissé (TND)',   value:stats.revenue.toLocaleString('fr-TN',{maximumFractionDigits:0}), color:'purple', icon:<><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg>
            </div>
            <div>
              <p className="al-stat__value">{s.value}</p>
              <p className="al-stat__label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Auth / fetch error banner ── */}
      {fetchError && (
        <div style={{ margin:'0 32px 16px', padding:'16px 20px', background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>⚠️</span>
          <div>
            <p style={{ fontWeight:700, fontSize:14, color:'#991b1b' }}>Erreur de chargement</p>
            <p style={{ fontSize:13, color:'#7f1d1d', marginTop:4 }}>
              {fetchError === 'Token invalide ou expiré' || fetchError.includes('Token')
                ? '🔒 Votre session admin a expiré. Veuillez vous déconnecter et vous reconnecter.'
                : fetchError}
            </p>
            {(fetchError.includes('Token') || fetchError.includes('session')) && (
              <button onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('admin'); window.location.href = '/admin/login'; }}
                style={{ marginTop:10, padding:'7px 16px', borderRadius:8, border:'none', background:'#991b1b', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Se reconnecter →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Agency pending alert ── */}
      {stats.agencyPending > 0 && (
        <div style={{ margin:'0 32px 16px', padding:'14px 20px', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>🏪</span>
          <div>
            <p style={{ fontWeight:700, fontSize:14, color:'#c2410c' }}>
              {stats.agencyPending} réservation{stats.agencyPending>1?'s':''} en attente de paiement à l'agence
            </p>
            <p style={{ fontSize:12, color:'#92400e', marginTop:2 }}>Confirmez après réception du paiement.</p>
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div style={{ display:'grid', gridTemplateColumns:selectedRes?'1fr 380px':'1fr', gap:0, margin:'0 0 32px', transition:'grid-template-columns .3s' }}>

        {/* Table */}
        <div style={{ margin:'0 0 0 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

          {/* Toolbar */}
          <div className="al-toolbar" style={{ flexWrap:'wrap', gap:10 }}>
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Passager, IATA, compagnie, email…" value={search} onChange={e => setSearch(e.target.value)}/>
              {search && <button className="al-search__clear" onClick={()=>setSearch('')}>✕</button>}
            </div>
            <div className="al-filter-tabs">
              {[{v:'all',l:'Tous paiements'},{v:'online',l:'💳 En ligne'},{v:'agency',l:'🏪 Agence'}].map(({v,l}) => (
                <button key={v} className={`al-filter-tab ${filterPayment===v?'active':''}`} onClick={()=>setFilterPayment(v)}>
                  {l} <span className="al-filter-tab__count">{v==='all'?reservations.length:reservations.filter(r=>r.payment_method===v).length}</span>
                </button>
              ))}
            </div>
            <div className="al-filter-tabs">
              {[{v:'all',l:'Tous'},{v:'pending',l:'⏳ Attente'},{v:'confirmed',l:'✅ Confirmées'},{v:'completed',l:'🏁 Terminées'},{v:'cancelled',l:'❌ Annulées'}].map(({v,l}) => (
                <button key={v} className={`al-filter-tab ${filterStatus===v?'active':''}`} onClick={()=>setFilterStatus(v)}>
                  {l} <span className="al-filter-tab__count">{v==='all'?reservations.length:reservations.filter(r=>r.status===v).length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner"/></div>
              <p style={{ fontSize:13, color:'var(--g400)' }}>Chargement…</p>
            </div>
          ) : fetchError ? (
            <div className="al-empty">
              <div className="al-empty__icon">🔒</div>
              <p className="al-empty__title">Accès refusé</p>
              <p className="al-empty__sub">Reconnectez-vous au panneau admin.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <p className="al-empty__title">{reservations.length===0?'Aucune réservation de vol':'Aucun résultat'}</p>
              <p className="al-empty__sub">{reservations.length===0?'Les réservations apparaîtront ici automatiquement.':'Modifiez vos filtres.'}</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Vol</th>
                    <th>Passager(s)</th>
                    <th>Client</th>
                    <th>Départ</th>
                    <th>Compagnie</th>
                    <th>Prix</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th>Action rapide</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const isSel = selectedRes?.id === r.id;
                    const isAgencyPending = r.payment_method==='agency' && r.status==='pending';
                    const pax = parsePax(r.passengers);
                    const firstPax = pax[0];
                    return (
                      <tr key={r.id} className="al-row"
                        style={{ cursor:'pointer', background:isSel?'#e0fbfc':isAgencyPending?'#fffbf5':undefined }}
                        onClick={() => setSelectedRes(isSel?null:r)}>

                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>✈️</div>
                            <div>
                              <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>{r.origin_iata} → {r.destination_iata}</p>
                              <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{CABIN_LABELS[r.cabin_class]||r.cabin_class}</p>
                            </div>
                          </div>
                        </td>

                        <td>
                          {firstPax ? (
                            <>
                              <p style={{ fontWeight:600, fontSize:13, color:'var(--g800)' }}>{firstPax.given_name} {firstPax.family_name}</p>
                              {pax.length>1 && <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>+ {pax.length-1} autre{pax.length>2?'s':''}</p>}
                            </>
                          ) : <span style={{ fontSize:12, color:'var(--g400)' }}>—</span>}
                        </td>

                        <td>
                          {r.client_email ? (
                            <>
                              <p style={{ fontSize:12, color:'var(--g700)', fontWeight:600 }}>{r.client_first_name} {r.client_last_name}</p>
                              <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{r.client_email}</p>
                            </>
                          ) : <span style={{ fontSize:11, color:'var(--g400)' }}>Guest</span>}
                        </td>

                        <td>
                          <p style={{ fontSize:13, fontWeight:600 }}>{fDate(r.departing_at)}</p>
                          <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{fTime(r.departing_at)}</p>
                        </td>

                        <td>
                          <span style={{ fontSize:12, fontWeight:600, color:'var(--g700)' }}>{r.airline_name||'—'}</span>
                          {r.flight_number && <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{r.flight_number}</p>}
                        </td>

                        <td><span style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{fPrice(r.total_price)}</span></td>
                        <td><PaymentCell method={r.payment_method} status={r.payment_status}/></td>
                        <td><StatusBadge s={r.status}/></td>

                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                            {isAgencyPending && (
                              <button onClick={() => handleStatusChange(r.id, 'confirmed')}
                                style={{ padding:'4px 10px', borderRadius:7, border:'1.5px solid #10b981', background:'#d1fae5', color:'#065f46', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                                ✅ Confirmer
                              </button>
                            )}
                            <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)}
                              style={{ padding:'5px 8px', borderRadius:7, border:'1.5px solid var(--g200)', fontSize:12, fontFamily:'inherit', cursor:'pointer', background:'#fff', outline:'none' }}>
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmer</option>
                              <option value="completed">Terminer</option>
                              <option value="cancelled" disabled={!isMain} style={{ color:!isMain?'#ccc':undefined }}>
                                {isMain?'Annuler':'Annuler 🔒'}
                              </option>
                            </select>
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
            <p className="al-count">
              {filtered.length} réservation{filtered.length!==1?'s':''}
              {(search||filterStatus!=='all'||filterPayment!=='all') ? ` sur ${reservations.length} au total` : ''}
            </p>
          </div>
        </div>

        {/* Detail panel */}
        {selectedRes && (
          <div style={{ margin:'0 32px 0 16px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <ResDetail res={selectedRes} onClose={()=>setSelectedRes(null)} onStatusChange={handleStatusChange} isMain={isMain}/>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FlightReservations;