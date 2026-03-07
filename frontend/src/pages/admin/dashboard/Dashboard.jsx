// src/pages/admin/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

const MODULES = [
  { title: 'Transport',          color: 'teal',   desc: 'Véhicules et demandes de transfert / mise à disposition.',
    links: [
      { label: 'Véhicules', path: '/admin/transport',          sk: 'vehicles', badge: false },
      { label: 'Demandes',  path: '/admin/transport/requests', sk: 'pending',  badge: true  },
    ]},
  { title: 'Voyages Organisés',  color: 'indigo', desc: 'Offres de voyages organisés et réservations clients.',
    links: [
      { label: 'Catalogue',    path: '/admin/voyages',              sk: null },
      { label: 'Réservations', path: '/admin/voyages/reservations', sk: null },
    ]},
  { title: 'Omra',               color: 'violet', desc: 'Offres de pèlerinage Omra et suivi des réservations.',
    links: [
      { label: 'Offres',       path: '/admin/omra',              sk: null },
      { label: 'Réservations', path: '/admin/omra/reservations', sk: null },
    ]},
  { title: 'Billeterie / Vols',  color: 'blue',   desc: 'Gestion des vols disponibles et demandes de billets.',
    links: [
      { label: 'Vols',     path: '/admin/billeterie',          sk: null },
      { label: 'Demandes', path: '/admin/billeterie/demandes', sk: null },
    ]},
  { title: 'Voyage sur Mesure',  color: 'orange', desc: 'Demandes de voyages personnalisés à traiter.',
    links: [
      { label: 'Demandes', path: '/admin/sur-mesure', sk: null },
    ]},
];

const DashIcon = ({ c }) => ({
  teal:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/><circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/></svg>,
  indigo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  violet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  blue:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>,
  orange: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
}[c]);

const Dashboard = () => {
  const navigate = useNavigate();
  const [st, setSt] = useState({ vehicles: 0, pending: 0 });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/transports').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/requests').then(r => r.json()).catch(() => ({})),
    ]).then(([v, r]) => setSt({
      vehicles: v.data?.length || 0,
      pending:  r.data?.filter(x => x.status === 'pending').length || 0,
    }));
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumb={[{ label: 'Dashboard', active: true }]}
      badges={{ transportRequests: st.pending }}
    >
      <div className="dash-page">

        <div className="dash-banner">
          <div>
            <span className="dash-banner__eyebrow">Bienvenue dans votre espace</span>
            <h2 className="dash-banner__title">Tic-Tac Voyage Admin</h2>
            <p className="dash-banner__sub">Gérez tous vos modules depuis ce tableau de bord.</p>
          </div>
          {st.pending > 0 && (
            <button className="dash-alert" onClick={() => navigate('/admin/transport/requests')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <div>
                <p className="dash-alert__num">{st.pending}</p>
                <p className="dash-alert__lbl">demande{st.pending > 1 ? 's' : ''} en attente</p>
              </div>
            </button>
          )}
        </div>

        <div>
          <p className="dash-section-lbl">Modules</p>
          <div className="dash-grid">
            {MODULES.map(mod => (
              <div key={mod.title} className={`dash-card dash-card--${mod.color}`}>
                <div className="dash-card__head">
                  <div className="dash-card__icon">
                    <DashIcon c={mod.color}/>
                  </div>
                  <div>
                    <p className="dash-card__title">{mod.title}</p>
                    <p className="dash-card__desc">{mod.desc}</p>
                  </div>
                </div>
                <div className="dash-card__body">
                  {mod.links.map(link => {
                    const count = link.sk ? st[link.sk] : null;
                    return (
                      <button
                        key={link.path}
                        className="dash-link"
                        onClick={() => navigate(link.path)}
                      >
                        <span className="dash-link__label">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="dash-link__arrow">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                          {link.label}
                        </span>
                        {count !== null && (
                          <span className={`dash-link__count${link.badge && count > 0 ? ' dash-link__count--badge' : ''}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;