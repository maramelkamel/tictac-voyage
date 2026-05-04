import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getHotelById } from '../../services/api';
import '../../styles/detail.css';

const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#0f4c5c"/>
        <stop offset="55%" stop-color="#1a6b80"/>
        <stop offset="100%" stop-color="#e8306a"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <text x="600" y="410" text-anchor="middle" fill="#ffffff" font-size="56" font-family="Arial, sans-serif" font-weight="700">
      Hotel Tictac Voyages
    </text>
  </svg>
`)}`;

const normalizeHotel = (hotel) => ({
  ...hotel,
  prix: Number(hotel.base_price || 0),
  oldPrix: hotel.old_price ? Number(hotel.old_price) : null,
  gallery: Array.isArray(hotel.gallery) ? hotel.gallery : [],
  highlights: Array.isArray(hotel.highlights) ? hotel.highlights : [],
  room_types: Array.isArray(hotel.room_types) ? hotel.room_types : [],
  policies: Array.isArray(hotel.policies) ? hotel.policies : [],
  nearby_places: Array.isArray(hotel.nearby_places) ? hotel.nearby_places : [],
  amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
  meal_plans: Array.isArray(hotel.meal_plans) ? hotel.meal_plans : [],
  room_views: Array.isArray(hotel.room_views) ? hotel.room_views : [],
  reservation_extras: Array.isArray(hotel.reservation_extras) ? hotel.reservation_extras : [],
});

const SectionCard = ({ id, title, children }) => (
  <section id={id} className="detail-card" style={{ scrollMarginTop: 130 }}>
    <div className="detail-card__head">
      <div className="detail-card__accent" />
      <h3 className="detail-card__title">{title}</h3>
    </div>
    {children}
  </section>
);

const InfoGrid = ({ items }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
    }}
  >
    {items.filter((item) => item.value).map((item) => (
      <div
        key={item.label}
        style={{
          padding: '14px 16px',
          borderRadius: 14,
          background: '#f8fbfd',
          border: '1px solid #d0f0f4',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          {item.label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0a2832', lineHeight: 1.5 }}>
          {item.value}
        </div>
      </div>
    ))}
  </div>
);

const ChipGrid = ({ items, icon = '✓', variant = 'default' }) => {
  if (!items?.length) return null;
  return (
    <div className="detail-includes-grid">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className={`detail-inc-tag ${variant === 'soft' ? 'detail-inc-tag--excl' : ''}`}>
          <div className="detail-inc-icon">{icon}</div>
          {item}
        </div>
      ))}
    </div>
  );
};

const HotelDetailsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [hotel, setHotel] = useState(state?.hotel ? normalizeHotel(state.hotel) : null);
  const [loading, setLoading] = useState(!state?.hotel);

  React.useEffect(() => {
    if (!id || state?.hotel) {
      setLoading(false);
      return;
    }

    getHotelById(id)
      .then((response) => setHotel(response.data ? normalizeHotel(response.data) : null))
      .catch(() => setHotel(null))
      .finally(() => setLoading(false));
  }, [id, state?.hotel]);

  const gallery = useMemo(() => {
    const images = [hotel?.image_url, ...(hotel?.gallery || [])].filter(Boolean);
    return [...new Set(images)];
  }, [hotel]);

  const heroImage = gallery[0] || PLACEHOLDER_IMAGE;

  const quickSections = [
    { id: 'galerie', label: 'Galerie' },
    { id: 'details', label: 'Details' },
    { id: 'chambres', label: 'Chambres' },
    { id: 'services', label: 'Services' },
    { id: 'infos', label: 'Infos pratiques' },
  ];

  const scrollToSection = (targetId) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8' }}>Chargement de l'hotel...</p>
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
        <img
          src={heroImage}
          alt={hotel.name}
          className="detail-hero__img"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
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
                { icon: '★', text: `${hotel.rating || 0} (${hotel.reviews || 0} avis)` },
                { icon: '🏨', text: `${hotel.stars || 0} etoiles` },
                { icon: '📍', text: hotel.address || hotel.city },
                { icon: '🛏', text: `${hotel.available_rooms || 0} chambre(s) encore disponible(s)` },
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
              { icon: '🕐', label: 'Horaires', value: `${hotel.checkin_time || '14:00'} / ${hotel.checkout_time || '12:00'}` },
              { icon: '💳', label: 'Prix de base', value: `${hotel.prix.toLocaleString('fr-FR')} ${hotel.currency}` },
              { icon: '📈', label: 'Disponibilite', value: `${hotel.available_rooms || 0} / ${hotel.total_rooms || 0} chambres` },
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

      <div style={{ background: '#fff', borderBottom: '1px solid #e9f0f2', position: 'sticky', top: 80, zIndex: 8 }}>
        <div className="container" style={{ padding: '14px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {quickSections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                border: '1px solid #f3b3c7',
                background: '#fff',
                color: '#9f1239',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-body">
        <div className="container">
          <div className="detail-layout">
            <div>
              <SectionCard id="galerie" title="Galerie de l'hotel">
                {gallery.length > 0 ? (
                  <div className="detail-gallery-grid">
                    {gallery.slice(0, 5).map((src, index) => (
                      <div key={index} className={`detail-gal-item ${index === 0 ? 'detail-gal-item--main' : ''}`}>
                        <img
                          src={src}
                          alt={`${hotel.name} ${index + 1}`}
                          onError={(event) => {
                            event.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="detail-desc">Aucune image supplementaire n'est encore disponible pour cet hotel.</p>
                )}
              </SectionCard>

              <SectionCard id="details" title="Presentation generale">
                <p className="detail-desc" style={{ marginBottom: 20 }}>
                  {hotel.description || "La description de cet hotel n'a pas encore ete renseignee."}
                </p>
                <InfoGrid
                  items={[
                    { label: 'Sous-titre', value: hotel.subtitle },
                    { label: 'Type de propriete', value: hotel.property_type },
                    { label: 'Repas mis en avant', value: hotel.meals },
                    { label: 'Adresse', value: hotel.address },
                    { label: 'Disponibilite', value: hotel.availability },
                    { label: 'Badge', value: hotel.badge },
                  ]}
                />
              </SectionCard>

              <SectionCard id="chambres" title="Chambres, vues et formules">
                <div style={{ display: 'grid', gap: 24 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Types de chambres
                    </p>
                    <ChipGrid items={hotel.room_types} icon="🛏" />
                  </div>

                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Formules repas
                    </p>
                    <ChipGrid items={hotel.meal_plans.length ? hotel.meal_plans : hotel.meals ? [hotel.meals] : []} icon="🍽" />
                  </div>

                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Vues disponibles
                    </p>
                    <ChipGrid items={hotel.room_views} icon="🌅" />
                  </div>

                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Extras reservables
                    </p>
                    <ChipGrid items={hotel.reservation_extras} icon="＋" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard id="services" title="Services et points forts">
                <div style={{ display: 'grid', gap: 24 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Services
                    </p>
                    <ChipGrid items={hotel.amenities} icon="✓" />
                  </div>

                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Points forts
                    </p>
                    <ChipGrid items={hotel.highlights} icon="★" />
                  </div>

                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      A proximite
                    </p>
                    <ChipGrid items={hotel.nearby_places} icon="📍" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard id="infos" title="Infos pratiques et politiques">
                <div style={{ display: 'grid', gap: 24 }}>
                  <InfoGrid
                    items={[
                      { label: 'Check-in', value: hotel.checkin_time },
                      { label: 'Check-out', value: hotel.checkout_time },
                      { label: 'Chambres totales', value: hotel.total_rooms ? `${hotel.total_rooms} chambres` : null },
                      { label: 'Avis clients', value: hotel.reviews ? `${hotel.reviews} avis` : null },
                      { label: 'Note moyenne', value: hotel.rating ? `${hotel.rating} / 5` : null },
                    ]}
                  />

                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Politiques de l'hotel
                    </p>
                    <ChipGrid items={hotel.policies} icon="i" variant="soft" />
                  </div>
                </div>
              </SectionCard>
            </div>

            <aside className="detail-sidebar">
              <div className="detail-price-card">
                {hotel.oldPrix ? (
                  <span className="detail-price-unit" style={{ textDecoration: 'line-through' }}>
                    {hotel.oldPrix.toLocaleString('fr-FR')} {hotel.currency}
                  </span>
                ) : null}
                <div className="detail-price-main">
                  <span className="detail-price-amount">{hotel.prix.toLocaleString('fr-FR')}</span>
                  <span className="detail-price-curr">{hotel.currency}</span>
                </div>
                <div className="detail-price-unit">Prix de base par nuit</div>
                <div className="detail-price-divider" />
                <div className="detail-rating-row">
                  <div className="detail-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`detail-star ${star <= Math.round(hotel.stars || 0) ? 'detail-star--on' : 'detail-star--off'}`}>★</span>
                    ))}
                  </div>
                  <span className="detail-rating-txt">{hotel.rating || 0} / 5</span>
                </div>
                <ul className="detail-perks">
                  <li><div className="detail-perk-check">✓</div>{hotel.property_type || 'Hotel'}</li>
                  <li><div className="detail-perk-check">✓</div>{hotel.meals || 'Formules repas disponibles'}</li>
                  <li><div className="detail-perk-check">✓</div>{hotel.total_rooms || 0} chambres au total</li>
                  <li><div className="detail-perk-check">✓</div>{hotel.available_rooms || 0} chambres libres</li>
                </ul>
                <button className="detail-reserve-btn" onClick={handleReserve}>
                  Reserver cet hotel
                </button>
                <button className="detail-back-btn" onClick={() => navigate(-1)}>
                  Retour
                </button>
                <p className="detail-sidebar-note">
                  Cette fiche hotel est alimentee uniquement par votre base de donnees.
                </p>
                <div className="detail-spots-badge">
                  {Math.round(hotel.occupancy_percentage || 0)}% des chambres sont deja reservees
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
