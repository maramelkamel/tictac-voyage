import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LocationInput — Autocomplete via Nominatim (OpenStreetMap)
 * 100% gratuit, aucune clé API requise.
 * Affiche directement le champ avec suggestions en temps réel.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const LocationInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Adresse, aéroport, gare, hôtel...',
  error,
  label,
  icon,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const wrapperRef  = useRef(null);
  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  /* ── Fermer dropdown si clic dehors ─────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Appel Nominatim avec debounce 400ms ─────────────────────────── */
  const fetchSuggestions = useCallback((query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q:                 query,
          format:            'json',
          addressdetails:    1,
          limit:             6,
          'accept-language': 'fr',
        });
        const res  = await fetch(`${NOMINATIM_URL}?${params}`, {
          signal:  abortRef.current.signal,
          headers: { 'Accept-Language': 'fr' },
        });
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setHighlighted(-1);
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  /* ── Changement de valeur ────────────────────────────────────────── */
  const handleChange = (e) => {
    onChange(e);
    fetchSuggestions(e.target.value);
  };

  /* ── Sélection d'une suggestion ──────────────────────────────────── */
  const selectSuggestion = (place) => {
    const a    = place.address || {};
    const main = a.amenity || a.tourism || a.road || a.aeroway
               || a.city   || a.town    || a.village || place.display_name;
    const city    = a.city    || a.town || a.village || '';
    const country = a.country || '';
    const text = [main, city, country].filter(Boolean).join(', ');

    onChange({ target: { name, value: text, type: 'text' } });
    setSuggestions([]);
    setOpen(false);
  };

  /* ── Navigation clavier ──────────────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes loc-spin { to { transform: rotate(360deg); } }
        .loc-item:hover { background: #f0fdf4 !important; }
      `}</style>

      <div style={{ position: 'relative', width: '100%' }} ref={wrapperRef}>

        {/* Label */}
        {label && (
          <label className="transport-label" htmlFor={id}>
            {icon}{label}
          </label>
        )}

        {/* Champ texte */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            id={id}
            name={name}
            className={`transport-input ${error ? 'error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            autoComplete="off"
            style={{ paddingRight: 36 }}
          />

          {/* Spinner ou icône pin */}
          <span style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8', display: 'flex', pointerEvents: 'none',
          }}>
            {loading ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                style={{ animation: 'loc-spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            )}
          </span>
        </div>

        {/* Dropdown suggestions */}
        {open && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#fff', border: '1.5px solid #e2e8f0',
            borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.1)',
            zIndex: 9999, overflow: 'hidden',
            maxHeight: 260, overflowY: 'auto',
          }}>
            {suggestions.map((place, i) => {
              const a    = place.address || {};
              const main = a.amenity || a.tourism || a.road || a.aeroway
                         || a.city   || a.town    || a.village || place.name || place.display_name;
              const sub  = [a.city || a.town || a.village, a.country]
                           .filter(Boolean).join(', ');
              return (
                <div
                  key={place.place_id}
                  className="loc-item"
                  onMouseDown={() => selectSuggestion(place)}
                  onMouseEnter={() => setHighlighted(i)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: i === highlighted ? '#f0fdf4' : 'transparent',
                    borderBottom: '1px solid #f8fafc',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#3dba6e" strokeWidth="2"
                    style={{ marginTop: 3, flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>
                      {main}
                    </div>
                    {sub && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {sub}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Crédit obligatoire OpenStreetMap */}
            <div style={{
              padding: '5px 14px', fontSize: 10, color: '#94a3b8',
              borderTop: '1px solid #f1f5f9', background: '#fafafa',
            }}>
              © OpenStreetMap contributors
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && <span className="transport-field-error">{error}</span>}
      </div>
    </>
  );
};

export default LocationInput;