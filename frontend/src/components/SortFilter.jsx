// src/components/SortFilter.jsx
import React from 'react';
import { sortOptions } from '../data/voyageSurMesureData';

const SortFilter = ({ sortBy, setSortBy }) => {
  return (
    <div className="vsm-sort-wrapper">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 6h18M3 12h12M3 18h6" />
      </svg>
      <select
        className="vsm-sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        {sortOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortFilter;