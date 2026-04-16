// src/pages/Contact.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Contact.css';

const ContactPage = () => {
  const { t } = useTranslation('contact');
  const [form, setForm]           = useState({ nom:'', email:'', telephone:'', sujet:'', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/contact', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { setSubmitted(true); setForm({ nom:'', email:'', telephone:'', sujet:'', message:'' }); }
      else alert(data.message || "Erreur lors de l'envoi");
    } catch { alert(t('error_server', { ns: 'common' })); }
    finally { setLoading(false); }
  };

  const contactCards = [
    { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.19 12.9a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>),
      title: t('phone_title'), value: '+216 36 149 885', sub: t('phone_sub'), href: 'tel:+21636149885', cta: t('phone_cta'), color: 'teal' },
    { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>),
      title: t('email_title'), value: 'tictacvoyages@gmail.com', sub: t('email_sub'), href: 'mailto:tictacvoyages@gmail.com', cta: t('email_cta'), color: 'accent' },
    { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>),
      title: t('whatsapp_title'), value: '+216 36 149 885', sub: t('whatsapp_sub'), href: 'https://wa.me/21636149885', cta: t('whatsapp_cta'), color: 'green' },
    { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>),
      title: t('address_title'), value: t('address_value'), sub: t('address_sub'), href: 'https://maps.google.com/?q=Nouvelle+Medina+Tunis', cta: t('address_cta'), color: 'indigo' },
  ];

  const values = [
    { icon:'💎', title: t('value_excellence_title'), desc: t('value_excellence_desc') },
    { icon:'🤝', title: t('value_trust_title'),      desc: t('value_trust_desc') },
    { icon:'🌍', title: t('value_passion_title'),    desc: t('value_passion_desc') },
  ];

  const tags = ['voyages','omra','transport','hotels','sur_mesure','billetterie'];

  return (
    <div className="ct-page">
      <Navbar />

      <section className="ct-hero">
        <div className="ct-hero__bg"/>
        <div className="ct-hero__overlay"/>
        <div className="ct-hero__content">
          <span className="ct-hero__tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {t('hero_tag')}
          </span>
          <h1 className="ct-hero__title">
            {t('hero_title_line1')}<br/>
            <span className="ct-hero__accent">{t('hero_title_accent')}</span>
          </h1>
          <p className="ct-hero__sub">{t('hero_sub')}</p>
        </div>
      </section>

      <section className="ct-section ct-section--cards">
        <div className="ct-container">
          <div className="ct-section__head">
            <span className="ct-badge">{t('section_cards_badge')}</span>
            <h2 className="ct-section__title">{t('section_cards_title')}</h2>
            <p className="ct-section__sub">{t('section_cards_sub')}</p>
          </div>
          <div className="ct-cards">
            {contactCards.map((c, i) => (
              <a key={i} href={c.href} target={c.href.startsWith('http')?'_blank':undefined} rel={c.href.startsWith('http')?'noopener noreferrer':undefined} className={`ct-card ct-card--${c.color}`}>
                <div className="ct-card__icon">{c.icon}</div>
                <div className="ct-card__body">
                  <p className="ct-card__label">{c.title}</p>
                  <p className="ct-card__value">{c.value}</p>
                  <p className="ct-card__sub">{c.sub}</p>
                </div>
                <span className="ct-card__cta">
                  {c.cta}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="ct-section ct-section--form">
        <div className="ct-container">
          <div className="ct-layout">
            <div className="ct-form-wrap">
              {submitted ? (
                <div className="ct-success">
                  <div className="ct-success__icon">✓</div>
                  <h2>{t('success_title')}</h2>
                  <p>{t('success_desc')}</p>
                  <button className="ct-btn ct-btn--outline" onClick={() => setSubmitted(false)}>{t('send_another')}</button>
                </div>
              ) : (
                <>
                  <div className="ct-form-head">
                    <h2>{t('form_title')}</h2>
                    <p>{t('form_sub')}</p>
                  </div>
                  <form onSubmit={handleSubmit} className="ct-form">
                    <div className="ct-form__row">
                      <div className="ct-field">
                        <label>{t('field_name')} <span>*</span></label>
                        <input name="nom" type="text" placeholder={t('field_name')} required value={form.nom} onChange={handleChange}/>
                      </div>
                      <div className="ct-field">
                        <label>{t('field_email')} <span>*</span></label>
                        <input name="email" type="email" placeholder="votre@email.com" required value={form.email} onChange={handleChange}/>
                      </div>
                    </div>
                    <div className="ct-form__row">
                      <div className="ct-field">
                        <label>{t('field_phone')}</label>
                        <input name="telephone" type="tel" placeholder="+216 XX XXX XXX" value={form.telephone} onChange={handleChange}/>
                      </div>
                      <div className="ct-field">
                        <label>{t('field_subject')} <span>*</span></label>
                        <select name="sujet" required value={form.sujet} onChange={handleChange}>
                          <option value="">{t('subject_placeholder')}</option>
                          <option value="omra">{t('subject_omra')}</option>
                          <option value="voyage">{t('subject_voyage')}</option>
                          <option value="transport">{t('subject_transport')}</option>
                          <option value="hotel">{t('subject_hotel')}</option>
                          <option value="sur-mesure">{t('subject_sur_mesure')}</option>
                          <option value="autre">{t('subject_autre')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="ct-field">
                      <label>{t('field_message')} <span>*</span></label>
                      <textarea name="message" rows={5} placeholder={t('message_placeholder')} required value={form.message} onChange={handleChange}/>
                    </div>
                    <button type="submit" className="ct-btn ct-btn--primary" disabled={loading}>
                      {loading
                        ? <><span className="ct-spinner"/> {t('submitting')}</>
                        : <>{t('submit_btn')} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                      }
                    </button>
                    <p className="ct-form__note">{t('data_confidential', { ns: 'common' })}</p>
                  </form>
                </>
              )}
            </div>

            <div className="ct-sidebar">
              <div className="ct-about">
                <div className="ct-about__deco" aria-hidden="true">✈</div>
                <span className="ct-about__badge">{t('about_badge')}</span>
                <h3>{t('about_title_line1')}<br/><strong>{t('about_title_strong')}</strong></h3>
                <p>{t('about_desc')}</p>
                <div className="ct-about__tags">
                  {tags.map((tag, i) => <span key={i} className="ct-about__tag">{t(`tags.${tag}`)}</span>)}
                </div>
              </div>

              <div className="ct-hours">
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {t('hours_title')}
                </h3>
                <div className="ct-hours__list">
                  {[
                    { day: t('hours_weekdays'), hours: t('hours_weekdays_val'), open:true  },
                    { day: t('hours_saturday'), hours: t('hours_saturday_val'), open:true  },
                    { day: t('hours_sunday'),   hours: t('hours_sunday_val'),   open:false },
                  ].map((r, i) => (
                    <div key={i} className="ct-hours__row">
                      <span className="ct-hours__day">{r.day}</span>
                      <span className={`ct-hours__pill ${r.open?'ct-hours__pill--open':'ct-hours__pill--closed'}`}>{r.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ct-map">
                <iframe title="Tictac Voyages Tunis" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn" width="100%" height="170" style={{ border:0, display:'block' }} allowFullScreen="" loading="lazy"/>
                <div className="ct-map__footer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <div><p>{t('address_value')}</p><span>{t('address_sub')}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-section ct-section--values">
        <div className="ct-container">
          <div className="ct-section__head">
            <span className="ct-badge ct-badge--light">{t('values_badge')}</span>
            <h2 className="ct-section__title ct-section__title--light">{t('values_title')}</h2>
          </div>
          <div className="ct-values">
            {values.map((v, i) => (
              <div key={i} className="ct-value">
                <div className="ct-value__icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default ContactPage;