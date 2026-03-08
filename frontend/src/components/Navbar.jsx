import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

const navLinks = [
  {
    id: 1,
    label: 'Hôtels',
    href: '/',
  },
  {
    id: 2,
    label: 'Voyages',
    href: '#',
    submenu: [
      {
        icon: 'fas fa-globe',
        title: 'Voyages Organisés',
        desc: 'Circuits tout compris',
        href: '/VoyagesOrganise/VoyagesOrganise',
      },
      {
        icon: 'fas fa-star',
        title: 'Voyages Sur Mesure',
        desc: '100% personnalisé',
        href: '/CustomTripAbroad',
      },
    ],
  },
  {
    id: 3,
    label: 'Transport',
    href: '/transport',
    
  },
  {
    id: 4,
    label: 'Billetterie',
    href: '/billeterie/Billeterie',
  },
  {
    id: 5,
    label: 'Omra',
    href: '/Omra/omra',
  },
  {
    id: 6,
    label: 'Contact',
    href: '/Contact',
  },
  {
    id: 7,
    label: 'Circuit',
    href: '/circuits',
  },
];

const Navbar = () => {
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeLang, setActiveLang] = useState('FR');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-account-wrapper')) {
        setIsAccountMenuOpen(false);
      }
      if (!e.target.closest('.nav-dropdown-wrapper')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = useCallback((id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  }, []);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleOverlayClick = useCallback(() => closeMobileMenu(), [closeMobileMenu]);

  const handleOverlayKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeMobileMenu();
    }
  }, [closeMobileMenu]);

  const handleNavClick = useCallback((e, href) => {
    if (href.startsWith('#')) return;
    e.preventDefault();
    navigate(href);
  }, [navigate]);

  const goTo = useCallback((path) => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    if (path.startsWith('#')) {
      const el = document.querySelector(path);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  }, [navigate]);

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
        {/* ── Header Top ── */}
        <div
          className="header-top"
          style={{
            background: 'rgba(0,0,0,0.15)',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* Contact Info */}
            <div className="contact-info" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <a
                href="tel:+21636149885"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
              >
                <i className="fas fa-phone-alt" style={{ fontSize: '12px', color: 'var(--secondary)' }} />
                +216 36 149 885
              </a>
              <a
                href="mailto:tictacvoyages@gmail.com"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
              >
                <i className="fas fa-envelope" style={{ fontSize: '12px', color: 'var(--secondary)' }} />
                tictacvoyages@gmail.com
              </a>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500 }}>
                <i className="fas fa-clock" style={{ fontSize: '12px', color: 'var(--secondary)' }} />
                Lun - Sam: 09h - 18h
              </span>
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

              {/* ── User Account Dropdown ── */}
              <div style={{ position: 'relative' }} className="user-account-wrapper">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isAccountMenuOpen}
                  aria-label="Menu du compte utilisateur"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
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
                  <i
                    className="fas fa-chevron-down"
                    style={{
                      fontSize: '10px',
                      opacity: 0.7,
                      transition: 'transform var(--duration) var(--ease)',
                      transform: isAccountMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Account Dropdown */}
                <ul
                  role="menu"
                  aria-label="Options du compte"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    minWidth: '220px',
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--gray-100)',
                    padding: '8px 0',
                    opacity: isAccountMenuOpen ? 1 : 0,
                    visibility: isAccountMenuOpen ? 'visible' : 'hidden',
                    transform: isAccountMenuOpen ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all var(--duration) var(--ease)',
                    zIndex: 200,
                    listStyle: 'none',
                    margin: 0,
                  }}
                >
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => goTo('/CreateAccount')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 20px', fontSize: '14px', color: 'var(--gray-600)',
                        transition: 'all var(--duration) var(--ease)',
                        background: 'none', border: 'none', width: '100%',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1)';
                      }}
                    >
                      <div className="account-icon" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: '14px', transition: 'transform var(--duration) var(--ease)', flexShrink: 0 }}>
                        <i className="fas fa-user-plus" />
                      </div>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '2px' }}>Créer un compte</span>
                        <small style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Nouveau client</small>
                      </div>
                    </button>
                  </li>

                  <li role="none" style={{ borderTop: '1px solid var(--gray-100)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => goTo('/SignIn')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 20px', fontSize: '14px', color: 'var(--gray-600)',
                        transition: 'all var(--duration) var(--ease)',
                        background: 'none', border: 'none', width: '100%',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1)';
                      }}
                    >
                      <div className="account-icon" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--gold), var(--secondary))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: '14px', transition: 'transform var(--duration) var(--ease)', flexShrink: 0 }}>
                        <i className="fas fa-sign-in-alt" />
                      </div>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '2px' }}>Se connecter</span>
                        <small style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Déjà client</small>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Header Main ── */}
        <div style={{ padding: '10px 0' }}>
          <div
            className="container"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}
          >
            {/* Logo — style du fichier 1 avec image */}
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                flexShrink: 0, background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, textDecoration: 'none',
              }}
            >
              <img
                src={logo}
                alt="TicTac Travel Logo"
                style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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
                    marginTop: '2px',
                  }}
                >
                  Agence de Voyage
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav
              className="nav-desktop"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              aria-label="Navigation principale"
            >
              {navLinks.map((link) => (
                <div key={link.id} style={{ position: 'relative' }} className="nav-dropdown-wrapper">
                  <a
                    href={link.href}
                    className="nav-link-custom"
                    onClick={(e) => {
                      if (link.submenu) {
                        e.preventDefault();
                        toggleDropdown(link.id);
                      } else {
                        handleNavClick(e, link.href);
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
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.9)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all var(--duration) var(--ease)',
                      textDecoration: 'none',
                      maxWidth: '120px',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      whiteSpace: 'normal',
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
                          marginLeft: '2px',
                        }}
                      />
                    )}
                  </a>

                  {/* Submenu Dropdown */}
                  {link.submenu && (
                    <ul
                      role="menu"
                      aria-label={`Sous-menu ${link.label}`}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: activeDropdown === link.id
                          ? 'translateX(-50%) translateY(0)'
                          : 'translateX(-50%) translateY(10px)',
                        minWidth: '240px',
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--gray-100)',
                        padding: '8px 0',
                        marginTop: '10px',
                        opacity: activeDropdown === link.id ? 1 : 0,
                        visibility: activeDropdown === link.id ? 'visible' : 'hidden',
                        transition: 'all var(--duration) var(--ease)',
                        zIndex: 100,
                        listStyle: 'none',
                      }}
                    >
                      {link.submenu.map((item) => (
                        <li key={`${link.id}-${item.title}`} role="none">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => goTo(item.href)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '14px',
                              padding: '14px 20px', fontSize: '14px', color: 'var(--gray-600)',
                              transition: 'all var(--duration) var(--ease)',
                              background: 'none', border: 'none', width: '100%',
                              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div
                              style={{
                                width: '36px', height: '36px',
                                background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                                borderRadius: 'var(--radius-sm)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                color: 'var(--white)', fontSize: '14px', flexShrink: 0,
                              }}
                            >
                              <i className={item.icon} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ display: 'block', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '2px' }}>
                                {item.title}
                              </span>
                              <small style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{item.desc}</small>
                            </div>
                          </button>
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
                display: 'none', flexDirection: 'column', gap: '5px',
                padding: '8px', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ width: '24px', height: '2px', background: 'var(--white)', borderRadius: '2px', transition: 'all var(--duration) var(--ease)', transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ width: '24px', height: '2px', background: 'var(--white)', borderRadius: '2px', transition: 'all var(--duration) var(--ease)', opacity: isMobileMenuOpen ? 0 : 1 }} />
              <span style={{ width: '24px', height: '2px', background: 'var(--white)', borderRadius: '2px', transition: 'all var(--duration) var(--ease)', transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleOverlayClick}
          onKeyDown={handleOverlayKeyDown}
          aria-label="Fermer le menu"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, cursor: 'pointer' }}
        />
      )}

      {/* ── Mobile Menu ── */}
      <nav
        id="mobile-menu"
        aria-label="Menu mobile"
        aria-hidden={!isMobileMenuOpen}
        style={{
          position: 'fixed', top: 0, left: isMobileMenuOpen ? 0 : '-100%',
          width: '300px', height: '100vh', background: 'var(--primary)',
          zIndex: 1001, transition: 'left var(--duration) var(--ease)',
          padding: '100px 24px 24px', overflowY: 'auto',
        }}
      >
        {navLinks.map((link) => (
          <div key={link.id}>
            <button
              type="button"
              onClick={() => {
                if (link.submenu) {
                  toggleDropdown(link.id);
                } else {
                  goTo(link.href);
                }
              }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--white)', fontSize: '16px', fontWeight: 500,
                background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              {link.label}
              {link.submenu && (
                <i
                  className="fas fa-chevron-down"
                  style={{
                    fontSize: '11px', opacity: 0.7,
                    transition: 'transform var(--duration) var(--ease)',
                    transform: activeDropdown === link.id ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                />
              )}
            </button>

            {link.submenu && activeDropdown === link.id && (
              <div style={{ paddingLeft: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', margin: '4px 0 8px' }}>
                {link.submenu.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => goTo(item.href)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      width: '100%', padding: '12px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 400,
                      background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    }}
                  >
                    <i className={item.icon} style={{ color: 'var(--secondary)', width: '16px', fontSize: '13px' }} />
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Mobile account links */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <button
            type="button"
            onClick={() => goTo('/CreateAccount')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
              fontSize: '15px', fontWeight: 500, background: 'none', border: 'none',
              width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            <i className="fas fa-user-plus" style={{ color: 'var(--secondary)', width: '18px' }} />
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => goTo('/SignIn')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0',
              color: 'rgba(255,255,255,0.85)', fontSize: '15px', fontWeight: 500,
              background: 'none', border: 'none', width: '100%',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            <i className="fas fa-sign-in-alt" style={{ color: 'var(--gold)', width: '18px' }} />
            Se connecter
          </button>
        </div>
      </nav>

      <style>{`
        .nav-link-custom:hover {
          color: #D81B60 !important;
        }
        .nav-link-custom:hover i {
          color: #D81B60 !important;
        }
        @media (max-width: 1024px) {
          .nav-desktop { display: none !important; }
          .header-cta { display: none !important; }
          .hamburger { display: flex !important; }
          .header-top .contact-info { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
