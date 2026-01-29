import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/api';

interface VisionTabProps {
  onClose: () => void;
}

interface IdentificationResult {
  scientific_name: string;
  common_name: string;
  confidence: number;
  description: string;
  is_native: boolean;
}

export function VisionTab({ onClose }: VisionTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<IdentificationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setError(null);
      setResults(null);
    };
    reader.readAsDataURL(file);

    // Identify plant
    await identifyPlant(file);
  };

  const identifyPlant = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.identifyPlant(file);
      setResults(result.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to identify plant');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📸 Plant Vision
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload a photo to identify native plants
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          {!selectedImage && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Camera size={64} className="mx-auto text-gray-400 mb-4" />
              
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Upload Plant Photo
              </h3>
              <p className="text-gray-500 mb-6">
                Take or upload a photo of a plant for identification
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload size={20} />
                  Choose Photo
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Supports JPG, PNG, WebP • Max 10MB
              </p>
            </div>
          )}

          {/* Image Preview and Results */}
          {selectedImage && (
            <div className="space-y-6">
              {/* Image */}
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Plant to identify"
                  className="w-full h-auto max-h-96 object-contain rounded-lg border"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-8">
                  <Loader2 size={48} className="mx-auto text-green-600 animate-spin mb-4" />
                  <p className="text-gray-600">Analyzing plant photo...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Using LLaVA-Next vision model
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}

              {/* Results */}
              {results && results.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Identification Results
                  </h3>
                  
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {result.scientific_name}
                          </h4>
                          {result.common_name && (
                            <p className="text-sm text-gray-600">
                              {result.common_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {Math.round(result.confidence * 100)}% confident
                          </span>
                          {result.is_native && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              PNW Native
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mt-3 whitespace-pre-wrap">
                        {result.description}
                      </p>
                    </div>
                  ))}

                  <button
                    onClick={handleReset}
                    className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    Identify Another Plant
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
