import { useState } from 'react';

/**
 * VoyageSearchBar — Search bar component for Voyages Organisés
 *
 * Props:
 *  onSearch : fn({ destination, date, personnes, duree, budget }) — called on submit
 *  style    : object — optional extra styles for the outer wrapper
 */

const VoyageSearchBar = ({ onSearch, style = {} }) => {
  const [search, setSearch] = useState({
    destination: '',
    date: '',
    personnes: '',
    duree: '',
    budget: '',
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

  const chevron = (
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
  );

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
        Rechercher un voyage organisé
      </p>

      {/* Fields row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto',
          gap: 14,
          alignItems: 'end',
        }}
        className="voyage-search-grid"
      >

        {/* Destination */}
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-map-marker-alt" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Destination
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.destination}
              onChange={(e) => setSearch({ ...search, destination: e.target.value })}
              style={{
                ...fieldInputStyle,
                color: search.destination ? 'var(--gray-800)' : 'var(--gray-400)',
                paddingRight: 36,
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--secondary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--gray-200)')}
            >
              <option value="">Toutes destinations</option>
              <option value="turquie">🇹🇷 Turquie</option>
              <option value="maroc">🇲🇦 Maroc</option>
              <option value="egypte">🇪🇬 Égypte</option>
              <option value="dubai">🇦🇪 Dubaï</option>
              <option value="grece">🇬🇷 Grèce</option>
              <option value="espagne">🇪🇸 Espagne</option>
              <option value="italie">🇮🇹 Italie</option>
              <option value="maldives">🇲🇻 Maldives</option>
              <option value="tunisie">🇹🇳 Tunisie</option>
            </select>
            {chevron}
          </div>
        </div>

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
            min={new Date().toISOString().split('T')[0]}
            style={fieldInputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--secondary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--gray-200)')}
          />
        </div>

        {/* Nombre de personnes */}
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-users" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Voyageurs
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.personnes}
              onChange={(e) => setSearch({ ...search, personnes: e.target.value })}
              style={{
                ...fieldInputStyle,
                color: search.personnes ? 'var(--gray-800)' : 'var(--gray-400)',
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
            {chevron}
          </div>
        </div>

        {/* Durée */}
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-clock" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Durée
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.duree}
              onChange={(e) => setSearch({ ...search, duree: e.target.value })}
              style={{
                ...fieldInputStyle,
                color: search.duree ? 'var(--gray-800)' : 'var(--gray-400)',
                paddingRight: 36,
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--secondary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--gray-200)')}
            >
              <option value="">durées</option>
              <option value="3-5">one week</option>
              <option value="6-8">txo weeks</option>
              <option value="9-12">9 à 12 jours</option>
              
            </select>
            {chevron}
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
          .voyage-search-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1200px) {
          .voyage-search-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .voyage-search-grid > button {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
};

export default VoyageSearchBar;