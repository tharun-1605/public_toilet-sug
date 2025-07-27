import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatisticsChartProps {
  good: number;
  bad: number;
  average: number;
  location: string;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ good, bad, average, location }) => {
  const total = good + bad + average;
  
  const goodPercentage = total > 0 ? (good / total) * 100 : 0;
  const badPercentage = total > 0 ? (bad / total) * 100 : 0;
  const averagePercentage = total > 0 ? (average / total) * 100 : 0;

  const getOverallStatus = () => {
    if (good > bad + average) return { status: 'Excellent', icon: TrendingUp, color: 'text-green-600' };
    if (bad > good + average) return { status: 'Needs Improvement', icon: TrendingDown, color: 'text-red-600' };
    return { status: 'Average', icon: Minus, color: 'text-yellow-600' };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Cleanliness Overview - {location}
        </h3>
        <div className={`flex items-center space-x-2 ${overallStatus.color}`}>
          <StatusIcon className="w-5 h-5" />
          <span className="font-medium">{overallStatus.status}</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Distribution</span>
          <span className="text-gray-500">{total} total toilets</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full overflow-hidden h-8">
          <div className="h-full flex">
            {goodPercentage > 0 && (
              <div 
                className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${goodPercentage}%` }}
              >
                {goodPercentage > 15 && `${Math.round(goodPercentage)}%`}
              </div>
            )}
            {averagePercentage > 0 && (
              <div 
                className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${averagePercentage}%` }}
              >
                {averagePercentage > 15 && `${Math.round(averagePercentage)}%`}
              </div>
            )}
            {badPercentage > 0 && (
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${badPercentage}%` }}
              >
                {badPercentage > 15 && `${Math.round(badPercentage)}%`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{good}</div>
          <div className="text-sm text-green-700">Good</div>
          <div className="text-xs text-green-600">{Math.round(goodPercentage)}%</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{average}</div>
          <div className="text-sm text-yellow-700">Average</div>
          <div className="text-xs text-yellow-600">{Math.round(averagePercentage)}%</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{bad}</div>
          <div className="text-sm text-red-700">Bad</div>
          <div className="text-xs text-red-600">{Math.round(badPercentage)}%</div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {goodPercentage > 50 ? 'Majority of toilets are in good condition' : 'Cleanliness needs improvement in this area'}</li>
          <li>• {total > 0 ? `Average rating across all toilets in this location` : 'No data available for this location'}</li>
          <li>• {badPercentage > 25 ? 'High priority area for maintenance' : 'Maintenance levels are acceptable'}</li>
        </ul>
      </div>
    </div>
  );
};

export default StatisticsChart;