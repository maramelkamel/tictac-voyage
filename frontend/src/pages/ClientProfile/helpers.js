export const getClientLevelInfo = (total) => {
  if (total < 3)  return { level:0, label:'Niveau 0',        color:'#64748b', bg:'#f1f5f9', icon:'🌱',    min:0,  next:3,  nextLabel:`${3  - total} réservation(s) pour Niveau 1` };
  if (total < 6)  return { level:1, label:'Niveau 1 ⭐',      color:'#0e7490', bg:'#e0fbfc', icon:'⭐',    min:3,  next:6,  nextLabel:`${6  - total} réservation(s) pour Niveau 2` };
  if (total < 10) return { level:2, label:'Niveau 2 ⭐⭐',    color:'#c2410c', bg:'#fff7ed', icon:'⭐⭐',  min:6,  next:10, nextLabel:`${10 - total} réservation(s) pour Niveau 3` };
  return                  { level:3, label:'Niveau 3 ⭐⭐⭐',  color:'#7c3aed', bg:'#f5f3ff', icon:'⭐⭐⭐', min:10, next:null, nextLabel:'Niveau maximum atteint ! 🎉' };
};

export const getNextDiscount = (total) => {
  if (total < 5)  return { at:5,  pct:10, remaining:5  - total };
  if (total < 10) return { at:10, pct:20, remaining:10 - total };
  const next = Math.ceil((total + 1) / 3) * 3;
  return { at:next, pct:5, remaining:next - total };
};

export const isPromotionActive = (promotion) => {
  if (!promotion?.is_active) return false;
  const today = new Date();
  const start = promotion.date_debut ? new Date(promotion.date_debut) : null;
  const end   = promotion.date_fin   ? new Date(promotion.date_fin)   : null;
  if (start && start > today) return false;
  if (end   && end   < today) return false;
  return true;
};