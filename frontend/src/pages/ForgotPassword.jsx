import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' -> 'verify' -> 'done'
  const [loading, setLoading] = useState(false);

  // Step 1: send email to get the code
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep('verify'); // move to code verification step
      } else {
        alert('Erreur lors de l’envoi de l’email');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
    setLoading(false);
  };

  // Step 2: verify the code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        navigate(`/ResetPassword?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
      } else {
        alert('Code invalide ou expiré');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        {step === 'email' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F4C5C', marginBottom: 8 }}>🔐 Mot de passe oublié</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Entrez votre email pour recevoir un code de réinitialisation.</p>
            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} required />
              <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Envoi...' : 'Envoyer le code →'}
              </button>
            </form>
            <button onClick={() => navigate('/SignIn')} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Retour
            </button>
          </>
        )}

        {step === 'verify' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F4C5C', marginBottom: 8 }}>📧 Vérification du code</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Entrez le code reçu par email pour réinitialiser votre mot de passe.</p>
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" placeholder="Code reçu" value={code} onChange={e => setCode(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} required />
              <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Vérification...' : 'Vérifier le code →'}
              </button>
            </form>
            <button onClick={() => setStep('email')} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;