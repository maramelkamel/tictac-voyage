

const Footer = () => {


  const services = [
    { id: 1, label: 'Location de Bus', href: "/transport" },
    { id: 2, label: 'Hôtels', href: '#hotels' },
    { id: 3, label: 'Location de voiture', href: "/transport" },
    { id: 4, label: 'Omra', href: "/Omra/Omra" },
    { id: 5, label: 'Voyages Organisés', href: '#voyageorg' },
    { id: 6, label: 'Voyages Sur Mesure', href: '#voyagesurmes' },
    { id: 7, label: 'Billetterie', href: '#billetterie' },
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted');
    alert('Votre message a été envoyé !');
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
            gridTemplateColumns: '1.5fr 1fr 1.5fr',
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
                  className="social-link"
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
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                  }}
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>
              Nos Services
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {services.map((service) => (
                <li key={service.id}>
                  <a
                    href={service.href}
                    className="footer-link"
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      textDecoration: 'none',
                    }}
                  >
                    <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: 'var(--secondary)' }} />
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Form */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>
              Contactez-nous
            </h4>
            
            {/* Contact Info */}
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

            {/* Form */}
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="Votre email"
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--white)',
                  fontSize: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  outline: 'none',
                }}
              />
              <textarea
                placeholder="Votre message"
                rows="3"
                required
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--white)',
                  fontSize: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
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
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            © 2025 TICTAC VOYAGES. Tous droits réservés. |{' '}
            <a href="#" className="hover-text-pink" style={{ color: 'var(--secondary)', textDecoration: 'none', transition: 'all 0.3s ease' }}>
              Mentions légales
            </a>{' '}
            |{' '}
            <a href="#" className="hover-text-pink" style={{ color: 'var(--secondary)', textDecoration: 'none', transition: 'all 0.3s ease' }}>
              Confidentialité
            </a>
          </p>
        </div>
      </div>

      <style>{`
        /* Hover effects */
        .social-link:hover {
          background: #D81B60 !important;
          transform: translateY(-3px);
        }

        .footer-link:hover {
          color: #D81B60 !important;
          transform: translateX(5px);
        }
        
        .footer-link:hover i {
          color: #D81B60 !important;
        }

        .hover-text-pink:hover {
          color: #D81B60 !important;
        }

        /* Form focus effects */
        input:focus, textarea:focus {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }

        /* Responsive */
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
