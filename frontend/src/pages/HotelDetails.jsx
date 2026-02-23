import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HotelSummary from '../components/hotels/HotelSummary';
import HotelPricing from '../components/hotels/HotelPricing';
import HotelEquipments from '../components/hotels/HotelEquipments';
import HotelGallery from '../components/hotels/HotelGallery';
import HotelPayment from '../components/hotels/HotelPayment';
import { hotelsData } from '../data/hotelsData';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/HotelDetails.css';

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true); // Initialiser à true
  const [activeSection, setActiveSection] = useState('summary');

  // Refs for sections
  const summaryRef = useRef(null);
  const pricingRef = useRef(null);
  const equipmentsRef = useRef(null);
  const galleryRef = useRef(null);
  const paymentRef = useRef(null);

  useEffect(() => {
    // Simulate API fetch - Charger les données de l'hôtel
    const timer = setTimeout(() => {
      const foundHotel = hotelsData.find(h => h.id === parseInt(id));
      setHotel(foundHotel);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const scrollToSection = (ref, sectionName) => {
    setActiveSection(sectionName);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-background-main)]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-secondary)]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-background-main)]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">Hôtel introuvable</h2>
          <p className="text-gray-500 mb-8">L'hôtel que vous cherchez n'existe pas ou a été retiré.</p>
          <Link to="/" className="bg-[var(--color-secondary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--color-primary-light)] transition-colors flex items-center gap-2">
            <ChevronLeft size={20} /> Retour à l'accueil
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background-main)]">
      <Navbar />
      
      {/* Sticky Internal Nav */}
      <nav className="hotel-details-nav">
        <div className="hotel-nav-container">
          <div className="hotel-nav-buttons">
            {[
              { id: 'summary', label: 'Résumé', ref: summaryRef },
              { id: 'pricing', label: 'Dates & Tarifs', ref: pricingRef },
              { id: 'equipments', label: 'Équipements', ref: equipmentsRef },
              { id: 'gallery', label: 'Galerie', ref: galleryRef },
              { id: 'payment', label: 'Paiement', ref: paymentRef },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.ref, item.id)}
                className={`hotel-nav-btn ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="hotel-details-container">
        <div ref={summaryRef} className="scroll-mt-32">
          <HotelSummary hotel={hotel} />
        </div>
        
        <div ref={pricingRef} className="scroll-mt-32">
          <HotelPricing hotel={hotel} />
        </div>
        
        <div ref={equipmentsRef} className="scroll-mt-32">
          <HotelEquipments hotel={hotel} />
        </div>
        
        <div ref={galleryRef} className="scroll-mt-32">
          <HotelGallery hotel={hotel} />
        </div>
        
        <div ref={paymentRef} className="scroll-mt-32">
          <HotelPayment />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HotelDetails;
