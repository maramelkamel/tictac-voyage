import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const HotelReservationPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const hotel = state?.hotel;
  const incomingSearch = state?.search || {};

  const clientData = (() => {
    try {
      return JSON.parse(localStorage.getItem('client') || '{}');
    } catch {
      return {};
    }
  })();

  const defaultCheckIn = incomingSearch.checkin || new Date().toISOString().split('T')[0];
  const defaultCheckOut = incomingSearch.checkout || new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    holder_first_name: clientData?.firstName || clientData?.first_name || '',
    holder_last_name: clientData?.lastName || clientData?.last_name || '',
    holder_email: clientData?.email || '',
    holder_phone: clientData?.phone || '',
    adults: incomingSearch.adults || '2',
    rooms: incomingSearch.rooms || '1',
    check_in: defaultCheckIn,
    check_out: defaultCheckOut,
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);

  if (!hotel) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>Hotel introuvable.</p>
          <button className="omra-reserve__submit" style={{ width: 'auto', padding: '14px 28px' }} onClick={() => navigate('/hotels')}>
            ← Retour aux hotels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalPrix = Number(hotel.base_price || 0) * Number(form.rooms || 1);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/hotels/payment', {
        state: {
          hotel,
          reservation: form,
          totalPrix,
        },
      });
    }, 600);
  };

  const clientEmail = clientData?.email || '';
  const lockedStyle = {
    background: '#f8fafc',
    cursor: 'not-allowed',
    color: '#64748b',
    borderColor: '#e2e8f0',
  };

  return (
    <div>
      <Navbar />

      <div className="omra-reserve">
        <div className="container">
          <div className="omra-page-breadcrumb omra-page-breadcrumb--light" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/hotels')}>← Hotels</button>
            <span>/</span>
            <button onClick={() => navigate(-1)}>{hotel.city}</button>
            <span>/</span>
            <span>Reservation</span>
          </div>

          {clientEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#e0fbfc', border: '1px solid #a5f3fc', borderRadius: 12, marginBottom: 20 }}>
              <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
              <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                Connecte en tant que <strong>{clientEmail}</strong> — vos informations ont ete pre-remplies.
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <div className="omra-reserve__form-header-title">Formulaire de reservation hotel</div>
                  <div className="omra-reserve__form-header-desc">Meme scenario que Voyages Organises : informations, puis paiement.</div>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="holder_first_name">Prenom *</label>
                      <input id="holder_first_name" name="holder_first_name" type="text" required value={form.holder_first_name} onChange={handleChange} />
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="holder_last_name">Nom *</label>
                      <input id="holder_last_name" name="holder_last_name" type="text" required value={form.holder_last_name} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="holder_email">Email *</label>
                      <input
                        id="holder_email"
                        name="holder_email"
                        type="email"
                        required
                        value={form.holder_email}
                        onChange={(event) => !clientEmail && handleChange(event)}
                        readOnly={!!clientEmail}
                        style={clientEmail ? lockedStyle : {}}
                      />
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="holder_phone">Telephone *</label>
                      <input id="holder_phone" name="holder_phone" type="tel" required value={form.holder_phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="check_in">Check-in</label>
                      <input id="check_in" name="check_in" type="date" value={form.check_in} onChange={handleChange} />
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="check_out">Check-out</label>
                      <input id="check_out" name="check_out" type="date" value={form.check_out} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="adults">Adultes</label>
                      <input id="adults" name="adults" type="number" min="1" max="10" value={form.adults} onChange={handleChange} />
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="rooms">Chambres</label>
                      <input id="rooms" name="rooms" type="number" min="1" max="5" value={form.rooms} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="omra-reserve__field">
                    <label htmlFor="special_requests">Demandes speciales</label>
                    <textarea id="special_requests" name="special_requests" rows={3} value={form.special_requests} onChange={handleChange} placeholder="Lit bebe, chambre calme, heure d arrivee..." />
                  </div>

                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading ? 'Chargement...' : 'Continuer vers le paiement →'}
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>
                    Etape suivante : choisissez votre mode de paiement.
                  </p>
                </form>
              </div>
            </div>

            <aside style={{ position: 'sticky', top: 110 }}>
              <div className="omra-reserve__pkg-card">
                <img src={hotel.image_url} alt={hotel.name} className="omra-reserve__pkg-img" />
                <div className="omra-reserve__pkg-info">
                  <div className="omra-reserve__pkg-subtitle">{hotel.city} · {hotel.property_type || 'Hotel'}</div>
                  <div className="omra-reserve__pkg-title">{hotel.name}</div>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">📍 {hotel.address}</div>
                    <div className="omra-reserve__pkg-meta-item">⭐ {hotel.rating} · {hotel.stars} etoiles</div>
                    <div className="omra-reserve__pkg-meta-item">🛏 {hotel.available_rooms} chambres disponibles</div>
                    <div className="omra-reserve__pkg-meta-item">🍽 {hotel.meals || 'Options repas disponibles'}</div>
                  </div>
                </div>
              </div>

              <div className="omra-reserve__summary">
                <div className="omra-reserve__summary-title">Recapitulatif du prix</div>
                <div className="omra-reserve__summary-row">
                  <span>Prix / chambre</span>
                  <span>{Number(hotel.base_price || 0).toLocaleString('fr-FR')} {hotel.currency}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Chambres</span>
                  <span>× {form.rooms}</span>
                </div>
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total estime</span>
                  <span className="omra-reserve__summary-total-amount">{totalPrix.toLocaleString('fr-FR')} {hotel.currency}</span>
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

export default HotelReservationPage;
