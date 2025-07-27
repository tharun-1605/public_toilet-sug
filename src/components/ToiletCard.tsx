import React from 'react';
import { MapPin, Star, Clock, Plus, Wifi, Users, Zap, Navigation } from 'lucide-react';
import { ToiletData } from '../types';
import { GeolocationCoords, calculateDistance } from '../services/toiletApi';

interface ToiletCardProps {
  toilet: ToiletData;
  userLocation?: GeolocationCoords | null;
  onAddReview: () => void;
}

const ToiletCard: React.FC<ToiletCardProps> = ({ toilet, userLocation, onAddReview }) => {
  const distance = userLocation 
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        toilet.latitude,
        toilet.longitude
      )
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-green-500';
      case 'Bad': return 'bg-red-500';
      case 'Average': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'Good': return 'border-green-200 hover:border-green-300';
      case 'Bad': return 'border-red-200 hover:border-red-300';
      case 'Average': return 'border-yellow-200 hover:border-yellow-300';
      default: return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'disabled access': return <Users className="w-4 h-4" />;
      case 'electric hand dryer': return <Zap className="w-4 h-4" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${getCardBorderColor(toilet.cleanlinessStatus)} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Status Badge */}
      <div className="relative">
        <div className={`absolute top-4 right-4 ${getStatusColor(toilet.cleanlinessStatus)} text-white px-3 py-1 rounded-full text-sm font-medium shadow-md`}>
          {toilet.cleanlinessStatus}
        </div>
        {distance !== null && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center space-x-1">
            <Navigation className="w-3 h-3" />
            <span>{distance.toFixed(1)}km</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{toilet.name}</h3>
          <div className="flex items-start space-x-2 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p>{toilet.address}</p>
              <p className="text-gray-500">{toilet.city}, {toilet.state}</p>
              {toilet.landmark && (
                <p className="text-blue-600 font-medium">Near {toilet.landmark}</p>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 font-medium">{isNaN(toilet.rating) ? 0 : toilet.rating}</span>
          </div>
          <span className="text-gray-500 text-sm">({toilet.reviews ? toilet.reviews.length : 0} reviews)</span>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${toilet.isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {toilet.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Facilities */}
        {toilet.facilities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities:</h4>
            <div className="flex flex-wrap gap-2">
              {toilet.facilities.map((facility, index) => (
                <div key={index} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {getFacilityIcon(facility)}
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {toilet.reviews.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Review:</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 line-clamp-2">
                "{toilet.reviews[toilet.reviews.length - 1].text}"
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < toilet.reviews[toilet.reviews.length - 1].rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(toilet.reviews[toilet.reviews.length - 1].date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Add Review Button */}
        <button
          onClick={onAddReview}
          className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>

        {/* Last Updated */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          Last updated: {new Date(toilet.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ToiletCard;