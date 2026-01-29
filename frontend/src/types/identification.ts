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
