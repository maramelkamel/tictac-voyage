// src/pages/Circuits/Circuits.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CircuitSearchBar from '../../components/CircuitSearchBar';
import '../../styles/Circuits.css';
import { usePromotions } from '../../hooks/usePromotions';
import { useFavorites } from '../../hooks/useFavorites';
import { buildFavoriteItemData, getFavoriteKey } from '../../utils/favorites';
import PromotionsSection from '../admin/promotions/PromotionsSection';

const API        = 'http://localhost:5000/api/circuits?public=true';
const COVERS_API = 'http://localhost:5000/api/circuits/circuit-covers';

const TAG_COLORS = {
  teal:   { bg: 'rgba(30,202,211,.13)',  color: '#0e7490' },
  blue:   { bg: 'rgba(59,130,246,.12)',  color: '#1d4ed8' },
  green:  { bg: 'rgba(16,185,129,.12)',  color: '#065f46' },
  orange: { bg: 'rgba(249,115,22,.12)',  color: '#c2410c' },
  accent: { bg: 'rgba(233,47,100,.12)',  color: '#E92F64' },
  violet: { bg: 'rgba(139,92,246,.12)',  color: '#5b21b6' },
};

const DIFF_META = {
  Facile:    { color: '#10b981', bg: '#d1fae5' },
  Modere:    { color: '#f97316', bg: '#fff7ed' },
  'Modéré':  { color: '#f97316', bg: '#fff7ed' },
  Aventure:  { color: '#E92F64', bg: 'rgba(233,47,100,.1)' },
};

// ── Defaults affichés si l'API covers ne répond pas ──
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

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

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

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconHeart = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? '#E92F64' : 'none'}
    stroke={filled ? '#E92F64' : '#94a3b8'}
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const normalize = (circuit) => ({
  id: circuit.id,
  title: circuit.title,
  subtitle: circuit.subtitle,
  duration: `${circuit.duration} jours / ${circuit.nights || circuit.duration - 1} nuits`,
  durationDays: Number(circuit.duration) || 0,
  price: Number(circuit.price),
  oldPrice: circuit.old_price ? Number(circuit.old_price) : null,
  difficulty: circuit.difficulty || 'Facile',
  group: circuit.group_size || '2 - 15 personnes',
  highlights: circuit.highlights || [],
  description: circuit.description,
  image: circuit.image_url,
  tag: circuit.tag,
  tagColor: circuit.tag_color || 'teal',
  badge: circuit.badge,
  region: circuit.region,
  departure: circuit.departure,
  departureDate: circuit.departure_date || null,
  places: Number(circuit.available_spots ?? circuit.spots ?? 0),
  rating: Number(circuit.rating) || 5,
  avis: Number(circuit.reviews) || 0,
  programme: circuit.programme || [],
  inclus: circuit.inclus || [],
  nonInclus: circuit.non_inclus || [],
  reservation_count: circuit.reservation_count || 0,
});

export default function Circuits() {
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState('nord');
  const [hovered,      setHovered]      = useState(null);
  const [allCircuits,  setAllCircuits]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [covers,       setCovers]       = useState(DEFAULT_COVERS);
  const [search,       setSearch]       = useState({ date: '', duration: '', persons: '' });

  const { promos }                              = usePromotions('categorie', 'circuits');
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('circuit');

  useEffect(() => {
    // Charger les circuits
    fetch(API)
      .then(r => r.json())
      .then(json => setAllCircuits((json.data || []).map(normalize)))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Charger l'apparence (hero + Nord + Sud)
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
      .catch(() => {/* garde les defaults */});
  }, []);

  const applyFilters = (list) => {
    let result = list.filter(circuit => circuit.region === activeTab);
    if (search.persons) {
      const people = search.persons === '10+' ? 10 : parseInt(search.persons, 10);
      if (!Number.isNaN(people)) result = result.filter(c => c.places >= people);
    }
    if (search.duration) {
      const duration = parseInt(search.duration, 10);
      if (!Number.isNaN(duration)) result = result.filter(c => c.durationDays === duration);
    }
    if (search.date) {
      const chosenDate = new Date(search.date);
      if (!Number.isNaN(chosenDate.getTime())) {
        result = result.filter(c => {
          if (!c.departureDate) return true;
          const dep = new Date(c.departureDate);
          return Number.isNaN(dep.getTime()) || dep >= chosenDate;
        });
      }
    }
    return result;
  };

  const circuits = applyFilters(allCircuits);
  const nordMin  = allCircuits.filter(c => c.region === 'nord').reduce((m, c) => Math.min(m, c.price), 9999);
  const sudMin   = allCircuits.filter(c => c.region === 'sud' ).reduce((m, c) => Math.min(m, c.price), 9999);

  const handleDetails  = (circuit) => navigate(`/circuits/CircuitDetails/${circuit.id}`, { state: { circuit } });
  const handleReserver = (circuit) => navigate(`/circuits/CircuitReserver/${circuit.id}`,  { state: { circuit } });

  const handleFavoriteToggle = async (circuit) => {
    if (!isAuthenticated) { navigate('/SignIn'); return; }
    try {
      await toggleFavorite({ itemType:'circuit', itemId:circuit.id, itemData:buildFavoriteItemData('circuit', circuit) });
    } catch (error) { console.error(error); }
  };

  // Helpers avec fallback
  const getHero  = () => covers.hero || DEFAULT_COVERS.hero;
  const getCover = (region) => covers[region] || DEFAULT_COVERS[region];

  return (
    <div className="ci-page">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO — entièrement dynamique
      ══════════════════════════════════════════════════════ */}
      <section className="ci-hero">
        {/* Image de fond dynamique */}
        {getHero().bg_image ? (
          <img
            src={getHero().bg_image}
            alt="hero background"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="ci-hero__bg" />
        )}
        <div className="ci-hero__overlay" />
        <div className="ci-hero__geo ci-hero__geo--1" />
        <div className="ci-hero__geo ci-hero__geo--2" />

        <div className="ci-hero__content" style={{ position: 'relative', zIndex: 1 }}>
          {/* Tag dynamique */}
          <span className="ci-hero__tag">
            <IconMap />
            {getHero().tag || 'Circuits touristiques - Tunisie'}
          </span>

          {/* Titre dynamique */}
          <h1 className="ci-hero__title">
            {getHero().title || 'Explorez la Tunisie'}
            <br />
            <span className="ci-hero__title--accent">
              {getHero().title_accent || 'du Nord au Sud'}
            </span>
          </h1>

          {/* Sous-titre dynamique */}
          <p className="ci-hero__sub">
            {getHero().sub ||
              'Des circuits soigneusement conçus pour vous faire découvrir les trésors du pays, entre mer, désert, culture et authenticité.'}
          </p>

          <div className="ci-searchbar-shell">
            <CircuitSearchBar initialValues={search} onSearch={setSearch} />
          </div>
        </div>
      </section>

      {promos.length > 0 && (
        <section style={{ padding: '8px 0' }}>
          <div className="ci-container">
            <PromotionsSection promos={promos} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION SÉLECTION NORD / SUD
      ══════════════════════════════════════════════════════ */}
      <section className="ci-split ci-split--overlap">
        <div className="ci-container">
          <div className={`ci-split__inner ci-split__inner--${activeTab}`}>

            {/* Carte Nord */}
            <div
              className={`ci-split__card ci-split__card--nord${activeTab === 'nord' ? ' active' : ''}`}
              onClick={() => setActiveTab('nord')}
            >
              {getCover('nord').image_url && (
                <img
                  src={getCover('nord').image_url}
                  alt="Circuit Nord"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45, borderRadius:'inherit' }}
                  onError={e => { e.target.style.display='none'; }}
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
                  <span>dès <strong>{nordMin < 9999 ? `${nordMin} DT` : '-'}</strong></span>
                </div>
              </div>
              {activeTab === 'nord' && <div className="ci-split__card-active-bar" />}
            </div>

            <div className="ci-split__divider">
              <div className="ci-split__divider-line" />
              <div className="ci-split__divider-badge">TN</div>
              <div className="ci-split__divider-line" />
            </div>

            {/* Carte Sud */}
            <div
              className={`ci-split__card ci-split__card--sud${activeTab === 'sud' ? ' active' : ''}`}
              onClick={() => setActiveTab('sud')}
            >
              {getCover('sud').image_url && (
                <img
                  src={getCover('sud').image_url}
                  alt="Circuit Sud"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45, borderRadius:'inherit' }}
                  onError={e => { e.target.style.display='none'; }}
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
                  <span>dès <strong>{sudMin < 9999 ? `${sudMin} DT` : '-'}</strong></span>
                </div>
              </div>
              {activeTab === 'sud' && <div className="ci-split__card-active-bar" />}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION LISTE DES CIRCUITS
      ══════════════════════════════════════════════════════ */}
      <section className="ci-section">
        <div className="ci-container">
          <div className="ci-section__head">
            <div className="ci-section__head-left">
              <span className={`ci-section__badge ci-section__badge--${activeTab}`}>
                {activeTab === 'nord' ? 'Circuit Nord' : 'Circuit Sud'}
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
              <p style={{ fontSize:16, color:'#64748b' }}>Aucun circuit ne correspond à votre recherche pour le moment.</p>
            </div>
          ) : (
            <div className="ci-grid">
              {circuits.map((circuit, index) => {
                const tagMeta    = TAG_COLORS[circuit.tagColor] || TAG_COLORS.teal;
                const diffMeta   = DIFF_META[circuit.difficulty] || DIFF_META.Facile;
                const isHovered  = hovered === circuit.id;
                const isFull     = circuit.places <= 0;
                const isFavorite = favoriteIds.has(getFavoriteKey(circuit.id));

                return (
                  <div
                    key={circuit.id}
                    className={`ci-card${isHovered ? ' ci-card--hovered' : ''}`}
                    style={{ animationDelay:`${index * 0.08}s` }}
                    onMouseEnter={() => setHovered(circuit.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="ci-card__img-wrap">
                      <img src={circuit.image} alt={circuit.title} className="ci-card__img" loading="lazy" />
                      <div className="ci-card__img-overlay" />
                      {circuit.tag && (
                        <span className="ci-card__tag" style={{ background:tagMeta.bg, color:tagMeta.color }}>
                          {circuit.tag}
                        </span>
                      )}
                      <span className="ci-card__duration"><IconClock />{circuit.duration}</span>
                      {circuit.badge && <span className="ci-card__badge-top">{circuit.badge}</span>}
                      <button
                        className={`ci-card__heart${isFavorite ? ' ci-card__heart--active' : ''}`}
                        onClick={e => { e.stopPropagation(); handleFavoriteToggle(circuit); }}
                        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <IconHeart filled={isFavorite} />
                      </button>
                    </div>

                    <div className="ci-card__body">
                      <h3 className="ci-card__title">{circuit.title}</h3>
                      {circuit.subtitle && (
                        <p style={{ fontSize:12, color:'#64748b', marginBottom:8, fontStyle:'italic' }}>
                          {circuit.subtitle}
                        </p>
                      )}
                      <p className="ci-card__desc">{circuit.description}</p>
                      <div className="ci-card__highlights">
                        {circuit.highlights.slice(0, 4).map((h, i) => (
                          <span key={i} className="ci-card__highlight"><IconCheck />{h}</span>
                        ))}
                      </div>
                      <div className="ci-card__meta">
                        <span className="ci-card__meta-item"><IconUsers />{circuit.group}</span>
                        <span className="ci-card__diff" style={{ background:diffMeta.bg, color:diffMeta.color }}>
                          <IconStar />{circuit.difficulty}
                        </span>
                      </div>
                      <div style={{ marginTop:8, fontSize:11, fontWeight:600, color:isFull?'#e92f64':circuit.places<=5?'#f97316':'#065f46' }}>
                        {isFull ? 'Complet' : circuit.places <= 5 ? `Plus que ${circuit.places} places !` : `${circuit.places} places disponibles`}
                      </div>
                    </div>

                    <div className="ci-card__footer">
                      <div className="ci-card__price">
                        <span className="ci-card__price-from">à partir de</span>
                        <span className="ci-card__price-val">{circuit.price} DT</span>
                        <span className="ci-card__price-per">/ pers.</span>
                        {circuit.oldPrice && (
                          <span style={{ fontSize:11, color:'#94a3b8', textDecoration:'line-through', marginLeft:6 }}>
                            {circuit.oldPrice} DT
                          </span>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          className="ci-card__btn"
                          style={{ background:'transparent', border:'1.5px solid var(--ci-teal)', color:'var(--ci-teal)', padding:'8px 14px' }}
                          onClick={() => handleDetails(circuit)}
                        >
                          Détails
                        </button>
                        <button
                          className="ci-card__btn"
                          onClick={() => !isFull && handleReserver(circuit)}
                          disabled={isFull}
                          style={{ opacity:isFull?0.5:1, cursor:isFull?'not-allowed':'pointer' }}
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
        .ci-searchbar-shell { width:100%; max-width:760px; margin-top:4px; }
        .ci-split--overlap  { margin-top:-60px; position:relative; z-index:10; }
        .ci-split__card     { position:relative; overflow:hidden; }

        .ci-card__heart {
          position:absolute; top:11px; right:11px; width:36px; height:36px;
          border-radius:50%; background:rgba(255,255,255,.92); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:transform .2s,background .2s,box-shadow .2s;
          box-shadow:0 2px 10px rgba(0,0,0,.18); backdrop-filter:blur(4px); z-index:5;
        }
        .ci-card__heart svg       { width:17px; height:17px; transition:all .2s; }
        .ci-card__heart:hover     { transform:scale(1.18); box-shadow:0 4px 16px rgba(233,47,100,.28); }
        .ci-card__heart--active   { background:#fff0f4; }
        .ci-card__heart--active svg { filter:drop-shadow(0 2px 6px rgba(233,47,100,.45)); }

        .ci-card__badge-top {
          position:absolute; top:12px; right:56px; padding:3px 10px; border-radius:999px;
          background:#e8306a; color:#fff; font-size:9px; font-weight:800; letter-spacing:.06em;
        }
        @media (max-width:640px) { .ci-split--overlap { margin-top:-30px; } }
      `}</style>
    </div>
  );
}