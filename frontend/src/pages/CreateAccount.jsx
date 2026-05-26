import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/createaccount.css';

// This base URL keeps the registration flow aligned with the frontend environment.
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

// This page collects the client registration form and creates the account.
const CreateAccount = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    maritalStatus: '',
    numberOfChildren: '',
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
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim())  newErrors.lastName  = 'Nom requis';
    if (!formData.email.trim())     newErrors.email     = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.phone.trim())     newErrors.phone     = 'Téléphone requis';
    if (!formData.password)         newErrors.password  = 'Mot de passe requis';
    else if (formData.password.length < 8) newErrors.password = 'Au moins 8 caractères';
    if (!formData.confirmPassword)  newErrors.confirmPassword = 'Veuillez confirmer';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Vous devez accepter les conditions';
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
          marital_status:     formData.maritalStatus || null,
          number_of_children: formData.numberOfChildren === '' ? 0 : Number(formData.numberOfChildren),
          city:               formData.city.trim() || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        localStorage.setItem('token',  json.token);
        localStorage.setItem('client', JSON.stringify(json.client));
        setSubmitted(true);
      } else {
        setServerError(json.message || 'Erreur lors de la création du compte');
      }
    } catch {
      setServerError('Impossible de contacter le serveur. Vérifiez votre connexion.');
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

  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];
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
            <h2>Compte créé avec succès !</h2>
            <p>Bienvenue chez Tictac Voyages. Vous pouvez maintenant vous connecter.</p>
            <button
              type="button"
              className="auth-btn auth-btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => navigate('/SignIn')}
            >
              <i className="fas fa-sign-in-alt" /> Se connecter
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
                <span className="auth-logo-sub">Agence de Voyage</span>
              </button>
              <div className="auth-panel-headline">
                <h1>Rejoignez notre<br /><em>univers de voyage</em></h1>
                <p>Créez votre compte et accédez à des offres exclusives, gérez vos réservations et bien plus encore.</p>
              </div>
              <ul className="auth-benefits">
                <li><i className="fas fa-check-circle" /><span>Offres exclusives membres</span></li>
                <li><i className="fas fa-check-circle" /><span>Gestion de réservations en ligne</span></li>
                <li><i className="fas fa-check-circle" /><span>Support dédié 7j/7</span></li>
                <li><i className="fas fa-check-circle" /><span>Programme de fidélité</span></li>
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
                <h2>Créer un compte</h2>
                <p>
                  Déjà client ?{' '}
                  <button type="button" className="auth-link-btn" onClick={() => navigate('/SignIn')}>
                    Se connecter <i className="fas fa-arrow-right" />
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
                    <label htmlFor="firstName">Prénom</label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-user auth-input-icon" />
                      <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        onFocus={() => setFocused('firstName')} onBlur={() => setFocused('')} placeholder="Votre prénom" autoComplete="given-name" />
                    </div>
                    {errors.firstName && <span className="auth-error">{errors.firstName}</span>}
                  </div>
                  <div className={`auth-field ${focused === 'lastName' ? 'auth-field--focused' : ''} ${errors.lastName ? 'auth-field--error' : ''}`}>
                    <label htmlFor="lastName">Nom</label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-user auth-input-icon" />
                      <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        onFocus={() => setFocused('lastName')} onBlur={() => setFocused('')} placeholder="Votre nom" autoComplete="family-name" />
                    </div>
                    {errors.lastName && <span className="auth-error">{errors.lastName}</span>}
                  </div>
                </div>

                {/* Email */}
                <div className={`auth-field ${focused === 'email' ? 'auth-field--focused' : ''} ${errors.email ? 'auth-field--error' : ''}`}>
                  <label htmlFor="email">Adresse e-mail</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-envelope auth-input-icon" />
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder="votre@email.com" autoComplete="email" />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                {/* Téléphone */}
                <div className={`auth-field ${focused === 'phone' ? 'auth-field--focused' : ''} ${errors.phone ? 'auth-field--error' : ''}`}>
                  <label htmlFor="phone">Numéro de téléphone</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-phone auth-input-icon" />
                    <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} placeholder="+216 XX XXX XXX" autoComplete="tel" />
                  </div>
                  {errors.phone && <span className="auth-error">{errors.phone}</span>}
                </div>

                {/* Situation matrimoniale */}
                <div className={`auth-field ${focused === 'maritalStatus' ? 'auth-field--focused' : ''}`}>
                  <label htmlFor="maritalStatus">Situation matrimoniale <span className="auth-optional-tag">Optionnel</span></label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-heart auth-input-icon" />
                    <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
                      onFocus={() => setFocused('maritalStatus')} onBlur={() => setFocused('')} className="auth-select">
                      <option value="">Sélectionnez...</option>
                      <option value="celibataire">Célibataire</option>
                      <option value="marie">Marié(e)</option>
                      <option value="divorce">Divorcé(e)</option>
                      <option value="veuf">Veuf / Veuve</option>
                    </select>
                    <i className="fas fa-chevron-down auth-select-arrow" />
                  </div>
                </div>

                {/* Nombre d'enfants / Ville */}
                <div className="auth-row">
                  <div className={`auth-field ${focused === 'numberOfChildren' ? 'auth-field--focused' : ''}`}>
                    <label htmlFor="numberOfChildren">Nombre d'enfants <span className="auth-optional-tag">Optionnel</span></label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-child auth-input-icon" />
                      <input id="numberOfChildren" type="number" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange}
                        onFocus={() => setFocused('numberOfChildren')} onBlur={() => setFocused('')} placeholder="0" min="0" max="20" />
                    </div>
                  </div>
                  <div className={`auth-field ${focused === 'city' ? 'auth-field--focused' : ''}`}>
                    <label htmlFor="city">Ville de résidence <span className="auth-optional-tag">Optionnel</span></label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-map-marker-alt auth-input-icon" />
                      <input id="city" type="text" name="city" value={formData.city} onChange={handleChange}
                        onFocus={() => setFocused('city')} onBlur={() => setFocused('')} placeholder="Ex: Tunis, Sousse..." autoComplete="address-level2" />
                    </div>
                  </div>
                </div>

                {/* Mot de passe */}
                <div className={`auth-field ${focused === 'password' ? 'auth-field--focused' : ''} ${errors.password ? 'auth-field--error' : ''}`}>
                  <label htmlFor="password">Mot de passe</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-lock auth-input-icon" />
                    <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder="Minimum 8 caractères" autoComplete="new-password" />
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
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-lock auth-input-icon" />
                    <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused('')} placeholder="Répétez votre mot de passe" autoComplete="new-password" />
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
                      J'accepte les{' '}
                      <button type="button" className="auth-link-btn" onClick={() => navigate('/terms')}>conditions d'utilisation</button>
                      {' '}et la{' '}
                      <button type="button" className="auth-link-btn" onClick={() => navigate('/privacy')}>politique de confidentialité</button>
                    </span>
                  </label>
                  {errors.agreeTerms && <span className="auth-error" style={{ marginLeft: '28px' }}>{errors.agreeTerms}</span>}
                </div>

                <button type="submit" className={`auth-btn auth-btn-primary ${isLoading ? 'auth-btn--loading' : ''}`} disabled={isLoading}>
                  {isLoading ? (
                    <><span className="auth-spinner" /> Création en cours...</>
                  ) : (
                    <><i className="fas fa-user-plus" /> Créer mon compte</>
                  )}
                </button>
              </form>

              {/* Séparateur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>ou continuer avec</span>
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
                Continuer avec Google
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
