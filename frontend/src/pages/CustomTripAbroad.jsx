import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import '../styles/CustomTripAbroad.css';

const CustomTripAbroad = () => {
  const [formData, setFormData] = useState({
    destination: '',
    departureDate: '',
    returnDate: '',
    numberOfPersons: 1,
    maxBudget: '',
    includeHotel: false,
    hotelCategory: '',
    roomType: '',
    pension: '',
    includeTransport: false,
    transportType: '',
    departureCity: '',
    luggage: '',
    includeGuide: false,
    guideLanguage: '',
    guideDuration: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (option, field, value) => {
    setFormData(prev => ({
      ...prev,
      [option]: {
        ...prev[option],
        [field]: value
      }
    }));
  };

  const isDateValid = () => {
    if (!formData.departureDate || !formData.returnDate) return true;
    return new Date(formData.departureDate) < new Date(formData.returnDate);
  };

  const calculateNights = () => {
    if (!formData.departureDate || !formData.returnDate) return 0;
    const start = new Date(formData.departureDate);
    const end = new Date(formData.returnDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (!formData.includeHotel) {
      setFormData(prev => ({
        ...prev,
        hotelCategory: '',
        roomType: '',
        pension: ''
      }));
    }
    if (!formData.includeTransport) {
      setFormData(prev => ({
        ...prev,
        transportType: '',
        departureCity: '',
        luggage: ''
      }));
    }
    if (!formData.includeGuide) {
      setFormData(prev => ({
        ...prev,
        guideLanguage: '',
        guideDuration: ''
      }));
    }
  }, [formData.includeHotel, formData.includeTransport, formData.includeGuide]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const summaryData = useMemo(() => ({
    destination: formData.destination || 'Non spécifiée',
    dates: formData.departureDate && formData.returnDate 
      ? `${new Date(formData.departureDate).toLocaleDateString('fr-FR')} - ${new Date(formData.returnDate).toLocaleDateString('fr-FR')}`
      : 'Non spécifiées',
    nights: calculateNights(),
    persons: `${formData.numberOfPersons} personne${formData.numberOfPersons > 1 ? 's' : ''}`,
    budget: formData.maxBudget ? `${parseInt(formData.maxBudget).toLocaleString('fr-FR')} €/pers` : null,
    hotel: formData.includeHotel && formData.hotelCategory ? {
      category: `${formData.hotelCategory} étoiles`,
      room: formData.roomType,
      pension: formData.pension
    } : null,
    transport: formData.includeTransport && formData.transportType ? {
      type: formData.transportType,
      departure: formData.departureCity,
      luggage: formData.luggage
    } : null,
    guide: formData.includeGuide && formData.guideLanguage ? {
      language: formData.guideLanguage,
      duration: formData.guideDuration
    } : null
  }), [formData]);

  const getPriceEstimate = () => {
    if (!formData.destination) return '—';
    
    let basePrice = 1200;
    
    if (formData.includeHotel) {
      basePrice += formData.hotelCategory === '5' ? 800 : 
                   formData.hotelCategory === '4' ? 500 : 300;
      
      if (formData.pension === 'all-inclusive') basePrice += 200;
      if (formData.pension === 'demi-pension') basePrice += 100;
    }
    
    if (formData.includeTransport) {
      basePrice += formData.transportType === 'avion' ? 600 : 
                   formData.transportType === 'train' ? 400 : 200;
      
      if (formData.luggage === 'extra') basePrice += 150;
    }
    
    if (formData.includeGuide) {
      basePrice += formData.guideDuration === 'tout-sejour' ? 500 : 
                   formData.guideDuration === '2-3-jours' ? 300 : 150;
    }
    
    return `À partir de ${basePrice.toLocaleString('fr-FR')} €`;
  };

  return (
    <div className="page-container">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section">
  <div className="hero__bg"></div>
  <div className="hero__pattern"></div>
  <div className="hero__overlay"></div>
  
  <div className="hero-content">
    <div className="hero__tag">Voyage sur mesure</div>

    <h1>Crée ton voyage <br/>à l'étranger</h1>
    
    <p className="hero-subtitle">
      Compose ton séjour librement selon ton budget.
      <br/>Aucun forfait imposé, uniquement ce que tu veux.
    </p>

    <a href="#formulaire" className="btn-cta">Commencer mon voyage</a>
  </div>
</section>

      {/* Main Section */}
      <section className="main-section" id="trip-form">
        <div className="container">
          <div className="form-layout">
            {/* Formulaire */}
            <div className="form-column">
              <form onSubmit={handleSubmit} className="trip-form" noValidate>
                <div className="form-header">
                  <h2>Votre voyage personnalisé</h2>
                  <p className="form-subtitle">Tous les champs marqués d'un * sont obligatoires</p>
                </div>

                {/* Informations principales */}
                <fieldset className="form-section">
                  <legend>Informations principales</legend>
                  
                  <div className="form-group">
                    <label htmlFor="destination">
                      Destination <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Ex: Tokyo, Paris, New York..."
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="departureDate">
                        Date de départ <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        id="departureDate"
                        name="departureDate"
                        value={formData.departureDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="returnDate">
                        Date de retour <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        id="returnDate"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleChange}
                        required
                        min={formData.departureDate}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="numberOfPersons">
                      Nombre de personnes <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="numberOfPersons"
                      name="numberOfPersons"
                      min="1"
                      max="20"
                      value={formData.numberOfPersons}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </fieldset>

                {/* Budget */}
                <fieldset className="form-section">
                  <legend>Budget (optionnel)</legend>
                  <div className="form-group">
                    <label htmlFor="maxBudget">
                      Budget maximum par personne (€)
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon">€</span>
                      <input
                        type="number"
                        id="maxBudget"
                        name="maxBudget"
                        min="0"
                        step="100"
                        placeholder="Ex: 1500"
                        value={formData.maxBudget}
                        onChange={handleChange}
                        className="with-prefix"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Options */}
                <fieldset className="form-section">
                  <legend>Options supplémentaires</legend>
                  
                  {/* Hôtel */}
                  <div className="option-group">
                    <div className="option-header">
                      <label className="switch-label">
                        <input
                          type="checkbox"
                          name="includeHotel"
                          checked={formData.includeHotel}
                          onChange={handleChange}
                        />
                        <span className="slider"></span>
                        <span className="switch-text">
                          Inclure un hôtel
                          <span className="option-badge">Optionnel</span>
                        </span>
                      </label>
                    </div>
                    
                    {formData.includeHotel && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Catégorie <span className="required">*</span></label>
                            <select
                              value={formData.hotelCategory}
                              onChange={(e) => handleOptionChange('includeHotel', 'hotelCategory', e.target.value)}
                              required
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="3">3 étoiles (Confort)</option>
                              <option value="4">4 étoiles (Premium)</option>
                              <option value="5">5 étoiles (Luxe)</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label>Type de chambre <span className="required">*</span></label>
                            <select
                              value={formData.roomType}
                              onChange={(e) => handleOptionChange('includeHotel', 'roomType', e.target.value)}
                              required
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="simple">Simple</option>
                              <option value="double">Double</option>
                              <option value="familiale">Familiale</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Pension <span className="required">*</span></label>
                          <select
                            value={formData.pension}
                            onChange={(e) => handleOptionChange('includeHotel', 'pension', e.target.value)}
                            required
                          >
                            <option value="">Sélectionnez...</option>
                            <option value="petit-dejeuner">Petit déjeuner</option>
                            <option value="demi-pension">Demi-pension</option>
                            <option value="all-inclusive">All inclusive</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transport */}
                  <div className="option-group">
                    <div className="option-header">
                      <label className="switch-label">
                        <input
                          type="checkbox"
                          name="includeTransport"
                          checked={formData.includeTransport}
                          onChange={handleChange}
                        />
                        <span className="slider"></span>
                        <span className="switch-text">
                          Inclure le transport
                          <span className="option-badge">Optionnel</span>
                        </span>
                      </label>
                    </div>
                    
                    {formData.includeTransport && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Type de transport <span className="required">*</span></label>
                            <select
                              value={formData.transportType}
                              onChange={(e) => handleOptionChange('includeTransport', 'transportType', e.target.value)}
                              required
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="avion">Avion</option>
                              <option value="train">Train</option>
                              <option value="bus">Bus</option>
                              <option value="voiture">Location de voiture</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label>Ville de départ <span className="required">*</span></label>
                            <input
                              type="text"
                              value={formData.departureCity}
                              onChange={(e) => handleOptionChange('includeTransport', 'departureCity', e.target.value)}
                              placeholder="Ex: Paris, Lyon..."
                              required
                              list="french-cities"
                            />
                            <datalist id="french-cities">
                              <option value="Paris" />
                              <option value="Lyon" />
                              <option value="Marseille" />
                              <option value="Toulouse" />
                              <option value="Nice" />
                              <option value="Nantes" />
                              <option value="Strasbourg" />
                              <option value="Montpellier" />
                              <option value="Bordeaux" />
                              <option value="Lille" />
                            </datalist>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Bagages <span className="required">*</span></label>
                          <select
                            value={formData.luggage}
                            onChange={(e) => handleOptionChange('includeTransport', 'luggage', e.target.value)}
                            required
                          >
                            <option value="">Sélectionnez...</option>
                            <option value="standard">Standard (inclus)</option>
                            <option value="extra">Extra (supplément)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guide */}
                  <div className="option-group">
                    <div className="option-header">
                      <label className="switch-label">
                        <input
                          type="checkbox"
                          name="includeGuide"
                          checked={formData.includeGuide}
                          onChange={handleChange}
                        />
                        <span className="slider"></span>
                        <span className="switch-text">
                          Inclure un guide touristique
                          <span className="option-badge">Optionnel</span>
                        </span>
                      </label>
                    </div>
                    
                    {formData.includeGuide && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Langue du guide <span className="required">*</span></label>
                            <select
                              value={formData.guideLanguage}
                              onChange={(e) => handleOptionChange('includeGuide', 'guideLanguage', e.target.value)}
                              required
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="francais">Français</option>
                              <option value="anglais">Anglais</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label>Durée <span className="required">*</span></label>
                            <select
                              value={formData.guideDuration}
                              onChange={(e) => handleOptionChange('includeGuide', 'guideDuration', e.target.value)}
                              required
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="1-jour">1 jour</option>
                              <option value="2-3-jours">2–3 jours</option>
                              <option value="tout-sejour">Tout le séjour</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting || !isDateValid()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      Trouver mon voyage idéal
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>

                {showSuccess && (
                  <div className="success-message" role="alert">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <div>
                      <strong>Demande envoyée !</strong>
                      <p>Un conseiller vous contactera sous 24h</p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Récapitulatif */}
            <div className="summary-column">
              <div className="summary-card">
                <div className="summary-header">
                  <h3>Récapitulatif</h3>
                  <span className="live-badge">En direct</span>
                </div>
                
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="label">Destination</span>
                    <span className="value">{summaryData.destination}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="label">Dates</span>
                    <span className="value">
                      {summaryData.dates !== 'Non spécifiées' ? (
                        <>
                          {summaryData.dates}
                          <small className="nights-badge">{summaryData.nights} nuits</small>
                        </>
                      ) : summaryData.dates}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="label">Voyageurs</span>
                    <span className="value">{summaryData.persons}</span>
                  </div>
                  
                  {summaryData.budget && (
                    <div className="summary-item budget-item">
                      <span className="label">Budget max</span>
                      <span className="value highlight">{summaryData.budget}</span>
                    </div>
                  )}
                  
                  <div className="summary-divider"></div>
                  
                  {summaryData.hotel && (
                    <div className="summary-section">
                      <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M10 9a2 2 0 1 1-4 0c0-1.037.46-1.976 1.2-2.598.74-.622 1.2-1.337 1.2-2.598 0-1.261-.46-1.976-1.2-2.598C9.46 4.024 9 3.739 9 2.5a2 2 0 0 1 4 0c0 1.261.46 1.976 1.2 2.598.74.622 1.2 1.337 1.2 2.598 0 1.261-.46 1.976-1.2 2.598C10.46 8.024 10 8.739 10 10a2 2 0 0 1-4 0z"/>
                        </svg>
                        Hébergement
                      </h4>
                      <div className="summary-item">
                        <span className="label">Catégorie</span>
                        <span className="value">{summaryData.hotel.category}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Chambre</span>
                        <span className="value">{summaryData.hotel.room}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Pension</span>
                        <span className="value">{summaryData.hotel.pension}</span>
                      </div>
                    </div>
                  )}
                  
                  {summaryData.transport && (
                    <div className="summary-section">
                      <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        Transport
                      </h4>
                      <div className="summary-item">
                        <span className="label">Type</span>
                        <span className="value">{summaryData.transport.type}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Départ de</span>
                        <span className="value">{summaryData.transport.departure}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Bagages</span>
                        <span className="value">{summaryData.transport.luggage}</span>
                      </div>
                    </div>
                  )}
                  
                  {summaryData.guide && (
                    <div className="summary-section">
                      <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Guide
                      </h4>
                      <div className="summary-item">
                        <span className="label">Langue</span>
                        <span className="value">{summaryData.guide.language}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Durée</span>
                        <span className="value">{summaryData.guide.duration}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="price-estimation">
                    <div className="price-header">
                      <span className="price-label">Estimation du prix</span>
                      <span className="price-tag">Par personne</span>
                    </div>
                    <div className="price-value">
                      {getPriceEstimate()}
                    </div>
                    <div className="price-footer">
                      <span className="price-note">Estimation indicative</span>
                      <span className="price-disclaimer">Soumise à disponibilité</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="summary-tips">
                <h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Conseils personnalisés
                </h4>
                <ul>
                  <li>Réservez 3 à 6 mois à l'avance pour les meilleurs tarifs aériens</li>
                  <li>Vérifiez les exigences visa pour votre destination</li>
                  <li>Souscrivez une assurance voyage complète (annulation, santé, rapatriement)</li>
                  <li>Privilégiez les périodes hors saison pour économiser jusqu'à 40%</li>
                </ul>
                <div className="trust-badge">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Vos données sont sécurisées</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default CustomTripAbroad;