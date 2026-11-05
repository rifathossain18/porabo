import { TuitionPost, TuitionApplication, User } from './types';

// Anchor point for default initial state
export const ANCHOR_LOCATION = {
  name: 'Central Dhaka',
  district: 'Dhaka',
  latitude: 23.8103,
  longitude: 90.4125,
};

// All 64 Districts of Bangladesh
export const DISTRICTS = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Rangpur',
  'Mymensingh',
  'Gazipur',
  'Narayanganj',
  'Comilla',
  'Bogra',
  'Cox\'s Bazar',
  'Jessore',
  'Dinajpur',
  'Tangail',
  'Faridpur',
  'Pabna',
  'Kushtia',
  'Noakhali',
  'Feni',
  'Brahmanbaria',
  'Sirajganj',
  'Narsingdi',
  'Manikganj',
  'Munshiganj',
  'Kishoreganj',
  'Gopalganj',
  'Madaripur',
  'Rajbari',
  'Shariatpur',
  'Chandpur',
  'Lakshmipur',
  'Rangamati',
  'Khagrachhari',
  'Bandarban',
  'Moulvibazar',
  'Habiganj',
  'Sunamganj',
  'Naogaon',
  'Natore',
  'Joypurhat',
  'Chapai Nawabganj',
  'Satkhira',
  'Jhenaidah',
  'Magura',
  'Meherpur',
  'Narail',
  'Bagerhat',
  'Chuadanga',
  'Bhola',
  'Jhalokati',
  'Pirojpur',
  'Barguna',
  'Patuakhali',
  'Gaibandha',
  'Kurigram',
  'Lalmonirhat',
  'Nilphamari',
  'Panchagarh',
  'Thakurgaon',
  'Jamalpur',
  'Netrokona',
  'Sherpur'
];

// District approximate central coordinates for location calculation
export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Chittagong': { lat: 22.3569, lng: 91.7832 },
  'Sylhet': { lat: 24.8949, lng: 91.8687 },
  'Rajshahi': { lat: 24.3636, lng: 88.6241 },
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
  'Dinajpur': { lat: 25.6217, lng: 88.6354 },
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
  'Habiganj': { lat: 24.3750, lng: 91.4167 },
  'Sunamganj': { lat: 25.0658, lng: 91.3950 },
  'Naogaon': { lat: 24.8103, lng: 88.9324 },
  'Natore': { lat: 24.4206, lng: 89.0003 },
  'Joypurhat': { lat: 25.0968, lng: 89.0227 },
  'Chapai Nawabganj': { lat: 24.5965, lng: 88.2775 },
  'Satkhira': { lat: 22.7185, lng: 89.0705 },
  'Jhenaidah': { lat: 23.5448, lng: 89.1539 },
  'Magura': { lat: 23.4873, lng: 89.4199 },
  'Meherpur': { lat: 23.7622, lng: 88.6318 },
  'Narail': { lat: 23.1725, lng: 89.5127 },
  'Bagerhat': { lat: 22.6516, lng: 89.7859 },
  'Chuadanga': { lat: 23.6402, lng: 88.8418 },
  'Bhola': { lat: 22.6859, lng: 90.6481 },
  'Jhalokati': { lat: 22.6406, lng: 90.1987 },
  'Pirojpur': { lat: 22.5841, lng: 89.9720 },
  'Barguna': { lat: 22.0953, lng: 90.1121 },
  'Patuakhali': { lat: 22.3596, lng: 90.3299 },
  'Gaibandha': { lat: 25.3288, lng: 89.5408 },
  'Kurigram': { lat: 25.8054, lng: 89.6362 },
  'Lalmonirhat': { lat: 25.9923, lng: 89.2847 },
  'Nilphamari': { lat: 25.9318, lng: 88.8560 },
  'Panchagarh': { lat: 26.3411, lng: 88.5542 },
  'Thakurgaon': { lat: 26.0337, lng: 88.4617 },
  'Jamalpur': { lat: 24.9375, lng: 89.9378 },
  'Netrokona': { lat: 24.8709, lng: 90.7279 },
  'Sherpur': { lat: 25.0205, lng: 90.0153 }
};

// All Subjects covering all streams
export const SUBJECT_OPTIONS = [
  'All Subjects',
  'General Math & Basic Arithmetic',
  'Higher Math & Additional Math',
  'Physics',
  'Chemistry',
  'Biology & Life Sciences',
  'English Language & Literature',
  'Bangla (1st & 2nd Paper)',
  'ICT & Computer Programming',
  'Accounting & Financial Management',
  'Business Studies & Commerce',
  'Economics',
  'General Science',
  'Bangladesh & Global Studies (BGS)',
  'Geography & Environmental Science',
  'Islamic Studies / Religious Studies',
  'Arabic & Quranic Studies',
  'Drawing, Art & Craft'
];

// All Grades starting from Class 1 up to HSC & Admission
export const GRADE_OPTIONS = [
  'All Grades',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5 (Primary / PEC)',
  'Class 6',
  'Class 7',
  'Class 8 (JSC)',
  'Class 9',
  'Class 10 (SSC)',
  'HSC 1st Year (Class 11)',
  'HSC 2nd Year (Class 12)',
  'O-Level (Cambridge / Edexcel)',
  'A-Level (Cambridge / Edexcel)',
  'Admission Test Preparation (BUET / Medical / DU)'
];

export const POPULAR_AREAS_DHAKA = [
  'Dhanmondi',
  'Gulshan 1 & 2',
  'Banani',
  'Uttara',
  'Mirpur',
  'Mohammadpur',
  'Bashundhara R/A',
  'Badda & Rampura',
  'Kalabagan',
  'Tejgaon & Farmgate',
  'Lalmatia',
  'Shankar & Rayerbazar',
  'Panthapath',
  'Shantinagar & Malibagh',
];

export const PRESET_ACCOUNTS: User[] = [];

export const MOCK_STUDENT: User | null = null;
export const MOCK_TUTORS: User[] = [];

export const GENERATED_DISTRICT_POSTS: TuitionPost[] = [];

export const USER_INITIAL_POSTS: TuitionPost[] = [];

export const INITIAL_TUITION_POSTS: TuitionPost[] = [];

export const INITIAL_APPLICATIONS: TuitionApplication[] = [];

// Helper to filter out posts older than 70 days (Auto-cleanup for real posts)
export function filterActive70DayPosts(posts: TuitionPost[]): TuitionPost[] {
  const cutoff = Date.now() - (70 * 24 * 60 * 60 * 1000);
  return posts.filter(post => {
    const postTime = new Date(post.createdAt).getTime();
    return postTime >= cutoff;
  });
}

