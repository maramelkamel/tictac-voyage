import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { hotelsData } from '../../data/hotelsData';
import '../../styles/omrastyle.css';

const roomTypes = [
  'Chambre Standard',
  'Chambre Supérieure',
  'Suite Junior',
  'Suite Deluxe',
  'Suite Présidentielle',
];
const pensionTypes = ['All Inclusive', 'Demi-Pension', 'Petit Déjeuner', 'Logement Seul'];

const basePrices = {
  'Chambre Standard': 180,
  'Chambre Supérieure': 240,
  'Suite Junior': 320,
  'Suite Deluxe': 450,
  'Suite Présidentielle': 680,
};
const pensionExtra = {
  'All Inclusive': 60,
  'Demi-Pension': 35,
  'Petit Déjeuner': 15,
  'Logement Seul': 0,
};

const ReserveHotel = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  const hotel      = hotelsData.find((h) => String(h.id) === String(id)) || hotelsData[0];
  const passedForm = location.state?.form;

  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const getLoggedUser = () => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const loggedUser = getLoggedUser();
  const isLoggedIn = Boolean(loggedUser);

  const [loading, setLoading] = useState(false);

  const [personal, setPersonal] = useState({
    nom:       loggedUser?.nom       || loggedUser?.lastName              || loggedUser?.name?.split(' ')[1] || '',
    prenom:    loggedUser?.prenom    || loggedUser?.firstName             || loggedUser?.name?.split(' ')[0] || '',
    email:     loggedUser?.email     || '',
    telephone: loggedUser?.telephone || loggedUser?.phone                 || '',
  });

  const [booking, setBooking] = useState({
    checkIn:         passedForm?.checkIn   || today,
    checkOut:        passedForm?.checkOut  || tomorrow,
    adults:          passedForm?.adults    || 2,
    children:        passedForm?.children  || 0,
    rooms:           passedForm?.rooms     || 1,
    roomType:        passedForm?.roomType  || 'Chambre Standard',
    pension:         passedForm?.pension   || 'All Inclusive',
    specialRequests: '',
  });

  const handlePersonal = (field, val) => setPersonal((p) => ({ ...p, [field]: val }));
  const handleBooking  = (field, val) => setBooking((b)  => ({ ...b, [field]: val }));

  const nights = (() => {
    const diff = Math.round(
      (new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000
    );
    return diff > 0 ? diff : 0;
  })();

  const pricePerNight =
    ((basePrices[booking.roomType] || 180) + (pensionExtra[booking.pension] || 0)) *
    booking.rooms;
  const subtotal = pricePerNight * nights;
  const taxes    = Math.round(subtotal * 0.1);
  const total    = subtotal + taxes;

  const isFormValid =
    personal.nom && personal.prenom && personal.email && personal.telephone && nights > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/PaymentHotel', {
        state: {
          hotel,
          form: {
            checkIn:  booking.checkIn,
            checkOut: booking.checkOut,
            adults:   booking.adults,
            children: booking.children,
            rooms:    booking.rooms,
            roomType: booking.roomType,
            pension:  booking.pension,
          },
          nights,
          total,
        },
      });
    }, 800);
  };

  return (
    <>
      <Navbar />

      <div className="omra-reserve">
        <div className="container">

          {/* Breadcrumb */}
          <div className="omra-page-breadcrumb omra-page-breadcrumb--light">
            <button onClick={() => navigate('/')}>
              <i className="fas fa-home" /> Accueil
            </button>
            <span>›</span>
            <button onClick={() => navigate('/')}>Hôtels</button>
            <span>›</span>
            <button onClick={() => navigate(`/hotels/${hotel.id}`)}>
              {hotel.title}
            </button>
            <span>›</span>
            <span>Réservation</span>
          </div>

          {/* Two-column layout */}
          <div className="omra-reserve__layout">

            {/* ── LEFT: FORM ── */}
            <div>
              <div className="omra-reserve__form-card">

                <div className="omra-reserve__form-header">
                  <h2 className="omra-reserve__form-header-title">
                    Réserver votre séjour
                  </h2>
                  <p className="omra-reserve__form-header-desc">
                    {isLoggedIn
                      ? '✨ Vos informations ont été pré-remplies depuis votre compte.'
                      : 'Renseignez vos coordonnées pour finaliser la réservation.'}
                  </p>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>

                  {/* ── Informations personnelles ── */}
                  <p style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--gray-400)', marginBottom: 16,
                  }}>
                    👤 Informations personnelles
                  </p>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label>Nom *</label>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        value={personal.nom}
                        onChange={(e) => handlePersonal('nom', e.target.value)}
                        required
                      />
                      {isLoggedIn && personal.nom && (
                        <span style={{ fontSize: 11, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <i className="fas fa-check-circle" /> Pré-rempli depuis votre compte
                        </span>
                      )}
                    </div>
                    <div className="omra-reserve__field">
                      <label>Prénom *</label>
                      <input
                        type="text"
                        placeholder="Votre prénom"
                        value={personal.prenom}
                        onChange={(e) => handlePersonal('prenom', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label>Email *</label>
                      <input
                        type="email"
                        placeholder="votre@email.com"
                        value={personal.email}
                        onChange={(e) => handlePersonal('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="omra-reserve__field">
                      <label>Téléphone *</label>
                      <input
                        type="tel"
                        placeholder="+216 XX XXX XXX"
                        value={personal.telephone}
                        onChange={(e) => handlePersonal('telephone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* ── Détails du séjour ── */}
                  <p style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--gray-400)', margin: '24px 0 16px',
                  }}>
                    🏨 Détails du séjour
                  </p>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label>Date d'arrivée *</label>
                      <input
                        type="date"
                        value={booking.checkIn}
                        min={today}
                        onChange={(e) => handleBooking('checkIn', e.target.value)}
                        required
                      />
                    </div>
                    <div className="omra-reserve__field">
                      <label>Date de départ *</label>
                      <input
                        type="date"
                        value={booking.checkOut}
                        min={booking.checkIn}
                        onChange={(e) => handleBooking('checkOut', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label>Adultes</label>
                      <input
                        type="number" min={1} max={20}
                        value={booking.adults}
                        onChange={(e) => handleBooking('adults', Math.max(1, Number(e.target.value)))}
                      />
                    </div>
                    <div className="omra-reserve__field">
                      <label>Enfants</label>
                      <input
                        type="number" min={0} max={10}
                        value={booking.children}
                        onChange={(e) => handleBooking('children', Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label>Nombre de chambres</label>
                      <input
                        type="number" min={1} max={10}
                        value={booking.rooms}
                        onChange={(e) => handleBooking('rooms', Math.max(1, Number(e.target.value)))}
                      />
                    </div>
                    <div className="omra-reserve__field">
                      <label>Type de chambre</label>
                      <select
                        value={booking.roomType}
                        onChange={(e) => handleBooking('roomType', e.target.value)}
                      >
                        {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="omra-reserve__field">
                    <label>Formule / Pension</label>
                    <select
                      value={booking.pension}
                      onChange={(e) => handleBooking('pension', e.target.value)}
                    >
                      {pensionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* ── Demandes spéciales ── */}
                  <p style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--gray-400)', margin: '24px 0 16px',
                  }}>
                    💬 Demandes spéciales
                  </p>

                  <div className="omra-reserve__field">
                    <label>Remarques ou demandes particulières</label>
                    <textarea
                      rows={3}
                      placeholder="Chambre haute, vue mer, lit bébé, régime alimentaire…"
                      value={booking.specialRequests}
                      onChange={(e) => handleBooking('specialRequests', e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="omra-reserve__submit"
                    disabled={!isFormValid || loading}
                  >
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin" /> Redirection en cours…</>
                    ) : (
                      <><i className="fas fa-credit-card" /> Continuer vers le paiement</>
                    )}
                  </button>

                  {!isFormValid && (
                    <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
                      {nights <= 0
                        ? 'Veuillez sélectionner des dates valides.'
                        : 'Veuillez remplir tous les champs obligatoires (*).'}
                    </p>
                  )}

                </form>
              </div>
            </div>

            {/* ── RIGHT: SIDEBAR ── */}
            <div>

              {/* Hotel mini-card */}
              <div className="omra-reserve__pkg-card">
                <img
                  src={hotel.image}
                  alt={hotel.title}
                  className="omra-reserve__pkg-img"
                />
                <div className="omra-reserve__pkg-info">
                  <div className="omra-reserve__pkg-subtitle">Hôtel sélectionné</div>
                  <h3 className="omra-reserve__pkg-title">{hotel.title}</h3>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-map-marker-alt" /> {hotel.location}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-moon" />
                      {nights > 0 ? `${nights} nuit${nights > 1 ? 's' : ''}` : '— nuits'}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-bed" /> {booking.roomType}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-utensils" /> {booking.pension}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-users" />
                      {booking.adults} adulte{booking.adults > 1 ? 's' : ''}
                      {booking.children > 0
                        ? `, ${booking.children} enfant${booking.children > 1 ? 's' : ''}`
                        : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing summary */}
              <div className="omra-reserve__summary">
                <div className="omra-reserve__summary-title">📋 Récapitulatif tarifaire</div>
                <div className="omra-reserve__summary-row">
                  <span>Prix / nuit ({booking.rooms} ch.)</span>
                  <span style={{ fontWeight: 600 }}>{pricePerNight} TND</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Sous-total ({nights > 0 ? nights : '—'} nuit{nights > 1 ? 's' : ''})</span>
                  <span style={{ fontWeight: 600 }}>{nights > 0 ? `${subtotal} TND` : '—'}</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Taxes & frais (10%)</span>
                  <span style={{ fontWeight: 600 }}>{nights > 0 ? `${taxes} TND` : '—'}</span>
                </div>
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total</span>
                  <span className="omra-reserve__summary-total-amount">
                    {nights > 0 ? `${total} TND` : '—'}
                  </span>
                </div>
              </div>

              {/* Trust perks */}
              <div style={{
                marginTop: 16, background: '#fff', borderRadius: 20,
                padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(15,76,92,0.06)',
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 14,
                }}>
                  Pourquoi réserver avec nous
                </p>
                {[
                  ['✅', 'Confirmation immédiate par email'],
                  ['🔒', 'Données sécurisées & confidentielles'],
                  ['💬', 'Conseiller dédié 24h/7j'],
                  ['🏷️', 'Meilleurs prix garantis'],
                  ['↩️', 'Annulation flexible sous conditions'],
                ].map(([icon, label]) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 13, color: '#475569', marginBottom: 9,
                  }}>
                    <span style={{ fontSize: 15 }}>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ReserveHotel;