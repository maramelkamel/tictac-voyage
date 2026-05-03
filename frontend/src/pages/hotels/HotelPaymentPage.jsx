import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Payment.css';
import { createHotelBooking } from '../../services/api';
import { usePromotions } from '../../hooks/usePromotions';
import {
  findPromotionByCode,
  getPromotionPricing,
  normalizePromoCode,
  serializeAppliedPromotion,
} from '../../utils/promotionPricing';

const isSessionMessage = (message = '') => {
  const normalized = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return normalized.includes('session')
    || normalized.includes('reconnectez')
    || normalized.includes('connecte');
};

const ErrorPopup = ({ message, onClose, onAction, actionLabel = 'Se reconnecter' }) => {
  if (!message) return null;
  const sessionExpired = isSessionMessage(message);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '36px 40px',
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,.2)',
          textAlign: 'center',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            fontSize: 28,
          }}
        >
          !
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginBottom: 10 }}>
          Erreur de reservation
        </h3>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>
          {message}
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          {sessionExpired && onAction && (
            <button
              onClick={onAction}
              style={{
                padding: '13px 28px',
                borderRadius: 12,
                border: 'none',
                background: '#E92F64',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                width: '100%',
              }}
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '13px 28px',
              borderRadius: 12,
              border: 'none',
              background: '#0F4C5C',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

const HotelPaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState(null);
  const [cardType, setCardType] = useState('visa');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    billingAddr: '',
    billingCity: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { promos } = usePromotions('categorie', 'hotels');

  if (!state?.hotel || !state?.reservation) {
    return (
      <div className="payment-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>:-(</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            Session expiree.
          </p>
          <button className="payment-fallback__btn" onClick={() => navigate('/hotels')}>
            Retour aux hotels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { hotel, reservation } = state;
  const totalPrix = Number(state.totalPrix || 0) || (Number(hotel.base_price || 0) * Number(reservation.rooms || 1));
  const currency = hotel.currency || 'TND';
  const pricing = getPromotionPricing(totalPrix, appliedPromotion);

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

  const saveReservation = async (paymentMethod) => {
    return createHotelBooking({
      hotel,
      reservation,
      payment_method: paymentMethod,
      promo_code: appliedPromotion?.code_promo || null,
      applied_promotion: serializeAppliedPromotion(appliedPromotion, 'hotels'),
      display_total: pricing.finalAmount,
    });
  };

  const handleOnlineSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await saveReservation('online');
      setMethod('online');
      setSuccessMessage(
        `Votre paiement de ${pricing.finalAmount.toLocaleString('fr-FR')} ${currency} a ete traite. La confirmation a ete envoyee a ${reservation.holder_email}.`
      );
      setSubmitted(true);
    } catch (error) {
      setPopup(error.message || 'Erreur lors de la reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgencyConfirm = async () => {
    setLoading(true);
    try {
      await saveReservation('agency');
      setMethod('agency');
      setSuccessMessage(
        `Votre reservation pour ${hotel.name} est enregistree. Notre equipe vous contactera sur ${reservation.holder_email}.`
      );
      setSubmitted(true);
    } catch (error) {
      setPopup(error.message || 'Erreur lors de la reservation.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-success">
          <div className="payment-success__card">
            <div className="payment-success__icon">OK</div>
            <h2 className="payment-success__title">
              {method === 'agency' ? 'Reservation confirmee !' : 'Paiement effectue !'}
            </h2>
            <p className="payment-success__desc">
              Merci <strong>{reservation.holder_first_name} {reservation.holder_last_name}</strong> pour votre reservation de{' '}
              <strong>{hotel.name}</strong>. {successMessage}
            </p>
            <div className="payment-success__actions">
              <button className="payment-success__btn" onClick={() => navigate('/hotels')}>
                Voir d'autres hotels
              </button>
              <button
                className="payment-success__btn"
                style={{ background: 'var(--primary)' }}
                onClick={() => navigate('/mon-compte?tab=reservations')}
              >
                Mes reservations
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

      <ErrorPopup
        message={popup}
        onClose={() => setPopup('')}
        onAction={() => navigate('/SignIn')}
      />

      <div className="payment-hero">
        <div className="container">
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/hotels')}>
              Hotels
            </button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-2)}>
              {hotel.city}
            </button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>
              Reservation
            </button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">Paiement</span>
          </div>
          <div className="payment-steps">
            {[
              { n: 1, label: 'Informations', state: 'done' },
              { n: 2, label: 'Paiement', state: 'active' },
              { n: 3, label: 'Confirmation', state: 'pending' },
            ].map((step, index) => (
              <React.Fragment key={step.label}>
                <div className="payment-step">
                  <div className={`payment-step__circle payment-step__circle--${step.state}`}>
                    {step.state === 'done' ? 'OK' : step.n}
                  </div>
                  <span className={`payment-step__label payment-step__label--${step.state}`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`payment-step__line payment-step__line--${index === 0 ? 'done' : 'pending'}`} />
                )}
              </React.Fragment>
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
                  <div className="payment-total-banner__label">Montant total a regler</div>
                  <div className="payment-total-banner__amount">
                    {pricing.finalAmount.toLocaleString('fr-FR')} <span>{currency}</span>
                  </div>
                  <div className="payment-total-banner__sub">
                    {Number(hotel.base_price || 0).toLocaleString('fr-FR')} {currency} x {reservation.rooms} chambre(s)
                    {pricing.discountAmount > 0 && ` - reduction de ${pricing.discountAmount.toLocaleString('fr-FR')} ${currency}`}
                  </div>
                </div>
                <div className="payment-total-banner__badge">Paiement securise</div>
              </div>

              <div className="payment-card">
                <h3 className="payment-card__title">Code promo</h3>
                <p className="payment-card__subtitle">
                  Ajoutez le code promo de cette page pour recalculer le total.
                </p>
                <div className="pay-form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="pay-field" style={{ flex: 1 }}>
                    <label className="pay-label">Code promo</label>
                    <input
                      className="pay-input"
                      type="text"
                      value={promoCode}
                      onChange={handlePromoChange}
                      placeholder="Ex: HOTEL10"
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
                {promoError && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
                    {promoError}
                  </div>
                )}
                {promoMessage && appliedPromotion && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600 }}>
                    {promoMessage} Valable jusqu'au {new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.
                  </div>
                )}
              </div>

              <div className="payment-card">
                <h3 className="payment-card__title">Choisissez votre mode de paiement</h3>
                <p className="payment-card__subtitle">
                  Meme logique que la page Voyage Organise, avec confirmation immediate de votre reservation hotel.
                </p>
                <div className="payment-method-row">
                  <button
                    className={`payment-method-btn ${method === 'online' ? 'payment-method-btn--online' : ''}`}
                    onClick={() => setMethod('online')}
                  >
                    <div className="payment-method-btn__icon">Card</div>
                    <div className={`payment-method-btn__title ${method === 'online' ? 'payment-method-btn__title--online' : ''}`}>
                      Payer en ligne
                    </div>
                    <div className="payment-method-btn__desc">
                      Carte bancaire, e-Dinar
                      <br />
                      Paiement immediat et securise
                    </div>
                    {method === 'online' && (
                      <div className="payment-method-btn__badge payment-method-btn__badge--online">
                        Selectionne
                      </div>
                    )}
                  </button>
                  <button
                    className={`payment-method-btn ${method === 'agency' ? 'payment-method-btn--agency' : ''}`}
                    onClick={() => setMethod('agency')}
                  >
                    <div className="payment-method-btn__icon">Agence</div>
                    <div className={`payment-method-btn__title ${method === 'agency' ? 'payment-method-btn__title--agency' : ''}`}>
                      Payer a l'agence
                    </div>
                    <div className="payment-method-btn__desc">
                      Especes ou virement
                      <br />
                      Rendez-vous en agence
                    </div>
                    {method === 'agency' && (
                      <div className="payment-method-btn__badge payment-method-btn__badge--agency">
                        Selectionne
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {method === 'online' && (
                <div className="payment-card">
                  <h3 className="payment-card__title">Informations de paiement</h3>
                  <div style={{ marginBottom: 22 }}>
                    <label className="pay-label">Type de carte</label>
                    <div className="card-types">
                      {[
                        { key: 'visa', label: 'Visa', icon: 'V' },
                        { key: 'mastercard', label: 'Mastercard', icon: 'M' },
                        { key: 'edinar', label: 'e-Dinar', icon: 'TND' },
                        { key: 'amex', label: 'Amex', icon: 'A' },
                      ].map((card) => (
                        <button
                          key={card.key}
                          type="button"
                          className={`card-type-btn ${cardType === card.key ? 'card-type-btn--selected' : ''}`}
                          onClick={() => setCardType(card.key)}
                        >
                          <span>{card.icon}</span> {card.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <form className="pay-form" onSubmit={handleOnlineSubmit}>
                    <div className="pay-field">
                      <label className="pay-label">Numero de carte *</label>
                      <div className="pay-input-wrapper">
                        <input
                          className="pay-input pay-input--icon-right"
                          name="cardNumber"
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          required
                          maxLength={19}
                          value={cardForm.cardNumber}
                          onChange={handleCardChange}
                        />
                        <span className="pay-input-icon">
                          {cardType === 'visa' ? 'V' : cardType === 'mastercard' ? 'M' : cardType === 'edinar' ? 'TND' : 'A'}
                        </span>
                      </div>
                    </div>
                    <div className="pay-field">
                      <label className="pay-label">Nom sur la carte *</label>
                      <input
                        className="pay-input"
                        name="cardName"
                        type="text"
                        placeholder="PRENOM NOM"
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
                          name="expiry"
                          type="text"
                          placeholder="MM/AA"
                          required
                          maxLength={5}
                          value={cardForm.expiry}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">CVV / CVC *</label>
                        <div className="pay-input-wrapper">
                          <input
                            className="pay-input pay-input--icon-right"
                            name="cvv"
                            type="password"
                            placeholder="***"
                            required
                            maxLength={4}
                            value={cardForm.cvv}
                            onChange={handleCardChange}
                          />
                          <span className="pay-input-info" title="Code a 3 ou 4 chiffres au dos de votre carte">
                            i
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Adresse de facturation</label>
                        <input
                          className="pay-input"
                          name="billingAddr"
                          type="text"
                          placeholder="Rue, numero..."
                          value={cardForm.billingAddr}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">Ville</label>
                        <input
                          className="pay-input"
                          name="billingCity"
                          type="text"
                          placeholder="Tunis"
                          value={cardForm.billingCity}
                          onChange={handleCardChange}
                        />
                      </div>
                    </div>
                    <div className="payment-security-note">
                      <span className="payment-security-note__icon">Lock</span>
                      <div>
                        <div className="payment-security-note__title">Paiement 100% securise</div>
                        <div className="payment-security-note__desc">Vos donnees sont chiffrees via SSL 256-bit.</div>
                      </div>
                    </div>
                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? 'Traitement en cours...' : `Payer ${pricing.finalAmount.toLocaleString('fr-FR')} ${currency} ->`}
                    </button>
                  </form>
                </div>
              )}

              {method === 'agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">Nos coordonnees</h3>
                  <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--pay-border)' }}>
                    <iframe
                      title="Tictac Voyages"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn"
                      width="100%"
                      height="200"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen=""
                      loading="lazy"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {[
                      { icon: 'Adresse', label: 'Adresse', value: 'Nouvelle Medina, Tunis, Tunisie' },
                      { icon: 'Telephone', label: 'Telephone', value: '+216 36 149 885' },
                      { icon: 'WhatsApp', label: 'WhatsApp', value: '+216 36 149 885' },
                      { icon: 'Horaires', label: 'Horaires', value: 'Lun - Ven : 09h-18h | Sam : 09h-14h' },
                    ].map((item) => (
                      <div key={item.label} className="agency-contact-item">
                        <span className="agency-contact-item__icon">{item.icon}</span>
                        <div>
                          <div className="agency-contact-item__label">{item.label}</div>
                          <div className="agency-contact-item__value">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="agency-warning">
                    Votre reservation sera retenue 48h. Presentez-vous a l'agence avec votre confirmation par email.
                    {appliedPromotion?.date_fin && (
                      <> Votre promotion se termine le {new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.</>
                    )}
                  </div>
                  <button className="payment-submit-btn" onClick={handleAgencyConfirm} disabled={loading}>
                    {loading ? 'Confirmation...' : "Confirmer et payer a l'agence ->"}
                  </button>
                </div>
              )}
            </div>

            <aside className="payment-sidebar">
              <div className="payment-trip-card">
                <img src={hotel.image_url} alt={hotel.name} className="payment-trip-card__img" />
                <div className="payment-trip-card__body">
                  <div className="payment-trip-card__country">{hotel.city} · {hotel.property_type || 'Hotel'}</div>
                  <div className="payment-trip-card__title">{hotel.name}</div>
                  <div className="payment-trip-card__meta">
                    {[
                      { icon: 'Location', text: hotel.address },
                      { icon: 'Dates', text: `${reservation.check_in} -> ${reservation.check_out}` },
                      { icon: 'Voyageurs', text: `${reservation.adults} adulte(s)` },
                      { icon: 'Chambres', text: `${reservation.rooms} chambre(s)` },
                    ].map((item) => (
                      <div key={item.icon} className="payment-trip-card__meta-item">
                        <span>{item.icon}</span> {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="payment-price-card">
                <div className="payment-price-card__title">Recapitulatif du prix</div>
                {[
                  { label: 'Prix / chambre', value: `${Number(hotel.base_price || 0).toLocaleString('fr-FR')} ${currency}` },
                  { label: `x ${reservation.rooms} chambre(s)`, value: `${totalPrix.toLocaleString('fr-FR')} ${currency}` },
                  ...(pricing.discountAmount > 0 ? [{ label: 'Reduction promo', value: `- ${pricing.discountAmount.toLocaleString('fr-FR')} ${currency}` }] : []),
                  { label: 'Taxes et frais', value: 'Inclus' },
                ].map((row) => (
                  <div key={row.label} className="payment-price-row">
                    <span>{row.label}</span>
                    <span className="payment-price-row__value">{row.value}</span>
                  </div>
                ))}
                <div className="payment-price-total">
                  <span className="payment-price-total__label">Total</span>
                  <span className="payment-price-total__amount">
                    {pricing.finalAmount.toLocaleString('fr-FR')} {currency}
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
