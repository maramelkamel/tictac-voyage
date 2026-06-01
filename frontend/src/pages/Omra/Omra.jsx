// ════════════════════════════════════════════════════════════════════
// src/pages/Omra/Omra.jsx  —  Public Omra package listing page

// ════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import Navbar                  from '../../components/Navbar';
import Footer                  from '../../components/Footer';
import OmraCard                from '../../components/OmraCard';
import OmraSearchBar           from '../../components/OmraSearchBar';
import { statsData }           from '../../data/OmraData';
import '../../styles/omrastyle.css';
import { usePromotions }       from '../../hooks/usePromotions';
import { useFavorites }        from '../../hooks/useFavorites';
import { buildFavoriteItemData, getFavoriteKey } from '../../utils/favorites';
import PromotionsSection       from '../admin/promotions/PromotionsSection';
import { useTranslation }      from 'react-i18next';

// ── API endpoints ────────────────────────────────────────────────────
// ?public=true instructs the backend to return only active packages
const API        = 'http://localhost:5000/api/omra/packages?public=true';

//(background ,image, headline, subtitle). Managed from the admin panel.
const COVERS_API = 'http://localhost:5000/api/omra/packages/omra-covers';

// ── Default hero content ─────────────────────────────────────────────
// Used as the initial state so the page renders something meaningful
const DEFAULT_COVERS = {
  hero: {
    bg_image:     '',
    tag:          'Pelerinage et Spiritualite',
    title:        'Votre Voyage',
    title_accent: 'Spirituel Ideal',
    sub:          'Accomplissez votre Omra en toute serenite avec nos forfaits tout compris, concus pour une experience spirituelle inoubliable.',
  },
};

const Omra = () => {
  const { t } = useTranslation('omra');
  const navigate = useNavigate();

  // ── Local state ────────────────────────────────────────────────────
  // activeFilter: the currently selected badge filter ("Tous", "VIP", …)
  const [activeFilter, setActiveFilter] = useState('Tous');
  // packages: the full list returned by the API (after normalisation)
  const [packages, setPackages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  // covers: the CMS hero settings; initialised with defaults to prevent
  // a blank render while the async fetch completes.
  const [covers, setCovers]             = useState(DEFAULT_COVERS);

  // ── Custom hooks ───────────────────────────────────────────────────
  // usePromotions fetches active promotions filtered by category "omra".
  // Used to decide whether to render the PromotionsSection banner.
  const { promos } = usePromotions('categorie', 'omra');

  // useFavorites tracks which packages the logged-in client has saved
  // and exposes a toggleFavorite() action.
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('omra');

  // ── Data fetching ──────────────────────────────────────────────────
  useEffect(() => {
    // ── 1. Load Omra packages ──────────────────────────────────────
    fetch(API, { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        // Normalise each package so the rest of the component can rely
        // on a consistent field shape regardless of minor API variations.
        const normalized = (json.data || []).map(pkg => ({
          ...pkg,
          image:    pkg.image_url || pkg.image || '',   
          oldPrice: pkg.old_price ? Number(pkg.old_price) : null,
          price:    Number(pkg.price),
          includes: Array.isArray(pkg.includes)
            ? pkg.includes.map(item =>
                typeof item === 'string'
                  ? { icon: 'fas fa-check', label: item }
                  : item
              )
            : [],
        }));
        setPackages(normalized);
        setLoading(false);
      })
      .catch(() => {
        setError(t('error'));
        setLoading(false);
      });

    // ── 2. Load hero cover settings ────────────────────────────────
    //if it fails the page still renders using DEFAULT_COVERS
    fetch(COVERS_API, { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setCovers({
            hero: { ...DEFAULT_COVERS.hero, ...(json.data.hero || {}) },
          });
        }
      })
      .catch(() => { /* silently keep DEFAULT_COVERS */ });
  }, [t]);

  // ── Helpers ────────────────────────────────────────────────────────
  // Safe accessor so template code never needs to guard against
  // covers.hero being undefined.
  const getHero = () => covers.hero || DEFAULT_COVERS.hero;

  // ── Navigation handlers ────────────────────────────────────────────
  // Navigate to detail, passing the full pkg object via location.state
  const handleDetails = (pkg) => {
    navigate(`/Omra/Details/${pkg.id}`, { state: { pkg } });
  };

 
  const handleReserve = (pkg) => {
    navigate(`/Omra/Reserve/${pkg.id}`, { state: { pkg } });
  };

  // Search bar callback — currently a stub (logs params).
  // Extend this to filter the `packages` array or call a search API.
  const handleSearch = (params) => {
    console.log('Search params:', params);
  };

  // Toggle a package's saved/favorite status.
  // Redirects unauthenticated users to the sign-in page.
  const handleFavoriteToggle = async (pkg) => {
    if (!isAuthenticated) {
      navigate('/SignIn');
      return;
    }
    try {
      await toggleFavorite({
        itemType: 'omra',
        itemId:   pkg.id,
        // buildFavoriteItemData shapes the metadata stored in the DB
        // (title, image, price, detailPath …) for the favorites list.
        itemData: buildFavoriteItemData('omra', pkg),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Filter options ─────────────────────────────────────────────────
  // Derive available filters from the package data by inspecting badge
  // fields and title keywords. "Tous" is always prepended.
  const filters = ['Tous', ...new Set(packages.map(p => {
    if (p.badge) return p.badge;
    if (p.title.toLowerCase().includes('économ')) return 'Économique';
    if (p.title.toLowerCase().includes('vip'))    return 'VIP';
    if (p.title.toLowerCase().includes('ramadan')) return 'Ramadan';
    return null;
  }).filter(Boolean))];

  // Packages that match the active filter (case-insensitive substring
  // search across title, subtitle, and badge fields).
  const filtered = packages.filter((pkg) => {
    if (activeFilter === 'Tous') return true;
    return (
      (pkg.title    || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
      (pkg.subtitle || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
      (pkg.badge    || '').toLowerCase().includes(activeFilter.toLowerCase())
    );
  });

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      {/* ── Hero section ────────────────────────────────────────────
          The background image, tag, title and subtitle are all driven
          by the CMS data fetched from COVERS_API. The pattern and
          overlay divs provide the visual layering (texture + dark tint).
      ──────────────────────────────────────────────────────────────── */}
      <section className="omra-hero" style={{ position: 'relative' }}>
        {/* If a CMS background image exists, render it absolutely behind
            the content. Otherwise fall back to the CSS gradient defined
            in omra-hero__bg. */}
        {getHero().bg_image ? (
          <img
            src={getHero().bg_image}
            alt="hero background"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
            // If the image URL is broken, hide the element so the CSS
            // gradient fallback shows instead.
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="omra-hero__bg" />
        )}

        {/* CSS geometric pattern overlay and dark transparency overlay */}
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />

        <div className="container omra-hero__content" style={{ position: 'relative', zIndex: 1 }}>
          {/* Small badge above the headline — editable in the admin CMS */}
          <div className="omra-hero__tag">
            <i className="fas fa-kaaba" style={{ color: '#e8306a' }} />
            {getHero().tag || t('hero_tag')}
          </div>

          {/* Two-line headline: plain text + accent (coloured) line */}
          <h1 className="omra-hero__title">
            {getHero().title || t('hero_title')}<br />
            <span>{getHero().title_accent || t('hero_title_accent', { defaultValue: 'Spirituel Ideal' })}</span>
          </h1>

          {/* Supporting description paragraph */}
          <p className="omra-hero__subtitle">
            {getHero().sub ||
              t('hero_subtitle')}
          </p>

          {/* Inline search bar for departure-date / budget filtering */}
          <div className="omra-hero__search-wrapper">
            <OmraSearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────
          Static trust indicators (e.g. "5 000 pèlerins", "15 ans
          d'expérience"). Data comes from /data/OmraData.js.
      ──────────────────────────────────────────────────────────────── */}
      <section className="omra-stats">
        <div className="container">
          <div className="omra-stats__grid">
            {statsData.map((s, i) => (
              <div key={i} className="omra-stats__item">
                <div className="omra-stats__icon">
                  <i className={s.icon} />
                </div>
                <div>
                  <div className="omra-stats__value">{s.value}</div>
                  <div className="omra-stats__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Active promotions ────────────────────────────────────────
          Only rendered when at least one Omra promotion is live.
      ──────────────────────────────────────────────────────────────── */}
      {promos.length > 0 && (
        <section style={{ padding: '16px 0 0' }}>
          <div className="container">
            <PromotionsSection promos={promos} showCards={false} />
          </div>
        </section>
      )}

      {/* ── Package grid ─────────────────────────────────────────────
          Displays the filterable list of Omra packages, each rendered
          via <OmraCard>. Handles loading, error, and empty states.
      ──────────────────────────────────────────────────────────────── */}
      <section className="omra-section omra-section--gray">
        <div className="container">
          {/* Section header */}
          <div className="omra-section__header">
            <span className="omra-section__tag">
              <i className="fas fa-kaaba" style={{ marginRight: 8 }} />
              {t('packages_badge')}
            </span>
            <h2 className="omra-section__title">
              {t('packages_title')}
            </h2>
            <p className="omra-section__desc">
              {t('packages_desc')}
            </p>
          </div>

          {/* Filter pills — built dynamically from the package list */}
          <div className="omra-filters">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`omra-filter-btn ${activeFilter === f ? 'omra-filter-btn--active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Loading spinner — shown while the API call is in flight */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                width: 40, height: 40,
                border: '3px solid #e2e8f0', borderTopColor: '#e8306a',
                borderRadius: '50%', animation: 'spin .7s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>{t('loading')}</p>
            </div>
          )}

          {/* Error state — shown if the packages API call failed */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#e8306a' }}>
              <i className="fas fa-exclamation-circle" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
              <p>{error}</p>
            </div>
          )}

          {/* Package cards grid */}
          {!loading && !error && (
            <div className="omra-cards-grid">
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', gridColumn: '1/-1', color: '#94a3b8' }}>
                  <p>{t('no_packages')}</p>
                </div>
              ) : (
                filtered.map((pkg) => (
                  <OmraCard
                    key={pkg.id}
                    pkg={pkg}
                    onDetails={handleDetails}   // → /Omra/Details/:id
                    onReserve={handleReserve}   // → /Omra/Reserve/:id
                    // favoriteIds is a Set of "omra-{id}" strings from useFavorites
                    isFavorite={favoriteIds.has(getFavoriteKey(pkg.id))}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Why choose us ────────────────────────────────────────────
          Static trust section. Content is hardcoded (no CMS).
      ──────────────────────────────────────────────────────────────── */}
      <section className="omra-section omra-section--white">
        <div className="container">
          <div className="omra-why__grid">
            <div>
              <span className="omra-why__tag">{t('why_badge')}</span>
              <h2 className="omra-why__title">
                {t('why_title')}
              </h2>
              <p className="omra-why__desc">
                {t('why_desc')}
              </p>
              {/* Feature list — icon + title + description */}
              {[
                { icon: 'fas fa-shield-alt', title: t('why_certified'), desc: t('why_certified_desc') },
                { icon: 'fas fa-headset', title: t('why_support'), desc: t('why_support_desc') },
                { icon: 'fas fa-heart', title: t('why_care'), desc: t('why_care_desc') },
              ].map((item, i) => (
                <div key={i} className="omra-why__feature">
                  <div className="omra-why__feature-icon">
                    <i className={item.icon} />
                  </div>
                  <div>
                    <h4 className="omra-why__feature-title">{item.title}</h4>
                    <p className="omra-why__feature-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="omra-why__image-wrapper">
              <div className="omra-why__image">
                <img src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80" alt="La Mecque" />
              </div>
              {/* Floating trust badge overlaid on the image */}
              <div className="omra-why__float-card">
                <div className="omra-why__float-icon"><i className="fas fa-star" /></div>
                <div>
                  <div className="omra-why__float-value">5 000+</div>
                  <div className="omra-why__float-label">{t('pilgrims_count')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to action ────────────────────────────────────────────
          Encourages visitors to call or email the agency.
      ──────────────────────────────────────────────────────────────── */}
      <section className="omra-cta">
        <div className="omra-cta__pattern" />
        <div className="container omra-cta__inner">
          <i className="fas fa-kaaba omra-cta__icon" />
          <h2 className="omra-cta__title">{t('cta_title')}</h2>
          <p className="omra-cta__desc">
            {t('cta_desc')}
          </p>
          <div className="omra-cta__actions">
            <a href="tel:+21636149885" className="omra-cta__btn-primary">
              <i className="fas fa-phone" /> {t('cta_call')}
            </a>
            <a href="#footer" className="omra-cta__btn-secondary">
              <i className="fas fa-envelope" /> {t('cta_write')}
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Keyframe for the loading spinner — scoped to this component */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default Omra;
