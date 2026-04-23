import { useEffect, useState } from 'react';

const DURATION_OPTIONS = ['3', '5', '7', '10', '14'];

const CircuitSearchBar = ({ onSearch, initialValues = {}, style = {} }) => {
  const [search, setSearch] = useState({
    date: initialValues.date || '',
    duration: initialValues.duration || '',
    persons: initialValues.persons || '',
    budget: initialValues.budget || '',
  });

  useEffect(() => {
    setSearch({
      date: initialValues.date || '',
      duration: initialValues.duration || '',
      persons: initialValues.persons || '',
      budget: initialValues.budget || '',
    });
  }, [
    initialValues.date,
    initialValues.duration,
    initialValues.persons,
    initialValues.budget,
  ]);

  const handleSubmit = () => {
    if (onSearch) onSearch(search);
  };

  const focusColor = '#1ECAD3';
  const fieldLabelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#0F4C5C',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
  };

  const fieldInputStyle = {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid rgba(15,76,92,0.12)',
    borderRadius: 12,
    fontSize: 14,
    color: '#0f172a',
    outline: 'none',
    background: 'rgba(255,255,255,0.96)',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    appearance: 'none',
    fontFamily: 'inherit',
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = focusColor;
    e.target.style.boxShadow = '0 0 0 3px rgba(30,202,211,0.12)';
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = 'rgba(15,76,92,0.12)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: '28px 32px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.22)',
        ...style,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#0F4C5C',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <i className="fas fa-search" style={{ color: '#E92F64' }} />
        Rechercher un circuit
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr 1fr 1fr auto',
          gap: 14,
          alignItems: 'end',
        }}
        className="circuit-search-grid"
      >
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-calendar-alt" style={{ color: '#E92F64', marginRight: 6 }} />
            Date de depart
          </label>
          <input
            type="date"
            value={search.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSearch((prev) => ({ ...prev, date: e.target.value }))}
            style={{ ...fieldInputStyle, cursor: 'text' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-clock" style={{ color: '#E92F64', marginRight: 6 }} />
            Duree
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.duration}
              onChange={(e) => setSearch((prev) => ({ ...prev, duration: e.target.value }))}
              style={{
                ...fieldInputStyle,
                color: search.duration ? '#0f172a' : '#94a3b8',
                paddingRight: 36,
                cursor: 'pointer',
              }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">Toutes les durees</option>
              {DURATION_OPTIONS.map((duration) => (
                <option key={duration} value={duration}>
                  {duration} jours
                </option>
              ))}
            </select>
            <i
              className="fas fa-chevron-down"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 11,
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-users" style={{ color: '#E92F64', marginRight: 6 }} />
            Nombre de personnes
          </label>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={search.persons}
            onChange={(e) => setSearch((prev) => ({ ...prev, persons: e.target.value }))}
            placeholder="Nb. de personnes"
            style={{ ...fieldInputStyle, cursor: 'text' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-wallet" style={{ color: '#E92F64', marginRight: 6 }} />
            Budget a partir de
          </label>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={search.budget}
            onChange={(e) => setSearch((prev) => ({ ...prev, budget: e.target.value }))}
            placeholder="Ex : 350"
            style={{ ...fieldInputStyle, cursor: 'text' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            padding: '13px 24px',
            background: 'linear-gradient(135deg, #E92F64, #c2185b)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            transition: 'filter 0.2s ease',
            height: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
        >
          <i className="fas fa-search" /> Rechercher
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .circuit-search-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1180px) {
          .circuit-search-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .circuit-search-grid > button {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
};

export default CircuitSearchBar;
