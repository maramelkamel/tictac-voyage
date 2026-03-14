import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import '../styles/signin.css';

const API = 'http://localhost:5000/api/auth';

const SignIn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused]           = useState('');
  const [errors, setErrors]             = useState({});
  const [isLoading, setIsLoading]       = useState(false);
  const [serverError, setServerError]   = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    return newErrors;
  };

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
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const json = await res.json();

      if (json.success) {
        // Save token and client info
        localStorage.setItem('token',  json.token);
        localStorage.setItem('client', JSON.stringify(json.client));
        navigate('/');   // redirect home after login
      } else {
        setServerError(json.message || 'Email ou mot de passe incorrect');
      }
    } catch {
      setServerError('Impossible de contacter le serveur. Vérifiez votre connexion.');
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

          {/* ── Left Panel ── */}
          <div className="auth-panel auth-panel--left">
            <div className="auth-panel-content">
              <button type="button" className="auth-logo" onClick={() => navigate('/')}>
                <span className="auth-logo-name">TICTAC VOYAGES</span>
                <span className="auth-logo-sub">Agence de Voyage</span>
              </button>
              <div className="auth-panel-headline">
                <h1>Bon retour<br /><em>parmi nous</em></h1>
                <p>Connectez-vous pour accéder à vos réservations, vos offres personnalisées et votre espace membre.</p>
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
                  <span className="signin-stat-label">Ans d'expérience</span>
                </div>
              </div>
              <div className="auth-panel-deco">
                <i className="fas fa-compass" />
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
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
                    Créer un compte <i className="fas fa-arrow-right" />
                  </button>
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-exclamation-circle" />
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="auth-form">

                {/* Email */}
                <div className={`auth-field ${focused === 'email' ? 'auth-field--focused' : ''} ${errors.email ? 'auth-field--error' : ''}`}>
                  <label htmlFor="email">Adresse e-mail</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-envelope auth-input-icon" />
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                      placeholder="votre@email.com" autoComplete="email"/>
                  </div>
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                {/* Password */}
                <div className={`auth-field ${focused === 'password' ? 'auth-field--focused' : ''} ${errors.password ? 'auth-field--error' : ''}`}>
                  <div className="auth-field-header">
                    <label htmlFor="password">Mot de passe</label>
                    <button type="button" className="auth-link-btn auth-forgot" onClick={() => navigate('/pages/ForgotPassword')}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="auth-input-wrap">
                    <i className="fas fa-lock auth-input-icon" />
                    <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                      placeholder="Votre mot de passe" autoComplete="current-password"/>
                    <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                {/* Remember me */}
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

              <div className="auth-divider"><span>ou continuez avec</span></div>
              <div className="auth-social">
                <button type="button" className="auth-social-btn"><i className="fab fa-google" /> Google</button>
                <button type="button" className="auth-social-btn"><i className="fab fa-facebook-f" /> Facebook</button>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Chatbot />
      <Footer />
    </>
  );
};

export default SignIn;