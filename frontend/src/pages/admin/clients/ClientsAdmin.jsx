// src/pages/admin/clients/ClientsAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_CLIENTS = 'http://localhost:5000/api/clients';
const API_OMRA    = 'http://localhost:5000/api/omra/reservations';
const API_TRANS   = 'http://localhost:5000/api/requests';
const API_CUSTOM  = 'http://localhost:5000/api/custom-trips';

const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT   = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';

// ── Avatar initials ──────────────────────────────────────────────
const Avatar = ({ first, last }) => {
  const initials = `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
  const colors   = ['#0F4C5C','#1ECAD3','#e92f64','#8b5cf6','#f97316','#10b981'];
  const color    = colors[(first?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ width: 38, height: 38, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>
      {initials || '?'}
    </div>
  );
};

// ── Booking type badge ───────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const map = {
    omra:      { label: '🕌 Omra',         bg: '#f5f3ff', color: '#7c3aed' },
    transport: { label: '🚌 Transport',     bg: '#e0fbfc', color: '#0e7490' },
    custom:    { label: '✈️ Sur Mesure',    bg: '#fff7ed', color: '#c2410c' },
  };
  const m = map[type] || { label: type, bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
};

// ── Status badge ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   { label: 'En attente', bg: '#fff7ed', color: '#c2410c' },
    confirmed: { label: 'Confirmé',   bg: '#d1fae5', color: '#065f46' },
    completed: { label: 'Terminé',    bg: '#e0fbfc', color: '#0e7490' },
    cancelled: { label: 'Annulé',     bg: '#fee2e2', color: '#991b1b' },
    paid:      { label: 'Payé',       bg: '#d1fae5', color: '#065f46' },
  };
  const m = map[status] || { label: status, bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
};

// ── Detail panel ─────────────────────────────────────────────────
const DetailPanel = ({ client, bookings, onClose }) => {
  if (!client) return null;

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', paddingBottom: 8, borderBottom: '1px solid var(--g100)', marginBottom: 12 }}>{title}</p>
      {children}
    </div>
  );

  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.total_price || b.totalPrix || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--g100)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <Avatar first={client.first_name} last={client.last_name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--g900)' }}>{client.first_name} {client.last_name}</p>
          <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>{client.email}</p>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--g200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Réservations', value: bookings.length, color: '#0F4C5C' },
            { label: 'Total dépensé', value: `${totalSpent.toLocaleString('fr-TN')} TND`, color: '#e92f64' },
            { label: 'Membre depuis', value: fDate(client.created_at), color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--g50)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--g100)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Infos personnelles */}
        <Section title="Informations personnelles">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Prénom',       value: client.first_name },
              { label: 'Nom',          value: client.last_name },
              { label: 'Téléphone',    value: client.phone },
              { label: 'Ville',        value: client.city || '—' },
              { label: 'Situation',    value: client.marital_status || '—' },
              { label: 'Enfants',      value: client.number_of_children ?? '—' },
            ].map((item, i) => (
              <div key={i}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--g700)', marginTop: 2 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Historique réservations */}
        <Section title={`Historique des réservations (${bookings.length})`}>
          {bookings.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--g400)', textAlign: 'center', padding: '20px 0' }}>Aucune réservation trouvée.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.map((b, i) => (
                <div key={i} style={{ background: 'var(--g50)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--g100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <TypeBadge type={b._type} />
                    <StatusBadge status={b.status} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)', marginBottom: 3 }}>{b._label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 11, color: 'var(--g400)' }}>{fDT(b.created_at)}</p>
                    {b.total_price && (
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F4C5C' }}>{Number(b.total_price).toLocaleString('fr-TN')} TND</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
const ClientsAdmin = () => {
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [search,   setSearch]   = useState('');

  // All reservations from all sources
  const [allOmra,    setAllOmra]    = useState([]);
  const [allTrans,   setAllTrans]   = useState([]);
  const [allCustom,  setAllCustom]  = useState([]);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch everything on mount ──────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(API_CLIENTS).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(API_OMRA).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(API_TRANS).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(API_CUSTOM).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([c, o, t, ct]) => {
      setClients(c.data  || []);
      setAllOmra(o.data  || []);
      setAllTrans(t.data || []);
      setAllCustom(ct.data || []);
      setLoading(false);
    }).catch(() => {
      notify('Erreur lors du chargement', 'error');
      setLoading(false);
    });
  }, []);

  // ── Get bookings for a specific client by email ───────────────
  const getClientBookings = (client) => {
    const email = (client.email || '').toLowerCase();

    const omraBooks = allOmra
      .filter(b => (b.email || '').toLowerCase() === email)
      .map(b => ({
        ...b,
        _type:  'omra',
        _label: b.package_id ? `Omra — Forfait #${b.package_id}` : 'Omra',
      }));

    const transBooks = allTrans
      .filter(b => (b.email || '').toLowerCase() === email)
      .map(b => ({
        ...b,
        _type:  'transport',
        _label: `${b.departure_location || '—'} → ${b.arrival_location || '—'}`,
        total_price: null,
      }));

    const customBooks = allCustom
      .filter(b => (b.email || '').toLowerCase() === email)
      .map(b => ({
        ...b,
        _type:  'custom',
        _label: `Voyage sur mesure — ${b.destination || '—'}`,
        total_price: b.max_budget || null,
      }));

    return [...omraBooks, ...transBooks, ...customBooks]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // ── Select a client ───────────────────────────────────────────
  const handleSelect = (client) => {
    if (selected?.id === client.id) {
      setSelected(null);
      setBookings([]);
    } else {
      setSelected(client);
      setBookings(getClientBookings(client));
    }
  };

  // ── Filter clients ────────────────────────────────────────────
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.first_name || '').toLowerCase().includes(q) ||
      (c.last_name  || '').toLowerCase().includes(q) ||
      (c.email      || '').toLowerCase().includes(q) ||
      (c.phone      || '').toLowerCase().includes(q) ||
      (c.city       || '').toLowerCase().includes(q)
    );
  });

  // ── Stats ─────────────────────────────────────────────────────
  const oneYearAgo = new Date(Date.now() - 365 * 86400000);

  const stats = {
    total:      clients.length,
    newClients: clients.filter(c => new Date(c.created_at) > oneYearAgo).length,
    level1:     clients.filter(c => getClientBookings(c).length === 1).length,
    level2:     clients.filter(c => { const n = getClientBookings(c).length; return n >= 2 && n <= 3; }).length,
    level3:     clients.filter(c => getClientBookings(c).length >= 4).length,
  };

  return (
    <AdminLayout
      title="Clients"
      breadcrumb={[{ label: 'Clients', active: true }]}
      actions={
        <button className="al-btn al-btn--ghost" onClick={() => window.location.reload()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Actualiser
        </button>
      }
      toast={toast}
    >

      {/* Stats */}
      <div className="al-stats">
        {[
          { label: 'Total clients', value: stats.total,    color: 'blue',
            icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
            sub: null },
          { label: 'Nouveaux', value: stats.newClients, color: 'green',
            icon: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11v6M19 14h6"/></>,
            sub: '< 1 an' },
          { label: 'Niveau 1 ⭐', value: stats.level1, color: 'teal',
            icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
            sub: '1 réservation' },
          { label: 'Niveau 2 ⭐⭐', value: stats.level2, color: 'orange',
            icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
            sub: '2-3 réservations' },
          { label: 'Niveau 3 ⭐⭐⭐', value: stats.level3, color: 'red',
            icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
            sub: '4+ réservations' },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg>
            </div>
            <div>
              <p className="al-stat__value">{s.value}</p>
              <p className="al-stat__label">{s.label}</p>
              {s.sub && <p style={{ fontSize: 10, color: 'var(--g400)', marginTop: 2 }}>{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Table + Detail layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 0, margin: '0 0 32px', transition: 'grid-template-columns .3s' }}>

        {/* Table */}
        <div style={{ margin: '0 0 0 32px', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Toolbar */}
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Rechercher par nom, email, ville..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button className="al-search__clear" onClick={() => setSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner"/></div>
              <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement des clients...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <p className="al-empty__title">Aucun client trouvé</p>
              <p className="al-empty__sub">Modifiez votre recherche.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Téléphone</th>
                    <th>Ville</th>
                    <th>Membre depuis</th>
                    <th>Réservations</th>
                    <th>Types</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(client => {
                    const clientBooks  = getClientBookings(client);
                    const omraCount    = clientBooks.filter(b => b._type === 'omra').length;
                    const transCount   = clientBooks.filter(b => b._type === 'transport').length;
                    const customCount  = clientBooks.filter(b => b._type === 'custom').length;
                    const isSelected   = selected?.id === client.id;

                    return (
                      <tr key={client.id}
                        className="al-row"
                        style={{ cursor: 'pointer', background: isSelected ? '#e0fbfc' : undefined }}
                        onClick={() => handleSelect(client)}>

                        {/* Client */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <Avatar first={client.first_name} last={client.last_name} />
                            <div>
                              <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>
                                {client.first_name} {client.last_name}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{client.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={{ fontSize: 13, color: 'var(--g600)' }}>{client.phone || '—'}</td>

                        {/* City */}
                        <td style={{ fontSize: 13, color: 'var(--g600)' }}>{client.city || '—'}</td>

                        {/* Member since */}
                        <td>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)' }}>{fDate(client.created_at)}</p>
                          <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>
                            {Math.floor((Date.now() - new Date(client.created_at)) / 86400000)} jours
                          </p>
                        </td>

                        {/* Total bookings */}
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: clientBooks.length > 0 ? 'rgba(15,76,92,.1)' : 'var(--g100)', color: clientBooks.length > 0 ? 'var(--primary)' : 'var(--g400)', fontWeight: 700, fontSize: 13 }}>
                            {clientBooks.length}
                          </span>
                        </td>

                        {/* Types */}
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {omraCount   > 0 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: '#f5f3ff', color: '#7c3aed', fontWeight: 600 }}>🕌 ×{omraCount}</span>}
                            {transCount  > 0 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: '#e0fbfc', color: '#0e7490', fontWeight: 600 }}>🚌 ×{transCount}</span>}
                            {customCount > 0 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontWeight: 600 }}>✈️ ×{customCount}</span>}
                            {clientBooks.length === 0 && <span style={{ fontSize: 11, color: 'var(--g300)' }}>Aucune</span>}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="al-table-footer">
            <p className="al-count">{filtered.length} client{filtered.length !== 1 ? 's' : ''}{search ? ` sur ${clients.length} au total` : ''}</p>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ margin: '0 32px 0 16px', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <DetailPanel
              client={selected}
              bookings={bookings}
              onClose={() => { setSelected(null); setBookings([]); }}
            />
          </div>
        )}

      </div>

      {/* Hint */}
      {!selected && !loading && filtered.length > 0 && (
        <div style={{ margin: '-20px 32px 0', padding: '14px 20px', borderRadius: 12, background: 'var(--g50)', border: '1px dashed var(--g200)', textAlign: 'center', fontSize: 13, color: 'var(--g400)' }}>
          👆 Cliquez sur un client pour voir son profil et son historique de réservations
        </div>
      )}

    </AdminLayout>
  );
};

export default ClientsAdmin;