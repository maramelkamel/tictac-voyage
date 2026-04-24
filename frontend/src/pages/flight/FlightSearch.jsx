// src/pages/flights/FlightSearch.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AirportAutocomplete from '../../components/AirportAutocomplete';
import FlightCard from '../../components/FlightCard';
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

// ── Popular destinations ──────────────────────────────────────


// ── Best deals route list ─────────────────────────────────────
const DEAL_ROUTES = [
  { origin: 'TUN', destination: 'CDG', label: 'Paris' },
  { origin: 'TUN', destination: 'IST', label: 'Istanbul' },
  { origin: 'TUN', destination: 'MRS', label: 'Marseille' },
  { origin: 'TUN', destination: 'LYS', label: 'Lyon' },
];

// ── Counter component ─────────────────────────────────────────
const Counter = ({ value, onDec, onInc, min = 0, max = 9 }) => (
  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
    <button type="button" onClick={onDec} disabled={value <= min}
      style={{ padding: '10px 16px', border: 'none', background: '#f8fafc', cursor: value <= min ? 'not-allowed' : 'pointer',
        fontWeight: 700, fontSize: 16, color: value <= min ? '#cbd5e1' : 'var(--gray-700)' }}>−</button>
    <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 15, minWidth: 30 }}>{value}</span>
    <button type="button" onClick={onInc} disabled={value >= max}
      style={{ padding: '10px 16px', border: 'none', background: '#f8fafc', cursor: value >= max ? 'not-allowed' : 'pointer',
        fontWeight: 700, fontSize: 16, color: value >= max ? '#cbd5e1' : 'var(--gray-700)' }}>+</button>
  </div>
);

// ── Skeleton card ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{
    height: 110, borderRadius: 16,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e8edf2 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s ease-in-out infinite',
  }} />
);

// ══════════════════════════════════════════════════════════════
//  FlightSearch — main page
// ══════════════════════════════════════════════════════════════
const FlightSearch = () => {
  const navigate = useNavigate();

  // ── Search form state ──────────────────────────────────────
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

  // ── Dynamic content state ──────────────────────────────────
  const [bestDeals,       setBestDeals]       = useState([]);
  const [dealsLoading,    setDealsLoading]    = useState(false);
  const [upcomingFlights, setUpcomingFlights] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const { promos } = usePromotions('categorie', 'vols');

  const totalPassengers = adults + children;

  // ── Fetch best deals on mount ──────────────────────────────
  useEffect(() => {
    fetchBestDeals();
    fetchUpcomingFlights();
  }, []);

  const fetchBestDeals = async () => {
    setDealsLoading(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() + 10);
      const departure_date = d.toISOString().split('T')[0];
      // Try one route for best deals, pick cheapest offers
      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices: [{ origin: 'TUN', destination: 'CDG', departure_date }],
          passengers: [{ type: 'adult' }], cabin_class: 'economy',
        }),
      });
      const json = await res.json();
      if (json.success && json.offers?.length) {
        const sorted = [...json.offers].sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
        setBestDeals(sorted.slice(0, 3));
      }
    } catch { /* silent fail */ }
    finally { setDealsLoading(false); }
  };

  const fetchUpcomingFlights = async () => {
    setUpcomingLoading(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const departure_date = d.toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices: [{ origin: 'TUN', destination: 'IST', departure_date }],
          passengers: [{ type: 'adult' }], cabin_class: 'economy',
        }),
      });
      const json = await res.json();
      if (json.success && json.offers?.length) {
        setUpcomingFlights(json.offers.slice(0, 3));
      }
    } catch { /* silent fail */ }
    finally { setUpcomingLoading(false); }
  };

  // ── Swap origin / destination ──────────────────────────────
  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  // ── Quick destination click ────────────────────────────────
  const handleQuickDestination = async (route) => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const departure_date = d.toISOString().split('T')[0];
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices: [{ origin: route.origin, destination: route.destination, departure_date }],
          passengers: [{ type: 'adult' }], cabin_class: 'economy',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      navigate('/flights/results', {
        state: {
          offers: json.offers,
          searchParams: {
            origin: route.origin, destination: route.destination,
            departureDate: departure_date, adults: 1, children: 0,
            cabinClass: 'economy', tripType: 'oneway',
          },
        },
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    if (!origin || origin.length < 3) return setError('Veuillez sélectionner un aéroport de départ.');
    if (!destination || destination.length < 3) return setError("Veuillez sélectionner un aéroport d'arrivée.");
    if (origin === destination) return setError("L'origine et la destination doivent être différentes.");
    if (!departureDate) return setError('Veuillez choisir une date de départ.');
    if (tripType === 'roundtrip' && !returnDate) return setError('Veuillez choisir une date de retour.');
    if (tripType === 'roundtrip' && returnDate < departureDate) return setError('La date de retour doit être après le départ.');

    setLoading(true);
    try {
      const passengers = [
        ...Array(adults).fill({ type: 'adult' }),
        ...Array(children).fill({ type: 'child' }),
      ];
      const slices = [{ origin: origin.trim().toUpperCase(), destination: destination.trim().toUpperCase(), departure_date: departureDate }];
      if (tripType === 'roundtrip') {
        slices.push({ origin: destination.trim().toUpperCase(), destination: origin.trim().toUpperCase(), departure_date: returnDate });
      }
      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slices, passengers, cabin_class: cabinClass, ...(directOnly ? { max_connections: 0 } : {}) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur lors de la recherche.');
      navigate('/flights/results', {
        state: {
          offers: json.offers,
          searchParams: {
            origin: origin.trim().toUpperCase(), destination: destination.trim().toUpperCase(),
            departureDate, returnDate: tripType === 'roundtrip' ? returnDate : null,
            adults, children, cabinClass, tripType, directOnly,
          },
        },
      });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ── Section title helper ───────────────────────────────────
  const SectionTitle = ({ icon, badge, title, subtitle }) => (
    <div style={{ marginBottom: 28 }}>
      {badge && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(230,126,34,0.08)', borderRadius: 20, padding: '4px 14px', marginBottom: 10 }}>
          <i className={`fas ${icon}`} style={{ color: 'var(--secondary)', fontSize: 12 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)',
            textTransform: 'uppercase', letterSpacing: '.1em' }}>{badge}</span>
        </div>
      )}
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{subtitle}</p>}
    </div>
  );

  return (
    <div className="flights-page">
      <Navbar />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dest-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
        .dest-card { transition: transform .25s, box-shadow .25s; }
        .stat-card { animation: fadeUp .5s ease both; }
      `}</style>

      {/* ── Hero + Search ───────────────────────────────────── */}
      <div className="flights-hero" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f3460 100%)',
        paddingTop: 130, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
          
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 220, height: 220,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '30%', left: '8%', opacity: 0.07 }}>
          <i className="fas fa-plane" style={{ fontSize: 120, color: '#fff', transform: 'rotate(-20deg)' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <i className="fas fa-plane" style={{ fontSize: 28, color: 'var(--secondary)' }} />
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: 0 }}>
                Trouvez votre prochain vol
              </h1>
            </div>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              Comparez des milliers d'offres en temps réel · Taxes incluses · Réservation sécurisée
            </p>
          </div>

          {/* Search card */}
          <div className="flights-search-card" style={{ background: '#fff', borderRadius: 20, padding: '28px 32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxWidth: 960, margin: '0 auto' }}>

            {/* Trip type */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[{ value: 'oneway', label: '✈️ Aller simple' }, { value: 'roundtrip', label: '🔄 Aller-retour' }].map((t) => (
                <button key={t.value} onClick={() => setTripType(t.value)}
                  style={{ padding: '9px 20px', borderRadius: 30, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                    background: tripType === t.value ? 'var(--secondary)' : '#f1f5f9',
                    color:      tripType === t.value ? '#fff' : 'var(--gray-600)' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>
              {/* Row 1 */}
              <div style={{ display: 'grid',
                gridTemplateColumns: tripType === 'roundtrip' ? '1fr auto 1fr 1fr 1fr' : '1fr auto 1fr 1fr',
                gap: 12, marginBottom: 16, alignItems: 'end' }}>
                <AirportAutocomplete label="Départ (IATA)" icon="fa-plane-departure" value={origin}
                  onChange={setOrigin} placeholder="Tunis, TUN…" required />
                <button type="button" onClick={handleSwap}
                  style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', alignSelf: 'end', marginBottom: 2, flexShrink: 0 }}>
                  <i className="fas fa-exchange-alt" style={{ color: 'var(--secondary)', fontSize: 14 }} />
                </button>
                <AirportAutocomplete label="Arrivée (IATA)" icon="fa-plane-arrival" value={destination}
                  onChange={setDestination} placeholder="Paris, CDG…" required />
                <div className="omra-reserve__field">
                  <label><i className="fas fa-calendar-alt" style={{ color: 'var(--secondary)', marginRight: 6 }} />Date de départ *</label>
                  <input required type="date" min={today} value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
                </div>
                {tripType === 'roundtrip' && (
                  <div className="omra-reserve__field">
                    <label><i className="fas fa-calendar-check" style={{ color: 'var(--secondary)', marginRight: 6 }} />Date de retour *</label>
                    <input required type="date" min={departureDate || today} value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'flex-end', marginBottom: 20 }}>
                <div className="omra-reserve__field">
                  <label><i className="fas fa-user" style={{ color: 'var(--secondary)', marginRight: 6 }} />Adultes</label>
                  <Counter value={adults} onDec={() => setAdults(v => Math.max(1, v - 1))} onInc={() => setAdults(v => Math.min(9, v + 1))} min={1} />
                </div>
                <div className="omra-reserve__field">
                  <label><i className="fas fa-child" style={{ color: 'var(--secondary)', marginRight: 6 }} />Enfants (2–11 ans)</label>
                  <Counter value={children} onDec={() => setChildren(v => Math.max(0, v - 1))} onInc={() => setChildren(v => Math.min(8, v + 1))} />
                </div>
                <div className="omra-reserve__field">
                  <label><i className="fas fa-couch" style={{ color: 'var(--secondary)', marginRight: 6 }} />Classe</label>
                  <select value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
                    {CABIN_CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={directOnly} onChange={e => setDirectOnly(e.target.checked)}
                      style={{ accentColor: 'var(--secondary)', width: 16, height: 16 }} />
                    Vols directs seulement
                  </label>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
                  padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b',
                  display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-exclamation-circle" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '15px 24px', border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #e92f64, #c2185b)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {loading
                  ? <><i className="fas fa-spinner fa-spin" /> Recherche en cours…</>
                  : <><i className="fas fa-search" /> Rechercher — {totalPassengers} passager{totalPassengers > 1 ? 's' : ''}</>}
              </button>
            </form>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { icon: 'fa-plane', label: 'Compagnies', value: '500+' },
              { icon: 'fa-globe', label: 'Destinations', value: '130+' },
              { icon: 'fa-shield-alt', label: 'Réservations sécurisées', value: '100%' },
              { icon: 'fa-headset', label: 'Support', value: '6j/7' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <i className={`fas ${s.icon}`} style={{ fontSize: 10 }} />{s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dynamic content sections ────────────────────────── */}
      {promos.length > 0 && (
        <div className="container" style={{ paddingTop: 24 }}>
          <PromotionsSection promos={promos} titre="Promotions billeterie" showCards={false} />
        </div>
      )}

      <div className="container" style={{ padding: '60px 0' }}>

        {/* 1 — Popular destinations ─────────────────────────── */}
        
        {/* 2 — Best deals ───────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <SectionTitle icon="fa-tags" badge="Meilleures offres" title="💸 Prix les plus bas du moment"
            subtitle="Vols TUN → CDG · Actualisé en temps réel · Taxes incluses" />
          {dealsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : bestDeals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {bestDeals.map((offer, i) => (
                <div key={offer.id} style={{ position: 'relative' }}>
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: -10, left: 16, zIndex: 2,
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff', borderRadius: 8, padding: '3px 10px',
                      fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="fas fa-star" style={{ fontSize: 9 }} /> Meilleur prix
                    </div>
                  )}
                  <FlightCard offer={offer} onSelect={() =>
                    navigate('/flights/details', { state: { offer, searchParams: {} } })} />
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button onClick={() => handleQuickDestination({ origin: 'TUN', destination: 'CDG' })}
                  style={{ padding: '11px 28px', background: 'transparent',
                    border: '2px solid var(--secondary)', color: 'var(--secondary)',
                    borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Voir toutes les offres TUN → CDG <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 32, textAlign: 'center',
              border: '1px dashed #e2e8f0' }}>
              <i className="fas fa-plane-slash" style={{ fontSize: 32, color: '#cbd5e1', marginBottom: 12, display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Les offres ne sont pas disponibles pour le moment.</p>
            </div>
          )}
        </section>

        {/* 3 — Upcoming/next departures ─────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <SectionTitle icon="fa-clock" badge="Prochains départs" title="📍 Vols les plus proches"
            subtitle="Départs dans les 7 prochains jours depuis Tunis · Réservez maintenant" />
          {upcomingLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : upcomingFlights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {upcomingFlights.map(offer => (
                <FlightCard key={offer.id} offer={offer} onSelect={() =>
                  navigate('/flights/details', { state: { offer, searchParams: {} } })} />
              ))}
            </div>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 32, textAlign: 'center',
              border: '1px dashed #e2e8f0' }}>
              <i className="fas fa-plane-slash" style={{ fontSize: 32, color: '#cbd5e1', marginBottom: 12, display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Aucun vol imminent disponible.</p>
            </div>
          )}
        </section>

        {/* 4 — Why book with us ─────────────────────────────── */}
        <section>
          <SectionTitle icon="fa-shield-alt" badge="Pourquoi nous" title="Réservez en toute confiance" />
          <div className="flights-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: 'fa-shield-alt',  color: '#4f46e5', title: 'Réservation sécurisée', desc: 'Paiement SSL 256-bit ou directement en agence. Vos données sont protégées.' },
              { icon: 'fa-tags',        color: '#16a34a', title: 'Meilleurs tarifs',      desc: 'Prix Duffel en temps réel avec une marge agence transparente et compétitive.' },
              { icon: 'fa-headset',     color: '#d97706', title: 'Support 6j/7',          desc: 'Notre équipe est disponible du lundi au samedi de 09h à 18h pour vous accompagner.' },
              { icon: 'fa-undo',        color: '#0891b2', title: 'Modifications flexibles',desc: 'Changements de billet selon les conditions de chaque compagnie aérienne.' },
              { icon: 'fa-suitcase',    color: '#dc2626', title: 'Bagages inclus',        desc: 'Consultez l\'allocation bagage directement sur chaque offre avant de réserver.' },
              { icon: 'fa-map-marker-alt', color: '#7c3aed', title: 'Agence locale',     desc: 'Rendez-vous en agence à Tunis pour payer en espèces ou par virement bancaire.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24,
                border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${item.icon}`} style={{ fontSize: 18, color: item.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0a2832', marginBottom: 6, marginTop: 0 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default FlightSearch;
