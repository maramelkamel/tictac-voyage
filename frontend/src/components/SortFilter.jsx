// src/components/SortFilter.jsx
import React from 'react';
import { sortOptions } from '../data/voyageSurMesureData';

const SortFilter = ({ sortBy, setSortBy, options = sortOptions }) => {
  const wrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    minHeight: 48,
    borderRadius: 14,
    border: '1px solid rgba(15, 23, 42, 0.08)',
    background: '#fff',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
  };

  const iconStyle = {
    width: 18,
    height: 18,
    color: '#475569',
    flexShrink: 0,
  };

  const selectStyle = {
    border: 'none',
    background: 'transparent',
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 700,
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    paddingRight: 10,
  };

  return (
    <div className="vsm-sort-wrapper" style={wrapperStyle}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={iconStyle}
      >
        <path d="M3 6h18M3 12h12M3 18h6" />
      </svg>
      <select
        className="vsm-sort-select"
        style={selectStyle}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        {options.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortFilter;
