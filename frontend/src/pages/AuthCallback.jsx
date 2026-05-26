import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This page receives the Google OAuth response and stores the client session.
const AuthCallback = () => {
  const navigate = useNavigate();

  // This effect reads the OAuth query params, saves the session, and redirects the client.
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
        navigate('/SignIn?error=parse', { replace: true });
      }
    } else {
      navigate('/SignIn?error=google', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Connexion en cours…</p>
    </div>
  );
};

export default AuthCallback;
