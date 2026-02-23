import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const Details = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { id }    = useParams();

  /* Fallback if user refreshes directly on this URL */
  if (!state?.voyage) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>
            Voyage introuvable.
          </p>
          <button className="omra-details__reserve-btn" style={{ width: 'auto', padding: '14px 28px' }}
            onClick={() => navigate('/voyages')}>
            ← Retour aux voyages
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    titre, destination, pays, image, prix, duree,
    rating, avis, description, depart, programme = [],
    inclus = [], nonInclus = [], places, badge,
  } = state.voyage;

  const handleReserver = () => {
    navigate(`/VoyagesOrganise/Reserver/${id}`, { state: { voyage: state.voyage } });
  };

  return (
    <div className="omra-details">
      <Navbar />

      {/* ── Hero banner ── */}
      <div className="omra-details__hero">
        <img src={image} alt={titre} />
        <div className="omra-details__hero-overlay" />

        <div className="omra-details__hero-content">
          <div className="container">
            {/* Breadcrumb */}
            <div className="omra-page-breadcrumb">
              <button onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>← Voyages organisés</button>
              <span>/</span>
              <span>{pays}</span>
            </div>

            {badge && <span className="omra-details__badge">{badge}</span>}
            <h1 className="omra-details__title">{titre}</h1>
            <p className="omra-details__subtitle">
              ⭐ {rating} ({avis} avis)&nbsp;&nbsp;·&nbsp;&nbsp;
              🕐 {duree}&nbsp;&nbsp;·&nbsp;&nbsp;
              ✈️ Départ depuis {depart}&nbsp;&nbsp;·&nbsp;&nbsp;
              👥 {places} places restantes
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="omra-details__body">
        <div className="container">
          <div className="omra-details__layout">

            {/* ── Left: main content ── */}
            <div>

              {/* Highlights */}
              <div className="omra-details__card">
                <div className={`omra-details__meta-grid omra-details__meta-grid--4`}>
                  {[
                    { icon: '🌍', label: 'Destination', value: pays },
                    { icon: '📅', label: 'Durée',       value: duree },
                    { icon: '✈️', label: 'Départ',      value: depart },
                    { icon: '👥', label: 'Places',      value: `${places} restantes` },
                  ].map((m, i) => (
                    <div className="omra-details__meta-item" key={i}>
                      <div className="omra-details__meta-label">
                        {m.icon} {m.label}
                      </div>
                      <div className="omra-details__meta-value">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="omra-details__card">
                <h3 className="omra-details__card-title">📖 À propos de ce voyage</h3>
                <p className="omra-details__desc">{description}</p>
              </div>

              {/* Programme */}
              {programme.length > 0 && (
                <div className="omra-details__card">
                  <h3 className="omra-details__card-title">🗓️ Programme jour par jour</h3>
                  <div className="omra-details__programme">
                    {programme.map((item, i) => (
                      <div className="omra-details__programme-item" key={i}>
                        <span className="omra-details__day-badge">Jour {i + 1}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclus */}
              {inclus.length > 0 && (
                <div className="omra-details__card">
                  <h3 className="omra-details__card-title">✅ Ce qui est inclus</h3>
                  <div className="omra-details__includes">
                    {inclus.map((item, i) => (
                      <span key={i} className="omra-details__include-tag">✓ {item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Non inclus */}
              {nonInclus.length > 0 && (
                <div className="omra-details__card">
                  <h3 className="omra-details__card-title">❌ Non inclus</h3>
                  <div className="omra-details__includes">
                    {nonInclus.map((item, i) => (
                      <span key={i} className="omra-details__include-tag omra-details__include-tag--excluded">
                        ✕ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: sticky sidebar ── */}
            <aside className="omra-details__sidebar">
              <div className="omra-details__price-card">

                <div className="omra-details__price-row">
                  <span className="omra-details__price-amount">
                    {prix.toLocaleString('fr-FR')}
                  </span>
                  <span className="omra-details__price-currency">TND</span>
                </div>
                <span className="omra-details__price-unit">par personne · taxes incluses</span>

                <div className="omra-details__divider" />

                <div className="omra-details__rating-row">
                  <div className="omra-details__stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ color: s <= Math.round(rating) ? '#fbbf24' : 'var(--gray-200)', fontSize: 16 }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>
                    {rating} ({avis} avis)
                  </span>
                </div>

                <ul className="omra-details__sidebar-perks">
                  <li>✓ Annulation gratuite sous 48h</li>
                  <li>✓ Guide francophone inclus</li>
                  <li>✓ Assistance 24h/7j</li>
                  <li>✓ Transferts aéroport inclus</li>
                </ul>

                <button className="omra-details__reserve-btn" onClick={handleReserver}>
                  Réserver ce voyage →
                </button>

                <button className="omra-details__contact-btn" onClick={() => navigate(-1)}>
                  ← Retour à la liste
                </button>

                <p className="omra-details__sidebar-note">
                  Aucun paiement immédiat. Un conseiller vous contactera sous 24h pour finaliser votre dossier.
                </p>

                <div className="omra-details__spots">
                  🔥 Plus que {places} places disponibles !
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Details;