import React, { useState } from 'react';

const destinations = [
  { value: '', label: 'Toutes destinations' },
  { value: 'turquie', label: '🇹🇷 Turquie' },
  { value: 'maroc', label: '🇲🇦 Maroc' },
  { value: 'egypte', label: '🇪🇬 Égypte' },
  { value: 'dubai', label: '🇦🇪 Dubaï' },
  { value: 'grece', label: '🇬🇷 Grèce' },
  { value: 'espagne', label: '🇪🇸 Espagne' },
  { value: 'italie', label: '🇮🇹 Italie' },
  { value: 'france', label: '🇫🇷 France' },
  { value: 'tunisie', label: '🇹🇳 Tunisie' },
  { value: 'maldives', label: '🇲🇻 Maldives' },
];

const months = [
  { value: '', label: 'Toutes dates' },
  { value: '2025-03', label: 'Mars 2025' },
  { value: '2025-04', label: 'Avril 2025' },
  { value: '2025-05', label: 'Mai 2025' },
  { value: '2025-06', label: 'Juin 2025' },
  { value: '2025-07', label: 'Juillet 2025' },
  { value: '2025-08', label: 'Août 2025' },
  { value: '2025-09', label: 'Septembre 2025' },
  { value: '2025-10', label: 'Octobre 2025' },
  { value: '2025-12', label: 'Décembre 2025' },
];

const VoyageSearchBar = ({ onSearch }) => {
  const [form, setForm] = useState({
    destination: '',
    date: '',
    personnes: '2',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (onSearch) onSearch(form);
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar-card">

        {/* Destination */}
        <div className="search-field">
          <label htmlFor="destination">
            🌍 Destination
          </label>
          <select
            id="destination"
            name="destination"
            value={form.destination}
            onChange={handleChange}
          >
            {destinations.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="search-field">
          <label htmlFor="date">
            📅 Période
          </label>
          <select
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Personnes */}
        <div className="search-field">
          <label htmlFor="personnes">
            👤 Voyageurs
          </label>
          <input
            id="personnes"
            name="personnes"
            type="number"
            min="1"
            max="20"
            value={form.personnes}
            onChange={handleChange}
            placeholder="2 personnes"
          />
        </div>

        {/* Button */}
        <button className="search-btn" onClick={handleSubmit}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Rechercher
        </button>

      </div>
    </div>
  );
};

export default VoyageSearchBar;