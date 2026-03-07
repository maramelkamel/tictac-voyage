// src/pages/admin/transport/TransportForm.jsx
import React, { useState, useEffect } from 'react';

const EMPTY = { transport_name: '', transport_type: 'voiture', description: '', capacity_min: 1, capacity_max: 4, price_per_km: '', price_halfday: '', price_fullday: '', image_url: '', is_available: true };

const TYPES = [
  { id: 'voiture', label: 'Voiture',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:28,height:28}}><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2"/><circle cx="7.5" cy="14" r="1.5"/><circle cx="16.5" cy="14" r="1.5"/></svg> },
  { id: 'minibus', label: 'Minibus', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:28,height:28}}><rect x="2" y="6" width="20" height="11" rx="2"/><path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2M2 11h20"/><circle cx="6" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg> },
  { id: 'bus',     label: 'Bus',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:28,height:28}}><rect x="3" y="3" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5"/><circle cx="7" cy="21" r="1.5"/><circle cx="17" cy="21" r="1.5"/></svg> },
];

const TransportForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setForm(initialData ? { ...EMPTY, ...initialData, price_per_km: initialData.price_per_km ?? '', price_halfday: initialData.price_halfday ?? '', price_fullday: initialData.price_fullday ?? '' } : EMPTY);
    setErrors({}); setImgError(false);
  }, [initialData]);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(p => ({ ...p, [f]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.transport_name.trim())  e.transport_name = 'Le nom est requis';
    if (!form.capacity_max || Number(form.capacity_max) < 1) e.capacity_max = 'Capacité max requise';
    if (Number(form.capacity_min) > Number(form.capacity_max)) e.capacity_min = 'Min > Max';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, capacity_min: Number(form.capacity_min)||1, capacity_max: Number(form.capacity_max), price_per_km: form.price_per_km !== '' ? Number(form.price_per_km) : null, price_halfday: form.price_halfday !== '' ? Number(form.price_halfday) : null, price_fullday: form.price_fullday !== '' ? Number(form.price_fullday) : null });
  };

  return (
    <form className="al-form" onSubmit={handleSubmit} noValidate>

      {/* Nom */}
      <div className="al-field">
        <label className="al-label">Nom du transport <span className="al-required">*</span></label>
        <input className={`al-input ${errors.transport_name ? 'al-input--error' : ''}`}
          value={form.transport_name} onChange={e => set('transport_name', e.target.value)}
          placeholder="Ex: Mercedes Classe E, Vito 8 places..."/>
        {errors.transport_name && <span className="al-error">{errors.transport_name}</span>}
      </div>

      {/* Type */}
      <div className="al-field">
        <label className="al-label">Type de véhicule <span className="al-required">*</span></label>
        <div style={{ display: 'flex', gap: 10 }}>
          {TYPES.map(t => {
            const active = form.transport_type === t.id;
            return (
              <button key={t.id} type="button"
                style={{ flex: 1, padding: '12px 10px', borderRadius: 10, border: `1.5px solid ${active ? 'var(--primary)' : 'var(--g200)'}`, background: active ? 'rgba(15,76,92,.05)' : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, fontFamily: 'inherit', position: 'relative', transition: 'all .2s' }}
                onClick={() => set('transport_type', t.id)}>
                <span style={{ color: active ? 'var(--primary)' : 'var(--g400)' }}>{t.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--primary)' : 'var(--g600)' }}>{t.label}</span>
                {active && (
                  <span style={{ position: 'absolute', top: 7, right: 7, width: 17, height: 17, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ width: 9, height: 9 }}><path d="M20 6L9 17l-5-5"/></svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="al-field">
        <label className="al-label">Description</label>
        <textarea className="al-textarea" rows="3" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Confort, équipements, standing..."/>
      </div>

      {/* Capacité */}
      <div className="al-row-2">
        <div className="al-field">
          <label className="al-label">Capacité min</label>
          <input type="number" min="1" max="60" className={`al-input ${errors.capacity_min ? 'al-input--error' : ''}`} value={form.capacity_min} onChange={e => set('capacity_min', e.target.value)}/>
          {errors.capacity_min && <span className="al-error">{errors.capacity_min}</span>}
        </div>
        <div className="al-field">
          <label className="al-label">Capacité max <span className="al-required">*</span></label>
          <input type="number" min="1" max="60" className={`al-input ${errors.capacity_max ? 'al-input--error' : ''}`} value={form.capacity_max} onChange={e => set('capacity_max', e.target.value)}/>
          {errors.capacity_max && <span className="al-error">{errors.capacity_max}</span>}
        </div>
      </div>

      {/* Prix */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '.06em', paddingBottom: 10, borderBottom: '1px solid var(--g100)' }}>Tarification (optionnel)</div>
      <div className="al-row-3">
        {[
          { f: 'price_per_km',  l: 'Prix / km',     p: '2.50' },
          { f: 'price_halfday', l: '½ journée (~4h)',p: '250'  },
          { f: 'price_fullday', l: 'Journée (~8h)',  p: '450'  },
        ].map(({ f, l, p }) => (
          <div key={f} className="al-field">
            <label className="al-label">{l}</label>
            <div style={{ position: 'relative' }}>
              <input type="number" step="0.01" min="0" className="al-input" style={{ paddingRight: 28 }} value={form[f]} onChange={e => set(f, e.target.value)} placeholder={p}/>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: 'var(--g400)', pointerEvents: 'none' }}>€</span>
            </div>
          </div>
        ))}
      </div>

      {/* Image */}
      <div className="al-field">
        <label className="al-label">URL de l'image</label>
        <input className="al-input" value={form.image_url} onChange={e => { set('image_url', e.target.value); setImgError(false); }} placeholder="https://..."/>
        {form.image_url && !imgError && (
          <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--g200)', position: 'relative' }}>
            <img src={form.image_url} alt="aperçu" style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} onError={() => setImgError(true)}/>
            <button type="button" style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 6, background: 'rgba(0,0,0,.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => set('image_url', '')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 13, height: 13 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}
        {imgError && <span className="al-error">URL invalide</span>}
      </div>

      {/* Disponibilité */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--g200)', background: 'var(--g50)', cursor: 'pointer' }} onClick={() => set('is_available', !form.is_available)}>
        <div style={{ position: 'relative', width: 42, height: 22, borderRadius: 999, background: form.is_available ? 'var(--primary)' : 'var(--g300)', transition: 'background .25s', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 2, left: form.is_available ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .25s' }}/>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)' }}>Véhicule disponible</p>
          <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{form.is_available ? 'Visible et réservable' : 'Masqué temporairement'}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="al-form-footer">
        <button type="button" className="al-btn al-btn--ghost" onClick={onCancel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          Annuler
        </button>
        <button type="submit" className="al-btn al-btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {initialData ? <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></> : <path d="M12 5v14M5 12h14"/>}
          </svg>
          {initialData ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>

    </form>
  );
};

export default TransportForm;