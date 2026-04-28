import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { createHotelBooking } from '../../services/api';
import '../../styles/Payment.css';

const HotelPaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const hotel = state?.hotel;
  const reservation = state?.reservation;

  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const [error, setError] = useState('');

  if (!hotel || !reservation) {
    return (
      <div className="payment-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏨</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>Hotel payment session expired.</p>
          <button className="payment-fallback__btn" onClick={() => navigate('/hotels/search')}>
            Back to hotels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

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

  const finishBooking = async (paymentMethod) => {
    setLoading(true);
    setError('');

    try {
      const response = await createHotelBooking({
        hotel,
        reservation,
        payment_method: paymentMethod,
      });

      setSubmitted(true);
      setMessage(response.message || 'Hotel booking confirmed.');
    } catch (bookingError) {
      setError(bookingError.message || 'Unable to confirm this hotel booking.');
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
            <div className="payment-success__icon">✓</div>
            <h2 className="payment-success__title">Hotel booking confirmed</h2>
            <p className="payment-success__desc">
              {message} Your reservation for <strong>{hotel.name}</strong> is now saved in your account.
            </p>
            <div className="payment-success__actions">
              <button className="payment-success__btn" onClick={() => navigate('/hotels/search')}>
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

      <div className="payment-hero">
        <div className="container">
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/hotels/search')}>Hotels</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>Reservation</button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">Payment</span>
          </div>
          <div className="payment-steps">
            {[{ n: 1, label: 'Reservation', state: 'done' }, { n: 2, label: 'Payment', state: 'active' }, { n: 3, label: 'Confirmation', state: 'pending' }].map((step, index) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: index < 2 ? 1 : 'initial' }}>
                <div className="payment-step">
                  <div className={`payment-step__circle payment-step__circle--${step.state}`}>{step.state === 'done' ? '✓' : step.n}</div>
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
                  <div className="payment-total-banner__amount">{hotel.price_numeric?.toLocaleString('fr-FR') || 'N/A'} <span>{hotel.currency}</span></div>
                  <div className="payment-total-banner__sub">{hotel.name} · {reservation.check_in} → {reservation.check_out}</div>
                </div>
                <div className="payment-total-banner__badge">Secure booking flow</div>
              </div>

              {error && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', color: '#991b1b', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <div className="payment-card">
                <h3 className="payment-card__title">Choose your payment method</h3>
                <p className="payment-card__subtitle">Hotels follow the same principle as flights: select the payment mode, confirm, and store the reservation.</p>
                <div className="payment-method-row">
                  <button className={`payment-method-btn ${method === 'online' ? 'payment-method-btn--online' : ''}`} onClick={() => setMethod('online')}>
                    <div className="payment-method-btn__icon">💳</div>
                    <div className={`payment-method-btn__title ${method === 'online' ? 'payment-method-btn__title--online' : ''}`}>Pay online</div>
                    <div className="payment-method-btn__desc">Immediate confirmation and payment recording</div>
                  </button>
                  <button className={`payment-method-btn ${method === 'agency' ? 'payment-method-btn--agency' : ''}`} onClick={() => setMethod('agency')}>
                    <div className="payment-method-btn__icon">🏪</div>
                    <div className={`payment-method-btn__title ${method === 'agency' ? 'payment-method-btn__title--agency' : ''}`}>Pay at agency</div>
                    <div className="payment-method-btn__desc">Reservation saved now, payment finalized with the team</div>
                  </button>
                </div>
              </div>

              {method === 'online' && (
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
                        <input className="pay-input" name="cvv" value={cardForm.cvv} onChange={handleCardChange} placeholder="•••" required />
                      </div>
                    </div>
                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? 'Processing...' : `Pay ${hotel.price_numeric?.toLocaleString('fr-FR') || 'N/A'} ${hotel.currency}`}
                    </button>
                  </form>
                </div>
              )}

              {method === 'agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">Agency payment</h3>
                  <p className="payment-card__subtitle">We will keep this hotel reservation pending until the agency payment is finalized.</p>
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
                    <div className="payment-trip-card__meta-item"><span>📍</span> {hotel.location}</div>
                    <div className="payment-trip-card__meta-item"><span>🗓</span> {reservation.check_in} → {reservation.check_out}</div>
                    <div className="payment-trip-card__meta-item"><span>👥</span> {reservation.adults} adults · {reservation.rooms} room(s)</div>
                    <div className="payment-trip-card__meta-item"><span>⭐</span> Rating {hotel.rating}</div>
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
                <div className="payment-price-total">
                  <span className="payment-price-total__label">Total</span>
                  <span className="payment-price-total__amount">{hotel.price_numeric?.toLocaleString('fr-FR') || 'N/A'} {hotel.currency}</span>
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
