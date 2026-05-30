// src/pages/flights/FlightListPage.jsx
import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FlightCard from '../../components/FlightCard';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import '../../styles/omrastyle.css';
import '../../styles/FlightsPage.css';

const getAirlineName = (o) =>
  o._summary?.airline_name ||
  o.slices?.[0]?.segments?.[0]?.marketing_carrier?.name || '';

const getStops = (o) =>
  o._summary?.stops ?? (o.slices?.[0]?.segments?.length ?? 1) - 1;

const getDeparture = (o) =>
  o._summary?.departing_at || o.slices?.[0]?.segments?.[0]?.departing_at || '';

const getDuration = (o) =>
  o._summary?.duration || o.slices?.[0]?.duration || '';

const getPrice = (o) => parseFloat(o.total_amount || '0');

const CABIN_LABELS = {
  economy:         'Économique',
  premium_economy: 'Premium',
  business:        'Affaires',
  first:           'Première',
};

const FlightListPage = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const offers       = state?.offers       || [];
  const searchParams = state?.searchParams || {};

  const {
    origin, destination, departureDate, returnDate,
    adults = 1, children = 0, cabinClass,
  } = searchParams;

  const [sortBy,        setSortBy]        = useState('price_asc');
  const [maxPrice,      setMaxPrice]      = useState('');
  const [filterAirline, setFilterAirline] = useState('');
  const [filterStops,   setFilterStops]   = useState('all');

  const { promos } = usePromotions('categorie', 'vols');

  const hasResults = offers.length > 0;

  const handleSelect = (offer) => {
    navigate('/flights/details', {
      state: { offer, searchParams },
    });
  };

  const airlines = useMemo(() => {
    const set = new Set();
    offers.forEach(o => {
      const n = getAirlineName(o);
      if (n) set.add(n);
    });
    return [...set].sort();
  }, [offers]);

  const prices      = offers.map(getPrice);
  const minPrice    = prices.length ? Math.min(...prices) : 0;
  const maxPriceAll = prices.length ? Math.max(...prices) : 0;
  const currency    = offers[0]?.total_currency || 'TND';

  const filtered = useMemo(() => {
    let list = [...offers];

    if (filterAirline)
      list = list.filter(o => getAirlineName(o) === filterAirline);

    if (filterStops === 'direct')  list = list.filter(o => getStops(o) === 0);
    if (filterStops === 'oneplus') list = list.filter(o => getStops(o) > 0);

    if (maxPrice !== '') {
      const cap = parseFloat(maxPrice);
      if (!isNaN(cap)) list = list.filter(o => getPrice(o) <= cap);
    }

    list.sort((a, b) => {
      const pa = getPrice(a),     pb = getPrice(b);
      const da = getDeparture(a), db = getDeparture(b);
      const ta = getDuration(a),  tb = getDuration(b);

      switch (sortBy) {
        case 'price_asc':  return pa - pb;
        case 'price_desc': return pb - pa;
        case 'dep_asc':    return da < db ? -1 : da > db ? 1 : 0;
        case 'dep_desc':   return da > db ? -1 : da < db ? 1 : 0;
        case 'duration':   return ta < tb ? -1 : ta > tb ? 1 : 0;
        default:           return 0;
      }
    });

    return list;
  }, [offers, filterAirline, filterStops, maxPrice, sortBy]);

  const handleReset = () => {
    setFilterAirline('');
    setFilterStops('all');
    setMaxPrice('');
  };

  // ── Cas : aucun résultat → redirection vers la recherche ──
  if (!hasResults) {
    navigate('/flights/search');
    return null;
  }

  const PageHeader = ({ subtitle }) => (
    <div className="flights-page-header">
      <div className="container">

        <div className="omra-page-breadcrumb" style={{ paddingTop: 0, marginBottom: 16 }}>
          <button
            onClick={() => navigate('/flights/search')}
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <i className="fas fa-arrow-left" /> Recherche
          </button>
          <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
          <span style={{ color: '#fff', fontWeight: 700 }}>Résultats</span>
        </div>

        <div className="flights-page-header__row">
          <div>
            <h1 className="flights-page-header__title">
              ✈️ {origin} → {destination}
            </h1>
            <p className="flights-page-header__subtitle">{subtitle}</p>
          </div>
          <div className="flights-count-badge">
            {filtered.length} vol{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />

      <PageHeader subtitle={
        `${departureDate}`
        + `${returnDate ? ` · Retour ${returnDate}` : ''}`
        + ` · ${adults + children} passager${adults + children > 1 ? 's' : ''}`
        + ` · ${CABIN_LABELS[cabinClass] || cabinClass}`
      } />

      {promos.length > 0 && (
        <div className="container" style={{ paddingTop: 24 }}>
          <PromotionsSection promos={promos} titre="Promotions billeterie" showCards={false} />
        </div>
      )}

      <div className="container flights-results-layout" style={{ padding: '28px 0 60px' }}>
        <div className="flights-results-grid">

          <aside className="flights-sidebar">

            <h3 className="flights-sidebar__title">
              <i className="fas fa-sliders-h" style={{ color: 'var(--secondary)', marginRight: 8 }} />
              Filtres
            </h3>

            <div style={{ marginBottom: 20 }}>
              <p className="flights-sidebar__section-label">Escales</p>
              {[
                { value: 'all',     label: 'Tous les vols' },
                { value: 'direct',  label: 'Direct seulement' },
                { value: 'oneplus', label: '1 escale ou plus' },
              ].map(opt => (
                <label key={opt.value} className="flights-filter-label">
                  <input
                    type="radio"
                    name="stops"
                    value={opt.value}
                    checked={filterStops === opt.value}
                    onChange={() => setFilterStops(opt.value)}
                    style={{ accentColor: 'var(--secondary)' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className="flights-sidebar__divider" />

            <div style={{ marginBottom: 20 }}>
              <p className="flights-sidebar__section-label">Prix max ({currency})</p>
              <input
                type="number"
                min={minPrice}
                max={maxPriceAll}
                placeholder={`Max : ${Math.round(maxPriceAll)}`}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="flights-price-input"
              />
              <div className="flights-price-range">
                <span>Min : {Math.round(minPrice)}</span>
                <span>Max : {Math.round(maxPriceAll)}</span>
              </div>
            </div>

            {airlines.length > 1 && (
              <>
                <div className="flights-sidebar__divider" />
                <div style={{ marginBottom: 20 }}>
                  <p className="flights-sidebar__section-label">Compagnie</p>

                  <label className="flights-filter-label">
                    <input
                      type="radio"
                      name="airline"
                      value=""
                      checked={filterAirline === ''}
                      onChange={() => setFilterAirline('')}
                      style={{ accentColor: 'var(--secondary)' }}
                    />
                    Toutes
                  </label>

                  {airlines.map(a => (
                    <label key={a} className="flights-filter-label">
                      <input
                        type="radio"
                        name="airline"
                        value={a}
                        checked={filterAirline === a}
                        onChange={() => setFilterAirline(a)}
                        style={{ accentColor: 'var(--secondary)' }}
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </>
            )}

            <button onClick={handleReset} className="flights-reset-btn">
              <i className="fas fa-undo" style={{ marginRight: 6 }} />
              Réinitialiser
            </button>
          </aside>

          <div>
            <div className="flights-sort-bar">
              <p className="flights-sort-bar__count">
                <strong style={{ color: 'var(--gray-700)' }}>{filtered.length}</strong>
                {' '}vol{filtered.length > 1 ? 's' : ''} correspondant{filtered.length > 1 ? 's' : ''}
              </p>

              <div className="flights-sort-bar__controls">
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Trier :</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="flights-sort-select"
                >
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="dep_asc">Départ (tôt → tard)</option>
                  <option value="dep_desc">Départ (tard → tôt)</option>
                  <option value="duration">Durée</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flights-empty-state">
                <i
                  className="fas fa-filter"
                  style={{ fontSize: 36, color: 'var(--gray-300)', marginBottom: 16, display: 'block' }}
                />
                <p>Aucun vol ne correspond à vos filtres.</p>
                <button onClick={handleReset} className="flights-empty-state__btn">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="flights-cards-list">
                {filtered.map(offer => (
                  <FlightCard
                    key={offer.id}
                    offer={offer}
                    onSelect={() => handleSelect(offer)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default FlightListPage;