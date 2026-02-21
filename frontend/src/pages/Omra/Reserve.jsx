import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

/**
 * OmraReserve — Full page reservation form for one Omra package.
 * Receives the package via React Router location.state: { pkg }
 * Route suggestion: /omra/reserve
 */

const OmraReserve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pkg = location.state?.pkg;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    date: '',
    persons: 1,
    gender: '',
    hasMahram: '',
    passportNumber: '',
    note: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const totalPrice = pkg ? pkg.price * Number(form.persons) : 0;

  // Guard
  if (!pkg) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 160, textAlign: 'center', minHeight: '60vh' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: 48, color: 'var(--gray-300)', marginBottom: 20, display: 'block' }} />
          <h2 style={{ color: 'var(--gray-600)', marginBottom: 12 }}>Aucun forfait sélectionné</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 28 }}>Veuillez choisir un forfait depuis la page Omra.</p>
          <button
            onClick={() => navigate('/omra')}
            style={{
              padding: '14px 32px', background: 'var(--secondary)', color: 'var(--white)',
              border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <i className="fas fa-arrow-left" /> Retour aux forfaits
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reservation submitted:', { pkg, ...form });
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <div className="omra-reserve">
        <div className="container">

          {/* Breadcrumb */}
          <div className="omra-page-breadcrumb" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/omra')}>
              <i className="fas fa-arrow-left" /> Omra
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'var(--gray-400)' }} />
            <button onClick={() => navigate('/omra/details', { state: { pkg } })} style={{ color: 'var(--gray-500)' }}>
              {pkg.title}
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'var(--gray-400)' }} />
            <span style={{ color: 'var(--gray-700)', fontWeight: 700 }}>Réservation</span>
          </div>

          <div className="omra-reserve__layout">

            {/* ── Left: Form ──────────────────────────────────── */}
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <h1 className="omra-reserve__form-header-title">
                    <i className="fas fa-kaaba" style={{ marginRight: 10, color: '#D4A017' }} />
                    Formulaire de réservation
                  </h1>
                  <p className="omra-reserve__form-header-desc">
                    Remplissez le formulaire ci-dessous. Notre équipe vous contactera sous 24h pour confirmer.
                  </p>
                </div>

                {submitted ? (
                  <div className="omra-reserve__success">
                    <div className="omra-reserve__success-icon">
                      <i className="fas fa-check" />
                    </div>
                    <h2 className="omra-reserve__success-title">Demande envoyée !</h2>
                    <p className="omra-reserve__success-desc">
                      Votre demande de réservation pour <strong>{pkg.title}</strong> a bien été reçue.
                      Notre équipe vous contactera dans les plus brefs délais pour confirmer votre dossier.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        className="omra-reserve__success-btn"
                        onClick={() => navigate('/omra')}
                      >
                        <i className="fas fa-arrow-left" style={{ marginRight: 8 }} />
                        Retour aux forfaits
                      </button>
                      <a
                        href="tel:+21636149885"
                        style={{
                          padding: '14px 24px', background: 'transparent',
                          color: 'var(--primary)', border: '2px solid var(--gray-200)',
                          borderRadius: 12, fontSize: 14, fontWeight: 700,
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <i className="fas fa-phone" /> Appeler l'agence
                      </a>
                    </div>
                  </div>
                ) : (
                  <form className="omra-reserve__form-body" onSubmit={handleSubmit}>

                    {/* Section: Identité */}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                        <i className="fas fa-user" style={{ marginRight: 8 }} />
                        Informations personnelles
                      </p>
                      <div className="omra-reserve__form-row">
                        <div className="omra-reserve__field">
                          <label>Prénom *</label>
                          <input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Votre prénom" />
                        </div>
                        <div className="omra-reserve__field">
                          <label>Nom *</label>
                          <input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Votre nom" />
                        </div>
                      </div>
                      <div className="omra-reserve__form-row" style={{ marginTop: 16 }}>
                        <div className="omra-reserve__field">
                          <label>Genre *</label>
                          <select required value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                            <option value="">Sélectionner</option>
                            <option value="homme">Homme</option>
                            <option value="femme">Femme</option>
                          </select>
                        </div>
                        <div className="omra-reserve__field">
                          <label>N° Passeport *</label>
                          <input required value={form.passportNumber} onChange={(e) => set('passportNumber', e.target.value)} placeholder="Ex : A12345678" />
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, background: 'var(--gray-100)' }} />

                    {/* Section: Contact */}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                        <i className="fas fa-address-book" style={{ marginRight: 8 }} />
                        Contact
                      </p>
                      <div className="omra-reserve__form-row">
                        <div className="omra-reserve__field">
                          <label>Téléphone *</label>
                          <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+216 XX XXX XXX" />
                        </div>
                        <div className="omra-reserve__field">
                          <label>Email *</label>
                          <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="votre@email.com" />
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, background: 'var(--gray-100)' }} />

                    {/* Section: Voyage */}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                        <i className="fas fa-plane" style={{ marginRight: 8 }} />
                        Détails du voyage
                      </p>
                      <div className="omra-reserve__form-row">
                        <div className="omra-reserve__field">
                          <label>Date de départ souhaitée *</label>
                          <input required type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                        </div>
                        <div className="omra-reserve__field">
                          <label>Nombre de personnes *</label>
                          <select required value={form.persons} onChange={(e) => set('persons', e.target.value)}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>
                            ))}
                            <option value="10+">10+ personnes</option>
                          </select>
                        </div>
                      </div>
                      {form.gender === 'femme' && (
                        <div className="omra-reserve__field" style={{ marginTop: 16 }}>
                          <label>Accompagnée d'un mahram ? *</label>
                          <select required value={form.hasMahram} onChange={(e) => set('hasMahram', e.target.value)}>
                            <option value="">Sélectionner</option>
                            <option value="oui">Oui</option>
                            <option value="non">Non (moins de 45 ans — obligatoire)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div style={{ height: 1, background: 'var(--gray-100)' }} />

                    {/* Remarques */}
                    <div className="omra-reserve__field">
                      <label>Remarques / Besoins spéciaux (optionnel)</label>
                      <textarea
                        rows={4}
                        value={form.note}
                        onChange={(e) => set('note', e.target.value)}
                        placeholder="Régime alimentaire particulier, mobilité réduite, demandes spéciales..."
                      />
                    </div>

                    {/* Terms */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        style={{ marginTop: 3, accentColor: 'var(--secondary)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
                      />
                      <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, cursor: 'pointer' }}>
                        J'accepte les <a href="#" style={{ color: 'var(--secondary)' }}>conditions générales de vente</a> et
                        la <a href="#" style={{ color: 'var(--secondary)' }}>politique de confidentialité</a> de TICTAC VOYAGES.
                      </label>
                    </div>

                    <button type="submit" className="omra-reserve__submit">
                      <i className="fas fa-paper-plane" /> Envoyer ma demande de réservation
                    </button>

                    <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>
                      <i className="fas fa-lock" style={{ marginRight: 5 }} />
                      Vos données sont protégées et ne seront jamais partagées à des tiers.
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* ── Right: Package summary ───────────────────────── */}
            <div className="omra-details__sidebar">

              {/* Package mini-card */}
              <div className="omra-reserve__pkg-card">
                <img className="omra-reserve__pkg-img" src={pkg.image} alt={pkg.title} />
                <div className="omra-reserve__pkg-info">
                  <h3 className="omra-reserve__pkg-title">{pkg.title}</h3>
                  <p className="omra-reserve__pkg-subtitle">{pkg.subtitle}</p>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-calendar-alt" /> {pkg.duration} jours
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-plane-departure" /> Départ : {pkg.departure}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      <i className="fas fa-star" style={{ color: '#D4A017' }} />
                      {pkg.rating} / 5 — {pkg.reviews} avis
                    </div>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div className="omra-reserve__summary">
                <p className="omra-reserve__summary-title">Résumé du prix</p>

                <div className="omra-reserve__summary-row">
                  <span>Prix par personne</span>
                  <span style={{ fontWeight: 700, color: 'var(--white)' }}>{pkg.price.toLocaleString('fr-TN')} TND</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Nombre de personnes</span>
                  <span style={{ fontWeight: 700, color: 'var(--white)' }}>× {form.persons}</span>
                </div>
                {pkg.oldPrice && (
                  <div className="omra-reserve__summary-row">
                    <span>Économie</span>
                    <span style={{ color: '#D4A017', fontWeight: 700 }}>
                      −{((pkg.oldPrice - pkg.price) * Number(form.persons)).toLocaleString('fr-TN')} TND
                    </span>
                  </div>
                )}

                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total estimé</span>
                  <span className="omra-reserve__summary-total-amount">
                    {totalPrice.toLocaleString('fr-TN')} TND
                  </span>
                </div>
              </div>

              {/* Help box */}
              <div
                style={{
                  marginTop: 20,
                  background: 'var(--white)',
                  borderRadius: 16,
                  padding: '20px',
                  border: '1px solid var(--gray-100)',
                }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14 }}>
                  <i className="fas fa-headset" style={{ color: 'var(--secondary)', marginRight: 8 }} />
                  Besoin d'aide ?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 14 }}>
                  Notre équipe est disponible du lundi au samedi de 09h à 18h.
                </p>
                <a
                  href="tel:+21636149885"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 14, fontWeight: 700, color: 'var(--secondary)',
                    textDecoration: 'none',
                  }}
                >
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

export default OmraReserve;