import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { useHotels } from '../hooks/useHotels';
import { usePromotions } from '../hooks/usePromotions';
import PromotionsSection from './admin/promotions/PromotionsSection';
import '../styles/HotelsPage.css';

const getDefaultDate = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const Home = () => {
  const { t } = useTranslation('hotels');
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [draft, setDraft] = useState({
    city: '',
    checkIn: getDefaultDate(3),
    checkOut: getDefaultDate(6),
    adults: '2',
  });

  const [filters, setFilters] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    rooms: '1',
    sort: 'recommended',
    limit: 6,
  });

  const { promos } = usePromotions('accueil');
  const { hotels, cities, loading, error } = useHotels(filters);

  const slidesData = useMemo(
    () => ([
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
        title: t('home.heroSlides.slide1.title'),
        subtitle: t('home.heroSlides.slide1.subtitle'),
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80',
        title: t('home.heroSlides.slide2.title'),
        subtitle: t('home.heroSlides.slide2.subtitle'),
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80',
        title: t('home.heroSlides.slide3.title'),
        subtitle: t('home.heroSlides.slide3.subtitle'),
      },
    ]),
    [t]
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slidesData.length), 5000);
    return () => clearInterval(timer);
  }, [slidesData.length]);

  const bestDeals = useMemo(
    () => [...hotels].filter((hotel) => hotel.pricing?.pricePerNight).sort((a, b) => a.pricing.pricePerNight - b.pricing.pricePerNight).slice(0, 3),
    [hotels]
  );

  const destinations = useMemo(() => {
    const byCity = new Map();
    hotels.forEach((hotel) => {
      if (!byCity.has(hotel.city)) byCity.set(hotel.city, hotel);
    });
    return Array.from(byCity.values()).slice(0, 4);
  }, [hotels]);

  const today = new Date().toISOString().slice(0, 10);
  const updateDraft = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const searchQuery = new URLSearchParams({
    city: draft.city,
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    adults: draft.adults,
    children: '0',
    rooms: '1',
    sort: 'recommended',
  }).toString();

  const runSearch = () => {
    setFilters((prev) => ({
      ...prev,
      city: draft.city,
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      adults: draft.adults,
      children: '0',
      rooms: '1',
      sort: 'recommended',
      limit: 6,
    }));
  };

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-slider">
          {slidesData.map((slide, index) => (
            <div key={slide.id} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
              <img src={slide.image} alt={slide.title} />
              <div className="hero-overlay" />
              <div className="hero-content">
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                <div className="hero-buttons">
                  <button className="btn btn-primary btn-lg" onClick={() => navigate(`/hotels?${searchQuery}`)}>
                    <i className="fas fa-search" /> {t('heroPrimary')}
                  </button>
                  <button className="btn btn-glass btn-lg" onClick={() => navigate('/hotels?recommended=true')}>
                    <i className="fas fa-hotel" /> {t('heroSecondary')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="search-section">
        <div className="search-card">
          <div className="search-header">
            <h3>{t('home.searchBlockTitle')}</h3>
            <div className="search-tabs">
              <button className="search-tab active" type="button">
                {t('tabs.hotels')}
              </button>
            </div>
          </div>

          <div className="search-form">
            <div className="form-field">
              <label>
                <i className="fas fa-map-marker-alt" /> {t('fields.destination')}
              </label>
              <input
                value={draft.city}
                placeholder={t('home.destinationPlaceholder')}
                onChange={(e) => updateDraft('city', e.target.value)}
                list="home-hotel-cities"
              />
              <datalist id="home-hotel-cities">
                {cities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>

            <div className="form-field">
              <label>
                <i className="fas fa-calendar" /> {t('fields.checkIn')}
              </label>
              <input type="date" min={today} value={draft.checkIn} onChange={(e) => updateDraft('checkIn', e.target.value)} />
            </div>

            <div className="form-field">
              <label>
                <i className="fas fa-calendar" /> {t('fields.checkOut')}
              </label>
              <input
                type="date"
                min={draft.checkIn || today}
                value={draft.checkOut}
                onChange={(e) => updateDraft('checkOut', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>
                <i className="fas fa-user" /> {t('home.peopleLabel')}
              </label>
              <select value={draft.adults} onChange={(e) => updateDraft('adults', e.target.value)}>
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="btn btn-primary btn-search" onClick={runSearch}>
              <i className="fas fa-search" /> {t('searchButton')}
            </button>
          </div>
        </div>
      </section>

      {promos.length > 0 && (
        <div className="container" style={{ paddingTop: 24 }}>
          <PromotionsSection promos={promos} titre={t('sections.bestDeals')} />
        </div>
      )}

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>{t('sections.bestDestinations')}</h2>
            <p>{t('sections.bestDestinationsSubtitle')}</p>
          </div>
          <div className="hotels-insights">
            {destinations.map((hotel) => (
              <div key={hotel.city} className="hotels-insights__card">
                <h3>{hotel.city}</h3>
                <p>{hotel.pricing?.pricePerNight ? t('destinationFrom', { amount: hotel.pricing.pricePerNight }) : t('home.publicDataOnly')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="section-header">
            <h2>{t('sections.bestDeals')}</h2>
            <p>{t('sections.bestDealsSubtitle')}</p>
          </div>
          <div className="hotels-insights">
            {bestDeals.map((hotel) => (
              <div key={hotel.id} className="hotels-insights__card">
                <strong>{hotel.name}</strong>
                <p>{hotel.city}</p>
                <p>
                  {hotel.pricing.pricePerNight} TND / {t('perNightShort')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>{t('home.embeddedHotelsTitle')}</h2>
            <p>{t('home.embeddedHotelsSubtitle')}</p>
          </div>
          {error ? <div className="hotels-empty">{error}</div> : null}
          {loading ? (
            <div className="hotels-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="hotels-skeleton" />
              ))}
            </div>
          ) : (
            <HotelPreview hotels={hotels} onSelect={(hotel) => navigate(`/hotels/${hotel.id}?${searchQuery}`)} />
          )}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button className="btn btn-outline-primary" onClick={() => navigate(`/hotels?${searchQuery}`)}>
              {t('home.seeAllHotels')}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;

