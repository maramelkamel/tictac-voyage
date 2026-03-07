// src/pages/admin/transport/TransportForm.jsx
import React, { useState, useEffect } from 'react';

const EMPTY = {
  transport_name: '',
  transport_type: 'voiture',
  description:    '',
  capacity_min:   1,
  capacity_max:   4,
  price_per_km:   '',
  price_halfday:  '',
  price_fullday:  '',
  image_url:      '',
  is_available:   true,
};

const VEHICLE_TYPES = [
  {
    id: 'voiture', label: 'Voiture', emoji: '🚗',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2"/>
        <circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/>
      </svg>
    )
  },
  {
    id: 'minibus', label: 'Minibus', emoji: '🚐',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="11" rx="2"/>
        <path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2M2 11h20"/>
        <circle cx="6" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/>
      </svg>
    )
  },
  {
    id: 'bus', label: 'Bus', emoji: '🚌',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="16" rx="2"/>
        <path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/>
        <circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/>
      </svg>
    )
  },
];

const TransportForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setForm(initialData
      ? { ...EMPTY, ...initialData,
          price_per_km:  initialData.price_per_km  ?? '',
          price_halfday: initialData.price_halfday ?? '',
          price_fullday: initialData.price_fullday ?? '',
        }
      : EMPTY
    );
    setErrors({});
    setImgError(false);
  }, [initialData]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.transport_name.trim()) e.transport_name = 'Le nom est requis';
    if (!form.transport_type)        e.transport_type  = 'Le type est requis';
    if (!form.capacity_max || Number(form.capacity_max) < 1)
      e.capacity_max = 'La capacité maximale est requise';
    if (Number(form.capacity_min) > Number(form.capacity_max))
      e.capacity_min = 'La capacité min ne peut pas dépasser la max';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      capacity_min:  Number(form.capacity_min)  || 1,
      capacity_max:  Number(form.capacity_max),
      price_per_km:  form.price_per_km  !== '' ? Number(form.price_per_km)  : null,
      price_halfday: form.price_halfday !== '' ? Number(form.price_halfday) : null,
      price_fullday: form.price_fullday !== '' ? Number(form.price_fullday) : null,
    });
  };

  return (
    <form className="tf-form" onSubmit={handleSubmit} noValidate>

      {/* ── Nom ── */}
      <div className="tf-field">
        <label className="tf-label">
          Nom du transport <span className="tf-required">*</span>
        </label>
        <input
          className={`tf-input ${errors.transport_name ? 'tf-input--error' : ''}`}
          value={form.transport_name}
          onChange={(e) => set('transport_name', e.target.value)}
          placeholder="Ex: Mercedes Classe E, Vito 8 places..."
        />
        {errors.transport_name && <span className="tf-error">{errors.transport_name}</span>}
      </div>

      {/* ── Type de véhicule ── */}
      <div className="tf-field">
        <label className="tf-label">
          Type de véhicule <span className="tf-required">*</span>
        </label>
        <div className="tf-type-group">
          {VEHICLE_TYPES.map((vt) => (
            <button key={vt.id} type="button"
              className={`tf-type-btn ${form.transport_type === vt.id ? 'active' : ''}`}
              onClick={() => set('transport_type', vt.id)}>
              <span className="tf-type-btn__icon">{vt.icon}</span>
              <span className="tf-type-btn__label">{vt.label}</span>
              {form.transport_type === vt.id && (
                <span className="tf-type-btn__check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
        {errors.transport_type && <span className="tf-error">{errors.transport_type}</span>}
      </div>

      {/* ── Description ── */}
      <div className="tf-field">
        <label className="tf-label">Description</label>
        <textarea className="tf-textarea" rows="3"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Décrivez le confort, les équipements, le standing du véhicule..."
        />
      </div>

      {/* ── Capacité ── */}
      <div className="tf-row">
        <div className="tf-field">
          <label className="tf-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            Capacité min
          </label>
          <input type="number" min="1" max="60"
            className={`tf-input ${errors.capacity_min ? 'tf-input--error' : ''}`}
            value={form.capacity_min}
            onChange={(e) => set('capacity_min', e.target.value)}
          />
          {errors.capacity_min && <span className="tf-error">{errors.capacity_min}</span>}
        </div>
        <div className="tf-field">
          <label className="tf-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Capacité max <span className="tf-required">*</span>
          </label>
          <input type="number" min="1" max="60"
            className={`tf-input ${errors.capacity_max ? 'tf-input--error' : ''}`}
            value={form.capacity_max}
            onChange={(e) => set('capacity_max', e.target.value)}
          />
          {errors.capacity_max && <span className="tf-error">{errors.capacity_max}</span>}
        </div>
      </div>

      {/* ── Prix ── */}
      <div className="tf-section-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Tarification (optionnel)
      </div>
      <div className="tf-row tf-row--3">
        <div className="tf-field">
          <label className="tf-label">Prix / km</label>
          <div className="tf-input-addon">
            <input type="number" step="0.01" min="0"
              className="tf-input"
              value={form.price_per_km}
              onChange={(e) => set('price_per_km', e.target.value)}
              placeholder="2.50"
            />
            <span className="tf-addon">€</span>
          </div>
        </div>
        <div className="tf-field">
          <label className="tf-label">½ journée (~4h)</label>
          <div className="tf-input-addon">
            <input type="number" step="0.01" min="0"
              className="tf-input"
              value={form.price_halfday}
              onChange={(e) => set('price_halfday', e.target.value)}
              placeholder="250"
            />
            <span className="tf-addon">€</span>
          </div>
        </div>
        <div className="tf-field">
          <label className="tf-label">Journée (~8h)</label>
          <div className="tf-input-addon">
            <input type="number" step="0.01" min="0"
              className="tf-input"
              value={form.price_fullday}
              onChange={(e) => set('price_fullday', e.target.value)}
              placeholder="450"
            />
            <span className="tf-addon">€</span>
          </div>
        </div>
      </div>

      {/* ── Image ── */}
      <div className="tf-field">
        <label className="tf-label">URL de l'image</label>
        <input className="tf-input"
          value={form.image_url}
          onChange={(e) => { set('image_url', e.target.value); setImgError(false); }}
          placeholder="https://images.unsplash.com/..."
        />
        {form.image_url && !imgError && (
          <div className="tf-preview">
            <img src={form.image_url} alt="aperçu"
              onError={() => setImgError(true)}
            />
            <button type="button" className="tf-preview__remove"
              onClick={() => set('image_url', '')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
        {imgError && <span className="tf-error">URL invalide ou image inaccessible</span>}
      </div>

      {/* ── Disponibilité ── */}
      <label className="tf-toggle">
        <div className="tf-toggle__track" data-on={form.is_available}>
          <input type="checkbox"
            checked={form.is_available}
            onChange={(e) => set('is_available', e.target.checked)}
          />
          <span className="tf-toggle__thumb"/>
        </div>
        <div>
          <span className="tf-toggle__label">Véhicule disponible</span>
          <span className="tf-toggle__sub">
            {form.is_available
              ? 'Visible sur le site et réservable'
              : 'Masqué temporairement pour les clients'}
          </span>
        </div>
      </label>

      {/* ── Actions ── */}
      <div className="tf-actions">
        <button type="button" className="ta-btn ta-btn--ghost" onClick={onCancel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Annuler
        </button>
        <button type="submit" className="ta-btn ta-btn--primary">
          {initialData ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Enregistrer les modifications
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Ajouter le transport
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransportForm;