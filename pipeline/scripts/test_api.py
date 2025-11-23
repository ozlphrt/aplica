"""
Simple API connection test script.

Tests basic API connectivity with minimal fields.
"""

import requests
import sys

API_KEY = "X31ro6MZh8qeLHAncmv1cie0BUBJIezbytNCfGea"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"

print("Testing College Scorecard API connection...")
print("=" * 60)

# Minimal test - just get school names and IDs
params = {
    'api_key': API_KEY,
    'school.operating': 1,
    'fields': 'id,school.name,school.state',
    'per_page': 5,  # Just 5 schools for testing
    'page': 0
}

try:
    print(f"Requesting: {BASE_URL}")
    print(f"Fields: {params['fields']}")
    print()
    
    response = requests.get(BASE_URL, params=params, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        if 'results' in data:
            print(f"✓ Success! Retrieved {len(data['results'])} schools")
            print("\nSample results:")
            for school in data['results'][:3]:
                print(f"  - {school.get('school.name', 'N/A')} ({school.get('id', 'N/A')})")
            
            if 'metadata' in data:
                total = data['metadata'].get('total', 0)
                print(f"\nTotal schools available: {total:,}")
            
            print("\n✓ API connection test passed!")
            sys.exit(0)
        else:
            print("❌ No 'results' in response")
            print(f"Response: {data}")
            sys.exit(1)
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(f"Response: {response.text[:500]}")
        sys.exit(1)
        
except requests.exceptions.Timeout:
    print("❌ Request timed out")
    sys.exit(1)
except requests.exceptions.RequestException as e:
    print(f"❌ Request failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

