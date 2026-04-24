// src/pages/Circuits/CircuitDetails.jsx
// ── Fix i18n : toutes les clés corrigées (detail.duration_label → t('detail.duration_label'))
// ── Galerie : priorité aux images DB (circuit.gallery), fallback Unsplash
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css';

const API = 'http://localhost:5000/api/circuits';

const DIFF_META = {
  Facile:   { color: '#10b981', bg: '#d1fae5', icon: '●' },
  Modere:   { color: '#f97316', bg: '#fff7ed', icon: '●' },
  'Modéré': { color: '#f97316', bg: '#fff7ed', icon: '●' },
  Aventure: { color: '#E92F64', bg: 'rgba(233,47,100,.1)', icon: '●' },
};

const normalizeCircuit = (circuit) => ({
  id:          circuit.id,
  title:       circuit.title,
  subtitle:    circuit.subtitle,
  description: circuit.description,
  image:       circuit.image_url || circuit.image,
  price:       Number(circuit.price ?? 0),
  oldPrice:    circuit.old_price ? Number(circuit.old_price) : null,
  duration:    circuit.duration
    ? `${circuit.duration} jours / ${circuit.nights || circuit.duration - 1} nuits`
    : circuit.duration,
  rating:      Number(circuit.rating) || 5,
  avis:        Number(circuit.reviews) || 0,
  departure:   circuit.departure,
  programme:   circuit.programme   || [],
  inclus:      circuit.inclus      || [],
  nonInclus:   circuit.non_inclus  || [],
  places:      Number(circuit.available_spots ?? circuit.spots ?? 0),
  badge:       circuit.badge,
  difficulty:  circuit.difficulty  || 'Facile',
  group:       circuit.group_size  || '2 - 15 personnes',
  highlights:  circuit.highlights  || [],
  gallery:     circuit.gallery     || [],
  region:      circuit.region,
});

/**
 * Construit la galerie :
 * 1. Images DB (circuit.gallery)
 * 2. Image principale (circuit.image)
 * 3. Fallback Unsplash si galerie vide
 */
const buildGallery = (mainImage, galleryImages = [], title = '') => {
  // Priorité aux images enregistrées en DB
  const dbImages = galleryImages.filter(Boolean);
  if (dbImages.length > 0) {
    // S'assure que l'image principale est en premier si pas déjà présente
    if (mainImage && !dbImages.includes(mainImage)) {
      return [mainImage, ...dbImages];
    }
    return dbImages;
  }

  // Fallback Unsplash générique Tunisie
  const queries = [
    `${title} tunisia landscape`,
    'tunisia culture travel',
    'tunisia nature scenery',
    'tunisia desert',
  ];
  const extras = queries.map(
    (q, i) => `https://source.unsplash.com/800x600/?${encodeURIComponent(q)}&sig=${i * 11}`
  );
  return [mainImage, ...extras].filter(Boolean);
};

const CircuitDetails = () => {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { t }       = useTranslation('circuits');
  const [lightbox,  setLightbox]  = useState(null);
  const [circuit,   setCircuit]   = useState(state?.circuit || null);
  const [loading,   setLoading]   = useState(!state?.circuit);

  useEffect(() => {
    if (state?.circuit || !id) { setLoading(false); return; }
    fetch(`${API}/${id}`)
      .then(r => r.json())
      .then(json => setCircuit(json.data ? normalizeCircuit(json.data) : null))
      .catch(() => setCircuit(null))
      .finally(() => setLoading(false));
  }, [id, state?.circuit]);

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign:'center', padding:'160px 24px' }}>
          <div style={{ width:40, height:40, border:'3px solid #e2e8f0', borderTopColor:'#0F4C5C', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 16px' }}/>
          <p style={{ color:'#94a3b8' }}>Chargement du circuit...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign:'center', padding:'160px 24px' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>?</div>
          <p style={{ fontSize:'18px', fontWeight:700, color:'#0a2832', marginBottom:16 }}>
            {t('not_found')}
          </p>
          <button
            onClick={() => navigate('/circuits/circuit')}
            style={{ padding:'14px 28px', background:'linear-gradient(135deg,#e8306a,#b72754)', color:'#fff', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer' }}
          >
            {t('back_to_circuits')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    title, subtitle, description, image, price, oldPrice,
    duration, rating, avis, departure, programme, inclus, nonInclus,
    places, badge, difficulty, group, highlights, gallery, region,
  } = circuit;

  const galleryImages = buildGallery(image, gallery, title);
  const diffMeta = DIFF_META[difficulty] || DIFF_META.Facile;
  const isFull   = places <= 0;

  const prevPhoto = () => setLightbox(i => (i - 1 + galleryImages.length) % galleryImages.length);
  const nextPhoto = () => setLightbox(i => (i + 1) % galleryImages.length);

  return (
    <div className="detail-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="detail-hero">
        <img src={image} alt={title} className="detail-hero__img" />
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="container">
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn" onClick={() => navigate('/circuits/circuit')}>
                {t('back_to_circuits')}
              </button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">
                {region === 'nord' ? t('region_nord') : t('region_sud')}
              </span>
            </div>
            {badge && <div className="detail-hero__badge">{badge}</div>}
            <h1 className="detail-hero__title">{title}</h1>
            <div className="detail-hero__meta">
              {[
                { icon:'★', text: t('detail.rating_label', { score: rating, count: avis }) },
                { icon:'⏱', text: duration },
                { icon:'✈', text: `${t('detail.departure_label')} ${departure || 'Tunis'}` },
                { icon:'👥', text: t('places_remaining', { count: places }) },
              ].map((pill, i) => (
                <span className="detail-hero__pill" key={i}>
                  <i>{pill.icon}</i> {pill.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="detail-stats">
        <div className="container">
          <div className="detail-stats__grid">
            {[
              { icon:'🗺', label: t('detail.region_label'),   value: region === 'nord' ? 'Tunisie Nord' : 'Tunisie Sud' },
              { icon:'📅', label: t('detail.duration_label'), value: duration },
              { icon:'✈', label: t('detail.departure_label').replace(':', ''), value: departure || 'Tunis' },
              { icon:'👥', label: t('detail.group_label'),    value: group || '2 - 15 personnes' },
            ].map((item, i) => (
              <div className="detail-stats__item" key={i}>
                <div className="detail-stats__icon">{item.icon}</div>
                <div>
                  <div className="detail-stats__label">{item.label}</div>
                  <div className="detail-stats__value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">
            <div>

              {/* À propos */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">{t('about_circuit')}</h3>
                </div>
                <p className="detail-desc">{description}</p>
                {subtitle && (
                  <p style={{ marginTop:12, fontSize:14, color:'#1a6b80', fontWeight:600, fontStyle:'italic' }}>
                    {subtitle}
                  </p>
                )}
                <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ padding:'6px 16px', borderRadius:999, fontSize:12, fontWeight:700, background:diffMeta.bg, color:diffMeta.color }}>
                    {diffMeta.icon} {t('difficulty', { level: difficulty })}
                  </span>
                  {group && <span style={{ fontSize:12, color:'#64748b' }}>{group}</span>}
                </div>
              </div>

              {/* Points forts */}
              {highlights && highlights.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">{t('highlights')}</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {highlights.map((item, i) => (
                      <div key={i} className="detail-inc-tag">
                        <div className="detail-inc-icon">📍</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Programme */}
              {programme && programme.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">{t('programme_title')}</h3>
                  </div>
                  <div className="detail-programme">
                    {programme.map((item, i) => (
                      <div className="detail-prog-item" key={i}>
                        <div className="detail-prog-circle">J{i + 1}</div>
                        <div className="detail-prog-body">
                          <div className="detail-prog-label">{t('day_label', { number: i + 1 })}</div>
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
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">{t('gallery_title')}</h3>
                </div>
                <div className="detail-gallery-grid">
                  {galleryImages.slice(0, 5).map((src, i) => (
                    <div
                      key={i}
                      className={`detail-gal-item ${i === 0 ? 'detail-gal-item--main' : ''}`}
                      onClick={() => setLightbox(i)}
                    >
                      <img src={src} alt={`${title} ${i + 1}`} />
                      <div className="detail-gal-overlay">
                        {i === 4 && galleryImages.length > 5 ? (
                          <div className="detail-gal-more">
                            <span>+{galleryImages.length - 5}</span>
                            <span>photos</span>
                          </div>
                        ) : (
                          <span>🔍</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclus */}
              {inclus && inclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">{t('included_title')}</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {inclus.map((item, i) => (
                      <div key={i} className="detail-inc-tag">
                        <div className="detail-inc-icon">✓</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Non inclus */}
              {nonInclus && nonInclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">{t('not_included_title')}</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {nonInclus.map((item, i) => (
                      <div key={i} className="detail-inc-tag detail-inc-tag--excl">
                        <div className="detail-inc-icon">✕</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── Sidebar ── */}
            <aside className="detail-sidebar">
              <div className="detail-price-card">
                <div className="detail-price-main">
                  <span className="detail-price-amount">{price.toLocaleString('fr-FR')}</span>
                  <span className="detail-price-curr">DT</span>
                </div>
                {oldPrice && (
                  <p style={{ fontSize:13, color:'#94a3b8', textDecoration:'line-through', marginBottom:4 }}>
                    {oldPrice.toLocaleString('fr-FR')} DT
                  </p>
                )}
                <div className="detail-price-unit">{t('per_person_taxes')}</div>
                <div className="detail-price-divider" />

                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={`detail-star ${star <= Math.round(rating) ? 'detail-star--on' : 'detail-star--off'}`}>★</span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">
                    {t('detail.rating_label', { score: rating, count: avis })}
                  </span>
                </div>

                <ul className="detail-perks">
                  {[
                    t('detail.perks.guide'),
                    t('detail.perks.transport'),
                    t('detail.perks.hotel'),
                    t('detail.perks.support'),
                  ].map((perk, i) => (
                    <li key={i}>
                      <div className="detail-perk-check">✓</div>
                      {perk}
                    </li>
                  ))}
                </ul>

                <button
                  className="detail-reserve-btn"
                  disabled={isFull}
                  onClick={() => !isFull && navigate(`/circuits/CircuitReserver/${id}`, { state: { circuit } })}
                  style={{ opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}
                >
                  {isFull ? t('circuit_complet') : t('reserve_btn')}
                </button>

                <button className="detail-back-btn" onClick={() => navigate('/circuits/circuit')}>
                  {t('back_to_list')}
                </button>

                <p className="detail-sidebar-note">{t('price_note')}</p>

                {!isFull && places <= 5 && (
                  <div className="detail-spots-badge">
                    {t('detail.spots_warning', { count: places })}
                  </div>
                )}
                {isFull && (
                  <div
                    className="detail-spots-badge"
                    style={{ background:'rgba(233,47,100,.08)', borderColor:'rgba(233,47,100,.22)', color:'#e92f64' }}
                  >
                    {t('detail.full_warning')}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className="detail-lightbox" onClick={() => setLightbox(null)}>
          <button className="detail-lb-close" onClick={e => { e.stopPropagation(); setLightbox(null); }}>✕</button>
          <button className="detail-lb-nav detail-lb-prev" onClick={e => { e.stopPropagation(); prevPhoto(); }}>‹</button>
          <img src={galleryImages[lightbox]} alt={`Photo ${lightbox + 1}`} onClick={e => e.stopPropagation()} />
          <button className="detail-lb-nav detail-lb-next" onClick={e => { e.stopPropagation(); nextPhoto(); }}>›</button>
          <div className="detail-lb-counter">{lightbox + 1} / {galleryImages.length}</div>
        </div>
      )}

      <Footer />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CircuitDetails;