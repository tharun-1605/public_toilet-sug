export interface Review {
  text: string;
  rating: number;
  date: string;
}

export interface ToiletData {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  landmark: string;
  latitude: number;
  longitude: number;
  cleanlinessStatus: 'Good' | 'Bad' | 'Average';
  rating: number;
  reviews: Review[];
  isOpen: boolean;
  facilities: string[];
  lastUpdated: string;
}

export interface UserReview {
  id: string;
  toiletId: string;
  review: Review;
  timestamp: string;
}

export interface LocationOption {
  value: string;
  label: string;
  state: string;
}