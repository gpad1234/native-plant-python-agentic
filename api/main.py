"""
NW Native Plant Explorer - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, Query, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import httpx
from datetime import datetime
import io
from PIL import Image
import replicate
import os
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="NW Native Plant Explorer API",
    description="API for discovering native plants in the Pacific Northwest using iNaturalist data",
    version="0.1.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
INATURALIST_API_BASE = "https://api.inaturalist.org/v1"
PLACE_IDS = {
    "washington": 14,
    "oregon": 41,
    "idaho": 42,
    "california": 43
}

# Pydantic models
class PlantObservation(BaseModel):
    """Model for a single plant observation"""
    id: int = Field(description="iNaturalist observation ID")
    scientific_name: str = Field(description="Scientific name (e.g., Pseudotsuga menziesii)")
    common_name: Optional[str] = Field(None, description="Common name (e.g., Douglas Fir)")
    photo_url: Optional[str] = Field(None, description="URL to observation photo")
    latitude: float = Field(description="Latitude coordinate")
    longitude: float = Field(description="Longitude coordinate")
    observed_on: str = Field(description="Observation date (YYYY-MM-DD)")
    place_guess: str = Field(description="Human-readable location description")
    climate_zone: str = Field(description="Classified climate zone based on coordinates")
    quality_grade: str = Field(description="Observation quality: research, needs_id, or casual")
    taxon_rank: Optional[str] = Field(None, description="Taxonomic rank: species, genus, etc.")


class ErrorResponse(BaseModel):
    """Error response model"""
    detail: str
    status_code: int


class PlantIdentificationMatch(BaseModel):
    """Model for a single plant identification match"""
    scientific_name: str = Field(description="Scientific name of the plant")
    common_name: Optional[str] = Field(None, description="Common name of the plant")
    confidence: float = Field(description="Confidence score (0-1)")
    description: Optional[str] = Field(None, description="Brief description")
    is_native: bool = Field(False, description="Whether plant is native to PNW")
    taxon_id: Optional[int] = Field(None, description="iNaturalist taxon ID")


class PlantIdentificationResult(BaseModel):
    """Model for plant identification response"""
    results: List[PlantIdentificationMatch] = Field(description="List of identification matches")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")


def determine_climate_zone(lon: float, lat: float) -> str:
    """
    Classify climate zone based on Cascade Range position and latitude
    
    Args:
        lon: Longitude coordinate
        lat: Latitude coordinate
        
    Returns:
        Climate zone classification string
    """
    # East of Cascade Range (rain shadow)
    if lon > -121.0:
        return "East Cascades (Dry/Rain Shadow)"
    
    # West of Cascades - further classification
    # Puget Sound lowlands
    if lat > 47.0 and lon < -122.0:
        return "Puget Sound Lowlands"
    
    # Coastal region
    if lat < 45.0 and lon < -123.0:
        return "Coastal"
    
    # Default to west Cascades
    return "West Cascades (Wet)"


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "NW Native Plant Explorer API",
        "version": "0.1.0",
        "description": "Discover native plants of the Pacific Northwest",
        "endpoints": {
            "/api/plants": "Query plant observations by region and filters",
            "/api/health": "Health check endpoint",
            "/docs": "Interactive API documentation"
        },
        "data_source": "iNaturalist API (api.inaturalist.org)"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "nw-native-plant-api"
    }


@app.get("/api/plants", response_model=List[PlantObservation], tags=["Plants"])
async def get_plants(
    region: str = Query(
        "washington",
        enum=["washington", "oregon", "idaho", "california"],
        description="Pacific Northwest state/region"
    ),
    climate_type: str = Query(
        "all",
        enum=["all", "coastal", "cascade-west", "cascade-east", "puget-sound"],
        description="Filter by climate zone"
    ),
    taxon: Optional[str] = Query(
        None,
        description="Search by common name or scientific name (e.g., 'fern' or 'Polystichum')"
    ),
    per_page: int = Query(
        50,
        ge=1,
        le=200,
        description="Number of results to return (max 200)"
    )
):
    """
    Query native plant observations from iNaturalist
    
    Returns plant observations filtered by region, climate zone, and optional search term.
    All observations are research-grade and marked as native to the region.
    """
    
    # Build query parameters for iNaturalist API
    params = {
        "place_id": PLACE_IDS[region],
        "taxon_id": 47126,  # Plantae (Plants)
        "quality_grade": "research",
        "native": True,
        "per_page": per_page,
        "order": "desc",
        "order_by": "created_at"
    }
    
    # Add taxon search if provided
    if taxon:
        params["q"] = taxon
    
    try:
        # Query iNaturalist API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{INATURALIST_API_BASE}/observations",
                params=params
            )
            response.raise_for_status()
            
        data = response.json()
        observations = data.get("results", [])
        
        # Parse and enrich observations
        plant_observations = []
        
        for obs in observations:
            # Extract location
            location_str = obs.get("location")
            if not location_str:
                continue
                
            try:
                lat, lon = map(float, location_str.split(","))
            except (ValueError, AttributeError):
                continue
            
            # Determine climate zone
            climate_zone = determine_climate_zone(lon, lat)
            
            # Apply climate filter if specified
            if climate_type != "all":
                zone_filter_map = {
                    "coastal": "Coastal",
                    "cascade-west": "West Cascades",
                    "cascade-east": "East Cascades",
                    "puget-sound": "Puget Sound"
                }
                if zone_filter_map.get(climate_type, "") not in climate_zone:
                    continue
            
            # Extract taxon information
            taxon_data = obs.get("taxon", {})
            scientific_name = taxon_data.get("name", "Unknown")
            common_name = taxon_data.get("preferred_common_name")
            taxon_rank = taxon_data.get("rank")
            
            # Extract photo URL (use medium size)
            photos = obs.get("photos", [])
            photo_url = None
            if photos:
                photo_url = photos[0].get("url", "").replace("square", "medium")
            
            # Create observation object
            plant_obs = PlantObservation(
                id=obs.get("id"),
                scientific_name=scientific_name,
                common_name=common_name,
                photo_url=photo_url,
                latitude=lat,
                longitude=lon,
                observed_on=obs.get("observed_on", ""),
                place_guess=obs.get("place_guess", ""),
                climate_zone=climate_zone,
                quality_grade=obs.get("quality_grade", ""),
                taxon_rank=taxon_rank
            )
            
            plant_observations.append(plant_obs)
        
        return plant_observations
        
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"iNaturalist API error: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to iNaturalist API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/stats", tags=["Statistics"])
async def get_statistics():
    """
    Get statistics about available plant observations across PNW regions
    """
    stats = {}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for region_name, place_id in PLACE_IDS.items():
                response = await client.get(
                    f"{INATURALIST_API_BASE}/observations",
                    params={
                        "place_id": place_id,
                        "taxon_id": 47126,
                        "quality_grade": "research",
                        "native": True,
                        "per_page": 1
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    stats[region_name] = {
                        "total_observations": data.get("total_results", 0),
                        "place_id": place_id
                    }
        
        # Calculate total
        total = sum(region["total_observations"] for region in stats.values())
        stats["total_pnw"] = total
        
        return {
            "regions": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch statistics: {str(e)}"
        )


@app.post("/api/identify", response_model=PlantIdentificationResult, tags=["Identification"])
async def identify_plant(
    image: UploadFile = File(..., description="Plant image to identify")
):
    """
    Identify a plant from an uploaded image (PROTOTYPE/MOCK)
    
    This is a prototype implementation that returns mock data.
    In production, this would integrate with:
    - iNaturalist Computer Vision API
    - Google Cloud Vision API
    - Custom ML model
    - LLM-based identification
    """
    start_time = datetime.utcnow()
    
    try:
        # Validate image
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and validate image data
        contents = await image.read()
        try:
            img = Image.open(io.BytesIO(contents))
            img.verify()  # Verify it's a valid image
            img = Image.open(io.BytesIO(contents))  # Re-open after verify
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Convert image to base64 for Replicate API
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()
        img_base64 = base64.b64encode(img_byte_arr).decode('utf-8')
        data_uri = f"data:image/jpeg;base64,{img_base64}"
        
        # Call LLaVA-Next vision model via Replicate
        prompt = """Analyze this plant photo and identify the species.

Focus on:
- Leaf shape, arrangement, and margins
- Flower/fruit characteristics if visible
- Growth form (tree, shrub, forb, grass)
- Bark texture if applicable

Provide:
1. Most likely species (scientific name)
2. Common name(s)
3. Confidence level (0-100%)
4. Key identifying features you observed
5. Alternative possibilities if uncertain

Only suggest species native to the Pacific Northwest (Washington, Oregon, Idaho, Northern California).
If not a PNW native plant, indicate that clearly.
Format as JSON with keys: species, common_name, confidence, features, alternatives, is_native"""
        
        try:
            # Load API token from environment
            api_token = os.getenv('REPLICATE_API_TOKEN')
            if not api_token or api_token == 'your_replicate_api_token_here':
                raise ValueError("REPLICATE_API_TOKEN not set or invalid")
            
            # Run LLaVA model (using stable 13B version)
            output = replicate.run(
                "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb",
                input={
                    "image": data_uri,
                    "prompt": prompt,
                    "max_tokens": 1024,
                    "temperature": 0.2
                }
            )
            
            # Parse model response - output is a generator, consume it
            response_text = "".join(str(chunk) for chunk in output)
            
            # Try to parse JSON response from model
            import json
            import re
            
            try:
                # Extract JSON from response (may have extra text)
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    plant_data = json.loads(json_match.group())
                    
                    # Parse confidence (handle "90%" or 90 or 0.9)
                    conf_str = str(plant_data.get('confidence', '75'))
                    conf_value = float(re.search(r'\d+', conf_str).group()) / 100 if '%' in conf_str else float(conf_str)
                    if conf_value > 1.0:
                        conf_value = conf_value / 100
                    
                    # Build features description
                    features = plant_data.get('features', [])
                    features_text = '\n'.join(f"• {f}" for f in features) if features else "No specific features listed"
                    
                    # Create primary result
                    results = [
                        PlantIdentificationMatch(
                            scientific_name=plant_data.get('species', 'Unknown'),
                            common_name=plant_data.get('common_name', 'Unknown'),
                            confidence=conf_value,
                            description=features_text,
                            is_native=str(plant_data.get('is_native', 'Unknown')).lower() in ['yes', 'true'],
                            taxon_id=0
                        )
                    ]
                    
                    # Add alternatives if present
                    alternatives = plant_data.get('alternatives', [])
                    for alt in alternatives[:2]:  # Limit to 2 alternatives
                        results.append(
                            PlantIdentificationMatch(
                                scientific_name=alt,
                                common_name="Alternative match",
                                confidence=conf_value * 0.7,  # Lower confidence for alternatives
                                description="Alternative identification possibility",
                                is_native=True,
                                taxon_id=0
                            )
                        )
                else:
                    # No JSON found, use raw text
                    results = [
                        PlantIdentificationMatch(
                            scientific_name="Vision Model Analysis",
                            common_name="Analysis Result",
                            confidence=0.75,
                            description=response_text[:500] if response_text else "No description available",
                            is_native=True,
                            taxon_id=0
                        )
                    ]
            except Exception as parse_error:
                print(f"JSON parse error: {parse_error}")
                # Fallback to raw text
                results = [
                    PlantIdentificationMatch(
                        scientific_name="Vision Model Analysis",
                        common_name="Analysis Result",
                        confidence=0.75,
                        description=response_text[:500] if response_text else "No description available",
                        is_native=True,
                        taxon_id=0
                    )
                ]
            
        except Exception as e:
            # Fallback to mock data if API fails (billing not active, quota exceeded, etc.)
            import traceback
            error_details = traceback.format_exc()
            print(f"Vision model error (using mock data): {error_details}")
            
            # Return mock identification results
            results = [
                PlantIdentificationMatch(
                    scientific_name="Pseudotsuga menziesii",
                    common_name="Douglas Fir",
                    confidence=0.85,
                    description="Tall coniferous tree with distinctive drooping cones and flat needles. Bark is thick and deeply furrowed.",
                    is_native=True,
                    taxon_id=47375
                ),
                PlantIdentificationMatch(
                    scientific_name="Thuja plicata",
                    common_name="Western Red Cedar",
                    confidence=0.72,
                    description="Large evergreen tree with scale-like leaves and fibrous reddish bark. Commonly found in moist forests.",
                    is_native=True,
                    taxon_id=135773
                )
            ]
        
        end_time = datetime.utcnow()
        processing_time = (end_time - start_time).total_seconds()
        
        return PlantIdentificationResult(
            results=results,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process image: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
