import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useFlights, useAirports, formatDuration, formatTime, formatDate } from '../../hooks/useFlights';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import '../../styles/FlightsPage.css';

const CABIN_LABELS = { economy: 'Économique', business: 'Business', first: 'Première' };

const FlightsListPage = () => {
  const navigate = useNavigate();
  const { airports } = useAirports();
  const { promos } = usePromotions('categorie', 'vols');

  const [origin, setOrigin]           = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate]               = useState('');
  const [cabin, setCabin]             = useState('economy');
  const [sort, setSort]               = useState('price');
  const [page, setPage]               = useState(1);
  const [searched, setSearched]       = useState(false);
  const LIMIT = 10;

  const { flights, total, loading, error } = useFlights(
    searched ? { origin, destination, date, cabin, sort, limit: LIMIT, page } : { limit: 0 }
  );
  const totalPages = Math.ceil(total / LIMIT);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearched(true);
  };

  const tunisianAirports = airports.filter(a => a.country === 'Tunisie');
  const otherAirports    = airports.filter(a => a.country !== 'Tunisie');

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>

        {/* HERO SEARCH */}
        <div className="flight-hero">
          <div className="flight-hero-overlay" />
          <div className="flight-hero-content">
            <h1 className="flight-hero-title">
              <i className="fas fa-plane" /> Trouvez Votre Vol
            </h1>
            <p className="flight-hero-subtitle">
              Vols directs et avec escales depuis et vers la Tunisie
            </p>

            {/* Search Form */}
            <form className="flight-search-box" onSubmit={handleSearch}>
              <div className="flight-search-grid">

                {/* Origin */}
                <div className="flight-search-field">
                  <label><i className="fas fa-plane-departure" /> Départ</label>
                  <select value={origin} onChange={e => setOrigin(e.target.value)} required>
                    <option value="">Sélectionner</option>
                    <optgroup label="🇹🇳 Tunisie">
                      {tunisianAirports.map(a => (
                        <option key={a.iata_code} value={a.iata_code}>
                          {a.city} ({a.iata_code})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="International">
                      {otherAirports.map(a => (
                        <option key={a.iata_code} value={a.iata_code}>
                          {a.city} ({a.iata_code}) — {a.country}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Swap button */}
                <button
                  type="button"
                  className="flight-swap-btn"
                  onClick={() => { setOrigin(destination); setDestination(origin); }}
                >
                  <i className="fas fa-exchange-alt" />
                </button>

                {/* Destination */}
                <div className="flight-search-field">
                  <label><i className="fas fa-plane-arrival" /> Arrivée</label>
                  <select value={destination} onChange={e => setDestination(e.target.value)} required>
                    <option value="">Sélectionner</option>
                    <optgroup label="🇹🇳 Tunisie">
                      {tunisianAirports.map(a => (
                        <option key={a.iata_code} value={a.iata_code}>
                          {a.city} ({a.iata_code})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="International">
                      {otherAirports.map(a => (
                        <option key={a.iata_code} value={a.iata_code}>
                          {a.city} ({a.iata_code}) — {a.country}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Date */}
                <div className="flight-search-field">
                  <label><i className="fas fa-calendar-alt" /> Date de départ</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Cabin */}
                <div className="flight-search-field">
                  <label><i className="fas fa-chair" /> Classe</label>
                  <select value={cabin} onChange={e => setCabin(e.target.value)}>
                    <option value="economy">Économique</option>
                    <option value="business">Business</option>
                    <option value="first">Première</option>
                  </select>
                </div>

                <button type="submit" className="flight-search-btn">
                  <i className="fas fa-search" /> Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>

        {promos.length > 0 && (
          <div className="container mx-auto px-4" style={{ paddingTop: 24 }}>
            <PromotionsSection promos={promos} titre="Promotions billeterie" showCards={false} />
          </div>
        )}

        {/* RESULTS */}
        {searched && (
          <div className="container mx-auto px-4" style={{ paddingTop: 32, paddingBottom: 48 }}>

            {/* Sort bar */}
            <div className="flight-sort-bar">
              <span className="flight-results-count">
                {loading ? 'Recherche...' : `${total} vol${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>Trier par :</span>
                {[
                  { val: 'price',    label: 'Prix' },
                  { val: 'duration', label: 'Durée' },
                  { val: 'departure',label: 'Horaire' },
                ].map(s => (
                  <button
                    key={s.val}
                    onClick={() => { setSort(s.val); setPage(1); }}
                    className={`flight-sort-btn ${sort === s.val ? 'active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flight-error">
                <i className="fas fa-exclamation-circle" /> {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flight-list">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonFlight key={i} />)}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && flights.length === 0 && (
              <div className="flight-empty">
                <i className="fas fa-plane-slash" />
                <p>Aucun vol trouvé pour cette recherche</p>
                <span>Essayez d'autres dates ou destinations</span>
              </div>
            )}

            {/* Flight Cards */}
            {!loading && flights.length > 0 && (
              <div className="flight-list">
                {flights.map(flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    cabin={cabin}
                    onDetails={() => navigate(`/flights/${flight.id}`)}
                    onReserve={() => navigate(`/flights/${flight.id}/reserve`)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flight-pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flight-page-btn"
                >
                  ← Précédent
                </button>
                <span className="flight-page-current">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flight-page-btn"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}

        {/* État initial — pas encore cherché */}
        {!searched && (
          <div className="flight-intro">
            <div className="container mx-auto px-4">
              <div className="flight-intro-grid">
                {[
                  { icon: 'fas fa-tag',        title: 'Meilleurs prix',      desc: 'Tarifs compétitifs sur tous nos vols' },
                  { icon: 'fas fa-shield-alt',  title: 'Réservation sécurisée', desc: 'Paiement 100% sécurisé' },
                  { icon: 'fas fa-headset',     title: 'Support 24h/7j',     desc: 'Notre équipe toujours disponible' },
                  { icon: 'fas fa-sync-alt',    title: 'Flexibilité',         desc: 'Modification possible sous conditions' },
                ].map((item, i) => (
                  <div key={i} className="flight-intro-card">
                    <div className="flight-intro-icon">
                      <i className={item.icon} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

// ── Flight Card Component ──────────────────────────────────────
const FlightCard = ({ flight, cabin, onDetails, onReserve }) => {
  const priceMap = { economy: flight.price_economy, business: flight.price_business, first: flight.price_first };
  const price    = parseFloat(priceMap[cabin] || flight.price_economy);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`flight-card ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Airline */}
      <div className="flight-card-airline">
        {flight.airline_logo && (
          <img src={flight.airline_logo} alt={flight.airline} className="airline-logo" />
        )}
        <div>
          <div className="airline-name">{flight.airline}</div>
          <div className="flight-number">{flight.flight_number}</div>
        </div>
        {!flight.baggage_included && (
          <span className="flight-badge baggage-warning">
            <i className="fas fa-suitcase" /> Bagage payant
          </span>
        )}
      </div>

      {/* Route */}
      <div className="flight-card-route">
        <div className="flight-endpoint">
          <div className="flight-time">{formatTime(flight.departure_time)}</div>
          <div className="flight-iata">{flight.origin_iata}</div>
          <div className="flight-city">{flight.origin_city_name || flight.origin_iata}</div>
        </div>

        <div className="flight-middle">
          <div className="flight-duration">{formatDuration(flight.duration_minutes)}</div>
          <div className="flight-line">
            <div className="flight-line-bar" />
            <i className="fas fa-plane flight-plane-icon" />
          </div>
          <div className="flight-stops">
            {flight.stops === 0
              ? <span className="direct-badge">Direct</span>
              : <span className="stops-badge">{flight.stops} escale{flight.stops > 1 ? 's' : ''}</span>
            }
          </div>
        </div>

        <div className="flight-endpoint right">
          <div className="flight-time">{formatTime(flight.arrival_time)}</div>
          <div className="flight-iata">{flight.destination_iata}</div>
          <div className="flight-city">{flight.destination_city_name || flight.destination_iata}</div>
        </div>
      </div>

      {/* Date + aircraft */}
      <div className="flight-card-meta">
        <span><i className="fas fa-calendar" /> {formatDate(flight.departure_time)}</span>
        <span><i className="fas fa-plane" /> {flight.aircraft_type}</span>
        <span><i className="fas fa-chair" /> {CABIN_LABELS[cabin]}</span>
      </div>

      {/* Price + Actions */}
      <div className="flight-card-price">
        <div>
          <div className="price-amount">{price.toFixed(0)} <span className="price-currency">TND</span></div>
          <div className="price-label">par passager</div>
        </div>
        <div className="flight-card-actions">
          <button className="btn-flight-details" onClick={onDetails}>
            <i className="fas fa-info-circle" /> Détails
          </button>
          <button className="btn-flight-reserve" onClick={onReserve}>
            <i className="fas fa-ticket-alt" /> Réserver
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────
const SkeletonFlight = () => (
  <div className="flight-card skeleton">
    {[80, 60, 40, 70].map((w, i) => (
      <div key={i} className="skeleton-line" style={{ width: `${w}%` }} />
    ))}
  </div>
);

export default FlightsListPage;
