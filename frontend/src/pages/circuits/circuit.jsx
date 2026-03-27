// src/pages/Circuits.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Circuits.css';
import { usePromotions }  from '../../hooks/usePromotions';
import PromotionsSection  from '../../components/PromotionsSection';

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

const IconClock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IconStar  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconArrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

// Normalize DB row → card shape
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

export default function Circuits() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nord');
  const [hovered,   setHovered]   = useState(null);
  const [allCircuits, setAll]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const { promos } = usePromotions('categorie', 'circuits');

  useEffect(() => {
    fetch(API).then(r => r.json()).then(j => setAll((j.data || []).map(normalize))).catch(console.error).finally(() => setLoading(false));
  }, []);

  const circuits = allCircuits.filter(c => c.region === activeTab);

  const nordMin = allCircuits.filter(c => c.region === 'nord').reduce((m, c) => Math.min(m, c.price), 9999);
  const sudMin  = allCircuits.filter(c => c.region === 'sud').reduce((m, c) => Math.min(m, c.price), 9999);

  const handleDetails  = (c) => navigate(`/circuits/CircuitDetails/${c.id}`,  { state: { circuit: c } });
  const handleReserver = (c) => navigate(`/circuits/CircuitReserver/${c.id}`, { state: { circuit: c } });

  return (
    <div className="ci-page">
      <Navbar />

      {/* HERO */}
      <section className="ci-hero">
        <div className="ci-hero__bg" />
        <div className="ci-hero__overlay" />
        <div className="ci-hero__geo ci-hero__geo--1" />
        <div className="ci-hero__geo ci-hero__geo--2" />
        <div className="ci-hero__content">
          <span className="ci-hero__tag"><IconMap />Circuits touristiques — Tunisie</span>
          <h1 className="ci-hero__title">Explorez la Tunisie<br/><span className="ci-hero__title--accent">du Nord au Sud</span></h1>
          <p className="ci-hero__sub">Des circuits soigneusement conçus pour vous faire découvrir les trésors du pays, entre mer, désert, culture et authenticité.</p>
          <div className="ci-hero__tabs">
            <button className={`ci-hero__tab${activeTab==='nord'?' active':''}`} onClick={() => setActiveTab('nord')}>
              <span className="ci-hero__tab-dot ci-hero__tab-dot--nord"/>Circuit Nord
            </button>
            <button className={`ci-hero__tab${activeTab==='sud'?' active':''}`} onClick={() => setActiveTab('sud')}>
              <span className="ci-hero__tab-dot ci-hero__tab-dot--sud"/>Circuit Sud
            </button>
          </div>
        </div>
      </section>

      {/* SPLIT */}
      {promos.length > 0 && (
  <section style={{ padding: '8px 0' }}>
    <div className="ci-container">
      <PromotionsSection promos={promos} />
    </div>
  </section>
)}
      <section className="ci-split">
        <div className="ci-container">
          <div className={`ci-split__inner ci-split__inner--${activeTab}`}>
            <div className={`ci-split__card ci-split__card--nord${activeTab==='nord'?' active':''}`} onClick={() => setActiveTab('nord')}>
              <div className="ci-split__card-bg ci-split__card-bg--nord"/>
              <div className="ci-split__card-overlay"/>
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">🏛️</div>
                <h2>Circuit Nord</h2>
                <p>Patrimoine, côtes sauvages, sites romains et forêts de pins du Tell.</p>
                <div className="ci-split__card-stats">
                  <span><strong>{allCircuits.filter(c=>c.region==='nord').length}</strong> circuits</span>
                  <span>dès <strong>{nordMin < 9999 ? `${nordMin} DT` : '—'}</strong></span>
                </div>
              </div>
              {activeTab==='nord' && <div className="ci-split__card-active-bar"/>}
            </div>
            <div className="ci-split__divider">
              <div className="ci-split__divider-line"/>
              <div className="ci-split__divider-badge">🇹🇳</div>
              <div className="ci-split__divider-line"/>
            </div>
            <div className={`ci-split__card ci-split__card--sud${activeTab==='sud'?' active':''}`} onClick={() => setActiveTab('sud')}>
              <div className="ci-split__card-bg ci-split__card-bg--sud"/>
              <div className="ci-split__card-overlay ci-split__card-overlay--sud"/>
              <div className="ci-split__card-content">
                <div className="ci-split__card-icon">🏜️</div>
                <h2>Circuit Sud</h2>
                <p>Désert doré, ksour berbères, oasis de palmiers et nuits sous les étoiles.</p>
                <div className="ci-split__card-stats">
                  <span><strong>{allCircuits.filter(c=>c.region==='sud').length}</strong> circuits</span>
                  <span>dès <strong>{sudMin < 9999 ? `${sudMin} DT` : '—'}</strong></span>
                </div>
              </div>
              {activeTab==='sud' && <div className="ci-split__card-active-bar"/>}
            </div>
          </div>
        </div>
      </section>

      {/* GRILLE */}
      <section className="ci-section">
        <div className="ci-container">
          <div className="ci-section__head">
            <div className="ci-section__head-left">
              <span className={`ci-section__badge ci-section__badge--${activeTab}`}>
                {activeTab==='nord' ? '🏛️ Circuit Nord' : '🏜️ Circuit Sud'}
              </span>
              <h2 className="ci-section__title">{activeTab==='nord' ? 'Découvrez le Nord de la Tunisie' : 'Aventures dans le Grand Sud'}</h2>
              <p className="ci-section__sub">{activeTab==='nord' ? 'Médinas historiques, côtes coraliennes, vestiges romains et montagnes verdoyantes.' : 'Sahara infini, villages berbères millénaires, oasis enchanteresses et ciels étoilés.'}</p>
            </div>
            <div className="ci-section__head-right">
              <div className="ci-section__switcher">
                <button className={`ci-switcher-btn${activeTab==='nord'?' active':''}`} onClick={() => setActiveTab('nord')}>Nord</button>
                <button className={`ci-switcher-btn${activeTab==='sud'?' active':''}`} onClick={() => setActiveTab('sud')}>Sud</button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:'#0F4C5C', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 16px' }}/>
              <p style={{ color:'#94a3b8' }}>Chargement des circuits...</p>
            </div>
          ) : circuits.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <p style={{ fontSize:16, color:'#64748b' }}>Aucun circuit disponible pour le moment.</p>
            </div>
          ) : (
            <div className="ci-grid">
              {circuits.map((circuit, i) => {
                const tagMeta  = TAG_COLORS[circuit.tagColor] || TAG_COLORS.teal;
                const diffMeta = DIFF_META[circuit.difficulty] || DIFF_META['Facile'];
                const isHov    = hovered === circuit.id;
                const isFull   = circuit.places <= 0;
                return (
                  <div key={circuit.id} className={`ci-card${isHov?' ci-card--hovered':''}`}
                    style={{ animationDelay:`${i*0.08}s` }}
                    onMouseEnter={() => setHovered(circuit.id)}
                    onMouseLeave={() => setHovered(null)}>
                    <div className="ci-card__img-wrap">
                      <img src={circuit.image} alt={circuit.title} className="ci-card__img" loading="lazy"/>
                      <div className="ci-card__img-overlay"/>
                      {circuit.tag && <span className="ci-card__tag" style={{ background:tagMeta.bg, color:tagMeta.color }}>{circuit.tag}</span>}
                      <span className="ci-card__duration"><IconClock/>{circuit.duration}</span>
                      {circuit.badge && <span style={{ position:'absolute', top:12, right:12, padding:'3px 10px', borderRadius:999, background:'#e8306a', color:'#fff', fontSize:10, fontWeight:800 }}>{circuit.badge}</span>}
                    </div>
                    <div className="ci-card__body">
                      <h3 className="ci-card__title">{circuit.title}</h3>
                      {circuit.subtitle && <p style={{ fontSize:12, color:'#64748b', marginBottom:8, fontStyle:'italic' }}>{circuit.subtitle}</p>}
                      <p className="ci-card__desc">{circuit.description}</p>
                      <div className="ci-card__highlights">
                        {circuit.highlights.slice(0,4).map((h, j) => (
                          <span key={j} className="ci-card__highlight"><IconCheck/>{h}</span>
                        ))}
                      </div>
                      <div className="ci-card__meta">
                        <span className="ci-card__meta-item"><IconUsers/>{circuit.group}</span>
                        <span className="ci-card__diff" style={{ background:diffMeta.bg, color:diffMeta.color }}><IconStar/>{circuit.difficulty}</span>
                      </div>
                      {/* Places */}
                      <div style={{ marginTop:8, fontSize:11, color: isFull ? '#e92f64' : circuit.places <= 5 ? '#f97316' : '#065f46', fontWeight:600 }}>
                        {isFull ? '❌ Complet' : circuit.places <= 5 ? `🔥 Plus que ${circuit.places} places !` : `✅ ${circuit.places} places disponibles`}
                      </div>
                    </div>
                    <div className="ci-card__footer">
                      <div className="ci-card__price">
                        <span className="ci-card__price-from">à partir de</span>
                        <span className="ci-card__price-val">{circuit.price} DT</span>
                        <span className="ci-card__price-per">/ pers.</span>
                        {circuit.oldPrice && <span style={{ fontSize:11, color:'#94a3b8', textDecoration:'line-through', marginLeft:6 }}>{circuit.oldPrice} DT</span>}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="ci-card__btn" style={{ background:'transparent', border:'1.5px solid var(--ci-teal)', color:'var(--ci-teal)', padding:'8px 14px' }} onClick={() => handleDetails(circuit)}>
                          Détails
                        </button>
                        <button className="ci-card__btn" onClick={() => !isFull && handleReserver(circuit)} disabled={isFull}
                          style={{ opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}>
                          Réserver<IconArrow/>
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

      {/* POURQUOI */}
      <section className="ci-why">
        <div className="ci-container">
          <div className="ci-why__head"><span className="ci-why__badge">Notre engagement</span><h2>Pourquoi choisir nos circuits ?</h2></div>
          <div className="ci-why__grid">
            {[
              { icon:'🧭', title:'Guides experts',       desc:'Accompagnateurs locaux passionnés, connaissant chaque recoin de la Tunisie.' },
              { icon:'🏨', title:'Hébergements choisis', desc:"Riads authentiques, maisons d'hôtes et bivouacs soigneusement sélectionnés." },
              { icon:'🚐', title:'Transport confortable', desc:'Véhicules climatisés et chauffeurs expérimentés pour tous vos déplacements.' },
              { icon:'🍽️', title:'Cuisine authentique',  desc:'Repas préparés par des locaux pour découvrir la vraie gastronomie tunisienne.' },
              { icon:'📸', title:'Moments inoubliables', desc:'Des itinéraires conçus pour créer des souvenirs que vous chérirez toute votre vie.' },
              { icon:'🔒', title:'Sécurité garantie',    desc:"Voyages assurés, accompagnement professionnel et assistance 24h/24." },
            ].map((item, i) => (
              <div key={i} className="ci-why__card">
                <div className="ci-why__icon">{item.icon}</div>
                <h3>{item.title}</h3><p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ci-cta">
        <div className="ci-cta__bg"/>
        <div className="ci-container">
          <div className="ci-cta__content">
            <span className="ci-cta__tag">Circuit sur mesure</span>
            <h2>Vous avez un itinéraire en tête ?</h2>
            <p>Notre équipe conçoit des circuits 100% personnalisés selon vos envies, votre budget et votre rythme.</p>
            <div className="ci-cta__btns">
              <button className="ci-cta__btn ci-cta__btn--primary" onClick={() => navigate('/CustomTripAbroad')}>
                Créer mon circuit sur mesure<IconArrow/>
              </button>
              <button className="ci-cta__btn ci-cta__btn--outline" onClick={() => navigate('/Contact')}>Nous contacter</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}