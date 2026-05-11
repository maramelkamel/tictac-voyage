import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/omrastyle.css';

const CircuitReserver = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('circuits');

  const clientData = (() => {
    try {
      return JSON.parse(localStorage.getItem('client') || '{}');
    } catch {
      return {};
    }
  })();

  const clientEmail = clientData?.email || '';

  const [form, setForm] = useState({
    prenom: clientData?.firstName || clientData?.first_name || '',
    nom: clientData?.lastName || clientData?.last_name || '',
    email: clientEmail,
    telephone: clientData?.phone || '',
    personnes: '1',
    chambre: 'double',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  if (!state?.circuit) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '160px 24px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>:(</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>
            {t('not_found')}
          </p>
          <button
            className="omra-reserve__submit"
            style={{ width: 'auto', padding: '14px 28px' }}
            onClick={() => navigate('/circuits/circuit')}
          >
            {t('back_to_circuits')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const circuit = state.circuit;
  const { title, image, price, duration, departure, places } = circuit;
  const totalPrix = price * parseInt(form.personnes || 1, 10);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/circuits/CircuitPayment/${id}`, {
        state: { circuit, booking: form, totalPrix },
      });
    }, 800);
  };

  const lockedStyle = {
    background: '#f8fafc',
    cursor: 'not-allowed',
    color: '#64748b',
    borderColor: '#e2e8f0',
  };

  return (
    <div>
      <Navbar />
      <div className="omra-reserve" style={{ paddingTop: 180 }}>
        <div className="container">
          <div className="omra-page-breadcrumb omra-page-breadcrumb--light" style={{ paddingTop: 8 }}>
            <button onClick={() => navigate('/circuits')}>{t('back_to_circuits')}</button>
            <span>/</span>
            <button onClick={() => navigate(-1)}>{title}</button>
            <span>/</span>
            <span>{t('booking.title')}</span>
          </div>

          {clientEmail && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 18px',
                background: '#e0fbfc',
                border: '1px solid #a5f3fc',
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <i className="fas fa-user-check" style={{ color: '#0e7490', fontSize: 14 }} />
              <p style={{ fontSize: 13, color: '#0e7490', fontWeight: 600, margin: 0 }}>
                <Trans
                  i18nKey="booking.prefilled"
                  ns="circuits"
                  values={{ email: clientEmail }}
                  components={{ strong: <strong /> }}
                />
              </p>
            </div>
          )}

          <div className="omra-reserve__layout">
            <div>
              <div className="omra-reserve__form-card">
                <div className="omra-reserve__form-header">
                  <div className="omra-reserve__form-header-title">{t('booking.title')}</div>
                  <div className="omra-reserve__form-header-desc">{t('booking.desc')}</div>
                </div>

                <form className="omra-reserve__form-body" onSubmit={handleSubmit}>
                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="prenom">{t('booking.prenom')}</label>
                      <input
                        id="prenom"
                        name="prenom"
                        type="text"
                        required
                        placeholder={t('booking.prenom').replace(' *', '')}
                        value={form.prenom}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="nom">{t('booking.nom')}</label>
                      <input
                        id="nom"
                        name="nom"
                        type="text"
                        required
                        placeholder={t('booking.nom').replace(' *', '')}
                        value={form.nom}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="email">
                        {t('booking.email')}
                        {clientEmail && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 10,
                              background: '#e0fbfc',
                              color: '#0e7490',
                              padding: '2px 7px',
                              borderRadius: 999,
                              fontWeight: 600,
                            }}
                          >
                            <i className="fas fa-lock" style={{ marginRight: 3 }} />
                            {t('booking.email_locked')}
                          </span>
                        )}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={form.email}
                        onChange={(event) => {
                          if (!clientEmail) handleChange(event);
                        }}
                        readOnly={!!clientEmail}
                        style={clientEmail ? lockedStyle : {}}
                      />
                      {clientEmail && (
                        <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
                          {t('booking.email_locked_info')}
                        </p>
                      )}
                    </div>
                    <div className="omra-reserve__field">
                      <label htmlFor="telephone">{t('booking.telephone')}</label>
                      <input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        placeholder={t('booking.tel_placeholder')}
                        value={form.telephone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="omra-reserve__form-row">
                    <div className="omra-reserve__field">
                      <label htmlFor="personnes">{t('booking.participants')}</label>
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
                    <div className="omra-reserve__field">
                      <label htmlFor="chambre">{t('booking.chambre')}</label>
                      <select id="chambre" name="chambre" value={form.chambre} onChange={handleChange}>
                        <option value="single">{t('booking.chambre_single')}</option>
                        <option value="double">{t('booking.chambre_double')}</option>
                        <option value="triple">{t('booking.chambre_triple')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="omra-reserve__field">
                    <label htmlFor="notes">{t('booking.notes')}</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      placeholder={t('booking.notes_placeholder')}
                      value={form.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="omra-reserve__submit" disabled={loading}>
                    {loading ? t('booking.loading') : t('booking.continue')}
                  </button>
                  <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center' }}>
                    {t('booking.next_step')}
                  </p>
                </form>
              </div>
            </div>

            <aside style={{ position: 'sticky', top: 170 }}>
              <div className="omra-reserve__pkg-card">
                {image && <img src={image} alt={title} className="omra-reserve__pkg-img" />}
                <div className="omra-reserve__pkg-info">
                  <div className="omra-reserve__pkg-subtitle">{t('booking.title')}</div>
                  <div className="omra-reserve__pkg-title">{title}</div>
                  <div className="omra-reserve__pkg-meta">
                    <div className="omra-reserve__pkg-meta-item">{duration}</div>
                    <div className="omra-reserve__pkg-meta-item">
                      {t('detail.departure_label')} {departure || 'Tunis'}
                    </div>
                    <div className="omra-reserve__pkg-meta-item">
                      {t('places_remaining', { count: places })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="omra-reserve__summary">
                <div className="omra-reserve__summary-title">{t('payment.amount')}</div>
                <div className="omra-reserve__summary-row">
                  <span>{t('booking.price_per_person')}</span>
                  <span>{price.toLocaleString('fr-FR')} DT</span>
                </div>
                <div className="omra-reserve__summary-row">
                  <span>{t('booking.participants_label')}</span>
                  <span>x {form.personnes}</span>
                </div>
                <div className="omra-reserve__summary-total">
                  <span className="omra-reserve__summary-total-label">{t('booking.total')}</span>
                  <span className="omra-reserve__summary-total-amount">
                    {totalPrix.toLocaleString('fr-FR')} DT
                  </span>
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
