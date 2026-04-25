// src/pages/Circuits/Circuits.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CircuitSearchBar from '../../components/CircuitSearchBar';
import CircuitCard from '../../components/CircuitCard';
import '../../styles/Circuits.css';
import { usePromotions } from '../../hooks/usePromotions';
import { useFavorites } from '../../hooks/useFavorites';
import { buildFavoriteItemData, getFavoriteKey } from '../../utils/favorites';
import PromotionsSection from '../admin/promotions/PromotionsSection';

const API        = 'http://localhost:5000/api/circuits?public=true';
const COVERS_API = 'http://localhost:5000/api/circuits/circuit-covers';

const DEFAULT_COVERS = {
  hero: {
    bg_image:     '',
    tag:          'Circuits touristiques - Tunisie',
    title:        'Explorez la Tunisie',
    title_accent: 'du Nord au Sud',
    sub:          'Des circuits soigneusement conçus pour vous faire découvrir les trésors du pays, entre mer, désert, culture et authenticité.',
  },
  nord: {
    image_url:        '',
    card_title:       'Circuit Nord',
    card_description: 'Patrimoine, côtes sauvages, sites romains et forêts de pins du Tell.',
    hero_title:       'Découvrez le Nord de la Tunisie',
    hero_sub:         'Médinas historiques, côtes coralliennes, vestiges romains et montagnes verdoyantes.',
    icon:             '🏛',
  },
  sud: {
    image_url:        '',
    card_title:       'Circuit Sud',
    card_description: 'Désert doré, ksour berbères, oasis de palmiers et nuits sous les étoiles.',
    hero_title:       'Aventures dans le Grand Sud',
    hero_sub:         'Sahara infini, villages berbères millénaires, oasis enchanteresses et ciels étoilés.',
    icon:             '🏜',
  },
};

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
    <path d="M8 2v16M16 6v16" />
  </svg>
);

const normalize = (circuit) => ({
  id:               circuit.id,
  title:            circuit.title,
  subtitle:         circuit.subtitle,
  duration:         `${circuit.duration} jours / ${circuit.nights || circuit.duration - 1} nuits`,
  durationDays:     Number(circuit.duration) || 0,
  price:            Number(circuit.price),
  oldPrice:         circuit.old_price ? Number(circuit.old_price) : null,
  difficulty:       circuit.difficulty || 'Facile',
  group:            circuit.group_size || '2 - 15 personnes',
  highlights:       circuit.highlights || [],
  description:      circuit.description,
  image:            circuit.image_url,
  tag:              circuit.tag,
  tagColor:         circuit.tag_color || 'teal',
  badge:            circuit.badge,
  region:           circuit.region,
  departure:        circuit.departure,
  departureDate:    circuit.departure_date || null,
  places:           Number(circuit.available_spots ?? circuit.spots ?? 0),
  rating:           Number(circuit.rating) || 5,
  avis:             Number(circuit.reviews) || 0,
  programme:        circuit.programme || [],
  inclus:           circuit.inclus || [],
  nonInclus:        circuit.non_inclus || [],
  reservation_count: circuit.reservation_count || 0,
});

export default function Circuits() {
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState('nord');
  const [allCircuits, setAllCircuits] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [covers,      setCovers]      = useState(DEFAULT_COVERS);
  const [search,      setSearch]      = useState({ date: '', duration: '', persons: '', budget: '' });

  const { promos }                               = usePromotions('categorie', 'circuits');
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('circuit');

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(json => setAllCircuits((json.data || []).map(normalize)))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(COVERS_API)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setCovers({
            hero: { ...DEFAULT_COVERS.hero, ...(json.data.hero || {}) },
            nord: { ...DEFAULT_COVERS.nord, ...(json.data.nord || {}) },
            sud:  { ...DEFAULT_COVERS.sud,  ...(json.data.sud  || {}) },
          });
        }
      })
      .catch(() => {});
  }, []);

  const applyFilters = (list) => {
    let result = list.filter(c => c.region === activeTab);
    if (search.persons) {
      const p = parseInt(search.persons, 10);
      if (!isNaN(p)) result = result.filter(c => c.places >= p);
    }
    if (search.duration) {
      const d = parseInt(search.duration, 10);
      if (!isNaN(d)) result = result.filter(c => c.durationDays === d);
    }
    if (search.budget) {
      const b = parseInt(search.budget, 10);
      if (!isNaN(b)) result = result.filter(c => c.price >= b);
    }
    if (search.date) {
      const chosen = new Date(search.date);
      if (!isNaN(chosen.getTime())) {
        result = result.filter(c => {
          if (!c.departureDate) return true;
          const dep = new Date(c.departureDate);
          return isNaN(dep.getTime()) || dep >= chosen;
        });
      }
    }
    return result;
  };

  const circuits = applyFilters(allCircuits);
  const nordMin  = allCircuits.filter(c => c.region === 'nord').reduce((m, c) => Math.min(m, c.price), 9999);
  const sudMin   = allCircuits.filter(c => c.region === 'sud' ).reduce((m, c) => Math.min(m, c.price), 9999);

  const getHero  = () => covers.hero || DEFAULT_COVERS.hero;
  const getCover = (r) => covers[r]  || DEFAULT_COVERS[r];

  const handleDetails  = (c) => navigate(`/circuits/CircuitDetails/${c.id}`,  { state: { circuit: c } });
  const handleReserver = (c) => navigate(`/circuits/CircuitReserver/${c.id}`, { state: { circuit: c } });

  const handleFavoriteToggle = async (circuit) => {
    if (!isAuthenticated) { navigate('/SignIn'); return; }
    try {
      await toggleFavorite({
        itemType: 'circuit', itemId: circuit.id,
        itemData: buildFavoriteItemData('circuit', circuit),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="ci-page">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="ci-hero">
        {getHero().bg_image ? (
          <img
            src={getHero().bg_image}
            alt="hero"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="ci-hero__bg" />
        )}
        <div className="ci-hero__overlay" />
        <div className="ci-hero__geo ci-hero__geo--1" />
        <div className="ci-hero__geo ci-hero__geo--2" />

        <div className="ci-hero__content">
          <span className="ci-hero__tag">
            <IconMap />
            {getHero().tag || 'Circuits touristiques - Tunisie'}
          </span>
          <h1 className="ci-hero__title">
            {getHero().title || 'Explorez la Tunisie'}
            <br />
            <span className="ci-hero__title--accent">
              {getHero().title_accent || 'du Nord au Sud'}
            </span>
          </h1>
          <p className="ci-hero__sub">
            {getHero().sub || 'Des circuits soigneusement conçus pour vous faire découvrir les trésors du pays, entre mer, désert, culture et authenticité.'}
          </p>
          <div className="ci-searchbar-shell">
            <CircuitSearchBar initialValues={search} onSearch={setSearch} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          NORD / SUD SPLIT  (overlaps hero bottom)
      ══════════════════════════════════════════════════════ */}
      <section className="ci-split ci-split--overlap">
        <div className="ci-container">
          <div className={`ci-split__inner ci-split__inner--${activeTab}`}>

            {/* Nord */}
            <div
              className={`ci-split__card ci-split__card--nord${activeTab === 'nord' ? ' active' : ''}`}
              onClick={() => setActiveTab('nord')}
            >
              {getCover('nord').image_url && (
                <img
                  src={getCover('nord').image_url}
                  alt="Circuit Nord"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="ci-split__card-bg ci-split__card-bg--nord" />
              <div className="ci-split__card-overlay" />
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">{getCover('nord').icon || '🏛'}</div>
                <h2>{getCover('nord').card_title}</h2>
                <p>{getCover('nord').card_description}</p>
                <div className="ci-split__card-stats">
                  <span><strong>{allCircuits.filter(c => c.region === 'nord').length}</strong> circuits</span>
                  <span>dès <strong>{nordMin < 9999 ? `${nordMin} DT` : '—'}</strong></span>
                </div>
              </div>
              {activeTab === 'nord' && <div className="ci-split__card-active-bar" />}
            </div>

            <div className="ci-split__divider">
              <div className="ci-split__divider-line" />
              <div className="ci-split__divider-badge">🇹🇳</div>
              <div className="ci-split__divider-line" />
            </div>

            {/* Sud */}
            <div
              className={`ci-split__card ci-split__card--sud${activeTab === 'sud' ? ' active' : ''}`}
              onClick={() => setActiveTab('sud')}
            >
              {getCover('sud').image_url && (
                <img
                  src={getCover('sud').image_url}
                  alt="Circuit Sud"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="ci-split__card-bg ci-split__card-bg--sud" />
              <div className="ci-split__card-overlay ci-split__card-overlay--sud" />
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">{getCover('sud').icon || '🏜'}</div>
                <h2>{getCover('sud').card_title}</h2>
                <p>{getCover('sud').card_description}</p>
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

      {/* ══════════════════════════════════════════════════════
          PROMOTIONS — after the split cards
      ══════════════════════════════════════════════════════ */}
      {promos.length > 0 && (
        <section className="ci-promos-section">
          <div className="ci-container">
            <div className="ci-promos-header">
              <span className="ci-promos-badge">🎁 Offres spéciales</span>
              <h3 className="ci-promos-title">Promotions en cours</h3>
            </div>
            <PromotionsSection promos={promos} showCards={false} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          CIRCUIT GRID
      ══════════════════════════════════════════════════════ */}
      <section className="ci-section">
        <div className="ci-container">
          <div className="ci-section__head">
            <div className="ci-section__head-left">
              <span className={`ci-section__badge ci-section__badge--${activeTab}`}>
                {activeTab === 'nord' ? '🏛 Circuit Nord' : '🏜 Circuit Sud'}
              </span>
              <h2 className="ci-section__title">{getCover(activeTab).hero_title}</h2>
              <p className="ci-section__sub">{getCover(activeTab).hero_sub}</p>
            </div>
            <div className="ci-section__head-right">
              <div className="ci-section__switcher">
                <button className={`ci-switcher-btn${activeTab === 'nord' ? ' active' : ''}`} onClick={() => setActiveTab('nord')}>Nord</button>
                <button className={`ci-switcher-btn${activeTab === 'sud'  ? ' active' : ''}`} onClick={() => setActiveTab('sud') }>Sud</button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:'#0F4C5C', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 16px' }} />
              <p style={{ color:'#94a3b8' }}>Chargement des circuits...</p>
            </div>
          ) : circuits.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <p style={{ fontSize:16, color:'#64748b' }}>Aucun circuit ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="ci-grid">
              {circuits.map((circuit) => (
                <CircuitCard
                  key={circuit.id}
                  circuit={circuit}
                  onDetails={handleDetails}
                  onReserve={handleReserver}
                  isFavorite={favoriteIds.has(getFavoriteKey(circuit.id))}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          POURQUOI NOUS
      ══════════════════════════════════════════════════════ */}
      <section className="ci-why">
        <div className="ci-container">
          <div className="ci-why__head">
            <span className="ci-why__badge">Notre engagement</span>
            <h2>Pourquoi choisir nos circuits ?</h2>
          </div>
          <div className="ci-why__grid">
            {[
              { icon:'🧭', title:'Guides experts',        desc:'Accompagnateurs locaux passionnés, connaissant chaque recoin de la Tunisie.' },
              { icon:'🏨', title:'Hébergements choisis',  desc:"Riads authentiques, maisons d'hôtes et bivouacs soigneusement sélectionnés." },
              { icon:'🚐', title:'Transport confortable', desc:'Véhicules climatisés et chauffeurs expérimentés pour tous vos déplacements.' },
              { icon:'🍽', title:'Cuisine authentique',   desc:'Repas préparés par des locaux pour découvrir la vraie gastronomie tunisienne.' },
              { icon:'📸', title:'Moments inoubliables',  desc:'Des itinéraires conçus pour créer des souvenirs que vous chérirez toute votre vie.' },
              { icon:'🔒', title:'Sécurité garantie',     desc:'Voyages assurés, accompagnement professionnel et assistance 24h/24.' },
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

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section className="ci-cta">
        <div className="ci-cta__bg" />
        <div className="ci-container">
          <div className="ci-cta__content">
            <span className="ci-cta__tag">Circuit sur mesure</span>
            <h2>Vous avez un itinéraire en tête ?</h2>
            <p>Notre équipe conçoit des circuits 100% personnalisés selon vos envies, votre budget et votre rythme.</p>
            <div className="ci-cta__btns">
              <button className="ci-cta__btn ci-cta__btn--primary" onClick={() => navigate('/CustomTripAbroad')}>
                Créer mon circuit sur mesure <IconArrow />
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
        .ci-searchbar-shell { width: 100%; max-width: 960px; margin-top: 4px; }
        .ci-split--overlap  { margin-top: -64px; position: relative; z-index: 10; padding-bottom: 0; }
        @media (max-width: 640px) { .ci-split--overlap { margin-top: -28px; } }
      `}</style>
    </div>
  );
}