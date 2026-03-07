// src/pages/admin/transport/TransportAdmin.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';
import TransportTable from './TransportTable';
import TransportForm  from './TransportForm';

const API = 'http://localhost:5000/api/transports';

const TransportAdmin = () => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editData, setEditData]     = useState(null);
  const [toast, setToast]           = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const res  = await fetch(API);
      const json = await res.json();
      setTransports(json.data || []);
    } catch { notify('Impossible de charger les transports', 'error'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchTransports(); }, []);

  const handleAdd    = ()  => { setEditData(null); setShowForm(true); };
  const handleEdit   = (t) => { setEditData(t);    setShowForm(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce transport définitivement ?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (res.ok) { notify('Transport supprimé'); fetchTransports(); }
      else notify('Erreur suppression', 'error');
    } catch { notify('Erreur réseau', 'error'); }
  };

  const handleSubmit = async (formData) => {
    const method = editData ? 'PUT'  : 'POST';
    const url    = editData ? `${API}/${editData.id}` : API;
    try {
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const json = await res.json();
      if (json.success) { notify(editData ? 'Transport modifié ✓' : 'Transport ajouté ✓'); setShowForm(false); fetchTransports(); }
      else notify(json.message || 'Erreur serveur', 'error');
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
    <AdminLayout
      title="Véhicules"
      breadcrumb={[{ label: 'Transport' }, { label: 'Véhicules', active: true }]}
      actions={
        <button className="al-btn al-btn--primary" onClick={handleAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Ajouter un transport
        </button>
      }
      toast={toast}
    >
      <div className="al-stats">
        {[
          { label: 'Total',       value: stats.total,     color: 'blue',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/></svg> },
          { label: 'Voitures',    value: stats.voiture,   color: 'teal',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2"/><circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/></svg> },
          { label: 'Minibus',     value: stats.minibus,   color: 'indigo', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="11" rx="2"/><path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2M2 11h20"/><circle cx="6" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg> },
          { label: 'Bus',         value: stats.bus,       color: 'violet', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18"/><circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/></svg> },
          { label: 'Disponibles', value: stats.available, color: 'green',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">{s.icon}</div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="al-card">
        <TransportTable transports={transports} loading={loading} onEdit={handleEdit} onDelete={handleDelete}/>
      </div>

      {showForm && (
        <div className="al-overlay" onClick={() => setShowForm(false)}>
          <div className="al-modal" onClick={e => e.stopPropagation()}>
            <div className="al-modal__header">
              <div className="al-modal__title-wrap">
                <div className="al-modal__icon">
                  {editData
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>}
                </div>
                <h2>{editData ? 'Modifier le transport' : 'Ajouter un transport'}</h2>
              </div>
              <button className="al-modal__close" onClick={() => setShowForm(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <TransportForm initialData={editData} onSubmit={handleSubmit} onCancel={() => setShowForm(false)}/>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TransportAdmin;