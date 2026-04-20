// src/pages/Circuits.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Circuits.css';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';

const API = 'http://localhost:5000/api/circuits?public=true';

const TAG_COLORS = {
  teal:   { bg: 'rgba(30,202,211,.13)',  color: '#0e7490' },
  blue:   { bg: 'rgba(59,130,246,.12)',  color: '#1d4ed8' },
  green:  { bg: 'rgba(16,185,129,.12)',  color: '#065f46' },
  orange: { bg: 'rgba(249,115,22,.12)',  color: '#c2410c' },
  accent: { bg: 'rgba(233,47,100,.12)',  color: '#E92F64' },
  violet: { bg: 'rgba(139,92,246,.12)',  color: '#5b21b6' },
};

const DIFF_META = {
  'Facile':   { color: '#10b981', bg: '#d1fae5' },
  'Modéré':   { color: '#f97316', bg: '#fff7ed' },
  'Aventure': { color: '#E92F64', bg: 'rgba(233,47,100,.1)' },
};

const BUDGET_OPTIONS = [
  { label: 'Tous les budgets', min: 0,    max: Infinity },
  { label: 'Moins de 500 DT', min: 0,    max: 500 },
  { label: '500 – 1 000 DT',  min: 500,  max: 1000 },
  { label: '1 000 – 2 000 DT',min: 1000, max: 2000 },
  { label: '2 000 – 3 500 DT',min: 2000, max: 3500 },
  { label: '3 500 DT et +',   min: 3500, max: Infinity },
];

const MONTHS = [
  'Mai 2025','Juin 2025','Juillet 2025','Août 2025',
  'Septembre 2025','Octobre 2025','Novembre 2025','Décembre 2025',
  'Janvier 2026','Février 2026','Mars 2026','Avril 2026',
];

const PEOPLE_OPTIONS = [
  '1 personne','2 personnes','3 – 5 personnes',
  '6 – 10 personnes','10+ personnes',
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconClock  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconUsers  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IconStar   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconArrow  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconMap    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>;
const IconCheck  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const IconHeart  = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? '#E92F64' : 'none'} stroke={filled ? '#E92F64' : '#94a3b8'} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

// ─── Normalise DB row → card shape ────────────────────────────────────────────
const normalize = (c) => ({
  id:          c.id,
  title:       c.title,
  subtitle:    c.subtitle,
  duration:    `${c.duration} jours / ${c.nights || c.duration - 1} nuits`,
  days:        c.duration,
  price:       Number(c.price),
  oldPrice:    c.old_price ? Number(c.old_price) : null,
  difficulty:  c.difficulty || 'Facile',
  group:       c.group_size || '2 – 15 personnes',
  highlights:  c.highlights || [],
  description: c.description,
  image:       c.image_url,
  tag:         c.tag,
  tagColor:    c.tag_color || 'teal',
  badge:       c.badge,
  region:      c.region,
  departure:   c.departure,
  places:      c.available_spots ?? c.spots,
  rating:      Number(c.rating) || 5,
  avis:        Number(c.reviews) || 0,
  programme:   c.programme  || [],
  inclus:      c.inclus     || [],
  nonInclus:   c.non_inclus || [],
  reservation_count: c.reservation_count || 0,
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function Circuits() {
  const navigate = useNavigate();

  // Tab & data
  const [activeTab,   setActiveTab]   = useState('nord');
  const [hovered,     setHovered]     = useState(null);
  const [allCircuits, setAll]         = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Favourites (persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ci_favorites') || '[]')); }
    catch { return new Set(); }
  });

  // Search bar
  const [searchDate,   setSearchDate]   = useState('');
  const [searchPeople, setSearchPeople] = useState('');
  const [searchBudget, setSearchBudget] = useState('');

  const { promos } = usePromotions('categorie', 'circuits');

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(j => setAll((j.data || []).map(normalize)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('ci_favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const applyFilters = (list) => {
    let result = list.filter(c => c.region === activeTab);
    if (searchBudget) {
      const opt = BUDGET_OPTIONS.find(o => o.label === searchBudget);
      if (opt) result = result.filter(c => c.price >= opt.min && c.price <= opt.max);
    }
    return result;
  };

  const circuits = applyFilters(allCircuits);

  const nordMin = allCircuits.filter(c => c.region === 'nord').reduce((m, c) => Math.min(m, c.price), 9999);
  const sudMin  = allCircuits.filter(c => c.region === 'sud').reduce((m, c)  => Math.min(m, c.price), 9999);

  const handleDetails  = (c) => navigate(`/circuits/CircuitDetails/${c.id}`,  { state: { circuit: c } });
  const handleReserver = (c) => navigate(`/circuits/CircuitReserver/${c.id}`, { state: { circuit: c } });

  const handleSearch = () => {
    // filters are reactive — this just gives the user a click affordance.
    // Additional date / people filtering logic can be wired here when the
    // backend supports those query params.
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ci-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="ci-hero">
        <div className="ci-hero__bg" />
        <div className="ci-hero__overlay" />
        <div className="ci-hero__geo ci-hero__geo--1" />
        <div className="ci-hero__geo ci-hero__geo--2" />

        <div className="ci-hero__content">
          <span className="ci-hero__tag"><IconMap />Circuits touristiques — Tunisie</span>
          <h1 className="ci-hero__title">
            Explorez la Tunisie<br />
            <span className="ci-hero__title--accent">du Nord au Sud</span>
          </h1>
          <p className="ci-hero__sub">
            Des circuits soigneusement conçus pour vous faire découvrir les trésors du pays,
            entre mer, désert, culture et authenticité.
          </p>

          {/* ── SEARCH BAR ── */}
          <div className="ci-searchbar">
            {/* Date */}
            <div className="ci-searchbar__field">
              <span className="ci-searchbar__label">📅 À partir de</span>
              <select
                className="ci-searchbar__select"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
              >
                <option value="">Choisir une date</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="ci-searchbar__divider" />

            {/* Nb personnes */}
            <div className="ci-searchbar__field">
              <span className="ci-searchbar__label">👥 Voyageurs</span>
              <select
                className="ci-searchbar__select"
                value={searchPeople}
                onChange={e => setSearchPeople(e.target.value)}
              >
                <option value="">Nbre de personnes</option>
                {PEOPLE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="ci-searchbar__divider" />

            {/* Budget */}
            <div className="ci-searchbar__field">
              <span className="ci-searchbar__label">💰 Budget / pers.</span>
              <select
                className="ci-searchbar__select"
                value={searchBudget}
                onChange={e => setSearchBudget(e.target.value)}
              >
                {BUDGET_OPTIONS.map(o => (
                  <option key={o.label} value={o.label}>{o.label}</option>
                ))}
              </select>
            </div>

            <button className="ci-searchbar__btn" onClick={handleSearch}>
              <IconSearch />
              Chercher
            </button>
          </div>
        </div>
      </section>

      {/* ── PROMOTIONS ── */}
      {promos.length > 0 && (
        <section style={{ padding: '8px 0' }}>
          <div className="ci-container">
            <PromotionsSection promos={promos} />
          </div>
        </section>
      )}

      {/* ── SPLIT NORD / SUD  (overlapping hero bottom) ── */}
      <section className="ci-split ci-split--overlap">
        <div className="ci-container">
          <div className={`ci-split__inner ci-split__inner--${activeTab}`}>

            {/* Nord card */}
            <div
              className={`ci-split__card ci-split__card--nord${activeTab === 'nord' ? ' active' : ''}`}
              onClick={() => setActiveTab('nord')}
            >
              <div className="ci-split__card-bg ci-split__card-bg--nord" />
              <div className="ci-split__card-overlay" />
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">🏛️</div>
                <h2>Circuit Nord</h2>
                <p>Patrimoine, côtes sauvages, sites romains et forêts de pins du Tell.</p>
                <div className="ci-split__card-stats">
                  <span><strong>{allCircuits.filter(c => c.region === 'nord').length}</strong> circuits</span>
                  <span>dès <strong>{nordMin < 9999 ? `${nordMin} DT` : '—'}</strong></span>
                </div>
              </div>
              {activeTab === 'nord' && <div className="ci-split__card-active-bar" />}
            </div>

            {/* Divider */}
            <div className="ci-split__divider">
              <div className="ci-split__divider-line" />
              <div className="ci-split__divider-badge">🇹🇳</div>
              <div className="ci-split__divider-line" />
            </div>

            {/* Sud card */}
            <div
              className={`ci-split__card ci-split__card--sud${activeTab === 'sud' ? ' active' : ''}`}
              onClick={() => setActiveTab('sud')}
            >
              <div className="ci-split__card-bg ci-split__card-bg--sud" />
              <div className="ci-split__card-overlay ci-split__card-overlay--sud" />
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">🏜️</div>
                <h2>Circuit Sud</h2>
                <p>Désert doré, ksour berbères, oasis de palmiers et nuits sous les étoiles.</p>
                <div className="ci-split__card-stats">
                  <span><strong>{allCircuits.filter(c => c.region === 'sud').length}</strong> circuits</span>
                  <span>dès <strong>{sudMin < 9999 ? `${sudMin} DT` : '—'}</strong></span>
                </div>
              </div>
              {activeTab === 'sud' && <div className="ci-split__card-active-bar" />}
            </div>

          </div>
        </div>
      </section>

      {/* ── CIRCUIT GRID ── */}
      <section className="ci-section">
        <div className="ci-container">

          <div className="ci-section__head">
            <div className="ci-section__head-left">
              <span className={`ci-section__badge ci-section__badge--${activeTab}`}>
                {activeTab === 'nord' ? '🏛️ Circuit Nord' : '🏜️ Circuit Sud'}
              </span>
              <h2 className="ci-section__title">
                {activeTab === 'nord' ? 'Découvrez le Nord de la Tunisie' : 'Aventures dans le Grand Sud'}
              </h2>
              <p className="ci-section__sub">
                {activeTab === 'nord'
                  ? 'Médinas historiques, côtes coraliennes, vestiges romains et montagnes verdoyantes.'
                  : 'Sahara infini, villages berbères millénaires, oasis enchanteresses et ciels étoilés.'}
              </p>
            </div>
            <div className="ci-section__head-right">
              <div className="ci-section__switcher">
                <button className={`ci-switcher-btn${activeTab === 'nord' ? ' active' : ''}`} onClick={() => setActiveTab('nord')}>Nord</button>
                <button className={`ci-switcher-btn${activeTab === 'sud'  ? ' active' : ''}`} onClick={() => setActiveTab('sud')}>Sud</button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: '#0F4C5C', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8' }}>Chargement des circuits...</p>
            </div>
          ) : circuits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: 16, color: '#64748b' }}>Aucun circuit disponible pour le moment.</p>
            </div>
          ) : (
            <div className="ci-grid">
              {circuits.map((circuit, i) => {
                const tagMeta  = TAG_COLORS[circuit.tagColor] || TAG_COLORS.teal;
                const diffMeta = DIFF_META[circuit.difficulty] || DIFF_META['Facile'];
                const isHov    = hovered === circuit.id;
                const isFull   = circuit.places <= 0;
                const isFav    = favorites.has(circuit.id);

                return (
                  <div
                    key={circuit.id}
                    className={`ci-card${isHov ? ' ci-card--hovered' : ''}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                    onMouseEnter={() => setHovered(circuit.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* ── Image wrap ── */}
                    <div className="ci-card__img-wrap">
                      <img src={circuit.image} alt={circuit.title} className="ci-card__img" loading="lazy" />
                      <div className="ci-card__img-overlay" />

                      {circuit.tag && (
                        <span className="ci-card__tag" style={{ background: tagMeta.bg, color: tagMeta.color }}>
                          {circuit.tag}
                        </span>
                      )}

                      <span className="ci-card__duration"><IconClock />{circuit.duration}</span>

                      {circuit.badge && (
                        <span className="ci-card__badge-top">{circuit.badge}</span>
                      )}

                      {/* ── Heart / Favourite button ── */}
                      <button
                        className={`ci-card__heart${isFav ? ' ci-card__heart--active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(circuit.id); }}
                        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <IconHeart filled={isFav} />
                      </button>
                    </div>

                    {/* ── Body ── */}
                    <div className="ci-card__body">
                      <h3 className="ci-card__title">{circuit.title}</h3>
                      {circuit.subtitle && (
                        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontStyle: 'italic' }}>
                          {circuit.subtitle}
                        </p>
                      )}
                      <p className="ci-card__desc">{circuit.description}</p>

                      <div className="ci-card__highlights">
                        {circuit.highlights.slice(0, 4).map((h, j) => (
                          <span key={j} className="ci-card__highlight"><IconCheck />{h}</span>
                        ))}
                      </div>

                      <div className="ci-card__meta">
                        <span className="ci-card__meta-item"><IconUsers />{circuit.group}</span>
                        <span className="ci-card__diff" style={{ background: diffMeta.bg, color: diffMeta.color }}>
                          <IconStar />{circuit.difficulty}
                        </span>
                      </div>

                      {/* Places */}
                      <div style={{
                        marginTop: 8, fontSize: 11, fontWeight: 600,
                        color: isFull ? '#e92f64' : circuit.places <= 5 ? '#f97316' : '#065f46',
                      }}>
                        {isFull
                          ? '❌ Complet'
                          : circuit.places <= 5
                            ? `🔥 Plus que ${circuit.places} places !`
                            : `✅ ${circuit.places} places disponibles`}
                      </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="ci-card__footer">
                      <div className="ci-card__price">
                        <span className="ci-card__price-from">à partir de</span>
                        <span className="ci-card__price-val">{circuit.price} DT</span>
                        <span className="ci-card__price-per">/ pers.</span>
                        {circuit.oldPrice && (
                          <span style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through', marginLeft: 6 }}>
                            {circuit.oldPrice} DT
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="ci-card__btn"
                          style={{ background: 'transparent', border: '1.5px solid var(--ci-teal)', color: 'var(--ci-teal)', padding: '8px 14px' }}
                          onClick={() => handleDetails(circuit)}
                        >
                          Détails
                        </button>
                        <button
                          className="ci-card__btn"
                          onClick={() => !isFull && handleReserver(circuit)}
                          disabled={isFull}
                          style={{ opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}
                        >
                          Réserver<IconArrow />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── POURQUOI ── */}
      <section className="ci-why">
        <div className="ci-container">
          <div className="ci-why__head">
            <span className="ci-why__badge">Notre engagement</span>
            <h2>Pourquoi choisir nos circuits ?</h2>
          </div>
          <div className="ci-why__grid">
            {[
              { icon: '🧭', title: 'Guides experts',        desc: 'Accompagnateurs locaux passionnés, connaissant chaque recoin de la Tunisie.' },
              { icon: '🏨', title: 'Hébergements choisis',  desc: "Riads authentiques, maisons d'hôtes et bivouacs soigneusement sélectionnés." },
              { icon: '🚐', title: 'Transport confortable', desc: 'Véhicules climatisés et chauffeurs expérimentés pour tous vos déplacements.' },
              { icon: '🍽️', title: 'Cuisine authentique',   desc: 'Repas préparés par des locaux pour découvrir la vraie gastronomie tunisienne.' },
              { icon: '📸', title: 'Moments inoubliables',  desc: 'Des itinéraires conçus pour créer des souvenirs que vous chérirez toute votre vie.' },
              { icon: '🔒', title: 'Sécurité garantie',     desc: "Voyages assurés, accompagnement professionnel et assistance 24h/24." },
            ].map((item, i) => (
              <div key={i} className="ci-why__card">
                <div className="ci-why__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ci-cta">
        <div className="ci-cta__bg" />
        <div className="ci-container">
          <div className="ci-cta__content">
            <span className="ci-cta__tag">Circuit sur mesure</span>
            <h2>Vous avez un itinéraire en tête ?</h2>
            <p>Notre équipe conçoit des circuits 100% personnalisés selon vos envies, votre budget et votre rythme.</p>
            <div className="ci-cta__btns">
              <button className="ci-cta__btn ci-cta__btn--primary" onClick={() => navigate('/CustomTripAbroad')}>
                Créer mon circuit sur mesure<IconArrow />
              </button>
              <button className="ci-cta__btn ci-cta__btn--outline" onClick={() => navigate('/Contact')}>
                Nous contacter
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Search bar ─────────────────────────────────────────────────── */
        .ci-searchbar {
          display: flex;
          align-items: stretch;
          background: rgba(255,255,255,0.97);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 48px rgba(0,0,0,0.28);
          width: 100%;
          max-width: 760px;
          border: 1.5px solid rgba(255,255,255,0.35);
          margin-top: 4px;
        }
        .ci-searchbar__field {
          display: flex;
          flex-direction: column;
          padding: 11px 18px;
          flex: 1;
          border-right: 1px solid #e2e8f0;
          cursor: pointer;
          transition: background .15s;
        }
        .ci-searchbar__field:hover { background: rgba(15,76,92,0.04); }
        .ci-searchbar__label {
          font-size: 10px;
          font-weight: 700;
          color: #0F4C5C;
          letter-spacing: .07em;
          text-transform: uppercase;
          margin-bottom: 5px;
          white-space: nowrap;
        }
        .ci-searchbar__select {
          border: none;
          outline: none;
          font-size: 13px;
          color: #1e293b;
          background: transparent;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          padding: 0;
        }
        .ci-searchbar__divider {
          width: 1px;
          background: #e2e8f0;
          align-self: stretch;
        }
        .ci-searchbar__btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #E92F64, #c2185b);
          color: #fff;
          border: none;
          padding: 0 26px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: .04em;
          transition: filter .15s;
          white-space: nowrap;
          min-width: 110px;
        }
        .ci-searchbar__btn svg {
          width: 16px;
          height: 16px;
          stroke: #fff;
        }
        .ci-searchbar__btn:hover { filter: brightness(1.1); }

        /* ── Split overlap ───────────────────────────────────────────────── */
        .ci-split--overlap {
          margin-top: -60px;
          position: relative;
          z-index: 10;
        }

        /* ── Heart button ────────────────────────────────────────────────── */
        .ci-card__heart {
          position: absolute;
          top: 11px;
          right: 11px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .2s, background .2s, box-shadow .2s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.18);
          backdrop-filter: blur(4px);
          z-index: 5;
        }
        .ci-card__heart svg {
          width: 17px;
          height: 17px;
          transition: all .2s;
        }
        .ci-card__heart:hover {
          transform: scale(1.18);
          box-shadow: 0 4px 16px rgba(233,47,100,0.28);
        }
        .ci-card__heart--active {
          background: #fff0f4;
        }
        .ci-card__heart--active svg {
          filter: drop-shadow(0 2px 6px rgba(233,47,100,0.45));
        }

        /* ── Badge top-right (pushed left to not clash with heart) ───────── */
        .ci-card__badge-top {
          position: absolute;
          top: 12px;
          right: 56px;
          padding: 3px 10px;
          border-radius: 999px;
          background: #e8306a;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .06em;
        }

        /* ── Responsive search bar ───────────────────────────────────────── */
        @media (max-width: 640px) {
          .ci-searchbar {
            flex-direction: column;
            border-radius: 14px;
          }
          .ci-searchbar__field {
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          .ci-searchbar__btn {
            justify-content: center;
            padding: 14px;
            min-width: unset;
          }
          .ci-split--overlap { margin-top: -30px; }
        }
      `}</style>
    </div>
  );
}