"""
Fetch college data from College Scorecard API.

Fetches all 4-year degree-granting institutions with required fields:
- School identity: id, school.name, school.city, school.state, school.school_url
- Size and control: latest.student.size, latest.school.ownership
- Admissions: latest.admissions.admission_rate.overall, SAT/ACT scores
- Financial: latest.cost.attendance.academic_year, net_price by income brackets
- Outcomes: retention_rate, graduation_rate_4yr, median_earnings_6yr

Saves to pipeline/raw/scorecard_data.csv
"""

import os
import sys
import requests
import pandas as pd
import time
import argparse
from pathlib import Path

# API Configuration
API_KEY = "X31ro6MZh8qeLHAncmv1cie0BUBJIezbytNCfGea"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"

# Output directory
SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR.parent / "raw"
RAW_DIR.mkdir(exist_ok=True)

# Fields to retrieve from API (simplified for testing)
FIELDS = [
    # School identity
    'id',
    'school.name',
    'school.city',
    'school.state',
    'school.school_url',
    'location.lat',
    'location.lon',
    
    # Size and control
    'latest.student.size',
    'latest.school.ownership',
    'latest.school.locale',
    
    # Admissions
    'latest.admissions.admission_rate.overall',
    'latest.admissions.sat_scores.midpoint.math',
    'latest.admissions.sat_scores.midpoint.critical_reading',
    'latest.admissions.act_scores.midpoint.cumulative',
    
    # Financial (simplified - using overall averages)
    'latest.cost.attendance.academic_year',
    'latest.cost.tuition.in_state',
    'latest.cost.tuition.out_of_state',
    'latest.cost.avg_net_price.overall',
    
    # Outcomes
    'latest.student.retention_rate.four_year.full_time',
    'latest.completion.completion_rate_4yr_150nt',
    'latest.completion.completion_rate_6yr_150nt',
    'latest.earnings.6_yrs_after_entry.median',
    'latest.earnings.10_yrs_after_entry.median',
]

def fetch_scorecard_data(test_mode=False, max_pages=None, max_schools=None):
    """
    Fetch 4-year institutions from College Scorecard API.
    
    Args:
        test_mode: If True, limit to first page only (for testing)
        max_pages: Maximum number of pages to fetch (overridden by max_schools if set)
        max_schools: Maximum number of schools to fetch (e.g., 500)
    
    Returns:
        pandas.DataFrame: Combined data from all pages
    """
    print("=" * 60)
    print("Fetching College Scorecard Data" + (" [TEST MODE]" if test_mode else ""))
    print("=" * 60)
    
    # Parameters for API request
    # Filter for 4-year degree-granting institutions
    # Note: Remove problematic filter - will filter in post-processing
    params = {
        'api_key': API_KEY,
        'school.operating': 1,  # Only operating schools
        'fields': ','.join(FIELDS),
        'per_page': 100,  # Max per page
        'page': 0
    }
    
    all_schools = []
    page = 0
    max_retries = 3
    retry_delay = 2  # seconds
    should_continue = True
    
    # Rate limiting: College Scorecard API allows ~1000 requests/hour
    # With 100 schools per page, that's ~100k schools/hour max
    # We'll use 2 second delays to stay well under the limit
    
    while should_continue:
        params['page'] = page
        print(f"\nFetching page {page + 1}...", end=" ", flush=True)
        
                # Retry logic for API failures
        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    print(f"(Attempt {attempt + 1}/{max_retries})", end=" ", flush=True)
                
                response = requests.get(BASE_URL, params=params, timeout=60)
                
                # Log response status
                if response.status_code != 200:
                    print(f"\n⚠ HTTP {response.status_code} response")
                
                response.raise_for_status()
                
                data = response.json()
                
                # Check for API errors
                if 'error' in data:
                    print(f"\n❌ API Error: {data['error']}")
                    sys.exit(1)
                
                if 'results' not in data or len(data['results']) == 0:
                    print("No more results")
                    should_continue = False
                    break
                
                all_schools.extend(data['results'])
                print(f"✓ Retrieved {len(data['results'])} schools (total: {len(all_schools)})")
                
                # In test mode, ALWAYS stop after first page
                if test_mode:
                    print("  [TEST MODE] Stopping after first page")
                    should_continue = False
                    break
                
                # Check if we've reached max_schools limit
                if max_schools and len(all_schools) >= max_schools:
                    print(f"  Reached limit of {max_schools} schools")
                    # Trim to exact limit
                    all_schools = all_schools[:max_schools]
                    should_continue = False
                    break
                
                # Check if we've reached max_pages limit
                if max_pages and page >= max_pages - 1:
                    print(f"  Reached max_pages limit ({max_pages})")
                    should_continue = False
                    break
                
                # Check if there are more pages
                metadata = data.get('metadata', {})
                total_results = metadata.get('total', 0)
                
                if total_results > 0:
                    total_pages = (total_results + params['per_page'] - 1) // params['per_page']
                    target = max_schools if max_schools else total_results
                    print(f"  Progress: {len(all_schools)}/{target} schools ({len(all_schools)/target*100:.1f}%)")
                    
                    # Stop if we've reached or exceeded the total
                    if len(all_schools) >= total_results:
                        print(f"  Reached total of {total_results} schools")
                        should_continue = False
                        break
                    
                    # Stop if we've fetched all pages
                    if page >= total_pages - 1:
                        print(f"  Reached last page ({total_pages})")
                        should_continue = False
                        break
                
                # Stop if we got fewer results than requested (last page)
                if len(data['results']) < params['per_page']:
                    print("  Last page reached (fewer results than per_page)")
                    should_continue = False
                    break
                
                # Safety check: prevent infinite loops
                if page >= 1000:  # Sanity check - should never reach this
                    print("  ⚠ Safety limit reached (1000 pages), stopping")
                    should_continue = False
                    break
                
                # Increment page for next iteration
                page += 1
                
                # Rate limiting: delay between requests to avoid 429 errors
                # College Scorecard API rate limit: ~1000 requests/hour
                # With 3 second delay: ~1200 requests/hour (safe margin)
                # Increased to 3s to be more conservative
                time.sleep(3)
                request_success = True
                page += 1  # Increment for next iteration
                break  # Success, exit retry loop
                
            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    print(f"⏱ Timeout, retrying in {retry_delay}s...", end=" ", flush=True)
                    time.sleep(retry_delay)
                else:
                    print(f"\n❌ Error: Request timeout after {max_retries} attempts")
                    print(f"   URL: {response.url if 'response' in locals() else BASE_URL}")
                    sys.exit(1)
                    
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    # Too Many Requests - need to wait longer
                    # Check for Retry-After header if available
                    retry_after = e.response.headers.get('Retry-After')
                    if retry_after:
                        wait_time = int(retry_after)
                        print(f"\n⚠ Rate limit exceeded (429). API says wait {wait_time}s...", end=" ", flush=True)
                    else:
                        # Exponential backoff: 10s, 20s, 40s (longer waits)
                        wait_time = 10 * (2 ** attempt)
                        print(f"\n⚠ Rate limit exceeded (429). Waiting {wait_time}s before retry...", end=" ", flush=True)
                    
                    if attempt < max_retries - 1:
                        time.sleep(wait_time)
                    else:
                        print(f"\n❌ Rate limit exceeded after {max_retries} attempts")
                        print(f"   The API is rate-limiting requests.")
                        print(f"   Recommendation: Wait 10-15 minutes before trying again.")
                        print(f"   Or use the existing database file: pipeline/output/colleges_v2024_11.db")
                        sys.exit(1)
                elif e.response.status_code == 400:
                    # Bad Request - try to get error details
                    try:
                        error_data = e.response.json()
                        print(f"\n❌ API Error (400 Bad Request):")
                        if 'error' in error_data:
                            print(f"   {error_data['error']}")
                        if 'message' in error_data:
                            print(f"   {error_data['message']}")
                        print(f"\n   Troubleshooting:")
                        print(f"   - Check field names are correct")
                        print(f"   - Verify API key is valid")
                        print(f"   - Check API documentation for field syntax")
                    except:
                        print(f"\n❌ API Error (400 Bad Request): {e}")
                        print(f"   Response: {e.response.text[:200]}")
                else:
                    print(f"\n❌ HTTP Error {e.response.status_code}: {e}")
                
                if e.response.status_code != 429 and attempt < max_retries - 1:
                    print(f"   Retrying in {retry_delay}s...", end=" ", flush=True)
                    time.sleep(retry_delay)
                elif e.response.status_code != 429:
                    sys.exit(1)
                    
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"⚠ Error: {e}, retrying in {retry_delay}s...", end=" ", flush=True)
                    time.sleep(retry_delay)
                else:
                    print(f"\n❌ Error: Failed to fetch data after {max_retries} attempts: {e}")
                    sys.exit(1)
            except Exception as e:
                print(f"\n❌ Unexpected error: {e}")
                import traceback
                traceback.print_exc()
                sys.exit(1)
        else:
            # If we exhausted retries, break the main loop
            break
    
    if not all_schools:
        print("\n❌ Error: No data retrieved")
        sys.exit(1)
    
    # Trim to max_schools if specified (in case we went slightly over)
    if max_schools and len(all_schools) > max_schools:
        all_schools = all_schools[:max_schools]
        print(f"\n⚠ Trimmed to {max_schools} schools (limit reached)")
    
    print(f"\n{'=' * 60}")
    print(f"✓ Total schools fetched: {len(all_schools)}")
    if max_schools:
        print(f"  Limit: {max_schools} schools")
    print(f"{'=' * 60}")
    
    # Convert to DataFrame
    df = pd.DataFrame(all_schools)
    
    # Save to CSV
    output_file = RAW_DIR / "scorecard_data.csv"
    df.to_csv(output_file, index=False)
    print(f"\n✓ Data saved to: {output_file}")
    print(f"  File size: {output_file.stat().st_size / 1024 / 1024:.2f} MB")
    print(f"  Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch college data from College Scorecard API')
    parser.add_argument('--test', action='store_true', help='Test mode: fetch only first page (100 schools)')
    parser.add_argument('--limit', type=int, help='Maximum number of schools to fetch (e.g., 500)')
    parser.add_argument('--pages', type=int, help='Maximum number of pages to fetch')
    args = parser.parse_args()
    
    try:
        df = fetch_scorecard_data(
            test_mode=args.test,
            max_schools=args.limit,
            max_pages=args.pages
        )
        print("\n✓ Fetch completed successfully!")
        print(f"\nTotal schools fetched: {len(df)}")
        print(f"Sample columns: {list(df.columns[:10])}...")
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)
