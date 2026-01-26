# Quick Start: Testing with Postman

## ✅ Server Status
Your FastAPI server is running on **http://127.0.0.1:8000**

## 🚀 Three Ways to Test

### 1. Postman Collection (Recommended)
**File created:** `NW_Native_Plant_Explorer.postman_collection.json`

**Steps:**
1. Go to https://web.postman.co/home
2. Click "Import" (top left)
3. Drag & drop `NW_Native_Plant_Explorer.postman_collection.json`
4. Start testing! (14 pre-configured requests ready)

### 2. Interactive Swagger UI (Easiest)
Open in browser: **http://127.0.0.1:8000/docs**
- Click any endpoint
- Click "Try it out"
- Fill in parameters
- Click "Execute"
- See results instantly!

### 3. Command Line (Quick)
```bash
# Health check
curl http://127.0.0.1:8000/api/health

# Get plants from Washington
curl "http://127.0.0.1:8000/api/plants?region=washington&per_page=5"

# Search for ferns
curl "http://127.0.0.1:8000/api/plants?region=oregon&taxon=fern&per_page=5"
```

## 📚 Available Requests in Postman Collection

1. **Root** - API info
2. **Health Check** - Server status  
3. **Get Plants - Washington** - Basic query
4. **Get Plants - Oregon** - Another region
5. **Search Plants - Ferns** - Name search
6. **Search Plants - Douglas** - Partial matching
7. **Filter - Coastal** - Climate zone
8. **Filter - East Cascades** - Dry zone
9. **Filter - West Cascades** - Wet zone
10. **Filter - Puget Sound** - Urban lowlands
11. **Get Plants - Idaho** - Another region
12. **Get Plants - California** - Northern CA
13. **Regional Statistics** - All regions
14. **Complex Query** - Multiple filters

## 🎯 Try These First

### In Postman:
1. **Health Check** - Verify server is running
2. **Regional Statistics** - See data availability
3. **Get Plants - Washington** - Get some plants
4. **Search Plants - Ferns** - Try a search
5. **Filter - East Cascades** - Test climate filter

### In Browser (Swagger UI):
Go to http://127.0.0.1:8000/docs and try:
- `/api/health` - No parameters needed
- `/api/plants` - Select "washington" region, click Execute

## 📖 Full Documentation

See `POSTMAN_TESTING.md` for:
- Detailed instructions
- How to modify requests
- Testing tips
- Troubleshooting
- Adding tests/assertions

## 🔥 Example Response

When you query plants, you get:
```json
{
  "id": 335859382,
  "scientific_name": "Pseudotsuga menziesii",
  "common_name": "Douglas Fir",
  "photo_url": "https://inaturalist-open-data.s3.amazonaws.com/...",
  "latitude": 47.6062,
  "longitude": -122.3321,
  "observed_on": "2026-01-20",
  "place_guess": "Seattle, WA, USA",
  "climate_zone": "Puget Sound Lowlands",
  "quality_grade": "research",
  "taxon_rank": "species"
}
```

## ✨ Ready to Test!

Your API is live and waiting. Choose your testing method and start exploring! 🌲
