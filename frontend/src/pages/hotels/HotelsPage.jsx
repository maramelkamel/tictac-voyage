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
import { getHotelById, getHotelPageCover, getHotelsCatalog, getPopularHotels } from '../../services/api';
import '../../styles/omrastyle.css';

const DEFAULT_CITIES = [
  'Tunis',
  'Sousse',
  'Hammamet',
  'Djerba',
  'Monastir',
  'Mahdia',
  'Tozeur',
  'Tabarka',
  'Bizerte',
  'Nabeul',
];

const DEFAULT_HERO = {
  bg_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
  tag: 'Hotels en Tunisie',
  title: 'Trouvez votre',
  title_accent: 'sejour ideal',
  sub: 'Des hotels alimentes uniquement depuis votre base de donnees, avec disponibilite, tarifs et reservation en ligne.',
};

const HotelsPage = () => {
  const navigate = useNavigate();
  const resultsRef = useRef(null);
  const bestRef = useRef(null);

  const { promos } = usePromotions('categorie', 'hotels');
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('hotel');

  const [hotels, setHotels] = useState([]);
  const [popularHotels, setPopularHotels] = useState([]);
  const [cover, setCover] = useState(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState({
    city: '',
    checkin: '',
    checkout: '',
    adults: '2',
    rooms: '1',
  });
  const [activeCity, setActiveCity] = useState('all');
  const [starFilter, setStarFilter] = useState(0);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catalogRes, popularRes, coverRes] = await Promise.all([
          getHotelsCatalog(),
          getPopularHotels(4),
          getHotelPageCover().catch(() => ({ data: { hero: DEFAULT_HERO } })),
        ]);

        setHotels(catalogRes.data || []);
        setPopularHotels(popularRes.data || []);
        setCover({ ...DEFAULT_HERO, ...(coverRes.data?.hero || {}) });
      } catch (fetchError) {
        setError(fetchError.message || 'Impossible de charger les hotels.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cityOptions = useMemo(() => {
    const merged = [...DEFAULT_CITIES, ...hotels.map((hotel) => hotel.city).filter(Boolean)];
    return [...new Set(merged)].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [hotels]);

  const handleSearch = (nextSearch) => {
    setSearch(nextSearch);
    setActiveCity(nextSearch.city || 'all');
    setVisibleCount(6);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
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
    } catch (toggleError) {
      console.error(toggleError);
    }
  };

  const handleDetails = async (hotel) => {
    try {
      const response = await getHotelById(hotel.id);
      navigate(`/hotels/details/${hotel.id}`, { state: { hotel: response.data || hotel, search } });
    } catch {
      navigate(`/hotels/details/${hotel.id}`, { state: { hotel, search } });
    }
  };

  const handleReserve = (hotel) => {
    navigate('/hotels/reserve', { state: { hotel, search } });
  };

  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    if (activeCity !== 'all') {
      list = list.filter((hotel) => hotel.city === activeCity);
    }

    const requestedCity = search.city?.trim().toLowerCase();
    if (requestedCity) {
      list = list.filter((hotel) =>
        hotel.city?.toLowerCase().includes(requestedCity)
        || hotel.name?.toLowerCase().includes(requestedCity)
        || hotel.address?.toLowerCase().includes(requestedCity)
      );
    }

    if (starFilter > 0) {
      list = list.filter((hotel) => Number(hotel.stars || 0) >= starFilter);
    }

    if (featuredOnly) {
      list = list.filter((hotel) => hotel.is_featured);
    }

    const requestedRooms = Number(search.rooms || 0);
    if (requestedRooms > 0) {
      list = list.filter((hotel) => Number(hotel.available_rooms || 0) >= requestedRooms);
    }

    list.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if (Number(a.display_order || 0) !== Number(b.display_order || 0)) {
        return Number(a.display_order || 0) - Number(b.display_order || 0);
      }
      if (Number(b.stars || 0) !== Number(a.stars || 0)) return Number(b.stars || 0) - Number(a.stars || 0);
      return Number(b.rating || 0) - Number(a.rating || 0);
    });

    return list;
  }, [activeCity, featuredOnly, hotels, search.city, search.rooms, starFilter]);

  const visibleHotels = filteredHotels.slice(0, visibleCount);
  const topHotels = popularHotels.length ? popularHotels : filteredHotels.slice(0, 4);
  const totalReservations = hotels.reduce((sum, hotel) => sum + Number(hotel.reservation_count || 0), 0);
  const averageRating = hotels.length
    ? (hotels.reduce((sum, hotel) => sum + Number(hotel.rating || 0), 0) / hotels.length).toFixed(1)
    : '0.0';

  const pinkButton = {
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

  const ghostPinkButton = {
    ...pinkButton,
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.28)',
    boxShadow: 'none',
  };

  return (
    <div>
      <Navbar />

      <section className="omra-hero" style={{ minHeight: '92vh' }}>
        <div
          className="omra-hero__bg"
          style={{
            backgroundImage: `url('${cover.bg_image || DEFAULT_HERO.bg_image}')`,
            filter: 'brightness(0.42)',
          }}
        />
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
            <button style={pinkButton} onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-bed" /> Voir les hotels
            </button>
            <button style={ghostPinkButton} onClick={() => bestRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-star" /> Nos coups de coeur
            </button>
          </div>

          <div className="omra-hero__search-wrapper" style={{ maxWidth: 1180 }}>
            <HotelsSearchBar onSearch={handleSearch} initialValues={search} cityOptions={cityOptions} />
          </div>
        </div>
      </section>

      <section style={{ background: '#fff4f7', borderTop: '1px solid rgba(232,48,106,0.08)', borderBottom: '1px solid rgba(232,48,106,0.08)' }}>
        <div className="container" style={{ padding: '26px 20px' }}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#be185d', marginBottom: 6 }}>
                  Filtres rapides
                </p>
                <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Cherchez par etoiles et destination
                </h2>
              </div>
              <button
                className={`omra-filter-btn ${featuredOnly ? 'omra-filter-btn--active' : ''}`}
                style={featuredOnly ? { background: '#e8306a', borderColor: '#e8306a' } : { borderColor: '#f3b3c7', color: '#9f1239' }}
                onClick={() => setFeaturedOnly((current) => !current)}
              >
                <i className="fas fa-heart" style={{ marginRight: 6 }} />
                {featuredOnly ? 'Tous les hotels' : 'Hotels vedettes'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9f1239', alignSelf: 'center' }}>Etoiles :</span>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setStarFilter((current) => (current === value ? 0 : value))}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 999,
                    border: `1.5px solid ${starFilter === value ? '#e8306a' : '#f4c7d4'}`,
                    background: starFilter === value ? '#e8306a' : '#fff',
                    color: starFilter === value ? '#fff' : '#9f1239',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {value} ★
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['all', ...cityOptions].map((city) => (
                <button
                  key={city}
                  className={`omra-filter-btn ${activeCity === city ? 'omra-filter-btn--active' : ''}`}
                  style={activeCity === city ? { background: '#e8306a', borderColor: '#e8306a' } : { borderColor: '#f3b3c7', color: '#9f1239' }}
                  onClick={() => {
                    setActiveCity(city);
                    setVisibleCount(6);
                  }}
                >
                  {city === 'all' ? 'Toutes les destinations' : city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="omra-stats" style={{ background: 'linear-gradient(135deg,#8a1538,#0f4c5c)' }}>
        <div className="container">
          <div className="omra-stats__grid">
            {[
              { icon: 'fas fa-hotel', value: hotels.length, label: 'Hotels en base' },
              { icon: 'fas fa-map-marker-alt', value: cityOptions.length, label: 'Destinations' },
              { icon: 'fas fa-user-check', value: totalReservations, label: 'Reservations enregistrees' },
              { icon: 'fas fa-star', value: `${averageRating} / 5`, label: 'Note moyenne' },
            ].map((item) => (
              <div key={item.label} className="omra-stats__item">
                <div className="omra-stats__icon" style={{ color: '#fda4bf' }}><i className={item.icon} /></div>
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
            <PromotionsSection promos={promos} titre="Promotions hotels" />
          </div>
        </section>
      )}

      <section className="omra-section omra-section--gray" ref={resultsRef}>
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag" style={{ color: '#be185d', background: 'rgba(232,48,106,0.08)' }}>Catalogue hotels</span>
            <h2 className="omra-section__title">Des hotels alimentes uniquement depuis la base</h2>
            <p className="omra-section__desc">
              Les cartes, les prix, les chambres, les vues et les extras affiches ici viennent directement de `hotels_catalog`.
            </p>
          </div>

          <div className="omra-filters-bar">
            <div className="omra-filters">
              <button
                className="omra-filter-btn omra-filter-btn--active"
                style={{ background: '#e8306a', borderColor: '#e8306a' }}
              >
                {filteredHotels.length} resultat{filteredHotels.length !== 1 ? 's' : ''}
              </button>
            </div>
            <p className="omra-filters-count">
              <strong>{visibleHotels.length}</strong> hotel{visibleHotels.length !== 1 ? 's' : ''} affiche{visibleHotels.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #fbcfe8', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement des hotels...</p>
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
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔎</div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>
                    Aucun hotel ne correspond a vos criteres.
                  </p>
                  <button
                    className="omra-filter-btn"
                    style={{ borderColor: '#f4c7d4', color: '#9f1239' }}
                    onClick={() => {
                      setSearch({ city: '', checkin: '', checkout: '', adults: '2', rooms: '1' });
                      setActiveCity('all');
                      setFeaturedOnly(false);
                      setStarFilter(0);
                      setVisibleCount(6);
                    }}
                  >
                    Reinitialiser les filtres
                  </button>
                </div>
              )}

              {visibleCount < filteredHotels.length && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button
                    style={pinkButton}
                    onClick={() => setVisibleCount((count) => count + 6)}
                  >
                    Voir plus ({filteredHotels.length - visibleCount} restant{filteredHotels.length - visibleCount > 1 ? 's' : ''})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="omra-section omra-section--white" ref={bestRef}>
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag" style={{ color: '#be185d', background: 'rgba(232,48,106,0.08)' }}>Coups de coeur</span>
            <h2 className="omra-section__title">Les hotels les plus demandes</h2>
            <p className="omra-section__desc">
              Ces hotels sont classes selon les reservations et la disponibilite restante.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #fbcfe8', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div className="omra-cards-grid">
              {topHotels.slice(0, 4).map((hotel) => (
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
            <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>🏨</span>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Vous ne trouvez pas encore le bon hotel ?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.7 }}>
                Notre equipe peut vous preparer une proposition adaptee a vos dates, votre budget, votre ville et votre formule de repas.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button style={pinkButton} onClick={() => navigate('/Contact')}>
                  <i className="fas fa-headset" /> Contacter un conseiller
                </button>
                <button style={ghostPinkButton} onClick={() => navigate('/CustomTripAbroad')}>
                  <i className="fas fa-magic" /> Demande sur mesure
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HotelsPage;
