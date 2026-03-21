// src/pages/Circuits/CircuitDetails.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css';

const buildGallery = (mainImage, title) => {
  const queries = [`${title} tunisia landscape`, `tunisia culture travel`, `tunisia nature scenery`, `tunisia architecture`];
  const extras = queries.map((q, i) => `https://source.unsplash.com/800x600/?${encodeURIComponent(q)}&sig=${i * 11}`);
  return [mainImage, ...extras].filter(Boolean);
};

const DIFF_META = {
  'Facile':   { color: '#10b981', bg: '#d1fae5', icon: '🟢' },
  'Modéré':   { color: '#f97316', bg: '#fff7ed', icon: '🟡' },
  'Aventure': { color: '#E92F64', bg: 'rgba(233,47,100,.1)', icon: '🔴' },
};

const CircuitDetails = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { id }     = useParams();
  const [lightbox, setLightbox] = useState(null);

  if (!state?.circuit) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign:'center', padding:'160px 24px' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>😕</div>
          <p style={{ fontSize:'18px', fontWeight:700, color:'#0a2832', marginBottom:16 }}>Circuit introuvable.</p>
          <button onClick={() => navigate('/circuits')} style={{ padding:'14px 28px', background:'linear-gradient(135deg,#e8306a,#b72754)', color:'#fff', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer' }}>
            ← Retour aux circuits
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const c = state.circuit;
  const { title, subtitle, description, image, price, oldPrice, duration, days, rating, avis, departure, programme, inclus, nonInclus, places, badge, difficulty, group, highlights, region } = c;

  const gallery  = buildGallery(image, title);
  const diffMeta = DIFF_META[difficulty] || DIFF_META['Facile'];
  const isFull   = places <= 0;

  const prevPhoto = () => setLightbox(i => (i - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setLightbox(i => (i + 1) % gallery.length);

  return (
    <div className="detail-page">
      <Navbar />

      {/* HERO */}
      <section className="detail-hero">
        <img src={image} alt={title} className="detail-hero__img" />
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="container">
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn" onClick={() => navigate('/circuits')}>← Circuits</button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">{region === 'nord' ? '🏛️ Circuit Nord' : '🏜️ Circuit Sud'}</span>
            </div>
            {badge && <div className="detail-hero__badge">{badge}</div>}
            <h1 className="detail-hero__title">{title}</h1>
            <div className="detail-hero__meta">
              {[
                { icon:'⭐', text:`${rating} (${avis} avis)` },
                { icon:'🕐', text:duration },
                { icon:'✈️', text:`Départ ${departure || 'Tunis'}` },
                { icon:'👥', text:`${places} places restantes` },
              ].map((pill, i) => (
                <span className="detail-hero__pill" key={i}><i>{pill.icon}</i> {pill.text}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="detail-stats">
        <div className="container">
          <div className="detail-stats__grid">
            {[
              { icon:'🗺️', label:'Région',    value: region === 'nord' ? 'Tunisie Nord' : 'Tunisie Sud' },
              { icon:'📅', label:'Durée',     value: duration },
              { icon:'✈️', label:'Départ',    value: departure || 'Tunis' },
              { icon:'👥', label:'Groupe',    value: group || '2 – 15 personnes' },
            ].map((s, i) => (
              <div className="detail-stats__item" key={i}>
                <div className="detail-stats__icon">{s.icon}</div>
                <div><div className="detail-stats__label">{s.label}</div><div className="detail-stats__value">{s.value}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">
            <div>

              {/* Description */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent"/>
                  <h3 className="detail-card__title">📖 À propos de ce circuit</h3>
                </div>
                <p className="detail-desc">{description}</p>
                {subtitle && <p style={{ marginTop:12, fontSize:14, color:'#1a6b80', fontWeight:600, fontStyle:'italic' }}>✨ {subtitle}</p>}

                {/* Difficulté */}
                <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ padding:'6px 16px', borderRadius:999, fontSize:12, fontWeight:700, background:diffMeta.bg, color:diffMeta.color }}>
                    {diffMeta.icon} Niveau : {difficulty}
                  </span>
                  {group && <span style={{ fontSize:12, color:'#64748b' }}>👥 {group}</span>}
                </div>
              </div>

              {/* Points forts */}
              {highlights && highlights.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent"/>
                    <h3 className="detail-card__title">⭐ Points forts du circuit</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {highlights.map((h, i) => (
                      <div key={i} className="detail-inc-tag">
                        <div className="detail-inc-icon">📍</div>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Programme */}
              {programme && programme.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent"/>
                    <h3 className="detail-card__title">🗓️ Programme jour par jour</h3>
                  </div>
                  <div className="detail-programme">
                    {programme.map((item, i) => (
                      <div className="detail-prog-item" key={i}>
                        <div className="detail-prog-circle">J{i+1}</div>
                        <div className="detail-prog-body">
                          <div className="detail-prog-label">Jour {i+1}</div>
                          <div className="detail-prog-text">{item}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Galerie */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent"/>
                  <h3 className="detail-card__title">📸 Galerie photos</h3>
                </div>
                <div className="detail-gallery-grid">
                  {gallery.slice(0, 5).map((src, i) => (
                    <div key={i} className={`detail-gal-item ${i===0?'detail-gal-item--main':''}`} onClick={() => setLightbox(i)}>
                      <img src={src} alt={`${title} ${i+1}`} />
                      <div className="detail-gal-overlay">
                        {i===4 && gallery.length > 5 ? <div className="detail-gal-more"><span>+{gallery.length-5}</span><span>photos</span></div> : <span>🔍</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclus */}
              {inclus && inclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head"><div className="detail-card__accent"/><h3 className="detail-card__title">✅ Ce qui est inclus</h3></div>
                  <div className="detail-includes-grid">
                    {inclus.map((item, i) => <div key={i} className="detail-inc-tag"><div className="detail-inc-icon">✓</div>{item}</div>)}
                  </div>
                </div>
              )}

              {/* Non inclus */}
              {nonInclus && nonInclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head"><div className="detail-card__accent"/><h3 className="detail-card__title">❌ Non inclus</h3></div>
                  <div className="detail-includes-grid">
                    {nonInclus.map((item, i) => <div key={i} className="detail-inc-tag detail-inc-tag--excl"><div className="detail-inc-icon">✕</div>{item}</div>)}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="detail-sidebar">
              <div className="detail-price-card">
                <div className="detail-price-main">
                  <span className="detail-price-amount">{price.toLocaleString('fr-FR')}</span>
                  <span className="detail-price-curr">DT</span>
                </div>
                {oldPrice && <p style={{ fontSize:13, color:'#94a3b8', textDecoration:'line-through', marginBottom:4 }}>{oldPrice.toLocaleString('fr-FR')} DT</p>}
                <div className="detail-price-unit">par personne · taxes incluses</div>
                <div className="detail-price-divider"/>
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1,2,3,4,5].map(s => <span key={s} className={`detail-star ${s<=Math.round(rating)?'detail-star--on':'detail-star--off'}`}>★</span>)}
                  </div>
                  <span className="detail-rating-txt">{rating} ({avis} avis)</span>
                </div>
                <ul className="detail-perks">
                  {['Guide francophone inclus','Transport climatisé','Hébergement sélectionné','Assistance 24h/7j'].map((perk, i) => (
                    <li key={i}><div className="detail-perk-check">✓</div>{perk}</li>
                  ))}
                </ul>
                <button className="detail-reserve-btn" disabled={isFull} onClick={() => !isFull && navigate(`/circuits/CircuitReserver/${id}`, { state: { circuit: c } })}
                  style={{ opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}>
                  {isFull ? '❌ Circuit complet' : 'Réserver ce circuit →'}
                </button>
                <button className="detail-back-btn" onClick={() => navigate(-1)}>← Retour aux circuits</button>
                <p className="detail-sidebar-note">Aucun paiement immédiat. Un conseiller vous contactera sous 24h.</p>
                {!isFull && places <= 5 && (
                  <div className="detail-spots-badge">🔥 Plus que {places} places disponibles !</div>
                )}
                {isFull && (
                  <div className="detail-spots-badge" style={{ background:'rgba(233,47,100,.08)', borderColor:'rgba(233,47,100,.22)', color:'#e92f64' }}>
                    ❌ Ce circuit est complet
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div className="detail-lightbox" onClick={() => setLightbox(null)}>
          <button className="detail-lb-close" onClick={e => { e.stopPropagation(); setLightbox(null); }}>✕</button>
          <button className="detail-lb-nav detail-lb-prev" onClick={e => { e.stopPropagation(); prevPhoto(); }}>‹</button>
          <img src={gallery[lightbox]} alt={`Photo ${lightbox+1}`} onClick={e => e.stopPropagation()} />
          <button className="detail-lb-nav detail-lb-next" onClick={e => { e.stopPropagation(); nextPhoto(); }}>›</button>
          <div className="detail-lb-counter">{lightbox+1} / {gallery.length}</div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CircuitDetails;