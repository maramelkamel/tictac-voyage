import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ChevronRight } from 'lucide-react';

const HotelCard = ({ hotel }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={hotel.image} 
          alt={hotel.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[var(--color-primary)] shadow-sm flex items-center gap-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          {hotel.rating}
        </div>
        {hotel.rating > 4.5 && (
          <div className="absolute top-4 left-4 bg-[var(--color-accent)] text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
            Meilleur choix
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Hôtel</span>
            <h3 className="text-xl font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{hotel.name}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-[var(--color-text-secondary)] text-sm mb-4">
          <MapPin size={14} />
          <span>{hotel.city}</span>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">À partir de</p>
            <p className="text-lg font-bold text-[var(--color-primary)]">{hotel.priceFrom} <span className="text-sm font-normal">MAD</span></p>
          </div>
          
          <Link 
            to={`/hotels/${hotel.id}`} 
            className="bg-[var(--color-secondary)] hover:bg-[var(--color-primary-light)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 group-hover:bg-[var(--color-accent)]"
          >
            Détails <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
