import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

/**
 * OmraDetails — Full page showing detailed info for one Omra package.
 * Receives the package via React Router location.state: { pkg }
 * Route suggestion: /omra/details
 */

const badgeColors = {
  promo: 'linear-gradient(135deg, #D4A017, #F0C040)',
  new: 'var(--secondary)',
  default: 'var(--accent)',
};
const badgeTextColors = {
  promo: '#5a3e00',
  new: 'var(--white)',
  default: 'var(--white)',
};

const OmraDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pkg = location.state?.pkg;

  // Guard: if no package data, send back to omra list
  if (!pkg) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 160, textAlign: 'center', minHeight: '60vh' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: 48, color: 'var(--gray-300)', marginBottom: 20, display: 'block' }} />
          <h2 style={{ color: 'var(--gray-600)', marginBottom: 12 }}>Aucun forfait sélectionné</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 28 }}>Veuillez choisir un forfait depuis la page Omra.</p>
          <button
            onClick={() => navigate('/omra')}
            className="omra-details__reserve-btn"
            style={{ width: 'auto', margin: '0 auto', padding: '14px 32px' }}
          >
            <i className="fas fa-arrow-left" /> Retour aux forfaits
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const handleReserve = () => {
    navigate('/omra/reserve', { state: { pkg } });
  };

  return (
    <>
      <Navbar />

      <div className="omra-details">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="omra-details__hero">
          <img src={pkg.image} alt={pkg.title} />
          <div className="omra-details__hero-overlay" />
          <div className="omra-details__hero-content">
            <div className="container">
              {/* Breadcrumb */}
              <div className="omra-page-breadcrumb">
                <button onClick={() => navigate('/omra')}>
                  <i className="fas fa-arrow-left" /> Omra
                </button>
                <i className="fas fa-chevron-right" style={{ fontSize: 10 }} />
                <span>{pkg.title}</span>
              </div>

              {/* Badge */}
              {pkg.badge && (
                <span
                  className="omra-details__badge"
                  style={{
                    background: badgeColors[pkg.badgeType] || 'var(--accent)',
                    color: badgeTextColors[pkg.badgeType] || 'var(--white)',
                  }}
                >
                  {pkg.badge}
                </span>
              )}

              <h1 className="omra-details__title">{pkg.title}</h1>
              <p className="omra-details__subtitle">{pkg.subtitle}</p>
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="omra-details__body">
          <div className="container">
            <div className="omra-details__layout">

              {/* ── Left column ─────────────────────────────────── */}
              <div>
                {/* Key info */}
                <div className="omra-details__card">
                  <div className="omra-details__meta-grid">
                    {[
                      { icon: 'fas fa-calendar-alt', label: 'Durée', value: `${pkg.duration} jours` },
                      { icon: 'fas fa-map-marker-alt', label: 'Départ', value: pkg.departure },
                      { icon: 'fas fa-star', label: 'Note', value: `${pkg.rating} / 5` },
                      { icon: 'fas fa-users', label: 'Avis clients', value: `${pkg.reviews} avis` },
                    ].map((item, i) => (
                      <div key={i} className="omra-details__meta-item">
                        <div className="omra-details__meta-label">
                          <i className={item.icon} /> {item.label}
                        </div>
                        <div className="omra-details__meta-value">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="omra-details__card">
                  <h3 className="omra-details__card-title">
                    <i className="fas fa-info-circle" /> Description du forfait
                  </h3>
                  <p className="omra-details__desc">{pkg.description}</p>

                  {/* Extra descriptive paragraphs */}
                  <p className="omra-details__desc" style={{ marginTop: 16 }}>
                    Nos guides expérimentés vous accompagneront tout au long de votre séjour pour vous expliquer les rites de l'Omra et vous aider à accomplir votre pèlerinage dans les meilleures conditions spirituelles et matérielles.
                  </p>
                  <p className="omra-details__desc" style={{ marginTop: 16 }}>
                    L'agence TICTAC VOYAGES gère toutes les formalités administratives (visa, assurance, passeport Omra) pour que vous puissiez vous concentrer sur votre voyage spirituel.
                  </p>
                </div>

                {/* What's included */}
                <div className="omra-details__card">
                  <h3 className="omra-details__card-title">
                    <i className="fas fa-check-circle" /> Ce forfait comprend
                  </h3>
                  <div className="omra-details__includes">
                    {pkg.includes.map((inc, i) => (
                      <div key={i} className="omra-details__include-tag">
                        <i className={inc.icon} />
                        {inc.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Programme */}
                <div className="omra-details__card">
                  <h3 className="omra-details__card-title">
                    <i className="fas fa-list-ul" /> Programme indicatif
                  </h3>
                  {[
                    { day: 'Jour 1', title: 'Départ & Arrivée à Médine', desc: 'Vol depuis Tunis-Carthage. Accueil et transfert à l\'hôtel. Repos et première prière à la Mosquée du Prophète.' },
                    { day: `Jours 2–${Math.ceil(pkg.duration / 3)}`, title: 'Séjour à Médine', desc: 'Visites spirituelles : Masjid An-Nabawi, Masjid Quba, Masjid Al-Qiblatayn. Prières et recueillement.' },
                    { day: `Jours ${Math.ceil(pkg.duration / 3) + 1}–${pkg.duration - 2}`, title: 'Séjour à La Mecque', desc: 'Accomplissement des rites de l\'Omra : Ihram, Tawaf, Sa\'y, Tahallul. Visites de lieux saints.' },
                    { day: `Jour ${pkg.duration - 1}`, title: 'Journée libre', desc: 'Temps libre pour prières personnelles, shopping ou visites supplémentaires à votre rythme.' },
                    { day: `Jour ${pkg.duration}`, title: 'Retour en Tunisie', desc: 'Transfert aéroport. Vol retour vers Tunis-Carthage. Fin du voyage béni.' },
                  ].map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 18,
                        marginBottom: i < 4 ? 20 : 0,
                        paddingBottom: i < 4 ? 20 : 0,
                        borderBottom: i < 4 ? '1px solid var(--gray-100)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          minWidth: 90,
                          padding: '6px 10px',
                          background: 'rgba(15,76,92,0.07)',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--secondary)',
                          textAlign: 'center',
                          height: 'fit-content',
                        }}
                      >
                        {step.day}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 5 }}>{step.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div
                  className="omra-details__card"
                  style={{ background: 'rgba(15,76,92,0.04)', border: '1px solid rgba(15,76,92,0.1)' }}
                >
                  <h3 className="omra-details__card-title">
                    <i className="fas fa-exclamation-circle" style={{ color: '#e67e22' }} /> À noter
                  </h3>
                  {[
                    'Le passeport doit être valide au moins 6 mois après la date de retour.',
                    'Des photos d\'identité récentes sont requises pour le visa Omra.',
                    'Le pèlerinage est ouvert aux personnes en bonne santé physique.',
                    'Les femmes de moins de 45 ans doivent être accompagnées d\'un mahram.',
                  ].map((note, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, color: 'var(--gray-600)', alignItems: 'flex-start' }}>
                      <i className="fas fa-dot-circle" style={{ color: 'var(--secondary)', marginTop: 3, fontSize: 10 }} />
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right sidebar ────────────────────────────────── */}
              <div className="omra-details__sidebar">
                <div className="omra-details__price-card">
                  {/* Price */}
                  {pkg.oldPrice && (
                    <span className="omra-details__old-price">{pkg.oldPrice.toLocaleString('fr-TN')} TND</span>
                  )}
                  <div className="omra-details__price-row">
                    <span className="omra-details__price-amount">{pkg.price.toLocaleString('fr-TN')}</span>
                    <span className="omra-details__price-currency">TND</span>
                  </div>
                  <span className="omra-details__price-unit">/ personne</span>

                  <div className="omra-details__divider" />

                  {/* Rating */}
                  <div className="omra-details__rating-row">
                    <div className="omra-details__stars">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={i < Math.floor(pkg.rating) ? 'fas fa-star' : 'far fa-star'}
                          style={{ color: '#D4A017', fontSize: 13 }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{pkg.rating}</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>({pkg.reviews} avis)</span>
                  </div>

                  {/* Quick info */}
                  {[
                    { icon: 'fas fa-calendar-alt', text: `${pkg.duration} jours` },
                    { icon: 'fas fa-plane-departure', text: `Départ : ${pkg.departure}` },
                    { icon: 'fas fa-check-circle', text: 'Visa Omra inclus' },
                    { icon: 'fas fa-shield-alt', text: 'Assurance voyage incluse' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--gray-500)', marginBottom: 10 }}>
                      <i className={item.icon} style={{ color: 'var(--secondary)', width: 16, textAlign: 'center' }} />
                      {item.text}
                    </div>
                  ))}

                  <div className="omra-details__divider" />

                  <button className="omra-details__reserve-btn" onClick={handleReserve}>
                    <i className="fas fa-kaaba" /> Réserver ce forfait
                  </button>

                  <a href="tel:+21636149885" className="omra-details__contact-btn">
                    <i className="fas fa-phone" /> Nous appeler
                  </a>

                  {pkg.spots <= 6 && (
                    <p className="omra-details__spots">
                      <i className="fas fa-fire" style={{ marginRight: 5 }} />
                      Plus que {pkg.spots} place{pkg.spots > 1 ? 's' : ''} disponible{pkg.spots > 1 ? 's' : ''} !
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default OmraDetails;