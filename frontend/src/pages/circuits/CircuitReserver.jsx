// src/pages/Circuits/CircuitReserver.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const CircuitReserver = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { id }     = useParams();

  const clientData  = (() => { try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; } })();
  const clientEmail = clientData?.email || '';

  const [form, setForm] = useState({
    prenom:    clientData?.firstName || clientData?.first_name || '',
    nom:       clientData?.lastName  || clientData?.last_name  || '',
    email:     clientEmail,
    telephone: clientData?.phone || '',
    personnes: '1',
    chambre:   'double',
    notes:     '',
  });
  const [loading, setLoading] = useState(false);

  if (!state?.circuit) {
    return (
      <div><Navbar />
        <div style={{ textAlign:'center', padding:'160px 24px', color:'var(--gray-400)' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>😕</div>
          <p style={{ fontSize:'18px', fontWeight:700, color:'var(--gray-800)', marginBottom:16 }}>Circuit introuvable.</p>
          <button className="omra-reserve__submit" style={{ width:'auto', padding:'14px 28px' }} onClick={() => navigate('/circuits/circuit')}>← Retour aux circuits</button>
        </div>
        <Footer />
      </div>
    );
  }

  const c = state.circuit;
  const { title, image, price, duration, departure, places } = c;
  const totalPrix = price * parseInt(form.personnes || 1, 10);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const lockedStyle = { background:'#f8fafc', cursor:'not-allowed', color:'#64748b', borderColor:'#e2e8f0' };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/circuits/CircuitPayment/${id}`, {
        state: {
          circuit: c,
          booking: form,
          totalPrix,
        },
      });
    }, 800);
  };

  return (
    <div>
      <Navbar />
      <div className="omra-reserve">
        <div className="container">

          <div className="omra-page-breadcrumb omra-page-breadcrumb--light" style={{ paddingTop:8 }}>
            <button onClick={() => navigate('/circuits')}>← Circuits</button>
            <span>/</span>
            <button onClick={() => navigate(-1)}>{title}</button>
            <span>/</span>
            <span>Réservation</span>
          </div>

          {clientEmail && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', background:'#e0fbfc', border:'1px solid #a5f3fc', borderRadius:12, marginBottom:20 }}>
              <i className="fas fa-user-check" style={{ color:'#0e7490', fontSize:14 }} />
              <p style={{ fontSize:13, color:'#0e7490', fontWeight:600, margin:0 }}>
                Connecté en tant que <strong>{clientEmail}</strong> — vos informations ont été pré-remplies.
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <div className="omra-reserve__form-header-title">🗺️ Formulaire de réservation</div>
                  <div className="omra-reserve__form-header-desc">Remplissez vos informations — aucun paiement immédiat requis.</div>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="prenom">Prénom *</label>
                      <input id="prenom" name="prenom" type="text" required placeholder="Votre prénom" value={form.prenom} onChange={handleChange}/>
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="nom">Nom *</label>
                      <input id="nom" name="nom" type="text" required placeholder="Votre nom" value={form.nom} onChange={handleChange}/>
                    </div>
                  </div>
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="email">
                        Email *
                        {clientEmail && <span style={{ marginLeft:8, fontSize:10, background:'#e0fbfc', color:'#0e7490', padding:'2px 7px', borderRadius:999, fontWeight:600 }}><i className="fas fa-lock" style={{ marginRight:3 }}/>Lié au compte</span>}
                      </label>
                      <input id="email" name="email" type="email" required placeholder="votre@email.com" value={form.email}
                        onChange={e => !clientEmail && handleChange(e)} readOnly={!!clientEmail} style={clientEmail ? lockedStyle : {}}/>
                      {clientEmail && <p style={{ fontSize:11, color:'#64748b', marginTop:4 }}><i className="fas fa-info-circle" style={{ marginRight:4 }}/>Email lié à votre compte — non modifiable.</p>}
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="telephone">Téléphone</label>
                      <input id="telephone" name="telephone" type="tel" placeholder="+216 XX XXX XXX" value={form.telephone} onChange={handleChange}/>
                    </div>
                  </div>
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="personnes">Nombre de participants</label>
                      <input id="personnes" name="personnes" type="number" min="1" max="20" value={form.personnes} onChange={handleChange}/>
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="chambre">Type de chambre</label>
                      <select id="chambre" name="chambre" value={form.chambre} onChange={handleChange}>
                        <option value="single">Chambre single</option>
                        <option value="double">Chambre double</option>
                        <option value="triple">Chambre triple</option>
                      </select>
                    </div>
                  </div>
                  <div className="omra-reserve__field">
                    <label htmlFor="notes">Demandes spéciales</label>
                    <textarea id="notes" name="notes" rows={3} placeholder="Régime alimentaire, besoins particuliers, préférences..." value={form.notes} onChange={handleChange}/>
                  </div>
                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading ? 'Chargement…' : 'Continuer vers le paiement →'}
                  </button>
                  <p style={{ fontSize:'12px', color:'var(--gray-400)', textAlign:'center' }}>Étape suivante : choisissez votre mode de paiement.</p>
                </form>
              </div>
            </div>

            <aside style={{ position:'sticky', top:110 }}>
              <div className="omra-reserve__pkg-card">
                {image && <img src={image} alt={title} className="omra-reserve__pkg-img"/>}
                <div className="omra-reserve__pkg-info">
                  <div className="omra-reserve__pkg-subtitle">🗺️ Circuit Tunisie</div>
                  <div className="omra-reserve__pkg-title">{title}</div>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">🕐 {duration}</div>
                    <div className="omra-reserve__pkg-meta-item">✈️ Départ {departure || 'Tunis'}</div>
                    <div className="omra-reserve__pkg-meta-item">👥 {places} places restantes</div>
                  </div>
                </div>
              </div>
              <div className="omra-reserve__summary">
                <div className="omra-reserve__summary-title">Récapitulatif du prix</div>
                <div className="omra-reserve__summary-row">
                  <span>Prix / personne</span>
                  <span>{price.toLocaleString('fr-FR')} DT</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Participants</span>
                  <span>× {form.personnes}</span>
                </div>
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total estimé</span>
                  <span className="omra-reserve__summary-total-amount">{totalPrix.toLocaleString('fr-FR')} DT</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CircuitReserver;