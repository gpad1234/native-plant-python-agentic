"""
Test script to verify iNaturalist API connectivity and document response structure
Tests API endpoints and rate limits for the NW Native Plant Explorer pilot
"""

import httpx
import json
from datetime import datetime

# iNaturalist API configuration
INATURALIST_API_BASE = "https://api.inaturalist.org/v1"

# Pacific Northwest place IDs
PLACE_IDS = {
    "washington": 14,
    "oregon": 41,
    "idaho": 42,
    "california": 43
}

def test_basic_connectivity():
    """Test basic API connectivity"""
    print("=" * 60)
    print("Testing iNaturalist API Connectivity")
    print("=" * 60)
    
    try:
        response = httpx.get(f"{INATURALIST_API_BASE}/observations", timeout=10)
        print(f"✓ API Status: {response.status_code}")
        print(f"✓ Connection: Successful")
        return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

def test_plant_observations():
    """Test querying native plant observations for Pacific Northwest"""
    print("\n" + "=" * 60)
    print("Testing Plant Observations Query")
    print("=" * 60)
    
    # Query parameters for research-grade native plants in Washington
    params = {
        "place_id": PLACE_IDS["washington"],
        "taxon_id": 47126,  # Plantae (Plants)
        "quality_grade": "research",
        "native": True,
        "per_page": 5,  # Small sample for testing
        "order": "desc",
        "order_by": "created_at"
    }
    
    try:
        response = httpx.get(
            f"{INATURALIST_API_BASE}/observations",
            params=params,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            total_results = data.get("total_results", 0)
            results = data.get("results", [])
            
            print(f"✓ Total observations available: {total_results:,}")
            print(f"✓ Retrieved: {len(results)} observations")
            
            if results:
                print("\n" + "-" * 60)
                print("Sample Observation Structure:")
                print("-" * 60)
                
                obs = results[0]
                print(f"ID: {obs.get('id')}")
                print(f"Observed on: {obs.get('observed_on')}")
                print(f"Place: {obs.get('place_guess')}")
                print(f"Quality grade: {obs.get('quality_grade')}")
                
                # Taxon information
                taxon = obs.get('taxon', {})
                print(f"\nTaxon:")
                print(f"  Scientific name: {taxon.get('name')}")
                print(f"  Common name: {taxon.get('preferred_common_name')}")
                print(f"  Rank: {taxon.get('rank')}")
                
                # Location
                location = obs.get('location')
                if location:
                    lat, lon = location.split(',')
                    print(f"\nLocation:")
                    print(f"  Latitude: {lat}")
                    print(f"  Longitude: {lon}")
                
                # Photos
                photos = obs.get('photos', [])
                print(f"\nPhotos: {len(photos)} available")
                if photos:
                    print(f"  Example URL: {photos[0].get('url')}")
                
                print("\n" + "-" * 60)
                print("Full JSON structure (first observation):")
                print("-" * 60)
                print(json.dumps(obs, indent=2)[:1000] + "...")
                
            return True
        else:
            print(f"✗ API returned status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Query failed: {e}")
        return False

def test_all_regions():
    """Test querying observations across all PNW states"""
    print("\n" + "=" * 60)
    print("Testing All Pacific Northwest Regions")
    print("=" * 60)
    
    results_by_region = {}
    
    for region_name, place_id in PLACE_IDS.items():
        try:
            response = httpx.get(
                f"{INATURALIST_API_BASE}/observations",
                params={
                    "place_id": place_id,
                    "taxon_id": 47126,
                    "quality_grade": "research",
                    "native": True,
                    "per_page": 1
                },
                timeout=10
            )
            
            if response.status_code == 200:
                total = response.json().get("total_results", 0)
                results_by_region[region_name] = total
                print(f"✓ {region_name.capitalize():15s}: {total:,} observations")
            else:
                print(f"✗ {region_name.capitalize():15s}: Failed")
                
        except Exception as e:
            print(f"✗ {region_name.capitalize():15s}: Error - {e}")
    
    print(f"\n✓ Total PNW observations: {sum(results_by_region.values()):,}")
    return results_by_region

def test_rate_limits():
    """Test rate limiting behavior"""
    print("\n" + "=" * 60)
    print("Testing Rate Limits (100 requests/minute)")
    print("=" * 60)
    print("Making 10 rapid requests to test rate limiting...")
    
    successful = 0
    start_time = datetime.now()
    
    for i in range(10):
        try:
            response = httpx.get(
                f"{INATURALIST_API_BASE}/observations",
                params={"per_page": 1},
                timeout=5
            )
            if response.status_code == 200:
                successful += 1
        except:
            pass
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print(f"✓ Successful requests: {successful}/10")
    print(f"✓ Time taken: {duration:.2f} seconds")
    print(f"✓ Average: {successful/duration:.1f} requests/second")
    print(f"✓ Projected rate: {(successful/duration)*60:.0f} requests/minute")
    
    if successful == 10:
        print("✓ No rate limiting detected in small test")
    
    return successful == 10

def document_response_fields():
    """Document the key fields we'll use in the application"""
    print("\n" + "=" * 60)
    print("Key Fields for NW Native Plant Explorer")
    print("=" * 60)
    
    fields = {
        "observation": [
            "id (int) - Unique observation ID",
            "observed_on (string) - Date YYYY-MM-DD",
            "place_guess (string) - Human-readable location",
            "quality_grade (string) - 'research', 'needs_id', 'casual'",
            "location (string) - 'lat,lon'",
            "photos (array) - Photo objects with 'url' field"
        ],
        "taxon": [
            "name (string) - Scientific name",
            "preferred_common_name (string) - Common name",
            "rank (string) - 'species', 'genus', 'family', etc.",
            "id (int) - Taxon ID for filtering"
        ]
    }
    
    for category, field_list in fields.items():
        print(f"\n{category.upper()}:")
        for field in field_list:
            print(f"  • {field}")
    
    print("\n" + "=" * 60)
    print("Climate Zone Derivation Logic")
    print("=" * 60)
    print("Based on coordinates (longitude):")
    print("  • Longitude > -121.0: East Cascades (Dry/Rain Shadow)")
    print("  • Longitude < -121.0: West of Cascades (varies by latitude)")
    print("    - Lat > 47.0, Lon < -122.0: Puget Sound Lowlands")
    print("    - Lat < 45.0, Lon < -123.0: Coastal")
    print("    - Default: West Cascades (Wet)")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("iNaturalist API Test Suite")
    print("NW Native Plant Explorer - Pilot Week 1")
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Run all tests
    tests = [
        test_basic_connectivity,
        test_plant_observations,
        test_rate_limits
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            # Handle dict return from test_all_regions
            results.append(bool(result))
        except Exception as e:
            print(f"\n✗ Test failed with exception: {e}")
            results.append(False)
    
    # Run region test separately (returns dict)
    try:
        test_all_regions()
    except:
        pass
    
    # Document fields
    document_response_fields()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"Passed: {sum(results)}/{len(results)}")
    print(f"Status: {'✓ ALL TESTS PASSED' if all(results) else '✗ SOME TESTS FAILED'}")
    print("=" * 60)
