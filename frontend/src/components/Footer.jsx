import React from 'react';

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  outline: 'none',
  boxSizing: 'border-box',
};

const Footer = () => {
  const services = [
   
    { id: 1, label: 'Hôtels',               href: '/' },
    { id: 2, label: 'Transport',  href: '/transport' },
    { id: 3, label: 'Voyages Organisés',    href: '/VoyagesOrganise/VoyagesOrganise' },
    { id: 4, label: 'Omra',                 href: '/Omra/Omra' },
    { id: 5, label: 'Voyages Sur Mesure',   href: '/voyagenonorg/VoyageSurMesure' },
    { id: 6, label: 'Billetterie',          href: '#billetterie' },
  ];

  const contactInfo = [
    { icon: 'fas fa-phone',          label: '+216 36 149 885' },
    { icon: 'fas fa-envelope',       label: 'tictacvoyages@gmail.com' },
    { icon: 'fas fa-map-marker-alt', label: 'Nouvelle Medina, Tunis' },
  ];

  const socials = [
    { icon: 'fab fa-facebook-f', href: '#' },
    { icon: 'fab fa-instagram',  href: '#' },
    { icon: 'fab fa-whatsapp',   href: '#' },
    { icon: 'fab fa-youtube',    href: '#' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Votre message a été envoyé !');
  };

  return (
    <footer
      style={{
        background: 'var(--primary)',
        color: '#fff',
        padding: '72px 0 0',
      }}
    >
      <div className="container">

        {/* ── 4-column grid ── */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr 1.3fr',
            gap: '40px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >

          {/* ── Col 1 : Brand + Socials ── */}
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
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
                marginBottom: '16px',
              }}
            >
              Agence de Voyage
            </span>

            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '24px' }}>
              Votre partenaire de confiance pour tous vos voyages en Tunisie et à l'international.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="footer-social"
                  aria-label="social"
                  style={{
                    width: '42px',
                    height: '42px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '16px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 : Nos Services ── */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Nos Services</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {services.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    className="footer-link"
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: 'var(--secondary)' }} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 : Contactez-nous ── */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Contactez-nous</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {contactInfo.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <i className={item.icon} style={{ color: 'var(--secondary)', marginTop: '3px', width: '16px' }} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4 : Messagerie ── */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Envoyez-nous un message</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Votre nom"
                required
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Votre email"
                required
                style={inputStyle}
              />
              <textarea
                placeholder="Votre message"
                rows={3}
                required
                style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
              />
              <button
                type="submit"
                style={{
                  padding: '13px 24px',
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  transition: 'all 0.3s ease',
                }}
              >
                Envoyer
              </button>
            </form>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            © 2025 TICTAC VOYAGES. Tous droits réservés. |{' '}
            <a href="#" className="footer-bottom-link" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>
              Mentions légales
            </a>{' '}
            |{' '}
            <a href="#" className="footer-bottom-link" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>
              Confidentialité
            </a>
          </p>
        </div>

      </div>

      <style>{`
        .footer-social:hover { background: #D81B60 !important; transform: translateY(-3px); }
        .footer-link:hover   { color: #D81B60 !important; transform: translateX(5px); }
        .footer-link:hover i { color: #D81B60 !important; }
        .footer-bottom-link:hover { color: #D81B60 !important; }
        footer input:focus, footer textarea:focus {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;