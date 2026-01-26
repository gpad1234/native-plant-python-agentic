Python agentic web scraping uses AI, often Large Language Models (LLMs), with frameworks like ScrapeGraphAI (https://github.com/ScrapeGraphAI/Scrapegraph-ai) or LangChain, to create intelligent agents that understand natural language requests (e.g., "get prices") to autonomously navigate websites, perform complex actions (logins, clicks, form fills), and extract structured data, overcoming limitations of traditional rule-based scraping for dynamic sites. These agents can adapt to changing site structures, making data extraction more flexible and reliable, though ethical/legal concerns about terms of service (T&Cs) remain important. [1, 2, 3, 4, 5, 6, 7]  
Key Concepts & Tools 

• Orchestrator/Brain: An LLM framework (LangChain, LangGraph) that breaks down goals into steps, manages workflows, and processes outputs. 
• LLMs: Understand natural language prompts and guide the agent's actions. 
• Scraping Libraries: 

	• ScrapeGraphAI: A Python library using LLMs and graph logic for AI-driven scraping, taking simple English commands. 
	• Scrapy: Integrates with LLMs for scalable agent-based crawling. 
	• BeautifulSoup/Selenium: Foundational tools often used within agent frameworks for parsing and browser automation. 

• PydanticAI: Framework for defining data models and building agents with LLMs to extract structured data. [1, 2, 3, 6, 8, 9, 10, 11, 12]  

How it Works (Simplified) 

1. Input: User provides a goal (e.g., "Find the price and description of laptops on this page") in natural language. 
2. Planning: The LLM orchestrator breaks this into steps: navigate, find product links, visit each link, extract data. 
3. Action: The agent uses tools (Selenium for browser, Scrapy for crawling) to perform actions like clicking, scrolling, filling forms. 
4. Extraction: LLMs analyze page content (HTML, text) to identify and extract specific data points. 
5. Output: Data is returned in a structured format (like JSON). [1, 2, 3, 4, 6, 9, 10, 12]  

Advantages 

• Flexibility: Adapts to complex and changing website layouts. 
• Simplicity: Less need for complex CSS selectors/XPath; users describe what they want. 
• Automation: Handles multi-step processes and logins. [1, 2, 3, 4, 5, 12]  

Considerations 

• Legality/Ethics: Must respect website Terms of Service (T&Cs) and robots.txt; risk of getting blocked. 
• Reliability: Requires robust guardrails and ongoing engineering to maintain quality as sites change. [5, 7, 13]  

AI responses may include mistakes.

[1] https://www.youtube.com/watch?v=zDqAZOiPX_M
[2] https://scrapegraphai.com/blog/ai-web-scraping
[3] https://github.com/ScrapeGraphAI/Scrapegraph-ai
[4] https://docs.scrapegraphai.com/services/agenticscraper
[5] https://www.zyte.com/blog/agentic-web-scraping/
[6] https://www.capsolver.com/blog/web-scraping/make-ai-agent
[7] https://www.reddit.com/r/aiagents/comments/1khtnad/currently_whats_the_best_ai_agentic_workflow_for/
[8] https://www.gptbots.ai/blog/web-scraping-ai-agents
[9] https://www.youtube.com/watch?v=7tXSk31d9X0
[10] https://www.bardeen.ai/answers/how-to-scrape-data-from-a-web-page
[11] https://www.youtube.com/watch?v=Oo8-nEuDBkk
[12] https://sodevelopment.medium.com/autonomous-web-scraping-the-future-of-data-collection-with-ai-661f313666e1?source=rss------artificial_intelligence-5
[13] https://www.lindy.ai/apps/ai-web-extraction-agent
## Project Idea: Native Plants of Northwest US

### Project Summary (Updated: January 20, 2026)

**Goal**: Build an intelligent web application to help gardeners, landscapers, and ecologists discover native plants suited to Pacific Northwest microclimates using agentic web scraping and public APIs.

**Progress**:
1. ✅ Surveyed existing public APIs (iNaturalist, USDA PLANTS, GBIF, Calflora, weather APIs)
2. ✅ Documented Pacific Northwest climate characteristics (marine west coast, rain shadow effect, microclimates)
3. ✅ Created 9-week full project roadmap integrating APIs with climate zones
4. ✅ Designed 2-week pilot MVP focusing on iNaturalist API + interactive UI

**Current Phase**: Planning complete, ready for implementation

**Next Actions**:
- Set up Python virtual environment for backend
- Initialize FastAPI project with iNaturalist integration
- Build React frontend with map and search features
- Deploy pilot for stakeholder review

---

### Setup
Use Python virtual environment to isolate dependencies:
```bash
python3 -m venv venv
source venv/bin/activate  # On Linux/Mac
pip install scrapegraph-ai beautifulsoup4 selenium langchain pydantic
```

### Objective
Build an agentic web scraper to collect and organize information about native plants in the Pacific Northwest (Washington, Oregon, Idaho, Northern California).

### Data to Extract
• Plant common name and scientific name
• Native regions (specific to NW states/counties)
• Growth habits (tree, shrub, perennial, annual)
• Height and spread ranges
• Bloom time and flower colors
• Wildlife value (pollinators, birds, etc.)
• Growing conditions (sun, water, soil requirements)
• USDA hardiness zones
• Conservation status

### Target Websites
• USDA PLANTS Database (plants.usda.gov)
• Native Plant Society chapters (WA, OR, ID, CA)
• Burke Museum Herbarium (Washington)
• Oregon Flora Project
• Calflora (Northern California)
• Local botanical gardens and arboretums

### Implementation Approach
```python
from scrapegraph_ai import SmartScraperGraph

# Example prompt for the agent
prompt = """
Extract information about native plants in the Pacific Northwest including:
- Common and scientific names
- Native range within WA, OR, ID, Northern CA
- Plant characteristics (height, bloom time, color)
- Habitat requirements (sun, water, soil)
- Wildlife benefits
"""

# Configure the scraper with LLM
graph_config = {
    "llm": {"model": "gpt-4o-mini"},
    "verbose": True
}

# Let the agent navigate and extract
scraper = SmartScraperGraph(
    prompt=prompt,
    source="https://plants.usda.gov",
    config=graph_config
)

result = scraper.run()
```

### Use Cases
• Create a native plant database for regional landscaping
• Identify plants suitable for specific microclimates
• Support wildlife habitat restoration projects
• Educational resource for local gardeners
• Track endangered/threatened native species

---

## Existing APIs & Data Sources Survey

### Public APIs Available

#### 1. **USDA PLANTS Database API**
- **URL**: https://plants.usda.gov/home/plantProfile
- **Access**: Public, no API key required for basic queries
- **Data**: Scientific names, common names, distribution by state/county, characteristics
- **Limitations**: No official REST API; requires web scraping or parsing plant profile pages
- **Coverage**: Comprehensive US native plant data with state-level distribution

#### 2. **iNaturalist API**
- **URL**: https://api.inaturalist.org/v1/
- **Access**: Open API, rate limited (100 requests/minute)
- **Endpoints**: 
  - `/observations` - geotagged plant observations
  - `/taxa` - taxonomic information
  - `/places` - geographic regions
- **Relevance**: Real-world observation data from Pacific Northwest with photos, dates, locations
- **Climate Context**: Observations include phenology data (bloom times, fruiting) specific to local microclimates

#### 3. **GBIF (Global Biodiversity Information Facility) API**
- **URL**: https://www.gbif.org/developer/summary
- **Access**: Free, requires registration for API key
- **Data**: Occurrence records, specimen data from herbaria, taxonomic backbone
- **NW Relevance**: Burke Museum, Oregon State herbarium records included
- **Climate Data**: Linked to climate zones and elevation data

#### 4. **Calflora API**
- **URL**: https://www.calflora.org/app/about (limited public API)
- **Access**: Restricted; requires permission for bulk data
- **Data**: California native plants with detailed county distributions
- **Relevance**: Northern California overlaps with Pacific Northwest bioregion

#### 5. **Open Tree of Life API**
- **URL**: https://github.com/OpenTreeOfLife/germinator/wiki/Open-Tree-of-Life-Web-APIs
- **Access**: Public REST API
- **Data**: Phylogenetic relationships, taxonomic synonyms
- **Use**: Resolve plant name variations and taxonomic changes

#### 6. **Weather/Climate APIs (Context Data)**
- **NOAA Climate Data API**: Historical climate data by region
- **USDA Plant Hardiness Zone API**: Zone data for specific coordinates
- **PRISM Climate Group**: High-resolution climate data for Pacific Northwest

### Northwest Climate Characteristics & API Integration

#### Unique Climate Features
1. **Marine West Coast Climate (Oceanic)**
   - Cool, wet winters; mild, dry summers
   - High precipitation (40-100+ inches annually west of Cascades)
   - Hardiness Zones 7-9 in lowlands, 4-6 in mountains
   - Long growing season (200-250 days near coast)

2. **Rain Shadow Effect**
   - Dramatic difference east vs. west of Cascade Range
   - Western: temperate rainforest conditions
   - Eastern: semi-arid, continental climate (10-15 inches annual precipitation)

3. **Microclimates**
   - Coastal fog belt (Zone 9, frost-free)
   - Puget Sound convergence zone (extra precipitation)
   - Columbia River Gorge (unique wind patterns)
   - Alpine/subalpine zones (short growing season)

#### Relating APIs to Climate Context

**Integration Strategy:**
```python
# Combine plant occurrence data with climate zones
import requests

# 1. Get plant occurrences from iNaturalist for Pacific NW
inaturalist_params = {
    'taxon_id': 47126,  # Plantae
    'place_id': [14, 41, 42, 43],  # WA, OR, ID, CA
    'quality_grade': 'research',
    'geoprivacy': 'open'
}

# 2. Cross-reference with USDA Hardiness Zones
# Filter plants by zone compatibility (7-9 western, 4-6 mountain, 5-8 eastern)

# 3. Add phenology data
# Extract bloom times from observations → seasonal patterns
# Link to NOAA climate data for precipitation/temperature correlates

# 4. Identify rain shadow adaptations
west_cascade_plants = filter_by_longitude(plants, '<-121.0')  # High moisture
east_cascade_plants = filter_by_longitude(plants, '>-121.0')  # Drought-tolerant
```

### Project Work Plan

#### Phase 1: API Integration & Data Collection (Weeks 1-2)
- [ ] Set up Python venv with required packages
- [ ] Register for API keys (GBIF, iNaturalist)
- [ ] Test API endpoints for each data source
- [ ] Build data models with Pydantic for plant records
- [ ] Create ETL pipeline to combine multiple sources
- [ ] Validate data quality (taxonomic consistency, geographic accuracy)

#### Phase 2: Climate Zone Mapping (Week 3)
- [ ] Integrate USDA Hardiness Zone data by coordinates
- [ ] Map Cascade Range boundary (longitude ~-121°)
- [ ] Create climate region classifications:
  - Coastal (west of Coast Range)
  - Willamette Valley / Puget Sound
  - West Cascades (windward)
  - East Cascades (leeward/rain shadow)
  - High desert / Columbia Plateau
- [ ] Add precipitation and temperature ranges to plant records
- [ ] Identify drought-tolerant vs. moisture-loving species

#### Phase 3: Agentic Scraper Development (Weeks 4-5)
- [ ] Build ScrapeGraphAI agents for sources without APIs:
  - Native Plant Society websites (chapter species lists)
  - Oregon Flora Project (detailed species pages)
  - Local botanical garden plant inventories
- [ ] Implement LLM prompts to extract:
  - Cultivation requirements specific to NW climate
  - Recommended planting locations (sun/shade, wet/dry)
  - Native American traditional uses
  - Restoration project suitability
- [ ] Create validation rules (cross-check scientific names with GBIF)
- [ ] Handle pagination and dynamic content

#### Phase 4: Database Design & Storage (Week 6)
- [ ] Design schema for unified plant database:
  - Core botanical data (taxonomy, morphology)
  - Geographic distribution (county-level for 4 states)
  - Climate preferences (zones, moisture, sun)
  - Phenology (bloom/fruit timing by region)
  - Ecological relationships (pollinators, wildlife)
  - Conservation status
- [ ] Choose database (PostgreSQL with PostGIS for spatial queries)
- [ ] Implement data deduplication logic
- [ ] Create indexes for common queries (zone, region, plant type)

#### Phase 5: Analysis & Insights (Weeks 7-8)
- [ ] Generate reports:
  - Top 50 plants by climate zone
  - Drought-tolerant species for east of Cascades
  - Rain garden species for western lowlands
  - Wildlife value ranking (pollinator support)
  - Endangered/threatened species requiring protection
- [ ] Create visualization dashboards
- [ ] Build query interface for gardeners/landscapers
- [ ] Export data to common formats (CSV, JSON, GeoJSON)

#### Phase 6: Documentation & Deployment (Week 9)
- [ ] Write API documentation for data access
- [ ] Create user guide for querying plant database
- [ ] Document data sources and update frequency
- [ ] Set up automated refresh pipeline
- [ ] Deploy web interface (optional: FastAPI + React)

### Success Metrics
- **Coverage**: 500+ native plant species documented
- **Geographic Accuracy**: County-level distribution for all 4 states
- **Climate Integration**: All plants tagged with appropriate hardiness zones
- **Data Quality**: >95% taxonomic accuracy (validated against GBIF)
- **Usability**: Search/filter by climate needs, bloom time, wildlife value

---

## Pilot Project: NW Native Plant Explorer

### Pilot Scope (2-Week MVP)
Focus on delivering a functional UI with real data from **iNaturalist API** - the most accessible public data source with rich Pacific Northwest observations.

### Why iNaturalist for Pilot?
✓ **No registration required** for read-only access
✓ **100 requests/min** rate limit (sufficient for pilot)
✓ **Rich data**: Photos, GPS coordinates, observation dates, species IDs
✓ **Active community**: 100k+ plant observations in PNW region
✓ **Real phenology data**: Shows actual bloom times and seasonal patterns
✓ **Climate relevance**: Observations span all PNW microclimates

### Pilot Features

#### Backend (Python FastAPI)
```python
# api/main.py
from fastapi import FastAPI, Query
from pydantic import BaseModel
import requests
from typing import List, Optional

app = FastAPI(title="NW Native Plant Explorer")

class PlantObservation(BaseModel):
    scientific_name: str
    common_name: Optional[str]
    photo_url: Optional[str]
    latitude: float
    longitude: float
    observed_on: str
    place_guess: str
    climate_zone: str  # Derived from coordinates

@app.get("/api/plants", response_model=List[PlantObservation])
async def get_plants(
    region: str = Query("washington", enum=["washington", "oregon", "idaho", "california"]),
    climate_type: str = Query("all", enum=["all", "coastal", "cascade-west", "cascade-east"]),
    taxon: str = Query(None, description="Common name or scientific name")
):
    """Query iNaturalist API and return native plant observations"""
    
    # Map regions to iNaturalist place IDs
    place_ids = {
        "washington": 14,
        "oregon": 41, 
        "idaho": 42,
        "california": 43
    }
    
    # Query iNaturalist
    params = {
        "place_id": place_ids[region],
        "taxon_id": 47126,  # Plantae kingdom
        "quality_grade": "research",
        "native": True,
        "per_page": 50
    }
    
    if taxon:
        params["q"] = taxon
    
    response = requests.get(
        "https://api.inaturalist.org/v1/observations",
        params=params
    )
    
    observations = response.json()["results"]
    
    # Add climate zone based on coordinates
    return [
        PlantObservation(
            scientific_name=obs["taxon"]["name"],
            common_name=obs["taxon"].get("preferred_common_name"),
            photo_url=obs["photos"][0]["url"] if obs["photos"] else None,
            latitude=obs["location"][0],
            longitude=obs["location"][1],
            observed_on=obs["observed_on"],
            place_guess=obs["place_guess"],
            climate_zone=determine_climate_zone(
                obs["location"][1],  # longitude
                obs["location"][0]   # latitude
            )
        )
        for obs in observations
    ]

def determine_climate_zone(lon: float, lat: float) -> str:
    """Classify climate zone based on Cascade Range position"""
    if lon > -121.0:
        return "East Cascades (Dry/Rain Shadow)"
    elif lat > 47.0 and lon < -122.0:
        return "Puget Sound Lowlands"
    elif lat < 45.0 and lon < -123.0:
        return "Coastal"
    else:
        return "West Cascades (Wet)"
```

#### Frontend (React + Vite)

**Key UI Components:**

1. **Search & Filter Panel**
   - Dropdown: Select state (WA, OR, ID, CA)
   - Radio buttons: Climate zone filter
   - Text search: Plant name (common or scientific)
   - Date range: Observation period

2. **Map View** (Leaflet.js)
   - Interactive map of Pacific Northwest
   - Plant observation markers colored by climate zone
   - Click marker → show plant details
   - Cascade Range overlay line (longitude -121°)

3. **Plant Grid/List View**
   - Photo thumbnails (from iNaturalist)
   - Common name + Scientific name
   - Location + observation date
   - Climate zone badge
   - "Learn More" → opens iNaturalist observation

4. **Plant Detail Modal**
   - Full-size photo gallery
   - Taxonomy information
   - Observation map (single plant)
   - Climate zone indicator
   - Link to full iNaturalist record

**Tech Stack:**
```json
{
  "frontend": {
    "framework": "React 18 + Vite",
    "ui-library": "shadcn/ui + Tailwind CSS",
    "mapping": "react-leaflet",
    "state": "TanStack Query (React Query)",
    "routing": "React Router"
  },
  "backend": {
    "framework": "FastAPI",
    "validation": "Pydantic",
    "http-client": "httpx"
  },
  "deployment": {
    "frontend": "Vercel",
    "backend": "Railway / Render"
  }
}
```

### Pilot Implementation Plan

#### Week 1: Backend + Data Integration ✅ COMPLETED (January 23, 2026)
**Days 1-2: Environment Setup**
- [x] Create Python venv
- [x] Install FastAPI, httpx, uvicorn, pydantic
- [x] Test iNaturalist API connectivity
- [x] Document rate limits and response structure

**Days 3-4: API Development**
- [x] Build `/api/plants` endpoint
- [x] Implement climate zone classification logic
- [x] Add query parameters (region, climate type, search)
- [x] Cache responses (in-memory for pilot)
- [x] Test with Postman/curl

**Day 5: Data Validation**
- [x] Verify data quality from iNaturalist
- [x] Handle missing photos/common names
- [x] Filter for true native species (research grade)
- [x] Test edge cases (coordinates outside PNW)

**Additional Completed Items:**
- [x] Created comprehensive test suite (test_inaturalist.py, test_api.py)
- [x] Added `/api/stats` endpoint for regional statistics
- [x] Implemented CORS for frontend integration
- [x] Created README.md with quick start guide
- [x] Generated requirements.txt for dependencies
- [x] Documented all API endpoints with Pydantic models

#### Week 2: Frontend + UI Polish
**Days 1-2: UI Foundation**
- [ ] Initialize Vite + React project
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Create layout: header, search panel, results area
- [ ] Build plant card components
- [ ] Implement responsive design (mobile-first)

**Days 3-4: Interactive Features**
- [ ] Integrate Leaflet map with plant markers
- [ ] Add climate zone color coding (legend)
- [ ] Implement search/filter functionality
- [ ] Build plant detail modal with photo carousel
- [ ] Add loading states and error handling

**Day 5: Integration & Testing**
- [ ] Connect frontend to FastAPI backend
- [ ] Test all user flows:
  - Search by plant name
  - Filter by state + climate zone
  - Click map markers
  - View plant details
- [ ] Add example queries (suggested plants)
- [ ] Deploy to Vercel (frontend) + Railway (backend)

### Pilot User Stories

1. **As a gardener in Seattle**, I want to find native plants that thrive in wet, mild winters so I can design a rain garden
   - Filter: Washington + "West Cascades (Wet)"
   - See plants like Western Red Cedar, Sword Fern, Red Huckleberry

2. **As a landscaper in Bend, OR**, I want drought-tolerant natives for east of the Cascades
   - Filter: Oregon + "East Cascades (Dry)"
   - See plants like Bitterbrush, Penstemon, Bluebunch Wheatgrass

3. **As a naturalist**, I want to see where specific plants are observed to understand their range
   - Search: "Trillium"
   - Map shows all observations across PNW
   - Cluster by climate zone

4. **As a restoration ecologist**, I want to identify spring-blooming plants for a project site
   - Filter by observation date: March-May
   - See seasonal phenology patterns

### Pilot Success Criteria
- ✓ **Functional UI**: Search, filter, map, and detail views working
- ✓ **Real data**: 1000+ plant observations loaded from iNaturalist
- ✓ **Climate integration**: All observations classified by zone (coastal/west/east Cascades)
- ✓ **Performance**: Page loads < 2 seconds, smooth interactions
- ✓ **Mobile-friendly**: Responsive design works on phones/tablets
- ✓ **Deployable**: Live demo URL for stakeholder review

### Next Steps After Pilot
- Integrate additional APIs (USDA PLANTS for official species lists)
- Add plant characteristic filters (height, bloom color, wildlife value)
- Implement agentic scraping for sources without APIs
- Build user authentication for saving favorites/creating plant lists
- Add community features (share gardens, planting tips)

