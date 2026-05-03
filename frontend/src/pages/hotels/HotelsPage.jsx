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
import { getHotelPageCover, getHotelsCatalog, getPopularHotels } from '../../services/api';
import '../../styles/omrastyle.css';

const DEFAULT_COVER = {
  hero: {
    bg_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    tag: 'Hotels en Tunisie',
    title: 'Trouvez votre',
    title_accent: 'hotel ideal',
    sub: 'Des adresses choisies avec soin, des offres actives et un parcours de reservation identique aux voyages organises.',
  },
};

const FILTERS = ['Tous', 'Tunis', 'Sousse', 'Hammamet', 'Djerba'];

const HotelsPage = () => {
  const navigate = useNavigate();
  const promotionsRef = useRef(null);
  const resultsRef = useRef(null);
  const { promos } = usePromotions('categorie', 'hotels');
  const { favoriteIds, isAuthenticated, toggleFavorite } = useFavorites('hotel');

  const [covers, setCovers] = useState(DEFAULT_COVER);
  const [hotels, setHotels] = useState([]);
  const [popularHotels, setPopularHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState({
    city: '',
    checkin: '',
    checkout: '',
    adults: '2',
    rooms: '1',
    minRating: '',
  });
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catalogResponse, popularResponse, coverResponse] = await Promise.all([
          getHotelsCatalog(),
          getPopularHotels(4),
          getHotelPageCover(),
        ]);

        setHotels(catalogResponse.data || []);
        setPopularHotels(popularResponse.data || []);
        setCovers(coverResponse.data || DEFAULT_COVER);
      } catch (fetchError) {
        setError(fetchError.message || 'Impossible de charger les hotels.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (nextSearch) => {
    setSearch(nextSearch);
    if (nextSearch.city) setActiveFilter(nextSearch.city);
    setVisibleCount(6);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
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
          image: hotel.image_url,
          price: hotel.base_price,
          location: hotel.address,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHotels = useMemo(() => {
    let nextHotels = [...hotels];

    if (activeFilter !== 'Tous') {
      nextHotels = nextHotels.filter((hotel) => hotel.city === activeFilter);
    }

    if (search.city) {
      const query = search.city.toLowerCase();
      nextHotels = nextHotels.filter((hotel) =>
        hotel.city?.toLowerCase().includes(query)
        || hotel.name?.toLowerCase().includes(query)
        || hotel.address?.toLowerCase().includes(query)
      );
    }

    if (search.minRating) {
      nextHotels = nextHotels.filter((hotel) => Number(hotel.rating || 0) >= Number(search.minRating));
    }

    if (onlyFeatured) {
      nextHotels = nextHotels.filter((hotel) => hotel.is_featured);
    }

    const roomCount = Number(search.rooms || 0);
    if (roomCount > 0) {
      nextHotels = nextHotels.filter((hotel) => Number(hotel.available_rooms || 0) >= roomCount);
    }

    switch (sortBy) {
      case 'price_asc':
        nextHotels.sort((left, right) => Number(left.base_price || 0) - Number(right.base_price || 0));
        break;
      case 'price_desc':
        nextHotels.sort((left, right) => Number(right.base_price || 0) - Number(left.base_price || 0));
        break;
      case 'rating':
        nextHotels.sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0));
        break;
      case 'popular':
        nextHotels.sort((left, right) => Number(right.reservation_count || 0) - Number(left.reservation_count || 0));
        break;
      default:
        nextHotels.sort((left, right) => {
          if (left.is_featured === right.is_featured) return Number(left.display_order || 0) - Number(right.display_order || 0);
          return left.is_featured ? -1 : 1;
        });
        break;
    }

    return nextHotels;
  }, [hotels, activeFilter, search, onlyFeatured, sortBy]);

  const visibleHotels = filteredHotels.slice(0, visibleCount);

  const handleDetails = (hotel) => {
    navigate(`/hotels/details/${hotel.id}`, {
      state: {
        hotel,
        search,
      },
    });
  };

  const handleReserve = (hotel) => {
    navigate('/hotels/reserve', {
      state: {
        hotel,
        search,
      },
    });
  };

  return (
    <div>
      <Navbar />

      <section className="omra-hero">
        <div
          className="omra-hero__bg"
          style={{
            backgroundImage: `url('${covers?.hero?.bg_image || DEFAULT_COVER.hero.bg_image}')`,
          }}
        />
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />
        <div className="omra-hero__content">
          <span className="omra-hero__tag">
            <i className="fas fa-hotel" style={{ color: '#e8306a' }} />
            {covers?.hero?.tag || DEFAULT_COVER.hero.tag}
          </span>
          <h1 className="omra-hero__title">
            {covers?.hero?.title || DEFAULT_COVER.hero.title}<br />
            <span>{covers?.hero?.title_accent || DEFAULT_COVER.hero.title_accent}</span>
          </h1>
          <p className="omra-hero__subtitle">
            {covers?.hero?.sub || DEFAULT_COVER.hero.sub}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 26 }}>
            <button className="btn btn-primary" onClick={() => promotionsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-tags" /> Offres valables
            </button>
            <button className="btn btn-glass" onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-bed" /> Voir les hotels
            </button>
          </div>

          <div className="omra-hero__search-wrapper">
            <HotelsSearchBar onSearch={handleSearch} initialValues={search} />
          </div>
        </div>
      </section>

      {promos.length > 0 && (
        <section ref={promotionsRef} style={{ padding: '18px 0 0' }}>
          <div className="container">
            <PromotionsSection promos={promos} titre="Offres hotels disponibles" />
          </div>
        </section>
      )}

      <section className="omra-stats">
        <div className="container">
          <div className="omra-stats__grid">
            {[
              { icon: 'fas fa-hotel', value: hotels.length, label: 'Hotels en catalogue' },
              { icon: 'fas fa-heart', value: popularHotels.length, label: 'Hotels vedettes' },
              { icon: 'fas fa-user-check', value: hotels.reduce((sum, hotel) => sum + Number(hotel.reservation_count || 0), 0), label: 'Reservations hotels' },
              { icon: 'fas fa-percentage', value: `${Math.round(popularHotels[0]?.occupancy_percentage || 0)}%`, label: 'Popularite max' },
            ].map((item) => (
              <div key={item.label} className="omra-stats__item">
                <div className="omra-stats__icon">
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

      <section className="omra-section omra-section--white">
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Selection du moment</span>
            <h2 className="omra-section__title">Les 4 hotels les plus demandes</h2>
            <p className="omra-section__desc">
              Classement automatique base sur les reservations et le pourcentage d occupation.
            </p>
          </div>

          <div className="omra-cards-grid">
            {popularHotels.slice(0, 4).map((hotel) => (
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
        </div>
      </section>

      <section className="omra-section omra-section--gray" ref={resultsRef}>
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">Catalogue hotels</span>
            <h2 className="omra-section__title">Choisissez votre sejour hotel</h2>
            <p className="omra-section__desc">
              Meme logique que Voyages Organises, mais pour les hotels avec promotions, favoris et reservation en ligne.
            </p>
          </div>

          <div className="omra-filters-bar">
            <div className="omra-filters">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  className={`omra-filter-btn ${activeFilter === filter ? 'omra-filter-btn--active' : ''}`}
                  onClick={() => {
                    setActiveFilter(filter);
                    setVisibleCount(6);
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
            <p className="omra-filters-count"><strong>{filteredHotels.length}</strong> hotel(s) disponible(s)</p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 8 }}>
                  Tri
                </label>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setVisibleCount(6);
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b', background: '#fff', fontFamily: 'inherit' }}
                >
                  <option value="featured">Mise en avant</option>
                  <option value="popular">Popularite</option>
                  <option value="rating">Meilleure note</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix decroissant</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'end' }}>
                <button
                  className={`omra-filter-btn ${onlyFeatured ? 'omra-filter-btn--active' : ''}`}
                  onClick={() => {
                    setOnlyFeatured((current) => !current);
                    setVisibleCount(6);
                  }}
                >
                  {onlyFeatured ? 'Hotels vedettes uniquement' : 'Afficher les hotels vedettes'}
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: '#0F4C5C', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
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
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>
                    Aucun hotel ne correspond a vos criteres.
                  </p>
                  <button
                    className="omra-filter-btn"
                    onClick={() => {
                      setSearch({
                        city: '',
                        checkin: '',
                        checkout: '',
                        adults: '2',
                        rooms: '1',
                        minRating: '',
                      });
                      setActiveFilter('Tous');
                      setSortBy('featured');
                      setOnlyFeatured(false);
                      setVisibleCount(6);
                    }}
                  >
                    Reinitialiser les filtres
                  </button>
                </div>
              )}

              {visibleCount < filteredHotels.length && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button className="omra-filter-btn" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none' }} onClick={() => setVisibleCount((current) => current + 6)}>
                    Voir plus de hotels ({filteredHotels.length - visibleCount} restants)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default HotelsPage;
