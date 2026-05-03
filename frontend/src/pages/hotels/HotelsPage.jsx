import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HotelCard from '../../components/HotelCard';
import HotelsSearchBar from '../../components/HotelsSearchBar';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import { useFavorites } from '../../hooks/useFavorites';
import { buildFavoriteItemData, getFavoriteKey } from '../../utils/favorites';
import { getHotelsCatalog, getPopularHotels } from '../../services/api';
import '../../styles/omrastyle.css';

// ─── Hero slides (rotate every 6 s) ──────────────────────────
const HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&q=80',
    tag: '🏨 Premium Hotels in Tunisia',
    title: 'Find Your',
    accent: 'Perfect Stay',
    sub: 'Handpicked hotels with live availability, exclusive rates and seamless online booking.',
  },
  {
    bg: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80',
    tag: '🌊 Beachfront Resorts',
    title: 'Sun, Sand &',
    accent: 'Total Relaxation',
    sub: 'All-inclusive beachfront resorts across Hammamet, Sousse and Djerba.',
  },
  {
    bg: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    tag: '⭐ 5-Star Luxury',
    title: 'Luxury Beyond',
    accent: 'Expectations',
    sub: 'World-class hospitality with authentic Tunisian warmth and modern elegance.',
  },
];

const CITY_FILTERS = ['All', 'Tunis', 'Sousse', 'Hammamet', 'Djerba'];

const HotelsPage = () => {
  const navigate = useNavigate();
  const promotionsRef = useRef(null);
  const resultsRef   = useRef(null);
  const bestRef      = useRef(null);

  const { promos } = usePromotions('categorie', 'hotels');
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('hotel');

  // ── Hero rotation ──────────────────────────────────────────
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // ── Data ──────────────────────────────────────────────────
  const [hotels, setHotels]           = useState([]);
  const [popularHotels, setPopular]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catalogRes, popularRes] = await Promise.all([
          getHotelsCatalog(),
          getPopularHotels(4),
        ]);
        setHotels(catalogRes.data || []);
        setPopular(popularRes.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load hotels.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Search / filter state ─────────────────────────────────
  const [search, setSearch] = useState({
    city: '', checkin: '', checkout: '', adults: '2', rooms: '1', minRating: '',
  });
  const [activeFilter, setActiveFilter] = useState('All');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const handleSearch = (next) => {
    setSearch(next);
    if (next.city) setActiveFilter(next.city);
    setVisibleCount(6);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleFavoriteToggle = async (hotel) => {
    if (!isAuthenticated) { navigate('/SignIn'); return; }
    try {
      await toggleFavorite({
        itemType: 'hotel',
        itemId: hotel.id,
        itemData: buildFavoriteItemData('hotel', {
          ...hotel, title: hotel.name, image: hotel.image_url, price: hotel.base_price, location: hotel.address,
        }),
      });
    } catch (err) { console.error(err); }
  };

  const handleDetails = (hotel) => navigate(`/hotels/details/${hotel.id}`, { state: { hotel, search } });
  const handleReserve = (hotel) => navigate('/hotels/reserve', { state: { hotel, search } });

  // ── Filtered list (no sort — default: featured first) ─────
  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    if (activeFilter !== 'All')
      list = list.filter(h => h.city === activeFilter);

    if (search.city) {
      const q = search.city.toLowerCase();
      list = list.filter(h =>
        h.city?.toLowerCase().includes(q) ||
        h.name?.toLowerCase().includes(q) ||
        h.address?.toLowerCase().includes(q)
      );
    }

    if (search.minRating)
      list = list.filter(h => Number(h.rating || 0) >= Number(search.minRating));

    if (onlyFeatured)
      list = list.filter(h => h.is_featured);

    const rooms = Number(search.rooms || 0);
    if (rooms > 0)
      list = list.filter(h => Number(h.available_rooms || 0) >= rooms);

    // Featured first, then by display_order
    list.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return Number(a.display_order || 0) - Number(b.display_order || 0);
    });

    return list;
  }, [hotels, activeFilter, search, onlyFeatured]);

  const visibleHotels = filteredHotels.slice(0, visibleCount);

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div>
      <Navbar />

      {/* ── Hero (rotating) ─────────────────────────────────── */}
      <section className="omra-hero">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="omra-hero__bg"
            style={{
              backgroundImage: `url('${s.bg}')`,
              opacity: i === heroIdx ? 1 : 0,
              transition: 'opacity 1.2s ease',
              position: 'absolute',
              inset: 0,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.45)',
            }}
          />
        ))}
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />

        <div className="omra-hero__content">
          <span className="omra-hero__tag">
            <i className="fas fa-hotel" style={{ color: '#e8306a' }} />
            {slide.tag}
          </span>
          <h1 className="omra-hero__title" key={heroIdx} style={{ animation: 'fadeInUp 0.6s ease' }}>
            {slide.title}<br />
            <span>{slide.accent}</span>
          </h1>
          <p className="omra-hero__subtitle">{slide.sub}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
            <button
              className="btn btn-primary"
              onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <i className="fas fa-bed" /> Browse Hotels
            </button>
            <button
              className="btn btn-glass"
              onClick={() => bestRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <i className="fas fa-star" /> Top Picks
            </button>
          </div>

          {/* Slide dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                style={{
                  width: i === heroIdx ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === heroIdx ? '#e8306a' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <div className="omra-hero__search-wrapper">
            <HotelsSearchBar onSearch={handleSearch} initialValues={search} />
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <section className="omra-stats">
        <div className="container">
          <div className="omra-stats__grid">
            {[
              { icon: 'fas fa-hotel',       value: hotels.length,  label: 'Hotels in catalogue' },
              { icon: 'fas fa-map-marker-alt', value: CITY_FILTERS.length - 1, label: 'Destinations' },
              { icon: 'fas fa-user-check',  value: hotels.reduce((s, h) => s + Number(h.reservation_count || 0), 0), label: 'Total bookings' },
              { icon: 'fas fa-star',        value: popularHotels[0] ? `${popularHotels[0].rating}★` : '4.8★', label: 'Average rating' },
            ].map(item => (
              <div key={item.label} className="omra-stats__item">
                <div className="omra-stats__icon"><i className={item.icon} /></div>
                <div>
                  <div className="omra-stats__value">{item.value}</div>
                  <div className="omra-stats__label">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotions ──────────────────────────────────────── */}
      {promos.length > 0 && (
        <section ref={promotionsRef} style={{ padding: '18px 0 0' }}>
          <div className="container">
            <PromotionsSection promos={promos} titre="Current Hotel Offers" />
          </div>
        </section>
      )}

      {/* ── Hotel Catalogue ─────────────────────────────────── */}
      <section className="omra-section omra-section--gray" ref={resultsRef}>
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Hotel Catalogue</span>
            <h2 className="omra-section__title">Choose Your Stay</h2>
            <p className="omra-section__desc">
              Select a meal plan directly on each card to see the adjusted price instantly.
            </p>
          </div>

          {/* City filters */}
          <div className="omra-filters-bar">
            <div className="omra-filters">
              {CITY_FILTERS.map(f => (
                <button
                  key={f}
                  className={`omra-filter-btn ${activeFilter === f ? 'omra-filter-btn--active' : ''}`}
                  onClick={() => { setActiveFilter(f); setVisibleCount(6); }}
                >
                  {f}
                </button>
              ))}
              <button
                className={`omra-filter-btn ${onlyFeatured ? 'omra-filter-btn--active' : ''}`}
                onClick={() => { setOnlyFeatured(p => !p); setVisibleCount(6); }}
                style={{ borderStyle: 'dashed' }}
              >
                <i className="fas fa-bookmark" style={{ fontSize: 11, marginRight: 4 }} />
                {onlyFeatured ? 'All Hotels' : 'Featured Only'}
              </button>
            </div>
            <p className="omra-filters-count">
              <strong>{filteredHotels.length}</strong> hotel{filteredHotels.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: '#0F4C5C', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading hotels...</p>
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
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>
                    No hotels match your criteria.
                  </p>
                  <button
                    className="omra-filter-btn"
                    onClick={() => {
                      setSearch({ city: '', checkin: '', checkout: '', adults: '2', rooms: '1', minRating: '' });
                      setActiveFilter('All');
                      setOnlyFeatured(false);
                      setVisibleCount(6);
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {visibleCount < filteredHotels.length && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button
                    className="omra-filter-btn"
                    style={{ padding: '12px 28px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 50 }}
                    onClick={() => setVisibleCount(c => c + 6)}
                  >
                    Load more ({filteredHotels.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Best Hotels (bottom) ─────────────────────────────── */}
      <section className="omra-section omra-section--white" ref={bestRef}>
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Top Picks</span>
            <h2 className="omra-section__title">Our Most Popular Hotels</h2>
            <p className="omra-section__desc">
              Ranked automatically by bookings and occupancy rate. These are the ones guests love most.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0F4C5C', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div className="omra-cards-grid">
              {popularHotels.slice(0, 4).map(hotel => (
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
          )}

          {/* CTA banner */}
          <div style={{
            marginTop: 56,
            background: 'linear-gradient(135deg, #0F4C5C 0%, #0a3a47 100%)',
            borderRadius: 24,
            padding: '48px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>🏨</span>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Can't find what you're looking for?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
                Our travel experts can arrange custom hotel packages tailored to your dates, budget and preferences.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/Contact')}
                >
                  <i className="fas fa-headset" /> Talk to an Expert
                </button>
                <button
                  className="btn btn-glass"
                  onClick={() => navigate('/CustomTripAbroad')}
                >
                  <i className="fas fa-magic" /> Custom Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HotelsPage;