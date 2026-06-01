import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_SEARCH = {
  city: '',
  checkin: '',
  checkout: '',
  budget: '',
  persons: '2',
};

const DEFAULT_CITIES = [
  'Tunis',
  'Sousse',
  'Hammamet',
  'Djerba',
  'Monastir',
  'Mahdia',
  'Tozeur',
  'Tabarka',
  'Bizerte',
  'Nabeul',
];

const HotelsSearchBar = ({
  onSearch,
  initialValues = DEFAULT_SEARCH,
  cityOptions = DEFAULT_CITIES,
  style = {},
}) => {
  const { t } = useTranslation('hotels');
  const [search, setSearch] = useState({ ...DEFAULT_SEARCH, ...initialValues });

  useEffect(() => {
    setSearch({ ...DEFAULT_SEARCH, ...initialValues });
  }, [initialValues]);

  const destinations = useMemo(() => {
    const merged = [...DEFAULT_CITIES, ...(cityOptions || [])].filter(Boolean);
    return [...new Set(merged)].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [cityOptions]);

  const handleSubmit = () => {
    if (onSearch) onSearch(search);
  };

  const fieldLabelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 800,
    color: '#9f1239',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
  };

  const fieldInputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid rgba(232,48,106,0.18)',
    borderRadius: 14,
    fontSize: 14,
    color: 'var(--gray-800)',
    outline: 'none',
    background: '#fff8fb',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
    appearance: 'none',
    fontFamily: 'inherit',
  };

  const focusStyle = (event) => {
    event.target.style.borderColor = '#e8306a';
    event.target.style.boxShadow = '0 0 0 4px rgba(232,48,106,0.12)';
    event.target.style.background = '#ffffff';
  };

  const blurStyle = (event) => {
    event.target.style.borderColor = 'rgba(232,48,106,0.18)';
    event.target.style.boxShadow = 'none';
    event.target.style.background = '#fff8fb';
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
        color: '#be185d',
        pointerEvents: 'none',
      }}
    />
  );

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: 28,
        padding: '30px 34px',
        border: '1px solid rgba(255,255,255,0.35)',
        boxShadow: '0 28px 70px rgba(136,19,55,0.24)',
        maxWidth: 1120,
        margin: '0 auto',
        ...style,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#9f1239',
          textTransform: 'uppercase',
          letterSpacing: '0.11em',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <i className="fas fa-search" style={{ color: '#e8306a' }} />
        {t('searchTitle')}
      </p>

      <div
        className="hotel-search-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.7fr 1fr 1fr 1fr .9fr auto',
          gap: 14,
          alignItems: 'end',
        }}
      >
        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-map-marker-alt" style={{ color: '#e8306a', marginRight: 6 }} />
            {t('fields.destination')}
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.city}
              onChange={(event) => setSearch({ ...search, city: event.target.value })}
              style={{ ...fieldInputStyle, paddingRight: 36 }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">{t('allDestinations')}</option>
              {destinations.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {chevron}
          </div>
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-calendar-alt" style={{ color: '#e8306a', marginRight: 6 }} />
            {t('fields.checkIn')}
          </label>
          <input
            type="date"
            value={search.checkin}
            onChange={(event) => setSearch({ ...search, checkin: event.target.value })}
            style={fieldInputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-calendar-check" style={{ color: '#e8306a', marginRight: 6 }} />
            {t('fields.checkOut')}
          </label>
          <input
            type="date"
            value={search.checkout}
            onChange={(event) => setSearch({ ...search, checkout: event.target.value })}
            style={fieldInputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-wallet" style={{ color: '#e8306a', marginRight: 6 }} />
            {t('filters.maxBudget')}
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={search.budget}
              onChange={(event) => setSearch({ ...search, budget: event.target.value })}
              style={{ ...fieldInputStyle, paddingRight: 36 }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="">{t('allBudgets')}</option>
              <option value="150">{t('budgetUntil', { amount: 150 })}</option>
              <option value="250">{t('budgetUntil', { amount: 250 })}</option>
              <option value="400">{t('budgetUntil', { amount: 400 })}</option>
              <option value="600">{t('budgetUntil', { amount: 600 })}</option>
              <option value="1000">{t('budgetUntil', { amount: 1000 })}</option>
            </select>
            {chevron}
          </div>
        </div>

        <div>
          <label style={fieldLabelStyle}>
            <i className="fas fa-users" style={{ color: '#e8306a', marginRight: 6 }} />
            {t('home.peopleLabel')}
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={search.persons}
            onChange={(event) => setSearch({ ...search, persons: event.target.value })}
            style={fieldInputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg,#e8306a,#be185d)',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: 50,
            boxShadow: '0 18px 30px rgba(232,48,106,0.25)',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform = 'translateY(-1px)';
            event.currentTarget.style.boxShadow = '0 22px 36px rgba(232,48,106,0.34)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'translateY(0)';
            event.currentTarget.style.boxShadow = '0 18px 30px rgba(232,48,106,0.25)';
          }}
        >
          <i className="fas fa-search" /> {t('searchButton')}
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
