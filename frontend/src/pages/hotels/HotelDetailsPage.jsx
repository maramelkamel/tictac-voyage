import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getHotelById } from '../../services/api';
import '../../styles/detail.css';

const normalizeHotel = (hotel) => ({
  ...hotel,
  title: hotel.name,
  image: hotel.image_url,
  prix: Number(hotel.base_price || 0),
  oldPrix: hotel.old_price ? Number(hotel.old_price) : null,
});

const HotelDetailsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [hotel, setHotel] = useState(state?.hotel ? normalizeHotel(state.hotel) : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    getHotelById(id)
      .then((response) => setHotel(response.data ? normalizeHotel(response.data) : null))
      .catch(() => setHotel(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8' }}>Chargement de l hotel...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>?</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2832', marginBottom: 16 }}>
            Hotel introuvable.
          </p>
          <button
            onClick={() => navigate('/hotels')}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#e8306a,#b72754)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            Retour aux hotels
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = [hotel.image_url, ...(hotel.gallery || [])].filter((src, index, array) => src && array.indexOf(src) === index);

  const handleReserve = () => {
    navigate('/hotels/reserve', {
      state: {
        hotel,
        search: state?.search || {
          city: hotel.city,
          adults: 2,
          rooms: 1,
        },
      },
    });
  };

  return (
    <div className="detail-page">
      <Navbar />

      <section className="detail-hero">
        <img src={hotel.image_url} alt={hotel.name} className="detail-hero__img" />
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="container">
            <div className="detail-breadcrumb">
              <button className="detail-breadcrumb__btn" onClick={() => navigate('/hotels')}>
                Retour aux hotels
              </button>
              <span className="detail-breadcrumb__sep">/</span>
              <span className="detail-breadcrumb__current">{hotel.city}</span>
            </div>
            {hotel.badge && <div className="detail-hero__badge">{hotel.badge}</div>}
            <h1 className="detail-hero__title">{hotel.name}</h1>
            <div className="detail-hero__meta">
              {[
                { icon: '★', text: `${hotel.rating} (${hotel.reviews || 0} avis)` },
                { icon: '🏨', text: `${hotel.stars || 4} etoiles` },
                { icon: '🛏', text: `${hotel.available_rooms} chambres libres` },
                { icon: '📍', text: hotel.address },
              ].map((pill, index) => (
                <span className="detail-hero__pill" key={index}>
                  <i>{pill.icon}</i> {pill.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="detail-stats">
        <div className="container">
          <div className="detail-stats__grid">
            {[
              { icon: '🌍', label: 'Ville', value: hotel.city },
              { icon: '🕐', label: 'Check-in / out', value: `${hotel.checkin_time} / ${hotel.checkout_time}` },
              { icon: '💳', label: 'Prix', value: `${hotel.prix.toLocaleString('fr-FR')} ${hotel.currency}` },
              { icon: '📈', label: 'Popularite', value: `${Math.round(hotel.occupancy_percentage || 0)}% reserve` },
            ].map((item, index) => (
              <div className="detail-stats__item" key={index}>
                <div className="detail-stats__icon">{item.icon}</div>
                <div>
                  <div className="detail-stats__label">{item.label}</div>
                  <div className="detail-stats__value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">
            <div>
              <div className="detail-card">
                <div className="detail-card__head">
                  <div className="detail-card__accent" />
                  <h3 className="detail-card__title">A propos de l hotel</h3>
                </div>
                <p className="detail-desc">{hotel.description}</p>
              </div>

              {gallery.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">Galerie</h3>
                  </div>
                  <div className="detail-gallery-grid">
                    {gallery.slice(0, 5).map((src, index) => (
                      <div key={index} className={`detail-gal-item ${index === 0 ? 'detail-gal-item--main' : ''}`}>
                        <img src={src} alt={`${hotel.name} ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(hotel.highlights || []).length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">Points forts</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {hotel.highlights.map((item, index) => (
                      <div key={index} className="detail-inc-tag">
                        <div className="detail-inc-icon">✓</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(hotel.room_types || []).length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">Types de chambres</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {hotel.room_types.map((item, index) => (
                      <div key={index} className="detail-inc-tag">
                        <div className="detail-inc-icon">🛏</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(hotel.amenities || []).length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">Amenities</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {hotel.amenities.map((item, index) => (
                      <div key={index} className="detail-inc-tag">
                        <div className="detail-inc-icon">✓</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(hotel.nearby_places || []).length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">A proximite</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {hotel.nearby_places.map((item, index) => (
                      <div key={index} className="detail-inc-tag">
                        <div className="detail-inc-icon">📍</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(hotel.policies || []).length > 0 && (
                <div className="detail-card">
                  <div className="detail-card__head">
                    <div className="detail-card__accent" />
                    <h3 className="detail-card__title">Politiques</h3>
                  </div>
                  <div className="detail-includes-grid">
                    {hotel.policies.map((item, index) => (
                      <div key={index} className="detail-inc-tag detail-inc-tag--excl">
                        <div className="detail-inc-icon">ℹ</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="detail-sidebar">
              <div className="detail-price-card">
                {hotel.oldPrix ? <span className="detail-price-unit" style={{ textDecoration: 'line-through' }}>{hotel.oldPrix.toLocaleString('fr-FR')} {hotel.currency}</span> : null}
                <div className="detail-price-main">
                  <span className="detail-price-amount">{hotel.prix.toLocaleString('fr-FR')}</span>
                  <span className="detail-price-curr">{hotel.currency}</span>
                </div>
                <div className="detail-price-unit">Prix par nuit estimee</div>
                <div className="detail-price-divider" />
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`detail-star ${star <= Math.round(hotel.rating || 0) ? 'detail-star--on' : 'detail-star--off'}`}>★</span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">{hotel.rating} / 5</span>
                </div>
                <ul className="detail-perks">
                  <li><div className="detail-perk-check">✓</div>{hotel.property_type || 'Hotel selectionne'}</li>
                  <li><div className="detail-perk-check">✓</div>{hotel.meals || 'Options repas disponibles'}</li>
                  <li><div className="detail-perk-check">✓</div>{hotel.total_rooms} chambres au total</li>
                  <li><div className="detail-perk-check">✓</div>{hotel.available_rooms} chambres encore libres</li>
                </ul>
                <button className="detail-reserve-btn" onClick={handleReserve}>
                  Reserver
                </button>
                <button className="detail-back-btn" onClick={() => navigate(-1)}>
                  Retour
                </button>
                <p className="detail-sidebar-note">
                  Ce detail hotel est alimente uniquement par votre base de donnees.
                </p>
                <div className="detail-spots-badge">
                  {Math.round(hotel.occupancy_percentage || 0)}% des chambres ont deja ete reservees
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default HotelDetailsPage;
