import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactPage = () => {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', sujet: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  const stats = [
    { icon: '✈️', value: '50+',     label: 'Destinations' },
    { icon: '👥', value: '12 000+', label: 'Voyageurs satisfaits' },
    { icon: '⭐', value: '4.9/5',   label: 'Note moyenne' },
    { icon: '🏆', value: '15 ans',  label: "D'expertise" },
  ];

  const contactCards = [
    { icon: '📞', title: 'Téléphone',  value: '+216 36 149 885',         sub: 'Lun – Sam · 9h à 18h',  color: '#e3f2fd', accent: '#1e88e5' },
    { icon: '📧', title: 'Email',      value: 'tictacvoyages@gmail.com', sub: 'Réponse sous 24h',       color: '#fce4ec', accent: '#D81B60' },
    { icon: '📍', title: 'Adresse',    value: 'Nouvelle Medina, Tunis',  sub: 'Tunisie',                color: '#e8f5e9', accent: '#43a047' },
    { icon: '💬', title: 'WhatsApp',   value: '+216 36 149 885',         sub: 'Disponible 7j/7',        color: '#fff3e0', accent: '#fb8c00' },
  ];

  const team = [
    { name: 'Sami Ben Ali',   role: 'Directeur Général',     emoji: '👨‍💼' },
    { name: 'Rania Chaabane', role: 'Responsable Voyages',   emoji: '👩‍✈️' },
    { name: 'Karim Tlili',    role: 'Conseiller Transport',  emoji: '🚌' },
    { name: 'Nour Hamdi',     role: 'Chargée de Clientèle', emoji: '👩‍💻' },
  ];

  const values = [
    { icon: '💎', title: 'Excellence', desc: 'Des prestations soigneusement sélectionnées pour chaque budget.' },
    { icon: '🤝', title: 'Confiance',  desc: 'Plus de 15 ans de transparence et de fiabilité avec nos clients.' },
    { icon: '🌍', title: 'Passion',    desc: "Une équipe de voyageurs passionnés qui connaissent chaque destination." },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0f6ff' }}>
      <Navbar />

      <style>{`
        .contact-hero {
           position: relative;
           min-height: 420px;
           display: flex;
           align-items: center;
            overflow: visible; 
        }
        .hero-photo {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80');
          background-size: cover;
          background-position: center;
          transition: transform 8s ease;
        }
        .hero-photo:hover { transform: scale(1.03); }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(13,71,161,0.82) 0%,
            rgba(30,136,229,0.72) 45%,
            rgba(216,27,96,0.68) 100%
          );
        }
        .hero-content {
         position: relative;
         z-index: 2;
         width: 100%;
         padding: 80px 0 60px;  
        }

        .stat-chip {
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.28);
          backdrop-filter: blur(14px);
          border-radius: 18px;
          padding: 22px 18px;
          text-align: center;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .stat-chip:hover { transform: translateY(-5px); background: rgba(255,255,255,0.22); }

        .section-tag {
          display: inline-block;
          background: linear-gradient(135deg, #bbdefb, #f8bbd0);
          color: #1565C0;
          font-weight: 700;
          font-size: 12px;
          padding: 6px 18px;
          border-radius: 50px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .contact-card {
          background: #fff;
          border-radius: 20px;
          padding: 26px 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 2px 14px rgba(21,101,192,0.07);
          border: 1px solid #e3f2fd;
          transition: all 0.3s ease;
        }
        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 36px rgba(216,27,96,0.11);
          border-color: rgba(216,27,96,0.18);
        }

        .form-card {
          background: #fff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 4px 28px rgba(21,101,192,0.08);
          border: 1px solid #e3f2fd;
        }

        .form-field label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #1e88e5;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 13px 16px;
          border: 2px solid #e3f2fd;
          border-radius: 12px;
          font-size: 14px;
          color: #1a1a2e;
          background: #f5faff;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          border-color: #D81B60;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(216,27,96,0.07);
        }
        .form-field textarea { resize: vertical; }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #D81B60, #ad1457);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(216,27,96,0.35);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .about-card {
          background: linear-gradient(135deg, #1565C0 0%, #1e88e5 100%);
          border-radius: 24px;
          padding: 38px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .about-card::before {
          content: '✈️';
          position: absolute;
          right: 24px; bottom: 8px;
          font-size: 110px;
          opacity: 0.07;
          pointer-events: none;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 50px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 16px;
        }

        .hours-card {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 2px 14px rgba(21,101,192,0.07);
          border: 1px solid #e3f2fd;
        }

        .value-card {
          background: #fff;
          border-radius: 18px;
          padding: 28px 22px;
          border: 1px solid #e3f2fd;
          box-shadow: 0 2px 12px rgba(21,101,192,0.06);
          transition: all 0.3s ease;
        }
        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(21,101,192,0.11);
          border-color: #bbdefb;
        }

        .team-card {
          background: #fff;
          border-radius: 18px;
          padding: 28px 18px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(21,101,192,0.06);
          border: 1px solid #e3f2fd;
          transition: all 0.3s ease;
        }
        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(216,27,96,0.13);
          border-color: rgba(216,27,96,0.2);
        }
        .team-avatar {
          width: 70px; height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e3f2fd, #fce4ec);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          margin: 0 auto 14px;
          box-shadow: 0 4px 14px rgba(21,101,192,0.12);
        }

        .divider-wave {
          background: #f0f6ff;
          clip-path: ellipse(55% 60% at 50% 100%);
          height: 80px;
          margin-top: -40px;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .contact-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .stats-grid    { grid-template-columns: 1fr 1fr !important; }
          .contact-cards { grid-template-columns: 1fr 1fr !important; }
          .team-grid     { grid-template-columns: 1fr 1fr !important; }
          .values-grid   { grid-template-columns: 1fr !important; }
          .form-card     { padding: 24px 18px !important; }
        }
        @media (max-width: 480px) {
          .contact-cards { grid-template-columns: 1fr !important; }
          .team-grid     { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO WITH PHOTO ── */}
      <section className="contact-hero">
        <div className="hero-photo" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ justifyContent: 'center', display: 'flex' }}>
              <div className="badge-pill">📍 Tunis, Tunisie — Agence de voyage</div>
            </div>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '18px',
              lineHeight: 1.15,
              textShadow: '0 2px 20px rgba(0,0,0,0.25)',
            }}>
              Contactez <span style={{ color: '#f48fb1' }}>Tictac Voyages</span>
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.88)',
              maxWidth: '560px',
              margin: '0 auto 52px',
              lineHeight: 1.75,
              textShadow: '0 1px 8px rgba(0,0,0,0.2)',
            }}>
              Notre équipe de passionnés est là pour transformer votre rêve de voyage en réalité. Parlons-en !
            </p>
            <div
              className="stats-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', maxWidth: '820px', margin: '0 auto' }}
            >
              {stats.map((s, i) => (
                <div className="stat-chip" key={i}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wave */}
      <div className="divider-wave" />

      {/* ── CONTACT CARDS ── */}
      <section style={{ padding: '20px 0 60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="section-tag">Nos coordonnées</div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a2e' }}>Comment nous joindre</h2>
          </div>
          <div
            className="contact-cards"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}
          >
            {contactCards.map((card, i) => (
              <div className="contact-card" key={i}>
                <div style={{
                  width: '50px', height: '50px',
                  borderRadius: '14px',
                  background: card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: card.accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', marginBottom: '3px' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + RIGHT ── */}
      <section style={{ padding: '0 0 70px' }}>
        <div className="container">
          <div
            className="contact-layout"
            style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', alignItems: 'start' }}
          >
            {/* Form */}
            <div className="form-card">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div style={{
                    width: '80px', height: '80px',
                    background: 'linear-gradient(135deg,#D81B60,#ad1457)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '36px', margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(216,27,96,0.35)',
                  }}>✓</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e', marginBottom: '12px' }}>Message envoyé !</h2>
                  <p style={{ color: '#888', lineHeight: 1.7, marginBottom: '28px' }}>
                    Merci de nous avoir contactés. Un conseiller vous répondra sous 24h.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg,#1e88e5,#1565C0)',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      fontWeight: 600, fontSize: '15px', cursor: 'pointer',
                    }}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e', marginBottom: '6px' }}>
                    ✉️ Envoyez-nous un message
                  </h2>
                  <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '28px' }}>Réponse garantie sous 24h ouvrables.</p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-field">
                        <label>Nom complet *</label>
                        <input name="nom" type="text" placeholder="Votre nom" required value={form.nom} onChange={handleChange} />
                      </div>
                      <div className="form-field">
                        <label>Email *</label>
                        <input name="email" type="email" placeholder="votre@email.com" required value={form.email} onChange={handleChange} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-field">
                        <label>Téléphone</label>
                        <input name="telephone" type="tel" placeholder="+216 XX XXX XXX" value={form.telephone} onChange={handleChange} />
                      </div>
                      <div className="form-field">
                        <label>Sujet *</label>
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
                    <div className="form-field">
                      <label>Message *</label>
                      <textarea
                        name="message"
                        rows={5}
                        placeholder="Décrivez votre projet, vos dates, votre budget…"
                        required
                        value={form.message}
                        onChange={handleChange}
                      />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? '⏳ Envoi en cours…' : 'Envoyer mon message →'}
                    </button>
                    <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', margin: 0 }}>
                      🔒 Vos données sont confidentielles et ne seront jamais partagées.
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* About */}
              <div className="about-card">
                <div className="badge-pill">🏆 Fondée en 2010</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '14px', lineHeight: 1.3 }}>
                  À propos de<br />Tictac Voyages
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px' }}>
                  Depuis 2010, <strong>Tictac Voyages</strong> accompagne plus de <strong>12 000 voyageurs</strong>. Spécialisés en voyages organisés, Omra, transport et séjours sur mesure, nous mettons notre expertise à votre service avec passion et professionnalisme.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Voyages Organisés', 'Omra & Hajj', 'Transport', 'Hôtels', 'Sur Mesure', 'Billetterie'].map((tag, i) => (
                    <span key={i} style={{
                      background: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '50px',
                      padding: '5px 13px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#fff',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="hours-card">
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1a1a2e', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🕐 Horaires d'ouverture
                </h3>
                {[
                  { day: 'Lundi – Vendredi', hours: '09:00 – 18:00', open: true },
                  { day: 'Samedi',           hours: '09:00 – 14:00', open: true },
                  { day: 'Dimanche',         hours: 'Fermé',         open: false },
                ].map((row, i, arr) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #f0f4ff' : 'none',
                  }}>
                    <span style={{ fontSize: '14px', color: '#555', fontWeight: 500 }}>{row.day}</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: row.open ? '#1e88e5' : '#D81B60',
                      background: row.open ? '#e3f2fd' : '#fce4ec',
                      padding: '4px 12px',
                      borderRadius: '50px',
                    }}>
                      {row.hours}
                    </span>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid #e3f2fd',
                boxShadow: '0 2px 14px rgba(21,101,192,0.07)',
              }}>
                <iframe
                  title="Tictac Voyages"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3194.5!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzIzLjQiTiAxMMKwMTAnNTMuNCJF!5e0!3m2!1sfr!2stn!4v1600000000000!5m2!1sfr!2stn"
                  width="100%"
                  height="175"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                />
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>📍</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>Nouvelle Medina, Tunis</div>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>Tunisie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: '0 0 70px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="section-tag">Nos valeurs</div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a2e' }}>Pourquoi nous choisir ?</h2>
          </div>
          <div
            className="values-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}
          >
            {values.map((v, i) => (
              <div className="value-card" key={i}>
                <div style={{
                  width: '54px', height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg,#e3f2fd,#fce4ec)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px',
                  marginBottom: '18px',
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a2e', marginBottom: '10px' }}>{v.title}</h3>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="section-tag">Notre équipe</div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a2e', marginBottom: '8px' }}>
              Des experts à votre service
            </h2>
            <p style={{ color: '#aaa', fontSize: '15px' }}>Une équipe passionnée prête à construire le voyage de vos rêves.</p>
          </div>
          <div
            className="team-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}
          >
            {team.map((member, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar">{member.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', marginBottom: '8px' }}>
                  {member.name}
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 700,
                  color: '#D81B60', background: '#fce4ec',
                  padding: '4px 12px', borderRadius: '50px',
                }}>
                  {member.role}
                </span>
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