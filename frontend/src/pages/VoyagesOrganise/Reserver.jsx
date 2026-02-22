import React, { useState } from 'react';

const Reserver = ({ voyage, onClose }) => {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    dateDepart: '',
    personnes: '2',
    chambre: 'double',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!voyage) return null;

  const { titre, image, pays, prix } = voyage;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const totalPrix = prix * parseInt(form.personnes || 1, 10);

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: connect to your API / backend
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="modal-header" style={{ height: 180 }}>
          <img src={image} alt={titre} />
          <div className="modal-header-overlay" />
          <div className="modal-header-content">
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#e0c070', marginBottom: 4, textTransform: 'uppercase' }}>
              Réservation
            </p>
            <h2 style={{ fontSize: '1.5rem' }}>{titre}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">

          {submitted ? (
            /* SUCCESS STATE */
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h3>Réservation confirmée !</h3>
              <p>
                Merci <strong>{form.prenom}</strong> ! Votre demande de réservation pour{' '}
                <strong>{titre}</strong> a bien été reçue.<br />
                Un conseiller vous contactera sous 24h à <strong>{form.email}</strong>.
              </p>
              <button
                className="btn-reserver"
                style={{ marginTop: 24, padding: '12px 32px' }}
                onClick={onClose}
              >
                Fermer
              </button>
            </div>
          ) : (
            /* FORM */
            <form className="reserver-form" onSubmit={handleSubmit}>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prenom">Prénom *</label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    placeholder="Votre prénom"
                    value={form.prenom}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nom">Nom *</label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    placeholder="Votre nom"
                    value={form.nom}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telephone">Téléphone</label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    value={form.telephone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateDepart">Date de départ *</label>
                  <input
                    id="dateDepart"
                    name="dateDepart"
                    type="date"
                    required
                    value={form.dateDepart}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="personnes">Nombre de voyageurs</label>
                  <input
                    id="personnes"
                    name="personnes"
                    type="number"
                    min="1"
                    max="20"
                    value={form.personnes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="chambre">Type de chambre</label>
                <select
                  id="chambre"
                  name="chambre"
                  value={form.chambre}
                  onChange={handleChange}
                >
                  <option value="single">Chambre single</option>
                  <option value="double">Chambre double</option>
                  <option value="triple">Chambre triple</option>
                  <option value="suite">Suite</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Demandes spéciales</label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  placeholder="Allergies, préférences, accessibilité..."
                  value={form.notes}
                  onChange={handleChange}
                  style={{ padding: '12px 16px' }}
                />
              </div>

              {/* Summary */}
              <div className="reserver-summary">
                <div>
                  <div className="rs-label">Total estimé</div>
                  <div style={{ fontSize: '0.8rem', color: '#4a4a6a', marginTop: 2 }}>
                    {prix.toLocaleString('fr-FR')} TND × {form.personnes} pers.
                  </div>
                </div>
                <div className="rs-total">
                  {totalPrix.toLocaleString('fr-FR')} TND
                </div>
              </div>

              <button type="submit" className="btn-confirm">
                Confirmer la réservation →
              </button>

              <p style={{ fontSize: '0.75rem', color: '#8a8aaa', textAlign: 'center' }}>
                Aucun paiement immédiat. Un conseiller vous contactera pour finaliser votre dossier.
              </p>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Reserver;