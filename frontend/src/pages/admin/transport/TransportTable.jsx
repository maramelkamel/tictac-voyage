// src/pages/admin/transport/TransportTable.jsx
import React, { useState } from 'react';

const TYPE_META = {
  voiture: { label: 'Voiture',  cls: 'badge--teal'   },
  minibus: { label: 'Minibus',  cls: 'badge--indigo'  },
  bus:     { label: 'Bus',      cls: 'badge--violet'  },
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

  const SortIcon = ({ field }) => (
    <svg className={`ta-sort-icon ${sortField === field ? 'active' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {sortField === field && sortDir === 'asc'
        ? <path d="M5 15l7-7 7 7"/>
        : <path d="M19 9l-7 7-7-7"/>}
    </svg>
  );

  const filtered = transports
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        (t.transport_name.toLowerCase().includes(q) ||
         (t.description || '').toLowerCase().includes(q)) &&
        (filterType === 'all' || t.transport_type === filterType)
      );
    })
    .sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  if (loading) {
    return (
      <div className="ta-loading">
        <div className="ta-spinner-wrap">
          <div className="ta-spinner"/>
        </div>
        <p>Chargement des transports...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="ta-toolbar">
        <div className="ta-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un transport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="ta-search__clear" onClick={() => setSearch('')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        <div className="ta-filter-tabs">
          {[
            { value: 'all',     label: 'Tous' },
            { value: 'voiture', label: '🚗 Voitures' },
            { value: 'minibus', label: '🚐 Minibus' },
            { value: 'bus',     label: '🚌 Bus' },
          ].map(({ value, label }) => (
            <button key={value}
              className={`ta-filter-tab ${filterType === value ? 'active' : ''}`}
              onClick={() => setFilterType(value)}>
              {label}
              <span className="ta-filter-tab__count">
                {value === 'all'
                  ? transports.length
                  : transports.filter(t => t.transport_type === value).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="ta-empty">
          <div className="ta-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <p className="ta-empty__title">Aucun transport trouvé</p>
          <p className="ta-empty__sub">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>
      ) : (
        <div className="ta-table-wrap">
          <table className="ta-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('transport_name')}>
                  Transport <SortIcon field="transport_name"/>
                </th>
                <th className="sortable" onClick={() => toggleSort('transport_type')}>
                  Type <SortIcon field="transport_type"/>
                </th>
                <th>Capacité</th>
                <th className="sortable" onClick={() => toggleSort('price_per_km')}>
                  Prix / km <SortIcon field="price_per_km"/>
                </th>
                <th>½ journée</th>
                <th>Journée</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const meta = TYPE_META[t.transport_type] || {};
                return (
                  <tr key={t.id} className="ta-row">
                    <td>
                      <div className="ta-cell-transport">
                        {t.image_url ? (
                          <img src={t.image_url} alt={t.transport_name} className="ta-thumb"/>
                        ) : (
                          <div className="ta-thumb ta-thumb--placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="16" rx="2"/>
                              <path d="M3 9h18"/>
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="ta-cell-name">{t.transport_name}</p>
                          {t.description && (
                            <p className="ta-cell-desc">
                              {t.description.length > 45
                                ? t.description.slice(0, 45) + '…'
                                : t.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`ta-badge ${meta.cls}`}>{meta.label}</span>
                    </td>
                    <td>
                      <div className="ta-capacity-cell">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        {t.capacity_min}–{t.capacity_max}
                      </div>
                    </td>
                    <td className="ta-cell-price">
                      {t.price_per_km ? (
                        <span className="ta-price">{Number(t.price_per_km).toFixed(2)} €</span>
                      ) : <span className="ta-na">—</span>}
                    </td>
                    <td className="ta-cell-price">
                      {t.price_halfday ? (
                        <span className="ta-price">{Number(t.price_halfday).toFixed(0)} €</span>
                      ) : <span className="ta-na">—</span>}
                    </td>
                    <td className="ta-cell-price">
                      {t.price_fullday ? (
                        <span className="ta-price">{Number(t.price_fullday).toFixed(0)} €</span>
                      ) : <span className="ta-na">—</span>}
                    </td>
                    <td>
                      <span className={`ta-badge ${t.is_available ? 'badge--green' : 'badge--red'}`}>
                        <span className={`ta-badge-dot ${t.is_available ? 'dot--green' : 'dot--red'}`}/>
                        {t.is_available ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td>
                      <div className="ta-actions">
                        <button className="ta-action-btn ta-action-btn--edit"
                          onClick={() => onEdit(t)} title="Modifier">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="ta-action-btn ta-action-btn--delete"
                          onClick={() => onDelete(t.id)} title="Supprimer">
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

      <div className="ta-table-footer">
        <p className="ta-count">
          {filtered.length} transport{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
          {search || filterType !== 'all' ? ` (filtrés sur ${transports.length} au total)` : ''}
        </p>
      </div>
    </>
  );
};

export default TransportTable;