import React from 'react';
import { MapPin, Star, Heart } from 'lucide-react';

const HotelSummary = ({ hotel }) => {
  return (
    <div className="hotel-summary-section">
      <div className="hotel-summary-content">
        <div className="hotel-main-image-wrapper">
          <img 
            src={hotel.image} 
            alt={hotel.name} 
            className="hotel-main-image"
          />
          <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white text-red-500 shadow-sm transition-colors">
            <Heart size={20} />
          </button>
        </div>
        
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-4">
                  <MapPin size={18} className="text-[var(--color-secondary)]" />
                  <span className="font-medium">{hotel.city}</span>
                </div>
              </div>
              <div className="flex items-center bg-[var(--color-background-main)] px-3 py-1 rounded-lg gap-1">
                <span className="text-xl font-bold text-[var(--color-primary)]">{hotel.rating}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.floor(hotel.rating) ? "currentColor" : "none"} className={i < Math.floor(hotel.rating) ? "" : "text-gray-300"} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mb-4">
              {[...Array(hotel.stars)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
              ))}
            </div>

            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
              {hotel.description}
            </p>
          </div>
          
          <div className="flex gap-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">Disponible</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">Meilleur Prix</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSummary;
