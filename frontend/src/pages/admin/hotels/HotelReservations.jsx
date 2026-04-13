// src/pages/admin/hotels/HotelReservations.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API = 'http://localhost:5000/api/hotels';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
};
const fmtDay = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
};
const fmtPrice = (amount, currency='TND') =>
  `${parseFloat(amount||0).toLocaleString('fr-FR',{minimumFractionDigits:2})} ${currency}`;

const STATUS_CONFIG = {
  pending:   { label:'En attente', color:'#b45309', bg:'#fff8e1', border:'#fde68a' },
  confirmed: { label:'Confirmée',  color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  cancelled: { label:'Annulée',    color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
  completed: { label:'Terminée',   color:'#0369a1', bg:'#f0f9ff', border:'#bae6fd' },
};
const PAYMENT_CONFIG = {
  pending:  { label:'En attente', color:'#b45309', bg:'#fff8e1', border:'#fde68a' },
  paid:     { label:'Payé',       color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  refunded: { label:'Remboursé',  color:'#7c3aed', bg:'#f5f3ff', border:'#e9d5ff' },
};

const Badge = ({ val, map }) => {
  const cfg = map[val] || { label:val, color:'#64748b', bg:'#f8fafc', border:'#e2e8f0' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px',
      borderRadius:20, fontSize:11, fontWeight:700,
      color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
};

// ── Detail drawer ──────────────────────────────────────────────
const DetailDrawer = ({ reservation: r, onClose, onStatusChange }) => {
  const [status,  setStatus]  = useState(r.status);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const handleSave = async () => {
    if (status === r.status) return onClose();
    setSaving(true); setErr('');
    try {
      const res  = await fetch(`${API}/reservations/${r.id}/status`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onStatusChange(r.id, status);
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const roomsPax = (() => {
    try { return typeof r.rooms_pax === 'string' ? JSON.parse(r.rooms_pax) : (r.rooms_pax || []); }
    catch { return []; }
  })();

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex' }}>
      <div onClick={onClose} style={{ flex:1, background:'rgba(0,0,0,0.45)' }} />
      <div style={{ width:520, background:'#fff', overflowY:'auto',
        boxShadow:'-8px 0 32px rgba(0,0,0,0.12)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#0a2832,#0f3460)',
          padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.55)', textTransform:'uppercase',
              letterSpacing:'.08em', marginBottom:4 }}>Réservation #{r.id}</div>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>🏨 Détail de la réservation</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.15)', border:'none',
            borderRadius:8, width:32, height:32, cursor:'pointer', color:'#fff', fontSize:18 }}>×</button>
        </div>

        <div style={{ flex:1, padding:24, display:'flex', flexDirection:'column', gap:20 }}>

          {/* Statuses */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ background:'#f8fafc', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Statut</div>
              <Badge val={r.status} map={STATUS_CONFIG} />
            </div>
            <div style={{ background:'#f8fafc', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Paiement</div>
              <Badge val={r.payment_status} map={PAYMENT_CONFIG} />
            </div>
          </div>

          {/* Hotel info */}
          <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:12, padding:'16px 18px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#0369a1', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Hôtel</div>
            {[
              { label:'Nom',       value:r.hotel_name },
              { label:'Destination', value:r.destination_code },
              { label:'Arrivée',   value:fmtDay(r.check_in) },
              { label:'Départ',    value:fmtDay(r.check_out) },
              { label:'Voyageurs', value:`${r.adults} adulte${r.adults>1?'s':''}${r.children>0?` + ${r.children} enfant${r.children>1?'s':''}`:''}` },
              { label:'Prix total', value:fmtPrice(r.total_price, r.currency||'TND') },
              { label:'Réf. Hotelbeds', value:r.hotelbeds_reference || '—' },
            ].map((row,i,arr) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between',
                padding:'6px 0', borderBottom:i<arr.length-1?'1px dashed #e0f2fe':'none', fontSize:13 }}>
                <span style={{ color:'#0369a1', fontWeight:600 }}>{row.label}</span>
                <span style={{ color:'#0a2832', fontWeight:700 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Holder */}
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 18px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Titulaire</div>
            {[
              { label:'Nom',      value:`${r.holder_first_name} ${r.holder_last_name}` },
              { label:'Email',    value:r.holder_email  || '—' },
              { label:'Téléphone', value:r.holder_phone || '—' },
            ].map((row,i,arr) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between',
                padding:'6px 0', borderBottom:i<arr.length-1?'1px dashed #f1f5f9':'none', fontSize:13 }}>
                <span style={{ color:'#64748b', fontWeight:600 }}>{row.label}</span>
                <span style={{ color:'#0a2832', fontWeight:700 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Rooms pax */}
          {roomsPax.length > 0 && (
            <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Voyageurs</div>
              {roomsPax.map((room, ri) => (
                <div key={ri} style={{ marginBottom: ri < roomsPax.length-1 ? 10 : 0 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'var(--secondary,#e67e22)', margin:'0 0 6px' }}>
                    Chambre {ri+1}
                  </p>
                  {room.paxes?.map((pax, pi) => (
                    <div key={pi} style={{ fontSize:12, color:'#64748b', padding:'4px 8px',
                      background:'#fff', borderRadius:6, marginBottom:3 }}>
                      {pax.type==='AD'?'👤':'🧒'} {pax.name} {pax.surname}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Change status */}
          <div style={{ background:'#fff8e1', border:'1px solid #fde68a', borderRadius:12, padding:'16px 18px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#b45309', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Modifier le statut</div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #fde68a',
                fontSize:13, fontWeight:600, background:'#fff', marginBottom:10 }}>
              {Object.entries(STATUS_CONFIG).map(([val,cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>
            {err && <div style={{ color:'#dc2626', fontSize:12, marginBottom:8 }}>⚠️ {err}</div>}
            <button onClick={handleSave} disabled={saving}
              style={{ width:'100%', padding:'11px', borderRadius:8, border:'none',
                background: saving ? '#94a3b8' : 'linear-gradient(135deg,var(--secondary,#e67e22),#d35400)',
                color:'#fff', fontWeight:700, fontSize:13, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '⏳ Sauvegarde…' : '✓ Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
const HotelReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected,     setSelected]     = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/reservations`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setReservations(json.data || []);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleStatusChange = (id, newStatus) => {
    setReservations(prev => prev.map(r =>
      r.id!==id ? r : {
        ...r, status:newStatus,
        payment_status: newStatus==='confirmed'?'paid':newStatus==='cancelled'?'refunded':r.payment_status,
      }
    ));
    showToast('Statut mis à jour');
  };

  const filtered = reservations.filter(r => {
    const matchStatus = filterStatus==='all' || r.status===filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.id?.toString().includes(q)
      || r.hotel_name?.toLowerCase().includes(q)
      || r.holder_first_name?.toLowerCase().includes(q)
      || r.holder_last_name?.toLowerCase().includes(q)
      || r.holder_email?.toLowerCase().includes(q)
      || r.hotelbeds_reference?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all:       reservations.length,
    pending:   reservations.filter(r=>r.status==='pending').length,
    confirmed: reservations.filter(r=>r.status==='confirmed').length,
    cancelled: reservations.filter(r=>r.status==='cancelled').length,
    completed: reservations.filter(r=>r.status==='completed').length,
  };
  const totalRevenue = reservations.filter(r=>r.status!=='cancelled').reduce((s,r)=>s+parseFloat(r.total_price||0),0);

  return (
    <AdminLayout title="Réservations d'Hôtels"
      breadcrumb={[{label:'Hôtels'},{label:'Réservations',active:true}]}
      toast={toast}>
      {selected && <DetailDrawer reservation={selected} onClose={()=>setSelected(null)} onStatusChange={handleStatusChange} />}

      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
          {[
            {label:'Total',      value:counts.all,       color:'#0369a1'},
            {label:'En attente', value:counts.pending,   color:'#b45309'},
            {label:'Confirmées', value:counts.confirmed, color:'#16a34a'},
            {label:'Terminées',  value:counts.completed, color:'#6b21a8'},
            {label:'Annulées',   value:counts.cancelled, color:'#dc2626'},
          ].map((k,i) => (
            <div key={i} style={{ background:'#fff', borderRadius:12, padding:'16px 18px',
              border:'1px solid #e2e8f0', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                letterSpacing:'.06em', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:26, fontWeight:900, color:k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Revenue banner */}
        <div style={{ background:'linear-gradient(135deg,#0a2832,#0f3460)', borderRadius:14,
          padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginBottom:4 }}>
              Chiffre d'affaires hôtels (hors annulations)
            </div>
            <div style={{ fontSize:28, fontWeight:900, color:'#fff' }}>
              {totalRevenue.toLocaleString('fr-FR',{minimumFractionDigits:2})} TND
            </div>
          </div>
          <button onClick={fetchReservations} disabled={loading}
            style={{ padding:'10px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,.25)',
              background:'rgba(255,255,255,.1)', color:'#fff', fontWeight:700, fontSize:13,
              cursor: loading?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              width="14" height="14" style={{ animation:loading?'spin 1s linear infinite':'none' }}>
              <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Actualiser
          </button>
        </div>

        {/* Filters */}
        <div style={{ background:'#fff', borderRadius:14, padding:'16px 20px',
          border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:220 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
              style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:15, height:15 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, hôtel, référence…"
              style={{ width:'100%', paddingLeft:32, paddingRight:12, height:38,
                borderRadius:8, border:'1px solid #e2e8f0', fontSize:13, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[
              {val:'all',       label:`Tous (${counts.all})`},
              {val:'pending',   label:`En attente (${counts.pending})`},
              {val:'confirmed', label:`Confirmées (${counts.confirmed})`},
              {val:'completed', label:`Terminées (${counts.completed})`},
              {val:'cancelled', label:`Annulées (${counts.cancelled})`},
            ].map(opt => (
              <button key={opt.val} onClick={() => setFilterStatus(opt.val)}
                style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer',
                  fontWeight:700, fontSize:12,
                  background: filterStatus===opt.val ? 'var(--secondary,#e67e22)' : '#f1f5f9',
                  color: filterStatus===opt.val ? '#fff' : '#475569',
                  boxShadow: filterStatus===opt.val ? '0 2px 8px rgba(230,126,34,.3)' : 'none' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <>
            <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height:64, borderRadius:10,
                  background:'linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%)',
                  backgroundSize:'200% 100%', animation:'shimmer 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          </>
        ) : error ? (
          <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12,
            padding:'20px 24px', color:'#991b1b', fontSize:14,
            display:'flex', alignItems:'center', gap:10 }}>
            <strong>Erreur :</strong> {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:14, padding:48, textAlign:'center', border:'1px solid #e2e8f0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"
              width="48" height="48" style={{ display:'block', margin:'0 auto 16px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p style={{ color:'#64748b', fontSize:15, fontWeight:600, margin:'0 0 6px' }}>Aucune réservation trouvée</p>
          </div>
        ) : (
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0',
            boxShadow:'0 1px 8px rgba(0,0,0,0.05)', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0',
              padding:'12px 20px', display:'grid',
              gridTemplateColumns:'60px 1fr 1fr 1fr 1fr 1fr 100px',
              gap:12, alignItems:'center' }}>
              {['#','Hôtel','Titulaire','Séjour','Prix','Statuts','Action'].map((h,i) => (
                <div key={i} style={{ fontSize:11, fontWeight:800, color:'#64748b',
                  textTransform:'uppercase', letterSpacing:'.06em' }}>{h}</div>
              ))}
            </div>
            {filtered.map((r, idx) => (
              <div key={r.id}
                style={{ padding:'14px 20px', display:'grid',
                  gridTemplateColumns:'60px 1fr 1fr 1fr 1fr 1fr 100px',
                  gap:12, alignItems:'center',
                  borderBottom: idx<filtered.length-1 ? '1px solid #f1f5f9' : 'none',
                  background:'#fff', transition:'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background='#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background='#fff')}>

                <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', fontFamily:'monospace' }}>#{r.id}</div>

                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#0a2832',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>
                    {r.hotel_name}
                  </div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{r.destination_code}</div>
                </div>

                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#0a2832' }}>
                    {r.holder_first_name} {r.holder_last_name}
                  </div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{r.holder_email}</div>
                </div>

                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#0a2832' }}>
                    {fmtDay(r.check_in)} →
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#0a2832' }}>
                    {fmtDay(r.check_out)}
                  </div>
                  <div style={{ fontSize:10, color:'#94a3b8', marginTop:1 }}>
                    {r.adults}A{r.children>0?` + ${r.children}E`:''} · {r.rooms||1}ch.
                  </div>
                </div>

                <div style={{ fontWeight:800, fontSize:14, color:'var(--secondary,#e67e22)' }}>
                  {fmtPrice(r.total_price, r.currency||'TND')}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <Badge val={r.status}         map={STATUS_CONFIG}  />
                  <Badge val={r.payment_status} map={PAYMENT_CONFIG} />
                </div>

                <button onClick={() => setSelected(r)}
                  style={{ padding:'7px 14px', borderRadius:8, border:'none',
                    background:'linear-gradient(135deg,var(--secondary,#e67e22),#d35400)',
                    color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer',
                    display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  Voir
                </button>
              </div>
            ))}
            <div style={{ background:'#f8fafc', borderTop:'1px solid #e2e8f0',
              padding:'12px 20px', fontSize:12, color:'#64748b' }}>
              {filtered.length} réservation{filtered.length>1?'s':''} affichée{filtered.length>1?'s':''}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
};

export default HotelReservations;