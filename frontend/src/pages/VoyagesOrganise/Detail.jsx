import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css';

const API = 'http://localhost:5000/api/voyages-organises';

const normalizeVoyage = (voyage) => ({
  id: voyage.id,
  titre: voyage.title || voyage.titre,
  destination: voyage.destination,
  pays: voyage.pays,
  image: voyage.image_url || voyage.image,
  gallery: voyage.gallery || [],
  prix: Number(voyage.price ?? voyage.prix ?? 0),
  duree: voyage.duree || `${voyage.duration} jours`,
  rating: Number(voyage.rating) || 4.8,
  avis: Number(voyage.reviews ?? voyage.avis ?? 124) || 124,
  description: voyage.description,
  depart: voyage.departure || voyage.depart,
  programme: voyage.programme || [],
  inclus: voyage.inclus || [],
  nonInclus: voyage.non_inclus || voyage.nonInclus || [],
  places: Number(voyage.available_spots ?? voyage.places ?? 0),
  badge: voyage.badge,
});

const buildGallery = (mainImage, galleryImages = [], destination) => {
  const dbImages = (galleryImages || []).filter(Boolean);
  if (dbImages.length > 0) {
    if (mainImage && !dbImages.includes(mainImage)) return [mainImage, ...dbImages];
    return dbImages;
  }

  const queries = [
    `${destination} travel landscape`,
    `${destination} architecture`,
    `${destination} food culture`,
    `${destination} street`,
  ];
  const extras = [10, 20, 30, 40].map(
    (seed, index) =>
      `https://source.unsplash.com/800x600/?${encodeURIComponent(queries[index] || destination)}&sig=${seed}`
  );
  return [mainImage, ...extras].filter(Boolean);
};

const Details = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('destinations');
  const [lightbox, setLightbox] = useState(null);
  const [voyage, setVoyage] = useState(state?.voyage ? normalizeVoyage(state.voyage) : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`${API}/${id}`, { cache: 'no-store' })
      .then((response) => response.json())
      .then((json) => setVoyage(json.data ? normalizeVoyage(json.data) : null))
      .catch(() => setVoyage(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #e2e8f0',
              borderTopColor: '#e8306a',
              borderRadius: '50%',
              animation: 'spin .7s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#94a3b8' }}>Chargement du voyage...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!voyage) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>?</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            {t('not_found')}
          </p>
          <button
            onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg,#e8306a,#b72754)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('back_to_voyages')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    titre,
    destination,
    pays,
    image,
    prix,
    duree,
    rating = 4.8,
    avis = 124,
    description,
    depart,
    programme = [],
    inclus = [],
    nonInclus = [],
    places,
    badge,
  } = voyage;

  const gallery = buildGallery(image, voyage.gallery, destination || pays);

  const handleReserver = () =>
    navigate(`/VoyagesOrganise/Reserver/${id}`, { state: { voyage } });

  const prevPhoto = () => setLightbox((index) => (index - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setLightbox((index) => (index + 1) % gallery.length);

  return (
    <div className="detail-page">
      <Navbar />

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
                { icon: '★', text: t('hero.rating', { score: rating, count: avis }) },
                { icon: '⏱', text: duree },
                { icon: '✈', text: t('hero.departure', { city: depart }) },
                { icon: '👥', text: t('hero.places', { count: places }) },
              ].map((pill, index) => (
                <span className="detail-hero__pill" key={index}>
                  <i>{pill.icon}</i> {pill.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="detail-stats">
        <div className="container">
          <div className="detail-stats__grid">
            {[
              { icon: '🌍', label: t('stats.destination'), value: `${pays} - ${destination}` },
              { icon: '📅', label: t('stats.duration'), value: duree },
              { icon: '✈', label: t('stats.departure'), value: depart },
              { icon: '👥', label: t('stats.places'), value: `${places} places` },
            ].map((item, index) => (
              <div className="detail-stats__item" key={index}>
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

      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">
            <div>
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">{t('about_title')}</h3>
                </div>
                <p className="detail-desc">{description}</p>
              </div>

              {programme.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">{t('programme_title')}</h3>
                  </div>
                  <div className="detail-programme">
                    {programme.map((item, index) => (
                      <div className="detail-prog-item" key={index}>
                        <div className="detail-prog-circle">J{index + 1}</div>
                        <div className="detail-prog-body">
                          <div className="detail-prog-label">{t('day_label', { number: index + 1 })}</div>
                          <div className="detail-prog-text">{item}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">{t('gallery_title')}</h3>
                </div>
                <div className="detail-gallery-grid">
                  {gallery.slice(0, 5).map((src, index) => (
                    <div
                      key={index}
                      className={`detail-gal-item ${index === 0 ? 'detail-gal-item--main' : ''}`}
                      onClick={() => setLightbox(index)}
                    >
                      <img src={src} alt={`${titre} ${index + 1}`} />
                      <div className="detail-gal-overlay">
                        {index === 4 && gallery.length > 5 ? (
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

              {inclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">{t('included_title')}</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {inclus.map((item, index) => (
                      <div key={index} className="detail-inc-tag">
                        <div className="detail-inc-icon">✓</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nonInclus.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">{t('not_included_title')}</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {nonInclus.map((item, index) => (
                      <div key={index} className="detail-inc-tag detail-inc-tag--excl">
                        <div className="detail-inc-icon">✕</div>
                        {item}
                      </div>
                    ))}
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
                <div className="detail-price-divider" />
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`detail-star ${star <= Math.round(rating) ? 'detail-star--on' : 'detail-star--off'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">{t('rating_label', { score: rating, count: avis })}</span>
                </div>
                <ul className="detail-perks">
                  {[t('perks.cancel'), t('perks.guide'), t('perks.support'), t('perks.transfer')].map((perk, index) => (
                    <li key={index}>
                      <div className="detail-perk-check">✓</div>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className="detail-reserve-btn" onClick={handleReserver}>
                  {t('reserve_btn')}
                </button>
                <button className="detail-back-btn" onClick={() => navigate(-1)}>
                  {t('back_btn')}
                </button>
                <p className="detail-sidebar-note">{t('price_note')}</p>
                <div className="detail-spots-badge">{t('spots_warning', { count: places })}</div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div className="detail-lightbox" onClick={() => setLightbox(null)}>
          <button className="detail-lb-close" onClick={(event) => { event.stopPropagation(); setLightbox(null); }}>
            ✕
          </button>
          <button className="detail-lb-nav detail-lb-prev" onClick={(event) => { event.stopPropagation(); prevPhoto(); }}>
            ‹
          </button>
          <img src={gallery[lightbox]} alt={`Photo ${lightbox + 1}`} onClick={(event) => event.stopPropagation()} />
          <button className="detail-lb-nav detail-lb-next" onClick={(event) => { event.stopPropagation(); nextPhoto(); }}>
            ›
          </button>
          <div className="detail-lb-counter">
            {lightbox + 1} / {gallery.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Details;
