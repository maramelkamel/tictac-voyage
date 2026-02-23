import { useState } from 'react';
import { vehiclesData, tunisianCities } from './transportData';

const DispositionForm = () => {
  const [formData, setFormData] = useState({
    duration: '',
    numberOfDays: 2,
    startDate: '',
    startTime: '',
    pickupLocation: '',
    pickupCity: '',
    itinerary: '',
    passengers: 1,
    vehicleType: '',
    fullName: '',
    phone: '',
    email: '',
    remarks: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.duration) newErrors.duration = 'Durée requise';
    if (formData.duration === 'multi' && formData.numberOfDays < 2) {
      newErrors.numberOfDays = 'Minimum 2 jours requis';
    }
    if (!formData.startDate) newErrors.startDate = 'Date requise';
    if (!formData.startTime) newErrors.startTime = 'Heure requise';
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Lieu de prise en charge requis';
    if (!formData.pickupCity) newErrors.pickupCity = 'Ville requise';
    if (!formData.vehicleType) newErrors.vehicleType = 'Véhicule requis';
    if (!formData.fullName.trim()) newErrors.fullName = 'Nom requis';
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

    // Vérifier la capacité du véhicule
    const selectedVehicle = vehiclesData.find(v => v.id === formData.vehicleType);
    if (selectedVehicle && formData.passengers > selectedVehicle.capacity.max) {
      newErrors.passengers = `Ce véhicule ne peut accueillir que ${selectedVehicle.capacity.max} passagers maximum`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Données du formulaire Mise à disposition:', formData);
      setSubmitted(true);
      // Reset après 5 secondes
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          duration: '',
          numberOfDays: 2,
          startDate: '',
          startTime: '',
          pickupLocation: '',
          pickupCity: '',
          itinerary: '',
          passengers: 1,
          vehicleType: '',
          fullName: '',
          phone: '',
          email: '',
          remarks: ''
        });
      }, 5000);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-[#0F4C5C] to-[#1ECAD3] rounded-2xl p-8 text-center text-white">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold mb-3">Demande envoyée !</h3>
        <p className="text-lg opacity-90">
          Merci ! Votre demande de devis a été envoyée.<br />
          Notre équipe vous contactera sous 24h pour vous proposer le meilleur tarif.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type de prestation */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">⏱️</span> Type de prestation
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Durée de mise à disposition *</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.duration ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white text-[#1E293B]`}
            >
              <option value="">Sélectionner une durée</option>
              <option value="half">Demi-journée (4 heures)</option>
              <option value="full">Journée complète (8 heures)</option>
              <option value="multi">Multi-jours</option>
            </select>
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>

          {/* Nombre de jours - conditionnel */}
          {formData.duration === 'multi' && (
            <div>
              <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Nombre de jours *</label>
              <input
                type="number"
                name="numberOfDays"
                value={formData.numberOfDays}
                onChange={handleChange}
                min="2"
                max="30"
                className={`w-full px-4 py-3 rounded-lg border-2 ${errors.numberOfDays ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
              />
              {errors.numberOfDays && <p className="text-red-500 text-sm mt-1">{errors.numberOfDays}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Date & Lieu */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span> Date & Lieu de prise en charge
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Date de début *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.startDate ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Heure de prise en charge *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.startTime ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Lieu de prise en charge *</label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder="Adresse, hôtel, aéroport..."
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.pickupLocation ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.pickupLocation && <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Ville principale *</label>
            <select
              name="pickupCity"
              value={formData.pickupCity}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.pickupCity ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white text-[#1E293B]`}
            >
              <option value="">Sélectionner une ville</option>
              {tunisianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.pickupCity && <p className="text-red-500 text-sm mt-1">{errors.pickupCity}</p>}
          </div>
        </div>
      </div>

      {/* Itinéraire */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">🗺️</span> Itinéraire prévu
        </h3>
        <div>
          <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Villes à visiter / Programme</label>
          <textarea
            name="itinerary"
            value={formData.itinerary}
            onChange={handleChange}
            rows="4"
            placeholder="Décrivez votre programme : visites prévues, lieux à voir, pauses souhaitées..."
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white resize-none"
          ></textarea>
        </div>
      </div>

      {/* Passagers & Véhicule */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">🚗</span> Passagers & Véhicule
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Nombre de passagers *</label>
            <input
              type="number"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              min="1"
              max="50"
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.passengers ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.passengers && <p className="text-red-500 text-sm mt-1">{errors.passengers}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Type de véhicule souhaité *</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.vehicleType ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white text-[#1E293B]`}
            >
              <option value="">Sélectionner un véhicule</option>
              {vehiclesData.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.icon} {vehicle.name} avec chauffeur ({vehicle.capacity.min}-{vehicle.capacity.max} passagers)
                </option>
              ))}
            </select>
            {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
          </div>
        </div>
        <p className="text-sm text-[#64748B] mt-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
          💡 Le type de véhicule sera confirmé selon disponibilité. Notre équipe vous contactera pour valider et vous communiquer le tarif exact.
        </p>
      </div>

      {/* Coordonnées */}
      <div className="bg-gradient-to-r from-[#0F4C5C]/5 to-[#1ECAD3]/5 rounded-xl p-6 border border-[#0F4C5C]/20">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">📞</span> Vos coordonnées
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Nom complet *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Votre nom complet"
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.fullName ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Téléphone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+216 XX XXX XXX"
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.phone ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Remarques</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Précisez vos demandes particulières..."
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Bouton submit */}
      <div className="text-center pt-4">
        <button
          type="submit"
          className="bg-[#E92F64] hover:bg-[#D4265A] text-white font-bold py-4 px-12 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          🎯 Demander un devis gratuit
        </button>
      </div>
    </form>
  );
};

export default DispositionForm;
