import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css'; // shared stylesheet

/* ── build gallery from hero image + unsplash extras ── */
const buildGallery = (mainImage, keyword = 'mecca') => {
  const tags = ['mecca kaaba', 'medina mosque', 'islam pilgrimage', 'saudi arabia'];
  const seeds = [11, 22, 33, 44];
  const extras = seeds.map((s, i) =>
    `https://source.unsplash.com/800x600/?${encodeURIComponent(tags[i])}&sig=${s}`
  );
  return [mainImage, ...extras];
};

const Details = () => {
  const navigate            = useNavigate();
  const { state }           = useLocation();
  const pkg                 = state?.pkg;
  const [lightbox, setLightbox] = useState(null);

  /* ── Fallback ── */
  if (!pkg) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            Forfait introuvable.
          </p>
          <button
            onClick={() => navigate('/omra')}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#e8306a,#b72754)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            ← Retour aux forfaits Omra
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = buildGallery(pkg.image, 'mecca');

  const programme = [
    { title: 'Départ & Arrivée à Médine',      desc: "Vol depuis Tunis-Carthage. Accueil et transfert à l'hôtel. Repos et première prière à la Mosquée du Prophète." },
    { title: 'Séjour à Médine',                 desc: 'Visites spirituelles : Masjid An-Nabawi, Masjid Quba, Masjid Al-Qiblatayn. Prières et recueillement.' },
    { title: 'Transfert & Arrivée à La Mecque', desc: "Départ pour La Mecque. Installation à l'hôtel. Première visite à la Mosquée Al-Haram." },
    { title: 'Accomplissement des rites',        desc: "Ihram, Tawaf autour de la Kaaba, Sa'y entre Safa et Marwa, Tahallul. Accompagnement par notre guide." },
    { title: 'Journée libre & Retour',           desc: 'Temps libre pour prières personnelles. Transfert aéroport et vol retour vers Tunis-Carthage.' },
  ];

  const notes = [
    'Le passeport doit être valide au moins 6 mois après la date de retour.',
    "Des photos d'identité récentes sont requises pour le visa Omra.",
    'Le pèlerinage est ouvert aux personnes en bonne santé physique.',
    'Les femmes de moins de 45 ans doivent être accompagnées d\'un mahram.',
  ];

  const prevPhoto = () => setLightbox(i => (i - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setLightbox(i => (i + 1) % gallery.length);

  const handleReserve = () => navigate('/omra/reserve/${id}', { state: { pkg } });

  return (
    <div className="detail-page">
      <Navbar />

      {/* ════════════ HERO ════════════ */}
      <section className="detail-hero">
        <img src={pkg.image} alt={pkg.title} className="detail-hero__img" />
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="container">

            {/* Breadcrumb */}
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn" onClick={() => navigate('/omra')}>
                ← Omra
              </button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">{pkg.title}</span>
            </div>

            {pkg.badge && <div className="detail-hero__badge">{pkg.badge}</div>}
            <h1 className="detail-hero__title">{pkg.title}</h1>

            <div className="detail-hero__meta">
              {[
                { icon: '⭐', text: `${pkg.rating} (${pkg.reviews} avis)` },
                { icon: '🕐', text: `${pkg.duration} jours` },
                { icon: '✈️', text: `Départ ${pkg.departure}` },
                pkg.spots <= 10 && { icon: '🔥', text: `${pkg.spots} places restantes` },
              ].filter(Boolean).map((pill, i) => (
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
              { icon: '🕌', label: 'Destinations',  value: 'Médine & La Mecque' },
              { icon: '📅', label: 'Durée',          value: `${pkg.duration} jours` },
              { icon: '✈️', label: 'Départ',         value: pkg.departure },
              { icon: '🛡️', label: 'Visa Omra',      value: 'Inclus' },
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
                  <h3 className="detail-card__title">📖 Description du forfait</h3>
                </div>
                <p className="detail-desc">{pkg.description}</p>
                <p className="detail-desc" style={{ marginTop: 16 }}>
                  Nos guides expérimentés vous accompagneront tout au long de votre séjour pour vous expliquer les
                  rites de l'Omra et vous aider à accomplir votre pèlerinage dans les meilleures conditions
                  spirituelles et matérielles.
                </p>
                <p className="detail-desc" style={{ marginTop: 16 }}>
                  L'agence <strong>TICTAC VOYAGES</strong> gère toutes les formalités administratives (visa,
                  assurance, passeport Omra) pour que vous puissiez vous concentrer sur votre voyage spirituel.
                </p>
              </div>

              {/* Programme — timeline */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">🗓️ Programme indicatif</h3>
                </div>
                <div className="detail-programme">
                  {programme.map((step, i) => (
                    <div className="detail-prog-item" key={i}>
                      <div className="detail-prog-circle">J{i + 1}</div>
                      <div className="detail-prog-body">
                        <div className="detail-prog-label">Jour {i + 1}</div>
                        <div className="detail-prog-text">
                          <strong>{step.title}</strong>
                          <br />
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                      <img src={src} alt={`${pkg.title} ${i + 1}`} />
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

              {/* Ce qui est inclus */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">✅ Ce forfait comprend</h3>
                </div>
                <div className="detail-includes-grid">
                  {pkg.includes.map((inc, i) => (
                    <div key={i} className="detail-inc-tag">
                      <div className="detail-inc-icon">✓</div>
                      {inc.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* À noter */}
              <div className="detail-card" style={{ background: 'rgba(232,48,106,0.03)', border: '1px solid rgba(232,48,106,0.12)' }}>
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">⚠️ À noter</h3>
                </div>
                <div className="detail-includes-grid">
                  {notes.map((note, i) => (
                    <div key={i} className="detail-inc-tag detail-inc-tag--excl">
                      <div className="detail-inc-icon">!</div>
                      {note}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ══ RIGHT sidebar ══ */}
            <aside className="detail-sidebar">
              <div className="detail-price-card">

                {/* Old price */}
                {pkg.oldPrice && (
                  <div style={{ fontSize: 14, color: '#6b9aa5', textDecoration: 'line-through', marginBottom: 4 }}>
                    {pkg.oldPrice.toLocaleString('fr-TN')} TND
                  </div>
                )}

                {/* Price */}
                <div className="detail-price-main">
                  <span className="detail-price-amount">{pkg.price.toLocaleString('fr-TN')}</span>
                  <span className="detail-price-curr">TND</span>
                </div>
                <div className="detail-price-unit">/ personne · taxes incluses</div>

                <div className="detail-price-divider" />

                {/* Rating */}
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`detail-star ${s <= Math.round(pkg.rating) ? 'detail-star--on' : 'detail-star--off'}`}>★</span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">{pkg.rating} ({pkg.reviews} avis)</span>
                </div>

                {/* Quick info perks */}
                <ul className="detail-perks">
                  {[
                    `${pkg.duration} jours de séjour`,
                    `Départ : ${pkg.departure}`,
                    'Visa Omra inclus',
                    'Assurance voyage incluse',
                    'Guide francophone',
                    'Transferts aéroport inclus',
                  ].map((perk, i) => (
                    <li key={i}>
                      <div className="detail-perk-check">✓</div>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className="detail-reserve-btn" onClick={handleReserve}>
                  🕌 Réserver ce forfait →
                </button>

                <a href="tel:+21636149885" className="detail-back-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  📞 Nous appeler
                </a>

                <p className="detail-sidebar-note">
                  Aucun paiement immédiat. Un conseiller vous contactera sous 24h pour finaliser votre dossier.
                </p>

                {pkg.spots <= 10 && (
                  <div className="detail-spots-badge">
                    🔥 Plus que {pkg.spots} place{pkg.spots > 1 ? 's' : ''} disponible{pkg.spots > 1 ? 's' : ''} !
                  </div>
                )}

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