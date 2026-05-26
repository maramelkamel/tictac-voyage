// src/pages/flights/FlightListPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FlightCard from '../../components/FlightCard';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import '../../styles/omrastyle.css';
import '../../styles/FlightsPage.css'; // tous les styles dans FlightsPage.css

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────
//  HELPERS — extraient des données d'une offre Duffel normalisée
//  Définis hors composant car ne dépendent d'aucun état React.
//  Ils cherchent d'abord dans _summary (chemin court mis en place
//  par normaliseOffer) puis descendent dans la structure complète.
// ─────────────────────────────────────────────────────────────────

// Retourne le nom de la compagnie aérienne
const getAirlineName = (o) =>
  o._summary?.airline_name ||
  o.slices?.[0]?.segments?.[0]?.marketing_carrier?.name || '';

// Retourne le nombre d'escales (0 = direct)
const getStops = (o) =>
  o._summary?.stops ?? (o.slices?.[0]?.segments?.length ?? 1) - 1;
  // ?? = nullish coalescing : si _summary.stops est absent, calcule segments.length - 1

// Retourne la date/heure de départ au format ISO (ex: "2026-06-04T10:30:00Z")
// Utilisée pour le tri par heure de départ
const getDeparture = (o) =>
  o._summary?.departing_at || o.slices?.[0]?.segments?.[0]?.departing_at || '';

// Retourne la durée ISO du vol (ex: "PT2H35M")
// Utilisée pour le tri par durée
const getDuration = (o) =>
  o._summary?.duration || o.slices?.[0]?.duration || '';

// Retourne le prix en nombre décimal (total_amount est une string dans Duffel)
const getPrice = (o) => parseFloat(o.total_amount || '0');

// ── Correspondance valeur API → label affiché ────────────────────
const CABIN_LABELS = {
  economy:         'Économique',
  premium_economy: 'Premium',
  business:        'Affaires',
  first:           'Première',
};

// ── Routes prédéfinies pour les suggestions (aucune recherche active) ─
// Chaque objet contient les données nécessaires pour lancer un fetch
// ET pour afficher le bouton d'onglet.
const SUGGESTION_ROUTES = [
  { origin: 'TUN', destination: 'CDG', label: 'Paris',     emoji: '🗼' },
  { origin: 'TUN', destination: 'IST', label: 'Istanbul',  emoji: '🕌' },
  { origin: 'TUN', destination: 'DXB', label: 'Dubaï',     emoji: '🏙️' },
  { origin: 'TUN', destination: 'LHR', label: 'Londres',   emoji: '🎡' },
  { origin: 'TUN', destination: 'FCO', label: 'Rome',      emoji: '🏛️' },
  { origin: 'TUN', destination: 'MRS', label: 'Marseille', emoji: '⛵' },
];

// ─────────────────────────────────────────────────────────────────
//  COMPOSANT SuggestedFlights
//  Affiché quand l'utilisateur arrive sur /flights/results
//  sans passer par une recherche (pas d'offers dans le state).
//  Propose des vols populaires depuis Tunis via des onglets de routes.
// ─────────────────────────────────────────────────────────────────
const SuggestedFlights = ({ onSelect }) => {
  const navigate = useNavigate();

  // Index de l'onglet actif (0 = Paris par défaut)
  const [activeRoute, setActiveRoute] = useState(0);
  // Offres retournées par l'API pour la route active
  const [suggestions, setSuggestions] = useState([]);
  // Contrôle l'affichage du skeleton loader
  const [loading, setLoading]         = useState(false);
  // Message d'erreur si le fetch échoue
  const [error, setError]             = useState('');

  // ── Fetch les offres pour une route donnée par son index ────────
  const fetchSuggestions = async (idx) => {
    setLoading(true);
    setError('');
    setSuggestions([]); // vide les anciennes cartes immédiatement

    const route = SUGGESTION_ROUTES[idx];

    // Date dans 14 jours — assez loin pour avoir des disponibilités
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const departure_date = d.toISOString().split('T')[0]; // "YYYY-MM-DD"

    try {
      const res = await fetch(`${API_BASE}/flights/search`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slices:      [{ origin: route.origin, destination: route.destination, departure_date }],
          passengers:  [{ type: 'adult' }],
          cabin_class: 'economy',
        }),
      });

      const json = await res.json();

      if (json.success && json.offers?.length) {
        setSuggestions(json.offers.slice(0, 6)); // max 6 suggestions
      } else {
        setError('Aucune offre disponible pour cette route en ce moment.');
      }
    } catch {
      // Erreur réseau ou serveur indisponible
      setError('Impossible de charger les offres. Vérifiez votre connexion.');
    } finally {
      setLoading(false); // toujours arrêter le skeleton, succès ou erreur
    }
  };

  // Déclenche un fetch à chaque changement d'onglet (et au montage initial)
  // [] vide → montage ; [activeRoute] → changement d'onglet
  useEffect(() => {
    fetchSuggestions(activeRoute);
  }, [activeRoute]);

  return (
    <div className="flights-suggestions">

      {/* ── En-tête de la section suggestions ──────────────── */}
      <div className="flights-suggestions__header">
        {/* Badge "Offres du moment" */}
        <div className="flights-badge" style={{ marginBottom: 12 }}>
          <i className="fas fa-fire" style={{ color: 'var(--secondary)', fontSize: 12 }} />
          <span className="flights-badge__text">Offres du moment</span>
        </div>
        <h2 className="flights-suggestions__headline">Vols populaires depuis Tunis</h2>
        <p className="flights-suggestions__meta">
          Prix en temps réel · Taxes incluses · Marge agence incluse
        </p>
      </div>

      {/* ── Onglets de routes ───────────────────────────────── */}
      <div className="flights-route-tabs">
        {SUGGESTION_ROUTES.map((route, i) => (
          <button
            key={i}
            onClick={() => setActiveRoute(i)}
            disabled={loading} // désactive tous les onglets pendant un fetch
            className={[
              'flights-route-tab',
              // Onglet actif : orange ; inactif : gris
              activeRoute === i ? 'flights-route-tab--active' : 'flights-route-tab--inactive',
              // Onglets inactifs semi-transparents pendant chargement
              loading && activeRoute !== i ? 'flights-route-tab--loading' : '',
            ].join(' ')}
          >
            {route.emoji} Tunis → {route.label}
          </button>
        ))}
      </div>

      {/* ── Skeleton loader (4 cartes placeholder) ─────────── */}
      {loading && (
        <div className="flights-skeleton-list">
          {[1, 2, 3, 4].map(i => (
            // Skeleton légèrement plus grand que sur FlightSearch
            <div key={i} className="flights-skeleton flights-skeleton--large" />
          ))}
        </div>
      )}

      {/* ── Bloc d'erreur ───────────────────────────────────── */}
      {/* Affiché seulement si le chargement est terminé ET qu'il y a une erreur */}
      {!loading && error && (
        <div className="flights-error-box">
          <i className="fas fa-exclamation-circle flights-error-box__icon" />
          <div>
            <p className="flights-error-box__title">Chargement impossible</p>
            <p className="flights-error-box__msg">{error}</p>
          </div>
        </div>
      )}

      {/* ── Cartes de vols + pied de section ───────────────── */}
      {/* Affiché seulement si chargement terminé ET au moins une offre */}
      {!loading && suggestions.length > 0 && (
        <>
          {/* Compteur d'offres + label "Prix temps réel" */}
          <div className="flights-offers-bar">
            <p className="flights-offers-bar__count">
              <strong style={{ color: 'var(--gray-700)' }}>{suggestions.length}</strong>
              {' '}offre{suggestions.length > 1 ? 's' : ''} disponible{suggestions.length > 1 ? 's' : ''}
              {' '}· {SUGGESTION_ROUTES[activeRoute].emoji} Tunis → {SUGGESTION_ROUTES[activeRoute].label}
            </p>
            <span className="flights-offers-bar__realtime">
              <i className="fas fa-sync-alt" style={{ fontSize: 10 }} />
              Prix temps réel
            </span>
          </div>

          {/* Liste des cartes d'offres */}
          <div className="flights-cards-list">
            {suggestions.map(offer => (
              <FlightCard
                key={offer.id}
                offer={offer}
                // Passe l'offre ET les params de route extraits du _summary
                // (nécessaire car pas de searchParams complet comme une vraie recherche)
                onSelect={() => onSelect(offer, {
                  origin:      offer._summary?.origin_iata,
                  destination: offer._summary?.destination_iata,
                })}
              />
            ))}
          </div>

          {/* CTA "Faire une recherche personnalisée" */}
          <div className="flights-cta-box">
            <p>Vous avez une destination précise en tête ?</p>
            <button
              onClick={() => navigate('/flights/search')}
              className="flights-cta-btn"
            >
              <i className="fas fa-search" />
              Faire une recherche personnalisée
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL FlightListPage
//  Deux modes :
//  1. Pas d'offres (state vide) → affiche SuggestedFlights
//  2. Offres reçues depuis FlightSearch → affiche filtres + résultats
// ─────────────────────────────────────────────────────────────────
const FlightListPage = () => {
  const navigate  = useNavigate();
  const { state } = useLocation(); // lit les données passées par navigate(..., { state })

  // Données reçues depuis FlightSearch via React Router state
  // || [] et || {} = valeurs par défaut si accès direct à l'URL
  const offers       = state?.offers       || [];
  const searchParams = state?.searchParams || {};

  // Déstructure les paramètres de recherche pour les afficher dans le header
  // adults = 1 et children = 0 : valeurs par défaut si searchParams est vide
  const {
    origin, destination, departureDate, returnDate,
    adults = 1, children = 0, cabinClass,
  } = searchParams;

  // ── États des filtres et du tri ──────────────────────────────────
  const [sortBy,        setSortBy]        = useState('price_asc'); // tri par défaut : prix croissant
  const [maxPrice,      setMaxPrice]      = useState('');           // '' = pas de filtre prix
  const [filterAirline, setFilterAirline] = useState('');           // '' = toutes les compagnies
  const [filterStops,   setFilterStops]   = useState('all');        // 'all' | 'direct' | 'oneplus'

  // Promotions actives pour la catégorie vols
  const { promos } = usePromotions('categorie', 'vols');

  // Booléen pour éviter de réécrire offers.length > 0 partout
  const hasResults = offers.length > 0;

  // ── Callback partagé entre résultats de recherche ET suggestions ─
  // overrideParams : utilisé par SuggestedFlights qui n'a pas de searchParams complet
  const handleSelect = (offer, overrideParams) => {
    navigate('/flights/details', {
      state: {
        offer,
        searchParams: overrideParams || searchParams, // priorité aux overrides des suggestions
      },
    });
  };

  // ── Liste dédupliquée et triée des compagnies aériennes ──────────
  // useMemo : ne recalcule que si offers change (pas à chaque re-render de filtre/tri)
  const airlines = useMemo(() => {
    const set = new Set(); // Set = déduplique automatiquement
    offers.forEach(o => {
      const n = getAirlineName(o);
      if (n) set.add(n); // ignore les noms vides
    });
    return [...set].sort(); // convertit en tableau et trie alphabétiquement
  }, [offers]);

  // ── Calculs de prix (min/max) pour l'input de filtre ────────────
  // Calculés hors useMemo car simples et dépendent directement de offers
  const prices      = offers.map(getPrice);
  const minPrice    = prices.length ? Math.min(...prices) : 0;
  // Math.min(...[400,250,800]) = Math.min(400,250,800) = 250 (spread déploie le tableau)
  const maxPriceAll = prices.length ? Math.max(...prices) : 0;
  const currency    = offers[0]?.total_currency || 'TND'; // devise du premier résultat

  // ── Filtrage + tri de la liste d'offres ─────────────────────────
  // useMemo avec 5 dépendances : recalcule si les offres OU n'importe quel filtre change
  const filtered = useMemo(() => {
    let list = [...offers]; // copie pour ne JAMAIS muter le state React directement

    // Filtre compagnie — ignoré si filterAirline === '' (falsy)
    if (filterAirline)
      list = list.filter(o => getAirlineName(o) === filterAirline);

    // Filtres escales — deux if séparés car filterStops peut valoir 'all' (aucun filtre)
    if (filterStops === 'direct')  list = list.filter(o => getStops(o) === 0);
    if (filterStops === 'oneplus') list = list.filter(o => getStops(o) > 0);

    // Filtre prix maximum — appliqué seulement si l'input contient un nombre valide
    if (maxPrice !== '') {
      const cap = parseFloat(maxPrice);
      // isNaN(cap) = true si l'utilisateur a tapé des lettres → filtre ignoré
      if (!isNaN(cap)) list = list.filter(o => getPrice(o) <= cap);
    }

    // Tri
    list.sort((a, b) => {
      const pa = getPrice(a),     pb = getPrice(b);     // prix numériques
      const da = getDeparture(a), db = getDeparture(b); // dates ISO comparables comme strings
      const ta = getDuration(a),  tb = getDuration(b);  // durées ISO comparables comme strings

      switch (sortBy) {
        case 'price_asc':  return pa - pb;       // négatif → a avant b (croissant)
        case 'price_desc': return pb - pa;       // négatif → b avant a (décroissant)
        case 'dep_asc':    return da < db ? -1 : da > db ? 1 : 0; // tôt → tard
        case 'dep_desc':   return da > db ? -1 : da < db ? 1 : 0; // tard → tôt
        case 'duration':   return ta < tb ? -1 : ta > tb ? 1 : 0; // court → long
        default:           return 0; // 0 = ne change pas l'ordre relatif
      }
    });

    return list;
  }, [offers, filterAirline, filterStops, maxPrice, sortBy]);

  // Réinitialise tous les filtres en une seule action
  // React 18 batch ces 3 setState en un seul re-render
  const handleReset = () => {
    setFilterAirline('');
    setFilterStops('all');
    setMaxPrice('');
  };

  // ─────────────────────────────────────────────────────────────────
  //  COMPOSANT INTERNE PageHeader
  //  Partagé entre les deux modes (suggestions et résultats).
  //  Reçoit subtitle en prop pour personnaliser le sous-titre.
  // ─────────────────────────────────────────────────────────────────
  const PageHeader = ({ subtitle }) => (
    <div className="flights-page-header">
      <div className="container">

        {/* Fil d'Ariane : Recherche > Résultats */}
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

        {/* Titre + badge compteur */}
        <div className="flights-page-header__row">
          <div>
            <h1 className="flights-page-header__title">
              {/* Titre dynamique selon le contexte */}
              ✈️ {hasResults ? `${origin} → ${destination}` : 'Vols disponibles'}
            </h1>
            <p className="flights-page-header__subtitle">{subtitle}</p>
          </div>

          {/* Badge "12 vols trouvés" — visible seulement si des résultats existent */}
          {hasResults && (
            <div className="flights-count-badge">
              {filtered.length} vol{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  //  CAS 1 : Pas de résultats → affiche les suggestions
  //  Retour anticipé : tout le code après ce bloc ne s'exécute pas
  // ─────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────
  //  CAS 2 : Résultats de recherche → affiche filtres + liste
  // ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      {/* Header avec les paramètres de recherche en sous-titre */}
      <PageHeader subtitle={
        `${departureDate}`
        + `${returnDate ? ` · Retour ${returnDate}` : ''}`  // retour seulement en aller-retour
        + ` · ${adults + children} passager${adults + children > 1 ? 's' : ''}`
        + ` · ${CABIN_LABELS[cabinClass] || cabinClass}`     // label lisible ou valeur brute
      } />

      {/* Promotions actives (affichées seulement si au moins une promo) */}
      {promos.length > 0 && (
        <div className="container" style={{ paddingTop: 24 }}>
          <PromotionsSection promos={promos} titre="Promotions billeterie" showCards={false} />
        </div>
      )}

      <div className="container flights-results-layout" style={{ padding: '28px 0 60px' }}>

        {/* Grid 2 colonnes : 260px sidebar + 1fr résultats */}
        <div className="flights-results-grid">

          {/* ── SIDEBAR FILTRES ─────────────────────────────── */}
          {/* position: sticky — reste visible lors du scroll (défini dans CSS) */}
          <aside className="flights-sidebar">

            <h3 className="flights-sidebar__title">
              <i className="fas fa-sliders-h" style={{ color: 'var(--secondary)', marginRight: 8 }} />
              Filtres
            </h3>

            {/* Filtre par nombre d'escales */}
            <div style={{ marginBottom: 20 }}>
              <p className="flights-sidebar__section-label">Escales</p>
              {[
                { value: 'all',     label: 'Tous les vols' },
                { value: 'direct',  label: 'Direct seulement' },
                { value: 'oneplus', label: '1 escale ou plus' },
              ].map(opt => (
                // label cliquable : cliquer sur le texte active le radio
                <label key={opt.value} className="flights-filter-label">
                  <input
                    type="radio"
                    name="stops"
                    value={opt.value}
                    checked={filterStops === opt.value} // controlled component
                    onChange={() => setFilterStops(opt.value)}
                    style={{ accentColor: 'var(--secondary)' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Séparateur */}
            <div className="flights-sidebar__divider" />

            {/* Filtre par prix maximum */}
            <div style={{ marginBottom: 20 }}>
              <p className="flights-sidebar__section-label">Prix max ({currency})</p>
              <input
                type="number"
                min={minPrice}
                max={maxPriceAll}
                placeholder={`Max : ${Math.round(maxPriceAll)}`}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                // e.target.value est toujours une string même pour type="number"
                className="flights-price-input"
              />
              {/* Affichage min/max sous l'input pour guider l'utilisateur */}
              <div className="flights-price-range">
                <span>Min : {Math.round(minPrice)}</span>
                <span>Max : {Math.round(maxPriceAll)}</span>
              </div>
            </div>

            {/* Filtre par compagnie — affiché seulement si plusieurs compagnies */}
            {airlines.length > 1 && (
              <>
                <div className="flights-sidebar__divider" />
                <div style={{ marginBottom: 20 }}>
                  <p className="flights-sidebar__section-label">Compagnie</p>

                  {/* Option "Toutes" */}
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

                  {/* Une option par compagnie dédupliquée */}
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

            {/* Bouton reset — remet tous les filtres à leurs valeurs initiales */}
            <button onClick={handleReset} className="flights-reset-btn">
              <i className="fas fa-undo" style={{ marginRight: 6 }} />
              Réinitialiser
            </button>
          </aside>

          {/* ── ZONE DES RÉSULTATS ──────────────────────────── */}
          <div>

            {/* Barre de tri : compteur à gauche, select à droite */}
            <div className="flights-sort-bar">
              <p className="flights-sort-bar__count">
                <strong style={{ color: 'var(--gray-700)' }}>{filtered.length}</strong>
                {' '}vol{filtered.length > 1 ? 's' : ''} correspondant{filtered.length > 1 ? 's' : ''}
              </p>

              <div className="flights-sort-bar__controls">
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Trier :</span>
                {/* Select controlled : value={sortBy} + onChange → mise à jour état */}
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

            {/* État vide : aucun vol ne correspond aux filtres */}
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
              /* Liste des cartes de vols filtrées et triées */
              <div className="flights-cards-list">
                {filtered.map(offer => (
                  <FlightCard
                    key={offer.id}   // key = ID Duffel unique → React optimise le re-render
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