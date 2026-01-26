import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { getClimateColor, getClimateLabel } from '../lib/constants';
import type { Region, ClimateType } from '../types/api';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PlantMapProps {
  region: Region;
  climateType: ClimateType;
  searchTerm: string;
}

// Component to update map view when region changes
function MapUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7);
  }, [center, map]);
  return null;
}

// Regional center points
const REGION_CENTERS: Record<Region, LatLngExpression> = {
  washington: [47.5, -120.5],
  oregon: [43.9, -120.5],
  idaho: [44.0, -114.7],
  california: [40.0, -122.0],
};

export function PlantMap({ region, climateType, searchTerm }: PlantMapProps) {
  const { data: plants, isLoading, error } = useQuery({
    queryKey: ['plants', region, climateType, searchTerm],
    queryFn: () => apiClient.getPlants({
      region,
      climate_type: climateType,
      taxon: searchTerm || undefined,
      per_page: 100, // Get more for map view
    }),
  });

  const center = REGION_CENTERS[region];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Map</h3>
        <p className="text-red-700">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  if (!plants || plants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600 text-lg">No plants found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <p className="text-sm text-gray-600">
          Showing {plants.length} plant observation{plants.length !== 1 ? 's' : ''} on map
        </p>
      </div>

      <div className="h-[600px]">
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapUpdater center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {plants.map((plant) => (
            <Marker
              key={plant.id}
              position={[plant.latitude, plant.longitude]}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  {plant.photo_url && (
                    <img
                      src={plant.photo_url}
                      alt={plant.common_name || plant.scientific_name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {plant.common_name || plant.scientific_name}
                  </h3>
                  {plant.common_name && (
                    <p className="text-sm text-gray-600 italic mb-2">
                      {plant.scientific_name}
                    </p>
                  )}
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${getClimateColor(plant.climate_zone)}`}>
                      {getClimateLabel(plant.climate_zone)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{plant.place_guess}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(plant.observed_on).toLocaleDateString()}
                  </p>
                  <a
                    href={`https://www.inaturalist.org/observations/${plant.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline text-sm mt-2 inline-block"
                  >
                    View on iNaturalist →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
