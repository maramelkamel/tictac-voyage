import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/signin.css';

// This base URL keeps the sign-in flow aligned with the frontend environment.
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

// This page handles client sign-in and stores the authenticated session locally.
const SignIn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // This helper saves the authenticated client session and redirects to the hotel catalog.
  const persistSession = (payload) => {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('client', JSON.stringify(payload.client));
    navigate('/hotels');
  };

  // This handler keeps the form state, field errors, and server errors in sync while typing.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (serverError) {
      setServerError('');
    }
  };

  // This validator blocks empty or malformed credentials before the API request is sent.
  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    }

    return newErrors;
  };

  // This submit handler authenticates the client and shows backend errors when login fails.
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
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const json = await res.json();

      if (json.success) {
        persistSession(json);
      } else {
        setServerError(json.message || 'Email ou mot de passe incorrect');
      }
    } catch {
      setServerError('Impossible de contacter le serveur. Verifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page signin-page">
        <div className="auth-bg-shapes">
          <div className="auth-shape auth-shape-1" />
          <div className="auth-shape auth-shape-2" />
          <div className="auth-shape auth-shape-3" />
        </div>

        <div className="auth-container auth-container--centered">
          <div className="auth-panel auth-panel--left">
            <div className="auth-panel-content">
              <button type="button" className="auth-logo" onClick={() => navigate('/hotels')}>
                <span className="auth-logo-name">TICTAC VOYAGES</span>
                <span className="auth-logo-sub">Agence de Voyage</span>
              </button>
              <div className="auth-panel-headline">
                <h1>Bon retour<br /><em>parmi nous</em></h1>
                <p>Connectez-vous pour acceder a vos reservations, vos offres personnalisees et votre espace membre.</p>
              </div>
              <div className="signin-stats">
                <div className="signin-stat">
                  <span className="signin-stat-number">10K+</span>
                  <span className="signin-stat-label">Clients satisfaits</span>
                </div>
                <div className="signin-stat-divider" />
                <div className="signin-stat">
                  <span className="signin-stat-number">50+</span>
                  <span className="signin-stat-label">Destinations</span>
                </div>
                <div className="signin-stat-divider" />
                <div className="signin-stat">
                  <span className="signin-stat-number">15</span>
                  <span className="signin-stat-label">Ans d'experience</span>
                </div>
              </div>
              <div className="auth-panel-deco">
                <i className="fas fa-compass" />
              </div>
            </div>
          </div>

          <div className="auth-panel auth-panel--right">
            <div className="auth-form-wrapper">
              <div className="auth-form-header">
                <div className="signin-welcome-icon">
                  <i className="fas fa-user-circle" />
                </div>
                <h2>Se connecter</h2>
                <p>
                  Pas encore de compte ?{' '}
                  <button type="button" className="auth-link-btn" onClick={() => navigate('/CreateAccount')}>
                    Creer un compte <i className="fas fa-arrow-right" />
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
                <div className={`auth-field ${focused === 'email' ? 'auth-field--focused' : ''} ${errors.email ? 'auth-field--error' : ''}`}>
                  <label htmlFor="email">Adresse e-mail</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-envelope auth-input-icon" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                      placeholder="votre@email.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                <div className={`auth-field ${focused === 'password' ? 'auth-field--focused' : ''} ${errors.password ? 'auth-field--error' : ''}`}>
                  <div className="auth-field-header">
                    <label htmlFor="password">Mot de passe</label>
                    <button type="button" className="auth-link-btn auth-forgot" onClick={() => navigate('/ForgotPassword')}>
                      Mot de passe oublie ?
                    </button>
                  </div>
                  <div className="auth-input-wrap">
                    <i className="fas fa-lock auth-input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused('')}
                      placeholder="Votre mot de passe"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-toggle-pw"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                <div className="auth-checkbox-field">
                  <label className="auth-checkbox-label">
                    <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                    <span className="auth-checkmark" />
                    <span>Se souvenir de moi</span>
                  </label>
                </div>

                <button type="submit" className={`auth-btn auth-btn-primary ${isLoading ? 'auth-btn--loading' : ''}`} disabled={isLoading}>
                  {isLoading ? (
                    <><span className="auth-spinner" /> Connexion en cours...</>
                  ) : (
                    <><i className="fas fa-sign-in-alt" /> Se connecter</>
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

export default SignIn;
