// ════════════════════════════════════════════════════════════════════
// src/pages/Omra/OmraPayment.jsx  —  Omra payment page (Step 2 / 3)
//
// PURPOSE:
//   Final step of the Omra booking flow. Allows the user to:
//     1. Apply an optional promotion code (fetched from the backend
//        and validated client-side).
//     2. Choose a payment method: card (online) or cash at the agency.
//     3. Submit the complete reservation to POST /api/omra/reservations.
//
// DATA IN (via location.state, set by Reserve.jsx):
//   voyage          — display metadata (title, image, price, etc.)
//   booking         — traveller contact info
//   totalPrix       — base price before any promo discount
//   reservationData — flat payload ready for the backend
//
// API CALLS:
//   POST /api/omra/reservations  — saves the reservation + payment info
//
// FLOW:
//   Reserve.jsx → OmraPayment.jsx → [submitted=true] → Success screen
// ════════════════════════════════════════════════════════════════════

import React, { useState }                      from 'react';
import { useLocation, useNavigate, useParams }  from 'react-router-dom';
import Navbar                                   from '../../components/Navbar';
import Footer                                   from '../../components/Footer';
import '../../styles/Payment.css';

// usePromotions fetches active promotions for a given category so the
// promo-code field can validate against live data.
import { usePromotions } from '../../hooks/usePromotions';

// Promotion utility helpers:
//   findPromotionByCode  — finds a promotion object by its code string
//   getPromotionPricing  — computes finalAmount and discountAmount
//   normalizePromoCode   — uppercases + trims a code for comparison
//   serializeAppliedPromotion — shapes the promo data for the DB payload
import {
  findPromotionByCode,
  getPromotionPricing,
  normalizePromoCode,
  serializeAppliedPromotion,
} from '../../utils/promotionPricing';

// Backend endpoint for creating reservations
const API = 'http://localhost:5000/api/omra/reservations';

const OmraPayment = () => {
  const { state }  = useLocation();  // booking data from Reserve.jsx
  const navigate   = useNavigate();
  const { id }     = useParams();    // package ID (not used directly here but available)

  // ── Payment method state ───────────────────────────────────────────
  // null → neither chosen yet; 'online' → card form; 'agency' → map + confirm
  const [method, setMethod]       = useState(null);
  // cardType: which card brand is selected (affects the icon in the input)
  const [cardType, setCardType]   = useState('visa');
  // cardForm: all card input values
  const [cardForm, setCardForm]   = useState({
    cardNumber:  '',
    cardName:    '',
    expiry:      '',
    cvv:         '',
    billingAddr: '',
    billingCity: '',
  });

  // ── Submission state ───────────────────────────────────────────────
  const [submitted, setSubmitted] = useState(false); // true → show success screen
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState('');

  // ── Promo code state ───────────────────────────────────────────────
  const [promoCode, setPromoCode]               = useState('');
  const [promoError, setPromoError]             = useState('');
  const [promoMessage, setPromoMessage]         = useState('');
  // appliedPromotion: the matched promotion object (null if none applied)
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  // Fetch all active Omra promotions from the backend so we can validate
  // the user-entered promo code locally without a dedicated endpoint.
  const { promos } = usePromotions('categorie', 'omra');

  // ── Guard: missing booking state ───────────────────────────────────
  // If the user navigates directly to this URL without going through
  // the reservation form, location.state will be empty.
  if (!state?.voyage || !state?.booking) {
    return (
      <div className="payment-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            Session expirée.
          </p>
          <button className="payment-fallback__btn" onClick={() => navigate('/Omra/Omra')}>
            ← Retour aux forfaits Omra
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Destructure booking data ────────────────────────────────────────
  const { voyage, booking, totalPrix, reservationData } = state;
  const { titre, image, pays, destination, prix, duree, depart } = voyage;
  const personnes = parseInt(booking.personnes || 1, 10);

  // getPromotionPricing computes:
  //   finalAmount    — price after discount (same as totalPrix if no promo)
  //   discountAmount — amount saved (0 if no promo)
  const pricing = getPromotionPricing(totalPrix, appliedPromotion);

  // ── Card input handler ──────────────────────────────────────────────
  /**
   * Formats card fields as the user types:
   *   cardNumber: adds spaces every 4 digits (e.g. "4532 1234 …")
   *   expiry:     inserts "/" after month (e.g. "12/25")
   *   cvv:        strips non-digits and limits to 4 chars
   */
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') {
      v = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      v = value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    if (name === 'cvv') {
      v = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardForm({ ...cardForm, [name]: v });
  };

  // ── Promo code handlers ────────────────────────────────────────────
  /**
   * Called on every keystroke in the promo code input.
   * Clears error/success messages and removes the applied promotion
   * if the code no longer matches it.
   */
  const handlePromoChange = (e) => {
    const nextCode = e.target.value;
    setPromoCode(nextCode);
    setPromoError('');
    setPromoMessage('');
    // If the new code no longer matches the previously applied promo,
    // remove it so the price reverts to the base total.
    if (normalizePromoCode(nextCode) !== normalizePromoCode(appliedPromotion?.code_promo)) {
      setAppliedPromotion(null);
    }
  };

  /**
   * Validates the entered code against the live promotions list and
   * applies it if a match is found.
   * The comparison is case-insensitive (handled by normalizePromoCode).
   */
  const handleApplyPromo = () => {
    const matchedPromotion = findPromotionByCode(promos, promoCode);
    if (!matchedPromotion) {
      setAppliedPromotion(null);
      setPromoMessage('');
      setPromoError('Code promo invalide pour cette page.');
      return;
    }
    setAppliedPromotion(matchedPromotion);
    setPromoError('');
    setPromoMessage(`Code ${matchedPromotion.code_promo} appliqué.`);
  };

  // ── Backend call ───────────────────────────────────────────────────
  /**
   * Posts the complete reservation payload to the backend.
   * Called by both payment methods (online and agency) with different
   * paymentMethod values.
   *
   * The payload merges:
   *   - reservationData from the form (passed via location.state)
   *   - final price (after promo)
   *   - payment metadata
   *   - serialised promo data (if any)
   *
   * @param   {string} paymentMethod  'online' | 'agency'
   * @returns {object} The JSON response from the backend
   * @throws  {Error}  If the backend reports failure
   */
  const saveReservation = async (paymentMethod) => {
    const payload = {
      ...reservationData,
      total_price:         pricing.finalAmount,
      payment_method:      paymentMethod,
      // Online payments are marked as paid immediately;
      // agency payments remain pending until the client visits.
      payment_status:      paymentMethod === 'online' ? 'paid' : 'pending',
      status:              'pending',
      promo_code:          appliedPromotion?.code_promo || null,
      // serializeAppliedPromotion shapes the promo for storage (discount
      // type, amount, dates) so the admin panel can display it later.
      applied_promotion:   serializeAppliedPromotion(appliedPromotion, 'omra'),
      reservation_title:   titre,
    };

    const res  = await fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Erreur serveur');
    return json;
  };

  // ── Submit handlers ────────────────────────────────────────────────
  /**
   * Handles the card-payment form submission.
   * The card details are NOT sent to the backend in this implementation
   * (the form is for UX only / future payment-gateway integration).
   */
  const handleOnlineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      await saveReservation('online');
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirms an agency-payment reservation without processing any card.
   * The client will pay in cash / by bank transfer when they visit the
   * agency within 48 hours.
   */
  const handleAgencyConfirm = async () => {
    setLoading(true);
    setApiError('');
    try {
      await saveReservation('agency');
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────
  // Replaces the entire page content once the reservation is saved.
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
              Merci <strong>{booking.prenom} {booking.nom}</strong> pour votre réservation de{' '}
              <strong>{titre}</strong>.{' '}
              {method === 'agency'
                ? <>Rendez-vous à notre agence pour finaliser le paiement. Un conseiller vous contactera sous 24h à <strong>{booking.email}</strong>.</>
                : <>Votre paiement de <strong>{pricing.finalAmount.toLocaleString('fr-FR')} TND</strong> a été traité. Confirmation envoyée à <strong>{booking.email}</strong>.</>
              }
            </p>
            <div className="payment-success__actions">
              <button className="payment-success__btn" onClick={() => navigate('/Omra/Omra')}>
                ← Voir d'autres forfaits Omra
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────
  return (
    <div className="payment-page">
      <Navbar />

      {/* ── Hero bar: breadcrumb + step indicator ─────────────────── */}
      <div className="payment-hero">
        <div className="container">
          {/* Breadcrumb: Omra / Réservation / Paiement */}
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/Omra/Omra')}>← Omra</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>Réservation</button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">Paiement</span>
          </div>

          {/* 3-step progress indicator — step 2 is active */}
          <div className="payment-steps">
            {[
              { n: 1, label: 'Informations', state: 'done' },   // completed (came from Reserve.jsx)
              { n: 2, label: 'Paiement',     state: 'active' }, // current page
              { n: 3, label: 'Confirmation', state: 'pending' },// after submit
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="payment-step">
                  <div className={`payment-step__circle payment-step__circle--${step.state}`}>
                    {step.state === 'done' ? '✓' : step.n}
                  </div>
                  <span className={`payment-step__label payment-step__label--${step.state}`}>{step.label}</span>
                </div>
                {/* Connector line between steps */}
                {i < 2 && <div className={`payment-step__line payment-step__line--${i === 0 ? 'done' : 'pending'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page body: main column + sidebar ──────────────────────── */}
      <div className="payment-body">
        <div className="container">
          <div className="payment-layout">

            {/* ── Left / Main column ──────────────────────────────── */}
            <div>

              {/* Total banner — always visible so the user knows
                  the amount before choosing a payment method */}
              <div className="payment-total-banner">
                <div>
                  <div className="payment-total-banner__label">Montant total à régler</div>
                  <div className="payment-total-banner__amount">
                    {pricing.finalAmount.toLocaleString('fr-FR')} <span>TND</span>
                  </div>
                  <div className="payment-total-banner__sub">
                    {Number(prix).toLocaleString('fr-FR')} TND × {personnes} personne{personnes > 1 ? 's' : ''}
                    {pricing.discountAmount > 0 && ` • réduction de ${pricing.discountAmount.toLocaleString('fr-FR')} TND`}
                  </div>
                </div>
                <div className="payment-total-banner__badge">🔒 Paiement sécurisé</div>
              </div>

              {/* ── Promo code card ──────────────────────────────── */}
              <div className="payment-card">
                <h3 className="payment-card__title">Code promo</h3>
                <p className="payment-card__subtitle">Ajoutez le code promo de cette page pour recalculer le total.</p>
                <div className="pay-form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="pay-field" style={{ flex: 1 }}>
                    <label className="pay-label">Code promo</label>
                    <input
                      className="pay-input"
                      type="text"
                      value={promoCode}
                      onChange={handlePromoChange}
                      placeholder="Ex: RAMADAN25"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="payment-submit-btn"
                    style={{ width: 'auto', minWidth: 180 }}
                    onClick={handleApplyPromo}
                  >
                    Appliquer le code
                  </button>
                </div>

                {/* Inline error message for invalid/expired codes */}
                {promoError && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
                    {promoError}
                  </div>
                )}
                {/* Success message when a code is applied */}
                {promoMessage && appliedPromotion && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600 }}>
                    {promoMessage} Valable jusqu'au {new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.
                  </div>
                )}
              </div>

              {/* Global API error (shown if the reservation POST fails) */}
              {apiError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b', display: 'flex', gap: 8, alignItems: 'center' }}>
                  ⚠️ {apiError}
                </div>
              )}

              {/* ── Payment method selector ──────────────────────── */}
              <div className="payment-card">
                <h3 className="payment-card__title">Choisissez votre mode de paiement</h3>
                <p className="payment-card__subtitle">Sélectionnez l'option qui vous convient le mieux.</p>
                <div className="payment-method-row">
                  {/* Online card payment */}
                  <button
                    className={`payment-method-btn ${method === 'online' ? 'payment-method-btn--online' : ''}`}
                    onClick={() => setMethod('online')}
                  >
                    <div className="payment-method-btn__icon">💳</div>
                    <div className={`payment-method-btn__title ${method === 'online' ? 'payment-method-btn__title--online' : ''}`}>Payer en ligne</div>
                    <div className="payment-method-btn__desc">Carte bancaire, e-Dinar<br />Paiement immédiat & sécurisé</div>
                    {method === 'online' && <div className="payment-method-btn__badge payment-method-btn__badge--online">✓ Sélectionné</div>}
                  </button>

                  {/* Pay at the agency */}
                  <button
                    className={`payment-method-btn ${method === 'agency' ? 'payment-method-btn--agency' : ''}`}
                    onClick={() => setMethod('agency')}
                  >
                    <div className="payment-method-btn__icon">🏪</div>
                    <div className={`payment-method-btn__title ${method === 'agency' ? 'payment-method-btn__title--agency' : ''}`}>Payer à l'agence</div>
                    <div className="payment-method-btn__desc">Espèces ou virement<br />Rendez-vous en agence</div>
                    {method === 'agency' && <div className="payment-method-btn__badge payment-method-btn__badge--agency">✓ Sélectionné</div>}
                  </button>
                </div>
              </div>

              {/* ── Online payment form ──────────────────────────── */}
              {/* Only rendered when the user selects "Payer en ligne" */}
              {method === 'online' && (
                <div className="payment-card">
                  <h3 className="payment-card__title">💳 Informations de paiement</h3>

                  {/* Card type selector (Visa / Mastercard / e-Dinar / Amex) */}
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

                  {/* Card detail fields — formatting handled by handleCardChange */}
                  <form className="pay-form" onSubmit={handleOnlineSubmit}>
                    {/* Card number with card-type icon on the right */}
                    <div className="pay-field">
                      <label className="pay-label">Numéro de carte *</label>
                      <div className="pay-input-wrapper">
                        <input
                          className="pay-input pay-input--icon-right"
                          name="cardNumber" type="text"
                          placeholder="0000 0000 0000 0000"
                          required maxLength={19}
                          value={cardForm.cardNumber} onChange={handleCardChange}
                        />
                        <span className="pay-input-icon">
                          {cardType === 'visa' ? '💳' : cardType === 'mastercard' ? '🔴' : cardType === 'edinar' ? '🇹🇳' : '🟦'}
                        </span>
                      </div>
                    </div>

                    {/* Cardholder name */}
                    <div className="pay-field">
                      <label className="pay-label">Nom sur la carte *</label>
                      <input
                        className="pay-input"
                        name="cardName" type="text"
                        placeholder="PRÉNOM NOM"
                        required
                        value={cardForm.cardName} onChange={handleCardChange}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>

                    {/* Expiry + CVV on the same row */}
                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Date d'expiration *</label>
                        <input className="pay-input" name="expiry" type="text" placeholder="MM/AA" required maxLength={5} value={cardForm.expiry} onChange={handleCardChange} />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">CVV / CVC *</label>
                        <div className="pay-input-wrapper">
                          <input className="pay-input pay-input--icon-right" name="cvv" type="password" placeholder="•••" required maxLength={4} value={cardForm.cvv} onChange={handleCardChange} />
                          {/* Tooltip icon explaining where to find the CVV */}
                          <span className="pay-input-info" title="Code à 3 ou 4 chiffres au dos de votre carte">ℹ️</span>
                        </div>
                      </div>
                    </div>

                    {/* Optional billing address */}
                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Adresse de facturation</label>
                        <input className="pay-input" name="billingAddr" type="text" placeholder="Rue, numéro…" value={cardForm.billingAddr} onChange={handleCardChange} />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">Ville</label>
                        <input className="pay-input" name="billingCity" type="text" placeholder="Tunis" value={cardForm.billingCity} onChange={handleCardChange} />
                      </div>
                    </div>

                    {/* SSL security reassurance note */}
                    <div className="payment-security-note">
                      <span className="payment-security-note__icon">🔒</span>
                      <div>
                        <div className="payment-security-note__title">Paiement 100% sécurisé</div>
                        <div className="payment-security-note__desc">Vos données sont chiffrées via SSL 256-bit.</div>
                      </div>
                    </div>

                    {/* Submit — calls handleOnlineSubmit → saveReservation('online') */}
                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? '⏳ Traitement en cours…' : `Payer ${pricing.finalAmount.toLocaleString('fr-FR')} TND →`}
                    </button>
                  </form>
                </div>
              )}

              {/* ── Agency payment card ──────────────────────────── */}
              {/* Only rendered when the user selects "Payer à l'agence" */}
              {method === 'agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">🏪 Nos coordonnées</h3>

                  {/* Embedded Google Maps iframe showing the agency location */}
                  <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--pay-border)' }}>
                    <iframe
                      title="Tictac Voyages"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn"
                      width="100%" height="200"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen="" loading="lazy"
                    />
                  </div>

                  {/* Agency contact details list */}
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

                  {/* 48-hour reservation hold warning + promo expiry notice */}
                  <div className="agency-warning">
                    ℹ️ Votre réservation sera retenue <strong>48h</strong>. Présentez-vous à l'agence avec votre confirmation par email.
                    {appliedPromotion?.date_fin && (
                      <> Votre promotion se termine le {new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.</>
                    )}
                  </div>

                  {/* Confirm button — calls handleAgencyConfirm → saveReservation('agency') */}
                  <button className="payment-submit-btn" onClick={handleAgencyConfirm} disabled={loading}>
                    {loading ? '⏳ Confirmation…' : "Confirmer & payer à l'agence →"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Right column: trip summary sidebar ────────────── */}
            <aside className="payment-sidebar">
              {/* Trip preview card (image + key metadata) */}
              <div className="payment-trip-card">
                <img src={image} alt={titre} className="payment-trip-card__img" />
                <div className="payment-trip-card__body">
                  <div className="payment-trip-card__country">{pays} · {destination}</div>
                  <div className="payment-trip-card__title">{titre}</div>
                  <div className="payment-trip-card__meta">
                    {[
                      { icon: '✈️', text: `Départ depuis ${depart}` },
                      { icon: '🕐', text: duree },
                      { icon: '👥', text: `${personnes} voyageur${personnes > 1 ? 's' : ''}` },
                      { icon: '🛏️', text: `Chambre ${booking.chambre}` },
                    ].map((item, i) => (
                      <div key={i} className="payment-trip-card__meta-item">
                        <span>{item.icon}</span> {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price breakdown card — updates live when a promo is applied */}
              <div className="payment-price-card">
                <div className="payment-price-card__title">Récapitulatif du prix</div>
                {[
                  { label: 'Prix / personne',                                    value: `${Number(prix).toLocaleString('fr-FR')} TND` },
                  { label: `× ${personnes} voyageur${personnes > 1 ? 's' : ''}`, value: `${totalPrix.toLocaleString('fr-FR')} TND` },
                  // Discount row — only shown when a promo is active
                  ...(pricing.discountAmount > 0
                    ? [{ label: 'Réduction promo', value: `- ${pricing.discountAmount.toLocaleString('fr-FR')} TND` }]
                    : []),
                  { label: 'Taxes & frais', value: 'Inclus' },
                ].map((row, i) => (
                  <div key={i} className="payment-price-row">
                    <span>{row.label}</span>
                    <span className="payment-price-row__value">{row.value}</span>
                  </div>
                ))}
                {/* Grand total — bold, prominent */}
                <div className="payment-price-total">
                  <span className="payment-price-total__label">Total</span>
                  <span className="payment-price-total__amount">{pricing.finalAmount.toLocaleString('fr-FR')} TND</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OmraPayment;