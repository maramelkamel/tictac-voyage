import { useNavigate } from 'react-router-dom';
const Footer = () => {
  const navigate = useNavigate();
  const quickLinks = [
    { icon: 'fas fa-chevron-right', label: 'Accueil', href: '#' },
    { icon: 'fas fa-chevron-right', label: 'Nos hôtels', href: '#hotels' },
    { icon: 'fas fa-chevron-right', label: 'Destinations', href: '#destinations' },
    { icon: 'fas fa-chevron-right', label: 'Promotions', href: '#' },
    { icon: 'fas fa-chevron-right', label: 'À propos', href: '#advantages' },
  ];

  const services = [
    { icon: 'fas fa-chevron-right', label: 'Réservation hôtels', href: '#' },
    { icon: 'fas fa-chevron-right', label: 'Voyages organisés', href: '#' },
    { icon: 'fas fa-chevron-right', label: 'Omra', path: '/Omra'},
    { icon: 'fas fa-chevron-right', label: 'Location voitures', href: '#' },
    { icon: 'fas fa-chevron-right', label: 'Billetterie', href: '#' },
  ];

  const contact = [
    { icon: 'fas fa-phone', label: '+216 36 149 885' },
    { icon: 'fas fa-envelope', label: 'tictacvoyages@gmail.com' },
    { icon: 'fas fa-map-marker-alt', label: 'Nouvelle Medina, Tunis' },
  ];

  const socials = [
    { icon: 'fab fa-facebook-f', href: '#' },
    { icon: 'fab fa-instagram', href: '#' },
    { icon: 'fab fa-whatsapp', href: '#' },
    { icon: 'fab fa-youtube', href: '#' },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription');
  };

  return (
    <footer
      id="footer"
      style={{
        background: 'var(--primary)',
        color: 'var(--white)',
        padding: '72px 0 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
            gap: '48px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
          className="footer-grid"
        >
          {/* About Section */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--white)' }}>
                TICTAC VOYAGES
              </h1>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--gold)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                Agence de Voyage
              </span>
            </div>

            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.7,
                marginBottom: '24px',
              }}
            >
              Votre partenaire de confiance pour tous vos voyages en Tunisie et à l'international.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              {socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label="Social link"
                  style={{
                    width: '42px',
                    height: '42px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--white)',
                    fontSize: '16px',
                    transition: 'all var(--duration) var(--ease)',
                  }}
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>
              Liens Rapides
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all var(--duration) var(--ease)',
                    }}
                  >
                    <i className={link.icon} style={{ fontSize: '10px', color: 'var(--secondary)' }} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>
              Nos Services
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {services.map((service, idx) => (
                <li key={idx}>
                  <a
                    href={service.href}
                    onClick={service.path ? (e) => { e.preventDefault(); navigate(service.path); } : undefined}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all var(--duration) var(--ease)',
                    }}
                  >
                    <i className={service.icon} style={{ fontSize: '10px', color: 'var(--secondary)' }} />
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>
              Contact
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {contact.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <i className={item.icon} style={{ color: 'var(--secondary)', marginTop: '4px', width: '16px' }} />
                  {item.label}
                </li>
              ))}
            </ul>

            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Newsletter
            </h4>
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Votre email"
                required
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--white)',
                  fontSize: '14px',
                  border: 'none',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '14px 24px',
                  background: 'var(--accent)',
                  color: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all var(--duration) var(--ease)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            © 2025 TICTAC VOYAGES. Tous droits réservés. |{' '}
            <a href="#" style={{ color: 'var(--secondary)' }}>
              Mentions légales
            </a>{' '}
            |{' '}
            <a href="#" style={{ color: 'var(--secondary)' }}>
              Confidentialité
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
