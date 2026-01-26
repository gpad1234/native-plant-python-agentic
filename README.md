# NW Native Plant Explorer

Python agentic web application for discovering native plants in the Pacific Northwest.

## Project Status

**Week 1 Pilot - Backend Development: COMPLETED ✓**

### What's Working

- ✅ Python virtual environment configured
- ✅ FastAPI backend with 3 main endpoints:
  - `/` - API information
  - `/api/plants` - Query native plant observations
  - `/api/health` - Health check
  - `/api/stats` - Regional statistics
- ✅ iNaturalist API integration (5.7M+ observations available)
- ✅ Climate zone classification (Coastal, West Cascades, East Cascades, Puget Sound)
- ✅ Advanced filtering (by region, climate zone, plant name)
- ✅ Pydantic models for type safety
- ✅ CORS enabled for frontend integration

### Quick Start

1. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

2. **Start the API server:**
   ```bash
   uvicorn api.main:app --reload
   ```

3. **Test the API:**
   ```bash
   # In a new terminal
   source venv/bin/activate
   python test_api.py
   ```

4. **Browse interactive docs:**
   - Open http://127.0.0.1:8000/docs in your browser
   - Try out the `/api/plants` endpoint with different parameters

### API Examples

**Get Washington native plants:**
```bash
curl "http://127.0.0.1:8000/api/plants?region=washington&per_page=10"
```

**Search for ferns in Oregon:**
```bash
curl "http://127.0.0.1:8000/api/plants?region=oregon&taxon=fern&per_page=5"
```

**Filter by climate zone (East Cascades - dry zone):**
```bash
curl "http://127.0.0.1:8000/api/plants?region=oregon&climate_type=cascade-east&per_page=10"
```

**Get regional statistics:**
```bash
curl "http://127.0.0.1:8000/api/stats"
```

### Project Structure

```
native-plant-python-agentic/
├── api/
│   ├── __init__.py
│   └── main.py              # FastAPI application
├── venv/                    # Python virtual environment
├── test_inaturalist.py      # iNaturalist API connectivity tests
├── test_api.py              # FastAPI endpoint tests
├── Ideas-Pythonagenticwebscraping.md  # Full project documentation
└── README.md                # This file
```

### Next Steps (Week 2)

- [ ] Initialize React + Vite frontend
- [ ] Build interactive map with Leaflet
- [ ] Create plant card UI components
- [ ] Implement search and filter interface
- [ ] Deploy frontend and backend

### Dependencies

- fastapi - Web framework
- httpx - Async HTTP client
- uvicorn - ASGI server
- pydantic - Data validation

### Data Source

All plant observation data comes from [iNaturalist](https://www.inaturalist.org), a citizen science platform with 5.7M+ research-grade native plant observations across Washington, Oregon, Idaho, and Northern California.

### Climate Zones

The application classifies observations into Pacific Northwest climate zones:

- **Coastal**: West of Coast Range, mild maritime climate
- **West Cascades (Wet)**: Windward side of Cascades, high precipitation
- **Puget Sound Lowlands**: Urban lowlands, moderate rain
- **East Cascades (Dry/Rain Shadow)**: Leeward side, semi-arid

Classification based on longitude -121° (Cascade crest) and latitude.
