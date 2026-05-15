import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

// ─── Hook stats dynamiques ────────────────────────────────────────────────────
const API_STATS = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/stats`;

const useAdminStats = (refreshInterval = 60000) => {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_STATS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur API');
      setData(json.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(() => fetchStats(true), refreshInterval);
    return () => clearInterval(iv);
  }, [fetchStats, refreshInterval]);

  return { data, loading, error, lastUpdated, refresh: () => fetchStats() };
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ w = '100%', h = 24, r = 8 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
);

// ─── Stat Card dynamique ──────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, trend, loading }) => {
  const palette = {
    blue:   { bg: '#eff6ff', accent: '#2563eb', border: '#dbeafe' },
    teal:   { bg: '#f0fdfa', accent: '#0d9488', border: '#ccfbf1' },
    green:  { bg: '#f0fdf4', accent: '#16a34a', border: '#dcfce7' },
    orange: { bg: '#fff7ed', accent: '#ea580c', border: '#fed7aa' },
    violet: { bg: '#f5f3ff', accent: '#7c3aed', border: '#ede9fe' },
    red:    { bg: '#fef2f2', accent: '#dc2626', border: '#fee2e2' },
  };
  const c = palette[color] || palette.blue;
  return (
    <div
      style={{
        background: '#fff', borderRadius: 14, padding: '18px 20px',
        border: `1px solid ${c.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,.05)',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        transition: 'box-shadow .2s, transform .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.05)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 11, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.8">{icon}</svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
        {loading
          ? <div style={{ marginTop: 5 }}><Skeleton h={26} w={70} /></div>
          : <p style={{ margin: '3px 0 2px', fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value ?? '—'}</p>
        }
        {loading
          ? <div style={{ marginTop: 3 }}><Skeleton h={12} w={110} /></div>
          : <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{sub}</p>
        }
      </div>
      {trend != null && !loading && (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: trend > 0 ? '#f0fdf4' : '#f8fafc', color: trend > 0 ? '#16a34a' : '#64748b', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
          {trend > 0 ? `+${trend}` : trend}/mois
        </span>
      )}
    </div>
  );
};

// ─── Modules (ORIGINAL inchangé) ─────────────────────────────────────────────
const MODULES = [
  {
    title: 'Transport', color: 'teal', status: 'active', desc: 'Vehicules & transferts',
    links: [
      { label: 'Vehicules', path: '/admin/transport',          sk: 'vehicles', badge: false },
      { label: 'Demandes',  path: '/admin/transport/requests', sk: 'pending',  badge: true  },
    ],
  },
  {
    title: 'Voyages Organises', color: 'indigo', status: 'active', desc: 'Catalogue & reservations',
    links: [
      { label: 'Catalogue',    path: '/admin/voyages/VoyagePackages',     sk: 'voyagesTotal',   badge: false },
      { label: 'Reservations', path: '/admin/voyages/VoyageReservations', sk: 'voyagesPending', badge: true  },
    ],
  },
  {
    title: 'Circuits', color: 'green', status: 'active', desc: 'Nord & Sud Tunisie',
    links: [
      { label: 'Catalogue',    path: '/admin/circuits/CircuitPackages',     sk: 'circuitsTotal',   badge: false },
      { label: 'Reservations', path: '/admin/circuits/CircuitReservations', sk: 'circuitsPending', badge: true  },
    ],
  },
  {
    title: 'Omra', color: 'violet', status: 'active', desc: 'Forfaits pelerinage',
    links: [
      { label: 'Forfaits',     path: '/admin/omra/packages',     sk: null,          badge: false },
      { label: 'Reservations', path: '/admin/omra/reservations', sk: 'omraPending', badge: true  },
    ],
  },
  {
    title: 'Billeterie / Vols', color: 'blue', status: 'active', desc: 'Vols & tarification',
    links: [
      { label: 'Reservations',     path: '/admin/flights/reservations', sk: 'flightsPending', badge: true  },
      { label: 'Gestion des prix', path: '/admin/flights/pricing',      sk: null,             badge: false },
    ],
  },
  {
    title: 'Hotels', color: 'teal', status: 'active', desc: 'Catalogue hotel & reservations',
    links: [
      { label: 'Catalogue',    path: '/admin/hotels/catalog',      sk: 'hotelsTotal',   badge: false },
      { label: 'Reservations', path: '/admin/hotels/reservations', sk: 'hotelsPending', badge: true  },
    ],
  },
  {
    title: 'Voyage sur Mesure', color: 'orange', status: 'pending', desc: 'Demandes personnalisees',
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

// ─── SVG Charts ORIGINAUX (100% inchangés) ───────────────────────────────────
const Bars3D = ({ values = [], colors = [] }) => {
  const max = Math.max(...values, 1);
  const maxH = 48, w = 13, gap = 6;
  const totalW = values.length * (w + gap) - gap;
  const startX = Math.round((120 - totalW) / 2);
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" style={{ overflow: 'visible' }}>
      {values.map((value, index) => {
        const h = Math.max(5, Math.round((value / max) * maxH));
        const x = startX + index * (w + gap), y = 56 - h;
        const color = colors[index % colors.length] || '#94a3b8';
        return (
          <g key={index}>
            <ellipse cx={x + w / 2} cy={58} rx={w / 2 + 1} ry={2} fill={color} opacity={0.18} />
            <rect x={x} y={y} width={w} height={h} rx={2} fill={color} />
            <polygon points={`${x + w},${y} ${x + w + 4},${y - 3} ${x + w + 4},${y + h - 3} ${x + w},${y + h}`} fill={`${color}bb`} />
            <polygon points={`${x},${y} ${x + w},${y} ${x + w + 4},${y - 3} ${x + 4},${y - 3}`} fill={`${color}dd`} />
          </g>
        );
      })}
    </svg>
  );
};

const Pie3D = ({ slices = [] }) => {
  const total = slices.reduce((sum, slice) => sum + (slice.value || 0), 0);
  if (!total) {
    return (
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
        <ellipse cx="60" cy="38" rx="44" ry="18" fill="#e2e8f0" />
        <ellipse cx="60" cy="30" rx="44" ry="18" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
      </svg>
    );
  }
  const cx = 60, cy = 28, rx = 44, ry = 18, depth = 11;
  const arcs = [];
  let startAngle = -Math.PI / 2;
  slices.forEach((slice) => {
    if (!(slice.value || 0)) return;
    const angle = (slice.value / total) * 2 * Math.PI;
    arcs.push({ color: slice.color, startAngle, angle, endAngle: startAngle + angle });
    startAngle += angle;
  });
  const point = (angle) => ({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
  const slicePath = (arc) => {
    const start = point(arc.startAngle), end = point(arc.endAngle);
    const largeArc = arc.angle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${rx} ${ry} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };
  const sidePath = (arc) => {
    const clippedStart = Math.max(arc.startAngle, 0), clippedEnd = Math.min(arc.endAngle, Math.PI);
    if (clippedStart >= clippedEnd) return null;
    const start = point(clippedStart), end = point(clippedEnd);
    const largeArc = (clippedEnd - clippedStart) > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${rx} ${ry} 0 ${largeArc} 1 ${end.x} ${end.y} L ${end.x} ${end.y + depth} A ${rx} ${ry} 0 ${largeArc} 0 ${start.x} ${start.y + depth} Z`;
  };
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
      {arcs.map((arc, index) => { const side = sidePath(arc); return side ? <path key={`side-${index}`} d={side} fill={arc.color} opacity={0.55} /> : null; })}
      {arcs.map((arc, index) => <path key={`slice-${index}`} d={slicePath(arc)} fill={arc.color} stroke="#fff" strokeWidth="1" />)}
    </svg>
  );
};

const Triangles3D = ({ values = [], colors = [] }) => {
  const max = Math.max(...values, 1);
  const config = [{ cx: 22, bw: 36 }, { cx: 60, bw: 30 }, { cx: 96, bw: 24 }];
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
      {values.slice(0, 3).map((value, index) => {
        const h = Math.max(8, Math.round((value / max) * 46));
        const { cx, bw } = config[index];
        const color = colors[index % colors.length] || '#94a3b8';
        const top = 56 - h;
        return (
          <g key={index}>
            <ellipse cx={cx} cy={58} rx={bw / 2 + 2} ry={2.5} fill={color} opacity={0.2} />
            <polygon points={`${cx},${top} ${cx - bw / 2},56 ${cx + bw / 2},56`} fill={color} />
            <polygon points={`${cx},${top} ${cx + bw / 2},56 ${cx + bw / 2 + 4},53 ${cx + 4},${top - 3}`} fill={`${color}aa`} />
            <polygon points={`${cx},${top} ${cx + 4},${top - 3} ${cx + 4},${top - 3}`} fill={`${color}cc`} />
          </g>
        );
      })}
    </svg>
  );
};

const Donuts3D = ({ values = [], colors = [] }) => {
  const renderDonut = (vals, cols, cx, cy, r, depth) => {
    const innerR = r * 0.45;
    const total = vals.reduce((sum, value) => sum + (value || 0), 0) || 1;
    const paths = [];
    let start = -Math.PI / 2;
    vals.forEach((value, index) => {
      if (!value) return;
      const angle = (value / total) * 2 * Math.PI;
      const end = start + angle;
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
      const i1 = cx + innerR * Math.cos(start), iy1 = cy + innerR * Math.sin(start);
      const i2 = cx + innerR * Math.cos(end),   iy2 = cy + innerR * Math.sin(end);
      const largeArc = angle > Math.PI ? 1 : 0;
      paths.push(
        <path key={index}
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${i2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${i1} ${iy1} Z`}
          fill={cols[index % cols.length] || '#e2e8f0'} stroke="#fff" strokeWidth="1"
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
      {renderDonut(values.slice(0, 2), colors.slice(0, 2), 34, 30, 26, 8)}
      {renderDonut(values.slice(2, 4), colors.slice(2, 4), 88, 34, 20, 7)}
    </svg>
  );
};

// ─── KpiCard ORIGINAL (inchangé) ─────────────────────────────────────────────
const KpiCard = ({ kpi }) => {
  const numericValue = typeof kpi.value === 'number' ? kpi.value : null;
  const pct = numericValue !== null && kpi.total > 0
    ? Math.round((numericValue / kpi.total) * 100) : null;
  return (
    <div className={`dash-kpi dash-kpi--${kpi.color}`}>
      <div className="dash-kpi__shape">{kpi.shape}</div>
      <div className="dash-kpi__body">
        <p className="dash-kpi__label">{kpi.label}</p>
        <div className="dash-kpi__row">
          <span className="dash-kpi__value">{kpi.value}</span>
          {pct !== null && <span className={`dash-kpi__pct dash-kpi__pct--${kpi.trend}`}>{pct}%</span>}
        </div>
        <p className="dash-kpi__sub">{kpi.sub}</p>
        {pct !== null && (
          <div className="dash-kpi__bar-wrap">
            <div className={`dash-kpi__bar dash-kpi__bar--${kpi.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ModuleCard ORIGINAL (inchangé) ──────────────────────────────────────────
const ModuleCard = ({ mod, st, navigate }) => {
  const firstSk = mod.links.find((link) => link.sk)?.sk;
  const total = firstSk ? st[firstSk] : null;
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
        {mod.links.map((link) => {
          const count = link.sk ? st[link.sk] : null;
          return (
            <button key={link.path} className="dash-link" onClick={() => navigate(link.path)}>
              <span className="dash-link__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="dash-link__arrow">
                  <path d="M9 18l6-6-6-6" />
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

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  // Nouveau : stats dynamiques
  const { data, loading: statsLoading, error: statsError, lastUpdated, refresh } = useAdminStats(60000);
  const sd  = data || {};
  const sr  = sd.reservations || {};
  const scl = sd.clients      || {};
  const srv = sd.revenue      || {};
  const sof = sd.offers       || {};
  const sco = sd.contacts     || {};
  const totalOffers  = (+sof.voyages||0)+(+sof.circuits||0)+(+sof.omra||0)+(+sof.hotels||0)+(+sof.transports||0);
  const confirmRate  = +sr.total > 0 ? Math.round(((+sr.confirmed||0) / +sr.total) * 100) : 0;

  // Original : données modules
  const token = localStorage.getItem('adminToken') || '';
  const [st, setSt] = useState({
    vehicles: 0, pending: 0, surMesure: 0, contactNew: 0, omraPending: 0,
    totalClients: 0, voyagesTotal: 0, voyagesPending: 0,
    circuitsTotal: 0, circuitsPending: 0, flightsPending: 0,
    hotelsTotal: 0, hotelsPending: 0,
    totalReservations: 0, confirmedReservations: 0,
    completedReservations: 0, cancelledReservations: 0, pendingReservations: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/transports').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/requests').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/custom-trips').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/contact/stats').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/omra/reservations').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/clients').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/voyages-organises').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/voyage-reservations').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/circuits').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/circuit-reservations').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/flights/reservations', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/hotels').then((r) => r.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/hotels/reservations', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => ({})),
    ]).then(([transports, transportRequests, customTrips, contactStats, omraReservations, clients, voyages, voyageReservations, circuits, circuitReservations, flightReservations, hotels, hotelReservations]) => {
      const allReservations = [
        ...(transportRequests.data  || []),
        ...(omraReservations.data   || []),
        ...(voyageReservations.data || []),
        ...(circuitReservations.data|| []),
        ...(flightReservations.data || []),
        ...(hotelReservations.data  || []),
      ];
      setSt({
        vehicles:              transports.data?.length || 0,
        pending:               transportRequests.data?.filter((i) => i.status === 'pending').length || 0,
        surMesure:             customTrips.data?.filter((i) => i.status === 'pending').length || 0,
        contactNew:            parseInt(contactStats.data?.nouveaux, 10) || 0,
        omraPending:           omraReservations.data?.filter((i) => i.status === 'pending').length || 0,
        totalClients:          clients.data?.length || 0,
        voyagesTotal:          voyages.data?.length || 0,
        voyagesPending:        voyageReservations.data?.filter((i) => i.status === 'pending').length || 0,
        circuitsTotal:         circuits.data?.length || 0,
        circuitsPending:       circuitReservations.data?.filter((i) => i.status === 'pending').length || 0,
        flightsPending:        flightReservations.data?.filter((i) => i.status === 'pending').length || 0,
        hotelsTotal:           hotels.data?.length || 0,
        hotelsPending:         hotelReservations.data?.filter((i) => i.status === 'pending').length || 0,
        totalReservations:     allReservations.length,
        confirmedReservations: allReservations.filter((i) => i.status === 'confirmed').length,
        completedReservations: allReservations.filter((i) => i.status === 'completed').length,
        cancelledReservations: allReservations.filter((i) => i.status === 'cancelled').length,
        pendingReservations:   allReservations.filter((i) => i.status === 'pending').length,
      });
    });
  }, [token]);

  const totalPending = st.pending + st.voyagesPending + st.circuitsPending
    + st.omraPending + st.flightsPending + st.hotelsPending + st.surMesure + st.contactNew;

  // KPI originaux avec charts SVG 3D
  const kpis = [
    {
      label: 'Clients inscrits', value: st.totalClients, total: 0,
      color: 'blue', trend: 'up', sub: 'Total comptes crees',
      shape: <Bars3D values={[st.pending, st.voyagesPending, st.circuitsPending, st.omraPending, st.hotelsPending]} colors={['#38bdf8', '#1ECAD3', '#818cf8', '#f472b6', '#34d399']} />,
    },
    {
      label: 'Reservations totales', value: st.totalReservations, total: st.totalReservations,
      color: 'teal', trend: 'info', sub: `${st.confirmedReservations} confirmees · ${st.pendingReservations} en attente`,
      shape: <Pie3D slices={[{ value: st.confirmedReservations, color: '#10b981' }, { value: st.pendingReservations, color: '#f97316' }, { value: st.completedReservations, color: '#1ECAD3' }, { value: st.cancelledReservations, color: '#E92F64' }]} />,
    },
    {
      label: 'Actions en attente', value: totalPending, total: st.totalReservations + st.surMesure + st.contactNew,
      color: 'orange', trend: 'warn', sub: totalPending > 0 ? 'Intervention requise' : 'Tout est traite',
      shape: <Triangles3D values={[st.pending + st.flightsPending, st.voyagesPending + st.circuitsPending + st.omraPending, st.hotelsPending + st.surMesure + st.contactNew]} colors={['#f97316', '#fbbf24', '#fb923c']} />,
    },
    {
      label: 'Taux de confirmation',
      value: st.totalReservations > 0 ? `${Math.round((st.confirmedReservations / st.totalReservations) * 100)}%` : '0%',
      total: 0, color: 'green', trend: 'up',
      sub: `${st.completedReservations} voyages termines · ${st.cancelledReservations} annules`,
      shape: <Donuts3D values={[st.confirmedReservations, st.pendingReservations, st.completedReservations, st.cancelledReservations]} colors={['#10b981', '#f97316', '#1ECAD3', '#E92F64']} />,
    },
  ];

  // 8 stat cards dynamiques (nouveau)
  const statCards = [
    {
      icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
      label: 'Clients inscrits', color: 'blue',
      value: (+scl.total||0).toLocaleString('fr'),
      sub: `+${scl.new_this_month||0} ce mois · ${scl.google_users||0} via Google`,
      trend: +scl.new_this_month || null,
    },
    {
      icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></>,
      label: 'Réservations totales', color: 'teal',
      value: (+sr.total||0).toLocaleString('fr'),
      sub: `${sr.pending||0} en attente · ${sr.confirmed||0} confirmées`,
      trend: +sr.new_this_month || null,
    },
    {
      icon: <><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></>,
      label: 'Offres actives', color: 'violet',
      value: totalOffers.toLocaleString('fr'),
      sub: `${sof.hotels||0} hôtels · ${sof.voyages||0} voyages · ${sof.circuits||0} circuits`,
      trend: null,
    },
    {
      icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
      label: 'Revenus confirmés', color: 'green',
      value: `${(+srv.total||0).toLocaleString('fr')} TND`,
      sub: `${(+srv.this_month||0).toLocaleString('fr')} TND ce mois`,
      trend: +srv.this_month || null,
    },
    {
      icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>,
      label: 'En attente', color: 'orange',
      value: +sr.pending || 0,
      sub: 'Réservations à traiter',
      trend: null,
    },
    {
      icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
      label: 'Confirmées', color: 'green',
      value: +sr.confirmed || 0,
      sub: `Taux : ${confirmRate}%`,
      trend: null,
    },
    {
      icon: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
      label: 'Messages reçus', color: 'blue',
      value: +sco.total || 0,
      sub: `${sco.unread||0} non lus · ${sco.this_week||0} cette semaine`,
      trend: +sco.this_week || null,
    },
    {
      icon: <><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></>,
      label: 'Annulées', color: 'red',
      value: +sr.cancelled || 0,
      sub: `${sr.completed||0} voyages terminés`,
      trend: null,
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
        hotelsPending:     st.hotelsPending,
      }}
    >
      <style>{`@keyframes shimmer { to { background-position: -200% 0 } }`}</style>

      <div className="dash-page">

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — STATISTIQUES DYNAMIQUES (nouveau, en haut)
        ══════════════════════════════════════════════════════ */}

        {/* En-tête avec heure d'actualisation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p className="dash-section-lbl" style={{ margin: 0 }}>Statistiques en temps réel</p>
            {lastUpdated && (
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                Actualisé à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <button
            onClick={refresh}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Actualiser
          </button>
        </div>

        {/* Erreur stats */}
        {statsError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontSize: 13, marginBottom: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
            <span style={{ flex: 1 }}>Erreur stats : {statsError}</span>
            <button onClick={refresh} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, padding: '4px 11px', cursor: 'pointer', fontSize: 12 }}>Réessayer</button>
          </div>
        )}

        {/* Grille 8 stat cards — 4 colonnes × 2 lignes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {statCards.map(s => <StatCard key={s.label} {...s} loading={statsLoading} />)}
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — ANCIEN DASHBOARD (100% inchangé)
        ══════════════════════════════════════════════════════ */}

        <div className="dash-banner">
          <div>
            <span className="dash-banner__eyebrow">Bienvenue dans votre espace</span>
            <h2 className="dash-banner__title">TicTac Voyage Admin</h2>
            <p className="dash-banner__sub">Gerez tous vos modules depuis ce tableau de bord, avec Hotels en plus.</p>
          </div>
          {totalPending > 0 && (
            <button className="dash-alert" onClick={() => navigate(st.hotelsPending > 0 ? '/admin/hotels/reservations' : '/admin/transport/requests')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <div>
                <p className="dash-alert__num">{totalPending}</p>
                <p className="dash-alert__lbl">action{totalPending > 1 ? 's' : ''} en attente</p>
              </div>
            </button>
          )}
        </div>

        <div>
          <p className="dash-section-lbl">Vue d'ensemble</p>
          <div className="dash-kpi-row">
            {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
          </div>
        </div>

        <div>
          <p className="dash-section-lbl">Modules</p>
          <div className="dash-grid">
            {MODULES.map((mod) => (
              <ModuleCard key={mod.title} mod={mod} st={st} navigate={navigate} />
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;