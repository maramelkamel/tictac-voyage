import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Payment.css';
import { usePromotions } from '../../hooks/usePromotions';
import {
  findPromotionByCode,
  getPromotionPricing,
  normalizePromoCode,
  serializeAppliedPromotion,
} from '../../utils/promotionPricing';

const API_RES = 'http://localhost:5000/api/voyage-reservations';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [method, setMethod] = useState(null);
  const [cardType, setCardType] = useState('visa');
  const [cardForm, setCardForm] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '', billingAddr: '', billingCity: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const { promos } = usePromotions('categorie', 'voyages_internationaux');

  if (!state?.voyage || !state?.booking) {
    return (
      <div className="payment-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>:(</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>Session expiree.</p>
          <button className="payment-fallback__btn" onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>
            Retour aux voyages
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { voyage, booking, totalPrix } = state;
  const { titre, image, pays, destination, prix, duree, depart } = voyage;
  const personnes = parseInt(booking.personnes || 1, 10);
  const pricing = getPromotionPricing(totalPrix, appliedPromotion);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'cardNumber') nextValue = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
      if (nextValue.length > 2) nextValue = `${nextValue.slice(0, 2)}/${nextValue.slice(2)}`;
    }
    if (name === 'cvv') nextValue = value.replace(/\D/g, '').slice(0, 4);
    setCardForm({ ...cardForm, [name]: nextValue });
  };

  const handlePromoChange = (e) => {
    const nextCode = e.target.value;
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
    const payload = {
      voyage_id: voyage.id || null,
      first_name: booking.prenom,
      last_name: booking.nom,
      email: booking.email,
      phone: booking.telephone || null,
      chambre_type: booking.chambre || 'double',
      number_of_persons: personnes,
      total_price: pricing.finalAmount,
      payment_method: paymentMethod,
      notes: booking.notes || null,
      promo_code: appliedPromotion?.code_promo || null,
      applied_promotion: serializeAppliedPromotion(appliedPromotion, 'voyages_internationaux'),
      reservation_title: titre,
    };
    const response = await fetch(API_RES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message || 'Erreur serveur');
    return json.data;
  };

  const handleOnlineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      await saveReservation('online');
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Erreur lors de la reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgencyConfirm = async () => {
    setLoading(true);
    setApiError('');
    try {
      await saveReservation('agency');
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Erreur lors de la reservation.');
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
              Merci <strong>{booking.prenom} {booking.nom}</strong> pour votre reservation de <strong>{titre}</strong>.{' '}
              {method === 'agency'
                ? <>Rendez-vous a notre agence pour finaliser le paiement. Un conseiller vous contactera sous 24h a <strong>{booking.email}</strong>.</>
                : <>Votre paiement de <strong>{pricing.finalAmount.toLocaleString('fr-FR')} TND</strong> a ete traite. Confirmation envoyee a <strong>{booking.email}</strong>.</>}
            </p>
            <div className="payment-success__actions">
              <button className="payment-success__btn" onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>
                Voir d'autres voyages
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
      <div className="payment-hero">
        <div className="container">
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>Voyages</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-2)}>{pays}</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>Reservation</button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">Paiement</span>
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
                  <div className="payment-total-banner__amount">{pricing.finalAmount.toLocaleString('fr-FR')} <span>TND</span></div>
                  <div className="payment-total-banner__sub">
                    {Number(prix).toLocaleString('fr-FR')} TND x {personnes} personne{personnes > 1 ? 's' : ''}
                    {pricing.discountAmount > 0 && ` • reduction de ${pricing.discountAmount.toLocaleString('fr-FR')} TND`}
                  </div>
                </div>
                <div className="payment-total-banner__badge">Paiement securise</div>
              </div>

              <div className="payment-card">
                <h3 className="payment-card__title">Code promo</h3>
                <p className="payment-card__subtitle">Ajoutez le code promo de cette page pour recalculer le total.</p>
                <div className="pay-form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="pay-field" style={{ flex: 1 }}>
                    <label className="pay-label">Code promo</label>
                    <input className="pay-input" type="text" value={promoCode} onChange={handlePromoChange} placeholder="Ex: SUMMER15" style={{ textTransform: 'uppercase' }} />
                  </div>
                  <button type="button" className="payment-submit-btn" style={{ width: 'auto', minWidth: 180 }} onClick={handleApplyPromo}>
                    Appliquer le code
                  </button>
                </div>
                {promoError && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>{promoError}</div>}
                {promoMessage && appliedPromotion && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600 }}>{promoMessage} Valable jusqu'au {new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.</div>}
              </div>

              {apiError && <div style={{ margin: '0 0 16px', padding: '12px 16px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>{apiError}</div>}

              <div className="payment-card">
                <h3 className="payment-card__title">Choisissez votre mode de paiement</h3>
                <p className="payment-card__subtitle">Selectionnez l'option qui vous convient le mieux.</p>
                <div className="payment-method-row">
                  <button className={`payment-method-btn ${method === 'online' ? 'payment-method-btn--online' : ''}`} onClick={() => setMethod('online')}>
                    <div className="payment-method-btn__icon">CB</div>
                    <div className={`payment-method-btn__title ${method === 'online' ? 'payment-method-btn__title--online' : ''}`}>Payer en ligne</div>
                    <div className="payment-method-btn__desc">Carte bancaire, e-Dinar<br />Paiement immediat et securise</div>
                    {method === 'online' && <div className="payment-method-btn__badge payment-method-btn__badge--online">Selectionne</div>}
                  </button>
                  <button className={`payment-method-btn ${method === 'agency' ? 'payment-method-btn--agency' : ''}`} onClick={() => setMethod('agency')}>
                    <div className="payment-method-btn__icon">Agence</div>
                    <div className={`payment-method-btn__title ${method === 'agency' ? 'payment-method-btn__title--agency' : ''}`}>Payer a l'agence</div>
                    <div className="payment-method-btn__desc">Especes ou virement<br />Rendez-vous en agence</div>
                    {method === 'agency' && <div className="payment-method-btn__badge payment-method-btn__badge--agency">Selectionne</div>}
                  </button>
                </div>
              </div>

              {method === 'online' && (
                <div className="payment-card">
                  <h3 className="payment-card__title">Informations de paiement</h3>
                  <div style={{ marginBottom: 22 }}>
                    <label className="pay-label">Type de carte</label>
                    <div className="card-types">
                      {['visa', 'mastercard', 'edinar', 'amex'].map((type) => (
                        <button key={type} type="button" className={`card-type-btn ${cardType === type ? 'card-type-btn--selected' : ''}`} onClick={() => setCardType(type)}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <form className="pay-form" onSubmit={handleOnlineSubmit}>
                    <div className="pay-field">
                      <label className="pay-label">Numero de carte *</label>
                      <input className="pay-input" name="cardNumber" type="text" placeholder="0000 0000 0000 0000" required maxLength={19} value={cardForm.cardNumber} onChange={handleCardChange} />
                    </div>
                    <div className="pay-field">
                      <label className="pay-label">Nom sur la carte *</label>
                      <input className="pay-input" name="cardName" type="text" placeholder="PRENOM NOM" required value={cardForm.cardName} onChange={handleCardChange} style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">Date d'expiration *</label>
                        <input className="pay-input" name="expiry" type="text" placeholder="MM/AA" required maxLength={5} value={cardForm.expiry} onChange={handleCardChange} />
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">CVV / CVC *</label>
                        <input className="pay-input" name="cvv" type="password" placeholder="***" required maxLength={4} value={cardForm.cvv} onChange={handleCardChange} />
                      </div>
                    </div>
                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? 'Traitement en cours...' : `Payer ${pricing.finalAmount.toLocaleString('fr-FR')} TND`}
                    </button>
                  </form>
                </div>
              )}

              {method === 'agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">Paiement a l'agence</h3>
                  <div className="agency-warning">
                    Votre reservation sera retenue <strong>48h</strong>. Presentez-vous a l'agence avec votre confirmation par email.
                    {appliedPromotion?.date_fin && ` Votre promotion se termine le ${new Date(appliedPromotion.date_fin).toLocaleDateString('fr-FR')}.`}
                  </div>
                  <button className="payment-submit-btn" onClick={handleAgencyConfirm} disabled={loading}>
                    {loading ? 'Confirmation...' : "Confirmer et payer a l'agence"}
                  </button>
                </div>
              )}
            </div>

            <aside className="payment-sidebar">
              <div className="payment-trip-card">
                <img src={image} alt={titre} className="payment-trip-card__img" />
                <div className="payment-trip-card__body">
                  <div className="payment-trip-card__country">{pays} · {destination}</div>
                  <div className="payment-trip-card__title">{titre}</div>
                  <div className="payment-trip-card__meta">
                    {[`Depart depuis ${depart}`, duree, `${personnes} voyageur${personnes > 1 ? 's' : ''}`, `Chambre ${booking.chambre}`].map((text, index) => (
                      <div key={index} className="payment-trip-card__meta-item">{text}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="payment-price-card">
                <div className="payment-price-card__title">Recapitulatif du prix</div>
                {[
                  { label: 'Prix / personne', value: `${Number(prix).toLocaleString('fr-FR')} TND` },
                  { label: `x ${personnes} voyageur${personnes > 1 ? 's' : ''}`, value: `${totalPrix.toLocaleString('fr-FR')} TND` },
                  ...(pricing.discountAmount > 0 ? [{ label: 'Reduction promo', value: `- ${pricing.discountAmount.toLocaleString('fr-FR')} TND` }] : []),
                  { label: 'Taxes & frais', value: 'Inclus' },
                ].map((row, index) => (
                  <div key={index} className="payment-price-row">
                    <span>{row.label}</span>
                    <span className="payment-price-row__value">{row.value}</span>
                  </div>
                ))}
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

export default Payment;
