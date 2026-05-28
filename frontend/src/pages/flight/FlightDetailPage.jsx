
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';
import '../../styles/FlightsPage.css'; 



// affichee date forme lisible
const fmt = (isoStr) => {
  if (!isoStr) return '---'; 
  return new Date(isoStr).toLocaleString('fr-FR', {
    weekday: 'short',  // "mer."
    day:     '2-digit',
    month:   'short',  // "juin"
    hour:    '2-digit',
    minute:  '2-digit',
  });
};

// Formate une date ISO en date longue
const fmtDate = (isoStr) => {
  if (!isoStr) return '---';
  return new Date(isoStr).toLocaleDateString('fr-FR', {
    day:   '2-digit',
    month: 'long',    // nom complet du mois
    year:  'numeric',
  });
};

// Convertit une durée ISO 8601 en texte lisible
// Ex: "PT2H35M" → "2h 35min"
const fmtDuration = (dur) => {
  if (!dur) return '---';

  
  const h = dur.match(/(\d+)H/)?.[1];
  const m = dur.match(/(\d+)M/)?.[1];
  return [h ? `${h}h` : '', m ? `${m}min` : '']
    .filter(Boolean)
    .join(' ')
    || dur; 
};

const FlightDetails = () => {
  const navigate  = useNavigate();
  const { state } = useLocation(); // lit les données passées par navigate(..., { state })

  // offer et searchParams passés depuis FlightListPage ou FlightSearch
  const offer        = state?.offer;
  const searchParams = state?.searchParams || {};

  if (!offer) {
    return (
      <>
        <Navbar />
        <div className="flights-guard">
          <i
            className="fas fa-exclamation-circle"
            style={{ fontSize: 48, color: 'var(--gray-300)', marginBottom: 20, display: 'block' }}
          />
          <h2 style={{ color: 'var(--gray-600)', marginBottom: 12 }}>Aucun vol sélectionné</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 28 }}>Revenez à la liste des résultats.</p>
          <button onClick={() => navigate('/flights/search')} className="flights-guard__btn">
            <i className="fas fa-arrow-left" style={{ marginRight: 8 }} />
            Rechercher un vol
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // ── Extraction des données de l'offre ───────────────────────────
  const totalAmount = parseFloat(offer.total_amount || 0);
  const currency    = offer.total_currency || 'EUR';
  const cabinClass  = offer.cabin_class || 'economy';


  const cabinLabel = {
    economy:         'Économique',
    premium_economy: 'Premium Éco',
    business:        'Affaires',
    first:           'Première',
  }[cabinClass] || cabinClass; 

  //date exp
  const expireAt = offer.expires_at ? new Date(offer.expires_at) : null;

  //Navigation vers la réservation via react router 
  
  const handleBook = () => {
    navigate('/flights/reserve', { state: { offer } });
  };

 
  return (
    <>
      <Navbar />

      
      <div className="flights-page-header" style={{ paddingBottom: 28 }}>
        <div className="container">

          <div className="omra-page-breadcrumb" style={{ paddingTop: 0, marginBottom: 14 }}>
            <button
              onClick={() => navigate('/flights/search')}
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <i className="fas fa-arrow-left" /> Recherche
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
            {/* navigate(-1) = retour dans l'historique du navigateur (comme le bouton ←) */}
            <button onClick={() => navigate(-1)} style={{ color: 'rgba(255,255,255,0.7)' }}>
              Résultats
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ color: '#fff', fontWeight: 700 }}>Détail du vol</span>
          </div>

          <h1 className="flights-page-header__title">✈️ Détail de l'offre</h1>
        </div>
      </div>

      
      <div className="container" style={{ padding: '28px 0 60px' }}>
        
        <div className="omra-reserve__layout">

          
          <div className="flights-details-left">

           
            {offer.slices?.map((slice, si) => {
              
              const firstSeg = slice.segments?.[0];
              const lastSeg  = slice.segments?.[slice.segments.length - 1];
              const stops    = slice.segments?.length - 1;

              return (
                <div key={si} className="flights-slice-card">

                  <div className="flights-slice-header">
                    <div className="flights-slice-header__title">
                      <i className="fas fa-plane" style={{ color: 'var(--secondary)', fontSize: 16 }} />
                      {si === 0 ? 'Aller' : 'Retour'} — {firstSeg?.origin?.iata_code} → {lastSeg?.destination?.iata_code}
                    </div>

                    <div className="flights-slice-header__badges">
                     
                      <span className="flights-slice-badge flights-slice-badge--duration">
                        <i className="fas fa-clock" style={{ marginRight: 4 }} />
                        {fmtDuration(slice.duration)}
                      </span>
                      <span className={`flights-slice-badge ${stops === 0 ? 'flights-slice-badge--direct' : 'flights-slice-badge--stopover'}`}>
                        {stops === 0 ? 'Direct' : `${stops} escale${stops > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  <div className="flights-slice-body">
                    {slice.segments?.map((seg, idx) => {
                      const carrier = seg.marketing_carrier; // compagnie commerciale
                      
                      const logoUrl = carrier?.logo_symbol_url || carrier?.logo_lockup_url;

                      return (
                        <div key={idx}>

                          {idx > 0 && (
                            <div className="flights-connexion-badge">
                              <i className="fas fa-exchange-alt" style={{ color: '#b07d00', fontSize: 12 }} />
                              <span>
                                Correspondance à {seg.origin?.name || seg.origin?.iata_code}
                               
                              </span>
                            </div>
                          )}

                          <div className="flights-segment-grid">

                            <div className="flights-segment-logo">
                              {logoUrl ? (
                                <img src={logoUrl} alt={carrier?.name} />
                              ) : (
                               
                                <div className="flights-segment-logo__placeholder">
                                  <i className="fas fa-plane" style={{ color: 'var(--secondary)' }} />
                                </div>
                              )}
                              
                              <p className="flights-segment-logo__number">
                                {carrier?.iata_code}{seg.marketing_carrier_flight_number}
                              </p>
                            </div>

                            
                            <div className="flights-segment-path">

                          
                              <div className="flights-segment-airport">
                                <p className="flights-segment-airport__time">
                                  {new Date(seg.departing_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                                <p className="flights-segment-airport__iata">
                                  {seg.origin?.iata_code}
                                </p>
                                <p className="flights-segment-airport__name">
                                  {seg.origin?.name}
                                </p>
                                <p className="flights-segment-airport__date">
                                  {fmtDate(seg.departing_at)}
                                </p>
                              </div>

                              
                              <div className="flights-segment-line">
                                <div className="flights-segment-line__bar" />
                             
                                <div className="flights-segment-line__info">
                                  <i className="fas fa-plane" style={{ fontSize: 10 }} /><br />
                                  {fmtDuration(seg.duration)}
                                </div>
                                <div className="flights-segment-line__bar" />
                              </div>

                              <div className="flights-segment-airport">
                                <p className="flights-segment-airport__time">
                                  {new Date(seg.arriving_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                                <p className="flights-segment-airport__iata">
                                  {seg.destination?.iata_code}
                                </p>
                                <p className="flights-segment-airport__name">
                                  {seg.destination?.name}
                                </p>
                                <p className="flights-segment-airport__date">
                                  {fmtDate(seg.arriving_at)}
                                </p>
                              </div>
                            </div>

                            <div className="flights-segment-info">
                              <span className="flights-segment-info__cabin">{cabinLabel}</span>
                              {seg.aircraft?.name && (
                                <p className="flights-segment-info__aircraft">
                                  {seg.aircraft.name}
                                </p>
                              )}
                              {carrier?.name && (
                                <p className="flights-segment-info__carrier">
                                  {carrier.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {offer.conditions && (
              <div className="flights-conditions-card">
                <h3 className="flights-conditions-card__title">
                  <i className="fas fa-file-contract" style={{ color: 'var(--secondary)' }} />
                  Conditions tarifaires
                </h3>

                <div className="flights-conditions-grid">
                  {[
                    {
                      icon:  'fa-exchange-alt',
                      label: 'Changement de billet',
                      // Construction du texte selon allowed + penalty_amount
                      val: offer.conditions.change_before_departure
                        ? (offer.conditions.change_before_departure.allowed
                            ? `Autorisé${
                                offer.conditions.change_before_departure.penalty_amount
                                  ? ` — pénalité : ${offer.conditions.change_before_departure.penalty_amount} ${offer.conditions.change_before_departure.penalty_currency}`
                                  : '' // pas de pénalité
                              }`
                            : 'Non autorisé')
                        : 'Non précisé', 
                      ok: offer.conditions.change_before_departure?.allowed,
                    
                    },
                    {
                      icon:  'fa-times-circle',
                      label: 'Remboursement avant départ',
                      val: offer.conditions.refund_before_departure
                        ? (offer.conditions.refund_before_departure.allowed
                            ? `Autorisé${
                                offer.conditions.refund_before_departure.penalty_amount
                                  ? ` — pénalité : ${offer.conditions.refund_before_departure.penalty_amount} ${offer.conditions.refund_before_departure.penalty_currency}`
                                  : ''
                              }`
                            : 'Non autorisé')
                        : 'Non précisé',
                      ok: offer.conditions.refund_before_departure?.allowed,
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={[
                        'flights-condition-item',
                        // === strict : distingue true, false, et undefined
                        c.ok === true  ? 'flights-condition-item--ok' :
                        c.ok === false ? 'flights-condition-item--no' :
                                         'flights-condition-item--na',
                      ].join(' ')}
                    >
                      <i
                        className={`fas ${c.icon}`}
                        style={{
                          color: c.ok === true  ? '#16a34a'           // vert
                               : c.ok === false ? '#dc2626'           // rouge
                               :                  'var(--gray-400)',  // gris
                          marginTop: 2,
                          fontSize:  13,
                        }}
                      />
                      <div>
                        <p className="flights-condition-item__label">{c.label}</p>
                        <p className="flights-condition-item__val">{c.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {offer.passengers?.length > 0 && (
              <div className="flights-baggage-card">
                <h3 className="flights-baggage-card__title">
                  <i className="fas fa-suitcase" style={{ color: 'var(--secondary)' }} />
                  Bagages inclus
                </h3>

                {offer.passengers.map((pax, pi) => {
                  const bags = pax.baggages || [];
                  return (
                    <div
                      key={pi}
                      // Marge basse entre passagers, sauf le dernier
                      style={{ marginBottom: pi < offer.passengers.length - 1 ? 12 : 0 }}
                    >
                      {/* Label "PASSAGER 1 (adult)" */}
                      <p className="flights-baggage__pax-label">
                        Passager {pi + 1} ({pax.type})
                      </p>

                      {bags.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                          Aucun bagage inclus
                        </p>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {bags.map((b, bi) => (
                            // Tag vert pour chaque bagage inclus
                            <span key={bi} className="flights-baggage-tag">
                              <i className="fas fa-check" style={{ fontSize: 10 }} />
                              {/* b.quantity = nombre, b.type = 'carry_on' ou 'checked' */}
                              {b.quantity}× {b.type === 'carry_on' ? 'Bagage cabine' : 'Bagage en soute'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          <div className="omra-details__sidebar">

        
            <div className="flights-price-card">

              {/* Résumé du vol : logo + route + compagnie */}
              <div className="flights-price-card__summary">
                {/* Logo affiché seulement s'il est disponible */}
                {offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.logo_symbol_url && (
                  <img
                    src={offer.slices[0].segments[0].marketing_carrier.logo_symbol_url}
                    alt=""
                  />
                )}
                <p className="flights-price-card__route">
                  {/* Aéroport de départ du premier segment */}
                  {offer.slices?.[0]?.segments?.[0]?.origin?.iata_code}
                  {' → '}
                  {/* Aéroport d'arrivée du dernier segment du dernier slice */}
                  {offer.slices?.[offer.slices.length - 1]?.segments?.slice(-1)[0]?.destination?.iata_code}
                </p>
                <p className="flights-price-card__carrier">
                  {offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.name}
                </p>
              </div>

              <div className="flights-price-breakdown">
                {[
                  {
                    label: `${offer.passengers?.length || 1} passager(s)`,
                    value: `${totalAmount.toLocaleString('fr-FR')} ${currency}`,
                    // toLocaleString('fr-FR') formate 1234.5 → "1 234,5"
                  },
                  { label: 'Taxes & frais', value: 'Inclus' },
                ].map((row, i) => (
                  <div key={i} className="flights-price-row">
                    <span className="flights-price-row__label">{row.label}</span>
                    <span className="flights-price-row__value">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flights-price-total">
                <span className="flights-price-total__label">Total</span>
                <span className="flights-price-total__amount">
                  {totalAmount.toLocaleString('fr-FR')} {currency}
                </span>
              </div>

              {/* Avertissement d'expiration — visible seulement si expireAt est défini */}
              {expireAt && (
                <div className="flights-expiry-warning">
                  <i className="fas fa-clock" />
                  Offre valable jusqu'au{' '}
                  {expireAt.toLocaleString('fr-FR', {
                    day:    '2-digit',
                    month:  'short',
                    hour:   '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}

              <button onClick={handleBook} className="flights-book-btn">
                <i className="fas fa-ticket-alt" />
                Réserver ce vol
              </button>

              <p className="flights-book-reassurance">
                <i className="fas fa-lock" style={{ marginRight: 4 }} />
                Sans frais supplémentaires
              </p>
            </div>


            <div className="flights-help-card">
              <h4>
                <i className="fas fa-headset" style={{ color: 'var(--secondary)', marginRight: 8 }} />
                Besoin d'aide ?
              </h4>
              <p>Notre équipe est disponible du lundi au samedi de 09h à 18h.</p>

              <a href="tel:+21636149885" className="flights-help-card__phone">
                <i className="fas fa-phone" /> +216 36 149 885
              </a>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default FlightDetails;