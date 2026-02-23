import React, { useState, useEffect } from 'react';
import { Check, Wifi, Droplets, Snowflake, Wind, Coffee, Tv, Car, ShieldCheck } from 'lucide-react';

const HotelEquipments = ({ hotel }) => {
  const [dynamicEquipments, setDynamicEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock API call
  useEffect(() => {
    const fetchEquipments = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data from "partner API"
      const apiData = [
        "Réception 24h/24",
        "Service de conciergerie",
        "Bagagerie",
        "Blanchisserie",
        "Centre d'affaires"
      ];
      setDynamicEquipments(apiData);
      setLoading(false);
    };

    fetchEquipments();
  }, []);

  const staticEquipments = hotel.features || ["WiFi", "Climatisation"];

  const getIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi size={18} />;
    if (lower.includes('piscine')) return <Droplets size={18} />;
    if (lower.includes('clim')) return <Snowflake size={18} />;
    if (lower.includes('jardin')) return <Wind size={18} />;
    if (lower.includes('restaurant') || lower.includes('bar')) return <Coffee size={18} />;
    if (lower.includes('tv')) return <Tv size={18} />;
    if (lower.includes('parking') || lower.includes('navette')) return <Car size={18} />;
    return <Check size={18} />;
  };

  return (
    <div className="hotel-equipments-section" id="equipments">
      <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
        <ShieldCheck className="text-[var(--color-secondary)]" /> Équipements
      </h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Principaux équipements</h3>
        <div className="equipments-grid">
          {staticEquipments.map((item, index) => (
            <div key={index} className="equipment-item">
              <div className="equipment-icon">{getIcon(item)}</div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Services & Commodités (API Partenaire)</h3>
        {loading ? (
          <div className="skeleton" style={{height: '120px', borderRadius: '8px'}}></div>
        ) : (
          <div className="equipments-grid">
            {dynamicEquipments.map((item, index) => (
              <div key={index} className="equipment-item">
                <div className="equipment-icon">
                  <Check size={16} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelEquipments;
