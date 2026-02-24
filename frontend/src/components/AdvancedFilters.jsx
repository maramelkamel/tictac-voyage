// src/components/AdvancedFilters.jsx
import React from 'react';
import { continentOptions, saisonOptions, budgetOptions } from '../data/voyageSurMesureData';

const AdvancedFilters = ({
  showFilters,
  continent,
  setContinent,
  saison,
  setSaison,
  budget,
  setBudget,
  activeFilterCount,
  clearFilters,
  setVisibleCount,
}) => {
  if (!showFilters) return null;

  const handleFilterChange = (setter, value) => {
    setter(value);
    setVisibleCount(6); // Réinitialise la pagination
  };

  return (
    <div className="vsm-filters-panel">
      <div className="vsm-filters-grid">
        <div className="vsm-filter-group">
          <label className="vsm-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
            </svg>
            Destination
          </label>
          <select
            className="vsm-filter-select"
            value={continent}
            onChange={(e) => handleFilterChange(setContinent, e.target.value)}
          >
            {continentOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="vsm-filter-group">
          <label className="vsm-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              <circle cx="12" cy="12" r="5" />
            </svg>
            Saison
          </label>
          <select
            className="vsm-filter-select"
            value={saison}
            onChange={(e) => handleFilterChange(setSaison, e.target.value)}
          >
            {saisonOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="vsm-filter-group">
          <label className="vsm-filter-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <path d="M2 9h20M9 21V9" />
            </svg>
            Budget
          </label>
          <select
            className="vsm-filter-select"
            value={budget}
            onChange={(e) => handleFilterChange(setBudget, e.target.value)}
          >
            {budgetOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.icon} {b.label} {b.sub ? `(${b.sub})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button className="vsm-clear-filters" onClick={clearFilters}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
};

export default AdvancedFilters;