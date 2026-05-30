import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// This base URL keeps the password recovery flow aligned with the frontend environment.
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

// This page sends the reset code and verifies it before the new password step.
const ForgotPassword = () => {
  const navigate          = useNavigate();
  const [email,   setEmail]   = useState('');
  const [code,    setCode]    = useState('');
  const [step,    setStep]    = useState('email'); // 'email' | 'verify'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // This handler requests the reset code for the provided email address.
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${API}/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setStep('verify');
      } else {
        setError(json.message || 'Erreur lors de l\'envoi');
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    }
    setLoading(false);
  };

  // This handler validates the 6-digit code before opening the reset page.
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) { setError('Le code doit contenir 6 chiffres'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/verify-reset-code`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, code }),
      });
      const json = await res.json();
      if (json.success) {
        navigate(`/ResetPassword?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
      } else {
        setError(json.message || 'Code invalide ou expiré');
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    }
    setLoading(false);
  };







  
  // These shared styles keep both recovery steps visually consistent.
  const inputStyle = {
    padding: '13px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%',
    boxSizing: 'border-box', transition: 'border-color .2s',
  };

  const btnStyle = {
    padding: '13px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)',
    color: '#fff', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', width: '100%',
    opacity: loading ? 0.7 : 1,
  };

  const ghostBtn = {
    marginTop: 12, width: '100%', padding: '11px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', background: '#fff',
    color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <span style={{ fontSize: 26 }}>{step === 'email' ? '🔐' : '📧'}</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F4C5C', margin: '0 0 6px' }}>
            {step === 'email' ? 'Mot de passe oublié' : 'Vérification du code'}
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            {step === 'email'
              ? 'Entrez votre email pour recevoir un code à 6 chiffres.'
              : `Un code a été envoyé à ${email}. Entrez-le ci-dessous.`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '11px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, color: '#991b1b', fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 1: email ── */}
        {step === 'email' && (
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Adresse email
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0F4C5C'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? '⏳ Envoi en cours...' : 'Envoyer le code →'}
            </button>
            <button type="button" onClick={() => navigate('/SignIn')} style={ghostBtn}>
              ← Retour à la connexion
            </button>
          </form>
        )}

        {/* ── Step 2: verify code ── */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Code à 6 chiffres
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex : 482915"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ ...inputStyle, fontSize: 24, fontWeight: 800, letterSpacing: 8, textAlign: 'center', color: '#0F4C5C' }}
                onFocus={e => e.target.style.borderColor = '#0F4C5C'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>⏱ Ce code expire dans 30 minutes.</p>
            </div>
            <button type="submit" disabled={loading || code.length !== 6} style={{ ...btnStyle, opacity: (loading || code.length !== 6) ? 0.6 : 1 }}>
              {loading ? '⏳ Vérification...' : 'Vérifier le code →'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }} style={ghostBtn}>
              ← Renvoyer un nouveau code
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
