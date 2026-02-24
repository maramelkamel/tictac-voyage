import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/omrastyle.css';

import VoyageSearchBar from '../../components/VoyageSearchBar';
import VoyageCard from '../../components/VoyageCard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SortFilter from '../../components/SortFilter'; // NOUVEAU
import AdvancedFilters from '../../components/AdvancedFilters'; // NOUVEAU
import { ALL_VOYAGES, FILTERS } from '../../data/VoyagesOrganiseData';

const VoyagesOrganise = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ destination: '', date: '', personnes: '2' });
  const [activeFilter, setFilter] = useState('Tous');

  // ════════════════════════════════════════════════
  // NOUVEAUX ÉTATS POUR LES FILTRES ET LE TRI
  // ════════════════════════════════════════════════
  const [sortBy, setSortBy] = useState('populaire');
  const [showFilters, setShowFilters] = useState(false);
  const [continent, setContinent] = useState('');
  const [saison, setSaison] = useState('');
  const [budget, setBudget] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const activeFilterCount = [continent, budget, saison].filter(Boolean).length;

  const clearFilters = () => {
    setContinent('');
    setSaison('');
    setBudget('');
    setSortBy('populaire');
    setVisibleCount(6);
  };
  // ════════════════════════════════════════════════

  // Mise à jour de la logique pour inclure le tri et les filtres avancés
  const displayed = useMemo(() => {
    let filtered = ALL_VOYAGES.filter((v) => {
      // 1. Filtre par recherche (barre de recherche)
      if (search.destination && !v.pays.toLowerCase().includes(search.destination.toLowerCase())) return false;
      
      // 2. Filtre par catégorie (boutons simples)
      if (activeFilter !== 'Tous' && v.categorie && v.categorie !== activeFilter) return false;

      // 3. Filtres avancés
      if (continent && v.continent !== continent) return false;
      if (saison && v.saison !== saison && v.saison !== 'toute-annee') return false;
      if (budget && v.budget !== budget) return false;

      return true;
    });

    // 4. Tri
    switch (sortBy) {
      case 'prix-asc':
        filtered.sort((a, b) => a.prix - b.prix);
        break;
      case 'prix-desc':
        filtered.sort((a, b) => b.prix - a.prix);
        break;
      case 'duree-asc':
        filtered.sort((a, b) => parseInt(a.duree || 0) - parseInt(b.duree || 0));
        break;
      case 'duree-desc':
        filtered.sort((a, b) => parseInt(b.duree || 0) - parseInt(a.duree || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // 'populaire'
        filtered.sort((a, b) => (b.avis || 0) - (a.avis || 0));
        break;
    }

    return filtered;
  }, [search, activeFilter, continent, saison, budget, sortBy]);

  // Gestion de la pagination (Voir plus)
  const paginatedVoyages = displayed.slice(0, visibleCount);
  const hasMore = visibleCount < displayed.length;

  const handleDetails = (voyage) => navigate(`/VoyagesOrganise/Detail/${voyage.id}`, { state: { voyage } });
  const handleReserver = (voyage) => navigate(`/VoyagesOrganise/Reserver/${voyage.id}`, { state: { voyage } });

  return (
    <div>
      <Navbar />

      {/* ── Hero ── */}
      <section className="omra-hero">
        <div
          className="omra-hero__bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80')" }}
        />
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />

        <div className="omra-hero__content">
          <span className="omra-hero__tag">✈️ Agence de voyages organisés</span>
          <h1 className="omra-hero__title">
            Découvrez le monde,<br />
            <span>sans contraintes</span>
          </h1>
          <p className="omra-hero__subtitle">
            Des séjours clé en main conçus par nos experts pour vous offrir l'expérience parfaite.
          </p>

          <div className="omra-hero__search-wrapper">
            <VoyageSearchBar onSearch={setSearch} />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      

      {/* ── Voyages section ── */}
      <section className="omra-section omra-section--gray">
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Nos voyages</span>
            <h2 className="omra-section__title">Explorez nos séjours organisés</h2>
            <p className="omra-section__desc">
              Chaque voyage est soigneusement préparé pour vous garantir confort, découverte et sérénité.
            </p>
          </div>

          {/* Existing Simple Filters */}
          <div className="omra-filters-bar">
            <div className="omra-filters">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`omra-filter-btn ${activeFilter === f ? 'omra-filter-btn--active' : ''}`}
                  onClick={() => {
                    setFilter(f);
                    setVisibleCount(6); // Reset pagination on filter change
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="omra-filters-count">
              <strong>{displayed.length}</strong> voyages disponibles
            </p>
          </div>

          {/* ═══════════ NOUVEAUX FILTRES AVANCÉS & TRI ═══════════ */}
          <div className="vsm-filters-section" style={{ margin: '0 0 30px 0', background: 'transparent', padding: 0 }}>
            <div className="vsm-filters-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <button
                className={`vsm-filters-toggle ${showFilters ? 'open' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                </svg>
                Filtres avancés
                {activeFilterCount > 0 && (
                  <span className="vsm-filter-badge">{activeFilterCount}</span>
                )}
              </button>

              <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            <AdvancedFilters
              showFilters={showFilters}
              continent={continent}
              setContinent={setContinent}
              saison={saison}
              setSaison={setSaison}
              budget={budget}
              setBudget={setBudget}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              setVisibleCount={setVisibleCount}
            />
          </div>
          {/* ══════════════════════════════════════════════════════ */}

          {/* Grid */}
          <div className="omra-cards-grid">
            {paginatedVoyages.map((v) => (
              <VoyageCard
                key={v.id}
                voyage={v}
                onDetails={handleDetails}
                onReserver={handleReserver}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button
                className="omra-filter-btn"
                style={{ padding: '12px 24px', background: 'var(--primary-color)', color: 'white', border: 'none' }}
                onClick={() => setVisibleCount((p) => p + 6)}
              >
                Voir plus de voyages ({displayed.length - visibleCount} restants)
              </button>
            </div>
          )}

          {/* Empty State */}
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VoyagesOrganise;