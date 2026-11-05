/**
 * Accurate Haversine Great-Circle Distance Calculator & Precision Geolocation Engine
 * Calculates spherical distance between two sets of latitude/longitude coordinates.
 * Returns distance in kilometers (km), rounded to 1 decimal place.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place (e.g., 1.4 km)
  return Math.round(distance * 10) / 10;
}

/**
 * Human-readable distance annotation (e.g., "0.5 km away • 6 min walk")
 */
export function formatDistanceAnnotation(distanceKm: number): {
  badgeText: string;
  travelEstimate: string;
  category: 'WALKING' | 'SHORT_RIDE' | 'COMMUTE';
} {
  if (distanceKm <= 1.0) {
    const walkMinutes = Math.max(2, Math.round(distanceKm * 12));
    return {
      badgeText: `${distanceKm} km away`,
      travelEstimate: `~${walkMinutes} min walk`,
      category: 'WALKING',
    };
  } else if (distanceKm <= 2.5) {
    const cycleMinutes = Math.max(5, Math.round(distanceKm * 5));
    return {
      badgeText: `${distanceKm} km away`,
      travelEstimate: `~${cycleMinutes} min cycle / rickshaw`,
      category: 'SHORT_RIDE',
    };
  } else {
    const transitMinutes = Math.max(10, Math.round(distanceKm * 6));
    return {
      badgeText: `${distanceKm} km away`,
      travelEstimate: `~${transitMinutes} min transit`,
      category: 'COMMUTE',
    };
  }
}

// Comprehensive database of prominent Bangladesh neighborhood centroids for sub-kilometer precision
export const LOCAL_NEIGHBORHOOD_CENTROIDS: Array<{
  name: string;
  district: string;
  lat: number;
  lng: number;
}> = [
  // Dhaka Metro Core Areas
  { name: 'Dhanmondi (Road 27 / Satmasjid)', district: 'Dhaka', lat: 23.7533, lng: 90.3768 },
  { name: 'Dhanmondi (Road 8/A & Lake)', district: 'Dhaka', lat: 23.7461, lng: 90.3772 },
  { name: 'Dhanmondi (Science Lab / Road 2)', district: 'Dhaka', lat: 23.7395, lng: 90.3835 },
  { name: 'Mirpur 10 Circle & Stadium', district: 'Dhaka', lat: 23.8069, lng: 90.3687 },
  { name: 'Mirpur 1 / Sony Cinema', district: 'Dhaka', lat: 23.7956, lng: 90.3537 },
  { name: 'Mirpur 2 & Commerce College', district: 'Dhaka', lat: 23.8042, lng: 90.3614 },
  { name: 'Mirpur 11 & Pallabi', district: 'Dhaka', lat: 23.8189, lng: 90.3653 },
  { name: 'Mirpur 12 & Cantonment Gate', district: 'Dhaka', lat: 23.8292, lng: 90.3644 },
  { name: 'Mirpur DOHS', district: 'Dhaka', lat: 23.8341, lng: 90.3698 },
  { name: 'Gulshan 1 Circle & Avenue', district: 'Dhaka', lat: 23.7788, lng: 90.4172 },
  { name: 'Gulshan 2 Circle & Diplomatic Zone', district: 'Dhaka', lat: 23.7925, lng: 90.4147 },
  { name: 'Banani (Road 11 & Kamal Ataturk)', district: 'Dhaka', lat: 23.7937, lng: 90.4043 },
  { name: 'Banani DOHS', district: 'Dhaka', lat: 23.7997, lng: 90.3982 },
  { name: 'Uttara Sector 3 & Rajlakshmi', district: 'Dhaka', lat: 23.8687, lng: 90.3989 },
  { name: 'Uttara Sector 7 & House Building', district: 'Dhaka', lat: 23.8732, lng: 90.4012 },
  { name: 'Uttara Sector 11 & Gausul Azam', district: 'Dhaka', lat: 23.8765, lng: 90.3901 },
  { name: 'Uttara Sector 13 & 14', district: 'Dhaka', lat: 23.8821, lng: 90.3842 },
  { name: 'Mohammadpur Town Hall & Asad Gate', district: 'Dhaka', lat: 23.7588, lng: 90.3652 },
  { name: 'Mohammadpur Ring Road & Shyamoli', district: 'Dhaka', lat: 23.7698, lng: 90.3621 },
  { name: 'Lalmatia & St. Joseph School', district: 'Dhaka', lat: 23.7547, lng: 90.3705 },
  { name: 'Badda, Link Road & Rampura', district: 'Dhaka', lat: 23.7712, lng: 90.4256 },
  { name: 'Bashundhara R/A (Gate 1 & NSU)', district: 'Dhaka', lat: 23.8152, lng: 90.4278 },
  { name: 'Bashundhara R/A (Block C & D)', district: 'Dhaka', lat: 23.8214, lng: 90.4356 },
  { name: 'Baridhara Diplomatic Enclave', district: 'Dhaka', lat: 23.8012, lng: 90.4223 },
  { name: 'Mohakhali Wireless & DOHS', district: 'Dhaka', lat: 23.7776, lng: 90.4055 },
  { name: 'Farmgate, Khamarbari & Green Road', district: 'Dhaka', lat: 23.7571, lng: 90.3887 },
  { name: 'Panthapath & Square Hospital', district: 'Dhaka', lat: 23.7519, lng: 90.3871 },
  { name: 'Tejgaon Industrial & Nabisco', district: 'Dhaka', lat: 23.7681, lng: 90.3995 },
  { name: 'Khilgaon & Taltola Market', district: 'Dhaka', lat: 23.7512, lng: 90.4215 },
  { name: 'Malibagh, Mouchak & Shantinagar', district: 'Dhaka', lat: 23.7423, lng: 90.4121 },
  { name: 'Bailey Road & Officers Club', district: 'Dhaka', lat: 23.7412, lng: 90.4035 },
  { name: 'Shahbagh & Dhaka University Campus', district: 'Dhaka', lat: 23.7341, lng: 90.3956 },
  { name: 'Old Dhaka (Wari & Tikatuli)', district: 'Dhaka', lat: 23.7198, lng: 90.4198 },
  { name: 'Old Dhaka (Lalbagh & Chawkbazar)', district: 'Dhaka', lat: 23.7182, lng: 90.3881 },
  { name: 'Jatrabari & Sayedabad', district: 'Dhaka', lat: 23.7112, lng: 90.4345 },
  { name: 'Keraniganj & Babubazar', district: 'Dhaka', lat: 23.6987, lng: 90.3987 },

  // Chittagong Metro
  { name: 'GEC Circle & Nasirabad', district: 'Chittagong', lat: 22.3598, lng: 91.8214 },
  { name: 'Agrabad Commercial Area', district: 'Chittagong', lat: 22.3278, lng: 91.8123 },
  { name: 'Chawkbazar & Medical College', district: 'Chittagong', lat: 22.3565, lng: 91.8345 },
  { name: 'Muradpur & Bahaddarhat', district: 'Chittagong', lat: 22.3712, lng: 91.8412 },
  { name: 'Khulshi R/A', district: 'Chittagong', lat: 22.3645, lng: 91.8087 },

  // Sylhet Metro
  { name: 'Zindabazar & Chowhatta', district: 'Sylhet', lat: 24.8949, lng: 91.8687 },
  { name: 'Shahi Eidgah & Kumarpara', district: 'Sylhet', lat: 24.9042, lng: 91.8765 },
  { name: 'Subidbazar & Pathantula', district: 'Sylhet', lat: 24.9087, lng: 91.8542 },
  { name: 'Amberkhana & Airport Road', district: 'Sylhet', lat: 24.9065, lng: 91.8678 },

  // Rajshahi Metro
  { name: 'Shaheb Bazar & Zero Point', district: 'Rajshahi', lat: 24.3636, lng: 88.6241 },
  { name: 'Motihar & Rajshahi University', district: 'Rajshahi', lat: 24.3687, lng: 88.6387 },

  // Khulna Metro
  { name: 'Shibbari More & KDA Avenue', district: 'Khulna', lat: 22.8256, lng: 89.5543 },
  { name: 'Sonadanga Bus Stand & R/A', district: 'Khulna', lat: 22.8187, lng: 89.5398 },

  // Other Divisional Centers
  { name: 'Band Road & Sadar Road', district: 'Barisal', lat: 22.7010, lng: 90.3535 },
  { name: 'Dhap & Medical More', district: 'Rangpur', lat: 25.7439, lng: 89.2752 },
  { name: 'Town Hall & Ganginarpar', district: 'Mymensingh', lat: 24.7471, lng: 90.4203 },
  { name: 'Chowrasta & Board Bazar', district: 'Gazipur', lat: 23.9999, lng: 90.4203 },
  { name: 'Chashara & Bangabandhu Road', district: 'Narayanganj', lat: 23.6238, lng: 90.5000 },
  { name: 'Kandirpar & Badurtola', district: 'Comilla', lat: 23.4607, lng: 91.1809 },
  { name: 'Satmatha & Jaleshwaritola', district: 'Bogra', lat: 24.8465, lng: 89.3777 },
];

// Comprehensive All 64 Districts Coordinates of Bangladesh
export const BANGLADESH_DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Chittagong': { lat: 22.3569, lng: 91.7832 },
  'Sylhet': { lat: 24.8949, lng: 91.8687 },
  'Rajshahi': { lat: 24.3745, lng: 88.6042 },
  'Khulna': { lat: 22.8456, lng: 89.5403 },
  'Barisal': { lat: 22.7010, lng: 90.3535 },
  'Rangpur': { lat: 25.7439, lng: 89.2752 },
  'Mymensingh': { lat: 24.7471, lng: 90.4203 },
  'Gazipur': { lat: 23.9999, lng: 90.4203 },
  'Narayanganj': { lat: 23.6238, lng: 90.5000 },
  'Comilla': { lat: 23.4607, lng: 91.1809 },
  'Bogra': { lat: 24.8465, lng: 89.3777 },
  'Cox\'s Bazar': { lat: 21.4272, lng: 92.0058 },
  'Jessore': { lat: 23.1664, lng: 89.2081 },
  'Dinajpur': { lat: 25.6217, lng: 88.6355 },
  'Tangail': { lat: 24.2513, lng: 89.9167 },
  'Faridpur': { lat: 23.6071, lng: 89.8429 },
  'Pabna': { lat: 24.0064, lng: 89.2372 },
  'Kushtia': { lat: 23.9013, lng: 89.1205 },
  'Noakhali': { lat: 22.8696, lng: 91.0998 },
  'Feni': { lat: 23.0159, lng: 91.3976 },
  'Brahmanbaria': { lat: 23.9571, lng: 91.1119 },
  'Sirajganj': { lat: 24.4534, lng: 89.7008 },
  'Narsingdi': { lat: 23.9193, lng: 90.7202 },
  'Manikganj': { lat: 23.8644, lng: 90.0047 },
  'Munshiganj': { lat: 23.5422, lng: 90.5305 },
  'Kishoreganj': { lat: 24.4449, lng: 90.7766 },
  'Gopalganj': { lat: 23.0051, lng: 89.8266 },
  'Madaripur': { lat: 23.1641, lng: 90.1897 },
  'Rajbari': { lat: 23.7574, lng: 89.6445 },
  'Shariatpur': { lat: 23.2423, lng: 90.4348 },
  'Chandpur': { lat: 23.2333, lng: 90.6667 },
  'Lakshmipur': { lat: 22.9425, lng: 90.8412 },
  'Rangamati': { lat: 22.6533, lng: 92.1753 },
  'Khagrachhari': { lat: 23.1193, lng: 91.9847 },
  'Bandarban': { lat: 22.1953, lng: 92.2184 },
  'Moulvibazar': { lat: 24.4829, lng: 91.7774 },
  'Habiganj': { lat: 24.3749, lng: 91.4155 },
  'Sunamganj': { lat: 25.0658, lng: 91.3950 },
  'Naogaon': { lat: 24.7936, lng: 88.9318 },
  'Natore': { lat: 24.4206, lng: 89.0003 },
  'Joypurhat': { lat: 25.0968, lng: 89.0227 },
  'Chapai Nawabganj': { lat: 24.5965, lng: 88.2775 },
  'Satkhira': { lat: 22.7185, lng: 89.0705 },
  'Jhenaidah': { lat: 23.5448, lng: 89.1539 },
  'Magura': { lat: 23.4873, lng: 89.4198 },
  'Meherpur': { lat: 23.7622, lng: 88.6318 },
  'Narail': { lat: 23.1725, lng: 89.5127 },
  'Chuadanga': { lat: 23.6402, lng: 88.8418 },
  'Bagerhat': { lat: 22.6516, lng: 89.7859 },
  'Patuakhali': { lat: 22.3596, lng: 90.3299 },
  'Bhola': { lat: 22.6859, lng: 90.6481 },
  'Pirojpur': { lat: 22.5841, lng: 89.9720 },
  'Jhalokati': { lat: 22.6406, lng: 90.1987 },
  'Barguna': { lat: 22.0953, lng: 90.1121 },
  'Gaibandha': { lat: 25.3288, lng: 89.5406 },
  'Kurigram': { lat: 25.8054, lng: 89.6362 },
  'Lalmonirhat': { lat: 25.9923, lng: 89.2847 },
  'Nilphamari': { lat: 25.9318, lng: 88.8560 },
  'Panchagarh': { lat: 26.3411, lng: 88.5542 },
  'Thakurgaon': { lat: 26.0337, lng: 88.4617 },
  'Jamalpur': { lat: 24.9375, lng: 89.9378 },
  'Sherpur': { lat: 25.0205, lng: 90.0153 },
  'Netrokona': { lat: 24.8709, lng: 90.7279 },
};

/**
 * Reverse geocodes coordinates with multi-tier precision:
 * 1. BigDataCloud Reverse Geocoding (CORS-friendly client API, zero-key, high accuracy for Bangladesh).
 * 2. OpenStreetMap Nominatim reverse geocoding fallback.
 * 3. 64-District + Neighborhood Centroids Geometric Haversine nearest match.
 */
export async function reverseGeocodeLiveCoords(
  lat: number,
  lng: number
): Promise<{
  areaName: string;
  district: string;
  exactAddress: string;
  confidence: 'HIGH' | 'APPROXIMATE';
}> {
  console.info(`[Porabo GPS] Reverse geocode initiated for raw coordinates: latitude=${lat}, longitude=${lng}`);

  // Clean district helper
  const cleanDistrictName = (rawDist: string): string => {
    let clean = rawDist.replace(/ District| Division| Zila| City/gi, '').trim();
    // Match against known 64 districts
    for (const d of Object.keys(BANGLADESH_DISTRICT_COORDINATES)) {
      if (d.toLowerCase() === clean.toLowerCase() || clean.toLowerCase().includes(d.toLowerCase())) {
        return d;
      }
    }
    return clean || 'Dhaka';
  };

  // Tier 1: BigDataCloud Client Reverse Geocode (100% CORS-friendly in browser)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (bdcRes.ok) {
      const data = await bdcRes.json();
      console.info('[Porabo GPS] Tier 1 BigDataCloud raw payload:', {
        locality: data?.locality,
        city: data?.city,
        principalSubdivision: data?.principalSubdivision,
        administrative: data?.localityInfo?.administrative
      });
      if (data) {
        const rawLocality = data.locality || data.city || data.principalSubdivision;
        const rawDistrict = data.localityInfo?.administrative?.find((a: any) =>
          a.adminLevel === 4 || a.adminLevel === 5 || a.description?.includes('district')
        )?.name || data.principalSubdivision || data.city || 'Dhaka';

        const district = cleanDistrictName(rawDistrict);
        const areaName = rawLocality && rawLocality !== district ? rawLocality : `${district} Center`;
        const exactAddress = `${areaName}, ${district} (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        if (areaName && district) {
          const result = {
            areaName,
            district,
            exactAddress,
            confidence: 'HIGH' as const
          };
          console.info(`[Porabo GPS] Tier 1 BigDataCloud match SUCCESS: area="${areaName}", district="${district}"`);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn('[Porabo GPS] Tier 1 BigDataCloud reverse geocode timed out or failed:', err);
  }

  // Tier 2: OpenStreetMap Nominatim with 3.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en-US,en' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.info('[Porabo GPS] Tier 2 Nominatim raw payload:', data?.address);
      if (data && data.address) {
        const addr = data.address;
        const sub =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.road ||
          addr.village ||
          addr.city_district ||
          addr.town;

        const dist = cleanDistrictName(
          addr.state_district ||
          addr.county ||
          addr.city ||
          addr.state ||
          'Dhaka'
        );

        if (sub) {
          const areaLabel = `${sub}`;
          const formattedAddress = data.display_name
            ? data.display_name.split(',').slice(0, 3).join(',').trim()
            : `${areaLabel}, ${dist}`;

          const result = {
            areaName: areaLabel,
            district: dist,
            exactAddress: formattedAddress,
            confidence: 'HIGH' as const,
          };
          console.info(`[Porabo GPS] Tier 2 Nominatim match SUCCESS: area="${areaLabel}", district="${dist}"`);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn('[Porabo GPS] Tier 2 Nominatim reverse geocode attempt failed:', err);
  }

  // Tier 3: Local Geometric Centroid Matching across all local centroids & 64 Districts
  console.info('[Porabo GPS] Falling back to Tier 3 Geometric Haversine Centroid match across 64 districts');
  const combinedCandidates: Array<{ name: string; district: string; lat: number; lng: number }> = [
    ...LOCAL_NEIGHBORHOOD_CENTROIDS,
    ...Object.entries(BANGLADESH_DISTRICT_COORDINATES).map(([district, coords]) => ({
      name: `${district} Sadar`,
      district,
      lat: coords.lat,
      lng: coords.lng,
    })),
  ];

  let closest = combinedCandidates[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < combinedCandidates.length; i++) {
    const candidate = combinedCandidates[i];
    const dist = calculateDistanceKm(lat, lng, candidate.lat, candidate.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = candidate;
    }
  }

  const areaLabel = minDistance <= 3.0
    ? closest.name
    : `${closest.name} (${minDistance} km)`;

  const result = {
    areaName: areaLabel,
    district: closest.district,
    exactAddress: `${areaLabel}, ${closest.district} (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    confidence: minDistance <= 2.0 ? 'HIGH' as const : 'APPROXIMATE' as const,
  };
  console.info(`[Porabo GPS] Tier 3 Centroid match: area="${result.areaName}", district="${result.district}", distance=${minDistance}km`);
  return result;
}
