import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import '../styles/createaccount.css';

const CreateAccount = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 8) newErrors.password = 'Au moins 8 caractères';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Veuillez confirmer';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!formData.agreeTerms) newErrors.agreeTerms = "Vous devez accepter les conditions";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
  };

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

  // ── Success Screen ────────────────────────────────────────
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
            <p>
              Bienvenue chez Tictac Voyages. Votre compte a été créé.
              Vous pouvez maintenant vous connecter.
            </p>
            <button
              type="button"
              className="auth-btn auth-btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => navigate('/SignIn')}
            >
              <i className="fas fa-sign-in-alt" />
              Se connecter
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Main Form ─────────────────────────────────────────────
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

              <button
                type="button"
                className="auth-logo"
                onClick={() => navigate('/')}
              >
                <span className="auth-logo-name">TICTAC VOYAGES</span>
                <span className="auth-logo-sub">Agence de Voyage</span>
              </button>

              <div className="auth-panel-headline">
                <h1>
                  Rejoignez notre<br />
                  <em>univers de voyage</em>
                </h1>
                <p>
                  Créez votre compte et accédez à des offres exclusives,
                  gérez vos réservations et bien plus encore.
                </p>
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
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => navigate('/SignIn')}
                  >
                    Se connecter <i className="fas fa-arrow-right" />
                  </button>
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="auth-form">

                {/* Name row */}
                <div className="auth-row">
                  <div className={`auth-field ${focused === 'firstName' ? 'auth-field--focused' : ''} ${errors.firstName ? 'auth-field--error' : ''}`}>
                    <label htmlFor="firstName">Prénom</label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-user auth-input-icon" />
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={() => setFocused('firstName')}
                        onBlur={() => setFocused('')}
                        placeholder="Votre prénom"
                        autoComplete="given-name"
                      />
                    </div>
                    {errors.firstName && <span className="auth-error">{errors.firstName}</span>}
                  </div>

                  <div className={`auth-field ${focused === 'lastName' ? 'auth-field--focused' : ''} ${errors.lastName ? 'auth-field--error' : ''}`}>
                    <label htmlFor="lastName">Nom</label>
                    <div className="auth-input-wrap">
                      <i className="fas fa-user auth-input-icon" />
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={() => setFocused('lastName')}
                        onBlur={() => setFocused('')}
                        placeholder="Votre nom"
                        autoComplete="family-name"
                      />
                    </div>
                    {errors.lastName && <span className="auth-error">{errors.lastName}</span>}
                  </div>
                </div>

                {/* Email */}
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

                {/* Phone */}
                <div className={`auth-field ${focused === 'phone' ? 'auth-field--focused' : ''} ${errors.phone ? 'auth-field--error' : ''}`}>
                  <label htmlFor="phone">Numéro de téléphone</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-phone auth-input-icon" />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocused('phone')}
                      onBlur={() => setFocused('')}
                      placeholder="+216 XX XXX XXX"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <span className="auth-error">{errors.phone}</span>}
                </div>

                {/* Password */}
                <div className={`auth-field ${focused === 'password' ? 'auth-field--focused' : ''} ${errors.password ? 'auth-field--error' : ''}`}>
                  <label htmlFor="password">Mot de passe</label>
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
                      placeholder="Minimum 8 caractères"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-toggle-pw"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {formData.password && (
                    <div className="auth-strength">
                      <div className="auth-strength-bars">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="auth-strength-bar"
                            style={{ background: i <= strength ? strengthColors[strength] : '#e5e7eb' }}
                          />
                        ))}
                      </div>
                      <span style={{ color: strengthColors[strength], fontSize: '12px', fontWeight: 600 }}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div className={`auth-field ${focused === 'confirmPassword' ? 'auth-field--focused' : ''} ${errors.confirmPassword ? 'auth-field--error' : ''}`}>
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div className="auth-input-wrap">
                    <i className="fas fa-lock auth-input-icon" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocused('confirmPassword')}
                      onBlur={() => setFocused('')}
                      placeholder="Répétez votre mot de passe"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-toggle-pw"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
                </div>

                {/* Terms */}
                <div className={`auth-checkbox-field ${errors.agreeTerms ? 'auth-field--error' : ''}`}>
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                    />
                    <span className="auth-checkmark" />
                    <span>
                      J'accepte les{' '}
                      <button type="button" className="auth-link-btn">conditions d'utilisation</button>
                      {' '}et la{' '}
                      <button type="button" className="auth-link-btn">politique de confidentialité</button>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <span className="auth-error" style={{ marginLeft: '28px' }}>{errors.agreeTerms}</span>
                  )}
                </div>

                <button type="submit" className="auth-btn auth-btn-primary">
                  <i className="fas fa-user-plus" />
                  Créer mon compte
                </button>
              </form>

              <div className="auth-divider">
                <span>ou continuez avec</span>
              </div>

              <div className="auth-social">
                <button type="button" className="auth-social-btn">
                  <i className="fab fa-google" />
                  Google
                </button>
                <button type="button" className="auth-social-btn">
                  <i className="fab fa-facebook-f" />
                  Facebook
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* CHATBOT */}
      <Chatbot />
      <Footer />
    </>
  );
};

export default CreateAccount;