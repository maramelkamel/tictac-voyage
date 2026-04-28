import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CardStyle from '../../components/CardStyle';
import { getMergedHotels } from '../../services/hotelsService';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../admin/promotions/PromotionsSection';
import '../../styles/omrastyle.css';

const CITY_OPTIONS = ['Tunis', 'Sousse', 'Hammamet'];

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

const HotelsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const defaults = getInitialDates();

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
  const { promos } = usePromotions('categorie', 'hotels');

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

  const handleSearch = (event) => {
    event.preventDefault();
    if (checkout <= checkin) {
      setError('Checkout must be after check-in.');
      return;
    }

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

  return (
    <>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f3460 100%)', paddingTop: 120, paddingBottom: 34 }}>
        <div className="container">
          <div className="omra-page-breadcrumb" style={{ paddingTop: 0, marginBottom: 16 }}>
            <button onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Accueil
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ color: '#fff', fontWeight: 700 }}>Hotels</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Hotels in Tunisia</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Booking API provides hotel details, while MakCorps enriches prices. Results stay safe even if one API fails.
          </p>
        </div>
      </div>

      {promos.length > 0 && (
        <div className="container" style={{ paddingTop: 24 }}>
          <PromotionsSection promos={promos} titre="Promotions hotels" showCards={false} />
        </div>
      )}

      <div className="container" style={{ padding: '28px 0 60px' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.8fr 0.8fr auto', gap: 12, alignItems: 'end' }}>
            <div className="omra-reserve__field">
              <label>City</label>
              <input
                list="hotel-cities"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Tunis"
              />
              <datalist id="hotel-cities">
                {CITY_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <div className="omra-reserve__field">
              <label>Check-in</label>
              <input type="date" value={checkin} onChange={(event) => setCheckin(event.target.value)} />
            </div>
            <div className="omra-reserve__field">
              <label>Check-out</label>
              <input type="date" min={checkin} value={checkout} onChange={(event) => setCheckout(event.target.value)} />
            </div>
            <div className="omra-reserve__field">
              <label>Adults</label>
              <input type="number" min="1" max="6" value={adults} onChange={(event) => setAdults(Number(event.target.value))} />
            </div>
            <div className="omra-reserve__field">
              <label>Rooms</label>
              <input type="number" min="1" max="4" value={rooms} onChange={(event) => setRooms(Number(event.target.value))} />
            </div>
            <button
              type="submit"
              style={{
                height: 48,
                border: 'none',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #e92f64, #c2185b)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0 24px',
              }}
            >
              Search
            </button>
          </form>
        </div>

        {warnings.map((warning) => (
          <div
            key={warning}
            style={{
              background: '#fff7ed',
              border: '1px solid #fdba74',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 13,
              color: '#9a3412',
              marginBottom: 12,
            }}
          >
            {warning}
          </div>
        ))}

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 12,
              padding: '14px 16px',
              fontSize: 13,
              color: '#991b1b',
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a2832', margin: '0 0 4px' }}>
              {city} hotel results
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {pagination.total} hotel{pagination.total > 1 ? 's' : ''} available
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/hotels/explain')}
            style={{
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#0F4C5C',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            How the hotel system works
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                style={{
                  height: 420,
                  borderRadius: 18,
                  background: 'linear-gradient(90deg, #f1f5f9 25%, #e8edf2 50%, #f1f5f9 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px dashed #cbd5e1', padding: 40, textAlign: 'center' }}>
            <i className="fas fa-hotel" style={{ fontSize: 42, color: '#94a3b8', marginBottom: 14, display: 'block' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#475569', marginBottom: 8 }}>No hotels found for this search.</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Try another city or slightly different travel dates.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {hotels.map((hotel) => (
              <CardStyle
                key={hotel.id}
                type="hotel"
                image={hotel.image}
                title={hotel.name}
                description={`${hotel.description} ${hotel.availabilityLabel ? ` ${hotel.availabilityLabel}.` : ''}`}
                location={hotel.location}
                rating={hotel.rating}
                price={hotel.price_numeric || undefined}
                currency={hotel.currency}
                priceUnit="/ stay"
                priceOptions={[]}
                amenities={hotel.amenityItems}
                onDetailsClick={() => goToReservation(hotel)}
                onReserveClick={() => goToReservation(hotel)}
                detailLabel="View offer"
                reserveLabel="Reserve"
                estimatedHint={hotel.source}
              />
            ))}
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 26 }}>
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: '#334155',
                fontWeight: 700,
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
              Page {page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                color: '#334155',
                fontWeight: 700,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
};

export default HotelsPage;
