# Plant Identification Feature

## Overview
The Plant Identification feature allows users to upload or capture photos of plants to receive AI-powered identification results. This is a prototype implementation with mock data that can be enhanced with real ML models or APIs.

## Features

### 🖼️ Image Upload
- Drag and drop or click to upload plant photos
- Supports all common image formats (JPEG, PNG, WebP, etc.)
- Client-side image preview before identification

### 📸 Camera Capture
- Direct camera access for real-time photo capture
- Uses device's rear camera (if available)
- Instant capture and identification

### 🔍 Identification Results
- Multiple identification matches with confidence scores
- Common and scientific names
- Brief plant descriptions
- Native species indicator (Pacific Northwest specific)
- Sorted by confidence level

## User Interface

### Navigation
Access the identification feature via the "🔍 Identify Plant" tab in the header navigation.

### Workflow
1. **Choose Input Method**
   - Upload an existing photo
   - Use camera to capture new photo

2. **Review Preview**
   - View selected/captured image
   - Option to cancel and retry

3. **Identify**
   - Click "Identify Plant" button
   - System processes image (mock: instant)
   - Shows loading state during processing

4. **View Results**
   - Multiple matches displayed with confidence percentages
   - Native species badge for PNW plants
   - Detailed information for each match

5. **Retry**
   - "Identify Another Plant" button to start over

## Technical Architecture

### Frontend Components

#### PlantIdentifier.tsx
Main component handling:
- Image upload via file input
- Camera stream management
- Photo capture from video stream
- API communication
- Results display

**Key Features:**
- React hooks for state management
- React Query for API mutations
- Canvas API for photo capture
- MediaDevices API for camera access

#### Types
- `PlantIdentificationMatch`: Single identification result
- `PlantIdentificationResult`: Complete API response

### Backend API

#### Endpoint: `POST /api/identify`

**Request:**
- Multipart form data with image file
- Accepts any image format

**Response:**
```json
{
  "results": [
    {
      "scientific_name": "Pseudotsuga menziesii",
      "common_name": "Douglas Fir",
      "confidence": 0.89,
      "description": "Tall evergreen conifer...",
      "is_native": true,
      "taxon_id": 48933
    }
  ],
  "processing_time": 0.123
}
```

**Current Implementation:**
- Mock data responses (3 sample results)
- Image validation only
- Fast response time

## Future Enhancements

### Real ML Integration Options

#### 1. iNaturalist Computer Vision API
```python
# Integration with iNaturalist
async def identify_with_inaturalist(image_data: bytes):
    url = "https://api.inaturalist.org/v1/computervision/score_image"
    response = await client.post(url, files={"image": image_data})
    return parse_results(response.json())
```

#### 2. Google Cloud Vision API
```python
from google.cloud import vision

def identify_with_gcv(image_data: bytes):
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_data)
    response = client.label_detection(image=image)
    return parse_labels(response.label_annotations)
```

#### 3. Custom ML Model
- Train on PNW-specific plant dataset
- Deploy with TensorFlow Serving or ONNX Runtime
- Optimize for native species recognition

#### 4. LLM-Enhanced Identification
```python
# Combine CV API with LLM for better descriptions
async def identify_with_llm(image_data: bytes):
    # Step 1: Get CV API results
    cv_results = await cv_api.identify(image_data)
    
    # Step 2: Enhance with LLM
    prompt = f"Provide gardening advice for {cv_results[0].name}"
    enhanced = await llm.complete(prompt)
    
    return merge_results(cv_results, enhanced)
```

### UI Enhancements

1. **History/Gallery**
   - Save identification history
   - Review past identifications
   - Export results

2. **Detailed Plant Pages**
   - Click result to see full plant profile
   - Care instructions
   - Companion plants
   - Similar species

3. **Batch Upload**
   - Identify multiple plants at once
   - Gallery view of results

4. **Location-Aware**
   - Use GPS to refine results
   - Show plants common in user's area
   - Regional recommendations

5. **Feedback Loop**
   - Users can confirm/correct identifications
   - Improve model accuracy over time

### Performance Optimizations

1. **Image Optimization**
   - Resize images client-side before upload
   - Compress to reduce bandwidth
   - WebP format support

2. **Caching**
   - Cache frequent identifications
   - Redis for result storage
   - CDN for static plant data

3. **Progressive Loading**
   - Show top match immediately
   - Load additional matches progressively

## Testing

### Manual Testing
1. Start backend: `uvicorn api.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to "Identify Plant" tab
4. Upload test images or use camera
5. Verify results display correctly

### Test Images
Create a test suite with:
- Native PNW plants (ferns, conifers, wildflowers)
- Non-native species
- Poor quality images
- Edge cases (non-plant images)

### API Testing
```bash
# Test with cURL
curl -X POST "http://localhost:8000/api/identify" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test_plant.jpg"
```

## Dependencies

### Backend
- `Pillow`: Image processing and validation
- `python-multipart`: File upload handling
- Future: ML libraries (tensorflow, torch, etc.)

### Frontend
- `@tanstack/react-query`: API state management
- Browser APIs: MediaDevices, Canvas, FileReader

## Deployment Considerations

1. **File Size Limits**
   - Set reasonable max file size (5-10MB)
   - Handle errors gracefully

2. **Rate Limiting**
   - Prevent API abuse
   - Queue system for heavy load

3. **Privacy**
   - Don't store uploaded images without consent
   - GDPR/privacy policy compliance

4. **Mobile Optimization**
   - Responsive camera interface
   - Touch-friendly controls
   - Bandwidth considerations

## Related Documentation
- [LLM Integration Proposal](LLM_INTEGRATION_PROPOSAL.md)
- [API Documentation](http://localhost:8000/docs)
- [Frontend README](frontend/README.md)
