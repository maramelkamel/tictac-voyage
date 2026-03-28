import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

const HotelGallery = ({ hotel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = hotel?.gallery && hotel.gallery.length > 0 
  ? hotel.gallery 
  : hotel?.image 
    ? [hotel.image] 
    : [];

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="hotel-gallery-section" id="gallery">
      <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
  <ImageIcon className="text-[var(--color-secondary)]" /> Galerie Photos
</h2>
      
      <div className="gallery-main group relative">
       
  {images.length > 0 && (
    <img 
      src={images[currentIndex]} 
      alt={`Vue ${currentIndex + 1}`} 
      className="gallery-main-image"
    />
  )}
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevImage}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white text-[var(--color-primary)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={nextImage}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white text-[var(--color-primary)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
        >
          <ChevronRight size={24} />
        </button>
        
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className="gallery-thumbnails">
        {images.map((img, index) => (
          <button 
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`gallery-thumbnail ${currentIndex === index ? 'active' : ''}`}
          >
            <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HotelGallery;
