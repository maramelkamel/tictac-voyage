// src/pages/flights/FlightListPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FlightCard from '../../components/FlightCard';
import '../../styles/omrastyle.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helpers ────────────────────────────────────────────────────
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

// ── Routes proposées pour les vols exemples ────────────────────
const SUGGESTION_ROUTES = [
  { origin: 'TUN', destination: 'CDG', label: 'Paris',     emoji: '🗼' },
  { origin: 'TUN', destination: 'IST', label: 'Istanbul',  emoji: '🕌' },
  { origin: 'TUN', destination: 'DXB', label: 'Dubaï',     emoji: '🏙️' },
  { origin: 'TUN', destination: 'LHR', label: 'Londres',   emoji: '🎡' },
  { origin: 'TUN', destination: 'FCO', label: 'Rome',      emoji: '🏛️' },
  { origin: 'TUN', destination: 'MRS', label: 'Marseille', emoji: '⛵' },
];

// ══════════════════════════════════════════════════════════════
//  SUGGESTED FLIGHTS — affiché quand aucune recherche active
// ══════════════════════════════════════════════════════════════
const SuggestedFlights = ({ onSelect }) => {
  const navigate = useNavigate();

  const [activeRoute, setActiveRoute] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const fetchSuggestions = async (idx) => {
    setLoading(true);
    setError('');
    setSuggestions([]);

    const route = SUGGESTION_ROUTES[idx];
    const d     = new Date();
    d.setDate(d.getDate() + 14);
    const departure_date = d.toISOString().split('T')[0];

    try {
      const res  = await fetch(`${API_BASE}/flights/search`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          slices:      [{ origin: route.origin, destination: route.destination, departure_date }],
          passengers:  [{ type: 'adult' }],
          cabin_class: 'economy',
        }),
      });
      const json = await res.json();
      if (json.success && json.offers?.length) {
        setSuggestions(json.offers.slice(0, 6));
      } else {
        setError('Aucune offre disponible pour cette route en ce moment.');
      }
    } catch {
      setError('Impossible de charger les offres. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuggestions(activeRoute); }, [activeRoute]);

  return (
    <div style={{ paddingTop: 36, paddingBottom: 60 }}>

      {/* Section header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(230,126,34,0.08)', borderRadius: 20, padding: '4px 14px', marginBottom: 12 }}>
          <i className="fas fa-fire" style={{ color: 'var(--secondary)', fontSize: 12 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)',
            textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Offres du moment
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-800, #1e293b)', margin: '0 0 6px' }}>
          Vols populaires depuis Tunis
        </h2>
        <p style={{ fontSize: 13, color: 'var(--gray-500, #64748b)', margin: 0 }}>
          Prix en temps réel · Taxes incluses · Marge agence incluse
        </p>
      </div>

      {/* Route tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {SUGGESTION_ROUTES.map((route, i) => (
          <button key={i} onClick={() => setActiveRoute(i)} disabled={loading}
            style={{
              padding: '9px 18px', borderRadius: 30, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 12, transition: 'all .2s',
              background: activeRoute === i ? 'var(--secondary, #e67e22)' : '#f1f5f9',
              color:      activeRoute === i ? '#fff' : 'var(--gray-600, #475569)',
              boxShadow:  activeRoute === i ? '0 2px 10px rgba(230,126,34,.30)' : 'none',
              opacity:    loading && activeRoute !== i ? 0.6 : 1,
            }}>
            {route.emoji} Tunis → {route.label}
          </button>
        ))}
      </div>

      {/* Skeleton loader */}
      {loading && (
        <>
          <style>{`
            @keyframes shimmer {
              0%   { background-position: -200% 0; }
              100% { background-position:  200% 0; }
            }
          `}</style>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: 120, borderRadius: 16,
                background: 'linear-gradient(90deg, #f1f5f9 25%, #e8edf2 50%, #f1f5f9 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        </>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12,
          padding: '18px 22px', fontSize: 13, color: '#991b1b',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: 18, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, margin: '0 0 4px' }}>Chargement impossible</p>
            <p style={{ margin: 0, opacity: 0.8 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Flight cards */}
      {!loading && suggestions.length > 0 && (
        <>
          {/* Count badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>
              <strong style={{ color: 'var(--gray-700)' }}>{suggestions.length}</strong>
              {' '}offre{suggestions.length > 1 ? 's' : ''} disponible{suggestions.length > 1 ? 's' : ''}
              {' '}· {SUGGESTION_ROUTES[activeRoute].emoji} Tunis → {SUGGESTION_ROUTES[activeRoute].label}
            </p>
            <span style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="fas fa-sync-alt" style={{ fontSize: 10 }} />
              Prix temps réel
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {suggestions.map(offer => (
              <FlightCard
                key={offer.id}
                offer={offer}
                onSelect={() => onSelect(offer, {
                  origin:      offer._summary?.origin_iata,
                  destination: offer._summary?.destination_iata,
                })}
              />
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 28, padding: '20px 24px', background: '#f8fafc',
            borderRadius: 16, border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: '0 0 14px' }}>
              Vous avez une destination précise en tête ?
            </p>
            <button onClick={() => navigate('/flights/search')}
              style={{ padding: '12px 32px',
                background: 'linear-gradient(135deg, var(--secondary, #e67e22), #d35400)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: 8 }}>
              <i className="fas fa-search" />
              Faire une recherche personnalisée
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN — FlightListPage
// ══════════════════════════════════════════════════════════════
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

  const hasResults = offers.length > 0;

  // ── Callback used by both search results + suggestions ─────
  const handleSelect = (offer, overrideParams) => {
    navigate('/flights/details', {
      state: { offer, searchParams: overrideParams || searchParams },
    });
  };

  // ── Derived data (search results only) ────────────────────
  const airlines = useMemo(() => {
    const set = new Set();
    offers.forEach(o => { const n = getAirlineName(o); if (n) set.add(n); });
    return [...set].sort();
  }, [offers]);

  const prices      = offers.map(getPrice);
  const minPrice    = prices.length ? Math.min(...prices) : 0;
  const maxPriceAll = prices.length ? Math.max(...prices) : 0;
  const currency    = offers[0]?.total_currency || 'TND';

  // ── Filter + sort ──────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...offers];
    if (filterAirline) list = list.filter(o => getAirlineName(o) === filterAirline);
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

  const handleReset = () => { setFilterAirline(''); setFilterStops('all'); setMaxPrice(''); };

  // ── Shared header ──────────────────────────────────────────
  const PageHeader = ({ subtitle }) => (
    <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f3460 100%)',
      paddingTop: 110, paddingBottom: 24 }}>
      <div className="container">
        <div className="omra-page-breadcrumb" style={{ paddingTop: 0, marginBottom: 16 }}>
          <button onClick={() => navigate('/flights/search')} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <i className="fas fa-arrow-left" /> Recherche
          </button>
          <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
          <span style={{ color: '#fff', fontWeight: 700 }}>Résultats</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
              ✈️ {hasResults ? `${origin} → ${destination}` : 'Vols disponibles'}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{subtitle}</p>
          </div>
          {hasResults && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px',
              color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {filtered.length} vol{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  //  NO SEARCH RESULTS → affiche les suggestions
  // ══════════════════════════════════════════════════════════
  if (!hasResults) {
    return (
      <>
        <Navbar />
        <PageHeader subtitle="Aucune recherche active — découvrez nos offres du moment" />
        <div className="container">
          <SuggestedFlights onSelect={handleSelect} />
        </div>
        <Footer />
      </>
    );
  }

  // ══════════════════════════════════════════════════════════
  //  SEARCH RESULTS
  // ══════════════════════════════════════════════════════════
  return (
    <>
      <Navbar />
      <PageHeader subtitle={
        `${departureDate}${returnDate ? ` · Retour ${returnDate}` : ''} · ${adults + children} passager${adults + children > 1 ? 's' : ''} · ${CABIN_LABELS[cabinClass] || cabinClass}`
      } />

      <div className="container" style={{ padding: '28px 0 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── Filters sidebar ─────────────────────────────── */}
          <aside style={{ background: '#fff', borderRadius: 16, padding: 20,
            border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            position: 'sticky', top: 90 }}>

            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-700)', marginBottom: 20,
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <i className="fas fa-sliders-h" style={{ color: 'var(--secondary)', marginRight: 8 }} />Filtres
            </h3>

            {/* Escales */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Escales</p>
              {[
                { value: 'all',     label: 'Tous les vols' },
                { value: 'direct',  label: 'Direct seulement' },
                { value: 'oneplus', label: '1 escale ou plus' },
              ].map(opt => (
                <label key={opt.value}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="stops" value={opt.value}
                    checked={filterStops === opt.value}
                    onChange={() => setFilterStops(opt.value)}
                    style={{ accentColor: 'var(--secondary)' }} />
                  {opt.label}
                </label>
              ))}
            </div>

            <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />

            {/* Prix max */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Prix max ({currency})
              </p>
              <input type="number" min={minPrice} max={maxPriceAll}
                placeholder={`Max : ${Math.round(maxPriceAll)}`}
                value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 13 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                <span>Min : {Math.round(minPrice)}</span>
                <span>Max : {Math.round(maxPriceAll)}</span>
              </div>
            </div>

            {/* Compagnie */}
            {airlines.length > 1 && (
              <>
                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Compagnie</p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" name="airline" value=""
                      checked={filterAirline === ''}
                      onChange={() => setFilterAirline('')}
                      style={{ accentColor: 'var(--secondary)' }} />
                    Toutes
                  </label>
                  {airlines.map(a => (
                    <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="radio" name="airline" value={a}
                        checked={filterAirline === a}
                        onChange={() => setFilterAirline(a)}
                        style={{ accentColor: 'var(--secondary)' }} />
                      {a}
                    </label>
                  ))}
                </div>
              </>
            )}

            <button onClick={handleReset}
              style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0',
                background: '#f8fafc', color: 'var(--gray-600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <i className="fas fa-undo" style={{ marginRight: 6 }} />Réinitialiser
            </button>
          </aside>

          {/* ── Results ─────────────────────────────────────── */}
          <div>
            {/* Sort bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>
                <strong style={{ color: 'var(--gray-700)' }}>{filtered.length}</strong>
                {' '}vol{filtered.length > 1 ? 's' : ''} correspondant{filtered.length > 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Trier :</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600 }}>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="dep_asc">Départ (tôt → tard)</option>
                  <option value="dep_desc">Départ (tard → tôt)</option>
                  <option value="duration">Durée</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: 40,
                textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <i className="fas fa-filter"
                  style={{ fontSize: 36, color: 'var(--gray-300)', marginBottom: 16, display: 'block' }} />
                <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 16 }}>
                  Aucun vol ne correspond à vos filtres.
                </p>
                <button onClick={handleReset}
                  style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: 'var(--gray-600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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