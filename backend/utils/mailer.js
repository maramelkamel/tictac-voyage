// ════════════════════════════════════════════════════════════════════
// backend/utils/mailer.js

// HOW IT WORKS:
//   1. A single shared nodemailer transporter is created once at the
//      top of the module 
//   2. A baseTemplate() wrapper provides the shared header/footer HTML
//      so every email looks consistent without duplicating markup.
//   3. buildDetailRows() converts a { label: value } object into
//      HTML table rows used inside reservation summary cards.
//   4. Each exported function builds its own HTML body, injects it
//      into baseTemplate(), and calls transporter.sendMail().
//
// ENVIRONMENT VARIABLES REQUIRED:
//   EMAIL_USER  
//   EMAIL_PASS    
//   EMAIL_FROM   
//   FRONTEND_URL 

// EXPORTED FUNCTIONS:
//   sendWelcomeEmail           
//   sendReservationStatusEmail  
//   sendAgencyReservationEmail  
//   sendContactReplyEmail       
//   sendPasswordResetEmail      
//   sendPromotionEmail          
// ════════════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────────────────
// A single reusable SMTP connection to Gmail.
// Using a module-level singleton avoids re-creating the connection on
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── getTypeLabel ──────────────────────────────────────────────────────
/**
 * Converts an internal reservation type key into a human-readable
 * @param   {string} type  Internal type key (e.g. 'omra', 'flight')
 */
const getTypeLabel = (type) => ({
  omra:      'Omra',
  voyage:    'Voyage organise',
  circuit:   'Circuit Tunisie',
  flight:    'Billet d avion',
  hotel:     'Hotel',
  transport: 'Transport',
  custom:    'Voyage sur mesure',
}[type] || type);

// ── baseTemplate ──────────────────────────────────────────────────────
/**
 * Wraps any HTML content string in the standard TicTac Voyage email
 * @param   {string} content  Inner HTML to inject into the content area
 * @returns {string}          Full HTML email document
 */
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

        <!-- Brand header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0F4C5C,#1ECAD3);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">TicTac Voyage</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Votre agence de voyage de confiance</p>
          </td>
        </tr>

        <!-- Dynamic content area — injected by each send* function -->
        <tr>
          <td style="padding:36px 40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer with copyright and site link -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              &copy; 2026 TicTac Voyage · Tunis, Tunisie<br/>
              <a href="${process.env.FRONTEND_URL}" style="color:#0F4C5C;text-decoration:none;font-weight:600;">Visiter notre site</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── buildDetailRows ───────────────────────────────────────────────────
/**
 * Converts a plain { label: value } object into a sequence of HTML
 * <tr> rows suitable for use inside a reservation summary <table>.
 */
const buildDetailRows = (details = {}) =>
  Object.entries(details)
    .filter(([, value]) => value)
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #f1f5f9;">${label}</td>
        <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;text-align:right;">${value}</td>
      </tr>
    `).join('');

// ════════════════════════════════════════════════════════════════════
// EXPORTED EMAIL FUNCTIONS
// ════════════════════════════════════════════════════════════════════

// ── sendWelcomeEmail ──────────────────────────────────────────────────
/**
 * Sent automatically when a new client registers.
 * Contains a summary of their account details (name, email, phone)
 * and a CTA button to start browsing offers.
 * @param {Object} client
 */
const sendWelcomeEmail = async (client) => {
  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 8px;">Bienvenue, ${client.first_name} !</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Votre compte TicTac Voyage a ete cree avec succes.</p>

    <!-- Account summary card -->
    <div style="background:#e0fbfc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#0e7490;font-weight:700;">Vos informations</p>
      <p style="margin:4px 0;font-size:13px;color:#334155;"><strong>Nom :</strong> ${client.first_name} ${client.last_name}</p>
      <p style="margin:4px 0;font-size:13px;color:#334155;"><strong>Email :</strong> ${client.email}</p>
      <p style="margin:4px 0;font-size:13px;color:#334155;"><strong>Telephone :</strong> ${client.phone}</p>
    </div>

    <p style="color:#475569;font-size:13px;line-height:1.7;margin-bottom:24px;">
      Vous pouvez des maintenant explorer nos offres : Omra, Voyages organises, Circuits Tunisie, Transport et bien plus encore.
    </p>

    <!-- CTA button linking to the homepage -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        Explorer nos offres ->
      </a>
    </div>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      client.email,
    subject: 'Bienvenue chez TicTac Voyage',
    html,
  });
};

// ── sendReservationStatusEmail ────────────────────────────────────────
/**
 * Sent whenever the STATUS of an existing reservation changes.
 * Used by all reservation types
 */
const sendReservationStatusEmail = async ({
  email, firstName, type, title, status, details, customMessage, attachments,
}) => {
  // Map each status to its visual style and default message text.
  const statusConfig = {
    confirmed: {
      emoji:   'OK',
      label:   'confirmee',
      color:   '#065f46',
      bg:      '#d1fae5',
      message: 'Votre reservation a ete confirmee. Nous vous contacterons prochainement avec tous les details.',
    },
    cancelled: {
      emoji:   'INFO',
      label:   'annulee',
      color:   '#991b1b',
      bg:      '#fee2e2',
      message: 'Votre reservation a ete annulee. Contactez-nous pour plus d informations.',
    },
    completed: {
      emoji:   'OK',
      label:   'terminee',
      color:   '#0e7490',
      bg:      '#e0fbfc',
      message: 'Votre voyage est termine. Nous esperons que vous avez passe un excellent sejour.',
    },
    pending: {
      emoji:   'INFO',
      label:   'en attente',
      color:   '#c2410c',
      bg:      '#fff7ed',
      message: 'Votre reservation est en cours de traitement.',
    },
  };

  // Fall back to the "pending" style for any unknown status value
  const cfg        = statusConfig[status] || statusConfig.pending;
  const detailRows = buildDetailRows(details);

  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 6px;">Mise a jour de reservation</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Bonjour <strong>${firstName}</strong>,</p>

    <!-- Status banner: coloured left-border card with the status label and message -->
    <div style="background:${cfg.bg};border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid ${cfg.color};">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${cfg.color};">${cfg.label}</p>
      <p style="margin:0;font-size:13px;color:${cfg.color};">${customMessage || cfg.message}</p>
    </div>

    <!-- Reservation summary card: dark header with type + title, rows below -->
    <div style="background:#f8fafc;border-radius:12px;margin-bottom:24px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:14px 20px;background:#0F4C5C;">
        <p style="margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.05em;">${getTypeLabel(type)}</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#fff;">${title}</p>
      </div>
      ${detailRows ? `<table width="100%" cellpadding="0" cellspacing="0">${detailRows}</table>` : ''}
    </div>

    <!-- CTA button linking to the client's reservations tab -->
    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}/mon-compte?tab=reservations" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:13px;">
        Voir mes reservations ->
      </a>
    </div>
  `);

  await transporter.sendMail({
    from:        process.env.EMAIL_FROM,
    to:          email,
    subject:     `Reservation ${cfg.label} - TicTac Voyage`,
    html,
    attachments, // optional PDF
  });
};

// ── sendAgencyReservationEmail ────────────────────────────────────────
/**
 * Sent when a client chooses to pay at the agency instead of online.
 */
const sendAgencyReservationEmail = async ({
  email, firstName, type, title, details, promotionReminder, attachments,
}) => {
  const detailRows = buildDetailRows(details);

  // Build the optional promotion reminder block.
  // Only rendered when the client applied a promo code that has an
  // expiry date — reminds them to visit before the code lapses.
  const reminderBlock = promotionReminder?.date_fin ? `
    <div style="margin-top:24px;background:#fff7ed;border:1px solid #fdba74;border-radius:12px;padding:14px 16px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#c2410c;text-transform:uppercase;">Rappel promotion</p>
      <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.6;">
        ${promotionReminder.code ? `Le code <strong>${promotionReminder.code}</strong>` : 'Votre promotion'}
        reste valable jusqu'au <strong>${new Date(promotionReminder.date_fin).toLocaleDateString('fr-FR')}</strong>.
      </p>
    </div>
  ` : '';

  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 6px;">Reservation enregistree</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Bonjour <strong>${firstName}</strong>, votre reservation a bien ete enregistree avec paiement a l'agence.</p>

    <!-- 48-hour hold warning -->
    <div style="background:#fff7ed;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #f97316;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#9a3412;">Paiement a l'agence</p>
      <p style="margin:0;font-size:13px;color:#9a3412;">Votre reservation est retenue pendant 48h. Merci de finaliser le reglement directement a l'agence.</p>
    </div>

    <!-- Reservation summary card -->
    <div style="background:#f8fafc;border-radius:12px;margin-bottom:24px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:14px 20px;background:#0F4C5C;">
        <p style="margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.05em;">${getTypeLabel(type)}</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#fff;">${title}</p>
      </div>
      ${detailRows ? `<table width="100%" cellpadding="0" cellspacing="0">${detailRows}</table>` : ''}
    </div>

    <!-- Optional promo expiry reminder (injected only when relevant) -->
    ${reminderBlock}

    <!-- CTA button -->
    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.FRONTEND_URL}/mon-compte?tab=reservations" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:13px;">
        Voir mes reservations ->
      </a>
    </div>
  `);

  await transporter.sendMail({
    from:        process.env.EMAIL_FROM,
    to:          email,
    subject:     `Reservation enregistree - paiement a l'agence`,
    html,
    attachments,
  });
};

// ── sendContactReplyEmail ─────────────────────────────────────────────
/**
 * Sent to a client when an admin replies to their contact form message
 */
const sendContactReplyEmail = async ({
  email, firstName, subject, originalMessage, reply,
}) => {
  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 6px;">Reponse a votre message</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Bonjour <strong>${firstName}</strong>, notre equipe a repondu a votre message.</p>

    <!-- Client's original message (grey card, italic) -->
    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:16px;border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Votre message (sujet : ${subject})</p>
      <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;font-style:italic;">"${originalMessage}"</p>
    </div>

    <!-- Admin reply (green card with left accent border) -->
    <div style="background:#d1fae5;border-radius:10px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #10b981;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;">Reponse de TicTac Voyage</p>
      <p style="margin:0;font-size:14px;color:#065f46;line-height:1.7;">${reply}</p>
    </div>

    <!-- Invite the client to reach out again if needed -->
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
      Besoin d'aide supplementaire ? <a href="${process.env.FRONTEND_URL}/Contact" style="color:#0F4C5C;font-weight:600;">Contactez-nous</a>
    </p>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `Reponse TicTac Voyage - ${subject}`,
    html,
  });
};

// ── sendPasswordResetEmail ────────────────────────────────────────────
/**
 * Sends a one-time 6-digit reset code to a client who requested a
 * password reset. The code is valid for 30 minutes
 
 */
const sendPasswordResetEmail = async ({ email, firstName, resetCode }) => {
  const html = baseTemplate(`
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 6px;">Reinitialisation du mot de passe</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Bonjour <strong>${firstName}</strong>, vous avez demande a reinitialiser votre mot de passe.</p>

    <!-- Security notice: 30-minute validity + ignore instruction -->
    <div style="background:#fff7ed;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #f97316;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        Ce code est valable <strong>30 minutes</strong> seulement.
        Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
    </div>

    <!-- Large reset code displayed inside a teal gradient box -->
    <div style="text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;color:#475569;font-weight:600;">Votre code de reinitialisation :</p>
      <div style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1a6b80);border-radius:16px;padding:20px 40px;">
        <span style="font-size:38px;font-weight:900;color:#fff;letter-spacing:10px;">${resetCode}</span>
      </div>
    </div>

    <p style="color:#94a3b8;font-size:12px;text-align:center;">Entrez ce code sur la page de reinitialisation de mot de passe.</p>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: 'Code de reinitialisation - TicTac Voyage',
    html,
  });
};

// ── sendPromotionEmail ────────────────────────────────────────────────
/**
 * Marketing email sent to a list of clients when an admin broadcasts
 * a promotion from the admin panel.
 */
const sendPromotionEmail = async ({ email, firstName, promotion }) => {
  // Format the discount label based on the reduction type
  const isPercent = promotion.type_reduction === 'pourcentage';
  const discount  = isPercent
    ? `${promotion.valeur_reduction}%`
    : `${promotion.valeur_reduction} TND`;

  const html = baseTemplate(`
    <!-- Optional hero image + discount badge -->
    <div style="text-align:center;margin-bottom:24px;">
      ${promotion.image_url
        ? `<img src="${promotion.image_url}" alt="${promotion.titre}" style="width:100%;border-radius:10px;margin-bottom:16px;max-height:200px;object-fit:cover;"/>`
        : ''
      }
      <!-- Red gradient pill showing the discount amount -->
      <div style="display:inline-block;background:linear-gradient(135deg,#e92f64,#f43f5e);color:#fff;padding:10px 24px;border-radius:999px;font-size:22px;font-weight:900;margin-bottom:12px;">
        -${discount} de reduction
      </div>
    </div>

    <!-- Promotion title + personalised greeting -->
    <h2 style="color:#0F4C5C;font-size:22px;margin:0 0 8px;text-align:center;">${promotion.titre}</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px;text-align:center;">Bonjour <strong>${firstName}</strong>, une offre exclusive vous attend.</p>

    <!-- Optional description paragraph -->
    ${promotion.description
      ? `<p style="color:#475569;font-size:13px;line-height:1.7;margin-bottom:24px;">${promotion.description}</p>`
      : ''
    }

    <!-- Optional promo code box (dashed teal border, large text) -->
    ${promotion.code_promo ? `
      <div style="background:#f8fafc;border:2px dashed #1ECAD3;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">VOTRE CODE PROMO</p>
        <p style="margin:0;font-size:26px;font-weight:900;color:#0F4C5C;letter-spacing:4px;">${promotion.code_promo}</p>
      </div>
    ` : ''}

    <!-- Validity date range -->
    <div style="background:#e0fbfc;border-radius:10px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#0e7490;">
        Offre valable du <strong>${new Date(promotion.date_debut).toLocaleDateString('fr-FR')}</strong>
        au <strong>${new Date(promotion.date_fin).toLocaleDateString('fr-FR')}</strong>
      </p>
    </div>

    <!-- CTA button linking to the homepage -->
    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:linear-gradient(135deg,#0F4C5C,#1ECAD3);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        Profiter de l'offre ->
      </a>
    </div>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `${promotion.titre} - TicTac Voyage`,
    html,
  });
};

// ── Exports ───────────────────────────────────────────────────────────
// Each function is exported individually (e.g. the Omra controller only imports
// sendReservationStatusEmail and sendAgencyReservationEmail).
module.exports = {
  sendWelcomeEmail,
  sendReservationStatusEmail,
  sendAgencyReservationEmail,
  sendContactReplyEmail,
  sendPasswordResetEmail,
  sendPromotionEmail,
};
