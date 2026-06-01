import React, { useState } from 'react';
import ReservationDetailModal from './ReservationDetailModal';

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT   = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';

const StatusBadge = ({ status }) => {
  const labels = { pending:'En attente', confirmed:'Confirmé', completed:'Terminé', cancelled:'Annulé' };
  return <span className={`cp-badge cp-badge--${status}`}>{labels[status] || status}</span>;
};

const SectionHead = ({ emoji, label, count, color, bg }) => (
  <h3 className="cp-section-head" style={{ color }}>
    {emoji} {label}
    <span className="cp-section-head__count" style={{ background: bg, color }}>{count}</span>
  </h3>
);

const ResCard = ({ children, right, onClick }) => (
  <div onClick={onClick} className="cp-res-card">
    <div className="cp-res-card__left">{children}</div>
    <div className="cp-res-card__right">{right}<span className="cp-res-card__arrow">›</span></div>
  </div>
);

export default function Myreservation({
  omraRes, voyageRes, circuitRes, flightRes, hotelRes, transRes, customRes, navigate,
}) {
  const [detailModal, setDetailModal] = useState(null);

  const allReservations = [...omraRes, ...voyageRes, ...circuitRes, ...flightRes, ...hotelRes, ...transRes, ...customRes];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {detailModal && (
        <ReservationDetailModal
          reservation={detailModal.reservation}
          type={detailModal.type}
          onClose={() => setDetailModal(null)}
        />
      )}

      {allReservations.length === 0 ? (
        <div className="cp-empty">
          <i className="fas fa-suitcase cp-empty__icon" />
          <p className="cp-empty__title">Aucune réservation pour l'instant</p>
          <p className="cp-empty__sub">Explorez nos offres et faites votre première réservation !</p>
          <div className="cp-empty__actions">
            <button onClick={() => navigate('/Omra/Omra')}                     className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>Forfaits Omra</button>
            <button onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')} className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#4338ca,#6366f1)' }}>Voyages Organisés</button>
            <button onClick={() => navigate('/circuits/circuit')}               className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>Circuits Tunisie</button>
            <button onClick={() => navigate('/hotels')}                         className="cp-btn-explore" style={{ background:'linear-gradient(135deg,#8a1538,#e8306a)' }}>Hotels</button>
          </div>
        </div>
      ) : (
        <>
          <div className="cp-click-hint">
            <i className="fas fa-hand-pointer" /> Cliquez sur une réservation pour voir tous ses détails
          </div>

          {/* Omra */}
          {omraRes.length > 0 && (
            <div>
              <SectionHead emoji="🕌" label="Omra" count={omraRes.length} color="#7c3aed" bg="#f5f3ff"/>
              {omraRes.map(r => (
                <ResCard key={r.id} onClick={() => setDetailModal({ reservation: r, type: 'omra' })}
                  right={<><span className="cp-res-card__price">{r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : ''}</span><StatusBadge status={r.status}/></>}>
                  <p className="cp-res-card__title">{r.package_title || `Forfait Omra #${r.package_id || r.id}`}</p>
                  <p className="cp-res-card__sub">{r.number_of_persons} pers. · Chambre {r.chambre_type} · {r.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence'}</p>
                  <p className="cp-res-card__date">Réservé le {fDate(r.created_at)}</p>
                </ResCard>
              ))}
            </div>
          )}

          {/* Voyages */}
          {voyageRes.length > 0 && (
            <div>
              <SectionHead emoji="🏖️" label="Voyages Organisés" count={voyageRes.length} color="#4338ca" bg="#ede9fe"/>
              {voyageRes.map(r => (
                <ResCard key={r.id} onClick={() => setDetailModal({ reservation: r, type: 'voyage' })}
                  right={<><span className="cp-res-card__price">{r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} TND` : ''}</span><StatusBadge status={r.status}/></>}>
                  <p className="cp-res-card__title">{r.voyage_title || `Voyage #${r.voyage_id || r.id}`}</p>
                  <p className="cp-res-card__sub">{r.pays && `${r.pays}${r.destination ? ` · ${r.destination}` : ''} · `}{r.number_of_persons} pers. · {r.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence'}</p>
                  <p className="cp-res-card__date">Réservé le {fDate(r.created_at)}</p>
                </ResCard>
              ))}
            </div>
          )}

          {/* Circuits */}
          {circuitRes.length > 0 && (
            <div>
              <SectionHead emoji="🗺️" label="Circuits Tunisie" count={circuitRes.length} color="#059669" bg="#d1fae5"/>
              {circuitRes.map(r => (
                <ResCard key={r.id} onClick={() => setDetailModal({ reservation: r, type: 'circuit' })}
                  right={<><span className="cp-res-card__price">{r.total_price ? `${Number(r.total_price).toLocaleString('fr-TN')} DT` : ''}</span><StatusBadge status={r.status}/></>}>
                  <p className="cp-res-card__title">{r.circuit_title || `Circuit #${r.circuit_id || r.id}`}</p>
                  <p className="cp-res-card__sub">{r.region === 'nord' ? '🏛️ Circuit Nord' : '🏜️ Circuit Sud'} · {r.number_of_persons} pers.</p>
                  <p className="cp-res-card__date">Réservé le {fDate(r.created_at)}</p>
                </ResCard>
              ))}
            </div>
          )}

          {/* Hôtels */}
          {hotelRes.length > 0 && (
            <div>
              <SectionHead emoji="🏨" label="Hotels" count={hotelRes.length} color="#be185d" bg="#fff1f5"/>
              {hotelRes.map(r => (
                <ResCard key={r.id} onClick={() => setDetailModal({ reservation: r, type: 'hotel' })}
                  right={<><span className="cp-res-card__price">{r.total_price ? `${Number(r.total_price).toLocaleString('fr-FR')} ${r.currency || 'TND'}` : ''}</span><StatusBadge status={r.status}/></>}>
                  <p className="cp-res-card__title">{r.hotel_name || `Hotel #${r.id}`}</p>
                  <p className="cp-res-card__sub">{r.hotel_city || 'Tunisie'} · {fDate(r.check_in)} → {fDate(r.check_out)} · {r.rooms} chambre(s)</p>
                  <p className="cp-res-card__date">{r.room_type || 'Chambre'} · {r.meal_plan || 'Formule non précisée'}</p>
                </ResCard>
              ))}
            </div>
          )}

          {/* Vols */}
          {flightRes.length > 0 && (
            <div>
              <SectionHead emoji="✈️" label="Vols" count={flightRes.length} color="#0F4C5C" bg="#e0fbfc"/>
              {flightRes.map(r => (
                <ResCard key={r.id} onClick={() => setDetailModal({ reservation: r, type: 'flight' })}
                  right={<><span className="cp-res-card__price">{r.total_price ? `${Number(r.total_price).toLocaleString('fr-FR')} ${r.currency || ''}` : ''}</span><StatusBadge status={r.status}/></>}>
                  <p className="cp-res-card__title">{r.origin_iata || '—'} → {r.destination_iata || '—'}</p>
                  <p className="cp-res-card__sub">{r.airline_name || 'Vol'}{r.flight_number ? ` · ${r.flight_number}` : ''}</p>
                  <p className="cp-res-card__date">Départ le {fDT(r.departing_at)}</p>
                </ResCard>
              ))}
            </div>
          )}

          {/* Transport */}
          {transRes.length > 0 && (
            <div>
              <SectionHead emoji="🚌" label="Transport" count={transRes.length} color="#0e7490" bg="#e0fbfc"/>
              {transRes.map(r => (
                <ResCard key={r.id} onClick={() => setDetailModal({ reservation: r, type: 'transport' })}
                  right={<StatusBadge status={r.status}/>}>
                  <p className="cp-res-card__title">{r.departure_location || '—'} → {r.arrival_location || '—'}</p>
                  <p className="cp-res-card__sub">{r.vehicle_type} · {r.passengers} pers. · {fDate(r.departure_date)}</p>
                </ResCard>
              ))}
            </div>
          )}

          {/* Sur Mesure */}
          {customRes.length > 0 && (
            <div>
              <SectionHead emoji="✈️" label="Voyage sur Mesure" count={customRes.length} color="#c2410c" bg="#fff7ed"/>
              {customRes.map(r => (
                <ResCard key={r.id} onClick={() => setDetailModal({ reservation: r, type: 'custom' })}
                 right={<>{r.quoted_price && (
      <span className="cp-res-card__quoted-price">
        💰 {Number(r.quoted_price).toLocaleString('fr-TN')} TND
      </span>
    )}
    <StatusBadge status={r.status}/>
  </>
}>
                  <p className="cp-res-card__title">{r.destination || '—'}</p>
                  <p className="cp-res-card__sub">{fDate(r.departure_date)} → {fDate(r.return_date)} · {r.number_of_persons} pers.</p>
                  {r.admin_message && <p className="cp-res-card__admin-msg">💬 "{r.admin_message.length > 60 ? r.admin_message.slice(0, 60) + '...' : r.admin_message}"</p>}
                </ResCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}