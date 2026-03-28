// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/admin-auth/login';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form,        setForm]        = useState({ email: '', password: '' });
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [focused,     setFocused]     = useState('');

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email et mot de passe requis'); return; }
    setLoading(true);
    try {
      const res  = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('adminToken', json.token);
        localStorage.setItem('admin',      JSON.stringify(json.admin));
        navigate('/admin');
      } else {
        setError(json.message || 'Identifiants incorrects');
      }
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── Left decorative panel ── */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0F4C5C 0%, #1a6b80 60%, #1ECAD3 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        {/* Déco circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }}/>
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }}/>

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,.15)', border: '2px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', backdropFilter: 'blur(10px)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" style={{ width: 36, height: 36 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-.02em' }}>
            TicTac Voyage
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, marginBottom: 48 }}>
            Espace administration sécurisé.<br/>Gérez votre agence depuis un seul tableau de bord.
          </p>

          {[
            { icon: '🔒', text: 'Accès sécurisé par token JWT' },
            { icon: '📊', text: 'Gestion complète de tous les modules' },
            { icon: '👥', text: 'Multi-admin avec contrôle des rôles' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, textAlign: 'left' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right login form ── */}
      <div style={{ width: 460, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0F4C5C,#1ECAD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 24, height: 24 }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Connexion Admin</h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>Accédez au tableau de bord d'administration.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#991b1b', fontWeight: 500 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 7 }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, pointerEvents: 'none' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  placeholder="admin@tictac.tn" autoComplete="email"
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: `1.5px solid ${focused==='email'?'#0F4C5C':'#e2e8f0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#0f172a', transition: 'border-color .2s' }}/>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 7 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width: '100%', padding: '12px 44px 12px 42px', borderRadius: 10, border: `1.5px solid ${focused==='password'?'#0F4C5C':'#e2e8f0'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#0f172a', transition: 'border-color .2s' }}/>
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}>
                  {showPw
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#0F4C5C,#1a6b80)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .2s' }}>
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
                  Connexion...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Se connecter
                </>
              )}
            </button>

          </form>

          <p style={{ marginTop: 24, fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
            Cet espace est réservé aux administrateurs.<br/>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#0F4C5C', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
              ← Retour au site
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminLogin;