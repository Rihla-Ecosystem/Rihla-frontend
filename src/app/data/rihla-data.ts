export type RihlaSite = {
  id: number;
  name: string;
  nameAr: string;
  cat: string;
  dist: string;
  rating: number;
  reviews: number;
  img: string;
  imgs: string[];
  tag: string;
  scam: boolean;
  gov: string;
  built: string;
  dynasty: string;
  hours: string;
  admission: string;
  duration: string;
  bestTime: string;
  accessibility: string;
  story: string;
  rafiqInsight: string;
  scamDetail: string | null;
  tips: string[];
  nearby: number[];
  lat?: number;
  lon?: number;
};

export type JourneyProgress = {
  name: string;
  progress: number;
  total: number;
  done: number;
  color: string;
};

export const ALL_SITES: RihlaSite[] = [
  {
    id: 1,
    name: 'Great Sphinx of Giza',
    nameAr: 'أبو الهول',
    cat: 'Archaeological',
    dist: '0.3 km',
    rating: 4.9,
    reviews: 2740,
    img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop',
    imgs: [
      'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop',
    ],
    tag: 'Icon',
    scam: true,
    gov: 'Giza',
    built: 'c. 2500 BCE',
    dynasty: 'Old Kingdom · 4th Dynasty',
    hours: '8:00 AM – 5:00 PM',
    admission: 'EGP 160 (adult) · EGP 80 (student)',
    duration: '1–2 hours',
    bestTime: 'Late afternoon (3:30–5:00 PM)',
    accessibility: 'Partially accessible',
    story:
      "Carved from a single limestone ridge, not assembled from blocks, the Great Sphinx is the world's largest monumental sculpture. Pharaoh Khafre ordered its construction around 2500 BCE — the face almost certainly depicts him. Standing 20 metres tall and 73 metres long, it has silently watched the Nile flood and recede for 4,500 years.\n\nThe missing nose was documented by Danish explorer Frederic Louis Norden in 1737 — long before Napoleon. Erosion patterns on the body have led some geologists to argue the monument predates 10,500 BCE, though mainstream Egyptology firmly dates it to Khafre's reign.",
    rafiqInsight:
      "The Sphinx faces due east, aligning with the rising sun on both equinoxes. Visit at dawn or dusk for the best light — and to see a phenomenon no guide mentions: at 4:32 PM in July, the shadow of Khafre's pyramid falls precisely on the Sphinx's back.",
    scamDetail:
      "Vendors near the east approach path offer 'free' scarab figurines, then aggressively demand EGP 200–500. Refuse before the object reaches your hand. Say 'la shukran' firmly and keep walking.",
    tips: [
      'Photography is permitted without a tripod — tripod permits cost EGP 30 extra',
      'The Sound & Light Show runs at 6:30 PM and 7:30 PM — tickets EGP 175',
      'Combine with the Pyramid plateau in one ticket for best value',
    ],
    nearby: [2, 3, 4],
  },
  {
    id: 2,
    name: 'Khufu Ship Museum',
    nameAr: 'متحف مركب خوفو',
    cat: 'Museum',
    dist: '0.6 km',
    rating: 4.7,
    reviews: 892,
    img: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&h=400&fit=crop',
    imgs: [
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&h=600&fit=crop',
    ],
    tag: 'Hidden gem',
    scam: false,
    gov: 'Giza',
    built: 'c. 2500 BCE · museum 1982',
    dynasty: 'Old Kingdom · 4th Dynasty',
    hours: '9:00 AM – 4:00 PM',
    admission: 'EGP 100 (adult) · EGP 50 (student)',
    duration: '45 min – 1 hour',
    bestTime: 'Mid-morning (most visitors miss it)',
    accessibility: 'Fully accessible',
    story:
      "In 1954, archaeologist Kamal el-Mallakh discovered a sealed pit south of the Great Pyramid. Inside: 1,224 pieces of Lebanese cedar that, when reassembled over 14 years, formed a 43-metre solar barque — perfectly preserved after 4,600 years.\n\nThe ship was never sailed. Built for Khufu's journey to the afterlife, it required wood so rare and expensive that Lebanese cedar was used as royal currency. Its joinery — tight enough to be watertight — predates iron nails by millennia.",
    rafiqInsight:
      "This is Giza's most overlooked marvel. The museum receives roughly 2% of the foot traffic of the Pyramids — yet contains a ship older than the Iliad, the Torah, and the earliest known alphabets.",
    scamDetail: null,
    tips: [
      'Photography inside costs EGP 50 extra — worth it',
      'English audio guide available at reception',
      'Visit early — the museum is small and gets warm by midday',
    ],
    nearby: [1, 3, 4],
  },
  {
    id: 3,
    name: 'Khafre Valley Temple',
    nameAr: 'معبد وادي خفرع',
    cat: 'Temple',
    dist: '1.1 km',
    rating: 4.8,
    reviews: 1204,
    img: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&h=400&fit=crop',
    imgs: [
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=900&h=600&fit=crop',
    ],
    tag: 'Heritage',
    scam: false,
    gov: 'Giza',
    built: 'c. 2530 BCE',
    dynasty: 'Old Kingdom · 4th Dynasty',
    hours: '8:00 AM – 5:00 PM',
    admission: 'Included in Giza Plateau ticket',
    duration: '30–45 minutes',
    bestTime: 'Early morning (7:30–9:00 AM)',
    accessibility: 'Limited',
    story:
      'Built from pink Aswan granite and Egyptian alabaster, this mortuary temple once held 23 seated statues of Pharaoh Khafre — only fragments survive. Its geometry is flawless: the walls are perfectly plumb after 45 centuries, and the floor stones fit together so precisely that even a credit card cannot slide between them.\n\nA causeway of 494 metres once connected this temple to the upper pyramid temple — sealed, roofed, and decorated with painted reliefs now lost to time.',
    rafiqInsight:
      "Stand at the entrance at 7:15 AM in July and look east. The causeway aligns precisely with the sunrise — the ancient Egyptians built a solar calendar into the temple's orientation.",
    scamDetail: null,
    tips: [
      'Included in the Giza Plateau combo ticket',
      'Far fewer visitors than the Sphinx — often quiet early morning',
      'The granite blocks weigh 100–400 tons each',
    ],
    nearby: [1, 2, 4],
  },
  {
    id: 4,
    name: 'Egyptian Museum',
    nameAr: 'المتحف المصري',
    cat: 'Museum',
    dist: '3.2 km',
    rating: 4.6,
    reviews: 4210,
    img: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=400&fit=crop',
    imgs: [
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop',
    ],
    tag: 'Must-see',
    scam: false,
    gov: 'Cairo',
    built: '1902 CE',
    dynasty: '120,000+ objects · 5,000 years',
    hours: '9:00 AM – 5:00 PM (Fri closes 11:30–1:30)',
    admission: 'EGP 200 · Mummies Room: EGP 180 extra',
    duration: '3–5 hours',
    bestTime: 'Weekday morning',
    accessibility: 'Ground floor accessible',
    story:
      "Opened in 1902 on Tahrir Square, the Egyptian Museum houses the world's largest collection of Pharaonic antiquities across 136 halls. Among its 120,000 objects: Tutankhamun's golden death mask (3.24 kg of solid gold), the Royal Mummies Room, the Narmer Palette, and Akhenaten's colossal statues.\n\nThe building itself is designed in the Neoclassical style by French architect Marcel Dourgnon, who won an international competition for the commission in 1895.",
    rafiqInsight:
      "Most visitors spend 45 minutes photographing Tutankhamun's mask and leave. Spend that time instead with Nefertiti's canopic jars in Room 3 — the craftsmanship is incomparably finer, and the room is almost always empty.",
    scamDetail: null,
    tips: [
      'Book the Royal Mummies Room in advance — it sells out',
      'The cafeteria on the ground floor is surprisingly good',
      'Bag check is mandatory — large bags not admitted',
    ],
    nearby: [1, 5, 6],
  },
  {
    id: 5,
    name: 'Karnak Temple',
    nameAr: 'معبد الكرنك',
    cat: 'Temple',
    dist: '620 km',
    rating: 4.9,
    reviews: 5100,
    img: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop',
    imgs: [
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop',
    ],
    tag: 'Icon',
    scam: false,
    gov: 'Luxor',
    built: 'c. 2055 BCE – 30 BCE',
    dynasty: 'Middle Kingdom to Ptolemaic',
    hours: '6:00 AM – 5:30 PM',
    admission: 'EGP 220 (adult) · EGP 110 (student)',
    duration: '3–4 hours',
    bestTime: 'Early morning or Sound & Light Show',
    accessibility: 'Mostly accessible',
    story:
      'Karnak is not one temple — it is a city of temples, built by successive pharaohs over nearly 2,000 years. The Hypostyle Hall alone contains 134 columns up to 24 metres tall, decorated floor-to-ceiling with painted reliefs. Walking between them is to understand why the ancient Egyptians believed their gods were real.\n\nThe sacred lake at Karnak is fed by underground channels from the Nile. It was used for ritual purification and, according to ancient records, for breeding sacred geese dedicated to Amun.',
    rafiqInsight:
      'The axis of the main temple aligns with the winter solstice sunrise — verified by astronomers in 2001. At dawn on December 21st, sunlight travels the entire 500-metre length of the temple and illuminates the inner sanctuary.',
    scamDetail: null,
    tips: [
      'Combine with Luxor Temple for a full day',
      'The Avenue of Sphinxes connecting both temples is now fully restored',
      "Sound & Light Show (EGP 175) is one of Egypt's best",
    ],
    nearby: [3, 1, 2],
  },
  {
    id: 6,
    name: 'Khan el-Khalili',
    nameAr: 'خان الخليلي',
    cat: 'Market',
    dist: '4.1 km',
    rating: 4.5,
    reviews: 6800,
    img: 'https://images.unsplash.com/photo-1553997456-7b44d1bb8d21?w=600&h=400&fit=crop',
    imgs: [
      'https://images.unsplash.com/photo-1553997456-7b44d1bb8d21?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=900&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900&h=600&fit=crop',
    ],
    tag: 'Market',
    scam: true,
    gov: 'Cairo',
    built: '1382 CE',
    dynasty: 'Mamluk · Burji period',
    hours: '9:00 AM – 11:00 PM (some stalls open until midnight)',
    admission: 'Free entry',
    duration: '2–4 hours',
    bestTime: 'Late afternoon into evening',
    accessibility: 'Cobbled — challenging',
    story:
      "Established in 1382 by Emir Djaharks el-Khalili, the bazaar has traded continuously for 644 years, making it one of the oldest functioning markets on Earth. Its labyrinthine lanes were built deliberately to disorient — in medieval Cairo, a confused customer was a spending customer.\n\nCafé Riche, just outside the market, has been serving coffee since 1908. Naguib Mahfouz, Egypt's Nobel Prize-winning novelist, wrote much of his Cairo Trilogy at a corner table. The café still exists, unchanged.",
    rafiqInsight:
      "The goldsmiths' quarter (الصاغة) in the north-east section sells 18-karat gold by weight at near-market rate. It's where Cairenes buy wedding jewellery — no tourist markup. Find it by asking for 'souk el-dahab'.",
    scamDetail:
      "Two active scam patterns: (1) Men in 'traditional' dress offer free henna or a 'welcome gift' — payment demanded immediately after. (2) Perfume shop owners offer free tea, then pressure purchase of expensive oils. Accepting hospitality without obligation is part of Egyptian culture — but be clear upfront.",
    tips: [
      'Haggle — first price is always 3–5× the fair price',
      'The best spices are in the western lanes, away from the tourist entrance',
      'Avoid the papyrus shops near the entrance — most sell banana-leaf fakes',
    ],
    nearby: [4, 3, 2],
  },
];

export const JOURNEYS: JourneyProgress[] = [
  { name: 'Islamic Cairo Trail', progress: 35, total: 12, done: 4, color: '#3B7C8B' },
  { name: 'Ancient Giza Circuit', progress: 67, total: 6, done: 4, color: '#B48A47' },
  { name: 'Nile Riverside Walk', progress: 12, total: 8, done: 1, color: '#B46247' },
];

export const getSiteById = (siteId: number) => ALL_SITES.find((site) => site.id === siteId);
