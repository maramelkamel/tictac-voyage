import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const Reserver = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { id }     = useParams();

  // ── Pre-fill from logged-in client ───────────────────────────
  const clientData  = (() => { try { return JSON.parse(localStorage.getItem('client') || '{}'); } catch { return {}; } })();
  const clientEmail = clientData?.email || '';

  const [form, setForm] = useState({
    prenom:    clientData?.firstName  || clientData?.first_name  || '',
    nom:       clientData?.lastName   || clientData?.last_name   || '',
    email:     clientEmail,
    telephone: clientData?.phone      || '',
    personnes: '2',
    chambre:   'double',
    notes:     '',
  });

  const [loading, setLoading] = useState(false);

  if (!state?.voyage) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>Voyage introuvable.</p>
          <button className="omra-reserve__submit" style={{ width: 'auto', padding: '14px 28px' }}
            onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>
            ← Retour aux voyages
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { titre, image, pays, destination, prix, duree, depart, places } = state.voyage;
  const totalPrix = prix * parseInt(form.personnes || 1, 10);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/VoyagesOrganise/Payment/${id}`, {
        state: { voyage: state.voyage, booking: form, totalPrix },
      });
    }, 800);
  };

  const lockedStyle = {
    background: '#f8fafc', cursor: 'not-allowed',
    color: '#64748b', borderColor: '#e2e8f0',
  };

  return (
    <div>
      <Navbar />

      <div className="omra-reserve">
        <div className="container">

          <div className="omra-page-breadcrumb omra-page-breadcrumb--light" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/VoyagesOrganise/VoyagesOrganise')}>← Voyages</button>
            <span>/</span>
            <button onClick={() => navigate(-1)}>{pays}</button>
            <span>/</span>
            <span>Réservation</span>
          </div>

          {/* Logged-in notice */}
          {clientEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#e0fbfc', border: '1px solid #a5f3fc', borderRadius: 12, marginBottom: 20 }}>
              <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
              <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                Connecté en tant que <strong>{clientEmail}</strong> — vos informations ont été pré-remplies.
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">

            {/* Left: form */}
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <div className="omra-reserve__form-header-title">Formulaire de réservation</div>
                  <div className="omra-reserve__form-header-desc">Remplissez vos informations — aucun paiement immédiat requis.</div>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>

                  {/* Name row */}
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="prenom">Prénom *</label>
                      <input id="prenom" name="prenom" type="text" required
                        placeholder="Votre prénom" value={form.prenom} onChange={handleChange} />
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="nom">Nom *</label>
                      <input id="nom" name="nom" type="text" required
                        placeholder="Votre nom" value={form.nom} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Contact row */}
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="email">
                        Email *
                        {clientEmail && (
                          <span style={{ marginLeft: 8, fontSize: 10, background: '#e0fbfc', color: '#0e7490', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
                            <i className="fas fa-lock" style={{ marginRight: 3 }} />Lié au compte
                          </span>
                        )}
                      </label>
                      <input id="email" name="email" type="email" required
                        placeholder="votre@email.com" value={form.email}
                        onChange={e => !clientEmail && handleChange(e)}
                        readOnly={!!clientEmail}
                        style={clientEmail ? lockedStyle : {}} />
                      {clientEmail && (
                        <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
                          L'email est lié à votre compte et ne peut pas être modifié.
                        </p>
                      )}
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="telephone">Téléphone</label>
                      <input id="telephone" name="telephone" type="tel"
                        placeholder="+216 XX XXX XXX" value={form.telephone} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Voyageurs row */}
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="personnes">Nombre de voyageurs</label>
                      <input id="personnes" name="personnes" type="number" min="1" max="20"
                        value={form.personnes} onChange={handleChange} />
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="chambre">Type de chambre</label>
                      <select id="chambre" name="chambre" value={form.chambre} onChange={handleChange}>
                        <option value="single">Chambre single</option>
                        <option value="double">Chambre double</option>
                        <option value="triple">Chambre triple</option>
                        <option value="suite">Suite</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="omra-reserve__field">
                    <label htmlFor="notes">Demandes spéciales</label>
                    <textarea id="notes" name="notes" rows={3}
                      placeholder="Allergies, accessibilité, préférences…"
                      value={form.notes} onChange={handleChange} />
                  </div>

                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading ? 'Chargement…' : 'Continuer vers le paiement →'}
                  </button>

                  <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center' }}>
                    Étape suivante : choisissez votre mode de paiement.
                  </p>
                </form>
              </div>
            </div>

            {/* Right: sticky summary */}
            <aside style={{ position: 'sticky', top: 110 }}>
              <div className="omra-reserve__pkg-card">
                <img src={image} alt={titre} className="omra-reserve__pkg-img" />
                <div className="omra-reserve__pkg-info">
                  <div className="omra-reserve__pkg-subtitle">{pays} · {destination}</div>
                  <div className="omra-reserve__pkg-title">{titre}</div>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">✈️ Départ depuis {depart}</div>
                    <div className="omra-reserve__pkg-meta-item">🕐 {duree}</div>
                    <div className="omra-reserve__pkg-meta-item">👥 {places} places restantes</div>
                  </div>
                </div>
              </div>
              <div className="omra-reserve__summary">
                <div className="omra-reserve__summary-title">Récapitulatif du prix</div>
                <div className="omra-reserve__summary-row">
                  <span>Prix / personne</span>
                  <span>{prix.toLocaleString('fr-FR')} TND</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Voyageurs</span>
                  <span>× {form.personnes}</span>
                </div>
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total estimé</span>
                  <span className="omra-reserve__summary-total-amount">{totalPrix.toLocaleString('fr-FR')} TND</span>
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

export default Reserver;