// src/pages/ClientProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getFavoritePath } from '../utils/favorites';
import '../styles/ClientProfile.css';

// This base URL keeps the profile and reservation requests aligned with the frontend environment.
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Loyalty helpers ───────────────────────────────────────────────
// This helper maps the total number of reservations to the loyalty badge UI.
const getLoyaltyInfo = (total) => {
  if (total === 0)  return { level:0, label:'Nouveau client',  color:'#64748b', bg:'#f1f5f9', icon:'🌱', next:1,  nextLabel:'1 réservation pour Niveau 1' };
  if (total === 1)  return { level:1, label:'Niveau 1 ⭐',     color:'#0e7490', bg:'#e0fbfc', icon:'⭐', next:2,  nextLabel:'1 réservation pour Niveau 2' };
  if (total <= 3)   return { level:2, label:'Niveau 2 ⭐⭐',   color:'#c2410c', bg:'#fff7ed', icon:'⭐⭐', next:4, nextLabel:`${4 - total} réservation(s) pour Niveau 3` };
  return                   { level:3, label:'Niveau 3 ⭐⭐⭐', color:'#7c3aed', bg:'#f5f3ff', icon:'⭐⭐⭐', next:null, nextLabel:'Niveau maximum atteint ! 🎉' };
};
// This helper calculates the next automatic discount milestone for the client.
const getNextDiscount = (total) => {
  if (total < 5)  return { at:5,  pct:10, remaining:5  - total };
  if (total < 10) return { at:10, pct:20, remaining:10 - total };
  const next = Math.ceil((total + 1) / 3) * 3;
  return { at:next, pct:5, remaining:next - total };
};

// This helper maps reservation totals to the profile's loyalty level card.
const getClientLevelInfo = (total) => {
  if (total < 3) {
    return { level:0, label:'Niveau 0', color:'#64748b', bg:'#f1f5f9', icon:'🌱', min:0, next:3, nextLabel:`${3 - total} réservation(s) pour Niveau 1` };
  }
  if (total < 6) {
    return { level:1, label:'Niveau 1 ⭐', color:'#0e7490', bg:'#e0fbfc', icon:'⭐', min:3, next:6, nextLabel:`${6 - total} réservation(s) pour Niveau 2` };
  }
  if (total < 10) {
    return { level:2, label:'Niveau 2 ⭐⭐', color:'#c2410c', bg:'#fff7ed', icon:'⭐⭐', min:6, next:10, nextLabel:`${10 - total} réservation(s) pour Niveau 3` };
  }
  return { level:3, label:'Niveau 3 ⭐⭐⭐', color:'#7c3aed', bg:'#f5f3ff', icon:'⭐⭐⭐', min:10, next:null, nextLabel:'Niveau maximum atteint ! 🎉' };
};

// This helper hides promotions that are disabled or outside their valid date range.
const isPromotionActive = (promotion) => {
  if (!promotion?.is_active) return false;
  const today = new Date();
  const start = promotion.date_debut ? new Date(promotion.date_debut) : null;
  const end   = promotion.date_fin   ? new Date(promotion.date_fin)   : null;
  if (start && start > today) return false;
  if (end   && end   < today) return false;
  return true;
};

// This helper turns backend promotion categories into readable labels for the UI.
const formatPromotionCategory = (category) => ({
  omra: 'Omra',
  hotels: 'Hotels',
  vols: 'Vols',
  circuits: 'Circuits',
  voyages_internationaux: 'Voyages internationaux',
  voyages_sur_mesure: 'Voyages sur mesure',
  transfert_mise_a_disposition: 'Transport',
}[category] || category || 'Promotion');

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT   = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';

// ── Helpers ───────────────────────────────────────────────────────
// This badge renders a consistent visual state for reservations and contact messages.
const StatusBadge = ({ status }) => {
  const map = {
    pending:   'pending',
    confirmed: 'confirmed',
    completed: 'completed',
    cancelled: 'cancelled',
    lu:        'lu',
    repondu:   'repondu',
    nouveau:   'nouveau',
    archive:   'archive',
  };
  const labels = {
    pending:   'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
    lu:        'Lu',
    repondu:   'Répondu',
    nouveau:   'Nouveau',
    archive:   'Archivé',
  };
  const key   = map[status] || null;
  const label = labels[status] || status;
  return (
    <span className={`cp-badge${key ? ` cp-badge--${key}` : ''}`}>
      {label}
    </span>
  );
};

// This tab button is reused across the profile sections.
const Tab = ({ id, label, icon, active, onClick, count }) => (
  <button
    onClick={() => onClick(id)}
    className={`cp-tab${active ? ' cp-tab--active' : ''}`}
  >
    <i className={`${icon} cp-tab__icon`} />
    {label}
    {count !== undefined && count > 0 && (
      <span className={`cp-tab__count ${active ? 'cp-tab__count--active' : 'cp-tab__count--inactive'}`}>
        {count}
      </span>
    )}
  </button>
);

// This section header standardizes titles for grouped reservation cards.
const SectionHead = ({ emoji, label, count, color, bg }) => (
  <h3 className="cp-section-head" style={{ color }}>
    {emoji} {label}
    <span className="cp-section-head__count" style={{ background: bg, color }}>
      {count}
    </span>
  </h3>
);

// ══════════════════════════════════════════════════════════════════
//  RESERVATION DETAIL MODAL
// ══════════════════════════════════════════════════════════════════
// This modal shows the detailed content for one reservation entry.
const ReservationDetailModal = ({ reservation, type, onClose }) => {
  if (!reservation) return null;
  const r = reservation;

  // This local section wrapper keeps the modal layout consistent.
  const Section = ({ title, children }) => (
    <div className="cp-msection">
      <p className="cp-msection__title">{title}</p>
      {children}
    </div>
  );

  // This local row helper displays label/value pairs inside the modal.
  const Row = ({ label, value, accent }) => value ? (
    <div className="cp-mrow">
      <span className="cp-mrow__label">{label}</span>
      <span className="cp-mrow__value" style={accent ? { color: accent } : undefined}>{value}</span>
    </div>
  ) : null;

  // ── Type-specific content ─────────────────────────────────────
  // This renderer switches the modal body to the correct reservation type.
  const renderContent = () => {
    if (type === 'omra') return (
      <>
        <Section title="Forfait Omra">
          <Row label="Forfait"          value={r.package_title || `Forfait #${r.package_id || r.id}`}/>
          <Row label="Durée"            value={r.duration ? `${r.duration} jours` : null}/>
          <Row label="Départ"           value={r.departure || null}/>
          <Row label="Chambre"          value={r.chambre_type}/>
          <Row label="Personnes"        value={`${r.number_of_persons} personne${r.number_of_persons>1?'s':''}`}/>
          <Row label="Passeport"        value={r.passport_number || null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"          value={r.payment_method==='online'?'💳 Paiement en ligne':"🏪 Paiement à l'agence"}/>
          <Row label="Statut paiement"  value={r.payment_status==='paid'?'✅ Payé':'⏳ En attente'} accent={r.payment_status==='paid'?'#059669':'#c2410c'}/>
          <Row label="Total"            value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p className="cp-mtext">{r.notes}</p>
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
          <Row label="Méthode" value={r.payment_method==='online'?'💳 En ligne':"🏪 Agence"}/>
          <Row label="Total"   value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p className="cp-mtext">{r.notes}</p>
          </Section>
        )}
      </>
    );

    if (type === 'circuit') return (
      <>
        <Section title="Circuit Tunisie">
          <Row label="Circuit"    value={r.circuit_title || `Circuit #${r.circuit_id || r.id}`}/>
          <Row label="Région"     value={r.region==='nord'?'🏛️ Circuit Nord':'🏜️ Circuit Sud'}/>
          <Row label="Durée"      value={r.duration ? `${r.duration} jours` : null}/>
          <Row label="Départ"     value={r.departure || null}/>
          <Row label="Chambre"    value={r.chambre_type}/>
          <Row label="Personnes"  value={`${r.number_of_persons} personne${r.number_of_persons>1?'s':''}`}/>
          <Row label="Difficulté" value={r.difficulty || null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode" value={r.payment_method==='online'?'💳 En ligne':"🏪 Agence"}/>
          <Row label="Total"   value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} DT` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p className="cp-mtext">{r.notes}</p>
          </Section>
        )}
      </>
    );

    if (type === 'transport') return (
      <>
        <Section title="Détails du transfert">
          <Row label="Type"      value={r.service_type==='transfert'?'🚗 Transfert':'⏱ Mise à disposition'}/>
          <Row label="Véhicule"  value={r.vehicle_type}/>
          <Row label="Passagers" value={`${r.passengers} passager${r.passengers>1?'s':''}`}/>
          <Row label="Bagages"   value={r.luggage > 0 ? `${r.luggage} bagage${r.luggage>1?'s':''}` : null}/>
          {r.child_seat    && <Row label="Siège enfant" value="✅ Oui" accent="#059669"/>}
          {r.accessibility && <Row label="PMR"          value="✅ Oui" accent="#059669"/>}
        </Section>
        <Section title="Itinéraire">
          <div className="cp-itinerary">
            <div className="cp-itinerary__stop">
              <div className="cp-itinerary__dot cp-itinerary__dot--depart"/>
              <div>
                <p className="cp-itinerary__type">DÉPART</p>
                <p className="cp-itinerary__place">{r.departure_location}</p>
                <p className="cp-itinerary__time">{fDate(r.departure_date)} à {r.departure_time?.slice(0,5)}</p>
              </div>
            </div>
            {r.arrival_location && (
              <div className="cp-itinerary__stop">
                <div className="cp-itinerary__dot cp-itinerary__dot--arrivee"/>
                <div>
                  <p className="cp-itinerary__type">ARRIVÉE</p>
                  <p className="cp-itinerary__place">{r.arrival_location}</p>
                  {r.return_date && (
                    <p className="cp-itinerary__time">
                      {fDate(r.return_date)} {r.return_time ? `à ${r.return_time?.slice(0,5)}` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {r.flight_train_number && <Row label="N° vol/train" value={`✈ ${r.flight_train_number}`}/>}
        </Section>
        {r.free_text && (
          <Section title="Remarques">
            <p className="cp-mtext">{r.free_text}</p>
          </Section>
        )}
      </>
    );

    if (type === 'flight') return (
      <>
        <Section title="Vol reservé">
          <Row label="Trajet"    value={r.origin_iata && r.destination_iata ? `${r.origin_iata} → ${r.destination_iata}` : null}/>
          <Row label="Compagnie" value={r.airline_name || null}/>
          <Row label="N° de vol" value={r.flight_number || null}/>
          <Row label="Départ"    value={fDT(r.departing_at)}/>
          <Row label="Arrivée"   value={fDT(r.arriving_at)}/>
          <Row label="Cabine"    value={r.cabin_class || null}/>
          <Row label="Passagers" value={r.passengers ? `${r.passengers.length} passager${r.passengers.length > 1 ? 's' : ''}` : null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"         value={r.payment_method === 'online' ? '💳 En ligne' : "🏪 À l'agence"}/>
          <Row label="Statut paiement" value={r.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'} accent={r.payment_status === 'paid' ? '#059669' : '#c2410c'}/>
          <Row label="Total"           value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-FR')} ${r.currency || ''}`.trim() : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && (
          <Section title="Remarques">
            <p className="cp-mtext">{r.notes}</p>
          </Section>
        )}
      </>
    );

    if (type === 'hotel') return (
      <>
        <Section title="Hôtel réservé">
          <Row label="Hôtel"              value={r.hotel_name || null}/>
          <Row label="Ville"              value={r.hotel_city || null}/>
          <Row label="Adresse"            value={r.hotel_location || null}/>
          <Row label="Check-in"           value={fDate(r.check_in)}/>
          <Row label="Check-out"          value={fDate(r.check_out)}/>
          <Row label="Voyageurs"          value={r.adults ? `${r.adults} adulte${r.adults > 1 ? 's' : ''}${Number(r.children || 0) > 0 ? ` + ${r.children} enfant${Number(r.children) > 1 ? 's' : ''}` : ''}` : null}/>
          <Row label="Chambres"           value={r.rooms ? `${r.rooms} chambre${r.rooms > 1 ? 's' : ''}` : null}/>
          <Row label="Type de chambre"    value={r.room_type || null}/>
          <Row label="Formule repas"      value={r.meal_plan || null}/>
          <Row label="Vue chambre"        value={r.room_view || null}/>
          <Row label="Préférence de lit"  value={r.bed_preference || null}/>
          <Row label="Heure d'arrivée"    value={r.arrival_time || null}/>
          <Row label="Transfert aéroport" value={r.airport_transfer ? 'Oui' : 'Non'} accent={r.airport_transfer ? '#059669' : undefined}/>
          <Row label="Extras"             value={Array.isArray(r.selected_extras) && r.selected_extras.length ? r.selected_extras.join(', ') : null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"         value={r.payment_method === 'online' ? '💳 En ligne' : "🏪 À l'agence"}/>
          <Row label="Statut paiement" value={r.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'} accent={r.payment_status === 'paid' ? '#059669' : '#c2410c'}/>
          <Row label="Total"           value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-FR')} ${r.currency || ''}`.trim() : null} accent="#0F4C5C"/>
        </Section>
        {r.special_requests && (
          <Section title="Demandes spéciales">
            <p className="cp-mtext">{r.special_requests}</p>
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
            <div className="cp-modal-quote">
              <p className="cp-modal-quote__label"><span>💰</span> Offre de Tictac Voyages</p>
              {r.quoted_price && (
                <p className="cp-modal-quote__price">{Number(r.quoted_price).toLocaleString('fr-TN')} TND</p>
              )}
              {r.admin_message && (
                <p className="cp-modal-quote__msg">"{r.admin_message}"</p>
              )}
            </div>
          )}

          <Section title="Voyage sur mesure">
            <Row label="Destination" value={r.destination}/>
            <Row label="Voyageurs"   value={`${r.number_of_persons} personne${r.number_of_persons>1?'s':''}`}/>
            <Row label="Départ"      value={fDate(r.departure_date)}/>
            <Row label="Retour"      value={fDate(r.return_date)}/>
            <Row label="Durée"       value={`${nights} nuit${nights>1?'s':''}`}/>
            {r.max_budget && <Row label="Budget max" value={`${Number(r.max_budget).toLocaleString('fr-FR')} €`} accent="#0F4C5C"/>}
          </Section>

          {r.include_hotel && (
            <Section title="🏨 Hébergement souhaité">
              <Row label="Catégorie" value={r.hotel_category ? `${r.hotel_category} ★` : null}/>
              <Row label="Chambre"   value={r.room_type}/>
              <Row label="Pension"   value={r.pension}/>
            </Section>
          )}
          {r.include_transport && (
            <Section title="✈️ Transport souhaité">
              <Row label="Type"         value={r.transport_type}/>
              <Row label="Ville départ" value={r.departure_city}/>
              <Row label="Bagages"      value={r.luggage}/>
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
    omra:      { emoji:'🕌', label:'Omra',              bg:'linear-gradient(135deg,#7c3aed,#6d28d9)' },
    voyage:    { emoji:'🏖️', label:'Voyage Organisé',   bg:'linear-gradient(135deg,#4338ca,#6366f1)' },
    circuit:   { emoji:'🗺️', label:'Circuit Tunisie',   bg:'linear-gradient(135deg,#059669,#10b981)' },
    flight:    { emoji:'✈️', label:'Vol',               bg:'linear-gradient(135deg,#0F4C5C,#1ECAD3)' },
    transport: { emoji:'🚌', label:'Transport',          bg:'linear-gradient(135deg,#0F4C5C,#1a6b80)' },
    hotel:     { emoji:'🏨', label:'Hôtel',             bg:'linear-gradient(135deg,#8a1538,#e8306a)' },
    custom:    { emoji:'✈️', label:'Voyage sur Mesure',  bg:'linear-gradient(135deg,#c2410c,#f97316)' },
  };
  const meta = typeMeta[type] || { emoji:'📋', label:'Réservation', bg:'linear-gradient(135deg,#0F4C5C,#1ECAD3)' };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="cp-modal__header" style={{ background: meta.bg }}>
          <div className="cp-modal__header-inner">
            <div>
              <div className="cp-modal__header-top">
                <span className="cp-modal__type-emoji">{meta.emoji}</span>
                <span className="cp-modal__type-label">{meta.label}</span>
              </div>
              <p className="cp-modal__title">
                {type==='omra'    && (r.package_title  || `Forfait Omra #${r.id}`)}
                {type==='voyage'  && (r.voyage_title   || `Voyage #${r.id}`)}
                {type==='circuit' && (r.circuit_title  || `Circuit #${r.id}`)}
                {type==='hotel'   && (r.hotel_name     || `Hotel #${r.id}`)}
                {type==='flight'  && `${r.origin_iata || '—'} → ${r.destination_iata || '—'}`}
                {type==='transport' && `${r.departure_location} → ${r.arrival_location || '...'}`}
                {type==='custom'  && r.destination}
              </p>
              <div className="cp-modal__meta">
                <span className="cp-modal__meta-text">Réservation #{r.id}</span>
                <span className="cp-modal__meta-dot"/>
                <span className="cp-modal__meta-text">Le {fDate(r.created_at)}</span>
              </div>
            </div>
            <div className="cp-modal__header-right">
              <button onClick={onClose} className="cp-modal__close-btn">✕</button>
              <StatusBadge status={r.status}/>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="cp-modal__body">
          {renderContent()}
          <div className="cp-modal-timestamps">
            <p>Créée le {fDT(r.created_at)}</p>
            {r.updated_at && r.updated_at !== r.created_at && (
              <p>Mise à jour le {fDT(r.updated_at)}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="cp-modal__footer">
          <button onClick={onClose} className="cp-modal__close-footer-btn">Fermer</button>
        </div>
      </div>
    </div>
  );
};

// ── Clickable reservation card ────────────────────────────────────
// This card wrapper is reused across the reservation grids in the profile.
const ResCard = ({ children, right, onClick }) => (
  <div onClick={onClick} className="cp-res-card">
    <div className="cp-res-card__left">{children}</div>
    <div className="cp-res-card__right">
      {right}
      <span className="cp-res-card__arrow">›</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
// This page loads the authenticated client dashboard, reservations, favorites, and promotions.
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
  const [promotions, setPromotions] = useState([]);

  const [editMode,  setEditMode]  = useState(false);
  const [editForm,  setEditForm]  = useState({});
  const [saving,    setSaving]    = useState(false);

  // ── Detail modal state ────────────────────────────────────────
  const [detailModal, setDetailModal] = useState(null); // { reservation, type }

  const token = localStorage.getItem('token');
  // This helper shows short success or error messages in the profile view.
  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // This effect restores the stored client session and triggers the initial data load.
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
    });
    fetchAll(c.email);
  }, []);

  // This loader gathers all profile-related data sources with the current client token.
  const fetchAll = async (email) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const e = email?.toLowerCase();
      const [omra, voyage, circuit, flights, hotels, trans, custom, msgs, favs, promos] = await Promise.all([
        fetch(`${API}/omra/reservations`,    { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/voyage-reservations`,  { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/circuit-reservations`, { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/flights/mine`,         { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/hotels/mine`,          { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/requests`,             { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/custom-trips`,         { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/contact`,              { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/favorites`,            { headers }).then(r=>r.json()).catch(()=>({})),
        fetch(`${API}/promotions`).then(r=>r.json()).catch(()=>({})),
      ]);
      setOmraRes(   (omra.data    || []).filter(r => r.email?.toLowerCase() === e));
      setVoyageRes( (voyage.data  || []).filter(r => r.email?.toLowerCase() === e));
      setCircuitRes((circuit.data || []).filter(r => r.email?.toLowerCase() === e));
      setFlightRes( flights.data || []);
      setHotelRes(  hotels.data  || []);
      setTransRes(  (trans.data   || []).filter(r => r.email?.toLowerCase() === e));
      setCustomRes( (custom.data  || []).filter(r => r.email?.toLowerCase() === e));
      setMessages(  (msgs.data    || []).filter(r => r.email?.toLowerCase() === e));
      setFavorites( favs.data || []);
      setPromotions((promos.data || []).filter(isPromotionActive));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // This handler keeps the active profile tab synchronized with the URL query string.
  const handleTabChange = (tab) => { setActiveTab(tab); setSearchParams({ tab }); };
  // This handler opens the saved favorite in its original detail page.
  const handleFavoriteOpen = (favorite) => {
    const path = favorite.item_data?.detailPath || getFavoritePath(favorite.item_type, favorite.item_id);
    if (path) navigate(path);
  };
  // This helper copies a promotion code so the client can reuse it quickly.
  const handleCopyPromo = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      notify(`Code ${code} copié`);
    } catch {
      notify('Impossible de copier le code', 'error');
    }
  };

  // This handler persists profile edits to the backend and refreshes local session data.
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        const updated = { ...client, ...editForm, firstName: editForm.first_name, lastName: editForm.last_name };
        localStorage.setItem('client', JSON.stringify(updated));
        setClient(updated);
        setEditMode(false);
        notify('Profil mis à jour ✅');
      } else {
        notify(json.message || 'Erreur', 'error');
      }
    } catch { notify('Erreur réseau', 'error'); }
    finally { setSaving(false); }
  };

  const allReservations = [...omraRes, ...voyageRes, ...circuitRes, ...flightRes, ...hotelRes, ...transRes, ...customRes];
  const totalRes        = allReservations.length;
  const loyalty         = getClientLevelInfo(totalRes);
  const nextDiscount    = getNextDiscount(totalRes);
  const progressPct     = loyalty.next
    ? Math.min(100, Math.round(((totalRes - loyalty.min) / (loyalty.next - loyalty.min)) * 100))
    : 100;

  if (!client) return null;
  const firstName = client.firstName || client.first_name || '';
  const lastName  = client.lastName  || client.last_name  || '';
  const initials  = `${firstName[0]||''}${lastName[0]||''}`.toUpperCase();

  return (
    <>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`cp-toast cp-toast--${toast.type}`}>
          <i className={toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'} />
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

      <main className="cp-main">
        <div className="cp-container">

          {/* Profile Header */}
          <div className="cp-header">
            <div className="cp-header__left">
              <div className="cp-header__avatar">
                {initials || <i className="fas fa-user" />}
              </div>
              <div>
                <p className="cp-header__name">{firstName} {lastName}</p>
                <p className="cp-header__email">{client.email}</p>
                <span className="cp-header__loyalty-badge" style={{ background: loyalty.bg, color: loyalty.color }}>
                  {loyalty.icon} {loyalty.label}
                </span>
              </div>
            </div>
            <div className="cp-header__stats">
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
                <div key={s.label} className="cp-stat-card">
                  <p className="cp-stat-card__value">{s.value}</p>
                  <p className="cp-stat-card__label">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="cp-tabs">
            <Tab id="profil"       label="Mon Profil"     icon="fas fa-user-circle" active={activeTab==='profil'}       onClick={handleTabChange} />
            <Tab id="reservations" label="Réservations"   icon="fas fa-suitcase"    active={activeTab==='reservations'} onClick={handleTabChange} count={totalRes} />
            <Tab id="messages"     label="Messages"       icon="fas fa-envelope"    active={activeTab==='messages'}     onClick={handleTabChange} count={messages.length} />
            <Tab id="favoris"      label="Favoris"        icon="fas fa-heart"       active={activeTab==='favoris'}      onClick={handleTabChange} count={favorites.length} />
            <Tab id="fidelite"     label="Fidélité"       icon="fas fa-crown"       active={activeTab==='fidelite'}     onClick={handleTabChange} />
            <Tab id="promotions"   label="Nos promotions" icon="fas fa-percent"     active={activeTab==='promotions'}   onClick={handleTabChange} count={promotions.length} />
          </div>

          {loading ? (
            <div className="cp-loading">
              <div className="cp-spinner" />
              <p className="cp-loading__text">Chargement...</p>
            </div>
          ) : (
            <>
              {/* ═══ PROFIL ═══ */}
              {activeTab === 'profil' && (
                <div className="cp-profile-card">
                  <div className="cp-profile-card__header">
                    <h2 className="cp-profile-card__title">Informations personnelles</h2>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)} className="cp-btn-edit">
                        <i className="fas fa-pen" /> Modifier
                      </button>
                    )}
                  </div>
                  <div className="cp-profile-card__body">
                    {editMode ? (
                      <div className="cp-edit-grid">
                        {[
                          { key:'first_name',         label:'Prénom',           type:'text'   },
                          { key:'last_name',          label:'Nom',              type:'text'   },
                          { key:'phone',              label:'Téléphone',        type:'tel'    },
                          { key:'city',               label:'Ville',            type:'text'   },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="cp-edit-label">{f.label}</label>
                            <input
                              type={f.type}
                              value={editForm[f.key] || ''}
                              onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                              className="cp-input"
                            />
                          </div>
                        ))}
                        <div className="cp-edit-actions">
                          <button onClick={() => setEditMode(false)} className="cp-btn-cancel">Annuler</button>
                          <button onClick={handleSaveProfile} disabled={saving} className="cp-btn-save">
                            {saving ? 'Enregistrement...' : '✅ Sauvegarder'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="cp-info-grid">
                        {[
                          { label:'Prénom',           value:firstName },
                          { label:'Nom',              value:lastName },
                          { label:'Email',            value:client.email },
                          { label:'Téléphone',        value:client.phone||'—' },
                          { label:'Ville',            value:client.city||'—' },
                          { label:'Membre depuis',    value:fDate(client.created_at) },
                        ].map(item => (
                          <div key={item.label}>
                            <p className="cp-info-field__label">{item.label}</p>
                            <p className="cp-info-field__value">{item.value}</p>
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
                  {allReservations.length > 0 && (
                    <div className="cp-click-hint">
                      <i className="fas fa-hand-pointer" /> Cliquez sur une réservation pour voir tous ses détails
                    </div>
                  )}

                  {allReservations.length === 0 ? (
                    <div className="cp-empty">
                      <i className="fas fa-suitcase cp-empty__icon" />
                      <p className="cp-empty__title">Aucune réservation pour l'instant</p>
                      <p className="cp-empty__sub">Explorez nos offres et faites votre première réservation !</p>
                      <div className="cp-empty__actions">
                        <button onClick={() => navigate('/Omra/Omra')}               className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>Forfaits Omra</button>
                        <button onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')} className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#4338ca,#6366f1)' }}>Voyages Organisés</button>
                        <button onClick={() => navigate('/circuits/circuit')}         className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>Circuits Tunisie</button>
                        <button onClick={() => navigate('/hotels')}                   className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#8a1538,#e8306a)' }}>Hotels</button>
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
                                {r.total_price && <span className="cp-res-card__price">{Number(r.total_price).toLocaleString('fr-TN')} TND</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p className="cp-res-card__title">{r.package_title || `Forfait Omra #${r.package_id||r.id}`}</p>
                              <p className="cp-res-card__sub">{r.number_of_persons} pers. · Chambre {r.chambre_type} · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}</p>
                              <p className="cp-res-card__date">Réservé le {fDate(r.created_at)}</p>
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
                                {r.total_price && <span className="cp-res-card__price">{Number(r.total_price).toLocaleString('fr-TN')} TND</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p className="cp-res-card__title">{r.voyage_title || `Voyage #${r.voyage_id||r.id}`}</p>
                              <p className="cp-res-card__sub">
                                {r.pays && `${r.pays}${r.destination?` · ${r.destination}`:''} · `}
                                {r.number_of_persons} pers. · Chambre {r.chambre_type} · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}
                              </p>
                              <p className="cp-res-card__date">Réservé le {fDate(r.created_at)}</p>
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
                                {r.total_price && <span className="cp-res-card__price">{Number(r.total_price).toLocaleString('fr-TN')} DT</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p className="cp-res-card__title">{r.circuit_title || `Circuit #${r.circuit_id||r.id}`}</p>
                              <p className="cp-res-card__sub">{r.region==='nord'?'🏛️ Circuit Nord':'🏜️ Circuit Sud'} · {r.number_of_persons} pers. · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}</p>
                              <p className="cp-res-card__date">Réservé le {fDate(r.created_at)}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {/* ── Hôtels ── */}
                      {hotelRes.length > 0 && (
                        <div>
                          <SectionHead emoji="🏨" label="Hotels" count={hotelRes.length} color="#be185d" bg="#fff1f5"/>
                          {hotelRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'hotel' })}
                              right={<>
                                {r.total_price && <span className="cp-res-card__price">{Number(r.total_price).toLocaleString('fr-FR')} {r.currency || 'TND'}</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p className="cp-res-card__title">{r.hotel_name || `Hotel #${r.hotel_id||r.id}`}</p>
                              <p className="cp-res-card__sub">{r.hotel_city || 'Tunisie'} · {fDate(r.check_in)} → {fDate(r.check_out)} · {r.rooms} chambre(s)</p>
                              <p className="cp-res-card__date">{r.room_type || 'Chambre'} · {r.meal_plan || 'Formule non précisée'} · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {/* ── Vols ── */}
                      {flightRes.length > 0 && (
                        <div>
                          <SectionHead emoji="✈️" label="Vols" count={flightRes.length} color="#0F4C5C" bg="#e0fbfc"/>
                          {flightRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'flight' })}
                              right={<>
                                {r.total_price && <span className="cp-res-card__price">{Number(r.total_price).toLocaleString('fr-FR')} {r.currency || ''}</span>}
                                <StatusBadge status={r.status}/>
                              </>}>
                              <p className="cp-res-card__title">{r.origin_iata || '—'} → {r.destination_iata || '—'}</p>
                              <p className="cp-res-card__sub">
                                {r.airline_name || 'Vol'}{r.flight_number ? ` · ${r.flight_number}` : ''} · {r.payment_method==='online'?'💳 En ligne':'🏪 Agence'}
                              </p>
                              <p className="cp-res-card__date">Départ le {fDT(r.departing_at)}</p>
                            </ResCard>
                          ))}
                        </div>
                      )}

                      {/* ── Transport ── */}
                      {transRes.length > 0 && (
                        <div>
                          <SectionHead emoji="🚌" label="Transport" count={transRes.length} color="#0e7490" bg="#e0fbfc"/>
                          {transRes.map(r => (
                            <ResCard key={r.id} onClick={() => setDetailModal({ reservation:r, type:'transport' })}
                              right={<StatusBadge status={r.status}/>}>
                              <p className="cp-res-card__title">{r.departure_location||'—'} → {r.arrival_location||'—'}</p>
                              <p className="cp-res-card__sub">{r.vehicle_type} · {r.passengers} pers. · {fDate(r.departure_date)}</p>
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
                                <div className="cp-res-card__right">
                                  {r.quoted_price && (
                                    <span className="cp-res-card__quoted-price">
                                      💰 {Number(r.quoted_price).toLocaleString('fr-TN')} TND
                                    </span>
                                  )}
                                  <StatusBadge status={r.status}/>
                                </div>
                              }>
                              <p className="cp-res-card__title">{r.destination||'—'}</p>
                              <p className="cp-res-card__sub">{fDate(r.departure_date)} → {fDate(r.return_date)} · {r.number_of_persons} pers.</p>
                              {r.admin_message && (
                                <p className="cp-res-card__admin-msg">
                                  💬 "{r.admin_message.length > 60 ? r.admin_message.slice(0, 60)+'...' : r.admin_message}"
                                </p>
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
                <div className="cp-messages">
                  {messages.length === 0 ? (
                    <div className="cp-empty">
                      <i className="fas fa-envelope-open cp-empty__icon" />
                      <p className="cp-empty__title">Aucun message envoyé</p>
                      <button onClick={() => navigate('/Contact')} className="cp-btn-contact">
                        Nous contacter
                      </button>
                    </div>
                  ) : messages.map(msg => (
                    <div key={msg.id} className="cp-msg-card">
                      <div className="cp-msg-card__header">
                        <div className="cp-msg-card__title-row">
                          <span className="cp-msg-card__subject">{msg.sujet}</span>
                          <StatusBadge status={msg.status}/>
                        </div>
                        <span className="cp-msg-card__date">{fDate(msg.created_at)}</span>
                      </div>
                      <div className="cp-msg-card__body">
                        <div className="cp-msg-bubble-row">
                          <div className="cp-msg-avatar cp-msg-avatar--client">{initials}</div>
                          <div className="cp-msg-bubble cp-msg-bubble--client">
                            <p className="cp-msg-bubble__from cp-msg-bubble__from--client">Vous</p>
                            <p className="cp-msg-bubble__text">{msg.message}</p>
                          </div>
                        </div>
                        {msg.admin_notes && (
                          <div className="cp-msg-bubble-row cp-msg-bubble-row--right">
                            <div className="cp-msg-avatar cp-msg-avatar--support">
                              <i className="fas fa-headset"/>
                            </div>
                            <div className="cp-msg-bubble cp-msg-bubble--support">
                              <p className="cp-msg-bubble__from cp-msg-bubble__from--support">Réponse de Tictac Voyages</p>
                              <p className="cp-msg-bubble__text">{msg.admin_notes}</p>
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
                    <div className="cp-empty">
                      <i className="fas fa-heart cp-empty__icon" style={{ color:'#fca5a5' }}/>
                      <p className="cp-empty__title">Aucun favori pour l'instant</p>
                      <p className="cp-empty__sub">Cliquez sur le ❤️ dans les cartes pour sauvegarder vos préférés</p>
                    </div>
                  ) : (
                    <div className="cp-fav-grid">
                      {favorites.map(fav => {
                        const data = fav.item_data || {};
                        const typeMap = {
                          omra:    { label:'🕌 Omra',    bg:'#f5f3ff', color:'#7c3aed' },
                          voyage:  { label:'🏖️ Voyage',  bg:'#ede9fe', color:'#4338ca' },
                          circuit: { label:'🗺️ Circuit', bg:'#d1fae5', color:'#059669' },
                        };
                        const tm = typeMap[fav.item_type] || { label:fav.item_type, bg:'#f1f5f9', color:'#64748b' };
                        return (
                          <div key={fav.id} className="cp-fav-card" onClick={() => handleFavoriteOpen(fav)}>
                            {data.image && <img src={data.image} alt={data.title} className="cp-fav-card__img"/>}
                            <div className="cp-fav-card__body">
                              <div className="cp-fav-card__top">
                                <span className="cp-fav-card__type-badge" style={{ background:tm.bg, color:tm.color }}>{tm.label}</span>
                                <i className="fas fa-heart cp-fav-card__heart"/>
                              </div>
                              <p className="cp-fav-card__title">{data.title||'—'}</p>
                              {(data.pays || data.destination || data.subtitle || data.region) && (
                                <p className="cp-fav-card__sub">
                                  {[data.pays, data.destination, data.subtitle, data.region].filter(Boolean).join(' • ')}
                                </p>
                              )}
                              {data.price && <p className="cp-fav-card__price">{Number(data.price).toLocaleString('fr-TN')} TND</p>}
                              <p className="cp-fav-card__date">Ajouté le {fDate(fav.created_at)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ PROMOTIONS ═══ */}
              {activeTab === 'promotions' && (
                <div className="cp-promo-tab">
                  <div className="cp-promo-banner">
                    <div>
                      <p className="cp-promo-banner__label">Promotions actives</p>
                      <p className="cp-promo-banner__title">Nos promotions</p>
                      <p className="cp-promo-banner__sub">{promotions.length} promotion{promotions.length!==1?'s':''} disponible{promotions.length!==1?'s':''} pour votre compte</p>
                    </div>
                    <div className="cp-promo-banner__badge">
                      <i className="fas fa-ticket-alt" style={{ fontSize:18 }} />
                      <span>Codes promo visibles ici</span>
                    </div>
                  </div>

                  {promotions.length === 0 ? (
                    <div className="cp-empty">
                      <i className="fas fa-percent cp-empty__icon" />
                      <p className="cp-empty__title">Aucune promotion active pour le moment</p>
                      <p className="cp-empty__sub">Les nouvelles offres et leurs codes promo apparaîtront ici automatiquement.</p>
                    </div>
                  ) : (
                    <div className="cp-promo-grid">
                      {promotions.map((promotion) => {
                        const isPercent = promotion.type_reduction === 'pourcentage';
                        const discountLabel = isPercent
                          ? `${promotion.valeur_reduction}%`
                          : `${Number(promotion.valeur_reduction || 0).toLocaleString('fr-FR')} TND`;

                        return (
                          <div key={promotion.id} className="cp-promo-card">
                            <div className="cp-promo-card__header">
                              <div className="cp-promo-card__header-inner">
                                <div>
                                  <p className="cp-promo-card__cat">{formatPromotionCategory(promotion.categorie)}</p>
                                  <p className="cp-promo-card__title">{promotion.titre}</p>
                                </div>
                                <span className="cp-promo-card__discount">-{discountLabel}</span>
                              </div>
                            </div>
                            <div className="cp-promo-card__body">
                              {promotion.description && (
                                <p className="cp-promo-card__desc">{promotion.description}</p>
                              )}
                              <div className="cp-promo-code-box">
                                <p className="cp-promo-code-box__label">Code promo</p>
                                <div className="cp-promo-code-box__row">
                                  <span className="cp-promo-code-box__code">
                                    {promotion.code_promo || 'Aucun code requis'}
                                  </span>
                                  {promotion.code_promo && (
                                    <button onClick={() => handleCopyPromo(promotion.code_promo)} className="cp-btn-copy-promo">
                                      Copier
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="cp-promo-card__dates">
                                <span>Du {fDate(promotion.date_debut)}</span>
                                <span>Au {fDate(promotion.date_fin)}</span>
                              </div>
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
                <div className="cp-fidelite">
                  <div className="cp-loyalty-hero" style={{ background:`linear-gradient(135deg,${loyalty.color},${loyalty.color}cc)` }}>
                    <div>
                      <p className="cp-loyalty-hero__label">Votre niveau actuel</p>
                      <p className="cp-loyalty-hero__level">{loyalty.icon} {loyalty.label}</p>
                      <p className="cp-loyalty-hero__total">{totalRes} réservation{totalRes!==1?'s':''} au total</p>
                    </div>
                    {loyalty.next && (
                      <div className="cp-loyalty-progress">
                        <p className="cp-loyalty-progress__label">Progression vers le niveau suivant</p>
                        <div className="cp-loyalty-progress__track">
                          <div className="cp-loyalty-progress__fill" style={{ width:`${progressPct}%` }}/>
                        </div>
                        <p className="cp-loyalty-progress__next">{loyalty.nextLabel}</p>
                      </div>
                    )}
                  </div>

                  <div className="cp-discount-card">
                    <div className="cp-discount-card__icon">
                      <i className="fas fa-tag"/>
                    </div>
                    <div>
                      <p className="cp-discount-card__title">
                        Prochaine réduction : <span className="cp-discount-card__pct">{nextDiscount.pct}%</span>
                      </p>
                      <p className="cp-discount-card__sub">
                        Plus que <strong>{nextDiscount.remaining}</strong> réservation{nextDiscount.remaining>1?'s':''} pour débloquer votre réduction à la réservation n°{nextDiscount.at}
                      </p>
                    </div>
                  </div>

                  <div className="cp-promo-link-card">
                    <div>
                      <p className="cp-promo-link-card__title">Nos promotions</p>
                      <p className="cp-promo-link-card__sub">
                        Retrouvez toutes les promotions actives et leurs codes promo dans votre espace client.
                      </p>
                    </div>
                    <button onClick={() => handleTabChange('promotions')} className="cp-btn-promo-link">
                      Nos promotions
                    </button>
                  </div>

                  <div className="cp-rules-card">
                    <div className="cp-rules-card__header">
                      <h3 className="cp-rules-card__title">📋 Règles du programme de fidélité</h3>
                    </div>
                    <div className="cp-rules-card__body">
                      {[
                        { icon:'🌱',    level:'Niveau 0',    rule:"Nouveau client jusqu'à 2 réservations" },
                        { icon:'⭐',    level:'Niveau 1 ⭐',  rule:'À partir de 3 réservations' },
                        { icon:'⭐⭐',  level:'Niveau 2 ⭐⭐', rule:'Après 5 réservations, dès la 6ème réservation' },
                        { icon:'⭐⭐⭐', level:'Niveau 3 ⭐⭐⭐', rule:'À partir de 10 réservations' },
                      ].map(item => (
                        <div key={item.level} className={`cp-rule-row ${loyalty.label.includes(item.level) ? 'cp-rule-row--active' : 'cp-rule-row--default'}`}>
                          <span className="cp-rule-row__icon">{item.icon}</span>
                          <div>
                            <p className="cp-rule-row__level">{item.level}</p>
                            <p className="cp-rule-row__rule">{item.rule}</p>
                          </div>
                        </div>
                      ))}

                      <div className="cp-auto-discounts">
                        <p className="cp-auto-discounts__title">🎁 Réductions automatiques</p>
                        {[
                          { at:'5ème réservation',     pct:'10%', desc:'Réduction de 10% sur la 6ème réservation' },
                          { at:'10ème réservation',    pct:'20%', desc:'Réduction de 20% sur la 11ème réservation' },
                          { at:'Toutes les 3 ensuite', pct:'5%',  desc:'Réduction de 5% toutes les 3 réservations après la 10ème' },
                        ].map(r => (
                          <div key={r.at} className="cp-auto-discount-row">
                            <span className="cp-auto-discount-row__badge">{r.pct}</span>
                            <div>
                              <p className="cp-auto-discount-row__at">{r.at}</p>
                              <p className="cp-auto-discount-row__desc">{r.desc}</p>
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
    </>
  );
};

export default ClientProfile;
