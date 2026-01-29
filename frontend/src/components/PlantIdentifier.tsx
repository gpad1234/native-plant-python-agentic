import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { identifyPlant } from '../lib/api';
import type { PlantIdentificationResult } from '../types/api';

export function PlantIdentifier() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const identifyMutation = useMutation({
    mutationFn: (file: File) => identifyPlant(file),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setUseCamera(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setUseCamera(true);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', {
              type: 'image/jpeg',
            });
            setImageFile(file);
            setSelectedImage(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleIdentify = () => {
    if (imageFile) {
      identifyMutation.mutate(imageFile);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setImageFile(null);
    stopCamera();
    identifyMutation.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 Plant Identification
        </h2>
        <p className="text-gray-600">
          Upload or capture a photo to identify native plants
        </p>
      </div>

      {/* Upload Options */}
      {!selectedImage && !useCamera && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-lg font-medium text-gray-700 mb-2">
                Click to upload a photo
              </span>
              <span className="text-sm text-gray-500">
                or drag and drop
              </span>
            </label>
          </div>

          <div className="flex items-center justify-center">
            <span className="px-4 text-gray-500">or</span>
          </div>

          <button
            onClick={startCamera}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Use Camera
          </button>
        </div>
      )}

      {/* Camera View */}
      {useCamera && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={capturePhoto}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview and Identify */}
      {selectedImage && !identifyMutation.data && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt="Selected plant"
              className="w-full h-auto max-h-96 object-contain bg-gray-100"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleIdentify}
              disabled={identifyMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {identifyMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Identifying...
                </>
              ) : (
                'Identify Plant'
              )}
            </button>
            <button
              onClick={reset}
              disabled={identifyMutation.isPending}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {identifyMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-800 font-medium">
            Failed to identify plant
          </p>
          <p className="text-red-600 text-sm mt-1">
            {identifyMutation.error instanceof Error
              ? identifyMutation.error.message
              : 'Please try again with a different image'}
          </p>
        </div>
      )}

      {identifyMutation.data && (
        <div className="space-y-4 mt-4">
          {/* Selected Image */}
          {selectedImage && (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt="Identified plant"
                className="w-full h-auto max-h-64 object-contain bg-gray-100"
              />
            </div>
          )}

          {/* Results List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">
              Identification Results:
            </h3>
            {identifyMutation.data.results.map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {result.common_name || result.scientific_name}
                    </h4>
                    {result.common_name && (
                      <p className="text-sm text-gray-600 italic">
                        {result.scientific_name}
                      </p>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {Math.round(result.confidence * 100)}% match
                  </span>
                </div>
                
                {result.description && (
                  <p className="text-sm text-gray-700 mt-2">
                    {result.description}
                  </p>
                )}

                {result.is_native && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Native to Pacific Northwest
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Identify Another Plant
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
