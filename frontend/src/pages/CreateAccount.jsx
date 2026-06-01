import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/createaccount.css';

// This base URL keeps the registration flow aligned with the frontend environment.
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

// This page collects the client registration form and creates the account.
const CreateAccount = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused]   = useState('');
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // This handler updates the form state and clears local validation/server errors.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  // This validator checks the required registration fields before calling the API.
  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = t('validation.first_name_required');
    if (!formData.lastName.trim())  newErrors.lastName  = t('validation.last_name_required');
    if (!formData.email.trim())     newErrors.email     = t('validation.email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('validation.email_invalid');
    if (!formData.phone.trim())     newErrors.phone     = t('validation.phone_required');
    if (!formData.password)         newErrors.password  = t('validation.password_required');
    else if (formData.password.length < 8) newErrors.password = t('validation.password_min');
    if (!formData.confirmPassword)  newErrors.confirmPassword = t('validation.confirm_required');
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t('validation.password_mismatch');
    if (!formData.agreeTerms) newErrors.agreeTerms = t('validation.terms_required');
    return newErrors;
  };

  // This submit handler creates the client account and stores the returned session.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch(`${API}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:         formData.firstName.trim(),
          last_name:          formData.lastName.trim(),
          email:              formData.email,
          phone:              formData.phone,
          password:           formData.password,
          city:               formData.city.trim() || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        localStorage.setItem('token',  json.token);
        localStorage.setItem('client', JSON.stringify(json.client));
        setSubmitted(true);
      } else {
        setServerError(json.message || t('signup.server_error'));
      }
    } catch {
      setServerError(t('signup.network_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // This helper gives quick UI feedback about the password strength.
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthLabels = ['', t('signup.strength_weak'), t('signup.strength_medium'), t('signup.strength_good'), t('signup.strength_excellent')];
  const strengthColors = ['', '#ef4444', '#f97316', '#22c55e', '#0f4c5c'];
  const strength = getPasswordStrength();

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="auth-page">
          <div className="auth-bg-shapes">
            <div className="auth-shape auth-shape-1" />
            <div className="auth-shape auth-shape-2" />
            <div className="auth-shape auth-shape-3" />
          </div>
          <div className="auth-success-card">
            <div className="auth-success-icon">
              <i className="fas fa-check-circle" />
            </div>
            <h2>{t('signup.success_title')}</h2>
            <p>{t('signup.success_desc')}</p>
            <button
              type="button"
              className="auth-btn auth-btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => navigate('/SignIn')}
            >
              <i className="fas fa-sign-in-alt" /> {t('signup.signin')}
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-bg-shapes">
          <div className="auth-shape auth-shape-1" />
          <div className="auth-shape auth-shape-2" />
          <div className="auth-shape auth-shape-3" />
        </div>

        <div className="auth-container auth-container--wide">

          {/* ── Left Panel ── */}
          <div className="auth-panel auth-panel--left">
            <div className="auth-panel-content">
              <button type="button" className="auth-logo" onClick={() => navigate('/')}>
                <span className="auth-logo-name">TICTAC VOYAGES</span>
                <span className="auth-logo-sub">{t('brand_subtitle')}</span>
              </button>
              <div className="auth-panel-headline">
                <h1>{t('signup.headline')}<br /><em>{t('signup.headline_em')}</em></h1>
                <p>{t('signup.subtitle')}</p>
              </div>
              <ul className="auth-benefits">
                <li><i className="fas fa-check-circle" /><span>{t('signup.benefit_offers')}</span></li>
                <li><i className="fas fa-check-circle" /><span>{t('signup.benefit_bookings')}</span></li>
                <li><i className="fas fa-check-circle" /><span>{t('signup.benefit_support')}</span></li>
                <li><i className="fas fa-check-circle" /><span>{t('signup.benefit_loyalty')}</span></li>
              </ul>
              <div className="auth-panel-deco">
                <i className="fas fa-plane-departure" />
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="auth-panel auth-panel--right">
            <div className="auth-form-wrapper">

              <div className="auth-form-header">
                <h2>{t('signup.title')}</h2>
                <p>
                  {t('signup.already_client')}{' '}
                  <button type="button" className="auth-link-btn" onClick={() => navigate('/SignIn')}>
                    {t('signup.signin')} <i className="fas fa-arrow-right" />
                  </button>
                </p>
              </div>

              {serverError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-exclamation-circle" />
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="auth-form">

                {/* Prénom / Nom */}
                <div className="auth-row">
                  <div className={`auth-field ${focused === 'firstName' ? 'auth-field--focused' : ''} ${errors.firstName ? 'auth-field--error' : ''}`}>
                    <label htmlFor="firstName">{t('signup.first_name')}</label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-user auth-input-icon" />
                      <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        onFocus={() => setFocused('firstName')} onBlur={() => setFocused('')} placeholder={t('signup.first_name_placeholder')} autoComplete="given-name" />
                    </div>
                    {errors.firstName && <span className="auth-error">{errors.firstName}</span>}
                  </div>
                  <div className={`auth-field ${focused === 'lastName' ? 'auth-field--focused' : ''} ${errors.lastName ? 'auth-field--error' : ''}`}>
                    <label htmlFor="lastName">{t('signup.last_name')}</label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-user auth-input-icon" />
                      <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        onFocus={() => setFocused('lastName')} onBlur={() => setFocused('')} placeholder={t('signup.last_name_placeholder')} autoComplete="family-name" />
                    </div>
                    {errors.lastName && <span className="auth-error">{errors.lastName}</span>}
                  </div>
                </div>

                {/* Email */}
                <div className={`auth-field ${focused === 'email' ? 'auth-field--focused' : ''} ${errors.email ? 'auth-field--error' : ''}`}>
                  <label htmlFor="email">{t('email')}</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-envelope auth-input-icon" />
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder={t('email_placeholder')} autoComplete="email" />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                {/* Téléphone */}
                <div className={`auth-field ${focused === 'phone' ? 'auth-field--focused' : ''} ${errors.phone ? 'auth-field--error' : ''}`}>
                  <label htmlFor="phone">{t('signup.phone')}</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-phone auth-input-icon" />
                    <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} placeholder={t('signup.phone_placeholder')} autoComplete="tel" />
                  </div>
                  {errors.phone && <span className="auth-error">{errors.phone}</span>}
                </div>

                {/* Ville */}
                <div className={`auth-field ${focused === 'city' ? 'auth-field--focused' : ''}`}>
                  <label htmlFor="city">{t('signup.city')} <span className="auth-optional-tag">{t('optional')}</span></label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-map-marker-alt auth-input-icon" />
                    <input id="city" type="text" name="city" value={formData.city} onChange={handleChange}
                      onFocus={() => setFocused('city')} onBlur={() => setFocused('')} placeholder={t('signup.city_placeholder')} autoComplete="address-level2" />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className={`auth-field ${focused === 'password' ? 'auth-field--focused' : ''} ${errors.password ? 'auth-field--error' : ''}`}>
                  <label htmlFor="password">{t('password')}</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-lock auth-input-icon" />
                    <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder={t('password_min_placeholder')} autoComplete="new-password" />
                    <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword((p) => !p)}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {formData.password && (
                    <div className="auth-strength">
                      <div className="auth-strength-bars">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="auth-strength-bar"
                            style={{ background: i <= strength ? strengthColors[strength] : '#e5e7eb' }} />
                        ))}
                      </div>
                      <span style={{ color: strengthColors[strength], fontSize: '12px', fontWeight: 600 }}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                {/* Confirmer mot de passe */}
                <div className={`auth-field ${focused === 'confirmPassword' ? 'auth-field--focused' : ''} ${errors.confirmPassword ? 'auth-field--error' : ''}`}>
                  <label htmlFor="confirmPassword">{t('confirm_password')}</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-lock auth-input-icon" />
                    <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused('')} placeholder={t('confirm_password_placeholder')} autoComplete="new-password" />
                    <button type="button" className="auth-toggle-pw" onClick={() => setShowConfirmPassword((p) => !p)}>
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
                </div>

                {/* Terms */}
                <div className={`auth-checkbox-field ${errors.agreeTerms ? 'auth-field--error' : ''}`}>
                  <label className="auth-checkbox-label">
                    <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
                    <span className="auth-checkmark" />
                    <span>
                      {t('signup.terms_prefix')}{' '}
                      <button type="button" className="auth-link-btn" onClick={() => navigate('/terms')}>{t('signup.terms')}</button>
                      {' '}{t('signup.privacy_prefix')}{' '}
                      <button type="button" className="auth-link-btn" onClick={() => navigate('/privacy')}>{t('signup.privacy')}</button>
                    </span>
                  </label>
                  {errors.agreeTerms && <span className="auth-error" style={{ marginLeft: '28px' }}>{errors.agreeTerms}</span>}
                </div>

                <button type="submit" className={`auth-btn auth-btn-primary ${isLoading ? 'auth-btn--loading' : ''}`} disabled={isLoading}>
                  {isLoading ? (
                    <><span className="auth-spinner" /> {t('signup.loading')}</>
                  ) : (
                    <><i className="fas fa-user-plus" /> {t('signup.submit')}</>
                  )}
                </button>
              </form>

              {/* Séparateur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{t('continue_with')}</span>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              </div>

              {/* Bouton Google */}
              <button
                type="button"
                onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`; }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '11px 16px', borderRadius: 10,
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  fontSize: 14, fontWeight: 600, color: '#374151',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {t('continue_google')}
              </button>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CreateAccount;
