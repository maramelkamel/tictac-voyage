import React, { useState } from 'react';
import { CreditCard, Building, Lock } from 'lucide-react';

const HotelPayment = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Paiement simulé validé avec succès !');
    }, 2000);
  };

  return (
    <div className="hotel-payment-section" id="payment">
      <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
        <CreditCard className="text-[var(--color-secondary)]" /> Paiement
      </h2>
      
      <div className="payment-options">
        <button 
          onClick={() => setPaymentMethod('agency')}
          className={`payment-option ${paymentMethod === 'agency' ? 'selected' : ''}`}
        >
          <Building size={32} className="payment-icon" />
          <span className="font-bold">Payer à l'agence</span>
        </button>
        
        <button 
          onClick={() => setPaymentMethod('card')}
          className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
        >
          <CreditCard size={32} className="payment-icon" />
          <span className="font-bold">Carte Bancaire</span>
        </button>
      </div>
      
      {paymentMethod === 'card' ? (
        <form onSubmit={handlePayment} className="payment-form">
          <div>
            <label>Nom sur la carte</label>
            <input type="text" placeholder="John Doe" required />
          </div>
          
          <div>
            <label>Numéro de carte</label>
            <div className="relative">
              <input type="text" placeholder="0000 0000 0000 0000" className="pl-10" required />
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="form-row">
            <div>
              <label>Expiration</label>
              <input type="text" placeholder="MM/YY" required />
            </div>
            <div>
              <label>CVC</label>
              <input type="text" placeholder="123" required />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-hotel btn-hotel-primary w-full"
          >
            {loading ? 'Traitement...' : 'Payer maintenant'}
          </button>
          
          <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
            <Lock size={12} /> Paiement sécurisé par SSL
          </p>
        </form>
      ) : (
        <div className="text-center p-8 bg-blue-50 rounded-xl border border-blue-100">
          <Building size={48} className="mx-auto text-[var(--color-primary)] mb-4" />
          <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">Rendez-vous à l'agence</h3>
          <p className="text-gray-600 mb-4">
            Veuillez vous présenter à notre agence sous 24h pour finaliser votre réservation et effectuer le règlement.
          </p>
          <div className="bg-white p-4 rounded-lg inline-block text-left shadow-sm">
            <p className="font-bold">Agence VoyagePlus</p>
            <p className="text-sm">123 Avenue Mohamed V</p>
            <p className="text-sm">Casablanca, Maroc</p>
            <p className="text-sm mt-2 text-[var(--color-primary)]">Tel: +212 5 22 00 00 00</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelPayment;
