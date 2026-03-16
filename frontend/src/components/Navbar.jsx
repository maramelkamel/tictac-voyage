import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

const navLinks = [
  { id: 1, label: 'Hôtels',      href: '/' },
  { id: 2, label: 'Voyages',     href: '#',
    submenu: [
      { icon: 'fas fa-globe', title: 'Voyages Organisés', desc: 'Circuits tout compris',  href: '/VoyagesOrganise/VoyagesOrganise' },
      { icon: 'fas fa-star',  title: 'Voyages Sur Mesure', desc: '100% personnalisé',     href: '/CustomTripAbroad' },
    ],
  },
  { id: 3, label: 'Transport',   href: '/transport' },
  { id: 4, label: 'Billetterie', href: '/billeterie/Billeterie' },
  { id: 5, label: 'Omra',        href: '/Omra/Omra' },
  { id: 6, label: 'Contact',     href: '/Contact' },
  { id: 7, label: 'Circuit',     href: '/circuits' },
];

// ── Loyalty level helper ────────────────────────────────────────
const getLoyaltyLevel = (totalReservations) => {
  if (totalReservations === 0) return { level: 0, label: 'Nouveau client',  color: '#64748b', icon: '🌱' };
  if (totalReservations <= 1)  return { level: 1, label: 'Niveau 1 ⭐',     color: '#0e7490', icon: '⭐' };
  if (totalReservations <= 3)  return { level: 2, label: 'Niveau 2 ⭐⭐',   color: '#c2410c', icon: '⭐⭐' };
  return                              { level: 3, label: 'Niveau 3 ⭐⭐⭐', color: '#7c3aed', icon: '⭐⭐⭐' };
};

const Navbar = () => {
  const navigate = useNavigate();

  const [isScrolled,        setIsScrolled]        = useState(false);
  const [isMobileMenuOpen,  setIsMobileMenuOpen]  = useState(false);
  const [activeDropdown,    setActiveDropdown]    = useState(null);
  const [activeLang,        setActiveLang]        = useState('FR');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // ── Auth state ─────────────────────────────────────────────────
  const [client, setClient] = useState(() => {
    try { return JSON.parse(localStorage.getItem('client')) || null; }
    catch { return null; }
  });

  // Re-read from localStorage when window gets focus (e.g. after login in another tab)
  useEffect(() => {
    const sync = () => {
      try { setClient(JSON.parse(localStorage.getItem('client')) || null); }
      catch { setClient(null); }
    };
    window.addEventListener('storage', sync);
    window.addEventListener('focus',   sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', sync); };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('client');
    setClient(null);
    setIsAccountMenuOpen(false);
    navigate('/');
  }, [navigate]);

  // ── Scroll ────────────────────────────────────────────────────
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
      if (e.key === 'Escape') { setActiveDropdown(null); setIsMobileMenuOpen(false); setIsAccountMenuOpen(false); }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-account-wrapper')) setIsAccountMenuOpen(false);
      if (!e.target.closest('.nav-dropdown-wrapper'))  setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown    = useCallback((id) => setActiveDropdown(prev => prev === id ? null : id), []);
  const closeMobileMenu   = useCallback(() => setIsMobileMenuOpen(false), []);
  const handleOverlayClick   = useCallback(() => closeMobileMenu(), [closeMobileMenu]);
  const handleOverlayKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeMobileMenu(); }
  }, [closeMobileMenu]);
  const handleNavClick = useCallback((e, href) => {
    if (href.startsWith('#')) return;
    e.preventDefault(); navigate(href);
  }, [navigate]);
  const goTo = useCallback((path) => {
    setIsAccountMenuOpen(false); setIsMobileMenuOpen(false); setActiveDropdown(null);
    if (path.startsWith('#')) { const el = document.querySelector(path); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
    else navigate(path);
  }, [navigate]);

  // ── Avatar initials ───────────────────────────────────────────
  const initials = client
    ? `${(client.firstName || client.first_name || '')[0] || ''}${(client.lastName || client.last_name || '')[0] || ''}`.toUpperCase()
    : '';

  const firstName = client?.firstName || client?.first_name || '';
  const loyalty   = getLoyaltyLevel(0); // Will be updated when profile loads

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: isScrolled ? 'rgba(15, 76, 92, 0.98)' : 'var(--primary)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        boxShadow: isScrolled ? '0 4px 30px rgba(0,0,0,0.15)' : 'none',
        transition: 'all var(--duration) var(--ease)',
      }}>

        {/* ── Header Top ── */}
        <div className="header-top" style={{ background: 'rgba(0,0,0,0.15)', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* Contact Info */}
            <div className="contact-info" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <a href="tel:+21636149885" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                <i className="fas fa-phone-alt" style={{ fontSize: '12px', color: 'var(--secondary)' }} />
                +216 36 149 885
              </a>
              <a href="mailto:tictacvoyages@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
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
              <div role="group" aria-label="Sélection de langue" style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
                {['FR', 'EN', 'AR'].map(lang => (
                  <button key={lang} type="button" onClick={() => setActiveLang(lang)} aria-pressed={activeLang === lang}
                    style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: activeLang === lang ? 'var(--white)' : 'rgba(255,255,255,0.6)', borderRadius: '4px', background: activeLang === lang ? 'var(--secondary)' : 'transparent', transition: 'all var(--duration) var(--ease)', border: 'none', cursor: 'pointer' }}>
                    {lang}
                  </button>
                ))}
              </div>

              {/* ── Account Area ── */}
              <div style={{ position: 'relative' }} className="user-account-wrapper">

                {client ? (
                  /* ── LOGGED IN ── */
                  <button type="button" aria-haspopup="true" aria-expanded={isAccountMenuOpen}
                    onClick={() => setIsAccountMenuOpen(p => !p)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--white)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>
                    {/* Avatar */}
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), #0e7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {initials || <i className="fas fa-user" style={{ fontSize: 11 }} />}
                    </div>
                    <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {firstName || 'Mon compte'}
                    </span>
                    <i className="fas fa-chevron-down" style={{ fontSize: '10px', opacity: 0.7, transition: 'transform .2s', transform: isAccountMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                ) : (
                  /* ── NOT LOGGED IN ── */
                  <button type="button" aria-haspopup="true" aria-expanded={isAccountMenuOpen}
                    onClick={() => setIsAccountMenuOpen(p => !p)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', color: 'var(--white)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s' }}>
                    <span style={{ width: 28, height: 28, background: 'linear-gradient(135deg, var(--secondary), var(--gold))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                      <i className="fas fa-user" />
                    </span>
                    Mon compte
                    <i className="fas fa-chevron-down" style={{ fontSize: '10px', opacity: 0.7, transition: 'transform .2s', transform: isAccountMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                )}

                {/* ── Dropdown ── */}
                <ul role="menu" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 240,
                  background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid var(--gray-100)',
                  padding: '8px 0',
                  opacity: isAccountMenuOpen ? 1 : 0, visibility: isAccountMenuOpen ? 'visible' : 'hidden',
                  transform: isAccountMenuOpen ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all .2s', zIndex: 200, listStyle: 'none', margin: 0,
                }}>

                  {client ? (
                    <>
                      {/* Header with user info */}
                      <li style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), #0e7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initials || <i className="fas fa-user" />}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>
                              {firstName} {client.lastName || client.last_name || ''}
                            </p>
                            <p style={{ fontSize: 11, color: '#64748b' }}>{client.email}</p>
                          </div>
                        </div>
                      </li>

                      {/* Mon Profil */}
                      <li role="none">
                        <button type="button" role="menuitem" onClick={() => goTo('/mon-compte')}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', fontSize: 13, color: '#475569', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, flexShrink: 0 }}>
                            <i className="fas fa-user-circle" />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>Mon profil</span>
                            <small style={{ fontSize: 11, color: '#94a3b8' }}>Réservations & paramètres</small>
                          </div>
                        </button>
                      </li>

                      {/* Mes Réservations */}
                      <li role="none">
                        <button type="button" role="menuitem" onClick={() => goTo('/mon-compte?tab=reservations')}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', fontSize: 13, color: '#475569', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, flexShrink: 0 }}>
                            <i className="fas fa-suitcase" />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>Mes réservations</span>
                            <small style={{ fontSize: 11, color: '#94a3b8' }}>Historique & suivi</small>
                          </div>
                        </button>
                      </li>

                      {/* Mes Favoris */}
                      <li role="none">
                        <button type="button" role="menuitem" onClick={() => goTo('/mon-compte?tab=favoris')}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', fontSize: 13, color: '#475569', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#e92f64,#f43f5e)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, flexShrink: 0 }}>
                            <i className="fas fa-heart" />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>Mes favoris</span>
                            <small style={{ fontSize: 11, color: '#94a3b8' }}>Omra, voyages, hôtels</small>
                          </div>
                        </button>
                      </li>

                      {/* Fidélité */}
                      <li role="none">
                        <button type="button" role="menuitem" onClick={() => goTo('/mon-compte?tab=fidelite')}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', fontSize: 13, color: '#475569', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#D4A017,#f59e0b)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, flexShrink: 0 }}>
                            <i className="fas fa-crown" />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>Programme fidélité</span>
                            <small style={{ fontSize: 11, color: '#94a3b8' }}>Réductions & avantages</small>
                          </div>
                        </button>
                      </li>

                      {/* Divider + Logout */}
                      <li style={{ borderTop: '1px solid var(--gray-100)', marginTop: 4, paddingTop: 4 }}>
                        <button type="button" role="menuitem" onClick={handleLogout}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', fontSize: 13, color: '#e92f64', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff1f5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 34, height: 34, background: '#fff1f5', border: '1.5px solid #fca5a5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e92f64', fontSize: 13, flexShrink: 0 }}>
                            <i className="fas fa-sign-out-alt" />
                          </div>
                          Se déconnecter
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      {/* Not logged in — Créer compte */}
                      <li role="none">
                        <button type="button" role="menuitem" onClick={() => goTo('/CreateAccount')}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', fontSize: 14, color: '#475569', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1)'; }}>
                          <div className="account-icon" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--secondary), var(--primary))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, transition: 'transform .2s', flexShrink: 0 }}>
                            <i className="fas fa-user-plus" />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: 2 }}>Créer un compte</span>
                            <small style={{ fontSize: 12, color: '#94a3b8' }}>Nouveau client</small>
                          </div>
                        </button>
                      </li>
                      {/* Se connecter */}
                      <li role="none" style={{ borderTop: '1px solid var(--gray-100)', marginTop: 4, paddingTop: 4 }}>
                        <button type="button" role="menuitem" onClick={() => goTo('/SignIn')}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', fontSize: 14, color: '#475569', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.querySelector('.account-icon').style.transform = 'scale(1)'; }}>
                          <div className="account-icon" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--gold), var(--secondary))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, transition: 'transform .2s', flexShrink: 0 }}>
                            <i className="fas fa-sign-in-alt" />
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: 2 }}>Se connecter</span>
                            <small style={{ fontSize: 12, color: '#94a3b8' }}>Déjà client</small>
                          </div>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Header Main ── */}
        <div style={{ padding: '10px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>

            {/* Logo */}
            <button type="button" onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <img src={logo} alt="TicTac Travel Logo" style={{ height: 50, width: 'auto', objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>TICTAC VOYAGES</div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>Agence de Voyage</span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }} aria-label="Navigation principale">
              {navLinks.map(link => (
                <div key={link.id} style={{ position: 'relative' }} className="nav-dropdown-wrapper">
                  <a href={link.href} className="nav-link-custom"
                    onClick={e => { if (link.submenu) { e.preventDefault(); toggleDropdown(link.id); } else handleNavClick(e, link.href); }}
                    aria-expanded={link.submenu ? activeDropdown === link.id : undefined}
                    aria-haspopup={link.submenu ? 'true' : undefined}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 12px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', borderRadius: 'var(--radius-md)', transition: 'all .2s', textDecoration: 'none', maxWidth: 120, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'normal' }}>
                    {link.label}
                    {link.submenu && <i className="fas fa-chevron-down" style={{ fontSize: 10, transition: 'transform .2s', transform: activeDropdown === link.id ? 'rotate(180deg)' : 'rotate(0)', marginLeft: 2 }} />}
                  </a>

                  {link.submenu && (
                    <ul role="menu" style={{ position: 'absolute', top: '100%', left: '50%', transform: activeDropdown === link.id ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(10px)', minWidth: 240, background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--gray-100)', padding: '8px 0', marginTop: 10, opacity: activeDropdown === link.id ? 1 : 0, visibility: activeDropdown === link.id ? 'visible' : 'hidden', transition: 'all .2s', zIndex: 100, listStyle: 'none' }}>
                      {link.submenu.map(item => (
                        <li key={item.title} role="none">
                          <button type="button" role="menuitem" onClick={() => goTo(item.href)}
                            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', fontSize: 14, color: '#475569', transition: 'background .15s', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--secondary), var(--primary))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0 }}>
                              <i className={item.icon} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: 2 }}>{item.title}</span>
                              <small style={{ fontSize: 11, color: '#94a3b8' }}>{item.desc}</small>
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
              <a href="#" className="btn btn-glass"><i className="fas fa-headset" /> Assistance</a>
            </div>

            {/* Hamburger */}
            <button type="button" className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu"
              style={{ display: 'none', flexDirection: 'column', gap: 5, padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <span style={{ width: 24, height: 2, background: 'var(--white)', borderRadius: 2, transition: 'all .2s', transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ width: 24, height: 2, background: 'var(--white)', borderRadius: 2, transition: 'all .2s', opacity: isMobileMenuOpen ? 0 : 1 }} />
              <span style={{ width: 24, height: 2, background: 'var(--white)', borderRadius: 2, transition: 'all .2s', transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div role="button" tabIndex={0} onClick={handleOverlayClick} onKeyDown={handleOverlayKeyDown}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, cursor: 'pointer' }} />
      )}

      {/* ── Mobile Menu ── */}
      <nav id="mobile-menu" aria-hidden={!isMobileMenuOpen}
        style={{ position: 'fixed', top: 0, left: isMobileMenuOpen ? 0 : '-100%', width: 300, height: '100vh', background: 'var(--primary)', zIndex: 1001, transition: 'left .3s', padding: '100px 24px 24px', overflowY: 'auto' }}>
        {navLinks.map(link => (
          <div key={link.id}>
            <button type="button" onClick={() => { if (link.submenu) toggleDropdown(link.id); else goTo(link.href); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', fontSize: 16, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              {link.label}
              {link.submenu && <i className="fas fa-chevron-down" style={{ fontSize: 11, opacity: 0.7, transition: 'transform .2s', transform: activeDropdown === link.id ? 'rotate(180deg)' : 'rotate(0)' }} />}
            </button>
            {link.submenu && activeDropdown === link.id && (
              <div style={{ paddingLeft: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 8, margin: '4px 0 8px' }}>
                {link.submenu.map(item => (
                  <button key={item.title} type="button" onClick={() => goTo(item.href)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                    <i className={item.icon} style={{ color: 'var(--secondary)', width: 16, fontSize: 13 }} />
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Mobile account section */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          {client ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--secondary),#0e7490)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {initials}
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{firstName}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{client.email}</p>
                </div>
              </div>
              {[
                { icon: 'fas fa-user-circle', label: 'Mon profil',        path: '/mon-compte' },
                { icon: 'fas fa-suitcase',    label: 'Mes réservations',  path: '/mon-compte?tab=reservations' },
                { icon: 'fas fa-heart',       label: 'Mes favoris',       path: '/mon-compte?tab=favoris' },
                { icon: 'fas fa-crown',       label: 'Fidélité',          path: '/mon-compte?tab=fidelite' },
              ].map(item => (
                <button key={item.path} type="button" onClick={() => goTo(item.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <i className={item.icon} style={{ color: 'var(--secondary)', width: 18 }} />
                  {item.label}
                </button>
              ))}
              <button type="button" onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', color: '#fca5a5', fontSize: 15, fontWeight: 600, background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', marginTop: 4 }}>
                <i className="fas fa-sign-out-alt" style={{ width: 18 }} />
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => goTo('/CreateAccount')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                <i className="fas fa-user-plus" style={{ color: 'var(--secondary)', width: 18 }} /> Créer un compte
              </button>
              <button type="button" onClick={() => goTo('/SignIn')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                <i className="fas fa-sign-in-alt" style={{ color: 'var(--gold)', width: 18 }} /> Se connecter
              </button>
            </>
          )}
        </div>
      </nav>

      <style>{`
        .nav-link-custom:hover { color: #D81B60 !important; }
        .nav-link-custom:hover i { color: #D81B60 !important; }
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