// src/pages/flight/FlightReservation.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';
import '../../styles/FlightsPage.css';

// ── E.164 normalizer ──────────────────────────────────────────────
const toE164 = (raw = '') => {
  let s = String(raw).replace(/[\s\-().]/g, '');
  if (/^[2345789]\d{7}$/.test(s)) s = '+216' + s; // bare Tunisian number
  if (!s.startsWith('+'))          s = '+' + s;
  return s;
};
const isValidE164 = (p) => /^\+[1-9]\d{4,14}$/.test(p);

// ═══════════════════════════════════════════════════════════════════
//  POPUP COMPONENT
// ═══════════════════════════════════════════════════════════════════
const ErrorPopup = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.45)', backdropFilter:'blur(3px)', padding:16 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, padding:'32px 36px', maxWidth:440, width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,.2)', animation:'popIn .2s ease', textAlign:'center' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:26 }}>⚠️</div>
        <h3 style={{ fontSize:17, fontWeight:800, color:'#991b1b', marginBottom:10 }}>Formulaire incomplet</h3>
        <p style={{ fontSize:14, color:'#475569', lineHeight:1.6, marginBottom:24 }}>{message}</p>
        <button onClick={onClose}
          style={{ padding:'11px 28px', borderRadius:10, border:'none', background:'#0F4C5C', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', width:'100%' }}>
          Corriger le formulaire
        </button>
      </div>
      <style>{`@keyframes popIn { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════
const FlightReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const offer    = location.state?.offer;

  const clientData = (() => {
    try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; }
  })();
  const clientEmail = clientData?.email || '';

  const [passengers, setPassengers] = useState([{
    title:                    'mr',
    given_name:               clientData?.first_name || '',
    family_name:              clientData?.last_name  || '',
    born_on:                  clientData?.born_on    || '',
    gender:                   'm',
    email:                    clientEmail,
    phone_number:             clientData?.phone || '+216',   // ← default +216
    passport_number:          '',
    passport_expires:         '',
    passport_issuing_country: 'TN',
  }]);

  const [loading,   setLoading]   = useState(false);
  const [popup,     setPopup]     = useState('');   // ← popup error message

  const updatePassenger = (i, field, value) => {
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  // ── Full validation ───────────────────────────────────────────────
  const validate = () => {
    for (const [i, pax] of passengers.entries()) {
      const n = i + 1;
      if (!pax.given_name?.trim())   return `Le prénom est manquant (passager ${n}).`;
      if (!pax.family_name?.trim())  return `Le nom de famille est manquant (passager ${n}).`;
      if (!pax.born_on)              return `La date de naissance est manquante (passager ${n}).`;
      if (!pax.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pax.email))
                                     return `L'adresse email est invalide (passager ${n}).`;
      const e164 = toE164(pax.phone_number || '');
      if (!isValidE164(e164))
        return `Le numéro de téléphone est invalide (passager ${n}).\nFormat requis : +216 36 149 885`;
      if (!pax.passport_number?.trim())
                                     return `Le numéro de passeport est manquant (passager ${n}).`;
      if (!pax.passport_expires)     return `La date d'expiration du passeport est manquante (passager ${n}).`;
      if (pax.passport_expires <= new Date().toISOString().split('T')[0])
                                     return `Le passeport du passager ${n} est expiré ou expire aujourd'hui.`;
      if (pax.passport_issuing_country?.length !== 2)
                                     return `Le pays de délivrance du passeport doit être un code à 2 lettres (ex: TN) — passager ${n}.`;
    }
    return '';
  };

  // ── No offer fallback ─────────────────────────────────────────────
  if (!offer) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop:160, textAlign:'center', minHeight:'60vh', padding:'160px 24px' }}>
          <span style={{ fontSize:52, display:'block', marginBottom:16 }}>✈️</span>
          <h2 style={{ color:'#0F4C5C', marginBottom:12 }}>Aucun vol sélectionné</h2>
          <p style={{ color:'#64748b', marginBottom:28 }}>Choisissez un vol depuis la page de recherche.</p>
          <button onClick={() => navigate('/flights')}
            style={{ padding:'14px 32px', background:'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Retour à la recherche
          </button>
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate → show popup on error
    const err = validate();
    if (err) {
      setPopup(err);
      return;
    }

    setLoading(true);

    // Normalize before passing to payment page
    const normalizedPassengers = passengers.map(p => ({
      ...p,
      phone_number:             toE164(p.phone_number),
      given_name:               p.given_name.trim().toUpperCase(),
      family_name:              p.family_name.trim().toUpperCase(),
      passport_issuing_country: p.passport_issuing_country.trim().toUpperCase(),
    }));

    // Small delay for UX then navigate
    setTimeout(() => {
      setLoading(false);
      navigate('/flights/payment', {
        state: {
          offer,
          passengers: normalizedPassengers,
          flightInfo: { origin, destination, departureAt, airline, flightNumber, totalAmount, currency },
        },
      });
    }, 300);
  };

  const lockedStyle = { background:'#f8fafc', cursor:'not-allowed', color:'#64748b', borderColor:'#e2e8f0' };

  return (
    <>
      <Navbar />

      {/* ── Popup error ── */}
      <ErrorPopup message={popup} onClose={() => setPopup('')}/>

      <div className="omra-reserve flights-reservation-page">
        <div className="container">
          <div className="flights-page-shell flights-reservation-shell">

            {/* Breadcrumb */}
            <div className="omra-page-breadcrumb" style={{ paddingTop:8 }}>
              <button onClick={() => navigate('/flights')}><i className="fas fa-arrow-left"/> Recherche vols</button>
              <i className="fas fa-chevron-right" style={{ fontSize:10, color:'var(--gray-400)' }}/>
              <button onClick={() => navigate(-1)} style={{ color:'var(--gray-500)' }}>Résultats</button>
              <i className="fas fa-chevron-right" style={{ fontSize:10, color:'var(--gray-400)' }}/>
              <span style={{ color:'var(--gray-700)', fontWeight:700 }}>Réservation</span>
            </div>

            {clientEmail && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', background:'#e0fbfc', border:'1px solid #a5f3fc', borderRadius:12, marginBottom:20 }}>
                <i className="fas fa-user-check" style={{ color:'#0e7490', fontSize:14 }}/>
                <p style={{ fontSize:13, color:'#0e7490', fontWeight:600, margin:0 }}>
                  Connecté en tant que <strong>{clientEmail}</strong> — vos informations ont été pré-remplies.
                </p>
              </div>
            )}

            {/* Phone format hint */}
            <div style={{ display:'flex', gap:10, padding:'12px 18px', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12, marginBottom:20 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>📞</span>
              <p style={{ fontSize:12, color:'#92400e', margin:0, lineHeight:1.6 }}>
                <strong>Format téléphone requis :</strong> Incluez l'indicatif pays. Ex : <strong>+216 36 149 885</strong> pour la Tunisie. Les espaces sont acceptés.
              </p>
            </div>

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
                      Remplissez les informations exactement comme sur votre passeport. Vous choisirez votre mode de paiement à l'étape suivante.
                    </p>
                  </div>

                  <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
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
                            <label>Prénom * <span style={{ fontSize:10, color:'#94a3b8', fontWeight:400 }}>(comme sur passeport)</span></label>
                            <input required value={pax.given_name}
                              onChange={e => updatePassenger(index,'given_name',e.target.value)}
                              placeholder="PRÉNOM" style={{ textTransform:'uppercase' }}/>
                          </div>
                          <div className="omra-reserve__field">
                            <label>Nom * <span style={{ fontSize:10, color:'#94a3b8', fontWeight:400 }}>(comme sur passeport)</span></label>
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
                              max={new Date().toISOString().split('T')[0]}/>
                          </div>
                        </div>

                        <div style={{ height:1, background:'var(--gray-100)', margin:'20px 0' }}/>

                        {/* Contact */}
                        <p style={{ fontSize:13, fontWeight:700, color:'var(--secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                          <i className="fas fa-address-book" style={{ marginRight:8 }}/>Contact
                        </p>
                        <div className="omra-reserve__form-row">
                          <div className="omra-reserve__field">
                            <label>Téléphone * <span style={{ fontSize:10, color:'#b45309', fontWeight:600 }}>+indicatif</span></label>
                            <input required type="tel" value={pax.phone_number}
                              onChange={e => updatePassenger(index,'phone_number',e.target.value)}
                              placeholder="+216 36 149 885"/>
                            {/* Live format feedback */}
                            {pax.phone_number && pax.phone_number !== '+216' && pax.phone_number.length > 4 && (
                              <p style={{ fontSize:11, marginTop:4, fontWeight:600,
                                color: isValidE164(toE164(pax.phone_number)) ? '#059669' : '#f97316' }}>
                                {isValidE164(toE164(pax.phone_number))
                                  ? `✓ Format valide : ${toE164(pax.phone_number)}`
                                  : '⚠ Ajoutez l\'indicatif pays — ex: +216 36 149 885'}
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
                            <label>Pays de délivrance * <span style={{ fontSize:10, color:'#64748b', fontWeight:400 }}>(2 lettres)</span></label>
                            <input required value={pax.passport_issuing_country}
                              onChange={e => updatePassenger(index,'passport_issuing_country',e.target.value.toUpperCase().slice(0,2))}
                              placeholder="TN" maxLength={2}
                              style={{ textTransform:'uppercase', letterSpacing:6, fontWeight:700, fontSize:18 }}/>
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

                    {/* Terms */}
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:24 }}>
                      <input type="checkbox" id="terms" required
                        style={{ marginTop:3, accentColor:'var(--secondary)', width:16, height:16, flexShrink:0, cursor:'pointer' }}/>
                      <label htmlFor="terms" style={{ fontSize:13, color:'var(--gray-500)', lineHeight:1.6, cursor:'pointer' }}>
                        J'accepte les <a href="#" style={{ color:'var(--secondary)' }}>conditions générales de vente</a> et la{' '}
                        <a href="#" style={{ color:'var(--secondary)' }}>politique de confidentialité</a> de TICTAC VOYAGES.
                      </label>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="omra-reserve__submit" disabled={loading}
                      style={{ opacity: loading ? 0.75 : 1 }}>
                      {loading
                        ? <><i className="fas fa-spinner fa-spin" style={{ marginRight:8 }}/>Chargement…</>
                        : <><i className="fas fa-credit-card" style={{ marginRight:8 }}/>Continuer vers le paiement →</>
                      }
                    </button>
                    <p style={{ fontSize:12, color:'var(--gray-400)', textAlign:'center', marginTop:10 }}>
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
                    <p className="omra-reserve__pkg-subtitle">{airline}{flightNumber ? ` · Vol ${flightNumber}` : ''}</p>
                    <div className="omra-reserve__pkg-meta">
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-calendar-alt"/> Départ : {departureAt}</div>
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-users"/> {offer.passengers?.length || 1} passager{(offer.passengers?.length||1)>1?'s':''}</div>
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-tag"/> Classe : {offer.cabin_class || 'Economy'}</div>
                    </div>
                  </div>
                </div>

                <div className="omra-reserve__summary">
                  <p className="omra-reserve__summary-title">Récapitulatif du prix</p>
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

                <div style={{ marginTop:20, background:'var(--white)', borderRadius:16, padding:20, border:'1px solid var(--gray-100)' }}>
                  <h4 style={{ fontSize:14, fontWeight:700, color:'var(--gray-700)', marginBottom:12 }}>
                    <i className="fas fa-headset" style={{ color:'var(--secondary)', marginRight:8 }}/>Besoin d'aide ?
                  </h4>
                  <p style={{ fontSize:13, color:'var(--gray-500)', lineHeight:1.6, marginBottom:12 }}>
                    Notre équipe est disponible du lundi au samedi de 09h à 18h.
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