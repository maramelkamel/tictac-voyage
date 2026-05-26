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
import '../../styles/FlightsPage.css'; // tous les styles de ce fichier sont dans FlightsPage.css

// ── URL de base de l'API (variable d'env Vite ou fallback localhost) ─
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Options de classe cabine affichées dans le select ────────────────
const CABIN_CLASSES = [
  { value: 'economy',         label: '🪑 Économique' },
  { value: 'premium_economy', label: '🛋️ Premium Économique' },
  { value: 'business',        label: '💼 Affaires' },
  { value: 'first',           label: '👑 Première' },
];

// ── Date du jour au format YYYY-MM-DD — utilisée comme min sur les inputs date ─
const today = new Date().toISOString().split('T')[0];

// ── Composant Counter ────────────────────────────────────────────────
// Compteur +/- réutilisable pour adultes et enfants.
// Reçoit la valeur et les callbacks du parent — ne gère aucun état interne.
// Props :
//   value  : valeur actuelle (number)
//   onDec  : fonction appelée sur clic − (décrémente dans le parent)
//   onInc  : fonction appelée sur clic + (incrémente dans le parent)
//   min    : valeur minimale autorisée (défaut 0)
//   max    : valeur maximale autorisée (défaut 9)
const Counter = ({ value, onDec, onInc, min = 0, max = 9 }) => (
  <div className="flights-counter">
    {/* Bouton décrémentation — désactivé si value <= min */}
    <button
      type="button"                          // évite la soumission du formulaire parent
      onClick={onDec}
      disabled={value <= min}
      className={`flights-counter__btn ${value <= min ? 'flights-counter__btn--disabled' : 'flights-counter__btn--active'}`}
    >
      −
    </button>

    {/* Affichage de la valeur courante */}
    <span className="flights-counter__value">{value}</span>

    {/* Bouton incrémentation — désactivé si value >= max */}
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

// ── Composant SkeletonCard ───────────────────────────────────────────
// Placeholder animé (effet shimmer) affiché pendant le chargement des offres.
// Simule visuellement une carte de vol sans contenu réel.
const SkeletonCard = () => (
  <div className="flights-skeleton flights-skeleton--card" />
);

// ── Composant SectionTitle ───────────────────────────────────────────
// Bloc titre de section : badge coloré + h2 + sous-titre optionnel.
// Props :
//   icon     : classe Font Awesome (ex: "fa-tags")
//   badge    : texte du badge orange (ex: "Meilleures offres")
//   title    : titre principal h2
//   subtitle : texte gris sous le titre (optionnel)
const SectionTitle = ({ icon, badge, title, subtitle }) => (
  <div className="flights-section-title">
    {/* Badge orange affiché seulement si la prop badge est fournie */}
    {badge && (
      <div className="flights-badge">
        <i className={`fas ${icon}`} style={{ color: 'var(--secondary)', fontSize: 12 }} />
        <span className="flights-badge__text">{badge}</span>
      </div>
    )}
    <h2>{title}</h2>
    {/* Sous-titre affiché seulement si la prop subtitle est fournie */}
    {subtitle && <p>{subtitle}</p>}
  </div>
);

// ════════════════════════════════════════════════════════════════════
//  FlightSearch — composant principal
//  Page d'accueil des vols : formulaire de recherche + sections
//  dynamiques (meilleures offres, prochains départs, why book with us)
// ════════════════════════════════════════════════════════════════════
const FlightSearch = () => {
  const navigate = useNavigate(); // hook React Router pour changer de page

  // ── États du formulaire de recherche ─────────────────────────────
  const [tripType,      setTripType]      = useState('oneway');   // 'oneway' | 'roundtrip'
  const [origin,        setOrigin]        = useState('');          // code IATA départ (ex: "TUN")
  const [destination,   setDestination]   = useState('');          // code IATA arrivée (ex: "CDG")
  const [departureDate, setDepartureDate] = useState('');          // YYYY-MM-DD
  const [returnDate,    setReturnDate]    = useState('');          // YYYY-MM-DD (aller-retour seulement)
  const [adults,        setAdults]        = useState(1);           // nb adultes (min 1)
  const [children,      setChildren]      = useState(0);           // nb enfants 2-11 ans
  const [cabinClass,    setCabinClass]    = useState('economy');   // classe cabine
  const [directOnly,    setDirectOnly]    = useState(false);       // filtre vols directs seulement
  const [loading,       setLoading]       = useState(false);       // spinner bouton submit
  const [error,         setError]         = useState('');          // message d'erreur formulaire

  // ── États des sections dynamiques (chargées au montage) ──────────
  const [bestDeals,       setBestDeals]       = useState([]);  // 3 offres les moins chères TUN→CDG
  const [dealsLoading,    setDealsLoading]    = useState(false);
  const [upcomingFlights, setUpcomingFlights] = useState([]);  // 3 prochains vols TUN→IST
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  // Promotions actives pour la catégorie "vols" (hook custom → appel API)
  const { promos } = usePromotions('categorie', 'vols');

  // Total passagers affiché dans le bouton submit
  const totalPassengers = adults + children;

  // ── Chargement initial des sections dynamiques ───────────────────
  // useEffect avec [] = s'exécute une seule fois après le premier rendu
  useEffect(() => {
    fetchBestDeals();
    fetchUpcomingFlights();
  }, []);

  // ── Fetch meilleures offres TUN → CDG (dans 10 jours) ────────────
  const fetchBestDeals = async () => {
    setDealsLoading(true);
    try {
      // Calcul de la date dans 10 jours
      const d = new Date();
      d.setDate(d.getDate() + 10);
      const departure_date = d.toISOString().split('T')[0]; // "YYYY-MM-DD"

      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices:      [{ origin: 'TUN', destination: 'CDG', departure_date }],
          passengers:  [{ type: 'adult' }],
          cabin_class: 'economy',
        }),
      });
      const json = await res.json();

      if (json.success && json.offers?.length) {
        // Trie par prix croissant, garde les 3 moins chères
        const sorted = [...json.offers].sort(
          (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount)
        );
        setBestDeals(sorted.slice(0, 3));
      }
    } catch { /* échec silencieux — la section reste vide sans bloquer la page */ }
    finally { setDealsLoading(false); }
  };

  // ── Fetch prochains vols TUN → IST (dans 7 jours) ────────────────
  const fetchUpcomingFlights = async () => {
    setUpcomingLoading(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const departure_date = d.toISOString().split('T')[0];

      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices:      [{ origin: 'TUN', destination: 'IST', departure_date }],
          passengers:  [{ type: 'adult' }],
          cabin_class: 'economy',
        }),
      });
      const json = await res.json();

      if (json.success && json.offers?.length) {
        setUpcomingFlights(json.offers.slice(0, 3)); // garde 3 offres max
      }
    } catch { /* échec silencieux */ }
    finally { setUpcomingLoading(false); }
  };

  // ── Inverser origine et destination ──────────────────────────────
  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
    // React batch ces 2 setState en un seul re-render (React 18+)
  };

  // ── Clic sur une destination rapide (ex: "Tunis → Paris") ────────
  // Lance immédiatement une recherche avec paramètres par défaut
  const handleQuickDestination = async (route) => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const departure_date = d.toISOString().split('T')[0];

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices:      [{ origin: route.origin, destination: route.destination, departure_date }],
          passengers:  [{ type: 'adult' }],
          cabin_class: 'economy',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      // Navigue vers la page de résultats en passant les offres et paramètres via state
      navigate('/flights/results', {
        state: {
          offers: json.offers,
          searchParams: {
            origin:        route.origin,
            destination:   route.destination,
            departureDate: departure_date,
            adults:        1,
            children:      0,
            cabinClass:    'economy',
            tripType:      'oneway',
          },
        },
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  // ── Soumission du formulaire principal ───────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault(); // empêche le rechargement de page (comportement HTML natif des <form>)
    setError('');

    // Validations en cascade — chaque return stoppe la fonction à la première erreur
    if (!origin || origin.length < 3)
      return setError('Veuillez sélectionner un aéroport de départ.');
      // origin.length < 3 : code IATA = 3 lettres exactes, valeur partielle rejetée

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
      // Comparaison ISO fonctionne comme comparaison de strings (format chronologique)

    setLoading(true);
    try {
      // Construction du tableau passagers : N adultes + M enfants
      const passengers = [
        ...Array(adults).fill({ type: 'adult' }),     // ex: 2 adultes → [{type:'adult'},{type:'adult'}]
        ...Array(children).fill({ type: 'child' }),
      ];

      // Construction des slices (trajets) : 1 pour aller simple, 2 pour aller-retour
      const slices = [{
        origin:         origin.trim().toUpperCase(),       // normalise en majuscules
        destination:    destination.trim().toUpperCase(),
        departure_date: departureDate,
      }];

      // Aller-retour : second slice avec origine et destination inversées
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
          // max_connections: 0 n'est ajouté que si directOnly est coché (spread conditionnel)
          ...(directOnly ? { max_connections: 0 } : {}),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur lors de la recherche.');

      // Navigue vers la liste de résultats en passant les offres + params via state React Router
      navigate('/flights/results', {
        state: {
          offers: json.offers,
          searchParams: {
            origin:        origin.trim().toUpperCase(),
            destination:   destination.trim().toUpperCase(),
            departureDate,
            returnDate:    tripType === 'roundtrip' ? returnDate : null,
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
      setLoading(false); // toujours arrêter le spinner, succès ou échec
    }
  };

  // ════════════════════════════════════════════════════════════════
  //  RENDU
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="flights-page">
      <Navbar />

      {/* ── Hero avec formulaire de recherche ────────────────── */}
      <div
        className="flights-hero"
        style={{
          background:    'linear-gradient(135deg, var(--primary) 0%, #0f3460 100%)',
          paddingTop:    130,
          paddingBottom: 80,
          position:      'relative',
          overflow:      'hidden',
        }}
      >
        {/* Cercles décoratifs positionnés en absolu */}
        <div className="flights-hero__circle-tr" />
        <div className="flights-hero__circle-bl" />

        {/* Icône avion en filigrane */}
        <div className="flights-hero__watermark">
          <i className="fas fa-plane" />
        </div>

        <div className="container flights-hero__inner">

          {/* Titre + accroche */}
          <div className="flights-hero__title">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <i className="fas fa-plane" style={{ fontSize: 28, color: 'var(--secondary)' }} />
              <h1>Trouvez votre prochain vol</h1>
            </div>
            <p className="flights-hero__subtitle">
              Comparez des milliers d'offres en temps réel · Taxes incluses · Réservation sécurisée
            </p>
          </div>

          {/* ── Carte blanche avec le formulaire ─────────────── */}
          <div className="flights-search-card">

            {/* Boutons type de trajet : aller simple / aller-retour */}
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

              {/* Ligne 1 : aéroports + dates
                  Colonnes variables selon le type de trajet :
                  aller simple = 4 colonnes, aller-retour = 5 colonnes */}
              <div className={`flights-form-row1 flights-form-row1--${tripType}`}>

                {/* Champ aéroport de départ avec autocomplétion */}
                <AirportAutocomplete
                  label="Départ (IATA)"
                  icon="fa-plane-departure"
                  value={origin}
                  onChange={setOrigin}
                  placeholder="Tunis, TUN…"
                  required
                />

                {/* Bouton pour inverser origine ↔ destination */}
                <button type="button" onClick={handleSwap} className="flights-swap-btn">
                  <i className="fas fa-exchange-alt" style={{ color: 'var(--secondary)', fontSize: 14 }} />
                </button>

                {/* Champ aéroport d'arrivée avec autocomplétion */}
                <AirportAutocomplete
                  label="Arrivée (IATA)"
                  icon="fa-plane-arrival"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Paris, CDG…"
                  required
                />

                {/* Date de départ */}
                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-calendar-alt" style={{ color: 'var(--secondary)', marginRight: 6 }} />
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

                {/* Date de retour — visible seulement en mode aller-retour */}
                {tripType === 'roundtrip' && (
                  <div className="omra-reserve__field">
                    <label>
                      <i className="fas fa-calendar-check" style={{ color: 'var(--secondary)', marginRight: 6 }} />
                      Date de retour *
                    </label>
                    <input
                      required
                      type="date"
                      min={departureDate || today} // ne peut pas être avant le départ
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Ligne 2 : passagers + classe + option directs */}
              <div className="flights-form-row2">

                {/* Compteur adultes (min 1 car au moins 1 adulte requis) */}
                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-user" style={{ color: 'var(--secondary)', marginRight: 6 }} />
                    Adultes
                  </label>
                  <Counter
                    value={adults}
                    onDec={() => setAdults(v => Math.max(1, v - 1))}  // Math.max protège contre v < 1
                    onInc={() => setAdults(v => Math.min(9, v + 1))}  // Math.min plafonne à 9
                    min={1}
                  />
                </div>

                {/* Compteur enfants (min 0) */}
                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-child" style={{ color: 'var(--secondary)', marginRight: 6 }} />
                    Enfants (2–11 ans)
                  </label>
                  <Counter
                    value={children}
                    onDec={() => setChildren(v => Math.max(0, v - 1))}
                    onInc={() => setChildren(v => Math.min(8, v + 1))}
                    min={0}
                  />
                </div>

                {/* Select de classe cabine */}
                <div className="omra-reserve__field">
                  <label>
                    <i className="fas fa-couch" style={{ color: 'var(--secondary)', marginRight: 6 }} />
                    Classe
                  </label>
                  <select value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
                    {CABIN_CLASSES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Checkbox vols directs seulement */}
                <label className="flights-direct-label">
                  <input
                    type="checkbox"
                    checked={directOnly}
                    onChange={e => setDirectOnly(e.target.checked)}
                    style={{ accentColor: 'var(--secondary)', width: 16, height: 16 }}
                  />
                  Vols directs seulement
                </label>
              </div>

              {/* Bloc d'erreur de validation — visible seulement si error !== '' */}
              {error && (
                <div className="flights-form-error">
                  <i className="fas fa-exclamation-circle" /> {error}
                </div>
              )}

              {/* Bouton submit — change d'apparence selon l'état loading */}
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

          {/* Bande de statistiques (500+ compagnies, 130+ destinations...) */}
          <div className="flights-stats-strip">
            {[
              { icon: 'fa-plane',      label: 'Compagnies',             value: '500+' },
              { icon: 'fa-globe',      label: 'Destinations',           value: '130+' },
              { icon: 'fa-shield-alt', label: 'Réservations sécurisées', value: '100%' },
              { icon: 'fa-headset',    label: 'Support',                value: '6j/7' },
            ].map((s, i) => (
              // animationDelay échelonné : chaque stat apparaît 100ms après la précédente
              <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">
                  <i className={`fas ${s.icon}`} style={{ fontSize: 10 }} />
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Promotions actives (si au moins une promo existe) ─── */}
      {promos.length > 0 && (
        <div className="container" style={{ paddingTop: 24 }}>
          <PromotionsSection promos={promos} titre="Promotions billeterie" showCards={false} />
        </div>
      )}

      {/* ── Sections de contenu dynamique ────────────────────── */}
      <div className="container" style={{ padding: '60px 0' }}>

        {/* Section 1 : Meilleures offres (prix les plus bas TUN → CDG) */}
        <section className="flights-section">
          <SectionTitle
            icon="fa-tags"
            badge="Meilleures offres"
            title="💸 Prix les plus bas du moment"
            subtitle="Vols TUN → CDG · Actualisé en temps réel · Taxes incluses"
          />

          {/* Pendant le chargement : 3 skeletons */}
          {dealsLoading ? (
            <div className="flights-skeleton-list">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : bestDeals.length > 0 ? (
            <div className="flights-cards-list">
              {bestDeals.map((offer, i) => (
                // Wrapper relatif pour positionner le badge "Meilleur prix" sur la 1ère carte
                <div key={offer.id} className="flights-best-price-wrapper">
                  {i === 0 && (
                    // Badge doré sur la première offre (moins chère)
                    <div className="flights-best-price-badge">
                      <i className="fas fa-star" style={{ fontSize: 9 }} /> Meilleur prix
                    </div>
                  )}
                  <FlightCard
                    offer={offer}
                    onSelect={() => navigate('/flights/details', { state: { offer, searchParams: {} } })}
                  />
                </div>
              ))}

              {/* Lien vers tous les résultats TUN → CDG */}
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button
                  onClick={() => handleQuickDestination({ origin: 'TUN', destination: 'CDG' })}
                  style={{
                    padding:    '11px 28px',
                    background: 'transparent',
                    border:     '2px solid var(--secondary)',
                    color:      'var(--secondary)',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize:   13,
                    cursor:     'pointer',
                  }}
                >
                  Voir toutes les offres TUN → CDG <i className="fas fa-arrow-right" style={{ marginLeft: 6 }} />
                </button>
              </div>
            </div>
          ) : (
            // État vide si aucune offre disponible
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px dashed #e2e8f0' }}>
              <i className="fas fa-plane-slash" style={{ fontSize: 32, color: '#cbd5e1', marginBottom: 12, display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Les offres ne sont pas disponibles pour le moment.</p>
            </div>
          )}
        </section>

        {/* Section 2 : Prochains vols (TUN → IST dans 7 jours) */}
        <section className="flights-section">
          <SectionTitle
            icon="fa-clock"
            badge="Prochains départs"
            title="📍 Vols les plus proches"
            subtitle="Départs dans les 7 prochains jours depuis Tunis · Réservez maintenant"
          />

          {upcomingLoading ? (
            <div className="flights-skeleton-list">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : upcomingFlights.length > 0 ? (
            <div className="flights-cards-list">
              {upcomingFlights.map(offer => (
                <FlightCard
                  key={offer.id}
                  offer={offer}
                  onSelect={() => navigate('/flights/details', { state: { offer, searchParams: {} } })}
                />
              ))}
            </div>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px dashed #e2e8f0' }}>
              <i className="fas fa-plane-slash" style={{ fontSize: 32, color: '#cbd5e1', marginBottom: 12, display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Aucun vol imminent disponible.</p>
            </div>
          )}
        </section>

        {/* Section 3 : Arguments commerciaux "Pourquoi nous" */}
        <section>
          <SectionTitle icon="fa-shield-alt" badge="Pourquoi nous" title="Réservez en toute confiance" />

          <div className="flights-feature-grid">
            {[
              { icon: 'fa-shield-alt',     color: '#4f46e5', title: 'Réservation sécurisée',   desc: 'Paiement SSL 256-bit ou directement en agence. Vos données sont protégées.' },
              { icon: 'fa-tags',           color: '#16a34a', title: 'Meilleurs tarifs',         desc: 'Prix Duffel en temps réel avec une marge agence transparente et compétitive.' },
              { icon: 'fa-headset',        color: '#d97706', title: 'Support 6j/7',             desc: 'Notre équipe est disponible du lundi au samedi de 09h à 18h pour vous accompagner.' },
              { icon: 'fa-undo',           color: '#0891b2', title: 'Modifications flexibles',  desc: "Changements de billet selon les conditions de chaque compagnie aérienne." },
              { icon: 'fa-suitcase',       color: '#dc2626', title: 'Bagages inclus',           desc: "Consultez l'allocation bagage directement sur chaque offre avant de réserver." },
              { icon: 'fa-map-marker-alt', color: '#7c3aed', title: 'Agence locale',            desc: 'Rendez-vous en agence à Tunis pour payer en espèces ou par virement bancaire.' },
            ].map((item, i) => (
              <div key={i} className="flights-feature-card">
                {/* Icône colorée avec fond teinté (couleur + opacité 15%) */}
                <div
                  className="flights-feature-icon"
                  style={{ background: `${item.color}15` }}  // 15 en hex = 8% opacité
                >
                  <i className={`fas ${item.icon}`} style={{ fontSize: 18, color: item.color }} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
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