import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionsSection from '../../pages/admin/promotions/PromotionsSection';

const destinationsData = [
  { id: 1, name: 'Hammamet', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', description: 'Station balnéaire', price: 'Offres disponibles' },
  { id: 2, name: 'Djerba', image: 'https://images.unsplash.com/photo-1568310579941-6b6e1e6f3f35?w=600&q=80', description: 'Île paradisiaque', price: 'Offres disponibles' },
  { id: 3, name: 'Sousse', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80', description: 'Perle du Sahel', price: 'Offres disponibles' },
  { id: 4, name: 'Tozeur', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80', description: 'Oasis du désert', price: 'Offres disponibles' },
];

const slidesData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
    title: 'Explorez la Tunisie Autrement',
    subtitle: 'Des plages méditerranéennes aux oasis sahariennes, créez des souvenirs inoubliables avec nos experts voyage.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80',
    title: 'Voyages organisés',
    subtitle: 'Séjours clé en main, itinéraires optimisés et accompagnement personnalisé.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80',
    title: 'Circuits & aventures',
    subtitle: 'Nord & Sud: culture, désert, nature et authenticité.',
  },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { promos } = usePromotions('accueil');

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slidesData.length), 5000);
    return () => clearInterval(timer);
  }, []);

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
                  <button className="btn btn-primary btn-lg" onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>
                    <i className="fas fa-globe" /> Voir les voyages
                  </button>
                  <button className="btn btn-glass btn-lg" onClick={() => navigate('/circuits/circuit')}>
                    <i className="fas fa-map" /> Voir les circuits
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="slider-control prev"
          onClick={() => setCurrentSlide((p) => (p - 1 + slidesData.length) % slidesData.length)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="slider-control next"
          onClick={() => setCurrentSlide((p) => (p + 1) % slidesData.length)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {promos.length > 0 && (
        <div className="container mx-auto px-4" style={{ paddingTop: 32 }}>
          <PromotionsSection promos={promos} titre="Offres & Promotions du moment" />
        </div>
      )}

      <section className="section" id="destinations">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">Destinations Populaires</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Découvrez les plus belles régions de Tunisie</p>
            <div className="section-header-line w-24 h-1 bg-[var(--color-secondary)] mx-auto mt-4" />
          </div>
          <div className="destinations-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinationsData.map((destination) => (
              <div key={destination.id} className="destination-card relative rounded-xl overflow-hidden shadow-lg group h-72">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
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

      <section className="section advantages-section bg-[var(--color-background-main)] py-16" id="advantages">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">Pourquoi Choisir TICTAC VOYAGES</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">Votre satisfaction est notre priorité absolue</p>
            <div className="section-header-line w-24 h-1 bg-[var(--color-secondary)] mx-auto mt-4" />
          </div>
          <div className="advantages-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
                title: 'Meilleurs Prix Garantis',
                desc: 'Nous vous aidons à trouver les meilleures offres selon votre budget.',
              },
              {
                icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
                title: 'Service Client 24h/7j',
                desc: 'Notre équipe reste disponible pour vous accompagner à chaque étape.',
              },
              {
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                title: 'Paiement Sécurisé',
                desc: 'Paiement en ligne ou en agence selon votre préférence.',
              },
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

export default HomePage;

