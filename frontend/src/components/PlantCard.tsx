import { useState } from 'react';
import type { PlantObservation } from '../types/api';
import { getClimateColor, getClimateLabel } from '../lib/constants';
import { PlantDetailModal } from './PlantDetailModal';

interface PlantCardProps {
  plant: PlantObservation;
}

export function PlantCard({ plant }: PlantCardProps) {
  const [showModal, setShowModal] = useState(false);

  const displayName = plant.common_name || plant.scientific_name;
  const secondaryName = plant.common_name ? plant.scientific_name : null;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
      >
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Climate Zone Badge */}
          <div className="absolute top-2 right-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getClimateColor(plant.climate_zone)}`}>
              {getClimateLabel(plant.climate_zone)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">
            {displayName}
          </h3>
          
          {secondaryName && (
            <p className="text-sm text-gray-600 italic mb-2 line-clamp-1">
              {secondaryName}
            </p>
          )}

          <div className="flex items-start gap-1 text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="line-clamp-2">{plant.place_guess}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Observed {new Date(plant.observed_on).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {showModal && (
        <PlantDetailModal
          plant={plant}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
