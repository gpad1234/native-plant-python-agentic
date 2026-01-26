"""
Test script for FastAPI backend endpoints
Run this while the server is running on port 8000
"""

import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

def test_root():
    """Test root endpoint"""
    print("=" * 60)
    print("Testing Root Endpoint")
    print("=" * 60)
    
    response = httpx.get(BASE_URL)
    print(f"Status: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_health():
    """Test health check endpoint"""
    print("\n" + "=" * 60)
    print("Testing Health Endpoint")
    print("=" * 60)
    
    response = httpx.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_plants_basic():
    """Test basic plants query"""
    print("\n" + "=" * 60)
    print("Testing Plants Endpoint (Washington, 5 results)")
    print("=" * 60)
    
    response = httpx.get(
        f"{BASE_URL}/api/plants",
        params={"region": "washington", "per_page": 5},
        timeout=30.0
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        plants = response.json()
        print(f"Returned: {len(plants)} observations")
        
        if plants:
            print("\nFirst observation:")
            print(json.dumps(plants[0], indent=2))
            
            # Print summary
            print("\nClimate zones found:")
            zones = set(p['climate_zone'] for p in plants)
            for zone in zones:
                count = sum(1 for p in plants if p['climate_zone'] == zone)
                print(f"  • {zone}: {count}")
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_plants_with_search():
    """Test plants query with taxon search"""
    print("\n" + "=" * 60)
    print("Testing Plants Search (Oregon + 'fern')")
    print("=" * 60)
    
    response = httpx.get(
        f"{BASE_URL}/api/plants",
        params={"region": "oregon", "taxon": "fern", "per_page": 5},
        timeout=30.0
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        plants = response.json()
        print(f"Returned: {len(plants)} fern observations")
        
        if plants:
            print("\nSpecies found:")
            for plant in plants:
                print(f"  • {plant['common_name'] or plant['scientific_name']}")
                print(f"    Location: {plant['place_guess']}")
                print(f"    Climate: {plant['climate_zone']}")
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_plants_climate_filter():
    """Test climate zone filtering"""
    print("\n" + "=" * 60)
    print("Testing Climate Filter (East Cascades)")
    print("=" * 60)
    
    response = httpx.get(
        f"{BASE_URL}/api/plants",
        params={
            "region": "oregon",
            "climate_type": "cascade-east",
            "per_page": 5
        },
        timeout=30.0
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        plants = response.json()
        print(f"Returned: {len(plants)} observations from East Cascades")
        
        # Verify all are from east of Cascades
        if plants:
            zones = set(p['climate_zone'] for p in plants)
            print(f"\nClimate zones: {zones}")
            
            # Show a few examples
            print("\nExamples:")
            for plant in plants[:3]:
                print(f"  • {plant['common_name'] or plant['scientific_name']}")
                print(f"    Lon: {plant['longitude']}, Zone: {plant['climate_zone']}")
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_stats():
    """Test statistics endpoint"""
    print("\n" + "=" * 60)
    print("Testing Statistics Endpoint")
    print("=" * 60)
    
    response = httpx.get(f"{BASE_URL}/api/stats", timeout=60.0)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        stats = response.json()
        print(f"\nRegional Statistics:")
        for region, data in stats['regions'].items():
            if region != 'total_pnw':
                print(f"  {region.capitalize():15s}: {data['total_observations']:,} observations")
        
        print(f"\n  Total PNW:      {stats['total_pnw']:,} observations")
        return True
    else:
        print(f"Error: {response.text}")
        return False

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("FastAPI Backend Test Suite")
    print("=" * 60)
    print("Make sure the server is running on http://127.0.0.1:8000")
    print("Start with: uvicorn api.main:app --reload")
    print("=" * 60)
    
    tests = [
        ("Root", test_root),
        ("Health", test_health),
        ("Plants Basic", test_plants_basic),
        ("Plants Search", test_plants_with_search),
        ("Climate Filter", test_plants_climate_filter),
        ("Statistics", test_stats)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ Test '{name}' failed with exception: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{name:20s}: {status}")
    
    total_passed = sum(1 for _, passed in results if passed)
    print(f"\nTotal: {total_passed}/{len(results)} passed")
    print("=" * 60)
