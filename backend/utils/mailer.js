const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Base HTML template wrapper ────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TicTac Voyage</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0F4C5C,#1ECAD3);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">✈️ TicTac Voyage</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Votre agence de voyage de confiance</p>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="padding:36px 40px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              © 2026 TicTac Voyage · Tunis, Tunisie<br/>
              <a href="${process.env.FRONTEND_URL}" style="color:#0F4C5C;text-decoration:none;font-weight:600;">Visiter notre site</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ══════════════════════════════════════════════════════════════
//  EMAIL SENDERS
// ══════════════════════════════════════════════════════════════

// ── 1. Welcome email after account creation ───────────────────
const sendWelcomeEmail = async (client) => {
  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 8px;">Bienvenue, ${client.first_name} ! 🎉</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Votre compte TicTac Voyage a été créé avec succès.</p>

    <div style="background:#e0fbfc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#0e7490;font-weight:700;">📋 Vos informations</p>
      <p style="margin:4px 0;font-size:13px;color:#334155;"><strong>Nom :</strong> ${client.first_name} ${client.last_name}</p>
      <p style="margin:4px 0;font-size:13px;color:#334155;"><strong>Email :</strong> ${client.email}</p>
      <p style="margin:4px 0;font-size:13px;color:#334155;"><strong>Téléphone :</strong> ${client.phone}</p>
    </div>

    <p style="color:#475569;font-size:13px;line-height:1.7;margin-bottom:24px;">
      Vous pouvez dès maintenant explorer nos offres : Omra, Voyages organisés, Circuits Tunisie, Transport et bien plus encore.
    </p>

    <div style="text-align:center;margin-bottom:8px;">
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        Explorer nos offres →
      </a>
    </div>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      client.email,
    subject: '🎉 Bienvenue chez TicTac Voyage !',
    html,
  });
};

// ── 2. Reservation status change email ───────────────────────
const sendReservationStatusEmail = async ({ email, firstName, type, title, status, details }) => {
  const statusConfig = {
    confirmed: { emoji:'✅', label:'Confirmée',  color:'#065f46', bg:'#d1fae5', message:'Votre réservation a été confirmée ! Nous vous contacterons prochainement avec tous les détails.' },
    cancelled: { emoji:'❌', label:'Annulée',    color:'#991b1b', bg:'#fee2e2', message:'Votre réservation a été annulée. Contactez-nous pour plus d\'informations.' },
    completed: { emoji:'🏁', label:'Terminée',   color:'#0e7490', bg:'#e0fbfc', message:'Votre voyage est terminé. Nous espérons que vous avez passé un excellent séjour !' },
    pending:   { emoji:'⏳', label:'En attente', color:'#c2410c', bg:'#fff7ed', message:'Votre réservation est en cours de traitement.' },
  };

  const cfg = statusConfig[status] || statusConfig.pending;

  const typeLabel = {
    omra:      '🕌 Omra',
    voyage:    '🏖️ Voyage Organisé',
    circuit:   '🗺️ Circuit Tunisie',
    transport: '🚌 Transport',
    custom:    '✈️ Voyage sur Mesure',
  }[type] || type;

  // Build details rows
  const detailRows = details ? Object.entries(details)
    .filter(([,v]) => v)
    .map(([k, v]) => `
      <tr>
        <td style="padding:8px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #f1f5f9;">${k}</td>
        <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;text-align:right;">${v}</td>
      </tr>`).join('') : '';

  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 6px;">Mise à jour de réservation ${cfg.emoji}</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Bonjour <strong>${firstName}</strong>,</p>

    <div style="background:${cfg.bg};border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid ${cfg.color};">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${cfg.color};">${cfg.emoji} Statut : ${cfg.label}</p>
      <p style="margin:0;font-size:13px;color:${cfg.color};">${cfg.message}</p>
    </div>

    <div style="background:#f8fafc;border-radius:12px;margin-bottom:24px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:14px 20px;background:#0F4C5C;">
        <p style="margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.05em;">${typeLabel}</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#fff;">${title}</p>
      </div>
      ${detailRows ? `<table width="100%" cellpadding="0" cellspacing="0">${detailRows}</table>` : ''}
    </div>

    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}/mon-compte?tab=reservations" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:13px;">
        Voir mes réservations →
      </a>
    </div>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `${cfg.emoji} Réservation ${cfg.label} — TicTac Voyage`,
    html,
  });
};

// ── 3. Contact message reply ──────────────────────────────────
const sendContactReplyEmail = async ({ email, firstName, subject, originalMessage, adminReply }) => {
  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 6px;">Réponse à votre message 💬</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Bonjour <strong>${firstName}</strong>, notre équipe a répondu à votre message.</p>

    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:16px;border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Votre message (sujet : ${subject})</p>
      <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;font-style:italic;">"${originalMessage}"</p>
    </div>

    <div style="background:#d1fae5;border-radius:10px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #10b981;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;">Réponse de TicTac Voyage</p>
      <p style="margin:0;font-size:14px;color:#065f46;line-height:1.7;">${adminReply}</p>
    </div>

    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
      Besoin d'aide supplémentaire ? <a href="${process.env.FRONTEND_URL}/Contact" style="color:#0F4C5C;font-weight:600;">Contactez-nous</a>
    </p>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `💬 Réponse TicTac Voyage — ${subject}`,
    html,
  });
};

// ── 4. Password reset ─────────────────────────────────────────
const sendPasswordResetEmail = async ({ email, firstName, resetToken }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 6px;">Réinitialisation du mot de passe 🔐</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Bonjour <strong>${firstName}</strong>, vous avez demandé à réinitialiser votre mot de passe.</p>

    <div style="background:#fff7ed;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #f97316;">
      <p style="margin:0;font-size:13px;color:#92400e;">⚠️ Ce lien est valable <strong>30 minutes</strong> seulement. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        Réinitialiser mon mot de passe →
      </a>
    </div>

    <p style="color:#94a3b8;font-size:11px;text-align:center;word-break:break-all;">
      Ou copiez ce lien : ${resetUrl}
    </p>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: '🔐 Réinitialisation de mot de passe — TicTac Voyage',
    html,
  });
};

// ── 5. Promotion blast to all clients ────────────────────────
const sendPromotionEmail = async ({ email, firstName, promotion }) => {
  const isPercent = promotion.type_reduction === 'pourcentage';
  const discount  = isPercent ? `${promotion.valeur_reduction}%` : `${promotion.valeur_reduction} TND`;

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      ${promotion.image_url ? `<img src="${promotion.image_url}" alt="${promotion.titre}" style="width:100%;border-radius:10px;margin-bottom:16px;max-height:200px;object-fit:cover;"/>` : ''}
      <div style="display:inline-block;background:linear-gradient(135deg,#e92f64,#f43f5e);color:#fff;padding:10px 24px;border-radius:999px;font-size:22px;font-weight:900;margin-bottom:12px;">
        ${isPercent ? `−${discount}` : `−${discount}`} de réduction !
      </div>
    </div>

    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 8px;text-align:center;">${promotion.titre}</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;text-align:center;">Bonjour <strong>${firstName}</strong>, une offre exclusive vous attend !</p>

    ${promotion.description ? `<p style="color:#475569;font-size:13px;line-height:1.7;margin-bottom:24px;">${promotion.description}</p>` : ''}

    ${promotion.code_promo ? `
    <div style="background:#f8fafc;border:2px dashed #1ECAD3;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">VOTRE CODE PROMO</p>
      <p style="margin:0;font-size:26px;font-weight:900;color:#0F4C5C;letter-spacing:4px;">${promotion.code_promo}</p>
    </div>` : ''}

    <div style="background:#e0fbfc;border-radius:10px;padding:14px 20px;margin-bottom:24px;display:flex;">
      <p style="margin:0;font-size:13px;color:#0e7490;">
        📅 Offre valable du <strong>${new Date(promotion.date_debut).toLocaleDateString('fr-FR')}</strong>
        au <strong>${new Date(promotion.date_fin).toLocaleDateString('fr-FR')}</strong>
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        Profiter de l'offre →
      </a>
    </div>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `🔥 ${promotion.titre} — TicTac Voyage`,
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendReservationStatusEmail,
  sendContactReplyEmail,
  sendPasswordResetEmail,
  sendPromotionEmail,
};