import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { useAdminStats } from '../../../hooks/useAdminStats';

/* ─────────────────────────────────────────────────────────────────
   Barre de stat horizontale
───────────────────────────────────────────────────────────────── */
const StatBar = ({ label, value, max, color, suffix = '', loading }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="dash-bar">
      <div className="dash-bar__top">
        <span className="dash-bar__label">{label}</span>
        {loading
          ? <span className="dash-bar__sk" />
          : <span className="dash-bar__val" style={{ color }}>{value?.toLocaleString('fr')}{suffix}</span>
        }
      </div>
      <div className="dash-bar__track">
        <div className="dash-bar__fill" style={{ width: loading ? '0%' : `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Mini donut inline
───────────────────────────────────────────────────────────────── */
const MiniDonut = ({ slices, size = 52, stroke = 9 }) => {
  const r     = (size - stroke) / 2;
  const circ  = 2 * Math.PI * r;
  const total = slices.reduce((s, sl) => s + (sl.value || 0), 0) || 1;
  let offset  = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="var(--stat-track)" strokeWidth={stroke} />
      {slices.map((sl, i) => {
        const dash = (sl.value / total) * circ;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={sl.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transition: `stroke-dasharray 1s ${i * 0.15}s ease` }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Icônes modules
───────────────────────────────────────────────────────────────── */
const MODULE_ICONS = {
  teal:   <><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/><circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/></>,
  indigo: <><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></>,
  green:  <><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></>,
  violet: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></>,
  blue:   <><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></>,
  orange: <><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></>,
  red:    <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
  gray:   <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
};

/* ─────────────────────────────────────────────────────────────────
   Modules
───────────────────────────────────────────────────────────────── */
const MODULES = [
  {
    title: 'Transport', color: 'teal', status: 'active', desc: 'Véhicules & transferts',
    links: [
      { label: 'Véhicules', path: '/admin/transport',          sk: 'vehicles', badge: false },
      { label: 'Demandes',  path: '/admin/transport/requests', sk: 'pending',  badge: true  },
    ],
  },
  {
    title: 'Voyages Organisés', color: 'indigo', status: 'active', desc: 'Catalogue & réservations',
    links: [
      { label: 'Catalogue',    path: '/admin/voyages/VoyagePackages',     sk: 'voyagesTotal',   badge: false },
      { label: 'Réservations', path: '/admin/voyages/VoyageReservations', sk: 'voyagesPending', badge: true  },
    ],
  },
  {
    title: 'Circuits', color: 'green', status: 'active', desc: 'Nord & Sud Tunisie',
    links: [
      { label: 'Catalogue',    path: '/admin/circuits/CircuitPackages',     sk: 'circuitsTotal',   badge: false },
      { label: 'Réservations', path: '/admin/circuits/CircuitReservations', sk: 'circuitsPending', badge: true  },
    ],
  },
  {
    title: 'Omra', color: 'violet', status: 'active', desc: 'Forfaits pèlerinage',
    links: [
      { label: 'Forfaits',     path: '/admin/omra/packages',     sk: null,          badge: false },
      { label: 'Réservations', path: '/admin/omra/reservations', sk: 'omraPending', badge: true  },
    ],
  },
  {
    title: 'Billeterie / Vols', color: 'blue', status: 'active', desc: 'Vols & tarification',
    links: [
      { label: 'Réservations',     path: '/admin/flights/reservations', sk: 'flightsPending', badge: true  },
    ],
  },
  {
    title: 'Hôtels', color: 'teal', status: 'active', desc: 'Catalogue hôtel & réservations',
    links: [
      { label: 'Catalogue',    path: '/admin/hotels/catalog',      sk: 'hotelsTotal',   badge: false },
      { label: 'Réservations', path: '/admin/hotels/reservations', sk: 'hotelsPending', badge: true  },
    ],
  },
  {
    title: 'Voyage sur Mesure', color: 'orange', status: 'pending', desc: 'Demandes personnalisées',
    links: [
      { label: 'Demandes', path: '/admin/sur-mesure', sk: 'surMesure', badge: true },
    ],
  },
  {
    title: 'Contact', color: 'red', status: 'pending', desc: 'Messages formulaire',
    links: [
      { label: 'Messages', path: '/admin/contact', sk: 'contactNew', badge: true },
    ],
  },
  {
    title: 'Clients', color: 'gray', status: 'active', desc: 'Clients & historique',
    links: [
      { label: 'Tous les clients', path: '/admin/clients/ClientsAdmin', sk: 'totalClients', badge: false },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   ModuleCard
───────────────────────────────────────────────────────────────── */
const ModuleCard = ({ mod, st, navigate }) => {
  const firstSk = mod.links.find(l => l.sk)?.sk;
  const total   = firstSk ? st[firstSk] : null;
  return (
    <div className={`dash-card dash-card--${mod.color} dash-card--status-${mod.status}`}>
      <div className="dash-card__head">
        <div className="dash-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            {MODULE_ICONS[mod.color]}
          </svg>
        </div>
        <div className="dash-card__info">
          <p className="dash-card__title">{mod.title}</p>
          <p className="dash-card__desc">{mod.desc}</p>
        </div>
        {total !== null && <span className="dash-card__total">{total}</span>}
      </div>
      <div className="dash-card__body">
        {mod.links.map(link => {
          const count = link.sk ? st[link.sk] : null;
          return (
            <button key={link.path} className="dash-link" onClick={() => navigate(link.path)}>
              <span className="dash-link__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" className="dash-link__arrow">
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
  );
};

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();

  /* Statistiques globales (hook externalisé) */
  const { data, loading: sl, error: se, lastUpdated, refresh } = useAdminStats();
  const sd  = data || {};
  const sr  = sd.reservations || {};
  const scl = sd.clients      || {};
  const sof = sd.offers       || {};
  const sco = sd.contacts     || {};

  const totalOffers   = (+sof.voyages||0)+(+sof.circuits||0)+(+sof.omra||0)+(+sof.hotels||0)+(+sof.transports||0);
  const confirmRate   = +sr.total > 0 ? Math.round(((+sr.confirmed||0) / +sr.total) * 100) : 0;

  /* Compteurs par module */
  const token = localStorage.getItem('adminToken') || '';
  const [st, setSt] = useState({
    vehicles: 0, pending: 0, surMesure: 0, contactNew: 0, omraPending: 0,
    totalClients: 0, voyagesTotal: 0, voyagesPending: 0, circuitsTotal: 0,
    circuitsPending: 0, flightsPending: 0, hotelsTotal: 0, hotelsPending: 0,
    totalReservations: 0, confirmedReservations: 0, completedReservations: 0,
    cancelledReservations: 0, pendingReservations: 0,
  });

  useEffect(() => {
    const BASE = 'http://localhost:5000/api';
    const authH = { headers: { Authorization: `Bearer ${token}` } };
    Promise.all([
      fetch(`${BASE}/transports`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/requests`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/custom-trips`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/contact/stats`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/omra/reservations`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/clients`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/voyages-organises`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/voyage-reservations`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/circuits`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/circuit-reservations`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/flights/reservations`, authH).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/hotels`).then(r => r.json()).catch(() => ({})),
      fetch(`${BASE}/hotels/reservations`, authH).then(r => r.json()).catch(() => ({})),
    ]).then(([tr, req, ct, cs, omra, cl, voy, voyR, circ, circR, flR, hot, hotR]) => {
      const all = [
        ...(req.data  || []), ...(omra.data || []), ...(voyR.data  || []),
        ...(circR.data|| []), ...(flR.data  || []), ...(hotR.data  || []),
      ];
      setSt({
        vehicles:              tr.data?.length || 0,
        pending:               req.data?.filter(i => i.status === 'pending').length || 0,
        surMesure:             ct.data?.filter(i => i.status === 'pending').length || 0,
        contactNew:            parseInt(cs.data?.nouveaux, 10) || 0,
        omraPending:           omra.data?.filter(i => i.status === 'pending').length || 0,
        totalClients:          cl.data?.length || 0,
        voyagesTotal:          voy.data?.length || 0,
        voyagesPending:        voyR.data?.filter(i => i.status === 'pending').length || 0,
        circuitsTotal:         circ.data?.length || 0,
        circuitsPending:       circR.data?.filter(i => i.status === 'pending').length || 0,
        flightsPending:        flR.data?.filter(i => i.status === 'pending').length || 0,
        hotelsTotal:           hot.data?.length || 0,
        hotelsPending:         hotR.data?.filter(i => i.status === 'pending').length || 0,
        totalReservations:     all.length,
        confirmedReservations: all.filter(i => i.status === 'confirmed').length,
        completedReservations: all.filter(i => i.status === 'completed').length,
        cancelledReservations: all.filter(i => i.status === 'cancelled').length,
        pendingReservations:   all.filter(i => i.status === 'pending').length,
      });
    });
  }, [token]);

  const totalPending =
    st.pending + st.voyagesPending + st.circuitsPending + st.omraPending +
    st.flightsPending + st.hotelsPending + st.surMesure + st.contactNew;

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumb={[{ label: 'Dashboard', active: true }]}
      badges={{
        transportRequests: st.pending,    omraPending:      st.omraPending,
        surMesure:         st.surMesure,  contactNew:       st.contactNew,
        voyagesPending:    st.voyagesPending, circuitsPending: st.circuitsPending,
        flightsPending:    st.flightsPending, hotelsPending:  st.hotelsPending,
      }}
    >
      <style>{`
        @keyframes shimmer { to { background-position: -200% 0 } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
      `}</style>

      <div className="dash-page" style={{ animation: 'fadeUp .35s ease' }}>

        {/* ══════════════════════════════════════════
            EN-TÊTE STATISTIQUES
        ══════════════════════════════════════════ */}
        <div className="dstat-header">
          <div>
            {/* Nouveau style de titre — visible, contrasté */}
            <h2 className="dash-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" width="18" height="18" aria-hidden="true">
                <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/>
              </svg>
              Vue d'ensemble — Statistiques
            </h2>
           {lastUpdated && (
  <div className="dstat-updated-pill">
    <span className="dstat-updated-pill__dot" />
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" className="dstat-updated-pill__icon" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
    Actualisé à&nbsp;
    <span className="dstat-updated-pill__time">
      {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
    </span>
  </div>
)}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {se && <span className="dstat-err">{se}</span>}
            <button className="dstat-refresh" onClick={refresh}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.2" width="13" height="13">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* ── Panneau de détails en grille pleine largeur ── */}
        <div className="dstat-detail dstat-detail--full">

          {/* Taux de confirmation */}
          <div className="dstat-panel dstat-panel--center">
            <p className="dstat-panel__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" width="14" height="14">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Taux de confirmation
            </p>
            <div className="dstat-donut-wrap">
              {sl
                ? <div className="dstat-donut-sk" />
                : <MiniDonut size={90} stroke={12} slices={[
                    { value: +sr.confirmed||0, color: '#10b981' },
                    { value: +sr.pending||0,   color: '#f97316' },
                    { value: +sr.completed||0, color: '#3b82f6' },
                    { value: +sr.cancelled||0, color: '#ef4444' },
                  ]} />
              }
              <div className="dstat-rate">
                {sl
                  ? <span className="dstat-rate__sk" />
                  : <>
                      <span className="dstat-rate__val">{confirmRate}%</span>
                      <span className="dstat-rate__lbl">confirmées</span>
                    </>
                }
              </div>
            </div>
            <div className="dstat-legend">
              {[
                ['#10b981', 'Confirmées', +sr.confirmed||0],
                ['#f97316', 'En attente', +sr.pending||0],
                ['#3b82f6', 'Terminées',  +sr.completed||0],
                ['#ef4444', 'Annulées',   +sr.cancelled||0],
              ].map(([c, l, v]) => (
                <div key={l} className="dstat-legend__item">
                  <span className="dstat-legend__dot" style={{ background: c }} />
                  <span className="dstat-legend__lbl">{l}</span>
                  <span className="dstat-legend__val">{sl ? '…' : v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Catalogue des offres */}
          <div className="dstat-panel">
            <p className="dstat-panel__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" width="14" height="14">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Catalogue des offres
            </p>
            <div className="dstat-panel__bars">
              <StatBar label="Hôtels"     value={+sof.hotels||0}     max={Math.max(totalOffers, 1)} color="#0d9488" loading={sl} />
              <StatBar label="Voyages"    value={+sof.voyages||0}    max={Math.max(totalOffers, 1)} color="#6366f1" loading={sl} />
              <StatBar label="Circuits"   value={+sof.circuits||0}   max={Math.max(totalOffers, 1)} color="#10b981" loading={sl} />
              <StatBar label="Omra"       value={+sof.omra||0}       max={Math.max(totalOffers, 1)} color="#8b5cf6" loading={sl} />
              <StatBar label="Transports" value={+sof.transports||0} max={Math.max(totalOffers, 1)} color="#14b8a6" loading={sl} />
            </div>
          </div>

          {/* Messages & Clients */}
          <div className="dstat-panel">
            <p className="dstat-panel__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" width="14" height="14">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Messages &amp; Clients
            </p>
            <div className="dstat-kv-grid">
              {[
                { label: 'Messages reçus',    val: +sco.total||0,           color: '#2563eb', icon: '💬' },
                { label: 'Non lus',           val: +sco.unread||0,          color: '#dc2626', icon: '🔴' },
                { label: 'Cette semaine',     val: +sco.this_week||0,       color: '#f97316', icon: '📅' },
                { label: 'Nouveaux clients',  val: +scl.new_this_month||0,  color: '#16a34a', icon: '👤' },
              ].map(({ label, val, color, icon }) => (
                <div key={label} className="dstat-kv-item" style={{ borderColor: color + '33' }}>
                  <span className="dstat-kv-icon">{icon}</span>
                  {sl
                    ? <span className="dstat-kv-sk" />
                    : <span className="dstat-kv-val" style={{ color }}>{val.toLocaleString('fr')}</span>
                  }
                  <span className="dstat-kv-lbl">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════
            SÉPARATEUR — MODULES
        ══════════════════════════════════════════ */}
        <div className="dash-divider-line">
          {/* Nouveau style de titre séparateur */}
          <span className="dash-divider-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" width="15" height="15" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Modules de gestion
          </span>
        </div>

        {/* ── Grille des modules ── */}
        <div>
          <div className="dash-grid">
            {MODULES.map(mod => (
              <ModuleCard key={mod.title} mod={mod} st={st} navigate={navigate} />
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;
