// src/pages/Details.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from  '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css';

// Construit une galerie mixte :
// - image principale provenant des données du voyage
// - images d'appoint générées depuis Unsplash pour enrichir visuellement la page détail
const buildGallery = (mainImage, destination) => {
  const queries = [
    `${destination} travel landscape`, `${destination} architecture`,
    `${destination} food culture`,     `${destination} street`,
  ];
  const extras = [10,20,30,40].map((s, i) =>
    `https://source.unsplash.com/800x600/?${encodeURIComponent(queries[i] || destination)}&sig=${s}`
  );
  return [mainImage, ...extras];
};

const Details = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { id }     = useParams();
  const { t }      = useTranslation('destinations');
  const [lightbox, setLightbox] = useState(null);

  // Si l'utilisateur arrive sur la page sans state React Router,
  // on affiche un fallback simple au lieu de casser le rendu.
  if (!state?.voyage) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign:'center', padding:'160px 24px' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>😕</div>
          <p style={{ fontSize:'18px', fontWeight:700, color:'#0a2832', marginBottom:16 }}>{t('not_found')}</p>
          <button onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}
            style={{ padding:'14px 28px', background:'linear-gradient(135deg,#e8306a,#b72754)', color:'#fff', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer' }}>
            {t('back_to_voyages')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Les données voyage sont injectées depuis la page liste/détail précédente,
  // ce qui évite ici un nouvel appel backend.
  const { titre, destination, pays, image, prix, duree, rating=4.8, avis=124, description, depart,
    programme=[], inclus=[], nonInclus=[], places, badge } = state.voyage;
  const gallery = buildGallery(image, destination || pays);

  // Action principale de la page détail :
  // envoyer l'utilisateur vers le formulaire de réservation avec le voyage courant.
  const handleReserver = () =>
    navigate(`/VoyagesOrganise/Reserver/${id}`, { state: { voyage: state.voyage } });

  // Navigation de la lightbox locale pour parcourir la galerie.
  const prevPhoto = () => setLightbox(i => (i - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setLightbox(i => (i + 1) % gallery.length);

  return (
    <div className="detail-page">
      <Navbar />

      {/* Hero de détail : résumé visuel + méta-informations importantes du séjour. */}
      <section className="detail-hero">
        <img src={image} alt={titre} className="detail-hero__img" />
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="container">
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn" onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>
                {t('back_to_voyages')}
              </button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">{pays}</span>
            </div>
            {badge && <div className="detail-hero__badge">{badge}</div>}
            <h1 className="detail-hero__title">{titre}</h1>
            <div className="detail-hero__meta">
              {[
                { icon:'⭐', text: t('hero.rating',    { score: rating, count: avis }) },
                { icon:'🕐', text: duree },
                { icon:'✈️', text: t('hero.departure', { city: depart }) },
                { icon:'👥', text: t('hero.places',    { count: places }) },
              ].map((pill, i) => (
                <span className="detail-hero__pill" key={i}><i>{pill.icon}</i> {pill.text}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bloc de synthèse rapide pour les informations clés du voyage. */}
      <div className="detail-stats">
        <div className="container">
          <div className="detail-stats__grid">
            {[
              { icon:'🌍', label: t('stats.destination'), value: `${pays} — ${destination}` },
              { icon:'📅', label: t('stats.duration'),    value: duree },
              { icon:'✈️', label: t('stats.departure'),   value: depart },
              { icon:'👥', label: t('stats.places'),      value: `${places} places` },
            ].map((s, i) => (
              <div className="detail-stats__item" key={i}>
                <div className="detail-stats__icon">{s.icon}</div>
                <div><div className="detail-stats__label">{s.label}</div><div className="detail-stats__value">{s.value}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corps de page : description, programme, galerie, inclus/non inclus, sidebar prix. */}
      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">
            <div>
              <div className="detail-card">
                <div className="detail-card__head"><div className="detail-card__accent"/><h3 className="detail-card__title">{t('about_title')}</h3></div>
                <p className="detail-desc">{description}</p>
              </div>

              {programme.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head"><div className="detail-card__accent"/><h3 className="detail-card__title">{t('programme_title')}</h3></div>
                  <div className="detail-programme">
                    {programme.map((item, i) => (
                      <div className="detail-prog-item" key={i}>
                        <div className="detail-prog-circle">J{i+1}</div>
                        <div className="detail-prog-body">
                          <div className="detail-prog-label">{t('day_label', { number: i+1 })}</div>
                          <div className="detail-prog-text">{item}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-card">
                <div className="detail-card__head"><div className="detail-card__accent"/><h3 className="detail-card__title">{t('gallery_title')}</h3></div>
                <div className="detail-gallery-grid">
                  {gallery.slice(0,5).map((src, i) => (
                    <div key={i} className={`detail-gal-item ${i===0?'detail-gal-item--main':''}`} onClick={() => setLightbox(i)}>
                      <img src={src} alt={`${titre} ${i+1}`} />
                      <div className="detail-gal-overlay">
                        {i===4 && gallery.length>5 ? <div className="detail-gal-more"><span>+{gallery.length-5}</span><span>photos</span></div> : <span>🔍</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {inclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head"><div className="detail-card__accent"/><h3 className="detail-card__title">{t('included_title')}</h3></div>
                  <div className="detail-includes-grid">
                    {inclus.map((item, i) => <div key={i} className="detail-inc-tag"><div className="detail-inc-icon">✓</div>{item}</div>)}
                  </div>
                </div>
              )}

              {nonInclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head"><div className="detail-card__accent"/><h3 className="detail-card__title">{t('not_included_title')}</h3></div>
                  <div className="detail-includes-grid">
                    {nonInclus.map((item, i) => <div key={i} className="detail-inc-tag detail-inc-tag--excl"><div className="detail-inc-icon">✕</div>{item}</div>)}
                  </div>
                </div>
              )}
            </div>

            <aside className="detail-sidebar">
              <div className="detail-price-card">
                <div className="detail-price-main">
                  <span className="detail-price-amount">{prix.toLocaleString('fr-FR')}</span>
                  <span className="detail-price-curr">TND</span>
                </div>
                <div className="detail-price-unit">{t('per_person_taxes')}</div>
                <div className="detail-price-divider"/>
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1,2,3,4,5].map(s => <span key={s} className={`detail-star ${s<=Math.round(rating)?'detail-star--on':'detail-star--off'}`}>★</span>)}
                  </div>
                  <span className="detail-rating-txt">{t('rating_label', { score: rating, count: avis })}</span>
                </div>
                <ul className="detail-perks">
                  {[
                    t('perks.cancel'), t('perks.guide'),
                    t('perks.support'), t('perks.transfer'),
                  ].map((perk, i) => (
                    <li key={i}><div className="detail-perk-check">✓</div>{perk}</li>
                  ))}
                </ul>
                <button className="detail-reserve-btn" onClick={handleReserver}>{t('reserve_btn')}</button>
                <button className="detail-back-btn" onClick={() => navigate(-1)}>{t('back_btn')}</button>
                <p className="detail-sidebar-note">{t('price_note')}</p>
                <div className="detail-spots-badge">{t('spots_warning', { count: places })}</div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Lightbox plein écran pour consulter les photos une par une. */}
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

export default Details;
