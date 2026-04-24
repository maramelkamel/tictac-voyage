import React, { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API_PKG = 'http://localhost:5000/api/omra/packages';
const COVERS_API = 'http://localhost:5000/api/omra/packages/omra-covers';

const fPrice = (price) => (
  price !== null && price !== undefined && price !== ''
    ? `${Number(price).toLocaleString('fr-TN')} TND`
    : '-'
);

const EMPTY = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  price: '',
  old_price: '',
  duration: '',
  departure: '',
  spots: '50',
  rating: '5',
  reviews: '0',
  badge: '',
  includes: [],
  is_active: true,
};

const DEFAULT_COVERS = {
  hero: {
    bg_image: '',
    tag: 'Pelerinage et spiritualite',
    title: 'Votre voyage',
    title_accent: 'spirituel ideal',
    sub: 'Accomplissez votre Omra en toute serenite avec des forfaits concus pour une experience claire, confortable et bien accompagnee.',
  },
};

const ModalField = ({ label, req, children }) => (
  <div className="al-field">
    <label className="al-label">
      {label} {req && <span className="al-required">*</span>}
    </label>
    {children}
  </div>
);

const EditableList = ({ label, items = [], onChange, placeholder = 'Ajouter un element...' }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewItem('');
  };

  const updateItem = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="al-label">{label}</label>

      {items.map((item, index) => (
        <div key={`${label}-${index}`} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            className="al-input"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={`${label} ${index + 1}`}
          />
          <button
            type="button"
            className="al-btn al-btn--danger"
            style={{ padding: '10px 12px' }}
            onClick={() => removeItem(index)}
          >
            Retirer
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="al-input"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
        />
        <button type="button" className="al-btn al-btn--ghost" onClick={addItem}>
          Ajouter
        </button>
      </div>
    </div>
  );
};

const CoversModal = ({ covers, onClose, onSaved, notify }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hero: { ...DEFAULT_COVERS.hero, ...(covers?.hero || {}) },
  });

  const setHero = (key, value) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch(COVERS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        notify('Apparence Omra mise a jour');
        onSaved(form);
      } else {
        notify(json.message || 'Erreur lors de la mise a jour', 'error');
      }
    } catch {
      notify('Erreur reseau', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div
        className="al-modal"
        style={{ maxWidth: 760, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon" style={{ background: 'linear-gradient(135deg,#be185d,#e8306a)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div>
              <h2>Apparence de la page Omra</h2>
              <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>
                Modifiez le hero sans toucher a la base.
              </p>
            </div>
          </div>

          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', display: 'grid', gap: 18 }}>
          <div
            style={{
              position: 'relative',
              minHeight: 220,
              overflow: 'hidden',
              borderRadius: 18,
              border: '1.5px solid var(--g200)',
              background: 'linear-gradient(135deg,#7c1034 0%,#be185d 55%,#7c1034 100%)',
            }}
          >
            {form.hero.bg_image && (
              <img
                src={form.hero.bg_image}
                alt="Hero Omra"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,.48)' }} />
            <div style={{ position: 'relative', padding: '28px 30px', color: '#fff', display: 'grid', gap: 12 }}>
              <span
                style={{
                  width: 'fit-content',
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,.24)',
                  background: 'rgba(255,255,255,.12)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}
              >
                {form.hero.tag || DEFAULT_COVERS.hero.tag}
              </span>
              <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1, fontWeight: 900 }}>
                {form.hero.title || DEFAULT_COVERS.hero.title}
                <br />
                <span style={{ color: '#f9a8d4' }}>
                  {form.hero.title_accent || DEFAULT_COVERS.hero.title_accent}
                </span>
              </h1>
              <p style={{ margin: 0, maxWidth: 560, color: 'rgba(255,255,255,.86)', lineHeight: 1.6, fontSize: 13 }}>
                {form.hero.sub || DEFAULT_COVERS.hero.sub}
              </p>
            </div>
          </div>

          <ModalField label="Image de fond">
            <input
              className="al-input"
              value={form.hero.bg_image}
              onChange={(e) => setHero('bg_image', e.target.value)}
              placeholder="https://..."
            />
          </ModalField>

          <ModalField label="Tag hero">
            <input
              className="al-input"
              value={form.hero.tag}
              onChange={(e) => setHero('tag', e.target.value)}
              placeholder="Pelerinage et spiritualite"
            />
          </ModalField>

          <div className="al-row-2">
            <ModalField label="Titre principal">
              <input
                className="al-input"
                value={form.hero.title}
                onChange={(e) => setHero('title', e.target.value)}
                placeholder="Votre voyage"
              />
            </ModalField>

            <ModalField label="Titre accent">
              <input
                className="al-input"
                value={form.hero.title_accent}
                onChange={(e) => setHero('title_accent', e.target.value)}
                placeholder="spirituel ideal"
              />
            </ModalField>
          </div>

          <ModalField label="Sous-texte">
            <textarea
              className="al-textarea"
              rows={4}
              value={form.hero.sub}
              onChange={(e) => setHero('sub', e.target.value)}
              placeholder="Sous texte du hero..."
            />
          </ModalField>
        </div>

        <div className="al-form-footer" style={{ flexShrink: 0 }}>
          <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="al-btn al-btn--primary"
            onClick={handleSave}
            disabled={loading}
            style={{ background: 'linear-gradient(135deg,#be185d,#e8306a)', borderColor: 'transparent' }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer apparence'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const isEdit = !!pkg;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(pkg || {}),
    price: pkg?.price ? String(pkg.price) : '',
    old_price: pkg?.old_price ? String(pkg.old_price) : '',
    duration: pkg?.duration ? String(pkg.duration) : '',
    spots: pkg?.spots ? String(pkg.spots) : '50',
    rating: pkg?.rating ? String(pkg.rating) : '5',
    reviews: pkg?.reviews ? String(pkg.reviews) : '0',
    includes: Array.isArray(pkg?.includes)
      ? pkg.includes.map((item) => (typeof item === 'string' ? item : item?.label || '')).filter(Boolean)
      : [],
    is_active: pkg?.is_active !== false,
  }));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'detail', label: 'Details' },
    { key: 'media', label: 'Medias' },
    { key: 'advanced', label: 'Avance' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price || !form.duration) {
      notify('Titre, prix et duree sont obligatoires', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(isEdit ? `${API_PKG}/${pkg.id}` : API_PKG, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          old_price: form.old_price ? Number(form.old_price) : null,
          duration: Number(form.duration),
          spots: form.spots ? Number(form.spots) : 50,
          rating: form.rating ? Number(form.rating) : 5,
          reviews: form.reviews ? Number(form.reviews) : 0,
          includes: form.includes.filter(Boolean),
        }),
      });
      const json = await res.json();

      if (json.success) {
        notify(isEdit ? 'Forfait Omra mis a jour' : 'Forfait Omra cree');
        onSaved();
      } else {
        notify(json.message || 'Erreur lors de l enregistrement', 'error');
      }
    } catch {
      notify('Erreur reseau', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div
        className="al-modal"
        style={{ maxWidth: 760, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>
            </div>
            <div>
              <h2>{isEdit ? 'Modifier le forfait Omra' : 'Nouveau forfait Omra'}</h2>
              <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>
                Meme logique de formulaire que les circuits, adaptee aux champs Omra existants.
              </p>
            </div>
          </div>

          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--g200)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--g500)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form className="al-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeTab === 'general' && (
              <>
                <ModalField label="Titre" req>
                  <input
                    className="al-input"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="Ex: Omra Ramadan Premium"
                    required
                  />
                </ModalField>

                <ModalField label="Sous-titre">
                  <input
                    className="al-input"
                    value={form.subtitle}
                    onChange={(e) => set('subtitle', e.target.value)}
                    placeholder="Ex: Hotel proche Haram, guide francophone"
                  />
                </ModalField>

                <ModalField label="Description">
                  <textarea
                    className="al-textarea"
                    rows={5}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Description complete du forfait Omra..."
                  />
                </ModalField>

                <div className="al-row-2">
                  <ModalField label="Badge">
                    <select className="al-select" value={form.badge} onChange={(e) => set('badge', e.target.value)}>
                      <option value="">Aucun</option>
                      <option value="Populaire">Populaire</option>
                      <option value="Nouveau">Nouveau</option>
                      <option value="Promo">Promo</option>
                      <option value="VIP">VIP</option>
                      <option value="Dernieres places">Dernieres places</option>
                    </select>
                  </ModalField>

                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: 28 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--g700)' }}>
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => set('is_active', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                      />
                      Forfait actif sur le site
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'detail' && (
              <>
                <div className="al-row-2">
                  <ModalField label="Prix (TND)" req>
                    <input
                      className="al-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                      placeholder="3500"
                      required
                    />
                  </ModalField>

                  <ModalField label="Ancien prix (TND)">
                    <input
                      className="al-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.old_price}
                      onChange={(e) => set('old_price', e.target.value)}
                      placeholder="4000"
                    />
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Duree (jours)" req>
                    <input
                      className="al-input"
                      type="number"
                      min="1"
                      value={form.duration}
                      onChange={(e) => set('duration', e.target.value)}
                      placeholder="10"
                      required
                    />
                  </ModalField>

                  <ModalField label="Depart">
                    <input
                      className="al-input"
                      value={form.departure}
                      onChange={(e) => set('departure', e.target.value)}
                      placeholder="Ex: 15 Mars 2026"
                    />
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Nombre de places">
                    <input
                      className="al-input"
                      type="number"
                      min="0"
                      value={form.spots}
                      onChange={(e) => set('spots', e.target.value)}
                      placeholder="50"
                    />
                  </ModalField>

                  <div className="al-row-2" style={{ margin: 0 }}>
                    <ModalField label="Note">
                      <input
                        className="al-input"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={form.rating}
                        onChange={(e) => set('rating', e.target.value)}
                        placeholder="5"
                      />
                    </ModalField>

                    <ModalField label="Avis">
                      <input
                        className="al-input"
                        type="number"
                        min="0"
                        value={form.reviews}
                        onChange={(e) => set('reviews', e.target.value)}
                        placeholder="0"
                      />
                    </ModalField>
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 10, border: '1.5px solid rgba(16,185,129,.2)', background: 'rgba(16,185,129,.04)' }}>
                  <EditableList
                    label="Ce qui est inclus"
                    items={form.includes}
                    onChange={(value) => set('includes', value)}
                    placeholder="Ex: Vol inclus"
                  />
                </div>
              </>
            )}

            {activeTab === 'media' && (
              <>
                <ModalField label="Image principale">
                  <input
                    className="al-input"
                    value={form.image_url}
                    onChange={(e) => set('image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </ModalField>

                {form.image_url && (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--g200)' }}>
                    <img
                      src={form.image_url}
                      alt="Apercu"
                      style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <p style={{ margin: 0, padding: '6px 10px', fontSize: 11, color: 'var(--g400)' }}>
                      Apercu image principale
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'advanced' && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ padding: 14, borderRadius: 12, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--g700)' }}>Resume</p>
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--g500)' }}>Titre</span>
                      <strong style={{ fontSize: 12, color: 'var(--g800)', textAlign: 'right' }}>{form.title || '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--g500)' }}>Prix</span>
                      <strong style={{ fontSize: 12, color: 'var(--g800)' }}>{form.price || '-'} TND</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--g500)' }}>Duree</span>
                      <strong style={{ fontSize: 12, color: 'var(--g800)' }}>{form.duration || '-'} jours</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--g500)' }}>Elements inclus</span>
                      <strong style={{ fontSize: 12, color: 'var(--g800)' }}>{form.includes.length}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 14, borderRadius: 12, border: '1px solid rgba(15,76,92,.12)', background: 'rgba(15,76,92,.04)' }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--g600)', lineHeight: 1.6 }}>
                    Le formulaire Omra suit maintenant le meme format d ajout et d edition que les circuits.
                    Les champs affiches correspondent uniquement a ce qui existe deja dans votre base de donnees.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="al-form-footer" style={{ flexShrink: 0 }}>
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="al-btn al-btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Creer le forfait'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OmraDetail = ({ pkg, onClose, onEdit, onDelete, isMain }) => {
  const available = pkg.available_spots !== undefined ? Number(pkg.available_spots) : Number(pkg.spots);
  const total = Number(pkg.spots) || 0;
  const isFull = available <= 0;
  const isLow = available > 0 && available <= 5;
  const includes = Array.isArray(pkg.includes)
    ? pkg.includes.map((item) => (typeof item === 'string' ? item : item?.label || '')).filter(Boolean)
    : [];

  const InfoRow = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 8,
          background: 'var(--g50)',
          border: '1px solid var(--g100)',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--g500)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g800)' }}>{value}</span>
      </div>
    );
  };

  return (
    <div style={{ width: 380, borderLeft: '1px solid var(--g200)', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 18, borderBottom: '1px solid var(--g100)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--g900)' }}>{pkg.title}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--g400)' }}>Apercu du forfait Omra</p>
        </div>
        <button className="al-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={pkg.title}
            style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--g200)' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              height: 180,
              borderRadius: 14,
              border: '1px solid var(--g200)',
              background: 'linear-gradient(135deg,#7c1034,#e8306a)',
            }}
          />
        )}

        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--g400)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Prix
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)' }}>{fPrice(pkg.price)}</span>
            {pkg.old_price && (
              <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--g400)' }}>
                {fPrice(pkg.old_price)}
              </span>
            )}
          </div>
          {pkg.badge && (
            <span
              style={{
                display: 'inline-flex',
                marginTop: 8,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(232,48,106,.1)',
                color: '#b91c4a',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {pkg.badge}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <InfoRow label="Duree" value={pkg.duration ? `${pkg.duration} jours` : '-'} />
          <InfoRow label="Depart" value={pkg.departure || '-'} />
          <InfoRow label="Note" value={`${Number(pkg.rating || 5)} / 5`} />
          <InfoRow label="Avis" value={Number(pkg.reviews || 0)} />
          <InfoRow label="Reservations" value={Number(pkg.reservation_count || 0)} />
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: isFull ? '#fee2e2' : isLow ? '#fff7ed' : '#d1fae5',
            border: `1px solid ${isFull ? '#fca5a5' : isLow ? '#fed7aa' : '#a7f3d0'}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: isFull ? '#991b1b' : isLow ? '#92400e' : '#065f46', fontWeight: 700 }}>
            {isFull ? 'Complet' : `Places disponibles: ${available} / ${total}`}
          </p>
        </div>

        {pkg.description && (
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--g400)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Description
            </p>
            <p style={{ margin: 0, color: 'var(--g600)', lineHeight: 1.7, fontSize: 13 }}>{pkg.description}</p>
          </div>
        )}

        {includes.length > 0 && (
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--g400)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Inclus
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {includes.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    background: 'rgba(15,76,92,.08)',
                    color: 'var(--primary)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 18, borderTop: '1px solid var(--g100)', display: 'flex', gap: 8 }}>
        <button className="al-btn al-btn--primary" style={{ flex: 1 }} onClick={() => { onEdit(pkg); onClose(); }}>
          Modifier
        </button>
        <button
          className="al-btn al-btn--danger"
          onClick={() => { onDelete(pkg.id); onClose(); }}
          title={isMain ? 'Supprimer ce forfait' : 'Reserve a l administrateur principal'}
          style={{ opacity: isMain ? 1 : 0.45, cursor: isMain ? 'pointer' : 'not-allowed' }}
        >
          {isMain ? 'Supprimer' : 'Supprimer'}
        </button>
      </div>
    </div>
  );
};

const OmraPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCovers, setShowCovers] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [selected, setSelected] = useState(null);
  const [covers, setCovers] = useState(DEFAULT_COVERS);

  const isMain = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main';
    } catch {
      return false;
    }
  })();

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_PKG, { cache: 'no-store' });
      const json = await res.json();
      setPackages(json.data || []);
    } catch {
      notify('Impossible de charger les forfaits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCovers = async () => {
    try {
      const res = await fetch(COVERS_API, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setCovers({ hero: { ...DEFAULT_COVERS.hero, ...(json.data.hero || {}) } });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchCovers();
  }, []);

  const handleDelete = async (id) => {
    if (!isMain) {
      notify('Seul l administrateur principal peut supprimer un forfait', 'error');
      return;
    }

    if (!window.confirm('Supprimer ce forfait ? Les reservations existantes ne seront pas supprimees.')) return;

    try {
      const res = await fetch(`${API_PKG}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        notify('Forfait Omra supprime');
        setSelected(null);
        fetchPackages();
      } else {
        notify(json.message || 'Erreur suppression', 'error');
      }
    } catch {
      notify('Erreur reseau', 'error');
    }
  };

  const stats = {
    total: packages.length,
    active: packages.filter((item) => item.is_active).length,
    inactive: packages.filter((item) => !item.is_active).length,
    totalReservations: packages.reduce((sum, item) => sum + (parseInt(item.reservation_count, 10) || 0), 0),
  };

  return (
    <AdminLayout
      title="Forfaits Omra"
      breadcrumb={[{ label: 'Omra' }, { label: 'Forfaits', active: true }]}
      actions={(
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="al-btn al-btn--ghost" onClick={() => setShowCovers(true)}>
            Apparence page
          </button>
          <button
            className="al-btn al-btn--primary"
            onClick={() => {
              setEditPkg(null);
              setShowModal(true);
            }}
          >
            Nouveau forfait
          </button>
        </div>
      )}
      toast={toast}
    >
      <div className="al-stats al-stats--4">
        {[
          { label: 'Total forfaits', value: stats.total, color: 'blue', icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></> },
          { label: 'Actifs', value: stats.active, color: 'green', icon: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></> },
          { label: 'Inactifs', value: stats.inactive, color: 'gray', icon: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></> },
          { label: 'Reservations', value: stats.totalReservations, color: 'teal', icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></> },
        ].map((stat) => (
          <div key={stat.label} className={`al-stat al-stat--${stat.color}`}>
            <div className="al-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {stat.icon}
              </svg>
            </div>
            <div>
              <p className="al-stat__value">{stat.value}</p>
              <p className="al-stat__label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {covers?.hero && (
        <div style={{ margin: '0 32px 16px' }}>
          <div
            onClick={() => setShowCovers(true)}
            style={{
              height: 76,
              borderRadius: 14,
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              border: '1.5px solid var(--g200)',
              background: 'linear-gradient(135deg,#7c1034,#be185d)',
            }}
          >
            {covers.hero.bg_image && (
              <img
                src={covers.hero.bg_image}
                alt="Hero Omra"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.34 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.32)' }} />
            <div style={{ position: 'relative', height: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#fff' }}>
                  {covers.hero.title}{' '}
                  <span style={{ color: '#f9a8d4' }}>{covers.hero.title_accent}</span>
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,.76)' }}>
                  Hero Omra actuel - cliquer pour modifier
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          margin: '0 32px 32px',
          background: '#fff',
          borderRadius: 16,
          border: '1px solid var(--g200)',
          boxShadow: '0 4px 12px rgba(15,76,92,.08)',
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="al-toolbar">
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--g800)', flex: 1 }}>Liste des forfaits Omra</p>
            <button className="al-btn al-btn--ghost" onClick={fetchPackages}>
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap">
                <div className="al-spinner" />
              </div>
              <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="al-empty__title">Aucun forfait Omra</p>
              <p className="al-empty__sub">Creez votre premier forfait avec le meme format que les circuits.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Forfait</th>
                    <th>Prix</th>
                    <th>Duree</th>
                    <th>Depart</th>
                    <th>Places</th>
                    <th>Reservations</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => {
                    const available = pkg.available_spots !== undefined ? Number(pkg.available_spots) : Number(pkg.spots);
                    const total = Number(pkg.spots) || 0;
                    const isSelected = selected?.id === pkg.id;
                    const isLow = available > 0 && available <= 5;
                    const isFull = available <= 0;

                    return (
                      <tr
                        key={pkg.id}
                        className={`al-row ${isSelected ? 'al-row--selected' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelected(isSelected ? null : pkg)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {pkg.image_url ? (
                              <img
                                src={pkg.image_url}
                                alt={pkg.title}
                                style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--g200)' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 8,
                                  flexShrink: 0,
                                  background: 'linear-gradient(135deg,#7c1034,#e8306a)',
                                }}
                              />
                            )}

                            <div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>
                                {pkg.title}
                                {pkg.badge && (
                                  <span
                                    style={{
                                      marginLeft: 7,
                                      padding: '2px 7px',
                                      borderRadius: 999,
                                      background: '#fff1f2',
                                      color: '#be123c',
                                      fontSize: 10,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {pkg.badge}
                                  </span>
                                )}
                              </p>
                              {pkg.subtitle && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--g400)' }}>{pkg.subtitle}</p>}
                            </div>
                          </div>
                        </td>

                        <td>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{fPrice(pkg.price)}</p>
                          {pkg.old_price && (
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--g400)', textDecoration: 'line-through' }}>
                              {fPrice(pkg.old_price)}
                            </p>
                          )}
                        </td>

                        <td><span style={{ fontWeight: 600, fontSize: 13 }}>{pkg.duration} j</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--g600)' }}>{pkg.departure || '-'}</span></td>

                        <td>
                          <span style={{ fontWeight: 700, fontSize: 13, color: isFull ? '#e92f64' : isLow ? '#f97316' : '#065f46' }}>
                            {isFull ? 'Complet' : `${available} / ${total}`}
                          </span>
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 999,
                              background: 'rgba(15,76,92,.08)',
                              color: 'var(--primary)',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {pkg.reservation_count || 0} inscrit{Number(pkg.reservation_count || 0) > 1 ? 's' : ''}
                          </span>
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '3px 9px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 600,
                              background: pkg.is_active ? '#d1fae5' : 'var(--g100)',
                              color: pkg.is_active ? '#065f46' : 'var(--g500)',
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: pkg.is_active ? '#10b981' : 'var(--g400)',
                              }}
                            />
                            {pkg.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>

                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="al-action-btn al-action-btn--edit"
                              onClick={() => {
                                setEditPkg(pkg);
                                setShowModal(true);
                              }}
                              title="Modifier"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            <button
                              className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(pkg.id)}
                              title={isMain ? 'Supprimer' : 'Reserve a l administrateur principal'}
                              style={{ opacity: isMain ? 1 : 0.45, cursor: isMain ? 'pointer' : 'not-allowed' }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="al-table-footer">
            <p className="al-count">{packages.length} forfait{packages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {selected && (
          <OmraDetail
            pkg={selected}
            onClose={() => setSelected(null)}
            onEdit={(item) => {
              setEditPkg(item);
              setShowModal(true);
            }}
            onDelete={handleDelete}
            isMain={isMain}
          />
        )}
      </div>

      {showModal && (
        <PkgModal
          pkg={editPkg}
          onClose={() => {
            setShowModal(false);
            setEditPkg(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditPkg(null);
            fetchPackages();
          }}
          notify={notify}
        />
      )}

      {showCovers && (
        <CoversModal
          covers={covers}
          onClose={() => setShowCovers(false)}
          onSaved={(newCovers) => {
            setCovers(newCovers);
            setShowCovers(false);
          }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default OmraPackages;
