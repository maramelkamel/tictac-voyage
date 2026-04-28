import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const HotelExplainPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: '1. Booking API as the base list',
      description: 'The page first loads hotels from the Booking API using a Tunisia city bounding box. This is the primary source for hotel structure, name, image, rating, and location.',
    },
    {
      title: '2. MakCorps for prices',
      description: 'For the same city, the app requests the MakCorps city mapping endpoint, then the MakCorps city pricing endpoint. These results are only used to enrich hotels with prices.',
    },
    {
      title: '3. Safe merge by hotel name similarity',
      description: 'Hotels are merged carefully using normalized hotel names instead of list index matching. If a MakCorps match is found, its price is attached. If not, the price falls back to N/A.',
    },
    {
      title: '4. Manual admin hotels stay supported',
      description: 'Hotels added in the admin dashboard are also included in results, so the business can manage its own hotel catalog even when APIs are limited.',
    },
    {
      title: '5. Flights-like booking flow',
      description: 'Selecting a hotel moves the user through reservation, then payment, then saved booking management in the same spirit as your flights flow.',
    },
  ];

  return (
    <>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f3460 100%)', paddingTop: 120, paddingBottom: 36 }}>
        <div className="container">
          <div className="omra-page-breadcrumb" style={{ paddingTop: 0, marginBottom: 16 }}>
            <button onClick={() => navigate('/hotels')}>
              <i className="fas fa-arrow-left" /> Hotels
            </button>
            <i className="fas fa-chevron-right" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ color: '#fff', fontWeight: 700 }}>Hotel system explain</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>How the hotel system works</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            This page documents the dual-API hotel logic and the reservation flow you asked to mirror from flights.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 0 60px' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a2832', marginBottom: 14 }}>APIs used</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, color: '#0F4C5C', marginBottom: 6 }}>MakCorps</p>
                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>Used for city mapping and hotel price enrichment.</p>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                <p style={{ fontWeight: 700, color: '#0F4C5C', marginBottom: 6 }}>Booking API (RapidAPI)</p>
                <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>Used as the primary hotel listing source for details like hotel name, image, rating, and location.</p>
              </div>
            </div>
          </div>

          {steps.map((step) => (
            <div key={step.title} style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a2832', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.7 }}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default HotelExplainPage;
