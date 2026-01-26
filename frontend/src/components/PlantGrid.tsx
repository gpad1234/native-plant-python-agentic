import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { PlantCard } from './PlantCard';
import type { Region, ClimateType } from '../types/api';

interface PlantGridProps {
  region: Region;
  climateType: ClimateType;
  searchTerm: string;
}

export function PlantGrid({ region, climateType, searchTerm }: PlantGridProps) {
  const { data: plants, isLoading, error } = useQuery({
    queryKey: ['plants', region, climateType, searchTerm],
    queryFn: () => apiClient.getPlants({
      region,
      climate_type: climateType,
      taxon: searchTerm || undefined,
      per_page: 50,
    }),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading plants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Plants</h3>
        <p className="text-red-700">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <p className="text-sm text-red-600 mt-2">
          Make sure the backend API is running on http://127.0.0.1:8000
        </p>
      </div>
    );
  }

  if (!plants || plants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600 text-lg">No plants found matching your criteria.</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        Found {plants.length} plant{plants.length !== 1 ? 's' : ''}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </div>
  );
}
