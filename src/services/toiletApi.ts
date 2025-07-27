export interface ApiToiletData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  reviews?: Array<{
    text: string;
    rating: number;
    date: string;
  }>;
  facilities?: string[];
  isOpen?: boolean;
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

const API_KEY = '7f2c6ceb5baf412ab11afdc08a3ef373';

const API_BASE_URL = (longitude: number, latitude: number, radius: number = 10000) =>
  `https://api.geoapify.com/v2/places?categories=amenity.toilet&filter=circle:${longitude},${latitude},${radius}&limit=20&apiKey=${API_KEY}`;

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get user's current location
export const getCurrentLocation = (): Promise<GeolocationCoords> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Fetch toilets from API
export const fetchToiletsFromApi = async (longitude: number = 77.2090, latitude: number = 28.6139): Promise<ApiToiletData[]> => {
  try {
    const response = await fetch(API_BASE_URL(longitude, latitude));
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Handle different possible API response structures including GeoJSON FeatureCollection
    if (Array.isArray(data)) {
      return data;
    } else if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      // Map GeoJSON features to ApiToiletData[]
      return data.features.map((feature: any) => {
        const props = feature.properties || {};
        return {
          id: props.place_id || feature.id || '',
          name: props.name || 'Public Toilet',
          address: props.address_line1 || props.address || 'Address not available',
          city: props.city || 'Unknown City',
          state: props.state || 'Unknown State',
          latitude: feature.geometry?.coordinates[1] || 0,
          longitude: feature.geometry?.coordinates[0] || 0,
          reviews: [],
          facilities: [],
          isOpen: true
        };
      });
    } else if (data.toilets && Array.isArray(data.toilets)) {
      return data.toilets;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn('Unexpected API response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching toilets from API:', error);
    throw error;
  }
};

// Find nearby toilets based on user location
import { ToiletData } from '../types';

export const findNearbyToilets = (
  toilets: (ApiToiletData | ToiletData)[],
  userLocation: GeolocationCoords,
  radiusKm: number = 10
): Array<(ApiToiletData | ToiletData) & { distance: number }> => {
  return toilets
    .map(toilet => ({
      ...toilet,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        toilet.latitude,
        toilet.longitude
      )
    }))
    .filter(toilet => toilet.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

// Convert API data to our internal format
export const convertApiDataToToiletData = (apiData: ApiToiletData[]) => {
  return apiData.map(toilet => {
    // Generate mock reviews if not provided by API
    const reviews = toilet.reviews || generateMockReviews();
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    return {
      id: toilet.id || Math.random().toString(36).substr(2, 9),
      name: toilet.name || 'Public Toilet',
      address: toilet.address || 'Address not available',
      city: toilet.city || 'Unknown City',
      district: toilet.city || 'Unknown District',
      state: toilet.state || 'Unknown State',
      landmark: extractLandmark(toilet.address || ''),
      latitude: toilet.latitude || 0,
      longitude: toilet.longitude || 0,
      cleanlinessStatus: 'Average' as const,
      rating: Math.round(avgRating * 10) / 10,
      reviews,
      isOpen: toilet.isOpen !== undefined ? toilet.isOpen : true,
      facilities: toilet.facilities || ['Basic Facilities'],
      lastUpdated: new Date().toISOString()
    };
  });
};

// Helper function to extract landmark from address
const extractLandmark = (address: string): string => {
  const landmarks = ['Metro Station', 'Railway Station', 'Bus Stand', 'Market', 'Hospital', 'School', 'Park'];
  for (const landmark of landmarks) {
    if (address.toLowerCase().includes(landmark.toLowerCase())) {
      return landmark;
    }
  }
  return 'Public Area';
};

// Generate mock reviews for toilets without review data
const generateMockReviews = () => {
  const reviewTexts = [
    "Clean and well-maintained facility",
    "Average cleanliness, could be better",
    "Good facilities available",
    "Needs improvement in maintenance",
    "Decent condition overall"
  ];
  
  const numReviews = Math.floor(Math.random() * 5) + 1;
  const reviews = [];
  
  for (let i = 0; i < numReviews; i++) {
    reviews.push({
      text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      rating: Math.floor(Math.random() * 5) + 1,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return reviews;
};