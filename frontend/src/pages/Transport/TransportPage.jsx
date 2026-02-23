import { useState } from 'react';
import TransferForm from './TransferForm';
import DispositionForm from './DispositionForm';
import TransportFAQ from './TransportFAQ';
import { vehiclesData, advantagesData, faqData } from './transportData';

const TransportPage = () => {
  const [activeTab, setActiveTab] = useState('transfer');

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F4C5C]/90 to-[#0F4C5C]/70"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block bg-[#E92F64] text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-lg">
            🕐 Service 24h/7j
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Transport & Transferts<br />
            <span className="text-[#1ECAD3]">en Tunisie</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Voyagez en toute sérénité avec nos chauffeurs professionnels
          </p>
          <a 
            href="#booking"
            className="inline-block bg-[#E92F64] hover:bg-[#D4265A] text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Réserver maintenant ↓
          </a>
        </div>
      </section>

      {/* Booking Section with Tabs */}
      <section id="booking" className="py-16 px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-5 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                activeTab === 'transfer'
                  ? 'bg-[#0F4C5C] text-white shadow-lg scale-105'
                  : 'bg-white text-[#1E293B] border-2 border-slate-200 hover:border-[#1ECAD3] hover:shadow-md'
              }`}
            >
              <span className="text-2xl">🚗</span>
              <div className="text-left">
                <div>Transfert</div>
                <div className={`text-sm font-normal ${activeTab === 'transfer' ? 'text-white/80' : 'text-[#64748B]'}`}>
                  Point A → Point B
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('disposition')}
              className={`flex-1 py-5 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                activeTab === 'disposition'
                  ? 'bg-[#0F4C5C] text-white shadow-lg scale-105'
                  : 'bg-white text-[#1E293B] border-2 border-slate-200 hover:border-[#1ECAD3] hover:shadow-md'
              }`}
            >
              <span className="text-2xl">📅</span>
              <div className="text-left">
                <div>Mise à Disposition</div>
                <div className={`text-sm font-normal ${activeTab === 'disposition' ? 'text-white/80' : 'text-[#64748B]'}`}>
                  Avec Chauffeur
                </div>
              </div>
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-slate-100">
            {activeTab === 'transfer' ? (
              <div>
                <h2 className="text-2xl font-bold text-[#0F4C5C] mb-6 flex items-center gap-3">
                  <span className="bg-[#1ECAD3]/20 p-2 rounded-lg">🚗</span>
                  Demande de Transfert
                </h2>
                <TransferForm />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-[#0F4C5C] mb-6 flex items-center gap-3">
                  <span className="bg-[#1ECAD3]/20 p-2 rounded-lg">📅</span>
                  Demande de Mise à Disposition
                </h2>
                <DispositionForm />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-[#F8FAFB]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F4C5C] mb-4">
              Pourquoi choisir TICTAC VOYAGES ?
            </h2>
            <p className="text-lg text-[#64748B]">
              Des services de transport premium pour des voyages en toute confiance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantagesData.map((advantage, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg hover:border-[#1ECAD3]/30 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {advantage.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0F4C5C] mb-2">
                  {advantage.title}
                </h3>
                <p className="text-[#64748B]">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F4C5C] mb-4">
              Notre flotte à votre service
            </h2>
            <p className="text-lg text-[#64748B]">
              Des véhicules adaptés à tous vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {vehiclesData.map((vehicle) => (
              <div 
                key={vehicle.id}
                className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border-2 border-slate-200 hover:border-[#1ECAD3] transition-all duration-300"
              >
                <div className="text-5xl mb-4">{vehicle.icon}</div>
                <h3 className="text-xl font-bold text-[#0F4C5C] mb-2">
                  {vehicle.name}
                </h3>
                <div className="flex items-center gap-2 text-[#64748B] mb-3">
                  <span className="bg-[#1ECAD3]/20 text-[#0F4C5C] text-sm font-semibold px-3 py-1 rounded-full">
                    👥 {vehicle.capacity.min}-{vehicle.capacity.max} passagers
                  </span>
                </div>
                <p className="text-[#64748B] mb-4">{vehicle.description}</p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-[#0F4C5C]/10 text-[#0F4C5C] px-2 py-1 rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-[#F8FAFB]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F4C5C] mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-[#64748B]">
              Tout ce que vous devez savoir sur nos services de transport
            </p>
          </div>

          <TransportFAQ faqData={faqData} />
        </div>
      </section>

      {/* CTA Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#0F4C5C] to-[#0F4C5C]/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Une question ? Contactez-nous directement
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Notre équipe est disponible 24h/24 pour répondre à vos demandes
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-wrap">
            <a 
              href="tel:+21636149885"
              className="flex items-center gap-3 bg-white text-[#0F4C5C] px-6 py-4 rounded-xl font-semibold hover:bg-[#1ECAD3] hover:text-white transition-all duration-300 shadow-lg"
            >
              <span className="text-2xl">📞</span>
              <span>+216 36 149 885</span>
            </a>
            <a 
              href="https://wa.me/21636149885"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#20BA5A] transition-all duration-300 shadow-lg"
            >
              <span className="text-2xl">💬</span>
              <span>WhatsApp</span>
            </a>
            <a 
              href="mailto:contact@tictacvoyages.com"
              className="flex items-center gap-3 bg-[#E92F64] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#D4265A] transition-all duration-300 shadow-lg"
            >
              <span className="text-2xl">✉️</span>
              <span>Email</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransportPage;
