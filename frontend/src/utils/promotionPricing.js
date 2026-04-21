export function normalizePromoCode(code = '') {
  return String(code).trim().toUpperCase();
}

export function findPromotionByCode(promos = [], code = '') {
  const normalizedCode = normalizePromoCode(code);
  if (!normalizedCode) return null;

  return promos.find((promo) => normalizePromoCode(promo?.code_promo) === normalizedCode) || null;
}

export function getPromotionPricing(baseAmount, promotion) {
  const amount = Number(baseAmount) || 0;
  if (!promotion) {
    return {
      baseAmount: amount,
      discountAmount: 0,
      finalAmount: amount,
    };
  }

  const reductionValue = Number(promotion.valeur_reduction) || 0;
  const rawDiscount = promotion.type_reduction === 'pourcentage'
    ? (amount * reductionValue) / 100
    : reductionValue;

  const discountAmount = Math.min(amount, Math.max(0, rawDiscount));
  const finalAmount = Math.max(0, amount - discountAmount);

  return {
    baseAmount: amount,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
  };
}

export function serializeAppliedPromotion(promotion, categorie) {
  if (!promotion) return null;

  return {
    id: promotion.id,
    titre: promotion.titre,
    categorie: categorie || promotion.categorie || null,
    code_promo: promotion.code_promo || null,
    type_reduction: promotion.type_reduction,
    valeur_reduction: promotion.valeur_reduction,
    date_fin: promotion.date_fin || null,
  };
}
