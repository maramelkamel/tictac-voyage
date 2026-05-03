import { useEffect, useState } from 'react';

const DEFAULT_SEARCH = {
  city: '',
  checkin: '',
  checkout: '',
  adults: '2',
  rooms: '1',
  minRating: '',
};

const CITY_OPTIONS = ['Tunis', 'Sousse', 'Hammamet', 'Djerba'];

const HotelsSearchBar = ({ onSearch, initialValues = DEFAULT_SEARCH, style = {} }) => {
  const [search, setSearch] = useState({ ...DEFAULT_SEARCH, ...initialValues });

  useEffect(() => {
    setSearch({ ...DEFAULT_SEARCH, ...initialValues });
  }, [initialValues]);

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
    fontFamily: 'inherit',
  };

  const focusStyle = (event) => { event.target.style.borderColor = 'var(--secondary)'; };
  const blurStyle = (event) => { event.target.style.borderColor = 'var(--gray-200)'; };

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
        Rechercher un hotel
      </p>

      <div
        className="hotel-search-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr 1fr .8fr .8fr .9fr auto',
          gap: 14,
          alignItems: 'end',
        }}
      >
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-map-marker-alt" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Ville
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.city}
              onChange={(event) => setSearch({ ...search, city: event.target.value })}
              style={{ ...fieldInputStyle, paddingRight: 36 }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">Toutes les villes</option>
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {chevron}
          </div>
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-calendar-alt" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Check-in
          </label>
          <input
            type="date"
            value={search.checkin}
            onChange={(event) => setSearch({ ...search, checkin: event.target.value })}
            style={{ ...fieldInputStyle, cursor: 'text' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-calendar-check" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Check-out
          </label>
          <input
            type="date"
            value={search.checkout}
            onChange={(event) => setSearch({ ...search, checkout: event.target.value })}
            style={{ ...fieldInputStyle, cursor: 'text' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-users" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Adultes
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={search.adults}
            onChange={(event) => setSearch({ ...search, adults: event.target.value })}
            style={{ ...fieldInputStyle, cursor: 'text' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-bed" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Chambres
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={search.rooms}
            onChange={(event) => setSearch({ ...search, rooms: event.target.value })}
            style={{ ...fieldInputStyle, cursor: 'text' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-star" style={{ color: 'var(--secondary)', marginRight: 6 }} />
            Note min
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.minRating}
              onChange={(event) => setSearch({ ...search, minRating: event.target.value })}
              style={{ ...fieldInputStyle, paddingRight: 36 }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">Toutes</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
            {chevron}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          style={{
            padding: '13px 26px',
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
            height: 46,
          }}
          onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--primary)'; }}
          onMouseLeave={(event) => { event.currentTarget.style.background = 'var(--secondary)'; }}
        >
          <i className="fas fa-search" /> Rechercher
        </button>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .hotel-search-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hotel-search-grid > button {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 768px) {
          .hotel-search-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HotelsSearchBar;
