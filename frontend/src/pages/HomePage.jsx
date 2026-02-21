import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CardStyle from '../components/CardStyle';
import SearchSection from '../components/SearchSection';
import Chatbot from '../components/Chatbot';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Hotel data
const hotelsData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    title: 'Royal Azur Thalasso Golf',
    location: 'Hammamet, Tunisie',
    description: 'Vue mer panoramique, accès direct plage, centre thalasso, piscines chauffées et animation.',
    rating: 9.2,
    stars: 5,
    badge: 'Populaire',
    badgeType: 'default',
    amenities: [
      { icon: 'fas fa-wifi', name: 'WiFi' },
      { icon: 'fas fa-swimming-pool', name: 'Piscine' },
      { icon: 'fas fa-spa', name: 'Spa' },
      { icon: 'fas fa-utensils', name: 'Restaurant' },
    ],
    priceOptions: [
      { label: 'LPD', value: 180 },
      { label: 'DP', value: 250 },
      { label: 'PC', value: 320 },
      { label: 'AI', value: 420 },
    ],
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    title: 'Djerba Paradise Resort',
    location: 'Djerba, Tunisie',
    description: 'Complexe familial avec parc aquatique, clubs enfants, restaurants thématiques et spectacles.',
    rating: 8.7,
    stars: 4,
    badge: '-25%',
    badgeType: 'promo',
    amenities: [
      { icon: 'fas fa-wifi', name: 'WiFi' },
      { icon: 'fas fa-water', name: 'Aquapark' },
      { icon: 'fas fa-child', name: 'Kids' },
      { icon: 'fas fa-umbrella-beach', name: 'Plage' },
    ],
    priceOptions: [
      { label: 'LPD', value: 145 },
      { label: 'DP', value: 195 },
      { label: 'PC', value: 265 },
      { label: 'AI', value: 350 },
    ],
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    title: 'Sousse Pearl Marriott',
    location: 'Sousse, Tunisie',
    description: 'Luxe absolu face à la Méditerranée, golf 18 trous, spa et gastronomie raffinée.',
    rating: 9.5,
    stars: 5,
    badge: 'Top Ventes',
    badgeType: 'default',
    amenities: [
      { icon: 'fas fa-wifi', name: 'WiFi' },
      { icon: 'fas fa-golf-ball', name: 'Golf' },
      { icon: 'fas fa-dumbbell', name: 'Fitness' },
      { icon: 'fas fa-concierge-bell', name: 'Butler' },
    ],
    priceOptions: [
      { label: 'LPD', value: 220 },
      { label: 'DP', value: 290 },
      { label: 'PC', value: 380 },
      { label: 'AI', value: 480 },
    ],
  },
];

// Destinations data
const destinationsData = [
  {
    id: 1,
    name: 'Hammamet',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80',
    description: 'Station balnéaire',
    price: 'À partir de 180 TND'
  },
  {
    id: 2,
    name: 'Djerba',
    image: 'https://images.unsplash.com/photo-1568310579941-6b6e1e6f3f35?w=600&q=80',
    description: 'Île paradisiaque',
    price: 'À partir de 145 TND'
  },
  {
    id: 3,
    name: 'Sousse',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
    description: 'Perle du Sahel',
    price: 'À partir de 165 TND'
  },
  {
    id: 4,
    name: 'Tozeur',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
    description: 'Oasis du désert',
    price: 'À partir de 200 TND'
  },
];

// Hero slides data
const slidesData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
    title: 'Explorez la Tunisie Autrement',
    subtitle: 'Des plages méditerranéennes aux oasis sahariennes, créez des souvenirs inoubliables avec nos experts voyage.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80',
    title: "Hôtels d'Exception",
    subtitle: 'Découvrez notre sélection des meilleurs établissements, soigneusement choisis pour votre confort.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80',
    title: 'Voyages Sur Mesure',
    subtitle: 'Des circuits personnalisés selon vos envies, avec un service premium à chaque étape.'
  }
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  };

  const handleSearch = (searchData) => {
    console.log('Search:', searchData);
    // Implement search logic here
  };

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-slider">
          {slidesData.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={slide.image} alt={slide.title} />
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                <div className="hero-buttons">
                  <a href="#hotels" className="btn btn-primary btn-lg">
                    <i className="fas fa-search"></i> Trouver un hôtel
                  </a>
                  <a href="#destinations" className="btn btn-glass btn-lg">
                    <i className="fas fa-play"></i> Découvrir
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="slider-control prev" onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="slider-control next" onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </section>

      {/* SEARCH SECTION */}
      <SearchSection onSearch={handleSearch} />

      {/* HOTELS SECTION */}
      <section className="section hotels-section" id="hotels">
        <div className="container">
          <div className="section-header">
            <h2>Meilleurs Hôtels en Tunisie</h2>
            <p>Notre sélection des établissements les mieux notés, au meilleur prix</p>
            <div className="section-header-line"></div>
          </div>

          <div className="hotels-grid">
            {hotelsData.map((hotel) => (
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
                onDetailsClick={() => console.log('Details:', hotel.id)}
                onReserveClick={() => console.log('Reserve:', hotel.id)}
                onFavoriteClick={(isFavorite) => console.log('Favorite:', hotel.id, isFavorite)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS SECTION */}
      <section className="section destinations-section" id="destinations">
        <div className="container">
          <div className="section-header">
            <h2>Destinations Populaires</h2>
            <p>Découvrez les plus belles régions de Tunisie</p>
            <div className="section-header-line"></div>
          </div>

          <div className="destinations-grid">
            {destinationsData.map((destination) => (
              <div key={destination.id} className="destination-card">
                <img src={destination.image} alt={destination.name} />
                <div className="destination-overlay">
                  <h3>{destination.name}</h3>
                  <p>{destination.description}</p>
                  <span className="price">{destination.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVANTAGES SECTION */}
      <section className="section advantages-section" id="advantages">
        <div className="container">
          <div className="section-header">
            <h2>Pourquoi Choisir TICTAC VOYAGES</h2>
            <p>Votre satisfaction est notre priorité absolue</p>
            <div className="section-header-line"></div>
          </div>

          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="advantage-icon">
                <i className="fas fa-tag"></i>
              </div>
              <h3>Meilleurs Prix Garantis</h3>
              <p>
                Nous négocions directement avec les hôtels pour vous offrir les tarifs les
                plus compétitifs du marché.
              </p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>Service Client 24h/7j</h3>
              <p>
                Notre équipe est disponible à tout moment pour répondre à vos questions et
                vous accompagner.
              </p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Paiement Sécurisé</h3>
              <p>
                Vos transactions sont 100% sécurisées. Paiement en ligne ou en agence selon
                votre préférence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHATBOT */}
      <Chatbot />

      {/* FOOTER */}
      <Footer />
    </>
  );
};

export default HomePage;
