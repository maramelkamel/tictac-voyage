import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css';

/* ── gallery helper: generate extra Unsplash photos from the hero image ── */
const buildGallery = (mainImage, destination) => {
  const queries = [
    `${destination} travel landscape`,
    `${destination} architecture`,
    `${destination} food culture`,
    `${destination} street`,
  ];
  const seeds = [10, 20, 30, 40];
  const extras = seeds.map((s, i) =>
    `https://source.unsplash.com/800x600/?${encodeURIComponent(queries[i] || destination)}&sig=${s}`
  );
  return [mainImage, ...extras];
};

const Details = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { id }     = useParams();
  const [lightbox, setLightbox] = useState(null); // index | null

  /* ── Fallback ── */
  if (!state?.voyage) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            Voyage introuvable.
          </p>
          <button
            onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#e8306a,#b72754)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            ← Retour aux voyages
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    titre, destination, pays, image, prix, duree,
    rating = 4.8, avis = 124, description, depart,
    programme = [], inclus = [], nonInclus = [],
    places, badge,
  } = state.voyage;

  const gallery = buildGallery(image, destination || pays);

  const handleReserver = () =>
    navigate(`/VoyagesOrganise/Reserver/${id}`, { state: { voyage: state.voyage } });

  const prevPhoto = () => setLightbox(i => (i - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setLightbox(i => (i + 1) % gallery.length);

  return (
    <div className="detail-page">
      <Navbar />

      {/* ════════════ HERO ════════════ */}
      <section className="detail-hero">
        <img src={image} alt={titre} className="detail-hero__img" />
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="container">
            {/* Breadcrumb */}
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn"
                onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>
                ← Voyages organisés
              </button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">{pays}</span>
            </div>

            {badge && <div className="detail-hero__badge">{badge}</div>}
            <h1 className="detail-hero__title">{titre}</h1>

            <div className="detail-hero__meta">
              {[
                { icon: '⭐', text: `${rating} (${avis} avis)` },
                { icon: '🕐', text: duree },
                { icon: '✈️', text: `Départ ${depart}` },
                { icon: '👥', text: `${places} places restantes` },
              ].map((pill, i) => (
                <span className="detail-hero__pill" key={i}>
                  <i>{pill.icon}</i> {pill.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ STATS STRIP ════════════ */}
      <div className="detail-stats">
        <div className="container">
          <div className="detail-stats__grid">
            {[
              { icon: '🌍', label: 'Destination',   value: `${pays} — ${destination}` },
              { icon: '📅', label: 'Durée',          value: duree },
              { icon: '✈️', label: 'Départ',         value: depart },
              { icon: '👥', label: 'Places restantes', value: `${places} places` },
            ].map((s, i) => (
              <div className="detail-stats__item" key={i}>
                <div className="detail-stats__icon">{s.icon}</div>
                <div>
                  <div className="detail-stats__label">{s.label}</div>
                  <div className="detail-stats__value">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════ BODY ════════════ */}
      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">

            {/* ══ LEFT column ══ */}
            <div>

              {/* Description */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">📖 À propos de ce voyage</h3>
                </div>
                <p className="detail-desc">{description}</p>
              </div>

              {/* Programme */}
              {programme.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">🗓️ Programme jour par jour</h3>
                  </div>
                  <div className="detail-programme">
                    {programme.map((item, i) => (
                      <div className="detail-prog-item" key={i}>
                        <div className="detail-prog-circle">J{i + 1}</div>
                        <div className="detail-prog-body">
                          <div className="detail-prog-label">Jour {i + 1}</div>
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
                  <h3 className="detail-card__title">📸 Galerie photos</h3>
                </div>
                <div className="detail-gallery-grid">
                  {gallery.slice(0, 5).map((src, i) => (
                    <div
                      key={i}
                      className={`detail-gal-item ${i === 0 ? 'detail-gal-item--main' : ''}`}
                      onClick={() => setLightbox(i)}
                    >
                      <img src={src} alt={`${titre} ${i + 1}`} />
                      <div className="detail-gal-overlay">
                        {i === 4 && gallery.length > 5 ? (
                          <div className="detail-gal-more">
                            <span>+{gallery.length - 5}</span>
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
              {inclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">✅ Ce qui est inclus</h3>
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
              {nonInclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">❌ Non inclus</h3>
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

            {/* ══ RIGHT sidebar ══ */}
            <aside className="detail-sidebar">
              <div className="detail-price-card">

                {/* Price */}
                <div className="detail-price-main">
                  <span className="detail-price-amount">{prix.toLocaleString('fr-FR')}</span>
                  <span className="detail-price-curr">TND</span>
                </div>
                <div className="detail-price-unit">par personne · taxes incluses</div>

                <div className="detail-price-divider" />

                {/* Rating */}
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`detail-star ${s <= Math.round(rating) ? 'detail-star--on' : 'detail-star--off'}`}>★</span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">{rating} ({avis} avis)</span>
                </div>

                {/* Perks */}
                <ul className="detail-perks">
                  {[
                    'Annulation gratuite sous 48h',
                    'Guide francophone inclus',
                    'Assistance 24h/7j',
                    'Transferts aéroport inclus',
                  ].map((perk, i) => (
                    <li key={i}>
                      <div className="detail-perk-check">✓</div>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className="detail-reserve-btn" onClick={handleReserver}>
                  Réserver ce voyage →
                </button>
                <button className="detail-back-btn" onClick={() => navigate(-1)}>
                  ← Retour à la liste
                </button>

                <p className="detail-sidebar-note">
                  Aucun paiement immédiat. Un conseiller vous contactera sous 24h.
                </p>
                <div className="detail-spots-badge">
                  🔥 Plus que {places} places disponibles !
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>

      {/* ════════════ LIGHTBOX ════════════ */}
      {lightbox !== null && (
        <div className="detail-lightbox" onClick={() => setLightbox(null)}>
          <button className="detail-lb-close" onClick={e => { e.stopPropagation(); setLightbox(null); }}>✕</button>
          <button className="detail-lb-nav detail-lb-prev" onClick={e => { e.stopPropagation(); prevPhoto(); }}>‹</button>
          <img src={gallery[lightbox]} alt={`Photo ${lightbox + 1}`} onClick={e => e.stopPropagation()} />
          <button className="detail-lb-nav detail-lb-next" onClick={e => { e.stopPropagation(); nextPhoto(); }}>›</button>
          <div className="detail-lb-counter">{lightbox + 1} / {gallery.length}</div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Details;