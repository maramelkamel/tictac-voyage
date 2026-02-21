import { useState, useEffect, useCallback } from 'react';

const navLinks = [
  { id: 1, label: 'Accueil', href: '#' },
  { id: 2, label: 'Hôtels', href: '#hotels' },
  {
    id: 3,
    label: 'Nos Services',
    href: '#',
    submenu: [
      { icon: 'fas fa-bus', title: 'Location de Bus', desc: 'Transport groupe' },
      { icon: 'fas fa-car', title: 'Location de Voitures', desc: 'Toutes catégories' },
      { icon: 'fas fa-kaaba', title: 'Omra', desc: 'Pèlerinage organisé'},
      { icon: 'fas fa-plane', title: 'Billetterie', desc: 'Vols & Trains' },
      { icon: 'fas fa-globe', title: 'Voyages Organisés', desc: 'Circuits tout compris' },
      { icon: 'fas fa-star', title: 'Voyages Sur Mesure', desc: '100% personnalisé' },
    ],
  },
  { id: 4, label: 'Destinations', href: '#destinations' },
  { id: 5, label: 'À propos', href: '#advantages' },
  { id: 6, label: 'Contact', href: '#footer' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeLang, setActiveLang] = useState('FR');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle body overflow when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleDropdown = useCallback((id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOverlayClick = useCallback(() => {
    closeMobileMenu();
  }, [closeMobileMenu]);

  const handleOverlayKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeMobileMenu();
      }
    },
    [closeMobileMenu]
  );

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled ? 'rgba(15, 76, 92, 0.98)' : 'var(--primary)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          boxShadow: isScrolled ? '0 4px 30px rgba(0,0,0,0.15)' : 'none',
          transition: 'all var(--duration) var(--ease)',
        }}
      >
        {/* Header Top */}
        <div
          className="header-top"
          style={{
            background: 'rgba(0,0,0,0.15)',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="contact-info" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <a
                href="tel:+21636149885"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500 }}
              >
                <i className="fas fa-phone-alt" style={{ fontSize: '12px', color: 'var(--secondary)' }} /> +216 36 149 885
              </a>
              <a
                href="mailto:tictacvoyages@gmail.com"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500 }}
              >
                <i className="fas fa-envelope" style={{ fontSize: '12px', color: 'var(--secondary)' }} /> tictacvoyages@gmail.com
              </a>
              <a
                href="#"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500 }}
              >
                <i className="fas fa-clock" style={{ fontSize: '12px', color: 'var(--secondary)' }} /> Lun - Sam: 09h - 18h
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Language Switch */}
              <div
                role="group"
                aria-label="Sélection de langue"
                style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px',
                }}
              >
                {['FR', 'EN', 'AR'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    aria-pressed={activeLang === lang}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: activeLang === lang ? 'var(--white)' : 'rgba(255,255,255,0.6)',
                      borderRadius: '4px',
                      background: activeLang === lang ? 'var(--secondary)' : 'transparent',
                      transition: 'all var(--duration) var(--ease)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* User Account */}
              <div style={{ position: 'relative' }} className="user-account-wrapper">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-label="Menu du compte utilisateur"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--white)',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all var(--duration) var(--ease)',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, var(--secondary), var(--gold))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                    }}
                  >
                    <i className="fas fa-user" />
                  </span>
                  Mon compte
                  <i className="fas fa-chevron-down" style={{ fontSize: '10px', opacity: 0.7 }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Header Main */}
        <div style={{ padding: '18px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '48px' }}>
            {/* Logo */}
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--white)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                TICTAC VOYAGES
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--gold)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginLeft: '-10px',
                  marginTop: '2px',
                }}
              >
                Agence de Voyage
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} aria-label="Navigation principale">
              {navLinks.map((link) => (
                <div key={link.id} style={{ position: 'relative' }}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.submenu) {
                        e.preventDefault();
                        toggleDropdown(link.id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (link.submenu && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleDropdown(link.id);
                      }
                    }}
                    aria-expanded={link.submenu ? activeDropdown === link.id : undefined}
                    aria-haspopup={link.submenu ? 'true' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 18px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.85)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all var(--duration) var(--ease)',
                    }}
                  >
                    {link.label}
                    {link.submenu && (
                      <i
                        className="fas fa-chevron-down"
                        style={{
                          fontSize: '10px',
                          transition: 'transform var(--duration) var(--ease)',
                          transform: activeDropdown === link.id ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                      />
                    )}
                  </a>

                  {/* Dropdown */}
                  {link.submenu && (
                    <ul
                      role="menu"
                      aria-label={`Sous-menu ${link.label}`}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        minWidth: '280px',
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--gray-100)',
                        padding: '8px 0',
                        marginTop: '10px',
                        opacity: activeDropdown === link.id ? 1 : 0,
                        visibility: activeDropdown === link.id ? 'visible' : 'hidden',
                        transform: activeDropdown === link.id ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'all var(--duration) var(--ease)',
                        zIndex: 100,
                        listStyle: 'none',
                      }}
                    >
                      {link.submenu.map((item) => (
                        <li key={`${link.id}-${item.title}`} role="none">
                          <a
                            href="#"
                            role="menuitem"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              padding: '14px 20px',
                              fontSize: '14px',
                              color: 'var(--gray-600)',
                              transition: 'all var(--duration) var(--ease)',
                            }}
                          >
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--white)',
                                fontSize: '14px',
                              }}
                            >
                              <i className={item.icon} />
                            </div>
                            <div>
                              <span style={{ display: 'block', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '2px' }}>
                                {item.title}
                              </span>
                              <small style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{item.desc}</small>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA */}
            <div className="header-cta" style={{ flexShrink: 0 }}>
              <a href="#" className="btn btn-glass">
                <i className="fas fa-headset" /> Assistance
              </a>
            </div>

            {/* Hamburger */}
            <button
              type="button"
              className="hamburger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              style={{
                display: 'none',
                flexDirection: 'column',
                gap: '5px',
                padding: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '2px',
                  background: 'var(--white)',
                  borderRadius: '2px',
                  transition: 'all var(--duration) var(--ease)',
                  transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                }}
              />
              <span
                style={{
                  width: '24px',
                  height: '2px',
                  background: 'var(--white)',
                  borderRadius: '2px',
                  transition: 'all var(--duration) var(--ease)',
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  width: '24px',
                  height: '2px',
                  background: 'var(--white)',
                  borderRadius: '2px',
                  transition: 'all var(--duration) var(--ease)',
                  transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleOverlayClick}
          onKeyDown={handleOverlayKeyDown}
          aria-label="Fermer le menu"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        aria-label="Menu mobile"
        aria-hidden={!isMobileMenuOpen}
        style={{
          position: 'fixed',
          top: 0,
          left: isMobileMenuOpen ? 0 : '-100%',
          width: '300px',
          height: '100vh',
          background: 'var(--primary)',
          zIndex: 1001,
          transition: 'left var(--duration) var(--ease)',
          padding: '100px 24px 24px',
          overflowY: 'auto',
        }}
      >
        {navLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            onClick={closeMobileMenu}
            style={{
              display: 'block',
              padding: '16px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--white)',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <style>{`
        @media (max-width: 1024px) {
          .nav-desktop { display: none !important; }
          .header-cta { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
