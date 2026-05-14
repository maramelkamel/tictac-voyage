import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const clientRaw = params.get('client');

    if (token && clientRaw) {
      try {
        const client = JSON.parse(clientRaw);
        localStorage.setItem('token', token);
        localStorage.setItem('client', JSON.stringify(client));
        navigate('/hotels', { replace: true });
      } catch {
        navigate('/signin?error=parse', { replace: true });
      }
    } else {
      navigate('/signin?error=google', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Connexion en cours…</p>
    </div>
  );
};

export default AuthCallback;