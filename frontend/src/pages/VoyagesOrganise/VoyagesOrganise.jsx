// src/pages/VoyagesOrganise/VoyagesOrganise.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate }       from 'react-router-dom';
import '../../styles/omrastyle.css';
import { usePromotions }     from '../../hooks/usePromotions';
import PromotionsSection     from '../admin/promotions/PromotionsSection';
import VoyageSearchBar       from '../../components/VoyageSearchBar';
import VoyageCard            from '../../components/VoyageCard';
import Navbar                from '../../components/Navbar';
import Footer                from '../../components/Footer';
import SortFilter            from '../../components/SortFilter';
import AdvancedFilters       from '../../components/AdvancedFilters';
import { FILTERS }           from '../../data/VoyagesOrganiseData';

const API = 'http://localhost:5000/api/voyages-organises?public=true';

// ── DB row → VoyageCard shape ─────────────────────────────────────
const normalize = (v) => ({
  id:             v.id,
  titre:          v.title,
  subtitle:       v.subtitle,
  description:    v.description,
  image:          v.image_url,
  prix:           Number(v.price),
  oldPrix:        v.old_price ? Number(v.old_price) : null,
  duree:          `${v.duration} jours`,
  durationDays:   Number(v.duration),           // ← raw number for filtering
  depart:         v.departure || '—',
  departureDate:  v.departure_date || null,      // ← ISO date column if it exists
  places:         Number(v.available_spots ?? v.spots ?? 0),
  rating:         Number(v.rating)  || 5,
  avis:           Number(v.reviews) || 0,
  badge:          v.badge,
  pays:           v.pays,
  destination:    v.destination,
  continent:      v.continent,
  saison:         v.saison,
  budget:         v.budget,
  categorie:      v.categorie,
  programme:      v.programme  || [],
  inclus:         v.inclus     || [],
  nonInclus:      v.non_inclus || [],
  reservation_count: v.reservation_count || 0,
  available_spots:   Number(v.available_spots ?? v.spots ?? 0),
});

const VoyagesOrganise = () => {
  const navigate = useNavigate();

  const [voyages,  setVoyages]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // ── Search bar state (4 fields) ──────────────────────────────────
  const [search, setSearch] = useState({
    destination: '',
    dateDepart:  '',
    personnes:   '',
    duree:       '',
  });

  // ── Filter / sort state ──────────────────────────────────────────
  const [activeFilter,  setFilter]       = useState('Tous');
  const [sortBy,        setSortBy]        = useState('populaire');
  const [showFilters,   setShowFilters]   = useState(false);
  const [continent,     setContinent]     = useState('');
  const [saison,        setSaison]        = useState('');
  const [budget,        setBudget]        = useState('');
  const [visibleCount,  setVisibleCount]  = useState(6);

  const { promos } = usePromotions('categorie', 'voyages_internationaux');
  const activeFilterCount = [continent, budget, saison].filter(Boolean).length;

  // ── Fetch voyages ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        setLoading(true);
        const r = await fetch(API);
        const j = await r.json();
        setVoyages((j.data || []).map(normalize));
      } catch {
        setError('Impossible de charger les voyages. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    fetchVoyages();
  }, []);

  const clearFilters = () => {
    setContinent(''); setSaison(''); setBudget('');
    setSortBy('populaire'); setVisibleCount(6);
  };

  const clearSearch = () => {
    setSearch({ destination:'', dateDepart:'', personnes:'', duree:'' });
    setVisibleCount(6);
  };

  // ── Main filter + sort pipeline ───────────────────────────────────
  const displayed = useMemo(() => {
    let filtered = voyages.filter((v) => {

      // 1. DESTINATION — match pays or destination text
      if (search.destination) {
        const q = search.destination.toLowerCase();
        const okPays = v.pays?.toLowerCase().includes(q);
        const okDest = v.destination?.toLowerCase().includes(q);
        if (!okPays && !okDest) return false;
      }

      // 2. PERSONNES — need enough available spots
      if (search.personnes) {
        const needed = parseInt(search.personnes, 10);
        if (!isNaN(needed) && needed > 0 && v.places < needed) return false;
      }

      // 3. DURÉE — exact match in days
      if (search.duree) {
        const wantDays = parseInt(search.duree, 10);
        if (!isNaN(wantDays) && v.durationDays !== wantDays) return false;
      }

      // 4. À PARTIR DE — show voyages departing on or after the chosen date
      //    Uses departure_date column (ISO) if available; otherwise skips date filter
      if (search.dateDepart && v.departureDate) {
        const chosen  = new Date(search.dateDepart);
        const departs = new Date(v.departureDate);
        if (!isNaN(chosen.getTime()) && !isNaN(departs.getTime()) && departs < chosen) return false;
      }

      // 5. CATEGORY TAB
      if (activeFilter !== 'Tous' && v.categorie && v.categorie !== activeFilter) return false;

      // 6. ADVANCED FILTERS
      if (continent && v.continent !== continent) return false;
      if (saison && v.saison !== saison && v.saison !== 'toute-annee') return false;
      if (budget && v.budget !== budget) return false;

      return true;
    });

    switch (sortBy) {
      case 'prix-asc':   filtered.sort((a, b) => a.prix          - b.prix);          break;
      case 'prix-desc':  filtered.sort((a, b) => b.prix          - a.prix);          break;
      case 'duree-asc':  filtered.sort((a, b) => a.durationDays  - b.durationDays);  break;
      case 'duree-desc': filtered.sort((a, b) => b.durationDays  - a.durationDays);  break;
      case 'rating':     filtered.sort((a, b) => (b.rating||0)   - (a.rating||0));   break;
      default:           filtered.sort((a, b) => (b.avis||0)     - (a.avis||0));     break;
    }
    return filtered;
  }, [voyages, search, activeFilter, continent, saison, budget, sortBy]);

  const paginatedVoyages = displayed.slice(0, visibleCount);
  const hasMore          = visibleCount < displayed.length;

  // Active search count badge
  const activeSearchCount = [search.destination, search.dateDepart, search.personnes, search.duree].filter(Boolean).length;

  const handleDetails  = (voyage) => navigate(`/VoyagesOrganise/Detail/${voyage.id}`,   { state: { voyage } });
  const handleReserver = (voyage) => navigate(`/VoyagesOrganise/Reserver/${voyage.id}`, { state: { voyage } });

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="omra-hero">
        <div className="omra-hero__bg" style={{ backgroundImage:"url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80')" }} />
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />
        <div className="omra-hero__content">
          <span className="omra-hero__tag">✈️ Agence de voyages organisés</span>
          <h1 className="omra-hero__title">Découvrez le monde,<br /><span>sans contraintes</span></h1>
          <p className="omra-hero__subtitle">Des séjours clé en main conçus par nos experts pour vous offrir l'expérience parfaite.</p>
          <div className="omra-hero__search-wrapper">
            <VoyageSearchBar
              onSearch={(s) => { setSearch(s); setVisibleCount(6); }}
              initialValues={search}
            />
          </div>
        </div>
      </section>

      {/* Main section */}
      <section className="omra-section omra-section--gray">
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Nos voyages</span>
            <h2 className="omra-section__title">Explorez nos séjours organisés</h2>
            <p className="omra-section__desc">Chaque voyage est soigneusement préparé pour vous garantir confort, découverte et sérénité.</p>
          </div>

          <PromotionsSection promos={promos} />

          {/* Active search chips */}
          {activeSearchCount > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>Recherche active :</span>
              {search.destination && <Chip label={`📍 ${search.destination}`} onClear={() => setSearch(s=>({...s,destination:''}))}/>}
              {search.dateDepart  && <Chip label={`📅 À partir du ${new Date(search.dateDepart).toLocaleDateString('fr-FR')}`} onClear={() => setSearch(s=>({...s,dateDepart:''}))}/>}
              {search.personnes   && <Chip label={`👥 ${search.personnes} pers.`} onClear={() => setSearch(s=>({...s,personnes:''}))}/>}
              {search.duree       && <Chip label={`⏱ ${search.duree} jours`} onClear={() => setSearch(s=>({...s,duree:''}))}/>}
              <button onClick={clearSearch} style={{ fontSize:11, color:'#e92f64', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:'2px 6px' }}>
                Effacer tout ✕
              </button>
            </div>
          )}

          {/* Category filters */}
          <div className="omra-filters-bar">
            <div className="omra-filters">
              {FILTERS.map((f) => (
                <button key={f} className={`omra-filter-btn ${activeFilter === f ? 'omra-filter-btn--active' : ''}`}
                  onClick={() => { setFilter(f); setVisibleCount(6); }}>
                  {f}
                </button>
              ))}
            </div>
            <p className="omra-filters-count"><strong>{displayed.length}</strong> voyages disponibles</p>
          </div>

          {/* Advanced filters + sort */}
          <div className="vsm-filters-section" style={{ margin:'0 0 30px', background:'transparent', padding:0 }}>
            <div className="vsm-filters-toolbar" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15 }}>
              <button className={`vsm-filters-toggle ${showFilters ? 'open' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                style={{ display:'flex', alignItems:'center', gap:8 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:18, height:18 }}>
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
                </svg>
                Filtres avancés
                {activeFilterCount > 0 && <span className="vsm-filter-badge">{activeFilterCount}</span>}
              </button>
              <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            <AdvancedFilters
              showFilters={showFilters}
              continent={continent} setContinent={setContinent}
              saison={saison}      setSaison={setSaison}
              budget={budget}      setBudget={setBudget}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              setVisibleCount={setVisibleCount}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:'#0F4C5C', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 16px' }}/>
              <p style={{ color:'#94a3b8', fontSize:14 }}>Chargement des voyages...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'#e92f64' }}>
              <p style={{ fontSize:16, fontWeight:600 }}>{error}</p>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && (
            <>
              <div className="omra-cards-grid">
                {paginatedVoyages.map((v) => (
                  <VoyageCard key={v.id} voyage={v} onDetails={handleDetails} onReserver={handleReserver} />
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <button className="omra-filter-btn"
                    style={{ padding:'12px 24px', background:'var(--primary-color)', color:'white', border:'none' }}
                    onClick={() => setVisibleCount(p => p + 6)}>
                    Voir plus de voyages ({displayed.length - visibleCount} restants)
                  </button>
                </div>
              )}

              {displayed.length === 0 && !loading && (
                <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--gray-400)' }}>
                  <div style={{ fontSize:'3rem', marginBottom:16 }}>🔍</div>
                  <p style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--gray-600)', marginBottom:8 }}>
                    Aucun voyage ne correspond à vos critères.
                  </p>
                  {(activeSearchCount > 0 || activeFilterCount > 0) && (
                    <p style={{ fontSize:13, color:'#94a3b8', marginBottom:16 }}>
                      Essayez de modifier ou supprimer certains filtres.
                    </p>
                  )}
                  <button className="omra-filter-btn" style={{ marginTop:8 }}
                    onClick={() => { clearFilters(); clearSearch(); setFilter('Tous'); }}>
                    Réinitialiser tous les filtres
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Small chip component for active search display ────────────────
const Chip = ({ label, onClear }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, background:'#e0fbfc', color:'#0e7490', fontSize:12, fontWeight:600 }}>
    {label}
    <button onClick={onClear} style={{ background:'none', border:'none', cursor:'pointer', color:'#0e7490', fontSize:13, lineHeight:1, padding:0, fontWeight:700 }}>✕</button>
  </span>
);

export default VoyagesOrganise;