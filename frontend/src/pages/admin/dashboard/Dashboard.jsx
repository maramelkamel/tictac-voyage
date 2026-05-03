import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';

const MODULES = [
  {
    title: 'Transport',
    color: '#0f766e',
    description: 'Vehicules, transferts et demandes clients',
    links: [
      { label: 'Vehicules', path: '/admin/transport', key: 'vehicles' },
      { label: 'Demandes', path: '/admin/transport/requests', key: 'transportPending', badge: true },
    ],
  },
  {
    title: 'Voyages organises',
    color: '#4338ca',
    description: 'Catalogue et reservations internationales',
    links: [
      { label: 'Catalogue', path: '/admin/voyages/VoyagePackages', key: 'voyagesTotal' },
      { label: 'Reservations', path: '/admin/voyages/VoyageReservations', key: 'voyagesPending', badge: true },
    ],
  },
  {
    title: 'Circuits',
    color: '#15803d',
    description: 'Circuits Tunisie nord et sud',
    links: [
      { label: 'Catalogue', path: '/admin/circuits/CircuitPackages', key: 'circuitsTotal' },
      { label: 'Reservations', path: '/admin/circuits/CircuitReservations', key: 'circuitsPending', badge: true },
    ],
  },
  {
    title: 'Omra',
    color: '#7c3aed',
    description: 'Forfaits, departs et reservations',
    links: [
      { label: 'Forfaits', path: '/admin/omra/packages', key: 'omraTotal' },
      { label: 'Reservations', path: '/admin/omra/reservations', key: 'omraPending', badge: true },
    ],
  },
  {
    title: 'Billeterie / Vols',
    color: '#2563eb',
    description: 'Reservations vols et gestion des prix',
    links: [
      { label: 'Reservations', path: '/admin/flights/reservations', key: 'flightsPending', badge: true },
      { label: 'Tarification', path: '/admin/flights/pricing', key: 'flightsPricing' },
    ],
  },
  {
    title: 'Hotels',
    color: '#0f4c5c',
    description: 'Catalogue hotels, page publique et reservations',
    links: [
      { label: 'Catalogue', path: '/admin/hotels/catalog', key: 'hotelsTotal' },
      { label: 'Reservations', path: '/admin/hotels/reservations', key: 'hotelsPending', badge: true },
    ],
  },
  {
    title: 'Voyage sur mesure',
    color: '#ea580c',
    description: 'Demandes personnalisees',
    links: [
      { label: 'Demandes', path: '/admin/sur-mesure', key: 'surMesure', badge: true },
    ],
  },
  {
    title: 'Contact',
    color: '#dc2626',
    description: 'Messages recents du site',
    links: [
      { label: 'Messages', path: '/admin/contact', key: 'contactNew', badge: true },
    ],
  },
  {
    title: 'Clients',
    color: '#64748b',
    description: 'Base clients et activite',
    links: [
      { label: 'Tous les clients', path: '/admin/clients/ClientsAdmin', key: 'totalClients' },
    ],
  },
];

const statCardStyle = {
  background: '#fff',
  borderRadius: 18,
  border: '1px solid #e2e8f0',
  padding: 20,
  boxShadow: '0 6px 20px rgba(15,76,92,.06)',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken') || '';
  const [stats, setStats] = useState({
    vehicles: 0,
    transportPending: 0,
    surMesure: 0,
    contactNew: 0,
    omraTotal: 0,
    omraPending: 0,
    totalClients: 0,
    activeClients: 0,
    voyagesTotal: 0,
    voyagesPending: 0,
    circuitsTotal: 0,
    circuitsPending: 0,
    flightsPending: 0,
    hotelsTotal: 0,
    hotelsPending: 0,
    totalReservations: 0,
    confirmedReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    pendingReservations: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/transports').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/requests').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/custom-trips').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/contact/stats').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/omra/packages').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/omra/reservations').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/clients').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/voyages-organises').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/voyage-reservations').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/circuits').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/circuit-reservations').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/flights/reservations', { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/hotels').then((response) => response.json()).catch(() => ({})),
      fetch('http://localhost:5000/api/hotels/reservations', { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).catch(() => ({})),
    ]).then(([
      transports,
      transportRequests,
      customTrips,
      contactStats,
      omraPackages,
      omraReservations,
      clients,
      voyages,
      voyageReservations,
      circuits,
      circuitReservations,
      flightReservations,
      hotels,
      hotelReservations,
    ]) => {
      const allReservations = [
        ...(transportRequests.data || []),
        ...(omraReservations.data || []),
        ...(voyageReservations.data || []),
        ...(circuitReservations.data || []),
        ...(flightReservations.data || []),
        ...(hotelReservations.data || []),
      ];

      const activeEmails = new Set(
        allReservations
          .map((item) => (item.email || item.holder_email || '').toLowerCase())
          .filter(Boolean)
      );

      const activeClients = (clients.data || []).reduce((total, client) => {
        const email = (client.email || '').toLowerCase();
        return email && activeEmails.has(email) ? total + 1 : total;
      }, 0);

      setStats({
        vehicles: transports.data?.length || 0,
        transportPending: transportRequests.data?.filter((item) => item.status === 'pending').length || 0,
        surMesure: customTrips.data?.filter((item) => item.status === 'pending').length || 0,
        contactNew: parseInt(contactStats.data?.nouveaux, 10) || 0,
        omraTotal: omraPackages.data?.length || 0,
        omraPending: omraReservations.data?.filter((item) => item.status === 'pending').length || 0,
        totalClients: clients.data?.length || 0,
        activeClients,
        voyagesTotal: voyages.data?.length || 0,
        voyagesPending: voyageReservations.data?.filter((item) => item.status === 'pending').length || 0,
        circuitsTotal: circuits.data?.length || 0,
        circuitsPending: circuitReservations.data?.filter((item) => item.status === 'pending').length || 0,
        flightsPending: flightReservations.data?.filter((item) => item.status === 'pending').length || 0,
        hotelsTotal: hotels.data?.length || 0,
        hotelsPending: hotelReservations.data?.filter((item) => item.status === 'pending').length || 0,
        totalReservations: allReservations.length,
        confirmedReservations: allReservations.filter((item) => item.status === 'confirmed').length,
        completedReservations: allReservations.filter((item) => item.status === 'completed').length,
        cancelledReservations: allReservations.filter((item) => item.status === 'cancelled').length,
        pendingReservations: allReservations.filter((item) => item.status === 'pending').length,
      });
    });
  }, [token]);

  const totalPending = useMemo(() => (
    stats.transportPending
    + stats.voyagesPending
    + stats.circuitsPending
    + stats.omraPending
    + stats.flightsPending
    + stats.hotelsPending
    + stats.surMesure
    + stats.contactNew
  ), [stats]);

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumb={[{ label: 'Dashboard', active: true }]}
      badges={{
        transportRequests: stats.transportPending,
        omraPending: stats.omraPending,
        surMesure: stats.surMesure,
        contactNew: stats.contactNew,
        voyagesPending: stats.voyagesPending,
        circuitsPending: stats.circuitsPending,
        flightsPending: stats.flightsPending,
        hotelsPending: stats.hotelsPending,
      }}
    >
      <div style={{ display: 'grid', gap: 22 }}>
        <section
          style={{
            borderRadius: 24,
            padding: '28px 30px',
            color: '#fff',
            background: 'linear-gradient(135deg,#0f4c5c 0%, #1ecad3 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', opacity: 0.78, letterSpacing: '.08em' }}>
              Administration Tictac Voyages
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, margin: '8px 0 10px' }}>
              Tous vos modules, y compris Hotels, au meme endroit
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 720, color: 'rgba(255,255,255,.88)' }}>
              Surveillez les reservations, l'activite client, les promotions et les taches en attente sans quitter le dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/hotels/reservations')}
            style={{
              border: '1px solid rgba(255,255,255,.25)',
              background: totalPending > 0 ? '#E92F64' : 'rgba(255,255,255,.14)',
              color: '#fff',
              borderRadius: 16,
              padding: '16px 18px',
              minWidth: 180,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 900 }}>{totalPending}</div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.92 }}>
              action(s) en attente
            </div>
          </button>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          {[
            {
              label: 'Reservations totales',
              value: stats.totalReservations,
              sub: `${stats.confirmedReservations} confirmees`,
              color: '#0f4c5c',
            },
            {
              label: 'Hotels en ligne',
              value: stats.hotelsTotal,
              sub: `${stats.hotelsPending} reservation(s) hotel en attente`,
              color: '#1ecad3',
            },
            {
              label: 'Clients actifs',
              value: stats.activeClients,
              sub: `${stats.totalClients} comptes au total`,
              color: '#2563eb',
            },
            {
              label: 'Taux de confirmation',
              value: stats.totalReservations ? `${Math.round((stats.confirmedReservations / stats.totalReservations) * 100)}%` : '0%',
              sub: `${stats.completedReservations} terminees | ${stats.cancelledReservations} annulees`,
              color: '#16a34a',
            },
          ].map((card) => (
            <div key={card.label} style={statCardStyle}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginBottom: 14 }}>
                {String(card.value).slice(0, 2)}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.08em' }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginTop: 8 }}>{card.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 1.6 }}>{card.sub}</div>
            </div>
          ))}
        </section>

        <section>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
            Modules
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            {MODULES.map((module) => {
              const primaryValue = module.links[0]?.key ? stats[module.links[0].key] ?? 0 : 0;
              return (
                <div key={module.title} style={statCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{module.title}</div>
                      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{module.description}</div>
                    </div>
                    <div style={{ minWidth: 42, height: 42, borderRadius: 14, background: `${module.color}18`, color: module.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      {primaryValue}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {module.links.map((link) => {
                      const value = link.key ? stats[link.key] ?? 0 : null;
                      return (
                        <button
                          key={link.path}
                          onClick={() => navigate(link.path)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: 14,
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{link.label}</span>
                          {value !== null && (
                            <span
                              style={{
                                minWidth: 30,
                                height: 30,
                                borderRadius: 999,
                                background: link.badge && value > 0 ? '#E92F64' : `${module.color}18`,
                                color: link.badge && value > 0 ? '#fff' : module.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 800,
                                padding: '0 10px',
                              }}
                            >
                              {value}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
