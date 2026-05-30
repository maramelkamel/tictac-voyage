// src/pages/admin/Omra/OmraReservations.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';
import './omraadmin.css';

// Reservation API used for listing reservations and updating their statuses.
const API_RES = 'http://localhost:5000/api/omra/reservations';

// Central status metadata so table badges and status buttons stay visually consistent.
const STATUS_MAP = {
  pending: { label: 'En attente', bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  confirmed: { label: 'Confirmée', bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  cancelled: { label: 'Annulée', bg: '#fee2e2', color: '#991b1b', dot: '#E92F64' },
  completed: { label: 'Terminée', bg: '#e0fbfc', color: '#0e7490', dot: '#0e7490' }
};

// Formatting helpers keep all dates and amounts readable for the admin user.
const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fDT = (d) => d ? new Date(d).toLocaleString('fr-FR') : '—';
const fPrice = (p) => p ? Number(p).toLocaleString('fr-TN') + ' TND' : '—';

// Compact reservation status pill used in the table rows.
const StatusBadge = ({ s }) => {
  const m = STATUS_MAP[s] || { label: s, bg: 'var(--g100)', color: 'var(--g600)', dot: 'var(--g400)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>);

};

// Shows the payment method and marks reservations already completed as paid.
const PaymentCell = ({ method, status }) =>
<div className="omra-admin-087">
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: method === 'online' ? '#eff6ff' : '#fff7ed', color: method === 'online' ? '#1d4ed8' : '#c2410c' }}>
      {method === 'online' ? '💳 En ligne' : '🏪 Agence'}
    </span>
    {status === 'completed' &&
  <span className="omra-admin-088">✓ Payé</span>
  }
  </div>;


/* ══════════════════════════════════════════════════════════════
   DETAIL PANEL
   ══════════════════════════════════════════════════════════════ */
const ResDetail = ({ res, onClose, onStatusChange, isMain }) => {
  if (!res) return (
    <div className="omra-admin-089">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--g300)" strokeWidth="1" className="omra-admin-090">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
      <p className="omra-admin-091">Cliquez sur une réservation<br />pour voir les détails</p>
    </div>);


  // Detail sections group related reservation fields in the side panel.
  const Section = ({ title, children }) =>
  <div className="omra-admin-092">
      <p className="omra-admin-093">{title}</p>
      {children}
    </div>;


  // Detail items hide empty values to keep the panel clean.
  const Item = ({ label, value, full }) => !value ? null :
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, gridColumn: full ? '1 / -1' : undefined }}>
      <span className="omra-admin-094">{label}</span>
      <span className="omra-admin-095">{value}</span>
    </div>;


  const isAgencyPending = res.payment_method === 'agency' && res.status === 'pending';

  return (
    <div className="omra-admin-096">
      <div className="omra-admin-097">
        <div className="omra-admin-098">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" className="omra-admin-099">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
        </div>
        <div className="omra-admin-100">
          <p className="omra-admin-101">{res.first_name} {res.last_name}</p>
          <p className="omra-admin-102">#{res.id} · {res.package_title || 'Forfait supprimé'}</p>
        </div>
        <button onClick={onClose} className="omra-admin-103">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2" className="omra-admin-104"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {isAgencyPending &&
      <div className="omra-admin-105">
          <span className="omra-admin-106">🏪</span>
          <div>
            <p className="omra-admin-107">Paiement à l'agence — En attente</p>
            <p className="omra-admin-108">Le client doit se présenter à l'agence. Confirmez après réception du paiement.</p>
          </div>
        </div>
      }

      <div className="omra-admin-109">
        <Section title="Contact client">
          <div className="omra-admin-110">
            <Item label="Prénom" value={res.first_name} />
            <Item label="Nom" value={res.last_name} />
            <Item label="Email" value={res.email} full />
            <Item label="Téléphone" value={res.phone} />
            <Item label="Genre" value={res.gender} />
            <Item label="Passeport" value={res.passport_number} />
            {res.has_mahram && <Item label="Mahram" value={res.has_mahram} />}
          </div>
        </Section>

        <Section title="Voyage">
          <div className="omra-admin-110">
            <Item label="Forfait" value={res.package_title} full />
            <Item label="Chambre" value={res.chambre_type} />
            <Item label="Personnes" value={`${res.number_of_persons} personne${res.number_of_persons > 1 ? 's' : ''}`} />
            <Item label="Total" value={fPrice(res.total_price)} />
          </div>
        </Section>

        <Section title="Paiement">
          <div className="omra-admin-111">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: res.payment_method === 'online' ? '#eff6ff' : '#fff7ed', color: res.payment_method === 'online' ? '#1d4ed8' : '#c2410c', fontSize: 12, fontWeight: 600 }}>
              {res.payment_method === 'online' ? '💳 Paiement en ligne' : "🏪 Paiement à l'agence"}
            </span>
            {res.status === 'completed' &&
            <span className="omra-admin-112">✓ Payé</span>
            }
          </div>
        </Section>

        {/* ── Changer le statut ── */}
        <Section title="Changer le statut">
          {isAgencyPending &&
          <div className="omra-admin-113">
              ⚠️ Cette réservation est en attente de paiement à l'agence. Cliquez sur <strong>Confirmée</strong> après avoir reçu le paiement du client.
            </div>
          }
          {!isMain &&
          <div className="omra-admin-114">
              🔒 L'annulation est réservée à l'administrateur principal.
            </div>
          }
          <div className="omra-admin-060">
            {Object.entries(STATUS_MAP).map(([key, meta]) => {
              const isCancel = key === 'cancelled';
              const blocked = isCancel && !isMain;
              return (
                <button key={key}
                onClick={() => onStatusChange(res.id, key)}
                title={blocked ? 'Réservé à l\'administrateur principal' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 14px', borderRadius: 8,
                  border: `1.5px solid ${res.status === key ? meta.color : 'var(--g200)'}`,
                  background: res.status === key ? meta.bg : '#fff',
                  fontSize: 12, fontWeight: 600,
                  cursor: blocked ? 'not-allowed' : 'pointer',
                  opacity: blocked ? 0.4 : 1,
                  fontFamily: 'inherit',
                  color: res.status === key ? meta.color : 'var(--g600)',
                  transition: 'all .2s'
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.dot }} />
                  {meta.label} {blocked && '🔒'}
                </button>);

            })}
          </div>
        </Section>

        {res.notes &&
        <Section title="Remarques client">
            <p className="omra-admin-115">{res.notes}</p>
          </Section>
        }

        <div className="omra-admin-116">
          <p>Réservée le {fDT(res.created_at)}</p>
          {res.updated_at !== res.created_at && <p className="omra-admin-117">Mise à jour le {fDT(res.updated_at)}</p>}
        </div>
      </div>
    </div>);

};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const OmraReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedRes, setSelectedRes] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search, setSearch] = useState('');

  // ── Role check ────────────────────────────────────────────────
  const isMain = (() => {
    try {return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main';}
    catch {return false;}
  })();

  // Toast helper shared by loading, filtering, and status update actions.
  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Loads reservations from the backend and refreshes the table state.
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const r = await fetch(API_RES);
      const j = await r.json();
      setReservations(j.data || []);
    } catch {notify('Impossible de charger les réservations', 'error');} finally
    {setLoading(false);}
  };

  useEffect(() => {fetchReservations();}, []);

  // ── Status change guarded for cancel ──────────────────────────
  const handleStatusChange = async (id, status) => {
    if (status === 'cancelled' && !isMain) {
      notify('❌ Seul l\'administrateur principal peut annuler une réservation', 'error');
      return;
    }
    try {
      const r = await fetch(`${API_RES}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const j = await r.json();
      if (j.success) {
        notify(`Statut mis à jour : ${STATUS_MAP[status]?.label}`);
        fetchReservations();
        if (selectedRes?.id === id) setSelectedRes((p) => ({ ...p, status }));
      } else notify('Erreur mise à jour', 'error');
    } catch {notify('Erreur réseau', 'error');}
  };

  // Applies search text, reservation status, and payment method filters together.
  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !search || (r.first_name || '').toLowerCase().includes(q) || (r.last_name || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchPayment = filterPayment === 'all' || r.payment_method === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  // Summary cards are derived from the raw reservation list, before filters.
  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    online: reservations.filter((r) => r.payment_method === 'online').length,
    agency: reservations.filter((r) => r.payment_method === 'agency').length,
    agencyPending: reservations.filter((r) => r.payment_method === 'agency' && r.status === 'pending').length
  };

  return (
    <AdminLayout
      title="Réservations Omra"
      breadcrumb={[{ label: 'Omra' }, { label: 'Réservations', active: true }]}
      actions={
      <button className="al-btn al-btn--ghost" onClick={fetchReservations}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
          Actualiser
        </button>
      }
      toast={toast}>
      
      <div className="al-stats">
        {[
        { label: 'Total', value: stats.total, color: 'blue',
          icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></> },
        { label: 'En attente', value: stats.pending, color: 'orange',
          icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></> },
        { label: 'Confirmées', value: stats.confirmed, color: 'green',
          icon: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></> },
        { label: '💳 Paiement en ligne', value: stats.online, color: 'indigo',
          icon: <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></> },
        { label: "🏪 À l'agence", value: stats.agency, color: 'teal',
          icon: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> }].
        map((s) =>
        <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        )}
      </div>

      {stats.agencyPending > 0 &&
      <div className="omra-admin-118">
          <span className="omra-admin-119">🏪</span>
          <div>
            <p className="omra-admin-120">
              {stats.agencyPending} réservation{stats.agencyPending > 1 ? 's' : ''} en attente de paiement à l'agence
            </p>
            <p className="omra-admin-121">Ces clients ont choisi de payer en agence. Confirmez leur réservation après réception du paiement.</p>
          </div>
        </div>
      }

      <div style={{ display: 'grid', gridTemplateColumns: selectedRes ? '1fr 380px' : '1fr', gap: 0, margin: '0 0 32px', transition: 'grid-template-columns .3s' }}>
        <div className="omra-admin-122">

          <div className="al-toolbar omra-admin-123">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="text" placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search &&
              <button className="al-search__clear" onClick={() => setSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              }
            </div>
            <div className="al-filter-tabs">
              {[{ v: 'all', l: 'Tous les paiements' }, { v: 'online', l: '💳 En ligne' }, { v: 'agency', l: '🏪 Agence' }].map(({ v, l }) =>
              <button key={v} className={`al-filter-tab ${filterPayment === v ? 'active' : ''}`} onClick={() => setFilterPayment(v)}>
                  {l}<span className="al-filter-tab__count">{v === 'all' ? reservations.length : reservations.filter((r) => r.payment_method === v).length}</span>
                </button>
              )}
            </div>
            <div className="al-filter-tabs">
              {[{ v: 'all', l: 'Tous' }, { v: 'pending', l: '⏳ Attente' }, { v: 'confirmed', l: '✅ Confirmées' }, { v: 'completed', l: '🏁 Terminées' }, { v: 'cancelled', l: '❌ Annulées' }].map(({ v, l }) =>
              <button key={v} className={`al-filter-tab ${filterStatus === v ? 'active' : ''}`} onClick={() => setFilterStatus(v)}>
                  {l}<span className="al-filter-tab__count">{v === 'all' ? reservations.length : reservations.filter((r) => r.status === v).length}</span>
                </button>
              )}
            </div>
          </div>

          {loading ?
          <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner" /></div><p className="omra-admin-074">Chargement...</p></div> :
          filtered.length === 0 ?
          <div className="al-empty">
              <div className="al-empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg></div>
              <p className="al-empty__title">Aucune réservation</p>
              <p className="al-empty__sub">Modifiez vos filtres ou attendez de nouvelles réservations.</p>
            </div> :

          <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Client</th><th>Forfait</th><th>Pers. / Chambre</th>
                    <th>Total</th><th>Paiement</th><th>Statut</th><th>Date</th><th>Action rapide</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                  const isSel = selectedRes?.id === r.id;
                  const isAgencyPending = r.payment_method === 'agency' && r.status === 'pending';
                  return (
                    <tr key={r.id} className="al-row"
                    style={{ cursor: 'pointer', background: isSel ? '#e0fbfc' : isAgencyPending ? '#fffbf5' : undefined }}
                    onClick={() => setSelectedRes(isSel ? null : r)}>
                        <td>
                          <div className="omra-admin-076">
                            <div className="omra-admin-124">
                              {(r.first_name?.[0] || '?').toUpperCase()}{(r.last_name?.[0] || '').toUpperCase()}
                            </div>
                            <div>
                              <p className="omra-admin-125">{r.first_name} {r.last_name}</p>
                              <p className="omra-admin-126">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="omra-admin-127">{r.package_title || '—'}</span></td>
                        <td>
                          <p className="omra-admin-128">{r.number_of_persons} pers.</p>
                          <p className="omra-admin-129">{r.chambre_type}</p>
                        </td>
                        <td><span className="omra-admin-130">{fPrice(r.total_price)}</span></td>
                        <td><PaymentCell method={r.payment_method} status={r.status} /></td>
                        <td><StatusBadge s={r.status} /></td>
                        <td><span className="omra-admin-037">{fDate(r.created_at)}</span></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="omra-admin-131">
                            {isAgencyPending &&
                          <button onClick={() => handleStatusChange(r.id, 'confirmed')} className="omra-admin-132">
                            
                                ✅ Confirmer
                              </button>
                          }
                            {/* ── Status select: cancelled disabled for non-main ── */}
                            <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} className="omra-admin-133">
                            
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmer</option>
                              <option value="completed">Terminer</option>
                              <option value="cancelled" disabled={!isMain} style={{ color: !isMain ? '#ccc' : undefined }}>
                                {isMain ? 'Annuler' : 'Annuler 🔒'}
                              </option>
                            </select>
                          </div>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </div>
          }

          <div className="al-table-footer">
            <p className="al-count">
              {filtered.length} réservation{filtered.length !== 1 ? 's' : ''}
              {search || filterStatus !== 'all' || filterPayment !== 'all' ? ` sur ${reservations.length} au total` : ''}
            </p>
          </div>
        </div>

        {selectedRes &&
        <div className="omra-admin-134">
            <ResDetail
            res={selectedRes}
            onClose={() => setSelectedRes(null)}
            onStatusChange={handleStatusChange}
            isMain={isMain} />
          
          </div>
        }
      </div>

      {!selectedRes && !loading && filtered.length > 0 &&
      <div className="omra-admin-135">
          👆 Cliquez sur une ligne pour voir les détails de la réservation
        </div>
      }
    </AdminLayout>);

};

export default OmraReservations;
