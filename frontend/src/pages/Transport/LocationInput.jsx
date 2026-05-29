import React, { useState, useRef, useEffect, useCallback } from 'react';
// Tous les styles sont dans Transport.css — aucun style inline ici

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

  /* ── Formater les données d'une suggestion ───────────────────────── */
  const formatSuggestion = (place) => {
    const a    = place.address || {};
    const main = a.amenity || a.tourism || a.road || a.aeroway
               || a.city   || a.town    || a.village || place.name || place.display_name;
    const sub  = [a.city || a.town || a.village, a.country]
                 .filter(Boolean).join(', ');
    return { main, sub };
  };

  return (
    <div className="loc-wrapper" ref={wrapperRef}>

      {/* ── Label ── */}
      {label && (
        <label className="transport-label" htmlFor={id}>
          {icon}{label}
        </label>
      )}

      {/* ── Champ texte + icône ── */}
      <div className="loc-input-wrapper">
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
          aria-autocomplete="list"
          aria-expanded={open}
        />

        {/* Icône pin ou spinner */}
        <span className="loc-icon">
          {loading ? (
            /* Spinner pendant le chargement */
            <svg
              className="loc-spinner"
              width="15" height="15"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : (
            /* Icône pin statique */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          )}
        </span>
      </div>

      {/* ── Dropdown suggestions ── */}
      {open && suggestions.length > 0 && (
        <div className="loc-dropdown" role="listbox">

          {suggestions.map((place, i) => {
            const { main, sub } = formatSuggestion(place);
            return (
              <div
                key={place.place_id}
                role="option"
                aria-selected={i === highlighted}
                className={`loc-item ${i === highlighted ? 'loc-item--highlighted' : ''}`}
                onMouseDown={() => selectSuggestion(place)}
                onMouseEnter={() => setHighlighted(i)}
              >
                {/* Icône pin verte */}
                <svg
                  className="loc-item__icon"
                  width="13" height="13"
                  viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>

                {/* Texte */}
                <div>
                  <div className="loc-item__main">{main}</div>
                  {sub && <div className="loc-item__sub">{sub}</div>}
                </div>
              </div>
            );
          })}

          {/* Crédit OpenStreetMap — obligatoire selon conditions d'utilisation */}
          <div className="loc-footer">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            © OpenStreetMap contributors
          </div>
        </div>
      )}

      {/* ── Message d'erreur ── */}
      {error && <span className="transport-field-error">{error}</span>}
    </div>
  );
};

export default LocationInput;