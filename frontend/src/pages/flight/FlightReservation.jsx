import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const FlightReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Offer passed from the search/results page via navigate(path, { state: { offer } })
  const offer = location.state?.offer;

  const clientData = (() => {
    try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; }
  })();
  const clientEmail = clientData?.email || '';

  const [passengers, setPassengers] = useState([
    {
      title: 'mr',
      given_name: clientData?.first_name || '',
      family_name: clientData?.last_name || '',
      born_on: '',
      gender: 'm',
      email: clientEmail,
      phone_number: clientData?.phone || '',
      passport_number: '',
      passport_expires: '',
      passport_issuing_country: 'TN',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const updatePassenger = (index, field, value) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  if (!offer) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 160, textAlign: 'center', minHeight: '60vh' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: 48, color: 'var(--gray-300)', marginBottom: 20, display: 'block' }} />
          <h2 style={{ color: 'var(--gray-600)', marginBottom: 12 }}>Aucun vol sélectionné</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 28 }}>Veuillez choisir un vol depuis la page de recherche.</p>
          <button onClick={() => navigate('/flights/search')}
            style={{ padding: '14px 32px', background: 'var(--secondary)', color: 'var(--white)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            <i className="fas fa-arrow-left" /> Retour à la recherche
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // Extract key info from Duffel offer
  const slice = offer.slices?.[0];
  const segment = slice?.segments?.[0];
  const origin = segment?.origin?.iata_code || '---';
  const destination = segment?.destination?.iata_code || '---';
  const departureAt = segment?.departing_at ? new Date(segment.departing_at).toLocaleString('fr-FR') : '---';
  const totalAmount = parseFloat(offer.total_amount || 0);
  const currency = offer.total_currency || 'EUR';
  const airline = segment?.marketing_carrier?.name || 'Compagnie aérienne';
  const flightNumber = `${segment?.marketing_carrier_flight_number || ''}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/flights/payment', {
        state: {
          offer,
          passengers,
          flightInfo: { origin, destination, departureAt, airline, flightNumber, totalAmount, currency },
        },
      });
    }, 600);
  };

  const lockedStyle = { background: '#f8fafc', cursor: 'not-allowed', color: '#64748b', borderColor: '#e2e8f0' };

  return (
    <>
      <Navbar />
      <div className="omra-reserve">
        <div className="container">
          {/* Breadcrumb */}
          <div className="omra-page-breadcrumb" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/flights/search')}><i className="fas fa-arrow-left" /> Recherche vols</button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'var(--gray-400)' }} />
            <button onClick={() => navigate(-1)} style={{ color: 'var(--gray-500)' }}>Résultats</button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'var(--gray-400)' }} />
            <span style={{ color: 'var(--gray-700)', fontWeight: 700 }}>Réservation</span>
          </div>

          {clientEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#e0fbfc', border: '1px solid #a5f3fc', borderRadius: 12, marginBottom: 20 }}>
              <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
              <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                Connecté en tant que <strong>{clientEmail}</strong> — vos informations ont été pré-remplies.
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">
            {/* LEFT — Form */}
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <h1 className="omra-reserve__form-header-title">
                    <i className="fas fa-plane" style={{ marginRight: 10, color: 'var(--secondary)' }} />
                    Informations passager{passengers.length > 1 ? 's' : ''}
                  </h1>
                  <p className="omra-reserve__form-header-desc">
                    Remplissez les informations exactement comme sur votre passeport. Vous choisirez votre mode de paiement à l'étape suivante.
                  </p>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
                  {passengers.map((pax, index) => (
                    <div key={index} style={{ marginBottom: 32 }}>
                      {passengers.length > 1 && (
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                          <i className="fas fa-user" style={{ marginRight: 8 }} />
                          Passager {index + 1}
                        </p>
                      )}

                      {/* Identity */}
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                        <i className="fas fa-id-card" style={{ marginRight: 8 }} />Identité
                      </p>
                      <div className="omra-reserve__form-row">
                        <div className="omra-reserve__field">
                          <label>Civilité *</label>
                          <select required value={pax.title} onChange={(e) => updatePassenger(index, 'title', e.target.value)}>
                            <option value="mr">M.</option>
                            <option value="ms">Mme</option>
                            <option value="mrs">Mme (marié)</option>
                            <option value="miss">Mlle</option>
                            <option value="dr">Dr.</option>
                          </select>
                        </div>
                        <div className="omra-reserve__field">
                          <label>Genre *</label>
                          <select required value={pax.gender} onChange={(e) => updatePassenger(index, 'gender', e.target.value)}>
                            <option value="m">Homme</option>
                            <option value="f">Femme</option>
                          </select>
                        </div>
                      </div>
                      <div className="omra-reserve__form-row" style={{ marginTop: 16 }}>
                        <div className="omra-reserve__field">
                          <label>Prénom (comme sur passeport) *</label>
                          <input required value={pax.given_name} onChange={(e) => updatePassenger(index, 'given_name', e.target.value)} placeholder="PRÉNOM" style={{ textTransform: 'uppercase' }} />
                        </div>
                        <div className="omra-reserve__field">
                          <label>Nom (comme sur passeport) *</label>
                          <input required value={pax.family_name} onChange={(e) => updatePassenger(index, 'family_name', e.target.value)} placeholder="NOM" style={{ textTransform: 'uppercase' }} />
                        </div>
                      </div>
                      <div className="omra-reserve__form-row" style={{ marginTop: 16 }}>
                        <div className="omra-reserve__field">
                          <label>Date de naissance *</label>
                          <input required type="date" value={pax.born_on} onChange={(e) => updatePassenger(index, 'born_on', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ height: 1, background: 'var(--gray-100)', margin: '20px 0' }} />

                      {/* Contact */}
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                        <i className="fas fa-address-book" style={{ marginRight: 8 }} />Contact
                      </p>
                      <div className="omra-reserve__form-row">
                        <div className="omra-reserve__field">
                          <label>Téléphone *</label>
                          <input required type="tel" value={pax.phone_number} onChange={(e) => updatePassenger(index, 'phone_number', e.target.value)} placeholder="+216 XX XXX XXX" />
                        </div>
                        <div className="omra-reserve__field">
                          <label>
                            Email *
                            {index === 0 && clientEmail && (
                              <span style={{ marginLeft: 8, fontSize: 10, background: '#e0fbfc', color: '#0e7490', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
                                <i className="fas fa-lock" style={{ marginRight: 3 }} />Lié au compte
                              </span>
                            )}
                          </label>
                          <input
                            required type="email"
                            value={pax.email}
                            onChange={(e) => !(index === 0 && clientEmail) && updatePassenger(index, 'email', e.target.value)}
                            readOnly={index === 0 && !!clientEmail}
                            style={index === 0 && clientEmail ? lockedStyle : {}}
                            placeholder="email@exemple.com"
                          />
                        </div>
                      </div>

                      <div style={{ height: 1, background: 'var(--gray-100)', margin: '20px 0' }} />

                      {/* Passport */}
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                        <i className="fas fa-passport" style={{ marginRight: 8 }} />Passeport
                      </p>
                      <div className="omra-reserve__form-row">
                        <div className="omra-reserve__field">
                          <label>N° Passeport *</label>
                          <input required value={pax.passport_number} onChange={(e) => updatePassenger(index, 'passport_number', e.target.value)} placeholder="Ex : AB123456" />
                        </div>
                        <div className="omra-reserve__field">
                          <label>Pays délivrance *</label>
                          <input required value={pax.passport_issuing_country} onChange={(e) => updatePassenger(index, 'passport_issuing_country', e.target.value)} placeholder="TN" maxLength={2} style={{ textTransform: 'uppercase' }} />
                        </div>
                      </div>
                      <div className="omra-reserve__form-row" style={{ marginTop: 16 }}>
                        <div className="omra-reserve__field">
                          <label>Date d'expiration passeport *</label>
                          <input required type="date" value={pax.passport_expires} onChange={(e) => updatePassenger(index, 'passport_expires', e.target.value)} />
                        </div>
                      </div>

                      {index < passengers.length - 1 && <div style={{ height: 2, background: 'var(--gray-100)', margin: '24px 0' }} />}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <input type="checkbox" id="terms" required style={{ marginTop: 3, accentColor: 'var(--secondary)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }} />
                    <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, cursor: 'pointer' }}>
                      J'accepte les <a href="#" style={{ color: 'var(--secondary)' }}>conditions générales de vente</a> et la{' '}
                      <a href="#" style={{ color: 'var(--secondary)' }}>politique de confidentialité</a> de TICTAC VOYAGES.
                    </label>
                  </div>

                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading ? 'Chargement…' : <><i className="fas fa-credit-card" style={{ marginRight: 8 }} />Continuer vers le paiement →</>}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>
                    <i className="fas fa-lock" style={{ marginRight: 5 }} />Étape suivante : choisissez votre mode de paiement.
                  </p>
                </form>
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div className="omra-details__sidebar">
              <div className="omra-reserve__pkg-card">
                <div className="omra-reserve__pkg-info" style={{ padding: 20 }}>
                  <h3 className="omra-reserve__pkg-title" style={{ fontSize: 16, marginBottom: 6 }}>
                    ✈️ {origin} → {destination}
                  </h3>
                  <p className="omra-reserve__pkg-subtitle">{airline} {flightNumber && `· Vol ${flightNumber}`}</p>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item"><i className="fas fa-calendar-alt" /> Départ : {departureAt}</div>
                    <div className="omra-reserve__pkg-meta-item"><i className="fas fa-users" /> {offer.passengers?.length || 1} passager{(offer.passengers?.length || 1) > 1 ? 's' : ''}</div>
                    <div className="omra-reserve__pkg-meta-item"><i className="fas fa-tag" /> Classe : {offer.cabin_class || 'Economy'}</div>
                  </div>
                </div>
              </div>

              <div className="omra-reserve__summary">
                <p className="omra-reserve__summary-title">Récapitulatif du prix</p>
                <div className="omra-reserve__summary-row">
                  <span>Prix total</span>
                  <span style={{ fontWeight: 700, color: 'var(--white)' }}>{totalAmount.toLocaleString('fr-FR')} {currency}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Taxes & frais</span>
                  <span style={{ fontWeight: 700, color: 'var(--white)' }}>Inclus</span>
                </div>
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total</span>
                  <span className="omra-reserve__summary-total-amount">{totalAmount.toLocaleString('fr-FR')} {currency}</span>
                </div>
              </div>

              <div style={{ marginTop: 20, background: 'var(--white)', borderRadius: 16, padding: 20, border: '1px solid var(--gray-100)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14 }}>
                  <i className="fas fa-headset" style={{ color: 'var(--secondary)', marginRight: 8 }} />Besoin d'aide ?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 14 }}>
                  Notre équipe est disponible du lundi au samedi de 09h à 18h.
                </p>
                <a href="tel:+21636149885" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none' }}>
                  <i className="fas fa-phone" /> +216 36 149 885
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FlightReservation;