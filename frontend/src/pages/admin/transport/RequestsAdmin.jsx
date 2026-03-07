// src/pages/admin/transport/RequestsAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API = 'http://localhost:5000/api/requests';

const STATUS_META = {
  pending:   { label: 'En attente', cls: 'b--orange', dot: 'dot--orange' },
  confirmed: { label: 'Confirmée',  cls: 'b--green',  dot: 'dot--green'  },
  cancelled: { label: 'Annulée',    cls: 'b--red',    dot: 'dot--red'    },
  completed: { label: 'Terminée',   cls: 'b--teal',   dot: 'dot--teal'   },
};

const VEHICLE_META = {
  voiture: { label: 'Voiture', cls: 'b--teal'   },
  minibus: { label: 'Minibus', cls: 'b--indigo' },
  bus:     { label: 'Bus',     cls: 'b--violet' },
};

const RequestsAdmin = () => {
  const [requests, setRequests]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [toast, setToast]                     = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus]       = useState('all');
  const [search, setSearch]                   = useState('');

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res  = await fetch(API);
      const json = await res.json();
      setRequests(json.data || []);
    } catch {
      notify('Impossible de charger les demandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res  = await fetch(`${API}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Statut : ${STATUS_META[status]?.label}`);
        fetchRequests();
        if (selectedRequest?.id === id) setSelectedRequest(p => ({ ...p, status }));
      } else {
        notify('Erreur mise à jour', 'error');
      }
    } catch { notify('Erreur réseau', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Demande supprimée');
        fetchRequests();
        if (selectedRequest?.id === id) setSelectedRequest(null);
      } else {
        notify('Erreur suppression', 'error');
      }
    } catch { notify('Erreur réseau', 'error'); }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.full_name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.departure_location || '').toLowerCase().includes(q) ||
      (r.arrival_location || '').toLowerCase().includes(q);
    return matchSearch && (filterStatus === 'all' || r.status === filterStatus);
  });

  const stats = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'pending').length,
    confirmed: requests.filter(r => r.status === 'confirmed').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  const fDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
  const fDT   = (d) => d ? new Date(d).toLocaleString('fr-FR') : '—';

  return (
    <AdminLayout
      title="Demandes Clients"
      breadcrumb={[{ label: 'Transport' }, { label: 'Demandes', active: true }]}
      actions={
        <button className="al-btn al-btn--ghost" onClick={fetchRequests}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Actualiser
        </button>
      }
      toast={toast}
      badges={{ transportRequests: stats.pending }}
    >
      {/* Stats */}
      <div className="al-stats">
        {[
          { label: 'Total',      value: stats.total,     color: 'blue',   key: 'all'       },
          { label: 'En attente', value: stats.pending,   color: 'orange', key: 'pending'   },
          { label: 'Confirmées', value: stats.confirmed, color: 'green',  key: 'confirmed' },
          { label: 'Terminées',  value: stats.completed, color: 'teal',   key: 'completed' },
          { label: 'Annulées',   value: stats.cancelled, color: 'red',    key: 'cancelled' },
        ].map((s) => (
          <div key={s.label}
            className={`al-stat al-stat--${s.color}`}
            onClick={() => setFilterStatus(s.key)}
            style={{ cursor: 'pointer', outline: filterStatus === s.key ? '2px solid var(--secondary)' : 'none', outlineOffset: 2 }}
          >
            <div className="al-stat__icon">
              {s.key === 'all'       && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>}
              {s.key === 'pending'   && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
              {s.key === 'confirmed' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>}
              {s.key === 'completed' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>}
              {s.key === 'cancelled' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>}
            </div>
            <div>
              <p className="al-stat__value">{s.value}</p>
              <p className="al-stat__label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout table + détail */}
      <div className="rq-layout">

        {/* Table */}
        <div className="al-card rq-card-table">
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Rechercher client, lieu..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button className="al-search__clear" onClick={() => setSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            <div className="al-filter-tabs">
              {[
                { value: 'all',       label: 'Tous'         },
                { value: 'pending',   label: '⏳ Attente'   },
                { value: 'confirmed', label: '✅ Confirmés'  },
                { value: 'completed', label: '🏁 Terminés'  },
                { value: 'cancelled', label: '❌ Annulés'   },
              ].map(({ value, label }) => (
                <button key={value}
                  className={`al-filter-tab ${filterStatus === value ? 'active' : ''}`}
                  onClick={() => setFilterStatus(value)}>
                  {label}
                  <span className="al-filter-tab__count">
                    {value === 'all' ? requests.length : requests.filter(r => r.status === value).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner"/></div>
              <p>Chargement des demandes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <p className="al-empty__title">Aucune demande trouvée</p>
              <p className="al-empty__sub">Modifiez vos filtres ou attendez de nouvelles demandes.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Véhicule</th>
                    <th>Départ</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const sm = STATUS_META[r.status]       || { label: r.status,       cls: 'b--gray',  dot: 'dot--gray' };
                    const vm = VEHICLE_META[r.vehicle_type] || { label: r.vehicle_type, cls: 'b--gray' };
                    return (
                      <tr key={r.id}
                        className={`al-row ${selectedRequest?.id === r.id ? 'al-row--selected' : ''}`}
                        onClick={() => setSelectedRequest(r)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div className="rq-client-cell">
                            <div className="rq-avatar">{(r.full_name || '?').charAt(0).toUpperCase()}</div>
                            <div>
                              <p style={{ fontWeight: 600, color: 'var(--g800)', fontSize: 13 }}>{r.full_name}</p>
                              <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--g600)' }}>
                            {r.service_type === 'transfert' ? '🚗 Transfert' : '⏱ Mise à dispo'}
                          </span>
                        </td>
                        <td>
                          <span className={`al-badge-pill ${vm.cls}`}>{vm.label}</span>
                        </td>
                        <td>
                          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--g700)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.departure_location}
                          </p>
                          {r.arrival_location && (
                            <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>→ {r.arrival_location}</p>
                          )}
                        </td>
                        <td>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)' }}>{fDate(r.departure_date)}</p>
                          <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{r.departure_time?.slice(0, 5)}</p>
                        </td>
                        <td>
                          <span className={`al-badge-pill ${sm.cls}`}>
                            <span className={`al-dot ${sm.dot}`}/>
                            {sm.label}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select className="rq-status-select"
                              value={r.status}
                              onChange={e => handleStatusChange(r.id, e.target.value)}>
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmer</option>
                              <option value="completed">Terminer</option>
                              <option value="cancelled">Annuler</option>
                            </select>
                            <button className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(r.id)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
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
            <p className="al-count">
              {filtered.length} demande{filtered.length !== 1 ? 's' : ''}
              {(search || filterStatus !== 'all') ? ` sur ${requests.length} au total` : ''}
            </p>
          </div>
        </div>

        {/* Panneau détail */}
        {selectedRequest ? (
          <div className="rq-detail">
            <div className="rq-detail__header">
              <div className="rq-avatar rq-avatar--lg">
                {(selectedRequest.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h3>{selectedRequest.full_name}</h3>
                <p>{selectedRequest.email}</p>
              </div>
              <button className="al-modal__close" onClick={() => setSelectedRequest(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="rq-detail__body">

              <div className="rq-detail__section">
                <p className="rq-detail__section-title">Contact</p>
                <div className="rq-detail__row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  <span>{selectedRequest.phone}</span>
                </div>
                <div className="rq-detail__row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                  <span>{selectedRequest.email}</span>
                </div>
              </div>

              <div className="rq-detail__section">
                <p className="rq-detail__section-title">Service</p>
                <div className="rq-detail__grid">
                  <div className="rq-detail__item"><span className="rq-detail__key">Type</span><span className="rq-detail__val">{selectedRequest.service_type === 'transfert' ? 'Transfert' : 'Mise à disposition'}</span></div>
                  {selectedRequest.trip_type && <div className="rq-detail__item"><span className="rq-detail__key">Trajet</span><span className="rq-detail__val">{selectedRequest.trip_type}</span></div>}
                  {selectedRequest.duration_type && <div className="rq-detail__item"><span className="rq-detail__key">Durée</span><span className="rq-detail__val">{selectedRequest.duration_type}</span></div>}
                  <div className="rq-detail__item"><span className="rq-detail__key">Véhicule</span><span className="rq-detail__val">{selectedRequest.vehicle_type}</span></div>
                  <div className="rq-detail__item"><span className="rq-detail__key">Passagers</span><span className="rq-detail__val">{selectedRequest.passengers}</span></div>
                  <div className="rq-detail__item"><span className="rq-detail__key">Bagages</span><span className="rq-detail__val">{selectedRequest.luggage}</span></div>
                  {selectedRequest.child_seat    && <div className="rq-detail__item"><span className="rq-detail__key">Siège enfant</span><span className="rq-detail__val" style={{ color: '#059669' }}>✓ Oui</span></div>}
                  {selectedRequest.accessibility && <div className="rq-detail__item"><span className="rq-detail__key">PMR</span><span className="rq-detail__val" style={{ color: '#059669' }}>✓ Oui</span></div>}
                </div>
              </div>

              <div className="rq-detail__section">
                <p className="rq-detail__section-title">Itinéraire</p>
                <div className="rq-itinerary">
                  <div className="rq-itinerary__point rq-itinerary__point--start">
                    <div className="rq-itinerary__dot"/>
                    <div>
                      <p className="rq-itinerary__label">Départ</p>
                      <p className="rq-itinerary__value">{selectedRequest.departure_location}</p>
                      <p className="rq-itinerary__time">{fDate(selectedRequest.departure_date)} à {selectedRequest.departure_time?.slice(0, 5)}</p>
                    </div>
                  </div>
                  {selectedRequest.arrival_location && (
                    <div className="rq-itinerary__point rq-itinerary__point--end">
                      <div className="rq-itinerary__dot"/>
                      <div>
                        <p className="rq-itinerary__label">Arrivée</p>
                        <p className="rq-itinerary__value">{selectedRequest.arrival_location}</p>
                      </div>
                    </div>
                  )}
                  {selectedRequest.flight_train_number && (
                    <p className="rq-itinerary__flight">✈ {selectedRequest.flight_train_number}</p>
                  )}
                </div>
              </div>

              {selectedRequest.free_text && (
                <div className="rq-detail__section">
                  <p className="rq-detail__section-title">Remarques</p>
                  <p className="rq-detail__note">{selectedRequest.free_text}</p>
                </div>
              )}

              <div className="rq-detail__section">
                <p className="rq-detail__section-title">Changer le statut</p>
                <div className="rq-status-btns">
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <button key={key}
                      className={`rq-status-btn ${selectedRequest.status === key ? 'active' : ''}`}
                      onClick={() => handleStatusChange(selectedRequest.id, key)}>
                      <span className={`al-dot ${meta.dot}`}/>
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rq-detail__section">
                <p className="rq-detail__section-title">Reçu le</p>
                <p style={{ fontSize: 12, color: 'var(--g500)' }}>{fDT(selectedRequest.created_at)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rq-detail rq-detail--empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            <p>Cliquez sur une demande<br/>pour voir les détails</p>
          </div>
        )}
      </div>

    </AdminLayout>
  );
};

export default RequestsAdmin;