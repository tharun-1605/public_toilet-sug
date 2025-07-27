import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { LocationOption } from '../types';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  onUseCurrentLocation: () => void;
  isLoadingLocation?: boolean;
}

const indianLocations: LocationOption[] = [
  { value: '', label: 'All Locations', state: '' },
  // Major Cities
  { value: 'Delhi', label: 'Delhi', state: 'Delhi' },
  { value: 'Mumbai', label: 'Mumbai', state: 'Maharashtra' },
  { value: 'Bangalore', label: 'Bangalore', state: 'Karnataka' },
  { value: 'Chennai', label: 'Chennai', state: 'Tamil Nadu' },
  { value: 'Hyderabad', label: 'Hyderabad', state: 'Telangana' },
  { value: 'Pune', label: 'Pune', state: 'Maharashtra' },
  { value: 'Kolkata', label: 'Kolkata', state: 'West Bengal' },
  { value: 'Ahmedabad', label: 'Ahmedabad', state: 'Gujarat' },
  { value: 'Jaipur', label: 'Jaipur', state: 'Rajasthan' },
  { value: 'Lucknow', label: 'Lucknow', state: 'Uttar Pradesh' },
  // Districts
  { value: 'Gurgaon', label: 'Gurgaon', state: 'Haryana' },
  { value: 'Noida', label: 'Noida', state: 'Uttar Pradesh' },
  { value: 'Faridabad', label: 'Faridabad', state: 'Haryana' },
  { value: 'Ghaziabad', label: 'Ghaziabad', state: 'Uttar Pradesh' },
  { value: 'Thane', label: 'Thane', state: 'Maharashtra' },
  { value: 'Coimbatore', label: 'Coimbatore', state: 'Tamil Nadu' },
  { value: 'Kochi', label: 'Kochi', state: 'Kerala' },
  { value: 'Indore', label: 'Indore', state: 'Madhya Pradesh' },
  { value: 'Bhopal', label: 'Bhopal', state: 'Madhya Pradesh' },
  { value: 'Chandigarh', label: 'Chandigarh', state: 'Chandigarh' }
];

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  onUseCurrentLocation,
  isLoadingLocation = false
}) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
        >
          {indianLocations.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
              {location.state && ` (${location.state})`}
            </option>
          ))}
        </select>
      </div>
      
      <button
        onClick={onUseCurrentLocation}
        disabled={isLoadingLocation}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors font-medium"
      >
        <Navigation className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
        <span>
          {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
        </span>
      </button>
    </div>
  );
};

export default LocationSelector;