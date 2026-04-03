// src/pages/admin/layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './adminLayout.css';

const Icon = ({ name }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    transport: <><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/><circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/></>,
    omra:      <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></>,
    voyages:   <><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></>,
    circuits:  <><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></>,
    billets:   <><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></>,
    surMesure: <><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></>,
    contact:   <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    clients:   <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    admins:    <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/><circle cx="19" cy="3" r="2" fill="currentColor"/></>,
    logo:      <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    promotions: <><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{paths[name]}</svg>
  );
};

const NAV_BASE = [
  {
    section: 'Tableau de bord',
    items: [{ label: 'Dashboard', icon: 'dashboard', path: '/admin' }],
  },
  {
    section: 'Modules',
    items: [
      { label: 'Transport', icon: 'transport', sub: [
          { label: 'Véhicules',        path: '/admin/transport',          badgeKey: null },
          { label: 'Demandes clients', path: '/admin/transport/requests', badgeKey: 'transportRequests' },
      ]},
      { label: 'Voyages Organisés', icon: 'voyages', sub: [
          { label: 'Catalogue',    path: '/admin/voyages/VoyagePackages',     badgeKey: null },
          { label: 'Réservations', path: '/admin/voyages/VoyageReservations', badgeKey: 'voyagesPending' },
      ]},
      { label: 'Circuits', icon: 'circuits', sub: [
          { label: 'Catalogue',    path: '/admin/circuits/CircuitPackages',     badgeKey: null },
          { label: 'Réservations', path: '/admin/circuits/CircuitReservations', badgeKey: 'circuitsPending' },
      ]},
      { label: 'Omra', icon: 'omra', sub: [
          { label: 'Forfaits',     path: '/admin/omra/packages',     badgeKey: null },
          { label: 'Réservations', path: '/admin/omra/reservations', badgeKey: 'omraPending' },
      ]},
      { label: 'Billeterie / Vols', icon: 'billets', sub: [
          { label: 'Vols',     path: '/admin/billeterie' },
          { label: 'Demandes', path: '/admin/billeterie/demandes' },
      ]},
      { label: 'Voyage sur Mesure', icon: 'surMesure', sub: [
          { label: 'Demandes', path: '/admin/sur-mesure', badgeKey: 'surMesure' },
      ]},
      { label: 'Contact', icon: 'contact', sub: [
          { label: 'Messages', path: '/admin/contact', badgeKey: 'contactNew' },
      ]},
      { label: 'Clients', icon: 'clients', sub: [
          { label: 'Tous les clients', path: '/admin/clients/ClientsAdmin', badgeKey: null },
      ]},
      { label: 'Promotions', icon: 'billets', path: '/admin/promotions' },
    ],
  },
];

// Admins section — only visible to main admin
const NAV_MAIN_ONLY = {
  section: 'Administration',
  items: [
    { label: 'Administrateurs', icon: 'admins', path: '/admin/admins' },
  ],
};

const AdminLayout = ({ children, title = 'Administration', breadcrumb = [], actions = null, toast = null, badges = {} }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ── Auth guard ───────────────────────────────────────────────
  const [admin, setAdmin] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token     = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('admin');
    if (!token || !adminData) {
      navigate('/admin/login');
      return;
    }
    try {
      setAdmin(JSON.parse(adminData));
    } catch {
      navigate('/admin/login');
      return;
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  // Build nav — add admins section for main admin
  const isMain = admin?.role === 'main';
  const NAV    = isMain ? [...NAV_BASE, NAV_MAIN_ONLY] : NAV_BASE;

  const getInitialOpen = () => {
    for (const g of NAV) for (const item of g.items)
      if (item.sub?.some(s => pathname.startsWith(s.path))) return item.label;
    return null;
  };

  const [openMenu, setOpenMenu] = useState(getInitialOpen);
  const toggleMenu  = (label) => setOpenMenu(prev => prev === label ? null : label);
  const isActive    = (path)  => pathname === path;
  const isSubActive = (path)  => pathname.startsWith(path) && path !== '/admin';

  if (!authChecked) return null; // Waiting for auth check

  const initials = `${admin?.firstName?.[0] || admin?.first_name?.[0] || ''}${admin?.lastName?.[0] || admin?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="al-root">
      {toast && (
        <div className={`al-toast al-toast--${toast.type}`}>
          <span className="al-toast__icon">
            {toast.type === 'success'
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>}
          </span>
          {toast.msg}
        </div>
      )}

      <aside className="al-sidebar">
        <div className="al-brand">
          <div className="al-brand__logo"><Icon name="logo"/></div>
          <div>
            <p className="al-brand__name">Tic-Tac Voyage</p>
            <p className="al-brand__role">Administration</p>
          </div>
        </div>

        {/* Logged-in admin card */}
        <div style={{ margin: '0 12px 8px', padding: '10px 12px', background: 'rgba(255,255,255,.07)', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: isMain ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.firstName || admin?.first_name} {admin?.lastName || admin?.last_name}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 1 }}>
                {isMain ? '👑 Admin Principal' : '🔧 Administrateur'}
              </p>
            </div>
          </div>
        </div>

        <nav className="al-nav">
          {NAV.map((group) => (
            <React.Fragment key={group.section}>
              <span className="al-nav__section">{group.section}</span>
              {group.items.map((item) => {
                // Simple link (no sub)
                if (!item.sub) return (
                  <button key={item.label} className={`al-nav__item ${isActive(item.path) ? 'active' : ''}`} onClick={() => navigate(item.path)}>
                    <Icon name={item.icon}/>{item.label}
                  </button>
                );
                const isOpen = openMenu === item.label;
                const hasActiveSub = item.sub.some(s => isSubActive(s.path));
                return (
                  <React.Fragment key={item.label}>
                    <button className={`al-nav__item ${hasActiveSub ? 'active' : ''} ${isOpen ? 'open' : ''}`} onClick={() => toggleMenu(item.label)}>
                      <Icon name={item.icon}/>
                      {item.label}
                      {item.sub.some(s => s.badgeKey && badges[s.badgeKey] > 0) && (
                        <span className="al-badge">
                          {item.sub.reduce((a, s) => a + (s.badgeKey ? (badges[s.badgeKey] || 0) : 0), 0)}
                        </span>
                      )}
                      <svg className="al-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div className={`al-nav__sub ${isOpen ? 'open' : ''}`}>
                      {item.sub.map((sub) => (
                        <button key={sub.path} className={`al-nav__subitem ${isSubActive(sub.path) ? 'active' : ''}`} onClick={() => navigate(sub.path)}>
                          {sub.label}
                          {sub.badgeKey && badges[sub.badgeKey] > 0 && (
                            <span className="al-badge" style={{ marginLeft: 'auto' }}>{badges[sub.badgeKey]}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        <div className="al-sidebar__footer">
          <button className="al-sidebar__footer-btn" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Retour au site
          </button>
          <button className="al-sidebar__footer-btn" onClick={handleLogout}
            style={{ color: '#fca5a5', marginTop: 4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="al-main">
        <header className="al-topbar">
          <div className="al-topbar__left">
            <h1 className="al-topbar__title">{title}</h1>
            {breadcrumb.length > 0 && (
              <div className="al-topbar__breadcrumb">
                <span>Admin</span>
                {breadcrumb.map((c, i) => (
                  <React.Fragment key={i}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    <span className={c.active ? 'al-topbar__breadcrumb--active' : ''}>{c.label}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          {actions && <div className="al-topbar__actions">{actions}</div>}
        </header>
        <div className="al-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;