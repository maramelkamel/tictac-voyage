// src/pages/admin/Circuits/CircuitPackages.jsx
// ── VERSION COMPLÈTE avec édition détail (programme, highlights, inclus/non inclus, galerie) ──
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../layout/AdminLayout';

const API        = 'http://localhost:5000/api/circuits';
const COVERS_API = 'http://localhost:5000/api/circuits/circuit-covers';
const MEDIA_API  = 'http://localhost:5000/api/media/upload';
const fPrice     = (p) => p ? Number(p).toLocaleString('fr-TN') + ' DT' : '—';

// ────────────────────────────────────────────────────────────────
// CIRCUITS TUNISIENS PAR DÉFAUT (seed data)
// ────────────────────────────────────────────────────────────────
export const TUNISIAN_CIRCUITS = {
  nord: [
    {
      title: 'Tunis & Carthage Impériale',
      subtitle: 'Tunis · Carthage · Sidi Bou Saïd · La Marsa · 3 jours',
      description: "Plongez au cœur de la capitale tunisienne et découvrez les vestiges de l'antique Carthage, cité phénicienne qui a défié Rome. La médina de Tunis, classée UNESCO, vous accueille dans ses ruelles parfumées de jasmin, entre souks animés et palais andalous.",
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      price: 490,
      old_price: 590,
      duration: 3,
      nights: 2,
      region: 'nord',
      departure: 'Tunis',
      spots: 20,
      rating: 4.9,
      reviews: 87,
      badge: 'Populaire',
      tag: 'Patrimoine UNESCO',
      tag_color: 'teal',
      difficulty: 'Facile',
      group_size: '4 – 16 personnes',
      is_active: true,
      highlights: [
        'Médina de Tunis (UNESCO)',
        'Musée national du Bardo',
        'Site archéologique de Carthage',
        'Village de Sidi Bou Saïd',
        'Souks et artisanat local',
        'Coucher de soleil à La Marsa',
      ],
      programme: [
        "Arrivée à Tunis. Installation à l'hôtel en médina. Visite guidée du souk des Chéchias, de la Grande Mosquée Zitouna et des palais beylicaux. Dîner traditionnel dans un restaurant de la médina.",
        "Matinée : Musée du Bardo (mosaïques romaines parmi les plus belles au monde). Après-midi : Site archéologique de Carthage — Byrsa, thermes d'Antonin, tophet. Fin d'après-midi à Sidi Bou Saïd, maisons bleues et blanches sur les falaises.",
        "Promenade matinale à La Marsa. Visite du Palais de l'Ennasr. Déjeuner de fruits de mer. Retour à Tunis, passage par le marché central et emplettes artisanales avant le départ.",
      ],
      inclus: [
        'Transport en van climatisé',
        'Hébergement 2 nuits (hôtel 3★ médina)',
        'Guide arabophone & francophone',
        'Petits-déjeuners inclus',
        'Entrées sites : Bardo + Carthage',
        'Eau minérale à volonté',
      ],
      non_inclus: [
        'Vols internationaux',
        'Déjeuners et dîners (sauf J1)',
        'Pourboires guides',
        'Dépenses personnelles',
      ],
      gallery: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1539020140153-e479b8e28f32?w=800',
        'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800',
        'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800',
      ],
    },
    {
      title: 'Cap Bon & Côte Corallienne',
      subtitle: 'Nabeul · Hammamet · Kelibia · El Haouaria · 4 jours',
      description: "Le Cap Bon, presqu'île fertile entre mer et montagne, vous offre des plages de sable fin, des vignobles parfumés et des vestiges puniques. Hammamet et ses médinas blanches, Kelibia et son fort byzantin, El Haouaria et ses grottes de taille de pierre… une péninsule à part entière.",
      image_url: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1200&q=80',
      price: 620,
      old_price: null,
      duration: 4,
      nights: 3,
      region: 'nord',
      departure: 'Tunis',
      spots: 16,
      rating: 4.8,
      reviews: 54,
      badge: 'Nouveau',
      tag: 'Mer & Nature',
      tag_color: 'blue',
      difficulty: 'Facile',
      group_size: '4 – 14 personnes',
      is_active: true,
      highlights: [
        'Médina d\'Hammamet (remparts XVe s.)',
        'Fort byzantin de Kelibia',
        'Grottes d\'El Haouaria',
        'Plages de sable blanc',
        'Dégustation vins & céramiques Nabeul',
        'Pêche traditionnelle thonidés',
      ],
      programme: [
        "Départ de Tunis vers Nabeul, capitale de la poterie. Visite des ateliers de céramique et des marchés du vendredi. Route vers Hammamet, installation en hôtel balnéaire.",
        "Hammamet : visite de la médina et de la casbah, promenade sur le front de mer. Après-midi libre à la plage. En soirée, dîner de poissons frais.",
        "Route vers Kelibia : fort byzantin panoramique avec vue sur la côte sicilienne par temps clair. Continuation vers El Haouaria, grottes de taille de pierre romaines. Pique-nique sur les falaises.",
        "Visite du centre d'El Haouaria (fauconnerie traditionnelle). Retour côtier via Korba et Menzel Temime. Déjeuner à Nabeul. Retour Tunis.",
      ],
      inclus: [
        'Transport climatisé',
        'Hébergement 3 nuits',
        'Guide spécialisé patrimoine',
        'Petits-déjeuners',
        'Pique-nique J3',
        'Entrées grottes El Haouaria',
      ],
      non_inclus: [
        'Vols',
        'Déjeuners & dîners (sauf J3)',
        'Activités nautiques optionnelles',
        'Dépenses personnelles',
      ],
      gallery: [
        'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800',
      ],
    },
    {
      title: 'Bizerte & Tabarka Sauvage',
      subtitle: 'Bizerte · Ichkeul · Ain Draham · Tabarka · 5 jours',
      description: "Le Grand Nord tunisien révèle ses trésors les plus secrets : le lac d'Ichkeul, réserve de biosphère, les forêts de chênes-lièges d'Ain Draham où le brouillard matinal crée un paysage de conte, et Tabarka avec ses récifs coralliens et sa génoise vénitienne.",
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      price: 850,
      old_price: 980,
      duration: 5,
      nights: 4,
      region: 'nord',
      departure: 'Tunis',
      spots: 12,
      rating: 4.7,
      reviews: 32,
      badge: null,
      tag: 'Nature & Aventure',
      tag_color: 'green',
      difficulty: 'Modéré',
      group_size: '4 – 12 personnes',
      is_active: true,
      highlights: [
        'Lac d\'Ichkeul (UNESCO Biosphère)',
        'Vieille ville de Bizerte & port',
        'Forêts de chênes-lièges d\'Ain Draham',
        'Plongée corallienne à Tabarka',
        'Les Aiguilles de Tabarka',
        'Randonnée Kroumirie',
      ],
      programme: [
        "Départ vers Bizerte : vieille ville ottomane, kasbah, port de pêche. Déjeuner de poissons. Installation.",
        "Matinée : Parc national de l'Ichkeul (flamants roses, buffles, oiseaux migrateurs). Après-midi libre à Bizerte.",
        "Route vers Ain Draham via Jendouba. Randonnée guidée dans les forêts de chênes-lièges. Installation dans un gîte de montagne. Soirée chaleureuse avec repas kabyle.",
        "Continuation vers Tabarka. Les Aiguilles, les récifs coralliens. Optionnel : plongée ou snorkeling. Soirée culturelle berbère.",
        "Matinée libre à Tabarka. Marché artisanal (corail, poterie). Déjeuner puis retour Tunis.",
      ],
      inclus: [
        'Transport 4x4 et van',
        'Hébergement 4 nuits (hôtel + gîte)',
        'Guide naturaliste',
        'Petits-déjeuners + dîner J3',
        'Entrées Parc Ichkeul',
        'Randonnée guidée Kroumirie',
      ],
      non_inclus: [
        'Vols',
        'Plongée (optionnel +80 DT)',
        'Autres repas',
        'Dépenses personnelles',
      ],
      gallery: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800',
        'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800',
      ],
    },
  ],
  sud: [
    {
      title: 'Dunes d\'Or — Grand Erg Oriental',
      subtitle: 'Douz · Ksar Ghilane · Grand Erg · Ong Jemal · 5 jours',
      description: "Partez à la conquête du Sahara tunisien, l'un des plus accessibles et des plus spectaculaires d'Afrique du Nord. Des dunes de Douz aux oasis de Ksar Ghilane, en passant par les ksour berbères millénaires, ce circuit vous plongera dans un univers de sable, d'étoiles et de silences.",
      image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80',
      price: 980,
      old_price: 1150,
      duration: 5,
      nights: 4,
      region: 'sud',
      departure: 'Tunis',
      spots: 14,
      rating: 4.9,
      reviews: 112,
      badge: 'Populaire',
      tag: 'Désert & Aventure',
      tag_color: 'orange',
      difficulty: 'Modéré',
      group_size: '4 – 14 personnes',
      is_active: true,
      highlights: [
        'Dunes du Grand Erg Oriental',
        'Oasis de Ksar Ghilane (source chaude)',
        'Nuit en bivouac sous les étoiles',
        'Coucher de soleil sur les dunes (chameau)',
        'Village berbère de Douz',
        'Ong Jemal — paysage de Star Wars',
      ],
      programme: [
        "Départ de Tunis vers Douz, «porte du désert». Installation au camp. Visite du marché hebdomadaire bédouin. Première chevauchée sur les dunes au coucher du soleil.",
        "Journée complète dans le Grand Erg Oriental : dunes à perte de vue, promenade en dromadaire, piste piste 4x4. Déjeuner berbère sous une tente nomade. Nuit en bivouac étoilé.",
        "Traversée vers Ksar Ghilane : oasis saharienne avec source d'eau chaude naturelle. Baignade dans la piscine naturelle. Bivouac en oasis, dîner aux flambeaux.",
        "Route vers Matmata (maisons troglodytiques — décors de Star Wars) puis Ong Jemal et ses roches sculptées par le vent. Nuit à Tozeur en hôtel de charme.",
        "Visite de Tozeur : médina en briques de Margoum, musée Dar Cheraiet. Route retour vers Tunis via Gafsa.",
      ],
      inclus: [
        'Transport 4x4 confortables',
        'Hébergement 3 nuits camp/bivouac + 1 nuit hôtel',
        'Guide saharien certifié',
        'Tous les repas inclus (J1 à J5)',
        'Excursion en dromadaire',
        'Baignade source Ksar Ghilane',
        'Eau & boissons chaudes illimitées',
      ],
      non_inclus: [
        'Vols Tunis / départ',
        'Assurance voyage',
        'Quad optionnel (+120 DT)',
        'Dépenses personnelles & souvenirs',
      ],
      gallery: [
        'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
        'https://images.unsplash.com/photo-1597149197088-fd60ba02a7d0?w=800',
        'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=800',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      ],
    },
    {
      title: 'Ksour Berbères & Troglodytes',
      subtitle: 'Médenine · Ksar Ouled Soltane · Matmata · Chenini · 4 jours',
      description: "Les ksour (greniers fortifiés berbères) du sud tunisien figurent parmi les architectures les plus singulières au monde. Ksar Ouled Soltane avec ses ghorfas en argile rouge, Chenini juchée sur son éperon rocheux, Douiret et ses maisons troglodytiques : un voyage dans le temps millénaire.",
      image_url: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=1200&q=80',
      price: 780,
      old_price: null,
      duration: 4,
      nights: 3,
      region: 'sud',
      departure: 'Tunis',
      spots: 16,
      rating: 4.8,
      reviews: 67,
      badge: 'Nouveau',
      tag: 'Culture Berbère',
      tag_color: 'accent',
      difficulty: 'Facile',
      group_size: '4 – 16 personnes',
      is_active: true,
      highlights: [
        'Ksar Ouled Soltane (le mieux conservé)',
        'Matmata — maisons souterraines (Star Wars)',
        'Chenini — village perché sur 800 m',
        'Douiret — cité berbère abandonnée',
        'Tataouine & marché berbère',
        'Musée du costume traditionnel',
      ],
      programme: [
        "Départ Tunis vers Médenine. Déjeuner à Médenine. Visite du Ksar de Médenine (seul ksar en ville). Continuation Tataouine. Installation. Soirée musique andalouse berbère.",
        "Journée ksour : Ksar Ouled Soltane (ghorfas à 2 étages, pigeons nicheurs), Ksar Hadada (décor de Star Wars), Ksar Beni Ghedir. Déjeuner nomade dans une salle du ksar.",
        "Matmata : maisons souterraines (habitations creusées à –6m dans le tuf). Visite de familles troglodytiques. Route vers Chenini par piste panoramique. Coucher de soleil sur le village blanc.",
        "Matin : Douiret, cité berbère quasi-abandonnée, mosquée à 7 coupoles. Retour vers Tunis via Gabès et ses jardins d'oliviers.",
      ],
      inclus: [
        'Transport en van 4x4',
        'Hébergement 3 nuits',
        'Guide culturel berbère bilingue',
        'Petits-déjeuners',
        'Déjeuner J2 dans un ksar',
        'Entrées tous les sites',
      ],
      non_inclus: [
        'Vols',
        'Autres repas',
        'Dépenses personnelles',
        'Pourboires',
      ],
      gallery: [
        'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=800',
        'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
        'https://images.unsplash.com/photo-1597149197088-fd60ba02a7d0?w=800',
      ],
    },
    {
      title: 'Tozeur & Chott el-Jérid',
      subtitle: 'Tozeur · Nefta · Chott el-Jérid · Hazoua · 3 jours',
      description: "Le Chott el-Jérid, vaste lac salé de 5 000 km² aux mirages féeriques, mène à Tozeur, joyau du désert aux ruelles en briques de Margoum. Nefta et son corbeille de palmiers, les oasis de montagne des Ksour du Jérid, et des couchers de soleil sur la mer de sel forgent des souvenirs impérissables.",
      image_url: 'https://images.unsplash.com/photo-1597149197088-fd60ba02a7d0?w=1200&q=80',
      price: 690,
      old_price: 790,
      duration: 3,
      nights: 2,
      region: 'sud',
      departure: 'Tozeur',
      spots: 18,
      rating: 4.7,
      reviews: 44,
      badge: 'Promo',
      tag: 'Oasis & Paysages',
      tag_color: 'violet',
      difficulty: 'Facile',
      group_size: '2 – 18 personnes',
      is_active: true,
      highlights: [
        'Traversée du Chott el-Jérid en 4x4',
        'Médina de Tozeur (briques Margoum)',
        'Oasis de Nefta — la corbeille',
        'Palmeraie de 400 000 palmiers',
        'Hazoua — frontière algérienne & mirages',
        'Musée Dar Cheraiet',
      ],
      programme: [
        "Arrivée à Tozeur. Visite du musée Dar Cheraiet (artisanat, ethnographie). Balade dans la médina aux mille ruelles de briques sculptées. Coucher de soleil sur la palmeraie depuis le belvédère.",
        "Journée Chott el-Jérid : traversée du lac salé en 4x4, mirages et cristaux de sel, arrêt à Hazoua. Continuation vers Nefta, la corbeille aux 152 sources. Déjeuner chez l'habitant. Visite de la zaouïa de Sidi Brahim.",
        "Matinée : promenade en calèche dans la palmeraie. Dégustation dattes deglet nour. Visite d'une ferme d'artisanat local. Départ retour.",
      ],
      inclus: [
        'Transport 4x4',
        'Hébergement 2 nuits (hôtel charme)',
        'Guide local Jérid',
        'Petits-déjeuners',
        'Déjeuner chez habitant J2',
        'Traversée Chott + calèche palmeraie',
        'Entrée musée Dar Cheraiet',
      ],
      non_inclus: [
        'Vols / transfert Tunis-Tozeur',
        'Autres repas',
        'Quad optionnel',
        'Dépenses personnelles',
      ],
      gallery: [
        'https://images.unsplash.com/photo-1597149197088-fd60ba02a7d0?w=800',
        'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      ],
    },
  ],
};

const EMPTY = {
  title:'', subtitle:'', description:'', image_url:'', price:'', old_price:'',
  duration:'', nights:'', region:'nord', departure:'', spots:'20', rating:'5.0',
  reviews:'0', badge:'', tag:'', tag_color:'teal', difficulty:'Facile',
  group_size:'', is_active:true,
  highlights:[], programme:[], inclus:[], non_inclus:[], gallery:[],
};

const DEFAULT_COVERS = {
  hero: {
    bg_image:     '',
    tag:          'Circuits touristiques - Tunisie',
    title:        'Explorez la Tunisie',
    title_accent: 'du Nord au Sud',
    sub:          'Des circuits soigneusement conçus pour vous faire découvrir les trésors du pays, entre mer, désert, culture et authenticité.',
  },
  nord: {
    image_url:        '',
    card_title:       'Circuit Nord',
    card_description: 'Patrimoine, côtes sauvages, sites romains et forêts de pins du Tell.',
    hero_title:       'Découvrez le Nord de la Tunisie',
    hero_sub:         'Médinas historiques, côtes coralliennes, vestiges romains et montagnes verdoyantes.',
    icon:             '🏛',
  },
  sud: {
    image_url:        '',
    card_title:       'Circuit Sud',
    card_description: 'Désert doré, ksour berbères, oasis de palmiers et nuits sous les étoiles.',
    hero_title:       'Aventures dans le Grand Sud',
    hero_sub:         'Sahara infini, villages berbères millénaires, oasis enchanteresses et ciels étoilés.',
    icon:             '🏜',
  },
};

const ModalField = ({ label, req, children }) => (
  <div className="al-field">
    <label className="al-label">{label} {req && <span className="al-required">*</span>}</label>
    {children}
  </div>
);

// ── Composant liste éditable (highlights, programme, inclus, non_inclus) ──
const EditableList = ({ label, items = [], onChange, placeholder = 'Ajouter un élément...', multiline = false }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewItem('');
  };

  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  const updateItem = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="al-label">{label}</label>

      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          {multiline ? (
            <textarea
              className="al-textarea"
              rows={2}
              value={item}
              onChange={e => updateItem(i, e.target.value)}
              style={{ flex: 1, fontSize: 12, resize: 'vertical' }}
            />
          ) : (
            <input
              className="al-input"
              value={item}
              onChange={e => updateItem(i, e.target.value)}
              style={{ flex: 1, fontSize: 12 }}
            />
          )}
          <button
            type="button"
            onClick={() => removeItem(i)}
            style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: 6,
              border: '1px solid var(--danger, #e92f64)', background: 'rgba(233,47,100,.08)',
              color: 'var(--danger, #e92f64)', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: multiline ? 4 : 0,
            }}
          >✕</button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 6 }}>
        {multiline ? (
          <textarea
            className="al-textarea"
            rows={2}
            placeholder={placeholder}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            style={{ flex: 1, fontSize: 12, resize: 'vertical' }}
          />
        ) : (
          <input
            className="al-input"
            placeholder={placeholder}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
            style={{ flex: 1, fontSize: 12 }}
          />
        )}
        <button
          type="button"
          onClick={addItem}
          style={{
            flexShrink: 0, padding: '0 14px', borderRadius: 6,
            border: '1px solid var(--primary, #0f4c5c)', background: 'rgba(15,76,92,.1)',
            color: 'var(--primary, #0f4c5c)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            alignSelf: 'flex-start', height: 36,
          }}
        >+ Ajouter</button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>
        {items.length} élément{items.length !== 1 ? 's' : ''}
        {!multiline && ' · Appuyez sur Entrée pour ajouter rapidement'}
      </p>
    </div>
  );
};

// ── Composant galerie d'images ──
const GalleryEditor = ({ images = [], onChange, notify }) => {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const getToken = () => localStorage.getItem('adminToken') || '';

  const addImage = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setNewUrl('');
  };

  const removeImage = (index) => onChange(images.filter((_, i) => i !== index));

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      notify?.('Veuillez sélectionner une image (jpg/png/webp/gif).', 'error');
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Lecture fichier impossible'));
        reader.readAsDataURL(file);
      });

      const res = await fetch(MEDIA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ dataUrl, folder: 'circuits' }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Upload échoué');
      }

      if (json.url) {
        onChange([...images, json.url]);
        notify?.('Image uploadée ✅', 'success');
      }
    } catch (e) {
      notify?.(e.message || 'Erreur upload', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label className="al-label">Galerie d'images</label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {images.map((url, i) => (
          <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--g200)' }}>
            <img
              src={url}
              alt={`Galerie ${i + 1}`}
              style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.background = '#f1f5f9'; e.target.alt = 'Image invalide'; }}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              style={{
                position: 'absolute', top: 4, right: 4,
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(233,47,100,.9)', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
            <div style={{ padding: '3px 6px', background: 'rgba(0,0,0,.5)' }}>
              <p style={{ fontSize: 9, color: '#fff', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {url.split('/').pop().split('?')[0]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input
          className="al-input"
          placeholder="URL de la nouvelle image..."
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
          style={{ flex: 1, fontSize: 12 }}
        />
        <button
          type="button"
          onClick={addImage}
          style={{
            flexShrink: 0, padding: '0 14px', borderRadius: 6,
            border: '1px solid var(--primary, #0f4c5c)', background: 'rgba(15,76,92,.1)',
            color: 'var(--primary, #0f4c5c)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
            height: 36,
          }}
        >+ Ajouter</button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => uploadFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          style={{
            flexShrink: 0,
            padding: '0 14px',
            borderRadius: 6,
            border: '1px solid #fde68a',
            background: uploading ? '#fef3c7' : '#fffbeb',
            color: '#92400e',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 800,
            height: 36,
          }}
          title="Uploader une image depuis votre ordinateur"
        >
          {uploading ? '⏳ Upload…' : '⬆ Upload'}
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--g400)', margin: 0 }}>
        {images.length} image{images.length !== 1 ? 's' : ''} dans la galerie
      </p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL CRÉATION / ÉDITION CIRCUIT — VERSION COMPLÈTE
   ══════════════════════════════════════════════════════════════ */
const PkgModal = ({ pkg, onClose, onSaved, notify }) => {
  const isEdit = !!pkg;

  const initForm = () => {
    if (!pkg) return { ...EMPTY };
    return {
      title:       pkg.title       || '',
      subtitle:    pkg.subtitle    || '',
      description: pkg.description || '',
      image_url:   pkg.image_url   || '',
      price:       pkg.price       || '',
      old_price:   pkg.old_price   || '',
      duration:    pkg.duration    || '',
      nights:      pkg.nights      || '',
      region:      pkg.region      || 'nord',
      departure:   pkg.departure   || '',
      spots:       pkg.spots       || '20',
      rating:      pkg.rating      || '5.0',
      reviews:     pkg.reviews     || '0',
      badge:       pkg.badge       || '',
      tag:         pkg.tag         || '',
      tag_color:   pkg.tag_color   || 'teal',
      difficulty:  pkg.difficulty  || 'Facile',
      group_size:  pkg.group_size  || '',
      is_active:   pkg.is_active   !== false,
      highlights:  Array.isArray(pkg.highlights)  ? pkg.highlights  : [],
      programme:   Array.isArray(pkg.programme)   ? pkg.programme   : [],
      inclus:      Array.isArray(pkg.inclus)      ? pkg.inclus      : [],
      non_inclus:  Array.isArray(pkg.non_inclus)  ? pkg.non_inclus  : [],
      gallery:     Array.isArray(pkg.gallery)      ? pkg.gallery      : [],
    };
  };

  const [form, setForm] = useState(initForm);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const TABS = [
    { key: 'general',  label: 'Général',     icon: '📋' },
    { key: 'detail',   label: 'Détails',     icon: '📝' },
    { key: 'media',    label: 'Médias',      icon: '🖼️' },
    { key: 'advanced', label: 'Avancé',      icon: '⚙️' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.duration) {
      notify('Titre, prix et durée obligatoires', 'error'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price:     Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null,
        duration:  Number(form.duration),
        nights:    form.nights ? Number(form.nights) : Number(form.duration) - 1,
        spots:     Number(form.spots) || 20,
        highlights: form.highlights,
        programme:  form.programme,
        inclus:     form.inclus,
        non_inclus: form.non_inclus,
        gallery:    form.gallery,
      };
      const res = await fetch(isEdit ? `${API}/${pkg.id}` : API, {
        method:  isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) { notify(isEdit ? 'Circuit mis à jour ✅' : 'Circuit créé ✅'); onSaved(); }
      else notify(json.message || 'Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
    finally   { setLoading(false); }
  };

  return (
    <div className="al-overlay" onClick={onClose}>
      <div
        className="al-modal"
        style={{ maxWidth: 760, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
                <path d="M8 2v16M16 6v16"/>
              </svg>
            </div>
            <div>
              <h2>{isEdit ? 'Modifier le circuit' : 'Nouveau circuit tunisien'}</h2>
              <p style={{ fontSize: 12, color: 'var(--g400)', marginTop: 2 }}>
                {isEdit ? `Édition de "${pkg.title}"` : 'Créez un circuit avec programme complet'}
              </p>
            </div>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--g200)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--g400)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <form id="circuit-form" onSubmit={handleSubmit} style={{ display: 'contents' }}>

            {/* ══ ONGLET GÉNÉRAL ══ */}
            {activeTab === 'general' && (
              <>
                <ModalField label="Titre" req>
                  <input className="al-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Dunes d'Or — Grand Erg Oriental" required/>
                </ModalField>
                <ModalField label="Sous-titre (itinéraire résumé)">
                  <input className="al-input" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Douz · Ksar Ghilane · Grand Erg · 5 jours"/>
                </ModalField>
                <ModalField label="Description">
                  <textarea className="al-textarea" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description détaillée du circuit..."/>
                </ModalField>

                <div className="al-row-2">
                  <ModalField label="Prix (DT)" req>
                    <input className="al-input" type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="980" required/>
                  </ModalField>
                  <ModalField label="Ancien prix (DT)">
                    <input className="al-input" type="number" min="0" step="0.01" value={form.old_price} onChange={e => set('old_price', e.target.value)} placeholder="1150 (optionnel)"/>
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Durée (jours)" req>
                    <input className="al-input" type="number" min="1" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="5" required/>
                  </ModalField>
                  <ModalField label="Nuits">
                    <input className="al-input" type="number" min="0" value={form.nights} onChange={e => set('nights', e.target.value)} placeholder="4 (auto si vide)"/>
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Région">
                    <select className="al-select" value={form.region} onChange={e => set('region', e.target.value)}>
                      <option value="nord">🏛️ Circuit Nord</option>
                      <option value="sud">🏜️ Circuit Sud</option>
                    </select>
                  </ModalField>
                  <ModalField label="Ville de départ">
                    <input className="al-input" value={form.departure} onChange={e => set('departure', e.target.value)} placeholder="Tunis"/>
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Places disponibles">
                    <input className="al-input" type="number" min="0" value={form.spots} onChange={e => set('spots', e.target.value)} placeholder="20"/>
                  </ModalField>
                  <ModalField label="Difficulté">
                    <select className="al-select" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                      <option value="Facile">🟢 Facile</option>
                      <option value="Modéré">🟡 Modéré</option>
                      <option value="Aventure">🔴 Aventure</option>
                    </select>
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Tag / Catégorie">
                    <input className="al-input" value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="Patrimoine, Désert, Nature..."/>
                  </ModalField>
                  <ModalField label="Couleur tag">
                    <select className="al-select" value={form.tag_color} onChange={e => set('tag_color', e.target.value)}>
                      <option value="teal">Teal</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="orange">Orange</option>
                      <option value="accent">Rose</option>
                      <option value="violet">Violet</option>
                    </select>
                  </ModalField>
                </div>

                <div className="al-row-2">
                  <ModalField label="Taille groupe">
                    <input className="al-input" value={form.group_size} onChange={e => set('group_size', e.target.value)} placeholder="4 – 14 personnes"/>
                  </ModalField>
                  <ModalField label="Badge">
                    <select className="al-select" value={form.badge} onChange={e => set('badge', e.target.value)}>
                      <option value="">Aucun</option>
                      <option value="Populaire">⭐ Populaire</option>
                      <option value="Nouveau">✨ Nouveau</option>
                      <option value="Promo">🔥 Promo</option>
                      <option value="VIP">👑 VIP</option>
                    </select>
                  </ModalField>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="is_active_edit" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}/>
                  <label htmlFor="is_active_edit" className="al-label" style={{ cursor: 'pointer', marginBottom: 0 }}>Circuit actif (visible sur le site public)</label>
                </div>
              </>
            )}

            {/* ══ ONGLET DÉTAILS ══ */}
            {activeTab === 'detail' && (
              <>
                {/* Highlights */}
                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="⭐ Points forts du circuit"
                    items={form.highlights}
                    onChange={v => set('highlights', v)}
                    placeholder="Ex: Dunes du Grand Erg Oriental..."
                  />
                </div>

                {/* Programme */}
                <div style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <EditableList
                    label="🗓️ Programme jour par jour"
                    items={form.programme}
                    onChange={v => set('programme', v)}
                    placeholder="Description du jour (J1, J2, J3...)"
                    multiline
                  />
                  <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 6 }}>
                    Chaque entrée = un jour du circuit. L'ordre des entrées correspond à J1, J2, J3...
                  </p>
                </div>

                {/* Inclus */}
                <div style={{ padding: '12px', borderRadius: 10, border: '1.5px solid rgba(16,185,129,.2)', background: 'rgba(16,185,129,.04)' }}>
                  <EditableList
                    label="✅ Ce qui est inclus"
                    items={form.inclus}
                    onChange={v => set('inclus', v)}
                    placeholder="Ex: Transport climatisé..."
                  />
                </div>

                {/* Non inclus */}
                <div style={{ padding: '12px', borderRadius: 10, border: '1.5px solid rgba(233,47,100,.2)', background: 'rgba(233,47,100,.04)' }}>
                  <EditableList
                    label="❌ Non inclus"
                    items={form.non_inclus}
                    onChange={v => set('non_inclus', v)}
                    placeholder="Ex: Vols internationaux..."
                  />
                </div>
              </>
            )}

            {/* ══ ONGLET MÉDIAS ══ */}
            {activeTab === 'media' && (
              <>
                <ModalField label="Image principale (carte circuit)">
                  <input className="al-input" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..."/>
                </ModalField>

                {form.image_url && (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--g200)' }}>
                    <img
                      src={form.image_url}
                      alt="Aperçu"
                      style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--g400)', padding: '6px 10px', margin: 0 }}>Aperçu image principale</p>
                  </div>
                )}

                {/* Suggestions images Tunisie */}
                <div>
                  <p style={{ fontSize: 11, color: 'var(--g400)', marginBottom: 8, fontWeight: 600 }}>Suggestions Tunisie :</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                    {[
                      { label: 'Médina Tunis',    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200' },
                      { label: 'Dunes Sahara',    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200' },
                      { label: 'Sidi Bou Saïd',   url: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=1200' },
                      { label: 'Ksour berbères',  url: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=1200' },
                      { label: 'Oasis Tozeur',    url: 'https://images.unsplash.com/photo-1597149197088-fd60ba02a7d0?w=1200' },
                      { label: 'Tabarka',          url: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1200' },
                    ].map(s => (
                      <div
                        key={s.label}
                        onClick={() => set('image_url', s.url)}
                        style={{
                          borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                          border: form.image_url === s.url ? '2.5px solid var(--primary)' : '1.5px solid var(--g200)',
                          transition: 'all .15s',
                        }}
                      >
                        <img
                          src={s.url}
                          alt={s.label}
                          style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }}
                          onError={e => { e.target.style.background = '#f1f5f9'; }}
                        />
                        <p style={{ fontSize: 10, padding: '4px 6px', margin: 0, color: form.image_url === s.url ? 'var(--primary)' : 'var(--g600)', fontWeight: 600, background: form.image_url === s.url ? 'rgba(15,76,92,.08)' : 'transparent' }}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--g200)', paddingTop: 16 }}>
                  <GalleryEditor
                    images={form.gallery}
                    onChange={v => set('gallery', v)}
                    notify={notify}
                  />
                  <p style={{ fontSize: 11, color: 'var(--g400)', marginTop: 8 }}>
                    Ces images apparaissent dans la galerie de la page détail du circuit.
                  </p>
                </div>
              </>
            )}

            {/* ══ ONGLET AVANCÉ ══ */}
            {activeTab === 'advanced' && (
              <>
                <div className="al-row-2">
                  <ModalField label="Note (sur 5)">
                    <input className="al-input" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.9"/>
                  </ModalField>
                  <ModalField label="Nombre d'avis">
                    <input className="al-input" type="number" min="0" value={form.reviews} onChange={e => set('reviews', e.target.value)} placeholder="87"/>
                  </ModalField>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--g200)', background: 'var(--g50)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', marginBottom: 8 }}>
                    🌱 Importer un circuit par défaut
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--g500)', marginBottom: 10 }}>
                    Choisissez un circuit tunisien prédéfini pour préremplir tous les champs :
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[...TUNISIAN_CIRCUITS.nord, ...TUNISIAN_CIRCUITS.sud].map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const imported = {
                            ...c,
                            price:    String(c.price),
                            old_price: c.old_price ? String(c.old_price) : '',
                            duration: String(c.duration),
                            nights:   String(c.nights),
                            spots:    String(c.spots),
                            rating:   String(c.rating),
                            reviews:  String(c.reviews),
                            badge:    c.badge || '',
                            gallery:  c.gallery || [],
                          };
                          setForm(imported);
                          setActiveTab('general');
                        }}
                        style={{
                          padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          border: '1.5px solid var(--g200)', background: 'var(--g50)',
                          color: 'var(--g700)', cursor: 'pointer', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--g200)'; e.currentTarget.style.color = 'var(--g700)'; }}
                      >
                        {c.region === 'nord' ? '🏛️' : '🏜️'} {c.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(233,47,100,.2)', background: 'rgba(233,47,100,.03)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#e92f64', marginBottom: 6 }}>⚠️ Zone dangereuse</p>
                  <p style={{ fontSize: 11, color: 'var(--g500)' }}>
                    La suppression d'un circuit est irréversible. Elle supprime également toutes les réservations associées.
                    Utilisez plutôt la désactivation (case "Circuit actif").
                  </p>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div
          className="al-form-footer"
          style={{ flexShrink: 0, borderTop: '1px solid var(--g200)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {TABS.map((tab, i) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  width: 8, height: 8, borderRadius: '50%', border: 'none',
                  background: activeTab === tab.key ? 'var(--primary)' : 'var(--g300)',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
            <button
              type="submit"
              form="circuit-form"
              className="al-btn al-btn--primary"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : (isEdit ? '✏️ Mettre à jour' : '➕ Créer le circuit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL COVERS — inchangée (reprise du fichier original)
   ══════════════════════════════════════════════════════════════ */
const CoversModal = ({ covers, onClose, onSaved, notify }) => {
  const [activeTab, setActiveTab] = useState('hero');
  const [form, setForm] = useState({
    hero: { ...DEFAULT_COVERS.hero, ...(covers?.hero || {}) },
    nord: { ...DEFAULT_COVERS.nord, ...(covers?.nord || {}) },
    sud:  { ...DEFAULT_COVERS.sud,  ...(covers?.sud  || {}) },
  });
  const [loading, setLoading] = useState(false);

  const setHero   = (key, val) => setForm(p => ({ ...p, hero: { ...p.hero, [key]: val } }));
  const setRegion = (reg, key, val) => setForm(p => ({ ...p, [reg]: { ...p[reg], [key]: val } }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(COVERS_API, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { notify('Apparence mise à jour ✅'); onSaved(form); }
      else notify(json.message || 'Erreur', 'error');
    } catch { notify('Erreur réseau', 'error'); }
    finally { setLoading(false); }
  };

  const TABS = [
    { key: 'hero', label: 'Hero (Bandeau)', icon: '🖼️' },
    { key: 'nord', label: 'Circuit Nord',   icon: '🏛️' },
    { key: 'sud',  label: 'Circuit Sud',    icon: '🏜️' },
  ];

  return (
    <div className="al-overlay" onClick={onClose}>
      <div
        className="al-modal"
        style={{ maxWidth: 760, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="al-modal__header" style={{ flexShrink: 0 }}>
          <div className="al-modal__title-wrap">
            <div className="al-modal__icon" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <div>
              <h2>Apparence de la page Circuits</h2>
              <p style={{ fontSize:12, color:'var(--g400)', marginTop:2 }}>Modifiez le hero principal, les cartes Nord & Sud</p>
            </div>
          </div>
          <button className="al-modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--g200)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding:'12px 20px', border:'none', background:'transparent', cursor:'pointer',
                  fontSize:13, fontWeight:700,
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--g400)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                  transition:'all .15s', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
                }}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {activeTab === 'hero' && (
            <>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>Aperçu du bandeau hero</p>
                <div style={{ borderRadius:16, overflow:'hidden', position:'relative', height:200, background:'linear-gradient(135deg,#0f4c5c 0%,#1a7a8a 50%,#0f4c5c 100%)', border:'2px solid var(--g200)', boxShadow:'0 4px 20px rgba(0,0,0,.1)' }}>
                  {form.hero.bg_image && (
                    <img src={form.hero.bg_image} alt="hero bg" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45 }} onError={e => { e.target.style.display='none'; }}/>
                  )}
                  <div style={{ position:'absolute', inset:0, background:'rgba(10,40,55,.55)'}}/>
                  <div style={{ position:'relative', padding:'28px 32px', display:'flex', flexDirection:'column', justifyContent:'center', height:'100%', color:'#fff' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.25)', borderRadius:999, padding:'4px 14px', fontSize:11, fontWeight:700, width:'fit-content', marginBottom:12 }}>
                      🗺️ {form.hero.tag || 'Circuits touristiques - Tunisie'}
                    </span>
                    <h1 style={{ fontSize:24, fontWeight:900, lineHeight:1.2, margin:0 }}>
                      {form.hero.title || 'Explorez la Tunisie'}<br/>
                      <span style={{ color:'#1ecad3' }}>{form.hero.title_accent || 'du Nord au Sud'}</span>
                    </h1>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,.8)', marginTop:8, lineHeight:1.5, maxWidth:480 }}>
                      {form.hero.sub || 'Des circuits soigneusement conçus...'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="al-field">
                <label className="al-label">URL de l'image de fond</label>
                <input className="al-input" placeholder="https://images.unsplash.com/..." value={form.hero.bg_image} onChange={e => setHero('bg_image', e.target.value)}/>
              </div>
              <div className="al-field">
                <label className="al-label">Tag / Étiquette</label>
                <input className="al-input" placeholder="Circuits touristiques - Tunisie" value={form.hero.tag} onChange={e => setHero('tag', e.target.value)}/>
              </div>
              <div className="al-row-2">
                <div className="al-field">
                  <label className="al-label">Titre principal</label>
                  <input className="al-input" placeholder="Explorez la Tunisie" value={form.hero.title} onChange={e => setHero('title', e.target.value)}/>
                </div>
                <div className="al-field">
                  <label className="al-label">Titre accentué (couleur)</label>
                  <input className="al-input" placeholder="du Nord au Sud" value={form.hero.title_accent} onChange={e => setHero('title_accent', e.target.value)}/>
                </div>
              </div>
              <div className="al-field">
                <label className="al-label">Sous-titre</label>
                <textarea className="al-textarea" rows={3} value={form.hero.sub} onChange={e => setHero('sub', e.target.value)}/>
              </div>
            </>
          )}

          {(activeTab === 'nord' || activeTab === 'sud') && (() => {
            const reg = activeTab;
            const r = form[reg];
            const isNord = reg === 'nord';
            return (
              <>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>Aperçu carte</p>
                  <div style={{ borderRadius:16, overflow:'hidden', position:'relative', height:160, background: isNord ? 'linear-gradient(135deg,#0f4c5c,#1a7a8a)' : 'linear-gradient(135deg,#92400e,#c2410c)', border:'2px solid var(--g200)' }}>
                    {r.image_url && <img src={r.image_url} alt="cover" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.6 }} onError={e => { e.target.style.display='none'; }}/>}
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.35)'}}/>
                    <div style={{ position:'relative', padding:'20px 24px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', color:'#fff' }}>
                      <div style={{ fontSize:28, marginBottom:6 }}>{r.icon || (isNord ? '🏛' : '🏜')}</div>
                      <h3 style={{ fontSize:18, fontWeight:800, margin:0 }}>{r.card_title || '—'}</h3>
                      <p style={{ fontSize:12, margin:'4px 0 0', opacity:.85 }}>{r.card_description || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="al-field">
                  <label className="al-label">URL image couverture</label>
                  <input className="al-input" placeholder="https://..." value={r.image_url} onChange={e => setRegion(reg, 'image_url', e.target.value)}/>
                </div>
                <div className="al-row-2">
                  <div className="al-field">
                    <label className="al-label">Titre carte</label>
                    <input className="al-input" placeholder="Circuit Nord" value={r.card_title} onChange={e => setRegion(reg, 'card_title', e.target.value)}/>
                  </div>
                  <div className="al-field">
                    <label className="al-label">Icône (emoji)</label>
                    <input className="al-input" placeholder="🏛 ou 🏜" value={r.icon} onChange={e => setRegion(reg, 'icon', e.target.value)} style={{ fontSize:18 }}/>
                  </div>
                </div>
                <div className="al-field">
                  <label className="al-label">Description courte</label>
                  <textarea className="al-textarea" rows={2} value={r.card_description} onChange={e => setRegion(reg, 'card_description', e.target.value)}/>
                </div>
                <div className="al-field">
                  <label className="al-label">Titre section liste</label>
                  <input className="al-input" value={r.hero_title} onChange={e => setRegion(reg, 'hero_title', e.target.value)}/>
                </div>
                <div className="al-field">
                  <label className="al-label">Sous-titre section liste</label>
                  <textarea className="al-textarea" rows={2} value={r.hero_sub} onChange={e => setRegion(reg, 'hero_sub', e.target.value)}/>
                </div>
              </>
            );
          })()}
        </div>

        <div className="al-form-footer" style={{ flexShrink:0, borderTop:'1px solid var(--g200)', padding:'16px 24px' }}>
          <button type="button" className="al-btn al-btn--ghost" onClick={onClose}>Annuler</button>
          <button type="button" className="al-btn al-btn--primary" disabled={loading} onClick={handleSave} style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)', borderColor:'transparent' }}>
            {loading ? 'Enregistrement...' : '💾 Enregistrer l\'apparence'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PANNEAU DÉTAIL LATÉRAL
   ══════════════════════════════════════════════════════════════ */
const CircuitDetail = ({ circuit, onClose, onEdit, onDelete, isMain }) => {
  const avail  = circuit.available_spots !== undefined ? Number(circuit.available_spots) : Number(circuit.spots);
  const isFull = avail <= 0;
  const isLow  = avail <= 5 && avail > 0;
  const difficultyColor = { Facile:'#065f46', Modéré:'#92400e', Aventure:'#991b1b' };
  const difficultyBg    = { Facile:'#d1fae5', Modéré:'#fef3c7', Aventure:'#fee2e2' };
  const difficultyIcon  = { Facile:'🟢', Modéré:'🟡', Aventure:'🔴' };

  const InfoRow = ({ icon, label, value }) => value ? (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'var(--g50)', border:'1px solid var(--g100)' }}>
      <span style={{ fontSize:12, color:'var(--g500)' }}>{icon} {label}</span>
      <span style={{ fontSize:13, fontWeight:700, color:'var(--g800)' }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ width:330, flexShrink:0, borderLeft:'1px solid var(--g200)', display:'flex', flexDirection:'column', background:'#fff', animation:'alModalIn .25s var(--ease)', overflowY:'auto' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:2 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em' }}>Détails circuit</p>
        <button className="al-modal__close" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>

      <div style={{ width:'100%', height:170, background:'var(--g100)', flexShrink:0, position:'relative', overflow:'hidden' }}>
        {circuit.image_url
          ? <img src={circuit.image_url} alt={circuit.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e=>e.target.style.display='none'}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,var(--primary),var(--secondary))' }}>
              <span style={{ fontSize:40 }}>{circuit.region==='nord'?'🏛️':'🏜️'}</span>
            </div>
        }
        <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:6, flexWrap:'wrap' }}>
          <span style={{ padding:'3px 9px', borderRadius:999, background:circuit.is_active?'#10b981':'#94a3b8', color:'#fff', fontSize:11, fontWeight:700 }}>
            {circuit.is_active ? '● Actif' : '● Inactif'}
          </span>
          {circuit.badge && <span style={{ padding:'3px 9px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:11, fontWeight:700 }}>{circuit.badge}</span>}
        </div>
      </div>

      <div style={{ padding:'18px 18px 12px', display:'flex', flexDirection:'column', gap:14, flex:1 }}>
        <div>
          <h3 style={{ fontSize:16, fontWeight:800, color:'var(--g900)', lineHeight:1.3 }}>{circuit.title}</h3>
          {circuit.subtitle && <p style={{ fontSize:12, color:'var(--g500)', marginTop:4 }}>{circuit.subtitle}</p>}
        </div>

        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Tarif</p>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontSize:22, fontWeight:800, color:'var(--primary)' }}>{fPrice(circuit.price)}</span>
            {circuit.old_price && <span style={{ fontSize:13, color:'var(--g400)', textDecoration:'line-through' }}>{fPrice(circuit.old_price)}</span>}
          </div>
        </div>

        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Informations</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <InfoRow icon="🗓" label="Durée" value={circuit.duration ? `${circuit.duration} j / ${circuit.nights ?? circuit.duration-1} n` : null}/>
            <InfoRow icon="✈️" label="Départ" value={circuit.departure || null}/>
            <InfoRow icon="👥" label="Groupe" value={circuit.group_size || null}/>
            {circuit.difficulty && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:difficultyBg[circuit.difficulty]||'var(--g50)', border:'1px solid var(--g100)' }}>
                <span style={{ fontSize:12, color:'var(--g500)' }}>🎯 Difficulté</span>
                <span style={{ fontSize:13, fontWeight:700, color:difficultyColor[circuit.difficulty]||'var(--g800)' }}>
                  {difficultyIcon[circuit.difficulty]} {circuit.difficulty}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Aperçu highlights */}
        {circuit.highlights && circuit.highlights.length > 0 && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Points forts</p>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {circuit.highlights.slice(0,4).map((h, i) => (
                <div key={i} style={{ fontSize:12, color:'var(--g700)', display:'flex', gap:6, alignItems:'flex-start' }}>
                  <span style={{ color:'#10b981', flexShrink:0, marginTop:1 }}>✓</span>
                  <span>{h}</span>
                </div>
              ))}
              {circuit.highlights.length > 4 && (
                <p style={{ fontSize:11, color:'var(--g400)', margin:0 }}>+{circuit.highlights.length-4} autres points forts</p>
              )}
            </div>
          </div>
        )}

        {/* Aperçu programme */}
        {circuit.programme && circuit.programme.length > 0 && (
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Programme ({circuit.programme.length} jours)</p>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {circuit.programme.slice(0,2).map((p, i) => (
                <div key={i} style={{ fontSize:12, color:'var(--g700)', display:'flex', gap:6, alignItems:'flex-start' }}>
                  <span style={{ background:'var(--primary)', color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0, marginTop:1 }}>J{i+1}</span>
                  <span style={{ lineHeight:1.4 }}>{p.substring(0,80)}{p.length > 80 ? '...' : ''}</span>
                </div>
              ))}
              {circuit.programme.length > 2 && (
                <p style={{ fontSize:11, color:'var(--g400)', margin:0 }}>+{circuit.programme.length-2} autres jours</p>
              )}
            </div>
          </div>
        )}

        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--g400)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8, paddingBottom:6, borderBottom:'1px solid var(--g100)' }}>Disponibilité</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:isFull?'#fee2e2':isLow?'#fff7ed':'#d1fae5', border:`1px solid ${isFull?'#fca5a5':isLow?'#fed7aa':'#a7f3d0'}` }}>
              <span style={{ fontSize:12, color:isFull?'#991b1b':isLow?'#92400e':'#065f46' }}>🪑 Places disponibles</span>
              <span style={{ fontSize:13, fontWeight:800, color:isFull?'#e92f64':isLow?'#f97316':'#065f46' }}>
                {isFull ? 'Complet' : `${avail} / ${circuit.spots}`}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, background:'rgba(15,76,92,.05)', border:'1px solid rgba(15,76,92,.1)' }}>
              <span style={{ fontSize:12, color:'var(--g500)' }}>📋 Réservations</span>
              <span style={{ fontSize:13, fontWeight:800, color:'var(--primary)' }}>{circuit.reservation_count||0} inscrit{circuit.reservation_count>1?'s':''}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 18px', borderTop:'1px solid var(--g100)', display:'flex', gap:8, position:'sticky', bottom:0, background:'#fff' }}>
        <button className="al-btn al-btn--primary" style={{ flex:1 }} onClick={() => { onEdit(circuit); onClose(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Modifier complet
        </button>
        <button
          className="al-btn al-btn--danger"
          onClick={() => { onDelete(circuit.id); onClose(); }}
          title={isMain ? 'Supprimer' : 'Réservé à l\'administrateur principal'}
          style={{ opacity:isMain?1:0.4, cursor:isMain?'pointer':'not-allowed' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14, height:14 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
const CircuitPackages = () => {
  const [circuits,   setCircuits]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [showCovers, setShowCovers] = useState(false);
  const [editPkg,    setEditPkg]    = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [covers,     setCovers]     = useState(null);
  const [seeding,    setSeeding]    = useState(false);

  const isMain = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'main'; }
    catch { return false; }
  })();

  const notify = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchCircuits = async () => {
    try { setLoading(true); const r = await fetch(API); const j = await r.json(); setCircuits(j.data || []); }
    catch { notify('Impossible de charger les circuits', 'error'); }
    finally { setLoading(false); }
  };

  const fetchCovers = async () => {
    try { const r = await fetch(COVERS_API); const j = await r.json(); if (j.success) setCovers(j.data); }
    catch { /* ignore */ }
  };

  useEffect(() => { fetchCircuits(); fetchCovers(); }, []);

  const handleDelete = async (id) => {
    if (!isMain) { notify('❌ Seul l\'administrateur principal peut supprimer un circuit', 'error'); return; }
    if (!window.confirm('Supprimer ce circuit ?')) return;
    const r = await fetch(`${API}/${id}`, { method:'DELETE' });
    const j = await r.json();
    if (j.success) { notify('Circuit supprimé'); fetchCircuits(); setSelected(null); }
    else notify('Erreur suppression', 'error');
  };

  // ── Seed les circuits tunisiens par défaut ──
  const handleSeedCircuits = async () => {
    if (!window.confirm('Importer les circuits tunisiens par défaut ? Cette action créera de nouveaux circuits.')) return;
    setSeeding(true);
    try {
      const all = [...TUNISIAN_CIRCUITS.nord, ...TUNISIAN_CIRCUITS.sud];
      let created = 0;
      for (const circuit of all) {
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(circuit),
        });
        const j = await r.json();
        if (j.success) created++;
      }
      notify(`${created} circuits tunisiens importés ✅`);
      fetchCircuits();
    } catch { notify('Erreur lors de l\'import', 'error'); }
    finally { setSeeding(false); }
  };

  const stats = {
    total:    circuits.length,
    nord:     circuits.filter(c => c.region==='nord').length,
    sud:      circuits.filter(c => c.region==='sud').length,
    totalRes: circuits.reduce((a,c) => a+(parseInt(c.reservation_count)||0), 0),
  };

  return (
    <AdminLayout
      title="Circuits Tunisie"
      breadcrumb={[{ label:'Circuits' }, { label:'Catalogue', active:true }]}
      actions={
        <div style={{ display:'flex', gap:8 }}>
          {circuits.length === 0 && (
            <button
              className="al-btn al-btn--ghost"
              onClick={handleSeedCircuits}
              disabled={seeding}
              title="Importer les circuits tunisiens prédéfinis"
              style={{ display:'flex', alignItems:'center', gap:6, borderColor:'#10b981', color:'#10b981' }}
            >
              {seeding ? '⏳' : '🌱'} Importer circuits tunisiens
            </button>
          )}
          <button
            className="al-btn al-btn--ghost"
            onClick={() => setShowCovers(true)}
            style={{ display:'flex', alignItems:'center', gap:6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:15, height:15 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            Apparence page
          </button>
          <button className="al-btn al-btn--primary" onClick={() => { setEditPkg(null); setShowModal(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Nouveau circuit
          </button>
        </div>
      }
      toast={toast}
    >
      <div className="al-stats al-stats--4">
        {[
          { label:'Total circuits',     value:stats.total,    color:'blue',   icon:<><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></> },
          { label:'🏛️ Nord',            value:stats.nord,     color:'teal',   icon:<><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></> },
          { label:'🏜️ Sud',             value:stats.sud,      color:'orange', icon:<><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></> },
          { label:'Total réservations', value:stats.totalRes, color:'green',  icon:<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></> },
        ].map(s => (
          <div key={s.label} className={`al-stat al-stat--${s.color}`}>
            <div className="al-stat__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
            <div><p className="al-stat__value">{s.value}</p><p className="al-stat__label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {covers && (
        <div style={{ margin:'0 32px 16px', display:'flex', gap:12 }}>
          {['hero','nord','sud'].map(reg => (
            <div
              key={reg}
              onClick={() => setShowCovers(true)}
              style={{
                flex: reg === 'hero' ? 1.4 : 1,
                borderRadius:12, overflow:'hidden', position:'relative', height:70,
                cursor:'pointer', border:'1.5px solid var(--g200)',
                background: reg === 'hero' ? 'linear-gradient(135deg,#0f4c5c,#1a7a8a)'
                  : reg === 'nord' ? 'linear-gradient(135deg,#0f4c5c,#1a7a8a)'
                  : 'linear-gradient(135deg,#92400e,#c2410c)',
                transition:'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              {(covers[reg]?.bg_image || covers[reg]?.image_url) && (
                <img src={covers[reg]?.bg_image || covers[reg]?.image_url} alt={reg} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45 }} onError={e => { e.target.style.display='none'; }}/>
              )}
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.35)'}}/>
              <div style={{ position:'relative', padding:'10px 14px', display:'flex', alignItems:'center', gap:8, height:'100%' }}>
                <span style={{ fontSize:18 }}>{reg==='hero'?'🖼️':reg==='nord'?'🏛️':'🏜️'}</span>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#fff', margin:0 }}>
                    {reg==='hero' ? `${covers.hero?.title||'Hero'} ` : covers[reg]?.card_title || (reg==='nord'?'Nord':'Sud')}
                    {reg==='hero' && <span style={{ color:'#1ecad3' }}>{covers.hero?.title_accent||''}</span>}
                  </p>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,.7)', margin:0 }}>Cliquer pour modifier</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', margin:'0 32px 32px', background:'#fff', borderRadius:16, border:'1px solid var(--g200)', boxShadow:'0 4px 12px rgba(15,76,92,.08)', overflow:'hidden' }}>
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
          <div className="al-toolbar">
            <p style={{ fontSize:15, fontWeight:700, color:'var(--g800)', flex:1 }}>Liste des circuits</p>
            <button className="al-btn al-btn--ghost" onClick={fetchCircuits}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="al-loading"><div className="al-spinner-wrap"><div className="al-spinner"/></div><p style={{ fontSize:13, color:'var(--g400)' }}>Chargement...</p></div>
          ) : circuits.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>
              </div>
              <p className="al-empty__title">Aucun circuit</p>
              <p className="al-empty__sub">Créez votre premier circuit ou importez les circuits tunisiens prédéfinis.</p>
              <button
                className="al-btn al-btn--primary"
                onClick={handleSeedCircuits}
                disabled={seeding}
                style={{ marginTop:16 }}
              >
                {seeding ? '⏳ Import en cours...' : '🌱 Importer circuits tunisiens'}
              </button>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Circuit</th>
                    <th>Région</th>
                    <th>Prix</th>
                    <th>Durée</th>
                    <th>Détails</th>
                    <th>Places</th>
                    <th>Réservations</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {circuits.map(c => {
                    const avail  = c.available_spots !== undefined ? Number(c.available_spots) : Number(c.spots);
                    const isFull = avail <= 0;
                    const isLow  = avail <= 5 && avail > 0;
                    const isSel  = selected?.id === c.id;
                    const hasDetails = (c.programme?.length > 0) || (c.highlights?.length > 0);
                    return (
                      <tr key={c.id} className={`al-row ${isSel?'al-row--selected':''}`} style={{ cursor:'pointer' }} onClick={() => setSelected(isSel?null:c)}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            {c.image_url
                              ? <img src={c.image_url} alt={c.title} style={{ width:44, height:44, borderRadius:8, objectFit:'cover', flexShrink:0, border:'1.5px solid var(--g200)' }} onError={e=>e.target.style.display='none'}/>
                              : <div style={{ width:44, height:44, borderRadius:8, background:'linear-gradient(135deg,var(--primary),var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                  <span style={{ fontSize:20 }}>{c.region==='nord'?'🏛️':'🏜️'}</span>
                                </div>
                            }
                            <div>
                              <p style={{ fontWeight:700, fontSize:13, color:'var(--g800)' }}>
                                {c.title}
                                {c.badge && <span style={{ marginLeft:7, padding:'2px 7px', borderRadius:999, background:'#fff7ed', color:'#c2410c', fontSize:10, fontWeight:700 }}>{c.badge}</span>}
                              </p>
                              {c.tag && <p style={{ fontSize:11, color:'var(--g400)', marginTop:2 }}>{c.tag}</p>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:c.region==='nord'?'#e0fbfc':'#fff7ed', color:c.region==='nord'?'#0e7490':'#c2410c' }}>
                            {c.region==='nord'?'🏛️ Nord':'🏜️ Sud'}
                          </span>
                        </td>
                        <td>
                          <p style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{fPrice(c.price)}</p>
                          {c.old_price && <p style={{ fontSize:11, color:'var(--g400)', textDecoration:'line-through' }}>{fPrice(c.old_price)}</p>}
                        </td>
                        <td><span style={{ fontWeight:600, fontSize:13 }}>{c.duration} j / {c.nights||c.duration-1} n</span></td>
                        <td>
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                            {c.highlights?.length > 0 && (
                              <span style={{ padding:'2px 7px', borderRadius:999, background:'#d1fae5', color:'#065f46', fontSize:10, fontWeight:600 }}>
                                ⭐ {c.highlights.length}
                              </span>
                            )}
                            {c.programme?.length > 0 && (
                              <span style={{ padding:'2px 7px', borderRadius:999, background:'#e0f2fe', color:'#0369a1', fontSize:10, fontWeight:600 }}>
                                🗓️ {c.programme.length}j
                              </span>
                            )}
                            {c.inclus?.length > 0 && (
                              <span style={{ padding:'2px 7px', borderRadius:999, background:'#f0fdf4', color:'#166534', fontSize:10, fontWeight:600 }}>
                                ✅ {c.inclus.length}
                              </span>
                            )}
                            {!hasDetails && (
                              <span style={{ fontSize:11, color:'var(--g400)', fontStyle:'italic' }}>—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight:700, fontSize:13, color:isFull?'#e92f64':isLow?'#f97316':'#065f46' }}>
                            {isFull?'❌ Complet':`${avail} / ${c.spots}`}
                          </span>
                          {isLow && <p style={{ fontSize:10, color:'#f97316', marginTop:2 }}>🔥 Presque complet</p>}
                        </td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, background:'rgba(15,76,92,.08)', color:'var(--primary)', fontSize:12, fontWeight:700 }}>
                            {c.reservation_count||0} inscrit{c.reservation_count>1?'s':''}
                          </span>
                        </td>
                        <td>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:999, fontSize:11, fontWeight:600, background:c.is_active?'#d1fae5':'var(--g100)', color:c.is_active?'#065f46':'var(--g500)' }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:c.is_active?'#10b981':'var(--g400)' }}/>
                            {c.is_active?'Actif':'Inactif'}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button
                              className="al-action-btn al-action-btn--edit"
                              onClick={() => { setEditPkg(c); setShowModal(true); }}
                              title="Modifier (tous les champs)"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              className="al-action-btn al-action-btn--delete"
                              onClick={() => handleDelete(c.id)}
                              title={isMain?'Supprimer':'Réservé à l\'administrateur principal'}
                              style={{ opacity:isMain?1:0.4, cursor:isMain?'pointer':'not-allowed' }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="al-table-footer">
            <p className="al-count">{circuits.length} circuit{circuits.length!==1?'s':''}</p>
          </div>
        </div>

        {selected && (
          <CircuitDetail
            circuit={selected}
            onClose={() => setSelected(null)}
            onEdit={c => { setEditPkg(c); setShowModal(true); }}
            onDelete={handleDelete}
            isMain={isMain}
          />
        )}
      </div>

      {showModal && (
        <PkgModal
          pkg={editPkg}
          onClose={() => { setShowModal(false); setEditPkg(null); }}
          onSaved={() => { setShowModal(false); setEditPkg(null); fetchCircuits(); }}
          notify={notify}
        />
      )}

      {showCovers && (
        <CoversModal
          covers={covers}
          onClose={() => setShowCovers(false)}
          onSaved={(newCovers) => { setCovers(newCovers); setShowCovers(false); }}
          notify={notify}
        />
      )}
    </AdminLayout>
  );
};

export default CircuitPackages;
