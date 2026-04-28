import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const HotelReservationPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const hotel = state?.hotel;
  const search = state?.search || {};

  const clientData = (() => {
    try {
      return JSON.parse(localStorage.getItem('client') || '{}');
    } catch {
      return {};
    }
  })();

  const [form, setForm] = useState({
    holder_first_name: clientData.first_name || '',
    holder_last_name: clientData.last_name || '',
    holder_email: clientData.email || '',
    holder_phone: clientData.phone || '',
    special_requests: '',
  });
  const [error, setError] = useState('');

  if (!hotel) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '160px 24px', textAlign: 'center', minHeight: '60vh' }}>
          <i className="fas fa-hotel" style={{ fontSize: 42, color: '#cbd5e1', marginBottom: 18, display: 'block' }} />
          <h2 style={{ color: '#0F4C5C', marginBottom: 10 }}>No hotel selected</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Please choose a hotel before continuing to reservation.</p>
          <button
            onClick={() => navigate('/hotels')}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #0F4C5C, #1ECAD3)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to hotels
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.holder_first_name || !form.holder_last_name || !form.holder_email || !form.holder_phone) {
      setError('Please complete all required traveller information.');
      return;
    }

    navigate('/hotels/payment', {
      state: {
        hotel,
        search,
        reservation: {
          ...form,
          check_in: search.checkin,
          check_out: search.checkout,
          adults: search.adults || 2,
          rooms: search.rooms || 1,
          city: search.city || hotel.city,
        },
      },
    });
  };

  return (
    <>
      <Navbar />

      <div className="omra-reserve flights-reservation-page">
        <div className="container">
          <div className="flights-page-shell flights-reservation-shell">
            <div className="omra-page-breadcrumb" style={{ paddingTop: 8 }}>
              <button onClick={() => navigate('/hotels')}><i className="fas fa-arrow-left" /> Hotels</button>
              <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'var(--gray-400)' }} />
              <span style={{ color: 'var(--gray-700)', fontWeight: 700 }}>Reservation</span>
            </div>

            <div className="omra-reserve__layout">
              <div>
                <div className="omra-reserve__form-card">
                  <div className="omra-reserve__form-header">
                    <h1 className="omra-reserve__form-header-title">
                      <i className="fas fa-id-card" style={{ marginRight: 10, color: 'var(--secondary)' }} />
                      Hotel reservation details
                    </h1>
                    <p className="omra-reserve__form-header-desc">
                      This follows the same principle as flights: confirm your traveller information first, then continue to payment.
                    </p>
                  </div>

                  <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label>First name *</label>
                        <input name="holder_first_name" value={form.holder_first_name} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label>Last name *</label>
                        <input name="holder_last_name" value={form.holder_last_name} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="omra-reserve__form-row" style={{ marginTop: 16 }}>
                      <div className="omra-reserve__field">
                        <label>Email *</label>
                        <input name="holder_email" type="email" value={form.holder_email} onChange={handleChange} />
                      </div>
                      <div className="omra-reserve__field">
                        <label>Phone *</label>
                        <input name="holder_phone" type="tel" value={form.holder_phone} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="omra-reserve__form-row" style={{ marginTop: 16 }}>
                      <div className="omra-reserve__field">
                        <label>Special requests</label>
                        <textarea
                          name="special_requests"
                          value={form.special_requests}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Late check-in, room preferences, accessibility needs..."
                          style={{ width: '100%', borderRadius: 12, border: '1px solid #e2e8f0', padding: 14, fontFamily: 'inherit', resize: 'vertical' }}
                        />
                      </div>
                    </div>

                    {error && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
                        {error}
                      </div>
                    )}

                    <button type="submit" className="omra-reserve__submit">
                      <i className="fas fa-credit-card" style={{ marginRight: 8 }} />
                      Continue to payment
                    </button>
                  </form>
                </div>
              </div>

              <div className="omra-details__sidebar">
                <div className="omra-reserve__pkg-card">
                  <div className="omra-reserve__pkg-info" style={{ padding: 20 }}>
                    <h3 className="omra-reserve__pkg-title" style={{ fontSize: 16, marginBottom: 6 }}>
                      {hotel.name}
                    </h3>
                    <p className="omra-reserve__pkg-subtitle">{hotel.location}</p>
                    <div className="omra-reserve__pkg-meta">
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-calendar-alt" /> Check-in: {search.checkin}</div>
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-calendar-check" /> Check-out: {search.checkout}</div>
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-users" /> {search.adults || 2} adults · {search.rooms || 1} room(s)</div>
                      <div className="omra-reserve__pkg-meta-item"><i className="fas fa-star" /> Rating: {hotel.rating}</div>
                    </div>
                  </div>
                </div>

                <div className="omra-reserve__summary">
                  <p className="omra-reserve__summary-title">Price summary</p>
                  <div className="omra-reserve__summary-row">
                    <span>Total stay</span>
                    <span style={{ fontWeight: 700, color: 'var(--white)' }}>{hotel.displayPrice}</span>
                  </div>
                  <div className="omra-reserve__summary-row">
                    <span>Availability</span>
                    <span style={{ fontWeight: 700, color: 'var(--white)' }}>{hotel.availabilityLabel}</span>
                  </div>
                  <div className="omra-reserve__summary-total">
                    <span className="omra-reserve__summary-total-label">Source</span>
                    <span className="omra-reserve__summary-total-amount" style={{ fontSize: 16 }}>{hotel.source}</span>
                  </div>
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

export default HotelReservationPage;
