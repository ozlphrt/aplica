/**
 * College Scorecard API Service
 * Live API access with filtering capabilities
 */

import { getStatesForRegion } from '../utils/regions';

const API_KEY = import.meta.env.VITE_COLLEGE_SCORECARD_API_KEY || "X31ro6MZh8qeLHAncmv1cie0BUBJIezbytNCfGea";
const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";

// Cache for API responses (simple in-memory cache)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Build API query parameters from filters
 * Converts regions to states before building params
 */
function buildQueryParams(filters = {}) {
  // Convert region to states if provided
  if (filters.region && !filters.states) {
    filters.states = getStatesForRegion(filters.region);
  }
  const params = {
    api_key: API_KEY,
    'school.operating': 1, // Only operating schools
    per_page: 100, // Max per page
    page: filters.page || 0,
  };

  // ID filter - if provided, filter by specific school ID
  if (filters.id) {
    params.id = filters.id;
  }

  // Geography filters - State or Region
  // Note: API only supports single state per request, so we'll fetch all and filter client-side
  // If a single state is provided, we can use API filter for efficiency
  if (filters.state && filters.state.length === 2) {
    // Single state - use API filter for efficiency
    params['school.state'] = filters.state;
  }
  // For regions or multiple states, we'll filter client-side after fetching
  
  // City filter - use API's city parameter if search term looks like a city name
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.trim();
    const searchLower = searchTerm.toLowerCase();
    
    // Common major cities that might be searched
    const majorCities = {
      'seattle': { state: 'WA', apiCity: 'Seattle' },
      'portland': { state: 'OR', apiCity: 'Portland' },
      'san francisco': { state: 'CA', apiCity: 'San Francisco' },
      'los angeles': { state: 'CA', apiCity: 'Los Angeles' },
      'san diego': { state: 'CA', apiCity: 'San Diego' },
      'chicago': { state: 'IL', apiCity: 'Chicago' },
      'new york': { state: 'NY', apiCity: 'New York' },
      'boston': { state: 'MA', apiCity: 'Boston' },
      'philadelphia': { state: 'PA', apiCity: 'Philadelphia' },
      'houston': { state: 'TX', apiCity: 'Houston' },
      'dallas': { state: 'TX', apiCity: 'Dallas' },
      'atlanta': { state: 'GA', apiCity: 'Atlanta' },
      'miami': { state: 'FL', apiCity: 'Miami' },
      'denver': { state: 'CO', apiCity: 'Denver' },
      'phoenix': { state: 'AZ', apiCity: 'Phoenix' },
      'austin': { state: 'TX', apiCity: 'Austin' },
      'nashville': { state: 'TN', apiCity: 'Nashville' },
      'detroit': { state: 'MI', apiCity: 'Detroit' },
      'minneapolis': { state: 'MN', apiCity: 'Minneapolis' },
    };
    
    // If search term matches a major city, use API city filter
    if (majorCities[searchLower]) {
      const cityInfo = majorCities[searchLower];
      params['school.city'] = cityInfo.apiCity;
      params['school.state'] = cityInfo.state;
      console.log(`Detected city "${searchTerm}", using API filters: city="${cityInfo.apiCity}", state="${cityInfo.state}"`);
      // Store that we're using API city filter so we don't double-filter client-side
      filters._usingApiCityFilter = true;
    }
  }

  // Size filters (enrollment) - API supports range queries with min/max syntax
  // Format: latest.student.size__range=min..max
  if (filters.minSize !== undefined || filters.maxSize !== undefined) {
    const min = filters.minSize || 0;
    const max = filters.maxSize || 1000000;
    params['latest.student.size__range'] = `${min}..${max}`;
  }

  // Urban/Rural setting (locale) - API supports filtering by locale
  // Locale codes: 11-13=City, 21-23=Suburb, 31-33=Town, 41-43=Rural
  // API supports single locale or range: latest.school.locale__range=11..13
  if (filters.locale) {
    // Single locale
    params['latest.school.locale'] = filters.locale;
  } else if (filters.localeRange) {
    // Range of locales (e.g., for multiple settings)
    params['latest.school.locale__range'] = filters.localeRange;
  }
  
  // Cost filter - API supports range queries
  if (filters.maxCost) {
    // Filter by cost of attendance
    params['latest.cost.attendance.academic_year__range'] = `0..${filters.maxCost}`;
  }

  // Control type (Public/Private)
  if (filters.control) {
    // 1=Public, 2=Private nonprofit, 3=Private for-profit
    const controlMap = {
      'public': 1,
      'private-nonprofit': 2,
      'private-for-profit': 3
    };
    if (controlMap[filters.control]) {
      params['latest.school.ownership'] = controlMap[filters.control];
    }
  }

  // Note: Cost and admission rate filters will be applied client-side
  // The API range syntax is complex, so we fetch and filter

  // Fields to retrieve
  const fields = [
    'id',
    'school.name',
    'school.city',
    'school.state',
    'school.school_url',
    'location.lat',
    'location.lon',
    'latest.student.size',
    'latest.school.ownership',
    'latest.school.locale',
    'latest.admissions.admission_rate.overall',
    'latest.admissions.sat_scores.midpoint.math',
    'latest.admissions.sat_scores.midpoint.critical_reading',
    'latest.admissions.act_scores.midpoint.cumulative',
    'latest.cost.attendance.academic_year',
    'latest.cost.tuition.in_state',
    'latest.cost.tuition.out_of_state',
    'latest.cost.avg_net_price.overall',
    'latest.student.retention_rate.four_year.full_time',
    'latest.completion.completion_rate_4yr_150nt',
    'latest.completion.completion_rate_6yr_150nt',
    'latest.earnings.6_yrs_after_entry.median',
    'latest.earnings.10_yrs_after_entry.median',
  ];

  params.fields = fields.join(',');

  return params;
}

/**
 * Fetch schools from API with filters
 * @param {Object} filters - Filter criteria (can include 'region' or 'states')
 * @param {Object} options - Additional options (maxResults, useCache)
 * @returns {Promise<Object>} { schools: [], total: number, pages: number }
 */
export async function fetchSchools(filters = {}, options = {}) {
  // Convert region to states if needed
  if (filters.region && !filters.states) {
    filters.states = getStatesForRegion(filters.region);
  }
  const {
    maxResults = 500, // Default limit
    useCache = true,
    page = 0
  } = options;

  // Check cache
  const cacheKey = JSON.stringify({ filters, page });
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Using cached API response');
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  try {
    const params = buildQueryParams({ ...filters, page });
    
    console.log('Fetching from College Scorecard API...', { filters, page });
    console.log('API params:', params);
    
    // Build query string manually to handle keys with dots properly
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const apiUrl = `${BASE_URL}?${queryString}`;
    console.log('API URL:', apiUrl.substring(0, 200) + '...'); // Log first 200 chars
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`API error: ${data.error}`);
    }

    const schools = data.results || [];
    const metadata = data.metadata || {};
    const total = metadata.total || schools.length;

    console.log(`API returned ${schools.length} schools (total available: ${total})`);
    console.log('Filters applied:', filters);

    // Apply client-side filters that API doesn't support well
    let filteredSchools = schools;
    
    // Geography filter - States or Region
    if (filters.states && filters.states.length > 0) {
      // Multiple states or region - filter client-side
      const beforeCount = filteredSchools.length;
      filteredSchools = filteredSchools.filter(school => {
        const schoolState = school['school.state'];
        return schoolState && filters.states.includes(schoolState);
      });
      console.log(`State filter: ${beforeCount} -> ${filteredSchools.length} schools (filtering for: ${filters.states.join(', ')})`);
      
      // Log sample states if filtering resulted in 0 schools
      if (filteredSchools.length === 0 && beforeCount > 0) {
        const sampleStates = [...new Set(schools.slice(0, 20).map(s => s['school.state']).filter(Boolean))];
        console.log(`No schools found in states: ${filters.states.join(', ')}`);
        console.log(`Sample states in API results: ${sampleStates.join(', ')}`);
      }
    }
    
    // Size filter
    if (filters.size) {
      filteredSchools = filteredSchools.filter(school => {
        const size = school['latest.student.size'];
        if (!size) return false;
        if (filters.size === 'small') return size < 5000;
        if (filters.size === 'medium') return size >= 5000 && size <= 15000;
        if (filters.size === 'large') return size > 15000;
        return true;
      });
    }

    // Setting filter (locale)
    if (filters.setting) {
      const localeRanges = {
        'city': [11, 12, 13],
        'suburb': [21, 22, 23],
        'town': [31, 32, 33],
        'rural': [41, 42, 43]
      };
      const validLocales = localeRanges[filters.setting];
      if (validLocales) {
        filteredSchools = filteredSchools.filter(school => {
          const locale = school['latest.school.locale'];
          return locale && validLocales.includes(locale);
        });
      }
    }

    // Cost filter
    if (filters.maxCost) {
      filteredSchools = filteredSchools.filter(school => {
        const cost = school['latest.cost.attendance.academic_year'];
        return cost && cost <= filters.maxCost;
      });
    }

    // Admission rate filters
    if (filters.minAdmitRate !== undefined) {
      filteredSchools = filteredSchools.filter(school => {
        const rate = school['latest.admissions.admission_rate.overall'];
        return rate !== null && rate >= filters.minAdmitRate;
      });
    }
    if (filters.maxAdmitRate !== undefined) {
      filteredSchools = filteredSchools.filter(school => {
        const rate = school['latest.admissions.admission_rate.overall'];
        return rate !== null && rate <= filters.maxAdmitRate;
      });
    }

    // Major filter - Note: Full major filtering requires IPEDS program data
    // For now, this is a placeholder that can be enhanced when program data is available
    // We could search school names for major-related keywords, but that's not very accurate
    if (filters.major && filters.major.trim()) {
      // Placeholder: Major filtering will work when IPEDS program data is integrated
      // For now, we'll note it in the filter but not actually filter
      console.log(`Major filter selected: ${filters.major} (Note: Full major filtering requires IPEDS program data)`);
      // TODO: When IPEDS data is available, filter schools that offer this major
      // This would query the programs table: WHERE cip_2digit = ? OR program_name LIKE ?
    }

    // Search term filter (name, city, state, or URL)
    // Skip if we already filtered by city using API (to avoid double-filtering)
    if (filters.searchTerm && filters.searchTerm.trim() && !filters._usingApiCityFilter) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      const beforeCount = filteredSchools.length;
      
      // Create search variations for common terms
      const searchVariations = [searchLower];
      if (searchLower === 'medicine' || searchLower === 'med') {
        searchVariations.push('medical', 'medicine', 'med school', 'health');
      } else if (searchLower.includes('med')) {
        searchVariations.push('medical', 'medicine');
      }
      
      filteredSchools = filteredSchools.filter(school => {
        const name = (school['school.name'] || '').toLowerCase();
        const city = (school['school.city'] || '').toLowerCase();
        const state = (school['school.state'] || '').toLowerCase();
        const url = (school['school.school_url'] || '').toLowerCase();
        
        // Check if any search variation matches
        return searchVariations.some(term => {
          const cityMatch = city === term || city.includes(term);
          const nameMatch = name.includes(term);
          const stateMatch = state.includes(term);
          const urlMatch = url.includes(term);
          
          return cityMatch || nameMatch || stateMatch || urlMatch;
        });
      });
      console.log(`Search filter "${filters.searchTerm}" (variations: ${searchVariations.join(', ')}): ${beforeCount} -> ${filteredSchools.length} schools`);
      
      // Log sample of what we're seeing if no matches
      if (filteredSchools.length === 0 && schools.length > 0) {
        console.log('Sample school names from API:', schools.slice(0, 10).map(s => s['school.name']).filter(Boolean));
        console.log('Sample cities from API:', schools.slice(0, 5).map(s => s['school.city']).filter(Boolean));
        console.log('Sample states from API:', schools.slice(0, 5).map(s => s['school.state']).filter(Boolean));
      }
    } else if (filters._usingApiCityFilter) {
      // If API already filtered by city, just filter by name for additional matching
      const searchLower = filters.searchTerm.toLowerCase().trim();
      const beforeCount = filteredSchools.length;
      
      // Create search variations
      const searchVariations = [searchLower];
      if (searchLower === 'medicine' || searchLower === 'med') {
        searchVariations.push('medical', 'medicine', 'med school', 'health');
      } else if (searchLower.includes('med')) {
        searchVariations.push('medical', 'medicine');
      }
      
      filteredSchools = filteredSchools.filter(school => {
        const name = (school['school.name'] || '').toLowerCase();
        const url = (school['school.school_url'] || '').toLowerCase();
        return searchVariations.some(term => name.includes(term) || url.includes(term));
      });
      console.log(`Name search filter "${filters.searchTerm}" (variations: ${searchVariations.join(', ')}): ${beforeCount} -> ${filteredSchools.length} schools (city already filtered by API)`);
    }

    console.log(`After filtering: ${filteredSchools.length} schools remain`);

    const result = {
      schools: filteredSchools,
      total: filteredSchools.length, // Filtered total
      page: page + 1,
      totalPages: Math.ceil(total / params.per_page),
      hasMore: schools.length === params.per_page && (page + 1) * params.per_page < total,
      rawTotal: total, // Keep track of raw API total
      rawCount: schools.length // Keep track of raw API count for this page
    };

    // Cache the result
    if (useCache) {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }

    // Limit results if maxResults specified
    if (maxResults && result.schools.length > maxResults) {
      result.schools = result.schools.slice(0, maxResults);
      result.hasMore = false;
    }

    return result;
  } catch (error) {
    console.error('Error fetching from API:', error);
    throw error;
  }
}

/**
 * Fetch multiple pages to get more results
 * @param {Object} filters - Filter criteria
 * @param {number} maxResults - Maximum number of schools to fetch
 * @returns {Promise<Array>} Array of schools
 */
export async function fetchSchoolsPaginated(filters = {}, maxResults = 500, onProgress = null) {
  const allSchools = [];
  let page = 0;
  let hasMore = true;
  
  // If searching by name/city, fetch many more pages to find matches
  // If filtering by region/states, also fetch more pages (client-side filtering)
  // Otherwise, limit to 10 pages for speed
  const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim();
  const hasRegionFilter = filters.states && filters.states.length > 0;
  const maxPages = (hasSearchTerm || hasRegionFilter) ? 50 : 10; // Fetch up to 50 pages when searching or filtering by region

  console.log(`Starting paginated fetch for up to ${maxResults} schools${hasSearchTerm ? ' (search mode: fetching more pages)' : ''}`);

  while (hasMore && allSchools.length < maxResults && page < maxPages) {
    try {
      const result = await fetchSchools(filters, {
        maxResults: maxResults - allSchools.length,
        page,
        useCache: true
      });

      console.log(`Page ${page + 1}: Got ${result.schools.length} filtered schools (${result.rawCount} raw from API)`);
      
      allSchools.push(...result.schools);
      
      // Report progress
      if (onProgress) {
        onProgress({
          page: page + 1,
          totalFound: allSchools.length,
          rawCount: result.rawCount,
          target: maxResults
        });
      }
      
      // If we got filtered results, continue fetching
      // hasMore should be based on whether API has more raw data, not filtered
      hasMore = result.hasMore && allSchools.length < maxResults;

      // If searching and got 0 results but API has more pages, continue fetching
      // This is important because search results might be on later pages
      if (hasSearchTerm && result.schools.length === 0 && result.hasMore) {
        console.log(`No matches on page ${page + 1}, but API has more pages. Continuing search...`);
        hasMore = true;
      }
      // If filtering by states and got 0 results but API has more pages,
      // continue fetching (might need more pages to find matching states)
      // But limit to 5 pages if no results found (to avoid wasting time)
      else if (filters.states && result.schools.length === 0 && result.hasMore && page < 5) {
        console.log(`No matches on page ${page + 1}, but API has more pages. Continuing...`);
        hasMore = true;
      } else if (filters.states && result.schools.length === 0 && page >= 5) {
        // Stop after 5 pages if no matches found
        console.log(`Stopped after ${page + 1} pages with no matches`);
        hasMore = false;
      }
      
      // If we found some matches while searching, we can stop early if we have enough
      if (hasSearchTerm && result.schools.length > 0 && allSchools.length >= 50) {
        console.log(`Found ${allSchools.length} matches, stopping early`);
        hasMore = false;
      }

      // Rate limiting: wait 0.5 seconds between pages (reduced from 2s for better UX)
      if (hasMore && page < maxPages - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      page++;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      break;
    }
  }

  console.log(`Paginated fetch complete: ${allSchools.length} schools from ${page} pages`);

  return {
    schools: allSchools.slice(0, maxResults),
    total: allSchools.length,
    fetchedPages: page
  };
}

/**
 * Search schools by name
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>} Matching schools
 */
export async function searchSchoolsByName(searchTerm, filters = {}, limit = 50) {
  // Note: College Scorecard API doesn't have a name search endpoint
  // We'll fetch and filter client-side, or use a different approach
  // For now, fetch a larger set and filter
  const result = await fetchSchoolsPaginated(filters, 1000);
  
  const searchLower = searchTerm.toLowerCase();
  const matches = result.schools.filter(school => {
    const name = school['school.name'] || '';
    return name.toLowerCase().includes(searchLower);
  });

  return matches.slice(0, limit);
}

/**
 * Get schools by major/program (requires program data)
 * Note: This would need IPEDS data or a different endpoint
 * For now, returns schools that might offer the major based on filters
 */
export async function getSchoolsByMajor(majorCipCode, filters = {}, limit = 100) {
  // This would ideally query programs table, but for live API
  // we'd need to fetch program data separately or use a different approach
  // For MVP, return schools with basic filters
  return fetchSchoolsPaginated(filters, limit);
}

/**
 * Clear API cache
 */
export function clearCache() {
  cache.clear();
}

