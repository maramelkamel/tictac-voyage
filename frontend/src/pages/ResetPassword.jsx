import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// This base URL keeps the password reset flow aligned with the frontend environment.
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

// This page submits the new password after the email and reset code are validated.
const ResetPassword = () => {
  const { t }                     = useTranslation('auth');
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const email                       = searchParams.get('email') || '';
  const code                        = searchParams.get('code')  || '';

  const [password,  setPassword]    = useState('');
  const [confirm,   setConfirm]     = useState('');
  const [showPw,    setShowPw]      = useState(false);
  const [loading,   setLoading]     = useState(false);
  const [message,   setMessage]     = useState('');
  const [success,   setSuccess]     = useState(false);

  // This effect protects the page when the reset link is missing its required parameters.
  useEffect(() => {
    if (!email || !code) {
      navigate('/ForgotPassword', { replace: true });
    }
  }, [code, email, navigate]);

  if (!email || !code) {
    return null;
  }

  // This submit handler validates the new password and completes the reset request.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password.length < 8) { setMessage(t('reset.password_min')); return; }
    if (password !== confirm)  { setMessage(t('validation.password_mismatch')); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, code, password }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setMessage(json.message);
        setTimeout(() => navigate('/SignIn'), 3000);
      } else {
        setMessage(json.message || t('reset.server_error'));
      }
    } catch {
      setMessage(t('reset.network_error'));
    }
    setLoading(false);
  };







  
  // These shared input styles keep the reset form fields consistent.
  const inputStyle = {
    width: '100%', padding: '13px 44px 13px 16px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
              {t('reset.success_title')}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
              {t('reset.success_desc')}<br/>
              {t('reset.redirect')}
            </p>
            <div style={{ width: 40, height: 4, background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', borderRadius: 999, margin: '0 auto', animation: 'grow 3s linear' }}/>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <span style={{ fontSize: 26 }}>🔑</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F4C5C', margin: '0 0 6px' }}>
                {t('reset.title')}
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                {t('reset.subtitle')}
              </p>
            </div>

            {message && !success && (
              <div style={{ padding: '11px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, color: '#991b1b', fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
                ⚠️ {message}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Password */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {t('reset.title')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0F4C5C'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength indicator */}
                {password && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: password.length >= i * 2 ? (password.length >= 8 ? '#10b981' : '#f97316') : '#e2e8f0', transition: 'background .3s' }}/>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {t('confirm_password')}
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  style={{ ...inputStyle, borderColor: confirm && confirm !== password ? '#f87171' : '#e2e8f0' }}
                  onFocus={e => e.target.style.borderColor = '#0F4C5C'}
                  onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? '#f87171' : '#e2e8f0'}
                  required
                />
                {confirm && confirm !== password && (
                  <p style={{ fontSize: 11, color: '#e92f64', marginTop: 4 }}>⚠️ {t('validation.password_mismatch')}</p>
                )}
              </div>

              <button type="submit" disabled={loading || password !== confirm || password.length < 8}
                style={{ padding: '14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: (loading || password !== confirm || password.length < 8) ? 0.6 : 1 }}>
                {loading ? t('reset.saving') : t('reset.submit')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
