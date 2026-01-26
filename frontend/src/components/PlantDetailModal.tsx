import { useEffect } from 'react';
import type { PlantObservation } from '../types/api';
import { getClimateColor, getClimateLabel } from '../lib/constants';

interface PlantDetailModalProps {
  plant: PlantObservation;
  onClose: () => void;
}

export function PlantDetailModal({ plant, onClose }: PlantDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {plant.common_name || plant.scientific_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        {plant.photo_url && (
          <div className="relative h-96 bg-gray-200">
            <img
              src={plant.photo_url.replace('medium', 'large')}
              alt={plant.common_name || plant.scientific_name}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Names */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Identification</h3>
            <dl className="space-y-2">
              {plant.common_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Common Name</dt>
                  <dd className="text-base text-gray-800">{plant.common_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-600">Scientific Name</dt>
                <dd className="text-base text-gray-800 italic">{plant.scientific_name}</dd>
              </div>
              {plant.taxon_rank && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Rank</dt>
                  <dd className="text-base text-gray-800 capitalize">{plant.taxon_rank}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Location</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-600">Place</dt>
                <dd className="text-base text-gray-800">{plant.place_guess}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Coordinates</dt>
                <dd className="text-base text-gray-800">
                  {plant.latitude.toFixed(4)}°N, {plant.longitude.toFixed(4)}°W
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Climate Zone</dt>
                <dd>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium text-white ${getClimateColor(plant.climate_zone)}`}>
                    {getClimateLabel(plant.climate_zone)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Observation Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Observation</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-600">Date Observed</dt>
                <dd className="text-base text-gray-800">
                  {new Date(plant.observed_on).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Quality Grade</dt>
                <dd className="text-base text-gray-800 capitalize">{plant.quality_grade}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">iNaturalist ID</dt>
                <dd className="text-base text-gray-800">
                  <a
                    href={`https://www.inaturalist.org/observations/${plant.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    View on iNaturalist →
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
