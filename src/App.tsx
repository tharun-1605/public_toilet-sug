import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Filter, BarChart3, Plus, Wifi, AlertCircle } from 'lucide-react';
import LocationSelector from './components/LocationSelector';
import ToiletCard from './components/ToiletCard';
import SearchBar from './components/SearchBar';
import ReviewForm from './components/ReviewForm';
import StatisticsChart from './components/StatisticsChart';
import { ToiletData, UserReview } from './types';
import { mockToiletData } from './data/mockData';
import { analyzeSentiment } from './utils/sentimentAnalysis';
import { 
  fetchToiletsFromApi, 
  getCurrentLocation, 
  findNearbyToilets, 
  convertApiDataToToiletData,
  GeolocationCoords 
} from './services/toiletApi';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [toiletData, setToiletData] = useState<ToiletData[]>([]);
  const [filteredData, setFilteredData] = useState<ToiletData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'cleanliness'>('rating');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedToiletId, setSelectedToiletId] = useState<string>('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoords | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (location?: { longitude: number; latitude: number }) => {
    setIsLoadingApi(true);
    setApiError('');

    try {
      // Try to fetch from API only with user location if available
      let apiData;
      if (location) {
        apiData = await fetchToiletsFromApi(location.longitude, location.latitude);
      } else if (userLocation) {
        apiData = await fetchToiletsFromApi(userLocation.longitude, userLocation.latitude);
      } else {
        apiData = await fetchToiletsFromApi();
      }
      if (apiData && apiData.length > 0) {
        const convertedData = convertApiDataToToiletData(apiData);
        const processedData = processToiletData(convertedData);
        setToiletData(processedData);
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('API fetch failed:', error);
      setApiError('Unable to fetch live data. Using cached data instead.');
      // Fallback to mock data when API fails
      const processedMockData = processToiletData(mockToiletData);
      setToiletData(processedMockData);
    } finally {
      setIsLoadingApi(false);
    }
  };

  const processToiletData = (data: ToiletData[]) => {
    // Load user reviews from localStorage
    const savedReviews = localStorage.getItem('userReviews');
    if (savedReviews) {
      const reviews: UserReview[] = JSON.parse(savedReviews);
      return data.map(toilet => {
        const userReviewsForToilet = reviews.filter(review => review.toiletId === toilet.id);
        if (userReviewsForToilet.length > 0) {
          const allReviews = [...toilet.reviews, ...userReviewsForToilet.map(ur => ur.review)];
          const cleanlinessStatus = analyzeSentiment(allReviews);
          const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
          
          return {
            ...toilet,
            reviews: allReviews,
            cleanlinessStatus,
            rating: Math.round(avgRating * 10) / 10
          };
        }
        return {
          ...toilet,
          cleanlinessStatus: analyzeSentiment(toilet.reviews)
        };
      });
    } else {
      return data.map(toilet => ({
        ...toilet,
        cleanlinessStatus: analyzeSentiment(toilet.reviews)
      }));
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setApiError('');
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setIsUsingCurrentLocation(true);
      setSelectedLocation(''); // Clear manual location selection
      
      // Fetch toilets from API for current location
      await loadInitialData(location);
      
    } catch (error) {
      console.error('Geolocation error:', error);
      setApiError('Unable to get your location. Please check your browser permissions.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    type ToiletWithDistance = ToiletData & { distance: number };

    let filtered: ToiletData[] | ToiletWithDistance[] = toiletData;

    // Filter by current location or selected location
    if (isUsingCurrentLocation && userLocation) {
      const nearbyToilets: ToiletWithDistance[] = findNearbyToilets(toiletData, userLocation, 10) as ToiletWithDistance[];

      if (nearbyToilets.length === 0) {
        setApiError('No toilets found within 10km of your location.');
      }

      filtered = nearbyToilets;
    } else if (selectedLocation) {
      filtered = filtered.filter(toilet =>
        toilet.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        toilet.district.toLowerCase().includes(selectedLocation.toLowerCase())
      );

      // If no toilets found for selected location and we're using API data, fall back to mock data
      if (filtered.length === 0 && toiletData.length > 0 && !toiletData.some(t => t.city.toLowerCase().includes(selectedLocation.toLowerCase()))) {
        const mockFiltered = mockToiletData.filter(toilet =>
          toilet.city.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          toilet.district.toLowerCase().includes(selectedLocation.toLowerCase())
        );
        if (mockFiltered.length > 0) {
          filtered = processToiletData(mockFiltered);
        }
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(toilet =>
        toilet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toilet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toilet.landmark.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else {
        const statusOrder = { 'Good': 2, 'Average': 1, 'Bad': 0 };
        return statusOrder[b.cleanlinessStatus] - statusOrder[a.cleanlinessStatus];
      }
    });

    setFilteredData(filtered as ToiletData[]);
  }, [toiletData, selectedLocation, searchTerm, sortBy, isUsingCurrentLocation, userLocation]);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setIsUsingCurrentLocation(false);
    setUserLocation(null);
  };

  const handleAddReview = (toiletId: string, review: string, rating: number) => {
    const newReview: UserReview = {
      id: Date.now().toString(),
      toiletId,
      review: { text: review, rating, date: new Date().toISOString() },
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const savedReviews = localStorage.getItem('userReviews');
    const reviews: UserReview[] = savedReviews ? JSON.parse(savedReviews) : [];
    reviews.push(newReview);
    localStorage.setItem('userReviews', JSON.stringify(reviews));

    // Update toilet data
    const updatedData = toiletData.map(toilet => {
      if (toilet.id === toiletId) {
        const updatedReviews = [...toilet.reviews, newReview.review];
        const cleanlinessStatus = analyzeSentiment(updatedReviews);
        const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        
        return {
          ...toilet,
          reviews: updatedReviews,
          cleanlinessStatus,
          rating: Math.round(avgRating * 10) / 10
        };
      }
      return toilet;
    });

    setToiletData(updatedData);
    setShowReviewForm(false);
  };

  const goodToilets = filteredData.filter(t => t.cleanlinessStatus === 'Good').length;
  const badToilets = filteredData.filter(t => t.cleanlinessStatus === 'Bad').length;
  const averageToilets = filteredData.filter(t => t.cleanlinessStatus === 'Average').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Public Toilet Cleanliness Finder</h1>
                <p className="text-sm text-gray-600">Find clean public toilets across India</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLoadingApi && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Wifi className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading data...</span>
                </div>
              )}
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Statistics</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {apiError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">{apiError}</p>
            </div>
          </div>
        )}

        {/* Statistics Panel */}
        {showStatistics && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Cleanliness Statistics</h2>
            <StatisticsChart 
              good={goodToilets} 
              bad={badToilets} 
              average={averageToilets}
              location={
                isUsingCurrentLocation 
                  ? 'Near Your Location' 
                  : selectedLocation || 'All Locations'
              }
            />
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-1">
            <LocationSelector 
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
              onUseCurrentLocation={handleUseCurrentLocation}
              isLoadingLocation={isLoadingLocation}
            />
          </div>
          <div className="lg:col-span-2">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'cleanliness')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="rating">Sort by Rating</option>
                <option value="cleanliness">Sort by Cleanliness</option>
                {isUsingCurrentLocation && <option value="distance">Sort by Distance</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-600">
            <span className="font-medium">{filteredData.length}</span> toilets found
            {isUsingCurrentLocation && <span> near your location</span>}
            {selectedLocation && !isUsingCurrentLocation && <span> in {selectedLocation}</span>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Good ({goodToilets})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Average ({averageToilets})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Bad ({badToilets})</span>
            </div>
          </div>
        </div>

        {/* Toilet Cards */}
        {isLoadingApi ? (
          <div className="text-center py-12">
            <Wifi className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Loading toilet data...</h3>
            <p className="text-gray-500">Please wait while we fetch the latest information</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((toilet) => (
              <ToiletCard
                key={toilet.id}
                toilet={toilet}
                userLocation={userLocation}
                onAddReview={() => {
                  setSelectedToiletId(toilet.id);
                  setShowReviewForm(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No toilets found</h3>
            <p className="text-gray-500">
              {isUsingCurrentLocation 
                ? 'No toilets found within 10km of your location. Try expanding your search area.'
                : 'Try adjusting your location or search criteria'
              }
            </p>
          </div>
        )}

        {/* Add Review Modal */}
        {showReviewForm && (
          <ReviewForm
            toiletId={selectedToiletId}
            onSubmit={handleAddReview}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;