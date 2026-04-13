// src/pages/hotels/HotelReservation.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
};

const HotelReservation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const hotel        = state?.hotel;
  const searchParams = state?.searchParams || {};
  const { check_in, check_out, adults=2, children=0, rooms=1 } = searchParams;

  const nights = check_in && check_out
    ? Math.round((new Date(check_out) - new Date(check_in)) / 86400000) : 1;

  const clientData = (() => {
    try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; }
  })();

  // Holder (main guest)
  const [holder, setHolder] = useState({
    first_name: clientData?.first_name || '',
    last_name:  clientData?.last_name  || '',
    email:      clientData?.email      || '',
    phone:      clientData?.phone      || '',
  });

  // Pax for each room
  const initPax = () => {
    const totalAdults   = adults;
    const totalChildren = children;
    return Array(rooms).fill(null).map((_, ri) => ({
      paxes: [
        ...Array(ri === 0 ? totalAdults : 1).fill(null).map(() => ({ type:'AD', name:'', surname:'' })),
        ...Array(ri === 0 ? totalChildren : 0).fill(null).map(() => ({ type:'CH', name:'', surname:'' })),
      ],
    }));
  };

  const [roomsPax, setRoomsPax] = useState(initPax);
  const [loading,  setLoading]  = useState(false);
  const [accepted, setAccepted] = useState(false);

  if (!hotel) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop:160, textAlign:'center', minHeight:'60vh' }}>
          <h2 style={{ color:'#64748b' }}>Aucun hôtel sélectionné</h2>
          <button onClick={() => navigate('/hotels/search')}
            style={{ padding:'14px 32px', background:'var(--secondary,#e67e22)', color:'#fff',
              border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', marginTop:16 }}>
            ← Retour à la recherche
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const updateHolder = (field, value) => setHolder(prev => ({ ...prev, [field]: value }));
  const updatePax = (roomIdx, paxIdx, field, value) => {
    setRoomsPax(prev => prev.map((room, ri) =>
      ri !== roomIdx ? room : {
        ...room,
        paxes: room.paxes.map((pax, pi) => pi !== paxIdx ? pax : { ...pax, [field]: value }),
      }
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/hotels/payment', {
        state: {
          hotel,
          holder,
          roomsPax,
          searchParams,
          hotelInfo: {
            code:             hotel.code,
            name:             hotel.name,
            destination_code: hotel.destination_code,
            check_in,
            check_out,
            adults,
            children,
            rooms,
            total_amount:    hotel.total_amount,
            total_currency:  hotel.total_currency || 'TND',
            rate_key:        hotel.min_rate_key,
          },
        },
      });
    }, 500);
  };

  const lockedStyle = { background:'#f8fafc', cursor:'not-allowed', color:'#64748b', borderColor:'#e2e8f0' };

  return (
    <>
      <Navbar />
      <div className="omra-reserve">
        <div className="container">
          <div className="omra-page-breadcrumb" style={{ paddingTop:8 }}>
            <button onClick={() => navigate('/hotels/search')}><i className="fas fa-arrow-left" /> Recherche hôtels</button>
            <i className="fas fa-chevron-right" style={{ fontSize:10, color:'#94a3b8' }} />
            <button onClick={() => navigate(-1)} style={{ color:'#64748b' }}>Résultats</button>
            <i className="fas fa-chevron-right" style={{ fontSize:10, color:'#94a3b8' }} />
            <span style={{ color:'#0a2832', fontWeight:700 }}>Réservation</span>
          </div>

          <div className="omra-reserve__layout">
            {/* LEFT — Form */}
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <h1 className="omra-reserve__form-header-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--secondary,#e67e22)" strokeWidth="2"
                      width="20" height="20" style={{ marginRight:10, verticalAlign:'middle' }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Informations des voyageurs
                  </h1>
                  <p className="omra-reserve__form-header-desc">
                    Remplissez les informations exactement comme sur votre passeport. Le paiement se fait à l'étape suivante.
                  </p>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
                  {/* ── Holder ──────────────────────────────── */}
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--secondary,#e67e22)',
                    textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>
                    <i className="fas fa-user-tie" style={{ marginRight:8 }} />Titulaire de la réservation
                  </p>
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label>Prénom *</label>
                      <input required value={holder.first_name}
                        onChange={e => updateHolder('first_name', e.target.value)}
                        placeholder="PRÉNOM" style={{ textTransform:'uppercase' }} />
                    </div>
                    <div className="omra-reserve__field">
                      <label>Nom *</label>
                      <input required value={holder.last_name}
                        onChange={e => updateHolder('last_name', e.target.value)}
                        placeholder="NOM" style={{ textTransform:'uppercase' }} />
                    </div>
                  </div>
                  <div className="omra-reserve__form-row" style={{ marginTop:16 }}>
                    <div className="omra-reserve__field">
                      <label>Email *</label>
                      <input required type="email" value={holder.email}
                        onChange={e => !clientData?.email && updateHolder('email', e.target.value)}
                        readOnly={!!clientData?.email}
                        style={clientData?.email ? lockedStyle : {}}
                        placeholder="email@exemple.com" />
                    </div>
                    <div className="omra-reserve__field">
                      <label>Téléphone *</label>
                      <input required type="tel" value={holder.phone}
                        onChange={e => updateHolder('phone', e.target.value)}
                        placeholder="+216 XX XXX XXX" />
                    </div>
                  </div>

                  <div style={{ height:1, background:'#f1f5f9', margin:'24px 0' }} />

                  {/* ── Rooms pax ──────────────────────────── */}
                  {roomsPax.map((room, ri) => (
                    <div key={ri} style={{ marginBottom:28 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--secondary,#e67e22)',
                        textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>
                        <i className="fas fa-bed" style={{ marginRight:8 }} />Chambre {ri+1}
                      </p>
                      {room.paxes.map((pax, pi) => (
                        <div key={pi} style={{ marginBottom:14, padding:'14px 16px',
                          background:'#f8fafc', borderRadius:10, border:'1px solid #e2e8f0' }}>
                          <p style={{ fontSize:12, fontWeight:700, color:'#64748b',
                            textTransform:'uppercase', margin:'0 0 10px' }}>
                            {pax.type==='AD' ? `Adulte ${pi+1}` : `Enfant`}
                          </p>
                          <div className="omra-reserve__form-row">
                            <div className="omra-reserve__field">
                              <label>Prénom *</label>
                              <input required value={pax.name}
                                onChange={e => updatePax(ri, pi, 'name', e.target.value)}
                                placeholder="PRÉNOM" style={{ textTransform:'uppercase' }} />
                            </div>
                            <div className="omra-reserve__field">
                              <label>Nom *</label>
                              <input required value={pax.surname}
                                onChange={e => updatePax(ri, pi, 'surname', e.target.value)}
                                placeholder="NOM" style={{ textTransform:'uppercase' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <input type="checkbox" id="terms" required checked={accepted}
                      onChange={e => setAccepted(e.target.checked)}
                      style={{ marginTop:3, accentColor:'var(--secondary,#e67e22)', width:16, height:16, flexShrink:0 }} />
                    <label htmlFor="terms" style={{ fontSize:13, color:'#64748b', lineHeight:1.6, cursor:'pointer' }}>
                      J'accepte les <a href="#" style={{ color:'var(--secondary,#e67e22)' }}>conditions générales de vente</a> et la{' '}
                      <a href="#" style={{ color:'var(--secondary,#e67e22)' }}>politique de confidentialité</a> de TICTAC VOYAGES.
                    </label>
                  </div>

                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading ? 'Chargement…'
                      : <><i className="fas fa-credit-card" style={{ marginRight:8 }} />Continuer vers le paiement →</>}
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div className="omra-details__sidebar">
              <div className="omra-reserve__pkg-card">
                {hotel.main_image && (
                  <img src={hotel.main_image} alt={hotel.name}
                    style={{ width:'100%', height:160, objectFit:'cover', display:'block' }}
                    onError={e => (e.target.style.display='none')} />
                )}
                <div className="omra-reserve__pkg-info" style={{ padding:20 }}>
                  <h3 className="omra-reserve__pkg-title">{hotel.name}</h3>
                  <p className="omra-reserve__pkg-subtitle">{hotel.city || hotel.destination_name}</p>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-calendar-alt" /> Arrivée : {fmtDate(check_in)}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-calendar-alt" /> Départ : {fmtDate(check_out)}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-moon" /> {nights} nuit{nights>1?'s':''}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-users" /> {adults+children} voyageur{adults+children>1?'s':''}
                    </div>
                    {hotel.board_name && (
                      <div className="omra-reserve__pkg-meta-item">
                        <i className="fas fa-utensils" /> {hotel.board_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="omra-reserve__summary">
                <p className="omra-reserve__summary-title">Récapitulatif du prix</p>
                <div className="omra-reserve__summary-row">
                  <span>{nights} nuit{nights>1?'s':''} × {rooms} chambre{rooms>1?'s':''}</span>
                  <span style={{ fontWeight:700, color:'#fff' }}>
                    {parseFloat(hotel.total_amount||0).toLocaleString('fr-FR')} {hotel.total_currency||'TND'}
                  </span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Taxes & frais</span>
                  <span style={{ fontWeight:700, color:'#fff' }}>Inclus</span>
                </div>
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total</span>
                  <span className="omra-reserve__summary-total-amount">
                    {parseFloat(hotel.total_amount||0).toLocaleString('fr-FR')} {hotel.total_currency||'TND'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop:20, background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0' }}>
                <h4 style={{ fontSize:14, fontWeight:700, color:'#0a2832', marginBottom:12 }}>
                  <i className="fas fa-headset" style={{ color:'var(--secondary,#e67e22)', marginRight:8 }} />Besoin d'aide ?
                </h4>
                <a href="tel:+21636149885"
                  style={{ display:'flex', alignItems:'center', gap:8, fontSize:14,
                    fontWeight:700, color:'var(--secondary,#e67e22)', textDecoration:'none' }}>
                  <i className="fas fa-phone" /> +216 36 149 885
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HotelReservation;