const puppeteer = require('puppeteer');

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('fr-FR');
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.round((end - start) / 86400000);
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
};

const normalizeRoomAllocations = (reservation = {}) => {
  const rows = Array.isArray(reservation.room_allocations)
    ? reservation.room_allocations
    : [];

  if (rows.length > 0) {
    return rows.map((room, index) => ({
      room_number: index + 1,
      room_type: room?.room_type || reservation.room_type || '-',
      meal_plan: room?.meal_plan || reservation.meal_plan || '-',
      adults: Math.max(toNumber(room?.adults, 0), 0),
      children: Math.max(toNumber(room?.children, 0), 0),
      babies: Math.max(toNumber(room?.babies, 0), 0),
    }));
  }

  return [{
    room_number: 1,
    room_type: reservation.room_type || '-',
    meal_plan: reservation.meal_plan || '-',
    adults: Math.max(toNumber(reservation.adults, 0), 0),
    children: Math.max(toNumber(reservation.children, 0), 0),
    babies: Math.max(toNumber(reservation.babies, 0), 0),
  }];
};

const getArrangementLabel = (reservation, roomAllocations) => {
  const values = [
    reservation.meal_plan,
    ...roomAllocations.map((room) => room.meal_plan).filter(Boolean),
  ].filter(Boolean);
  const unique = [...new Set(values)];
  if (unique.length === 0) return '-';
  if (unique.length === 1) return unique[0];
  return 'Selon repartition chambres';
};

const buildVoucherHtml = (reservation) => {
  const adults = Math.max(toNumber(reservation.adults, 0), 0);
  const children = Math.max(toNumber(reservation.children, 0), 0);
  const babies = Math.max(toNumber(reservation.babies, 0), 0);
  const roomAllocations = normalizeRoomAllocations(reservation);
  const nights = getNights(reservation.check_in, reservation.check_out);
  const arrangement = getArrangementLabel(reservation, roomAllocations);
  const totals = roomAllocations.reduce((acc, room) => ({
    adults: acc.adults + room.adults,
    children: acc.children + room.children,
    babies: acc.babies + room.babies,
  }), { adults: 0, children: 0, babies: 0 });

  const rowsHtml = roomAllocations.map((room) => {
    const totalPax = room.adults + room.children + room.babies;
    return `
      <tr>
        <td>${escapeHtml(room.room_type || `Chambre ${room.room_number}`)}</td>
        <td>${escapeHtml(room.meal_plan || arrangement)}</td>
        <td class="center">${room.adults}</td>
        <td class="center">${room.children}</td>
        <td class="center">0</td>
        <td class="center">${room.babies}</td>
        <td class="center">${totalPax}</td>
        <td class="center">-</td>
      </tr>
    `;
  }).join('');

  const totalPax = totals.adults + totals.children + totals.babies;

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <style>
          @page {
            size: A4;
            margin: 18mm 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #ffffff;
            color: #111111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            line-height: 1.45;
          }

          .page {
            width: 100%;
          }

          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 18px;
          }

          .logo {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.04em;
            color: #0f4c9a;
          }

          .logo-sub {
            font-size: 11px;
            color: #4b5563;
            margin-top: 2px;
          }

          .dossier {
            text-align: right;
            font-size: 13px;
            line-height: 1.6;
          }

          .title {
            text-align: center;
            font-size: 24px;
            font-weight: 800;
            margin: 10px 0 18px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 22px;
            margin-bottom: 20px;
          }

          .field {
            min-height: 22px;
          }

          .label {
            font-weight: 700;
            font-style: italic;
          }

          .section-title {
            font-size: 15px;
            font-weight: 700;
            text-decoration: underline;
            margin: 10px 0 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }

          th,
          td {
            border: 1px solid #111111;
            padding: 8px 6px;
            font-size: 11px;
            vertical-align: middle;
          }

          th {
            color: #0f4c9a;
            font-weight: 800;
            text-align: center;
            background: #f7fbff;
          }

          .center {
            text-align: center;
          }

          .observations {
            margin-top: 8px;
          }

          .signature {
            margin-top: 28px;
            text-align: right;
            font-weight: 700;
          }

          .footer {
            margin-top: 32px;
            font-size: 10px;
            line-height: 1.5;
            color: #0f4c9a;
            text-align: center;
            border-top: 1px solid #0f4c9a;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="topbar">
            <div>
              <div class="logo">TicTac Voyages</div>
              <div class="logo-sub">www.tictacvoyages.com.tn</div>
            </div>
            <div class="dossier">
              <div><span class="label">Ben Arous le :</span> ${escapeHtml(formatDate(reservation.created_at))}</div>
              <div><span class="label">Dossier N° :</span> ${escapeHtml(reservation.id || '-')}</div>
            </div>
          </div>

          <div class="title">VOUCHER N° : ${escapeHtml(reservation.id || '-')}</div>

          <div class="info-grid">
            <div class="field"><span class="label">Hôtel :</span> ${escapeHtml(reservation.hotel_name || '-')}</div>
            <div class="field"><span class="label">Région :</span> ${escapeHtml(reservation.hotel_city || reservation.hotel_location || '-')}</div>
            <div class="field"><span class="label">Bénéficiaire :</span> ${escapeHtml(`${reservation.holder_first_name || ''} ${reservation.holder_last_name || ''}`.trim() || '-')}</div>
            <div class="field">${escapeHtml(`${adults} Adulte(s)   ${children} Enfant(s)   ${babies} Bébé(s)`)}</div>
            <div class="field"><span class="label">Arrivée :</span> ${escapeHtml(formatDate(reservation.check_in))}</div>
            <div class="field"><span class="label">Départ :</span> ${escapeHtml(formatDate(reservation.check_out))}</div>
            <div class="field"><span class="label">Nombre de Nuits :</span> ${escapeHtml(nights)}</div>
            <div class="field"><span class="label">Arrangement :</span> ${escapeHtml(arrangement)}</div>
          </div>

          <div class="section-title">Répartition Chambres</div>

          <table>
            <thead>
              <tr>
                <th>CHAMBRE</th>
                <th>LIBELLE</th>
                <th>ADULTES</th>
                <th>ENFANT PAYANTS</th>
                <th>ENFANTS GRATUIT</th>
                <th>BEBE</th>
                <th>TOTAL PAX</th>
                <th>SUPPLEMENT</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr>
                <td colspan="2" class="center"><strong>TOTAL</strong></td>
                <td class="center"><strong>${totals.adults}</strong></td>
                <td class="center"><strong>${totals.children}</strong></td>
                <td class="center"><strong>0</strong></td>
                <td class="center"><strong>${totals.babies}</strong></td>
                <td class="center"><strong>${totalPax}</strong></td>
                <td class="center"><strong>-</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="observations"><span class="label">Observations :</span> ${escapeHtml(reservation.special_requests || '-')}</div>
          <div style="margin-top: 12px;"><span class="label">Réservation effectuée par :</span> Tic Tac Voyages</div>
          <div class="signature">Cachet &amp; Signature</div>

          <div class="footer">
            Tic Tac Voyages - agence licence A - MF: 1502694SAM000 - RIB: 20 030 3022100335847 42 BTK Rades - Ben arous |
            Siège Social: 4 Résidence Nour El Médina Nouvelle Médine/2063 Ben Arous |
            Tel/Fax: 36149885 Portable: 21745352/95586156 Mail: tictacvoyages@outlook.fr Web: www.tictacvoyages.com.tn
          </div>
        </div>
      </body>
    </html>
  `;
};

const generateVoucher = async (reservation) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(buildVoucherHtml(reservation), { waitUntil: 'domcontentloaded' });

    return await page.pdf({
      format: 'A4',
      printBackground: true,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = generateVoucher;
