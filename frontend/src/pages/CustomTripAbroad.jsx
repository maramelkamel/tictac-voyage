import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CustomTripAbroad.css';
import { usePromotions }  from '../hooks/usePromotions';
import PromotionsSection  from './admin/promotions/PromotionsSection';
import { useTranslation } from 'react-i18next';

const API = 'http://localhost:5000/api/custom-trips';

const CustomTripAbroad = () => {
  const { t, i18n } = useTranslation('booking');
  const ct = (key, options) => t(`custom_trip.${key}`, options);
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
  const { promos } = usePromotions('categorie', 'voyages_sur_mesure');
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
      } else setError(json.message || t('error_generic', { ns: 'common' }));
    } catch { setError(t('error_server', { ns: 'common' })); }
    finally { setIsSubmitting(false); }
  };

  const locale = (i18n.language || 'fr').startsWith('ar') ? 'ar-TN' : (i18n.language || 'fr').startsWith('en') ? 'en-US' : 'fr-FR';
  const formatDate = (value) => new Date(value).toLocaleDateString(locale);
  const formatNumber = (value) => Number(value).toLocaleString(locale);
  const displayValue = (type, value) => {
    const maps = {
      hotelCategory: { 3: ct('hotel_3'), 4: ct('hotel_4'), 5: ct('hotel_5') },
      roomType: { simple: ct('room_simple'), double: ct('room_double'), familiale: ct('room_family') },
      pension: { 'petit-dejeuner': ct('pension_breakfast'), 'demi-pension': ct('pension_half'), 'all-inclusive': ct('pension_all') },
      transportType: { avion: ct('transport_plane'), train: ct('transport_train'), bus: ct('transport_bus'), voiture: ct('transport_car') },
      luggage: { standard: ct('luggage_standard'), extra: ct('luggage_extra') },
      guideLanguage: { francais: ct('guide_fr'), anglais: ct('guide_en') },
      guideDuration: { '1-jour': ct('guide_1day'), '2-3-jours': ct('guide_2_3days'), 'tout-sejour': ct('guide_full') },
    };
    return maps[type]?.[value] || value;
  };

  const summaryData = {
    destination: formData.destination || ct('summary_not_specified'),
    dates: formData.departureDate && formData.returnDate
      ? `${formatDate(formData.departureDate)} - ${formatDate(formData.returnDate)}`
      : ct('summary_dates_not_set'),
    nights:  calculateNights(),
    persons: formData.numberOfPersons > 1
      ? ct('summary_persons_plural', { count: formData.numberOfPersons })
      : ct('summary_persons', { count: formData.numberOfPersons }),
    budget:  formData.maxBudget ? `${formatNumber(formData.maxBudget)} €/pers` : null,
    hotel:     formData.includeHotel && formData.hotelCategory     ? { category: displayValue('hotelCategory', formData.hotelCategory), room: displayValue('roomType', formData.roomType), pension: displayValue('pension', formData.pension) } : null,
    transport: formData.includeTransport && formData.transportType ? { type: displayValue('transportType', formData.transportType), departure: formData.departureCity, luggage: displayValue('luggage', formData.luggage) }       : null,
    guide:     formData.includeGuide && formData.guideLanguage     ? { language: displayValue('guideLanguage', formData.guideLanguage), duration: displayValue('guideDuration', formData.guideDuration) }                               : null,
  };

  const getPriceEstimate = () => {
    if (!formData.destination) return ct('price_dash');
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
    return ct('price_from', { amount: formatNumber(base) });
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
              <span className="hero__eyebrow-dot" />{ct('hero_eyebrow')}
            </span>
            <h1 className="hero__title">
              {ct('hero_title_line1')}<br/><span className="hero__title-em">{ct('hero_title_em')}</span>
            </h1>
            <p className="hero__desc">{ct('hero_desc')}</p>
            <a href="#trip-form" className="hero__cta">
              {ct('hero_cta')}
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
      {promos.length > 0 && (
        <div className="container" style={{ padding: '24px 0 0' }}>
          <PromotionsSection promos={promos} showCards={false} />
        </div>
      )}
      {/* ══ MAIN ══ */}
      <section className="main-section" id="trip-form">
        <div className="container">
          <div className="form-layout">

            {/* ── FORMULAIRE ── */}
            <div className="form-column">
              <form onSubmit={handleSubmit} className="trip-form" noValidate>
                <div className="form-header">
                  <h2>{ct('form_title')}</h2>
                  <p className="form-subtitle">{t('required_fields', { ns: 'common' })}</p>
                </div>

                {/* Logged-in notice */}
                {clientEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#e0fbfc', border: '1px solid #a5f3fc', borderRadius: 12, marginBottom: 20 }}>
                    <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
                    <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                      {ct('prefilled_notice', { email: clientEmail })}
                    </p>
                  </div>
                )}

                {/* CONTACT */}
                <fieldset className="form-section">
                  <legend>{ct('section_contact')}</legend>
                  <div className="form-group">
                    <label htmlFor="fullName">{ct('field_fullname')} <span className="required">*</span></label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName}
                      onChange={handleChange} placeholder={ct('placeholder_fullname')} required autoComplete="name"/>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">
                        {ct('field_email')} <span className="required">*</span>
                        {clientEmail && (
                          <span style={{ marginLeft: 8, fontSize: 10, background: '#e0fbfc', color: '#0e7490', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
                            <i className="fas fa-lock" style={{ marginRight: 3 }} />{ct('locked_email_badge')}
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
                          {ct('locked_email_info')}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">{ct('field_phone')} <span className="required">*</span></label>
                      <input type="tel" id="phone" name="phone" value={formData.phone}
                        onChange={handleChange} placeholder="+216 20 000 000" required autoComplete="tel"/>
                    </div>
                  </div>
                </fieldset>

                {/* VOYAGE */}
                <fieldset className="form-section">
                  <legend>{ct('section_trip')}</legend>
                  <div className="form-group">
                    <label htmlFor="destination">{ct('field_destination')} <span className="required">*</span></label>
                    <input type="text" id="destination" name="destination" value={formData.destination}
                      onChange={handleChange} placeholder={ct('placeholder_destination')} required autoComplete="off"/>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="departureDate">{ct('field_departure_date')} <span className="required">*</span></label>
                      <input type="date" id="departureDate" name="departureDate" value={formData.departureDate} onChange={handleChange} required/>
                    </div>
                    <div className="form-group">
                      <label htmlFor="returnDate">{ct('field_return_date')} <span className="required">*</span></label>
                      <input type="date" id="returnDate" name="returnDate" value={formData.returnDate} onChange={handleChange} required min={formData.departureDate}/>
                      {!isDateValid() && <span className="date-error">{ct('date_error')}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="numberOfPersons">{ct('field_persons')} <span className="required">*</span></label>
                    <input type="number" id="numberOfPersons" name="numberOfPersons" min="1" max="20" value={formData.numberOfPersons} onChange={handleChange} required/>
                  </div>
                </fieldset>

                {/* BUDGET */}
                <fieldset className="form-section">
                  <legend>{ct('section_budget')}</legend>
                  <div className="form-group">
                    <label htmlFor="maxBudget">{ct('field_budget')}</label>
                    <div className="input-with-icon">
                      <span className="input-icon">€</span>
                      <input type="number" id="maxBudget" name="maxBudget" min="0" step="100"
                        placeholder={ct('placeholder_budget')} value={formData.maxBudget} onChange={handleChange} className="with-prefix"/>
                    </div>
                  </div>
                </fieldset>

                {/* OPTIONS */}
                <fieldset className="form-section">
                  <legend>{ct('section_options')}</legend>

                  {/* Hôtel */}
                  <div className="option-group">
                    <label className="switch-label">
                      <input type="checkbox" name="includeHotel" checked={formData.includeHotel} onChange={handleChange}/>
                      <span className="slider"></span>
                      <span className="switch-text">{ct('option_hotel')} <span className="option-badge">{ct('optional_badge')}</span></span>
                    </label>
                    {formData.includeHotel && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>{ct('hotel_category')} <span className="required">*</span></label>
                            <select name="hotelCategory" value={formData.hotelCategory} onChange={handleChange} required>
                              <option value="">{ct('select_placeholder')}</option>
                              <option value="3">{ct('hotel_3')}</option>
                              <option value="4">{ct('hotel_4')}</option>
                              <option value="5">{ct('hotel_5')}</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>{ct('room_type')} <span className="required">*</span></label>
                            <select name="roomType" value={formData.roomType} onChange={handleChange} required>
                              <option value="">{ct('select_placeholder')}</option>
                              <option value="simple">{ct('room_simple')}</option>
                              <option value="double">{ct('room_double')}</option>
                              <option value="familiale">{ct('room_family')}</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>{ct('pension')} <span className="required">*</span></label>
                          <select name="pension" value={formData.pension} onChange={handleChange} required>
                            <option value="">{ct('select_placeholder')}</option>
                            <option value="petit-dejeuner">{ct('pension_breakfast')}</option>
                            <option value="demi-pension">{ct('pension_half')}</option>
                            <option value="all-inclusive">{ct('pension_all')}</option>
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
                      <span className="switch-text">{ct('option_transport')} <span className="option-badge">{ct('optional_badge')}</span></span>
                    </label>
                    {formData.includeTransport && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>{ct('transport_type')} <span className="required">*</span></label>
                            <select name="transportType" value={formData.transportType} onChange={handleChange} required>
                              <option value="">{ct('select_placeholder')}</option>
                              <option value="avion">{ct('transport_plane')}</option>
                              <option value="train">{ct('transport_train')}</option>
                              <option value="bus">{ct('transport_bus')}</option>
                              <option value="voiture">{ct('transport_car')}</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>{ct('departure_city')} <span className="required">*</span></label>
                            <input type="text" name="departureCity" value={formData.departureCity}
                              onChange={handleChange} placeholder={ct('placeholder_departure_city')} required list="cities-list"/>
                            <datalist id="cities-list">
                              {['Tunis','Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Bordeaux','Lille'].map(c => <option key={c} value={c}/>)}
                            </datalist>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>{ct('luggage')} <span className="required">*</span></label>
                          <select name="luggage" value={formData.luggage} onChange={handleChange} required>
                            <option value="">{ct('select_placeholder')}</option>
                            <option value="standard">{ct('luggage_standard')}</option>
                            <option value="extra">{ct('luggage_extra')}</option>
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
                      <span className="switch-text">{ct('option_guide')} <span className="option-badge">{ct('optional_badge')}</span></span>
                    </label>
                    {formData.includeGuide && (
                      <div className="option-fields">
                        <div className="form-row">
                          <div className="form-group">
                            <label>{ct('guide_language')} <span className="required">*</span></label>
                            <select name="guideLanguage" value={formData.guideLanguage} onChange={handleChange} required>
                              <option value="">{ct('select_placeholder')}</option>
                              <option value="francais">{ct('guide_fr')}</option>
                              <option value="anglais">{ct('guide_en')}</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>{ct('guide_duration')} <span className="required">*</span></label>
                            <select name="guideDuration" value={formData.guideDuration} onChange={handleChange} required>
                              <option value="">{ct('select_placeholder')}</option>
                              <option value="1-jour">{ct('guide_1day')}</option>
                              <option value="2-3-jours">{ct('guide_2_3days')}</option>
                              <option value="tout-sejour">{ct('guide_full')}</option>
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
                    ? <><span className="spinner"></span>{ct('submitting')}</>
                    : <>{ct('submit_btn')} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                  }
                </button>

                {showSuccess && (
                  <div className="success-message" role="alert">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <div>
                      <strong>{ct('success_title')}</strong>
                      <p>{ct('success_desc')}</p>
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
                    <h3>{ct('summary_title')}</h3>
                    <span className="live-badge">{ct('summary_live')}</span>
                  </div>
                  <div className="summary-content">
                    {formData.fullName && (
                      <div className="summary-item">
                        <span className="label">{ct('summary_client')}</span>
                        <span className="value">{formData.fullName}</span>
                        {formData.email && <span className="summary-sub">{formData.email}</span>}
                        {formData.phone && <span className="summary-sub">{formData.phone}</span>}
                      </div>
                    )}
                    <div className="summary-item">
                      <span className="label">{ct('summary_destination')}</span>
                      <span className="value">{summaryData.destination}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">{ct('summary_dates')}</span>
                      <span className="value">
                        {summaryData.dates !== ct('summary_dates_not_set')
                          ? <>{summaryData.dates}<small className="nights-badge">{ct('summary_nights', { count: summaryData.nights })}</small></>
                          : summaryData.dates}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="label">{ct('summary_travelers')}</span>
                      <span className="value">{summaryData.persons}</span>
                    </div>
                    {summaryData.budget && (
                      <div className="summary-item">
                        <span className="label">{ct('summary_budget_max')}</span>
                        <span className="value" style={{ color: 'var(--color-primary)' }}>{summaryData.budget}</span>
                      </div>
                    )}
                    {(summaryData.hotel || summaryData.transport || summaryData.guide) && <div className="summary-divider"/>}
                    {summaryData.hotel && (
                      <div className="summary-section">
                        <h4>{ct('summary_hotel')}</h4>
                        <div className="summary-item"><span className="label">{ct('summary_hotel_category')}</span><span className="value">{summaryData.hotel.category}</span></div>
                        <div className="summary-item"><span className="label">{ct('summary_hotel_room')}</span><span className="value">{summaryData.hotel.room}</span></div>
                        <div className="summary-item"><span className="label">{ct('summary_hotel_pension')}</span><span className="value">{summaryData.hotel.pension}</span></div>
                      </div>
                    )}
                    {summaryData.transport && (
                      <div className="summary-section">
                        <h4>{ct('summary_transport')}</h4>
                        <div className="summary-item"><span className="label">{ct('summary_transport_type')}</span><span className="value">{summaryData.transport.type}</span></div>
                        <div className="summary-item"><span className="label">{ct('summary_transport_departure')}</span><span className="value">{summaryData.transport.departure}</span></div>
                        <div className="summary-item"><span className="label">{ct('summary_transport_luggage')}</span><span className="value">{summaryData.transport.luggage}</span></div>
                      </div>
                    )}
                    {summaryData.guide && (
                      <div className="summary-section">
                        <h4>{ct('summary_guide')}</h4>
                        <div className="summary-item"><span className="label">{ct('summary_guide_language')}</span><span className="value">{summaryData.guide.language}</span></div>
                        <div className="summary-item"><span className="label">{ct('summary_guide_duration')}</span><span className="value">{summaryData.guide.duration}</span></div>
                      </div>
                    )}
                    <div className="price-estimation">
                      <div className="price-header">
                        <span className="price-label">{ct('price_estimate')}</span>
                        <span className="price-tag">{ct('price_per_person')}</span>
                      </div>
                      <div className="price-value">{getPriceEstimate()}</div>
                      <div className="price-footer">
                        <span className="price-note">{ct('price_indicative')}</span>
                        <span className="price-disclaimer">{ct('price_availability')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary-tips">
                <h4>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  {ct('tips_title')}
                </h4>
                <ul>
                  <li>{ct('tip_1')}</li>
                  <li>{ct('tip_2')}</li>
                  <li>{ct('tip_3')}</li>
                  <li>{ct('tip_4')}</li>
                </ul>
                <div className="trust-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>{t('data_secure', { ns: 'common' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
     
    </div>
  );
};

export default CustomTripAbroad;
