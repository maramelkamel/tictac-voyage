import React, { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import './omraadmin.css';

// API endpoints used by the Omra catalogue and the editable page appearance preview.
const API_PKG = 'http://localhost:5000/api/omra/packages';
const COVERS_API = 'http://localhost:5000/api/omra/packages/omra-covers';

// Shared display helper for prices shown in the Omra admin table and detail panel.
const fPrice = (price) =>
price !== null && price !== undefined && price !== '' ?
`${Number(price).toLocaleString('fr-TN')} TND` :
'-';


// Default form values for creating a new Omra package.
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
  is_active: true
};

// Fallback hero copy used when no custom Omra page appearance is saved yet.
const DEFAULT_COVERS = {
  hero: {
    bg_image: '',
    tag: 'Pelerinage et spiritualite',
    title: 'Votre voyage',
    title_accent: 'spirituel ideal',
    sub: 'Accomplissez votre Omra en toute serenite avec des forfaits concus pour une experience claire, confortable et bien accompagnee.'
  }
};

// Small wrapper that keeps every modal field label and required marker consistent.
const ModalField = ({ label, req, children }) =>
<div className="al-field">
    <label className="al-label">
      {label} {req && <span className="al-required">*</span>}
    </label>
    {children}
  </div>;


// Reusable list editor for package includes, with add, update, and remove actions.
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
    <div className="omra-admin-001">
      <label className="al-label">{label}</label>

      {items.map((item, index) =>
      <div key={`${label}-${index}`} className="omra-admin-002">
          <input
          className="al-input"
          value={item}
          onChange={(e) => updateItem(index, e.target.value)}
          placeholder={`${label} ${index + 1}`} />
        
          <button
          type="button"
          className="al-btn al-btn--danger omra-admin-003"

          onClick={() => removeItem(index)}>
          
            Retirer
          </button>
        </div>
      )}

      <div className="omra-admin-004">
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
          }} />
        
        <button type="button" className="al-btn al-btn--ghost" onClick={addItem}>
          Ajouter
        </button>
      </div>
    </div>);

};

// Modal dedicated to the public Omra page hero, including a live visual preview.
const CoversModal = ({ covers, onClose, onSaved, notify }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hero: { ...DEFAULT_COVERS.hero, ...(covers?.hero || {}) }
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
        body: JSON.stringify(form)
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
        className="al-modal omra-admin-005"

        onClick={(e) => e.stopPropagation()}>
        
        <div className="al-modal__header omra-admin-006">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon omra-admin-007">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div>
              <h2>Apparence de la page Omra</h2>
              <p className="omra-admin-008">
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

        <div className="omra-admin-009">
          <div className="omra-admin-010">








            
            {form.hero.bg_image &&
            <img
              src={form.hero.bg_image}
              alt="Hero Omra"

              onError={(e) => {
                e.target.style.display = 'none';
              }} className="omra-admin-011" />

            }
            <div className="omra-admin-012" />
            <div className="omra-admin-013">
              <span className="omra-admin-014">











                
                {form.hero.tag || DEFAULT_COVERS.hero.tag}
              </span>
              <h1 className="omra-admin-015">
                {form.hero.title || DEFAULT_COVERS.hero.title}
                <br />
                <span className="omra-admin-016">
                  {form.hero.title_accent || DEFAULT_COVERS.hero.title_accent}
                </span>
              </h1>
              <p className="omra-admin-017">
                {form.hero.sub || DEFAULT_COVERS.hero.sub}
              </p>
            </div>
          </div>

          <ModalField label="Image de fond">
            <input
              className="al-input"
              value={form.hero.bg_image}
              onChange={(e) => setHero('bg_image', e.target.value)}
              placeholder="https://..." />
            
          </ModalField>

          <ModalField label="Tag hero">
            <input
              className="al-input"
              value={form.hero.tag}
              onChange={(e) => setHero('tag', e.target.value)}
              placeholder="Pelerinage et spiritualite" />
            
          </ModalField>

          <div className="al-row-2">
            <ModalField label="Titre principal">
              <input
                className="al-input"
                value={form.hero.title}
                onChange={(e) => setHero('title', e.target.value)}
                placeholder="Votre voyage" />
              
            </ModalField>

            <ModalField label="Titre accent">
              <input
                className="al-input"
                value={form.hero.title_accent}
                onChange={(e) => setHero('title_accent', e.target.value)}
                placeholder="spirituel ideal" />
              
            </ModalField>
          </div>

          <ModalField label="Sous-texte">
            <textarea
              className="al-textarea"
              rows={4}
              value={form.hero.sub}
              onChange={(e) => setHero('sub', e.target.value)}
              placeholder="Sous texte du hero..." />
            
          </ModalField>
        </div>

        <div className="al-form-footer omra-admin-006">
          <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="al-btn al-btn--primary omra-admin-018"
            onClick={handleSave}
            disabled={loading}>

            
            {loading ? 'Enregistrement...' : 'Enregistrer apparence'}
          </button>
        </div>
      </div>
    </div>);

};

// Create/edit modal for Omra packages; tabs separate general, detail, media, and summary fields.
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
    includes: Array.isArray(pkg?.includes) ?
    pkg.includes.map((item) => typeof item === 'string' ? item : item?.label || '').filter(Boolean) :
    [],
    is_active: pkg?.is_active !== false
  }));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const tabs = [
  { key: 'general', label: 'General' },
  { key: 'detail', label: 'Details' },
  { key: 'media', label: 'Medias' },
  { key: 'advanced', label: 'Avance' }];


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
          includes: form.includes.filter(Boolean)
        })
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
        className="al-modal omra-admin-019"

        onClick={(e) => e.stopPropagation()}>
        
        <div className="al-modal__header omra-admin-006">
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>
            </div>
            <div>
              <h2>{isEdit ? 'Modifier le forfait Omra' : 'Nouveau forfait Omra'}</h2>
              <p className="omra-admin-008">
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

        <div className="omra-admin-020">
          <div className="omra-admin-021">
            {tabs.map((tab) =>
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
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--g500)'
              }}>
              
                {tab.label}
              </button>
            )}
          </div>
        </div>

        <form className="al-form omra-admin-022" onSubmit={handleSubmit}>
          <div className="omra-admin-023">
            {activeTab === 'general' &&
            <>
                <ModalField label="Titre" req>
                  <input
                  className="al-input"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Ex: Omra Ramadan Premium"
                  required />
                
                </ModalField>

                <ModalField label="Sous-titre">
                  <input
                  className="al-input"
                  value={form.subtitle}
                  onChange={(e) => set('subtitle', e.target.value)}
                  placeholder="Ex: Hotel proche Haram, guide francophone" />
                
                </ModalField>

                <ModalField label="Description">
                  <textarea
                  className="al-textarea"
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Description complete du forfait Omra..." />
                
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

                  <div className="omra-admin-024">
                    <label className="omra-admin-025">
                      <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => set('is_active', e.target.checked)} className="omra-admin-026" />

                    
                      Forfait actif sur le site
                    </label>
                  </div>
                </div>
              </>
            }

            {activeTab === 'detail' &&
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
                    required />
                  
                  </ModalField>

                  <ModalField label="Ancien prix (TND)">
                    <input
                    className="al-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.old_price}
                    onChange={(e) => set('old_price', e.target.value)}
                    placeholder="4000" />
                  
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
                    required />
                  
                  </ModalField>

                  <ModalField label="Depart">
                    <input
                    className="al-input"
                    value={form.departure}
                    onChange={(e) => set('departure', e.target.value)}
                    placeholder="Ex: 15 Mars 2026" />
                  
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
                    placeholder="50" />
                  
                  </ModalField>

                  <div className="al-row-2 omra-admin-027">
                    <ModalField label="Note">
                      <input
                      className="al-input"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => set('rating', e.target.value)}
                      placeholder="5" />
                    
                    </ModalField>

                    <ModalField label="Avis">
                      <input
                      className="al-input"
                      type="number"
                      min="0"
                      value={form.reviews}
                      onChange={(e) => set('reviews', e.target.value)}
                      placeholder="0" />
                    
                    </ModalField>
                  </div>
                </div>

                <div className="omra-admin-028">
                  <EditableList
                  label="Ce qui est inclus"
                  items={form.includes}
                  onChange={(value) => set('includes', value)}
                  placeholder="Ex: Vol inclus" />
                
                </div>
              </>
            }

            {activeTab === 'media' &&
            <>
                <ModalField label="Image principale">
                  <input
                  className="al-input"
                  value={form.image_url}
                  onChange={(e) => set('image_url', e.target.value)}
                  placeholder="https://..." />
                
                </ModalField>

                {form.image_url &&
              <div className="omra-admin-029">
                    <img
                  src={form.image_url}
                  alt="Apercu"

                  onError={(e) => {
                    e.target.style.display = 'none';
                  }} className="omra-admin-030" />
                
                    <p className="omra-admin-031">
                      Apercu image principale
                    </p>
                  </div>
              }
              </>
            }

            {activeTab === 'advanced' &&
            <div className="omra-admin-032">
                <div className="omra-admin-033">
                  <p className="omra-admin-034">Resume</p>
                  <div className="omra-admin-035">
                    <div className="omra-admin-036">
                      <span className="omra-admin-037">Titre</span>
                      <strong className="omra-admin-038">{form.title || '-'}</strong>
                    </div>
                    <div className="omra-admin-036">
                      <span className="omra-admin-037">Prix</span>
                      <strong className="omra-admin-039">{form.price || '-'} TND</strong>
                    </div>
                    <div className="omra-admin-036">
                      <span className="omra-admin-037">Duree</span>
                      <strong className="omra-admin-039">{form.duration || '-'} jours</strong>
                    </div>
                    <div className="omra-admin-036">
                      <span className="omra-admin-037">Elements inclus</span>
                      <strong className="omra-admin-039">{form.includes.length}</strong>
                    </div>
                  </div>
                </div>

                <div className="omra-admin-040">
                  <p className="omra-admin-041">
                    Le formulaire Omra suit maintenant le meme format d ajout et d edition que les circuits.
                    Les champs affiches correspondent uniquement a ce qui existe deja dans votre base de donnees.
                  </p>
                </div>
              </div>
            }
          </div>

          <div className="al-form-footer omra-admin-006">
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="al-btn al-btn--primary" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Creer le forfait'}
            </button>
          </div>
        </form>
      </div>
    </div>);

};

// Side panel preview for the selected package, with quick edit/delete actions.
const OmraDetail = ({ pkg, onClose, onEdit, onDelete, isMain }) => {
  const available = pkg.available_spots !== undefined ? Number(pkg.available_spots) : Number(pkg.spots);
  const total = Number(pkg.spots) || 0;
  const isFull = available <= 0;
  const isLow = available > 0 && available <= 5;
  const includes = Array.isArray(pkg.includes) ?
  pkg.includes.map((item) => typeof item === 'string' ? item : item?.label || '').filter(Boolean) :
  [];

  const InfoRow = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="omra-admin-042">









        
        <span className="omra-admin-037">{label}</span>
        <span className="omra-admin-043">{value}</span>
      </div>);

  };

  return (
    <div className="omra-admin-044">
      <div className="omra-admin-045">
        <div className="omra-admin-046">
          <p className="omra-admin-047">{pkg.title}</p>
          <p className="omra-admin-048">Apercu du forfait Omra</p>
        </div>
        <button className="al-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="omra-admin-049">
        {pkg.image_url ?
        <img
          src={pkg.image_url}
          alt={pkg.title}

          onError={(e) => {
            e.target.style.display = 'none';
          }} className="omra-admin-050" /> :


        <div className="omra-admin-051" />







        }

        <div>
          <p className="omra-admin-052">
            Prix
          </p>
          <div className="omra-admin-053">
            <span className="omra-admin-054">{fPrice(pkg.price)}</span>
            {pkg.old_price &&
            <span className="omra-admin-055">
                {fPrice(pkg.old_price)}
              </span>
            }
          </div>
          {pkg.badge &&
          <span className="omra-admin-056">










            
              {pkg.badge}
            </span>
          }
        </div>

        <div className="omra-admin-057">
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
            border: `1px solid ${isFull ? '#fca5a5' : isLow ? '#fed7aa' : '#a7f3d0'}`
          }}>
          
          <p style={{ margin: 0, fontSize: 12, color: isFull ? '#991b1b' : isLow ? '#92400e' : '#065f46', fontWeight: 700 }}>
            {isFull ? 'Complet' : `Places disponibles: ${available} / ${total}`}
          </p>
        </div>

        {pkg.description &&
        <div>
            <p className="omra-admin-058">
              Description
            </p>
            <p className="omra-admin-059">{pkg.description}</p>
          </div>
        }

        {includes.length > 0 &&
        <div>
            <p className="omra-admin-058">
              Inclus
            </p>
            <div className="omra-admin-060">
              {includes.map((item, index) =>
            <span
              key={`${item}-${index}`} className="omra-admin-061">








              
                  {item}
                </span>
            )}
            </div>
          </div>
        }
      </div>

      <div className="omra-admin-062">
        <button className="al-btn al-btn--primary omra-admin-046" onClick={() => {onEdit(pkg);onClose();}}>
          Modifier
        </button>
        <button
          className="al-btn al-btn--danger"
          onClick={() => {onDelete(pkg.id);onClose();}}
          title={isMain ? 'Supprimer ce forfait' : 'Reserve a l administrateur principal'}
          style={{ opacity: isMain ? 1 : 0.45, cursor: isMain ? 'pointer' : 'not-allowed' }}>
          
          {isMain ? 'Supprimer' : 'Supprimer'}
        </button>
      </div>
    </div>);

};

// Main Omra packages screen: loads data, manages modals, computes stats, and renders the table.
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
    }};

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
    totalReservations: packages.reduce((sum, item) => sum + (parseInt(item.reservation_count, 10) || 0), 0)
  };

  return (
    <AdminLayout
      title="Forfaits Omra"
      breadcrumb={[{ label: 'Omra' }, { label: 'Forfaits', active: true }]}
      actions={
      <div className="omra-admin-063">
          <button className="al-btn al-btn--ghost" onClick={() => setShowCovers(true)}>
            Apparence page
          </button>
          <button
          className="al-btn al-btn--primary"
          onClick={() => {
            setEditPkg(null);
            setShowModal(true);
          }}>
          
            Nouveau forfait
          </button>
        </div>
      }
      toast={toast}>
      
      <div className="al-stats al-stats--4">
        {[
        { label: 'Total forfaits', value: stats.total, color: 'blue', icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></> },
        { label: 'Actifs', value: stats.active, color: 'green', icon: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></> },
        { label: 'Inactifs', value: stats.inactive, color: 'gray', icon: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></> },
        { label: 'Reservations', value: stats.totalReservations, color: 'teal', icon: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></> }].
        map((stat) =>
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
        )}
      </div>

      {covers?.hero &&
      <div className="omra-admin-064">
          <div
          onClick={() => setShowCovers(true)} className="omra-admin-065">









          
            {covers.hero.bg_image &&
          <img
            src={covers.hero.bg_image}
            alt="Hero Omra"

            onError={(e) => {
              e.target.style.display = 'none';
            }} className="omra-admin-066" />

          }
            <div className="omra-admin-067" />
            <div className="omra-admin-068">
              <div>
                <p className="omra-admin-069">
                  {covers.hero.title}{' '}
                  <span className="omra-admin-016">{covers.hero.title_accent}</span>
                </p>
                <p className="omra-admin-070">
                  Hero Omra actuel - cliquer pour modifier
                </p>
              </div>
            </div>
          </div>
        </div>
      }

      <div className="omra-admin-071">









        
        <div className="omra-admin-072">
          <div className="al-toolbar">
            <p className="omra-admin-073">Liste des forfaits Omra</p>
            <button className="al-btn al-btn--ghost" onClick={fetchPackages}>
              Actualiser
            </button>
          </div>

          {loading ?
          <div className="al-loading">
              <div className="al-spinner-wrap">
                <div className="al-spinner" />
              </div>
              <p className="omra-admin-074">Chargement...</p>
            </div> :
          packages.length === 0 ?
          <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="al-empty__title">Aucun forfait Omra</p>
              <p className="al-empty__sub">Creez votre premier forfait avec le meme format que les circuits.</p>
            </div> :

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
                      onClick={() => setSelected(isSelected ? null : pkg)}>
                      
                        <td>
                          <div className="omra-admin-076">
                            {pkg.image_url ?
                          <img
                            src={pkg.image_url}
                            alt={pkg.title}

                            onError={(e) => {
                              e.target.style.display = 'none';
                            }} className="omra-admin-077" /> :


                          <div className="omra-admin-078" />








                          }

                            <div>
                              <p className="omra-admin-079">
                                {pkg.title}
                                {pkg.badge &&
                              <span className="omra-admin-080">









                                
                                    {pkg.badge}
                                  </span>
                              }
                              </p>
                              {pkg.subtitle && <p className="omra-admin-081">{pkg.subtitle}</p>}
                            </div>
                          </div>
                        </td>

                        <td>
                          <p className="omra-admin-082">{fPrice(pkg.price)}</p>
                          {pkg.old_price &&
                        <p className="omra-admin-083">
                              {fPrice(pkg.old_price)}
                            </p>
                        }
                        </td>

                        <td><span className="omra-admin-084">{pkg.duration} j</span></td>
                        <td><span className="omra-admin-085">{pkg.departure || '-'}</span></td>

                        <td>
                          <span style={{ fontWeight: 700, fontSize: 13, color: isFull ? '#e92f64' : isLow ? '#f97316' : '#065f46' }}>
                            {isFull ? 'Complet' : `${available} / ${total}`}
                          </span>
                        </td>

                        <td>
                          <span className="omra-admin-086">











                          
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
                            color: pkg.is_active ? '#065f46' : 'var(--g500)'
                          }}>
                          
                            <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: pkg.is_active ? '#10b981' : 'var(--g400)'
                            }} />
                          
                            {pkg.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>

                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="omra-admin-004">
                            <button
                            className="al-action-btn al-action-btn--edit"
                            onClick={() => {
                              setEditPkg(pkg);
                              setShowModal(true);
                            }}
                            title="Modifier">
                            
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            <button
                            className="al-action-btn al-action-btn--delete"
                            onClick={() => handleDelete(pkg.id)}
                            title={isMain ? 'Supprimer' : 'Reserve a l administrateur principal'}
                            style={{ opacity: isMain ? 1 : 0.45, cursor: isMain ? 'pointer' : 'not-allowed' }}>
                            
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </div>
          }

          <div className="al-table-footer">
            <p className="al-count">{packages.length} forfait{packages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {selected &&
        <OmraDetail
          pkg={selected}
          onClose={() => setSelected(null)}
          onEdit={(item) => {
            setEditPkg(item);
            setShowModal(true);
          }}
          onDelete={handleDelete}
          isMain={isMain} />

        }
      </div>

      {showModal &&
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
        notify={notify} />

      }

      {showCovers &&
      <CoversModal
        covers={covers}
        onClose={() => setShowCovers(false)}
        onSaved={(newCovers) => {
          setCovers(newCovers);
          setShowCovers(false);
        }}
        notify={notify} />

      }
    </AdminLayout>);

};

export default OmraPackages;
