import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/omrastyle.css';

import VoyageSearchBar  from '../../components/VoyageSearchBar';
import VoyageCard       from '../../components/VoyageCard';
import Navbar           from '../../components/Navbar';
import Footer           from '../../components/Footer';
import SortFilter       from '../../components/SortFilter';
import AdvancedFilters  from '../../components/AdvancedFilters';
import { FILTERS }      from '../../data/VoyagesOrganiseData'; // keep for filter buttons

const API = 'http://localhost:5000/api/voyages-organises?public=true';

// Normalize DB row → VoyageCard shape
const normalize = (v) => ({
  id:          v.id,
  titre:       v.title,
  subtitle:    v.subtitle,
  description: v.description,
  image:       v.image_url,
  prix:        Number(v.price),
  oldPrix:     v.old_price ? Number(v.old_price) : null,
  duree:       `${v.duration} jours`,
  depart:      v.departure || '—',
  places:      v.available_spots ?? v.spots,
  rating:      Number(v.rating)  || 5,
  avis:        Number(v.reviews) || 0,
  badge:       v.badge,
  pays:        v.pays,
  destination: v.destination,
  continent:   v.continent,
  saison:      v.saison,
  budget:      v.budget,
  categorie:   v.categorie,
  programme:   v.programme  || [],
  inclus:      v.inclus     || [],
  nonInclus:   v.non_inclus || [],
  reservation_count: v.reservation_count || 0,
  available_spots:   v.available_spots,
});

const VoyagesOrganise = () => {
  const navigate = useNavigate();

  const [voyages,  setVoyages]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [search,        setSearch]        = useState({ destination: '', date: '', personnes: '2' });
  const [activeFilter,  setFilter]        = useState('Tous');
  const [sortBy,        setSortBy]        = useState('populaire');
  const [showFilters,   setShowFilters]   = useState(false);
  const [continent,     setContinent]     = useState('');
  const [saison,        setSaison]        = useState('');
  const [budget,        setBudget]        = useState('');
  const [visibleCount,  setVisibleCount]  = useState(6);

  const activeFilterCount = [continent, budget, saison].filter(Boolean).length;

  // Fetch from backend
  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        setLoading(true);
        const r = await fetch(API);
        const j = await r.json();
        setVoyages((j.data || []).map(normalize));
      } catch (err) {
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

  const displayed = useMemo(() => {
    let filtered = voyages.filter((v) => {
      if (search.destination && !v.pays?.toLowerCase().includes(search.destination.toLowerCase())
          && !v.destination?.toLowerCase().includes(search.destination.toLowerCase())) return false;
      if (activeFilter !== 'Tous' && v.categorie && v.categorie !== activeFilter) return false;
      if (continent && v.continent !== continent) return false;
      if (saison && v.saison !== saison && v.saison !== 'toute-annee') return false;
      if (budget && v.budget !== budget) return false;
      return true;
    });

    switch (sortBy) {
      case 'prix-asc':   filtered.sort((a, b) => a.prix - b.prix); break;
      case 'prix-desc':  filtered.sort((a, b) => b.prix - a.prix); break;
      case 'duree-asc':  filtered.sort((a, b) => parseInt(a.duree) - parseInt(b.duree)); break;
      case 'duree-desc': filtered.sort((a, b) => parseInt(b.duree) - parseInt(a.duree)); break;
      case 'rating':     filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default:           filtered.sort((a, b) => (b.avis || 0) - (a.avis || 0)); break;
    }
    return filtered;
  }, [voyages, search, activeFilter, continent, saison, budget, sortBy]);

  const paginatedVoyages = displayed.slice(0, visibleCount);
  const hasMore = visibleCount < displayed.length;

  const handleDetails  = (voyage) => navigate(`/VoyagesOrganise/Detail/${voyage.id}`,   { state: { voyage } });
  const handleReserver = (voyage) => navigate(`/VoyagesOrganise/Reserver/${voyage.id}`, { state: { voyage } });

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="omra-hero">
        <div className="omra-hero__bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80')" }} />
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />
        <div className="omra-hero__content">
          <span className="omra-hero__tag">✈️ Agence de voyages organisés</span>
          <h1 className="omra-hero__title">Découvrez le monde,<br /><span>sans contraintes</span></h1>
          <p className="omra-hero__subtitle">Des séjours clé en main conçus par nos experts pour vous offrir l'expérience parfaite.</p>
          <div className="omra-hero__search-wrapper">
            <VoyageSearchBar onSearch={setSearch} />
          </div>
        </div>
      </section>

      {/* Section principale */}
      <section className="omra-section omra-section--gray">
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Nos voyages</span>
            <h2 className="omra-section__title">Explorez nos séjours organisés</h2>
            <p className="omra-section__desc">Chaque voyage est soigneusement préparé pour vous garantir confort, découverte et sérénité.</p>
          </div>

          {/* Filtres simples */}
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

          {/* Filtres avancés + tri */}
          <div className="vsm-filters-section" style={{ margin: '0 0 30px 0', background: 'transparent', padding: 0 }}>
            <div className="vsm-filters-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <button className={`vsm-filters-toggle ${showFilters ? 'open' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                </svg>
                Filtres avancés
                {activeFilterCount > 0 && <span className="vsm-filter-badge">{activeFilterCount}</span>}
              </button>
              <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            <AdvancedFilters
              showFilters={showFilters} continent={continent} setContinent={setContinent}
              saison={saison} setSaison={setSaison} budget={budget} setBudget={setBudget}
              activeFilterCount={activeFilterCount} clearFilters={clearFilters} setVisibleCount={setVisibleCount}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: '#0F4C5C', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement des voyages...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e92f64' }}>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && (
            <>
              <div className="omra-cards-grid">
                {paginatedVoyages.map((v) => (
                  <VoyageCard key={v.id} voyage={v} onDetails={handleDetails} onReserver={handleReserver} />
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button className="omra-filter-btn"
                    style={{ padding: '12px 24px', background: 'var(--primary-color)', color: 'white', border: 'none' }}
                    onClick={() => setVisibleCount(p => p + 6)}>
                    Voir plus de voyages ({displayed.length - visibleCount} restants)
                  </button>
                </div>
              )}

              {displayed.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                    Aucun voyage ne correspond à vos critères de recherche.
                  </p>
                  <button className="omra-filter-btn" style={{ marginTop: '15px' }} onClick={clearFilters}>
                    Réinitialiser les filtres
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

export default VoyagesOrganise;