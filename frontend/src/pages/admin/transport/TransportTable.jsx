// src/pages/admin/transport/TransportTable.jsx
import React, { useState } from 'react';

const TYPE_META = {
  voiture: { label: 'Voiture', cls: 'b--teal'   },
  minibus: { label: 'Minibus', cls: 'b--indigo'  },
  bus:     { label: 'Bus',     cls: 'b--violet'  },
};

const TransportTable = ({ transports, loading, onEdit, onDelete }) => {
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField]   = useState('transport_name');
  const [sortDir, setSortDir]       = useState('asc');

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = transports
    .filter(t => {
      const q = search.toLowerCase();
      return ((t.transport_name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
        && (filterType === 'all' || t.transport_type === filterType);
    })
    .sort((a, b) => {
      const av = a[sortField] ?? '', bv = b[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  if (loading) return (
    <div className="al-loading">
      <div className="al-spinner-wrap"><div className="al-spinner"/></div>
      <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement...</p>
    </div>
  );

  const SortArrow = ({ field }) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" style={{ width: 13, height: 13, marginLeft: 4, verticalAlign: 'middle', stroke: sortField === field ? 'var(--primary)' : 'var(--g300)' }}>
      {sortField === field && sortDir === 'asc' ? <path d="M5 15l7-7 7 7"/> : <path d="M19 9l-7 7-7-7"/>}
    </svg>
  );

  return (
    <>
      <div className="al-toolbar">
        <div className="al-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Rechercher un transport..." value={search} onChange={e => setSearch(e.target.value)}/>
          {search && (
            <button className="al-search__clear" onClick={() => setSearch('')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
        <div className="al-filter-tabs">
          {[
            { v: 'all',     l: 'Tous' },
            { v: 'voiture', l: '🚗 Voitures' },
            { v: 'minibus', l: '🚐 Minibus' },
            { v: 'bus',     l: '🚌 Bus' },
          ].map(({ v, l }) => (
            <button key={v} className={`al-filter-tab ${filterType === v ? 'active' : ''}`} onClick={() => setFilterType(v)}>
              {l}
              <span className="al-filter-tab__count">
                {v === 'all' ? transports.length : transports.filter(t => t.transport_type === v).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="al-empty">
          <div className="al-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <p className="al-empty__title">Aucun transport trouvé</p>
          <p className="al-empty__sub">Modifiez vos filtres ou ajoutez un transport.</p>
        </div>
      ) : (
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('transport_name')}>Transport <SortArrow field="transport_name"/></th>
                <th className="sortable" onClick={() => toggleSort('transport_type')}>Type <SortArrow field="transport_type"/></th>
                <th>Capacité</th>
                <th className="sortable" onClick={() => toggleSort('price_per_km')}>Prix/km <SortArrow field="price_per_km"/></th>
                <th>½ jour</th>
                <th>Journée</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const meta = TYPE_META[t.transport_type] || { label: t.transport_type, cls: 'b--gray' };
                return (
                  <tr key={t.id} className="al-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180 }}>
                        {t.image_url
                          ? <img src={t.image_url} alt={t.transport_name} style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 7, border: '1px solid var(--g200)', flexShrink: 0 }}/>
                          : <div style={{ width: 52, height: 36, borderRadius: 7, border: '1px solid var(--g200)', background: 'var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="var(--g300)" strokeWidth="1.5" style={{ width: 18, height: 18 }}><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>
                            </div>}
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--g800)' }}>{t.transport_name}</p>
                          {t.description && <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{t.description.length > 40 ? t.description.slice(0,40)+'…' : t.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td><span className={`al-badge-pill ${meta.cls}`}>{meta.label}</span></td>
                    <td><span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 13 }}>{t.capacity_min}–{t.capacity_max}</span></td>
                    <td>{t.price_per_km  ? <span style={{ fontWeight: 600, fontSize: 13 }}>{Number(t.price_per_km).toFixed(2)} €</span>  : <span style={{ color: 'var(--g300)' }}>—</span>}</td>
                    <td>{t.price_halfday ? <span style={{ fontWeight: 600, fontSize: 13 }}>{Number(t.price_halfday).toFixed(0)} €</span> : <span style={{ color: 'var(--g300)' }}>—</span>}</td>
                    <td>{t.price_fullday ? <span style={{ fontWeight: 600, fontSize: 13 }}>{Number(t.price_fullday).toFixed(0)} €</span> : <span style={{ color: 'var(--g300)' }}>—</span>}</td>
                    <td>
                      <span className={`al-badge-pill ${t.is_available ? 'b--green' : 'b--red'}`}>
                        <span className={`al-dot ${t.is_available ? 'dot--green' : 'dot--red'}`}/>
                        {t.is_available ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="al-action-btn al-action-btn--edit" onClick={() => onEdit(t)} title="Modifier">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="al-action-btn al-action-btn--delete" onClick={() => onDelete(t.id)} title="Supprimer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
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
          {filtered.length} transport{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
          {(search || filterType !== 'all') ? ` (filtrés sur ${transports.length})` : ''}
        </p>
      </div>
    </>
  );
};

export default TransportTable;