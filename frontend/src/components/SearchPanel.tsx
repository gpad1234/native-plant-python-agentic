import type { Region, ClimateType } from '../types/api';
import { CLIMATE_LABELS, REGION_LABELS } from '../lib/constants';

interface SearchPanelProps {
  region: Region;
  climateType: ClimateType;
  searchTerm: string;
  onRegionChange: (region: Region) => void;
  onClimateTypeChange: (type: ClimateType) => void;
  onSearchTermChange: (term: string) => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
}

export function SearchPanel({
  region,
  climateType,
  searchTerm,
  onRegionChange,
  onClimateTypeChange,
  onSearchTermChange,
  viewMode,
  onViewModeChange,
}: SearchPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Search & Filter</h2>

      {/* View Mode Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Region Selector */}
      <div className="mb-6">
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
          Region
        </label>
        <select
          id="region"
          value={region}
          onChange={(e) => onRegionChange(e.target.value as Region)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {Object.entries(REGION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Climate Type Filter */}
      <div className="mb-6">
        <label htmlFor="climate" className="block text-sm font-medium text-gray-700 mb-2">
          Climate Zone
        </label>
        <select
          id="climate"
          value={climateType}
          onChange={(e) => onClimateTypeChange(e.target.value as ClimateType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {Object.entries(CLIMATE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Plants
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="e.g., fern, cedar, maple..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Search by common or scientific name
        </p>
      </div>

      {/* Climate Zone Legend */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Climate Zones</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Coastal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>West Cascades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span>East Cascades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Puget Sound</span>
          </div>
        </div>
      </div>
    </div>
  );
}
