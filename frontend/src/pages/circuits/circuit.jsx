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

const API = 'http://localhost:5000/api/circuits?public=true';

const TAG_COLORS = {
  teal: { bg: 'rgba(30,202,211,.13)', color: '#0e7490' },
  blue: { bg: 'rgba(59,130,246,.12)', color: '#1d4ed8' },
  green: { bg: 'rgba(16,185,129,.12)', color: '#065f46' },
  orange: { bg: 'rgba(249,115,22,.12)', color: '#c2410c' },
  accent: { bg: 'rgba(233,47,100,.12)', color: '#E92F64' },
  violet: { bg: 'rgba(139,92,246,.12)', color: '#5b21b6' },
};

const DIFF_META = {
  Facile: { color: '#10b981', bg: '#d1fae5' },
  Modere: { color: '#f97316', bg: '#fff7ed' },
  'Modéré': { color: '#f97316', bg: '#fff7ed' },
  Aventure: { color: '#E92F64', bg: 'rgba(233,47,100,.1)' },
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
  const [activeTab, setActiveTab] = useState('nord');
  const [hovered, setHovered] = useState(null);
  const [allCircuits, setAllCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({
    date: '',
    duration: '',
    persons: '',
  });

  const { promos } = usePromotions('categorie', 'circuits');
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('circuit');

  useEffect(() => {
    fetch(API)
      .then((response) => response.json())
      .then((json) => setAllCircuits((json.data || []).map(normalize)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = (list) => {
    let result = list.filter((circuit) => circuit.region === activeTab);

    if (search.persons) {
      const people = search.persons === '10+' ? 10 : parseInt(search.persons, 10);
      if (!Number.isNaN(people)) {
        result = result.filter((circuit) => circuit.places >= people);
      }
    }

    if (search.duration) {
      const duration = parseInt(search.duration, 10);
      if (!Number.isNaN(duration)) {
        result = result.filter((circuit) => circuit.durationDays === duration);
      }
    }

    if (search.date) {
      const chosenDate = new Date(search.date);
      if (!Number.isNaN(chosenDate.getTime())) {
        result = result.filter((circuit) => {
          if (!circuit.departureDate) return true;
          const departureDate = new Date(circuit.departureDate);
          return Number.isNaN(departureDate.getTime()) || departureDate >= chosenDate;
        });
      }
    }

    return result;
  };

  const circuits = applyFilters(allCircuits);
  const nordMin = allCircuits
    .filter((circuit) => circuit.region === 'nord')
    .reduce((min, circuit) => Math.min(min, circuit.price), 9999);
  const sudMin = allCircuits
    .filter((circuit) => circuit.region === 'sud')
    .reduce((min, circuit) => Math.min(min, circuit.price), 9999);

  const handleDetails = (circuit) =>
    navigate(`/circuits/CircuitDetails/${circuit.id}`, { state: { circuit } });

  const handleReserver = (circuit) =>
    navigate(`/circuits/CircuitReserver/${circuit.id}`, { state: { circuit } });

  const handleFavoriteToggle = async (circuit) => {
    if (!isAuthenticated) {
      navigate('/SignIn');
      return;
    }

    try {
      await toggleFavorite({
        itemType: 'circuit',
        itemId: circuit.id,
        itemData: buildFavoriteItemData('circuit', circuit),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="ci-page">
      <Navbar />

      <section className="ci-hero">
        <div className="ci-hero__bg" />
        <div className="ci-hero__overlay" />
        <div className="ci-hero__geo ci-hero__geo--1" />
        <div className="ci-hero__geo ci-hero__geo--2" />

        <div className="ci-hero__content">
          <span className="ci-hero__tag">
            <IconMap />
            Circuits touristiques - Tunisie
          </span>
          <h1 className="ci-hero__title">
            Explorez la Tunisie
            <br />
            <span className="ci-hero__title--accent">du Nord au Sud</span>
          </h1>
          <p className="ci-hero__sub">
            Des circuits soigneusement concus pour vous faire decouvrir les tresors du pays,
            entre mer, desert, culture et authenticite.
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

      <section className="ci-split ci-split--overlap">
        <div className="ci-container">
          <div className={`ci-split__inner ci-split__inner--${activeTab}`}>
            <div
              className={`ci-split__card ci-split__card--nord${activeTab === 'nord' ? ' active' : ''}`}
              onClick={() => setActiveTab('nord')}
            >
              <div className="ci-split__card-bg ci-split__card-bg--nord" />
              <div className="ci-split__card-overlay" />
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">🏛</div>
                <h2>Circuit Nord</h2>
                <p>Patrimoine, cotes sauvages, sites romains et forets de pins du Tell.</p>
                <div className="ci-split__card-stats">
                  <span>
                    <strong>{allCircuits.filter((circuit) => circuit.region === 'nord').length}</strong> circuits
                  </span>
                  <span>
                    des <strong>{nordMin < 9999 ? `${nordMin} DT` : '-'}</strong>
                  </span>
                </div>
              </div>
              {activeTab === 'nord' && <div className="ci-split__card-active-bar" />}
            </div>

            <div className="ci-split__divider">
              <div className="ci-split__divider-line" />
              <div className="ci-split__divider-badge">TN</div>
              <div className="ci-split__divider-line" />
            </div>

            <div
              className={`ci-split__card ci-split__card--sud${activeTab === 'sud' ? ' active' : ''}`}
              onClick={() => setActiveTab('sud')}
            >
              <div className="ci-split__card-bg ci-split__card-bg--sud" />
              <div className="ci-split__card-overlay ci-split__card-overlay--sud" />
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">🏜</div>
                <h2>Circuit Sud</h2>
                <p>Desert dore, ksour berberes, oasis de palmiers et nuits sous les etoiles.</p>
                <div className="ci-split__card-stats">
                  <span>
                    <strong>{allCircuits.filter((circuit) => circuit.region === 'sud').length}</strong> circuits
                  </span>
                  <span>
                    des <strong>{sudMin < 9999 ? `${sudMin} DT` : '-'}</strong>
                  </span>
                </div>
              </div>
              {activeTab === 'sud' && <div className="ci-split__card-active-bar" />}
            </div>
          </div>
        </div>
      </section>

      <section className="ci-section">
        <div className="ci-container">
          <div className="ci-section__head">
            <div className="ci-section__head-left">
              <span className={`ci-section__badge ci-section__badge--${activeTab}`}>
                {activeTab === 'nord' ? 'Circuit Nord' : 'Circuit Sud'}
              </span>
              <h2 className="ci-section__title">
                {activeTab === 'nord' ? 'Decouvrez le Nord de la Tunisie' : 'Aventures dans le Grand Sud'}
              </h2>
              <p className="ci-section__sub">
                {activeTab === 'nord'
                  ? 'Medinas historiques, cotes coraliennes, vestiges romains et montagnes verdoyantes.'
                  : 'Sahara infini, villages berberes millenaires, oasis enchanteresses et ciels etoiles.'}
              </p>
            </div>
            <div className="ci-section__head-right">
              <div className="ci-section__switcher">
                <button
                  className={`ci-switcher-btn${activeTab === 'nord' ? ' active' : ''}`}
                  onClick={() => setActiveTab('nord')}
                >
                  Nord
                </button>
                <button
                  className={`ci-switcher-btn${activeTab === 'sud' ? ' active' : ''}`}
                  onClick={() => setActiveTab('sud')}
                >
                  Sud
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#0F4C5C',
                  borderRadius: '50%',
                  animation: 'spin .7s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ color: '#94a3b8' }}>Chargement des circuits...</p>
            </div>
          ) : circuits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: 16, color: '#64748b' }}>
                Aucun circuit ne correspond a votre recherche pour le moment.
              </p>
            </div>
          ) : (
            <div className="ci-grid">
              {circuits.map((circuit, index) => {
                const tagMeta = TAG_COLORS[circuit.tagColor] || TAG_COLORS.teal;
                const diffMeta = DIFF_META[circuit.difficulty] || DIFF_META.Facile;
                const isHovered = hovered === circuit.id;
                const isFull = circuit.places <= 0;
                const isFavorite = favoriteIds.has(getFavoriteKey(circuit.id));

                return (
                  <div
                    key={circuit.id}
                    className={`ci-card${isHovered ? ' ci-card--hovered' : ''}`}
                    style={{ animationDelay: `${index * 0.08}s` }}
                    onMouseEnter={() => setHovered(circuit.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="ci-card__img-wrap">
                      <img src={circuit.image} alt={circuit.title} className="ci-card__img" loading="lazy" />
                      <div className="ci-card__img-overlay" />

                      {circuit.tag && (
                        <span className="ci-card__tag" style={{ background: tagMeta.bg, color: tagMeta.color }}>
                          {circuit.tag}
                        </span>
                      )}

                      <span className="ci-card__duration">
                        <IconClock />
                        {circuit.duration}
                      </span>

                      {circuit.badge && <span className="ci-card__badge-top">{circuit.badge}</span>}

                      <button
                        className={`ci-card__heart${isFavorite ? ' ci-card__heart--active' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleFavoriteToggle(circuit);
                        }}
                        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <IconHeart filled={isFavorite} />
                      </button>
                    </div>

                    <div className="ci-card__body">
                      <h3 className="ci-card__title">{circuit.title}</h3>
                      {circuit.subtitle && (
                        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontStyle: 'italic' }}>
                          {circuit.subtitle}
                        </p>
                      )}
                      <p className="ci-card__desc">{circuit.description}</p>

                      <div className="ci-card__highlights">
                        {circuit.highlights.slice(0, 4).map((highlight, highlightIndex) => (
                          <span key={highlightIndex} className="ci-card__highlight">
                            <IconCheck />
                            {highlight}
                          </span>
                        ))}
                      </div>

                      <div className="ci-card__meta">
                        <span className="ci-card__meta-item">
                          <IconUsers />
                          {circuit.group}
                        </span>
                        <span className="ci-card__diff" style={{ background: diffMeta.bg, color: diffMeta.color }}>
                          <IconStar />
                          {circuit.difficulty}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          color: isFull ? '#e92f64' : circuit.places <= 5 ? '#f97316' : '#065f46',
                        }}
                      >
                        {isFull
                          ? 'Complet'
                          : circuit.places <= 5
                            ? `Plus que ${circuit.places} places !`
                            : `${circuit.places} places disponibles`}
                      </div>
                    </div>

                    <div className="ci-card__footer">
                      <div className="ci-card__price">
                        <span className="ci-card__price-from">a partir de</span>
                        <span className="ci-card__price-val">{circuit.price} DT</span>
                        <span className="ci-card__price-per">/ pers.</span>
                        {circuit.oldPrice && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#94a3b8',
                              textDecoration: 'line-through',
                              marginLeft: 6,
                            }}
                          >
                            {circuit.oldPrice} DT
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="ci-card__btn"
                          style={{
                            background: 'transparent',
                            border: '1.5px solid var(--ci-teal)',
                            color: 'var(--ci-teal)',
                            padding: '8px 14px',
                          }}
                          onClick={() => handleDetails(circuit)}
                        >
                          Details
                        </button>
                        <button
                          className="ci-card__btn"
                          onClick={() => !isFull && handleReserver(circuit)}
                          disabled={isFull}
                          style={{ opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}
                        >
                          Reserver
                          <IconArrow />
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
              {
                icon: '🧭',
                title: 'Guides experts',
                desc: 'Accompagnateurs locaux passionnes, connaissant chaque recoin de la Tunisie.',
              },
              {
                icon: '🏨',
                title: 'Hebergements choisis',
                desc: "Riads authentiques, maisons d'hotes et bivouacs soigneusement selectionnes.",
              },
              {
                icon: '🚐',
                title: 'Transport confortable',
                desc: 'Vehicules climatises et chauffeurs experimentes pour tous vos deplacements.',
              },
              {
                icon: '🍽',
                title: 'Cuisine authentique',
                desc: 'Repas prepares par des locaux pour decouvrir la vraie gastronomie tunisienne.',
              },
              {
                icon: '📸',
                title: 'Moments inoubliables',
                desc: 'Des itineraires concus pour creer des souvenirs que vous cherirez toute votre vie.',
              },
              {
                icon: '🔒',
                title: 'Securite garantie',
                desc: 'Voyages assures, accompagnement professionnel et assistance 24h/24.',
              },
            ].map((item, index) => (
              <div key={index} className="ci-why__card">
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
            <h2>Vous avez un itineraire en tete ?</h2>
            <p>
              Notre equipe concoit des circuits 100% personnalises selon vos envies, votre budget et votre rythme.
            </p>
            <div className="ci-cta__btns">
              <button className="ci-cta__btn ci-cta__btn--primary" onClick={() => navigate('/CustomTripAbroad')}>
                Creer mon circuit sur mesure
                <IconArrow />
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

        .ci-searchbar-shell {
          width: 100%;
          max-width: 760px;
          margin-top: 4px;
        }

        .ci-split--overlap {
          margin-top: -60px;
          position: relative;
          z-index: 10;
        }

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

        @media (max-width: 640px) {
          .ci-split--overlap {
            margin-top: -30px;
          }
        }
      `}</style>
    </div>
  );
}
