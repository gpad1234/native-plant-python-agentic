import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchPanel } from './components/SearchPanel';
import { PlantGrid } from './components/PlantGrid';
import { PlantMap } from './components/PlantMap';
import type { Region, ClimateType } from './types/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [region, setRegion] = useState<Region>('washington');
  const [climateType, setClimateType] = useState<ClimateType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-green-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-2">🌲 NW Native Plant Explorer</h1>
            <p className="text-green-100">
              Discover native plants of the Pacific Northwest
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search Panel */}
            <aside className="lg:col-span-1">
              <SearchPanel
                region={region}
                climateType={climateType}
                searchTerm={searchTerm}
                onRegionChange={setRegion}
                onClimateTypeChange={setClimateType}
                onSearchTermChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </aside>

            {/* Results Area */}
            <section className="lg:col-span-3">
              {viewMode === 'grid' ? (
                <PlantGrid
                  region={region}
                  climateType={climateType}
                  searchTerm={searchTerm}
                />
              ) : (
                <PlantMap
                  region={region}
                  climateType={climateType}
                  searchTerm={searchTerm}
                />
              )}
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 mt-12 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              Data from{' '}
              <a
                href="https://www.inaturalist.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300"
              >
                iNaturalist
              </a>
              {' • '}
              Built for gardeners, landscapers, and plant enthusiasts
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
