export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface DistrictInfo {
  name: string;
  marathiName: string;
  division: string;
  latitude: number;
  longitude: number;
}

export const MAHARASHTRA_DISTRICTS: Record<string, DistrictInfo> = {
  "Pune": { name: "Pune", marathiName: "पुणे", division: "Pune", latitude: 18.5204, longitude: 73.8567 },
  "Mumbai City": { name: "Mumbai City", marathiName: "मुंबई शहर", division: "Konkan", latitude: 18.9388, longitude: 72.8354 },
  "Mumbai Suburban": { name: "Mumbai Suburban", marathiName: "मुंबई उपनगर", division: "Konkan", latitude: 19.0760, longitude: 72.8777 },
  "Thane": { name: "Thane", marathiName: "ठाणे", division: "Konkan", latitude: 19.2183, longitude: 72.9781 },
  "Palghar": { name: "Palghar", marathiName: "पालघर", division: "Konkan", latitude: 19.6936, longitude: 72.7655 },
  "Raigad": { name: "Raigad", marathiName: "रायगड", division: "Konkan", latitude: 18.5158, longitude: 73.1822 },
  "Ratnagiri": { name: "Ratnagiri", marathiName: "रत्नागिरी", division: "Konkan", latitude: 16.9902, longitude: 73.3120 },
  "Sindhudurg": { name: "Sindhudurg", marathiName: "सिंधुदुर्ग", division: "Konkan", latitude: 16.1264, longitude: 73.6974 },
  "Nashik": { name: "Nashik", marathiName: "नाशिक", division: "Nashik", latitude: 19.9975, longitude: 73.7898 },
  "Dhule": { name: "Dhule", marathiName: "धुळे", division: "Nashik", latitude: 20.9042, longitude: 74.7749 },
  "Nandurbar": { name: "Nandurbar", marathiName: "नंदुरबार", division: "Nashik", latitude: 21.3732, longitude: 74.2407 },
  "Jalgaon": { name: "Jalgaon", marathiName: "जळगाव", division: "Nashik", latitude: 21.0077, longitude: 75.5626 },
  "Ahmednagar": { name: "Ahmednagar", marathiName: "अहमदनगर", division: "Nashik", latitude: 19.0948, longitude: 74.7480 },
  "Chhatrapati Sambhajinagar": { name: "Chhatrapati Sambhajinagar", marathiName: "छत्रपती संभाजीनगर", division: "Chhatrapati Sambhajinagar", latitude: 19.8762, longitude: 75.3433 },
  "Jalna": { name: "Jalna", marathiName: "जालना", division: "Chhatrapati Sambhajinagar", latitude: 19.8347, longitude: 75.8816 },
  "Beed": { name: "Beed", marathiName: "बीड", division: "Chhatrapati Sambhajinagar", latitude: 18.9891, longitude: 75.7601 },
  "Parbhani": { name: "Parbhani", marathiName: "परभणी", division: "Chhatrapati Sambhajinagar", latitude: 19.2686, longitude: 76.7711 },
  "Hingoli": { name: "Hingoli", marathiName: "हिंगोली", division: "Chhatrapati Sambhajinagar", latitude: 19.7196, longitude: 77.1485 },
  "Nanded": { name: "Nanded", marathiName: "नांदेड", division: "Chhatrapati Sambhajinagar", latitude: 19.1383, longitude: 77.3210 },
  "Latur": { name: "Latur", marathiName: "लातूर", division: "Chhatrapati Sambhajinagar", latitude: 18.4088, longitude: 76.5604 },
  "Dharashiv": { name: "Dharashiv", marathiName: "धाराशिव", division: "Chhatrapati Sambhajinagar", latitude: 18.1853, longitude: 76.0419 },
  "Kolhapur": { name: "Kolhapur", marathiName: "कोल्हापूर", division: "Pune", latitude: 16.7050, longitude: 74.2433 },
  "Sangli": { name: "Sangli", marathiName: "सांगली", division: "Pune", latitude: 16.8524, longitude: 74.5815 },
  "Satara": { name: "Satara", marathiName: "सातारा", division: "Pune", latitude: 17.6805, longitude: 73.9934 },
  "Solapur": { name: "Solapur", marathiName: "सोलापूर", division: "Pune", latitude: 17.6599, longitude: 75.9064 },
  "Nagpur": { name: "Nagpur", marathiName: "नागपूर", division: "Nagpur", latitude: 21.1458, longitude: 79.0882 },
  "Wardha": { name: "Wardha", marathiName: "वर्धा", division: "Nagpur", latitude: 20.7453, longitude: 78.6022 },
  "Bhandara": { name: "Bhandara", marathiName: "भंडारा", division: "Nagpur", latitude: 21.1714, longitude: 79.6547 },
  "Gondia": { name: "Gondia", marathiName: "गोंदिया", division: "Nagpur", latitude: 21.4554, longitude: 80.1961 },
  "Chandrapur": { name: "Chandrapur", marathiName: "चंद्रपूर", division: "Nagpur", latitude: 19.9615, longitude: 79.2961 },
  "Gadchiroli": { name: "Gadchiroli", marathiName: "गडचिरोली", division: "Nagpur", latitude: 20.1809, longitude: 79.9938 },
  "Amravati": { name: "Amravati", marathiName: "अमरावती", division: "Amravati", latitude: 20.9320, longitude: 77.7523 },
  "Akola": { name: "Akola", marathiName: "अकोला", division: "Amravati", latitude: 20.7002, longitude: 77.0082 },
  "Washim": { name: "Washim", marathiName: "वाशिम", division: "Amravati", latitude: 20.1112, longitude: 77.1352 },
  "Buldhana": { name: "Buldhana", marathiName: "बुलढाणा", division: "Amravati", latitude: 20.5312, longitude: 76.1843 },
  "Yavatmal": { name: "Yavatmal", marathiName: "यवतमाळ", division: "Amravati", latitude: 20.3888, longitude: 78.1204 }
};

const ALIAS_MAP: Record<string, string> = {
  "aurangabad": "Chhatrapati Sambhajinagar",
  "osmanabad": "Dharashiv",
  "mumbai": "Mumbai City",
  "bombay": "Mumbai City",
  "pune city": "Pune"
};

/**
 * Returns district coordinates given district name with fuzzy alias matching.
 */
export function getDistrictCoordinates(districtName?: string | null): GeoLocation {
  if (!districtName) {
    return { latitude: 19.7515, longitude: 75.7139 }; // Center of Maharashtra
  }

  const trimmed = districtName.trim();
  if (MAHARASHTRA_DISTRICTS[trimmed]) {
    const d = MAHARASHTRA_DISTRICTS[trimmed];
    return { latitude: d.latitude, longitude: d.longitude };
  }

  const lower = trimmed.toLowerCase();
  if (ALIAS_MAP[lower] && MAHARASHTRA_DISTRICTS[ALIAS_MAP[lower]]) {
    const d = MAHARASHTRA_DISTRICTS[ALIAS_MAP[lower]];
    return { latitude: d.latitude, longitude: d.longitude };
  }

  const matchKey = Object.keys(MAHARASHTRA_DISTRICTS).find(
    key => key.toLowerCase() === lower || key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())
  );

  if (matchKey) {
    const d = MAHARASHTRA_DISTRICTS[matchKey];
    return { latitude: d.latitude, longitude: d.longitude };
  }

  return { latitude: 19.7515, longitude: 75.7139 };
}

/**
 * Haversine Formula to compute distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Maps distance in km to a 0-100 score.
 * If student is willing to move, distance penalties are significantly reduced.
 */
export function calculateDistanceScore(distanceKm: number, willingToMove: boolean = false): number {
  if (distanceKm <= 20) return 100;
  if (distanceKm <= 50) return 95;
  if (distanceKm <= 100) return willingToMove ? 92 : 85;
  if (distanceKm <= 180) return willingToMove ? 85 : 70;
  if (distanceKm <= 300) return willingToMove ? 78 : 55;
  if (distanceKm <= 500) return willingToMove ? 70 : 40;
  return willingToMove ? 60 : 25;
}
