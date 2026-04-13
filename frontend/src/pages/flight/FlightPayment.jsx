import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Payment.css';

const API = 'http://localhost:5000/api/flights/book';

const FlightPayment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState(null);
  const [cardType, setCardType] = useState('visa');
  const [cardForm, setCardForm] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '', billingAddr: '', billingCity: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Fallback ────────────────────────────────────────────────────────────────
  if (!state?.offer || !state?.passengers || !state?.flightInfo) {
    return (
      <div className="payment-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>Session expirée.</p>
          <button className="payment-fallback__btn" onClick={() => navigate('/flights/search')}>
            ← Retour à la recherche
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { offer, passengers, flightInfo } = state;
  const { origin, destination, departureAt, airline, flightNumber, totalAmount, currency } = flightInfo;

  // ── Card formatting ─────────────────────────────────────────────────────────
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry') { v = value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); }
    if (name === 'cvv') v = value.replace(/\D/g, '').slice(0, 4);
    setCardForm({ ...cardForm, [name]: v });
  };

  // ── API call ────────────────────────────────────────────────────────────────
  const bookFlight = async (paymentMethod) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Vous devez être connecté pour réserver.');

    // Build Duffel-compatible passengers payload
    const duffelPassengers = passengers.map((pax) => ({
      id: offer.passengers?.find((p) => p.type === 'adult')?.id,
      title: pax.title,
      given_name: pax.given_name.toUpperCase(),
      family_name: pax.family_name.toUpperCase(),
      born_on: pax.born_on,
      gender: pax.gender,
      email: pax.email,
      phone_number: pax.phone_number,
      identity_documents: [
        {
          unique_identifier: pax.passport_number,
          issuing_country_code: pax.passport_issuing_country.toUpperCase(),
          expires_on: pax.passport_expires,
          type: 'passport',
        },
      ],
    }));

    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        offer_id: offer.id,
        passengers: duffelPassengers,
        payment_method: paymentMethod,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Erreur serveur');
    return json;
  };

  // ── Online payment submit ───────────────────────────────────────────────────
  const handleOnlineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      await bookFlight('online');
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  // ── Agency confirm ──────────────────────────────────────────────────────────
  const handleAgencyConfirm = async () => {
    setLoading(true);
    setApiError('');
    try {
      await bookFlight('agency');
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS ─────────────────────────────────────────────────────────────────
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
              Merci pour votre réservation du vol <strong>{origin} → {destination}</strong>.{' '}
              {method === 'agency'
                ? <>Rendez-vous à notre agence pour finaliser le paiement. Un conseiller vous contactera sous 24h.</>
                : <>Votre paiement de <strong>{totalAmount.toLocaleString('fr-FR')} {currency}</strong> a été traité. Votre billet vous sera envoyé par email.</>
              }
            </p>
            <div className="payment-success__actions">
              <button className="payment-success__btn" onClick={() => navigate('/flights/search')}>
                ← Chercher un autre vol
              </button>
              <button className="payment-success__btn" onClick={() => navigate('/my-bookings')} style={{ background: 'var(--primary)' }}>
                Mes réservations
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── MAIN PAGE ───────────────────────────────────────────────────────────────
  return (
    <div className="payment-page">
      <Navbar />

      {/* Hero / Steps bar */}
      <div className="payment-hero">
        <div className="container">
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/flights/search')}>← Vols</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>Réservation</button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">Paiement</span>
          </div>
          <div className="payment-steps">
            {[
              { n: 1, label: 'Passagers', state: 'done' },
              { n: 2, label: 'Paiement', state: 'active' },
              { n: 3, label: 'Confirmation', state: 'pending' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="payment-step">
                  <div className={`payment-step__circle payment-step__circle--${step.state}`}>
                    {step.state === 'done' ? '✓' : step.n}
                  </div>
                  <span className={`payment-step__label payment-step__label--${step.state}`}>{step.label}</span>
                </div>
                {i < 2 && <div className={`payment-step__line payment-step__line--${i === 0 ? 'done' : 'pending'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="payment-body">
        <div className="container">
          <div className="payment-layout">
            {/* LEFT */}
            <div>
              {/* Total banner */}
              <div className="payment-total-banner">
                <div>
                  <div className="payment-total-banner__label">Montant total à régler</div>
                  <div className="payment-total-banner__amount">
                    {totalAmount.toLocaleString('fr-FR')} <span>{currency}</span>
                  </div>
                  <div className="payment-total-banner__sub">
                    Vol {origin} → {destination} · {passengers.length} passager{passengers.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="payment-total-banner__badge">🔒 Paiement sécurisé</div>
              </div>

              {/* API error */}
              {apiError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b', display: 'flex', gap: 8, alignItems: 'center' }}>
                  ⚠️ {apiError}
                </div>
              )}

              {/* Method selection */}
              <div className="payment-card">
                <h3 className="payment-card__title">Choisissez votre mode de paiement</h3>
                <p className="payment-card__subtitle">Sélectionnez l'option qui vous convient le mieux.</p>
                <div className="payment-method-row">
                  <button className={`payment-method-btn ${method === 'online' ? 'payment-method-btn--online' : ''}`} onClick={() => setMethod('online')}>
                    <div className="payment-method-btn__icon">💳</div>
                    <div className={`payment-method-btn__title ${method === 'online' ? 'payment-method-btn__title--online' : ''}`}>Payer en ligne</div>
                    <div className="payment-method-btn__desc">Carte bancaire, e-Dinar<br />Paiement immédiat & sécurisé</div>
                    {method === 'online' && <div className="payment-method-btn__badge payment-method-btn__badge--online">✓ Sélectionné</div>}
                  </button>
                  <button className={`payment-method-btn ${method === 'agency' ? 'payment-method-btn--agency' : ''}`} onClick={() => setMethod('agency')}>
                    <div className="payment-method-btn__icon">🏪</div>
                    <div className={`payment-method-btn__title ${method === 'agency' ? 'payment-method-btn__title--agency' : ''}`}>Payer à l'agence</div>
                    <div className="payment-method-btn__desc">Espèces ou virement<br />Rendez-vous en agence</div>
                    {method === 'agency' && <div className="payment-method-btn__badge payment-method-btn__badge--agency">✓ Sélectionné</div>}
                  </button>
                </div>
              </div>

              {/* ONLINE FORM */}
              {method === 'online' && (
                <div className="payment-card">
                  <h3 className="payment-card__title">💳 Informations de paiement</h3>
                  <div style={{ marginBottom: 22 }}>
                    <label className="pay-label">Type de carte</label>
                    <div className="card-types">
                      {[{ key: 'visa', label: 'Visa', icon: '💳' }, { key: 'mastercard', label: 'Mastercard', icon: '🔴' }, { key: 'edinar', label: 'e-Dinar', icon: '🇹🇳' }, { key: 'amex', label: 'Amex', icon: '🟦' }].map((c) => (
                        <button key={c.key} type="button" className={`card-type-btn ${cardType === c.key ? 'card-type-btn--selected' : ''}`} onClick={() => setCardType(c.key)}>
                          <span>{c.icon}</span> {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <form className="pay-form" onSubmit={handleOnlineSubmit}>
                    <div className="pay-field">
                      <label className="pay-label">Numéro de carte *</label>
                      <div className="pay-input-wrapper">
                        <input className="pay-input pay-input--icon-right" name="cardNumber" type="text" placeholder="0000 0000 0000 0000" required maxLength={19} value={cardForm.cardNumber} onChange={handleCardChange} />
                        <span className="pay-input-icon">{cardType === 'visa' ? '💳' : cardType === 'mastercard' ? '🔴' : cardType === 'edinar' ? '🇹🇳' : '🟦'}</span>
                      </div>
                    </div>
                    <div className="pay-field">
                      <label className="pay-label">Nom sur la carte *</label>
                      <input className="pay-input" name="cardName" type="text" placeholder="PRÉNOM NOM" required value={cardForm.cardName} onChange={handleCardChange} style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Date d'expiration *</label>
                        <input className="pay-input" name="expiry" type="text" placeholder="MM/AA" required maxLength={5} value={cardForm.expiry} onChange={handleCardChange} />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">CVV / CVC *</label>
                        <div className="pay-input-wrapper">
                          <input className="pay-input pay-input--icon-right" name="cvv" type="password" placeholder="•••" required maxLength={4} value={cardForm.cvv} onChange={handleCardChange} />
                          <span className="pay-input-info" title="Code à 3 ou 4 chiffres au dos de votre carte">ℹ️</span>
                        </div>
                      </div>
                    </div>
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
                    <div className="payment-security-note">
                      <span className="payment-security-note__icon">🔒</span>
                      <div>
                        <div className="payment-security-note__title">Paiement 100% sécurisé</div>
                        <div className="payment-security-note__desc">Vos données sont chiffrées via SSL 256-bit.</div>
                      </div>
                    </div>
                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? '⏳ Traitement en cours…' : `Payer ${totalAmount.toLocaleString('fr-FR')} ${currency} →`}
                    </button>
                  </form>
                </div>
              )}

              {/* AGENCY INFO */}
              {method === 'agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">🏪 Nos coordonnées</h3>
                  <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--pay-border)' }}>
                    <iframe title="Tictac Voyages"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn"
                      width="100%" height="200" style={{ border: 0, display: 'block' }} allowFullScreen="" loading="lazy" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {[
                      { icon: '📍', label: 'Adresse', value: 'Nouvelle Medina, Tunis, Tunisie' },
                      { icon: '📞', label: 'Téléphone', value: '+216 36 149 885' },
                      { icon: '💬', label: 'WhatsApp', value: '+216 36 149 885' },
                      { icon: '🕐', label: 'Horaires', value: 'Lun – Ven : 09h–18h · Sam : 09h–14h' },
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
                  <div className="agency-warning">
                    ℹ️ Votre réservation sera retenue <strong>48h</strong>. Présentez-vous à l'agence avec votre confirmation par email.
                  </div>
                  <button className="payment-submit-btn" onClick={handleAgencyConfirm} disabled={loading}>
                    {loading ? '⏳ Confirmation…' : "Confirmer & payer à l'agence →"}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT Sidebar */}
            <aside className="payment-sidebar">
              <div className="payment-trip-card">
                <div className="payment-trip-card__body" style={{ padding: 20 }}>
                  <div className="payment-trip-card__country">{airline}</div>
                  <div className="payment-trip-card__title">✈️ {origin} → {destination}</div>
                  <div className="payment-trip-card__meta">
                    {[
                      { icon: '🕐', text: `Départ : ${departureAt}` },
                      { icon: '✈️', text: flightNumber ? `Vol ${flightNumber}` : 'Vol direct' },
                      { icon: '👥', text: `${passengers.length} passager${passengers.length > 1 ? 's' : ''}` },
                      { icon: '💺', text: `Classe ${offer.cabin_class || 'Economy'}` },
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
                  { label: `${passengers.length} passager${passengers.length > 1 ? 's' : ''}`, value: `${totalAmount.toLocaleString('fr-FR')} ${currency}` },
                  { label: 'Taxes & frais', value: 'Inclus' },
                ].map((row, i) => (
                  <div key={i} className="payment-price-row">
                    <span>{row.label}</span>
                    <span className="payment-price-row__value">{row.value}</span>
                  </div>
                ))}
                <div className="payment-price-total">
                  <span className="payment-price-total__label">Total</span>
                  <span className="payment-price-total__amount">{totalAmount.toLocaleString('fr-FR')} {currency}</span>
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

export default FlightPayment;