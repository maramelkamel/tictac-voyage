import { useState } from 'react';

const airportsData = [
  { code: "TUN", name: "Tunis-Carthage", city: "Tunis" },
  { code: "MIR", name: "Monastir Habib Bourguiba", city: "Monastir" },
  { code: "DJE", name: "Djerba-Zarzis", city: "Djerba" },
  { code: "NBE", name: "Enfidha-Hammamet", city: "Enfidha" }
];

const tunisianCities = [
  "Tunis", "Sousse", "Hammamet", "Monastir", "Djerba", 
  "Tozeur", "Kairouan", "Sfax", "Bizerte", "Tabarka",
  "Nabeul", "Mahdia", "Gabès", "Tataouine", "Douz"
];

const vehiclesData = [
  { id: 'berline', name: "Berline Confort", capacity: "1-3 passagers", icon: "🚗" },
  { id: 'van', name: "Van Premium", capacity: "4-7 passagers", icon: "🚐" },
  { id: 'minibus', name: "Minibus", capacity: "8-15 passagers", icon: "🚌" },
  { id: 'bus', name: "Bus Grand Tourisme", capacity: "16-50 passagers", icon: "🚍" }
];

export function TransferForm() {
  const [formData, setFormData] = useState({
    tripType: 'oneWay',
    departureType: 'airport',
    departureAirport: '',
    departureHotel: '',
    departureCity: '',
    departureAddress: '',
    arrivalType: 'hotel',
    arrivalAirport: '',
    arrivalHotel: '',
    arrivalCity: '',
    arrivalAddress: '',
    departureDate: '',
    departureTime: '',
    returnDate: '',
    returnTime: '',
    passengers: 1,
    bags: 0,
    babySeat: false,
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
    console.log('Transfert Form Data:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const getDepartureDisplay = () => {
    if (formData.departureType === 'airport') {
      const airport = airportsData.find(a => a.code === formData.departureAirport);
      return airport ? `${airport.name} (${airport.city})` : 'Non sélectionné';
    } else if (formData.departureType === 'hotel') {
      return formData.departureHotel ? `${formData.departureHotel}, ${formData.departureCity}` : 'Non renseigné';
    }
    return formData.departureAddress || 'Non renseigné';
  };

  const getArrivalDisplay = () => {
    if (formData.arrivalType === 'airport') {
      const airport = airportsData.find(a => a.code === formData.arrivalAirport);
      return airport ? `${airport.name} (${airport.city})` : 'Non sélectionné';
    } else if (formData.arrivalType === 'hotel') {
      return formData.arrivalHotel ? `${formData.arrivalHotel}, ${formData.arrivalCity}` : 'Non renseigné';
    }
    return formData.arrivalAddress || 'Non renseigné';
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
      
      {/* Type de trajet */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">Type de transfert</label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={formData.tripType === 'oneWay'}
              onChange={handleInputChange}
              className="w-4 h-4 accent-[#0F4C5C]"
            />
            <span className="text-[#1E293B]">Aller simple</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              checked={formData.tripType === 'roundTrip'}
              onChange={handleInputChange}
              className="w-4 h-4 accent-[#0F4C5C]"
            />
            <span className="text-[#1E293B]">Aller-retour</span>
          </label>
        </div>
      </div>

      {/* Point de départ */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">Point de départ</label>
        <div className="flex flex-wrap gap-4 mb-3">
          {['airport', 'hotel', 'address'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="departureType"
                value={type}
                checked={formData.departureType === type}
                onChange={handleInputChange}
                className="w-4 h-4 accent-[#0F4C5C]"
              />
              <span className="text-[#1E293B]">
                {type === 'airport' ? '✈️ Aéroport' : type === 'hotel' ? '🏨 Hôtel' : '📍 Adresse'}
              </span>
            </label>
          ))}
        </div>
        
        {formData.departureType === 'airport' && (
          <select
            name="departureAirport"
            value={formData.departureAirport}
            onChange={handleInputChange}
            className="form-input"
            required
          >
            <option value="">Sélectionner un aéroport</option>
            {airportsData.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.name} ({airport.city})
              </option>
            ))}
          </select>
        )}
        
        {formData.departureType === 'hotel' && (
          <div className="space-y-3">
            <input
              type="text"
              name="departureHotel"
              value={formData.departureHotel}
              onChange={handleInputChange}
              placeholder="Nom de l'hôtel"
              className="form-input"
              required
            />
            <select
              name="departureCity"
              value={formData.departureCity}
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
        )}
        
        {formData.departureType === 'address' && (
          <div className="space-y-3">
            <input
              type="text"
              name="departureAddress"
              value={formData.departureAddress}
              onChange={handleInputChange}
              placeholder="Adresse complète"
              className="form-input"
              required
            />
            <select
              name="departureCity"
              value={formData.departureCity}
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
        )}
      </div>

      {/* Point d'arrivée */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">Point d'arrivée</label>
        <div className="flex flex-wrap gap-4 mb-3">
          {['airport', 'hotel', 'address'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="arrivalType"
                value={type}
                checked={formData.arrivalType === type}
                onChange={handleInputChange}
                className="w-4 h-4 accent-[#0F4C5C]"
              />
              <span className="text-[#1E293B]">
                {type === 'airport' ? '✈️ Aéroport' : type === 'hotel' ? '🏨 Hôtel' : '📍 Adresse'}
              </span>
            </label>
          ))}
        </div>
        
        {formData.arrivalType === 'airport' && (
          <select
            name="arrivalAirport"
            value={formData.arrivalAirport}
            onChange={handleInputChange}
            className="form-input"
            required
          >
            <option value="">Sélectionner un aéroport</option>
            {airportsData.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.name} ({airport.city})
              </option>
            ))}
          </select>
        )}
        
        {formData.arrivalType === 'hotel' && (
          <div className="space-y-3">
            <input
              type="text"
              name="arrivalHotel"
              value={formData.arrivalHotel}
              onChange={handleInputChange}
              placeholder="Nom de l'hôtel"
              className="form-input"
              required
            />
            <select
              name="arrivalCity"
              value={formData.arrivalCity}
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
        )}
        
        {formData.arrivalType === 'address' && (
          <div className="space-y-3">
            <input
              type="text"
              name="arrivalAddress"
              value={formData.arrivalAddress}
              onChange={handleInputChange}
              placeholder="Adresse complète"
              className="form-input"
              required
            />
            <select
              name="arrivalCity"
              value={formData.arrivalCity}
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
        )}
      </div>

      {/* Date & Heure */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">Date & Heure du transfert</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Date (aller) *</label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1">Heure (aller) *</label>
            <input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>
        
        {formData.tripType === 'roundTrip' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-[#64748B] mb-1">Date (retour)</label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm text-[#64748B] mb-1">Heure (retour)</label>
              <input
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Passagers & Bagages */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">Passagers & Bagages</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm text-[#64748B] mb-1">Nombre de bagages</label>
            <input
              type="number"
              name="bags"
              min="0"
              max="50"
              value={formData.bags}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="babySeat"
                checked={formData.babySeat}
                onChange={handleInputChange}
                className="w-4 h-4 accent-[#0F4C5C] rounded"
              />
              <span className="text-[#1E293B]">👶 Siège bébé requis</span>
            </label>
          </div>
        </div>
      </div>

      {/* Véhicule */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">Type de véhicule souhaité</label>
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
        <p className="text-sm text-[#64748B] mt-2">
          Le type de véhicule sera confirmé selon disponibilité.
        </p>
      </div>

      {/* Coordonnées */}
      <div className="mb-6">
        <label className="block text-[#1E293B] font-semibold mb-3">Vos coordonnées</label>
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
        <h4 className="font-semibold text-[#1E293B] mb-2">📋 Résumé du transfert</h4>
        <div className="text-sm text-[#64748B] space-y-1">
          <p><span className="font-medium">Trajet :</span> {formData.tripType === 'oneWay' ? 'Aller simple' : 'Aller-retour'}</p>
          <p><span className="font-medium">Départ :</span> {getDepartureDisplay()}</p>
          <p><span className="font-medium">Arrivée :</span> {getArrivalDisplay()}</p>
          <p><span className="font-medium">Date :</span> {formData.departureDate || '—'} à {formData.departureTime || '—'}</p>
          <p><span className="font-medium">Passagers :</span> {formData.passengers} ({formData.bags} bagages)</p>
        </div>
      </div>

      <button type="submit" className="btn-primary">
        Demander un devis gratuit
      </button>
    </form>
  );
}