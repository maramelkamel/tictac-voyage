import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { createHotelBooking } from '../../services/api';
import { usePromotions } from '../../hooks/usePromotions';
import {
  findPromotionByCode,
  getPromotionPricing,
  normalizePromoCode,
  serializeAppliedPromotion,
} from '../../utils/promotionPricing';
import '../../styles/Payment.css';

const ErrorPopup = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: '36px 40px', maxWidth: 460, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.2)', textAlign: 'center' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 28 }}>
          !
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginBottom: 10 }}>Erreur de reservation</h3>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>{message}</p>
        <button
          onClick={onClose}
          style={{ padding: '13px 28px', borderRadius: 12, border: 'none', background: '#0F4C5C', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

const HotelPaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const hotel = state?.hotel;
  const reservation = state?.reservation;

  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [popup, setPopup] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const { promos } = usePromotions('categorie', 'hotels');

  if (!hotel || !reservation) {
    return (
      <div className="payment-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>Hotel</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>Hotel payment session expired.</p>
          <button className="payment-fallback__btn" onClick={() => navigate('/hotels')}>
            Back to hotels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const baseAmount = Number(hotel.price_numeric) || 0;
  const currency = hotel.currency || 'USD';
  const pricing = getPromotionPricing(baseAmount, appliedPromotion);
  const isPriced = baseAmount > 0;

  const handleCardChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === 'cardNumber') nextValue = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
      if (nextValue.length > 2) nextValue = `${nextValue.slice(0, 2)}/${nextValue.slice(2)}`;
    }
    if (name === 'cvv') nextValue = value.replace(/\D/g, '').slice(0, 4);

    setCardForm((current) => ({ ...current, [name]: nextValue }));
  };

  const handlePromoChange = (event) => {
    const nextCode = event.target.value;
    setPromoCode(nextCode);
    setPromoError('');
    setPromoMessage('');

    if (normalizePromoCode(nextCode) !== normalizePromoCode(appliedPromotion?.code_promo)) {
      setAppliedPromotion(null);
    }
  };

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
    setPromoMessage(`Code ${matchedPromotion.code_promo} applique.`);
  };

  const finishBooking = async (paymentMethod) => {
    if (paymentMethod === 'online' && !isPriced) {
      setPopup('Le prix MakCorps est indisponible pour cet hotel. Vous pouvez enregistrer la reservation et finaliser le paiement a l agence.');
      return;
    }

    setLoading(true);

    try {
      const response = await createHotelBooking({
        hotel,
        reservation,
        payment_method: paymentMethod,
        promo_code: appliedPromotion?.code_promo || null,
        applied_promotion: serializeAppliedPromotion(appliedPromotion, 'hotels'),
        display_total: isPriced ? pricing.finalAmount : null,
      });

      setMethod(paymentMethod);
      setSuccessMessage(
        paymentMethod === 'online'
          ? (response.message || `Votre paiement de ${pricing.finalAmount.toLocaleString('fr-FR')} ${currency} a ete enregistre avec succes.`)
          : (response.message || "Votre reservation a bien ete enregistree. Finalisez le paiement a l'agence.")
      );
      setSubmitted(true);
    } catch (bookingError) {
      setPopup(bookingError.message || 'Unable to confirm this hotel booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineSubmit = async (event) => {
    event.preventDefault();
    await finishBooking('online');
  };

  const handleAgencySubmit = async () => {
    await finishBooking('agency');
  };

  if (submitted) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-success">
          <div className="payment-success__card">
            <div className="payment-success__icon">OK</div>
            <h2 className="payment-success__title">
              {method === 'agency' ? 'Hotel reservation confirmed' : 'Hotel payment completed'}
            </h2>
            <p className="payment-success__desc">
              {successMessage} Your reservation for <strong>{hotel.name}</strong> is now saved in your account.
            </p>
            <div className="payment-success__actions">
              <button className="payment-success__btn" onClick={() => navigate('/hotels')}>
                Search another hotel
              </button>
              <button className="payment-success__btn" style={{ background: 'var(--primary)' }} onClick={() => navigate('/mon-compte?tab=reservations')}>
                My reservations
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />

      <ErrorPopup message={popup} onClose={() => setPopup('')} />

      <div className="payment-hero">
        <div className="container">
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/hotels')}>Hotels</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>Reservation</button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">Payment</span>
          </div>
          <div className="payment-steps">
            {[{ n: 1, label: 'Reservation', state: 'done' }, { n: 2, label: 'Payment', state: 'active' }, { n: 3, label: 'Confirmation', state: 'pending' }].map((step, index) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: index < 2 ? 1 : 'initial' }}>
                <div className="payment-step">
                  <div className={`payment-step__circle payment-step__circle--${step.state}`}>{step.state === 'done' ? 'OK' : step.n}</div>
                  <span className={`payment-step__label payment-step__label--${step.state}`}>{step.label}</span>
                </div>
                {index < 2 && <div className={`payment-step__line payment-step__line--${index === 0 ? 'done' : 'pending'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="payment-body">
        <div className="container">
          <div className="payment-layout">
            <div>
              <div className="payment-total-banner">
                <div>
                  <div className="payment-total-banner__label">Total to pay</div>
                  <div className="payment-total-banner__amount">
                    {isPriced ? pricing.finalAmount.toLocaleString('fr-FR') : 'N/A'} <span>{currency}</span>
                  </div>
                  <div className="payment-total-banner__sub">
                    {hotel.name} · {reservation.check_in} → {reservation.check_out}
                    {appliedPromotion && isPriced ? ` • reduction de ${pricing.discountAmount.toLocaleString('fr-FR')} ${currency}` : ''}
                  </div>
                </div>
                <div className="payment-total-banner__badge">Booking + MakCorps flow</div>
              </div>

              {!isPriced && (
                <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 12, padding: '12px 16px', color: '#9a3412', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
                  Le prix MakCorps est indisponible pour cet hotel. La reservation reste possible, mais le paiement en ligne est desactive.
                </div>
              )}

              <div className="payment-card">
                <h3 className="payment-card__title">Code promo</h3>
                <p className="payment-card__subtitle">Ajoutez un code promotion hotel pour recalculer le total final.</p>
                <div className="pay-form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="pay-field" style={{ flex: 1 }}>
                    <label className="pay-label">Code promo</label>
                    <input className="pay-input" type="text" value={promoCode} onChange={handlePromoChange} placeholder="Ex: HOTEL10" style={{ textTransform: 'uppercase' }} />
                  </div>
                  <button type="button" className="payment-submit-btn" style={{ width: 'auto', minWidth: 180 }} onClick={handleApplyPromo}>
                    Appliquer le code
                  </button>
                </div>
                {promoError && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>{promoError}</div>}
                {promoMessage && appliedPromotion && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600 }}>
                    {promoMessage} Valable jusqu'au {new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.
                  </div>
                )}
              </div>

              <div className="payment-card">
                <h3 className="payment-card__title">Choose your payment method</h3>
                <p className="payment-card__subtitle">Hotels follow the same flow as flights: select a payment mode, confirm the booking, and save the reservation.</p>
                <div className="payment-method-row">
                  <button
                    className={`payment-method-btn ${method === 'online' ? 'payment-method-btn--online' : ''}`}
                    onClick={() => setMethod('online')}
                    disabled={!isPriced}
                    style={!isPriced ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                  >
                    <div className="payment-method-btn__icon">Card</div>
                    <div className={`payment-method-btn__title ${method === 'online' ? 'payment-method-btn__title--online' : ''}`}>Pay online</div>
                    <div className="payment-method-btn__desc">Immediate confirmation and payment recording</div>
                  </button>
                  <button className={`payment-method-btn ${method === 'agency' ? 'payment-method-btn--agency' : ''}`} onClick={() => setMethod('agency')}>
                    <div className="payment-method-btn__icon">Agency</div>
                    <div className={`payment-method-btn__title ${method === 'agency' ? 'payment-method-btn__title--agency' : ''}`}>Pay at agency</div>
                    <div className="payment-method-btn__desc">Reservation saved now, payment finalized with the team</div>
                  </button>
                </div>
              </div>

              {method === 'online' && isPriced && (
                <div className="payment-card">
                  <h3 className="payment-card__title">Card details</h3>
                  <form className="pay-form" onSubmit={handleOnlineSubmit}>
                    <div className="pay-field">
                      <label className="pay-label">Card number *</label>
                      <input className="pay-input" name="cardNumber" value={cardForm.cardNumber} onChange={handleCardChange} placeholder="0000 0000 0000 0000" required />
                    </div>
                    <div className="pay-field">
                      <label className="pay-label">Name on card *</label>
                      <input className="pay-input" name="cardName" value={cardForm.cardName} onChange={handleCardChange} placeholder="FIRST LAST" required />
                    </div>
                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Expiry *</label>
                        <input className="pay-input" name="expiry" value={cardForm.expiry} onChange={handleCardChange} placeholder="MM/YY" required />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">CVV *</label>
                        <input className="pay-input" name="cvv" value={cardForm.cvv} onChange={handleCardChange} placeholder="***" required />
                      </div>
                    </div>
                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? 'Processing...' : `Pay ${pricing.finalAmount.toLocaleString('fr-FR')} ${currency}`}
                    </button>
                  </form>
                </div>
              )}

              {method === 'agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">Agency payment</h3>
                  <p className="payment-card__subtitle">We will keep this hotel reservation pending until the agency payment is finalized.</p>
                  {appliedPromotion?.date_fin && (
                    <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#fff7ed', color: '#9a3412', fontSize: 13, fontWeight: 600 }}>
                      Votre code promo reste valable jusqu'au {new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.
                    </div>
                  )}
                  <button className="payment-submit-btn" onClick={handleAgencySubmit} disabled={loading}>
                    {loading ? 'Confirming...' : "Confirm and pay at agency"}
                  </button>
                </div>
              )}
            </div>

            <aside className="payment-sidebar">
              <div className="payment-trip-card">
                <div className="payment-trip-card__body">
                  <div className="payment-trip-card__country">{hotel.city}</div>
                  <div className="payment-trip-card__title">{hotel.name}</div>
                  <div className="payment-trip-card__meta">
                    <div className="payment-trip-card__meta-item"><span>Location</span> {hotel.location}</div>
                    <div className="payment-trip-card__meta-item"><span>Dates</span> {reservation.check_in} → {reservation.check_out}</div>
                    <div className="payment-trip-card__meta-item"><span>Guests</span> {reservation.adults} adults · {reservation.rooms} room(s)</div>
                    <div className="payment-trip-card__meta-item"><span>Rating</span> {hotel.rating}</div>
                  </div>
                </div>
              </div>

              <div className="payment-price-card">
                <div className="payment-price-card__title">Booking summary</div>
                <div className="payment-price-row">
                  <span>Hotel</span>
                  <span className="payment-price-row__value">{hotel.name}</span>
                </div>
                <div className="payment-price-row">
                  <span>Source</span>
                  <span className="payment-price-row__value">{hotel.source}</span>
                </div>
                <div className="payment-price-row">
                  <span>Availability</span>
                  <span className="payment-price-row__value">{hotel.availabilityLabel}</span>
                </div>
                {pricing.discountAmount > 0 && (
                  <div className="payment-price-row">
                    <span>Promo discount</span>
                    <span className="payment-price-row__value">- {pricing.discountAmount.toLocaleString('fr-FR')} {currency}</span>
                  </div>
                )}
                <div className="payment-price-total">
                  <span className="payment-price-total__label">Total</span>
                  <span className="payment-price-total__amount">
                    {isPriced ? pricing.finalAmount.toLocaleString('fr-FR') : 'N/A'} {currency}
                  </span>
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

export default HotelPaymentPage;
