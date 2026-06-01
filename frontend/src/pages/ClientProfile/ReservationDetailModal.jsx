import React from 'react';

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT   = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';

const Section = ({ title, children }) => (
  <div className="cp-msection">
    <p className="cp-msection__title">{title}</p>
    {children}
  </div>
);

const Row = ({ label, value, accent }) => value ? (
  <div className="cp-mrow">
    <span className="cp-mrow__label">{label}</span>
    <span className="cp-mrow__value" style={accent ? { color: accent } : undefined}>{value}</span>
  </div>
) : null;

const StatusBadge = ({ status }) => {
  const labels = {
    pending:   'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };
  return (
    <span className={`cp-badge cp-badge--${status}`}>
      {labels[status] || status}
    </span>
  );
};

export default function ReservationDetailModal({ reservation, type, onClose }) {
  if (!reservation) return null;
  const r = reservation;

  const renderContent = () => {

    if (type === 'omra') return (
      <>
        <Section title="Forfait Omra">
          <Row label="Forfait"         value={r.package_title || `Forfait #${r.package_id || r.id}`}/>
          <Row label="Durée"           value={r.duration ? `${r.duration} jours` : null}/>
          <Row label="Départ"          value={r.departure || null}/>
          <Row label="Chambre"         value={r.chambre_type}/>
          <Row label="Personnes"       value={`${r.number_of_persons} personne${r.number_of_persons > 1 ? 's' : ''}`}/>
          <Row label="Passeport"       value={r.passport_number || null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"         value={r.payment_method === 'online' ? '💳 Paiement en ligne' : "🏪 Paiement à l'agence"}/>
          <Row label="Statut paiement" value={r.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'} accent={r.payment_status === 'paid' ? '#059669' : '#c2410c'}/>
          <Row label="Total"           value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && <Section title="Remarques"><p className="cp-mtext">{r.notes}</p></Section>}
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
          <Row label="Personnes"   value={`${r.number_of_persons} personne${r.number_of_persons > 1 ? 's' : ''}`}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode" value={r.payment_method === 'online' ? '💳 En ligne' : "🏪 Agence"}/>
          <Row label="Total"   value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && <Section title="Remarques"><p className="cp-mtext">{r.notes}</p></Section>}
      </>
    );

    if (type === 'circuit') return (
      <>
        <Section title="Circuit Tunisie">
          <Row label="Circuit"    value={r.circuit_title || `Circuit #${r.circuit_id || r.id}`}/>
          <Row label="Région"     value={r.region === 'nord' ? '🏛️ Circuit Nord' : '🏜️ Circuit Sud'}/>
          <Row label="Durée"      value={r.duration ? `${r.duration} jours` : null}/>
          <Row label="Départ"     value={r.departure || null}/>
          <Row label="Chambre"    value={r.chambre_type}/>
          <Row label="Personnes"  value={`${r.number_of_persons} personne${r.number_of_persons > 1 ? 's' : ''}`}/>
          <Row label="Difficulté" value={r.difficulty || null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode" value={r.payment_method === 'online' ? '💳 En ligne' : "🏪 Agence"}/>
          <Row label="Total"   value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} DT` : null} accent="#0F4C5C"/>
        </Section>
        {r.notes && <Section title="Remarques"><p className="cp-mtext">{r.notes}</p></Section>}
      </>
    );

    if (type === 'transport') return (
      <>
        <Section title="Détails du transfert">
          <Row label="Type"      value={r.service_type === 'transfert' ? '🚗 Transfert' : '⏱ Mise à disposition'}/>
          <Row label="Véhicule"  value={r.vehicle_type}/>
          <Row label="Passagers" value={`${r.passengers} passager${r.passengers > 1 ? 's' : ''}`}/>
          <Row label="Bagages"   value={r.luggage > 0 ? `${r.luggage} bagage${r.luggage > 1 ? 's' : ''}` : null}/>
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
                <p className="cp-itinerary__time">{fDate(r.departure_date)} à {r.departure_time?.slice(0, 5)}</p>
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
                      {fDate(r.return_date)} {r.return_time ? `à ${r.return_time?.slice(0, 5)}` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {r.flight_train_number && <Row label="N° vol/train" value={`✈ ${r.flight_train_number}`}/>}
        </Section>
        {r.free_text && <Section title="Remarques"><p className="cp-mtext">{r.free_text}</p></Section>}
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
        {r.notes && <Section title="Remarques"><p className="cp-mtext">{r.notes}</p></Section>}
      </>
    );

    if (type === 'hotel') return (
      <>
        <Section title="Hôtel réservé">
          <Row label="Hôtel"             value={r.hotel_name || null}/>
          <Row label="Ville"             value={r.hotel_city || null}/>
          <Row label="Adresse"           value={r.hotel_location || null}/>
          <Row label="Check-in"          value={fDate(r.check_in)}/>
          <Row label="Check-out"         value={fDate(r.check_out)}/>
          <Row label="Voyageurs"         value={r.adults ? `${r.adults} adulte${r.adults > 1 ? 's' : ''}${Number(r.children || 0) > 0 ? ` + ${r.children} enfant${Number(r.children) > 1 ? 's' : ''}` : ''}` : null}/>
          <Row label="Chambres"          value={r.rooms ? `${r.rooms} chambre${r.rooms > 1 ? 's' : ''}` : null}/>
          <Row label="Type de chambre"   value={r.room_type || null}/>
          <Row label="Formule repas"     value={r.meal_plan || null}/>
          <Row label="Vue chambre"       value={r.room_view || null}/>
          <Row label="Préférence de lit" value={r.bed_preference || null}/>
          <Row label="Heure d'arrivée"   value={r.arrival_time || null}/>
          <Row label="Transfert aéroport" value={r.airport_transfer ? 'Oui' : 'Non'} accent={r.airport_transfer ? '#059669' : undefined}/>
          <Row label="Extras"            value={Array.isArray(r.selected_extras) && r.selected_extras.length ? r.selected_extras.join(', ') : null}/>
        </Section>
        <Section title="Paiement">
          <Row label="Méthode"         value={r.payment_method === 'online' ? '💳 En ligne' : "🏪 À l'agence"}/>
          <Row label="Statut paiement" value={r.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'} accent={r.payment_status === 'paid' ? '#059669' : '#c2410c'}/>
          <Row label="Total"           value={r.total_price ? `${Number(r.total_price).toLocaleString('fr-FR')} ${r.currency || ''}`.trim() : null} accent="#0F4C5C"/>
        </Section>
        {r.special_requests && <Section title="Demandes spéciales"><p className="cp-mtext">{r.special_requests}</p></Section>}
      </>
    );

    if (type === 'custom') {
      const nights = r.departure_date && r.return_date
        ? Math.ceil(Math.abs(new Date(r.return_date) - new Date(r.departure_date)) / 86400000)
        : 0;
      return (
        <>
          {(r.quoted_price || r.admin_message) && (
            <div className="cp-modal-quote">
              <p className="cp-modal-quote__label"><span>💰</span> Offre de Tictac Voyages</p>
              {r.quoted_price && <p className="cp-modal-quote__price">{Number(r.quoted_price).toLocaleString('fr-TN')} TND</p>}
              {r.admin_message && <p className="cp-modal-quote__msg">"{r.admin_message}"</p>}
            </div>
          )}
          <Section title="Voyage sur mesure">
            <Row label="Destination" value={r.destination}/>
            <Row label="Voyageurs"   value={`${r.number_of_persons} personne${r.number_of_persons > 1 ? 's' : ''}`}/>
            <Row label="Départ"      value={fDate(r.departure_date)}/>
            <Row label="Retour"      value={fDate(r.return_date)}/>
            <Row label="Durée"       value={`${nights} nuit${nights > 1 ? 's' : ''}`}/>
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

  const typeMeta = {
    omra:      { emoji:'🕌', label:'Omra',             bg:'linear-gradient(135deg,#7c3aed,#6d28d9)' },
    voyage:    { emoji:'🏖️', label:'Voyage Organisé',  bg:'linear-gradient(135deg,#4338ca,#6366f1)' },
    circuit:   { emoji:'🗺️', label:'Circuit Tunisie',  bg:'linear-gradient(135deg,#059669,#10b981)' },
    flight:    { emoji:'✈️', label:'Vol',              bg:'linear-gradient(135deg,#0F4C5C,#1ECAD3)' },
    transport: { emoji:'🚌', label:'Transport',         bg:'linear-gradient(135deg,#0F4C5C,#1a6b80)' },
    hotel:     { emoji:'🏨', label:'Hôtel',            bg:'linear-gradient(135deg,#8a1538,#e8306a)' },
    custom:    { emoji:'✈️', label:'Voyage sur Mesure', bg:'linear-gradient(135deg,#c2410c,#f97316)' },
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
                {type === 'omra'      && (r.package_title  || `Forfait Omra #${r.id}`)}
                {type === 'voyage'    && (r.voyage_title   || `Voyage #${r.id}`)}
                {type === 'circuit'   && (r.circuit_title  || `Circuit #${r.id}`)}
                {type === 'hotel'     && (r.hotel_name     || `Hotel #${r.id}`)}
                {type === 'flight'    && `${r.origin_iata  || '—'} → ${r.destination_iata || '—'}`}
                {type === 'transport' && `${r.departure_location} → ${r.arrival_location || '...'}`}
                {type === 'custom'    && r.destination}
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
}