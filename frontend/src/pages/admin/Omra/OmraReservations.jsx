// src/pages/admin/Omra/OmraReservations.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_RES = 'http://localhost:5000/api/omra/reservations';

const STATUS_MAP = {
  pending:   { label: 'En attente', bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  confirmed: { label: 'Confirmée',  bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  cancelled: { label: 'Annulée',    bg: '#fee2e2', color: '#991b1b', dot: '#E92F64' },
  completed: { label: 'Terminée',   bg: '#e0fbfc', color: '#0e7490', dot: '#0e7490' },
};

const PAY_STATUS_MAP = {
  pending:  { label: 'En attente', bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  paid:     { label: 'Payé',       bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  refunded: { label: 'Remboursé',  bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
};

const fDate  = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT    = (d) => d ? new Date(d).toLocaleString('fr-FR')     : '—';
const fPrice = (p) => p ? Number(p).toLocaleString('fr-TN') + ' TND' : '—';

const Badge = ({ s, map }) => {
  const m = map[s] || { label: s, bg: 'var(--g100)', color: 'var(--g600)', dot: 'var(--g400)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }}/>
      {m.label}
    </span>
  );
};

/* ── Detail Panel ───────────────────────────────────────────── */
const ResDetail = ({ res, onClose, onStatusChange }) => {
  if (!res) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, height: '100%', padding: 32, textAlign: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--g300)" strokeWidth="1" style={{ width: 56, height: 56 }}>
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
      </svg>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--g400)', lineHeight: 1.6 }}>Cliquez sur une réservation<br/>pour voir les détails</p>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', paddingBottom: 8, borderBottom: '1px solid var(--g100)' }}>{title}</p>
      {children}
    </div>
  );

  const Item = ({ label, value, full }) => !value ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, gridColumn: full ? '1 / -1' : undefined }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--g700)' }}>{value}</span>
    </div>
  );

  // ── Agency payment: show a warning if still pending ──────────
  const isAgencyPending = res.payment_method === 'agency' && res.status === 'pending';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--g100)', display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--g900)' }}>{res.first_name} {res.last_name}</p>
          <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 3 }}>#{res.id} · {res.package_title || 'Forfait supprimé'}</p>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--g200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Agency pending warning */}
      {isAgencyPending && (
        <div style={{ margin: '12px 20px 0', padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏪</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#c2410c' }}>Paiement à l'agence — En attente</p>
            <p style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>Le client doit se présenter à l'agence. Confirmez après réception du paiement.</p>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <Section title="Contact client">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Item label="Prénom"    value={res.first_name}/>
            <Item label="Nom"       value={res.last_name}/>
            <Item label="Email"     value={res.email} full/>
            <Item label="Téléphone" value={res.phone}/>
            <Item label="Genre"     value={res.gender}/>
            <Item label="Passeport" value={res.passport_number}/>
            {res.has_mahram && <Item label="Mahram" value={res.has_mahram}/>}
          </div>
        </Section>

        <Section title="Voyage">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Item label="Forfait"   value={res.package_title} full/>
            <Item label="Chambre"   value={res.chambre_type}/>
            <Item label="Personnes" value={`${res.number_of_persons} personne${res.number_of_persons > 1 ? 's' : ''}`}/>
            <Item label="Total"     value={fPrice(res.total_price)}/>
          </div>
        </Section>

        <Section title="Paiement">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: res.payment_method === 'online' ? '#eff6ff' : '#fff7ed', color: res.payment_method === 'online' ? '#1d4ed8' : '#c2410c', fontSize: 12, fontWeight: 600 }}>
              {res.payment_method === 'online' ? '💳 Paiement en ligne' : "🏪 Paiement à l'agence"}
            </span>
            <Badge s={res.payment_status} map={PAY_STATUS_MAP}/>
          </div>
        </Section>

        {/* Status change — agency pending shows confirmation prompt */}
        <Section title="Changer le statut">
          {isAgencyPending && (
            <div style={{ padding: '10px 14px', background: '#fff7ed', borderRadius: 8, fontSize: 12, color: '#92400e', marginBottom: 8, lineHeight: 1.5 }}>
              ⚠️ Cette réservation est en attente de paiement à l'agence. Cliquez sur <strong>Confirmée</strong> après avoir reçu le paiement du client.
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(STATUS_MAP).map(([key, meta]) => (
              <button key={key}
                onClick={() => onStatusChange(res.id, key)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${res.status === key ? meta.color : 'var(--g200)'}`, background: res.status === key ? meta.bg : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: res.status === key ? meta.color : 'var(--g600)', transition: 'all .2s' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.dot }}/>
                {meta.label}
              </button>
            ))}
          </div>
        </Section>

        {res.notes && (
          <Section title="Remarques client">
            <p style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.6, background: 'var(--g50)', padding: '10px 14px', borderRadius: 8 }}>{res.notes}</p>
          </Section>
        )}

        <div style={{ padding: '12px 14px', background: 'var(--g50)', borderRadius: 10, fontSize: 11, color: 'var(--g400)' }}>
          <p>Réservée le {fDT(res.created_at)}</p>
          {res.updated_at !== res.created_at && <p style={{ marginTop: 4 }}>Mise à jour le {fDT(res.updated_at)}</p>}
        </div>

      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const OmraReservations = () => {
  const [reservations,  setReservations]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null);
  const [selectedRes,   setSelectedRes]   = useState(null);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search,        setSearch]        = useState('');

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const r = await fetch(API_RES);
      const j = await r.json();
      setReservations(j.data || []);
    } catch { notify('Impossible de charger les réservations', 'error'); }
    finally   { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const r = await fetch(`${API_RES}/${id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      });
      const j = await r.json();
      if (j.success) {
        notify(`Statut mis à jour : ${STATUS_MAP[status]?.label}`);
        fetchReservations();
        if (selectedRes?.id === id) setSelectedRes(p => ({ ...p, status }));
      } else notify('Erreur mise à jour', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = reservations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch  = !search ||
      (r.first_name || '').toLowerCase().includes(q) ||
      (r.last_name  || '').toLowerCase().includes(q) ||
      (r.email      || '').toLowerCase().includes(q);
    const matchStatus  = filterStatus  === 'all' || r.status         === filterStatus;
    const matchPayment = filterPayment === 'all' || r.payment_method === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  const stats = {
    total:     reservations.length,
    pending:   reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    online:    reservations.filter(r => r.payment_method === 'online').length,
    agency:    reservations.filter(r => r.payment_method === 'agency').length,
    // agency pending = waiting for payment at agency
    agencyPending: reservations.filter(r => r.payment_method === 'agency' && r.status === 'pending').length,
  };

  return (
    <AdminLayout
      title="Réservations Omra"
      breadcrumb={[{ label: 'Omra' }, { label: 'Réservations', active: true }]}
      actions={
        <button className="al-btn al-btn--ghost" onClick={fetchReservations}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Actualiser
        </button>
      }
      toast={toast}
    >

      {/* Stats */}
      <div className="al-stats">
        {[
          { label: 'Total',                  value: stats.total,        color: 'blue',
            icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
          { label: 'En attente',             value: stats.pending,      color: 'orange',
            icon: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
          { label: 'Confirmées',             value: stats.confirmed,    color: 'green',
            icon: <><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></> },
          { label: '💳 Paiement en ligne',   value: stats.online,       color: 'indigo',
            icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></> },
          { label: "🏪 À l'agence",          value: stats.agency,       color: 'teal',
            icon: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg>
            </div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Agency pending alert banner */}
      {stats.agencyPending > 0 && (
        <div style={{ margin: '0 32px 16px', padding: '14px 20px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#c2410c' }}>
              {stats.agencyPending} réservation{stats.agencyPending > 1 ? 's' : ''} en attente de paiement à l'agence
            </p>
            <p style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
              Ces clients ont choisi de payer en agence. Confirmez leur réservation après réception du paiement.
            </p>
          </div>
        </div>
      )}

      {/* Table + Detail layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedRes ? '1fr 380px' : '1fr', gap: 0, margin: '0 0 32px', transition: 'grid-template-columns .3s' }}>

        {/* Table */}
        <div style={{ margin: '0 0 0 32px', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Toolbar */}
          <div className="al-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)}/>
              {search && (
                <button className="al-search__clear" onClick={() => setSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            {/* Payment filter */}
            <div className="al-filter-tabs">
              {[
                { v: 'all',    l: 'Tous les paiements' },
                { v: 'online', l: '💳 En ligne' },
                { v: 'agency', l: '🏪 Agence' },
              ].map(({ v, l }) => (
                <button key={v} className={`al-filter-tab ${filterPayment === v ? 'active' : ''}`} onClick={() => setFilterPayment(v)}>
                  {l}
                  <span className="al-filter-tab__count">
                    {v === 'all' ? reservations.length : reservations.filter(r => r.payment_method === v).length}
                  </span>
                </button>
              ))}
            </div>
            {/* Status filter */}
            <div className="al-filter-tabs">
              {[
                { v: 'all',       l: 'Tous' },
                { v: 'pending',   l: '⏳ Attente' },
                { v: 'confirmed', l: '✅ Confirmées' },
                { v: 'completed', l: '🏁 Terminées' },
                { v: 'cancelled', l: '❌ Annulées' },
              ].map(({ v, l }) => (
                <button key={v} className={`al-filter-tab ${filterStatus === v ? 'active' : ''}`} onClick={() => setFilterStatus(v)}>
                  {l}
                  <span className="al-filter-tab__count">
                    {v === 'all' ? reservations.length : reservations.filter(r => r.status === v).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner"/></div>
              <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <p className="al-empty__title">Aucune réservation</p>
              <p className="al-empty__sub">Modifiez vos filtres ou attendez de nouvelles réservations.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Forfait</th>
                    <th>Pers. / Chambre</th>
                    <th>Total</th>
                    <th>Paiement</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Action rapide</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const isSel = selectedRes?.id === r.id;
                    const isAgencyPending = r.payment_method === 'agency' && r.status === 'pending';
                    return (
                      <tr key={r.id} className="al-row"
                        style={{ cursor: 'pointer', background: isSel ? '#e0fbfc' : isAgencyPending ? '#fffbf5' : undefined }}
                        onClick={() => setSelectedRes(isSel ? null : r)}>

                        {/* Client */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff' }}>
                              {(r.first_name?.[0] || '?').toUpperCase()}{(r.last_name?.[0] || '').toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--g800)' }}>{r.first_name} {r.last_name}</p>
                              <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{r.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Forfait */}
                        <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)' }}>{r.package_title || '—'}</span></td>

                        {/* Personnes / chambre */}
                        <td>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>{r.number_of_persons} pers.</p>
                          <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2, textTransform: 'capitalize' }}>{r.chambre_type}</p>
                        </td>

                        {/* Total */}
                        <td><span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{fPrice(r.total_price)}</span></td>

                        {/* Paiement */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: r.payment_method === 'online' ? '#eff6ff' : '#fff7ed', color: r.payment_method === 'online' ? '#1d4ed8' : '#c2410c', fontSize: 11, fontWeight: 600 }}>
                              {r.payment_method === 'online' ? '💳 En ligne' : '🏪 Agence'}
                            </span>
                            <Badge s={r.payment_status} map={PAY_STATUS_MAP}/>
                          </div>
                        </td>

                        {/* Statut */}
                        <td><Badge s={r.status} map={STATUS_MAP}/></td>

                        {/* Date */}
                        <td><span style={{ fontSize: 12, color: 'var(--g500)' }}>{fDate(r.created_at)}</span></td>

                        {/* Action rapide — confirm agency pending */}
                        <td onClick={e => e.stopPropagation()}>
                          {isAgencyPending ? (
                            <button
                              onClick={() => handleStatusChange(r.id, 'confirmed')}
                              style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #10b981', background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                              ✅ Confirmer
                            </button>
                          ) : (
                            <select
                              value={r.status}
                              onChange={e => handleStatusChange(r.id, e.target.value)}
                              style={{ padding: '5px 8px', borderRadius: 7, border: '1.5px solid var(--g200)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: '#fff', outline: 'none' }}>
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmer</option>
                              <option value="completed">Terminer</option>
                              <option value="cancelled">Annuler</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="al-table-footer">
            <p className="al-count">
              {filtered.length} réservation{filtered.length !== 1 ? 's' : ''}
              {(search || filterStatus !== 'all' || filterPayment !== 'all') ? ` sur ${reservations.length} au total` : ''}
            </p>
          </div>
        </div>

        {/* Detail panel */}
        {selectedRes && (
          <div style={{ margin: '0 32px 0 16px', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ResDetail
              res={selectedRes}
              onClose={() => setSelectedRes(null)}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

      </div>

      {!selectedRes && !loading && filtered.length > 0 && (
        <div style={{ margin: '-20px 32px 0', padding: '14px 20px', borderRadius: 12, background: 'var(--g50)', border: '1px dashed var(--g200)', textAlign: 'center', fontSize: 13, color: 'var(--g400)' }}>
          👆 Cliquez sur une ligne pour voir les détails de la réservation
        </div>
      )}

    </AdminLayout>
  );
};

export default OmraReservations;