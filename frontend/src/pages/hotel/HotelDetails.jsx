import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { hotelsData } from '../../data/hotelsData';
import '../../styles/HotelDetails.css';

/* ── Static data ─────────────────────────────────────────────── */
const amenities = [
  { icon: '📶', label: 'WiFi gratuit' },
  { icon: '🏊', label: 'Piscine' },
  { icon: '🧖', label: 'Spa & Bien-être' },
  { icon: '🅿️', label: 'Parking' },
  { icon: '🍽️', label: 'Restaurant' },
  { icon: '🏋️', label: 'Salle de sport' },
  { icon: '❄️', label: 'Climatisation' },
  { icon: '🛎️', label: 'Room service' },
  { icon: '🚤', label: 'Sports nautiques' },
  { icon: '🎭', label: 'Animation' },
  { icon: '🧺', label: 'Blanchisserie' },
  { icon: '💆', label: 'Massage' },
];

const highlights = [
  'Vue mer panoramique depuis les chambres supérieures',
  'Accès direct à la plage de sable fin',
  'Petit-déjeuner buffet international inclus',
  'Personnel multilingue disponible 24h/7j',
  'Navette aéroport sur demande',
  'Animations soirées pour toute la famille',
];

const galleryImages = [
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c4fe1dc7?w=600&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80',
];

const startingPrice = (hotel) => {
  if (hotel.priceOptions?.length) return Math.min(...hotel.priceOptions.map((p) => p.price));
  return 180;
};

/* ── Component ───────────────────────────────────────────────── */
const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const hotel = hotelsData.find((h) => String(h.id) === String(id)) || hotelsData[0];

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeNav, setActiveNav] = useState('details');
  const [modalImg, setModalImg] = useState(null);

  const sectionRefs = {
    details:   useRef(null),
    amenities: useRef(null),
    gallery:   useRef(null),
  };

  const scrollTo = (key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveNav(key);
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveNav(e.target.dataset.section); }),
      { rootMargin: '-30% 0px -60% 0px' }
    );
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) { ref.current.dataset.section = key; obs.observe(ref.current); }
    });
    return () => obs.disconnect();
  }, []);

  const navItems = [
    { key: 'details',   label: '📋 Détails' },
    { key: 'amenities', label: '✨ Équipements' },
    { key: 'gallery',   label: '🖼️ Galerie' },
  ];

  const minPrice = startingPrice(hotel);

  return (
    <>
      <Navbar />
      <div className="hd-page">

        {/* ── HERO ── */}
        <section className={`hd-hero ${heroLoaded ? 'loaded' : ''}`}>
          <img
            src={hotel.image || galleryImages[0]}
            alt={hotel.title}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="hd-hero-overlay" />
          <div className="hd-hero-content">
            {hotel.badge && (
              <div className="hd-hero-badge"><span>★</span> {hotel.badge}</div>
            )}
            <h1 className="hd-hero-title">{hotel.title}</h1>
            <div className="hd-hero-meta">
              <span>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {hotel.location}
              </span>
              <span className="hd-stars">
                {'★'.repeat(hotel.stars || 5)}{'☆'.repeat(5 - (hotel.stars || 5))}
              </span>
              <span className="hd-rating-pill">⭐ {hotel.rating || '9.2'}/10</span>
              <span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                </svg>
                {hotel.amenities?.length > 0 ? `${hotel.amenities.length}+ équipements` : '12+ équipements'}
              </span>
            </div>
          </div>
        </section>

        {/* ── BREADCRUMB ── */}
        <div className="hd-breadcrumb">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Accueil</a>
          <span>›</span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Hôtels</a>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{hotel.title}</span>
        </div>

        {/* ── STICKY NAV ── */}
        <nav className="hotel-details-nav">
          <div className="hotel-nav-container">
            <div className="hotel-nav-buttons">
              {navItems.map((n) => (
                <button
                  key={n.key}
                  className={`hotel-nav-btn ${activeNav === n.key ? 'active' : ''}`}
                  onClick={() => scrollTo(n.key)}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* ── MAIN 2-COL LAYOUT ── */}
        <div className="hotel-details-container">

          {/* LEFT COLUMN */}
          <div>

            {/* Details */}
            <section className="hd-section" ref={sectionRefs.details}>
              <h2 className="hd-section-title">Présentation de l'Hôtel</h2>
              <div className="hd-section-divider" />
              <p className="hd-desc">
                {hotel.description}{' '}
                Niché au cœur d'un cadre naturel d'exception, cet établissement d'excellence vous
                offre une expérience unique où luxe, confort et authenticité se fondent
                harmonieusement. Chaque détail a été pensé pour rendre votre séjour inoubliable.
              </p>
              <div className="hd-highlights">
                {highlights.map((h, i) => (
                  <div className="hd-highlight-item" key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {h}
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section className="hd-section" ref={sectionRefs.amenities}>
              <h2 className="hd-section-title">Équipements & Services</h2>
              <div className="hd-section-divider" />
              <div className="equipments-grid">
                {amenities.map((a, i) => (
                  <div className="equipment-item" key={i}>
                    <div className="equipment-icon">{a.icon}</div>
                    {a.label}
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <section className="hd-section" ref={sectionRefs.gallery}>
              <h2 className="hd-section-title">Galerie Photos</h2>
              <div className="hd-section-divider" />
              <div className="gallery-grid">
                {galleryImages.map((src, i) => (
                  <div
                    key={i}
                    className={`gallery-item ${i === 0 ? 'gallery-main' : ''}`}
                    onClick={() => setModalImg(src)}
                    style={{ height: i === 0 ? '320px' : '155px' }}
                  >
                    <img src={src} alt={`Vue ${i + 1}`} />
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN — STICKY CTA */}
          <div className="hd-right">

            {/* CTA booking card */}
            <div className="hd-cta-card">
              <div className="hd-cta-header">
                <div className="hd-cta-header__icon">🏨</div>
                <h3>Prêt à réserver ?</h3>
                <p>Disponibilité instantanée · Confirmation par email · Meilleur prix garanti</p>
              </div>

              <div className="hd-cta-price-block">
                <div className="hd-cta-price-from">À partir de</div>
                <div className="hd-cta-price-value">
                  {minPrice}{' '}
                  <span style={{ fontSize: '1rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>TND</span>
                </div>
                <div className="hd-cta-price-unit">par nuit · par chambre</div>
              </div>

              <div className="hd-cta-perks">
                <div className="hd-cta-perk"><span>✅</span><span>Annulation flexible disponible</span></div>
                <div className="hd-cta-perk"><span>💳</span><span>Paiement en ligne ou en agence</span></div>
                <div className="hd-cta-perk"><span>🔒</span><span>Réservation 100% sécurisée</span></div>
                <div className="hd-cta-perk"><span>📞</span><span>Support conseiller dédié 24h/7j</span></div>
              </div>

              <div className="hd-cta-actions">
                <button
                  className="hd-cta-btn-reserve"
                  onClick={() => navigate(`/hotels/${hotel.id}/reserve`)}
                >
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Réserver ce séjour
                </button>
                <button className="hd-cta-btn-back" onClick={() => navigate('/')}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Voir tous les hôtels
                </button>
              </div>
            </div>

            {/* Quick info card */}
            <div className="hd-info-card">
              <div className="hd-info-card__title">Informations clés</div>
              <div className="hd-info-row">
                <span className="hd-info-label">📍 Localisation</span>
                <span className="hd-info-value">{hotel.location}</span>
              </div>
              <div className="hd-info-row">
                <span className="hd-info-label">⭐ Classification</span>
                <span className="hd-info-value">{'★'.repeat(hotel.stars || 5)}</span>
              </div>
              <div className="hd-info-row">
                <span className="hd-info-label">📊 Note clients</span>
                <span className="hd-info-value" style={{ color: 'var(--accent-dark)' }}>
                  {hotel.rating || '9.2'} / 10
                </span>
              </div>
              <div className="hd-info-row">
                <span className="hd-info-label">🎒 Équipements</span>
                <span className="hd-info-value">{amenities.length}+ services</span>
              </div>
              <div className="hd-info-row">
                <span className="hd-info-label">🍽️ Pension</span>
                <span className="hd-info-value">Toutes formules</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {modalImg && (
        <div className="hd-modal" onClick={() => setModalImg(null)}>
          <button className="hd-modal-close" onClick={() => setModalImg(null)}>✕</button>
          <img src={modalImg} alt="Galerie" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <Footer />
    </>
  );
};

export default HotelDetails;