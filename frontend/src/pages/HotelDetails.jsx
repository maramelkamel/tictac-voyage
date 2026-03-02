import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { hotelsData } from '../data/hotelsData';

/* ============================================================
   INLINE STYLES — No external CSS dependency
   Palette: Primary #0F4C5C, Secondary #1ECAD3, Accent #E92F64
   ============================================================ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --primary: #0F4C5C;
    --primary-dark: #0a3a47;
    --primary-light: #1a6b80;
    --secondary: #1ECAD3;
    --secondary-light: #4dd9e0;
    --accent: #E92F64;
    --accent-dark: #B32D5E;
    --bg: #F8FAFB;
    --text: #1E293B;
    --text-secondary: #64748B;
    --shadow-sm: 0 4px 12px rgba(15,76,92,0.08);
    --shadow-md: 0 8px 24px rgba(15,76,92,0.12);
    --shadow-lg: 0 16px 48px rgba(15,76,92,0.18);
    --radius: 14px;
    --radius-sm: 10px;
  }

  .hd-page {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* HERO */
  .hd-hero {
    position: relative;
    height: 520px;
    overflow: hidden;
  }
  .hd-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.04);
    transition: transform 8s ease;
  }
  .hd-hero.loaded img { transform: scale(1); }
  .hd-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgba(15,76,92,0.55) 0%,
      rgba(233,47,100,0.18) 55%,
      rgba(10,58,71,0.82) 100%
    );
  }
  .hd-hero-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 48px 64px;
  }
  .hd-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 50px;
    margin-bottom: 14px;
  }
  .hd-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px;
    line-height: 1.15;
    text-shadow: 0 2px 12px rgba(0,0,0,0.25);
  }
  .hd-hero-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    color: rgba(255,255,255,0.88);
    font-size: 14px;
  }
  .hd-hero-meta span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .hd-stars { color: #FFD700; letter-spacing: 2px; }
  .hd-rating-pill {
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 50px;
    padding: 4px 14px;
    font-weight: 600;
    color: #fff;
  }

  /* STICKY NAV */
  .hd-sticky-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    box-shadow: var(--shadow-sm);
    border-bottom: 2px solid rgba(15,76,92,0.06);
  }
  .hd-sticky-nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .hd-sticky-nav-inner::-webkit-scrollbar { display: none; }
  .hd-nav-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 16px 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-secondary);
    border-bottom: 3px solid transparent;
    transition: all 0.25s ease;
    white-space: nowrap;
  }
  .hd-nav-btn:hover {
    color: var(--secondary);
    background: rgba(30,202,211,0.05);
  }
  .hd-nav-btn.active {
    color: var(--accent-dark);
    border-bottom-color: var(--accent-dark);
    background: rgba(179,45,94,0.04);
    font-weight: 600;
  }

  /* MAIN LAYOUT */
  .hd-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 32px 80px;
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 32px;
    align-items: start;
  }

  /* SECTIONS */
  .hd-section {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: 36px;
    margin-bottom: 24px;
    scroll-margin-top: 80px;
  }
  .hd-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    margin: 0 0 6px;
  }
  .hd-section-divider {
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, var(--secondary), var(--accent));
    border-radius: 2px;
    margin-bottom: 24px;
  }
  .hd-desc {
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }
  .hd-highlights {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 0;
  }
  .hd-highlight-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    border: 1px solid rgba(15,76,92,0.07);
    font-size: 13.5px;
    color: var(--text);
    font-weight: 500;
  }
  .hd-highlight-item svg {
    flex-shrink: 0;
    color: var(--secondary);
    margin-top: 1px;
  }

  /* AMENITIES */
  .hd-amenities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 14px;
  }
  .hd-amenity {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 12px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    border: 1.5px solid rgba(15,76,92,0.07);
    text-align: center;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text);
    transition: all 0.25s ease;
    cursor: default;
  }
  .hd-amenity:hover {
    border-color: var(--secondary);
    background: rgba(30,202,211,0.05);
    transform: translateY(-3px);
    box-shadow: var(--shadow-sm);
  }
  .hd-amenity-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(15,76,92,0.08), rgba(30,202,211,0.12));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  /* GALLERY */
  .hd-gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .hd-gallery-grid .hd-gallery-main {
    grid-column: span 2;
    grid-row: span 2;
  }
  .hd-gallery-item {
    border-radius: var(--radius-sm);
    overflow: hidden;
    cursor: pointer;
    position: relative;
    aspect-ratio: 1;
  }
  .hd-gallery-main { aspect-ratio: auto; }
  .hd-gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  .hd-gallery-item:hover img { transform: scale(1.08); }
  .hd-gallery-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(15,76,92,0);
    transition: background 0.3s ease;
  }
  .hd-gallery-item:hover::after { background: rgba(15,76,92,0.18); }

  /* MODAL */
  .hd-modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(10,10,20,0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .hd-modal img {
    max-width: 90vw;
    max-height: 85vh;
    border-radius: var(--radius);
    object-fit: contain;
    box-shadow: var(--shadow-lg);
  }
  .hd-modal-close {
    position: absolute;
    top: 24px;
    right: 28px;
    background: rgba(255,255,255,0.12);
    border: none;
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .hd-modal-close:hover { background: rgba(255,255,255,0.25); }

  /* REVIEWS */
  .hd-reviews-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .hd-review-card {
    padding: 20px;
    background: var(--bg);
    border-radius: var(--radius-sm);
    border: 1px solid rgba(15,76,92,0.07);
    transition: box-shadow 0.25s;
  }
  .hd-review-card:hover { box-shadow: var(--shadow-sm); }
  .hd-review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .hd-review-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }
  .hd-review-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
    margin-bottom: 2px;
  }
  .hd-review-date { font-size: 12px; color: var(--text-secondary); }
  .hd-review-stars { color: #FFD700; font-size: 13px; letter-spacing: 1px; }
  .hd-review-text { font-size: 13.5px; color: var(--text-secondary); line-height: 1.65; }

  /* RIGHT STICKY COLUMN */
  .hd-right {
    position: sticky;
    top: 80px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* BOOKING CARD */
  .hd-booking-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    scroll-margin-top: 80px;
  }
  .hd-booking-header {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    padding: 22px 24px;
    color: #fff;
  }
  .hd-booking-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 4px;
  }
  .hd-booking-header p { font-size: 12.5px; opacity: 0.8; margin: 0; }
  .hd-booking-body { padding: 22px 24px; }
  .hd-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .hd-form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 12px;
  }
  .hd-form-group.full { grid-column: span 2; }
  .hd-form-label {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .hd-form-control {
    width: 100%;
    padding: 10px 13px;
    border: 1.5px solid rgba(15,76,92,0.12);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: var(--text);
    background: var(--bg);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    box-sizing: border-box;
  }
  .hd-form-control:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 3px rgba(30,202,211,0.12);
    background: #fff;
  }
  .hd-avail-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 14px;
  }
  .hd-avail-ok { background: rgba(16,185,129,0.08); color: #059669; border: 1px solid rgba(16,185,129,0.2); }
  .hd-avail-na { background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.2); }
  .hd-avail-idle { background: rgba(100,116,139,0.06); color: var(--text-secondary); border: 1px solid rgba(100,116,139,0.12); }

  /* SUMMARY CARD */
  .hd-summary-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    border: 1.5px solid rgba(15,76,92,0.06);
  }
  .hd-summary-header {
    background: linear-gradient(135deg, var(--accent-dark), var(--accent));
    padding: 18px 22px;
    color: #fff;
  }
  .hd-summary-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0;
  }
  .hd-summary-body { padding: 18px 22px; }
  .hd-summary-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 9px 0;
    border-bottom: 1px solid rgba(15,76,92,0.05);
    font-size: 13.5px;
    gap: 8px;
  }
  .hd-summary-row:last-of-type { border-bottom: none; }
  .hd-summary-label { color: var(--text-secondary); font-size: 13px; }
  .hd-summary-value { font-weight: 600; color: var(--text); text-align: right; }
  .hd-summary-total {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 2px solid rgba(15,76,92,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .hd-summary-total-label {
    font-weight: 700;
    font-size: 14px;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .hd-summary-total-value {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-dark);
  }
  .hd-pay-btn {
    display: block;
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, var(--accent-dark), var(--accent));
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 700;
    letter-spacing: 0.5px;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 16px;
    text-align: center;
    box-shadow: 0 4px 16px rgba(233,47,100,0.35);
  }
  .hd-pay-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(233,47,100,0.45);
    background: linear-gradient(135deg, #9e2753, var(--accent-dark));
  }
  .hd-pay-btn:disabled {
    background: linear-gradient(135deg, #94a3b8, #cbd5e1);
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }

  /* BREADCRUMB */
  .hd-breadcrumb {
    max-width: 1280px;
    margin: 0 auto;
    padding: 16px 32px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }
  .hd-breadcrumb a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .hd-breadcrumb a:hover { color: var(--secondary); }

  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .hd-main { grid-template-columns: 1fr; }
    .hd-right { position: static; }
    .hd-hero-content { padding: 32px; }
  }
  @media (max-width: 768px) {
    .hd-hero { height: 380px; }
    .hd-hero-title { font-size: 1.7rem; }
    .hd-main { padding: 20px 16px 60px; gap: 20px; }
    .hd-section { padding: 24px 18px; }
    .hd-highlights { grid-template-columns: 1fr; }
    .hd-reviews-grid { grid-template-columns: 1fr; }
    .hd-gallery-grid { grid-template-columns: 1fr 1fr; }
    .hd-gallery-grid .hd-gallery-main { grid-column: span 2; }
    .hd-amenities-grid { grid-template-columns: repeat(3, 1fr); }
    .hd-form-row { grid-template-columns: 1fr; }
    .hd-form-group.full { grid-column: span 1; }
    .hd-sticky-nav-inner { padding: 0 16px; }
    .hd-breadcrumb { padding: 12px 16px 0; }
  }
`;

/* ============================================================
   STATIC DATA HELPERS
   ============================================================ */
const amenities = [
  { icon: '📶', label: 'WiFi gratuit' },
  { icon: '🏊', label: 'Piscine' },
  { icon: '🧖', label: 'Spa & Bien-être' },
  { icon: '🅿️', label: 'Parking' },
  { icon: '🍽️', label: 'Restaurant' },
  { icon: '🏋️', label: 'Salle de sport' },
  { icon: '❄️', label: 'Climatisation' },
  { icon: '🛎️', label: 'Room service' },
  { icon: '🚤', label: 'Sports nautiques' },
  { icon: '🎭', label: 'Animation' },
  { icon: '🧺', label: 'Blanchisserie' },
  { icon: '💆', label: 'Massage' },
];

const highlights = [
  'Vue mer panoramique depuis les chambres supérieures',
  'Accès direct à la plage de sable fin',
  'Petit-déjeuner buffet international inclus',
  'Personnel multilingue disponible 24h/7j',
  'Navette aéroport sur demande',
  'Animations soirées pour toute la famille',
];

const reviews = [
  { name: 'Sophie M.', initial: 'S', date: 'Janvier 2025', rating: 5, text: 'Hôtel exceptionnel ! Cadre magnifique, personnel aux petits soins. On reviendra sans hésiter.' },
  { name: 'Karim B.', initial: 'K', date: 'Décembre 2024', rating: 5, text: 'Séjour parfait en famille. La piscine est immense et les repas sont délicieux.' },
  { name: 'Marie L.', initial: 'M', date: 'Novembre 2024', rating: 4, text: 'Très bon rapport qualité-prix. L\'animation du soir était top. Quelques détails à améliorer dans les chambres.' },
  { name: 'Ahmed R.', initial: 'A', date: 'Octobre 2024', rating: 5, text: 'Service impeccable, chambres spacieuses, plage superbe. Je recommande vivement cet établissement.' },
];

const roomTypes = ['Chambre Standard', 'Chambre Supérieure', 'Suite Junior', 'Suite Deluxe', 'Suite Présidentielle'];
const pensionTypes = ['All Inclusive', 'Demi-Pension', 'Petit Déjeuner', 'Logement Seul'];

const galleryImages = [
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c4fe1dc7?w=600&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80',
];

const basePrices = {
  'Chambre Standard': 180,
  'Chambre Supérieure': 240,
  'Suite Junior': 320,
  'Suite Deluxe': 450,
  'Suite Présidentielle': 680,
};

const pensionExtra = {
  'All Inclusive': 60,
  'Demi-Pension': 35,
  'Petit Déjeuner': 15,
  'Logement Seul': 0,
};

/* ============================================================
   COMPONENT
   ============================================================ */
const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const hotel = hotelsData.find((h) => String(h.id) === String(id)) || hotelsData[0];

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeNav, setActiveNav] = useState('details');
  const [modalImg, setModalImg] = useState(null);

  /* Booking form state */
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [form, setForm] = useState({
    checkIn: today,
    checkOut: tomorrow,
    adults: 2,
    children: 0,
    rooms: 1,
    roomType: 'Chambre Standard',
    pension: 'All Inclusive',
  });
  const [availability, setAvailability] = useState('idle'); // idle | ok | na

  /* Section refs */
  const sectionRefs = {
    details: useRef(null),
    amenities: useRef(null),
    gallery: useRef(null),
    pricing: useRef(null),
    reviews: useRef(null),
  };

  /* Handle form changes */
  const handleForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setAvailability('idle');
  };

  /* Compute nights */
  const computeNights = () => {
    const d1 = new Date(form.checkIn);
    const d2 = new Date(form.checkOut);
    const diff = Math.round((d2 - d1) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const nights = computeNights();
  const basePrice = basePrices[form.roomType] || 180;
  const extra = pensionExtra[form.pension] || 0;
  const pricePerNight = (basePrice + extra) * form.rooms;
  const subtotal = pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.1);
  const total = subtotal + taxes;

  /* Check availability (simulation) */
  const checkAvailability = () => {
    if (nights <= 0) return;
    setAvailability('idle');
    setTimeout(() => {
      setAvailability(Math.random() > 0.2 ? 'ok' : 'na');
    }, 900);
  };

  /* Scroll to section */
  const scrollTo = (key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveNav(key);
  };

  /* Observe active section */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.dataset.section);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.dataset.section = key;
        obs.observe(ref.current);
      }
    });
    return () => obs.disconnect();
  }, []);

  const navItems = [
    { key: 'details', label: '📋 Détails' },
    { key: 'amenities', label: '✨ Équipements' },
    { key: 'gallery', label: '🖼️ Galerie' },
    { key: 'pricing', label: '💳 Tarifs' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <Navbar />
      <div className="hd-page">

        {/* HERO */}
        <section className={`hd-hero ${heroLoaded ? 'loaded' : ''}`}>
          <img
            src={hotel.image || galleryImages[0]}
            alt={hotel.title}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="hd-hero-overlay" />
          <div className="hd-hero-content">
            {hotel.badge && (
              <div className="hd-hero-badge">
                <span>★</span> {hotel.badge}
              </div>
            )}
            <h1 className="hd-hero-title">{hotel.title}</h1>
            <div className="hd-hero-meta">
              <span>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {hotel.location}
              </span>
              <span className="hd-stars">
                {'★'.repeat(hotel.stars || 5)}{'☆'.repeat(5 - (hotel.stars || 5))}
              </span>
              <span className="hd-rating-pill">
                ⭐ {hotel.rating || '9.2'}/10
              </span>
              <span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
                {hotel.amenities?.length > 0 ? `${hotel.amenities.length}+ équipements` : '12+ équipements'}
              </span>
            </div>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="hd-breadcrumb">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Accueil</a>
          <span>›</span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Hôtels</a>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{hotel.title}</span>
        </div>

        {/* STICKY NAV */}
        <div className="hd-sticky-nav">
          <div className="hd-sticky-nav-inner">
            {navItems.map((n) => (
              <button
                key={n.key}
                className={`hd-nav-btn ${activeNav === n.key ? 'active' : ''}`}
                onClick={() => scrollTo(n.key)}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN 2-COL LAYOUT */}
        <div className="hd-main">
          {/* LEFT COLUMN */}
          <div>

            {/* DETAILS */}
            <section className="hd-section" ref={sectionRefs.details}>
              <h2 className="hd-section-title">Présentation de l'Hôtel</h2>
              <div className="hd-section-divider" />
              <p className="hd-desc">
                {hotel.description}
                {' '}Niché au cœur d'un cadre naturel d'exception, cet établissement d'excellence vous offre une expérience unique où luxe, confort et authenticité se fondent harmonieusement. Chaque détail a été pensé pour rendre votre séjour inoubliable, des matériaux nobles qui ornent les espaces communs aux prestations raffinées qui vous attendent.
              </p>
              <div className="hd-highlights">
                {highlights.map((h, i) => (
                  <div className="hd-highlight-item" key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {h}
                  </div>
                ))}
              </div>
            </section>

            {/* AMENITIES */}
            <section className="hd-section" ref={sectionRefs.amenities}>
              <h2 className="hd-section-title">Équipements & Services</h2>
              <div className="hd-section-divider" />
              <div className="hd-amenities-grid">
                {amenities.map((a, i) => (
                  <div className="hd-amenity" key={i}>
                    <div className="hd-amenity-icon">{a.icon}</div>
                    {a.label}
                  </div>
                ))}
              </div>
            </section>

            {/* GALLERY */}
            <section className="hd-section" ref={sectionRefs.gallery}>
              <h2 className="hd-section-title">Galerie Photos</h2>
              <div className="hd-section-divider" />
              <div className="hd-gallery-grid">
                {galleryImages.map((src, i) => (
                  <div
                    key={i}
                    className={`hd-gallery-item ${i === 0 ? 'hd-gallery-main' : ''}`}
                    onClick={() => setModalImg(src)}
                    style={{ height: i === 0 ? '320px' : '155px' }}
                  >
                    <img src={src} alt={`Vue ${i + 1}`} />
                  </div>
                ))}
              </div>
            </section>



          </div>

          {/* RIGHT COLUMN — STICKY */}
          <div className="hd-right">

            {/* BOOKING FORM */}
            <div className="hd-booking-card" ref={sectionRefs.pricing}>
              <div className="hd-booking-header">
                <h3>Réserver votre séjour</h3>
                <p>Vérifiez la disponibilité et obtenez votre tarif instantanément</p>
              </div>
              <div className="hd-booking-body">

                <div className="hd-form-row">
                  <div className="hd-form-group">
                    <label className="hd-form-label">Arrivée</label>
                    <input
                      type="date"
                      className="hd-form-control"
                      value={form.checkIn}
                      min={today}
                      onChange={(e) => handleForm('checkIn', e.target.value)}
                    />
                  </div>
                  <div className="hd-form-group">
                    <label className="hd-form-label">Départ</label>
                    <input
                      type="date"
                      className="hd-form-control"
                      value={form.checkOut}
                      min={form.checkIn}
                      onChange={(e) => handleForm('checkOut', e.target.value)}
                    />
                  </div>
                </div>

                <div className="hd-form-row">
                  <div className="hd-form-group">
                    <label className="hd-form-label">Adultes</label>
                    <input
                      type="number"
                      className="hd-form-control"
                      value={form.adults}
                      min={1}
                      max={20}
                      onChange={(e) => handleForm('adults', Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <div className="hd-form-group">
                    <label className="hd-form-label">Enfants</label>
                    <input
                      type="number"
                      className="hd-form-control"
                      value={form.children}
                      min={0}
                      max={10}
                      onChange={(e) => handleForm('children', Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>

                <div className="hd-form-group">
                  <label className="hd-form-label">Nombre de chambres</label>
                  <input
                    type="number"
                    className="hd-form-control"
                    value={form.rooms}
                    min={1}
                    max={10}
                    onChange={(e) => handleForm('rooms', Math.max(1, Number(e.target.value)))}
                  />
                </div>

                <div className="hd-form-group">
                  <label className="hd-form-label">Type de chambre</label>
                  <select className="hd-form-control" value={form.roomType} onChange={(e) => handleForm('roomType', e.target.value)}>
                    {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="hd-form-group">
                  <label className="hd-form-label">Formule / Pension</label>
                  <select className="hd-form-control" value={form.pension} onChange={(e) => handleForm('pension', e.target.value)}>
                    {pensionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Availability status */}
                <div className={`hd-avail-status ${availability === 'ok' ? 'hd-avail-ok' : availability === 'na' ? 'hd-avail-na' : 'hd-avail-idle'}`}>
                  {availability === 'ok' && <><span>✅</span> Disponible pour vos dates !</>}
                  {availability === 'na' && <><span>❌</span> Complet pour ces dates. Essayez d'autres dates.</>}
                  {availability === 'idle' && <><span>ℹ️</span> Cliquez pour vérifier la disponibilité</>}
                </div>

                <button
                  onClick={checkAvailability}
                  disabled={nights <= 0}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: nights > 0 ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : '#94a3b8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: nights > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.25s',
                    boxSizing: 'border-box',
                  }}
                >
                  🔍 Vérifier la disponibilité
                </button>
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="hd-summary-card">
              <div className="hd-summary-header">
                <h3>📋 Résumé de votre réservation</h3>
              </div>
              <div className="hd-summary-body">
                <div className="hd-summary-row">
                  <span className="hd-summary-label">🏨 Hôtel</span>
                  <span className="hd-summary-value" style={{ fontSize: 12.5 }}>{hotel.title}</span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">📅 Dates</span>
                  <span className="hd-summary-value" style={{ fontSize: 12 }}>
                    {form.checkIn} → {form.checkOut}
                  </span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">🌙 Nuits</span>
                  <span className="hd-summary-value">{nights > 0 ? nights : '—'}</span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">👥 Voyageurs</span>
                  <span className="hd-summary-value">{form.adults} adulte{form.adults>1?'s':''}{form.children>0 ? `, ${form.children} enfant${form.children>1?'s':''}` : ''}</span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">🛏️ Chambre</span>
                  <span className="hd-summary-value" style={{ fontSize: 12.5 }}>{form.roomType}</span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">🍽️ Formule</span>
                  <span className="hd-summary-value">{form.pension}</span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">💰 Prix/nuit</span>
                  <span className="hd-summary-value" style={{ color: 'var(--primary)' }}>{pricePerNight} TND</span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">🧾 Sous-total</span>
                  <span className="hd-summary-value">{nights > 0 ? subtotal : '—'} {nights > 0 ? 'TND' : ''}</span>
                </div>
                <div className="hd-summary-row">
                  <span className="hd-summary-label">🏛️ Taxes (10%)</span>
                  <span className="hd-summary-value">{nights > 0 ? taxes : '—'} {nights > 0 ? 'TND' : ''}</span>
                </div>
                <div className="hd-summary-total">
                  <span className="hd-summary-total-label">Total</span>
                  <span className="hd-summary-total-value">
                    {nights > 0 ? `${total} TND` : '—'}
                  </span>
                </div>
                <button
                  className="hd-pay-btn"
                  disabled={nights <= 0}
                  onClick={() => navigate('/VoyagesOrganise/Payment/:id', { state: { hotel, form, nights, total } })}
                >
                  💳 Aller au paiement
                </button>
                {nights <= 0 && (
                  <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
                    Sélectionnez des dates valides pour continuer
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {modalImg && (
        <div className="hd-modal" onClick={() => setModalImg(null)}>
          <button className="hd-modal-close" onClick={() => setModalImg(null)}>✕</button>
          <img src={modalImg} alt="Galerie" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <Footer />
    </>
  );
};

export default HotelDetails;