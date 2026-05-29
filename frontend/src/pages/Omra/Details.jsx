// ════════════════════════════════════════════════════════════════════
// src/pages/Omra/Details.jsx  —  Omra package detail page
//
// PURPOSE:
//   Shows the full information about one Omra package:
//     • Hero banner with the package image
//     • Quick-fact stats strip
//     • Description, included services, practical info, photo gallery
//     • Sidebar with price card and reserve / call buttons
//     • Lightbox for full-screen gallery navigation
//
// DATA STRATEGY:
//   The page tries to use location.state.pkg first (passed by the
//   listing page via navigate()) to avoid an extra network round-trip.
//   Simultaneously it always fires a fresh GET /api/omra/packages/:id
//   call to guarantee the data is up to date. The API result replaces
//   the state value when it arrives.
//
// NEXT STEP IN THE USER FLOW:
//   [Reserver ce forfait] → /Omra/Reserve/:id  (reservation form)
// ════════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/detail.css';

// Base URL for the single-package endpoint.
const API = 'http://localhost:5000/api/omra/packages';

// ── normalizePackage ─────────────────────────────────────────────────
/**
 * Coerces raw API / state data into the canonical shape this component
 * expects. Handles type coercions (strings → numbers) and ensures
 * the `includes` array always contains plain strings.
 *
 * @param   {object} pkg  Raw package object from the API or location.state
 * @returns {object}      Normalised package ready for rendering
 */
const normalizePackage = (pkg) => ({
  ...pkg,
  price:     Number(pkg.price ?? 0),
  old_price: pkg.old_price ? Number(pkg.old_price) : null,
  duration:  Number(pkg.duration ?? 0),
  // available_spots and spots are both used across different parts of
  // the codebase; coalesce them here so the component only checks spots.
  spots:     Number(pkg.available_spots ?? pkg.spots ?? 0),
  rating:    Number(pkg.rating)  || 5,
  reviews:   Number(pkg.reviews) || 0,
  // includes items may be plain strings ("Visa inclus") or objects
  // { icon, label }; normalise to strings for this component.
  includes:  Array.isArray(pkg.includes)
    ? pkg.includes.map((item) => (typeof item === 'string' ? item : item?.label || '')).filter(Boolean)
    : [],
});

const Details = () => {
  const navigate       = useNavigate();
  const { state }      = useLocation();  // may contain { pkg } from the listing page
  const { id }         = useParams();    // the package ID from the URL

  // Initialise with state data (if available) so the page renders
  // immediately without a loading flash for users coming from the listing.
  const [pkg, setPkg]         = useState(state?.pkg ? normalizePackage(state.pkg) : null);
  const [loading, setLoading] = useState(true);
  // lightbox: index of the currently displayed gallery image, or null
  const [lightbox, setLightbox] = useState(null);

  // ── Fetch fresh package data ────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Always fetch from the API regardless of whether we had state data.
    // This ensures the detail page reflects the latest admin changes.
    fetch(`${API}/${id}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        // json.data is null when the backend returns a 404.
        setPkg(json.data ? normalizePackage(json.data) : null);
      })
      .catch(() => setPkg(null))        // network failure → show "not found" UI
      .finally(() => setLoading(false));
  }, [id]);

  // ── Gallery ──────────────────────────────────────────────────────────
  // Build the gallery array from the package's image field(s).
  // useMemo prevents rebuilding on every render.
  const gallery = useMemo(() => {
    const list = [pkg?.image_url || pkg?.image].filter(Boolean);
    return list.length > 0 ? list : [];
  }, [pkg]);

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div
            style={{
              width: 40, height: 40,
              border: '3px solid #e2e8f0', borderTopColor: '#e8306a',
              borderRadius: '50%', animation: 'spin .7s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#94a3b8' }}>Chargement du forfait...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not-found state ──────────────────────────────────────────────────
  // Rendered when the API returns no data (bad ID, deleted package, etc.)
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
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Retour aux forfaits Omra
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Destructure normalised fields for convenience ────────────────────
  const price     = pkg.price     || 0;
  const oldPrice  = pkg.old_price || null;
  const duration  = pkg.duration  || 0;
  const departure = pkg.departure || '';
  const spots     = pkg.spots     || 0;
  const rating    = pkg.rating    || 5;
  const reviews   = pkg.reviews   || 0;
  const image     = pkg.image_url || pkg.image || '';

  // ── Quick-fact rows for the stats strip ─────────────────────────────
  const detailFacts = [
    { label: 'Destination',   value: 'Medine et La Mecque' },
    { label: 'Duree',         value: `${duration} jours` },
    { label: 'Depart',        value: departure || 'A confirmer' },
    { label: 'Disponibilite', value: spots > 0 ? `${spots} places restantes` : 'Complet' },
  ];

  // ── Sidebar perks list (bullet points in the price card) ────────────
  const sidebarPerks = [
    duration  ? `${duration} jours de sejour`          : null,
    departure ? `Depart : ${departure}`                 : null,
    pkg.badge ? `Badge : ${pkg.badge}`                  : null,
    `${rating}/5 de note moyenne`,
    `${reviews} avis client${reviews > 1 ? 's' : ''}`,
    spots > 0 ? `${spots} places encore disponibles`   : 'Depart complet',
  ].filter(Boolean);

  // ── Reserve handler ──────────────────────────────────────────────────
  // Passes the full normalised package in location.state so the
  // reservation form doesn't need to re-fetch it from the API.
  const handleReserve = () => navigate(`/Omra/Reserve/${pkg.id}`, { state: { pkg } });

  // ── Lightbox navigation ──────────────────────────────────────────────
  const prevPhoto = () => setLightbox((index) => (index - 1 + gallery.length) % gallery.length);
  const nextPhoto = () => setLightbox((index) => (index + 1) % gallery.length);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="detail-page">
      <Navbar />

      {/* ── Hero banner ───────────────────────────────────────────────
          Full-width image with an overlay and breadcrumb navigation.
      ──────────────────────────────────────────────────────────────── */}
      <section className="detail-hero">
        {/* Show the package image or a gradient placeholder */}
        {image
          ? <img src={image} alt={pkg.title} className="detail-hero__img" />
          : <div className="detail-hero__img" style={{ background: 'linear-gradient(135deg,#7c1034,#e8306a)' }} />
        }
        <div className="detail-hero__overlay" />

        <div className="detail-hero__content">
          <div className="container">
            {/* Breadcrumb: Omra / package title */}
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn" onClick={() => navigate('/Omra/Omra')}>
                Omra
              </button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">{pkg.title}</span>
            </div>

            {/* Optional badge (e.g. "VIP", "Ramadan") */}
            {pkg.badge && <div className="detail-hero__badge">{pkg.badge}</div>}

            <h1 className="detail-hero__title">{pkg.title}</h1>
            {pkg.subtitle && <p className="detail-hero__sub" style={{ maxWidth: 720 }}>{pkg.subtitle}</p>}

            {/* Pill row: rating, duration, departure, availability */}
            <div className="detail-hero__meta">
              {[
                { icon: '*', text: `${rating} (${reviews} avis)` },
                { icon: 'T', text: `${duration} jours` },
                { icon: '>', text: departure ? `Depart ${departure}` : 'Depart a confirmer' },
                spots > 0
                  ? { icon: '+', text: `${spots} places restantes` }
                  : { icon: '-', text: 'Complet' },
              ].map((pill, index) => (
                <span className="detail-hero__pill" key={index}>
                  <i>{pill.icon}</i> {pill.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
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

      {/* ── Main body: content cards + sidebar ──────────────────────── */}
      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">

            {/* ── Left column: informational cards ──────────────────── */}
            <div>
              {/* Description card */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">Description du forfait</h3>
                </div>
                <p className="detail-desc">
                  {pkg.description || 'Les details de ce forfait seront communiques par notre equipe.'}
                </p>
              </div>

              {/* "What's included" card — only rendered when the list is non-empty */}
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

              {/* Practical info card */}
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">Informations pratiques</h3>
                </div>
                <div className="detail-includes-grid">
                  {[
                    duration  ? `${duration} jours au total`                                          : null,
                    departure ? `Depart prevu : ${departure}`                                         : 'Date de depart a confirmer',
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

              {/* Photo gallery — only rendered when images exist.
                  Clicking a thumbnail opens the lightbox at that index. */}
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
                        // The first image gets a larger span via detail-gal-item--main
                        className={`detail-gal-item ${index === 0 ? 'detail-gal-item--main' : ''}`}
                        onClick={() => setLightbox(index)}
                      >
                        <img src={src} alt={`${pkg.title} ${index + 1}`} />
                        <div className="detail-gal-overlay"><span>Voir</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column: sticky price/reserve sidebar ────────── */}
            <aside className="detail-sidebar">
              <div className="detail-price-card">
                {/* Strike-through original price (if a promotion is active) */}
                {oldPrice && (
                  <div style={{ fontSize: 14, color: '#6b9aa5', textDecoration: 'line-through', marginBottom: 4 }}>
                    {oldPrice.toLocaleString('fr-TN')} TND
                  </div>
                )}

                {/* Current price */}
                <div className="detail-price-main">
                  <span className="detail-price-amount">{price.toLocaleString('fr-TN')}</span>
                  <span className="detail-price-curr">TND</span>
                </div>
                <div className="detail-price-unit">/ personne</div>
                <div className="detail-price-divider" />

                {/* Star rating row */}
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <span
                        key={value}
                        className={`detail-star ${value <= Math.round(rating) ? 'detail-star--on' : 'detail-star--off'}`}
                      >★</span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">{rating} ({reviews} avis)</span>
                </div>

                {/* Key facts bullet list */}
                <ul className="detail-perks">
                  {sidebarPerks.map((perk) => (
                    <li key={perk}>
                      <div className="detail-perk-check">+</div>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* Primary CTA: navigates to the reservation form */}
                <button className="detail-reserve-btn" onClick={handleReserve}>
                  Reserver ce forfait
                </button>

                {/* Secondary CTA: direct phone call */}
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

                {/* Urgency badge — only shown when fewer than 10 spots remain */}
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

      {/* ── Lightbox overlay ──────────────────────────────────────────
          Shown when lightbox state is not null.
          Clicking the backdrop or the close button dismisses it.
          Prev/Next buttons cycle through the gallery array.
      ──────────────────────────────────────────────────────────────── */}
      {lightbox !== null && gallery.length > 0 && (
        <div className="detail-lightbox" onClick={() => setLightbox(null)}>
          <button className="detail-lb-close" onClick={(e) => { e.stopPropagation(); setLightbox(null); }}>
            x
          </button>
          {gallery.length > 1 && (
            <button className="detail-lb-nav detail-lb-prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>
              {'<'}
            </button>
          )}
          {/* Clicking the image itself does not close the lightbox */}
          <img src={gallery[lightbox]} alt={`Photo ${lightbox + 1}`} onClick={(e) => e.stopPropagation()} />
          {gallery.length > 1 && (
            <button className="detail-lb-nav detail-lb-next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>
              {'>'}
            </button>
          )}
          {/* "1 / 3" counter */}
          <div className="detail-lb-counter">{lightbox + 1} / {gallery.length}</div>
        </div>
      )}

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Details;