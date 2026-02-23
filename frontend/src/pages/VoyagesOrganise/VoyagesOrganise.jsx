import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/omrastyle.css';

import VoyageSearchBar from '../../components/VoyageSearchBar';
import VoyageCard      from '../../components/VoyageCard';
import Navbar          from '../../components/Navbar';
import Footer          from '../../components/Footer';
import { ALL_VOYAGES, FILTERS } from '../../data/VoyagesOrganiseData';


const VoyagesOrganise = () => {
  const navigate = useNavigate();
  const [search, setSearch]       = useState({ destination: '', date: '', personnes: '2' });
  const [activeFilter, setFilter] = useState('Tous');

  const displayed = useMemo(() => {
    return ALL_VOYAGES.filter(v => {
      if (search.destination && !v.pays.toLowerCase().includes(search.destination)) return false;
      return true;
    });
  }, [search]);

  const handleDetails  = (voyage) => navigate(`/VoyagesOrganise/Detail/${voyage.id}`,  { state: { voyage } });
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
          <span className="omra-hero__tag">
            ✈️ Agence de voyages organisés
          </span>
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
      <div className="omra-stats">
        <div className="container">
          <div className="omra-stats__grid">
            {[
              { icon: '✈️', value: '50+',   label: 'Destinations' },
              { icon: '👥', value: '12 000+', label: 'Voyageurs satisfaits' },
              { icon: '⭐', value: '4.9/5',  label: 'Note moyenne' },
              { icon: '🏆', value: '15 ans', label: "D'expertise" },
            ].map((s, i) => (
              <div className="omra-stats__item" key={i}>
                <div className="omra-stats__icon">{s.icon}</div>
                <div>
                  <div className="omra-stats__value">{s.value}</div>
                  <div className="omra-stats__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

          {/* Filters */}
          <div className="omra-filters-bar">
            <div className="omra-filters">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`omra-filter-btn ${activeFilter === f ? 'omra-filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="omra-filters-count">
              <strong>{displayed.length}</strong> voyages disponibles
            </p>
          </div>

          {/* Grid */}
          <div className="omra-cards-grid">
            {displayed.map(v => (
              <VoyageCard
                key={v.id}
                voyage={v}
                onDetails={handleDetails}
                onReserver={handleReserver}
              />
            ))}
          </div>

          {displayed.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                Aucun voyage ne correspond à votre recherche.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VoyagesOrganise;