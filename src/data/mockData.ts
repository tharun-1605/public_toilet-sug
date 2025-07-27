import { ToiletData } from '../types';
import { analyzeSentiment } from '../utils/sentimentAnalysis';

const generateMockReviews = (count: number, bias: 'positive' | 'negative' | 'mixed' = 'mixed') => {
  const positiveReviews = [
    "Very clean and well-maintained toilet. Good facilities available.",
    "Excellent cleanliness standards. The staff maintains it regularly.",
    "Clean washroom with proper soap and water supply. Highly recommended.",
    "Well-maintained facility with good ventilation and cleanliness.",
    "Spotless and hygienic. Great job by the maintenance team.",
    "Clean toilet with all necessary amenities. Very satisfied.",
    "Impressive cleanliness level. The facility is well-managed.",
    "Very good condition with regular cleaning. Appreciated the effort."
  ];

  const negativeReviews = [
    "Very dirty and smelly. Needs immediate attention and cleaning.",
    "Poor maintenance and unhygienic conditions. Avoid if possible.",
    "Extremely dirty with no proper cleaning. Water supply issues too.",
    "Terrible condition. No soap, dirty floors, and bad smell.",
    "Unhygienic and poorly maintained. Needs major improvements.",
    "Dirty toilet with broken facilities. Not recommended at all.",
    "Poor cleanliness standards. The facility is in bad condition.",
    "Awful experience. Very dirty and unmaintained toilet."
  ];

  const mixedReviews = [
    "Average cleanliness but could be better maintained.",
    "Okay condition but needs more frequent cleaning.",
    "Decent facility but some improvements needed.",
    "Not bad but has room for improvement in cleanliness.",
    "Acceptable but could use better maintenance.",
    "Okay experience, could be cleaner though."
  ];

  const reviews = [];
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < count; i++) {
    let reviewText: string;
    let rating: number;

    if (bias === 'positive') {
      reviewText = positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
      rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
    } else if (bias === 'negative') {
      reviewText = negativeReviews[Math.floor(Math.random() * negativeReviews.length)];
      rating = Math.floor(Math.random() * 2) + 1; // 1-2 stars
    } else {
      const reviewType = Math.random();
      if (reviewType < 0.4) {
        reviewText = positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
        rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      } else if (reviewType < 0.7) {
        reviewText = mixedReviews[Math.floor(Math.random() * mixedReviews.length)];
        rating = 3; // 3 stars
      } else {
        reviewText = negativeReviews[Math.floor(Math.random() * negativeReviews.length)];
        rating = Math.floor(Math.random() * 2) + 1; // 1-2 stars
      }
    }

    const reviewDate = new Date(baseDate.getTime() + Math.random() * (Date.now() - baseDate.getTime()));

    reviews.push({
      text: reviewText,
      rating,
      date: reviewDate.toISOString()
    });
  }

  return reviews;
};

const createToiletData = (
  id: string,
  name: string,
  address: string,
  city: string,
  district: string,
  state: string,
  landmark: string,
  latitude: number,
  longitude: number,
  reviewBias: 'positive' | 'negative' | 'mixed' = 'mixed',
  facilities: string[] = [],
  isOpen: boolean = true
): ToiletData => {
  const reviews = generateMockReviews(Math.floor(Math.random() * 10) + 3, reviewBias);
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const cleanlinessStatus = analyzeSentiment(reviews);

  return {
    id,
    name,
    address,
    city,
    district,
    state,
    landmark,
    latitude,
    longitude,
    cleanlinessStatus,
    rating: Math.round(avgRating * 10) / 10,
    reviews,
    isOpen,
    facilities,
    lastUpdated: new Date().toISOString()
  };
};

export const mockToiletData: ToiletData[] = [
  // Delhi
  createToiletData(
    "1",
    "Connaught Place Public Toilet",
    "Block A, Connaught Place",
    "Delhi",
    "New Delhi",
    "Delhi",
    "Connaught Place Metro Station",
    28.6315, 77.2167,
    'positive',
    ['WiFi', 'Disabled Access', 'Electric Hand Dryer'],
    true
  ),
  createToiletData(
    "2",
    "India Gate Public Facility",
    "India Gate Circle",
    "Delhi",
    "New Delhi",
    "Delhi",
    "India Gate Monument",
    28.6129, 77.2295,
    'mixed',
    ['Disabled Access'],
    true
  ),
  createToiletData(
    "3",
    "Red Fort Public Washroom",
    "Red Fort Complex",
    "Delhi",
    "New Delhi",
    "Delhi",
    "Red Fort",
    28.6562, 77.2410,
    'negative',
    [],
    false
  ),

  // Mumbai
  createToiletData(
    "4",
    "Gateway of India Public Toilet",
    "Apollo Bunder, Colaba",
    "Mumbai",
    "Mumbai City",
    "Maharashtra",
    "Gateway of India",
    18.9220, 72.8347,
    'positive',
    ['WiFi', 'Electric Hand Dryer'],
    true
  ),
  createToiletData(
    "5",
    "Marine Drive Public Facility",
    "Netaji Subhashchandra Bose Road",
    "Mumbai",
    "Mumbai City",
    "Maharashtra",
    "Marine Drive",
    18.9443, 72.8231,
    'mixed',
    ['Disabled Access'],
    true
  ),
  createToiletData(
    "6",
    "Juhu Beach Public Washroom",
    "Juhu Beach, Juhu",
    "Mumbai",
    "Mumbai Suburban",
    "Maharashtra",
    "Juhu Beach",
    19.0968, 72.8265,
    'negative',
    [],
    true
  ),

  // Bangalore
  createToiletData(
    "7",
    "Cubbon Park Public Toilet",
    "Cubbon Park, Kasturba Road",
    "Bangalore",
    "Bangalore Urban",
    "Karnataka",
    "Cubbon Park",
    12.9767, 77.5993,
    'positive',
    ['WiFi', 'Disabled Access', 'Electric Hand Dryer'],
    true
  ),
  createToiletData(
    "8",
    "Lalbagh Botanical Garden Facility",
    "Lalbagh Main Road",
    "Bangalore",
    "Bangalore Urban",
    "Karnataka",
    "Lalbagh Botanical Garden",
    12.9507, 77.5848,
    'mixed',
    ['Disabled Access'],
    true
  ),

  // Chennai
  createToiletData(
    "9",
    "Marina Beach Public Toilet",
    "Marina Beach Road",
    "Chennai",
    "Chennai",
    "Tamil Nadu",
    "Marina Beach",
    13.0475, 80.2824,
    'mixed',
    ['Disabled Access'],
    true
  ),
  createToiletData(
    "10",
    "Central Railway Station Facility",
    "Chennai Central Railway Station",
    "Chennai",
    "Chennai",
    "Tamil Nadu",
    "Chennai Central",
    13.0827, 80.2707,
    'positive',
    ['WiFi', 'Electric Hand Dryer'],
    true
  ),

  // Hyderabad
  createToiletData(
    "11",
    "Charminar Public Washroom",
    "Charminar Area, Old City",
    "Hyderabad",
    "Hyderabad",
    "Telangana",
    "Charminar",
    17.3616, 78.4747,
    'negative',
    [],
    true
  ),
  createToiletData(
    "12",
    "Hussain Sagar Lake Facility",
    "Tank Bund Road",
    "Hyderabad",
    "Hyderabad",
    "Telangana",
    "Hussain Sagar Lake",
    17.4239, 78.4738,
    'positive',
    ['WiFi', 'Disabled Access'],
    true
  ),

  // Pune
  createToiletData(
    "13",
    "Shaniwar Wada Public Toilet",
    "Shaniwar Peth",
    "Pune",
    "Pune",
    "Maharashtra",
    "Shaniwar Wada",
    18.5196, 73.8553,
    'mixed',
    ['Disabled Access'],
    true
  ),

  // Kolkata
  createToiletData(
    "14",
    "Victoria Memorial Public Facility",
    "Victoria Memorial Hall, Queens Way",
    "Kolkata",
    "Kolkata",
    "West Bengal",
    "Victoria Memorial",
    22.5448, 88.3426,
    'positive',
    ['WiFi', 'Electric Hand Dryer'],
    true
  ),
  createToiletData(
    "15",
    "Howrah Bridge Area Toilet",
    "Strand Road",
    "Kolkata",
    "Kolkata",
    "West Bengal",
    "Howrah Bridge",
    22.5958, 88.3468,
    'negative',
    [],
    false
  ),

  // Ahmedabad
  createToiletData(
    "16",
    "Sabarmati Ashram Public Toilet",
    "Ashram Road",
    "Ahmedabad",
    "Ahmedabad",
    "Gujarat",
    "Sabarmati Ashram",
    23.0615, 72.5804,
    'positive',
    ['Disabled Access', 'Electric Hand Dryer'],
    true
  ),

  // Jaipur
  createToiletData(
    "17",
    "Hawa Mahal Public Washroom",
    "Hawa Mahal Road, Badi Choupad",
    "Jaipur",
    "Jaipur",
    "Rajasthan",
    "Hawa Mahal",
    26.9239, 75.8267,
    'mixed',
    ['Disabled Access'],
    true
  ),
  createToiletData(
    "18",
    "City Palace Public Facility",
    "Jaleb Chowk, City Palace",
    "Jaipur",
    "Jaipur",
    "Rajasthan",
    "City Palace",
    26.9255, 75.8235,
    'negative',
    [],
    true
  ),

  // Lucknow
  createToiletData(
    "19",
    "Bara Imambara Public Toilet",
    "Husainabad",
    "Lucknow",
    "Lucknow",
    "Uttar Pradesh",
    "Bara Imambara",
    26.8695, 80.9177,
    'mixed',
    ['Disabled Access'],
    true
  ),

  // Gurgaon
  createToiletData(
    "20",
    "Cyber City Public Facility",
    "DLF Cyber City, Phase 2",
    "Gurgaon",
    "Gurgaon",
    "Haryana",
    "DLF Cyber City",
    28.4955, 77.0910,
    'positive',
    ['WiFi', 'Disabled Access', 'Electric Hand Dryer'],
    true
  )
];