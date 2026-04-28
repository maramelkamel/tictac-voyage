import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getMergedHotels } from '../../services/hotelsService';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import '../../styles/omrastyle.css';

const CITY_OPTIONS = ['Tunis', 'Sousse', 'Hammamet'];

const HOTEL_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
    title: 'Des hotels soigneusement selectionnes en Tunisie',
    subtitle: 'Recherchez Tunis, Sousse ou Hammamet avec le meme parcours clair que votre systeme de vols.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80',
    title: 'Booking pour les details, MakCorps pour les prix',
    subtitle: 'Nous gardons les resultats stables meme si une API tombe, avec un enrichissement par nom d hotel.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1600&q=80',
    title: 'Reservation puis paiement, comme les vols',
    subtitle: 'Choisissez votre hotel, confirmez vos informations, puis passez au paiement en ligne ou en agence.',
  },
];

const FEATURED_CITIES = [
  {
    city: 'Tunis',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    description: 'Centre-ville, affaires et courts sejours',
    caption: 'Recherche rapide',
  },
  {
    city: 'Sousse',
    image: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200&q=80',
    description: 'Hotels bord de mer et escapades week-end',
    caption: 'Sejours balneaires',
  },
  {
    city: 'Hammamet',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
    description: 'Resorts, familles et vacances detente',
    caption: 'Resorts populaires',
  },
];

const HOTEL_AMENITY_ICONS = {
  WiFi: 'fas fa-wifi',
  Pool: 'fas fa-swimming-pool',
  Breakfast: 'fas fa-mug-hot',
  Parking: 'fas fa-parking',
};

const getInitialDates = () => {
  const now = new Date();
  const checkIn = new Date(now);
  checkIn.setDate(now.getDate() + 3);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 1);

  const formatDate = (date) => date.toISOString().split('T')[0];

  return {
    checkin: formatDate(checkIn),
    checkout: formatDate(checkOut),
  };
};

const HotelResultCard = ({ hotel, onReserve }) => (
  <article
    style={{
      background: 'var(--white)',
      borderRadius: 20,
      overflow: 'hidden',
      border: '1px solid var(--gray-100)',
      boxShadow: '0 12px 32px rgba(15,76,92,0.08)',
      transition: 'transform 0.28s ease, box-shadow 0.28s ease',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
  >
    <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
      <img
        src={hotel.image}
        alt={hotel.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(event) => {
          event.currentTarget.src = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80';
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,40,50,0.82) 0%, rgba(10,40,50,0.08) 58%)' }} />
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(10px)' }}>
          {hotel.source}
        </span>
        <span style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(30,202,211,0.92)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
          {hotel.availabilityLabel}
        </span>
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)', marginBottom: 8 }}>
            {hotel.city || 'Tunisia'}
          </div>
          <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 800, color: '#fff', margin: 0 }}>
            {hotel.name}
          </h3>
        </div>
        <div style={{ minWidth: 70, padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.14)', color: '#fff', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Rating</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{hotel.rating}</div>
        </div>
      </div>
    </div>

    <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-400)', marginBottom: 12 }}>
        <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent)' }} />
        {hotel.location}
      </p>

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--gray-500)',
          marginBottom: 16,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {hotel.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {(hotel.amenities || []).slice(0, 4).map((amenity) => (
          <span
            key={amenity}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 11px',
              borderRadius: 10,
              background: 'rgba(15,76,92,0.06)',
              color: 'var(--primary)',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <i className={HOTEL_AMENITY_ICONS[amenity] || 'fas fa-check'} style={{ color: 'var(--secondary)', fontSize: 10 }} />
            {amenity}
          </span>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--gray-100)', marginBottom: 18 }} />

      <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginTop: 'auto' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gray-400)', marginBottom: 7 }}>
            Total stay
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: hotel.price_numeric ? 30 : 16, lineHeight: 1, fontWeight: 900, color: 'var(--accent)' }}>
              {hotel.price_numeric ? Number(hotel.price_numeric).toLocaleString('fr-FR') : 'N/A'}
            </span>
            {hotel.price_numeric && <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>{hotel.currency}</span>}
            {hotel.price_numeric && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>/ stay</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => onReserve(hotel)}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: '2px solid var(--gray-200)',
              background: 'transparent',
              color: 'var(--primary)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => onReserve(hotel)}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: '2px solid var(--secondary)',
              background: 'var(--secondary)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  </article>
);

const HotelsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const defaults = getInitialDates();
  const { promos } = usePromotions('categorie', 'hotels');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [city, setCity] = useState(state?.city || 'Tunis');
  const [checkin, setCheckin] = useState(state?.checkin || defaults.checkin);
  const [checkout, setCheckout] = useState(state?.checkout || defaults.checkout);
  const [adults, setAdults] = useState(state?.adults || 2);
  const [rooms, setRooms] = useState(state?.rooms || 1);
  const [page, setPage] = useState(state?.page || 1);
  const [hotels, setHotels] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % HOTEL_SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHotels = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getMergedHotels({
          city,
          page,
          pageSize: 6,
          checkin,
          checkout,
          adults,
          rooms,
        });

        if (cancelled) return;

        setHotels(result.hotels);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
        });
        setWarnings(result.warnings);
      } catch (loadError) {
        if (cancelled) return;
        setHotels([]);
        setWarnings([]);
        setError(loadError.message || 'Unable to load hotels right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHotels();

    return () => {
      cancelled = true;
    };
  }, [city, page, checkin, checkout, adults, rooms]);

  const featuredStats = useMemo(() => ([
    { icon: 'fas fa-hotel', value: `${pagination.total}`, label: 'Hotels trouves' },
    { icon: 'fas fa-map-marked-alt', value: city, label: 'Ville active' },
    { icon: 'fas fa-shield-alt', value: '2 APIs', label: 'Double verification' },
    { icon: 'fas fa-credit-card', value: 'Vol-like flow', label: 'Reservation + paiement' },
  ]), [city, pagination.total]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (checkout <= checkin) {
      setError('Checkout must be after check-in.');
      return;
    }

    setError('');
    setPage(1);
    navigate('/hotels/results', {
      state: {
        city,
        checkin,
        checkout,
        adults,
        rooms,
        page: 1,
      },
    });
  };

  const goToReservation = (hotel) => {
    navigate('/hotels/reserve', {
      state: {
        hotel,
        search: { city, checkin, checkout, adults, rooms },
      },
    });
  };

  const quickSelectCity = (selectedCity) => {
    setCity(selectedCity);
    setPage(1);
    navigate('/hotels/results', {
      state: {
        city: selectedCity,
        checkin,
        checkout,
        adults,
        rooms,
        page: 1,
      },
    });
  };

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-slider">
          {HOTEL_SLIDES.map((slide, index) => (
            <div key={slide.id} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
              <img src={slide.image} alt={slide.title} />
              <div className="hero-overlay" />
              <div className="hero-content" style={{ maxWidth: 1120 }}>
                <div className="omra-hero__tag" style={{ marginBottom: 22 }}>
                  <i className="fas fa-hotel" style={{ color: '#1ECAD3' }} />
                  Hotel search powered by Booking + MakCorps
                </div>
                <h1 className="hero-title" style={{ maxWidth: 860, marginLeft: 'auto', marginRight: 'auto' }}>
                  {slide.title}
                </h1>
                <p className="hero-subtitle" style={{ maxWidth: 720 }}>
                  {slide.subtitle}
                </p>

                <form
                  onSubmit={handleSearch}
                  style={{
                    background: 'rgba(255,255,255,0.96)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 24,
                    padding: '28px 32px',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
                    maxWidth: 1120,
                    margin: '0 auto',
                    textAlign: 'left',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fas fa-search" style={{ color: 'var(--secondary)' }} />
                    Rechercher un hotel
                  </p>

                  <div className="hotel-search-grid">
                    <div className="hotel-search-field">
                      <label>Ville</label>
                      <input list="hotel-cities" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Tunis" />
                      <datalist id="hotel-cities">
                        {CITY_OPTIONS.map((option) => <option key={option} value={option} />)}
                      </datalist>
                    </div>

                    <div className="hotel-search-field">
                      <label>Check-in</label>
                      <input type="date" value={checkin} onChange={(event) => setCheckin(event.target.value)} />
                    </div>

                    <div className="hotel-search-field">
                      <label>Check-out</label>
                      <input type="date" min={checkin} value={checkout} onChange={(event) => setCheckout(event.target.value)} />
                    </div>

                    <div className="hotel-search-field">
                      <label>Adultes</label>
                      <input type="number" min="1" max="6" value={adults} onChange={(event) => setAdults(Number(event.target.value))} />
                    </div>

                    <div className="hotel-search-field">
                      <label>Chambres</label>
                      <input type="number" min="1" max="4" value={rooms} onChange={(event) => setRooms(Number(event.target.value))} />
                    </div>

                    <button type="submit" className="hotel-search-submit">
                      <i className="fas fa-search" /> Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ))}
        </div>

        <button className="slider-control prev" onClick={() => setCurrentSlide((previous) => (previous - 1 + HOTEL_SLIDES.length) % HOTEL_SLIDES.length)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="slider-control next" onClick={() => setCurrentSlide((previous) => (previous + 1) % HOTEL_SLIDES.length)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      <section className="omra-stats">
        <div className="container">
          <div className="omra-stats__grid">
            {featuredStats.map((stat) => (
              <div key={stat.label} className="omra-stats__item">
                <div className="omra-stats__icon">
                  <i className={stat.icon} />
                </div>
                <div>
                  <div className="omra-stats__value" style={{ fontSize: 20 }}>{stat.value}</div>
                  <div className="omra-stats__label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {promos.length > 0 && (
        <section style={{ padding: '24px 0 0' }}>
          <div className="container">
            <PromotionsSection promos={promos} titre="Promotions hotels" showCards={false} />
          </div>
        </section>
      )}

      <section className="section" id="hotel-destinations">
        <div className="container">
          <div className="section-header">
            <h2>Destinations Hotels</h2>
            <p>Choisissez rapidement une ville populaire et chargez ses hotels dans le meme flux que les vols.</p>
            <div className="section-header-line" />
          </div>

          <div className="destinations-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {FEATURED_CITIES.map((item) => (
              <button
                key={item.city}
                type="button"
                className="destination-card"
                style={{ border: 'none', padding: 0, textAlign: 'left', background: 'transparent' }}
                onClick={() => quickSelectCity(item.city)}
              >
                <img src={item.image} alt={item.city} />
                <div className="destination-overlay">
                  <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, color: 'rgba(255,255,255,0.72)' }}>
                    {item.caption}
                  </p>
                  <h3>{item.city}</h3>
                  <p>{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="omra-section omra-section--gray">
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">
              <i className="fas fa-bed" style={{ marginRight: 8 }} />
              Resultats Hotels
            </span>
            <h2 className="omra-section__title">
              {city} <br /> hotel results
            </h2>
            <p className="omra-section__desc">
              {pagination.total} hotel{pagination.total > 1 ? 's' : ''} disponible{pagination.total > 1 ? 's' : ''}. Booking reste la source principale, MakCorps enrichit les prix.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <button
              type="button"
              onClick={() => navigate('/hotels/explain')}
              className="omra-filter-btn"
            >
              How the hotel system works
            </button>
          </div>

          {warnings.length > 0 && (
            <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
              {warnings.map((warning) => (
                <div
                  key={warning}
                  style={{
                    borderRadius: 16,
                    border: '1px solid #fdba74',
                    background: '#fff7ed',
                    color: '#9a3412',
                    padding: '14px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <i className="fas fa-exclamation-triangle" />
                  {warning}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 20, borderRadius: 16, border: '1px solid #fca5a5', background: '#fef2f2', color: '#991b1b', padding: '14px 18px', fontSize: 13, fontWeight: 700 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="omra-cards-grid hotel-results-grid">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  style={{
                    height: 470,
                    borderRadius: 20,
                    background: 'linear-gradient(90deg, #f1f5f9 25%, #e8edf2 50%, #f1f5f9 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'hotel-shimmer 1.4s ease-in-out infinite',
                  }}
                />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px dashed var(--gray-200)', padding: '46px 24px', textAlign: 'center' }}>
              <i className="fas fa-hotel" style={{ fontSize: 44, color: 'var(--gray-300)', marginBottom: 16, display: 'block' }} />
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--gray-700)', marginBottom: 8 }}>No hotels found for this search.</p>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: 0 }}>Try another city or slightly different travel dates.</p>
            </div>
          ) : (
            <div className="omra-cards-grid hotel-results-grid">
              {hotels.map((hotel) => (
                <HotelResultCard key={hotel.id} hotel={hotel} onReserve={goToReservation} />
              ))}
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 34, flexWrap: 'wrap' }}>
              <button type="button" className="omra-filter-btn" disabled={page === 1} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}>
                Previous
              </button>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--gray-600)' }}>
                Page {page} / {pagination.totalPages}
              </span>
              <button type="button" className="omra-filter-btn omra-filter-btn--active" disabled={page === pagination.totalPages} onClick={() => setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))}>
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section advantages-section">
        <div className="container">
          <div className="section-header">
            <h2>Pourquoi ce systeme hotel</h2>
            <p>Nous avons garde votre logique Flights tout en l adaptant aux hotels sans casser le reste du projet.</p>
            <div className="section-header-line" />
          </div>
          <div className="advantages-grid">
            {[
              {
                icon: 'fas fa-layer-group',
                title: 'Booking en source principale',
                desc: 'Le listing hotel, l image, la note et la localisation viennent d abord de Booking.',
              },
              {
                icon: 'fas fa-tags',
                title: 'MakCorps pour enrichir les prix',
                desc: 'Le prix est fusionne seulement quand un nom d hotel ressemble suffisamment, sans index fragile.',
              },
              {
                icon: 'fas fa-shield-alt',
                title: 'Fallback sans crash UI',
                desc: 'Si une API tombe, la page reste exploitable avec des hotels manuels ou des donnees degradees.',
              },
            ].map((item) => (
              <div key={item.title} className="advantage-card">
                <div className="advantage-icon"><i className={item.icon} /></div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes hotel-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .hotel-search-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr 1fr 0.8fr 0.8fr auto;
          gap: 14px;
          align-items: end;
        }

        .hotel-search-field label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .hotel-search-field input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--gray-200);
          background: var(--gray-50);
          color: var(--gray-800);
          font-size: 14px;
        }

        .hotel-search-submit {
          height: 52px;
          border-radius: 14px;
          border: none;
          padding: 0 24px;
          background: linear-gradient(135deg, var(--accent), #c2185b);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          box-shadow: 0 16px 28px rgba(233,47,100,0.26);
        }

        .hotel-results-grid {
          grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
        }

        @media (max-width: 1200px) {
          .hotel-search-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .hotel-search-submit {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .hotel-search-grid {
            grid-template-columns: 1fr;
          }

          .hotel-results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default HotelsPage;
