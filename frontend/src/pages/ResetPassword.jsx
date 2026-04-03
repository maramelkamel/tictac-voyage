import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams]            = useSearchParams();
  const navigate                  = useNavigate();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState('');
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setMessage('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 8)  { setMessage('Minimum 8 caractères'); return; }
    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/auth/reset-password', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (json.success) { setMessage('✅ Mot de passe réinitialisé !'); setTimeout(() => navigate('/SignIn'), 2500); }
      else setMessage(json.message || 'Erreur');
    } catch { setMessage('Erreur réseau'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#0F4C5C', marginBottom:8 }}>🔐 Nouveau mot de passe</h2>
        <p style={{ fontSize:13, color:'#64748b', marginBottom:24 }}>Choisissez un mot de passe sécurisé.</p>

        {message && (
          <div style={{ padding:'12px 16px', borderRadius:10, background: message.startsWith('✅')?'#d1fae5':'#fee2e2', color:message.startsWith('✅')?'#065f46':'#991b1b', fontSize:13, fontWeight:600, marginBottom:20 }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={e=>setPassword(e.target.value)}
            style={{ padding:'12px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:14, fontFamily:'inherit', outline:'none' }} required/>
          <input type="password" placeholder="Confirmer le mot de passe" value={confirm} onChange={e=>setConfirm(e.target.value)}
            style={{ padding:'12px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:14, fontFamily:'inherit', outline:'none' }} required/>
          <button type="submit" disabled={loading}
            style={{ padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {loading ? 'Enregistrement...' : 'Réinitialiser →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;