import React, { useState } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import { Calendar, Users, Home, Utensils } from 'lucide-react';

const HotelPricing = ({ hotel }) => {
  const [formData, setFormData] = useState({
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    adults: 2,
    children: 0,
    board: 'LP',
    rooms: 1,
    roomType: 'standard'
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);

  // Calcul du prix total
  const calculatePrice = () => {
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const dayDiff = differenceInDays(end, start);
    
    if (dayDiff > 0) {
      setNights(dayDiff);
      
      const base = hotel?.basePrice || 0;
const board = hotel?.pricing?.board?.[formData.board] || 0;
const roomType = hotel?.pricing?.roomType?.[formData.roomType] || 0;
      
      // Prix par adulte par nuit
      const dailyPerAdult = base + board + roomType;
      
      // Prix par enfant par nuit (50% du prix adulte)
      const dailyPerChild = dailyPerAdult * 0.5;
      
      const totalPerNight = (dailyPerAdult * formData.adults) + (dailyPerChild * formData.children);
      
      setTotalPrice(totalPerNight * dayDiff * formData.rooms); 
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  };

  // ✅ useEffect pour recalculer automatiquement le prix quand les données changent
 
  const handleChange = (e) => {
    const { name, value } = e.target;
   setFormData(prev => {
  const updated = {
    ...prev,
    [name]: name === 'adults' || name === 'children' || name === 'rooms'
      ? parseInt(value) || 0
      : value
  };
  return updated;
});

setTimeout(() => calculatePrice(), 0);
  };

  return (
    <div className="hotel-pricing-section" id="pricing">
      <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
        <Calendar className="text-[var(--color-secondary)]" /> Dates & Tarifs
      </h2>
      
      <div className="pricing-form">
        
        {/* Dates */}
        <div className="form-group">
          <label>Arrivée</label>
          <input 
            type="date" 
            name="checkIn" 
            value={formData.checkIn} 
            onChange={handleChange} 
          />
        </div>
        <div className="form-group">
          <label>Départ</label>
          <input 
            type="date" 
            name="checkOut" 
            value={formData.checkOut} 
            onChange={handleChange} 
            min={formData.checkIn}
          />
        </div>

        {/* Pax */}
        <div className="form-group">
          <label>Adultes</label>
          <div className="relative">
            <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              name="adults" 
              value={formData.adults} 
              onChange={handleChange} 
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Enfants</label>
          <div className="relative">
            <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              name="children" 
              value={formData.children} 
              onChange={handleChange} 
            >
              {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Board */}
        <div className="form-group">
          <label>Pension</label>
          <div className="relative">
            <Utensils size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              name="board" 
              value={formData.board} 
              onChange={handleChange} 
            >
              <option value="LP">Petit-déjeuner (LP)</option>
              <option value="DP">Demi-pension (DP)</option>
              <option value="PC">Pension complète (PC)</option>
              <option value="ALL">All Inclusive (ALL)</option>
            </select>
          </div>
        </div>

        {/* Room Type */}
        <div className="form-group">
          <label>Type de chambre</label>
          <div className="relative">
            <Home size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              name="roomType" 
              value={formData.roomType} 
              onChange={handleChange} 
            >
              <option value="standard">Standard</option>
              <option value="vue_mer">Vue Mer</option>
              <option value="suite">Suite</option>
              <option value="vue_jardin">Vue Jardin</option>
            </select>
          </div>
        </div>
        
        {/* Rooms */}
        <div className="form-group">
           <label>Nombre de chambres</label>
           <input 
             type="number" 
             min="1" 
             name="rooms" 
             value={formData.rooms} 
             onChange={handleChange} 
           />
        </div>

        {/* Button */}
        <div className="form-group">
          <button 
  type="button"
  className="btn-hotel btn-hotel-secondary w-full"
>
  Modifier
</button>
        </div>
      </div>

      {/* Total */}
      <div className="pricing-summary">
        <div className="price-breakdown">
          <div className="price-item">
            <span>Nuits ({nights} × chambre(s))</span>
           <span>
  {nights > 0 ? (totalPrice / nights).toLocaleString() : 0} MAD
</span>
          </div>
          <div className="price-item">
            <span>Pension ({formData.board})</span>
            <span>{hotel.pricing.board[formData.board] * nights} MAD</span>
          </div>
          <div className="price-item">
            <span>Type chambre ({formData.roomType})</span>
            <span>{hotel.pricing.roomType[formData.roomType] * nights} MAD</span>
          </div>
          <div className="price-item total">
            <span>TOTAL</span>
            <span>{totalPrice.toLocaleString()} MAD</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">*Taxe de séjour non incluse</p>
      </div>
    </div>
  );
};

export default HotelPricing;