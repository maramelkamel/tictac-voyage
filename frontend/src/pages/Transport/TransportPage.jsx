import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { TransferForm } from './TransferForm';
import { DispositionForm } from './DispositionForm';
import '../../styles/transport.css';
const vehiclesData = [
  { 
    id: 'berline', 
    name: "Berline Confort", 
    capacity: "1-3 passagers", 
    features: ["Climatisée", "WiFi", "Eau minérale"], 
    icon: "🚗" 
  },
  { 
    id: 'van', 
    name: "Van Premium", 
    capacity: "4-7 passagers", 
    features: ["Idéal familles", "Climatisée", "Bagages XL"], 
    icon: "🚐" 
  },
  { 
    id: 'minibus', 
    name: "Minibus", 
    capacity: "8-15 passagers", 
    features: ["Petits groupes", "WiFi", "Pause incluse"], 
    icon: "🚌" 
  },
  { 
    id: 'bus', 
    name: "Bus Grand Tourisme", 
    capacity: "16-50 passagers", 
    features: ["Grands événements", "Micro", "Pause incluse"], 
    icon: "🚍" 
  }
];

const advantagesData = [
  { 
    icon: "👨‍✈️", 
    title: "Chauffeurs professionnels bilingues", 
    description: "Tous nos chauffeurs maîtrisent le français et l'arabe" 
  },
  { 
    icon: "🚗", 
    title: "Véhicules climatisés et récents", 
    description: "Flotte moderne et entretenue régulièrement" 
  },
  { 
    icon: "⏱️", 
    title: "Ponctualité garantie", 
    description: "Nous respectons scrupuleusement vos horaires" 
  },
  { 
    icon: "💰", 
    title: "Prix transparents sans surprise", 
    description: "Tarifs clairs et détaillés avant tout engagement" 
  },
  { 
    icon: "✈️", 
    title: "Suivi des vols en temps réel", 
    description: "Nous surveillons votre vol pour anticiper tout retard" 
  },
  { 
    icon: "👶", 
    title: "Sièges bébé disponibles", 
    description: "Équipement adapté pour les familles avec enfants" 
  }
];

const faqData = [
  {
    question: "Comment fonctionne la demande de devis ?",
    answer: "Il vous suffit de remplir le formulaire de votre choix (transfert ou mise à disposition). Notre équipe analyse votre demande et vous envoie un devis personnalisé sous 24h par email ou téléphone."
  },
  {
    question: "Puis-je modifier ou annuler ma réservation ?",
    answer: "Oui, toute modification ou annulation doit être communiquée au moins 24h avant le départ. Des frais d'annulation peuvent s'appliquer selon le délai de préavis."
  },
  {
    question: "Les chauffeurs parlent-ils français ?",
    answer: "Absolument ! Tous nos chauffeurs sont bilingues français/arabe, et une partie parle également l'anglais. Vous serez en parfaite communication."
  },
  {
    question: "Comment se passe le paiement ?",
    answer: "Nous acceptons les paiements par virement bancaire, PayPal, ou en espèces. Le paiement est généralement demandé à la confirmation de réservation."
  },
  {
    question: "Que se passe-t-il si mon vol a du retard ?",
    answer: "Pas de souci ! Notre équipe suit vos vols en temps réel. En cas de retard, le chauffeur attendra votre arrivée sans frais supplémentaires."
  }
];

function TransportPage() {
  const [activeTab, setActiveTab] = useState('transfer');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C5C] via-[#1ECAD3] to-[#0F4C5C]">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Service 24h/7j</span>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 font-['Poppins']">
              Transport & Transferts en Tunisie
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Voyagez en toute sérénité avec nos chauffeurs professionnels. 
              Transferts aéroport, location avec chauffeur, excursions.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#transports" 
                className="bg-[#E92F64] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#B32D5E] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Réserver maintenant
              </a>
              <a 
                href="#contact" 
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
        
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="#F8FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Tabs Section */}
      <section id="transports" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2 font-['Poppins']">
              Demande de devis
            </h2>
            <p className="text-[#64748B]">Choisissez le service qui correspond à vos besoins</p>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-[#F1F5F9] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('transfer')}
                className={`tab-btn ${activeTab === 'transfer' ? 'tab-active' : 'tab-inactive'}`}
              >
                🚗 Transfert
              </button>
              <button
                onClick={() => setActiveTab('disposition')}
                className={`tab-btn ${activeTab === 'disposition' ? 'tab-active' : 'tab-inactive'}`}
              >
                📅 Mise à Disposition
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in" key={activeTab}>
            {activeTab === 'transfer' ? <TransferForm /> : <DispositionForm />}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2 font-['Poppins']">
              Notre flotte à votre service
            </h2>
            <p className="text-[#64748B]">Des véhicules adaptés à tous vos besoins</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehiclesData.map((vehicle, index) => (
              <div 
                key={vehicle.id}
                className="bg-[#F8FAFB] rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-[#1ECAD3]/30"
              >
                <div className="text-5xl mb-4">{vehicle.icon}</div>
                <h3 className="font-semibold text-[#1E293B] mb-1 font-['Poppins']">
                  {vehicle.name}
                </h3>
                <p className="text-sm text-[#0F4C5C] font-medium mb-3">
                  {vehicle.capacity}
                </p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, i) => (
                    <span 
                      key={i} 
                      className="text-xs bg-[#1ECAD3]/10 text-[#0F4C5C] px-2 py-1 rounded-full"
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

      {/* Advantages Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2 font-['Poppins']">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-[#64748B]">6 raisons de faire confiance à TICTAC VOYAGES</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantagesData.map((advantage, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#0F4C5C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{advantage.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E293B] mb-1 font-['Poppins']">
                    {advantage.title}
                  </h3>
                  <p className="text-sm text-[#64748B]">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2 font-['Poppins']">
              Questions fréquentes
            </h2>
            <p className="text-[#64748B]">Trouvez des réponses à vos questions</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-[#F8FAFB] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F1F5F9] transition-colors"
                >
                  <span className="font-semibold text-[#1E293B] pr-4">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-[#0F4C5C] flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}
                >
                  <p className="px-5 pb-5 text-[#64748B] leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section id="contact" className="py-12 md:py-16 bg-gradient-to-br from-[#0F4C5C] to-[#1ECAD3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-['Poppins']">
            Une question ? Contactez-nous directement
          </h2>
          <p className="text-white/80 mb-8">Notre équipe est à votre disposition 24h/24</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Téléphone</h3>
              <a href="tel:+21636149885" className="text-white/90 hover:text-white transition-colors">
                +216 36 149 885
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-white font-semibold mb-1">WhatsApp</h3>
              <p className="text-white/90">Disponible 24h/24</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Email</h3>
              <a href="mailto:contact@tictacvoyages.tn" className="text-white/90 hover:text-white transition-colors break-all">
                contact@tictacvoyages.tn
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default TransportPage;