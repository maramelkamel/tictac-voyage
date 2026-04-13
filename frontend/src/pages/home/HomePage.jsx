/**
 * src/pages/home/HomePage.jsx  (updated section — hotels from API)
 *
 * Replace the HOTELS SECTION in your existing HomePage.jsx
 * with this version. Only the hotels section changes;
 * everything else (hero, destinations, advantages) stays the same.
 *
 * Key changes:
 *   - Remove: import { hotelsData } from '../../data/hotelsData'
 *   - Add:    import { useHotels, normalizeHotelForCard } from '../../hooks/useHotels'
 *   - Hotels section now renders from API (featured / top-rated only)
 */

// ── Drop-in replacement for the HOTELS SECTION ───────────────
// Paste this inside your HomePage component, replacing the
// existing <section className="section hotels-section ...">

/*
  STEP 1 — Update imports at the top of HomePage.jsx:
  ─────────────────────────────────────────────────────
  // REMOVE:
  import { hotelsData } from '../../data/hotelsData';

  // ADD:
  import { useHotels, normalizeHotelForCard } from '../../hooks/useHotels';

  STEP 2 — Add hook inside the component (after const navigate = ...):
  ─────────────────────────────────────────────────────
  const { hotels: apiHotels, loading: hotelsLoading } = useHotels({
    sort: 'rating',
    limit: 6,
  });

  STEP 3 — Replace the hotels section JSX with the code below:
*/

// ── JSX to paste into HomePage ────────────────────────────────
export const HotelsSectionJSX = `
{/* HOTELS SECTION */}
<section className="section hotels-section bg-[var(--color-background-main)]" id="hotels">
  <div className="container mx-auto px-4">
    <div className="section-header text-center mb-12">
      <h2 className="text-3xl font-bold text-[var(--color-primary)]">Meilleurs Hôtels en Tunisie</h2>
      <p className="text-[var(--color-text-secondary)] mt-2">Notre sélection des établissements les mieux notés, au meilleur prix</p>
      <div className="section-header-line w-24 h-1 bg-[var(--color-secondary)] mx-auto mt-4"></div>
    </div>

    {hotelsLoading ? (
      <div className="hotels-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="hotel-skeleton">
            <div className="skeleton-img" style={{ height: 220, background: '#f1f5f9', borderRadius: '16px 16px 0 0' }} />
            <div className="skeleton-body" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: 'white', borderRadius: '0 0 16px 16px' }}>
              <div style={{ height: 14, borderRadius: 6, background: '#e2e8f0', width: '70%' }} />
              <div style={{ height: 12, borderRadius: 6, background: '#e2e8f0', width: '50%' }} />
              <div style={{ height: 12, borderRadius: 6, background: '#e2e8f0', width: '90%' }} />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="hotels-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {apiHotels.map((raw) => {
          const hotel = normalizeHotelForCard(raw);
          return (
            <CardStyle
              key={hotel.id}
              image={hotel.image}
              title={hotel.title}
              location={hotel.location}
              description={hotel.description}
              stars={hotel.stars}
              badge={hotel.badge}
              badgeType={hotel.badgeType}
              amenities={hotel.amenities}
              priceOptions={hotel.priceOptions}
              onDetailsClick={() => navigate(\`/hotels/\${hotel.id}\`)}
              onReserveClick={() => navigate(\`/hotels/\${hotel.id}/reserve\`)}
              onFavoriteClick={(isFavorite) => console.log('Favorite:', hotel.id, isFavorite)}
            />
          );
        })}
      </div>
    )}

    {apiHotels.length > 0 && (
      <div className="text-center mt-10">
        <button
          onClick={() => navigate('/hotels')}
          className="btn btn-outline-primary"
        >
          Voir tous les hôtels →
        </button>
      </div>
    )}
  </div>
</section>
`;

// ── Full updated HomePage (copy-paste ready) ─────────────────
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CardStyle from '../../components/CardStyle';
import SearchSection from '../../components/SearchSection';
import { useNavigate } from 'react-router-dom';
import { useHotels, normalizeHotelForCard } from '../../hooks/useHotels';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../../pages/admin/promotions/PromotionsSection';
import '../../styles/HotelsPage.css';

const destinationsData = [
  { id: 1, name: 'Hammamet', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', description: 'Station balnéaire', price: 'À partir de 198 TND' },
  { id: 2, name: 'Djerba', image: 'https://images.unsplash.com/photo-1568310579941-6b6e1e6f3f35?w=600&q=80', description: 'Île paradisiaque', price: 'À partir de 160 TND' },
  { id: 3, name: 'Sousse', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80', description: 'Perle du Sahel', price: 'À partir de 182 TND' },
  { id: 4, name: 'Tozeur', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80', description: 'Oasis du désert', price: 'À partir de 220 TND' },
];

const slidesData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80', title: 'Explorez la Tunisie Autrement', subtitle: 'Des plages méditerranéennes aux oasis sahariennes, créez des souvenirs inoubliables avec nos experts voyage.' },
  { id: 2, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80', title: "Hôtels d'Exception", subtitle: 'Découvrez notre sélection des meilleurs établissements, soigneusement choisis pour votre confort.' },
  { id: 3, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80', title: 'Voyages Sur Mesure', subtitle: 'Des circuits personnalisés selon vos envies, avec un service premium à chaque étape.' },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { promos } = usePromotions('accueil');

  // ── Fetch top 6 hotels from API ──
  const { hotels: apiHotels, loading: hotelsLoading } = useHotels({
  sort : 'stars',
  limit: 6,
});

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slidesData.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (searchData) => console.log('Search:', searchData);

  return (
    <>
      <Navbar />

      {/* HERO */}
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
                  <a href="#hotels" className="btn btn-primary btn-lg"><i className="fas fa-search" /> Trouver un hôtel</a>
                  <a href="#destinations" className="btn btn-glass btn-lg"><i className="fas fa-play" /> Découvrir</a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="slider-control prev" onClick={() => setCurrentSlide(p => (p - 1 + slidesData.length) % slidesData.length)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button className="slider-control next" onClick={() => setCurrentSlide(p => (p + 1) % slidesData.length)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </section>

      <SearchSection onSearch={handleSearch} />

      {promos.length > 0 && (
        <div className="container mx-auto px-4" style={{ paddingTop: 32 }}>
          <PromotionsSection promos={promos} titre="Offres & Promotions du moment" />
        </div>
      )}

      {/* HOTELS SECTION — API driven */}
      <section className="section hotels-section bg-[var(--color-background-main)]" id="hotels">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">Meilleurs Hôtels en Tunisie</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Notre sélection des établissements les mieux notés, au meilleur prix</p>
            <div className="section-header-line w-24 h-1 bg-[var(--color-secondary)] mx-auto mt-4" />
          </div>

          {hotelsLoading ? (
            <div className="hotels-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCardSimple key={i} />)}
            </div>
          ) : (
            <div className="hotels-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {apiHotels.map(raw => {
                const hotel = normalizeHotelForCard(raw);
                return (
                  <CardStyle
                    key={hotel.id}
                    image={hotel.image}
                    title={hotel.title}
                    location={hotel.location}
                    description={hotel.description}
                    rating={hotel.rating}
                    stars={hotel.stars}
                    badge={hotel.badge}
                    badgeType={hotel.badgeType}
                    amenities={hotel.amenities}
                    priceOptions={hotel.priceOptions}
                    onDetailsClick={() => navigate(`/hotels/${hotel.id}`)}
                    onReserveClick={() => navigate(`/hotels/${hotel.id}/reserve`)}
                    onFavoriteClick={(isFavorite) => console.log('Favorite:', hotel.id, isFavorite)}
                  />
                );
              })}
            </div>
          )}

          {apiHotels.length > 0 && !hotelsLoading && (
            <div className="text-center mt-10">
              <button onClick={() => navigate('/hotels')} className="btn btn-outline-primary btn-lg">
                Voir tous nos hôtels →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="section destinations-section bg-white py-16" id="destinations">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">Destinations Populaires</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Découvrez les plus belles régions de Tunisie</p>
            <div className="section-header-line w-24 h-1 bg-[var(--color-secondary)] mx-auto mt-4" />
          </div>
          <div className="destinations-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinationsData.map(destination => (
              <div key={destination.id}
                className="destination-card relative rounded-xl overflow-hidden shadow-lg group h-72 cursor-pointer"
                onClick={() => navigate(`/hotels?city=${destination.name}`)}
              >
                <img src={destination.image} alt={destination.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                <div className="destination-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{destination.description}</p>
                  <span className="price font-semibold text-[var(--color-secondary)]">{destination.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="section advantages-section bg-[var(--color-background-main)] py-16" id="advantages">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">Pourquoi Choisir TICTAC VOYAGES</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Votre satisfaction est notre priorité absolue</p>
            <div className="section-header-line w-24 h-1 bg-[var(--color-secondary)] mx-auto mt-4" />
          </div>
          <div className="advantages-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', title: 'Meilleurs Prix Garantis', desc: 'Nous négocions directement avec les hôtels pour vous offrir les tarifs les plus compétitifs du marché.' },
              { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: 'Service Client 24h/7j', desc: 'Notre équipe est disponible à tout moment pour répondre à vos questions et vous accompagner.' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Paiement Sécurisé', desc: 'Vos transactions sont 100% sécurisées. Paiement en ligne ou en agence selon votre préférence.' },
            ].map((adv, i) => (
              <div key={i} className="advantage-card bg-white p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="advantage-icon w-16 h-16 mx-auto bg-blue-50 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={adv.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-3">{adv.title}</h3>
                <p className="text-[var(--color-text-secondary)]">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

// Simple inline skeleton for home page
const SkeletonCardSimple = () => (
  <div style={{ borderRadius: 16, overflow: 'hidden', background: 'white', boxShadow: '0 2px 12px rgba(15,76,92,0.06)' }}>
    <div style={{ height: 220, background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[70, 50, 90, 65].map((w, i) => (
        <div key={i} style={{ height: 12, width: `${w}%`, borderRadius: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      ))}
    </div>
  </div>
);

export default HomePage;