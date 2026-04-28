import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { deleteAdminHotel, getAdminHotels, saveAdminHotel } from '../../../services/api';

const DEFAULT_FORM = {
  name: '',
  city: 'Tunis',
  address: '',
  description: '',
  image_url: '',
  rating: '4.2',
  base_price: '',
  currency: 'USD',
  availability: 'Available',
  amenities: 'WiFi, Pool, Breakfast, Parking',
  is_active: true,
};

const CITIES = ['Tunis', 'Sousse', 'Hammamet'];

const HotelCatalogAdmin = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadHotels = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminHotels();
      setHotels(response.hotels || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load hotels catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const openCreateModal = () => {
    setEditingHotel(null);
    setForm(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (hotel) => {
    setEditingHotel(hotel);
    setForm({
      name: hotel.name || '',
      city: hotel.city || 'Tunis',
      address: hotel.address || '',
      description: hotel.description || '',
      image_url: hotel.image_url || '',
      rating: hotel.rating ? String(hotel.rating) : '4.2',
      base_price: hotel.base_price ? String(hotel.base_price) : '',
      currency: hotel.currency || 'USD',
      availability: hotel.availability || 'Available',
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : 'WiFi, Pool, Breakfast, Parking',
      is_active: hotel.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
    setForm(DEFAULT_FORM);
  };

  const filteredHotels = useMemo(() => {
    const query = search.trim().toLowerCase();

    return hotels.filter((hotel) => {
      const matchesCity = cityFilter === 'all' || hotel.city === cityFilter;
      const matchesQuery = !query
        || hotel.name?.toLowerCase().includes(query)
        || hotel.city?.toLowerCase().includes(query)
        || hotel.address?.toLowerCase().includes(query);

      return matchesCity && matchesQuery;
    });
  }, [hotels, search, cityFilter]);

  const activeCount = hotels.filter((hotel) => hotel.is_active !== false).length;
  const avgPrice = hotels.length
    ? Math.round(hotels.reduce((sum, hotel) => sum + (Number(hotel.base_price) || 0), 0) / hotels.length)
    : 0;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await saveAdminHotel({
        ...form,
        rating: Number(form.rating) || null,
        base_price: form.base_price === '' ? null : Number(form.base_price),
        amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
      }, editingHotel?.id || null);

      notify(editingHotel ? 'Hotel updated successfully.' : 'Hotel created successfully.');
      closeModal();
      await loadHotels();
    } catch (saveError) {
      notify(saveError.message || 'Unable to save hotel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hotel) => {
    const confirmed = window.confirm(`Delete "${hotel.name}" from the hotel catalog?`);
    if (!confirmed) return;

    try {
      await deleteAdminHotel(hotel.id);
      notify('Hotel deleted successfully.');
      await loadHotels();
    } catch (deleteError) {
      notify(deleteError.message || 'Unable to delete hotel.', 'error');
    }
  };

  return (
    <AdminLayout
      title="Catalogue Hotels"
      breadcrumb={[{ label: 'Hotels' }, { label: 'Catalogue', active: true }]}
      toast={toast}
      actions={
        <button className="al-btn al-btn--primary" onClick={openCreateModal}>
          Ajouter un hotel
        </button>
      }
    >
      <div className="al-stats al-stats--3">
        {[
          { label: 'Hotels en base', value: hotels.length, color: 'blue' },
          { label: 'Hotels actifs', value: activeCount, color: 'green' },
          { label: 'Prix moyen', value: avgPrice ? `${avgPrice} USD` : 'N/A', color: 'orange' },
        ].map((stat) => (
          <div key={stat.label} className={`al-stat al-stat--${stat.color}`}>
            <div>
              <p className="al-stat__value">{stat.value}</p>
              <p className="al-stat__label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="al-card">
        <div className="al-toolbar">
          <div className="al-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="text" placeholder="Nom, ville, adresse..." value={search} onChange={(event) => setSearch(event.target.value)} />
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
            <p className="al-empty__sub">Ajoutez un hotel manuellement ou modifiez vos filtres.</p>
          </div>
        ) : (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Ville</th>
                  <th>Prix</th>
                  <th>Note</th>
                  <th>Disponibilite</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="al-row">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={hotel.image_url || 'https://source.unsplash.com/120x80/?hotel'}
                          alt={hotel.name}
                          style={{ width: 54, height: 42, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--g200)' }}
                        />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--g800)' }}>{hotel.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{hotel.address || 'Adresse non renseignee'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{hotel.city}</td>
                    <td>{hotel.base_price ? `${Number(hotel.base_price).toLocaleString('fr-FR')} ${hotel.currency || 'USD'}` : 'N/A'}</td>
                    <td>{hotel.rating || 'N/A'}</td>
                    <td>{hotel.availability || 'Available'}</td>
                    <td>
                      <span className={`al-badge-pill ${hotel.is_active === false ? 'b--gray' : 'b--green'}`}>
                        {hotel.is_active === false ? 'Inactif' : 'Actif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="al-action-btn al-action-btn--edit" onClick={() => openEditModal(hotel)} title="Modifier">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button className="al-action-btn al-action-btn--delete" onClick={() => handleDelete(hotel)} title="Supprimer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
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
          <p className="al-count">{filteredHotels.length} hotel(s) affiches</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="al-overlay" onClick={closeModal}>
          <div className="al-modal" onClick={(event) => event.stopPropagation()}>
            <div className="al-modal__header">
              <div className="al-modal__title-wrap">
                <div className="al-modal__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V8a2 2 0 012-2h12a2 2 0 012 2v12" /><path d="M2 20h20" /></svg>
                </div>
                <h2>{editingHotel ? 'Modifier hotel' : 'Ajouter un hotel'}</h2>
              </div>
              <button className="al-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form className="al-form" onSubmit={handleSubmit}>
              <div className="al-row-2">
                <div className="al-field">
                  <label className="al-label">Nom</label>
                  <input className="al-input" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="al-field">
                  <label className="al-label">Ville</label>
                  <select className="al-select" name="city" value={form.city} onChange={handleChange}>
                    {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>

              <div className="al-field">
                <label className="al-label">Adresse</label>
                <input className="al-input" name="address" value={form.address} onChange={handleChange} />
              </div>

              <div className="al-field">
                <label className="al-label">Description</label>
                <textarea className="al-textarea" name="description" value={form.description} onChange={handleChange} />
              </div>

              <div className="al-field">
                <label className="al-label">Image URL</label>
                <input className="al-input" name="image_url" value={form.image_url} onChange={handleChange} />
              </div>

              <div className="al-row-3">
                <div className="al-field">
                  <label className="al-label">Note</label>
                  <input className="al-input" type="number" step="0.1" min="0" max="5" name="rating" value={form.rating} onChange={handleChange} />
                </div>
                <div className="al-field">
                  <label className="al-label">Prix de base</label>
                  <input className="al-input" type="number" step="0.01" min="0" name="base_price" value={form.base_price} onChange={handleChange} />
                </div>
                <div className="al-field">
                  <label className="al-label">Devise</label>
                  <input className="al-input" name="currency" value={form.currency} onChange={handleChange} />
                </div>
              </div>

              <div className="al-row-2">
                <div className="al-field">
                  <label className="al-label">Disponibilite</label>
                  <input className="al-input" name="availability" value={form.availability} onChange={handleChange} />
                </div>
                <div className="al-field" style={{ justifyContent: 'flex-end' }}>
                  <label className="al-label" style={{ marginBottom: 12 }}>Statut</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--g600)' }}>
                    <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                    Hotel actif
                  </label>
                </div>
              </div>

              <div className="al-field">
                <label className="al-label">Amenities (comma separated)</label>
                <input className="al-input" name="amenities" value={form.amenities} onChange={handleChange} />
              </div>

              <div className="al-form-footer">
                <button type="button" className="al-btn al-btn--ghost" onClick={closeModal}>Annuler</button>
                <button type="submit" className="al-btn al-btn--primary" disabled={saving}>
                  {saving ? 'Sauvegarde...' : editingHotel ? 'Mettre a jour' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default HotelCatalogAdmin;
