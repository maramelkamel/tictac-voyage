import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import {
  deleteAdminHotel,
  getAdminHotels,
  getHotelPageCover,
  saveAdminHotel,
  updateHotelPageCover,
} from '../../../services/api';

const MEDIA_API = 'http://localhost:5000/api/media/upload';

const DEFAULT_COVER = {
  hero: {
    bg_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    photo_1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80',
    photo_2: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80',
    photo_3: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1600&q=80',
    photo_4: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80',
    tag: 'Hotels en Tunisie',
    title: 'Trouvez votre',
    title_accent: 'hotel ideal',
    sub: 'Une selection premium, des promotions actives et un parcours de reservation identique aux voyages organises.',
  },
};

const HERO_PHOTO_FIELDS = [
  { key: 'photo_1', label: 'Photo 1' },
  { key: 'photo_2', label: 'Photo 2' },
  { key: 'photo_3', label: 'Photo 3' },
  { key: 'photo_4', label: 'Photo 4' },
];

const EMPTY_FORM = {
  name: '',
  subtitle: '',
  city: 'Tunis',
  address: '',
  description: '',
  image_url: '',
  gallery: [],
  amenities: [],
  highlights: [],
  room_types: [],
  meal_plans: [],
  room_views: [],
  reservation_extras: [],
  policies: [],
  nearby_places: [],
  property_type: 'Resort & Spa',
  badge: '',
  stars: '5',
  rating: '4.6',
  reviews: '0',
  base_price: '',
  old_price: '',
  currency: 'TND',
  total_rooms: '40',
  checkin_time: '14:00',
  checkout_time: '12:00',
  meals: 'Petit-dejeuner inclus',
  availability: 'Disponible',
  is_featured: true,
  display_order: '0',
  is_active: true,
};

const CITIES = ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Monastir', 'Mahdia', 'Tozeur', 'Tabarka', 'Bizerte', 'Nabeul'];

const normalizeTextList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

const formatPrice = (value, currency = 'TND') => {
  const amount = Number(value || 0);
  return amount ? `${amount.toLocaleString('fr-FR')} ${currency}` : '-';
};

const normalizeHeroCover = (hero = {}) => {
  const next = { ...DEFAULT_COVER.hero, ...(hero || {}) };
  if (!next.photo_1) next.photo_1 = next.bg_image || DEFAULT_COVER.hero.photo_1;
  if (!next.bg_image) next.bg_image = next.photo_1 || DEFAULT_COVER.hero.bg_image;
  return next;
};

const getToken = () => localStorage.getItem('adminToken') || '';

// ── Composant champ modal ──
const ModalField = ({ label, req, children }) => (
  <div className="al-field">
    <label className="al-label">{label} {req && <span className="al-required">*</span>}</label>
    {children}
  </div>
);

// ── Composant liste éditable ──
const EditableList = ({ label, items = [], onChange, placeholder = 'Ajouter...', multiline = false }) => {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const next = draft.trim();
    if (!next) return;
    onChange([...(items || []), next]);
    setDraft('');
  };

  const updateItem = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="al-label">{label}</label>
      {(items || []).map((item, index) => (
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
              border: '1px solid var(--danger, #e92f64)', background: 'rgba(233,47,100,.08)',
              color: 'var(--danger, #e92f64)', cursor: 'pointer', fontSize: 14,
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
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ flex: 1, fontSize: 12, resize: 'vertical' }}
          />
        ) : (
          <input
            className="al-input"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
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
            alignSelf: 'flex-start', height: 36,
          }}
        >+ Ajouter</button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>
        {items.length} élément{items.length !== 1 ? 's' : ''} · Appuyez sur Entrée pour ajouter rapidement
      </p>
    </div>
  );
};

// ── Composant galerie d'images ──
const GalleryEditor = ({ images = [], onChange, notify }) => {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const addImage = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onChange([...(images || []), trimmed]);
    setNewUrl('');
  };

  const removeImage = (index) => onChange(images.filter((_, i) => i !== index));

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
        body: JSON.stringify({ dataUrl, folder: 'hotels' }),
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
      <label className="al-label">Galerie d'images</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {(images || []).map((url, i) => (
          <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--g200)' }}>
            <img
              src={url}
              alt={`Galerie ${i + 1}`}
              style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.style.background = '#f1f5f9'; }}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              style={{
                position: 'absolute', top: 4, right: 4,
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(233,47,100,.9)', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
            <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,.5)' }}>
              <p style={{ fontSize: 9, color: '#fff', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {url.split('/').pop().split('?')[0]}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input
          className="al-input"
          placeholder="URL de la nouvelle image..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
          style={{ flex: 1, fontSize: 12 }}
        />
        <button
          type="button"
          onClick={addImage}
          style={{
            flexShrink: 0, padding: '0 14px', borderRadius: 6,
            border: '1px solid var(--primary, #0f4c5c)', background: 'rgba(15,76,92,.1)',
            color: 'var(--primary, #0f4c5c)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            height: 36,
          }}
        >+ Ajouter</button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => uploadFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          style={{
            flexShrink: 0, padding: '0 14px', borderRadius: 6,
            border: '1px solid #fde68a', background: uploading ? '#fef3c7' : '#fffbeb',
            color: '#92400e', cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 800, height: 36,
          }}
        >
          {uploading ? '⏳ Upload…' : '⬆ Upload'}
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>
        {(images || []).length} image{(images || []).length !== 1 ? 's' : ''} dans la galerie
      </p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL HÔTEL — VERSION MULTI-ONGLETS (style CircuitPackages)
   ══════════════════════════════════════════════════════════════ */
const HotelModal = ({ hotel, onClose, onSaved, notify }) => {
  const isEdit = !!hotel;
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(hotel || {}),
    gallery: hotel?.gallery || [],
    amenities: hotel?.amenities || [],
    highlights: hotel?.highlights || [],
    room_types: hotel?.room_types || [],
    meal_plans: hotel?.meal_plans || [],
    room_views: hotel?.room_views || [],
    reservation_extras: hotel?.reservation_extras || [],
    policies: hotel?.policies || [],
    nearby_places: hotel?.nearby_places || [],
    stars: hotel?.stars ? String(hotel.stars) : EMPTY_FORM.stars,
    rating: hotel?.rating ? String(hotel.rating) : EMPTY_FORM.rating,
    reviews: hotel?.reviews ? String(hotel.reviews) : EMPTY_FORM.reviews,
    base_price: hotel?.base_price ? String(hotel.base_price) : '',
    old_price: hotel?.old_price ? String(hotel.old_price) : '',
    total_rooms: hotel?.total_rooms ? String(hotel.total_rooms) : EMPTY_FORM.total_rooms,
    display_order: hotel?.display_order ? String(hotel.display_order) : '0',
  }));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const TABS = [
    { key: 'general',  label: 'Général',    icon: '🏨' },
    { key: 'chambres', label: 'Chambres',   icon: '🛏️' },
    { key: 'services', label: 'Services',   icon: '⭐' },
    { key: 'media',    label: 'Médias',     icon: '🖼️' },
    { key: 'advanced', label: 'Avancé',     icon: '⚙️' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { notify('Le nom de l\'hôtel est obligatoire', 'error'); return; }
    setSaving(true);
    try {
      await saveAdminHotel({
        ...form,
        stars: Number(form.stars || 0),
        rating: form.rating === '' ? null : Number(form.rating),
        reviews: Number(form.reviews || 0),
        base_price: form.base_price === '' ? null : Number(form.base_price),
        old_price: form.old_price === '' ? null : Number(form.old_price),
        total_rooms: Number(form.total_rooms || 0),
        display_order: Number(form.display_order || 0),
        gallery: normalizeTextList(form.gallery),
        amenities: normalizeTextList(form.amenities),
        highlights: normalizeTextList(form.highlights),
        room_types: normalizeTextList(form.room_types),
        meal_plans: normalizeTextList(form.meal_plans),
        room_views: normalizeTextList(form.room_views),
        reservation_extras: normalizeTextList(form.reservation_extras),
        policies: normalizeTextList(form.policies),
        nearby_places: normalizeTextList(form.nearby_places),
      }, hotel?.id || null);
      notify(isEdit ? 'Hôtel mis à jour ✅' : 'Hôtel créé ✅');
      onSaved();
    } catch (err) {
      notify(err.message || 'Impossible de sauvegarder cet hôtel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Suggestions images hôtels Tunisie
  const HOTEL_SUGGESTIONS = [
    { label: 'Hôtel luxe',     url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200' },
    { label: 'Piscine resort', url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200' },
    { label: 'Chambre vue mer',url: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=1200' },
    { label: 'Spa & Bien-être',url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200' },
    { label: 'Djerba resort',  url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200' },
    { label: 'Hammamet',       url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200' },
  ];

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
                <path d="M4 20V8a2 2 0 012-2h12a2 2 0 012 2v12"/>
                <path d="M2 20h20"/>
                <path d="M12 6V4M9 10h6M9 14h6"/>
              </svg>
            </div>
            <div>
              <h2>{isEdit ? 'Modifier l\'hôtel' : 'Nouvel hôtel'}</h2>
              <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>
                {isEdit ? `Édition de "${hotel.name}"` : 'Créez un hôtel avec toutes ses informations'}
              </p>
            </div>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--g200)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 16px', border: 'none', background: 'transparent',
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--g400)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <form id="hotel-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>

            {/* ══ ONGLET GÉNÉRAL ══ */}
            {activeTab === 'general' && (
              <>
                <div className="al-row-2">
                  <ModalField label="Nom de l'hôtel" req>
                    <input
                      className="al-input"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Ex: Hôtel Palm Beach Hammamet"
                      required
                    />
                  </ModalField>
                  <ModalField label="Sous-titre">
                    <input
                      className="al-input"
                      value={form.subtitle}
                      onChange={(e) => set('subtitle', e.target.value)}
                      placeholder="Ex: Resort 5★ face à la mer"
                    />
                  </ModalField>
                </div>

                <ModalField label="Description">
                  <textarea
                    className="al-textarea"
                    rows={4}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Description détaillée de l'hôtel..."
                  />
                </ModalField>

                <div className="al-row-2">
                  <ModalField label="Prix actuel (DT/nuit)" req>
                    <input
                      className="al-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.base_price}
                      onChange={(e) => set('base_price', e.target.value)}
                      placeholder="Ex: 320"
                    />
                  </ModalField>
                  <ModalField label="Ancien prix (DT)">
                    <input
                      className="al-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.old_price}
                      onChange={(e) => set('old_price', e.target.value)}
                      placeholder="Ex: 420 (optionnel)"
                    />
                  </ModalField>
                </div>

                <div className="al-row-3">
                  <ModalField label="Ville">
                    <>
                      <input
                        className="al-input"
                        list="hotel-city-options"
                        value={form.city}
                        onChange={(e) => set('city', e.target.value)}
                        placeholder="Choisir ou saisir..."
                      />
                      <datalist id="hotel-city-options">
                        {CITIES.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </>
                  </ModalField>
                  <ModalField label="Type de propriété">
                    <input
                      className="al-input"
                      value={form.property_type}
                      onChange={(e) => set('property_type', e.target.value)}
                      placeholder="Resort & Spa, Boutique..."
                    />
                  </ModalField>
                  <ModalField label="Badge">
                    <select
                      className="al-select"
                      value={form.badge}
                      onChange={(e) => set('badge', e.target.value)}
                    >
                      <option value="">Aucun</option>
                      <option value="Luxe">👑 Luxe</option>
                      <option value="Promo">🔥 Promo</option>
                      <option value="Family">👨‍👩‍👧 Family</option>
                      <option value="Nouveau">✨ Nouveau</option>
                      <option value="Populaire">⭐ Populaire</option>
                      <option value="Vue mer">🌊 Vue mer</option>
                    </select>
                  </ModalField>
                </div>

                <ModalField label="Adresse complète">
                  <input
                    className="al-input"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Ex: Avenue Marbella, Hammamet Nord"
                  />
                </ModalField>

                <div className="al-row-3">
                  <ModalField label="Étoiles">
                    <select className="al-select" value={form.stars} onChange={(e) => set('stars', e.target.value)}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <option key={s} value={String(s)}>{s} ★{s > 1 ? '' : ''}</option>
                      ))}
                    </select>
                  </ModalField>
                  <ModalField label="Note / 5">
                    <input
                      className="al-input"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => set('rating', e.target.value)}
                      placeholder="4.6"
                    />
                  </ModalField>
                  <ModalField label="Nombre d'avis">
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

                <div className="al-row-3">
                  <ModalField label="Chambres totales">
                    <input
                      className="al-input"
                      type="number"
                      min="1"
                      value={form.total_rooms}
                      onChange={(e) => set('total_rooms', e.target.value)}
                      placeholder="40"
                    />
                  </ModalField>
                  <ModalField label="Check-in">
                    <input
                      className="al-input"
                      type="time"
                      value={form.checkin_time}
                      onChange={(e) => set('checkin_time', e.target.value)}
                    />
                  </ModalField>
                  <ModalField label="Check-out">
                    <input
                      className="al-input"
                      type="time"
                      value={form.checkout_time}
                      onChange={(e) => set('checkout_time', e.target.value)}
                    />
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Formule repas mise en avant">
                    <input
                      className="al-input"
                      value={form.meals}
                      onChange={(e) => set('meals', e.target.value)}
                      placeholder="Ex: Petit-déjeuner inclus"
                    />
                  </ModalField>
                  <ModalField label="Disponibilité">
                    <input
                      className="al-input"
                      value={form.availability}
                      onChange={(e) => set('availability', e.target.value)}
                      placeholder="Disponible"
                    />
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Devise">
                    <select className="al-select" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                      <option value="TND">TND — Dinar tunisien</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="USD">USD — Dollar US</option>
                    </select>
                  </ModalField>
                  <ModalField label="Ordre d'affichage">
                    <input
                      className="al-input"
                      type="number"
                      min="0"
                      value={form.display_order}
                      onChange={(e) => set('display_order', e.target.value)}
                      placeholder="0 = premier"
                    />
                  </ModalField>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => set('is_featured', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--g700)' }}>⭐ Hôtel vedette</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => set('is_active', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--g700)' }}>✅ Hôtel actif (visible en ligne)</span>
                  </label>
                </div>
              </>
            )}

            {/* ══ ONGLET CHAMBRES ══ */}
            {activeTab === 'chambres' && (
              <>
                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="🛏️ Types de chambres"
                    items={form.room_types}
                    onChange={(v) => set('room_types', v)}
                    placeholder="Ex: Suite familiale, Chambre double vue mer..."
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="🍽️ Formules repas / pensions"
                    items={form.meal_plans}
                    onChange={(v) => set('meal_plans', v)}
                    placeholder="Ex: Tout inclus, Demi-pension, All inclusive..."
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="🌅 Vues disponibles"
                    items={form.room_views}
                    onChange={(v) => set('room_views', v)}
                    placeholder="Ex: Vue mer frontale, Vue piscine, Vue jardin..."
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1.5px solid rgba(16,185,129,.2)', background: 'rgba(16,185,129,.04)' }}>
                  <EditableList
                    label="➕ Extras réservables"
                    items={form.reservation_extras}
                    onChange={(v) => set('reservation_extras', v)}
                    placeholder="Ex: Transfert aéroport, Lit bébé, Menu végétarien..."
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1.5px solid rgba(233,47,100,.2)', background: 'rgba(233,47,100,.04)' }}>
                  <EditableList
                    label="📋 Politiques de l'hôtel"
                    items={form.policies}
                    onChange={(v) => set('policies', v)}
                    placeholder="Ex: Annulation gratuite 48h avant, Animaux non admis..."
                  />
                </div>
              </>
            )}

            {/* ══ ONGLET SERVICES ══ */}
            {activeTab === 'services' && (
              <>
                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="⭐ Points forts de l'hôtel"
                    items={form.highlights}
                    onChange={(v) => set('highlights', v)}
                    placeholder="Ex: Vue mer panoramique, Spa de luxe..."
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="🏊 Services & Équipements"
                    items={form.amenities}
                    onChange={(v) => set('amenities', v)}
                    placeholder="Ex: WiFi gratuit, Piscine chauffée, Parking..."
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid rgba(99,102,241,.2)', background: 'rgba(99,102,241,.04)' }}>
                  <EditableList
                    label="📍 À proximité"
                    items={form.nearby_places}
                    onChange={(v) => set('nearby_places', v)}
                    placeholder="Ex: Médina de Hammamet - 5 min, Plage - 50 m..."
                  />
                </div>
              </>
            )}

            {/* ══ ONGLET MÉDIAS ══ */}
            {activeTab === 'media' && (
              <>
                <ModalField label="Image principale (carte hôtel)">
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
                      alt="Aperçu"
                      style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--g400)', padding: '6px 10px', margin: 0 }}>Aperçu image principale</p>
                  </div>
                )}

                {/* Suggestions images hôtels */}
                <div>
                  <p style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 8, fontWeight: 600 }}>Suggestions :</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                    {HOTEL_SUGGESTIONS.map((s) => (
                      <div
                        key={s.label}
                        onClick={() => set('image_url', s.url)}
                        style={{
                          borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                          border: form.image_url === s.url ? '2.5px solid var(--primary)' : '1.5px solid var(--g200)',
                          transition: 'all .15s',
                        }}
                      >
                        <img
                          src={s.url}
                          alt={s.label}
                          style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.target.style.background = '#f1f5f9'; }}
                        />
                        <p style={{
                          fontSize: 10, padding: '4px 6px', margin: 0,
                          color: form.image_url === s.url ? 'var(--primary)' : 'var(--g600)',
                          fontWeight: 600,
                          background: form.image_url === s.url ? 'rgba(15,76,92,.08)' : 'transparent',
                        }}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--g200)', paddingTop: 16 }}>
                  <GalleryEditor
                    images={form.gallery}
                    onChange={(v) => set('gallery', v)}
                    notify={notify}
                  />
                  <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 8 }}>
                    Ces images apparaissent dans la galerie de la page détail de l'hôtel.
                  </p>
                </div>
              </>
            )}

            {/* ══ ONGLET AVANCÉ ══ */}
            {activeTab === 'advanced' && (
              <>
                <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', marginBottom: 6 }}>📊 Statistiques</p>
                  <div className="al-row-3">
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 4 }}>Étoiles</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{form.stars} ★</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 4 }}>Note</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{form.rating} / 5</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 4 }}>Chambres</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{form.total_rooms}</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', marginBottom: 6 }}>📋 Récapitulatif du contenu</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { label: 'Types chambres', count: form.room_types.length, icon: '🛏️' },
                      { label: 'Formules repas', count: form.meal_plans.length, icon: '🍽️' },
                      { label: 'Vues', count: form.room_views.length, icon: '🌅' },
                      { label: 'Extras', count: form.reservation_extras.length, icon: '➕' },
                      { label: 'Points forts', count: form.highlights.length, icon: '⭐' },
                      { label: 'Services', count: form.amenities.length, icon: '🏊' },
                      { label: 'À proximité', count: form.nearby_places.length, icon: '📍' },
                      { label: 'Politiques', count: form.policies.length, icon: '📋' },
                      { label: 'Photos galerie', count: form.gallery.length, icon: '🖼️' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: item.count > 0 ? 'rgba(15,76,92,.08)' : 'var(--g100)',
                          color: item.count > 0 ? 'var(--primary)' : 'var(--g400)',
                          border: `1px solid ${item.count > 0 ? 'rgba(15,76,92,.2)' : 'var(--g200)'}`,
                        }}
                      >
                        {item.icon} {item.label}: <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(233,47,100,.2)', background: 'rgba(233,47,100,.03)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#e92f64', marginBottom: 6 }}>⚠️ Zone dangereuse</p>
                  <p style={{ fontSize: 11, color: 'var(--g500)' }}>
                    La suppression d'un hôtel est irréversible. Elle supprime également toutes les réservations associées.
                    Utilisez plutôt la désactivation (case "Hôtel actif" dans l'onglet Général).
                  </p>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div
          style={{ flexShrink: 0, borderTop: '1px solid var(--g200)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Indicateur d'onglet */}
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
            <button
              type="submit"
              form="hotel-form"
              className="al-btn al-btn--primary"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : (isEdit ? '✏️ Mettre à jour' : '➕ Créer l\'hôtel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL COVERS — inchangée
   ══════════════════════════════════════════════════════════════ */
const CoverModal = ({ covers, onClose, onSaved, notify }) => {
  const [hero, setHero] = useState(normalizeHeroCover(covers?.hero));
  const [saving, setSaving] = useState(false);
  const heroPhotos = HERO_PHOTO_FIELDS.map(({ key }) => hero[key]?.trim()).filter(Boolean);
  const previewPhoto = heroPhotos[0] || hero.bg_image || DEFAULT_COVER.hero.bg_image;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = normalizeHeroCover({
        ...hero,
        bg_image: hero.photo_1?.trim() || hero.bg_image || DEFAULT_COVER.hero.bg_image,
      });
      const response = await updateHotelPageCover(payload);
      notify(response.message || 'Apparence hôtel mise à jour.');
      onSaved({ hero: payload });
    } catch (err) {
      notify(err.message || 'Erreur de sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <h2>Apparence de la page Hôtels</h2>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: 24, display: 'grid', gap: 20 }}>
          {/* Aperçu hero */}
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 200, background: 'linear-gradient(135deg,#0f4c5c,#1ecad3)', border: '2px solid var(--g200)' }}>
            <img src={previewPhoto} alt="aperçu" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.42 }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,40,50,.55)' }} />
            <div style={{ position: 'relative', color: '#fff', padding: 28, maxWidth: 520 }}>
              <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,.14)', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                {hero.tag || DEFAULT_COVER.hero.tag}
              </div>
              <h2 style={{ fontSize: 28, lineHeight: 1.2, margin: 0, fontWeight: 900 }}>
                {hero.title || DEFAULT_COVER.hero.title}
                <br />
                <span style={{ color: '#1ECAD3' }}>{hero.title_accent || DEFAULT_COVER.hero.title_accent}</span>
              </h2>
              <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,.86)' }}>
                {hero.sub || DEFAULT_COVER.hero.sub}
              </p>
            </div>
          </div>

          {/* Photos hero */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
              Photos de rotation (1 à 4)
            </p>
            <div className="al-row-2">
              {HERO_PHOTO_FIELDS.map((field) => (
                <div className="al-field" key={field.key}>
                  <label className="al-label">{field.label}</label>
                  <input
                    className="al-input"
                    value={hero[field.key] || ''}
                    onChange={(e) => setHero((cur) => ({ ...cur, [field.key]: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              ))}
            </div>
            {heroPhotos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginTop: 10 }}>
                {HERO_PHOTO_FIELDS.filter((f) => hero[f.key]?.trim()).map((f) => (
                  <div key={f.key} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--g200)' }}>
                    <img src={hero[f.key]} alt={f.label} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--g500)' }}>{f.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Textes */}
          <div className="al-row-2">
            <div className="al-field">
              <label className="al-label">Tag / Étiquette</label>
              <input className="al-input" value={hero.tag} onChange={(e) => setHero((c) => ({ ...c, tag: e.target.value }))} />
            </div>
            <div className="al-field">
              <label className="al-label">Titre accentué (couleur)</label>
              <input className="al-input" value={hero.title_accent} onChange={(e) => setHero((c) => ({ ...c, title_accent: e.target.value }))} />
            </div>
          </div>
          <div className="al-field">
            <label className="al-label">Titre principal</label>
            <input className="al-input" value={hero.title} onChange={(e) => setHero((c) => ({ ...c, title: e.target.value }))} />
          </div>
          <div className="al-field">
            <label className="al-label">Sous-titre</label>
            <textarea className="al-textarea" rows={3} value={hero.sub} onChange={(e) => setHero((c) => ({ ...c, sub: e.target.value }))} />
          </div>
        </div>

        <div className="al-form-footer">
          <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
          <button type="button" className="al-btn al-btn--primary" disabled={saving} onClick={handleSave}>
            {saving ? 'Enregistrement...' : '💾 Enregistrer l\'apparence'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PANNEAU DÉTAIL HÔTEL — style CircuitDetail
   ══════════════════════════════════════════════════════════════ */
const HotelDetailsPanel = ({ hotel, onClose, onEdit, onDelete, isMain }) => {
  const occupancy = Math.round(hotel.occupancy_percentage || 0);
  const isHigh    = occupancy >= 80;
  const isMed     = occupancy >= 50 && occupancy < 80;

  const InfoRow = ({ icon, label, value }) => value ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: 'var(--g50)', border: '1px solid var(--g100)' }}>
      <span style={{ fontSize: 12, color: 'var(--g500)' }}>{icon} {label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g800)' }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ width: 330, flexShrink: 0, borderLeft: '1px solid var(--g200)', display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Détails hôtel</p>
        <button className="al-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Image */}
      <div style={{ width: '100%', height: 170, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {hotel.image_url
          ? <img src={hotel.image_url} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => e.target.style.display = 'none'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 40 }}>🏨</span>
            </div>
        }
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 9px', borderRadius: 999, background: hotel.is_active ? '#10b981' : '#94a3b8', color: '#fff', fontSize: 11, fontWeight: 700 }}>
            {hotel.is_active ? '● Actif' : '● Inactif'}
          </span>
          {hotel.is_featured && (
            <span style={{ padding: '3px 9px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700 }}>⭐ Vedette</span>
          )}
          {hotel.badge && (
            <span style={{ padding: '3px 9px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 11, fontWeight: 700 }}>{hotel.badge}</span>
          )}
        </div>
      </div>

      <div style={{ padding: '18px 18px 12px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {/* Titre */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)', lineHeight: 1.3 }}>{hotel.name}</h3>
            <span style={{ fontSize: 13, color: '#f59e0b' }}>{'★'.repeat(Number(hotel.stars || 0))}</span>
          </div>
          {hotel.subtitle && <p style={{ fontSize: 12, color: 'var(--g500)' }}>{hotel.subtitle}</p>}
          {hotel.city && <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>📍 {hotel.city}{hotel.address ? ` — ${hotel.address}` : ''}</p>}
        </div>

        {/* Tarif */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Tarif</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(hotel.base_price, hotel.currency)}</span>
            {hotel.old_price && <span style={{ fontSize: 13, color: 'var(--g400)', textDecoration: 'line-through' }}>{formatPrice(hotel.old_price, hotel.currency)}</span>}
          </div>
          <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>par nuit</p>
        </div>

        {/* Informations */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Informations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <InfoRow icon="🏨" label="Type" value={hotel.property_type || null} />
            <InfoRow icon="🕐" label="Check-in / out" value={`${hotel.checkin_time || '14:00'} / ${hotel.checkout_time || '12:00'}`} />
            <InfoRow icon="🍽️" label="Repas" value={hotel.meals || null} />
            {hotel.rating && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: 12, color: 'var(--g500)' }}>⭐ Note</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{hotel.rating} / 5 ({hotel.reviews || 0} avis)</span>
              </div>
            )}
          </div>
        </div>

        {/* Points forts */}
        {hotel.highlights && hotel.highlights.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Points forts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {hotel.highlights.slice(0, 4).map((h, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--g700)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{h}</span>
                </div>
              ))}
              {hotel.highlights.length > 4 && (
                <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>+{hotel.highlights.length - 4} autres points forts</p>
              )}
            </div>
          </div>
        )}

        {/* Récapitulatif contenu */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Contenu</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {[
              { label: 'Chambres', count: hotel.room_types?.length, icon: '🛏️' },
              { label: 'Pensions', count: hotel.meal_plans?.length, icon: '🍽️' },
              { label: 'Services', count: hotel.amenities?.length, icon: '🏊' },
              { label: 'Photos', count: hotel.gallery?.length, icon: '🖼️' },
            ].filter((i) => i.count > 0).map((item) => (
              <span
                key={item.label}
                style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(15,76,92,.08)', color: 'var(--primary)', fontSize: 10, fontWeight: 600 }}
              >
                {item.icon} {item.label}: {item.count}
              </span>
            ))}
          </div>
        </div>

        {/* Disponibilité */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--g100)' }}>Disponibilité</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: isHigh ? '#fee2e2' : isMed ? '#fff7ed' : '#d1fae5', border: `1px solid ${isHigh ? '#fca5a5' : isMed ? '#fed7aa' : '#a7f3d0'}` }}>
              <span style={{ fontSize: 12, color: isHigh ? '#991b1b' : isMed ? '#92400e' : '#065f46' }}>🛏 Chambres libres</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: isHigh ? '#e92f64' : isMed ? '#f97316' : '#065f46' }}>
                {hotel.available_rooms || 0} / {hotel.total_rooms || 0}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: 'rgba(15,76,92,.05)', border: '1px solid rgba(15,76,92,.1)' }}>
              <span style={{ fontSize: 12, color: 'var(--g500)' }}>📋 Réservations</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{hotel.reservation_count || 0} inscrit{hotel.reservation_count > 1 ? 's' : ''}</span>
            </div>
            <div style={{ padding: '7px 12px', borderRadius: 8, background: 'var(--g50)', border: '1px solid var(--g100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--g500)' }}>📈 Taux d'occupation</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: isHigh ? '#e92f64' : isMed ? '#f97316' : '#065f46' }}>{occupancy}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'var(--g200)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${occupancy}%`, borderRadius: 999, background: isHigh ? '#e92f64' : isMed ? '#f97316' : '#10b981', transition: 'width .4s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--g100)', display: 'flex', gap: 8, position: 'sticky', bottom: 0, background: '#fff' }}>
        <button className="al-btn al-btn--primary" style={{ flex: 1 }} onClick={() => { onEdit(hotel); onClose(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Modifier complet
        </button>
        <button
          className="al-btn al-btn--danger"
          onClick={() => { onDelete(hotel); onClose(); }}
          title={isMain ? 'Supprimer' : 'Réservé à l\'administrateur principal'}
          style={{ opacity: isMain ? 1 : 0.4, cursor: isMain ? 'pointer' : 'not-allowed' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const HotelCatalogAdmin = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [covers, setCovers] = useState(DEFAULT_COVER);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [editingHotel, setEditingHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const redirectIfAdminSessionExpired = (message = '') => {
    if (!message.toLowerCase().includes('session admin expiree')) return false;
    notify(message, 'error');
    setTimeout(() => navigate('/admin/login'), 900);
    return true;
  };

  const loadHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminHotels();
      setHotels(response.hotels || []);
    } catch (loadError) {
      if (redirectIfAdminSessionExpired(loadError.message || '')) return;
      setError(loadError.message || 'Impossible de charger les hôtels.');
    } finally {
      setLoading(false);
    }
  };

  const loadCovers = async () => {
    try {
      const response = await getHotelPageCover();
      setCovers({ ...DEFAULT_COVER, ...(response.data || {}), hero: normalizeHeroCover(response.data?.hero) });
    } catch {
      setCovers(DEFAULT_COVER);
    }
  };

  useEffect(() => {
    loadHotels();
    loadCovers();
  }, []);

  const filteredHotels = useMemo(() => {
    const query = search.trim().toLowerCase();
    return hotels.filter((hotel) => {
      const matchesCity = cityFilter === 'all' || hotel.city === cityFilter;
      const matchesQuery = !query
        || hotel.name?.toLowerCase().includes(query)
        || hotel.city?.toLowerCase().includes(query)
        || hotel.address?.toLowerCase().includes(query)
        || hotel.property_type?.toLowerCase().includes(query);
      return matchesCity && matchesQuery;
    });
  }, [hotels, search, cityFilter]);

  const stats = {
    total: hotels.length,
    active: hotels.filter((h) => h.is_active !== false).length,
    featured: hotels.filter((h) => h.is_featured).length,
    totalReservations: hotels.reduce((sum, h) => sum + Number(h.reservation_count || 0), 0),
  };

  const handleDelete = async (hotel) => {
    if (!isMain) { notify("Seul l'administrateur principal peut supprimer un hôtel.", 'error'); return; }
    if (!window.confirm(`Supprimer "${hotel.name}" du catalogue hôtels ?`)) return;
    try {
      await deleteAdminHotel(hotel.id);
      notify('Hôtel supprimé avec succès.');
      if (selectedHotel?.id === hotel.id) setSelectedHotel(null);
      await loadHotels();
    } catch (deleteError) {
      if (redirectIfAdminSessionExpired(deleteError.message || '')) return;
      notify(deleteError.message || 'Suppression impossible.', 'error');
    }
  };

  return (
    <AdminLayout
      title="Catalogue Hôtels"
      breadcrumb={[{ label: 'Hôtels' }, { label: 'Catalogue', active: true }]}
      toast={toast}
      actions={(
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="al-btn al-btn--ghost" onClick={() => setShowCoverModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            Apparence page
          </button>
          <button className="al-btn al-btn--primary" onClick={() => { setEditingHotel(null); setShowModal(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Ajouter un hôtel
          </button>
        </div>
      )}
    >
      {/* Stats */}
      <div className="al-stats al-stats--4">
        {[
          { label: 'Total hôtels', value: stats.total, color: 'blue', icon: <><path d="M4 20V8a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M2 20h20"/></> },
          { label: '✅ Actifs',    value: stats.active, color: 'green', icon: <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></> },
          { label: '⭐ Vedettes',  value: stats.featured, color: 'violet', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></> },
          { label: 'Réservations', value: stats.totalReservations, color: 'orange', icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
        ].map((s) => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Aperçu cover hero cliquable */}
      <div style={{ margin: '0 32px 16px' }}>
        <div
          onClick={() => setShowCoverModal(true)}
          style={{
            borderRadius: 16, overflow: 'hidden', position: 'relative', minHeight: 92,
            cursor: 'pointer', border: '1px solid var(--g200)',
            background: 'linear-gradient(135deg,#0f4c5c,#1ecad3)',
          }}
        >
          <img
            src={covers?.hero?.photo_1 || covers?.hero?.bg_image || DEFAULT_COVER.hero.photo_1}
            alt="Hero hôtels"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,20,30,.35)' }} />
          <div style={{ position: 'relative', padding: '18px 20px', color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>Hero public</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>
              {covers?.hero?.title || DEFAULT_COVER.hero.title}{' '}
              <span style={{ color: '#1ECAD3' }}>{covers?.hero?.title_accent || DEFAULT_COVER.hero.title_accent}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
              Cliquer pour modifier le hero, les textes et les 4 photos de rotation.
            </div>
          </div>
        </div>
      </div>

      {/* Table + panneau détail */}
      <div style={{ display: 'flex', margin: '0 32px 32px', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: '0 4px 12px rgba(15,76,92,.08)', overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Nom, ville, adresse, type..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="al-filter-tabs">
              {['all', ...CITIES].map((city) => (
                <button key={city} className={`al-filter-tab ${cityFilter === city ? 'active' : ''}`} onClick={() => setCityFilter(city)}>
                  {city === 'all' ? 'Toutes les villes' : city}
                </button>
              ))}
            </div>
            <button className="al-btn al-btn--ghost" onClick={loadHotels}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              Actualiser
            </button>
          </div>

          {error && (
            <div style={{ margin: '0 24px 16px', padding: '14px 16px', borderRadius: 12, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner" /></div>
              <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement des hôtels...</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 20V8a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M2 20h20"/></svg>
              </div>
              <p className="al-empty__title">Aucun hôtel trouvé</p>
              <p className="al-empty__sub">Ajoutez votre premier hôtel ou modifiez vos filtres.</p>
              <button className="al-btn al-btn--primary" onClick={() => { setEditingHotel(null); setShowModal(true); }} style={{ marginTop: 16 }}>
                + Ajouter un hôtel
              </button>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Hôtel</th>
                    <th>Ville</th>
                    <th>Prix</th>
                    <th>Contenu</th>
                    <th>Disponibilité</th>
                    <th>Réservations</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHotels.map((hotel) => {
                    const isSel = selectedHotel?.id === hotel.id;
                    const occupancy = Math.round(hotel.occupancy_percentage || 0);
                    const isHigh = occupancy >= 80;
                    const hasContent = (hotel.room_types?.length > 0) || (hotel.amenities?.length > 0) || (hotel.highlights?.length > 0);

                    return (
                      <tr
                        key={hotel.id}
                        className={`al-row ${isSel ? 'al-row--selected' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedHotel(isSel ? null : hotel)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {hotel.image_url
                              ? <img src={hotel.image_url} alt={hotel.name} style={{ width: 50, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--g200)' }} onError={(e) => e.target.style.display = 'none'} />
                              : <div style={{ width: 50, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ fontSize: 20 }}>🏨</span>
                                </div>
                            }
                            <div>
                              <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>
                                {hotel.name}
                                {'★'.repeat(Number(hotel.stars || 0)).split('').map((s, i) => (
                                  <span key={i} style={{ color: '#f59e0b', fontSize: 10, marginLeft: i === 0 ? 5 : 0 }}>★</span>
                                ))}
                                {hotel.badge && <span style={{ marginLeft: 7, padding: '2px 7px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 10, fontWeight: 700 }}>{hotel.badge}</span>}
                              </p>
                              {hotel.subtitle && <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{hotel.subtitle}</p>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>
                            📍 {hotel.city}
                          </span>
                        </td>
                        <td>
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{formatPrice(hotel.base_price, hotel.currency)}</p>
                          {hotel.old_price && <p style={{ fontSize: 11, color: 'var(--g400)', textDecoration: 'line-through' }}>{formatPrice(hotel.old_price, hotel.currency)}</p>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {hotel.room_types?.length > 0 && (
                              <span style={{ padding: '2px 7px', borderRadius: 999, background: '#d1fae5', color: '#065f46', fontSize: 10, fontWeight: 600 }}>
                                🛏️ {hotel.room_types.length}
                              </span>
                            )}
                            {hotel.amenities?.length > 0 && (
                              <span style={{ padding: '2px 7px', borderRadius: 999, background: '#e0f2fe', color: '#0369a1', fontSize: 10, fontWeight: 600 }}>
                                🏊 {hotel.amenities.length}
                              </span>
                            )}
                            {hotel.highlights?.length > 0 && (
                              <span style={{ padding: '2px 7px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 600 }}>
                                ⭐ {hotel.highlights.length}
                              </span>
                            )}
                            {hotel.gallery?.length > 0 && (
                              <span style={{ padding: '2px 7px', borderRadius: 999, background: '#f3e8ff', color: '#7c3aed', fontSize: 10, fontWeight: 600 }}>
                                🖼️ {hotel.gallery.length}
                              </span>
                            )}
                            {!hasContent && <span style={{ fontSize: 11, color: 'var(--g400)', fontStyle: 'italic' }}>—</span>}
                          </div>
                        </td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: isHigh ? '#e92f64' : '#065f46' }}>
                              {hotel.available_rooms || 0} / {hotel.total_rooms || 0}
                            </span>
                            <div style={{ marginTop: 3, height: 4, borderRadius: 999, background: 'var(--g200)', overflow: 'hidden', width: 60 }}>
                              <div style={{ height: '100%', width: `${occupancy}%`, background: isHigh ? '#e92f64' : '#10b981', borderRadius: 999 }} />
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--g400)', marginTop: 1 }}>{occupancy}% occupé</p>
                          </div>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(15,76,92,.08)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                            {hotel.reservation_count || 0} inscrit{hotel.reservation_count > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: hotel.is_active ? '#d1fae5' : 'var(--g100)', color: hotel.is_active ? '#065f46' : 'var(--g500)' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: hotel.is_active ? '#10b981' : 'var(--g400)' }} />
                              {hotel.is_active ? 'Actif' : 'Inactif'}
                            </span>
                            {hotel.is_featured && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>
                                ⭐ Vedette
                              </span>
                            )}
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="al-action-btn al-action-btn--edit"
                              onClick={() => { setEditingHotel(hotel); setShowModal(true); }}
                              title="Modifier (tous les onglets)"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(hotel)}
                              title={isMain ? 'Supprimer' : 'Réservé à l\'administrateur principal'}
                              style={{ opacity: isMain ? 1 : 0.4, cursor: isMain ? 'pointer' : 'not-allowed' }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
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
            <p className="al-count">{filteredHotels.length} hôtel{filteredHotels.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Panneau détail latéral */}
        {selectedHotel && (
          <HotelDetailsPanel
            hotel={selectedHotel}
            onClose={() => setSelectedHotel(null)}
            onEdit={(h) => { setEditingHotel(h); setShowModal(true); }}
            onDelete={handleDelete}
            isMain={isMain}
          />
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <HotelModal
          hotel={editingHotel}
          onClose={() => { setShowModal(false); setEditingHotel(null); }}
          onSaved={() => { setShowModal(false); setEditingHotel(null); loadHotels(); }}
          notify={notify}
        />
      )}

      {showCoverModal && (
        <CoverModal
          covers={covers}
          onClose={() => setShowCoverModal(false)}
          onSaved={(nextCovers) => { setCovers(nextCovers); setShowCoverModal(false); }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default HotelCatalogAdmin;