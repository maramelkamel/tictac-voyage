import { useState } from 'react';

const SearchSection = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState('hotels');
  const [formData, setFormData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    adults: '2 adultes',
    children: '0 enfant',
    category: 'Toutes',
    type: 'hotels'
  });

  const tabs = [
    { id: 'hotels', label: 'Hôtels' },
    { id: 'vols', label: 'Vols' },
    { id: 'circuits', label: 'Circuits' }
  ];

  const destinations = [
    { value: '', label: 'Choisir une destination' },
    { value: 'hammamet', label: 'Hammamet' },
    { value: 'sousse', label: 'Sousse' },
    { value: 'djerba', label: 'Djerba' },
    { value: 'monastir', label: 'Monastir' },
    { value: 'tunis', label: 'Tunis' },
    { value: 'tabarka', label: 'Tabarka' },
    { value: 'tozeur', label: 'Tozeur' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.({ ...formData, type: activeTab });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="search-section">
      <div className="search-card">
        <div className="search-header">
          <h3>Rechercher un hébergement</h3>
          <div className="search-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>
              <i className="fas fa-map-marker-alt"></i> Destination
            </label>
            <select
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
            >
              {destinations.map(dest => (
                <option key={dest.value} value={dest.value}>
                  {dest.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>
              <i className="fas fa-calendar"></i> Arrivée
            </label>
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => handleChange('checkIn', e.target.value)}
              min={today}
            />
          </div>

          <div className="form-field">
            <label>
              <i className="fas fa-calendar"></i> Départ
            </label>
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => handleChange('checkOut', e.target.value)}
              min={formData.checkIn || today}
            />
          </div>

          <div className="form-field">
            <label>
              <i className="fas fa-user"></i> Adultes
            </label>
            <select
              value={formData.adults}
              onChange={(e) => handleChange('adults', e.target.value)}
            >
              <option>1 adulte</option>
              <option>2 adultes</option>
              <option>3 adultes</option>
              <option>4 adultes</option>
            </select>
          </div>

          <div className="form-field">
            <label>
              <i className="fas fa-child"></i> Enfants
            </label>
            <select
              value={formData.children}
              onChange={(e) => handleChange('children', e.target.value)}
            >
              <option>0 enfant</option>
              <option>1 enfant</option>
              <option>2 enfants</option>
              <option>3 enfants</option>
            </select>
          </div>

          <div className="form-field">
            <label>
              <i className="fas fa-star"></i> Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option>Toutes</option>
              <option>3 étoiles</option>
              <option>4 étoiles</option>
              <option>5 étoiles</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-search">
            <i className="fas fa-search"></i> Rechercher
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchSection;
