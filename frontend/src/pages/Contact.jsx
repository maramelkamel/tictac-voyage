// src/pages/Contact.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Contact.css';

const ContactPage = () => {
  const [form, setForm]           = useState({ nom: '', email: '', telephone: '', sujet: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  const contactCards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.19 12.9a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      title: 'Téléphone',
      value: '+216 36 149 885',
      sub:   'Lun – Sam · 9h à 18h',
      href:  'tel:+21636149885',
      cta:   'Appeler maintenant',
      color: 'teal',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M22 7l-10 7L2 7"/>
        </svg>
      ),
      title: 'Email',
      value: 'tictacvoyages@gmail.com',
      sub:   'Réponse sous 24h',
      href:  'mailto:tictacvoyages@gmail.com',
      cta:   'Envoyer un email',
      color: 'accent',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
        </svg>
      ),
      title: 'WhatsApp',
      value: '+216 36 149 885',
      sub:   'Disponible 7j/7',
      href:  'https://wa.me/21636149885',
      cta:   'Ouvrir WhatsApp',
      color: 'green',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      title: 'Adresse',
      value: 'Nouvelle Medina, Tunis',
      sub:   'Tunisie',
      href:  'https://maps.google.com/?q=Nouvelle+Medina+Tunis',
      cta:   'Voir sur la carte',
      color: 'indigo',
    },
  ];

  const values = [
    { icon: '💎', title: 'Excellence',  desc: 'Des prestations soigneusement sélectionnées pour chaque budget et chaque envie.' },
    { icon: '🤝', title: 'Confiance',   desc: 'Plus de 15 ans de transparence et de fiabilité avec nos clients à travers la Tunisie.' },
    { icon: '🌍', title: 'Passion',     desc: "Une équipe de voyageurs passionnés qui connaissent chaque destination sur le bout des doigts." },
  ];

  return (
    <div className="ct-page">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="ct-hero">
        <div className="ct-hero__bg" />
        <div className="ct-hero__overlay" />
        <div className="ct-hero__content">
          <span className="ct-hero__tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Tunis, Tunisie — Agence de voyage
          </span>
          <h1 className="ct-hero__title">
            Contactez<br/>
            <span className="ct-hero__accent">Tictac Voyages</span>
          </h1>
          <p className="ct-hero__sub">
            Notre équipe de passionnés est là pour transformer
            votre rêve de voyage en réalité.
          </p>
        </div>
      </section>

      {/* ══ COMMENT NOUS REJOINDRE ══ */}
      <section className="ct-section ct-section--cards">
        <div className="ct-container">
          <div className="ct-section__head">
            <span className="ct-badge">Nos coordonnées</span>
            <h2 className="ct-section__title">Comment nous rejoindre</h2>
            <p className="ct-section__sub">Cliquez sur la carte de votre choix pour nous contacter directement.</p>
          </div>
          <div className="ct-cards">
            {contactCards.map((c, i) => (
              <a
                key={i}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`ct-card ct-card--${c.color}`}
              >
                <div className="ct-card__icon">{c.icon}</div>
                <div className="ct-card__body">
                  <p className="ct-card__label">{c.title}</p>
                  <p className="ct-card__value">{c.value}</p>
                  <p className="ct-card__sub">{c.sub}</p>
                </div>
                <span className="ct-card__cta">
                  {c.cta}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FORMULAIRE + SIDEBAR ══ */}
      <section className="ct-section ct-section--form">
        <div className="ct-container">
          <div className="ct-layout">

            {/* Formulaire */}
            <div className="ct-form-wrap">
              {submitted ? (
                <div className="ct-success">
                  <div className="ct-success__icon">✓</div>
                  <h2>Message envoyé !</h2>
                  <p>Merci de nous avoir contactés.<br/>Un conseiller vous répondra sous 24h.</p>
                  <button className="ct-btn ct-btn--outline" onClick={() => setSubmitted(false)}>
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <div className="ct-form-head">
                    <h2>Envoyez-nous un message</h2>
                    <p>Réponse garantie sous 24h ouvrables.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="ct-form">
                    <div className="ct-form__row">
                      <div className="ct-field">
                        <label>Nom complet <span>*</span></label>
                        <input name="nom" type="text" placeholder="Votre nom" required value={form.nom} onChange={handleChange}/>
                      </div>
                      <div className="ct-field">
                        <label>Email <span>*</span></label>
                        <input name="email" type="email" placeholder="votre@email.com" required value={form.email} onChange={handleChange}/>
                      </div>
                    </div>
                    <div className="ct-form__row">
                      <div className="ct-field">
                        <label>Téléphone</label>
                        <input name="telephone" type="tel" placeholder="+216 XX XXX XXX" value={form.telephone} onChange={handleChange}/>
                      </div>
                      <div className="ct-field">
                        <label>Sujet <span>*</span></label>
                        <select name="sujet" required value={form.sujet} onChange={handleChange}>
                          <option value="">Choisir...</option>
                          <option value="omra">Omra</option>
                          <option value="voyage">Voyage organisé</option>
                          <option value="transport">Transport / Bus</option>
                          <option value="hotel">Hôtel</option>
                          <option value="sur-mesure">Voyage sur mesure</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>
                    <div className="ct-field">
                      <label>Message <span>*</span></label>
                      <textarea name="message" rows={5} placeholder="Décrivez votre projet, vos dates, votre budget…" required value={form.message} onChange={handleChange}/>
                    </div>
                    <button type="submit" className="ct-btn ct-btn--primary" disabled={loading}>
                      {loading
                        ? <><span className="ct-spinner"/> Envoi en cours…</>
                        : <>Envoyer mon message
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                          </>
                      }
                    </button>
                    <p className="ct-form__note">🔒 Vos données sont confidentielles et ne seront jamais partagées.</p>
                  </form>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="ct-sidebar">

              {/* À propos */}
              <div className="ct-about">
                <div className="ct-about__deco" aria-hidden="true">✈</div>
                <span className="ct-about__badge">🏆 Fondée en 2010</span>
                <h3>À propos de<br/><strong>Tictac Voyages</strong></h3>
                <p>
                  Depuis 2010, <strong>Tictac Voyages</strong> accompagne plus de{' '}
                  <strong>12 000 voyageurs</strong>. Spécialisés en voyages organisés,
                  Omra, transport et séjours sur mesure, nous mettons notre expertise
                  à votre service avec passion et professionnalisme.
                </p>
                <div className="ct-about__tags">
                  {['Voyages Organisés','Omra & Hajj','Transport','Hôtels','Sur Mesure','Billetterie'].map((t, i) => (
                    <span key={i} className="ct-about__tag">{t}</span>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div className="ct-hours">
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  Horaires d'ouverture
                </h3>
                <div className="ct-hours__list">
                  {[
                    { day: 'Lundi – Vendredi', hours: '09:00 – 18:00', open: true  },
                    { day: 'Samedi',           hours: '09:00 – 14:00', open: true  },
                    { day: 'Dimanche',         hours: 'Fermé',         open: false },
                  ].map((r, i) => (
                    <div key={i} className="ct-hours__row">
                      <span className="ct-hours__day">{r.day}</span>
                      <span className={`ct-hours__pill ${r.open ? 'ct-hours__pill--open' : 'ct-hours__pill--closed'}`}>
                        {r.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carte Google Maps */}
              <div className="ct-map">
                <iframe
                  title="Tictac Voyages Tunis"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn"
                  width="100%" height="170"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen="" loading="lazy"
                />
                <div className="ct-map__footer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p>Nouvelle Medina, Tunis</p>
                    <span>Tunisie</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VALEURS ══ */}
      <section className="ct-section ct-section--values">
        <div className="ct-container">
          <div className="ct-section__head">
            <span className="ct-badge ct-badge--light">Nos valeurs</span>
            <h2 className="ct-section__title ct-section__title--light">Pourquoi nous choisir ?</h2>
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

      <Footer />
    </div>
  );
};

export default ContactPage;