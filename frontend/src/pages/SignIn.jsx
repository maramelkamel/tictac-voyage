import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import '../styles/signin.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existingScript = document.querySelector('script[data-google-identity="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });

const SignIn = () => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

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
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const persistSession = (payload) => {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('client', JSON.stringify(payload.client));
    navigate('/hotels');
  };

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

  const handleGoogleCredential = useEffectEvent(async (credential) => {
    if (!credential) {
      setServerError('La connexion Google a echoue. Veuillez reessayer.');
      return;
    }

    setIsGoogleLoading(true);
    setServerError('');

    try {
      const res = await fetch(`${API}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const json = await res.json();

      if (json.success) {
        persistSession(json);
      } else {
        setServerError(json.message || 'Impossible de finaliser la connexion Google.');
      }
    } catch {
      setServerError('Impossible de contacter le serveur. Verifiez votre connexion.');
    } finally {
      setIsGoogleLoading(false);
    }
  });

  useEffect(() => {
    let active = true;

    const fetchGoogleConfig = async () => {
      try {
        const res = await fetch(`${API}/google/client-id`);
        const json = await res.json();

        if (!active) {
          return;
        }

        if (res.ok && json.success && json.clientId) {
          setGoogleClientId(json.clientId);
          setGoogleError('');
          return;
        }

        setGoogleError(json.message || 'Connexion Google indisponible pour le moment.');
      } catch {
        if (active) {
          setGoogleError('Connexion Google indisponible pour le moment.');
        }
      }
    };

    fetchGoogleConfig();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const mountGoogleButton = async () => {
      if (!googleClientId || !googleButtonRef.current) {
        return;
      }

      try {
        await loadGoogleScript();

        if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            handleGoogleCredential(credential);
          },
          ux_mode: 'popup',
          context: 'signin',
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: 'fr',
          width: 360,
        });

        setIsGoogleReady(true);
      } catch {
        if (!cancelled) {
          setGoogleError('Connexion Google indisponible pour le moment.');
          setIsGoogleReady(false);
        }
      }
    };

    mountGoogleButton();

    return () => {
      cancelled = true;

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
    };
  }, [googleClientId]);

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

                <button type="submit" className={`auth-btn auth-btn-primary ${isLoading ? 'auth-btn--loading' : ''}`} disabled={isLoading || isGoogleLoading}>
                  {isLoading ? (
                    <><span className="auth-spinner" /> Connexion en cours...</>
                  ) : (
                    <><i className="fas fa-sign-in-alt" /> Se connecter</>
                  )}
                </button>
              </form>

              <div className="auth-divider"><span>ou continuez avec</span></div>
              <div className="auth-social auth-social--single">
                {googleClientId ? (
                  <div className={`auth-google-slot ${isGoogleLoading ? 'auth-google-slot--busy' : ''}`}>
                    <div ref={googleButtonRef} className="auth-google-button" />
                    {!isGoogleReady && <span className="auth-social-help">Chargement de Google...</span>}
                  </div>
                ) : (
                  <button type="button" className="auth-social-btn" disabled>
                    <i className="fab fa-google" /> Google
                  </button>
                )}
              </div>
              {googleError && <span className="auth-social-help auth-social-help--error">{googleError}</span>}
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
