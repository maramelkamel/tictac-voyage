// src/pages/admin/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

/* ══════════════════════════════════════════════════════════════
   MODULES CONFIG
   ══════════════════════════════════════════════════════════════ */
const MODULES = [
  {
    title: 'Transport',      color: 'teal',   status: 'active', desc: 'Véhicules & transferts',
    links: [
      { label: 'Véhicules',        path: '/admin/transport',                  sk: 'vehicles',       badge: false },
      { label: 'Demandes',         path: '/admin/transport/requests',         sk: 'pending',        badge: true  },
    ],
  },
  {
    title: 'Voyages Organisés', color: 'indigo', status: 'active', desc: 'Catalogue & réservations',
    links: [
      { label: 'Catalogue',        path: '/admin/voyages/VoyagePackages',     sk: 'voyagesTotal',   badge: false },
      { label: 'Réservations',     path: '/admin/voyages/VoyageReservations', sk: 'voyagesPending', badge: true  },
    ],
  },
  {
    title: 'Circuits',       color: 'green',  status: 'active', desc: 'Nord & Sud Tunisie',
    links: [
      { label: 'Catalogue',        path: '/admin/circuits/CircuitPackages',     sk: 'circuitsTotal',   badge: false },
      { label: 'Réservations',     path: '/admin/circuits/CircuitReservations', sk: 'circuitsPending', badge: true  },
    ],
  },
  {
    title: 'Omra',           color: 'violet', status: 'active', desc: 'Forfaits pèlerinage',
    links: [
      { label: 'Forfaits',         path: '/admin/omra/packages',              sk: null },
      { label: 'Réservations',     path: '/admin/omra/reservations',          sk: 'omraPending',    badge: true },
    ],
  },
  {
    title: 'Billeterie / Vols', color: 'blue', status: 'active', desc: 'Vols & tarification',
    links: [
      { label: 'Réservations',     path: '/admin/flights/reservations',       sk: 'flightsPending', badge: true  },
      { label: 'Gestion des prix', path: '/admin/flights/pricing',            sk: null,             badge: false },
    ],
  },
  {
    title: 'Voyage sur Mesure', color: 'orange', status: 'pending', desc: 'Demandes personnalisées',
    links: [
      { label: 'Demandes',         path: '/admin/sur-mesure',                 sk: 'surMesure',      badge: true },
    ],
  },
  {
    title: 'Contact',        color: 'red',    status: 'pending', desc: 'Messages formulaire',
    links: [
      { label: 'Messages',         path: '/admin/contact',                    sk: 'contactNew',     badge: true },
    ],
  },
  {
    title: 'Clients',        color: 'gray',   status: 'active', desc: 'Clients & historique',
    links: [
      { label: 'Tous les clients', path: '/admin/clients/ClientsAdmin',       sk: 'totalClients',   badge: false },
    ],
  },
];

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

/* ══════════════════════════════════════════════════════════════
   STAT CIRCLES — % basés sur données réelles
   ══════════════════════════════════════════════════════════════ */
const clampPct = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const StatCircle = ({ label, percent, color, value, sub }) => {
  const pct = clampPct(percent);
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${pct}%, #e2e8f0 0)`,
        position: 'relative',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          inset: 6,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          color: '#0a2832',
          fontSize: 14,
        }}>
          {pct}%
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {label}
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 900, color: '#0a2832', lineHeight: 1 }}>
          {value}
        </p>
        {sub && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>{sub}</p>}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   FORMES 3D SVG — proportionnelles aux vraies données
   ══════════════════════════════════════════════════════════════ */

/** Barres 3D isométriques — hauteurs = valeurs réelles */
const Bars3D = ({ values = [], colors = [] }) => {
  const max  = Math.max(...values, 1);
  const maxH = 48;
  const w = 13, gap = 6;
  const totalW = values.length * (w + gap) - gap;
  const startX = Math.round((120 - totalW) / 2);

  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" style={{ overflow: 'visible' }}>
      {values.map((v, i) => {
        const h  = Math.max(5, Math.round((v / max) * maxH));
        const x  = startX + i * (w + gap);
        const y  = 56 - h;
        const c  = colors[i % colors.length] || '#94a3b8';
        const cl = c + 'bb'; // côté
        const ct = c + 'dd'; // dessus
        return (
          <g key={i}>
            <ellipse cx={x + w / 2} cy={58} rx={w / 2 + 1} ry={2} fill={c} opacity={0.18} />
            {/* face avant */}
            <rect x={x} y={y} width={w} height={h} rx={2} fill={c} />
            {/* face droite */}
            <polygon points={`${x+w},${y} ${x+w+4},${y-3} ${x+w+4},${y+h-3} ${x+w},${y+h}`} fill={cl} />
            {/* face dessus */}
            <polygon points={`${x},${y} ${x+w},${y} ${x+w+4},${y-3} ${x+4},${y-3}`} fill={ct} />
          </g>
        );
      })}
    </svg>
  );
};

/** Camembert 3D — tranches = données réelles */
const Pie3D = ({ slices = [] }) => {
  const total = slices.reduce((s, sl) => s + (sl.value || 0), 0);
  if (total === 0) {
    return (
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
        <ellipse cx="60" cy="38" rx="44" ry="18" fill="#e2e8f0" />
        <ellipse cx="60" cy="30" rx="44" ry="18" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    );
  }

  const cx = 60, cy = 28, rx = 44, ry = 18, depth = 11;
  let arcs = [];
  let startAngle = -Math.PI / 2;

  slices.forEach(sl => {
    if ((sl.value || 0) === 0) return;
    const angle = (sl.value / total) * 2 * Math.PI;
    arcs.push({ color: sl.color, startAngle, angle, endAngle: startAngle + angle });
    startAngle += angle;
  });

  const pt = (angle) => ({
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  });

  const slicePath = (arc) => {
    const s = pt(arc.startAngle), e = pt(arc.endAngle);
    const lg = arc.angle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${rx} ${ry} 0 ${lg} 1 ${e.x} ${e.y} Z`;
  };

  const sidePath = (arc) => {
    const clipS = Math.max(arc.startAngle, 0);
    const clipE = Math.min(arc.endAngle, Math.PI);
    if (clipS >= clipE) return null;
    const s = pt(clipS), e = pt(clipE);
    const lg = (clipE - clipS) > Math.PI ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rx} ${ry} 0 ${lg} 1 ${e.x} ${e.y}
            L ${e.x} ${e.y + depth} A ${rx} ${ry} 0 ${lg} 0 ${s.x} ${s.y + depth} Z`;
  };

  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
      {/* côtés 3D */}
      {arcs.map((arc, i) => {
        const sp = sidePath(arc);
        return sp ? <path key={`s${i}`} d={sp} fill={arc.color} opacity={0.55} /> : null;
      })}
      {/* tranches */}
      {arcs.map((arc, i) => (
        <path key={`f${i}`} d={slicePath(arc)} fill={arc.color} stroke="#fff" strokeWidth={1} />
      ))}
    </svg>
  );
};

/** Triangles 3D — tailles = valeurs réelles */
const Triangles3D = ({ values = [], colors = [] }) => {
  const max = Math.max(...values, 1);
  const cfg = [
    { cx: 22, bw: 36 },
    { cx: 60, bw: 30 },
    { cx: 96, bw: 24 },
  ];
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
      {values.slice(0, 3).map((v, i) => {
        const h   = Math.max(8, Math.round((v / max) * 46));
        const { cx, bw } = cfg[i];
        const c   = colors[i % colors.length] || '#94a3b8';
        const top = 56 - h;
        return (
          <g key={i}>
            <ellipse cx={cx} cy={58} rx={bw / 2 + 2} ry={2.5} fill={c} opacity={0.2} />
            {/* face avant */}
            <polygon points={`${cx},${top} ${cx - bw/2},56 ${cx + bw/2},56`} fill={c} />
            {/* face droite (3D) */}
            <polygon points={`${cx},${top} ${cx + bw/2},56 ${cx + bw/2 + 4},53 ${cx + 4},${top - 3}`} fill={c + 'aa'} />
            {/* face dessus */}
            <polygon points={`${cx},${top} ${cx+4},${top-3} ${cx+4},${top-3}`} fill={c + 'cc'} />
          </g>
        );
      })}
    </svg>
  );
};

/** Donuts 3D — sections = valeurs réelles */
const Donuts3D = ({ values = [], colors = [] }) => {
  const total = values.reduce((s, v) => s + (v || 0), 0) || 1;

  const makeDonut = (vals, cols, cx, cy, r, depth) => {
    const innerR = r * 0.45;
    const t      = vals.reduce((s, v) => s + (v || 0), 0) || 1;
    let paths = [];
    let start = -Math.PI / 2;

    vals.forEach((v, j) => {
      if (!v) return;
      const angle = (v / t) * 2 * Math.PI;
      const end   = start + angle;
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
      const i1 = cx + innerR * Math.cos(start), ij1 = cy + innerR * Math.sin(start);
      const i2 = cx + innerR * Math.cos(end),   ij2 = cy + innerR * Math.sin(end);
      const lg = angle > Math.PI ? 1 : 0;
      paths.push(
        <path key={j}
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} L ${i2} ${ij2} A ${innerR} ${innerR} 0 ${lg} 0 ${i1} ${ij1} Z`}
          fill={cols[j % cols.length] || '#e2e8f0'}
          stroke="#fff" strokeWidth={1}
        />
      );
      start = end;
    });

    return (
      <g>
        <ellipse cx={cx} cy={cy + depth} rx={r} ry={r * 0.3} fill={cols[0] || '#e2e8f0'} opacity={0.22} />
        {paths}
        <circle cx={cx} cy={cy} r={innerR} fill="#fff" />
      </g>
    );
  };

  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
      {makeDonut(values.slice(0, 2), colors.slice(0, 2), 34, 30, 26, 8)}
      {makeDonut(values.slice(2, 4), colors.slice(2, 4), 88, 34, 20, 7)}
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════
   KPI CARD
   ══════════════════════════════════════════════════════════════ */
const KpiCard = ({ kpi }) => {
  const numericValue = typeof kpi.value === 'number' ? kpi.value : null;
  const pct = numericValue !== null && kpi.total > 0
    ? Math.round((numericValue / kpi.total) * 100)
    : null;

  return (
    <div className={`dash-kpi dash-kpi--${kpi.color}`}>
      {/* Forme 3D SVG dynamique */}
      <div className="dash-kpi__shape">
        {kpi.shape}
      </div>

      <div className="dash-kpi__body">
        <p className="dash-kpi__label">{kpi.label}</p>
        <div className="dash-kpi__row">
          <span className="dash-kpi__value">{kpi.value}</span>
          {pct !== null && (
            <span className={`dash-kpi__pct dash-kpi__pct--${kpi.trend}`}>{pct}%</span>
          )}
        </div>
        <p className="dash-kpi__sub">{kpi.sub}</p>

        {/* Barre de progression réelle */}
        {pct !== null && (
          <div className="dash-kpi__bar-wrap">
            <div
              className={`dash-kpi__bar dash-kpi__bar--${kpi.color}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODULE CARD
   ══════════════════════════════════════════════════════════════ */
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
  );
};

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken') || '';
  const [st, setSt] = useState({
    vehicles: 0, pending: 0, surMesure: 0, contactNew: 0,
    omraPending: 0, totalClients: 0, activeClients: 0,
    voyagesTotal: 0, voyagesPending: 0,
    circuitsTotal: 0, circuitsPending: 0, flightsPending: 0,
    totalReservations: 0, confirmedReservations: 0,
    completedReservations: 0, cancelledReservations: 0,
    pendingReservations: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/transports').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/requests').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/custom-trips').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/contact/stats').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/omra/reservations').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/clients').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/voyages-organises').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/voyage-reservations').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/circuits').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/circuit-reservations').then(r => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/flights/reservations', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
    ]).then(([v, r, ct, cs, omra, clients, voyages, voyageRes, circuits, circuitRes, flightRes]) => {
      const allRes = [
        ...(r.data       || []),
        ...(omra.data    || []),
        ...(voyageRes.data  || []),
        ...(circuitRes.data || []),
        ...(flightRes.data  || []),
      ];

      const activeEmails = new Set(
        allRes.map(x => (x.email || '').toLowerCase()).filter(Boolean)
      );
      const activeClients = (clients.data || []).reduce((acc, c) => {
        const e = (c.email || '').toLowerCase();
        return e && activeEmails.has(e) ? acc + 1 : acc;
      }, 0);

      setSt({
        vehicles:              v.data?.length || 0,
        pending:               r.data?.filter(x => x.status === 'pending').length   || 0,
        surMesure:             ct.data?.filter(x => x.status === 'pending').length  || 0,
        contactNew:            parseInt(cs.data?.nouveaux) || 0,
        omraPending:           omra.data?.filter(x => x.status === 'pending').length || 0,
        totalClients:          clients.data?.length || 0,
        activeClients,
        voyagesTotal:          voyages.data?.length || 0,
        voyagesPending:        voyageRes.data?.filter(x => x.status === 'pending').length  || 0,
        circuitsTotal:         circuits.data?.length || 0,
        circuitsPending:       circuitRes.data?.filter(x => x.status === 'pending').length || 0,
        flightsPending:        flightRes.data?.filter(x => x.status === 'pending').length  || 0,
        totalReservations:     allRes.length,
        confirmedReservations: allRes.filter(x => x.status === 'confirmed').length,
        completedReservations: allRes.filter(x => x.status === 'completed').length,
        cancelledReservations: allRes.filter(x => x.status === 'cancelled').length,
        pendingReservations:   allRes.filter(x => x.status === 'pending').length,
      });
    });
  }, []);

  const totalPending =
    st.pending + st.voyagesPending + st.circuitsPending +
    st.omraPending + st.flightsPending + st.surMesure + st.contactNew;

  /* ── KPI cards ── */
  const kpis = [
    {
      label: 'Clients inscrits',
      value: st.totalClients,
      total: 0,
      color: 'blue',
      trend: 'up',
      sub: 'Total comptes créés',
      shape: (
        <Bars3D
          values={[st.pending, st.voyagesPending, st.circuitsPending, st.omraPending, st.flightsPending]}
          colors={['#38bdf8', '#1ECAD3', '#818cf8', '#f472b6', '#34d399']}
        />
      ),
    },
    {
      label: 'Réservations totales',
      value: st.totalReservations,
      total: st.totalReservations,
      color: 'teal',
      trend: 'info',
      sub: `${st.confirmedReservations} confirmées · ${st.pendingReservations} en attente`,
      shape: (
        <Pie3D slices={[
          { value: st.confirmedReservations, color: '#10b981' },
          { value: st.pendingReservations,   color: '#f97316' },
          { value: st.completedReservations, color: '#1ECAD3' },
          { value: st.cancelledReservations, color: '#E92F64' },
        ]} />
      ),
    },
    {
      label: 'Actions en attente',
      value: totalPending,
      total: st.totalReservations + st.surMesure + st.contactNew,
      color: 'orange',
      trend: 'warn',
      sub: totalPending > 0 ? '⚠ Intervention requise' : '✓ Tout est traité',
      shape: (
        <Triangles3D
          values={[
            st.pending + st.flightsPending,
            st.voyagesPending + st.circuitsPending + st.omraPending,
            st.surMesure + st.contactNew,
          ]}
          colors={['#f97316', '#fbbf24', '#fb923c']}
        />
      ),
    },
    {
      label: 'Taux de confirmation',
      value: st.totalReservations > 0
        ? `${Math.round((st.confirmedReservations / st.totalReservations) * 100)}%`
        : '0%',
      total: 0,
      color: 'green',
      trend: 'up',
      sub: `${st.completedReservations} voyages terminés · ${st.cancelledReservations} annulés`,
      shape: (
        <Donuts3D
          values={[st.confirmedReservations, st.pendingReservations, st.completedReservations, st.cancelledReservations]}
          colors={['#10b981', '#f97316', '#1ECAD3', '#E92F64']}
        />
      ),
    },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumb={[{ label: 'Dashboard', active: true }]}
      badges={{
        transportRequests: st.pending,
        omraPending:       st.omraPending,
        surMesure:         st.surMesure,
        contactNew:        st.contactNew,
        voyagesPending:    st.voyagesPending,
        circuitsPending:   st.circuitsPending,
        flightsPending:    st.flightsPending,
      }}
    >
      <div className="dash-page">

        {/* ── Bannière ── */}
        <div className="dash-banner">
          <div>
            <span className="dash-banner__eyebrow">Bienvenue dans votre espace</span>
            <h2 className="dash-banner__title">TicTac Voyage Admin</h2>
            <p className="dash-banner__sub">Gérez tous vos modules depuis ce tableau de bord.</p>
          </div>
          {totalPending > 0 && (
            <button className="dash-alert" onClick={() => navigate('/admin/transport/requests')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <div>
                <p className="dash-alert__num">{totalPending}</p>
                <p className="dash-alert__lbl">action{totalPending > 1 ? 's' : ''} en attente</p>
              </div>
            </button>
          )}
        </div>

        {/* ── Stat circles ── */}
        <div>
          <p className="dash-section-lbl">Statistiques</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <StatCircle
              label="Clients"
              color="#3b82f6"
              percent={st.totalClients ? Math.round((st.activeClients / st.totalClients) * 100) : 0}
              value={st.totalClients}
              sub={`${st.activeClients} avec réservation`}
            />
            <StatCircle
              label="Réservations"
              color="#14b8a6"
              percent={st.totalReservations ? Math.round(((st.confirmedReservations + st.completedReservations) / st.totalReservations) * 100) : 0}
              value={st.totalReservations}
              sub={`${st.confirmedReservations} confirmées`}
            />
            <StatCircle
              label="Conversion"
              color="#22c55e"
              percent={st.totalReservations ? Math.round((st.confirmedReservations / st.totalReservations) * 100) : 0}
              value={st.totalReservations ? `${Math.round((st.confirmedReservations / st.totalReservations) * 100)}%` : '0%'}
              sub="confirmées / total"
            />
          </div>
        </div>

        {/* ── KPI avec formes 3D dynamiques ── */}
        <div>
          <p className="dash-section-lbl">Vue d'ensemble</p>
          <div className="dash-kpi-row">
            {kpis.map(kpi => <KpiCard key={kpi.label} kpi={kpi} />)}
          </div>
        </div>

        {/* ── Modules ── */}
        <div>
          <p className="dash-section-lbl">Modules</p>
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
