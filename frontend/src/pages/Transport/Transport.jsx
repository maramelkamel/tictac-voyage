// src/pages/Transport/Transport.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import '../../styles/Transport.css';

const Transport = () => {
  const [activeTab, setActiveTab] = useState('transfert');
  const [tripType, setTripType] = useState('aller-simple');
  const [durationType, setDurationType] = useState('demi-journee');
  const [vehicleType, setVehicleType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: '',
    departureTime: '',
    returnDate: '',
    returnTime: '',
    vehicleType: '',
    passengers: 1,
    luggage: 0,
    flightTrainNumber: '',
    numberOfDays: 2,
    freeText: '',
    childSeat: false,
    accessibility: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est requis';
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^[\d\s+()-]{8,}$/.test(formData.phone)) {
      newErrors.phone = "Le numéro n'est pas valide";
    }
    if (!formData.departureLocation.trim())
      newErrors.departureLocation = 'Le lieu de départ est requis';
    if (activeTab === 'transfert' && !formData.arrivalLocation.trim())
      newErrors.arrivalLocation = "Le lieu d'arrivée est requis";
    if (!formData.departureDate) newErrors.departureDate = 'La date est requise';
    if (!formData.departureTime) newErrors.departureTime = "L'heure est requise";
    if (!vehicleType) newErrors.vehicleType = 'Le type de véhicule est requis';
    if (tripType === 'aller-retour' && activeTab === 'transfert') {
      if (!formData.returnDate) newErrors.returnDate = 'La date de retour est requise';
      if (!formData.returnTime) newErrors.returnTime = "L'heure de retour est requise";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = document.querySelector('.transport-field-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      departureLocation: '',
      arrivalLocation: '',
      departureDate: '',
      departureTime: '',
      returnDate: '',
      returnTime: '',
      vehicleType: '',
      passengers: 1,
      luggage: 0,
      flightTrainNumber: '',
      numberOfDays: 2,
      freeText: '',
      childSeat: false,
      accessibility: false,
    });
    setVehicleType('');
    setTripType('aller-simple');
    setDurationType('demi-journee');
    setErrors({});
    setSubmitSuccess(false);
  };

  const vehicles = [
    {
      id: 'voiture',
      label: 'Voiture',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 00-2 2v1h4v-1a2 2 0 00-2-2zm14 0a2 2 0 00-2 2v1h4v-1a2 2 0 00-2-2z" />
          <circle cx="7.5" cy="14" r="1.5" />
          <circle cx="16.5" cy="14" r="1.5" />
        </svg>
      ),
      capacity: '1-4',
      description: 'Confort et élégance',
    },
    {
      id: 'minibus',
      label: 'Minibus',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="11" rx="2" />
          <path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2M2 11h20M7 11v6M12 11v6M17 11v6" />
          <circle cx="6" cy="19" r="1.5" />
          <circle cx="18" cy="19" r="1.5" />
        </svg>
      ),
      capacity: '5-15',
      description: 'Idéal pour groupes',
    },
    {
      id: 'bus',
      label: 'Bus',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="16" rx="2" />
          <path d="M3 9h18M3 14h18M8 9v5M13 9v5M18 9v5" />
          <circle cx="7" cy="21" r="1.5" />
          <circle cx="17" cy="21" r="1.5" />
          <path d="M3 19h4M17 19h4" />
        </svg>
      ),
      capacity: '16-50+',
      description: 'Grands groupes',
    },
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navbar />

      <div className="transport-page">
        {/* ─── HERO SECTION ─── */}
        <section className="transport-hero">
          <div className="transport-hero-overlay" />
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80"
            alt="Transport professionnel"
            className="transport-hero-image"
          />
          <div className="transport-hero-content">
            <div className="transport-hero-badge">
              <span className="transport-hero-badge-dot" />
              Service Premium
            </div>
            <h1 className="transport-hero-title">
              Solutions de <span>Transport</span>
            </h1>
            <p className="transport-hero-subtitle">
              Transferts privés et mise à disposition de véhicules avec chauffeur.
              Voyagez en toute sérénité avec un service sur-mesure.
            </p>
            <div className="transport-hero-features">
              <div className="transport-hero-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>Chauffeurs professionnels</span>
              </div>
              <div className="transport-hero-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>Véhicules haut de gamme</span>
              </div>
              <div className="transport-hero-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>Disponible 24h/7j</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <section className="transport-main">
          <div className="transport-container">
            {/* TAB SWITCHER */}
            <div className="transport-tabs-wrapper">
              <div className="transport-tabs">
                <button
                  className={`transport-tab ${activeTab === 'transfert' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('transfert');
                    setErrors({});
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <div>
                    <span className="transport-tab-title">Transfert</span>
                    <span className="transport-tab-desc">Point A vers Point B</span>
                  </div>
                </button>
                <button
                  className={`transport-tab ${activeTab === 'mise-a-disposition' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('mise-a-disposition');
                    setErrors({});
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <div>
                    <span className="transport-tab-title">Mise à disposition</span>
                    <span className="transport-tab-desc">Véhicule avec chauffeur</span>
                  </div>
                </button>
              </div>
            </div>

            {/* SUCCESS MESSAGE */}
            {submitSuccess && (
              <div className="transport-success">
                <div className="transport-success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div>
                  <h3>Demande envoyée avec succès !</h3>
                  <p>
                    Notre équipe vous contactera dans les plus brefs délais pour confirmer
                    votre réservation.
                  </p>
                </div>
                <button className="transport-success-close" onClick={resetForm}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* FORM */}
            <form className="transport-form" onSubmit={handleSubmit} noValidate>
              {/* ── SECTION : Type de service ── */}
              <div className="transport-form-section">
                <div className="transport-section-header">
                  <div className="transport-section-number">1</div>
                  <div>
                    <h2 className="transport-section-title">
                      {activeTab === 'transfert'
                        ? 'Type de trajet'
                        : 'Durée de mise à disposition'}
                    </h2>
                    <p className="transport-section-desc">
                      {activeTab === 'transfert'
                        ? 'Sélectionnez votre type de trajet'
                        : 'Choisissez la durée souhaitée'}
                    </p>
                  </div>
                </div>

                {activeTab === 'transfert' ? (
                  <div className="transport-toggle-group">
                    <button
                      type="button"
                      className={`transport-toggle-btn ${
                        tripType === 'aller-simple' ? 'active' : ''
                      }`}
                      onClick={() => setTripType('aller-simple')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      Aller simple
                    </button>
                    <button
                      type="button"
                      className={`transport-toggle-btn ${
                        tripType === 'aller-retour' ? 'active' : ''
                      }`}
                      onClick={() => setTripType('aller-retour')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 9h14M19 9l-4-4M5 15h14M5 15l4 4" />
                      </svg>
                      Aller-retour
                    </button>
                  </div>
                ) : (
                  <div className="transport-toggle-group three">
                    <button
                      type="button"
                      className={`transport-toggle-btn ${
                        durationType === 'demi-journee' ? 'active' : ''
                      }`}
                      onClick={() => setDurationType('demi-journee')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l3 3" />
                      </svg>
                      Demi-journée
                      <span className="transport-toggle-sub">~4 heures</span>
                    </button>
                    <button
                      type="button"
                      className={`transport-toggle-btn ${
                        durationType === 'journee-complete' ? 'active' : ''
                      }`}
                      onClick={() => setDurationType('journee-complete')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                      Journée complète
                      <span className="transport-toggle-sub">~8 heures</span>
                    </button>
                    <button
                      type="button"
                      className={`transport-toggle-btn ${
                        durationType === 'multi-jours' ? 'active' : ''
                      }`}
                      onClick={() => setDurationType('multi-jours')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                      </svg>
                      Multi-jours
                      <span className="transport-toggle-sub">2+ jours</span>
                    </button>
                  </div>
                )}

                {activeTab === 'mise-a-disposition' && durationType === 'multi-jours' && (
                  <div className="transport-days-picker">
                    <label className="transport-label">Nombre de jours</label>
                    <div className="transport-counter">
                      <button
                        type="button"
                        className="transport-counter-btn"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            numberOfDays: Math.max(2, prev.numberOfDays - 1),
                          }))
                        }
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="transport-counter-value">{formData.numberOfDays}</span>
                      <span className="transport-counter-label">jours</span>
                      <button
                        type="button"
                        className="transport-counter-btn"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            numberOfDays: Math.min(30, prev.numberOfDays + 1),
                          }))
                        }
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION : Itinéraire ── */}
              <div className="transport-form-section">
                <div className="transport-section-header">
                  <div className="transport-section-number">2</div>
                  <div>
                    <h2 className="transport-section-title">Itinéraire</h2>
                    <p className="transport-section-desc">
                      {activeTab === 'transfert'
                        ? 'Indiquez vos lieux de départ et d\'arrivée'
                        : 'Indiquez le lieu de prise en charge'}
                    </p>
                  </div>
                </div>

                <div className="transport-itinerary">
                  <div className="transport-itinerary-line">
                    <div className="transport-itinerary-dot start" />
                    {activeTab === 'transfert' && <div className="transport-itinerary-connector" />}
                    {activeTab === 'transfert' && (
                      <div className="transport-itinerary-dot end" />
                    )}
                  </div>
                  <div className="transport-itinerary-fields">
                    <div className="transport-field-group">
                      <label className="transport-label" htmlFor="departureLocation">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="10" r="3" />
                          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
                        </svg>
                        {activeTab === 'transfert' ? 'Lieu de départ' : 'Lieu de prise en charge'}
                      </label>
                      <input
                        type="text"
                        id="departureLocation"
                        name="departureLocation"
                        className={`transport-input ${errors.departureLocation ? 'error' : ''}`}
                        placeholder="Adresse, aéroport, gare, hôtel..."
                        value={formData.departureLocation}
                        onChange={handleChange}
                      />
                      {errors.departureLocation && (
                        <span className="transport-field-error">{errors.departureLocation}</span>
                      )}
                    </div>

                    {activeTab === 'transfert' && (
                      <div className="transport-field-group">
                        <label className="transport-label" htmlFor="arrivalLocation">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="10" r="3" />
                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
                          </svg>
                          Lieu d'arrivée
                        </label>
                        <input
                          type="text"
                          id="arrivalLocation"
                          name="arrivalLocation"
                          className={`transport-input ${errors.arrivalLocation ? 'error' : ''}`}
                          placeholder="Adresse, aéroport, gare, hôtel..."
                          value={formData.arrivalLocation}
                          onChange={handleChange}
                        />
                        {errors.arrivalLocation && (
                          <span className="transport-field-error">{errors.arrivalLocation}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="transport-row">
                  <div className="transport-field-group">
                    <label className="transport-label" htmlFor="departureDate">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      Date de départ
                    </label>
                    <input
                      type="date"
                      id="departureDate"
                      name="departureDate"
                      className={`transport-input ${errors.departureDate ? 'error' : ''}`}
                      min={today}
                      value={formData.departureDate}
                      onChange={handleChange}
                    />
                    {errors.departureDate && (
                      <span className="transport-field-error">{errors.departureDate}</span>
                    )}
                  </div>
                  <div className="transport-field-group">
                    <label className="transport-label" htmlFor="departureTime">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      Heure de départ
                    </label>
                    <input
                      type="time"
                      id="departureTime"
                      name="departureTime"
                      className={`transport-input ${errors.departureTime ? 'error' : ''}`}
                      value={formData.departureTime}
                      onChange={handleChange}
                    />
                    {errors.departureTime && (
                      <span className="transport-field-error">{errors.departureTime}</span>
                    )}
                  </div>
                </div>

                {activeTab === 'transfert' && tripType === 'aller-retour' && (
                  <div className="transport-row transport-return-fields">
                    <div className="transport-field-group">
                      <label className="transport-label" htmlFor="returnDate">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        Date de retour
                      </label>
                      <input
                        type="date"
                        id="returnDate"
                        name="returnDate"
                        className={`transport-input ${errors.returnDate ? 'error' : ''}`}
                        min={formData.departureDate || today}
                        value={formData.returnDate}
                        onChange={handleChange}
                      />
                      {errors.returnDate && (
                        <span className="transport-field-error">{errors.returnDate}</span>
                      )}
                    </div>
                    <div className="transport-field-group">
                      <label className="transport-label" htmlFor="returnTime">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        Heure de retour
                      </label>
                      <input
                        type="time"
                        id="returnTime"
                        name="returnTime"
                        className={`transport-input ${errors.returnTime ? 'error' : ''}`}
                        value={formData.returnTime}
                        onChange={handleChange}
                      />
                      {errors.returnTime && (
                        <span className="transport-field-error">{errors.returnTime}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="transport-field-group">
                  <label className="transport-label" htmlFor="flightTrainNumber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    N° de vol / train
                    <span className="transport-optional">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    id="flightTrainNumber"
                    name="flightTrainNumber"
                    className="transport-input"
                    placeholder="Ex: AF1234, TGV 6789..."
                    value={formData.flightTrainNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ── SECTION : Véhicule ── */}
              <div className="transport-form-section">
                <div className="transport-section-header">
                  <div className="transport-section-number">3</div>
                  <div>
                    <h2 className="transport-section-title">Véhicule & Passagers</h2>
                    <p className="transport-section-desc">
                      Choisissez votre véhicule et le nombre de passagers
                    </p>
                  </div>
                </div>

                <div className="transport-vehicles">
                  {vehicles.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      className={`transport-vehicle-card ${vehicleType === v.id ? 'active' : ''} ${
                        errors.vehicleType ? 'error' : ''
                      }`}
                      onClick={() => {
                        setVehicleType(v.id);
                        if (errors.vehicleType) setErrors((p) => ({ ...p, vehicleType: '' }));
                      }}
                    >
                      <div className="transport-vehicle-icon">{v.icon}</div>
                      <h3 className="transport-vehicle-name">{v.label}</h3>
                      <p className="transport-vehicle-desc">{v.description}</p>
                      <span className="transport-vehicle-capacity">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                        {v.capacity} pers.
                      </span>
                      {vehicleType === v.id && (
                        <div className="transport-vehicle-check">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {errors.vehicleType && (
                  <span className="transport-field-error center">{errors.vehicleType}</span>
                )}

                <div className="transport-row">
                  <div className="transport-field-group">
                    <label className="transport-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      Nombre de passagers
                    </label>
                    <div className="transport-counter">
                      <button
                        type="button"
                        className="transport-counter-btn"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            passengers: Math.max(1, prev.passengers - 1),
                          }))
                        }
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="transport-counter-value">{formData.passengers}</span>
                      <button
                        type="button"
                        className="transport-counter-btn"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            passengers: Math.min(60, prev.passengers + 1),
                          }))
                        }
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="transport-field-group">
                    <label className="transport-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="7" width="16" height="13" rx="2" />
                        <path d="M8 7V5a4 4 0 018 0v2" />
                      </svg>
                      Nombre de bagages
                    </label>
                    <div className="transport-counter">
                      <button
                        type="button"
                        className="transport-counter-btn"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            luggage: Math.max(0, prev.luggage - 1),
                          }))
                        }
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="transport-counter-value">{formData.luggage}</span>
                      <button
                        type="button"
                        className="transport-counter-btn"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            luggage: Math.min(30, prev.luggage + 1),
                          }))
                        }
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="transport-options-row">
                  <label className="transport-checkbox-label">
                    <input
                      type="checkbox"
                      name="childSeat"
                      checked={formData.childSeat}
                      onChange={handleChange}
                    />
                    <span className="transport-checkbox-custom" />
                    <span>Siège enfant / bébé</span>
                  </label>
                  <label className="transport-checkbox-label">
                    <input
                      type="checkbox"
                      name="accessibility"
                      checked={formData.accessibility}
                      onChange={handleChange}
                    />
                    <span className="transport-checkbox-custom" />
                    <span>Accessibilité PMR</span>
                  </label>
                </div>
              </div>

              {/* ── SECTION : Coordonnées ── */}
              <div className="transport-form-section">
                <div className="transport-section-header">
                  <div className="transport-section-number">4</div>
                  <div>
                    <h2 className="transport-section-title">Vos coordonnées</h2>
                    <p className="transport-section-desc">
                      Informations pour vous contacter et confirmer la réservation
                    </p>
                  </div>
                </div>

                <div className="transport-field-group">
                  <label className="transport-label" htmlFor="fullName">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`transport-input ${errors.fullName ? 'error' : ''}`}
                    placeholder="Votre nom et prénom"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && (
                    <span className="transport-field-error">{errors.fullName}</span>
                  )}
                </div>

                <div className="transport-row">
                  <div className="transport-field-group">
                    <label className="transport-label" htmlFor="email">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 7l-10 7L2 7" />
                      </svg>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`transport-input ${errors.email ? 'error' : ''}`}
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <span className="transport-field-error">{errors.email}</span>
                    )}
                  </div>
                  <div className="transport-field-group">
                    <label className="transport-label" htmlFor="phone">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`transport-input ${errors.phone ? 'error' : ''}`}
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <span className="transport-field-error">{errors.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION : Remarques ── */}
              <div className="transport-form-section">
                <div className="transport-section-header">
                  <div className="transport-section-number">5</div>
                  <div>
                    <h2 className="transport-section-title">Remarques & demandes</h2>
                    <p className="transport-section-desc">
                      Informations complémentaires ou demandes spéciales
                    </p>
                  </div>
                </div>

                <div className="transport-field-group">
                  <textarea
                    name="freeText"
                    className="transport-textarea"
                    rows="5"
                    placeholder="Précisez vos besoins particuliers : arrêts intermédiaires, accueil avec panneau nominatif, équipements spéciaux, etc."
                    value={formData.freeText}
                    onChange={handleChange}
                  />
                  <span className="transport-char-count">
                    {formData.freeText.length} / 1000 caractères
                  </span>
                </div>
              </div>

              {/* ── SUBMIT ── */}
              <div className="transport-submit-section">
                <div className="transport-submit-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p>
                    Après envoi, notre équipe analysera votre demande et vous enverra un devis
                    personnalisé sous 24h.
                  </p>
                </div>
                <button
                  type="submit"
                  className={`transport-submit-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="transport-spinner" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                      Envoyer ma demande
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <Footer />
      <Chatbot />
    </>
  );
};

export default Transport;