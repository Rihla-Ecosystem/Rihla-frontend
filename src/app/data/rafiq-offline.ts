import { ALL_SITES, type RihlaSite } from "./rihla-data";

export type OfflineAnswer = {
  text: string;
  sources: string[];
  follow: string[];
  alert?: { level: "info" | "warn" | "danger"; text: string };
};

type TopicRule = {
  keys: string[];
  build: (query: string) => OfflineAnswer | null;
};

const norm = (q: string) =>
  q.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const hasAny = (q: string, words: string[]) => {
  const tokens = q.split(" ");
  return words.some((w) => {
    if (w.includes(" ")) return q.includes(w);
    if (w.length >= 4) return tokens.some((t) => t.includes(w));
    return tokens.includes(w);
  });
};

const EXTRA_SITES: RihlaSite[] = [
  {
    id: 1001,
    name: "Great Pyramid of Giza",
    nameAr: "الهرم الأكبر",
    cat: "Archaeological",
    dist: "0 km",
    rating: 5,
    reviews: 4100,
    img: "",
    imgs: [],
    tag: "Icon",
    scam: false,
    gov: "Giza",
    built: "c. 2560 BCE",
    dynasty: "Old Kingdom · 4th Dynasty",
    hours: "8:00 AM – 5:00 PM",
    admission: "EGP 600 (plateau) · EGP 400 (student)",
    duration: "2–3 hours",
    bestTime: "Opening at 8:00 AM — you'll have the plateau nearly to yourself",
    accessibility: "Partially accessible",
    story: "Built for Pharaoh Khufu around 2560 BCE, the Great Pyramid is the last surviving Wonder of the Ancient World. It stood as the tallest human-made structure on Earth for nearly 3,800 years. Some 2.3 million limestone blocks, each averaging 2.5 tonnes, were moved and stacked to a height of 146.6 metres. Egyptologists believe a 20-year workforce — not slaves — moved the stone using ramps, wooden sledges, and sheer organisation.",
    rafiqInsight: "The casing stones that once covered it were so precisely cut that a single sheet of paper could not fit between them. Most were stripped in medieval Cairo for buildings — some still visible in mosque minarets today. Go early: sunrise from the plateau, with the desert behind you, is unbeatable.",
    scamDetail: null,
    tips: ["Go at 8:00 AM sharp to beat tour groups", "Entering the internal chambers costs extra and is tight — go for the shaft if you're not claustrophobic", "Drone flying is illegal; cameras on tripods need a permit"],
    nearby: [],
    lat: 29.9792,
    lon: 31.1342,
  },
];

const siteAliases: Array<{ id: number; keys: string[] }> = [
  { id: 1001, keys: ["great pyramid", "pyramid of khufu", "khufu pyramid", "giza pyramid", "big pyramid"] },
  { id: 1, keys: ["sphinx", "abu al-hol", "abu al hol"] },
  { id: 2, keys: ["khufu ship", "solar boat", "boat museum", "khufu boat"] },
  { id: 3, keys: ["valley temple", "khafre temple", "khafre valley"] },
  { id: 4, keys: ["egyptian museum", "cairo museum", "museum of egyptian"] },
  { id: 5, keys: ["karnak", "karnak temple"] },
  { id: 6, keys: ["khan", "khalili", "bazaar", "souq", "souq", "khankhalili"] },
];

function siteAnswer(site: RihlaSite): OfflineAnswer {
  const bits: string[] = [];
  bits.push(`**${site.name}** — ${site.gov}, ${site.cat}.`);
  if (site.built) bits.push(`Built ${site.built} (${site.dynasty}).`);
  if (site.story) bits.push(site.story.split("\n\n")[0].trim());
  if (site.rafiqInsight) bits.push(site.rafiqInsight.trim());
  if (site.tips && site.tips.length) {
    bits.push(`Rafiq's tips: ${site.tips.slice(0, 3).join(" ")}`);
  }
  if (site.hours) bits.push(`Hours: ${site.hours}.`);
  if (site.admission) bits.push(`Admission: ${site.admission}.`);
  if (site.bestTime) bits.push(`Best time: ${site.bestTime}.`);
  if (site.duration) bits.push(`Allow ${site.duration}.`);
  const scam = site.scamDetail || (site.scam ? `${site.name} is a known scam hotspot — keep valuables secured and use official ticket windows only.` : null);
  const answer: OfflineAnswer = {
    text: bits.join("\n\n"),
    sources: ["Rihla guidebook"],
    follow: [],
  };
  if (scam) {
    answer.alert = { level: "warn", text: "Scam alert — see below" };
    answer.text += `\n\n**Scam warning:** ${scam}`;
    answer.sources.push("Safety feed");
    answer.follow.push("What scams should I watch for here?");
  }
  answer.follow.push(
    site.bestTime ? `What's the best time to visit ${site.name}?` : `Tell me more about ${site.name}`,
    `How do I get to ${site.name}?`,
    site.admission ? `How much do tickets cost at ${site.name}?` : "What should I see nearby?"
  );
  return answer;
}

const ALL_OFFLINE_SITES = [...EXTRA_SITES, ...ALL_SITES];

function findSite(query: string): RihlaSite | null {
  const q = norm(query);
  for (const { id, keys } of siteAliases) {
    if (keys.some((k) => q.includes(k))) {
      return ALL_OFFLINE_SITES.find((s) => s.id === id) ?? null;
    }
  }
  return null;
}

function siteLookup(query: string): OfflineAnswer | null {
  const site = findSite(query);
  return site ? siteAnswer(site) : null;
}

const EMERGENCY = [
  "Tourist Police — **126** (24/7, English spoken)",
  "Ambulance — **123**",
  "Police — **122**",
  "Fire & rescue — **180**",
];

const SAFETY_RULES = [
  "Use official ticket windows and vendors only — never 'helpers' who offer to 'skip the line'.",
  "Keep your phone, wallet, and passport in a front zipped pocket or anti-theft bag.",
  "Drink bottled water only; avoid ice from street carts in summer.",
  "Carry small notes (EGP 10–50) for taxis and tips — change is scarce at night.",
  "Agree on taxi fare *before* getting in, or use the meter / ride apps.",
];

function safetyAnswer(query: string): OfflineAnswer | null {
  const q = norm(query);
  const wantsSafety = hasAny(q, ["safe", "danger", "secure", "walking", "visit", "travel"]);
  const wantsScam = hasAny(q, ["scam", "thief", "pickpocket", "cheat", "rip off", "fraud", "baksheesh", "tip"]);
  if (!wantsSafety && !wantsScam) return null;

  const site = findSite(q);
  const answer: OfflineAnswer = {
    text: "",
    sources: ["Rihla safety feed", "Tourist Police"],
    follow: [],
  };

  if (wantsScam) {
    answer.text += `**Scam awareness (${site ? site.name : "Cairo"})**\n\n${site && site.scamDetail ? site.scamDetail : "Common patterns: 'free' scarabs or henna that turn into hard-sell demands, taxi fare disputes, and guides who gate-crash your tour. Refuse politely with 'la shukran', keep walking, and never hand over documents."}\n\nRafiq's rules:\n${SAFETY_RULES.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;
    answer.follow.push("What do I do if I'm being followed?", "Is this site safe to visit today?");
  } else {
    answer.text += `**Safety in ${site ? site.name : "Egypt"}**\n\nTourist areas are heavily policed; violent crime against visitors is rare. The real risks are petty: pickpocketing in crowds and overcharging.\n\nRafiq's rules:\n${SAFETY_RULES.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nEmergency numbers:\n${EMERGENCY.map((e) => `• ${e}`).join("\n")}`;
    answer.follow.push("What scams should I watch for here?", "Where do I find emergency help?");
  }
  return answer;
}

function timeAnswer(query: string): OfflineAnswer | null {
  const q = norm(query);
  const wantsTime = hasAny(q, ["best time", "crowd", "busy", "when to go", "beat"]);
  if (!wantsTime) return null;
  const site = findSite(q);
  const text = site && site.bestTime
    ? `**Best time for ${site.name}**\n\n${site.bestTime}. Typically it opens at ${site.hours}.\n\nGeneral rule: arrive at opening (8:00 AM) or in the last 90 minutes before close (3:30–5:00 PM). Tour groups flood the sites between 9:30 AM and 1:00 PM — avoid that window. Fridays are the busiest; consider a weekday morning.`
    : `**Beating the crowds**\n\nArrive at opening (8:00 AM) or in the last 90 minutes before closing (3:30–5:00 PM). Tour groups flood sites between 9:30 AM and 1:00 PM — avoid that window. Fridays are busiest; weekday mornings are calmest.`;
  return {
    text,
    sources: ["Rihla guidebook"],
    follow: site ? [`Tell me about ${site.name}`, "What's the best time to beat the crowds?"] : ["What do most tourists miss?", "Tell me the story of the Great Pyramid"],
  };
}

function ticketAnswer(query: string): OfflineAnswer | null {
  const q = norm(query);
  const wantsTickets = hasAny(q, ["ticket", "price", "cost", "admission", "entry", "fee", "pay"]);
  if (!wantsTickets) return null;
  const site = findSite(q);
  const text = site && site.admission
    ? `**Tickets for ${site.name}**\n\n${site.admission}. Hours: ${site.hours}.\n\nBuy from the official ticket office only — never from individuals near the entrance. Student ID gets you the student rate. Card is not accepted everywhere; carry cash.`
    : `**Tickets & pricing**\n\nMajor sites: about EGP 160–260 for adults, EGP 80–130 for students. Always buy at the official ticket window — no third-party markups. Cash is expected at most sites; card works in larger museums and online.`;
  return {
    text,
    sources: ["Rihla guidebook", "Ministry of Tourism"],
    follow: site ? [`What's the best time to visit ${site.name}?`] : ["What's the best time to beat the crowds?", "Tell me about the Egyptian Museum"],
  };
}

function foodAnswer(query: string): OfflineAnswer | null {
  const q = norm(query);
  if (!hasAny(q, ["eat", "food", "restaurant", "lunch", "dinner", "koshari", "ful", "taameya"])) return null;
  return {
    text: `**Eating well (and safely)**\n\n• Koshari (lentils, pasta, chickpeas) — a national favourite, ~EGP 60. Try Koshari Abou Tarek.\n• Taameya (falafel) and ful (fava beans) — cheap street breakfasts, ~EGP 25.\n• Stay hydrated with bottled water; skip unpeeled produce and street-cart ice.\n• At Khan el-Khalili, sit for tea or shisha but always confirm the price before ordering — it's a common overcharge point.\n\nRafiq's rule: eat where you see locals queuing; look for clean prep and high turnover.`,
    sources: ["Rihla food guide"],
    follow: ["Where can I find authentic koshari?", "What should I eat near the Sphinx?", "What scams should I watch for here?"],
  };
}

function languageAnswer(query: string): OfflineAnswer | null {
  const q = norm(query);
  if (!hasAny(q, ["arabic", "hello", "thank", "greet", "phrase", "say", "language", "speak"])) return null;
  return {
    text: `**Useful Arabic**\n\n• Hello / Peace: **As-salamu alaykum** — reply: wa alaykum as-salam\n• No thank you: **La shukran** (essential for vendors)\n• Thank you: **Shukran**\n• How much? **Bi-kam?**\n• Delicious: **Laziz**\n• Where is...? **Fein...?**\n• Yes / No: **Aiwa / La**\n\nEnglish is widely understood in tourist areas, and most hospitality workers speak enough to help. A smile and a few Arabic words open a lot of doors.`,
    sources: ["Rihla phrasebook"],
    follow: ["What scams should I watch for here?", "What do most tourists miss at Giza?"],
  };
}

function generalAnswer(query: string): OfflineAnswer | null {
  const q = norm(query);
  const wantsGen = hasAny(q, [
    "weather", "hot", "climat", "summer", "winter",
    "get around", "transport", "taxi", "metro", "uber",
    "dress", "wear", "clothes",
    "what do most tourists miss", "hidden", "overlook", "miss",
    "recommend", "must see", "suggest", "itinerary", "day",
  ]);
  if (!wantsGen) return null;

  if (hasAny(q, ["weather", "hot", "climat", "summer", "winter"])) {
    return {
      text: `**Weather**\n\nCairo & Giza are desert climate — blazing dry summers (35–42°C, May–Sep) and mild winters (14–22°C, Nov–Mar).\n\n• Summer: go out early or after 5 PM, sunscreen, hat, 2L+ water.\n• Winter: warm days, chilly evenings — carry a light jacket.\n• Best travel months: October–April.`,
      sources: ["Rihla climate layer"],
      follow: ["What's the best time to beat the crowds?", "What should I wear?"],
    };
  }
  if (hasAny(q, ["dress", "wear", "clothes"])) {
    return {
      text: `**What to wear**\n\nLight, breathable fabrics (linen/cotton). Comfortable walking shoes — sites are dusty and uneven.\n\nIn mosques and religious sites, cover shoulders and knees; carry a scarf to use as a cover-up. Shorts are fine at tourist sites but draw attention off the beaten path. Long skirts and light trousers are a safe, comfortable middle ground.`,
      sources: ["Rihla guidebook"],
      follow: ["What's the weather like?", "What do most tourists miss at Giza?"],
    };
  }
  if (hasAny(q, ["get around", "transport", "taxi", "metro", "uber"])) {
    return {
      text: `**Getting around**\n\n• **Ride apps (Uber / Careem)** — safest and fairest; no fare haggling. Use in Cairo and Giza.\n• **Metro** — Cairo metro is cheap (EGP 8–15) and covers most of the city; women have a dedicated carriage.\n• **Taxi** — agree the fare BEFORE boarding or insist on the meter; rides in tourist zones are often quoted 3–5× the fair price.\n• **Train** — Cairo ↔ Luxor/Aswan overnight sleeper for Upper Egypt.\n\nRafiq's rule: always book hotels/transport online where possible — cash-haggle only when you know the local price.`,
      sources: ["Rihla transit guide"],
      follow: ["How do I get to the Egyptian Museum?", "What scams should I watch for here?"],
    };
  }
  if (hasAny(q, ["hidden", "overlook", "miss", "what do most tourists"])) {
    const khufu = ALL_SITES.find((s) => s.id === 2);
    const valley = ALL_SITES.find((s) => s.id === 3);
    const em = ALL_SITES.find((s) => s.id === 4);
    return {
      text: `**What most tourists miss**\n\n• ${khufu?.name}: "${khufu?.rafiqInsight}" — roughly 2% of the foot traffic of the Pyramids.\n• ${valley?.name}: stand at the entrance at 7:15 AM in July — the causeway aligns precisely with sunrise.\n• ${em?.name}: skip the Tutankhamun queue and find Nefertiti's canopic jars in Room 3 — finer craftsmanship, no crowds.\n\nVisit on the 2-hour Giza circuit and add 20 minutes at each — you'll see the sites most people rush past.`,
      sources: ["Rihfa field notes"],
      follow: ["Tell me about the Khufu Ship Museum", "Tell me the story of the Great Pyramid", "What's the best time to beat the crowds?"],
    };
  }
  return {
    text: `**A suggested day (Giza)**\n\n1. 8:00 AM — Great Sphinx & Valley Temple (before the crowds).\n2. 9:30 AM — Khufu Ship Museum (quiet, brilliant).\n3. 11:30 AM — Giza Plateau pyramids (Khufu, Khafre, Menkaure).\n4. 1:00 PM — Lunch in the area; rest through the hot hours.\n5. 4:00 PM — Egyptian Museum downtown or Khan el-Khalili for sunset tea.\n\nRafiq can tailor this — tell me your pace and interests.`,
    sources: ["Rihla itineraries"],
    follow: ["What do most tourists miss at Giza?", "What scams should I watch for here?", "Tell me the story of the Great Pyramid"],
  };
}

const TOPIC_RULES: TopicRule[] = [
  { keys: ["story", "tell me", "history", "about", "what is", "who built", "why"], build: (q) => siteLookup(q) },
  { keys: ["how do i get", "get to", "directions", "how do i reach", "getting there"], build: siteLookup },
  { keys: ["best time", "crowd", "busy", "when to go", "beat"], build: timeAnswer },
  { keys: ["ticket", "price", "cost", "admission", "entry", "fee", "pay"], build: ticketAnswer },
  { keys: ["eat", "food", "restaurant", "lunch", "dinner", "koshari", "ful", "taameya"], build: foodAnswer },
  { keys: ["scam", "thief", "pickpocket", "cheat", "rip off", "fraud", "safe", "danger", "secure", "baksheesh", "tip"], build: safetyAnswer },
  { keys: ["arabic", "hello", "thank", "greet", "phrase", "language", "speak"], build: languageAnswer },
  { keys: ["weather", "hot", "dress", "wear", "transport", "taxi", "metro", "uber", "hidden", "miss", "recommend", "itinerary", "day", "get around"], build: generalAnswer },
];

export function rafiqOfflineAnswer(query: string): OfflineAnswer {
  const q = norm(query);
  if (!q) {
    return {
      text: `I can't hear you yet — try one of these:\n\n• "Is it safe to visit the Sphinx today?"\n• "Tell me the story of the Great Pyramid"\n• "What do most tourists miss at Giza?"\n• "What scams should I watch for here?"`,
      sources: [],
      follow: [],
    };
  }
  const site = findSite(q);
  if (site && hasAny(q, ["scam", "safe", "danger"])) {
    return safetyAnswer(q) ?? siteAnswer(site);
  }
  for (const rule of TOPIC_RULES) {
    if (hasAny(q, rule.keys)) {
      const ans = rule.build(q);
      if (ans) return ans;
    }
  }
  if (site) return siteAnswer(site);
  return {
    text: `I'm running on **offline knowledge** right now — the live AI link is down.\n\nI can still help with what's in the Rihla guidebook: site stories, scams, safety, food, weather, transport, and itineraries.\n\nTry asking:\n\n• "Tell me about the Great Sphinx of Giza"\n• "What scams should I watch for here?"\n• "What's the best time to beat the crowds?"\n• "What do most tourists miss at Giza?"`,
    sources: [],
    follow: [
      "Tell me about the Great Sphinx of Giza",
      "What scams should I watch for here?",
      "What's the best time to beat the crowds?",
      "What do most tourists miss at Giza?",
    ],
  };
}
