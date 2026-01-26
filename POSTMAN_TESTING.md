# Testing the API with Postman

## Quick Start

1. **Make sure the server is running:**
   ```bash
   source venv/bin/activate
   uvicorn api.main:app --reload
   ```

2. **Import the Postman Collection:**
   - Go to [Postman Web](https://web.postman.co/home) or open the Postman app
   - Click "Import" button (top left)
   - Drag and drop `NW_Native_Plant_Explorer.postman_collection.json`
   - Or click "Upload Files" and select the file

3. **Start Testing!**
   - The collection includes 14 pre-configured requests
   - All requests use the variable `{{base_url}}` set to `http://127.0.0.1:8000`

## What's Included

### Basic Endpoints (3)
- ✅ **Root** - API information
- ✅ **Health Check** - Server status
- ✅ **Regional Statistics** - Data availability by state

### Plant Queries by Region (4)
- ✅ Washington
- ✅ Oregon  
- ✅ Idaho
- ✅ California

### Search Examples (2)
- ✅ **Search for Ferns** - Common name search
- ✅ **Search for Douglas** - Partial name matching

### Climate Zone Filters (4)
- ✅ **Coastal** - Maritime climate
- ✅ **West Cascades** - High precipitation zone
- ✅ **East Cascades** - Dry/rain shadow zone
- ✅ **Puget Sound** - Lowland urban areas

### Complex Query (1)
- ✅ **Oregon + West Cascades + Ferns** - Multiple filters combined

## How to Use Postman

### Basic Testing
1. Select a request from the collection
2. Click "Send"
3. View the response in JSON format
4. Check the status code (200 = success)

### Modify Parameters
Each request has query parameters you can adjust:
- **region**: `washington`, `oregon`, `idaho`, `california`
- **climate_type**: `all`, `coastal`, `cascade-west`, `cascade-east`, `puget-sound`
- **taxon**: Any plant name (e.g., "cedar", "maple", "huckleberry")
- **per_page**: Number of results (1-200)

### Example Modifications

**Change the search term:**
```
/api/plants?region=washington&taxon=cedar&per_page=5
```

**Get more results:**
```
/api/plants?region=oregon&per_page=50
```

**Combine all filters:**
```
/api/plants?region=washington&climate_type=puget-sound&taxon=salal&per_page=20
```

## Testing Tips

### 1. Test Health First
Always start by testing the Health Check endpoint to verify the server is running.

### 2. Test Statistics
The `/api/stats` endpoint shows how many observations are available per region.

### 3. Progressive Testing
- Start with basic queries (just region)
- Add climate filters
- Add search terms
- Combine everything

### 4. Check Response Structure
All plant observations return:
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

### 5. Use Variables
The collection uses `{{base_url}}` variable. If you deploy to a different server:
- Click the collection name
- Go to "Variables" tab
- Update `base_url` to your deployed URL

## Common Postman Features

### Save Responses
- Click "Save Response" to keep examples
- Useful for comparing data over time

### Add Tests
Click the "Tests" tab and add assertions:
```javascript
// Check status code
pm.test("Status is 200", function() {
    pm.response.to.have.status(200);
});

// Check response time
pm.test("Response time < 2000ms", function() {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Check data structure
pm.test("Has plants array", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

### Create Environments
For testing different deployments:
1. Click "Environments" in left sidebar
2. Create "Local", "Staging", "Production"
3. Set different `base_url` values
4. Switch between them

## Troubleshooting

### Connection Refused
**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:8000`  
**Solution:** Make sure the server is running:
```bash
source venv/bin/activate
uvicorn api.main:app --reload
```

### Timeout
**Problem:** Request times out  
**Solution:** Server might be processing. The `/api/stats` endpoint can take 30-60 seconds.

### Empty Results
**Problem:** `[]` returned  
**Solution:** Try different filters. Some combinations may have no observations.

### 404 Not Found
**Problem:** `404` status code  
**Solution:** Check the URL path. Make sure it starts with `/api/` for plant queries.

## Alternative: Use Browser

You can also test directly in your browser:
- API Docs: http://127.0.0.1:8000/docs (interactive Swagger UI)
- Health: http://127.0.0.1:8000/api/health
- Plants: http://127.0.0.1:8000/api/plants?region=washington&per_page=5

The Swagger UI at `/docs` lets you test all endpoints with a nice interface!

## Next Steps

After testing with Postman:
1. ✅ Verify all endpoints work
2. ✅ Test edge cases (invalid regions, large per_page values)
3. ✅ Check response times
4. ✅ Validate data quality
5. ✅ Document any issues found

Ready to proceed with Week 2 frontend development! 🚀
