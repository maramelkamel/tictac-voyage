// backend/controllers/chatController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

// ── Init Gemini ────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    maxOutputTokens: 800,
    temperature:     0.70,
    topP:            0.92,
  },
});

/* ================================================================
   MÉMOIRE DE CONVERSATION
   ================================================================ */
const extractProfile = (messages) => {
  const all = messages.map(m => m.content || '').join(' ').toLowerCase();
  return {
    budget:      all.match(/(\d+)\s*(dt|dinar|€|euro)/i)?.[0] || null,
    persons:     all.match(/(\d+)\s*(personne|pers|شخص|نفر)/i)?.[0] || null,
    destination: all.match(/(tunisie|paris|istanbul|dubai|rome|maroc|egypt|europe|asie|جنوب|شمال|خارج)/i)?.[0] || null,
    tripType:    all.match(/(famille|couple|seul|amis|عيلة|زوجين)/i)?.[0] || null,
    hasKids:     /enfant|kids|أطفال|صغار/.test(all),
    wantsHalal:  /halal|حلال/.test(all),
    luxury:      /luxe|5 étoile|فخم|luxury/.test(all),
  };
};

/* ================================================================
   SYSTEM PROMPT DYNAMIQUE
   ================================================================ */
const buildSystemPrompt = (profile, dbContext) => `
Tu es TIKA, conseillere voyage experte de Tic-Tac Voyages, agence tunisienne professionnelle.
Tu as la personnalite d'une vraie Tunisienne sympa qui parle a ses clients comme a des amis.

LANGUE - REGLE ABSOLUE :
Detecte la langue et reponds UNIQUEMENT dans cette langue.
- FRANCAIS   : reponds en francais chaleureux
- ENGLISH    : respond in friendly English
- ARABE      : رد بالعربية الفصحى
- DARIJA     : رد بالدارجة التونسية - "اهلا كيفاش نعاونك" "عندنا باكيج مزيان" "الميزانية متاعك تخدم معانا" "نلقاولك شي حاجة بالنيف"
- MELANGE    : reponds dans le meme melange francarabe/darija

EXPERTISE VOYAGE :
- Saisons : Dubai (oct-avril), Turquie (avr-oct), Europe (mai-sept), Sahara (nov-mars)
- Visa Tunisiens : Schengen (difficile), Turquie (sans visa), Dubai (a l'arrivee)
- Vols depuis Tunis : Istanbul 2h30, Paris 2h45, Dubai 5h, Rome 1h45
- Comparaisons honnetes : Istanbul (culture/histoire/moins cher) vs Dubai (luxe/shopping/cher)
- Conseils pratiques : assurance, change, SIM locale, vaccins
- Omra/Hajj : conditions, periodes, formules depuis Tunis

MODE CONSEILLER - UNE QUESTION A LA FOIS :
1. Tunisie ou etranger ? Mer, desert, ville ?
2. Combien de personnes ? Famille, couple, amis ?
3. Periode ou dates ?
4. Budget par personne ?
5. Preferences : hotel etoile, guide, halal ?

Apres 3 infos collectees, genere :
================================
   MES RECOMMANDATIONS POUR VOUS
================================
Option 1 : [Nom] - [Description] - ~[Prix] DT/pers*
Option 2 : [Nom] - [Description] - ~[Prix] DT/pers*
*Prix indicatif, soumis a disponibilite
Formulaire sur le site ou appel : +216 36 149 885

SERVICES & TARIFS :
Circuits Nord : Cap Bon (195DT/3j), Tunis Imperiale (290DT/4j), Vallees Tell (350DT/4j), Cote Corail (420DT/5j)
Circuits Sud  : Kerkennah (220DT/3j), Chott el-Jerid (395DT/4j), Ksour (510DT/5j), Sahara (680DT/6j)
Etranger sur mesure : Turquie/Egypte 900EUR | Europe 1200EUR | Asie/Dubai 1800EUR
Transport : voiture, minibus, bus avec chauffeur
Omra : vol+hotel+accompagnement depuis Tunis
Hotels : 3 a 5 etoiles Tunisie et international
Billetterie : vols toutes destinations

CONTACT : +216 36 149 885 | tictacvoyages@gmail.com | Lun-Sam 09h-18h

PROFIL CLIENT :
${profile.budget      ? `Budget: ${profile.budget}` : ''}
${profile.persons     ? `Personnes: ${profile.persons}` : ''}
${profile.destination ? `Destination: ${profile.destination}` : ''}
${profile.tripType    ? `Groupe: ${profile.tripType}` : ''}
${profile.hasKids     ? `Avec enfants: OUI - adapte suggestions` : ''}
${profile.wantsHalal  ? `Halal: OUI - mentionne systematiquement` : ''}
${profile.luxury      ? `Luxe: OUI - propose 5 etoiles` : ''}

REGLES :
- Reponds TOUJOURS dans la langue du client
- Naturelle et chaleureuse, pas robotique
- Termine par une action (formulaire, appel, ou question)
- Prix toujours "indicatif"
- Jamais de reservation directe
- Ne dis jamais "je suis une IA" - tu es Tika

${dbContext ? `DONNEES TEMPS REEL :\n${dbContext}` : ''}
`;

/* ================================================================
   DÉTECTION D'INTENTION
   ================================================================ */
const detectIntent = (messages) => {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (/عمرة|omra|umrah|mecque|madinah|hajj|حج/.test(last))                                   return 'omra';
  if (/transport|voiture|bus|minibus|transfert|chauffeur|سيارة|نقل|كرهبة/.test(last))         return 'transport';
  if (/circuit|tunisie|تونس|sahara|djerba|kerkennah|جنوب|شمال|دوز|جربة|cap bon/.test(last))  return 'circuits';
  if (/étranger|paris|dubai|istanbul|rome|maroc|turquie|أوروبا|دبي|خارج|barra/.test(last))   return 'abroad';
  if (/conseil|recommand|budget|aide|ميزانية|وين|كيفاش|شنو|نصيح|نحب نسافر/.test(last))       return 'advice';
  if (/réserver|booking|formulaire|حجز|نحجز/.test(last))                                      return 'booking';

  const inFlow = messages.filter(m => m.role === 'assistant')
    .some(m => /budget|personnes|destination|période|وين|كم شخص/.test(m.content || ''));
  if (inFlow && messages.length > 4) return 'recommendation';

  return 'general';
};

/* ================================================================
   CONTEXTE DB
   ================================================================ */
const getDBContext = async (intent) => {
  try {
    if (['transport', 'pricing'].includes(intent)) {
      const { rows } = await db.query(`
        SELECT transport_name, transport_type, capacity_min, capacity_max,
               price_per_km, price_halfday, price_fullday
        FROM transports WHERE is_available = true ORDER BY capacity_max ASC LIMIT 8
      `);
      if (!rows.length) return '';
      return `Vehicules :\n` + rows.map(v =>
        `- ${v.transport_name} (${v.transport_type}, ${v.capacity_min||1}-${v.capacity_max}p)` +
        `${v.price_halfday ? ` Demi-j: ${v.price_halfday}DT` : ''}` +
        `${v.price_fullday ? ` Journee: ${v.price_fullday}DT` : ''}` +
        `${v.price_per_km  ? ` /km: ${v.price_per_km}DT` : ''}`
      ).join('\n');
    }
    if (['advice','recommendation','circuits','general'].includes(intent)) {
      const { rows: tr } = await db.query(
        `SELECT transport_name, capacity_max, price_fullday FROM transports WHERE is_available = true ORDER BY capacity_max LIMIT 4`
      );
      const tInfo = tr.length ? `\nTransport: ` + tr.map(v => `${v.transport_name}(${v.capacity_max}p/${v.price_fullday||'devis'}DT)`).join(' | ') : '';
      return `Circuits Nord: Cap Bon 195DT/3j | Tunis Imperiale 290DT/4j | Vallees Tell 350DT/4j | Cote Corail 420DT/5j
Circuits Sud: Kerkennah 220DT/3j | Chott el-Jerid 395DT/4j | Ksour 510DT/5j | Sahara 680DT/6j
Etranger: Turquie/Egypte 900EUR | Europe 1200EUR | Asie/Dubai 1800EUR${tInfo}`;
    }
  } catch (err) { console.error('[Tika DB]', err.message); }
  return '';
};

/* ================================================================
   QUICK ACTIONS
   ================================================================ */
const getQuickActions = (intent) => ({
  circuits:       [{ label: '🗺️ Voir les circuits',    href: '/circuits'                        }, { label: '📋 Devis gratuit',      href: '/Contact'          }],
  transport:      [{ label: '🚗 Nos véhicules',        href: '/transport'                       }, { label: '📋 Demander un devis',  href: '/transport'        }],
  abroad:         [{ label: '✈️ Voyage sur mesure',    href: '/CustomTripAbroad'                }, { label: '📞 Nous contacter',     href: '/Contact'          }],
  omra:           [{ label: '🕌 Offres Omra',          href: '/Omra/omra'                       }, { label: '📞 Parler conseiller',  href: '/Contact'          }],
  booking:        [{ label: '📋 Formulaire',           href: '/CustomTripAbroad'                }, { label: '📞 Rappel immédiat',    href: '/Contact'          }],
  advice:         [{ label: '🌍 Voyages organisés',    href: '/VoyagesOrganise/VoyagesOrganise' }, { label: '✈️ Sur mesure',        href: '/CustomTripAbroad' }],
  recommendation: [{ label: '📋 Finaliser ma demande', href: '/CustomTripAbroad'                }, { label: '📞 Conseiller humain', href: '/Contact'          }],
}[intent] || []);

/* ================================================================
   CONVERTIR historique → format Gemini (user/model, pas user/assistant)
   ================================================================ */
const toGeminiHistory = (messages) => {
  const result = [];
  for (const m of messages) {
    const role = m.role === 'user' ? 'user' : 'model';
    // Gemini n'accepte pas 2 messages du même rôle consécutifs
    if (result.length > 0 && result[result.length - 1].role === role) continue;
    result.push({ role, parts: [{ text: String(m.content || '').slice(0, 1500) }] });
  }
  return result;
};

/* ================================================================
   CONTROLLER PRINCIPAL
   ================================================================ */
exports.chat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: 'Messages requis' });
  }

  try {
    const intent       = detectIntent(messages);
    const dbContext    = await getDBContext(intent);
    const quickActions = getQuickActions(intent);
    const profile      = extractProfile(messages);
    const systemPrompt = buildSystemPrompt(profile, dbContext);

    // Séparer historique et dernier message utilisateur
    const trimmed    = messages.slice(-14);
    const lastMsg    = trimmed[trimmed.length - 1];
    const historyRaw = trimmed.slice(0, -1);

    // Démarrer session Gemini
    const chat = model.startChat({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      history:           toGeminiHistory(historyRaw),
    });

    // Envoyer dernier message
    const result = await chat.sendMessage(
      String(lastMsg?.content || '').slice(0, 1500)
    );

    const reply = result.response.text() || "Désolée, je n'ai pas pu répondre.";

    res.json({ success: true, reply, intent, quickActions });

  } catch (err) {
    console.error('[Tika Gemini Error]', err.message);
    res.status(500).json({
      success:      false,
      reply:        'عندي مشكل تقني 😔\n📞 **+216 36 149 885**\n✉️ tictacvoyages@gmail.com',
      intent:       'error',
      quickActions: [{ label: '📞 Nous appeler', href: '/Contact' }],
    });
  }
};

/* ================================================================
   SUGGESTIONS D'ACCUEIL
   ================================================================ */
exports.getSuggestions = (_req, res) => {
  res.json({
    success: true,
    suggestions: [
      "Je veux voyager, aidez-moi 🌍",
      "shnowa el circuits mta3kom?",
      "3andi budget 500 DT, winou nemchi?",
      "What trips do you offer?",
      "نحب نعمل عمرة 🕌",
      "Voyage Paris en famille ?",
      "Meilleure saison pour le Sahara ?",
      "كيفاش نحجز transport?",
    ],
  });
};