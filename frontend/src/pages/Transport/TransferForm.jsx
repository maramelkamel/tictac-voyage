import { useState } from 'react';
import { vehiclesData, tunisianCities } from './transportData';

const TransferForm = () => {
  const [formData, setFormData] = useState({
    tripType: 'oneway',
    departureAddress: '',
    departureCity: '',
    arrivalAddress: '',
    arrivalCity: '',
    departureDate: '',
    departureTime: '',
    returnDate: '',
    returnTime: '',
    passengers: 1,
    luggage: 0,
    babySeat: false,
    vehicleType: '',
    fullName: '',
    phone: '',
    email: '',
    remarks: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.departureAddress.trim()) newErrors.departureAddress = 'Adresse de départ requise';
    if (!formData.arrivalAddress.trim()) newErrors.arrivalAddress = 'Adresse d\'arrivée requise';
    if (!formData.departureDate) newErrors.departureDate = 'Date requise';
    if (!formData.departureTime) newErrors.departureTime = 'Heure requise';
    if (!formData.vehicleType) newErrors.vehicleType = 'Véhicule requis';
    if (!formData.fullName.trim()) newErrors.fullName = 'Nom requis';
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    
    if (formData.tripType === 'roundtrip' && !formData.returnDate) {
      newErrors.returnDate = 'Date de retour requise';
    }

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
      console.log('Données du formulaire Transfert:', formData);
      setSubmitted(true);
      // Reset après 5 secondes
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          tripType: 'oneway',
          departureAddress: '',
          departureCity: '',
          arrivalAddress: '',
          arrivalCity: '',
          departureDate: '',
          departureTime: '',
          returnDate: '',
          returnTime: '',
          passengers: 1,
          luggage: 0,
          babySeat: false,
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
      {/* Type de trajet */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">🛣️</span> Type de trajet
        </h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="tripType"
              value="oneway"
              checked={formData.tripType === 'oneway'}
              onChange={handleChange}
              className="w-5 h-5 text-[#E92F64] focus:ring-[#E92F64]"
            />
            <span className="text-[#1E293B] font-medium group-hover:text-[#E92F64] transition-colors">Aller simple</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="tripType"
              value="roundtrip"
              checked={formData.tripType === 'roundtrip'}
              onChange={handleChange}
              className="w-5 h-5 text-[#E92F64] focus:ring-[#E92F64]"
            />
            <span className="text-[#1E293B] font-medium group-hover:text-[#E92F64] transition-colors">Aller-retour</span>
          </label>
        </div>
      </div>

      {/* Points de départ et arrivée */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">📍</span> Points de départ et d'arrivée
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Point de départ */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide">Point de départ</label>
            <input
              type="text"
              name="departureAddress"
              value={formData.departureAddress}
              onChange={handleChange}
              placeholder="Entrez votre adresse de départ"
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.departureAddress ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.departureAddress && <p className="text-red-500 text-sm">{errors.departureAddress}</p>}
            <select
              name="departureCity"
              value={formData.departureCity}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white text-[#1E293B]"
            >
              <option value="">Sélectionner une ville</option>
              {tunisianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Point d'arrivée */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide">Point d'arrivée</label>
            <input
              type="text"
              name="arrivalAddress"
              value={formData.arrivalAddress}
              onChange={handleChange}
              placeholder="Entrez votre adresse d'arrivée"
              className={`w-full px-4 py-3 rounded-lg border-2 ${errors.arrivalAddress ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
            />
            {errors.arrivalAddress && <p className="text-red-500 text-sm">{errors.arrivalAddress}</p>}
            <select
              name="arrivalCity"
              value={formData.arrivalCity}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white text-[#1E293B]"
            >
              <option value="">Sélectionner une ville</option>
              {tunisianCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date & Heure */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span> Date & Heure
        </h3>
        <div className={`grid ${formData.tripType === 'roundtrip' ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-6`}>
          {/* Aller */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide">Aller</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Date *</label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.departureDate ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
                />
                {errors.departureDate && <p className="text-red-500 text-sm">{errors.departureDate}</p>}
              </div>
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Heure *</label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.departureTime ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
                />
                {errors.departureTime && <p className="text-red-500 text-sm">{errors.departureTime}</p>}
              </div>
            </div>
          </div>

          {/* Retour - conditionnel */}
          {formData.tripType === 'roundtrip' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide">Retour</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Date *</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.returnDate ? 'border-red-400' : 'border-slate-200'} focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white`}
                  />
                  {errors.returnDate && <p className="text-red-500 text-sm">{errors.returnDate}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Heure</label>
                  <input
                    type="time"
                    name="returnTime"
                    value={formData.returnTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Passagers & Bagages */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">👥</span> Passagers & Bagages
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
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
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Nombre de bagages</label>
            <input
              type="number"
              name="luggage"
              value={formData.luggage}
              onChange={handleChange}
              min="0"
              max="50"
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#1ECAD3] focus:ring-2 focus:ring-[#1ECAD3]/20 outline-none transition-all bg-white"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer py-3">
              <input
                type="checkbox"
                name="babySeat"
                checked={formData.babySeat}
                onChange={handleChange}
                className="w-5 h-5 text-[#E92F64] focus:ring-[#E92F64] rounded"
              />
              <span className="text-[#1E293B] font-medium">Siège bébé requis</span>
            </label>
          </div>
        </div>
      </div>

      {/* Choix du véhicule */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#0F4C5C] mb-4 flex items-center gap-2">
          <span className="text-2xl">🚗</span> Choix du véhicule
        </h3>
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
                {vehicle.icon} {vehicle.name} ({vehicle.capacity.min}-{vehicle.capacity.max} passagers)
              </option>
            ))}
          </select>
          {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
          <p className="text-sm text-[#64748B] mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
            💡 Le type de véhicule sera confirmé selon disponibilité. Notre équipe vous contactera pour valider et vous communiquer le tarif exact.
          </p>
        </div>
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
            <label className="block text-sm font-semibold text-[#0F4C5C] uppercase tracking-wide mb-2">Remarques / Demandes spéciales</label>
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

export default TransferForm;
