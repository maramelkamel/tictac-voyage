import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  outline: 'none',
  boxSizing: 'border-box',
};

const Footer = () => {
  const { t } = useTranslation('footer');
  const [form, setForm]           = useState({ nom: '', email: '', message: '' });
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ nom: '', email: '', message: '' });
      } else {
        alert(data.message || "Erreur lors de l'envoi");
      }
    } catch {
      alert(t('error_server', { ns: 'common' }));
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { id: 1, label: t('services.hotels'),             href: '/' },
    { id: 2, label: t('services.transport'),          href: '/transport' },
    { id: 3, label: t('services.voyages_organises'),  href: '/VoyagesOrganise/VoyagesOrganise' },
    { id: 4, label: t('services.omra'),               href: '/Omra/Omra' },
    { id: 5, label: t('services.sur_mesure'),         href: '/voyagenonorg/VoyageSurMesure' },
    { id: 6, label: t('services.billetterie'),        href: '/billeterie/Billeterie' },
    { id: 7, label: t('services.circuits'),           href: '/circuits/circuit' },
  ];

  const contactInfo = [
    { icon: 'fas fa-phone',          label: '+216 36 149 885' },
    { icon: 'fas fa-envelope',       label: 'tictacvoyages@gmail.com' },
    { icon: 'fas fa-map-marker-alt', label: t('address') },
  ];

  const socials = [
    { icon: 'fab fa-facebook-f', href: '#' },
    { icon: 'fab fa-instagram',  href: '#' },
    { icon: 'fab fa-whatsapp',   href: '#' },
    { icon: 'fab fa-youtube',    href: '#' },
  ];

  return (
    <footer style={{ background: 'var(--primary)', color: '#fff', padding: '72px 0 0' }}>
      <div className="container">
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr 1.3fr',
            gap: '40px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Col 1 : Brand + Socials */}
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              TICTAC VOYAGES
            </h1>
            <span style={{
              fontSize: '10px', fontWeight: 600, color: 'var(--gold)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              display: 'block', marginBottom: '16px',
            }}>
              {t('tagline')}
            </span>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '24px' }}>
              {t('description')}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {socials.map((s, i) => (
                <a key={i} href={s.href} className="footer-social" aria-label="social"
                  style={{
                    width: '42px', height: '42px', background: 'rgba(255,255,255,0.08)',
                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontSize: '16px',
                    textDecoration: 'none', transition: 'all 0.3s ease',
                  }}>
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 : Nos Services */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>{t('nos_services')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {services.map((s) => (
                <li key={s.id}>
                  <a href={s.href} className="footer-link"
                    style={{
                      fontSize: '14px', color: 'rgba(255,255,255,0.7)',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      textDecoration: 'none', transition: 'all 0.3s ease',
                    }}>
                    <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: 'var(--secondary)' }} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 : Contactez-nous */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>{t('contactez_nous')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {contactInfo.map((item, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  fontSize: '14px', color: 'rgba(255,255,255,0.7)',
                }}>
                  <i className={item.icon} style={{ color: 'var(--secondary)', marginTop: '3px', width: '16px' }} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 : Messagerie */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>{t('send_message')}</h4>

            {submitted ? (
              <div style={{
                padding: '20px', background: 'rgba(255,255,255,0.08)',
                borderRadius: '10px', textAlign: 'center',
              }}>
                <i className="fas fa-check-circle" style={{ fontSize: '32px', color: 'var(--secondary)', marginBottom: '10px', display: 'block' }} />
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: '0 0 12px' }}>
                  {t('success_title')}
                </p>
                <button onClick={() => setSubmitted(false)} style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.7)', borderRadius: '6px',
                  padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
                }}>
                  {t('send_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  name="nom" type="text" placeholder={t('your_name')}
                  required value={form.nom} onChange={handleChange}
                  style={inputStyle}
                />
                <input
                  name="email" type="email" placeholder={t('your_email')}
                  required value={form.email} onChange={handleChange}
                  style={inputStyle}
                />
                <textarea
                  name="message" rows={3}
                  placeholder={t('your_message')}
                  required value={form.message} onChange={handleChange}
                  style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                />
                <button
                  type="submit" disabled={loading}
                  style={{
                    padding: '13px 24px',
                    background: loading ? 'rgba(255,255,255,0.2)' : 'var(--accent)',
                    color: '#fff', borderRadius: '8px', fontWeight: 600,
                    fontSize: '14px', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-start', transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  {loading
                    ? <><i className="fas fa-spinner fa-spin" /> {t('sending')}</>
                    : <><i className="fas fa-paper-plane" /> {t('send_btn')}</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            {t('rights')} |{' '}
            <a href="#" className="footer-bottom-link" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>{t('mentions_legales')}</a>{' '}
            |{' '}
            <a href="#" className="footer-bottom-link" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>{t('confidentialite')}</a>
          </p>
        </div>
      </div>

      <style>{`
        .footer-social:hover { background: #D81B60 !important; transform: translateY(-3px); }
        .footer-link:hover   { color: #D81B60 !important; transform: translateX(5px); }
        .footer-link:hover i { color: #D81B60 !important; }
        .footer-bottom-link:hover { color: #D81B60 !important; }
        footer input:focus, footer textarea:focus {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
