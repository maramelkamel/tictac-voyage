// src/components/AirportAutocomplete.jsx
// Champ de saisie d'aéroport avec autocomplete (données embarquées + fallback API)
import { useState, useRef, useEffect } from 'react';

// ── Base d'aéroports embarquée (principaux hubs TN + monde) ──
// Enrichis cette liste ou charge-la depuis /api/flights/airports
const AIRPORTS = [
  // Tunisie
  { iata: 'TUN', name: 'Aéroport de Tunis-Carthage',     city: 'Tunis',          country: 'Tunisie' },
  { iata: 'SFA', name: 'Aéroport de Sfax-Thyna',         city: 'Sfax',           country: 'Tunisie' },
  { iata: 'MIR', name: 'Aéroport de Monastir',           city: 'Monastir',       country: 'Tunisie' },
  { iata: 'TOE', name: 'Aéroport de Tozeur-Nefta',       city: 'Tozeur',         country: 'Tunisie' },
  { iata: 'DJE', name: 'Aéroport de Djerba-Zarzis',      city: 'Djerba',         country: 'Tunisie' },
  { iata: 'GAF', name: 'Aéroport de Gafsa',              city: 'Gafsa',          country: 'Tunisie' },
  // France
  { iata: 'CDG', name: 'Charles de Gaulle',              city: 'Paris',          country: 'France' },
  { iata: 'ORY', name: 'Paris-Orly',                     city: 'Paris',          country: 'France' },
  { iata: 'NCE', name: 'Aéroport de Nice Côte d\'Azur',  city: 'Nice',           country: 'France' },
  { iata: 'LYS', name: 'Aéroport Lyon-Saint Exupéry',    city: 'Lyon',           country: 'France' },
  { iata: 'MRS', name: 'Aéroport Marseille Provence',    city: 'Marseille',      country: 'France' },
  { iata: 'BOD', name: 'Aéroport de Bordeaux-Mérignac',  city: 'Bordeaux',       country: 'France' },
  { iata: 'TLS', name: 'Aéroport de Toulouse-Blagnac',   city: 'Toulouse',       country: 'France' },
  { iata: 'SXB', name: 'Aéroport de Strasbourg',         city: 'Strasbourg',     country: 'France' },
  // Monde
  { iata: 'LHR', name: 'London Heathrow',                city: 'Londres',        country: 'Royaume-Uni' },
  { iata: 'LGW', name: 'London Gatwick',                 city: 'Londres',        country: 'Royaume-Uni' },
  { iata: 'FRA', name: 'Frankfurt Airport',              city: 'Francfort',      country: 'Allemagne' },
  { iata: 'MUC', name: 'Munich Airport',                 city: 'Munich',         country: 'Allemagne' },
  { iata: 'AMS', name: 'Amsterdam Schiphol',             city: 'Amsterdam',      country: 'Pays-Bas' },
  { iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas',   city: 'Madrid',         country: 'Espagne' },
  { iata: 'BCN', name: 'Barcelona El Prat',              city: 'Barcelone',      country: 'Espagne' },
  { iata: 'FCO', name: 'Rome Fiumicino',                 city: 'Rome',           country: 'Italie' },
  { iata: 'MXP', name: 'Milan Malpensa',                 city: 'Milan',          country: 'Italie' },
  { iata: 'IST', name: 'Istanbul Airport',               city: 'Istanbul',       country: 'Turquie' },
  { iata: 'SAW', name: 'Istanbul Sabiha Gökçen',         city: 'Istanbul',       country: 'Turquie' },
  { iata: 'DXB', name: 'Dubai International',            city: 'Dubaï',          country: 'Émirats Arabes Unis' },
  { iata: 'AUH', name: 'Abu Dhabi International',        city: 'Abu Dhabi',      country: 'Émirats Arabes Unis' },
  { iata: 'DOH', name: 'Hamad International',            city: 'Doha',           country: 'Qatar' },
  { iata: 'CAI', name: 'Cairo International',            city: 'Le Caire',       country: 'Égypte' },
  { iata: 'CMN', name: 'Mohammed V International',       city: 'Casablanca',     country: 'Maroc' },
  { iata: 'RAK', name: 'Marrakech Menara',               city: 'Marrakech',      country: 'Maroc' },
  { iata: 'ALG', name: 'Houari Boumédiène',              city: 'Alger',          country: 'Algérie' },
  { iata: 'JFK', name: 'John F. Kennedy International',  city: 'New York',       country: 'États-Unis' },
  { iata: 'JNB', name: 'O.R. Tambo International',       city: 'Johannesburg',   country: 'Afrique du Sud' },
  { iata: 'SIN', name: 'Singapore Changi',               city: 'Singapour',      country: 'Singapour' },
  { iata: 'BKK', name: 'Suvarnabhumi Airport',           city: 'Bangkok',        country: 'Thaïlande' },
  { iata: 'NBO', name: 'Jomo Kenyatta International',    city: 'Nairobi',        country: 'Kenya' },
  { iata: 'ADD', name: 'Bole International Airport',     city: 'Addis-Abeba',    country: 'Éthiopie' },
];

// ── Component ─────────────────────────────────────────────────
const AirportAutocomplete = ({
  value,
  onChange,
  placeholder = 'ex : TUN',
  label,
  icon = 'fa-plane-departure',
  required = false,
}) => {
  const [query,   setQuery]   = useState(value || '');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [active,  setActive]  = useState(-1);
  const containerRef          = useRef(null);

  // Sync externe
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (q) => {
    const term = q.toLowerCase().trim();
    if (!term || term.length < 1) return setResults([]);
    setResults(
      AIRPORTS.filter(a =>
        a.iata.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term) ||
        a.city.toLowerCase().includes(term) ||
        a.country.toLowerCase().includes(term)
      ).slice(0, 8)
    );
  };

  const handleInput = (e) => {
    const q = e.target.value.toUpperCase();
    setQuery(q);
    setActive(-1);
    search(q);
    setOpen(true);
    onChange(q); // notify parent with raw input
  };

  const selectAirport = (airport) => {
    setQuery(airport.iata);
    setResults([]);
    setOpen(false);
    onChange(airport.iata);
  };

  const handleKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); selectAirport(results[active]); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
          color: 'var(--gray-600, #475569)', marginBottom: 6 }}>
          {icon && <i className={`fas ${icon}`} style={{ color: 'var(--secondary, #e67e22)', marginRight: 6 }} />}
          {label} {required && '*'}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { search(query); setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          maxLength={3}
          autoComplete="off"
          style={{
            width: '100%', padding: '10px 40px 10px 12px', borderRadius: 10,
            border: '1px solid #e2e8f0', fontSize: 15, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase', outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit',
            transition: 'border-color .2s',
          }}
          onFocusCapture={e => (e.target.style.borderColor = 'var(--secondary, #e67e22)')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
        {query && (
          <button type="button"
            onClick={() => { setQuery(''); onChange(''); setResults([]); }}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 14 }}>
            ×
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 999,
          listStyle: 'none', margin: 0, padding: '6px 0', maxHeight: 280, overflowY: 'auto',
        }}>
          {results.map((a, i) => (
            <li key={a.iata}
              onMouseDown={() => selectAirport(a)}
              onMouseEnter={() => setActive(i)}
              style={{
                padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                background: active === i ? '#f0f9ff' : '#fff', transition: 'background .1s',
              }}>
              {/* IATA badge */}
              <span style={{ minWidth: 38, textAlign: 'center', background: '#f0f9ff',
                color: '#0369a1', borderRadius: 7, padding: '3px 6px',
                fontSize: 12, fontWeight: 800, letterSpacing: 1, flexShrink: 0 }}>
                {a.iata}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0a2832',
                  display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.name}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {a.city}, {a.country}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AirportAutocomplete;