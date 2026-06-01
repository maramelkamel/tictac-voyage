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
import { getHotelById, getHotelPageCover, getHotelsCatalog } from '../../services/api';
import { useTranslation } from 'react-i18next';
import '../../styles/omrastyle.css';

const DEFAULT_CITIES = [
  'Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Monastir',
  'Mahdia', 'Tozeur', 'Tabarka', 'Bizerte', 'Nabeul',
];

const DEFAULT_HERO = {
  bg_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
  photo_1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
  photo_2: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80',
  photo_3: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1600&q=80',
  photo_4: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80',
  tag: 'Hotels en Tunisie',
  title: 'Trouvez votre',
  title_accent: 'sejour ideal',
  sub: 'Des hotels alimentes uniquement depuis votre base de donnees, avec disponibilite, tarifs et reservation en ligne.',
};

const HOTEL_SORT_OPTIONS = [
  { value: 'featured', label: 'Recommandes' },
  { value: 'popular', label: 'Les plus demandes' },
  { value: 'rating', label: 'Mieux notes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
];

const HotelsPage = () => {
  const { t } = useTranslation('hotels');
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const { promos } = usePromotions('categorie', 'hotels');
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('hotel');

  const [hotels, setHotels] = useState([]);
  const [cover, setCover] = useState(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [search, setSearch] = useState({ city: '', checkin: '', checkout: '', budget: '', persons: '2' });
  const [activeCity, setActiveCity] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [catalogRes, coverRes] = await Promise.all([
          getHotelsCatalog(),
          getHotelPageCover().catch(() => ({ data: { hero: DEFAULT_HERO } })),
        ]);
        setHotels(catalogRes.data || []);
        const next = { ...DEFAULT_HERO, ...(coverRes.data?.hero || {}) };
        if (!next.photo_1) next.photo_1 = next.bg_image || DEFAULT_HERO.photo_1;
        setCover(next);
      } catch (e) {
        setError(e.message || t('errors.loadFailed', { defaultValue: 'Impossible de charger les hotels.' }));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const heroPhotos = useMemo(() => {
    const photos = [cover.photo_1, cover.photo_2, cover.photo_3, cover.photo_4]
      .map((item) => item?.trim())
      .filter(Boolean);
    return photos.length ? photos : [cover.bg_image || DEFAULT_HERO.bg_image];
  }, [cover]);

  useEffect(() => {
    setActiveHeroIndex(0);
  }, [heroPhotos]);

  useEffect(() => {
    if (heroPhotos.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveHeroIndex((index) => (index + 1) % heroPhotos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroPhotos]);

  const cityOptions = useMemo(() => {
    const all = [...DEFAULT_CITIES, ...hotels.map((hotel) => hotel.city).filter(Boolean)];
    return [...new Set(all)].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [hotels]);

  const handleSearch = (next) => {
    setSearch(next);
    setActiveCity(next.city || 'all');
    setVisibleCount(6);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleFavoriteToggle = async (hotel) => {
    if (!isAuthenticated) {
      navigate('/SignIn');
      return;
    }

    try {
      await toggleFavorite({
        itemType: 'hotel',
        itemId: hotel.id,
        itemData: buildFavoriteItemData('hotel', {
          ...hotel,
          title: hotel.name,
          image: hotel.image_url || hotel.gallery?.[0] || null,
          price: hotel.base_price,
          location: hotel.address,
        }),
      });
    } catch (e) {
      console.error(e);
    }
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

  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    if (activeCity !== 'all') {
      list = list.filter((hotel) => hotel.city === activeCity);
    }

    const query = search.city?.trim().toLowerCase();
    if (query) {
      list = list.filter((hotel) =>
        hotel.city?.toLowerCase().includes(query)
        || hotel.name?.toLowerCase().includes(query)
        || hotel.address?.toLowerCase().includes(query)
      );
    }

    if (featuredOnly) {
      list = list.filter((hotel) => hotel.is_featured);
    }

    const budget = Number(search.budget || 0);
    if (budget > 0) {
      list = list.filter((hotel) => {
        const price = Number(hotel.base_price || 0);
        return price > 0 && price <= budget;
      });
    }

    list.sort((a, b) => {
      const asNumber = (value) => Number(value || 0);

      if (sortBy === 'price_asc') return (a.base_price ?? Infinity) - (b.base_price ?? Infinity);
      if (sortBy === 'price_desc') return (b.base_price ?? -Infinity) - (a.base_price ?? -Infinity);
      if (sortBy === 'rating') return asNumber(b.rating) - asNumber(a.rating) || asNumber(b.reviews) - asNumber(a.reviews);
      if (sortBy === 'popular') {
        return asNumber(b.reservation_count) - asNumber(a.reservation_count)
          || asNumber(b.occupancy_percentage) - asNumber(a.occupancy_percentage);
      }
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return asNumber(a.display_order) - asNumber(b.display_order) || asNumber(b.rating) - asNumber(a.rating);
    });

    return list;
  }, [activeCity, featuredOnly, hotels, search.budget, search.city, sortBy]);

  const visibleHotels = filteredHotels.slice(0, visibleCount);
  const totalReservations = hotels.reduce((sum, hotel) => sum + Number(hotel.reservation_count || 0), 0);
  const averageRating = hotels.length
    ? (hotels.reduce((sum, hotel) => sum + Number(hotel.rating || 0), 0) / hotels.length).toFixed(1)
    : '0.0';

  const pinkBtn = {
    padding: '14px 26px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg,#e8306a,#be185d)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 18px 32px rgba(232,48,106,0.28)',
  };

  const ghostBtn = {
    ...pinkBtn,
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.28)',
    boxShadow: 'none',
  };

  return (
    <div>
      <Navbar />

      <section className="omra-hero" style={{ minHeight: '92vh' }}>
        {heroPhotos.map((photo, index) => (
          <div
            key={`${photo}-${index}`}
            className="omra-hero__bg"
            style={{
              backgroundImage: `url('${photo}')`,
              filter: 'brightness(0.42)',
              opacity: index === activeHeroIndex ? 1 : 0,
              transition: 'opacity 1s ease',
            }}
          />
        ))}
        <div className="omra-hero__pattern" />
        <div
          className="omra-hero__overlay"
          style={{ background: 'linear-gradient(to bottom, rgba(10,40,50,0.16) 0%, rgba(10,40,50,0.72) 100%)' }}
        />
        <div className="omra-hero__content">
          <span className="omra-hero__tag" style={{ borderColor: 'rgba(232,48,106,0.25)' }}>
            <i className="fas fa-hotel" style={{ color: '#fda4bf' }} />
            {cover.tag || DEFAULT_HERO.tag}
          </span>
          <h1 className="omra-hero__title" style={{ maxWidth: 860, marginInline: 'auto' }}>
            {cover.title || DEFAULT_HERO.title}
            <br />
            <span>{cover.title_accent || DEFAULT_HERO.title_accent}</span>
          </h1>
          <p className="omra-hero__subtitle" style={{ maxWidth: 700 }}>
            {cover.sub || DEFAULT_HERO.sub}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
            <button style={pinkBtn} onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-bed" /> {t('page.viewHotels', { defaultValue: 'Voir les hotels' })}
            </button>
          </div>
          <div className="omra-hero__search-wrapper" style={{ maxWidth: 1180 }}>
            <HotelsSearchBar onSearch={handleSearch} initialValues={search} cityOptions={cityOptions} />
          </div>
        </div>
      </section>

      <section className="omra-stats" style={{ background: 'linear-gradient(135deg,#8a1538,#0f4c5c)' }}>
        <div className="container">
          <div className="omra-stats__grid">
            {[
              { icon: 'fas fa-hotel', value: hotels.length, label: t('page.statsHotels', { defaultValue: 'Hotels en base' }) },
              { icon: 'fas fa-map-marker-alt', value: cityOptions.length, label: t('page.statsDestinations', { defaultValue: 'Destinations' }) },
              { icon: 'fas fa-user-check', value: totalReservations, label: t('page.statsReservations', { defaultValue: 'Reservations enregistrees' }) },
              { icon: 'fas fa-star', value: `${averageRating} / 5`, label: t('page.statsRating', { defaultValue: 'Note moyenne' }) },
            ].map((item) => (
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

      {promos.length > 0 && (
        <section style={{ padding: '18px 0 0' }}>
          <div className="container">
            <PromotionsSection promos={promos} titre={t('page.promotionsTitle', { defaultValue: 'Promotions hotels' })} />
          </div>
        </section>
      )}

      <section className="omra-section omra-section--gray" ref={resultsRef}>
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag" style={{ color: '#be185d', background: 'rgba(232,48,106,0.08)' }}>
              {t('page.catalogTag', { defaultValue: 'Catalogue hotels' })}
            </span>
            <h2 className="omra-section__title">{t('page.catalogTitle', { defaultValue: 'Tous nos hotels disponibles' })}</h2>
            <p className="omra-section__desc">
              {t('page.catalogDesc', { defaultValue: 'Disponibilite, tarifs et informations alimentes en temps reel depuis votre base de donnees.' })}
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid rgba(232,48,106,0.12)',
              borderRadius: 16,
              padding: '16px 18px',
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '.07em',
                  flexShrink: 0,
                }}
              >
                {t('fields.destination')}
              </span>
              {['all', ...cityOptions].map((city) => (
                <button
                  key={city}
                  className={`omra-filter-btn ${activeCity === city ? 'omra-filter-btn--active' : ''}`}
                  style={activeCity === city
                    ? { background: '#e8306a', borderColor: '#e8306a', color: '#fff' }
                    : { borderColor: '#f3b3c7', color: '#9f1239' }}
                  onClick={() => {
                    setActiveCity(city);
                    setVisibleCount(6);
                  }}
                >
                  {city === 'all' ? t('allCategories') : city}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  className={`omra-filter-btn ${featuredOnly ? 'omra-filter-btn--active' : ''}`}
                  style={featuredOnly
                    ? { background: '#e8306a', borderColor: '#e8306a', color: '#fff' }
                    : { borderColor: '#f3b3c7', color: '#9f1239' }}
                  onClick={() => {
                    setFeaturedOnly((value) => !value);
                    setVisibleCount(6);
                  }}
                >
                  <i className="fas fa-heart" style={{ marginRight: 5 }} />
                  {featuredOnly ? t('page.allHotels', { defaultValue: 'Tous les hotels' }) : t('page.featuredHotels', { defaultValue: 'Hotels vedettes' })}
                </button>

                <span
                  style={{
                    background: 'rgba(232,48,106,0.08)',
                    color: '#be185d',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 999,
                  }}
                >
                  {t('page.resultCount', { count: filteredHotels.length, defaultValue: `${filteredHotels.length} resultat${filteredHotels.length !== 1 ? 's' : ''}` })}
                </span>
              </div>

              <SortFilter sortBy={sortBy} setSortBy={setSortBy} options={HOTEL_SORT_OPTIONS} />
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: '3px solid #fbcfe8',
                  borderTopColor: '#e8306a',
                  borderRadius: '50%',
                  animation: 'spin .7s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>{t('loading')}</p>
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
                {visibleHotels.map((hotel) => (
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
                    {t('errors.noMatches')}
                  </p>
                  <button
                    className="omra-filter-btn"
                    style={{ borderColor: '#f4c7d4', color: '#9f1239', marginTop: 8 }}
                    onClick={() => {
                      setSearch({ city: '', checkin: '', checkout: '', budget: '', persons: '2' });
                      setActiveCity('all');
                      setFeaturedOnly(false);
                      setSortBy('featured');
                      setVisibleCount(6);
                    }}
                  >
                    {t('page.resetFilters', { defaultValue: 'Reinitialiser les filtres' })}
                  </button>
                </div>
              )}

              {visibleCount < filteredHotels.length && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button style={pinkBtn} onClick={() => setVisibleCount((count) => count + 6)}>
                    {t('page.showMore', {
                      count: filteredHotels.length - visibleCount,
                      defaultValue: `Voir plus (${filteredHotels.length - visibleCount} restant${filteredHotels.length - visibleCount > 1 ? 's' : ''})`,
                    })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="omra-section omra-section--white">
        <div className="container">
          <div
            style={{
              marginTop: 56,
              background: 'linear-gradient(135deg,#0f4c5c 0%,#8a1538 100%)',
              borderRadius: 24,
              padding: '48px 40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>🏨</span>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                {t('page.customTitle', { defaultValue: 'Vous ne trouvez pas le bon hotel ?' })}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.7 }}>
                {t('page.customDesc', { defaultValue: 'Notre equipe peut vous preparer une proposition adaptee a vos dates, votre budget et votre ville.' })}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button style={pinkBtn} onClick={() => navigate('/Contact')}>
                  <i className="fas fa-headset" /> {t('page.contactAdvisor', { defaultValue: 'Contacter un conseiller' })}
                </button>
                <button style={ghostBtn} onClick={() => navigate('/CustomTripAbroad')}>
                  <i className="fas fa-magic" /> {t('page.customRequest', { defaultValue: 'Demande sur mesure' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
};

export default HotelsPage;
