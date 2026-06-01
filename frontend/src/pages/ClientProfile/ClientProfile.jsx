import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar          from '../../components/Navbar';
import Footer          from '../../components/Footer';
import Editprofile     from './Editprofile';
import Myreservation   from './Myreservation';
import Mymessages      from './Mymessages';
import Myfavorites     from './Myfavorites';
import Myfidelity      from './Myfidelity';
import Mypromotions    from './Mypromotions';
import { getClientLevelInfo, isPromotionActive } from './helpers';
import '../../styles/ClientProfile.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Tab = ({ id, label, icon, active, onClick, count }) => (
  <button onClick={() => onClick(id)} className={`cp-tab${active ? ' cp-tab--active' : ''}`}>
    <i className={`${icon} cp-tab__icon`} />
    {label}
    {count !== undefined && count > 0 && (
      <span className={`cp-tab__count ${active ? 'cp-tab__count--active' : 'cp-tab__count--inactive'}`}>
        {count}
      </span>
    )}
  </button>
);

export default function ClientProfile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [client,     setClient]     = useState(null);
  const [activeTab,  setActiveTab]  = useState(searchParams.get('tab') || 'profil');
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);

  const [omraRes,    setOmraRes]    = useState([]);
  const [voyageRes,  setVoyageRes]  = useState([]);
  const [circuitRes, setCircuitRes] = useState([]);
  const [flightRes,  setFlightRes]  = useState([]);
  const [hotelRes,   setHotelRes]   = useState([]);
  const [transRes,   setTransRes]   = useState([]);
  const [customRes,  setCustomRes]  = useState([]);
  const [messages,   setMessages]   = useState([]);
  const [favorites,  setFavorites]  = useState([]);
  const [promotions, setPromotions] = useState([]);

  const token = localStorage.getItem('token');

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const stored = localStorage.getItem('client');
    if (!stored || !token) { navigate('/SignIn'); return; }
    const c = JSON.parse(stored);
    setClient(c);
    fetchAll(c.email);
  }, []);

  const fetchAll = async (email) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const e = email?.toLowerCase();
      const [omra, voyage, circuit, flights, hotels, trans, custom, msgs, favs, promos] = await Promise.all([
        fetch(`${API}/omra/reservations`,    { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/voyage-reservations`,  { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/circuit-reservations`, { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/flights/mine`,         { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/hotels/mine`,          { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/requests`,             { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/custom-trips`,         { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/contact`,              { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/favorites`,            { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API}/promotions`).then(r => r.json()).catch(() => ({})),
      ]);
      setOmraRes(   (omra.data    || []).filter(r => r.email?.toLowerCase() === e));
      setVoyageRes( (voyage.data  || []).filter(r => r.email?.toLowerCase() === e));
      setCircuitRes((circuit.data || []).filter(r => r.email?.toLowerCase() === e));
      setFlightRes( flights.data  || []);
      setHotelRes(  hotels.data   || []);
      setTransRes(  (trans.data   || []).filter(r => r.email?.toLowerCase() === e));
      setCustomRes( (custom.data  || []).filter(r => r.email?.toLowerCase() === e));
      setMessages(  (msgs.data    || []).filter(r => r.email?.toLowerCase() === e));
      setFavorites( favs.data     || []);
      setPromotions((promos.data  || []).filter(isPromotionActive));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const allReservations = [
    ...omraRes, ...voyageRes, ...circuitRes,
    ...flightRes, ...hotelRes, ...transRes, ...customRes,
  ];
  const totalRes = allReservations.length;
  const loyalty  = getClientLevelInfo(totalRes);

  if (!client) return null;

  const firstName = client.firstName || client.first_name || '';
  const lastName  = client.lastName  || client.last_name  || '';
  const initials  = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  return (
    <>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`cp-toast cp-toast--${toast.type}`}>
          <i className={toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'} />
          {toast.msg}
        </div>
      )}

      <main className="cp-main">
        <div className="cp-container">

          {/* ── Header profil ── */}
          <div className="cp-header">
            <div className="cp-header__left">
              <div className="cp-header__avatar">
                {initials || <i className="fas fa-user" />}
              </div>
              <div>
                <p className="cp-header__name">{firstName} {lastName}</p>
                <p className="cp-header__email">{client.email}</p>
                <span
                  className="cp-header__loyalty-badge"
                  style={{ background: loyalty.bg, color: loyalty.color }}
                >
                  {loyalty.icon} {loyalty.label}
                </span>
              </div>
            </div>

            <div className="cp-header__stats">
              {[
                { label: 'Réservations', value: totalRes           },
                { label: 'Omra',         value: omraRes.length     },
                { label: 'Voyages',      value: voyageRes.length   },
                { label: 'Circuits',     value: circuitRes.length  },
                { label: 'Hotels',       value: hotelRes.length    },
                { label: 'Vols',         value: flightRes.length   },
                { label: 'Transport',    value: transRes.length    },
                { label: 'Sur Mesure',   value: customRes.length   },
              ].map(s => (
                <div key={s.label} className="cp-stat-card">
                  <p className="cp-stat-card__value">{s.value}</p>
                  <p className="cp-stat-card__label">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="cp-tabs">
            <Tab id="profil"       label="Mon Profil"     icon="fas fa-user-circle" active={activeTab === 'profil'}       onClick={handleTabChange} />
            <Tab id="reservations" label="Réservations"   icon="fas fa-suitcase"    active={activeTab === 'reservations'} onClick={handleTabChange} count={totalRes} />
            <Tab id="messages"     label="Messages"       icon="fas fa-envelope"    active={activeTab === 'messages'}     onClick={handleTabChange} count={messages.length} />
            <Tab id="favoris"      label="Favoris"        icon="fas fa-heart"       active={activeTab === 'favoris'}      onClick={handleTabChange} count={favorites.length} />
            <Tab id="fidelite"     label="Fidélité"       icon="fas fa-crown"       active={activeTab === 'fidelite'}     onClick={handleTabChange} />
            <Tab id="promotions"   label="Nos promotions" icon="fas fa-percent"     active={activeTab === 'promotions'}   onClick={handleTabChange} count={promotions.length} />
          </div>

          {/* ── Contenu ── */}
          {loading ? (
            <div className="cp-loading">
              <div className="cp-spinner" />
              <p className="cp-loading__text">Chargement...</p>
            </div>
          ) : (
            <>
              {activeTab === 'profil' && (
                <Editprofile
                  client={client}
                  setClient={setClient}
                  token={token}
                  notify={notify}
                />
              )}

              {activeTab === 'reservations' && (
                <Myreservation
                  omraRes={omraRes}
                  voyageRes={voyageRes}
                  circuitRes={circuitRes}
                  flightRes={flightRes}
                  hotelRes={hotelRes}
                  transRes={transRes}
                  customRes={customRes}
                  navigate={navigate}
                />
              )}

              {activeTab === 'messages' && (
                <Mymessages
                  messages={messages}
                  initials={initials}
                  navigate={navigate}
                />
              )}

              {activeTab === 'favoris' && (
                <Myfavorites
                  favorites={favorites}
                  navigate={navigate}
                />
              )}

              {activeTab === 'fidelite' && (
                <Myfidelity
                  totalRes={totalRes}
                  handleTabChange={handleTabChange}
                />
              )}

              {activeTab === 'promotions' && (
                <Mypromotions
                  promotions={promotions}
                  notify={notify}
                />
              )}
            </>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}