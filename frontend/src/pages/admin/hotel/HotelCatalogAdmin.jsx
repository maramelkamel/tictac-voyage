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
    tag: 'Hotels en Tunisie',
    title: 'Trouvez votre',
    title_accent: 'hotel ideal',
    sub: 'Une selection premium, des promotions actives et un parcours de reservation identique aux voyages organises.',
  },
};

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

const CITIES = ['Tunis', 'Sousse', 'Hammamet', 'Djerba'];

const normalizeTextList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatPrice = (value, currency = 'TND') => {
  const amount = Number(value || 0);
  return amount ? `${amount.toLocaleString('fr-FR')} ${currency}` : '-';
};

const getToken = () => localStorage.getItem('adminToken') || '';

const ModalField = ({ label, children }) => (
  <div className="al-field">
    <label className="al-label">{label}</label>
    {children}
  </div>
);

const EditableList = ({ label, items = [], onChange, placeholder = 'Ajouter...' }) => {
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
    onChange(items.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="al-label">{label}</label>
      {(items || []).map((item, index) => (
        <div key={`${label}-${index}`} style={{ display: 'flex', gap: 8 }}>
          <input
            className="al-input"
            value={item}
            onChange={(event) => updateItem(index, event.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="al-action-btn al-action-btn--delete"
            onClick={() => removeItem(index)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="al-input"
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addItem();
            }
          }}
          style={{ flex: 1 }}
        />
        <button type="button" className="al-btn al-btn--ghost" onClick={addItem}>
          Ajouter
        </button>
      </div>
    </div>
  );
};

const GalleryEditor = ({ images = [], onChange, notify }) => {
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const addImage = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onChange([...(images || []), trimmed]);
    setUrl('');
  };

  const removeImage = (index) => {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
  };

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      notify('Veuillez selectionner une image valide.', 'error');
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
        reader.readAsDataURL(file);
      });

      const response = await fetch(MEDIA_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ dataUrl, folder: 'hotels' }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.success === false || !json.url) {
        throw new Error(json.message || 'Upload impossible');
      }

      onChange([...(images || []), json.url]);
      notify('Image ajoutee avec succes.');
    } catch (error) {
      notify(error.message || 'Erreur upload image.', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label className="al-label">Galerie photos</label>
      {(images || []).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {images.map((image, index) => (
            <div key={`${image}-${index}`} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--g200)' }}>
              <img src={image} alt={`Hotel ${index + 1}`} style={{ width: '100%', height: 96, objectFit: 'cover', display: 'block' }} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(233,47,100,.92)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="al-input"
          placeholder="https://..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          style={{ flex: 1 }}
        />
        <button type="button" className="al-btn al-btn--ghost" onClick={addImage}>
          Ajouter URL
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(event) => uploadFile(event.target.files?.[0])}
          style={{ fontSize: 12 }}
        />
        {uploading && <span style={{ fontSize: 12, color: 'var(--g400)' }}>Upload en cours...</span>}
      </div>
    </div>
  );
};

const CoverModal = ({ covers, onClose, onSaved, notify }) => {
  const [hero, setHero] = useState({ ...DEFAULT_COVER.hero, ...(covers?.hero || {}) });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateHotelPageCover(hero);
      notify(response.message || 'Apparence hotel mise a jour.');
      onSaved({ hero });
    } catch (error) {
      notify(error.message || 'Erreur de sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{ maxWidth: 760 }} onClick={(event) => event.stopPropagation()}>
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <h2>Apparence de la page Hotels</h2>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 24, display: 'grid', gap: 20 }}>
          <div
            style={{
              minHeight: 220,
              borderRadius: 18,
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(135deg,#0f4c5c,#1ecad3)',
            }}
          >
            <img
              src={hero.bg_image || DEFAULT_COVER.hero.bg_image}
              alt="Hotels hero preview"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.42 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,40,50,.55)' }} />
            <div style={{ position: 'relative', color: '#fff', padding: 28, maxWidth: 520 }}>
              <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,.14)', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                {hero.tag || DEFAULT_COVER.hero.tag}
              </div>
              <h2 style={{ fontSize: 34, lineHeight: 1.15, margin: 0, fontWeight: 900 }}>
                {hero.title || DEFAULT_COVER.hero.title}
                <br />
                <span style={{ color: '#1ECAD3' }}>{hero.title_accent || DEFAULT_COVER.hero.title_accent}</span>
              </h2>
              <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.86)' }}>
                {hero.sub || DEFAULT_COVER.hero.sub}
              </p>
            </div>
          </div>

          <div className="al-field">
            <label className="al-label">Image hero</label>
            <input className="al-input" value={hero.bg_image} onChange={(event) => setHero((current) => ({ ...current, bg_image: event.target.value }))} />
          </div>

          <div className="al-row-2">
            <ModalField label="Tag hero">
              <input className="al-input" value={hero.tag} onChange={(event) => setHero((current) => ({ ...current, tag: event.target.value }))} />
            </ModalField>
            <ModalField label="Titre accent">
              <input className="al-input" value={hero.title_accent} onChange={(event) => setHero((current) => ({ ...current, title_accent: event.target.value }))} />
            </ModalField>
          </div>

          <ModalField label="Titre principal">
            <input className="al-input" value={hero.title} onChange={(event) => setHero((current) => ({ ...current, title: event.target.value }))} />
          </ModalField>

          <ModalField label="Sous-titre">
            <textarea className="al-textarea" rows={3} value={hero.sub} onChange={(event) => setHero((current) => ({ ...current, sub: event.target.value }))} />
          </ModalField>
        </div>

        <div className="al-form-footer">
          <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="al-btn al-btn--primary" disabled={saving} onClick={handleSave}>
            {saving ? 'Enregistrement...' : "Enregistrer l'apparence"}
          </button>
        </div>
      </div>
    </div>
  );
};

const HotelModal = ({ hotel, onClose, onSaved, notify }) => {
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
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      notify(hotel ? 'Hotel mis a jour avec succes.' : 'Hotel ajoute avec succes.');
      onSaved();
    } catch (error) {
      notify(error.message || 'Impossible de sauvegarder cet hotel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{ maxWidth: 980 }} onClick={(event) => event.stopPropagation()}>
        <div className="al-modal__header">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 20V8a2 2 0 012-2h12a2 2 0 012 2v12" />
                <path d="M2 20h20" />
              </svg>
            </div>
            <h2>{hotel ? 'Modifier hotel' : 'Ajouter un hotel'}</h2>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="al-form" onSubmit={handleSubmit} style={{ maxHeight: '78vh', overflowY: 'auto' }}>
          <div className="al-row-2">
            <ModalField label="Nom hotel">
              <input className="al-input" required value={form.name} onChange={(event) => setField('name', event.target.value)} />
            </ModalField>
            <ModalField label="Sous-titre">
              <input className="al-input" value={form.subtitle} onChange={(event) => setField('subtitle', event.target.value)} />
            </ModalField>
          </div>

          <div className="al-row-3">
            <ModalField label="Ville">
              <select className="al-select" value={form.city} onChange={(event) => setField('city', event.target.value)}>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </ModalField>
            <ModalField label="Type de propriete">
              <input className="al-input" value={form.property_type} onChange={(event) => setField('property_type', event.target.value)} />
            </ModalField>
            <ModalField label="Badge">
              <input className="al-input" value={form.badge} onChange={(event) => setField('badge', event.target.value)} placeholder="Ex: Luxe, Promo, Family" />
            </ModalField>
          </div>

          <ModalField label="Adresse">
            <input className="al-input" value={form.address} onChange={(event) => setField('address', event.target.value)} />
          </ModalField>

          <ModalField label="Description">
            <textarea className="al-textarea" rows={4} value={form.description} onChange={(event) => setField('description', event.target.value)} />
          </ModalField>

          <div className="al-row-2">
            <ModalField label="Image principale">
              <input className="al-input" value={form.image_url} onChange={(event) => setField('image_url', event.target.value)} />
            </ModalField>
            <ModalField label="Repas">
              <input className="al-input" value={form.meals} onChange={(event) => setField('meals', event.target.value)} />
            </ModalField>
          </div>

          <GalleryEditor images={form.gallery} onChange={(next) => setField('gallery', next)} notify={notify} />

          <div className="al-row-3">
            <ModalField label="Prix actuel">
              <input className="al-input" type="number" min="0" step="0.01" value={form.base_price} onChange={(event) => setField('base_price', event.target.value)} />
            </ModalField>
            <ModalField label="Ancien prix">
              <input className="al-input" type="number" min="0" step="0.01" value={form.old_price} onChange={(event) => setField('old_price', event.target.value)} />
            </ModalField>
            <ModalField label="Devise">
              <input className="al-input" value={form.currency} onChange={(event) => setField('currency', event.target.value)} />
            </ModalField>
          </div>

          <div className="al-row-3">
            <ModalField label="Etoiles">
              <input className="al-input" type="number" min="1" max="5" value={form.stars} onChange={(event) => setField('stars', event.target.value)} />
            </ModalField>
            <ModalField label="Note">
              <input className="al-input" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setField('rating', event.target.value)} />
            </ModalField>
            <ModalField label="Nombre d'avis">
              <input className="al-input" type="number" min="0" value={form.reviews} onChange={(event) => setField('reviews', event.target.value)} />
            </ModalField>
          </div>

          <div className="al-row-3">
            <ModalField label="Chambres totales">
              <input className="al-input" type="number" min="1" value={form.total_rooms} onChange={(event) => setField('total_rooms', event.target.value)} />
            </ModalField>
            <ModalField label="Check-in">
              <input className="al-input" type="time" value={form.checkin_time} onChange={(event) => setField('checkin_time', event.target.value)} />
            </ModalField>
            <ModalField label="Check-out">
              <input className="al-input" type="time" value={form.checkout_time} onChange={(event) => setField('checkout_time', event.target.value)} />
            </ModalField>
          </div>

          <div className="al-row-3">
            <ModalField label="Disponibilite">
              <input className="al-input" value={form.availability} onChange={(event) => setField('availability', event.target.value)} />
            </ModalField>
            <ModalField label="Ordre d'affichage">
              <input className="al-input" type="number" min="0" value={form.display_order} onChange={(event) => setField('display_order', event.target.value)} />
            </ModalField>
            <div className="al-field" style={{ justifyContent: 'end' }}>
              <label className="al-label">Options</label>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_featured} onChange={(event) => setField('is_featured', event.target.checked)} />
                  Hotel vedette
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_active} onChange={(event) => setField('is_active', event.target.checked)} />
                  Hotel actif
                </label>
              </div>
            </div>
          </div>

          <div className="al-row-2">
            <EditableList label="Services" items={form.amenities} onChange={(next) => setField('amenities', next)} placeholder="Ex: WiFi gratuit" />
            <EditableList label="Points forts" items={form.highlights} onChange={(next) => setField('highlights', next)} placeholder="Ex: Vue mer" />
          </div>

          <div className="al-row-2">
            <EditableList label="Types de chambres" items={form.room_types} onChange={(next) => setField('room_types', next)} placeholder="Ex: Suite familiale" />
            <EditableList label="Pensions / formules" items={form.meal_plans} onChange={(next) => setField('meal_plans', next)} placeholder="Ex: All inclusive" />
          </div>

          <div className="al-row-2">
            <EditableList label="Vues de chambres" items={form.room_views} onChange={(next) => setField('room_views', next)} placeholder="Ex: Vue mer frontale" />
            <EditableList label="Extras de reservation" items={form.reservation_extras} onChange={(next) => setField('reservation_extras', next)} placeholder="Ex: Transfert aeroport" />
          </div>

          <div className="al-row-2">
            <EditableList label="A proximite" items={form.nearby_places} onChange={(next) => setField('nearby_places', next)} placeholder="Ex: Medina de Tunis - 12 min" />
            <EditableList label="Politiques hotel" items={form.policies} onChange={(next) => setField('policies', next)} placeholder="Ex: Annulation gratuite 48h avant" />
          </div>

          <div className="al-form-footer">
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="al-btn al-btn--primary" disabled={saving}>
              {saving ? 'Sauvegarde...' : hotel ? 'Mettre a jour' : 'Creer hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HotelDetailsPanel = ({ hotel, onClose, onEdit, onDelete }) => {
  if (!hotel) return null;

  return (
    <div style={{ width: 360, borderLeft: '1px solid var(--g200)', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 22, borderBottom: '1px solid var(--g100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--g900)' }}>{hotel.name}</p>
          <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 4 }}>{hotel.city}</p>
        </div>
        <button className="al-action-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
        <img src={hotel.image_url} alt={hotel.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 16 }} />

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', marginBottom: 8 }}>Positionnement</p>
          <p style={{ fontSize: 14, color: 'var(--g700)', lineHeight: 1.8 }}>{hotel.subtitle || hotel.description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Prix', value: formatPrice(hotel.base_price, hotel.currency) },
            { label: 'Popularite', value: `${Math.round(hotel.occupancy_percentage || 0)}%` },
            { label: 'Reservations', value: hotel.reservation_count || 0 },
            { label: 'Chambres libres', value: hotel.available_rooms || 0 },
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--g50)', border: '1px solid var(--g100)' }}>
              <div style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--g800)' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', marginBottom: 8 }}>Services</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(hotel.amenities || []).map((item) => (
              <span key={item} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(15,76,92,.08)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', marginBottom: 8 }}>Reservation en front</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              ['Chambres', (hotel.room_types || []).join(', ') || '-'],
              ['Pensions', (hotel.meal_plans || []).join(', ') || hotel.meals || '-'],
              ['Vues', (hotel.room_views || []).join(', ') || '-'],
              ['Extras', (hotel.reservation_extras || []).join(', ') || '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: 'var(--g700)' }}>
                <span style={{ color: 'var(--g400)' }}>{label}</span>
                <span style={{ fontWeight: 700, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--g400)', textTransform: 'uppercase', marginBottom: 8 }}>Fiche hotel</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              ['Adresse', hotel.address],
              ['Repas', hotel.meals],
              ['Check-in', hotel.checkin_time],
              ['Check-out', hotel.checkout_time],
              ['Type', hotel.property_type],
              ['Badge', hotel.badge || '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: 'var(--g700)' }}>
                <span style={{ color: 'var(--g400)' }}>{label}</span>
                <span style={{ fontWeight: 700, textAlign: 'right' }}>{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: 18, borderTop: '1px solid var(--g100)', display: 'flex', gap: 8 }}>
        <button className="al-btn al-btn--primary" style={{ flex: 1 }} onClick={() => onEdit(hotel)}>
          Modifier
        </button>
        <button className="al-btn al-btn--danger" onClick={() => onDelete(hotel)}>
          Supprimer
        </button>
      </div>
    </div>
  );
};

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

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const redirectIfAdminSessionExpired = (message = '') => {
    if (!message.toLowerCase().includes('session admin expiree')) {
      return false;
    }
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
      setError(loadError.message || 'Impossible de charger les hotels.');
    } finally {
      setLoading(false);
    }
  };

  const loadCovers = async () => {
    try {
      const response = await getHotelPageCover();
      setCovers(response.data || DEFAULT_COVER);
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
    active: hotels.filter((hotel) => hotel.is_active !== false).length,
    featured: hotels.filter((hotel) => hotel.is_featured).length,
    totalReservations: hotels.reduce((sum, hotel) => sum + Number(hotel.reservation_count || 0), 0),
  };

  const handleDelete = async (hotel) => {
    const confirmed = window.confirm(`Supprimer "${hotel.name}" du catalogue hotels ?`);
    if (!confirmed) return;

    try {
      await deleteAdminHotel(hotel.id);
      notify('Hotel supprime avec succes.');
      if (selectedHotel?.id === hotel.id) setSelectedHotel(null);
      await loadHotels();
    } catch (deleteError) {
      if (redirectIfAdminSessionExpired(deleteError.message || '')) return;
      notify(deleteError.message || 'Suppression impossible.', 'error');
    }
  };

  return (
    <AdminLayout
      title="Catalogue Hotels"
      breadcrumb={[{ label: 'Hotels' }, { label: 'Catalogue', active: true }]}
      toast={toast}
      actions={(
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="al-btn al-btn--ghost" onClick={() => setShowCoverModal(true)}>
            Apparence page
          </button>
          <button
            className="al-btn al-btn--primary"
            onClick={() => {
              setEditingHotel(null);
              setShowModal(true);
            }}
          >
            Ajouter un hotel
          </button>
        </div>
      )}
    >
      <div className="al-stats al-stats--4">
        {[
          { label: 'Hotels total', value: stats.total, color: 'blue' },
          { label: 'Hotels actifs', value: stats.active, color: 'green' },
          { label: 'Hotels vedettes', value: stats.featured, color: 'violet' },
          { label: 'Reservations total', value: stats.totalReservations, color: 'orange' },
        ].map((stat) => (
          <div key={stat.label} className={`al-stat al-stat--${stat.color}`}>
            <div>
              <p className="al-stat__value">{stat.value}</p>
              <p className="al-stat__label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: '0 32px 16px' }}>
        <div
          onClick={() => setShowCoverModal(true)}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            minHeight: 92,
            cursor: 'pointer',
            border: '1px solid var(--g200)',
            background: 'linear-gradient(135deg,#0f4c5c,#1ecad3)',
          }}
        >
          <img
            src={covers?.hero?.bg_image || DEFAULT_COVER.hero.bg_image}
            alt="Hotels hero"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,20,30,.35)' }} />
          <div style={{ position: 'relative', padding: '18px 20px', color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>Hero public</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>
              {covers?.hero?.title || DEFAULT_COVER.hero.title} <span style={{ color: '#1ECAD3' }}>{covers?.hero?.title_accent || DEFAULT_COVER.hero.title_accent}</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
              Cliquer pour modifier le hero, les textes et l'image de la page Hotels.
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', margin: '0 32px 32px', background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,76,92,.08)' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="al-toolbar">
            <div className="al-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Nom, ville, adresse, type..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>

            <div className="al-filter-tabs">
              {['all', ...CITIES].map((city) => (
                <button key={city} className={`al-filter-tab ${cityFilter === city ? 'active' : ''}`} onClick={() => setCityFilter(city)}>
                  {city === 'all' ? 'Toutes les villes' : city}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ margin: '0 24px 16px', padding: '14px 16px', borderRadius: 12, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="al-loading">
              <div className="al-spinner-wrap"><div className="al-spinner" /></div>
              <p style={{ fontSize: 13, color: 'var(--g400)' }}>Chargement des hotels...</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">H</div>
              <p className="al-empty__title">Aucun hotel trouve</p>
              <p className="al-empty__sub">Ajoutez un hotel ou modifiez vos filtres.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Ville</th>
                    <th>Prix</th>
                    <th>Popularite</th>
                    <th>Disponibilite</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHotels.map((hotel) => (
                    <tr
                      key={hotel.id}
                      className={`al-row ${selectedHotel?.id === hotel.id ? 'al-row--selected' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedHotel(selectedHotel?.id === hotel.id ? null : hotel)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={hotel.image_url} alt={hotel.name} style={{ width: 58, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--g200)' }} />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>
                              {hotel.name}
                              {hotel.badge && (
                                <span style={{ marginLeft: 8, padding: '2px 7px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 10, fontWeight: 700 }}>
                                  {hotel.badge}
                                </span>
                              )}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{hotel.subtitle || hotel.property_type}</p>
                          </div>
                        </div>
                      </td>
                      <td>{hotel.city}</td>
                      <td>{formatPrice(hotel.base_price, hotel.currency)}</td>
                      <td>
                        <span className="al-badge-pill b--blue">
                          {hotel.reservation_count || 0} res.
                        </span>
                      </td>
                      <td>{hotel.available_rooms || 0} / {hotel.total_rooms || 0}</td>
                      <td>
                        <span className={`al-badge-pill ${hotel.is_active === false ? 'b--gray' : 'b--green'}`}>
                          {hotel.is_active === false ? 'Inactif' : hotel.is_featured ? 'Vedette' : 'Actif'}
                        </span>
                      </td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="al-action-btn al-action-btn--edit"
                            onClick={() => {
                              setEditingHotel(hotel);
                              setShowModal(true);
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="al-action-btn al-action-btn--delete" onClick={() => handleDelete(hotel)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="al-table-footer">
            <p className="al-count">{filteredHotels.length} hotel(s) affiche(s)</p>
          </div>
        </div>

        {selectedHotel && (
          <HotelDetailsPanel
            hotel={selectedHotel}
            onClose={() => setSelectedHotel(null)}
            onEdit={(hotel) => {
              setEditingHotel(hotel);
              setShowModal(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>

      {showModal && (
        <HotelModal
          hotel={editingHotel}
          onClose={() => {
            setShowModal(false);
            setEditingHotel(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingHotel(null);
            loadHotels();
          }}
          notify={notify}
        />
      )}

      {showCoverModal && (
        <CoverModal
          covers={covers}
          onClose={() => setShowCoverModal(false)}
          onSaved={(nextCovers) => {
            setCovers(nextCovers);
            setShowCoverModal(false);
          }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default HotelCatalogAdmin;
