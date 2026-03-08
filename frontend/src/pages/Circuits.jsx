// src/pages/Circuits.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Circuits.css';

/* ── Données circuits ── */
const CIRCUITS = {
  nord: [
    {
      id: 'n1',
      title: 'Tunis Impériale',
      duration: '3 jours / 2 nuits',
      days: 3,
      price: 290,
      difficulty: 'Facile',
      group: '2 – 15 personnes',
      highlights: ['Médina de Tunis', 'Bardo', 'Carthage', 'Sidi Bou Saïd'],
      description: 'Plongez dans la capitale millénaire. De la Médina classée UNESCO aux ruines de Carthage, en passant par les azulejos de Sidi Bou Saïd.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
      tag: 'Patrimoine',
      tagColor: 'teal',
    },
    {
      id: 'n2',
      title: 'Côte de Corail',
      duration: '4 jours / 3 nuits',
      days: 4,
      price: 420,
      difficulty: 'Facile',
      group: '2 – 20 personnes',
      highlights: ['Bizerte', 'Cap Serrat', 'Tabarka', 'Aïn Draham'],
      description: 'Le Nord sauvage et verdoyant. Forêts de pins, plages préservées de corail rouge et la belle Tabarka face aux îles.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      tag: 'Nature & Mer',
      tagColor: 'blue',
    },
    {
      id: 'n3',
      title: 'Cap Bon & Vignobles',
      duration: '2 jours / 1 nuit',
      days: 2,
      price: 195,
      difficulty: 'Facile',
      group: '2 – 12 personnes',
      highlights: ['Nabeul', 'Hammamet', 'Kelibia', 'El Haouaria'],
      description: 'La péninsule de Cap Bon entre céramiques artisanales, vignobles parfumés, forteresses et falaises calcaires.',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
      tag: 'Découverte',
      tagColor: 'green',
    },
    {
      id: 'n4',
      title: 'Vallées du Tell',
      duration: '3 jours / 2 nuits',
      days: 3,
      price: 350,
      difficulty: 'Modéré',
      group: '4 – 12 personnes',
      highlights: ['Le Kef', 'Dougga', 'Bulla Regia', 'Chemtou'],
      description: 'Immersion dans le Tell tunisien. Sites romains de Dougga et Bulla Regia, marchés berbères et panoramas sur les plaines verdoyantes.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
      tag: 'Archéologie',
      tagColor: 'orange',
    },
  ],
  sud: [
    {
      id: 's1',
      title: 'Sahara & Dunes d\'Or',
      duration: '5 jours / 4 nuits',
      days: 5,
      price: 680,
      difficulty: 'Aventure',
      group: '2 – 10 personnes',
      highlights: ['Douz', 'Grand Erg Oriental', 'Ksar Ghilane', 'Nuit sous les étoiles'],
      description: 'L\'expérience ultime du désert. Bivouac dans les dunes, balade à dos de dromadaire au coucher du soleil et ciel étoilé grandiose.',
      image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
      tag: 'Aventure',
      tagColor: 'accent',
    },
    {
      id: 's2',
      title: 'Ksour & Troglodytes',
      duration: '4 jours / 3 nuits',
      days: 4,
      price: 510,
      difficulty: 'Modéré',
      group: '2 – 15 personnes',
      highlights: ['Matmata', 'Médenine', 'Ksar Hadada', 'Tataouine'],
      description: 'Maisons troglodytes, greniers fortifiés berbères (ksour) et paysages lunaires de la région qui a inspiré Star Wars.',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
      tag: 'Culture Berbère',
      tagColor: 'violet',
    },
    {
      id: 's3',
      title: 'Chott el-Jérid & Oasis',
      duration: '3 jours / 2 nuits',
      days: 3,
      price: 395,
      difficulty: 'Facile',
      group: '2 – 18 personnes',
      highlights: ['Tozeur', 'Nefta', 'Chott el-Jérid', 'Oasis de montagne'],
      description: 'Traversée du grand lac salé aux mirages irisés, palmeraies luxuriantes de Tozeur et villages d\'adobe de la région des Jérid.',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      tag: 'Paysages',
      tagColor: 'teal',
    },
    {
      id: 's4',
      title: 'Îles de Kerkennah',
      duration: '2 jours / 1 nuit',
      days: 2,
      price: 220,
      difficulty: 'Facile',
      group: '2 – 20 personnes',
      highlights: ['Ferry depuis Sfax', 'Poulpe & cuisine locale', 'Plages sauvages', 'Villages de pêcheurs'],
      description: 'Escapade hors du temps sur les îles plates de Kerkennah. Vélo, poulpe grillé, baignades cristallines et authenticité absolue.',
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
      tag: 'Évasion',
      tagColor: 'blue',
    },
  ],
};

const TAG_COLORS = {
  teal:   { bg: 'rgba(30,202,211,.13)',  color: '#0e7490'  },
  blue:   { bg: 'rgba(59,130,246,.12)',  color: '#1d4ed8'  },
  green:  { bg: 'rgba(16,185,129,.12)',  color: '#065f46'  },
  orange: { bg: 'rgba(249,115,22,.12)',  color: '#c2410c'  },
  accent: { bg: 'rgba(233,47,100,.12)',  color: '#E92F64'  },
  violet: { bg: 'rgba(139,92,246,.12)',  color: '#5b21b6'  },
};

const DIFF_META = {
  'Facile':   { color: '#10b981', bg: '#d1fae5' },
  'Modéré':   { color: '#f97316', bg: '#fff7ed' },
  'Aventure': { color: '#E92F64', bg: 'rgba(233,47,100,.1)' },
};

/* ── Icônes SVG ── */
const IconClock   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconUsers   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IconStar    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconArrow   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconMap     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>;
const IconCheck   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

export default function Circuits() {
  const [activeTab, setActiveTab] = useState('nord');
  const [hovered,   setHovered]   = useState(null);
  const navigate = useNavigate();

  const circuits = CIRCUITS[activeTab];

  return (
    <div className="ci-page">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="ci-hero">
        <div className="ci-hero__bg" />
        <div className="ci-hero__overlay" />

        {/* Déco géométrique */}
        <div className="ci-hero__geo ci-hero__geo--1" />
        <div className="ci-hero__geo ci-hero__geo--2" />

        <div className="ci-hero__content">
          <span className="ci-hero__tag">
            <IconMap />
            Circuits touristiques — Tunisie
          </span>
          <h1 className="ci-hero__title">
            Explorez la Tunisie<br/>
            <span className="ci-hero__title--accent">du Nord au Sud</span>
          </h1>
          <p className="ci-hero__sub">
            Des circuits soigneusement conçus pour vous faire découvrir les trésors
            du pays, entre mer, désert, culture et authenticité.
          </p>

          {/* Tabs héro */}
          <div className="ci-hero__tabs">
            <button
              className={`ci-hero__tab${activeTab === 'nord' ? ' active' : ''}`}
              onClick={() => setActiveTab('nord')}
            >
              <span className="ci-hero__tab-dot ci-hero__tab-dot--nord" />
              Circuit Nord
            </button>
            <button
              className={`ci-hero__tab${activeTab === 'sud' ? ' active' : ''}`}
              onClick={() => setActiveTab('sud')}
            >
              <span className="ci-hero__tab-dot ci-hero__tab-dot--sud" />
              Circuit Sud
            </button>
          </div>
        </div>
      </section>

      {/* ══ SECTION INTRO SPLIT ══ */}
      <section className="ci-split">
        <div className="ci-container">
          <div className={`ci-split__inner ci-split__inner--${activeTab}`}>

            {/* Carte Nord */}
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
                  <span><strong>4</strong> circuits</span>
                  <span><strong>2–5</strong> jours</span>
                  <span>dès <strong>195 DT</strong></span>
                </div>
              </div>
              {activeTab === 'nord' && <div className="ci-split__card-active-bar" />}
            </div>

            {/* Séparateur */}
            <div className="ci-split__divider">
              <div className="ci-split__divider-line" />
              <div className="ci-split__divider-badge">🇹🇳</div>
              <div className="ci-split__divider-line" />
            </div>

            {/* Carte Sud */}
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
                  <span><strong>4</strong> circuits</span>
                  <span><strong>2–5</strong> jours</span>
                  <span>dès <strong>220 DT</strong></span>
                </div>
              </div>
              {activeTab === 'sud' && <div className="ci-split__card-active-bar" />}
            </div>

          </div>
        </div>
      </section>

      {/* ══ GRILLE CIRCUITS ══ */}
      <section className="ci-section">
        <div className="ci-container">

          {/* En-tête section */}
          <div className="ci-section__head">
            <div className="ci-section__head-left">
              <span className={`ci-section__badge ci-section__badge--${activeTab}`}>
                {activeTab === 'nord' ? '🏛️ Circuit Nord' : '🏜️ Circuit Sud'}
              </span>
              <h2 className="ci-section__title">
                {activeTab === 'nord'
                  ? 'Découvrez le Nord de la Tunisie'
                  : 'Aventures dans le Grand Sud'}
              </h2>
              <p className="ci-section__sub">
                {activeTab === 'nord'
                  ? 'Médinas historiques, côtes coraliennes, vestiges romains et montagnes verdoyantes.'
                  : 'Sahara infini, villages berbères millénaires, oasis enchanteresses et ciels étoilés.'}
              </p>
            </div>
            <div className="ci-section__head-right">
              <div className={`ci-section__switcher`}>
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

          {/* Grille de cartes */}
          <div className="ci-grid">
            {circuits.map((circuit, i) => {
              const tagMeta  = TAG_COLORS[circuit.tagColor] || TAG_COLORS.teal;
              const diffMeta = DIFF_META[circuit.difficulty] || DIFF_META['Facile'];
              const isHov    = hovered === circuit.id;

              return (
                <div
                  key={circuit.id}
                  className={`ci-card${isHov ? ' ci-card--hovered' : ''}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  onMouseEnter={() => setHovered(circuit.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Image */}
                  <div className="ci-card__img-wrap">
                    <img src={circuit.image} alt={circuit.title} className="ci-card__img" loading="lazy" />
                    <div className="ci-card__img-overlay" />

                    {/* Tag flottant */}
                    <span
                      className="ci-card__tag"
                      style={{ background: tagMeta.bg, color: tagMeta.color }}
                    >
                      {circuit.tag}
                    </span>

                    {/* Durée flottante */}
                    <span className="ci-card__duration">
                      <IconClock />
                      {circuit.duration}
                    </span>
                  </div>

                  {/* Corps */}
                  <div className="ci-card__body">
                    <h3 className="ci-card__title">{circuit.title}</h3>
                    <p className="ci-card__desc">{circuit.description}</p>

                    {/* Highlights */}
                    <div className="ci-card__highlights">
                      {circuit.highlights.map((h, j) => (
                        <span key={j} className="ci-card__highlight">
                          <IconCheck />
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Méta */}
                    <div className="ci-card__meta">
                      <span className="ci-card__meta-item">
                        <IconUsers />
                        {circuit.group}
                      </span>
                      <span
                        className="ci-card__diff"
                        style={{ background: diffMeta.bg, color: diffMeta.color }}
                      >
                        <IconStar />
                        {circuit.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="ci-card__footer">
                    <div className="ci-card__price">
                      <span className="ci-card__price-from">à partir de</span>
                      <span className="ci-card__price-val">{circuit.price} DT</span>
                      <span className="ci-card__price-per">/ pers.</span>
                    </div>
                    <button
                      className="ci-card__btn"
                      onClick={() => navigate('/Contact')}
                    >
                      Réserver
                      <IconArrow />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ POURQUOI NOUS ══ */}
      <section className="ci-why">
        <div className="ci-container">
          <div className="ci-why__head">
            <span className="ci-why__badge">Notre engagement</span>
            <h2>Pourquoi choisir nos circuits ?</h2>
          </div>
          <div className="ci-why__grid">
            {[
              { icon: '🧭', title: 'Guides experts',       desc: 'Accompagnateurs locaux passionnés, connaissant chaque recoin de la Tunisie.' },
              { icon: '🏨', title: 'Hébergements choisis', desc: 'Riads authentiques, maisons d\'hôtes et bivouacs soigneusement sélectionnés.' },
              { icon: '🚐', title: 'Transport confortable', desc: 'Véhicules climatisés et chauffeurs expérimentés pour tous vos déplacements.' },
              { icon: '🍽️', title: 'Cuisine authentique',  desc: 'Repas préparés par des locaux pour découvrir la vraie gastronomie tunisienne.' },
              { icon: '📸', title: 'Moments inoubliables', desc: 'Des itinéraires conçus pour créer des souvenirs que vous chérirez toute votre vie.' },
              { icon: '🔒', title: 'Sécurité garantie',    desc: 'Voyages assurés, accompagnement professionnel et assistance 24h/24.' },
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

      {/* ══ CTA FINAL ══ */}
      <section className="ci-cta">
        <div className="ci-cta__bg" />
        <div className="ci-container">
          <div className="ci-cta__content">
            <span className="ci-cta__tag">Circuit sur mesure</span>
            <h2>Vous avez un itinéraire en tête ?</h2>
            <p>Notre équipe conçoit des circuits 100% personnalisés selon vos envies, votre budget et votre rythme.</p>
            <div className="ci-cta__btns">
              <button className="ci-cta__btn ci-cta__btn--primary" onClick={() => navigate('/CustomTripAbroad')}>
                Créer mon circuit sur mesure
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
    </div>
  );
}