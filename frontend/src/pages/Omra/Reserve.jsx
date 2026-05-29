// ════════════════════════════════════════════════════════════════════
// src/pages/Omra/Reserve.jsx  —  Omra reservation form
// ════════════════════════════════════════════════════════════════════

import { useState }                             from 'react';
import { useLocation, useNavigate, useParams }  from 'react-router-dom';
import Navbar                                   from '../../components/Navbar';
import Footer                                   from '../../components/Footer';
import '../../styles/omrastyle.css';

const Reserve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id }   = useParams();  // package ID from the URL (used in navigate calls)

  // The selected package passed from the listing / detail page.
  const pkg = location.state?.pkg;

  // ── Pre-fill from logged-in client ────────────────────────────────
  const clientData = (() => {
    try { return JSON.parse(localStorage.getItem('client') || '{}'); }
    catch { return {}; }
  })();
  const clientEmail = clientData?.email || '';

  // ── Form state ─────────────────────────────────────────────────────
 
  const [form, setForm] = useState({
    firstName:      clientData?.firstName  || clientData?.first_name  || '',
    lastName:       clientData?.lastName   || clientData?.last_name   || '',
    phone:          clientData?.phone      || '',
    email:          clientEmail,
    chambre:        'double',  // default room type
    persons:        1,         // default number of travellers
    gender:         '',
    hasMahram:      '',        // only relevant when gender === 'femme'
    passportNumber: '',
    note:           '',        // optional special requests
  });

  // loading: true while the fake 800ms "submit" delay is running
  const [loading, setLoading] = useState(false);

  // Generic field setter — avoids writing a handler per field
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // ── Derived pricing ────────────────────────────────────────────────
  const price      = pkg ? (pkg.price || pkg.prix || 0) : 0;
  // Total before any promo code (promo codes are applied on the payment page)
  const totalPrice = price * Number(form.persons);

  // ── Guard: no package selected ────────────────────────────────────
  // Shown when the user navigates directly to the URL without going
  // through the listing or detail page first.
  if (!pkg) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 160, textAlign: 'center', minHeight: '60vh' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: 48, color: 'var(--gray-300)', marginBottom: 20, display: 'block' }} />
          <h2 style={{ color: 'var(--gray-600)', marginBottom: 12 }}>Aucun forfait sélectionné</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 28 }}>Veuillez choisir un forfait depuis la page Omra.</p>
          <button
            onClick={() => navigate('/Omra/Omra')}
            style={{ padding: '14px 32px', background: 'var(--secondary)', color: 'var(--white)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            <i className="fas fa-arrow-left" /> Retour aux forfaits
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // ──handle multiple naming conventions
  const image     = pkg.image_url || pkg.image   || '';
  const duration  = pkg.duration  || pkg.duree   || 0;
  const departure = pkg.departure || pkg.depart  || '';
  const rating    = pkg.rating    || 5;
  const reviews   = pkg.reviews   || 0;
  const oldPrice  = pkg.old_price || pkg.oldPrice || null;

  // ── Submit handler ─────────────────────────────────────────────────
  /**
   * Called when the user clicks "Continuer vers le paiement".
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/Omra/OmraPayment/${pkg.id}`, {
        state: {
          // ── voyage: display metadata for the payment page sidebar ──
          voyage: {
            titre:       pkg.title,
            image,
            pays:        'Arabie Saoudite',
            destination: 'La Mecque & Médine',
            prix:        price,
            duree:       `${duration} jours`,
            depart:      departure,
            places:      pkg.spots ?? '—',
          },
          // ── booking: traveller contact details for confirmation email
          booking: {
            prenom:    form.firstName,
            nom:       form.lastName,
            email:     form.email,
            telephone: form.phone,
            personnes: String(form.persons),
            chambre:   form.chambre,
            notes:     form.note,
          },
          // ── base total (promo discount is applied on the payment page)
          totalPrix: totalPrice,
          // ── original package (the payment page doesn't re-fetch it)
          pkg,
          // ── reservationData: flat payload for POST /api/omra/reservations
          reservationData: {
            package_id:        pkg.id,
            first_name:        form.firstName,
            last_name:         form.lastName,
            email:             form.email,
            phone:             form.phone,
            gender:            form.gender,
            has_mahram:        form.hasMahram || null,
            passport_number:   form.passportNumber,
            chambre_type:      form.chambre,
            number_of_persons: Number(form.persons),
            total_price:       totalPrice,
            notes:             form.note || null,
          },
        },
      });
    }, 800);
  };

  // ── CSS for the locked email input (linked to client account) ──────
  const lockedStyle = {
    background: '#f8fafc', cursor: 'not-allowed',
    color: '#64748b', borderColor: '#e2e8f0',
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="omra-reserve">
        <div className="container">

          {/* Breadcrumb: Omra / package title / Réservation */}
          <div className="omra-page-breadcrumb" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/Omra/Omra')}>
              <i className="fas fa-arrow-left" /> Omra
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'var(--gray-400)' }} />
            <button
              onClick={() => navigate(`/Omra/Details/${pkg.id}`, { state: { pkg } })}
              style={{ color: 'var(--gray-500)' }}
            >
              {pkg.title}
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'var(--gray-400)' }} />
            <span style={{ color: 'var(--gray-700)', fontWeight: 700 }}>Réservation</span>
          </div>

          {/* Logged-in notice — only shown when a client is authenticated */}
          {clientEmail && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px', background: '#e0fbfc',
              border: '1px solid #a5f3fc', borderRadius: 12, marginBottom: 20,
            }}>
              <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
              <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                Connecté en tant que <strong>{clientEmail}</strong> — vos informations ont été pré-remplies.
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">
            {/* ── Left column: booking form ──────────────────────────── */}
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <h1 className="omra-reserve__form-header-title">
                    <i className="fas fa-kaaba" style={{ marginRight: 10, color: '#D4A017' }} />
                    Formulaire de réservation
                  </h1>
                  <p className="omra-reserve__form-header-desc">
                    Remplissez le formulaire ci-dessous. Vous choisirez votre mode de paiement à l'étape suivante.
                  </p>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>

                  {/* ── Section 1: Personal identity ────────────────── */}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                      <i className="fas fa-user" style={{ marginRight: 8 }} />Informations personnelles
                    </p>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label>Prénom *</label>
                        <input required value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Votre prénom" />
                      </div>
                      <div className="omra-reserve__field">
                        <label>Nom *</label>
                        <input required value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Votre nom" />
                      </div>
                    </div>
                    <div className="omra-reserve__form-row" style={{ marginTop: 16 }}>
                      <div className="omra-reserve__field">
                        <label>Genre *</label>
                        <select required value={form.gender} onChange={e => set('gender', e.target.value)}>
                          <option value="">Sélectionner</option>
                          <option value="homme">Homme</option>
                          <option value="femme">Femme</option>
                        </select>
                      </div>
                      <div className="omra-reserve__field">
                        <label>N° Passeport *</label>
                        <input required value={form.passportNumber} onChange={e => set('passportNumber', e.target.value)} placeholder="Ex : A12345678" />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'var(--gray-100)' }} />

                  {/* ── Section 2: Contact information ──────────────── */}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                      <i className="fas fa-address-book" style={{ marginRight: 8 }} />Contact
                    </p>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label>Téléphone *</label>
                        <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+216 XX XXX XXX" />
                      </div>
                      <div className="omra-reserve__field">
                        <label>
                          Email *
                          {/* Badge shown next to the label when the email is locked */}
                          {clientEmail && (
                            <span style={{ marginLeft: 8, fontSize: 10, background: '#e0fbfc', color: '#0e7490', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
                              <i className="fas fa-lock" style={{ marginRight: 3 }} />Lié au compte
                            </span>
                          )}
                        </label>
                        {/* Email is readOnly when a client is logged in — it must
                            match the account email for the backend to link the
                            reservation to the correct profile. */}
                        <input
                          required type="email" value={form.email}
                          onChange={e => !clientEmail && set('email', e.target.value)}
                          placeholder="votre@email.com"
                          readOnly={!!clientEmail}
                          style={clientEmail ? lockedStyle : {}}
                        />
                        {clientEmail && (
                          <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
                            L'email est lié à votre compte et ne peut pas être modifié.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'var(--gray-100)' }} />

                  {/* ── Section 3: Travel preferences ──────────────── */}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                      <i className="fas fa-plane" style={{ marginRight: 8 }} />Détails du voyage
                    </p>
                    <div className="omra-reserve__form-row">
                      <div className="omra-reserve__field">
                        <label>Type de chambre *</label>
                        <select required value={form.chambre} onChange={e => set('chambre', e.target.value)}>
                          <option value="single">Chambre single</option>
                          <option value="double">Chambre double</option>
                          <option value="triple">Chambre triple</option>
                        </select>
                      </div>
                      <div className="omra-reserve__field">
                        <label>Nombre de personnes *</label>
                        <select required value={form.persons} onChange={e => set('persons', e.target.value)}>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Mahram field — only relevant for women (Islamic pilgrimage rule) */}
                    {form.gender === 'femme' && (
                      <div className="omra-reserve__field" style={{ marginTop: 16 }}>
                        <label>Accompagnée d'un mahram ? *</label>
                        <select required value={form.hasMahram} onChange={e => set('hasMahram', e.target.value)}>
                          <option value="">Sélectionner</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non (moins de 45 ans — obligatoire)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{ height: 1, background: 'var(--gray-100)' }} />

                  {/* Special requests textarea */}
                  <div className="omra-reserve__field">
                    <label>Remarques / Besoins spéciaux (optionnel)</label>
                    <textarea
                      rows={4} value={form.note}
                      onChange={e => set('note', e.target.value)}
                      placeholder="Régime alimentaire particulier, mobilité réduite, demandes spéciales..."
                    />
                  </div>

                  {/* Terms & conditions checkbox — required before submission */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <input
                      type="checkbox" id="terms" required
                      style={{ marginTop: 3, accentColor: 'var(--secondary)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
                    />
                    <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, cursor: 'pointer' }}>
                      J'accepte les <a href="#" style={{ color: 'var(--secondary)' }}>conditions générales de vente</a> et la{' '}
                      <a href="#" style={{ color: 'var(--secondary)' }}>politique de confidentialité</a> de TICTAC VOYAGES.
                    </label>
                  </div>

                  {/* Submit button — triggers handleSubmit → navigate to payment */}
                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading
                      ? 'Chargement…'
                      : <><i className="fas fa-credit-card" style={{ marginRight: 8 }} />Continuer vers le paiement →</>
                    }
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>
                    <i className="fas fa-lock" style={{ marginRight: 5 }} />
                    Étape suivante : choisissez votre mode de paiement.
                  </p>
                </form>
              </div>
            </div>

            {/* ── Right column: package summary sidebar ──────────────── */}
            <div className="omra-details__sidebar">
              {/* Package preview card */}
              <div className="omra-reserve__pkg-card">
                <img className="omra-reserve__pkg-img" src={image} alt={pkg.title} />
                <div className="omra-reserve__pkg-info">
                  <h3 className="omra-reserve__pkg-title">{pkg.title}</h3>
                  <p className="omra-reserve__pkg-subtitle">{pkg.subtitle}</p>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item"><i className="fas fa-calendar-alt" /> {duration} jours</div>
                    <div className="omra-reserve__pkg-meta-item"><i className="fas fa-plane-departure" /> Départ : {departure}</div>
                    <div className="omra-reserve__pkg-meta-item"><i className="fas fa-star" style={{ color: '#D4A017' }} /> {rating} / 5 — {reviews} avis</div>
                  </div>
                </div>
              </div>

              {/* Live price summary — updates reactively as the user
                  changes the "Nombre de personnes" select */}
              <div className="omra-reserve__summary">
                <p className="omra-reserve__summary-title">Résumé du prix</p>
                <div className="omra-reserve__summary-row">
                  <span>Prix par personne</span>
                  <span style={{ fontWeight: 700, color: 'var(--white)' }}>{Number(price).toLocaleString('fr-TN')} TND</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>Nombre de personnes</span>
                  <span style={{ fontWeight: 700, color: 'var(--white)' }}>× {form.persons}</span>
                </div>
                {/* Show savings row only when the package has an old price */}
                {oldPrice && (
                  <div className="omra-reserve__summary-row">
                    <span>Économie</span>
                    <span style={{ color: '#D4A017', fontWeight: 700 }}>
                      −{((Number(oldPrice) - Number(price)) * Number(form.persons)).toLocaleString('fr-TN')} TND
                    </span>
                  </div>
                )}
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">Total estimé</span>
                  <span className="omra-reserve__summary-total-amount">{totalPrice.toLocaleString('fr-TN')} TND</span>
                </div>
              </div>

              {/* Help box — static contact info */}
              <div style={{ marginTop: 20, background: 'var(--white)', borderRadius: 16, padding: '20px', border: '1px solid var(--gray-100)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14 }}>
                  <i className="fas fa-headset" style={{ color: 'var(--secondary)', marginRight: 8 }} />Besoin d'aide ?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 14 }}>
                  Notre équipe est disponible du lundi au samedi de 09h à 18h.
                </p>
                <a href="tel:+21636149885" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--secondary)', textDecoration: 'none' }}>
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

export default Reserve;