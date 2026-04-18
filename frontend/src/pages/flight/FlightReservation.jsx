// src/pages/flights/FlightReservation.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';
import '../../styles/FlightsPage.css';

const API = 'http://localhost:5000/api/flights';

// ── E.164 normalizer ─────────────────────────────────────────────
const toE164 = (raw = '') => {
  let s = String(raw).replace(/[\s\-().]/g, '');
  if (/^[2345789]\d{7}$/.test(s)) s = '+216' + s; // bare Tunisian 8-digit
  if (!s.startsWith('+'))          s = '+' + s;
  return s;
};
const isValidE164 = (p) => /^\+[1-9]\d{4,14}$/.test(p);

// ── Offer re-check ─────────────────────────────────────────────
const checkOffer = async (offerId, token) => {
  const r = await fetch(`${API}/offer/${offerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.message || 'Offre introuvable');
  return j.offer;
};

const FlightReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const offer    = location.state?.offer;

  const clientData = (() => {
    try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; }
  })();
  const clientEmail = clientData?.email || '';
  const token       = localStorage.getItem('token') || '';

  // ── Offer expiry countdown (Duffel offers live ~30 min) ────────
  const [secondsLeft, setSecondsLeft]   = useState(25 * 60); // 25-min conservative
  const [offerExpired, setOfferExpired] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!offer) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); setOfferExpired(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [offer]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const [passengers, setPassengers] = useState([{
    title:                    'mr',
    given_name:               clientData?.first_name || '',
    family_name:              clientData?.last_name  || '',
    born_on:                  clientData?.born_on    || '',
    gender:                   'm',
    email:                    clientEmail,
    phone_number:             clientData?.phone      || '+216',   // ← default +216
    passport_number:          '',
    passport_expires:         '',
    passport_issuing_country: 'TN',
  }]);

  const [loading,    setLoading]    = useState(false);
  const [formError,  setFormError]  = useState('');
  const [checkingOffer, setCheckingOffer] = useState(false);

  const updatePassenger = (i, field, value) => {
    if (formError) setFormError('');
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  // ── Full validation — all errors appear HERE ───────────────────
  const validate = () => {
    for (const [i, pax] of passengers.entries()) {
      const n = i + 1;
      if (!pax.given_name?.trim())   return `Prénom manquant (passager ${n})`;
      if (!pax.family_name?.trim())  return `Nom manquant (passager ${n})`;
      if (!pax.born_on)              return `Date de naissance manquante (passager ${n})`;
      if (!pax.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pax.email))
                                     return `Email invalide (passager ${n})`;
      const e164 = toE164(pax.phone_number || '');
      if (!isValidE164(e164))
        return `Téléphone invalide (passager ${n}) — ex: +216 36 149 885`;
      if (!pax.passport_number?.trim())
                                     return `N° passeport manquant (passager ${n})`;
      if (!pax.passport_expires)     return `Expiration passeport manquante (passager ${n})`;
      if (pax.passport_expires <= new Date().toISOString().split('T')[0])
                                     return `Passeport expiré (passager ${n})`;
      if (!pax.passport_issuing_country?.trim())
                                     return `Pays de délivrance manquant (passager ${n})`;
    }
    return '';
  };

  if (!offer) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop:160, textAlign:'center', minHeight:'60vh' }}>
          <span style={{ fontSize:48, display:'block', marginBottom:16 }}>✈️</span>
          <h2 style={{ color:'#0F4C5C', marginBottom:12 }}>Aucun vol sélectionné</h2>
          <button onClick={() => navigate('/flights/search')}
            style={{ padding:'14px 32px', background:'#0F4C5C', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Retour à la recherche
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // ── Offer expired screen ────────────────────────────────────────
  if (offerExpired) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop:140, textAlign:'center', minHeight:'60vh', padding:'140px 24px' }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'48px 36px', maxWidth:460, margin:'0 auto', boxShadow:'0 8px 40px rgba(0,0,0,.1)' }}>
            <span style={{ fontSize:48, display:'block', marginBottom:16 }}>⏰</span>
            <h2 style={{ color:'#c2410c', fontSize:22, fontWeight:800, marginBottom:8 }}>Offre expirée</h2>
            <p style={{ color:'#64748b', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
              Les disponibilités changent rapidement. Cette offre n'est plus disponible.<br/>
              Veuillez effectuer une nouvelle recherche pour trouver les derniers tarifs.
            </p>
            <button onClick={() => navigate('/flights/search')}
              style={{ padding:'13px 28px', background:'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', width:'100%' }}>
              Nouvelle recherche →
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Extract offer info
  const slice        = offer.slices?.[0];
  const segment      = slice?.segments?.[0];
  const origin       = segment?.origin?.iata_code      || '---';
  const destination  = segment?.destination?.iata_code || '---';
  const departureAt  = segment?.departing_at ? new Date(segment.departing_at).toLocaleString('fr-FR') : '---';
  const totalAmount  = parseFloat(offer.total_amount   || 0);
  const currency     = offer.total_currency            || 'EUR';
  const airline      = segment?.marketing_carrier?.name || 'Compagnie aérienne';
  const flightNumber = segment?.marketing_carrier_flight_number || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setLoading(true);
    setFormError('');

    // ── Re-check offer is still live before going to payment ──
    setCheckingOffer(true);
    try {
      await checkOffer(offer.id, token);
    } catch {
      setOfferExpired(true);
      setLoading(false);
      setCheckingOffer(false);
      return;
    }
    setCheckingOffer(false);

    const normalizedPassengers = passengers.map(p => ({
      ...p,
      phone_number:             toE164(p.phone_number),
      given_name:               p.given_name.toUpperCase(),
      family_name:              p.family_name.toUpperCase(),
      passport_issuing_country: p.passport_issuing_country.toUpperCase(),
    }));

    setLoading(false);
    navigate('/flights/payment', {
      state: {
        offer,
        passengers: normalizedPassengers,
        flightInfo: { origin, destination, departureAt, airline, flightNumber, totalAmount, currency },
      },
    });
  };

  const lockedStyle = { background:'#f8fafc', cursor:'not-allowed', color:'#64748b', borderColor:'#e2e8f0' };
  const isTimeLow   = secondsLeft < 5 * 60;

  return (
    <>
      <Navbar />
      <div className="omra-reserve flights-reservation-page">
        <div className="container">
          <div className="flights-page-shell flights-reservation-shell">

            {/* Breadcrumb */}
            <div className="omra-page-breadcrumb" style={{ paddingTop:8 }}>
              <button onClick={() => navigate('/flights/search')}><i className="fas fa-arrow-left"/> Recherche vols</button>
              <i className="fas fa-chevron-right" style={{ fontSize:10, color:'var(--gray-400)' }}/>
              <button onClick={() => navigate(-1)} style={{ color:'var(--gray-500)' }}>Résultats</button>
              <i className="fas fa-chevron-right" style={{ fontSize:10, color:'var(--gray-400)' }}/>
              <span style={{ color:'var(--gray-700)', fontWeight:700 }}>Réservation</span>
            </div>

            {/* Offer timer banner */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', background:isTimeLow?'#fee2e2':'#fff7ed', border:`1px solid ${isTimeLow?'#fca5a5':'#fed7aa'}`, borderRadius:12, marginBottom:16 }}>
              <span style={{ fontSize:18 }}>{isTimeLow ? '🚨' : '⏱'}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:isTimeLow?'#991b1b':'#92400e', margin:0 }}>
                  {isTimeLow ? 'Dépêchez-vous !' : 'Offre limitée dans le temps'}
                  <span style={{ marginLeft:12, fontSize:16, fontVariantNumeric:'tabular-nums', letterSpacing:2 }}>{formatTime(secondsLeft)}</span>
                </p>
                <p style={{ fontSize:12, color:isTimeLow?'#b91c1c':'#b45309', margin:'2px 0 0' }}>
                  Les tarifs des vols changent rapidement. Cette offre sera réservée jusqu'à expiration.
                </p>
              </div>
            </div>

            {clientEmail && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', background:'#e0fbfc', border:'1px solid #a5f3fc', borderRadius:12, marginBottom:16 }}>
                <i className="fas fa-user-check" style={{ color:'#0e7490', fontSize:14 }}/>
                <p style={{ fontSize:13, color:'#0e7490', fontWeight:600, margin:0 }}>
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
                      <i className="fas fa-plane" style={{ marginRight:10, color:'var(--secondary)' }}/>
                      Informations passager{passengers.length > 1 ? 's' : ''}
                    </h1>
                    <p className="omra-reserve__form-header-desc">
                      Remplissez les informations exactement comme sur votre passeport.
                    </p>
                  </div>

                  <form className="omra-reserve__form-body" onSubmit={handleSubmit}>

                    {/* Global error banner */}
                    {formError && (
                      <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:12, padding:'14px 18px', marginBottom:24, fontSize:13, color:'#991b1b', display:'flex', gap:10, alignItems:'flex-start' }}>
                        <i className="fas fa-exclamation-circle" style={{ fontSize:16, flexShrink:0, marginTop:1 }}/>
                        <span>{formError}</span>
                      </div>
                    )}

                    {passengers.map((pax, index) => (
                      <div key={index} style={{ marginBottom:32 }}>
                        {passengers.length > 1 && (
                          <p style={{ fontSize:13, fontWeight:700, color:'var(--secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                            <i className="fas fa-user" style={{ marginRight:8 }}/>Passager {index + 1}
                          </p>
                        )}

                        {/* Identity */}
                        <p style={{ fontSize:13, fontWeight:700, color:'var(--secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                          <i className="fas fa-id-card" style={{ marginRight:8 }}/>Identité
                        </p>
                        <div className="omra-reserve__form-row">
                          <div className="omra-reserve__field">
                            <label>Civilité *</label>
                            <select required value={pax.title} onChange={e => updatePassenger(index,'title',e.target.value)}>
                              <option value="mr">M.</option>
                              <option value="ms">Mme</option>
                              <option value="mrs">Mme (marié)</option>
                              <option value="miss">Mlle</option>
                              <option value="dr">Dr.</option>
                            </select>
                          </div>
                          <div className="omra-reserve__field">
                            <label>Genre *</label>
                            <select required value={pax.gender} onChange={e => updatePassenger(index,'gender',e.target.value)}>
                              <option value="m">Homme</option>
                              <option value="f">Femme</option>
                            </select>
                          </div>
                        </div>
                        <div className="omra-reserve__form-row" style={{ marginTop:16 }}>
                          <div className="omra-reserve__field">
                            <label>Prénom (comme sur passeport) *</label>
                            <input required value={pax.given_name}
                              onChange={e => updatePassenger(index,'given_name',e.target.value)}
                              placeholder="PRÉNOM" style={{ textTransform:'uppercase' }}/>
                          </div>
                          <div className="omra-reserve__field">
                            <label>Nom (comme sur passeport) *</label>
                            <input required value={pax.family_name}
                              onChange={e => updatePassenger(index,'family_name',e.target.value)}
                              placeholder="NOM" style={{ textTransform:'uppercase' }}/>
                          </div>
                        </div>
                        <div className="omra-reserve__form-row" style={{ marginTop:16 }}>
                          <div className="omra-reserve__field">
                            <label>Date de naissance *</label>
                            <input required type="date" value={pax.born_on}
                              onChange={e => updatePassenger(index,'born_on',e.target.value)}
                              max={new Date(Date.now() - 365*24*60*60*1000*2).toISOString().split('T')[0]}/>
                          </div>
                        </div>

                        <div style={{ height:1, background:'var(--gray-100)', margin:'20px 0' }}/>

                        {/* Contact */}
                        <p style={{ fontSize:13, fontWeight:700, color:'var(--secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                          <i className="fas fa-address-book" style={{ marginRight:8 }}/>Contact
                        </p>
                        <div className="omra-reserve__form-row">
                          <div className="omra-reserve__field">
                            <label>
                              Téléphone *
                              <span style={{ marginLeft:6, fontSize:10, color:'#64748b', fontWeight:500 }}>avec indicatif +216</span>
                            </label>
                            <input required type="tel" value={pax.phone_number}
                              onChange={e => updatePassenger(index,'phone_number',e.target.value)}
                              placeholder="+216 36 149 885"
                              style={{ borderColor: pax.phone_number && pax.phone_number !== '+216' && !isValidE164(toE164(pax.phone_number)) ? '#f97316' : '' }}
                            />
                            {/* Live feedback */}
                            {pax.phone_number && pax.phone_number !== '+216' && (
                              <p style={{ fontSize:11, marginTop:4, fontWeight:600,
                                color: isValidE164(toE164(pax.phone_number)) ? '#059669' : '#f97316' }}>
                                {isValidE164(toE164(pax.phone_number))
                                  ? `✓ ${toE164(pax.phone_number)}`
                                  : '⚠ Format invalide — ex: +216 36 149 885'}
                              </p>
                            )}
                          </div>
                          <div className="omra-reserve__field">
                            <label>
                              Email *
                              {index === 0 && clientEmail && (
                                <span style={{ marginLeft:8, fontSize:10, background:'#e0fbfc', color:'#0e7490', padding:'2px 7px', borderRadius:999, fontWeight:600 }}>
                                  <i className="fas fa-lock" style={{ marginRight:3 }}/>Lié au compte
                                </span>
                              )}
                            </label>
                            <input required type="email" value={pax.email}
                              onChange={e => !(index === 0 && clientEmail) && updatePassenger(index,'email',e.target.value)}
                              readOnly={index === 0 && !!clientEmail}
                              style={index === 0 && clientEmail ? lockedStyle : {}}
                              placeholder="email@exemple.com"/>
                          </div>
                        </div>

                        <div style={{ height:1, background:'var(--gray-100)', margin:'20px 0' }}/>

                        {/* Passport */}
                        <p style={{ fontSize:13, fontWeight:700, color:'var(--secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                          <i className="fas fa-passport" style={{ marginRight:8 }}/>Passeport
                        </p>
                        <div className="omra-reserve__form-row">
                          <div className="omra-reserve__field">
                            <label>N° Passeport *</label>
                            <input required value={pax.passport_number}
                              onChange={e => updatePassenger(index,'passport_number',e.target.value)}
                              placeholder="Ex : AB123456"/>
                          </div>
                          <div className="omra-reserve__field">
                            <label>Pays de délivrance * <span style={{ fontSize:10, color:'#64748b' }}>(2 lettres)</span></label>
                            <input required value={pax.passport_issuing_country}
                              onChange={e => updatePassenger(index,'passport_issuing_country',e.target.value.toUpperCase().slice(0,2))}
                              placeholder="TN" maxLength={2}
                              style={{ textTransform:'uppercase', letterSpacing:4, fontWeight:700 }}/>
                          </div>
                        </div>
                        <div className="omra-reserve__form-row" style={{ marginTop:16 }}>
                          <div className="omra-reserve__field">
                            <label>Date d'expiration passeport *</label>
                            <input required type="date" value={pax.passport_expires}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={e => updatePassenger(index,'passport_expires',e.target.value)}/>
                          </div>
                        </div>

                        {index < passengers.length - 1 && <div style={{ height:2, background:'var(--gray-100)', margin:'24px 0' }}/>}
                      </div>
                    ))}

                    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:20 }}>
                      <input type="checkbox" id="terms" required
                        style={{ marginTop:3, accentColor:'var(--secondary)', width:16, height:16, flexShrink:0, cursor:'pointer' }}/>
                      <label htmlFor="terms" style={{ fontSize:13, color:'var(--gray-500)', lineHeight:1.6, cursor:'pointer' }}>
                        J'accepte les <a href="#" style={{ color:'var(--secondary)' }}>conditions générales de vente</a> et la{' '}
                        <a href="#" style={{ color:'var(--secondary)' }}>politique de confidentialité</a> de TICTAC VOYAGES.
                      </label>
                    </div>

                    <button type="submit" className="omra-reserve__submit" disabled={loading || offerExpired}>
                      {loading
                        ? checkingOffer
                          ? '⏳ Vérification de la disponibilité…'
                          : '⏳ Chargement…'
                        : <><i className="fas fa-credit-card" style={{ marginRight:8 }}/>Continuer vers le paiement →</>
                      }
                    </button>
                    <p style={{ fontSize:12, color:'var(--gray-400)', textAlign:'center', marginTop:8 }}>
                      <i className="fas fa-lock" style={{ marginRight:5 }}/>Étape suivante : choisissez votre mode de paiement.
                    </p>
                  </form>
                </div>
              </div>

              {/* RIGHT — Summary */}
              <div className="omra-details__sidebar">
                <div className="omra-reserve__pkg-card">
                  <div className="omra-reserve__pkg-info" style={{ padding:20 }}>
                    <h3 className="omra-reserve__pkg-title" style={{ fontSize:16, marginBottom:6 }}>
                      ✈️ {origin} → {destination}
                    </h3>
                    <p className="omra-reserve__pkg-subtitle">{airline}{flightNumber && ` · Vol ${flightNumber}`}</p>
                    <div className="omra-reserve__pkg-meta">
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-calendar-alt"/> Départ : {departureAt}</div>
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-users"/> {offer.passengers?.length || 1} passager{(offer.passengers?.length||1)>1?'s':''}</div>
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-tag"/> Classe : {offer.cabin_class || 'Economy'}</div>
                    </div>
                  </div>
                </div>

                <div className="omra-reserve__summary">
                  <p className="omra-reserve__summary-title">Récapitulatif</p>
                  <div className="omra-reserve__summary-row">
                    <span>Prix total</span>
                    <span style={{ fontWeight:700, color:'var(--white)' }}>{totalAmount.toLocaleString('fr-FR')} {currency}</span>
                  </div>
                  <div className="omra-reserve__summary-row">
                    <span>Taxes & frais</span>
                    <span style={{ fontWeight:700, color:'var(--white)' }}>Inclus</span>
                  </div>
                  <div className="omra-reserve__summary-total">
                    <span className="omra-reserve__summary-total-label">Total</span>
                    <span className="omra-reserve__summary-total-amount">{totalAmount.toLocaleString('fr-FR')} {currency}</span>
                  </div>
                </div>

                {/* Offer timer in sidebar too */}
                <div style={{ marginTop:16, padding:'14px 16px', background:isTimeLow?'#fee2e2':'#fff7ed', border:`1px solid ${isTimeLow?'#fca5a5':'#fed7aa'}`, borderRadius:14, textAlign:'center' }}>
                  <p style={{ fontSize:12, color:isTimeLow?'#991b1b':'#92400e', fontWeight:600, margin:'0 0 4px' }}>
                    {isTimeLow ? '🚨 Expire bientôt' : '⏱ Offre valable encore'}
                  </p>
                  <p style={{ fontSize:24, fontWeight:800, color:isTimeLow?'#e92f64':'#c2410c', fontVariantNumeric:'tabular-nums', letterSpacing:2, margin:0 }}>
                    {formatTime(secondsLeft)}
                  </p>
                </div>

                <div style={{ marginTop:16, background:'var(--white)', borderRadius:16, padding:20, border:'1px solid var(--gray-100)' }}>
                  <h4 style={{ fontSize:14, fontWeight:700, color:'var(--gray-700)', marginBottom:12 }}>
                    <i className="fas fa-headset" style={{ color:'var(--secondary)', marginRight:8 }}/>Besoin d'aide ?
                  </h4>
                  <p style={{ fontSize:13, color:'var(--gray-500)', lineHeight:1.6, marginBottom:12 }}>
                    Lun – Sam · 09h – 18h
                  </p>
                  <a href="tel:+21636149885" style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, fontWeight:700, color:'var(--secondary)', textDecoration:'none' }}>
                    <i className="fas fa-phone"/> +216 36 149 885
                  </a>
                </div>
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