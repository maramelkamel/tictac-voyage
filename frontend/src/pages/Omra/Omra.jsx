import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OmraCard from '../../components/OmraCard';
import OmraSearchBar from '../../components/OmraSearchBar';
import Chatbot from '../../components/Chatbot';
import { statsData } from '../../data/OmraData';
import '../../styles/omrastyle.css';

const API = 'http://localhost:5000/api/omra/packages';

const Omra = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [packages, setPackages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // ── Fetch + normalize packages from API ──────────────────────
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(json => {
        const normalized = (json.data || []).map(pkg => ({
          ...pkg,
          // ✅ fix image field name (DB uses image_url)
          image:    pkg.image_url || pkg.image || '',
          // ✅ fix old price field name + convert to number
          oldPrice: pkg.old_price ? Number(pkg.old_price) : null,
          // ✅ convert price to number
          price:    Number(pkg.price),
          // ✅ DB returns ["Vol A/R", ...] but OmraCard expects [{icon, label}]
          includes: Array.isArray(pkg.includes)
            ? pkg.includes.map(item =>
                typeof item === 'string'
                  ? { icon: 'fas fa-check', label: item }
                  : item
              )
            : [],
        }));
        setPackages(normalized);
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger les forfaits.');
        setLoading(false);
      });
  }, []);

  const handleDetails = (pkg) => {
    navigate(`/Omra/Details/${pkg.id}`, { state: { pkg } });
  };

  const handleReserve = (pkg) => {
    navigate(`/Omra/Reserve/${pkg.id}`, { state: { pkg } });
  };

  const handleSearch = (params) => {
    console.log('Search params:', params);
  };

  // ── Build filter buttons dynamically from packages ───────────
  const filters = ['Tous', ...new Set(packages.map(p => {
    if (p.badge) return p.badge;
    if (p.title.toLowerCase().includes('économ')) return 'Économique';
    if (p.title.toLowerCase().includes('vip'))    return 'VIP';
    if (p.title.toLowerCase().includes('ramadan')) return 'Ramadan';
    return null;
  }).filter(Boolean))];

  const filtered = packages.filter((pkg) => {
    if (activeFilter === 'Tous') return true;
    return (
      (pkg.title     || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
      (pkg.subtitle  || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
      (pkg.badge     || '').toLowerCase().includes(activeFilter.toLowerCase())
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

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#e8306a', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement des forfaits...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#e8306a' }}>
              <i className="fas fa-exclamation-circle" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
              <p>{error}</p>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && (
            <div className="omra-cards-grid">
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', gridColumn: '1/-1', color: '#94a3b8' }}>
                  <p>Aucun forfait disponible pour ce filtre.</p>
                </div>
              ) : (
                filtered.map((pkg) => (
                  <OmraCard
                    key={pkg.id}
                    pkg={pkg}
                    onDetails={handleDetails}
                    onReserve={handleReserve}
                  />
                ))
              )}
            </div>
          )}
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
                spirituel avec serieux, expertise et devotion.
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
                <div className="omra-why__float-icon"><i className="fas fa-star" /></div>
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