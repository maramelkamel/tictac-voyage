import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API = 'http://localhost:5000/api/hotels';
const MEDIA_API = 'http://localhost:5000/api/media/upload';
const getAdminToken = () => localStorage.getItem('adminToken') || '';

const EMPTY = {
  code: '',
  name: '',
  city: '',
  address: '',
  description: '',
  image_url: '',
  gallery: [],
  stars: 4,
  amenities: [],
  price_options: [
    { label: 'LPD', value: 0 },
    { label: 'DP', value: 0 },
    { label: 'PC', value: 0 },
    { label: 'AI', value: 0 },
  ],
  is_active: true,
};

const ModalField = ({ label, req, children }) => (
  <div className="al-field">
    <label className="al-label">{label} {req && <span className="al-required">*</span>}</label>
    {children}
  </div>
);

const EditableList = ({ label, items = [], onChange, placeholder = 'Ajouter…' }) => {
  const [newItem, setNewItem] = useState('');
  const add = () => {
    const v = newItem.trim();
    if (!v) return;
    onChange([...(items || []), v]);
    setNewItem('');
  };
  const remove = (idx) => onChange((items || []).filter((_, i) => i !== idx));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="al-label">{label}</label>
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="al-input" value={newItem} placeholder={placeholder}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <button type="button" className="al-btn al-btn--ghost" onClick={add}>+ Ajouter</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(items || []).map((it, idx) => (
          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px',
            background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 999, fontSize: 12, fontWeight: 700, color: 'var(--g700)' }}>
            {it}
            <button type="button" onClick={() => remove(idx)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#e92f64', fontWeight: 900 }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};

const GalleryEditor = ({ images = [], onChange, notify, folder = 'hotels' }) => {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const addUrl = () => {
    const v = newUrl.trim();
    if (!v) return;
    onChange([...(images || []), v]);
    setNewUrl('');
  };
  const remove = (idx) => onChange((images || []).filter((_, i) => i !== idx));

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) return notify?.('Veuillez sélectionner une image.', 'error');
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify({ dataUrl, folder }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || 'Upload échoué');
      if (json.url) onChange([...(images || []), json.url]);
    } catch (e) {
      notify?.(e.message || 'Erreur upload', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label className="al-label">Galerie (URLs / Upload)</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {(images || []).map((url, i) => (
          <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--g200)' }}>
            <img src={url} alt={`Galerie ${i + 1}`} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.style.background = '#f1f5f9'; }} />
            <button type="button" onClick={() => remove(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22,
              borderRadius: '50%', background: 'rgba(233,47,100,.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11 }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input className="al-input" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL de la nouvelle image…" style={{ flex: 1, fontSize: 12 }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
        />
        <button type="button" className="al-btn al-btn--ghost" onClick={addUrl}>+ Ajouter</button>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => uploadFile(e.target.files?.[0])} />
        <button type="button" disabled={uploading} className="al-btn al-btn--primary"
          onClick={() => fileRef.current?.click()}
          style={{ opacity: uploading ? 0.7 : 1 }}
        >
          {uploading ? 'Upload…' : '⬆ Upload'}
        </button>
      </div>
    </div>
  );
};

const PriceOptionsEditor = ({ options = [], onChange }) => {
  const update = (idx, key, value) => {
    const next = [...(options || [])];
    next[idx] = { ...next[idx], [key]: value };
    onChange(next);
  };
  const add = () => onChange([...(options || []), { label: 'LPD', value: 0 }]);
  const remove = (idx) => onChange((options || []).filter((_, i) => i !== idx));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label className="al-label">Prix par pension (abréviations)</label>
      <div style={{ display: 'grid', gap: 8 }}>
        {(options || []).map((o, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 40px', gap: 8, alignItems: 'center' }}>
            <input className="al-input" value={o.label || ''} onChange={(e) => update(idx, 'label', e.target.value.toUpperCase())} />
            <input className="al-input" type="number" min="0" step="0.01" value={o.value ?? 0}
              onChange={(e) => update(idx, 'value', Number(e.target.value))} />
            <button type="button" className="al-btn al-btn--ghost" onClick={() => remove(idx)} title="Supprimer">✕</button>
          </div>
        ))}
      </div>
      <button type="button" className="al-btn al-btn--ghost" onClick={add} style={{ alignSelf: 'flex-start' }}>+ Ajouter pension</button>
    </div>
  );
};

const HotelModal = ({ hotel, onClose, onSaved, notify }) => {
  const isEdit = !!hotel;
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(hotel || {}),
    stars: Number(hotel?.stars || 4),
    gallery: Array.isArray(hotel?.gallery) ? hotel.gallery : [],
    amenities: Array.isArray(hotel?.amenities) ? hotel.amenities : [],
    price_options: Array.isArray(hotel?.price_options) ? hotel.price_options : EMPTY.price_options,
    is_active: hotel?.is_active !== false,
  }));

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.city) return notify('Nom et ville obligatoires', 'error');
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `${API}/admin/${hotel.id}` : `${API}/admin`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify({
          ...form,
          stars: Number(form.stars) || 4,
          gallery: form.gallery || [],
          amenities: form.amenities || [],
          price_options: (form.price_options || []).map((p) => ({ label: String(p.label || '').toUpperCase(), value: Number(p.value) || 0 })),
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Erreur');
      notify(isEdit ? 'Hôtel mis à jour ✅' : 'Hôtel créé ✅');
      onSaved();
    } catch (err) {
      notify(err.message || 'Erreur réseau', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'general', label: 'Général' },
    { key: 'detail', label: 'Détails' },
    { key: 'media', label: 'Médias' },
    { key: 'pricing', label: 'Pensions' },
    { key: 'advanced', label: 'Avancé' },
  ];

  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" style={{ maxWidth: 760, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 21V10l9-7 9 7v11"/><path d="M9 21V12h6v9"/>
              </svg>
            </div>
            <div>
              <h2>{isEdit ? 'Modifier hôtel' : 'Nouvel hôtel'}</h2>
              <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>{isEdit ? `Édition de "${hotel.name}"` : 'Créer un hôtel en Tunisie'}</p>
            </div>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--g200)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)}
                style={{
                  padding: '12px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 12, fontWeight: 800, color: tab === t.key ? 'var(--primary)' : 'var(--g400)',
                  borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <form onSubmit={save} style={{ display: 'contents' }}>
            {tab === 'general' && (
              <>
                <div className="al-row-2">
                  <ModalField label="Code">
                    <input className="al-input" value={form.code || ''} onChange={(e) => set('code', e.target.value)} placeholder="TN-HAM-001" />
                  </ModalField>
                  <ModalField label="Étoiles">
                    <input className="al-input" type="number" min="1" max="5" value={form.stars} onChange={(e) => set('stars', e.target.value)} />
                  </ModalField>
                </div>
                <ModalField label="Nom" req>
                  <input className="al-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </ModalField>
                <div className="al-row-2">
                  <ModalField label="Ville" req>
                    <input className="al-input" value={form.city} onChange={(e) => set('city', e.target.value)} required />
                  </ModalField>
                  <ModalField label="Adresse">
                    <input className="al-input" value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
                  </ModalField>
                </div>
              </>
            )}

            {tab === 'detail' && (
              <>
                <ModalField label="Description">
                  <textarea className="al-textarea" rows={5} value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
                </ModalField>
                <EditableList label="Équipements" items={form.amenities} onChange={(v) => set('amenities', v)} placeholder="Ex: Piscine" />
              </>
            )}

            {tab === 'media' && (
              <>
                <ModalField label="Image principale (URL)">
                  <input className="al-input" value={form.image_url || ''} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" />
                </ModalField>
                <GalleryEditor images={form.gallery} onChange={(v) => set('gallery', v)} notify={notify} folder="hotels" />
              </>
            )}

            {tab === 'pricing' && (
              <PriceOptionsEditor options={form.price_options} onChange={(v) => set('price_options', v)} />
            )}

            {tab === 'advanced' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={!!form.is_active} onChange={(e) => set('is_active', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--g700)' }}>Hôtel actif (visible côté client)</span>
              </div>
            )}

            <div className="al-form-footer" style={{ flexShrink: 0 }}>
              <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="al-btn al-btn--primary" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const HotelsAdmin = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editHotel, setEditHotel] = useState(null);

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?limit=60&page=1`, { cache: 'no-store' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur');
      setHotels(json.hotels || []);
    } catch (e) {
      notify(e.message || 'Erreur chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (hotels || []).filter((h) =>
      !q ||
      (h.name || '').toLowerCase().includes(q) ||
      (h.city || '').toLowerCase().includes(q) ||
      (h.code || '').toLowerCase().includes(q)
    );
  }, [hotels, search]);

  const remove = async (h) => {
    if (!isMain) return notify('Réservé à l’administrateur principal', 'error');
    if (!window.confirm(`Supprimer "${h.name}" ?`)) return;
    try {
      const res = await fetch(`${API}/admin/${h.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || 'Erreur');
      notify('Hôtel supprimé ✅');
      fetchHotels();
    } catch (e) {
      notify(e.message || 'Erreur suppression', 'error');
    }
  };

  return (
    <AdminLayout
      title="Hôtels"
      breadcrumb={[{ label: 'Hôtels', active: true }]}
      toast={toast}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="al-btn al-btn--ghost" onClick={fetchHotels}>Actualiser</button>
          <button className="al-btn al-btn--primary" onClick={() => { setEditHotel(null); setShowModal(true); }}>+ Nouvel hôtel</button>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
        <input className="al-input" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
        <span style={{ color: 'var(--g400)', fontSize: 12 }}>{filtered.length} hôtel(s)</span>
      </div>

      {loading ? (
        <div style={{ padding: 24, color: 'var(--g500)' }}>Chargement…</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--g200)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--g50)', borderBottom: '1px solid var(--g200)', padding: '12px 20px', display: 'grid',
            gridTemplateColumns: '64px 1.2fr 1fr 120px 110px 160px', gap: 12, alignItems: 'center' }}>
            {['Image', 'Hôtel', 'Ville', 'Étoiles', 'Statut', 'Actions'].map((h) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 900, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</div>
            ))}
          </div>

          {filtered.map((h, idx) => (
            <div key={h.id} style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '64px 1.2fr 1fr 120px 110px 160px', gap: 12, alignItems: 'center',
              borderBottom: idx < filtered.length - 1 ? '1px solid var(--g100)' : 'none' }}>
              <div style={{ width: 56, height: 40, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--g200)' }}>
                {h.image_url ? <img src={h.image_url} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
              </div>
              <div>
                <div style={{ fontWeight: 900, color: 'var(--g900)' }}>{h.name}</div>
                <div style={{ fontSize: 11, color: 'var(--g400)' }}>{h.code || `#${h.id}`}</div>
              </div>
              <div style={{ color: 'var(--g600)', fontSize: 13 }}>{h.city}</div>
              <div style={{ fontWeight: 900, color: 'var(--secondary)' }}>{h.stars || 4}★</div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 900,
                  background: h.is_active ? '#d1fae5' : 'var(--g100)', color: h.is_active ? '#065f46' : 'var(--g500)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: h.is_active ? '#10b981' : 'var(--g400)' }} />
                  {h.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="al-action-btn al-action-btn--edit" onClick={() => { setEditHotel(h); setShowModal(true); }} title="Modifier">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="al-action-btn al-action-btn--delete" onClick={() => remove(h)} title={isMain ? 'Supprimer' : 'Réservé admin principal'}
                  style={{ opacity: isMain ? 1 : 0.4, cursor: isMain ? 'pointer' : 'not-allowed' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <HotelModal
          hotel={editHotel}
          onClose={() => { setShowModal(false); setEditHotel(null); }}
          onSaved={() => { setShowModal(false); setEditHotel(null); fetchHotels(); }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default HotelsAdmin;
