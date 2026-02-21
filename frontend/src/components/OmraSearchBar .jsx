import { useState } from 'react';

/**
 * OmraSearchBar — Search bar component for Omra packages
 *
 * Props:
 *  onSearch : fn({ date, duration, persons }) — called when the search button is clicked
 *  style    : object — optional extra styles for the outer wrapper
 */

const OmraSearchBar = ({ onSearch, style = {} }) => {
  const [search, setSearch] = useState({
    date: '',
    duration: '',
    persons: '',
  });

  const handleSubmit = () => {
    if (onSearch) onSearch(search);
  };

  const fieldLabelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
  };

  const fieldInputStyle = {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 12,
    fontSize: 14,
    color: 'var(--gray-800)',
    outline: 'none',
    background: 'var(--gray-50)',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    appearance: 'none',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: '28px 32px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {/* Header label */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--gray-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <i className="fas fa-search" style={{ color: 'var(--secondary)' }} />
        Rechercher un forfait Omra
      </p>

      {/* Fields row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr auto',
          gap: 14,
          alignItems: 'end',
        }}
        className="omra-search-grid"
      >

        {/* Date de départ */}
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-calendar-alt" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Date de départ
          </label>
          <input
            type="date"
            value={search.date}
            onChange={(e) => setSearch({ ...search, date: e.target.value })}
            style={fieldInputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--secondary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--gray-200)')}
          />
        </div>

        {/* Durée */}
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-clock" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Durée
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.duration}
              onChange={(e) => setSearch({ ...search, duration: e.target.value })}
              style={{
                ...fieldInputStyle,
                color: search.duration ? 'var(--gray-800)' : 'var(--gray-400)',
                paddingRight: 36,
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--secondary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--gray-200)')}
            >
              <option value="">Toutes les durées</option>
              <option value="7">7 jours</option>
              <option value="10">10 jours</option>
              <option value="12">12 jours</option>
              <option value="14">14 jours</option>
              <option value="15">15 jours</option>
              <option value="21">21 jours</option>
            </select>
            <i
              className="fas fa-chevron-down"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 11,
                color: 'var(--gray-400)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Nombre de personnes */}
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-users" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Nombre de personnes
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.persons}
              onChange={(e) => setSearch({ ...search, persons: e.target.value })}
              style={{
                ...fieldInputStyle,
                color: search.persons ? 'var(--gray-800)' : 'var(--gray-400)',
                paddingRight: 36,
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--secondary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--gray-200)')}
            >
              <option value="">Nb. de personnes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} personne{n > 1 ? 's' : ''}
                </option>
              ))}
              <option value="10+">10+ personnes</option>
            </select>
            <i
              className="fas fa-chevron-down"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 11,
                color: 'var(--gray-400)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSubmit}
          style={{
            padding: '13px 24px',
            background: 'var(--secondary)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            transition: 'background 0.2s ease',
            height: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
        >
          <i className="fas fa-search" /> Rechercher
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .omra-search-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1024px) {
          .omra-search-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .omra-search-grid > button {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
};

export default OmraSearchBar;