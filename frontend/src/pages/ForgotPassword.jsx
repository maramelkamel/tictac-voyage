import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate          = useNavigate();
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch('http://localhost:5000/api/auth/forgot-password', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
        {sent ? (
          <>
            <div style={{ textAlign:'center', marginBottom:20 }}><span style={{ fontSize:48 }}>📧</span></div>
            <h2 style={{ fontSize:20, fontWeight:800, color:'#0F4C5C', marginBottom:8, textAlign:'center' }}>Email envoyé !</h2>
            <p style={{ fontSize:13, color:'#64748b', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>
              Si cet email est enregistré, vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <button onClick={() => navigate('/SignIn')} style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Retour à la connexion
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#0F4C5C', marginBottom:8 }}>🔐 Mot de passe oublié</h2>
            <p style={{ fontSize:13, color:'#64748b', marginBottom:24 }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <input type="email" placeholder="votre@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                style={{ padding:'12px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:14, fontFamily:'inherit', outline:'none' }} required/>
              <button type="submit" disabled={loading} style={{ padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0F4C5C,#1ECAD3)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                {loading ? 'Envoi...' : 'Envoyer le lien →'}
              </button>
            </form>
            <button onClick={() => navigate('/SignIn')} style={{ marginTop:16, width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              ← Retour
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;