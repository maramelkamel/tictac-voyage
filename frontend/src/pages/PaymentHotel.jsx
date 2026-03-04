import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Payment.css';

/* ── EmailJS ou votre service d'envoi email ──
   Remplacez par votre configuration réelle.
   Ex: EmailJS, SendGrid, votre propre API backend, etc.
*/
const sendAgencyEmail = async ({ hotel, form, nights, total, clientEmail }) => {
  // ── Option 1 : EmailJS (décommentez et configurez) ──
  /*
  import emailjs from '@emailjs/browser';
  await emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID',
    {
      to_email:    clientEmail,
      hotel_name:  hotel.title,
      hotel_location: hotel.location,
      check_in:    form.checkIn,
      check_out:   form.checkOut,
      room_type:   form.roomType,
      pension:     form.pension,
      nights:      nights,
      adults:      form.adults,
      children:    form.children,
      total:       total,
    },
    'YOUR_PUBLIC_KEY'
  );
  */

  // ── Option 2 : votre API backend ──
  /*
  await fetch('/api/send-agency-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotel, form, nights, total, clientEmail }),
  });
  */

  // ── Simulation (à remplacer) ──
  console.log('📧 Email envoyé à', clientEmail, { hotel, form, nights, total });
  return Promise.resolve();
};

/* ════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════ */
const PaymentHotel = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { id }     = useParams();

  const [method,   setMethod]   = useState(null);
  const [cardType, setCardType] = useState('visa');
  const [cardForm, setCardForm] = useState({
    cardNumber:  '',
    cardName:    '',
    expiry:      '',
    cvv:         '',
    billingAddr: '',
    billingCity: '',
  });
  const [clientEmail, setClientEmail] = useState('');
  const [submitted,   setSubmitted]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [emailSent,   setEmailSent]   = useState(false);
  const [emailError,  setEmailError]  = useState(false);

  /* ── Fallback ── */
  if (!state?.hotel || !state?.form) {
    return (
      <div className="payment-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            Session expirée.
          </p>
          <button
            className="payment-fallback__btn"
            onClick={() => navigate('/')}
          >
            ← Retour aux hôtels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { hotel, form, nights, total } = state;
  const pricePerNight = nights > 0 ? Math.round(total / nights) : 0;

  /* ── Card input formatting ── */
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') {
      v = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      v = value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    }
    if (name === 'cvv') {
      v = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardForm({ ...cardForm, [name]: v });
  };

  const handleOnlineSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  const handleAgencyConfirm = async () => {
    if (!clientEmail) {
      alert('Veuillez saisir votre adresse email pour recevoir la confirmation.');
      return;
    }
    setLoading(true);
    setEmailError(false);
    try {
      await sendAgencyEmail({ hotel, form, nights, total, clientEmail });
      setEmailSent(true);
    } catch (err) {
      console.error(err);
      setEmailError(true);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  /* ── SUCCESS ── */
  if (submitted) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-success">
          <div className="payment-success__card">
            <div className="payment-success__icon">✓</div>
            <h2 className="payment-success__title">
              {method === 'agency' ? 'Réservation confirmée !' : 'Paiement effectué !'}
            </h2>
            <p className="payment-success__desc">
              {method === 'agency' ? (
                <>
                  Votre réservation à <strong>{hotel.title}</strong> ({hotel.location}) est enregistrée.<br /><br />
                  {emailSent && !emailError ? (
                    <>
                      Un email de confirmation a été envoyé à <strong>{clientEmail}</strong> avec les détails
                      de votre rendez-vous en agence.{' '}
                      Un conseiller vous contactera sous <strong>24h</strong> pour fixer l'heure exacte.
                    </>
                  ) : emailError ? (
                    <>
                      Votre réservation est bien enregistrée mais l'envoi de l'email a échoué.{' '}
                      Veuillez nous appeler au <strong>+216 36 149 885</strong> pour confirmer votre rendez-vous.
                    </>
                  ) : (
                    <>Rendez-vous à notre agence pour finaliser le paiement.</>
                  )}
                  <br /><br />
                  <strong>Check-in :</strong> {form.checkIn} &nbsp;|&nbsp; <strong>Check-out :</strong> {form.checkOut}<br />
                  <strong>Nuits :</strong> {nights} &nbsp;|&nbsp; <strong>Total :</strong> {total} TND
                </>
              ) : (
                <>
                  Votre paiement de <strong>{total} TND</strong> pour{' '}
                  <strong>{hotel.title}</strong> a été traité avec succès.{' '}
                  Une confirmation a été envoyée par email.
                </>
              )}
            </p>
            <div className="payment-success__actions">
              <button
                className="payment-success__btn"
                onClick={() => navigate('/')}
              >
                ← Voir d'autres hôtels
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── MAIN PAGE ── */
  return (
    <div className="payment-page">
      <Navbar />

      {/* ── Hero bar ── */}
      <div className="payment-hero">
        <div className="container">

          {/* Breadcrumb */}
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/')}>
              ← Hôtels
            </button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>
              {hotel.title}
            </button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">Paiement</span>
          </div>

          {/* Steps */}
          <div className="payment-steps">
            {[
              { n: 1, label: 'Réservation', state: 'done'    },
              { n: 2, label: 'Paiement',    state: 'active'  },
              { n: 3, label: 'Confirmation',state: 'pending' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="payment-step">
                  <div className={`payment-step__circle payment-step__circle--${step.state}`}>
                    {step.state === 'done' ? '✓' : step.n}
                  </div>
                  <span className={`payment-step__label payment-step__label--${step.state}`}>
                    {step.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`payment-step__line payment-step__line--${i === 0 ? 'done' : 'pending'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="payment-body">
        <div className="container">
          <div className="payment-layout">

            {/* ══ LEFT ══ */}
            <div>

              {/* Total banner */}
              <div className="payment-total-banner">
                <div>
                  <div className="payment-total-banner__label">Montant total à régler</div>
                  <div className="payment-total-banner__amount">
                    {total.toLocaleString('fr-FR')} <span>TND</span>
                  </div>
                  <div className="payment-total-banner__sub">
                    {pricePerNight.toLocaleString('fr-FR')} TND/nuit × {nights} nuit{nights > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="payment-total-banner__badge">🔒 Paiement sécurisé</div>
              </div>

              {/* Method selection */}
              <div className="payment-card">
                <h3 className="payment-card__title">Choisissez votre mode de paiement</h3>
                <p className="payment-card__subtitle">Sélectionnez l'option qui vous convient le mieux.</p>

                <div className="payment-method-row">
                  {/* Online */}
                  <button
                    className={`payment-method-btn ${method === 'online' ? 'payment-method-btn--online' : ''}`}
                    onClick={() => setMethod('online')}
                  >
                    <div className="payment-method-btn__icon">💳</div>
                    <div className={`payment-method-btn__title ${method === 'online' ? 'payment-method-btn__title--online' : ''}`}>
                      Payer en ligne
                    </div>
                    <div className="payment-method-btn__desc">
                      Carte bancaire, e-Dinar<br />Paiement immédiat & sécurisé
                    </div>
                    {method === 'online' && (
                      <div className="payment-method-btn__badge payment-method-btn__badge--online">✓ Sélectionné</div>
                    )}
                  </button>

                  {/* Agency */}
                  <button
                    className={`payment-method-btn ${method === 'agency' ? 'payment-method-btn--agency' : ''}`}
                    onClick={() => setMethod('agency')}
                  >
                    <div className="payment-method-btn__icon">🏪</div>
                    <div className={`payment-method-btn__title ${method === 'agency' ? 'payment-method-btn__title--agency' : ''}`}>
                      Payer à l'agence
                    </div>
                    <div className="payment-method-btn__desc">
                      Espèces ou virement<br />Rendez-vous confirmé par email
                    </div>
                    {method === 'agency' && (
                      <div className="payment-method-btn__badge payment-method-btn__badge--agency">✓ Sélectionné</div>
                    )}
                  </button>
                </div>
              </div>

              {/* ── ONLINE FORM ── */}
              {method === 'online' && (
                <div className="payment-card">
                  <h3 className="payment-card__title">💳 Informations de paiement</h3>

                  {/* Card type */}
                  <div style={{ marginBottom: 22 }}>
                    <label className="pay-label">Type de carte</label>
                    <div className="card-types">
                      {[
                        { key: 'visa',       label: 'Visa',       icon: '💳' },
                        { key: 'mastercard', label: 'Mastercard', icon: '🔴' },
                        { key: 'edinar',     label: 'e-Dinar',    icon: '🇹🇳' },
                        { key: 'amex',       label: 'Amex',       icon: '🟦' },
                      ].map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          className={`card-type-btn ${cardType === c.key ? 'card-type-btn--selected' : ''}`}
                          onClick={() => setCardType(c.key)}
                        >
                          <span>{c.icon}</span> {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form className="pay-form" onSubmit={handleOnlineSubmit}>

                    <div className="pay-field">
                      <label className="pay-label">Numéro de carte *</label>
                      <div className="pay-input-wrapper">
                        <input
                          className="pay-input pay-input--icon-right"
                          name="cardNumber" type="text"
                          placeholder="0000 0000 0000 0000"
                          required maxLength={19}
                          value={cardForm.cardNumber}
                          onChange={handleCardChange}
                        />
                        <span className="pay-input-icon">
                          {cardType === 'visa' ? '💳' : cardType === 'mastercard' ? '🔴' : cardType === 'edinar' ? '🇹🇳' : '🟦'}
                        </span>
                      </div>
                    </div>

                    <div className="pay-field">
                      <label className="pay-label">Nom sur la carte *</label>
                      <input
                        className="pay-input"
                        name="cardName" type="text"
                        placeholder="PRÉNOM NOM"
                        required
                        value={cardForm.cardName}
                        onChange={handleCardChange}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>

                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Date d'expiration *</label>
                        <input
                          className="pay-input"
                          name="expiry" type="text"
                          placeholder="MM/AA"
                          required maxLength={5}
                          value={cardForm.expiry}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">CVV / CVC *</label>
                        <div className="pay-input-wrapper">
                          <input
                            className="pay-input pay-input--icon-right"
                            name="cvv" type="password"
                            placeholder="•••"
                            required maxLength={4}
                            value={cardForm.cvv}
                            onChange={handleCardChange}
                          />
                          <span className="pay-input-info" title="Code à 3 ou 4 chiffres au dos de votre carte">ℹ️</span>
                        </div>
                      </div>
                    </div>

                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Adresse de facturation</label>
                        <input
                          className="pay-input"
                          name="billingAddr" type="text"
                          placeholder="Rue, numéro…"
                          value={cardForm.billingAddr}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">Ville</label>
                        <input
                          className="pay-input"
                          name="billingCity" type="text"
                          placeholder="Tunis"
                          value={cardForm.billingCity}
                          onChange={handleCardChange}
                        />
                      </div>
                    </div>

                    <div className="payment-security-note">
                      <span className="payment-security-note__icon">🔒</span>
                      <div>
                        <div className="payment-security-note__title">Paiement 100% sécurisé</div>
                        <div className="payment-security-note__desc">
                          Vos données sont chiffrées via SSL 256-bit. Tictac Voyages ne stocke jamais vos informations de carte.
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? '⏳ Traitement en cours…' : `Payer ${total.toLocaleString('fr-FR')} TND →`}
                    </button>
                  </form>
                </div>
              )}

              {/* ── AGENCY INFO ── */}
              {method === 'agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">🏪 Nos coordonnées</h3>

                  <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--pay-border)' }}>
                    <iframe
                      title="Tictac Voyages"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn"
                      width="100%" height="200"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen="" loading="lazy"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {[
                      { icon: '📍', label: 'Adresse',   value: 'Nouvelle Medina, Tunis, Tunisie' },
                      { icon: '📞', label: 'Téléphone', value: '+216 36 149 885' },
                      { icon: '💬', label: 'WhatsApp',  value: '+216 36 149 885' },
                      { icon: '🕐', label: 'Horaires',  value: 'Lun – Ven : 09h–18h · Sam : 09h–14h' },
                    ].map((item, i) => (
                      <div key={i} className="agency-contact-item">
                        <span className="agency-contact-item__icon">{item.icon}</span>
                        <div>
                          <div className="agency-contact-item__label">{item.label}</div>
                          <div className="agency-contact-item__value">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── EMAIL FIELD FOR AGENCY RDV ── */}
                  <div style={{
                    background: 'rgba(232, 48, 106, 0.04)',
                    border: '1.5px solid rgba(232, 48, 106, 0.15)',
                    borderRadius: 14,
                    padding: '20px 20px',
                    marginBottom: 16,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 14,
                    }}>
                      <span style={{ fontSize: 22 }}>📧</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0a2832' }}>
                          Confirmation par email
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--pay-muted)', lineHeight: 1.5 }}>
                          Nous vous enverrons un email pour fixer votre rendez-vous en agence.
                        </div>
                      </div>
                    </div>
                    <label className="pay-label">Votre adresse email *</label>
                    <input
                      className="pay-input"
                      type="email"
                      placeholder="exemple@email.com"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>

                  <div className="agency-warning">
                    ℹ️ Votre réservation sera retenue <strong>48h</strong>. Un conseiller vous contactera
                    sous <strong>24h</strong> à l'adresse email indiquée pour confirmer le rendez-vous.
                    Présentez-vous ensuite à l'agence avec votre confirmation.
                  </div>

                  <button
                    className="payment-submit-btn"
                    onClick={handleAgencyConfirm}
                    disabled={loading || !clientEmail}
                  >
                    {loading
                      ? '⏳ Envoi de la confirmation…'
                      : "Confirmer & recevoir mon email de RDV →"}
                  </button>

                  {!clientEmail && (
                    <p style={{ fontSize: 12, color: 'var(--pay-muted)', textAlign: 'center', marginTop: 8 }}>
                      Saisissez votre email pour continuer
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ══ RIGHT: sidebar ══ */}
            <aside className="payment-sidebar">

              <div className="payment-trip-card">
                <img src={hotel.image} alt={hotel.title} className="payment-trip-card__img" />
                <div className="payment-trip-card__body">
                  <div className="payment-trip-card__country">
                    {hotel.location}
                  </div>
                  <div className="payment-trip-card__title">{hotel.title}</div>
                  <div className="payment-trip-card__meta">
                    {[
                      { icon: '📅', text: `Arrivée : ${form.checkIn}` },
                      { icon: '📅', text: `Départ : ${form.checkOut}` },
                      { icon: '🌙', text: `${nights} nuit${nights > 1 ? 's' : ''}` },
                      { icon: '👥', text: `${form.adults} adulte${form.adults > 1 ? 's' : ''}${form.children > 0 ? `, ${form.children} enfant${form.children > 1 ? 's' : ''}` : ''}` },
                      { icon: '🛏️', text: `${form.rooms} chambre${form.rooms > 1 ? 's' : ''} – ${form.roomType}` },
                      { icon: '🍽️', text: form.pension },
                    ].map((item, i) => (
                      <div key={i} className="payment-trip-card__meta-item">
                        <span>{item.icon}</span> {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="payment-price-card">
                <div className="payment-price-card__title">Récapitulatif du prix</div>
                {[
                  { label: 'Prix / nuit',                                value: `${pricePerNight.toLocaleString('fr-FR')} TND` },
                  { label: `× ${nights} nuit${nights > 1 ? 's' : ''}`, value: `${(pricePerNight * nights).toLocaleString('fr-FR')} TND` },
                  { label: 'Taxes (10%)',                                value: `${Math.round(pricePerNight * nights * 0.1).toLocaleString('fr-FR')} TND` },
                  { label: 'Frais de service',                          value: 'Inclus' },
                ].map((row, i) => (
                  <div key={i} className="payment-price-row">
                    <span>{row.label}</span>
                    <span className="payment-price-row__value">{row.value}</span>
                  </div>
                ))}
                <div className="payment-price-total">
                  <span className="payment-price-total__label">Total</span>
                  <span className="payment-price-total__amount">{total.toLocaleString('fr-FR')} TND</span>
                </div>
              </div>

              {/* Stars */}
              {hotel.stars && (
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '16px 20px',
                  boxShadow: '0 4px 24px rgba(10,40,50,0.08)',
                  border: '1px solid var(--pay-border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, letterSpacing: 4, marginBottom: 4 }}>
                    {'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--pay-muted)', fontWeight: 600 }}>
                    {hotel.rating ? `Note : ${hotel.rating}/10` : 'Hôtel classé'}
                  </div>
                </div>
              )}

            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentHotel;