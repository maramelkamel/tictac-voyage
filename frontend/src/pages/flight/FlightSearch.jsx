// src/pages/flights/FlightSearch.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AirportAutocomplete from '../../components/AirportAutocomplete';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import '../../styles/omrastyle.css';
import '../../styles/FlightsPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CABIN_CLASSES = [
  { value: 'economy',         label: '🪑 Économique' },
  { value: 'premium_economy', label: '🛋️ Premium Économique' },
  { value: 'business',        label: '💼 Affaires' },
  { value: 'first',           label: '👑 Première' },
];

const today = new Date().toISOString().split('T')[0];

const Counter = ({ value, onDec, onInc, min = 0, max = 9 }) => (
  <div className="flights-counter">
    <button
      type="button"
      onClick={onDec}
      disabled={value <= min}
      className={`flights-counter__btn ${value <= min ? 'flights-counter__btn--disabled' : 'flights-counter__btn--active'}`}
    >
      −
    </button>
    <span className="flights-counter__value">{value}</span>
    <button
      type="button"
      onClick={onInc}
      disabled={value >= max}
      className={`flights-counter__btn ${value >= max ? 'flights-counter__btn--disabled' : 'flights-counter__btn--active'}`}
    >
      +
    </button>
  </div>
);

const FlightSearch = () => {
  const navigate = useNavigate();

  const [tripType,      setTripType]      = useState('oneway');
  const [origin,        setOrigin]        = useState('');
  const [destination,   setDestination]   = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate,    setReturnDate]    = useState('');
  const [adults,        setAdults]        = useState(1);
  const [children,      setChildren]      = useState(0);
  const [cabinClass,    setCabinClass]    = useState('economy');
  const [directOnly,    setDirectOnly]    = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  const { promos } = usePromotions('categorie', 'vols');
  const totalPassengers = adults + children;
//choisir aller ou aller retour
  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');

    if (!origin || origin.length < 3)
      return setError('Veuillez sélectionner un aéroport de départ.');
    if (!destination || destination.length < 3)
      return setError("Veuillez sélectionner un aéroport d'arrivée.");
    if (origin === destination)
      return setError("L'origine et la destination doivent être différentes.");
    if (!departureDate)
      return setError('Veuillez choisir une date de départ.');
    if (tripType === 'roundtrip' && !returnDate)
      return setError('Veuillez choisir une date de retour.');
    if (tripType === 'roundtrip' && returnDate < departureDate)
      return setError('La date de retour doit être après le départ.');

    setLoading(true);
    try {
      const passengers = [
        ...Array(adults).fill({ type: 'adult' }),
        ...Array(children).fill({ type: 'child' }),
      ];

      const slices = [{
        origin:         origin.trim().toUpperCase(),
        destination:    destination.trim().toUpperCase(),
        departure_date: departureDate,
      }];

      if (tripType === 'roundtrip') {
        slices.push({
          origin:         destination.trim().toUpperCase(),
          destination:    origin.trim().toUpperCase(),
          departure_date: returnDate,
        });
      }

      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices,
          passengers,
          cabin_class: cabinClass,
          ...(directOnly ? { max_connections: 0 } : {}),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur lors de la recherche.');

      navigate('/flights/results', {
        state: {
          offers: json.offers,
          searchParams: {
            origin:      origin.trim().toUpperCase(),
            destination: destination.trim().toUpperCase(),
            departureDate,
            returnDate:  tripType === 'roundtrip' ? returnDate : null,
            adults,
            children,
            cabinClass,
            tripType,
            directOnly,
          },
        },
      });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flights-page">
      <Navbar />

      <div className="flights-hero">
        <div className="flights-hero__circle-tr" />
        <div className="flights-hero__circle-bl" />
        <div className="flights-hero__watermark">
          <i className="fas fa-plane" />
        </div>

        <div className="container flights-hero__inner">

          <div className="flights-hero__title">
            <div className="flights-hero__title-wrapper">
              <i className="fas fa-plane flights-hero__plane-icon" />
              <h1>Trouvez votre prochain vol</h1>
            </div>
            <p className="flights-hero__subtitle">
              Comparez des milliers d'offres en temps réel · Taxes incluses · Réservation sécurisée
            </p>
          </div>

          <div className="flights-search-card">

            <div className="flights-trip-type">
              {[
                { value: 'oneway',    label: '✈️ Aller simple' },
                { value: 'roundtrip', label: '🔄 Aller-retour' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setTripType(t.value)}
                  className={`flights-trip-btn ${tripType === t.value ? 'flights-trip-btn--active' : 'flights-trip-btn--inactive'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>

              <div className={`flights-form-row1 flights-form-row1--${tripType}`}>

                <AirportAutocomplete
                  label="Départ (IATA)"
                  icon="fa-plane-departure"
                  value={origin}
                  onChange={setOrigin}
                  placeholder="Tunis, TUN…"
                  required
                />

                <button type="button" onClick={handleSwap} className="flights-swap-btn">
                  <i className="fas fa-exchange-alt flights-swap-icon" />
                </button>

                <AirportAutocomplete
                  label="Arrivée (IATA)"
                  icon="fa-plane-arrival"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Paris, CDG…"
                  required
                />

                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-calendar-alt flights-field-icon" />
                    Date de départ *
                  </label>
                  <input
                    required
                    type="date"
                    min={today}
                    value={departureDate}
                    onChange={e => setDepartureDate(e.target.value)}
                  />
                </div>

                {tripType === 'roundtrip' && (
                  <div className="omra-reserve__field">
                    <label>
                      <i className="fas fa-calendar-check flights-field-icon" />
                      Date de retour *
                    </label>
                    <input
                      required
                      type="date"
                      min={departureDate || today}
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flights-form-row2">

                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-user flights-field-icon" />
                    Adultes
                  </label>
                  <Counter
                    value={adults}
                    onDec={() => setAdults(v => Math.max(1, v - 1))}
                    onInc={() => setAdults(v => Math.min(9, v + 1))}
                    min={1}
                  />
                </div>

                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-child flights-field-icon" />
                    Enfants (2–11 ans)
                  </label>
                  <Counter
                    value={children}
                    onDec={() => setChildren(v => Math.max(0, v - 1))}
                    onInc={() => setChildren(v => Math.min(8, v + 1))}
                    min={0}
                  />
                </div>

                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-couch flights-field-icon" />
                    Classe
                  </label>
                  <select value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
                    {CABIN_CLASSES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flights-direct-label">
                  <input
                    type="checkbox"
                    checked={directOnly}
                    onChange={e => setDirectOnly(e.target.checked)}
                    className="flights-direct-checkbox"
                  />
                  Vols directs seulement
                </label>
              </div>

              {error && (
                <div className="flights-form-error">
                  <i className="fas fa-exclamation-circle" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`flights-submit-btn ${loading ? 'flights-submit-btn--loading' : 'flights-submit-btn--ready'}`}
              >
                {loading
                  ? <><i className="fas fa-spinner fa-spin" /> Recherche en cours…</>
                  : <><i className="fas fa-search" /> Rechercher — {totalPassengers} passager{totalPassengers > 1 ? 's' : ''}</>
                }
              </button>
            </form>
          </div>

          <div className="flights-stats-strip">
            {[
              { icon: 'fa-plane',      label: 'Compagnies',              value: '500+' },
              { icon: 'fa-globe',      label: 'Destinations',            value: '130+' },
              { icon: 'fa-shield-alt', label: 'Réservations sécurisées', value: '100%' },
              { icon: 'fa-headset',    label: 'Support',                 value: '6j/7' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">
                  <i className={`fas ${s.icon} stat-card__icon`} />
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {promos.length > 0 && (
        <div className="container flights-promos-wrapper">
          <PromotionsSection promos={promos} titre="Promotions billeterie" showCards={false} />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FlightSearch;