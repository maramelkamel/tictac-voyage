import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import '../styles/CustomTripAbroad.css';

const API = 'http://localhost:5000/api/custom-trips';

const CustomTripAbroad = () => {
  // ── Pre-fill from logged-in client ───────────────────────────
  const clientData  = (() => { try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; } })();
  const clientEmail = clientData?.email || '';
  const clientName  = [
    clientData?.firstName || clientData?.first_name || '',
    clientData?.lastName  || clientData?.last_name  || '',
  ].filter(Boolean).join(' ');

  const EMPTY = {
    fullName: clientName,   // ← pre-filled
    email:    clientEmail,  // ← pre-filled + locked
    phone:    clientData?.phone || '',  // ← pre-filled
    destination: '', departureDate: '', returnDate: '', numberOfPersons: 1, maxBudget: '',
    includeHotel: false, hotelCategory: '', roomType: '', pension: '',
    includeTransport: false, transportType: '', departureCity: '', luggage: '',
    includeGuide: false, guideLanguage: '', guideDuration: '',
  };

  const [formData, setFormData]         = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [error, setError]               = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Block email change if logged in
    if (name === 'email' && clientEmail) return;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const isDateValid = () => {
    if (!formData.departureDate || !formData.returnDate) return true;
    return new Date(formData.departureDate) < new Date(formData.returnDate);
  };

  const calculateNights = () => {
    if (!formData.departureDate || !formData.returnDate) return 0;
    return Math.ceil(Math.abs(new Date(formData.returnDate) - new Date(formData.departureDate)) / 86400000);
  };

  useEffect(() => { if (!formData.includeHotel)     setFormData(p => ({ ...p, hotelCategory: '', roomType: '', pension: '' })); },    [formData.includeHotel]);
  useEffect(() => { if (!formData.includeTransport) setFormData(p => ({ ...p, transportType: '', departureCity: '', luggage: '' })); }, [formData.includeTransport]);
  useEffect(() => { if (!formData.includeGuide)     setFormData(p => ({ ...p, guideLanguage: '', guideDuration: '' })); },             [formData.includeGuide]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDateValid()) return;
    setIsSubmitting(true);
    setError('');

    const payload = {
      full_name: formData.fullName, email: formData.email, phone: formData.phone,
      destination: formData.destination, departure_date: formData.departureDate, return_date: formData.returnDate,
      number_of_persons: Number(formData.numberOfPersons), max_budget: formData.maxBudget ? Number(formData.maxBudget) : null,
      include_hotel:    formData.includeHotel,
      hotel_category:   formData.includeHotel ? formData.hotelCategory : null,
      room_type:        formData.includeHotel ? formData.roomType      : null,
      pension:          formData.includeHotel ? formData.pension        : null,
      include_transport: formData.includeTransport,
      transport_type:   formData.includeTransport ? formData.transportType : null,
      departure_city:   formData.includeTransport ? formData.departureCity : null,
      luggage:          formData.includeTransport ? formData.luggage       : null,
      include_guide:    formData.includeGuide,
      guide_language:   formData.includeGuide ? formData.guideLanguage : null,
      guide_duration:   formData.includeGuide ? formData.guideDuration : null,
    };

    try {
      const res  = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        setShowSuccess(true);
        // Reset to pre-filled state (keep client info)
        setFormData({ ...EMPTY, destination: '', departureDate: '', returnDate: '', numberOfPersons: 1, maxBudget: '' });
        setTimeout(() => setShowSuccess(false), 6000);
      } else setError(json.message || 'Une erreur est survenue.');
    } catch { setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.'); }
    finally { setIsSubmitting(false); }
  };

  const summaryData = useMemo(() => ({
    destination: formData.destination || 'Non spécifiée',
    dates: formData.departureDate && formData.returnDate
      ? `${new Date(formData.departureDate).toLocaleDateString('fr-FR')} - ${new Date(formData.returnDate).toLocaleDateString('fr-FR')}`
      : 'Non spécifiées',
    nights:  calculateNights(),
    persons: `${formData.numberOfPersons} personne${formData.numberOfPersons > 1 ? 's' : ''}`,
    budget:  formData.maxBudget ? `${parseInt(formData.maxBudget).toLocaleString('fr-FR')} €/pers` : null,
    hotel:     formData.includeHotel && formData.hotelCategory     ? { category: `${formData.hotelCategory} étoiles`, room: formData.roomType, pension: formData.pension } : null,
    transport: formData.includeTransport && formData.transportType ? { type: formData.transportType, departure: formData.departureCity, luggage: formData.luggage }       : null,
    guide:     formData.includeGuide && formData.guideLanguage     ? { language: formData.guideLanguage, duration: formData.guideDuration }                               : null,
  }), [formData]);

  const getPriceEstimate = () => {
    if (!formData.destination) return '—';
    let base = 1200;
    if (formData.includeHotel) {
      base += formData.hotelCategory === '5' ? 800 : formData.hotelCategory === '4' ? 500 : 300;
      if (formData.pension === 'all-inclusive') base += 200;
      if (formData.pension === 'demi-pension')  base += 100;
    }
    if (formData.includeTransport) {
      base += formData.transportType === 'avion' ? 600 : formData.transportType === 'train' ? 400 : 200;
      if (formData.luggage === 'extra') base += 150;
    }
    if (formData.includeGuide)
      base += formData.guideDuration === 'tout-sejour' ? 500 : formData.guideDuration === '2-3-jours' ? 300 : 150;
    return `À partir de ${base.toLocaleString('fr-FR')} €`;
  };

  // Locked email style
  const lockedStyle = { background: '#f8fafc', cursor: 'not-allowed', color: '#64748b', borderColor: '#e2e8f0' };

  return (
    <div className="page-container">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="hero-section">
        <div className="hero__photo-wrap">
          <div className="hero__photo" />
          <div className="hero__photo-grad" />
        </div>
        <div className="hero__solid" />
        <div className="hero__inner">
          <div className="hero__left">
            <span className="hero__eyebrow">
              <span className="hero__eyebrow-dot" />Voyage sur mesure
            </span>
            <h1 className="hero__title">
              Crée ton voyage<br/><span className="hero__title-em">à l'étranger</span>
            </h1>
            <p className="hero__desc">
              Compose ton séjour librement selon ton budget.
              Aucun forfait imposé — uniquement ce que <em>tu</em> veux.
            </p>
            <a href="#trip-form" className="hero__cta">
              Commencer mon voyage
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
        <div className="hero__wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,80 C360,0 1080,80 1440,20 L1440,80 Z" fill="#F8FAFB"/>
          </svg>
        </div>
      </section>

      {/* ══ MAIN ══ */}
      <section className="main-section" id="trip-form">
        <div className="container">
          <div className="form-layout">

            {/* ── FORMULAIRE ── */}
            <div className="form-column">
              <form onSubmit={handleSubmit} className="trip-form" noValidate>
                <div className="form-header">
                  <h2>Votre voyage personnalisé</h2>
                  <p className="form-subtitle">Tous les champs marqués d'un * sont obligatoires</p>
                </div>

                {/* Logged-in notice */}
                {clientEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#e0fbfc', border: '1px solid #a5f3fc', borderRadius: 12, marginBottom: 20 }}>
                    <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
                    <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                      Connecté en tant que <strong>{clientEmail}</strong> — vos informations ont été pré-remplies.
                    </p>
                  </div>
                )}

                {/* CONTACT */}
                <fieldset className="form-section">
                  <legend>Vos coordonnées</legend>
                  <div className="form-group">
                    <label htmlFor="fullName">Nom complet <span className="required">*</span></label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName}
                      onChange={handleChange} placeholder="Ex: Ahmed Ben Ali" required autoComplete="name"/>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">
                        Adresse e-mail <span className="required">*</span>
                        {clientEmail && (
                          <span style={{ marginLeft: 8, fontSize: 10, background: '#e0fbfc', color: '#0e7490', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
                            <i className="fas fa-lock" style={{ marginRight: 3 }} />Lié au compte
                          </span>
                        )}
                      </label>
                      <input type="email" id="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="exemple@mail.com" required autoComplete="email"
                        readOnly={!!clientEmail}
                        style={clientEmail ? lockedStyle : {}} />
                      {clientEmail && (
                        <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
                          Email lié à votre compte — non modifiable.
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Téléphone <span className="required">*</span></label>
                      <input type="tel" id="phone" name="phone" value={formData.phone}
                        onChange={handleChange} placeholder="+216 20 000 000" required autoComplete="tel"/>
                    </div>
                  </div>
                </fieldset>

                {/* VOYAGE */}
                <fieldset className="form-section">
                  <legend>Informations principales</legend>
                  <div className="form-group">
                    <label htmlFor="destination">Destination <span className="required">*</span></label>
                    <input type="text" id="destination" name="destination" value={formData.destination}
                      onChange={handleChange} placeholder="Ex: Tokyo, Paris, New York..." required autoComplete="off"/>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="departureDate">Date de départ <span className="required">*</span></label>
                      <input type="date" id="departureDate" name="departureDate" value={formData.departureDate} onChange={handleChange} required/>
                    </div>
                    <div className="form-group">
                      <label htmlFor="returnDate">Date de retour <span className="required">*</span></label>
                      <input type="date" id="returnDate" name="returnDate" value={formData.returnDate} onChange={handleChange} required min={formData.departureDate}/>
                      {!isDateValid() && <span className="date-error">La date de retour doit être après le départ</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="numberOfPersons">Nombre de personnes <span className="required">*</span></label>
                    <input type="number" id="numberOfPersons" name="numberOfPersons" min="1" max="20" value={formData.numberOfPersons} onChange={handleChange} required/>
                  </div>
                </fieldset>

                {/* BUDGET */}
                <fieldset className="form-section">
                  <legend>Budget (optionnel)</legend>
                  <div className="form-group">
                    <label htmlFor="maxBudget">Budget maximum par personne (€)</label>
                    <div className="input-with-icon">
                      <span className="input-icon">€</span>
                      <input type="number" id="maxBudget" name="maxBudget" min="0" step="100"
                        placeholder="Ex: 1500" value={formData.maxBudget} onChange={handleChange} className="with-prefix"/>
                    </div>
                  </div>
                </fieldset>

                {/* OPTIONS */}
                <fieldset className="form-section">
                  <legend>Options supplémentaires</legend>

                  {/* Hôtel */}
                  <div className="option-group">
                    <label className="switch-label">
                      <input type="checkbox" name="includeHotel" checked={formData.includeHotel} onChange={handleChange}/>
                      <span className="slider"></span>
                      <span className="switch-text">Inclure un hôtel <span className="option-badge">Optionnel</span></span>
                    </label>
                    {formData.includeHotel && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Catégorie <span className="required">*</span></label>
                            <select name="hotelCategory" value={formData.hotelCategory} onChange={handleChange} required>
                              <option value="">Sélectionnez...</option>
                              <option value="3">3 étoiles (Confort)</option>
                              <option value="4">4 étoiles (Premium)</option>
                              <option value="5">5 étoiles (Luxe)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Type de chambre <span className="required">*</span></label>
                            <select name="roomType" value={formData.roomType} onChange={handleChange} required>
                              <option value="">Sélectionnez...</option>
                              <option value="simple">Simple</option>
                              <option value="double">Double</option>
                              <option value="familiale">Familiale</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Pension <span className="required">*</span></label>
                          <select name="pension" value={formData.pension} onChange={handleChange} required>
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
                    <label className="switch-label">
                      <input type="checkbox" name="includeTransport" checked={formData.includeTransport} onChange={handleChange}/>
                      <span className="slider"></span>
                      <span className="switch-text">Inclure le transport <span className="option-badge">Optionnel</span></span>
                    </label>
                    {formData.includeTransport && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Type de transport <span className="required">*</span></label>
                            <select name="transportType" value={formData.transportType} onChange={handleChange} required>
                              <option value="">Sélectionnez...</option>
                              <option value="avion">Avion</option>
                              <option value="train">Train</option>
                              <option value="bus">Bus</option>
                              <option value="voiture">Location de voiture</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Ville de départ <span className="required">*</span></label>
                            <input type="text" name="departureCity" value={formData.departureCity}
                              onChange={handleChange} placeholder="Ex: Tunis, Paris..." required list="cities-list"/>
                            <datalist id="cities-list">
                              {['Tunis','Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Bordeaux','Lille'].map(c => <option key={c} value={c}/>)}
                            </datalist>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Bagages <span className="required">*</span></label>
                          <select name="luggage" value={formData.luggage} onChange={handleChange} required>
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
                    <label className="switch-label">
                      <input type="checkbox" name="includeGuide" checked={formData.includeGuide} onChange={handleChange}/>
                      <span className="slider"></span>
                      <span className="switch-text">Inclure un guide touristique <span className="option-badge">Optionnel</span></span>
                    </label>
                    {formData.includeGuide && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Langue du guide <span className="required">*</span></label>
                            <select name="guideLanguage" value={formData.guideLanguage} onChange={handleChange} required>
                              <option value="">Sélectionnez...</option>
                              <option value="francais">Français</option>
                              <option value="anglais">Anglais</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Durée <span className="required">*</span></label>
                            <select name="guideDuration" value={formData.guideDuration} onChange={handleChange} required>
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

                {error && (
                  <div className="form-error-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                    {error}
                  </div>
                )}

                <button type="submit" className="submit-button" disabled={isSubmitting || !isDateValid()}>
                  {isSubmitting
                    ? <><span className="spinner"></span>Traitement en cours...</>
                    : <>Trouver mon voyage idéal <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                  }
                </button>

                {showSuccess && (
                  <div className="success-message" role="alert">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <div>
                      <strong>Demande envoyée !</strong>
                      <p>Un conseiller vous contactera sous 24h</p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* ══ SIDEBAR ══ */}
            <div className="summary-column">
              <div className="summary-sticky-wrap">
                <div className="summary-card">
                  <div className="summary-header">
                    <h3>Récapitulatif</h3>
                    <span className="live-badge">En direct</span>
                  </div>
                  <div className="summary-content">
                    {formData.fullName && (
                      <div className="summary-item">
                        <span className="label">Client</span>
                        <span className="value">{formData.fullName}</span>
                        {formData.email && <span className="summary-sub">{formData.email}</span>}
                        {formData.phone && <span className="summary-sub">{formData.phone}</span>}
                      </div>
                    )}
                    <div className="summary-item">
                      <span className="label">Destination</span>
                      <span className="value">{summaryData.destination}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Dates</span>
                      <span className="value">
                        {summaryData.dates !== 'Non spécifiées'
                          ? <>{summaryData.dates}<small className="nights-badge">{summaryData.nights} nuits</small></>
                          : summaryData.dates}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Voyageurs</span>
                      <span className="value">{summaryData.persons}</span>
                    </div>
                    {summaryData.budget && (
                      <div className="summary-item">
                        <span className="label">Budget max</span>
                        <span className="value" style={{ color: 'var(--color-primary)' }}>{summaryData.budget}</span>
                      </div>
                    )}
                    {(summaryData.hotel || summaryData.transport || summaryData.guide) && <div className="summary-divider"/>}
                    {summaryData.hotel && (
                      <div className="summary-section">
                        <h4>🏨 Hébergement</h4>
                        <div className="summary-item"><span className="label">Catégorie</span><span className="value">{summaryData.hotel.category}</span></div>
                        <div className="summary-item"><span className="label">Chambre</span><span className="value">{summaryData.hotel.room}</span></div>
                        <div className="summary-item"><span className="label">Pension</span><span className="value">{summaryData.hotel.pension}</span></div>
                      </div>
                    )}
                    {summaryData.transport && (
                      <div className="summary-section">
                        <h4>✈️ Transport</h4>
                        <div className="summary-item"><span className="label">Type</span><span className="value">{summaryData.transport.type}</span></div>
                        <div className="summary-item"><span className="label">Départ de</span><span className="value">{summaryData.transport.departure}</span></div>
                        <div className="summary-item"><span className="label">Bagages</span><span className="value">{summaryData.transport.luggage}</span></div>
                      </div>
                    )}
                    {summaryData.guide && (
                      <div className="summary-section">
                        <h4>🧭 Guide</h4>
                        <div className="summary-item"><span className="label">Langue</span><span className="value">{summaryData.guide.language}</span></div>
                        <div className="summary-item"><span className="label">Durée</span><span className="value">{summaryData.guide.duration}</span></div>
                      </div>
                    )}
                    <div className="price-estimation">
                      <div className="price-header">
                        <span className="price-label">Estimation du prix</span>
                        <span className="price-tag">Par personne</span>
                      </div>
                      <div className="price-value">{getPriceEstimate()}</div>
                      <div className="price-footer">
                        <span className="price-note">Estimation indicative</span>
                        <span className="price-disclaimer">Soumise à disponibilité</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary-tips">
                <h4>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Conseils personnalisés
                </h4>
                <ul>
                  <li>Réservez 3 à 6 mois à l'avance pour les meilleurs tarifs aériens</li>
                  <li>Vérifiez les exigences visa pour votre destination</li>
                  <li>Souscrivez une assurance voyage complète (annulation, santé, rapatriement)</li>
                  <li>Privilégiez les périodes hors saison pour économiser jusqu'à 40%</li>
                </ul>
                <div className="trust-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
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