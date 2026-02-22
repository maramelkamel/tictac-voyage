import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OmraCard from '../../components/OmraCard';  
import OmraSearchBar from '../../components/OmraSearchBar';
import Chatbot from '../../components/Chatbot';
import '../../styles/omrastyle.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const omraPackages = [
  {
    id: 1,
    title: 'Omra Économique',
    subtitle: 'Essentiel & Accessible',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80',
    badge: 'Populaire',
    badgeType: 'new',
    duration: 10,
    price: 2490,
    oldPrice: 2890,
    rating: 4.6,
    reviews: 128,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ La Mecque' },
      { icon: 'fas fa-bus', label: 'Transport inclus' },
    ],
    description: 'Forfait idéal pour les pèlerins souhaitant accomplir leur Omra dans de bonnes conditions à un tarif accessible.',
    spots: 12,
  },
  {
    id: 2,
    title: 'Omra Confort',
    subtitle: 'Équilibre & Sérénité',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
    badge: 'Recommandé',
    badgeType: 'promo',
    duration: 14,
    price: 3690,
    oldPrice: null,
    rating: 4.8,
    reviews: 214,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ La Mecque' },
      { icon: 'fas fa-bus', label: 'Transport VIP' },
      { icon: 'fas fa-utensils', label: 'Petit-déjeuner' },
    ],
    description: 'Une expérience spirituelle enrichissante avec hébergement 4 étoiles et services haut de gamme pour un séjour serein.',
    spots: 8,
  },
  {
    id: 3,
    title: 'Omra Prestige',
    subtitle: 'Luxe & Proximité',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
    badge: 'Premium',
    badgeType: 'default',
    duration: 21,
    price: 5990,
    oldPrice: null,
    rating: 4.9,
    reviews: 97,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol business A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 5★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 5★ face Haram' },
      { icon: 'fas fa-car', label: 'Transferts privés' },
      { icon: 'fas fa-concierge-bell', label: 'Guide personnel' },
      { icon: 'fas fa-utensils', label: 'Demi-pension' },
    ],
    description: 'Le summum du pèlerinage avec hôtel 5 étoiles face à la Kaaba, guide dédié et services de conciergerie personnalisés.',
    spots: 4,
  },
  {
    id: 4,
    title: 'Omra Famille',
    subtitle: 'Voyage en Famille',
    image: 'https://images.unsplash.com/photo-1609252925546-bad8d3f0f5ac?w=800&q=80',
    badge: 'Famille',
    badgeType: 'new',
    duration: 12,
    price: 2990,
    oldPrice: 3490,
    rating: 4.7,
    reviews: 76,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Chambres familiales 4★' },
      { icon: 'fas fa-bus', label: 'Transport inclus' },
      { icon: 'fas fa-child', label: 'Réduction enfants' },
      { icon: 'fas fa-utensils', label: 'Petit-déjeuner' },
    ],
    description: 'Partagez ce moment spirituel unique avec vos proches. Chambres familiales spacieuses et programme adapté à tous les âges.',
    spots: 6,
  },
  {
    id: 5,
    title: 'Omra Ramadan',
    subtitle: 'Mois Sacré',
    image: 'https://images.unsplash.com/photo-1540903348946-c41e4a9e2b29?w=800&q=80',
    badge: 'Ramadan',
    badgeType: 'promo',
    duration: 15,
    price: 4290,
    oldPrice: 4890,
    rating: 4.9,
    reviews: 163,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 4★ La Mecque' },
      { icon: 'fas fa-moon', label: 'Iftar organisé' },
      { icon: 'fas fa-bus', label: 'Transport VIP' },
    ],
    description: "Vivez le Ramadan dans les lieux les plus sacrés de l'Islam. Une expérience spirituelle incomparable au cœur du mois béni.",
    spots: 3,
  },
  {
    id: 6,
    title: 'Omra Express',
    subtitle: 'Court Séjour',
    image: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&q=80',
    badge: 'Flash',
    badgeType: 'default',
    duration: 7,
    price: 1890,
    oldPrice: null,
    rating: 4.5,
    reviews: 52,
    departure: 'Tunis-Carthage',
    includes: [
      { icon: 'fas fa-plane', label: 'Vol direct A/R' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ Médine' },
      { icon: 'fas fa-hotel', label: 'Hôtel 3★ La Mecque' },
      { icon: 'fas fa-bus', label: 'Transport inclus' },
    ],
    description: "Pour ceux qui ont peu de temps disponible, notre formule Express permet d'accomplir l'Omra en 7 jours seulement.",
    spots: 15,
  },
];

const statsData = [
  { icon: 'fas fa-users', value: '5 000+', label: 'Pèlerins accompagnés' },
  { icon: 'fas fa-star', value: '4.8/5', label: 'Satisfaction moyenne' },
  { icon: 'fas fa-calendar-check', value: '15 ans', label: "D'expérience" },
  { icon: 'fas fa-globe', value: '100%', label: 'Formules agréées' },
];

const filters = ['Tous', 'Économique', 'Confort', 'Prestige', 'Famille', 'Ramadan'];

// ─── Page ─────────────────────────────────────────────────────────────────────

const OmraPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tous');

  // Navigate to the Details page, passing the pkg via router state
  const handleDetails = (pkg) => {
    navigate('/Omra/details', { state: { pkg } });
  };

  // Navigate directly to the Reserve page, passing the pkg via router state
  const handleReserve = (pkg) => {
    navigate('/Omra/Reserve', { state: { pkg } });
  };

  const handleSearch = (params) => {
    console.log('Search params:', params);
    // TODO: filter cards by date / duration / persons
  };

  const filtered = omraPackages.filter((pkg) => {
    if (activeFilter === 'Tous') return true;
    return (
      pkg.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
      pkg.subtitle.toLowerCase().includes(activeFilter.toLowerCase())
    );
  });

  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="omra-hero">
        <div className="omra-hero__bg" />
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />

        <div className="container omra-hero__content">
          <div className="omra-hero__tag">
            <i className="fas fa-kaaba" style={{ color: '#e8306a' }} />
            Pèlerinage & Spiritualité
          </div>

          <h1 className="omra-hero__title">
            Votre Voyage<br />
            <span>Spirituel Idéal</span>
          </h1>

          <p className="omra-hero__subtitle">
            Accomplissez votre Omra en toute sérénité avec nos forfaits tout compris,
            conçus pour une expérience spirituelle inoubliable.
          </p>

          <div className="omra-hero__search-wrapper">
            <OmraSearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="omra-stats">
        <div className="container">
          <div className="omra-stats__grid">
            {statsData.map((s, i) => (
              <div key={i} className="omra-stats__item">
                <div className="omra-stats__icon">
                  <i className={s.icon} />
                </div>
                <div>
                  <div className="omra-stats__value">{s.value}</div>
                  <div className="omra-stats__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ──────────────────────────────────────────── */}
      <section className="omra-section omra-section--gray">
        <div className="container">
          <div className="omra-section__header">
            <span className="omra-section__tag">
              <i className="fas fa-kaaba" style={{ marginRight: 8 }} />
              Nos Forfaits Omra
            </span>
            <h2 className="omra-section__title">
              Choisissez votre<br />voyage spirituel
            </h2>
            <p className="omra-section__desc">
              Des forfaits adaptés à tous les budgets et besoins, pour vivre votre Omra dans les meilleures conditions.
            </p>
          </div>

          {/* Filters */}
          <div className="omra-filters">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`omra-filter-btn ${activeFilter === f ? 'omra-filter-btn--active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Cards — navigate on click */}
          <div className="omra-cards-grid">
            {filtered.map((pkg) => (
              <OmraCard
                key={pkg.id}
                pkg={pkg}
                onDetails={handleDetails}
                onReserve={handleReserve}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose us ─────────────────────────────────────── */}
      <section className="omra-section omra-section--white">
        <div className="container">
          <div className="omra-why__grid">
            <div>
              <span className="omra-why__tag">Pourquoi nous choisir</span>
              <h2 className="omra-why__title">
                Votre pèlerinage,<br />notre priorité absolue
              </h2>
              <p className="omra-why__desc">
                Depuis 15 ans, TICTAC VOYAGES accompagne les pèlerins tunisiens dans leur voyage
                spirituel avec sérieux, expertise et dévotion. Chaque détail est pensé pour que
                vous puissiez vous concentrer sur l'essentiel.
              </p>

              {[
                { icon: 'fas fa-shield-alt', title: 'Agence agréée', desc: 'Autorisée par le Ministère du Tourisme et les autorités saoudiennes.' },
                { icon: 'fas fa-headset', title: 'Accompagnement 24/7', desc: 'Un guide dédié vous accompagne tout au long de votre séjour.' },
                { icon: 'fas fa-heart', title: 'Soin du détail', desc: 'Chaque forfait est conçu pour une expérience spirituelle optimale.' },
              ].map((item, i) => (
                <div key={i} className="omra-why__feature">
                  <div className="omra-why__feature-icon">
                    <i className={item.icon} />
                  </div>
                  <div>
                    <h4 className="omra-why__feature-title">{item.title}</h4>
                    <p className="omra-why__feature-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="omra-why__image-wrapper">
              <div className="omra-why__image">
                <img src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80" alt="La Mecque" />
              </div>
              <div className="omra-why__float-card">
                <div className="omra-why__float-icon">
                  <i className="fas fa-star" />
                </div>
                <div>
                  <div className="omra-why__float-value">5 000+</div>
                  <div className="omra-why__float-label">Pèlerins satisfaits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="omra-cta">
        <div className="omra-cta__pattern" />
        <div className="container omra-cta__inner">
          <i className="fas fa-kaaba omra-cta__icon" />
          <h2 className="omra-cta__title">Prêt pour votre voyage spirituel ?</h2>
          <p className="omra-cta__desc">
            Contactez notre équipe spécialisée dès aujourd'hui pour construire votre Omra sur mesure.
          </p>
          <div className="omra-cta__actions">
            <a href="tel:+21636149885" className="omra-cta__btn-primary">
              <i className="fas fa-phone" /> Appeler maintenant
            </a>
            <a href="#footer" className="omra-cta__btn-secondary">
              <i className="fas fa-envelope" /> Nous écrire
            </a>
          </div>
        </div>
      </section>

      {/* CHATBOT */}
      <Chatbot />

      <Footer />
    </>
  );
};

export default OmraPage;