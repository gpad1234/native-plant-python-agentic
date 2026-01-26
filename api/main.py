"""
NW Native Plant Explorer - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import httpx
from datetime import datetime

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
