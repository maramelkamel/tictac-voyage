import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';
import '../../styles/FlightsPage.css';

const fmt = (isoStr) => {
  if (!isoStr) return '---';
  return new Date(isoStr).toLocaleString('fr-FR', {
    weekday: 'short',
    day:     '2-digit',
    month:   'short',
    hour:    '2-digit',
    minute:  '2-digit',
  });
};

const fmtDate = (isoStr) => {
  if (!isoStr) return '---';
  return new Date(isoStr).toLocaleDateString('fr-FR', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
};

const fmtDuration = (dur) => {
  if (!dur) return '---';
  const h = dur.match(/(\d+)H/)?.[1];
  const m = dur.match(/(\d+)M/)?.[1];
  return [h ? `${h}h` : '', m ? `${m}min` : '']
    .filter(Boolean)
    .join(' ') || dur;
};

const FlightDetails = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const offer        = state?.offer;
  const searchParams = state?.searchParams || {};

  if (!offer) {
    return (
      <>
        <Navbar />
        <div className="flights-guard">
          <i className="fas fa-exclamation-circle flights-guard__icon" />
          <h2 className="flights-guard__title">Aucun vol sélectionné</h2>
          <p className="flights-guard__desc">Revenez à la liste des résultats.</p>
          <button onClick={() => navigate('/flights/search')} className="flights-guard__btn">
            <i className="fas fa-arrow-left" /> Rechercher un vol
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const totalAmount = parseFloat(offer.total_amount || 0);
  const currency    = offer.total_currency || 'EUR';
  const cabinClass  = offer.cabin_class || 'economy';

  const cabinLabel = {
    economy:         'Économique',
    premium_economy: 'Premium Éco',
    business:        'Affaires',
    first:           'Première',
  }[cabinClass] || cabinClass;

  const expireAt = offer.expires_at ? new Date(offer.expires_at) : null;

  const handleBook = () => {
    navigate('/flights/reserve', { state: { offer } });
  };

  return (
    <>
      <Navbar />

      <div className="flights-page-header flights-details-header">
        <div className="container">
          <div className="omra-page-breadcrumb flights-details-breadcrumb">
            <button onClick={() => navigate('/flights/search')} className="flights-breadcrumb-btn">
              <i className="fas fa-arrow-left" /> Recherche
            </button>
            <i className="fas fa-chevron-right flights-breadcrumb-sep" />
            <button onClick={() => navigate(-1)} className="flights-breadcrumb-btn">
              Résultats
            </button>
            <i className="fas fa-chevron-right flights-breadcrumb-sep" />
            <span className="flights-breadcrumb-current">Détail du vol</span>
          </div>
          <h1 className="flights-page-header__title">✈️ Détail de l'offre</h1>
        </div>
      </div>

      <div className="container flights-details-body">
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
                      <i className="fas fa-plane flights-slice-icon" />
                      {si === 0 ? 'Aller' : 'Retour'} — {firstSeg?.origin?.iata_code} → {lastSeg?.destination?.iata_code}
                    </div>
                    <div className="flights-slice-header__badges">
                      <span className="flights-slice-badge flights-slice-badge--duration">
                        <i className="fas fa-clock" /> {fmtDuration(slice.duration)}
                      </span>
                      <span className={`flights-slice-badge ${stops === 0 ? 'flights-slice-badge--direct' : 'flights-slice-badge--stopover'}`}>
                        {stops === 0 ? 'Direct' : `${stops} escale${stops > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  <div className="flights-slice-body">
                    {slice.segments?.map((seg, idx) => {
                      const carrier = seg.marketing_carrier;
                      const logoUrl = carrier?.logo_symbol_url || carrier?.logo_lockup_url;

                      return (
                        <div key={idx}>
                          {idx > 0 && (
                            <div className="flights-connexion-badge">
                              <i className="fas fa-exchange-alt flights-connexion-icon" />
                              <span>Correspondance à {seg.origin?.name || seg.origin?.iata_code}</span>
                            </div>
                          )}

                          <div className="flights-segment-grid">
                            <div className="flights-segment-logo">
                              {logoUrl ? (
                                <img src={logoUrl} alt={carrier?.name} />
                              ) : (
                                <div className="flights-segment-logo__placeholder">
                                  <i className="fas fa-plane" />
                                </div>
                              )}
                              <p className="flights-segment-logo__number">
                                {carrier?.iata_code}{seg.marketing_carrier_flight_number}
                              </p>
                            </div>

                            <div className="flights-segment-path">
                              <div className="flights-segment-airport">
                                <p className="flights-segment-airport__time">
                                  {new Date(seg.departing_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="flights-segment-airport__iata">{seg.origin?.iata_code}</p>
                                <p className="flights-segment-airport__name">{seg.origin?.name}</p>
                                <p className="flights-segment-airport__date">{fmtDate(seg.departing_at)}</p>
                              </div>

                              <div className="flights-segment-line">
                                <div className="flights-segment-line__bar" />
                                <div className="flights-segment-line__info">
                                  <i className="fas fa-plane" /><br />
                                  {fmtDuration(seg.duration)}
                                </div>
                                <div className="flights-segment-line__bar" />
                              </div>

                              <div className="flights-segment-airport">
                                <p className="flights-segment-airport__time">
                                  {new Date(seg.arriving_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="flights-segment-airport__iata">{seg.destination?.iata_code}</p>
                                <p className="flights-segment-airport__name">{seg.destination?.name}</p>
                                <p className="flights-segment-airport__date">{fmtDate(seg.arriving_at)}</p>
                              </div>
                            </div>

                            <div className="flights-segment-info">
                              <span className="flights-segment-info__cabin">{cabinLabel}</span>
                              {seg.aircraft?.name && (
                                <p className="flights-segment-info__aircraft">{seg.aircraft.name}</p>
                              )}
                              {carrier?.name && (
                                <p className="flights-segment-info__carrier">{carrier.name}</p>
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
                  <i className="fas fa-file-contract" /> Conditions tarifaires
                </h3>
                <div className="flights-conditions-grid">
                  {[
                    {
                      icon:  'fa-exchange-alt',
                      label: 'Changement de billet',
                      val: offer.conditions.change_before_departure
                        ? (offer.conditions.change_before_departure.allowed
                            ? `Autorisé${offer.conditions.change_before_departure.penalty_amount ? ` — pénalité : ${offer.conditions.change_before_departure.penalty_amount} ${offer.conditions.change_before_departure.penalty_currency}` : ''}`
                            : 'Non autorisé')
                        : 'Non précisé',
                      ok: offer.conditions.change_before_departure?.allowed,
                    },
                    {
                      icon:  'fa-times-circle',
                      label: 'Remboursement avant départ',
                      val: offer.conditions.refund_before_departure
                        ? (offer.conditions.refund_before_departure.allowed
                            ? `Autorisé${offer.conditions.refund_before_departure.penalty_amount ? ` — pénalité : ${offer.conditions.refund_before_departure.penalty_amount} ${offer.conditions.refund_before_departure.penalty_currency}` : ''}`
                            : 'Non autorisé')
                        : 'Non précisé',
                      ok: offer.conditions.refund_before_departure?.allowed,
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={['flights-condition-item',
                        c.ok === true  ? 'flights-condition-item--ok' :
                        c.ok === false ? 'flights-condition-item--no' :
                                         'flights-condition-item--na',
                      ].join(' ')}
                    >
                      <i className={`fas ${c.icon} ${
                        c.ok === true  ? 'flights-condition-icon--ok' :
                        c.ok === false ? 'flights-condition-icon--no' :
                                         'flights-condition-icon--na'
                      }`} />
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
                  <i className="fas fa-suitcase" /> Bagages inclus
                </h3>
                {offer.passengers.map((pax, pi) => {
                  const bags = pax.baggages || [];
                  return (
                    <div key={pi} className="flights-baggage-pax">
                      <p className="flights-baggage__pax-label">Passager {pi + 1} ({pax.type})</p>
                      {bags.length === 0 ? (
                        <p className="flights-baggage-empty">Aucun bagage inclus</p>
                      ) : (
                        <div className="flights-baggage-tags">
                          {bags.map((b, bi) => (
                            <span key={bi} className="flights-baggage-tag">
                              <i className="fas fa-check" />
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
              <div className="flights-price-card__summary">
                {offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.logo_symbol_url && (
                  <img src={offer.slices[0].segments[0].marketing_carrier.logo_symbol_url} alt="" />
                )}
                <p className="flights-price-card__route">
                  {offer.slices?.[0]?.segments?.[0]?.origin?.iata_code}
                  {' → '}
                  {offer.slices?.[offer.slices.length - 1]?.segments?.slice(-1)[0]?.destination?.iata_code}
                </p>
                <p className="flights-price-card__carrier">
                  {offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.name}
                </p>
              </div>

              <div className="flights-price-breakdown">
                {[
                  { label: `${offer.passengers?.length || 1} passager(s)`, value: `${totalAmount.toLocaleString('fr-FR')} ${currency}` },
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

              {expireAt && (
                <div className="flights-expiry-warning">
                  <i className="fas fa-clock" />
                  Offre valable jusqu'au{' '}
                  {expireAt.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

              <button onClick={handleBook} className="flights-book-btn">
                <i className="fas fa-ticket-alt" /> Réserver ce vol
              </button>

              <p className="flights-book-reassurance">
                <i className="fas fa-lock flights-lock-icon" />
                Sans frais supplémentaires
              </p>
            </div>

            <div className="flights-help-card">
              <h4>
                <i className="fas fa-headset flights-help-icon" />
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