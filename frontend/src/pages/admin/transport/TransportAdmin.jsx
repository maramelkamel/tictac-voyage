// src/pages/admin/transport/TransportAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransportTable from './TransportTable';
import TransportForm  from './TransportForm';
import './transportAdmin.css';

const API = 'http://localhost:5000/api/transports';

const TransportAdmin = () => {
  const navigate = useNavigate();
  const [transports, setTransports]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editData, setEditData]         = useState(null);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const res  = await fetch(API);
      const json = await res.json();
      setTransports(json.data || []);
    } catch {
      notify('Impossible de charger les transports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransports(); }, []);

  const handleAdd    = ()  => { setEditData(null); setShowForm(true); };
  const handleEdit   = (t) => { setEditData(t);    setShowForm(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce transport définitivement ?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (res.ok) { notify('Transport supprimé avec succès'); fetchTransports(); }
      else notify('Erreur lors de la suppression', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  const handleSubmit = async (formData) => {
    const method = editData ? 'PUT'  : 'POST';
    const url    = editData ? `${API}/${editData.id}` : API;
    try {
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        notify(editData ? 'Transport modifié ✓' : 'Transport ajouté ✓');
        setShowForm(false);
        fetchTransports();
      } else {
        notify(json.message || 'Erreur serveur', 'error');
      }
    } catch { notify('Erreur réseau', 'error'); }
  };

  const stats = {
    total:     transports.length,
    voiture:   transports.filter(t => t.transport_type === 'voiture').length,
    minibus:   transports.filter(t => t.transport_type === 'minibus').length,
    bus:       transports.filter(t => t.transport_type === 'bus').length,
    available: transports.filter(t => t.is_available).length,
  };

  return (
    <div className="ta-root">

      {/* ── Toast ── */}
      {notification && (
        <div className={`ta-toast ta-toast--${notification.type}`}>
          <span className="ta-toast__icon">
            {notification.type === 'success'
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            }
          </span>
          {notification.msg}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="ta-sidebar">
        <div className="ta-sidebar__brand">
          <div className="ta-sidebar__logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="16" rx="2"/>
              <path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/>
              <circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/>
              <path d="M3 19h4M17 19h4"/>
            </svg>
          </div>
          <div>
            <p className="ta-sidebar__name">Tic-Tac Voyage</p>
            <p className="ta-sidebar__role">Administration</p>
          </div>
        </div>

        <nav className="ta-sidebar__nav">
          <span className="ta-sidebar__section-label">Transport</span>

          <button className="ta-sidebar__link active" onClick={() => navigate('/admin/transport')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="16" rx="2"/>
              <path d="M3 9h18"/>
            </svg>
            Véhicules
          </button>

          <button className="ta-sidebar__link" onClick={() => navigate('/admin/transport/requests')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            Demandes clients
          </button>
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="ta-main">

        <header className="ta-header">
          <div className="ta-header__left">
            <h1 className="ta-header__title">Gestion des Transports</h1>
            <p className="ta-header__breadcrumb">
              <span>Admin</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <span>Transports</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <span className="ta-header__breadcrumb--active">Véhicules</span>
            </p>
          </div>
          <button className="ta-btn ta-btn--primary" onClick={handleAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Ajouter un transport
          </button>
        </header>

        <div className="ta-stats">
          {[
            { label: 'Total',       value: stats.total,     icon: 'all',     color: 'blue'   },
            { label: 'Voitures',    value: stats.voiture,   icon: 'car',     color: 'teal'   },
            { label: 'Minibus',     value: stats.minibus,   icon: 'minibus', color: 'indigo' },
            { label: 'Bus',         value: stats.bus,       icon: 'bus',     color: 'violet' },
            { label: 'Disponibles', value: stats.available, icon: 'ok',      color: 'green'  },
          ].map((s) => (
            <div key={s.label} className={`ta-stat ta-stat--${s.color}`}>
              <div className="ta-stat__icon">
                {s.icon === 'all'     && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/></svg>}
                {s.icon === 'car'     && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2"/><circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/></svg>}
                {s.icon === 'minibus' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="11" rx="2"/><path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2M2 11h20"/><circle cx="6" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg>}
                {s.icon === 'bus'     && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18"/><circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/></svg>}
                {s.icon === 'ok'      && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>}
              </div>
              <div className="ta-stat__body">
                <span className="ta-stat__value">{s.value}</span>
                <span className="ta-stat__label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ta-card">
          <TransportTable
            transports={transports}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* ── Modal Form ── */}
      {showForm && (
        <div className="ta-overlay" onClick={() => setShowForm(false)}>
          <div className="ta-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ta-modal__header">
              <div className="ta-modal__title-wrap">
                <div className="ta-modal__icon">
                  {editData
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  }
                </div>
                <h2>{editData ? 'Modifier le transport' : 'Ajouter un transport'}</h2>
              </div>
              <button className="ta-modal__close" onClick={() => setShowForm(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <TransportForm
              initialData={editData}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportAdmin;