// src/pages/voyagenonorg/VoyageSurMesure.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import VoyageCard from '../../components/VoyageCard';
import {
  voyagesData,
  themeOptions,
  continentOptions,
  budgetOptions,
  saisonOptions,
  sortOptions,
  howItWorksSteps,
  modalHighlights,
} from '../../data/voyageSurMesureData';
import '../../styles/VoyageSurMesure.css';

/* ═══════════════════════════════════════════
   RESERVATION FORM (sub-component)
   ═══════════════════════════════════════════ */
const ReservationForm = ({ voyage, onClose }) => {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    tel: '',
    date: '',
    voyageurs: 1,
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="vsm-reservation-success">
        <div className="vsm-reservation-success-icon">✅</div>
        <h3>Demande envoyée !</h3>
        <p>
          Merci pour votre intérêt pour <strong>{voyage.titre}</strong>. Notre
          équipe vous contactera dans les 24h pour finaliser votre réservation.
        </p>
        <button className="vsm-reservation-close-btn" onClick={onClose}>
          Fermer
        </button>
      </div>
    );
  }

  return (
    <form className="vsm-reservation-form" onSubmit={handleSubmit}>
      <h3 className="vsm-reservation-title">
        Réserver : <span>{voyage.titre}</span>
      </h3>

      <div className="vsm-reservation-price-bar">
        <span>💰 À partir de</span>
        <strong>{voyage.prix.toLocaleString('fr-FR')} TND</strong>
        <span>/ personne</span>
      </div>

      <div className="vsm-res-field">
        <label>Nom complet *</label>
        <input
          type="text"
          name="nom"
          required
          placeholder="Votre nom et prénom"
          value={form.nom}
          onChange={handleChange}
        />
      </div>

      <div className="vsm-res-row">
        <div className="vsm-res-field">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            required
            placeholder="votre@email.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="vsm-res-field">
          <label>Téléphone *</label>
          <input
            type="tel"
            name="tel"
            required
            placeholder="+216 XX XXX XXX"
            value={form.tel}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="vsm-res-row">
        <div className="vsm-res-field">
          <label>Date souhaitée *</label>
          <input
            type="date"
            name="date"
            required
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="vsm-res-field">
          <label>Nombre de voyageurs</label>
          <input
            type="number"
            name="voyageurs"
            min="1"
            max={voyage.places}
            value={form.voyageurs}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="vsm-res-field">
        <label>Message / Demandes spéciales</label>
        <textarea
          name="message"
          rows="3"
          placeholder="Vos remarques, préférences, demandes particulières..."
          value={form.message}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="vsm-res-submit" disabled={sending}>
        {sending ? (
          <>
            <span className="vsm-spinner" />
            Envoi en cours...
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            Confirmer la réservation
          </>
        )}
      </button>
    </form>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */
const VoyageSurMesure = () => {
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('');
  const [continent, setContinent] = useState('');
  const [budget, setBudget] = useState('');
  const [saison, setSaison] = useState('');
  const [sortBy, setSortBy] = useState('populaire');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const resultsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ── Filter + Sort logic ── */
  const filteredVoyages = useMemo(() => {
    let result = voyagesData.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        v.titre.toLowerCase().includes(q) ||
        v.destination.toLowerCase().includes(q) ||
        v.pays.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q);
      const matchTheme = !theme || v.theme === theme;
      const matchContinent = !continent || v.continent === continent;
      const matchBudget = !budget || v.budget === budget;
      const matchSaison =
        !saison || v.saison === saison || v.saison === 'toute-annee';
      return (
        matchSearch && matchTheme && matchContinent && matchBudget && matchSaison
      );
    });

    switch (sortBy) {
      case 'prix-asc':
        result.sort((a, b) => a.prix - b.prix);
        break;
      case 'prix-desc':
        result.sort((a, b) => b.prix - a.prix);
        break;
      case 'duree-asc':
        result.sort((a, b) => parseInt(a.duree) - parseInt(b.duree));
        break;
      case 'duree-desc':
        result.sort((a, b) => parseInt(b.duree) - parseInt(a.duree));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.avis - a.avis);
    }
    return result;
  }, [search, theme, continent, budget, saison, sortBy]);

  const displayedVoyages = filteredVoyages.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVoyages.length;
  const activeFilterCount = [theme, continent, budget, saison].filter(
    Boolean
  ).length;

  /* ── Helpers ── */
  const clearFilters = () => {
    setSearch('');
    setTheme('');
    setContinent('');
    setBudget('');
    setSaison('');
    setSortBy('populaire');
    setVisibleCount(6);
  };

  const handleDetails = (voyage) => {
    setSelectedVoyage(voyage);
    setShowModal(true);
    setShowReservation(false);
    document.body.style.overflow = 'hidden';
  };

  const handleReserver = (voyage) => {
    setSelectedVoyage(voyage);
    setShowModal(true);
    setShowReservation(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVoyage(null);
    setShowReservation(false);
    document.body.style.overflow = '';
  };

  /* ═══════════ RENDER ═══════════ */
  return (
    <>
      <Navbar />

      <div className="vsm-page">
        {/* ═══════════ HERO ═══════════ */}
        <section className="vsm-hero">
          <div className="vsm-hero-overlay" />
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80"
            alt="Voyage sur mesure"
            className="vsm-hero-img"
          />
          <div className="vsm-hero-content">
            <div className="vsm-hero-badge">
              <span className="vsm-hero-badge-dot" />
              Voyages personnalisés
            </div>
            <h1 className="vsm-hero-title">
              Votre Voyage <span>Sur Mesure</span>
            </h1>
            <p className="vsm-hero-subtitle">
              Explorez nos destinations d'exception et composez le voyage qui
              vous ressemble. Chaque itinéraire est unique, chaque expérience
              est inoubliable.
            </p>

            {/* Search Bar */}
            <div className="vsm-search-bar">
              <div className="vsm-search-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                className="vsm-search-input"
                placeholder="Rechercher une destination, un pays, un voyage..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(6);
                }}
              />
              {search && (
                <button
                  className="vsm-search-clear"
                  onClick={() => setSearch('')}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════ FILTERS ═══════════ */}
        <section className="vsm-filters-section">
          <div className="vsm-container">
            {/* Quick theme pills */}
            <div className="vsm-quick-filters">
              {themeOptions.map((t) => (
                <button
                  key={t.value}
                  className={`vsm-quick-filter ${
                    theme === t.value ? 'active' : ''
                  }`}
                  onClick={() => {
                    setTheme(t.value);
                    setVisibleCount(6);
                  }}
                >
                  <span className="vsm-quick-filter-icon">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="vsm-filters-toolbar">
              <button
                className={`vsm-filters-toggle ${showFilters ? 'open' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                </svg>
                Filtres avancés
                {activeFilterCount > 0 && (
                  <span className="vsm-filter-badge">{activeFilterCount}</span>
                )}
                <svg
                  className="vsm-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <div className="vsm-sort-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M3 12h12M3 18h6" />
                </svg>
                <select
                  className="vsm-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced panel */}
            {showFilters && (
              <div className="vsm-filters-panel">
                <div className="vsm-filters-grid">
                  <div className="vsm-filter-group">
                    <label className="vsm-filter-label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
                      </svg>
                      Destination
                    </label>
                    <select
                      className="vsm-filter-select"
                      value={continent}
                      onChange={(e) => {
                        setContinent(e.target.value);
                        setVisibleCount(6);
                      }}
                    >
                      {continentOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.icon} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="vsm-filter-group">
                    <label className="vsm-filter-label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        <circle cx="12" cy="12" r="5" />
                      </svg>
                      Saison
                    </label>
                    <select
                      className="vsm-filter-select"
                      value={saison}
                      onChange={(e) => {
                        setSaison(e.target.value);
                        setVisibleCount(6);
                      }}
                    >
                      {saisonOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="vsm-filter-group">
                    <label className="vsm-filter-label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="3" width="20" height="18" rx="2" />
                        <path d="M2 9h20M9 21V9" />
                      </svg>
                      Budget
                    </label>
                    <select
                      className="vsm-filter-select"
                      value={budget}
                      onChange={(e) => {
                        setBudget(e.target.value);
                        setVisibleCount(6);
                      }}
                    >
                      {budgetOptions.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.icon} {b.label} {b.sub ? `(${b.sub})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button className="vsm-clear-filters" onClick={clearFilters}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════ RESULTS ═══════════ */}
        <section className="vsm-results" ref={resultsRef}>
          <div className="vsm-container">
            {/* Header */}
            <div className="vsm-results-header">
              <div className="vsm-results-count">
                <span className="vsm-results-number">
                  {filteredVoyages.length}
                </span>
                <span>
                  {filteredVoyages.length > 1
                    ? 'voyages trouvés'
                    : 'voyage trouvé'}
                </span>
              </div>

              {(search || activeFilterCount > 0) && (
                <div className="vsm-active-tags">
                  {search && (
                    <span className="vsm-tag">
                      🔍 "{search}"
                      <button onClick={() => setSearch('')}>×</button>
                    </span>
                  )}
                  {theme && (
                    <span className="vsm-tag">
                      {themeOptions.find((t) => t.value === theme)?.icon}{' '}
                      {themeOptions.find((t) => t.value === theme)?.label}
                      <button onClick={() => setTheme('')}>×</button>
                    </span>
                  )}
                  {continent && (
                    <span className="vsm-tag">
                      {continentOptions.find((c) => c.value === continent)?.icon}{' '}
                      {continentOptions.find((c) => c.value === continent)?.label}
                      <button onClick={() => setContinent('')}>×</button>
                    </span>
                  )}
                  {budget && (
                    <span className="vsm-tag">
                      {budgetOptions.find((b) => b.value === budget)?.icon}{' '}
                      {budgetOptions.find((b) => b.value === budget)?.label}
                      <button onClick={() => setBudget('')}>×</button>
                    </span>
                  )}
                  {saison && (
                    <span className="vsm-tag">
                      📅{' '}
                      {saisonOptions.find((s) => s.value === saison)?.label}
                      <button onClick={() => setSaison('')}>×</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Grid */}
            {filteredVoyages.length > 0 ? (
              <>
                <div className="vsm-grid">
                  {displayedVoyages.map((voyage) => (
                    <VoyageCard
                      key={voyage.id}
                      voyage={voyage}
                      onDetails={handleDetails}
                      onReserver={handleReserver}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="vsm-load-more">
                    <button
                      className="vsm-load-more-btn"
                      onClick={() => setVisibleCount((p) => p + 6)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Voir plus de voyages
                      <span className="vsm-load-more-count">
                        ({filteredVoyages.length - visibleCount} restants)
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="vsm-empty">
                <div className="vsm-empty-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35M8 11h6" />
                  </svg>
                </div>
                <h3>Aucun voyage trouvé</h3>
                <p>
                  Essayez de modifier vos critères de recherche ou explorez
                  toutes nos destinations.
                </p>
                <button className="vsm-empty-btn" onClick={clearFilters}>
                  Voir tous les voyages
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="vsm-how">
          <div className="vsm-container">
            <div className="vsm-how-header">
              <h2 className="vsm-how-title">
                Comment ça <span>fonctionne</span> ?
              </h2>
              <p className="vsm-how-subtitle">
                En 4 étapes simples, créez le voyage de vos rêves
              </p>
            </div>
            <div className="vsm-how-grid">
              {howItWorksSteps.map((item) => (
                <div className="vsm-how-card" key={item.step}>
                  <div className="vsm-how-step">{item.step}</div>
                  <div className="vsm-how-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ CTA ═══════════ */}
        <section className="vsm-cta">
          <div className="vsm-container">
            <div className="vsm-cta-card">
              <div className="vsm-cta-content">
                <h2>Vous ne trouvez pas votre bonheur ?</h2>
                <p>
                  Décrivez-nous votre voyage idéal et notre équipe vous créera
                  un itinéraire 100% personnalisé adapté à vos envies et votre
                  budget.
                </p>
                <a href="/contact" className="vsm-cta-btn">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Demander un devis gratuit
                </a>
              </div>
              <div className="vsm-cta-visual">
                <div className="vsm-cta-circle">
                  <span>🌍</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════ MODAL ═══════════ */}
      {showModal && selectedVoyage && (
        <div className="vsm-modal-overlay" onClick={closeModal}>
          <div className="vsm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vsm-modal-close" onClick={closeModal}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="vsm-modal-img">
              <img src={selectedVoyage.image} alt={selectedVoyage.titre} />
              <div className="vsm-modal-img-overlay" />
              <div className="vsm-modal-img-info">
                <h2>{selectedVoyage.titre}</h2>
                <p>
                  {selectedVoyage.pays} · {selectedVoyage.destination}
                </p>
              </div>
            </div>

            <div className="vsm-modal-body">
              {!showReservation ? (
                <>
                  <div className="vsm-modal-stats">
                    <div className="vsm-modal-stat">
                      <span className="vsm-modal-stat-icon">🕐</span>
                      <div>
                        <strong>{selectedVoyage.duree}</strong>
                        <span>Durée</span>
                      </div>
                    </div>
                    <div className="vsm-modal-stat">
                      <span className="vsm-modal-stat-icon">⭐</span>
                      <div>
                        <strong>{selectedVoyage.rating}/5</strong>
                        <span>{selectedVoyage.avis} avis</span>
                      </div>
                    </div>
                    <div className="vsm-modal-stat">
                      <span className="vsm-modal-stat-icon">✈️</span>
                      <div>
                        <strong>{selectedVoyage.depart}</strong>
                        <span>Départ</span>
                      </div>
                    </div>
                    <div className="vsm-modal-stat">
                      <span className="vsm-modal-stat-icon">👥</span>
                      <div>
                        <strong>{selectedVoyage.places} places</strong>
                        <span>Disponibles</span>
                      </div>
                    </div>
                  </div>

                  <div className="vsm-modal-section">
                    <h3>Description</h3>
                    <p>{selectedVoyage.description}</p>
                  </div>

                  <div className="vsm-modal-section">
                    <h3>Points forts</h3>
                    <ul className="vsm-modal-highlights">
                      {modalHighlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="vsm-modal-footer">
                    <div className="vsm-modal-price">
                      <span>À partir de</span>
                      <strong>
                        {selectedVoyage.prix.toLocaleString('fr-FR')} TND
                      </strong>
                      <span>/ personne</span>
                    </div>
                    <button
                      className="vsm-modal-reserve-btn"
                      onClick={() => setShowReservation(true)}
                    >
                      Réserver maintenant
                    </button>
                  </div>
                </>
              ) : (
                <ReservationForm
                  voyage={selectedVoyage}
                  onClose={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Chatbot />
    </>
  );
};

export default VoyageSurMesure;