import { type RihlaSite } from '@/app/data/rihla-data';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

export function getCategoryFallbackImage(category: string, name: string): string {
  const searchStr = `${name} ${category}`.toLowerCase();
  if (searchStr.includes('sphinx')) {
    return 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop';
  }
  if (searchStr.includes('pyramid') || searchStr.includes('giza')) {
    return 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&h=400&fit=crop';
  }
  if (searchStr.includes('museum')) {
    return 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&h=400&fit=crop';
  }
  if (searchStr.includes('temple') || searchStr.includes('luxor') || searchStr.includes('karnak') || searchStr.includes('aswan')) {
    return 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=400&fit=crop';
  }
  if (searchStr.includes('market') || searchStr.includes('bazaar') || searchStr.includes('khan')) {
    return 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&h=400&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?w=600&h=400&fit=crop';
}

export function mapApiPoiToRihlaSite(poi: any, userLat?: number | null, userLon?: number | null, index: number = 0): RihlaSite {
  const pLat = typeof poi.lat === 'number' ? poi.lat : (typeof poi.latitude === 'number' ? poi.latitude : 29.9870 + (index % 5) * 0.008);
  const pLon = typeof poi.lon === 'number' ? poi.lon : (typeof poi.longitude === 'number' ? poi.longitude : 31.2118 + Math.floor(index / 5) * 0.008);
  
  const distKm = (userLat !== null && userLat !== undefined && userLon !== null && userLon !== undefined)
    ? calculateDistanceKm(userLat, userLon, pLat, pLon)
    : 0.5 + index * 0.2;

  const rawName = poi.name_en || poi.name || poi.title || 'Historical Site';
  const categories: string[] = Array.isArray(poi.categories) && poi.categories.length > 0
    ? poi.categories
    : [poi.category || 'Archaeological'];
  
  const category = categories[0] || 'Archaeological';
  const tag = (poi.tag || (category === 'Hidden gem' ? 'Hidden gem' : category)) || 'Attraction';
  const isScamAlert = Boolean(poi.scam || poi.hasScamAlert || poi.scam_alert);

  return {
    id: poi.id ? (typeof poi.id === 'number' ? poi.id : parseInt(String(poi.id).replace(/\\D/g, '')) || index + 1) : index + 1,
    name: rawName,
    nameAr: poi.name_ar || poi.nameAr || rawName,
    cat: category,
    dist: formatDistance(distKm),
    lat: pLat,
    lon: pLon,
    rating: poi.rating || 4.7,
    reviews: poi.reviewsCount || poi.reviews || 150 + index * 12,
    img: poi.imageUrl || poi.image_url || poi.img || getCategoryFallbackImage(category, rawName),
    imgs: [
      poi.imageUrl || poi.image_url || getCategoryFallbackImage(category, rawName),
    ],
    tag,
    scam: isScamAlert,
    gov: poi.governorate || poi.city || 'Egypt',
    built: poi.builtDate || poi.built || 'Ancient Period',
    dynasty: poi.dynasty || 'Historical Era',
    hours: poi.openingHours || poi.hours || '8:00 AM – 5:00 PM',
    admission: poi.admissionFee || poi.admission || 'Standard Entrance Fee',
    duration: poi.visitDuration || poi.duration || '1–2 hours',
    bestTime: poi.bestTime || 'Morning / Late Afternoon',
    accessibility: poi.accessibility || 'Standard Access',
    story: poi.details || poi.description || poi.story || `${rawName} is a significant point of interest located in Egypt.`,
    rafiqInsight: poi.rafiqInsight || `Explore ${rawName} with local historical guidance.`,
    scamDetail: isScamAlert ? (poi.scamDetail || 'Exercise caution with unauthorized street vendors.') : null,
    tips: Array.isArray(poi.tips) && poi.tips.length > 0 ? poi.tips : ['Stay hydrated', 'Follow local site regulations'],
    nearby: Array.isArray(poi.nearbyIds) ? poi.nearbyIds : [],
  };
}
