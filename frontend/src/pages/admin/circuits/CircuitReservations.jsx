// src/pages/admin/Circuits/CircuitReservations.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_RES = 'http://localhost:5000/api/circuit-reservations';
const STATUS_MAP = {
  pending:   { label:'En attente', bg:'#fff7ed', color:'#c2410c', dot:'#f97316' },
  confirmed: { label:'Confirmée',  bg:'#d1fae5', color:'#065f46', dot:'#10b981' },
  cancelled: { label:'Annulée',    bg:'#fee2e2', color:'#991b1b', dot:'#E92F64' },
  completed: { label:'Terminée',   bg:'#e0fbfc', color:'#0e7490', dot:'#0e7490' },
};
const fDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT    = (d) => d ? new Date(d).toLocaleString('fr-FR') : '—';
const fPrice = (p) => p ? Number(p).toLocaleString('fr-TN') + ' DT' : '—';

const StatusBadge = ({ s }) => {
  const m = STATUS_MAP[s] || { label:s, bg:'var(--g100)', color:'var(--g600)', dot:'var(--g400)' };
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:m.bg, color:m.color, whiteSpace:'nowrap' }}><span style={{ width:6, height:6, borderRadius:'50%', background:m.dot, flexShrink:0 }}/>{m.label}</span>;
};

const PaymentCell = ({ method, status }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600, background:method==='online'?'#eff6ff':'#fff7ed', color:method==='online'?'#1d4ed8':'#c2410c' }}>
      {method==='online' ? '💳 En ligne' : '🏪 Agence'}
    </span>
    {status==='completed' && <span style={{ fontSize:10, fontWeight:700, color:'#065f46', paddingLeft:2 }}>✓ Payé</span>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   DETAIL PANEL
   ══════════════════════════════════════════════════════════════ */
const ResDetail = ({ res, onClose, onStatusChange, isMain }) => {
  if (!res) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, height:'100%', padding:32, textAlign:'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--g300)" strokeWidth="1" style={{ width:56, height:56 }}><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>
      <p style={{ fontSize:14, fontWeight:600, color:'var(--g400)', lineHeight:1.6 }}>Cliquez sur une réservation<br/>pour voir les détails</p>
    </div>
  );

  const isAgencyPending = res.payment_method==='agency' && res.status==='pending';

  const Section = ({ title, children }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', paddingBottom:8, borderBottom:'1px solid var(--g100)' }}>{title}</p>
      {children}
    </div>
  );

  const Item = ({ label, value, full }) => !value ? null : (
    <div style={{ display:'flex', flexDirection:'column', gap:3, gridColumn:full?'1 / -1':undefined }}>
      <span style={{ fontSize:10, fontWeight:600, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:500, color:'var(--g700)' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'flex-start', gap:14, flexShrink:0 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:20 }}>{res.region==='nord'?'🏛️':'🏜️'}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:800, fontSize:16, color:'var(--g900)' }}>{res.first_name} {res.last_name}</p>
          <p style={{ fontSize:12, color:'var(--g400)', marginTop:3 }}>#{res.id} · {res.circuit_title||'Circuit supprimé'}</p>
        </div>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid var(--g200)', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2" style={{ width:14, height:14 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
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

      <div style={{ flex:1, overflowY:'auto', padding:'18px 20px', display:'flex', flexDirection:'column', gap:20 }}>
        <Section title="Contact client">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Item label="Prénom" value={res.first_name}/><Item label="Nom" value={res.last_name}/>
            <Item label="Email" value={res.email} full/><Item label="Téléphone" value={res.phone}/>
          </div>
        </Section>
        <Section title="Circuit">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <Item label="Circuit" value={res.circuit_title} full/>
            <Item label="Chambre" value={res.chambre_type}/>
            <Item label="Participants" value={`${res.number_of_persons} personne${res.number_of_persons>1?'s':''}`}/>
            <Item label="Total" value={fPrice(res.total_price)}/>
          </div>
        </Section>
        <Section title="Paiement">
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:res.payment_method==='online'?'#eff6ff':'#fff7ed', color:res.payment_method==='online'?'#1d4ed8':'#c2410c', fontSize:12, fontWeight:600 }}>
              {res.payment_method==='online'?'💳 Paiement en ligne':"🏪 Paiement à l'agence"}
            </span>
            {res.status==='completed' && <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:8, background:'#d1fae5', color:'#065f46', fontSize:12, fontWeight:700 }}>✓ Payé</span>}
          </div>
        </Section>

        {/* ── Changer le statut ── */}
        <Section title="Changer le statut">
          {isAgencyPending && (
            <div style={{ padding:'10px 14px', background:'#fff7ed', borderRadius:8, fontSize:12, color:'#92400e', marginBottom:8, lineHeight:1.5 }}>
              ⚠️ Cliquez sur <strong>Confirmée</strong> après paiement.
            </div>
          )}
          {!isMain && (
            <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, fontSize:12, color:'#991b1b', marginBottom:8 }}>
              🔒 L'annulation est réservée à l'administrateur principal.
            </div>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {Object.entries(STATUS_MAP).map(([key, meta]) => {
              const isCancel = key === 'cancelled';
              const blocked  = isCancel && !isMain;
              return (
                <button key={key}
                  onClick={() => onStatusChange(res.id, key)}
                  title={blocked ? 'Réservé à l\'administrateur principal' : ''}
                  style={{
                    display:'flex', alignItems:'center', gap:7,
                    padding:'7px 14px', borderRadius:8,
                    border:`1.5px solid ${res.status===key?meta.color:'var(--g200)'}`,
                    background: res.status===key ? meta.bg : '#fff',
                    fontSize:12, fontWeight:600,
                    cursor: blocked ? 'not-allowed' : 'pointer',
                    opacity: blocked ? 0.4 : 1,
                    fontFamily:'inherit',
                    color: res.status===key ? meta.color : 'var(--g600)',
                    transition:'all .2s',
                  }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:meta.dot }}/>
                  {meta.label} {blocked && '🔒'}
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

/* ══════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════ */
const CircuitReservations = () => {
  const [reservations,  setReservations]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null);
  const [selectedRes,   setSelectedRes]   = useState(null);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search,        setSearch]        = useState('');

  // ── Role check ────────────────────────────────────────────────
  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchReservations = async () => {
    try { setLoading(true); const r = await fetch(API_RES); const j = await r.json(); setReservations(j.data || []); }
    catch { notify('Impossible de charger', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); }, []);

  // ── Status change guarded for cancel ──────────────────────────
  const handleStatusChange = async (id, status) => {
    if (status === 'cancelled' && !isMain) {
      notify('❌ Seul l\'administrateur principal peut annuler une réservation', 'error');
      return;
    }
    try {
      const r = await fetch(`${API_RES}/${id}/status`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ status }) });
      const j = await r.json();
      if (j.success) {
        notify(`Statut : ${STATUS_MAP[status]?.label}`);
        fetchReservations();
        if (selectedRes?.id===id) setSelectedRes(p => ({ ...p, status }));
      } else notify('Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase();
    return (!search || (r.first_name||'').toLowerCase().includes(q) || (r.last_name||'').toLowerCase().includes(q) || (r.email||'').toLowerCase().includes(q))
      && (filterStatus==='all' || r.status===filterStatus)
      && (filterPayment==='all' || r.payment_method===filterPayment);
  });

  const stats = {
    total:         reservations.length,
    pending:       reservations.filter(r => r.status==='pending').length,
    confirmed:     reservations.filter(r => r.status==='confirmed').length,
    agencyPending: reservations.filter(r => r.payment_method==='agency' && r.status==='pending').length,
  };

  return (
    <AdminLayout title="Réservations Circuits"
      breadcrumb={[{ label:'Circuits' },{ label:'Réservations', active:true }]}
      actions={<button className="al-btn al-btn--ghost" onClick={fetchReservations}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>Actualiser</button>}
      toast={toast}>

      <div className="al-stats">
        {[
          { label:'Total',      value:stats.total,     color:'blue',   icon:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
          { label:'En attente', value:stats.pending,   color:'orange', icon:<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
          { label:'Confirmées', value:stats.confirmed, color:'green',  icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {stats.agencyPending > 0 && (
        <div style={{ margin:'0 32px 16px', padding:'14px 20px', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>🏪</span>
          <div>
            <p style={{ fontWeight:700, fontSize:14, color:'#c2410c' }}>{stats.agencyPending} réservation{stats.agencyPending>1?'s':''} en attente de paiement à l'agence</p>
            <p style={{ fontSize:12, color:'#92400e', marginTop:2 }}>Confirmez après réception du paiement.</p>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:selectedRes?'1fr 380px':'1fr', gap:0, margin:'0 0 32px', transition:'grid-template-columns .3s' }}>
        <div style={{ margin:'0 0 0 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

          <div className="al-toolbar" style={{ flexWrap:'wrap', gap:10 }}>
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && <button className="al-search__clear" onClick={()=>setSearch('')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
            </div>
            <div className="al-filter-tabs">
              {[{v:'all',l:'Tous paiements'},{v:'online',l:'💳 En ligne'},{v:'agency',l:'🏪 Agence'}].map(({v,l}) => (
                <button key={v} className={`al-filter-tab ${filterPayment===v?'active':''}`} onClick={()=>setFilterPayment(v)}>{l}<span className="al-filter-tab__count">{v==='all'?reservations.length:reservations.filter(r=>r.payment_method===v).length}</span></button>
              ))}
            </div>
            <div className="al-filter-tabs">
              {[{v:'all',l:'Tous'},{v:'pending',l:'⏳ Attente'},{v:'confirmed',l:'✅ Confirmées'},{v:'completed',l:'🏁 Terminées'},{v:'cancelled',l:'❌ Annulées'}].map(({v,l}) => (
                <button key={v} className={`al-filter-tab ${filterStatus===v?'active':''}`} onClick={()=>setFilterStatus(v)}>{l}<span className="al-filter-tab__count">{v==='all'?reservations.length:reservations.filter(r=>r.status===v).length}</span></button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
          ) : filtered.length === 0 ? (
            <div className="al-empty"><div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div><p className="al-empty__title">Aucune réservation</p><p className="al-empty__sub">Modifiez vos filtres.</p></div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead><tr><th>Client</th><th>Circuit</th><th>Pers.</th><th>Total</th><th>Paiement</th><th>Statut</th><th>Date</th><th>Action rapide</th></tr></thead>
                <tbody>
                  {filtered.map(r => {
                    const isSel = selectedRes?.id===r.id;
                    const isAgencyPending = r.payment_method==='agency' && r.status==='pending';
                    return (
                      <tr key={r.id} className="al-row" style={{ cursor:'pointer', background:isSel?'#e0fbfc':isAgencyPending?'#fffbf5':undefined }} onClick={()=>setSelectedRes(isSel?null:r)}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:12, fontWeight:700, color:'#fff' }}>
                              {(r.first_name?.[0]||'?').toUpperCase()}{(r.last_name?.[0]||'').toUpperCase()}
                            </div>
                            <div><p style={{ fontWeight:600, fontSize:13, color:'var(--g800)' }}>{r.first_name} {r.last_name}</p><p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{r.email}</p></div>
                          </div>
                        </td>
                        <td><span style={{ fontSize:12, fontWeight:600, color:'var(--g700)' }}>{r.circuit_title||'—'}</span><p style={{ fontSize:10, color:'var(--g400)', marginTop:2 }}>{r.region==='nord'?'🏛️ Nord':'🏜️ Sud'}</p></td>
                        <td><p style={{ fontSize:13, fontWeight:600 }}>{r.number_of_persons} pers.</p><p style={{ fontSize:11, color:'var(--g400)', marginTop:2, textTransform:'capitalize' }}>{r.chambre_type}</p></td>
                        <td><span style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{fPrice(r.total_price)}</span></td>
                        <td><PaymentCell method={r.payment_method} status={r.status}/></td>
                        <td><StatusBadge s={r.status}/></td>
                        <td><span style={{ fontSize:12, color:'var(--g500)' }}>{fDate(r.created_at)}</span></td>
                        <td onClick={e=>e.stopPropagation()}>
                          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                            {isAgencyPending && (
                              <button onClick={()=>handleStatusChange(r.id,'confirmed')} style={{ padding:'4px 10px', borderRadius:7, border:'1.5px solid #10b981', background:'#d1fae5', color:'#065f46', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>✅ Confirmer</button>
                            )}
                            {/* ── Status select: cancelled disabled for non-main ── */}
                            <select value={r.status} onChange={e=>handleStatusChange(r.id,e.target.value)} style={{ padding:'5px 8px', borderRadius:7, border:'1.5px solid var(--g200)', fontSize:12, fontFamily:'inherit', cursor:'pointer', background:'#fff', outline:'none' }}>
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmer</option>
                              <option value="completed">Terminer</option>
                              <option value="cancelled" disabled={!isMain} style={{ color:!isMain?'#ccc':undefined }}>
                                {isMain ? 'Annuler' : 'Annuler 🔒'}
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
          <div className="al-table-footer"><p className="al-count">{filtered.length} réservation{filtered.length!==1?'s':''}{(search||filterStatus!=='all'||filterPayment!=='all')?` sur ${reservations.length} au total`:''}</p></div>
        </div>

        {selectedRes && (
          <div style={{ margin:'0 32px 0 16px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <ResDetail
              res={selectedRes}
              onClose={()=>setSelectedRes(null)}
              onStatusChange={handleStatusChange}
              isMain={isMain}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CircuitReservations;