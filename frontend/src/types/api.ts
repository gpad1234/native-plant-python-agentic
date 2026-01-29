export interface PlantObservation {
  id: number;
  scientific_name: string;
  common_name: string | null;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  observed_on: string;
  place_guess: string;
  climate_zone: string;
  quality_grade: string;
  taxon_rank: string | null;
}

export interface RegionalStats {
  regions: Record<string, { total_observations: number; place_id: number }>;
  total_pnw: number;
  timestamp: string;
}

export type Region = 'washington' | 'oregon' | 'idaho' | 'california';

export type ClimateType = 'all' | 'coastal' | 'cascade-west' | 'cascade-east' | 'puget-sound';

export interface PlantQueryParams {
  region: Region;
  climate_type?: ClimateType;
  taxon?: string;
  per_page?: number;
}

export interface PlantIdentificationMatch {
  scientific_name: string;
  common_name: string | null;
  confidence: number;
  description?: string;
  is_native: boolean;
  taxon_id?: number;
}

export interface PlantIdentificationResult {
  results: PlantIdentificationMatch[];
  processing_time?: number;
}
