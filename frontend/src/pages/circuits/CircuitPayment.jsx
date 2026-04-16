// src/pages/Circuits/CircuitPayment.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Payment.css';

const API_RES = 'http://localhost:5000/api/circuit-reservations';

const CircuitPayment = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { id }     = useParams();
  const { t }      = useTranslation('circuits');

  const [method,    setMethod]    = useState(null);
  const [cardType,  setCardType]  = useState('visa');
  const [cardForm,  setCardForm]  = useState({ cardNumber:'', cardName:'', expiry:'', cvv:'', billingAddr:'', billingCity:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState('');

  if (!state?.circuit || !state?.booking) {
    return (
      <div className="payment-page"><Navbar/>
        <div style={{ textAlign:'center', padding:'160px 24px' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>😕</div>
          <p style={{ fontSize:'18px', fontWeight:700, color:'#0a2832', marginBottom:16 }}>{t('not_found', { ns: 'common' })}</p>
          <button className="payment-fallback__btn" onClick={() => navigate('/circuits')}>{t('back_to_circuits')}</button>
        </div>
        <Footer/>
      </div>
    );
  }

  const { circuit, booking, totalPrix } = state;
  const { title, image, price, duration, departure } = circuit;
  const personnes = parseInt(booking.personnes || 1, 10);

  const saveReservation = async (paymentMethod) => {
    const payload = {
      circuit_id: circuit.id || null, first_name: booking.prenom, last_name: booking.nom,
      email: booking.email, phone: booking.telephone || null, chambre_type: booking.chambre || 'double',
      number_of_persons: personnes, total_price: totalPrix, payment_method: paymentMethod, notes: booking.notes || null,
    };
    const r    = await fetch(API_RES, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
    const json = await r.json();
    if (!json.success) throw new Error(json.message || 'Erreur serveur');
    return json.data;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
    if (name === 'expiry')     { v = value.replace(/\D/g,'').slice(0,4); if (v.length > 2) v = v.slice(0,2)+'/'+v.slice(2); }
    if (name === 'cvv')        v = value.replace(/\D/g,'').slice(0,4);
    setCardForm({ ...cardForm, [name]: v });
  };

  const handleOnlineSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setApiError('');
    try { await saveReservation('online'); setSubmitted(true); }
    catch (err) { setApiError(err.message); }
    finally { setLoading(false); }
  };

  const handleAgencyConfirm = async () => {
    setLoading(true); setApiError('');
    try { await saveReservation('agency'); setSubmitted(true); }
    catch (err) { setApiError(err.message); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="payment-page"><Navbar/>
        <div className="payment-success">
          <div className="payment-success__card">
            <div className="payment-success__icon">✓</div>
            <h2 className="payment-success__title">
              {method === 'agency' ? t('payment.success_agency_title') : t('payment.success_online_title')}
            </h2>
            <p className="payment-success__desc">
              <Trans
                i18nKey={method === 'agency' ? 'payment.success_agency_desc' : 'payment.success_online_desc'}
                ns="circuits"
                values={{ name: `${booking.prenom} ${booking.nom}`, title, email: booking.email, amount: totalPrix.toLocaleString('fr-FR') }}
                components={{ strong: <strong /> }}
              />
            </p>
            <div className="payment-success__actions">
              <button className="payment-success__btn" onClick={() => navigate('/circuits')}>{t('payment.see_other_circuits')}</button>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  const steps = [
    { n:1, label: t('payment.info_step'),    state:'done' },
    { n:2, label: t('payment.payment_step'), state:'active' },
    { n:3, label: t('payment.confirm_step'), state:'pending' },
  ];

  return (
    <div className="payment-page"><Navbar/>
      <div className="payment-hero">
        <div className="container">
          <div className="payment-breadcrumb">
            <button className="payment-breadcrumb__btn" onClick={() => navigate('/circuits')}>{t('back_to_circuits')}</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-2)}>{title}</button>
            <span className="payment-breadcrumb__sep">/</span>
            <button className="payment-breadcrumb__btn" onClick={() => navigate(-1)}>{t('payment.info_step')}</button>
            <span className="payment-breadcrumb__sep">/</span>
            <span className="payment-breadcrumb__current">{t('payment.payment_step')}</span>
          </div>
          <div className="payment-steps">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="payment-step">
                  <div className={`payment-step__circle payment-step__circle--${step.state}`}>{step.state==='done'?'✓':step.n}</div>
                  <span className={`payment-step__label payment-step__label--${step.state}`}>{step.label}</span>
                </div>
                {i < 2 && <div className={`payment-step__line payment-step__line--${i===0?'done':'pending'}`}/>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="payment-body">
        <div className="container">
          <div className="payment-layout">
            <div>
              <div className="payment-total-banner">
                <div>
                  <div className="payment-total-banner__label">{t('payment.amount_label')}</div>
                  <div className="payment-total-banner__amount">{totalPrix.toLocaleString('fr-FR')} <span>DT</span></div>
                  <div className="payment-total-banner__sub">{price.toLocaleString('fr-FR')} DT × {personnes} {personnes > 1 ? t('payment.participants_x_plural', { count: personnes }).replace(`× ${personnes} `, '') : t('payment.participants_x', { count: personnes }).replace(`× ${personnes} `, '')}</div>
                </div>
                <div className="payment-total-banner__badge">{t('payment.secure_badge')}</div>
              </div>

              {apiError && <div style={{ margin:'0 0 16px', padding:'12px 16px', background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, fontSize:13, color:'#991b1b', fontWeight:600 }}>❌ {apiError}</div>}

              <div className="payment-card">
                <h3 className="payment-card__title">{t('payment.choose_method')}</h3>
                <p className="payment-card__subtitle">{t('payment.choose_method_desc')}</p>
                <div className="payment-method-row">
                  <button className={`payment-method-btn ${method==='online'?'payment-method-btn--online':''}`} onClick={() => setMethod('online')}>
                    <div className="payment-method-btn__icon">💳</div>
                    <div className={`payment-method-btn__title ${method==='online'?'payment-method-btn__title--online':''}`}>{t('payment.online')}</div>
                    <div className="payment-method-btn__desc">{t('payment.online_desc')}</div>
                    {method==='online' && <div className="payment-method-btn__badge payment-method-btn__badge--online">{t('payment.selected')}</div>}
                  </button>
                  <button className={`payment-method-btn ${method==='agency'?'payment-method-btn--agency':''}`} onClick={() => setMethod('agency')}>
                    <div className="payment-method-btn__icon">🏪</div>
                    <div className={`payment-method-btn__title ${method==='agency'?'payment-method-btn__title--agency':''}`}>{t('payment.agency')}</div>
                    <div className="payment-method-btn__desc">{t('payment.agency_desc')}</div>
                    {method==='agency' && <div className="payment-method-btn__badge payment-method-btn__badge--agency">{t('payment.selected')}</div>}
                  </button>
                </div>
              </div>

              {method==='online' && (
                <div className="payment-card">
                  <h3 className="payment-card__title">{t('payment.card_info_title')}</h3>
                  <div style={{ marginBottom:22 }}>
                    <label className="pay-label">{t('payment.card_type')}</label>
                    <div className="card-types">
                      {[{key:'visa',label:'Visa',icon:'💳'},{key:'mastercard',label:'Mastercard',icon:'🔴'},{key:'edinar',label:'e-Dinar',icon:'🇹🇳'},{key:'amex',label:'Amex',icon:'🟦'}].map(c => (
                        <button key={c.key} type="button" className={`card-type-btn ${cardType===c.key?'card-type-btn--selected':''}`} onClick={()=>setCardType(c.key)}>
                          <span>{c.icon}</span> {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <form className="pay-form" onSubmit={handleOnlineSubmit}>
                    <div className="pay-field">
                      <label className="pay-label">{t('payment.card_number')}</label>
                      <div className="pay-input-wrapper">
                        <input className="pay-input pay-input--icon-right" name="cardNumber" type="text" placeholder="0000 0000 0000 0000" required maxLength={19} value={cardForm.cardNumber} onChange={handleCardChange}/>
                        <span className="pay-input-icon">{cardType==='visa'?'💳':cardType==='mastercard'?'🔴':cardType==='edinar'?'🇹🇳':'🟦'}</span>
                      </div>
                    </div>
                    <div className="pay-field">
                      <label className="pay-label">{t('payment.card_name')}</label>
                      <input className="pay-input" name="cardName" type="text" placeholder="PRÉNOM NOM" required value={cardForm.cardName} onChange={handleCardChange} style={{ textTransform:'uppercase' }}/>
                    </div>
                    <div className="pay-form-row">
                      <div className="pay-field">
                        <label className="pay-label">{t('payment.expiry')}</label>
                        <input className="pay-input" name="expiry" type="text" placeholder="MM/AA" required maxLength={5} value={cardForm.expiry} onChange={handleCardChange}/>
                      </div>
                      <div className="pay-field">
                        <label className="pay-label">{t('payment.cvv')}</label>
                        <div className="pay-input-wrapper">
                          <input className="pay-input pay-input--icon-right" name="cvv" type="password" placeholder="•••" required maxLength={4} value={cardForm.cvv} onChange={handleCardChange}/>
                          <span className="pay-input-info" title="Code 3 ou 4 chiffres">ℹ️</span>
                        </div>
                      </div>
                    </div>
                    <div className="payment-security-note">
                      <span className="payment-security-note__icon">🔒</span>
                      <div>
                        <div className="payment-security-note__title">{t('payment.ssl_title')}</div>
                        <div className="payment-security-note__desc">{t('payment.ssl_desc')}</div>
                      </div>
                    </div>
                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                      {loading ? t('payment.processing') : t('payment.pay_btn', { amount: totalPrix.toLocaleString('fr-FR') })}
                    </button>
                  </form>
                </div>
              )}

              {method==='agency' && (
                <div className="payment-card payment-card--pink">
                  <h3 className="payment-card__title">{t('payment.agency_title')}</h3>
                  <div style={{ borderRadius:14, overflow:'hidden', marginBottom:20, border:'1px solid var(--pay-border)' }}>
                    <iframe title="Tictac Voyages" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn" width="100%" height="200" style={{ border:0, display:'block' }} allowFullScreen="" loading="lazy"/>
                  </div>
                  {[
                    { icon:'📍', label: t('payment.agency_contact.address_label'), value: t('payment.agency_contact.address_value') },
                    { icon:'📞', label: t('payment.agency_contact.phone_label'),   value: t('payment.agency_contact.phone_value') },
                    { icon:'🕐', label: t('payment.agency_contact.hours_label'),   value: t('payment.agency_contact.hours_value') },
                  ].map((item,i) => (
                    <div key={i} className="agency-contact-item">
                      <span className="agency-contact-item__icon">{item.icon}</span>
                      <div><div className="agency-contact-item__label">{item.label}</div><div className="agency-contact-item__value">{item.value}</div></div>
                    </div>
                  ))}
                  <div className="agency-warning" style={{ marginTop:16 }}>
                    <Trans i18nKey="payment.agency_warning" ns="circuits" components={{ strong: <strong /> }} />
                  </div>
                  <button className="payment-submit-btn" onClick={handleAgencyConfirm} disabled={loading}>
                    {loading ? t('payment.confirming') : t('payment.agency_confirm_btn')}
                  </button>
                </div>
              )}
            </div>

            <aside className="payment-sidebar">
              <div className="payment-trip-card">
                {image && <img src={image} alt={title} className="payment-trip-card__img"/>}
                <div className="payment-trip-card__body">
                  <div className="payment-trip-card__country">{t('reserver_title')}</div>
                  <div className="payment-trip-card__title">{title}</div>
                  <div className="payment-trip-card__meta">
                    {[
                      { icon:'🕐', text: duration },
                      { icon:'✈️', text: `${t('detail.departure_label')} ${departure || 'Tunis'}` },
                      { icon:'👥', text: t('payment.participants_x', { count: personnes }) },
                      { icon:'🛏️', text: `Chambre ${booking.chambre}` },
                    ].map((item,i) => (
                      <div key={i} className="payment-trip-card__meta-item"><span>{item.icon}</span> {item.text}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="payment-price-card">
                <div className="payment-price-card__title">{t('summary.title')}</div>
                {[
                  { label: t('payment.price_per_participant'), value: `${price.toLocaleString('fr-FR')} DT` },
                  { label: t('payment.participants_x', { count: personnes }), value: `${totalPrix.toLocaleString('fr-FR')} DT` },
                  { label: t('payment.taxes'), value: t('payment.taxes_value') },
                ].map((row,i) => (
                  <div key={i} className="payment-price-row"><span>{row.label}</span><span className="payment-price-row__value">{row.value}</span></div>
                ))}
                <div className="payment-price-total">
                  <span className="payment-price-total__label">{t('payment.total')}</span>
                  <span className="payment-price-total__amount">{totalPrix.toLocaleString('fr-FR')} DT</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default CircuitPayment;