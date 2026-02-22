import { useState } from 'react';

const tunisianCities = [
  "Tunis", "Sousse", "Hammamet", "Monastir", "Djerba", 
  "Tozeur", "Kairouan", "Sfax", "Bizerte", "Tabarka",
  "Nabeul", "Mahdia", "Gabès", "Tataouine", "Douz"
];

const vehiclesData = [
  { id: 'berline', name: "Berline avec chauffeur", capacity: "1-3 passagers", icon: "🚗" },
  { id: 'van', name: "Van/Minivan avec chauffeur", capacity: "4-7 passagers", icon: "🚐" },
  { id: 'minibus', name: "Minibus avec chauffeur", capacity: "8-15 passagers", icon: "🚌" },
  { id: 'bus', name: "Bus avec chauffeur", capacity: "16-50 passagers", icon: "🚍" }
];

const durationOptions = [
  { value: 'halfDay', label: 'Demi-journée (4 heures)', hours: 4 },
  { value: 'fullDay', label: 'Journée complète (8 heures)', hours: 8 },
  { value: 'multiDays', label: 'Multi-jours', hours: 0 }
];

export function DispositionForm() {
  const [formData, setFormData] = useState({
    duration: 'fullDay',
    multiDaysCount: 2,
    startDate: '',
    startTime: '',
    pickupLocation: '',
    mainCity: '',
    itinerary: '',
    passengers: 1,
    vehicleType: 'berline',
    fullName: '',
    phone: '',
    email: '',
    remarks: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Disposition Form Data:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const getDurationLabel = () => {
    const option = durationOptions.find(o => o.value === formData.duration);
    if (formData.duration === 'multiDays') {
      return `${formData.multiDaysCount} jour${formData.multiDaysCount > 1 ? 's' : ''}`;
    }
    return option ? option.label : '';
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl p-8 text-center animate-fade-in shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[#1E293B] mb-2 font-['Poppins']">
          Demande envoyée avec succès !
        </h3>
        <p className="text-[#64748B]">
          Notre équipe vous contactera sous 24h pour confirmer votre réservation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 shadow-lg animate-fade-in">
      
      {/* Durée */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">⏱️ Durée de mise à disposition</label>
        <select
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          className="form-input"
          required
        >
          {durationOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {formData.duration === 'multiDays' && (
          <div className="mt-3">
            <label className="block text-sm text-[#64748B] mb-1">Nombre de jours</label>
            <input
              type="number"
              name="multiDaysCount"
              min="2"
              max="30"
              value={formData.multiDaysCount}
              onChange={handleInputChange}
              className="form-input w-32"
              required
            />
          </div>
        )}
      </div>

      {/* Date & Lieu */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">📅 Date & Lieu de prise en charge</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Date de début *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Heure de prise en charge *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Lieu de prise en charge *</label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              placeholder="Adresse ou lieu précis"
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Ville principale *</label>
            <select
              name="mainCity"
              value={formData.mainCity}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Sélectionner la ville</option>
              {tunisianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Itinéraire */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">🗺️ Itinéraire</label>
        <textarea
          name="itinerary"
          value={formData.itinerary}
          onChange={handleInputChange}
          placeholder="Décrivez votre programme : visites prévues, lieux à voir, pauses souhaitées..."
          rows={4}
          className="form-input resize-none"
        />
      </div>

      {/* Passagers & Véhicule */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">👥 Passagers & Véhicule</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Nombre de passagers *</label>
            <input
              type="number"
              name="passengers"
              min="1"
              max="50"
              value={formData.passengers}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Type de véhicule souhaité *</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              {vehiclesData.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.icon} {vehicle.name} ({vehicle.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Coordonnées */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">📧 Vos coordonnées</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Nom complet *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Votre nom complet"
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Téléphone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+216 XX XXX XXX"
              className="form-input"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-[#64748B] mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="votre@email.com"
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#64748B] mb-1">Remarques</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            placeholder="Informations supplémentaires..."
            rows={3}
            className="form-input resize-none"
          />
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-[#F8FAFB] rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-[#1E293B] mb-2">📋 Résumé de la mise à disposition</h4>
        <div className="text-sm text-[#64748B] space-y-1">
          <p><span className="font-medium">Durée :</span> {getDurationLabel()}</p>
          <p><span className="font-medium">Date :</span> {formData.startDate || '—'} à {formData.startTime || '—'}</p>
          <p><span className="font-medium">Lieu :</span> {formData.pickupLocation || '—'}, {formData.mainCity || '—'}</p>
          <p><span className="font-medium">Passagers :</span> {formData.passengers}</p>
        </div>
      </div>

      <button type="submit" className="btn-primary">
        Demander un devis gratuit
      </button>
    </form>
  );
}