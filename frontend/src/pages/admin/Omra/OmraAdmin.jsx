// src/pages/admin/omra/OmraAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_PKG = 'http://localhost:5000/api/omra/packages';
const API_RES = 'http://localhost:5000/api/omra/reservations';

const STATUS_MAP = {
  pending:   { label: 'En attente', bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  confirmed: { label: 'Confirmée',  bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  cancelled: { label: 'Annulée',    bg: '#fee2e2', color: '#991b1b', dot: '#E92F64' },
  completed: { label: 'Terminée',   bg: '#e0fbfc', color: '#0e7490', dot: '#0e7490' },
};

const PAY_STATUS_MAP = {
  pending:  { label: 'En attente', bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  paid:     { label: 'Payé',       bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  refunded: { label: 'Remboursé',  bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
};

const fDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT    = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';
const fPrice = (p) => p ? Number(p).toLocaleString('fr-TN') + ' TND' : '—';

const Badge = ({ s, map }) => {
  const m = map[s] || { label: s, bg: 'var(--g100)', color: 'var(--g600)', dot: 'var(--g400)' };
  return (
    <span style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:999,fontSize:11,fontWeight:600,background:m.bg,color:m.color,whiteSpace:'nowrap' }}>
      <span style={{ width:6,height:6,borderRadius:'50%',background:m.dot,flexShrink:0 }}/>
      {m.label}
    </span>
  );
};

/* ── Package Modal ─────────────────────────────────────────── */
const EMPTY = { title:'',subtitle:'',description:'',image_url:'',price:'',old_price:'',duration:'',departure:'',spots:'50',badge:'',is_active:true };

const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const [form, setForm] = useState(pkg ? { title:pkg.title||'',subtitle:pkg.subtitle||'',description:pkg.description||'',image_url:pkg.image_url||'',price:pkg.price||'',old_price:pkg.old_price||'',duration:pkg.duration||'',departure:pkg.departure||'',spots:pkg.spots||'50',badge:pkg.badge||'',is_active:pkg.is_active!==false } : {...EMPTY});
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title||!form.price||!form.duration) { notify('Titre, prix et durée sont obligatoires','error'); return; }
    setLoading(true);
    try {
      const res = await fetch(pkg ? `${API_PKG}/${pkg.id}` : API_PKG, {
        method: pkg ? 'PUT' : 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ ...form, price:Number(form.price), old_price:form.old_price?Number(form.old_price):null, duration:Number(form.duration), spots:Number(form.spots)||50 }),
      });
      const json = await res.json();
      if (json.success) { notify(pkg ? 'Forfait mis à jour ✅' : 'Forfait créé ✅'); onSaved(); }
      else notify(json.message||'Erreur','error');
    } catch { notify('Erreur réseau','error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{maxWidth:700}} onClick={e=>e.stopPropagation()}>
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg></div>
            <h2>{pkg ? 'Modifier le forfait' : 'Nouveau forfait Omra'}</h2>
          </div>
          <button className="al-modal__close" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <form className="al-form" onSubmit={handleSubmit}>
          <div className="al-field">
            <label className="al-label">Titre <span className="al-required">*</span></label>
            <input className="al-input" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Ex: Omra Ramadan Premium" required/>
          </div>
          <div className="al-field">
            <label className="al-label">Sous-titre</label>
            <input className="al-input" value={form.subtitle} onChange={e=>set('subtitle',e.target.value)} placeholder="Ex: Hôtel 5★ · Médine & La Mecque"/>
          </div>
          <div className="al-field">
            <label className="al-label">Description</label>
            <textarea className="al-textarea" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Description du forfait..."/>
          </div>
          <div className="al-field">
            <label className="al-label">URL de l'image</label>
            <input className="al-input" value={form.image_url} onChange={e=>set('image_url',e.target.value)} placeholder="https://..."/>
            {form.image_url && <img src={form.image_url} alt="preview" style={{marginTop:8,width:'100%',height:120,objectFit:'cover',borderRadius:8,border:'1.5px solid var(--g200)'}} onError={e=>e.target.style.display='none'}/>}
          </div>
          <div className="al-row-2">
            <div className="al-field"><label className="al-label">Prix (TND) <span className="al-required">*</span></label><input className="al-input" type="number" min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="3500" required/></div>
            <div className="al-field"><label className="al-label">Ancien prix (TND)</label><input className="al-input" type="number" min="0" step="0.01" value={form.old_price} onChange={e=>set('old_price',e.target.value)} placeholder="4000 (optionnel)"/></div>
          </div>
          <div className="al-row-2">
            <div className="al-field"><label className="al-label">Durée (jours) <span className="al-required">*</span></label><input className="al-input" type="number" min="1" value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="14" required/></div>
            <div className="al-field"><label className="al-label">Date de départ</label><input className="al-input" value={form.departure} onChange={e=>set('departure',e.target.value)} placeholder="Ex: 15 Mars 2026"/></div>
          </div>
          <div className="al-row-2">
            <div className="al-field"><label className="al-label">Places disponibles</label><input className="al-input" type="number" min="0" value={form.spots} onChange={e=>set('spots',e.target.value)} placeholder="50"/></div>
            <div className="al-field">
              <label className="al-label">Badge</label>
              <select className="al-select" value={form.badge} onChange={e=>set('badge',e.target.value)}>
                <option value="">Aucun</option>
                <option value="Populaire">⭐ Populaire</option>
                <option value="Nouveau">✨ Nouveau</option>
                <option value="Promo">🔥 Promo</option>
                <option value="VIP">👑 VIP</option>
                <option value="Dernières places">⚡ Dernières places</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{width:16,height:16,cursor:'pointer',accentColor:'var(--primary)'}}/>
            <label htmlFor="is_active" className="al-label" style={{cursor:'pointer',marginBottom:0}}>Forfait actif (visible sur le site public)</label>
          </div>
          <div className="al-form-footer">
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="al-btn al-btn--primary" disabled={loading}>{loading ? 'Enregistrement...' : (pkg ? '✏️ Mettre à jour' : '➕ Créer le forfait')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Reservation Detail Panel ──────────────────────────────── */
const ResDetail = ({ res, onClose, onStatusChange }) => {
  if (!res) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,height:'100%',padding:32,textAlign:'center'}}>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--g300)" strokeWidth="1" style={{width:56,height:56}}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
      <p style={{fontSize:14,fontWeight:600,color:'var(--g400)',lineHeight:1.6}}>Cliquez sur une réservation<br/>pour voir les détails</p>
    </div>
  );

  const Section = ({title,children}) => (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <p style={{fontSize:10,fontWeight:700,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.1em',paddingBottom:8,borderBottom:'1px solid var(--g100)'}}>{title}</p>
      {children}
    </div>
  );
  const Item = ({label,value,full}) => !value ? null : (
    <div style={{display:'flex',flexDirection:'column',gap:3,gridColumn:full?'1 / -1':undefined}}>
      <span style={{fontSize:10,fontWeight:600,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</span>
      <span style={{fontSize:13,fontWeight:500,color:'var(--g700)'}}>{value}</span>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'18px 20px',borderBottom:'1px solid var(--g100)',display:'flex',alignItems:'flex-start',gap:14,flexShrink:0}}>
        <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,var(--primary),var(--secondary))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{width:22,height:22}}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontWeight:800,fontSize:16,color:'var(--g900)'}}>{res.first_name} {res.last_name}</p>
          <p style={{fontSize:12,color:'var(--g400)',marginTop:3}}>#{res.id} · {res.package_title || 'Forfait supprimé'}</p>
        </div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1.5px solid var(--g200)',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2" style={{width:14,height:14}}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'18px 20px',display:'flex',flexDirection:'column',gap:20}}>
        <Section title="Contact client">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Item label="Prénom"    value={res.first_name}/>
            <Item label="Nom"       value={res.last_name}/>
            <Item label="Email"     value={res.email} full/>
            <Item label="Téléphone" value={res.phone}/>
            <Item label="Genre"     value={res.gender}/>
            <Item label="Passeport" value={res.passport_number}/>
            {res.has_mahram && <Item label="Mahram" value={res.has_mahram}/>}
          </div>
        </Section>

        <Section title="Voyage">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Item label="Forfait"   value={res.package_title} full/>
            <Item label="Chambre"   value={res.chambre_type}/>
            <Item label="Personnes" value={`${res.number_of_persons} personne${res.number_of_persons>1?'s':''}`}/>
            <Item label="Total"     value={fPrice(res.total_price)}/>
          </div>
        </Section>

        <Section title="Paiement">
          <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:8,background:res.payment_method==='online'?'#eff6ff':'#fff7ed',color:res.payment_method==='online'?'#1d4ed8':'#c2410c',fontSize:12,fontWeight:600}}>
              {res.payment_method==='online'?'💳 Paiement en ligne':"🏪 Paiement à l'agence"}
            </span>
            <Badge s={res.payment_status} map={PAY_STATUS_MAP}/>
          </div>
        </Section>

        <Section title="Changer le statut">
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {Object.entries(STATUS_MAP).map(([key,meta]) => (
              <button key={key} onClick={()=>onStatusChange(res.id,key)}
                style={{display:'flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:8,border:`1.5px solid ${res.status===key?meta.color:'var(--g200)'}`,background:res.status===key?meta.bg:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:res.status===key?meta.color:'var(--g600)',transition:'all .2s'}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:meta.dot}}/>
                {meta.label}
              </button>
            ))}
          </div>
        </Section>

        {res.notes && (
          <Section title="Remarques client">
            <p style={{fontSize:13,color:'var(--g600)',lineHeight:1.6,background:'var(--g50)',padding:'10px 14px',borderRadius:8}}>{res.notes}</p>
          </Section>
        )}

        <div style={{padding:'12px 14px',background:'var(--g50)',borderRadius:10,fontSize:11,color:'var(--g400)'}}>
          <p>Réservée le {fDT(res.created_at)}</p>
          {res.updated_at!==res.created_at && <p style={{marginTop:4}}>Mise à jour le {fDT(res.updated_at)}</p>}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const OmraAdmin = () => {
  const [tab,   setTab]   = useState('packages');
  const [toast, setToast] = useState(null);

  const [packages,   setPackages]   = useState([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editPkg,    setEditPkg]    = useState(null);

  const [reservations,  setReservations]  = useState([]);
  const [resLoading,    setResLoading]    = useState(true);
  const [selectedRes,   setSelectedRes]   = useState(null);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search,        setSearch]        = useState('');

  const notify = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const fetchPackages = async () => {
    try { setPkgLoading(true); const r=await fetch(API_PKG); const j=await r.json(); setPackages(j.data||[]); }
    catch { notify('Impossible de charger les forfaits','error'); }
    finally { setPkgLoading(false); }
  };

  const fetchReservations = async () => {
    try {
      setResLoading(true);
      const p=new URLSearchParams();
      if(filterStatus!=='all')  p.append('status',filterStatus);
      if(filterPayment!=='all') p.append('payment_method',filterPayment);
      if(search) p.append('search',search);
      const r=await fetch(`${API_RES}?${p}`); const j=await r.json(); setReservations(j.data||[]);
    } catch { notify('Impossible de charger les réservations','error'); }
    finally { setResLoading(false); }
  };

  useEffect(()=>{ fetchPackages(); },[]);
  useEffect(()=>{ if(tab==='reservations') fetchReservations(); },[tab,filterStatus,filterPayment]);

  const handleDeletePkg = async (id) => {
    if(!window.confirm('Supprimer ce forfait ?')) return;
    const r=await fetch(`${API_PKG}/${id}`,{method:'DELETE'}); const j=await r.json();
    if(j.success){notify('Forfait supprimé');fetchPackages();}else notify('Erreur suppression','error');
  };

  const handleResStatus = async (id,status) => {
    const r=await fetch(`${API_RES}/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
    const j=await r.json();
    if(j.success){notify(`Statut : ${STATUS_MAP[status]?.label}`);fetchReservations();if(selectedRes?.id===id)setSelectedRes(p=>({...p,status}));}
    else notify('Erreur','error');
  };

  const pkgStats = { total:packages.length, active:packages.filter(p=>p.is_active).length, inactive:packages.filter(p=>!p.is_active).length, totalRes:packages.reduce((a,p)=>a+(parseInt(p.reservation_count)||0),0) };
  const resStats = { total:reservations.length, pending:reservations.filter(r=>r.status==='pending').length, confirmed:reservations.filter(r=>r.status==='confirmed').length, online:reservations.filter(r=>r.payment_method==='online').length, agency:reservations.filter(r=>r.payment_method==='agency').length };

  const filteredRes = reservations.filter(r => {
    if(!search) return true;
    const q=search.toLowerCase();
    return (r.first_name||'').toLowerCase().includes(q)||(r.last_name||'').toLowerCase().includes(q)||(r.email||'').toLowerCase().includes(q);
  });

  return (
    <AdminLayout title="Omra" breadcrumb={[{label:'Omra',active:true}]} toast={toast}>

      {/* TABS */}
      <div style={{padding:'20px 32px 0',display:'flex',gap:4,borderBottom:'2px solid var(--g200)'}}>
        {[{key:'packages',label:'🕌 Forfaits',count:pkgStats.total},{key:'reservations',label:'📋 Réservations',count:reservations.length}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 20px',border:'none',fontFamily:'inherit',borderRadius:'10px 10px 0 0',background:tab===t.key?'#fff':'transparent',color:tab===t.key?'var(--primary)':'var(--g500)',fontWeight:tab===t.key?700:500,fontSize:14,cursor:'pointer',borderBottom:tab===t.key?'2px solid var(--primary)':'2px solid transparent',marginBottom:-2,transition:'all .2s'}}>
            {t.label}
            <span style={{background:tab===t.key?'rgba(15,76,92,.1)':'var(--g100)',color:tab===t.key?'var(--primary)':'var(--g500)',fontSize:11,fontWeight:700,padding:'1px 7px',borderRadius:999}}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: FORFAITS ─────────────────────────────────────── */}
      {tab==='packages' && <>
        <div className="al-stats al-stats--4">
          {[
            {label:'Forfaits total',value:pkgStats.total,   color:'blue',   icon:<><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></>},
            {label:'Actifs',        value:pkgStats.active,  color:'green',  icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></>},
            {label:'Inactifs',      value:pkgStats.inactive,color:'gray',   icon:<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></>},
            {label:'Réservations',  value:pkgStats.totalRes,color:'teal',   icon:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></>},
          ].map(s=>(
            <div key={s.label} className={`al-stat al-stat--${s.color}`}>
              <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
              <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="al-card">
          <div className="al-toolbar">
            <p style={{fontSize:15,fontWeight:700,color:'var(--g800)',flex:1}}>Liste des forfaits Omra</p>
            <button className="al-btn al-btn--ghost" onClick={fetchPackages}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>Actualiser</button>
            <button className="al-btn al-btn--primary" onClick={()=>{setEditPkg(null);setShowModal(true);}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>Nouveau forfait</button>
          </div>

          {pkgLoading ? (
            <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{fontSize:13,color:'var(--g400)'}}>Chargement...</p></div>
          ) : packages.length===0 ? (
            <div className="al-empty"><div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div><p className="al-empty__title">Aucun forfait</p><p className="al-empty__sub">Créez votre premier forfait Omra.</p></div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead><tr><th>Forfait</th><th>Prix</th><th>Durée</th><th>Départ</th><th>Places</th><th>Réservations</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {packages.map(pkg=>(
                    <tr key={pkg.id} className="al-row">
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          {pkg.image_url ? <img src={pkg.image_url} alt={pkg.title} style={{width:44,height:44,borderRadius:8,objectFit:'cover',flexShrink:0,border:'1.5px solid var(--g200)'}} onError={e=>e.target.style.display='none'}/> :
                            <div style={{width:44,height:44,borderRadius:8,background:'linear-gradient(135deg,var(--primary),var(--secondary))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{width:20,height:20}}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                            </div>
                          }
                          <div>
                            <p style={{fontWeight:700,fontSize:13,color:'var(--g800)'}}>
                              {pkg.title}
                              {pkg.badge && <span style={{marginLeft:7,padding:'2px 7px',borderRadius:999,background:'#fff7ed',color:'#c2410c',fontSize:10,fontWeight:700}}>{pkg.badge}</span>}
                            </p>
                            {pkg.subtitle && <p style={{fontSize:11,color:'var(--g400)',marginTop:2}}>{pkg.subtitle}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <p style={{fontWeight:700,fontSize:13,color:'var(--primary)'}}>{fPrice(pkg.price)}</p>
                        {pkg.old_price && <p style={{fontSize:11,color:'var(--g400)',textDecoration:'line-through'}}>{fPrice(pkg.old_price)}</p>}
                      </td>
                      <td><span style={{fontWeight:600,fontSize:13}}>{pkg.duration} j</span></td>
                      <td><span style={{fontSize:12,color:'var(--g600)'}}>{pkg.departure||'—'}</span></td>
                      <td><span style={{fontWeight:700,fontSize:13,color:pkg.spots<=10?'#c2410c':'var(--g700)'}}>{pkg.spots}{pkg.spots<=10&&<span style={{fontSize:10,marginLeft:4}}>🔥</span>}</span></td>
                      <td><span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:999,background:'rgba(15,76,92,.08)',color:'var(--primary)',fontSize:12,fontWeight:700}}>{pkg.reservation_count||0} inscrit{pkg.reservation_count>1?'s':''}</span></td>
                      <td><span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:999,fontSize:11,fontWeight:600,background:pkg.is_active?'#d1fae5':'var(--g100)',color:pkg.is_active?'#065f46':'var(--g500)'}}><span style={{width:6,height:6,borderRadius:'50%',background:pkg.is_active?'#10b981':'var(--g400)'}}/>{pkg.is_active?'Actif':'Inactif'}</span></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="al-action-btn al-action-btn--edit" onClick={()=>{setEditPkg(pkg);setShowModal(true);}} title="Modifier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                          <button className="al-action-btn al-action-btn--delete" onClick={()=>handleDeletePkg(pkg.id)} title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="al-table-footer"><p className="al-count">{packages.length} forfait{packages.length!==1?'s':''}</p></div>
        </div>
      </>}

      {/* ── TAB: RÉSERVATIONS ─────────────────────────────────── */}
      {tab==='reservations' && <>
        <div className="al-stats">
          {[
            {label:'Total',              value:resStats.total,     color:'blue',   icon:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></>},
            {label:'En attente',         value:resStats.pending,   color:'orange', icon:<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>},
            {label:'Confirmées',         value:resStats.confirmed, color:'green',  icon:<><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></>},
            {label:'Paiement en ligne',  value:resStats.online,    color:'indigo', icon:<><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></>},
            {label:"Paiement à l'agence",value:resStats.agency,    color:'teal',   icon:<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>},
          ].map(s=>(
            <div key={s.label} className={`al-stat al-stat--${s.color}`}>
              <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
              <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:selectedRes?'1fr 380px':'1fr',gap:0,margin:'0 0 32px',transition:'grid-template-columns .3s'}}>
          <div style={{margin:'0 0 0 32px',background:'#fff',borderRadius:16,border:'1px solid var(--g200)',boxShadow:'var(--shadow-md)',overflow:'hidden',display:'flex',flexDirection:'column'}}>

            <div className="al-toolbar" style={{flexWrap:'wrap',gap:10}}>
              <div className="al-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" placeholder="Rechercher un client..." value={search} onChange={e=>setSearch(e.target.value)}/>
                {search && <button className="al-search__clear" onClick={()=>setSearch('')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
              </div>
              <div className="al-filter-tabs">
                {[{v:'all',l:'Tous'},{v:'online',l:'💳 En ligne'},{v:'agency',l:'🏪 Agence'}].map(({v,l})=>(
                  <button key={v} className={`al-filter-tab ${filterPayment===v?'active':''}`} onClick={()=>setFilterPayment(v)}>{l}<span className="al-filter-tab__count">{v==='all'?reservations.length:reservations.filter(r=>r.payment_method===v).length}</span></button>
                ))}
              </div>
              <div className="al-filter-tabs">
                {[{v:'all',l:'Tous'},{v:'pending',l:'⏳ Attente'},{v:'confirmed',l:'✅ Confirmées'},{v:'cancelled',l:'❌ Annulées'},{v:'completed',l:'🏁 Terminées'}].map(({v,l})=>(
                  <button key={v} className={`al-filter-tab ${filterStatus===v?'active':''}`} onClick={()=>setFilterStatus(v)}>{l}</button>
                ))}
              </div>
              <button className="al-btn al-btn--ghost" onClick={fetchReservations}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>Actualiser</button>
            </div>

            {resLoading ? (
              <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{fontSize:13,color:'var(--g400)'}}>Chargement...</p></div>
            ) : filteredRes.length===0 ? (
              <div className="al-empty"><div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div><p className="al-empty__title">Aucune réservation</p><p className="al-empty__sub">Modifiez vos filtres ou attendez de nouvelles réservations.</p></div>
            ) : (
              <div className="al-table-wrap">
                <table className="al-table">
                  <thead><tr><th>Client</th><th>Forfait</th><th>Pers./Chambre</th><th>Total</th><th>Paiement</th><th>Statut</th><th>Date</th></tr></thead>
                  <tbody>
                    {filteredRes.map(r=>{
                      const isSel=selectedRes?.id===r.id;
                      return (
                        <tr key={r.id} className="al-row" style={{cursor:'pointer',background:isSel?'#e0fbfc':undefined}} onClick={()=>setSelectedRes(isSel?null:r)}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--secondary))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:12,fontWeight:700,color:'#fff'}}>
                                {(r.first_name?.[0]||'?').toUpperCase()}{(r.last_name?.[0]||'').toUpperCase()}
                              </div>
                              <div>
                                <p style={{fontWeight:600,fontSize:13,color:'var(--g800)'}}>{r.first_name} {r.last_name}</p>
                                <p style={{fontSize:11,color:'var(--g400)',marginTop:2}}>{r.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><span style={{fontSize:12,fontWeight:600,color:'var(--g700)'}}>{r.package_title||'—'}</span></td>
                          <td><p style={{fontSize:13,fontWeight:600}}>{r.number_of_persons} pers.</p><p style={{fontSize:11,color:'var(--g400)',marginTop:2,textTransform:'capitalize'}}>{r.chambre_type}</p></td>
                          <td><span style={{fontWeight:700,fontSize:13,color:'var(--primary)'}}>{fPrice(r.total_price)}</span></td>
                          <td>
                            <div style={{display:'flex',flexDirection:'column',gap:4}}>
                              <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:999,background:r.payment_method==='online'?'#eff6ff':'#fff7ed',color:r.payment_method==='online'?'#1d4ed8':'#c2410c',fontSize:11,fontWeight:600}}>
                                {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}
                              </span>
                              <Badge s={r.payment_status} map={PAY_STATUS_MAP}/>
                            </div>
                          </td>
                          <td><Badge s={r.status} map={STATUS_MAP}/></td>
                          <td><span style={{fontSize:12,color:'var(--g500)'}}>{fDate(r.created_at)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="al-table-footer"><p className="al-count">{filteredRes.length} réservation{filteredRes.length!==1?'s':''}{(search||filterStatus!=='all'||filterPayment!=='all')?` sur ${reservations.length} au total`:''}</p></div>
          </div>

          {selectedRes && (
            <div style={{margin:'0 32px 0 16px',background:'#fff',borderRadius:16,border:'1px solid var(--g200)',boxShadow:'var(--shadow-md)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
              <ResDetail res={selectedRes} onClose={()=>setSelectedRes(null)} onStatusChange={handleResStatus}/>
            </div>
          )}
        </div>

        {!selectedRes&&!resLoading&&filteredRes.length>0&&(
          <div style={{margin:'-20px 32px 0',padding:'14px 20px',borderRadius:12,background:'var(--g50)',border:'1px dashed var(--g200)',textAlign:'center',fontSize:13,color:'var(--g400)'}}>
            👆 Cliquez sur une ligne pour voir les détails de la réservation
          </div>
        )}
      </>}

      {showModal && (
        <PkgModal
          pkg={editPkg}
          onClose={()=>{setShowModal(false);setEditPkg(null);}}
          onSaved={()=>{setShowModal(false);setEditPkg(null);fetchPackages();}}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default OmraAdmin;