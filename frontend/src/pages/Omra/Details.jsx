import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css';

const API = 'http://localhost:5000/api/omra/packages';

const normalizePackage = (pkg) => ({
  ...pkg,
  price: Number(pkg.price ?? 0),
  old_price: pkg.old_price ? Number(pkg.old_price) : null,
  duration: Number(pkg.duration ?? 0),
  spots: Number(pkg.available_spots ?? pkg.spots ?? 0),
  rating: Number(pkg.rating) || 5,
  reviews: Number(pkg.reviews) || 0,
  includes: Array.isArray(pkg.includes)
    ? pkg.includes.map((item) => (typeof item === 'string' ? item : item?.label || '')).filter(Boolean)
    : [],
});

const Details = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();
  const [pkg, setPkg] = useState(state?.pkg ? normalizePackage(state.pkg) : null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`${API}/${id}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        setPkg(json.data ? normalizePackage(json.data) : null);
      })
      .catch(() => setPkg(null))
      .finally(() => setLoading(false));
  }, [id]);

  const gallery = useMemo(() => {
    const list = [pkg?.image_url || pkg?.image].filter(Boolean);
    return list.length > 0 ? list : [];
  }, [pkg]);

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
          <p style={{ color: '#94a3b8' }}>Chargement du forfait...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>?</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            Forfait introuvable.
          </p>
          <button
            onClick={() => navigate('/Omra/Omra')}
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
            Retour aux forfaits Omra
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const price = pkg.price || 0;
  const oldPrice = pkg.old_price || null;
  const duration = pkg.duration || 0;
  const departure = pkg.departure || '';
  const spots = pkg.spots || 0;
  const rating = pkg.rating || 5;
  const reviews = pkg.reviews || 0;
  const image = pkg.image_url || pkg.image || '';

  const detailFacts = [
    { label: 'Destination', value: 'Medine et La Mecque' },
    { label: 'Duree', value: `${duration} jours` },
    { label: 'Depart', value: departure || 'A confirmer' },
    { label: 'Disponibilite', value: spots > 0 ? `${spots} places restantes` : 'Complet' },
  ];

  const sidebarPerks = [
    duration ? `${duration} jours de sejour` : null,
    departure ? `Depart : ${departure}` : null,
    pkg.badge ? `Badge : ${pkg.badge}` : null,
    `${rating}/5 de note moyenne`,
    `${reviews} avis client${reviews > 1 ? 's' : ''}`,
    spots > 0 ? `${spots} places encore disponibles` : 'Depart complet',
  ].filter(Boolean);

  const handleReserve = () => navigate(`/Omra/Reserve/${pkg.id}`, { state: { pkg } });

  const prevPhoto = () => setLightbox((index) => (index - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setLightbox((index) => (index + 1) % gallery.length);

  return (
    <div className="detail-page">
      <Navbar />

      <section className="detail-hero">
        {image ? <img src={image} alt={pkg.title} className="detail-hero__img" /> : <div className="detail-hero__img" style={{ background: 'linear-gradient(135deg,#7c1034,#e8306a)' }} />}
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="container">
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn" onClick={() => navigate('/Omra/Omra')}>
                Omra
              </button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">{pkg.title}</span>
            </div>
            {pkg.badge && <div className="detail-hero__badge">{pkg.badge}</div>}
            <h1 className="detail-hero__title">{pkg.title}</h1>
            {pkg.subtitle && <p className="detail-hero__sub" style={{ maxWidth: 720 }}>{pkg.subtitle}</p>}
            <div className="detail-hero__meta">
              {[
                { icon: '*', text: `${rating} (${reviews} avis)` },
                { icon: 'T', text: `${duration} jours` },
                { icon: '>', text: departure ? `Depart ${departure}` : 'Depart a confirmer' },
                spots > 0 ? { icon: '+', text: `${spots} places restantes` } : { icon: '-', text: 'Complet' },
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
            {detailFacts.map((item) => (
              <div className="detail-stats__item" key={item.label}>
                <div className="detail-stats__icon">{item.label.slice(0, 1)}</div>
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
                  <h3 className="detail-card__title">Description du forfait</h3>
                </div>
                <p className="detail-desc">{pkg.description || 'Les details de ce forfait seront communiques par notre equipe.'}</p>
              </div>

              {pkg.includes.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">Ce forfait comprend</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {pkg.includes.map((item, index) => (
                      <div key={`${item}-${index}`} className="detail-inc-tag">
                        <div className="detail-inc-icon">+</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">Informations pratiques</h3>
                </div>
                <div className="detail-includes-grid">
                  {[
                    duration ? `${duration} jours au total` : null,
                    departure ? `Depart prevu : ${departure}` : 'Date de depart a confirmer',
                    `Disponibilite : ${spots > 0 ? `${spots} places restantes` : 'complet'}`,
                    `Note moyenne : ${rating}/5`,
                  ].filter(Boolean).map((item, index) => (
                    <div key={`${item}-${index}`} className="detail-inc-tag">
                      <div className="detail-inc-icon">i</div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {gallery.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">Galerie</h3>
                  </div>
                  <div className="detail-gallery-grid">
                    {gallery.map((src, index) => (
                      <div
                        key={src}
                        className={`detail-gal-item ${index === 0 ? 'detail-gal-item--main' : ''}`}
                        onClick={() => setLightbox(index)}
                      >
                        <img src={src} alt={`${pkg.title} ${index + 1}`} />
                        <div className="detail-gal-overlay">
                          <span>Voir</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="detail-sidebar">
              <div className="detail-price-card">
                {oldPrice && (
                  <div style={{ fontSize: 14, color: '#6b9aa5', textDecoration: 'line-through', marginBottom: 4 }}>
                    {oldPrice.toLocaleString('fr-TN')} TND
                  </div>
                )}
                <div className="detail-price-main">
                  <span className="detail-price-amount">{price.toLocaleString('fr-TN')}</span>
                  <span className="detail-price-curr">TND</span>
                </div>
                <div className="detail-price-unit">/ personne</div>
                <div className="detail-price-divider" />
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <span key={value} className={`detail-star ${value <= Math.round(rating) ? 'detail-star--on' : 'detail-star--off'}`}>★</span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">{rating} ({reviews} avis)</span>
                </div>
                <ul className="detail-perks">
                  {sidebarPerks.map((perk) => (
                    <li key={perk}>
                      <div className="detail-perk-check">+</div>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className="detail-reserve-btn" onClick={handleReserve}>
                  Reserver ce forfait
                </button>
                <a
                  href="tel:+21636149885"
                  className="detail-back-btn"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  Nous appeler
                </a>
                <p className="detail-sidebar-note">
                  Un conseiller vous contactera pour confirmer les details de votre reservation.
                </p>
                {spots > 0 && spots <= 10 && (
                  <div className="detail-spots-badge">
                    Plus que {spots} place{spots > 1 ? 's' : ''} disponible{spots > 1 ? 's' : ''}.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {lightbox !== null && gallery.length > 0 && (
        <div className="detail-lightbox" onClick={() => setLightbox(null)}>
          <button className="detail-lb-close" onClick={(e) => { e.stopPropagation(); setLightbox(null); }}>x</button>
          {gallery.length > 1 && (
            <button className="detail-lb-nav detail-lb-prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>{'<'}</button>
          )}
          <img src={gallery[lightbox]} alt={`Photo ${lightbox + 1}`} onClick={(e) => e.stopPropagation()} />
          {gallery.length > 1 && (
            <button className="detail-lb-nav detail-lb-next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>{'>'}</button>
          )}
          <div className="detail-lb-counter">{lightbox + 1} / {gallery.length}</div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Details;
