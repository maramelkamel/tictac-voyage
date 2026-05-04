// src/pages/ClientProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getFavoritePath } from '../utils/favorites';

const API = 'http://localhost:5000/api';

// ── Loyalty helpers ───────────────────────────────────────────────
const getLoyaltyInfo = (total) => {
  if (total === 0)  return { level:0, label:'Nouveau client',  color:'#64748b', bg:'#f1f5f9', icon:'🌱', next:1,  nextLabel:'1 réservation pour Niveau 1' };
  if (total === 1)  return { level:1, label:'Niveau 1 ⭐',     color:'#0e7490', bg:'#e0fbfc', icon:'⭐', next:2,  nextLabel:'1 réservation pour Niveau 2' };
  if (total <= 3)   return { level:2, label:'Niveau 2 ⭐⭐',   color:'#c2410c', bg:'#fff7ed', icon:'⭐⭐', next:4, nextLabel:`${4 - total} réservation(s) pour Niveau 3` };
  return                   { level:3, label:'Niveau 3 ⭐⭐⭐', color:'#7c3aed', bg:'#f5f3ff', icon:'⭐⭐⭐', next:null, nextLabel:'Niveau maximum atteint ! 🎉' };
};
const getNextDiscount = (total) => {
  if (total < 5)  return { at:5,  pct:10, remaining:5  - total };
  if (total < 10) return { at:10, pct:20, remaining:10 - total };
  const next = Math.ceil((total + 1) / 3) * 3;
  return { at:next, pct:5, remaining:next - total };
};

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT   = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';

// ── Helpers ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   { label:'En attente', bg:'#fff7ed', color:'#c2410c' },
    confirmed: { label:'Confirmé',   bg:'#d1fae5', color:'#065f46' },
    completed: { label:'Terminé',    bg:'#e0fbfc', color:'#0e7490' },
    cancelled: { label:'Annulé',     bg:'#fee2e2', color:'#991b1b' },
    lu:        { label:'Lu',         bg:'#eff6ff', color:'#1d4ed8' },
    repondu:   { label:'Répondu',    bg:'#d1fae5', color:'#065f46' },
    nouveau:   { label:'Nouveau',    bg:'#fff7ed', color:'#c2410c' },
    archive:   { label:'Archivé',    bg:'#f1f5f9', color:'#64748b' },
  };
  const m = map[status] || { label:status, bg:'#f1f5f9', color:'#64748b' };
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>{m.label}</span>;
};

const Tab = ({ id, label, icon, active, onClick, count }) => (
  <button onClick={() => onClick(id)}
    style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', border:'none', fontFamily:'inherit', borderRadius:'10px 10px 0 0', background:active?'#fff':'transparent', color:active?'#0F4C5C':'#64748b', fontWeight:active?700:500, fontSize:14, cursor:'pointer', borderBottom:active?'2px solid #0F4C5C':'2px solid transparent', marginBottom:-2, transition:'all .2s' }}>
    <i className={icon} style={{ fontSize:13 }} />
    {label}
    {count !== undefined && count > 0 && (
      <span style={{ background:active?'#0F4C5C':'#e2e8f0', color:active?'#fff':'#64748b', fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:999 }}>{count}</span>
    )}
  </button>
);

const SectionHead = ({ emoji, label, count, color, bg }) => (
  <h3 style={{ fontSize:13, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
    {emoji} {label}
    <span style={{ background:bg, color, padding:'1px 8px', borderRadius:999, fontSize:11 }}>{count}</span>
  </h3>
);

// ══════════════════════════════════════════════════════════════════
//  RESERVATION DETAIL MODAL
// ══════════════════════════════════════════════════════════════════
const ReservationDetailModal = ({ reservation, type, onClose }) => {
  if (!reservation) return null;
  const r = reservation;

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.1em', paddingBottom:10, borderBottom:'1px solid #f1f5f9', marginBottom:12 }}>{title}</p>
      {children}
    </div>
  );

  const Row = ({ label, value, accent }) => value ? (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, background:'#f8fafc', marginBottom:6 }}>
      <span style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:600, color:accent||'#1e293b' }}>{value}</span>
    </div>
  ) : null;

  // ── Type-specific content ─────────────────────────────────────
  const renderContent = () => {
    if (type === 'omra') return (
      <>
        <Section title="Forfait Omra">
          <Row label="Forfait"     value={r.package_title || `Forfait #${r.package_id || r.id}`}/>
          <Row label="Durée"       value={r.duration ? `${r.duration} jours` : null}/>
          <Row label="Départ"      value={r.departure || null}/>
          <Row label="Chambre"     value={r.chambre_type}/>
          <Row label="Personnes"   value={`${r.number_of_persons} personne${r.number_of_persons>1?'s':''}`}/>
          <Row label="Passeport"   value={r.passport_number || null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"     value={r.payment_method==='online'?'💳 Paiement en ligne':"🏪 Paiement à l'agence"}/>
          <Row label="Statut paiement" value={r.payment_status==='paid'?'✅ Payé':'⏳ En attente'} accent={r.payment_status==='paid'?'#059669':'#c2410c'}/>
          <Row label="Total"       value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p style={{ fontSize:13, color:'#475569', background:'#f8fafc', padding:'12px 14px', borderRadius:8, lineHeight:1.6 }}>{r.notes}</p>
          </Section>
        )}
      </>
    );

    if (type === 'voyage') return (
      <>
        <Section title="Voyage organisé">
          <Row label="Voyage"      value={r.voyage_title || `Voyage #${r.voyage_id || r.id}`}/>
          <Row label="Destination" value={r.pays && r.destination ? `${r.pays} · ${r.destination}` : r.pays || r.destination || null}/>
          <Row label="Durée"       value={r.duration ? `${r.duration} jours` : null}/>
          <Row label="Départ"      value={r.departure || null}/>
          <Row label="Chambre"     value={r.chambre_type}/>
          <Row label="Personnes"   value={`${r.number_of_persons} personne${r.number_of_persons>1?'s':''}`}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"     value={r.payment_method==='online'?'💳 En ligne':"🏪 Agence"}/>
          <Row label="Total"       value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p style={{ fontSize:13, color:'#475569', background:'#f8fafc', padding:'12px 14px', borderRadius:8, lineHeight:1.6 }}>{r.notes}</p>
          </Section>
        )}
      </>
    );

    if (type === 'circuit') return (
      <>
        <Section title="Circuit Tunisie">
          <Row label="Circuit"     value={r.circuit_title || `Circuit #${r.circuit_id || r.id}`}/>
          <Row label="Région"      value={r.region==='nord'?'🏛️ Circuit Nord':'🏜️ Circuit Sud'}/>
          <Row label="Durée"       value={r.duration ? `${r.duration} jours` : null}/>
          <Row label="Départ"      value={r.departure || null}/>
          <Row label="Chambre"     value={r.chambre_type}/>
          <Row label="Personnes"   value={`${r.number_of_persons} personne${r.number_of_persons>1?'s':''}`}/>
          <Row label="Difficulté"  value={r.difficulty || null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"     value={r.payment_method==='online'?'💳 En ligne':"🏪 Agence"}/>
          <Row label="Total"       value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} DT` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p style={{ fontSize:13, color:'#475569', background:'#f8fafc', padding:'12px 14px', borderRadius:8, lineHeight:1.6 }}>{r.notes}</p>
          </Section>
        )}
      </>
    );

    if (type === 'transport') return (
      <>
        <Section title="Détails du transfert">
          <Row label="Type"        value={r.service_type==='transfert'?'🚗 Transfert':'⏱ Mise à disposition'}/>
          <Row label="Véhicule"    value={r.vehicle_type}/>
          <Row label="Passagers"   value={`${r.passengers} passager${r.passengers>1?'s':''}`}/>
          <Row label="Bagages"     value={r.luggage > 0 ? `${r.luggage} bagage${r.luggage>1?'s':''}` : null}/>
          {r.child_seat     && <Row label="Siège enfant" value="✅ Oui" accent="#059669"/>}
          {r.accessibility  && <Row label="PMR"          value="✅ Oui" accent="#059669"/>}
        </Section>
        <Section title="Itinéraire">
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#10b981', flexShrink:0, marginTop:3 }}/>
              <div>
                <p style={{ fontSize:11, color:'#64748b', fontWeight:600, marginBottom:2 }}>DÉPART</p>
                <p style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{r.departure_location}</p>
                <p style={{ fontSize:12, color:'#475569' }}>{fDate(r.departure_date)} à {r.departure_time?.slice(0,5)}</p>
              </div>
            </div>
            {r.arrival_location && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#e92f64', flexShrink:0, marginTop:3 }}/>
                <div>
                  <p style={{ fontSize:11, color:'#64748b', fontWeight:600, marginBottom:2 }}>ARRIVÉE</p>
                  <p style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{r.arrival_location}</p>
                  {r.return_date && <p style={{ fontSize:12, color:'#475569' }}>{fDate(r.return_date)} {r.return_time ? `à ${r.return_time?.slice(0,5)}` : ''}</p>}
                </div>
              </div>
            )}
          </div>
          {r.flight_train_number && <Row label="N° vol/train" value={`✈ ${r.flight_train_number}`}/>}
        </Section>
        {r.free_text && (
          <Section title="Remarques">
            <p style={{ fontSize:13, color:'#475569', background:'#f8fafc', padding:'12px 14px', borderRadius:8, lineHeight:1.6 }}>{r.free_text}</p>
          </Section>
        )}
      </>
    );

    if (type === 'flight') return (
      <>
        <Section title="Vol reserve">
          <Row label="Trajet" value={r.origin_iata && r.destination_iata ? `${r.origin_iata} → ${r.destination_iata}` : null}/>
          <Row label="Compagnie" value={r.airline_name || null}/>
          <Row label="Numero de vol" value={r.flight_number || null}/>
          <Row label="Depart" value={fDT(r.departing_at)}/>
          <Row label="Arrivee" value={fDT(r.arriving_at)}/>
          <Row label="Cabine" value={r.cabin_class || null}/>
          <Row label="Passagers" value={r.passengers ? `${r.passengers.length} passager${r.passengers.length > 1 ? 's' : ''}` : null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Methode" value={r.payment_method === 'online' ? '💳 En ligne' : "🏪 A l'agence"}/>
          <Row label="Statut paiement" value={r.payment_status === 'paid' ? '✅ Paye' : '⏳ En attente'} accent={r.payment_status === 'paid' ? '#059669' : '#c2410c'}/>
          <Row label="Total" value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-FR')} ${r.currency || ''}`.trim() : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p style={{ fontSize:13, color:'#475569', background:'#f8fafc', padding:'12px 14px', borderRadius:8, lineHeight:1.6 }}>{r.notes}</p>
          </Section>
        )}
      </>
    );

    if (type === 'hotel') return (
      <>
        <Section title="Hotel reserve">
          <Row label="Hotel" value={r.hotel_name || null}/>
          <Row label="Ville" value={r.hotel_city || null}/>
          <Row label="Adresse" value={r.hotel_location || null}/>
          <Row label="Check-in" value={fDate(r.check_in)}/>
          <Row label="Check-out" value={fDate(r.check_out)}/>
          <Row label="Voyageurs" value={r.adults ? `${r.adults} adulte${r.adults > 1 ? 's' : ''}${Number(r.children || 0) > 0 ? ` + ${r.children} enfant${Number(r.children) > 1 ? 's' : ''}` : ''}` : null}/>
          <Row label="Chambres" value={r.rooms ? `${r.rooms} chambre${r.rooms > 1 ? 's' : ''}` : null}/>
          <Row label="Type de chambre" value={r.room_type || null}/>
          <Row label="Formule repas" value={r.meal_plan || null}/>
          <Row label="Vue chambre" value={r.room_view || null}/>
          <Row label="Preference de lit" value={r.bed_preference || null}/>
          <Row label="Heure d'arrivee" value={r.arrival_time || null}/>
          <Row label="Transfert aeroport" value={r.airport_transfer ? 'Oui' : 'Non'} accent={r.airport_transfer ? '#059669' : undefined}/>
          <Row label="Extras" value={Array.isArray(r.selected_extras) && r.selected_extras.length ? r.selected_extras.join(', ') : null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Methode" value={r.payment_method === 'online' ? '💳 En ligne' : "🏪 A l'agence"}/>
          <Row label="Statut paiement" value={r.payment_status === 'paid' ? '✅ Paye' : '⏳ En attente'} accent={r.payment_status === 'paid' ? '#059669' : '#c2410c'}/>
          <Row label="Total" value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-FR')} ${r.currency || ''}`.trim() : null} accent="#0F4C5C"/>
        </Section>
        {r.special_requests && (
          <Section title="Demandes speciales">
            <p style={{ fontSize:13, color:'#475569', background:'#f8fafc', padding:'12px 14px', borderRadius:8, lineHeight:1.6 }}>{r.special_requests}</p>
          </Section>
        )}
      </>
    );

    if (type === 'custom') {
      const nights = r.departure_date && r.return_date
        ? Math.ceil(Math.abs(new Date(r.return_date) - new Date(r.departure_date)) / 86400000)
        : 0;
      return (
        <>
          {/* Admin quote banner */}
          {(r.quoted_price || r.admin_message) && (
            <div style={{ marginBottom:20, padding:'16px 18px', background:'linear-gradient(135deg,#d1fae5,#ecfdf5)', border:'1.5px solid #a7f3d0', borderRadius:12 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#065f46', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                <span>💰</span> Offre de Tictac Voyages
              </p>
              {r.quoted_price && (
                <p style={{ fontSize:22, fontWeight:800, color:'#065f46', marginBottom:r.admin_message?6:0 }}>
                  {Number(r.quoted_price).toLocaleString('fr-TN')} TND
                </p>
              )}
              {r.admin_message && (
                <p style={{ fontSize:13, color:'#065f46', lineHeight:1.6, fontStyle:'italic' }}>"{r.admin_message}"</p>
              )}
            </div>
          )}

          <Section title="Voyage sur mesure">
            <Row label="Destination"  value={r.destination}/>
            <Row label="Voyageurs"    value={`${r.number_of_persons} personne${r.number_of_persons>1?'s':''}`}/>
            <Row label="Départ"       value={fDate(r.departure_date)}/>
            <Row label="Retour"       value={fDate(r.return_date)}/>
            <Row label="Durée"        value={`${nights} nuit${nights>1?'s':''}`}/>
            {r.max_budget && <Row label="Budget max"  value={`${Number(r.max_budget).toLocaleString('fr-FR')} €`} accent="#0F4C5C"/>}
          </Section>

          {r.include_hotel && (
            <Section title="🏨 Hébergement souhaité">
              <Row label="Catégorie"  value={r.hotel_category ? `${r.hotel_category} ★` : null}/>
              <Row label="Chambre"    value={r.room_type}/>
              <Row label="Pension"    value={r.pension}/>
            </Section>
          )}
          {r.include_transport && (
            <Section title="✈️ Transport souhaité">
              <Row label="Type"          value={r.transport_type}/>
              <Row label="Ville départ"  value={r.departure_city}/>
              <Row label="Bagages"       value={r.luggage}/>
            </Section>
          )}
          {r.include_guide && (
            <Section title="🧭 Guide souhaité">
              <Row label="Langue" value={r.guide_language}/>
              <Row label="Durée"  value={r.guide_duration}/>
            </Section>
          )}
        </>
      );
    }

    return null;
  };

  // ── Type meta ─────────────────────────────────────────────────
  const typeMeta = {
    omra:      { emoji:'🕌', label:'Omra',              color:'#7c3aed', bg:'linear-gradient(135deg,#7c3aed,#6d28d9)' },
    voyage:    { emoji:'🏖️', label:'Voyage Organisé',   color:'#4338ca', bg:'linear-gradient(135deg,#4338ca,#6366f1)' },
    circuit:   { emoji:'🗺️', label:'Circuit Tunisie',   color:'#059669', bg:'linear-gradient(135deg,#059669,#10b981)' },
    flight:    { emoji:'✈️', label:'Vol',               color:'#0F4C5C', bg:'linear-gradient(135deg,#0F4C5C,#1ECAD3)' },
    transport: { emoji:'🚌', label:'Transport',          color:'#0e7490', bg:'linear-gradient(135deg,#0F4C5C,#1a6b80)' },
    custom:    { emoji:'✈️', label:'Voyage sur Mesure',  color:'#c2410c', bg:'linear-gradient(135deg,#c2410c,#f97316)' },
  };
  const meta = typeMeta[type] || { emoji:'📋', label:'Réservation', color:'#0F4C5C', bg:'linear-gradient(135deg,#0F4C5C,#1ECAD3)' };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', padding:16 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,.25)', animation:'slideUp .3s ease' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background:meta.bg, padding:'24px 24px 20px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:24 }}>{meta.emoji}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.8)', textTransform:'uppercase', letterSpacing:'.08em' }}>{meta.label}</span>
              </div>
              <p style={{ fontSize:18, fontWeight:800, color:'#fff', lineHeight:1.3, marginBottom:6 }}>
                {type==='omra'    && (r.package_title  || `Forfait Omra #${r.id}`)}
                {type==='voyage'  && (r.voyage_title   || `Voyage #${r.id}`)}
                {type==='circuit' && (r.circuit_title  || `Circuit #${r.id}`)}
                {type==='hotel'   && (r.hotel_name || `Hotel #${r.id}`)}
                {type==='flight' && `${r.origin_iata || '—'} → ${r.destination_iata || '—'}`}
                {type==='transport' && `${r.departure_location} → ${r.arrival_location || '...'}`}
                {type==='custom'  && r.destination}
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.75)' }}>Réservation #{r.id}</span>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,.4)' }}/>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.75)' }}>Le {fDate(r.created_at)}</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
              <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(255,255,255,.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:16 }}>✕</button>
              <StatusBadge status={r.status}/>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          {renderContent()}
          <div style={{ padding:'12px 14px', background:'#f8fafc', borderRadius:8, fontSize:11, color:'#94a3b8', marginTop:8 }}>
            <p>Créée le {fDT(r.created_at)}</p>
            {r.updated_at && r.updated_at !== r.created_at && <p style={{ marginTop:2 }}>Mise à jour le {fDT(r.updated_at)}</p>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
          <button onClick={onClose}
            style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0F4C5C,#1a6b80)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Clickable reservation card ────────────────────────────────────
const ResCard = ({ children, right, onClick }) => (
  <div onClick={onClick}
    style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:'18px 22px', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', cursor:'pointer', transition:'all .2s', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='#1ECAD3'; e.currentTarget.style.boxShadow='0 4px 16px rgba(15,76,92,.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.04)'; e.currentTarget.style.transform='translateY(0)'; }}>
    <div style={{ flex:1 }}>{children}</div>
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      {right}
      <span style={{ fontSize:16, color:'#94a3b8' }}>›</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const ClientProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [client,     setClient]     = useState(null);
  const [activeTab,  setActiveTab]  = useState(searchParams.get('tab') || 'profil');
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);

  const [omraRes,    setOmraRes]    = useState([]);
  const [voyageRes,  setVoyageRes]  = useState([]);
  const [circuitRes, setCircuitRes] = useState([]);
  const [flightRes,  setFlightRes]  = useState([]);
  const [hotelRes,   setHotelRes]   = useState([]);
  const [transRes,   setTransRes]   = useState([]);
  const [customRes,  setCustomRes]  = useState([]);
  const [messages,   setMessages]   = useState([]);
  const [favorites,  setFavorites]  = useState([]);

  const [editMode,   setEditMode]   = useState(false);
  const [editForm,   setEditForm]   = useState({});
  const [saving,     setSaving]     = useState(false);

  // ── Detail modal state ────────────────────────────────────────
  const [detailModal, setDetailModal] = useState(null); // { reservation, type }

  const token = localStorage.getItem('token');
  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored || !token) { navigate('/SignIn'); return; }
    const c = JSON.parse(stored);
    setClient(c);
    setEditForm({
      first_name:         c.firstName        || c.first_name        || '',
      last_name:          c.lastName         || c.last_name         || '',
      phone:              c.phone            || '',
      city:               c.city             || '',
      marital_status:     c.marital_status   || '',
      number_of_children: c.number_of_children ?? '',
    });
    fetchAll(c.email);
  }, []);

  const fetchAll = async (email) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const e = email?.toLowerCase();
      const [omra, voyage, circuit, flights, hotels, trans, custom, msgs, favs] = await Promise.all([
        fetch(`${API}/omra/reservations`,    { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/voyage-reservations`,  { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/circuit-reservations`, { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/flights/mine`,         { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/hotels/mine`,          { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/requests`,             { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/custom-trips`,         { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/contact`,              { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/favorites`,            { headers }).then(r=>r.json()).catch(()=>({})),
      ]);
      setOmraRes(   (omra.data    || []).filter(r => r.email?.toLowerCase() === e));
      setVoyageRes( (voyage.data  || []).filter(r => r.email?.toLowerCase() === e));
      setCircuitRes((circuit.data || []).filter(r => r.email?.toLowerCase() === e));
      setFlightRes( flights.data || []);
      setHotelRes(  hotels.data || []);
      setTransRes(  (trans.data   || []).filter(r => r.email?.toLowerCase() === e));
      setCustomRes( (custom.data  || []).filter(r => r.email?.toLowerCase() === e));
      setMessages(  (msgs.data    || []).filter(r => r.email?.toLowerCase() === e));
      setFavorites( favs.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTabChange = (tab) => { setActiveTab(tab); setSearchParams({ tab }); };
  const handleFavoriteOpen = (favorite) => {
    const path = favorite.item_data?.detailPath || getFavoritePath(favorite.item_type, favorite.item_id);
    if (path) navigate(path);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/clients/${client.id}`, {
        method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        const updated = { ...client, ...editForm, firstName:editForm.first_name, lastName:editForm.last_name };
        localStorage.setItem('client', JSON.stringify(updated));
        setClient(updated); setEditMode(false); notify('Profil mis à jour ✅');
      } else notify(json.message || 'Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
    finally { setSaving(false); }
  };

  const allReservations = [...omraRes, ...voyageRes, ...circuitRes, ...flightRes, ...hotelRes, ...transRes, ...customRes];
  const totalRes        = allReservations.length;
  const loyalty         = getLoyaltyInfo(totalRes);
  const nextDiscount    = getNextDiscount(totalRes);
  const progressPct     = loyalty.next ? Math.min(100, Math.round((totalRes / loyalty.next) * 100)) : 100;

  if (!client) return null;
  const firstName = client.firstName || client.first_name || '';
  const lastName  = client.lastName  || client.last_name  || '';
  const initials  = `${firstName[0]||''}${lastName[0]||''}`.toUpperCase();

  return (
    <>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', alignItems:'center', gap:10, padding:'13px 18px', borderRadius:10, fontSize:13, fontWeight:600, boxShadow:'0 16px 48px rgba(0,0,0,.15)', background:toast.type==='success'?'#10b981':'#e92f64', color:'#fff', animation:'fadeIn .3s ease' }}>
          <i className={toast.type==='success'?'fas fa-check-circle':'fas fa-exclamation-circle'} />
          {toast.msg}
        </div>
      )}

      {/* Reservation Detail Modal */}
      {detailModal && (
        <ReservationDetailModal
          reservation={detailModal.reservation}
          type={detailModal.type}
          onClose={() => setDetailModal(null)}
        />
      )}

      <main style={{ paddingTop:120, minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 60px' }}>

          {/* Profile Header */}
          <div style={{ background:'linear-gradient(135deg,#0F4C5C 0%,#1a6b80 55%,#1ECAD3 100%)', borderRadius:20, padding:'32px 36px', marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap', boxShadow:'0 8px 32px rgba(15,76,92,.28)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'3px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, color:'#fff', flexShrink:0 }}>
                {initials || <i className="fas fa-user" />}
              </div>
              <div>
                <p style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4 }}>{firstName} {lastName}</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', marginBottom:8 }}>{client.email}</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:999, background:loyalty.bg, color:loyalty.color, fontSize:12, fontWeight:700 }}>
                  {loyalty.icon} {loyalty.label}
                </span>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {[
                { label:'Réservations', value:totalRes },
                { label:'Omra',         value:omraRes.length },
                { label:'Voyages',      value:voyageRes.length },
                { label:'Circuits',     value:circuitRes.length },
                { label:'Hotels',       value:hotelRes.length },
                { label:'Vols',         value:flightRes.length },
                { label:'Transport',    value:transRes.length },
                { label:'Sur Mesure',   value:customRes.length },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'12px 16px', textAlign:'center', minWidth:64 }}>
                  <p style={{ fontSize:22, fontWeight:800, color:'#fff', lineHeight:1 }}>{s.value}</p>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.75)', marginTop:4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, borderBottom:'2px solid #e2e8f0', marginBottom:24, flexWrap:'wrap' }}>
            <Tab id="profil"       label="Mon Profil"   icon="fas fa-user-circle" active={activeTab==='profil'}       onClick={handleTabChange} />
            <Tab id="reservations" label="Réservations" icon="fas fa-suitcase"    active={activeTab==='reservations'} onClick={handleTabChange} count={totalRes} />
            <Tab id="messages"     label="Messages"     icon="fas fa-envelope"    active={activeTab==='messages'}     onClick={handleTabChange} count={messages.length} />
            <Tab id="favoris"      label="Favoris"      icon="fas fa-heart"       active={activeTab==='favoris'}      onClick={handleTabChange} count={favorites.length} />
            <Tab id="fidelite"     label="Fidélité"     icon="fas fa-crown"       active={activeTab==='fidelite'}     onClick={handleTabChange} />
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:'#0F4C5C', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 16px' }} />
              <p style={{ color:'#94a3b8', fontSize:14 }}>Chargement...</p>
            </div>
          ) : (
            <>
              {/* ═══ PROFIL ═══ */}
              {activeTab === 'profil' && (
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', boxShadow:'0 2px 12px rgba(0,0,0,.04)', overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', borderBottom:'1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize:16, fontWeight:700, color:'#0f172a' }}>Informations personnelles</h2>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)}
                        style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#0F4C5C', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        <i className="fas fa-pen" style={{ fontSize:11 }} /> Modifier
                      </button>
                    )}
                  </div>
                  <div style={{ padding:'24px 28px' }}>
                    {editMode ? (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                        {[
                          { key:'first_name',         label:'Prénom',           type:'text'   },
                          { key:'last_name',          label:'Nom',              type:'text'   },
                          { key:'phone',              label:'Téléphone',        type:'tel'    },
                          { key:'city',               label:'Ville',            type:'text'   },
                          { key:'number_of_children', label:"Nombre d'enfants", type:'number' },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:6 }}>{f.label}</label>
                            <input type={f.type} value={editForm[f.key]||''} onChange={e => setEditForm(p => ({ ...p, [f.key]:e.target.value }))}
                              style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:13, color:'#1e293b', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                              onFocus={e=>e.target.style.borderColor='#1ECAD3'}
                              onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
                          </div>
                        ))}
                        <div>
                          <label style={{ fontSize:12, fontWeight:600, color:'#475569', display:'block', marginBottom:6 }}>Situation matrimoniale</label>
                          <select value={editForm.marital_status||''} onChange={e => setEditForm(p => ({ ...p, marital_status:e.target.value }))}
                            style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:13, color:'#1e293b', outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:'#fff' }}>
                            <option value="">—</option>
                            <option value="celibataire">Célibataire</option>
                            <option value="marie">Marié(e)</option>
                            <option value="divorce">Divorcé(e)</option>
                            <option value="veuf">Veuf / Veuve</option>
                          </select>
                        </div>
                        <div style={{ gridColumn:'1 / -1', display:'flex', gap:10, justifyContent:'flex-end', paddingTop:8, borderTop:'1px solid #f1f5f9' }}>
                          <button onClick={() => setEditMode(false)}
                            style={{ padding:'9px 20px', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                            Annuler
                          </button>
                          <button onClick={handleSaveProfile} disabled={saving}
                            style={{ padding:'9px 20px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#0F4C5C,#1a6b80)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                            {saving ? 'Enregistrement...' : '✅ Sauvegarder'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                        {[
                          { label:'Prénom',           value:firstName },
                          { label:'Nom',              value:lastName },
                          { label:'Email',            value:client.email },
                          { label:'Téléphone',        value:client.phone||'—' },
                          { label:'Ville',            value:client.city||'—' },
                          { label:'Situation',        value:client.marital_status||'—' },
                          { label:"Nombre d'enfants", value:client.number_of_children??'—' },
                          { label:'Membre depuis',    value:fDate(client.created_at) },
                        ].map(item => (
                          <div key={item.label}>
                            <p style={{ fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{item.label}</p>
                            <p style={{ fontSize:14, fontWeight:500, color:'#1e293b' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ RÉSERVATIONS ═══ */}
              {activeTab === 'reservations' && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {/* Click hint */}
                  {allReservations.length > 0 && (
                    <div style={{ padding:'10px 16px', background:'#e0fbfc', border:'1px solid #a5f3fc', borderRadius:10, fontSize:12, color:'#0e7490', display:'flex', alignItems:'center', gap:8 }}>
                      <i className="fas fa-hand-pointer" style={{ fontSize:13 }}/> Cliquez sur une réservation pour voir tous ses détails
                    </div>
                  )}

                  {allReservations.length === 0 ? (
                    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'60px 24px', textAlign:'center' }}>
                      <i className="fas fa-suitcase" style={{ fontSize:48, color:'#cbd5e1', marginBottom:16, display:'block' }} />
                      <p style={{ fontSize:16, fontWeight:600, color:'#475569', marginBottom:8 }}>Aucune réservation pour l'instant</p>
                      <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Explorez nos offres et faites votre première réservation !</p>
                      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                        <button onClick={() => navigate('/Omra/Omra')} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Forfaits Omra</button>
                        <button onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Voyages Organisés</button>
                        <button onClick={() => navigate('/circuits/circuit')} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Circuits Tunisie</button>
                        <button onClick={() => navigate('/hotels')} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#8a1538,#e8306a)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Hotels</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ── Omra ── */}
                      {omraRes.length > 0 && (
                        <div>
                          <SectionHead emoji="🕌" label="Omra" count={omraRes.length} color="#7c3aed" bg="#f5f3ff"/>
                          {omraRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'omra' })}
                              right={<>
                                {r.total_price && <span style={{ fontWeight:800, fontSize:16, color:'#0F4C5C' }}>{Number(r.total_price).toLocaleString('fr-TN')} TND</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{r.package_title || `Forfait Omra #${r.package_id||r.id}`}</p>
                              <p style={{ fontSize:12, color:'#64748b' }}>{r.number_of_persons} pers. · Chambre {r.chambre_type} · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}</p>
                              <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Réservé le {fDate(r.created_at)}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {/* ── Voyages Organisés ── */}
                      {voyageRes.length > 0 && (
                        <div>
                          <SectionHead emoji="🏖️" label="Voyages Organisés" count={voyageRes.length} color="#4338ca" bg="#ede9fe"/>
                          {voyageRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'voyage' })}
                              right={<>
                                {r.total_price && <span style={{ fontWeight:800, fontSize:16, color:'#0F4C5C' }}>{Number(r.total_price).toLocaleString('fr-TN')} TND</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{r.voyage_title || `Voyage #${r.voyage_id||r.id}`}</p>
                              <p style={{ fontSize:12, color:'#64748b' }}>
                                {r.pays && `${r.pays}${r.destination?` · ${r.destination}`:''} · `}
                                {r.number_of_persons} pers. · Chambre {r.chambre_type} · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}
                              </p>
                              <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Réservé le {fDate(r.created_at)}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {/* ── Circuits ── */}
                      {circuitRes.length > 0 && (
                        <div>
                          <SectionHead emoji="🗺️" label="Circuits Tunisie" count={circuitRes.length} color="#059669" bg="#d1fae5"/>
                          {circuitRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'circuit' })}
                              right={<>
                                {r.total_price && <span style={{ fontWeight:800, fontSize:16, color:'#0F4C5C' }}>{Number(r.total_price).toLocaleString('fr-TN')} DT</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{r.circuit_title || `Circuit #${r.circuit_id||r.id}`}</p>
                              <p style={{ fontSize:12, color:'#64748b' }}>{r.region==='nord'?'🏛️ Circuit Nord':'🏜️ Circuit Sud'} · {r.number_of_persons} pers. · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}</p>
                              <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Réservé le {fDate(r.created_at)}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {/* ── Transport ── */}
                      {hotelRes.length > 0 && (
                        <div>
                          <SectionHead emoji="ðŸ¨" label="Hotels" count={hotelRes.length} color="#be185d" bg="#fff1f5"/>
                          {hotelRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'hotel' })}
                              right={<>
                                {r.total_price && <span style={{ fontWeight:800, fontSize:16, color:'#0F4C5C' }}>{Number(r.total_price).toLocaleString('fr-FR')} {r.currency || 'TND'}</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{r.hotel_name || `Hotel #${r.hotel_id||r.id}`}</p>
                              <p style={{ fontSize:12, color:'#64748b' }}>{r.hotel_city || 'Tunisie'} Â· {fDate(r.check_in)} â†’ {fDate(r.check_out)} Â· {r.rooms} chambre(s)</p>
                              <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>{r.room_type || 'Chambre'} Â· {r.meal_plan || 'Formule non precisee'} Â· {r.payment_method==='online'?'ðŸ’³ En ligne':"ðŸª Agence"}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {flightRes.length > 0 && (
                        <div>
                          <SectionHead emoji="✈️" label="Vols" count={flightRes.length} color="#0F4C5C" bg="#e0fbfc"/>
                          {flightRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'flight' })}
                              right={
                                <>
                                  {r.total_price && <span style={{ fontWeight:800, fontSize:16, color:'#0F4C5C' }}>{Number(r.total_price).toLocaleString('fr-FR')} {r.currency || ''}</span>}
                                  <StatusBadge status={r.status}/>
                                </>
                              }>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{r.origin_iata || '—'} → {r.destination_iata || '—'}</p>
                              <p style={{ fontSize:12, color:'#64748b' }}>
                                {r.airline_name || 'Vol'}{r.flight_number ? ` · ${r.flight_number}` : ''} · {r.payment_method==='online'?'💳 En ligne':"🏪 Agence"}
                              </p>
                              <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Départ le {fDT(r.departing_at)}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {transRes.length > 0 && (
                        <div>
                          <SectionHead emoji="🚌" label="Transport" count={transRes.length} color="#0e7490" bg="#e0fbfc"/>
                          {transRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'transport' })}
                              right={<StatusBadge status={r.status}/>}>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{r.departure_location||'—'} → {r.arrival_location||'—'}</p>
                              <p style={{ fontSize:12, color:'#64748b' }}>{r.vehicle_type} · {r.passengers} pers. · {fDate(r.departure_date)}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {/* ── Sur Mesure ── */}
                      {customRes.length > 0 && (
                        <div>
                          <SectionHead emoji="✈️" label="Voyage sur Mesure" count={customRes.length} color="#c2410c" bg="#fff7ed"/>
                          {customRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'custom' })}
                              right={
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  {r.quoted_price && (
                                    <span style={{ fontWeight:800, fontSize:15, color:'#065f46', background:'#d1fae5', padding:'3px 10px', borderRadius:999 }}>
                                      💰 {Number(r.quoted_price).toLocaleString('fr-TN')} TND
                                    </span>
                                  )}
                                  <StatusBadge status={r.status}/>
                                </div>
                              }>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{r.destination||'—'}</p>
                              <p style={{ fontSize:12, color:'#64748b' }}>{fDate(r.departure_date)} → {fDate(r.return_date)} · {r.number_of_persons} pers.</p>
                              {r.admin_message && (
                                <p style={{ fontSize:12, color:'#059669', marginTop:4, fontStyle:'italic' }}>💬 "{r.admin_message.length > 60 ? r.admin_message.slice(0,60)+'...' : r.admin_message}"</p>
                              )}
                            </ResCard>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ═══ MESSAGES ═══ */}
              {activeTab === 'messages' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {messages.length === 0 ? (
                    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'60px 24px', textAlign:'center' }}>
                      <i className="fas fa-envelope-open" style={{ fontSize:48, color:'#cbd5e1', marginBottom:16, display:'block' }} />
                      <p style={{ fontSize:16, fontWeight:600, color:'#475569' }}>Aucun message envoyé</p>
                      <button onClick={() => navigate('/Contact')} style={{ marginTop:16, padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        Nous contacter
                      </button>
                    </div>
                  ) : messages.map(msg => (
                    <div key={msg.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', flexWrap:'wrap', gap:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:14, fontWeight:700, color:'#0f172a', textTransform:'capitalize' }}>{msg.sujet}</span>
                          <StatusBadge status={msg.status}/>
                        </div>
                        <span style={{ fontSize:11, color:'#94a3b8' }}>{fDate(msg.created_at)}</span>
                      </div>
                      <div style={{ padding:'16px 20px' }}>
                        <div style={{ display:'flex', gap:12, marginBottom:msg.admin_notes?16:0 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#0F4C5C,#1ECAD3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700, flexShrink:0 }}>{initials}</div>
                          <div style={{ background:'#f8fafc', borderRadius:'0 12px 12px 12px', padding:'10px 14px', flex:1 }}>
                            <p style={{ fontSize:11, fontWeight:600, color:'#94a3b8', marginBottom:4 }}>Vous</p>
                            <p style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>{msg.message}</p>
                          </div>
                        </div>
                        {msg.admin_notes && (
                          <div style={{ display:'flex', gap:12, marginTop:12, flexDirection:'row-reverse' }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#e92f64,#f43f5e)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, flexShrink:0 }}>
                              <i className="fas fa-headset"/>
                            </div>
                            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px 0 12px 12px', padding:'10px 14px', flex:1 }}>
                              <p style={{ fontSize:11, fontWeight:600, color:'#16a34a', marginBottom:4 }}>Réponse de Tictac Voyages</p>
                              <p style={{ fontSize:13, color:'#334155', lineHeight:1.6 }}>{msg.admin_notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══ FAVORIS ═══ */}
              {activeTab === 'favoris' && (
                <div>
                  {favorites.length === 0 ? (
                    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'60px 24px', textAlign:'center' }}>
                      <i className="fas fa-heart" style={{ fontSize:48, color:'#fca5a5', marginBottom:16, display:'block' }} />
                      <p style={{ fontSize:16, fontWeight:600, color:'#475569', marginBottom:8 }}>Aucun favori pour l'instant</p>
                      <p style={{ fontSize:13, color:'#94a3b8' }}>Cliquez sur le ❤️ dans les cartes pour sauvegarder vos préférés</p>
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
                      {favorites.map(fav => {
                        const data = fav.item_data || {};
                        const typeMap = {
                          omra:    { label:'🕌 Omra',    bg:'#f5f3ff', color:'#7c3aed' },
                          voyage:  { label:'🏖️ Voyage',  bg:'#ede9fe', color:'#4338ca' },
                          circuit: { label:'🗺️ Circuit', bg:'#d1fae5', color:'#059669' },
                        };
                        const tm = typeMap[fav.item_type] || { label:fav.item_type, bg:'#f1f5f9', color:'#64748b' };
                        return (
                          <div key={fav.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'transform .2s', cursor:'pointer' }}
                            onClick={() => handleFavoriteOpen(fav)}
                            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                            {data.image && <img src={data.image} alt={data.title} style={{ width:'100%', height:140, objectFit:'cover' }}/>}
                            <div style={{ padding:'14px 16px' }}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, background:tm.bg, color:tm.color, textTransform:'uppercase', letterSpacing:'.06em' }}>{tm.label}</span>
                                <i className="fas fa-heart" style={{ color:'#e92f64', fontSize:14 }}/>
                              </div>
                              <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{data.title||'—'}</p>
                              {(data.pays || data.destination || data.subtitle || data.region) && (
                                <p style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>
                                  {[data.pays, data.destination, data.subtitle, data.region].filter(Boolean).join(' • ')}
                                </p>
                              )}
                              {data.price && <p style={{ fontSize:13, fontWeight:700, color:'#0F4C5C' }}>{Number(data.price).toLocaleString('fr-TN')} TND</p>}
                              <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Ajouté le {fDate(fav.created_at)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ FIDÉLITÉ ═══ */}
              {activeTab === 'fidelite' && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={{ background:`linear-gradient(135deg,${loyalty.color},${loyalty.color}cc)`, borderRadius:16, padding:'28px 32px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                    <div>
                      <p style={{ fontSize:13, opacity:.75, marginBottom:6, fontWeight:600 }}>Votre niveau actuel</p>
                      <p style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>{loyalty.icon} {loyalty.label}</p>
                      <p style={{ fontSize:13, opacity:.85 }}>{totalRes} réservation{totalRes!==1?'s':''} au total</p>
                    </div>
                    {loyalty.next && (
                      <div style={{ background:'rgba(255,255,255,.15)', borderRadius:12, padding:'16px 24px', minWidth:200 }}>
                        <p style={{ fontSize:12, opacity:.85, marginBottom:8 }}>Progression vers le niveau suivant</p>
                        <div style={{ height:8, background:'rgba(255,255,255,.25)', borderRadius:999, overflow:'hidden', marginBottom:6 }}>
                          <div style={{ height:'100%', width:`${progressPct}%`, background:'#fff', borderRadius:999, transition:'width .5s ease' }}/>
                        </div>
                        <p style={{ fontSize:12, opacity:.85 }}>{loyalty.nextLabel}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#D4A017,#f59e0b)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <i className="fas fa-tag" style={{ color:'#fff', fontSize:20 }}/>
                    </div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:15, color:'#0f172a', marginBottom:4 }}>Prochaine réduction : <span style={{ color:'#D4A017' }}>{nextDiscount.pct}%</span></p>
                      <p style={{ fontSize:13, color:'#64748b' }}>Plus que <strong>{nextDiscount.remaining}</strong> réservation{nextDiscount.remaining>1?'s':''} pour débloquer votre réduction à la réservation n°{nextDiscount.at}</p>
                    </div>
                  </div>

                  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                    <div style={{ padding:'18px 24px', borderBottom:'1px solid #f1f5f9' }}>
                      <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>📋 Règles du programme de fidélité</h3>
                    </div>
                    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
                      {[
                        { icon:'🌱',    level:'Nouveau client', rule:'0 réservation — Bienvenue chez Tictac Voyages !' },
                        { icon:'⭐',    level:'Niveau 1',       rule:'1 réservation confirmée' },
                        { icon:'⭐⭐',  level:'Niveau 2',       rule:'2 à 3 réservations confirmées' },
                        { icon:'⭐⭐⭐', level:'Niveau 3',      rule:'4 réservations confirmées et plus' },
                      ].map(item => (
                        <div key={item.level} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:10, background:loyalty.label.includes(item.level)||(item.level==='Nouveau client'&&loyalty.level===0)?'#f0fdf4':'#f8fafc', border:`1px solid ${loyalty.label.includes(item.level)||(item.level==='Nouveau client'&&loyalty.level===0)?'#bbf7d0':'#f1f5f9'}` }}>
                          <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                          <div>
                            <p style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{item.level}</p>
                            <p style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{item.rule}</p>
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop:8, padding:'16px', background:'#fffbeb', borderRadius:12, border:'1px solid #fed7aa' }}>
                        <p style={{ fontWeight:700, fontSize:13, color:'#92400e', marginBottom:10 }}>🎁 Réductions automatiques</p>
                        {[
                          { at:'5ème réservation',     pct:'10%', desc:'Réduction de 10% sur la 6ème réservation' },
                          { at:'10ème réservation',    pct:'20%', desc:'Réduction de 20% sur la 11ème réservation' },
                          { at:'Toutes les 3 ensuite', pct:'5%',  desc:'Réduction de 5% toutes les 3 réservations après la 10ème' },
                        ].map(r => (
                          <div key={r.at} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                            <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:10, background:'#fff', border:'1.5px solid #fed7aa', fontWeight:800, fontSize:13, color:'#d97706', flexShrink:0 }}>{r.pct}</span>
                            <div>
                              <p style={{ fontWeight:600, fontSize:12, color:'#92400e' }}>{r.at}</p>
                              <p style={{ fontSize:11, color:'#b45309' }}>{r.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
};

export default ClientProfile;
