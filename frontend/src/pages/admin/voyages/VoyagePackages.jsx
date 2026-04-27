import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API        = 'http://localhost:5000/api/voyages-organises';
const COVERS_API = 'http://localhost:5000/api/voyages-organises/voyage-covers';
const MEDIA_API  = 'http://localhost:5000/api/media/upload';

const fPrice = (p) => (p ? Number(p).toLocaleString('fr-TN') + ' TND' : '—');

const DEFAULT_COVER = {
  hero: {
    bg_image:     '',
    tag:          '✈️ Agence de voyages organisés',
    title:        'Découvrez le monde,',
    title_accent: 'sans contraintes',
    sub:          "Des séjours clé en main conçus par nos experts pour vous offrir l'expérience parfaite.",
  },
};

const EMPTY = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  gallery: [],
  pays: '',
  destination: '',
  price: '',
  old_price: '',
  duration: '',
  departure: '',
  spots: '30',
  continent: '',
  saison: '',
  budget: '',
  categorie: '',
  badge: '',
  rating: '5',
  reviews: '0',
  programme: [],
  inclus: [],
  non_inclus: [],
  is_active: true,
};

// ─────────────────────────────────────────────────────────────
// Composants utilitaires partagés
// ─────────────────────────────────────────────────────────────

const ModalField = ({ label, req, children }) => (
  <div className="al-field">
    <label className="al-label">{label} {req && <span className="al-required">*</span>}</label>
    {children}
  </div>
);

const EditableList = ({ label, items = [], onChange, placeholder = 'Ajouter un element...', multiline = false }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewItem('');
  };

  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  const updateItem = (index, value) => {
    const nextItems = [...items];
    nextItems[index] = value;
    onChange(nextItems);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="al-label">{label}</label>

      {items.map((item, index) => (
        <div key={`${label}-${index}`} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          {multiline ? (
            <textarea
              className="al-textarea"
              rows={2}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              style={{ flex: 1, fontSize: 12, resize: 'vertical' }}
            />
          ) : (
            <input
              className="al-input"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              style={{ flex: 1, fontSize: 12 }}
            />
          )}
          <button
            type="button"
            onClick={() => removeItem(index)}
            style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: 6,
              border: '1px solid #e92f64', background: 'rgba(233,47,100,.08)',
              color: '#e92f64', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: multiline ? 4 : 0,
            }}
          >✕</button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 6 }}>
        {multiline ? (
          <textarea
            className="al-textarea"
            rows={2}
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            style={{ flex: 1, fontSize: 12, resize: 'vertical' }}
          />
        ) : (
          <input
            className="al-input"
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
            style={{ flex: 1, fontSize: 12 }}
          />
        )}
        <button
          type="button"
          onClick={addItem}
          style={{
            flexShrink: 0, padding: '0 14px', borderRadius: 6,
            border: '1px solid var(--primary, #0f4c5c)', background: 'rgba(15,76,92,.1)',
            color: 'var(--primary, #0f4c5c)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            height: 36,
          }}
        >+ Ajouter</button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>
        {items.length} element{items.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Modal apparence (hero cover)
// ─────────────────────────────────────────────────────────────

const CoversModal = ({ covers, onClose, onSaved, notify }) => {
  const [form, setForm] = useState({
    hero: { ...DEFAULT_COVER.hero, ...(covers?.hero || {}) },
  });
  const [loading, setLoading] = useState(false);

  const setHero = (key, val) => setForm(p => ({ ...p, hero: { ...p.hero, [key]: val } }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(COVERS_API, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        notify('Apparence mise à jour ✅');
        onSaved(form);
      } else {
        notify(json.message || 'Erreur', 'error');
      }
    } catch {
      notify('Erreur réseau', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div
        className="al-modal"
        style={{ maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <div>
              <h2>Apparence de la page Voyages Organisés</h2>
              <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>
                Modifiez l'image hero, les titres et le tag de la page publique
              </p>
            </div>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Aperçu live */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
              Aperçu du bandeau hero
            </p>
            <div style={{
              borderRadius: 16, overflow: 'hidden', position: 'relative', height: 210,
              background: 'linear-gradient(135deg,#0f4c5c 0%,#1a7a8a 50%,#0f4c5c 100%)',
              border: '2px solid var(--g200)', boxShadow: '0 4px 20px rgba(0,0,0,.1)',
            }}>
              {form.hero.bg_image && (
                <img
                  src={form.hero.bg_image}
                  alt="hero bg"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .45 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,40,55,.55)' }}/>
              <div style={{ position: 'relative', padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', color: '#fff' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,.25)', borderRadius: 999,
                  padding: '4px 14px', fontSize: 11, fontWeight: 700,
                  width: 'fit-content', marginBottom: 12,
                }}>
                  {form.hero.tag || '✈️ Agence de voyages organisés'}
                </span>
                <h1 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.25, margin: 0 }}>
                  {form.hero.title || 'Découvrez le monde,'}<br/>
                  <span style={{ color: '#1ecad3' }}>
                    {form.hero.title_accent || 'sans contraintes'}
                  </span>
                </h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', marginTop: 8, lineHeight: 1.5, maxWidth: 480 }}>
                  {form.hero.sub || "Des séjours clé en main conçus par nos experts pour vous offrir l'expérience parfaite."}
                </p>
              </div>
            </div>
          </div>

          {/* Image de fond */}
          <div className="al-field">
            <label className="al-label">URL de l'image de fond</label>
            <input
              className="al-input"
              placeholder="https://images.unsplash.com/..."
              value={form.hero.bg_image}
              onChange={e => setHero('bg_image', e.target.value)}
            />
            <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 4 }}>
              L'image sera assombrie automatiquement pour garantir la lisibilité du texte.
            </p>
          </div>

          {/* Suggestions d'images */}
          <div>
            <p style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 8, fontWeight: 600 }}>
              Suggestions d'images :
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
              {[
                { label: 'Voyage monde',    url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80' },
                { label: 'Istanbul',        url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1600' },
                { label: 'Paris',           url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600' },
                { label: 'Avion nuages',    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600' },
                { label: 'Plage tropicale', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600' },
                { label: 'Montagne',        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600' },
              ].map(s => (
                <div
                  key={s.label}
                  onClick={() => setHero('bg_image', s.url)}
                  style={{
                    borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    border: form.hero.bg_image === s.url ? '2.5px solid var(--primary)' : '1.5px solid var(--g200)',
                    transition: 'all .15s',
                  }}
                >
                  <img
                    src={s.url}
                    alt={s.label}
                    style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.background = '#f1f5f9'; }}
                  />
                  <p style={{
                    fontSize: 10, padding: '4px 6px', margin: 0, fontWeight: 600,
                    color: form.hero.bg_image === s.url ? 'var(--primary)' : 'var(--g600)',
                    background: form.hero.bg_image === s.url ? 'rgba(15,76,92,.08)' : 'transparent',
                  }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tag */}
          <div className="al-field">
            <label className="al-label">Tag / Étiquette</label>
            <input
              className="al-input"
              placeholder="✈️ Agence de voyages organisés"
              value={form.hero.tag}
              onChange={e => setHero('tag', e.target.value)}
            />
          </div>

          {/* Titres */}
          <div className="al-row-2">
            <div className="al-field">
              <label className="al-label">Titre principal</label>
              <input
                className="al-input"
                placeholder="Découvrez le monde,"
                value={form.hero.title}
                onChange={e => setHero('title', e.target.value)}
              />
            </div>
            <div className="al-field">
              <label className="al-label">Titre accentué (couleur turquoise)</label>
              <input
                className="al-input"
                placeholder="sans contraintes"
                value={form.hero.title_accent}
                onChange={e => setHero('title_accent', e.target.value)}
              />
            </div>
          </div>

          {/* Sous-titre */}
          <div className="al-field">
            <label className="al-label">Sous-titre</label>
            <textarea
              className="al-textarea"
              rows={3}
              value={form.hero.sub}
              onChange={e => setHero('sub', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="al-form-footer" style={{
          flexShrink: 0, borderTop: '1px solid var(--g200)',
          padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
          <button
            type="button"
            className="al-btn al-btn--primary"
            disabled={loading}
            onClick={handleSave}
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderColor: 'transparent' }}
          >
            {loading ? 'Enregistrement...' : "💾 Enregistrer l'apparence"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Galerie (URLs + upload) ───────────────────────────────────
const GalleryEditor = ({ images = [], onChange, notify }) => {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const getToken = () => localStorage.getItem('adminToken') || '';

  const addImage = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onChange([...(images || []), trimmed]);
    setNewUrl('');
  };

  const removeImage = (index) => onChange((images || []).filter((_, i) => i !== index));

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      notify?.('Veuillez sélectionner une image (jpg/png/webp/gif).', 'error');
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Lecture fichier impossible'));
        reader.readAsDataURL(file);
      });

      const res = await fetch(MEDIA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ dataUrl, folder: 'voyages' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || 'Upload échoué');

      if (json.url) {
        onChange([...(images || []), json.url]);
        notify?.('Image uploadée ✅', 'success');
      }
    } catch (e) {
      notify?.(e.message || 'Erreur upload', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label className="al-label">Galerie photos (page détails)</label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {(images || []).map((url, i) => (
          <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--g200)' }}>
            <img src={url} alt={`Galerie ${i + 1}`} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.background = '#f1f5f9'; e.target.alt = 'Image invalide'; }} />
            <button type="button" onClick={() => removeImage(i)}
              style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(233,47,100,.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input className="al-input" placeholder="URL de la nouvelle image..." value={newUrl}
          onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
          style={{ flex: 1, fontSize: 12 }} />
        <button type="button" onClick={addImage}
          style={{ flexShrink: 0, padding: '0 14px', borderRadius: 6, border: '1px solid var(--primary, #0f4c5c)',
            background: 'rgba(15,76,92,.1)', color: 'var(--primary, #0f4c5c)', cursor: 'pointer', fontSize: 14, fontWeight: 700, height: 36 }}>
          + Ajouter
        </button>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => uploadFile(e.target.files?.[0])} />
        <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}
          style={{ flexShrink: 0, padding: '0 14px', borderRadius: 6, border: '1px solid #fde68a',
            background: uploading ? '#fef3c7' : '#fffbeb', color: '#92400e', cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 800, height: 36 }}>
          {uploading ? '⏳ Upload…' : '⬆ Upload'}
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>
        {(images || []).length} image{(images || []).length !== 1 ? 's' : ''} dans la galerie
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Modal création / édition voyage
// ─────────────────────────────────────────────────────────────

const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const isEdit = !!pkg;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(pkg || {}),
    price:     pkg?.price     ? String(pkg.price)     : '',
    old_price: pkg?.old_price ? String(pkg.old_price) : '',
    duration:  pkg?.duration  ? String(pkg.duration)  : '',
    spots:     pkg?.spots     ? String(pkg.spots)     : '30',
    rating:    pkg?.rating    ? String(pkg.rating)    : '5',
    reviews:   pkg?.reviews   ? String(pkg.reviews)   : '0',
    programme:  Array.isArray(pkg?.programme)  ? pkg.programme  : [],
    inclus:     Array.isArray(pkg?.inclus)     ? pkg.inclus     : [],
    non_inclus: Array.isArray(pkg?.non_inclus) ? pkg.non_inclus : [],
    gallery:    Array.isArray(pkg?.gallery)    ? pkg.gallery    : [],
    is_active:  pkg?.is_active !== false,
  }));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const TABS = [
    { key: 'general',  label: 'General',  icon: '📋' },
    { key: 'detail',   label: 'Details',  icon: '📝' },
    { key: 'media',    label: 'Medias',   icon: '🖼️' },
    { key: 'advanced', label: 'Avance',   icon: '⚙️' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price || !form.duration) {
      notify('Titre, prix et duree sont obligatoires', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(isEdit ? `${API}/${pkg.id}` : API, {
        method:  isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price:     Number(form.price),
          old_price: form.old_price ? Number(form.old_price) : null,
          duration:  Number(form.duration),
          spots:     Number(form.spots)   || 30,
          rating:    Number(form.rating)  || 5,
          reviews:   Number(form.reviews) || 0,
          programme:  form.programme,
          inclus:     form.inclus,
          non_inclus: form.non_inclus,
          gallery:    form.gallery,
        }),
      });

      const json = await res.json();
      if (json.success) {
        notify(isEdit ? 'Voyage mis a jour ✅' : 'Voyage cree ✅');
        onSaved();
      } else {
        notify(json.message || "Erreur lors de l enregistrement", 'error');
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
        {/* Header */}
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2>{isEdit ? 'Modifier le voyage' : 'Nouveau voyage organise'}</h2>
              <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>
                {isEdit ? `Edition de "${pkg.title}"` : 'Creez un voyage avec toutes ses informations'}
              </p>
            </div>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--g200)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--g400)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <form id="voyage-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>

            {/* ── GENERAL ── */}
            {activeTab === 'general' && (
              <>
                <ModalField label="Titre" req>
                  <input className="al-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Istanbul l Eternelle" required />
                </ModalField>

                <ModalField label="Sous-titre">
                  <input className="al-input" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="Hotel 4 etoiles · Vol inclus · 7 jours" />
                </ModalField>

                <ModalField label="Description">
                  <textarea className="al-textarea" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Description detaillee du voyage..." />
                </ModalField>

                <div className="al-row-2">
                  <ModalField label="Pays">
                    <input className="al-input" value={form.pays} onChange={(e) => set('pays', e.target.value)} placeholder="Turquie" />
                  </ModalField>
                  <ModalField label="Destination">
                    <input className="al-input" value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder="Istanbul" />
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Prix (TND)" req>
                    <input className="al-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="1890" required />
                  </ModalField>
                  <ModalField label="Ancien prix (TND)">
                    <input className="al-input" type="number" min="0" step="0.01" value={form.old_price} onChange={(e) => set('old_price', e.target.value)} placeholder="2200" />
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Duree (jours)" req>
                    <input className="al-input" type="number" min="1" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="7" required />
                  </ModalField>
                  <ModalField label="Depart">
                    <input className="al-input" value={form.departure} onChange={(e) => set('departure', e.target.value)} placeholder="Tunis ou 15 Mars 2026" />
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Places disponibles">
                    <input className="al-input" type="number" min="0" value={form.spots} onChange={(e) => set('spots', e.target.value)} placeholder="30" />
                  </ModalField>
                  <ModalField label="Badge">
                    <select className="al-select" value={form.badge} onChange={(e) => set('badge', e.target.value)}>
                      <option value="">Aucun</option>
                      <option value="Populaire">Populaire</option>
                      <option value="Nouveau">Nouveau</option>
                      <option value="Promo">Promo</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </ModalField>
                </div>
              </>
            )}

            {/* ── DETAIL ── */}
            {activeTab === 'detail' && (
              <>
                <div className="al-row-2">
                  <ModalField label="Continent">
                    <select className="al-select" value={form.continent} onChange={(e) => set('continent', e.target.value)}>
                      <option value="">—</option>
                      <option value="europe">Europe</option>
                      <option value="asie">Asie</option>
                      <option value="afrique">Afrique</option>
                      <option value="amerique">Amerique</option>
                      <option value="ocean">Oceanie</option>
                    </select>
                  </ModalField>
                  <ModalField label="Saison">
                    <select className="al-select" value={form.saison} onChange={(e) => set('saison', e.target.value)}>
                      <option value="">—</option>
                      <option value="ete">Ete</option>
                      <option value="hiver">Hiver</option>
                      <option value="printemps">Printemps</option>
                      <option value="automne">Automne</option>
                      <option value="toute-annee">Toute l annee</option>
                    </select>
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Budget">
                    <select className="al-select" value={form.budget} onChange={(e) => set('budget', e.target.value)}>
                      <option value="">—</option>
                      <option value="economique">Economique</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="luxe">Luxe</option>
                    </select>
                  </ModalField>
                  <ModalField label="Categorie">
                    <input className="al-input" value={form.categorie} onChange={(e) => set('categorie', e.target.value)} placeholder="Famille, Culture, Detente..." />
                  </ModalField>
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="Programme jour par jour"
                    items={form.programme}
                    onChange={(value) => set('programme', value)}
                    placeholder="Description du jour..."
                    multiline
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1.5px solid rgba(16,185,129,.2)', background: 'rgba(16,185,129,.04)' }}>
                  <EditableList
                    label="Ce qui est inclus"
                    items={form.inclus}
                    onChange={(value) => set('inclus', value)}
                    placeholder="Ex: Vol inclus"
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1.5px solid rgba(233,47,100,.2)', background: 'rgba(233,47,100,.04)' }}>
                  <EditableList
                    label="Non inclus"
                    items={form.non_inclus}
                    onChange={(value) => set('non_inclus', value)}
                    placeholder="Ex: Depenses personnelles"
                  />
                </div>
              </>
            )}

            {/* ── MEDIA ── */}
            {activeTab === 'media' && (
              <>
                <ModalField label="Image principale">
                  <input className="al-input" value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." />
                </ModalField>

                {form.image_url && (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--g200)' }}>
                    <img
                      src={form.image_url}
                      alt="Apercu"
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--g400)', padding: '6px 10px', margin: 0 }}>Apercu image principale</p>
                  </div>
                )}

                <div>
                  <p style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 8, fontWeight: 600 }}>Suggestions rapides :</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                    {[
                      { label: 'Istanbul', url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200' },
                      { label: 'Paris',    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200' },
                      { label: 'Dubai',    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200' },
                      { label: 'Rome',     url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200' },
                    ].map((suggestion) => (
                      <div
                        key={suggestion.label}
                        onClick={() => set('image_url', suggestion.url)}
                        style={{
                          borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                          border: form.image_url === suggestion.url ? '2.5px solid var(--primary)' : '1.5px solid var(--g200)',
                          transition: 'all .15s',
                        }}
                      >
                        <img src={suggestion.url} alt={suggestion.label} style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }} />
                        <p style={{
                          fontSize: 10, padding: '4px 6px', margin: 0, fontWeight: 600,
                          color: form.image_url === suggestion.url ? 'var(--primary)' : 'var(--g600)',
                        }}>
                          {suggestion.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--g200)', paddingTop: 16 }}>
                  <GalleryEditor
                    images={form.gallery || []}
                    onChange={(imgs) => set('gallery', imgs)}
                    notify={notify}
                  />
                  <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 8 }}>
                    Ces images apparaissent dans la galerie de la page détail du voyage.
                  </p>
                </div>
              </>
            )}

            {/* ── ADVANCED ── */}
            {activeTab === 'advanced' && (
              <>
                <div className="al-row-2">
                  <ModalField label="Note (sur 5)">
                    <input className="al-input" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} placeholder="4.9" />
                  </ModalField>
                  <ModalField label="Nombre d avis">
                    <input className="al-input" type="number" min="0" value={form.reviews} onChange={(e) => set('reviews', e.target.value)} placeholder="120" />
                  </ModalField>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="voyage-is-active"
                    checked={form.is_active}
                    onChange={(e) => set('is_active', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="voyage-is-active" className="al-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                    Voyage actif (visible sur le site public)
                  </label>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="al-form-footer" style={{
          flexShrink: 0, borderTop: '1px solid var(--g200)', padding: '16px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  width: 8, height: 8, borderRadius: '50%', border: 'none',
                  background: activeTab === tab.key ? 'var(--primary)' : 'var(--g300)',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" form="voyage-form" className="al-btn al-btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? '✏️ Mettre a jour' : '➕ Creer le voyage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Panneau détail latéral
// ─────────────────────────────────────────────────────────────

const VoyageDetail = ({ voyage, onClose, onEdit, onDelete, isMain }) => {
  const avail  = voyage.available_spots !== undefined ? Number(voyage.available_spots) : Number(voyage.spots);
  const isFull = avail <= 0;
  const isLow  = avail <= 5 && avail > 0;

  const InfoRow = ({ icon, label, value }) => value ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: 'var(--g50)', border: '1px solid var(--g100)' }}>
      <span style={{ fontSize: 12, color: 'var(--g500)' }}>{icon} {label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g800)' }}>{value}</span>
    </div>
  ) : null;

  const continentLabel = { europe: 'Europe', asie: 'Asie', afrique: 'Afrique', amerique: 'Amerique', ocean: 'Oceanie' };
  const saisonLabel    = { ete: 'Ete', hiver: 'Hiver', printemps: 'Printemps', automne: 'Automne', 'toute-annee': "Toute l annee" };
  const budgetLabel    = { economique: 'Economique', standard: 'Standard', premium: 'Premium', luxe: 'Luxe' };

  return (
    <div style={{ width: 330, flexShrink: 0, borderLeft: '1px solid var(--g200)', display: 'flex', flexDirection: 'column', background: '#fff', animation: 'alModalIn .25s var(--ease)', overflowY: 'auto' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Details voyage</p>
        <button className="al-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div style={{ width: '100%', height: 170, background: 'var(--g100)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {voyage.image_url
          ? <img src={voyage.image_url} alt={voyage.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => e.target.style.display = 'none'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,var(--primary),var(--secondary))' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" style={{ width: 44, height: 44 }}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>Pas d image</p>
            </div>}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 9px', borderRadius: 999, background: voyage.is_active ? '#10b981' : '#94a3b8', color: '#fff', fontSize: 11, fontWeight: 700 }}>
            {voyage.is_active ? '● Actif' : '● Inactif'}
          </span>
          {voyage.badge && (
            <span style={{ padding: '3px 9px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 11, fontWeight: 700 }}>
              {voyage.badge}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '18px 18px 12px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', lineHeight: 1.3 }}>{voyage.title}</h3>
          {voyage.subtitle && <p style={{ fontSize: 12, color: 'var(--g500)', marginTop: 4 }}>{voyage.subtitle}</p>}
          {(voyage.pays || voyage.destination) && (
            <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 6 }}>
              {[voyage.pays, voyage.destination].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {voyage.description && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Description</p>
            <p style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.65 }}>{voyage.description}</p>
          </div>
        )}

        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Tarif</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{fPrice(voyage.price)}</span>
            {voyage.old_price && <span style={{ fontSize: 13, color: 'var(--g400)', textDecoration: 'line-through' }}>{fPrice(voyage.old_price)}</span>}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Informations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <InfoRow icon="🗓" label="Duree"     value={voyage.duration ? `${voyage.duration} jour${voyage.duration > 1 ? 's' : ''}` : null} />
            <InfoRow icon="✈️" label="Depart"    value={voyage.departure || null} />
            <InfoRow icon="🌍" label="Continent" value={continentLabel[voyage.continent] || null} />
            <InfoRow icon="🌤" label="Saison"    value={saisonLabel[voyage.saison] || null} />
            <InfoRow icon="💰" label="Budget"    value={budgetLabel[voyage.budget] || null} />
            {voyage.categorie && <InfoRow icon="🏷" label="Categorie" value={voyage.categorie} />}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Disponibilite</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: isFull ? '#fee2e2' : isLow ? '#fff7ed' : '#d1fae5', border: `1px solid ${isFull ? '#fca5a5' : isLow ? '#fed7aa' : '#a7f3d0'}` }}>
              <span style={{ fontSize: 12, color: isFull ? '#991b1b' : isLow ? '#92400e' : '#065f46' }}>🪑 Places disponibles</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: isFull ? '#e92f64' : isLow ? '#f97316' : '#065f46' }}>
                {isFull ? 'Complet' : `${avail} / ${voyage.spots}`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: 'rgba(15,76,92,.05)', border: '1px solid rgba(15,76,92,.1)' }}>
              <span style={{ fontSize: 12, color: 'var(--g500)' }}>📋 Reservations</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>
                {voyage.reservation_count || 0} inscrit{voyage.reservation_count > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--g100)', display: 'flex', gap: 8, position: 'sticky', bottom: 0, background: '#fff' }}>
        <button className="al-btn al-btn--primary" style={{ flex: 1 }} onClick={() => { onEdit(voyage); onClose(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          Modifier
        </button>
        <button
          className="al-btn al-btn--danger"
          onClick={() => { onDelete(voyage.id); onClose(); }}
          title={isMain ? 'Supprimer ce voyage' : "Reserve a l administrateur principal"}
          style={{ opacity: isMain ? 1 : 0.4, cursor: isMain ? 'pointer' : 'not-allowed' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
          {isMain ? 'Supprimer' : 'Supprimer 🔒'}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────

const VoyagePackages = () => {
  const [voyages,    setVoyages]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [showCovers, setShowCovers] = useState(false);
  const [editPkg,    setEditPkg]    = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [covers,     setCovers]     = useState(null);

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchVoyages = async () => {
    try {
      setLoading(true);
      const r = await fetch(API, { cache: 'no-store' });
      const j = await r.json();
      setVoyages(j.data || []);
    } catch {
      notify('Impossible de charger les voyages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCovers = async () => {
    try {
      const r = await fetch(COVERS_API);
      const j = await r.json();
      if (j.success) setCovers(j.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchVoyages();
    fetchCovers();
  }, []);

  const handleDelete = async (id) => {
    if (!isMain) {
      notify("Seul l administrateur principal peut supprimer un voyage", 'error');
      return;
    }
    if (!window.confirm('Supprimer ce voyage ?')) return;

    const r = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (j.success) {
      notify('Voyage supprime');
      fetchVoyages();
      setSelected(null);
    } else {
      notify('Erreur suppression', 'error');
    }
  };

  const stats = {
    total:    voyages.length,
    active:   voyages.filter((v) => v.is_active).length,
    inactive: voyages.filter((v) => !v.is_active).length,
    totalRes: voyages.reduce((a, v) => a + (parseInt(v.reservation_count) || 0), 0),
  };

  return (
    <AdminLayout
      title="Voyages Organises"
      breadcrumb={[{ label: 'Voyages Organises' }, { label: 'Catalogue', active: true }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Bouton apparence page */}
          <button
            className="al-btn al-btn--ghost"
            onClick={() => setShowCovers(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            Apparence page
          </button>
          {/* Bouton nouveau voyage */}
          <button className="al-btn al-btn--primary" onClick={() => { setEditPkg(null); setShowModal(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Nouveau voyage
          </button>
        </div>
      }
      toast={toast}
    >
      {/* Statistiques */}
      <div className="al-stats al-stats--4">
        {[
          { label: 'Total voyages',     value: stats.total,    color: 'blue',  icon: <><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></> },
          { label: 'Actifs',            value: stats.active,   color: 'green', icon: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></> },
          { label: 'Inactifs',          value: stats.inactive, color: 'gray',  icon: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></> },
          { label: 'Total reservations',value: stats.totalRes, color: 'teal',  icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></> },
        ].map((s) => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg>
            </div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Aperçu miniature du cover hero — cliquable pour ouvrir la modal */}
      {covers && (
        <div style={{ margin: '0 32px 16px' }}>
          <div
            onClick={() => setShowCovers(true)}
            style={{
              borderRadius: 12, overflow: 'hidden', position: 'relative', height: 70,
              cursor: 'pointer', border: '1.5px solid var(--g200)',
              background: 'linear-gradient(135deg,#0f4c5c,#1a7a8a)',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {covers.hero?.bg_image && (
              <img
                src={covers.hero.bg_image}
                alt="hero cover"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .45 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)' }}/>
            <div style={{ position: 'relative', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}>
              <span style={{ fontSize: 18 }}>🖼️</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0 }}>
                  {covers.hero?.title || 'Découvrez le monde,'}{' '}
                  <span style={{ color: '#1ecad3' }}>{covers.hero?.title_accent || 'sans contraintes'}</span>
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.7)', margin: 0 }}>
                  Cliquer pour modifier l'image hero de la page publique
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau principal */}
      <div style={{ display: 'flex', margin: '0 32px 32px', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: '0 4px 12px rgba(15,76,92,.08)', overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          <div className="al-toolbar">
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--g800)', flex: 1 }}>Liste des voyages</p>
            <button className="al-btn al-btn--ghost" onClick={fetchVoyages}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner" /></div>
              <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement...</p>
            </div>
          ) : voyages.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              </div>
              <p className="al-empty__title">Aucun voyage</p>
              <p className="al-empty__sub">Creez votre premier voyage organise.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Voyage</th>
                    <th>Prix</th>
                    <th>Duree</th>
                    <th>Depart</th>
                    <th>Places dispo</th>
                    <th>Reservations</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {voyages.map((v) => {
                    const avail  = v.available_spots !== undefined ? Number(v.available_spots) : Number(v.spots);
                    const isFull = avail <= 0;
                    const isLow  = avail <= 5 && avail > 0;
                    const isSel  = selected?.id === v.id;
                    return (
                      <tr
                        key={v.id}
                        className={`al-row ${isSel ? 'al-row--selected' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelected(isSel ? null : v)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {v.image_url
                              ? <img src={v.image_url} alt={v.title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--g200)' }} onError={(e) => e.target.style.display = 'none'} />
                              : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width: 20, height: 20 }}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
                                </div>}
                            <div>
                              <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>
                                {v.title}
                                {v.badge && <span style={{ marginLeft: 7, padding: '2px 7px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 10, fontWeight: 700 }}>{v.badge}</span>}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>
                                {v.pays} {v.destination ? `· ${v.destination}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{fPrice(v.price)}</p>
                          {v.old_price && <p style={{ fontSize: 11, color: 'var(--g400)', textDecoration: 'line-through' }}>{fPrice(v.old_price)}</p>}
                        </td>
                        <td><span style={{ fontWeight: 600, fontSize: 13 }}>{v.duration} j</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--g600)' }}>{v.departure || '—'}</span></td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: 13, color: isFull ? '#e92f64' : isLow ? '#f97316' : '#065f46' }}>
                            {isFull ? '❌ Complet' : `${avail} / ${v.spots}`}
                          </span>
                          {isLow && <p style={{ fontSize: 10, color: '#f97316', marginTop: 2 }}>🔥 Presque complet</p>}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(15,76,92,.08)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                            {v.reservation_count || 0} inscrit{v.reservation_count > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: v.is_active ? '#d1fae5' : 'var(--g100)', color: v.is_active ? '#065f46' : 'var(--g500)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.is_active ? '#10b981' : 'var(--g400)' }} />
                            {v.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="al-action-btn al-action-btn--edit"
                              onClick={() => { setEditPkg(v); setShowModal(true); }}
                              title="Modifier"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                            <button
                              className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(v.id)}
                              title={isMain ? 'Supprimer' : "Reserve a l administrateur principal"}
                              style={{ opacity: isMain ? 1 : 0.4, cursor: isMain ? 'pointer' : 'not-allowed' }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
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
            <p className="al-count">{voyages.length} voyage{voyages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Panneau détail latéral */}
        {selected && (
          <VoyageDetail
            voyage={selected}
            onClose={() => setSelected(null)}
            onEdit={(v) => { setEditPkg(v); setShowModal(true); }}
            onDelete={handleDelete}
            isMain={isMain}
          />
        )}
      </div>

      {/* Modal création / édition voyage */}
      {showModal && (
        <PkgModal
          pkg={editPkg}
          onClose={() => { setShowModal(false); setEditPkg(null); }}
          onSaved={() => { setShowModal(false); setEditPkg(null); fetchVoyages(); }}
          notify={notify}
        />
      )}

      {/* Modal apparence page */}
      {showCovers && (
        <CoversModal
          covers={covers}
          onClose={() => setShowCovers(false)}
          onSaved={(newCovers) => { setCovers(newCovers); setShowCovers(false); }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default VoyagePackages;
