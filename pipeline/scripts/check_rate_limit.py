"""
Check API rate limit status.

Simple script to test if the API is available or still rate-limiting.
"""

import requests
import sys

API_KEY = "X31ro6MZh8qeLHAncmv1cie0BUBJIezbytNCfGea"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"

print("Checking API rate limit status...")
print("=" * 60)

params = {
    'api_key': API_KEY,
    'school.operating': 1,
    'fields': 'id,school.name',
    'per_page': 1,
    'page': 0
}

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ API is available - rate limit OK")
        data = response.json()
        if 'results' in data and len(data['results']) > 0:
            print(f"✓ Test query successful - retrieved 1 school")
            print(f"  School: {data['results'][0].get('school.name', 'N/A')}")
        sys.exit(0)
    elif response.status_code == 429:
        retry_after = response.headers.get('Retry-After')
        if retry_after:
            print(f"❌ Rate limited - Wait {retry_after} seconds")
        else:
            print("❌ Rate limited - Wait 10-15 minutes")
        print("\nRecommendation: Wait before running fetch_scorecard.py")
        sys.exit(1)
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(f"Response: {response.text[:200]}")
        sys.exit(1)
        
except requests.exceptions.RequestException as e:
    print(f"❌ Request failed: {e}")
    sys.exit(1)

