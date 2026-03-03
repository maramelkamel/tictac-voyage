import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OmraCard from '../../components/OmraCard';
import OmraSearchBar from '../../components/OmraSearchBar';
import Chatbot from '../../components/Chatbot';
import { omraPackages, statsData, filters } from '../../data/OmraData';
import '../../styles/omrastyle.css';

const Omra = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tous');

  const handleDetails = (pkg) => {
    navigate(`/Omra/details/${pkg.id}`, { state: { pkg } });
  };

  const handleReserve = (pkg) => {
    navigate(`/Omra/Reserve/${pkg.id}`, { state: { pkg } });
  };

  const handleSearch = (params) => {
    console.log('Search params:', params);
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

      {/* Hero */}
      <section className="omra-hero">
        <div className="omra-hero__bg" />
        <div className="omra-hero__pattern" />
        <div className="omra-hero__overlay" />
        <div className="container omra-hero__content">
          <div className="omra-hero__tag">
            <i className="fas fa-kaaba" style={{ color: '#e8306a' }} />
            Pelerinage et Spiritualite
          </div>
          <h1 className="omra-hero__title">
            Votre Voyage<br />
            <span>Spirituel Ideal</span>
          </h1>
          <p className="omra-hero__subtitle">
            Accomplissez votre Omra en toute serenite avec nos forfaits tout compris,
            concus pour une experience spirituelle inoubliable.
          </p>
          <div className="omra-hero__search-wrapper">
            <OmraSearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Packages */}
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
              Des forfaits adaptes a tous les budgets et besoins, pour vivre votre Omra dans les meilleures conditions.
            </p>
          </div>

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

      {/* Why us */}
      <section className="omra-section omra-section--white">
        <div className="container">
          <div className="omra-why__grid">
            <div>
              <span className="omra-why__tag">Pourquoi nous choisir</span>
              <h2 className="omra-why__title">
                Votre pelerinage,<br />notre priorite absolue
              </h2>
              <p className="omra-why__desc">
                Depuis 15 ans, TICTAC VOYAGES accompagne les pelerins tunisiens dans leur voyage
                spirituel avec serieux, expertise et devotion. Chaque detail est pense pour que
                vous puissiez vous concentrer sur l essentiel.
              </p>
              {[
                { icon: 'fas fa-shield-alt', title: 'Agence agreee',       desc: 'Autorisee par le Ministere du Tourisme et les autorites saoudiennes.' },
                { icon: 'fas fa-headset',    title: 'Accompagnement 24/7', desc: 'Un guide dedie vous accompagne tout au long de votre sejour.' },
                { icon: 'fas fa-heart',      title: 'Soin du detail',      desc: 'Chaque forfait est concu pour une experience spirituelle optimale.' },
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
                  <div className="omra-why__float-label">Pelerins satisfaits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="omra-cta">
        <div className="omra-cta__pattern" />
        <div className="container omra-cta__inner">
          <i className="fas fa-kaaba omra-cta__icon" />
          <h2 className="omra-cta__title">Pret pour votre voyage spirituel ?</h2>
          <p className="omra-cta__desc">
            Contactez notre equipe specialisee des aujourd hui pour construire votre Omra sur mesure.
          </p>
          <div className="omra-cta__actions">
            <a href="tel:+21636149885" className="omra-cta__btn-primary">
              <i className="fas fa-phone" /> Appeler maintenant
            </a>
            <a href="#footer" className="omra-cta__btn-secondary">
              <i className="fas fa-envelope" /> Nous ecrire
            </a>
          </div>
        </div>
      </section>

      <Chatbot />
      <Footer />
    </>
  );
};

export default Omra;