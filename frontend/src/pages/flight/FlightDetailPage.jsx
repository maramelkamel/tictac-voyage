import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const fmt = (isoStr) => {
  if (!isoStr) return '---';
  return new Date(isoStr).toLocaleString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const fmtDate = (isoStr) => {
  if (!isoStr) return '---';
  return new Date(isoStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Convert ISO 8601 duration PT2H35M → "2h 35min"
const fmtDuration = (dur) => {
  if (!dur) return '---';
  const h = dur.match(/(\d+)H/)?.[1];
  const m = dur.match(/(\d+)M/)?.[1];
  return [h ? `${h}h` : '', m ? `${m}min` : ''].filter(Boolean).join(' ') || dur;
};

const FlightDetails = () => {
  const navigate     = useNavigate();
  const { state }    = useLocation();

  const offer        = state?.offer;
  const searchParams = state?.searchParams || {};

  if (!offer) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 160, textAlign: 'center', minHeight: '60vh' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: 48, color: 'var(--gray-300)', marginBottom: 20, display: 'block' }} />
          <h2 style={{ color: 'var(--gray-600)', marginBottom: 12 }}>Aucun vol sélectionné</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 28 }}>Revenez à la liste des résultats.</p>
          <button onClick={() => navigate('/flights/search')}
            style={{ padding: '14px 32px', background: 'var(--secondary)', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            <i className="fas fa-arrow-left" style={{ marginRight: 8 }} />Rechercher un vol
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const totalAmount  = parseFloat(offer.total_amount || 0);
  const currency     = offer.total_currency || 'EUR';
  const cabinClass   = offer.cabin_class || 'economy';
  const cabinLabel   = { economy: 'Économique', premium_economy: 'Premium Éco', business: 'Affaires', first: 'Première' }[cabinClass] || cabinClass;
  const expireAt     = offer.expires_at ? new Date(offer.expires_at) : null;

  const handleBook = () => {
    navigate('/flights/reserve', { state: { offer } });
  };

  return (
    <>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f3460 100%)',
        paddingTop: 110, paddingBottom: 28 }}>
        <div className="container">
          <div className="omra-page-breadcrumb" style={{ paddingTop: 0, marginBottom: 14 }}>
            <button onClick={() => navigate('/flights/search')} style={{ color: 'rgba(255,255,255,0.7)' }}>
              <i className="fas fa-arrow-left" /> Recherche
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
            <button onClick={() => navigate(-1)} style={{ color: 'rgba(255,255,255,0.7)' }}>Résultats</button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ color: '#fff', fontWeight: 700 }}>Détail du vol</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
            ✈️ Détail de l'offre
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 0 60px' }}>
        <div className="omra-reserve__layout">

          {/* LEFT — Slices detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {offer.slices?.map((slice, si) => {
              const firstSeg = slice.segments?.[0];
              const lastSeg  = slice.segments?.[slice.segments.length - 1];
              const stops    = slice.segments?.length - 1;

              return (
                <div key={si} style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                  {/* Slice header */}
                  <div style={{ background: 'linear-gradient(135deg, var(--primary), #0f3460)',
                    padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <i className="fas fa-plane" style={{ color: 'var(--secondary)', fontSize: 16 }} />
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>
                        {si === 0 ? 'Aller' : 'Retour'} — {firstSeg?.origin?.iata_code} → {lastSeg?.destination?.iata_code}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 12,
                        padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                        <i className="fas fa-clock" style={{ marginRight: 4 }} />{fmtDuration(slice.duration)}
                      </span>
                      <span style={{ background: stops === 0 ? 'rgba(26,138,74,0.8)' : 'rgba(176,125,0,0.8)',
                        color: '#fff', borderRadius: 12, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                        {stops === 0 ? 'Direct' : `${stops} escale${stops > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  {/* Segments */}
                  <div style={{ padding: 20 }}>
                    {slice.segments?.map((seg, idx) => {
                      const carrier  = seg.marketing_carrier;
                      const logoUrl  = carrier?.logo_symbol_url || carrier?.logo_lockup_url;

                      return (
                        <div key={idx}>
                          {/* Connexion badge */}
                          {idx > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0',
                              padding: '8px 14px', background: '#fff8e1', borderRadius: 8,
                              border: '1px solid #fde68a' }}>
                              <i className="fas fa-exchange-alt" style={{ color: '#b07d00', fontSize: 12 }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#b07d00' }}>
                                Correspondance à {seg.origin?.name || seg.origin?.iata_code}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
                            {/* Airline logo */}
                            <div style={{ textAlign: 'center', minWidth: 64 }}>
                              {logoUrl ? (
                                <img src={logoUrl} alt={carrier?.name}
                                  style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8,
                                    border: '1px solid #f1f5f9', padding: 4 }} />
                              ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f1f5f9',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="fas fa-plane" style={{ color: 'var(--secondary)' }} />
                                </div>
                              )}
                              <p style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 4, fontWeight: 600 }}>
                                {carrier?.iata_code}{seg.marketing_carrier_flight_number}
                              </p>
                            </div>

                            {/* Flight path */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                              {/* Departure */}
                              <div style={{ textAlign: 'center', minWidth: 80 }}>
                                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-800)', margin: 0, lineHeight: 1 }}>
                                  {new Date(seg.departing_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', margin: '2px 0' }}>
                                  {seg.origin?.iata_code}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: 0 }}>
                                  {seg.origin?.name}
                                </p>
                                <p style={{ fontSize: 10, color: 'var(--gray-400)', margin: 0 }}>
                                  {fmtDate(seg.departing_at)}
                                </p>
                              </div>

                              {/* Line */}
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                                <div style={{ padding: '0 8px', color: 'var(--gray-400)', fontSize: 11, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                  <i className="fas fa-plane" style={{ fontSize: 10 }} /><br />
                                  {fmtDuration(seg.duration)}
                                </div>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                              </div>

                              {/* Arrival */}
                              <div style={{ textAlign: 'center', minWidth: 80 }}>
                                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-800)', margin: 0, lineHeight: 1 }}>
                                  {new Date(seg.arriving_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', margin: '2px 0' }}>
                                  {seg.destination?.iata_code}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: 0 }}>
                                  {seg.destination?.name}
                                </p>
                                <p style={{ fontSize: 10, color: 'var(--gray-400)', margin: 0 }}>
                                  {fmtDate(seg.arriving_at)}
                                </p>
                              </div>
                            </div>

                            {/* Cabin / Aircraft */}
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ display: 'inline-block', background: '#f0f9ff', color: '#0369a1',
                                borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                                {cabinLabel}
                              </span>
                              {seg.aircraft?.name && (
                                <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: 0 }}>
                                  {seg.aircraft.name}
                                </p>
                              )}
                              {carrier?.name && (
                                <p style={{ fontSize: 11, color: 'var(--gray-500)', margin: '2px 0 0', fontWeight: 600 }}>
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

            {/* Conditions tarifaires */}
            {offer.conditions && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 20,
                border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-700)', marginBottom: 14,
                  textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-file-contract" style={{ color: 'var(--secondary)' }} />
                  Conditions tarifaires
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    {
                      icon: 'fa-exchange-alt',
                      label: 'Changement de billet',
                      val: offer.conditions.change_before_departure
                        ? (offer.conditions.change_before_departure.allowed
                            ? `Autorisé${offer.conditions.change_before_departure.penalty_amount ? ` — pénalité : ${offer.conditions.change_before_departure.penalty_amount} ${offer.conditions.change_before_departure.penalty_currency}` : ''}`
                            : 'Non autorisé')
                        : 'Non précisé',
                      ok: offer.conditions.change_before_departure?.allowed,
                    },
                    {
                      icon: 'fa-times-circle',
                      label: 'Remboursement avant départ',
                      val: offer.conditions.refund_before_departure
                        ? (offer.conditions.refund_before_departure.allowed
                            ? `Autorisé${offer.conditions.refund_before_departure.penalty_amount ? ` — pénalité : ${offer.conditions.refund_before_departure.penalty_amount} ${offer.conditions.refund_before_departure.penalty_currency}` : ''}`
                            : 'Non autorisé')
                        : 'Non précisé',
                      ok: offer.conditions.refund_before_departure?.allowed,
                    },
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px',
                      background: c.ok === true ? '#f0fdf4' : c.ok === false ? '#fef2f2' : '#f8fafc',
                      borderRadius: 10, border: `1px solid ${c.ok === true ? '#bbf7d0' : c.ok === false ? '#fecaca' : '#e2e8f0'}` }}>
                      <i className={`fas ${c.icon}`}
                        style={{ color: c.ok === true ? '#16a34a' : c.ok === false ? '#dc2626' : 'var(--gray-400)', marginTop: 2, fontSize: 13 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', margin: '0 0 2px' }}>{c.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--gray-500)', margin: 0 }}>{c.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bagages par passager */}
            {offer.passengers?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 20,
                border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-700)', marginBottom: 14,
                  textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-suitcase" style={{ color: 'var(--secondary)' }} />
                  Bagages inclus
                </h3>
                {offer.passengers.map((pax, pi) => {
                  const bags = pax.baggages || [];
                  return (
                    <div key={pi} style={{ marginBottom: pi < offer.passengers.length - 1 ? 12 : 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Passager {pi + 1} ({pax.type})
                      </p>
                      {bags.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Aucun bagage inclus</p>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {bags.map((b, bi) => (
                            <span key={bi} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
                              padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                              <i className="fas fa-check" style={{ fontSize: 10 }} />
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

          {/* RIGHT — Sidebar price + CTA */}
          <div className="omra-details__sidebar">

            {/* Price card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24,
              border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 16 }}>

              {/* Flight summary */}
              <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                {offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.logo_symbol_url && (
                  <img
                    src={offer.slices[0].segments[0].marketing_carrier.logo_symbol_url}
                    alt=""
                    style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8,
                      border: '1px solid #f1f5f9', padding: 4, marginBottom: 10 }}
                  />
                )}
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-800)', margin: '0 0 4px' }}>
                  {offer.slices?.[0]?.segments?.[0]?.origin?.iata_code} → {
                    offer.slices?.[offer.slices.length - 1]?.segments?.slice(-1)[0]?.destination?.iata_code
                  }
                </p>
                <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: 0 }}>
                  {offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.name}
                </p>
              </div>

              {/* Price breakdown */}
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: `${offer.passengers?.length || 1} passager(s)`, value: `${totalAmount.toLocaleString('fr-FR')} ${currency}` },
                  { label: 'Taxes & frais',                                 value: 'Inclus' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px dashed #f1f5f9', fontSize: 13 }}>
                    <span style={{ color: 'var(--gray-500)' }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--gray-700)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, color: 'var(--gray-700)' }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--secondary)' }}>
                  {totalAmount.toLocaleString('fr-FR')} {currency}
                </span>
              </div>

              {/* Expiry warning */}
              {expireAt && (
                <div style={{ background: '#fff8e1', border: '1px solid #fde68a', borderRadius: 8,
                  padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#b07d00',
                  display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fas fa-clock" />
                  Offre valable jusqu'au {expireAt.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

              <button onClick={handleBook}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e92f64, #c2185b)',
                  color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="fas fa-ticket-alt" />
                Réserver ce vol
              </button>
              <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 10 }}>
                <i className="fas fa-lock" style={{ marginRight: 4 }} />Sans frais supplémentaires
              </p>
            </div>

            {/* Help */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20,
              border: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>
                <i className="fas fa-headset" style={{ color: 'var(--secondary)', marginRight: 8 }} />Besoin d'aide ?
              </h4>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 12 }}>
                Notre équipe est disponible du lundi au samedi de 09h à 18h.
              </p>
              <a href="tel:+21636149885"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
                  fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none' }}>
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
