import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HotelCard from '../../components/HotelCard';
import HotelsSearchBar from '../../components/HotelsSearchBar';
import SortFilter from '../../components/SortFilter';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import { useFavorites } from '../../hooks/useFavorites';
import { buildFavoriteItemData, getFavoriteKey } from '../../utils/favorites';
import { getHotelById, getHotelPageCover, getHotelsCatalog, getPopularHotels } from '../../services/api';
import '../../styles/omrastyle.css';

const DEFAULT_CITIES = [
  'Tunis','Sousse','Hammamet','Djerba','Monastir',
  'Mahdia','Tozeur','Tabarka','Bizerte','Nabeul',
];

const DEFAULT_HERO = {
  bg_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
  photo_1:  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
  photo_2:  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80',
  photo_3:  'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1600&q=80',
  photo_4:  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80',
  tag:           'Hôtels en Tunisie',
  title:         'Trouvez votre',
  title_accent:  'séjour idéal',
  sub: 'Des hôtels alimentés uniquement depuis votre base de données, avec disponibilité, tarifs et réservation en ligne.',
};

const HOTEL_SORT_OPTIONS = [
  { value: 'featured',   label: 'Recommandés' },
  { value: 'popular',    label: 'Les plus demandés' },
  { value: 'rating',     label: 'Mieux notés' },
  { value: 'price_asc',  label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

const HotelsPage = () => {
  const navigate   = useNavigate();
  const resultsRef = useRef(null);
  const bestRef    = useRef(null);

  const { promos }                                        = usePromotions('categorie', 'hotels');
  const { favoriteIds, isAuthenticated, toggleFavorite }  = useFavorites('hotel');

  const [hotels,          setHotels]          = useState([]);
  const [popularHotels,   setPopularHotels]   = useState([]);
  const [cover,           setCover]           = useState(DEFAULT_HERO);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [search,          setSearch]          = useState({ city:'', checkin:'', checkout:'', budget:'', persons:'2' });
  const [activeCity,      setActiveCity]      = useState('all');
  const [sortBy,          setSortBy]          = useState('featured');
  const [featuredOnly,    setFeaturedOnly]    = useState(false);
  const [visibleCount,    setVisibleCount]    = useState(6);

  /* ── fetch ─────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [catalogRes, popularRes, coverRes] = await Promise.all([
          getHotelsCatalog(),
          getPopularHotels(4),
          getHotelPageCover().catch(() => ({ data: { hero: DEFAULT_HERO } })),
        ]);
        setHotels(catalogRes.data || []);
        setPopularHotels(popularRes.data || []);
        const next = { ...DEFAULT_HERO, ...(coverRes.data?.hero || {}) };
        if (!next.photo_1) next.photo_1 = next.bg_image || DEFAULT_HERO.photo_1;
        setCover(next);
      } catch (e) {
        setError(e.message || 'Impossible de charger les hôtels.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── hero slideshow ─────────────────────────────────────────── */
  const heroPhotos = useMemo(() => {
    const p = [cover.photo_1, cover.photo_2, cover.photo_3, cover.photo_4]
      .map(x => x?.trim()).filter(Boolean);
    return p.length ? p : [cover.bg_image || DEFAULT_HERO.bg_image];
  }, [cover]);

  useEffect(() => { setActiveHeroIndex(0); }, [heroPhotos]);
  useEffect(() => {
    if (heroPhotos.length <= 1) return;
    const t = setInterval(() => setActiveHeroIndex(i => (i + 1) % heroPhotos.length), 6000);
    return () => clearInterval(t);
  }, [heroPhotos]);

  /* ── city options ───────────────────────────────────────────── */
  const cityOptions = useMemo(() => {
    const all = [...DEFAULT_CITIES, ...hotels.map(h => h.city).filter(Boolean)];
    return [...new Set(all)].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [hotels]);

  /* ── handlers ───────────────────────────────────────────────── */
  const handleSearch = (next) => {
    setSearch(next);
    setActiveCity(next.city || 'all');
    setVisibleCount(6);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const handleFavoriteToggle = async (hotel) => {
    if (!isAuthenticated) { navigate('/SignIn'); return; }
    try {
      await toggleFavorite({
        itemType: 'hotel', itemId: hotel.id,
        itemData: buildFavoriteItemData('hotel', {
          ...hotel, title: hotel.name,
          image: hotel.image_url || hotel.gallery?.[0] || null,
          price: hotel.base_price, location: hotel.address,
        }),
      });
    } catch (e) { console.error(e); }
  };

  const handleDetails = async (hotel) => {
    try {
      const res = await getHotelById(hotel.id);
      navigate(`/hotels/details/${hotel.id}`, { state: { hotel: res.data || hotel, search } });
    } catch {
      navigate(`/hotels/details/${hotel.id}`, { state: { hotel, search } });
    }
  };

  const handleReserve = (hotel) => navigate('/hotels/reserve', { state: { hotel, search } });

  /* ── filtered list ──────────────────────────────────────────── */
  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    if (activeCity !== 'all') list = list.filter(h => h.city === activeCity);

    const q = search.city?.trim().toLowerCase();
    if (q) list = list.filter(h =>
      h.city?.toLowerCase().includes(q) ||
      h.name?.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q)
    );

    if (featuredOnly) list = list.filter(h => h.is_featured);

    const budget = Number(search.budget || 0);
    if (budget > 0) list = list.filter(h => {
      const p = Number(h.base_price || 0);
      return p > 0 && p <= budget;
    });

    list.sort((a, b) => {
      const ap = (v) => Number(v || 0);
      if (sortBy === 'price_asc')  return (a.base_price ?? Infinity)  - (b.base_price ?? Infinity);
      if (sortBy === 'price_desc') return (b.base_price ?? -Infinity) - (a.base_price ?? -Infinity);
      if (sortBy === 'rating')     return ap(b.rating) - ap(a.rating) || ap(b.reviews) - ap(a.reviews);
      if (sortBy === 'popular')    return ap(b.reservation_count) - ap(a.reservation_count) || ap(b.occupancy_percentage) - ap(a.occupancy_percentage);
      // featured default
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return ap(a.display_order) - ap(b.display_order) || ap(b.rating) - ap(a.rating);
    });

    return list;
  }, [activeCity, featuredOnly, hotels, search.budget, search.city, sortBy]);

  /* ── derived ────────────────────────────────────────────────── */
  const visibleHotels    = filteredHotels.slice(0, visibleCount);
  const topHotels        = popularHotels.length ? popularHotels : filteredHotels.slice(0, 3);
  const totalReservations = hotels.reduce((s, h) => s + Number(h.reservation_count || 0), 0);
  const averageRating     = hotels.length
    ? (hotels.reduce((s, h) => s + Number(h.rating || 0), 0) / hotels.length).toFixed(1)
    : '0.0';

  /* ── shared button styles ───────────────────────────────────── */
  const pinkBtn = {
    padding: '14px 26px', borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg,#e8306a,#be185d)', color: '#fff',
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    boxShadow: '0 18px 32px rgba(232,48,106,0.28)',
  };
  const ghostBtn = {
    ...pinkBtn,
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.28)',
    boxShadow: 'none',
  };

  /* ════════════════════════════════════════════════════════════ */
  return (
    <div>
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="omra-hero" style={{ minHeight: '92vh' }}>
        {heroPhotos.map((photo, i) => (
          <div
            key={`${photo}-${i}`}
            className="omra-hero__bg"
            style={{
              backgroundImage: `url('${photo}')`,
              filter: 'brightness(0.42)',
              opacity: i === activeHeroIndex ? 1 : 0,
              transition: 'opacity 1s ease',
            }}
          />
        ))}
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay"
          style={{ background: 'linear-gradient(to bottom, rgba(10,40,50,0.16) 0%, rgba(10,40,50,0.72) 100%)' }}
        />
        <div className="omra-hero__content">
          <span className="omra-hero__tag" style={{ borderColor: 'rgba(232,48,106,0.25)' }}>
            <i className="fas fa-hotel" style={{ color: '#fda4bf' }} />
            {cover.tag || DEFAULT_HERO.tag}
          </span>
          <h1 className="omra-hero__title" style={{ maxWidth: 860, marginInline: 'auto' }}>
            {cover.title || DEFAULT_HERO.title}<br />
            <span>{cover.title_accent || DEFAULT_HERO.title_accent}</span>
          </h1>
          <p className="omra-hero__subtitle" style={{ maxWidth: 700 }}>
            {cover.sub || DEFAULT_HERO.sub}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
            <button style={pinkBtn} onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-bed" /> Voir les hôtels
            </button>
            <button style={ghostBtn} onClick={() => bestRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-star" /> Nos coups de cœur
            </button>
          </div>
          <div className="omra-hero__search-wrapper" style={{ maxWidth: 1180 }}>
            <HotelsSearchBar onSearch={handleSearch} initialValues={search} cityOptions={cityOptions} />
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="omra-stats" style={{ background: 'linear-gradient(135deg,#8a1538,#0f4c5c)' }}>
        <div className="container">
          <div className="omra-stats__grid">
            {[
              { icon: 'fas fa-hotel',          value: hotels.length,       label: 'Hôtels en base' },
              { icon: 'fas fa-map-marker-alt', value: cityOptions.length,  label: 'Destinations' },
              { icon: 'fas fa-user-check',     value: totalReservations,   label: 'Réservations enregistrées' },
              { icon: 'fas fa-star',           value: `${averageRating} / 5`, label: 'Note moyenne' },
            ].map(item => (
              <div key={item.label} className="omra-stats__item">
                <div className="omra-stats__icon" style={{ color: '#fda4bf' }}>
                  <i className={item.icon} />
                </div>
                <div>
                  <div className="omra-stats__value">{item.value}</div>
                  <div className="omra-stats__label">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMOTIONS ──────────────────────────────────────── */}
      {promos.length > 0 && (
        <section style={{ padding: '18px 0 0' }}>
          <div className="container">
            <PromotionsSection promos={promos} titre="Promotions hôtels" />
          </div>
        </section>
      )}

      {/* ── CATALOGUE ───────────────────────────────────────── */}
      <section className="omra-section omra-section--gray" ref={resultsRef}>
        <div className="container">

          <div className="omra-section__header">
            <span className="omra-section__tag" style={{ color: '#be185d', background: 'rgba(232,48,106,0.08)' }}>
              Catalogue hôtels
            </span>
            <h2 className="omra-section__title">Tous nos hôtels disponibles</h2>
            <p className="omra-section__desc">
              Disponibilité, tarifs et informations alimentés en temps réel depuis votre base de données.
            </p>
          </div>

          {/* ── inline filter bar ─────────────────────────── */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(232,48,106,0.12)',
            borderRadius: 16,
            padding: '16px 18px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* row 1: cities */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.07em', flexShrink: 0 }}>
                Destination
              </span>
              {['all', ...cityOptions].map(city => (
                <button
                  key={city}
                  className={`omra-filter-btn ${activeCity === city ? 'omra-filter-btn--active' : ''}`}
                  style={activeCity === city
                    ? { background: '#e8306a', borderColor: '#e8306a', color: '#fff' }
                    : { borderColor: '#f3b3c7', color: '#9f1239' }}
                  onClick={() => { setActiveCity(city); setVisibleCount(6); }}
                >
                  {city === 'all' ? 'Toutes' : city}
                </button>
              ))}
            </div>

            {/* row 2: featured toggle + count + sort */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  className={`omra-filter-btn ${featuredOnly ? 'omra-filter-btn--active' : ''}`}
                  style={featuredOnly
                    ? { background: '#e8306a', borderColor: '#e8306a', color: '#fff' }
                    : { borderColor: '#f3b3c7', color: '#9f1239' }}
                  onClick={() => { setFeaturedOnly(v => !v); setVisibleCount(6); }}
                >
                  <i className="fas fa-heart" style={{ marginRight: 5 }} />
                  {featuredOnly ? 'Tous les hôtels' : 'Hôtels vedettes'}
                </button>

                <span style={{
                  background: 'rgba(232,48,106,0.08)', color: '#be185d',
                  fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
                }}>
                  {filteredHotels.length} résultat{filteredHotels.length !== 1 ? 's' : ''}
                </span>
              </div>

              <SortFilter sortBy={sortBy} setSortBy={setSortBy} options={HOTEL_SORT_OPTIONS} />
            </div>
          </div>

          {/* ── loading / error / grid ─────────────────────── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #fbcfe8', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement des hôtels...</p>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e92f64' }}>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="omra-cards-grid">
                {visibleHotels.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onDetails={handleDetails}
                    onReserve={handleReserve}
                    isFavorite={favoriteIds.has(getFavoriteKey(hotel.id))}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>

              {visibleHotels.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔎</div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                    Aucun hôtel ne correspond à vos critères.
                  </p>
                  <button
                    className="omra-filter-btn"
                    style={{ borderColor: '#f4c7d4', color: '#9f1239', marginTop: 8 }}
                    onClick={() => {
                      setSearch({ city:'', checkin:'', checkout:'', budget:'', persons:'2' });
                      setActiveCity('all');
                      setFeaturedOnly(false);
                      setSortBy('featured');
                      setVisibleCount(6);
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {visibleCount < filteredHotels.length && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button style={pinkBtn} onClick={() => setVisibleCount(c => c + 6)}>
                    Voir plus ({filteredHotels.length - visibleCount} restant{filteredHotels.length - visibleCount > 1 ? 's' : ''})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── COUPS DE CŒUR ───────────────────────────────────── */}
      <section className="omra-section omra-section--white" ref={bestRef}>
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag" style={{ color: '#be185d', background: 'rgba(232,48,106,0.08)' }}>
              Coups de cœur
            </span>
            <h2 className="omra-section__title">Les hôtels les plus demandés</h2>
            <p className="omra-section__desc">
              Classés selon les réservations et la disponibilité restante.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #fbcfe8', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
              {topHotels.slice(0, 3).map((hotel, i) => (
                <button
                  key={hotel.id}
                  type="button"
                  onClick={() => handleDetails(hotel)}
                  style={{
                    border: '1px solid rgba(15,23,42,0.07)',
                    borderRadius: 22,
                    background: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(15,23,42,0.08)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                    transition: 'transform .22s, box-shadow .22s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(15,23,42,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 8px 30px rgba(15,23,42,0.08)'; }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', height: 220 }}>
                    <img
                      src={hotel.image_url || hotel.gallery?.[0] || DEFAULT_HERO.photo_1}
                      alt={hotel.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.currentTarget.src = DEFAULT_HERO.photo_1; }}
                    />
                    {/* rank badge */}
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      background: i === 0
                        ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                        : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)'
                        : 'linear-gradient(135deg,#c47c3e,#a0642e)',
                      color: '#fff', fontSize: 11, fontWeight: 800,
                      padding: '4px 10px', borderRadius: 999,
                    }}>
                      #{i + 1}
                    </div>
                    {hotel.badge && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: '#e8306a', color: '#fff', fontSize: 10, fontWeight: 800,
                        padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.06em',
                      }}>
                        {hotel.badge}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      {hotel.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(Math.round(hotel.stars || hotel.rating || 0))}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {hotel.city} · {Number(hotel.base_price || 0).toLocaleString('fr-FR')} {hotel.currency || 'TND'} / nuit
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── CTA banner ────────────────────────────────── */}
          <div style={{
            marginTop: 56,
            background: 'linear-gradient(135deg,#0f4c5c 0%,#8a1538 100%)',
            borderRadius: 24, padding: '48px 40px', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>🏨</span>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Vous ne trouvez pas le bon hôtel ?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.7 }}>
                Notre équipe peut vous préparer une proposition adaptée à vos dates, votre budget et votre ville.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button style={pinkBtn} onClick={() => navigate('/Contact')}>
                  <i className="fas fa-headset" /> Contacter un conseiller
                </button>
                <button style={ghostBtn} onClick={() => navigate('/CustomTripAbroad')}>
                  <i className="fas fa-magic" /> Demande sur mesure
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default HotelsPage;