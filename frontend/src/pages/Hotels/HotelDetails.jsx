// src/pages/hotels/HotelDetails.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
};

const fmtPrice = (amount, currency='TND') => {
  const n = parseFloat(amount || 0);
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits:2 })} ${currency}`;
};

const StarRating = ({ stars }) => (
  <div style={{ display:'inline-flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} viewBox="0 0 24 24" width="14" height="14"
        fill={i<=stars?'#f59e0b':'none'} stroke={i<=stars?'#f59e0b':'#d1d5db'} strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
);

const HotelDetails = () => {
  const navigate     = useNavigate();
  const { state }    = useLocation();

  const hotel        = state?.hotel;
  const searchParams = state?.searchParams || {};
  const [activeImg,  setActiveImg] = useState(0);

  if (!hotel) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop:160, textAlign:'center', minHeight:'60vh' }}>
          <h2 style={{ color:'#64748b' }}>Aucun hôtel sélectionné</h2>
          <button onClick={() => navigate('/hotels/search')}
            style={{ padding:'14px 32px', background:'var(--secondary,#e67e22)', color:'#fff',
              border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', marginTop:16 }}>
            ← Rechercher un hôtel
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const { check_in, check_out, adults=2, children=0, rooms=1 } = searchParams;
  const nights = check_in && check_out
    ? Math.round((new Date(check_out) - new Date(check_in)) / 86400000) : 1;
  const totalPrice    = parseFloat(hotel.total_amount || 0);
  const pricePerNight = nights > 0 ? (totalPrice / nights) : totalPrice;
  const expireNotice  = hotel.min_rate_key ? true : false;

  return (
    <>
      <Navbar />

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0a2832 0%,#0f3460 100%)',
        paddingTop:110, paddingBottom:28 }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12,
            fontSize:13, color:'rgba(255,255,255,0.65)' }}>
            <button onClick={() => navigate('/hotels/search')}
              style={{ background:'none', border:'none', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontSize:13 }}>
              ← Recherche
            </button>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M9 18l6-6-6-6"/></svg>
            <button onClick={() => navigate(-1)}
              style={{ background:'none', border:'none', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontSize:13 }}>
              Résultats
            </button>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M9 18l6-6-6-6"/></svg>
            <span style={{ color:'#fff', fontWeight:700 }}>Détail</span>
          </div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', margin:0 }}>🏨 {hotel.name}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:6 }}>
            <StarRating stars={hotel.stars} />
            <span style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>
              {hotel.city || hotel.destination_name}
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'28px 0 60px' }}>
        <div className="omra-reserve__layout">

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Image gallery */}
            {hotel.images?.length > 0 && (
              <div style={{ background:'#fff', borderRadius:16, overflow:'hidden',
                border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <img src={hotel.images[activeImg]} alt={hotel.name}
                  style={{ width:'100%', height:320, objectFit:'cover', display:'block' }}
                  onError={e => { e.target.style.display='none'; }} />
                {hotel.images.length > 1 && (
                  <div style={{ padding:'12px 16px', display:'flex', gap:8, overflowX:'auto' }}>
                    {hotel.images.slice(0, 8).map((img, i) => (
                      <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                        style={{ width:64, height:48, objectFit:'cover', borderRadius:8, cursor:'pointer', flexShrink:0,
                          border: i===activeImg ? '2px solid var(--secondary,#e67e22)' : '2px solid transparent',
                          opacity: i===activeImg ? 1 : 0.7 }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {hotel.description && (
              <div style={{ background:'#fff', borderRadius:16, padding:20,
                border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize:14, fontWeight:800, color:'#0a2832', marginBottom:12, marginTop:0,
                  textTransform:'uppercase', letterSpacing:'.05em', display:'flex', alignItems:'center', gap:8 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--secondary,#e67e22)" strokeWidth="2" width="16" height="16">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Description
                </h3>
                <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, margin:0 }}>{hotel.description}</p>
              </div>
            )}

            {/* Facilities */}
            {hotel.facilities?.length > 0 && (
              <div style={{ background:'#fff', borderRadius:16, padding:20,
                border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize:14, fontWeight:800, color:'#0a2832', marginBottom:14, marginTop:0,
                  textTransform:'uppercase', letterSpacing:'.05em', display:'flex', alignItems:'center', gap:8 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--secondary,#e67e22)" strokeWidth="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                  Équipements & Services
                </h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {hotel.facilities.map((f, i) => (
                    <span key={i} style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8,
                      padding:'4px 10px', fontSize:12, fontWeight:600, color:'#16a34a',
                      display:'flex', alignItems:'center', gap:5 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms available */}
            {hotel.rooms?.length > 0 && (
              <div style={{ background:'#fff', borderRadius:16, padding:20,
                border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize:14, fontWeight:800, color:'#0a2832', marginBottom:14, marginTop:0,
                  textTransform:'uppercase', letterSpacing:'.05em', display:'flex', alignItems:'center', gap:8 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--secondary,#e67e22)" strokeWidth="2" width="16" height="16">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Chambres disponibles
                </h3>
                {hotel.rooms.slice(0, 5).map((room, i) => (
                  <div key={i} style={{ padding:'12px 14px', background:'#f8fafc', borderRadius:10,
                    border:'1px solid #e2e8f0', marginBottom:i < hotel.rooms.length-1 ? 8 : 0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'#0a2832', marginBottom:4 }}>
                      {room.name?.content || room.name || `Chambre ${i+1}`}
                    </div>
                    {room.rates?.slice(0,2).map((rate, ri) => (
                      <div key={ri} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b', marginBottom:2 }}>
                        <span>{rate.boardName || 'Sans repas'} · {rate.rooms} chambre{rate.rooms>1?'s':''}</span>
                        <span style={{ fontWeight:700, color:'var(--secondary,#e67e22)' }}>
                          {parseFloat(rate.net || 0).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Cancellation */}
            {hotel.cancellation_policies?.length > 0 && (
              <div style={{ background:'#fff', borderRadius:16, padding:20,
                border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize:14, fontWeight:800, color:'#0a2832', marginBottom:14, marginTop:0,
                  textTransform:'uppercase', letterSpacing:'.05em' }}>
                  ⚖️ Conditions d'annulation
                </h3>
                {hotel.cancellation_policies.map((pol, i) => (
                  <div key={i} style={{ padding:'10px 14px', background:'#fff8e1', borderRadius:8,
                    border:'1px solid #fde68a', marginBottom:4, fontSize:12, color:'#b45309' }}>
                    Frais : {pol.amount} {pol.currency} · À partir du {fmtDate(pol.from)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="omra-details__sidebar">
            <div style={{ background:'#fff', borderRadius:16, padding:24,
              border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', marginBottom:16 }}>

              {/* Hotel summary */}
              <div style={{ textAlign:'center', marginBottom:20, paddingBottom:16, borderBottom:'1px solid #f1f5f9' }}>
                <StarRating stars={hotel.stars} />
                <p style={{ fontSize:16, fontWeight:800, color:'#0a2832', margin:'8px 0 4px' }}>{hotel.name}</p>
                <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    width="11" height="11" style={{ marginRight:4, verticalAlign:'middle' }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  {hotel.address || hotel.city}
                </p>
              </div>

              {/* Stay info */}
              <div style={{ marginBottom:16 }}>
                {[
                  { label:'Arrivée',   value: fmtDate(check_in) },
                  { label:'Départ',    value: fmtDate(check_out) },
                  { label:'Durée',     value: `${nights} nuit${nights>1?'s':''}` },
                  { label:'Voyageurs', value: `${adults+children} (${adults} adulte${adults>1?'s':''})` },
                  { label:'Chambres',  value: `${rooms}` },
                ].map((row,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between',
                    padding:'7px 0', borderBottom:'1px dashed #f1f5f9', fontSize:13 }}>
                    <span style={{ color:'#64748b' }}>{row.label}</span>
                    <span style={{ fontWeight:700, color:'#0a2832' }}>{row.value || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'12px 0', marginBottom:16, borderTop:'1px solid #f1f5f9' }}>
                <span style={{ fontWeight:700, color:'#0a2832' }}>Total</span>
                <span style={{ fontSize:22, fontWeight:900, color:'var(--secondary,#e67e22)' }}>
                  {fmtPrice(totalPrice, hotel.total_currency || 'TND')}
                </span>
              </div>
              {nights > 1 && (
                <div style={{ textAlign:'right', fontSize:12, color:'#94a3b8', marginTop:-12, marginBottom:12 }}>
                  ≈ {fmtPrice(pricePerNight, hotel.total_currency || 'TND')} / nuit
                </div>
              )}

              <button
                onClick={() => navigate('/hotels/reserve', { state: { hotel, searchParams } })}
                style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg, var(--secondary,#e67e22), #e67e22)',
                  color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:800,
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                Réserver cet hôtel
              </button>
              <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:10 }}>
                🔒 Sans frais supplémentaires
              </p>
            </div>

            {/* Help */}
            <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #f1f5f9' }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:'#0a2832', marginBottom:12 }}>
                <i className="fas fa-headset" style={{ color:'var(--secondary,#e67e22)', marginRight:8 }} />Besoin d'aide ?
              </h4>
              <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6, marginBottom:12 }}>
                Disponible du lundi au samedi de 09h à 18h.
              </p>
              <a href="tel:+21636149885"
                style={{ display:'flex', alignItems:'center', gap:8, fontSize:14,
                  fontWeight:700, color:'var(--secondary,#e67e22)', textDecoration:'none' }}>
                <i className="fas fa-phone" /> +216 36 149 885
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HotelDetails;