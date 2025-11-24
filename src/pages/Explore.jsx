/**
 * Explore Page
 * Search schools by major, name, or location
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, MapPin, Building2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { fetchSchools, fetchSchoolsPaginated, searchSchoolsByName } from '../lib/scorecard-api';
import CollegeCard from '../components/results/CollegeCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

// Common college abbreviations mapping
const COLLEGE_ABBREVIATIONS = {
  'mit': 'massachusetts institute of technology',
  'wsu': 'washington state university',
  'lsu': 'louisiana state university',
  'uw': 'university of washington',
  'uc': 'university of california',
  'ucla': 'university of california los angeles',
  'ucb': 'university of california berkeley',
  'usc': 'university of southern california',
  'nyu': 'new york university',
  'gt': 'georgia tech',
  'gtu': 'georgia institute of technology',
  'cmu': 'carnegie mellon university',
  'uiuc': 'university of illinois urbana champaign',
  'ut': 'university of texas',
  'uta': 'university of texas austin',
  'psu': 'pennsylvania state university',
  'osu': 'ohio state university',
  'asu': 'arizona state university',
  'fsu': 'florida state university',
  'uva': 'university of virginia',
  'unc': 'university of north carolina',
  'duke': 'duke university',
  'stanford': 'stanford university',
  'harvard': 'harvard university',
  'yale': 'yale university',
  'princeton': 'princeton university',
  'columbia': 'columbia university',
  'cornell': 'cornell university',
  'brown': 'brown university',
  'dartmouth': 'dartmouth college',
  'upenn': 'university of pennsylvania',
  'penn': 'university of pennsylvania',
  'bu': 'boston university',
  'bc': 'boston college',
  'tufts': 'tufts university',
  'northeastern': 'northeastern university',
  'baylor': 'baylor university',
  'byu': 'brigham young university',
  'tamu': 'texas a&m university',
  'uga': 'university of georgia',
};

// State name to abbreviation mapping
const STATE_NAMES = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC', 'washington dc': 'DC',
};

// All valid state abbreviations
const ALL_STATE_ABBREVIATIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

// Function to detect and convert state name/abbreviation to state code
function detectState(searchTerm) {
  const lower = searchTerm.toLowerCase().trim();
  
  // Check if it's already a valid state abbreviation
  const upper = searchTerm.toUpperCase().trim();
  if (ALL_STATE_ABBREVIATIONS.includes(upper)) {
    return upper;
  }
  
  // Check if it's a state name
  if (STATE_NAMES[lower]) {
    return STATE_NAMES[lower];
  }
  
  // Check partial matches (e.g., "washington" matches "washington")
  for (const [name, abbr] of Object.entries(STATE_NAMES)) {
    if (name.includes(lower) || lower.includes(name)) {
      return abbr;
    }
  }
  
  return null;
}

// Function to check if an abbreviation matches a school name by initials
// e.g., "BU" matches "Boston University" (B from Boston, U from University)
function matchesAbbreviation(abbreviation, schoolName) {
  const abbr = abbreviation.toUpperCase();
  const name = schoolName.toUpperCase();
  
  // Split name into words
  const words = name.split(/\s+/).filter(word => word.length > 0);
  
  // Check if abbreviation matches first letters of words
  if (words.length >= abbr.length) {
    const initials = words.map(word => word[0]).join('');
    
    // Exact match: "BU" matches "Boston University" → "BU"
    if (initials === abbr) {
      return true;
    }
    
    // Partial match: "BU" matches "Boston University" if initials start with "BU"
    if (initials.startsWith(abbr)) {
      return true;
    }
    
    // Check if abbreviation appears as consecutive first letters
    // e.g., "MIT" in "Massachusetts Institute of Technology"
    let abbrIndex = 0;
    for (const word of words) {
      if (word[0] === abbr[abbrIndex]) {
        abbrIndex++;
        if (abbrIndex === abbr.length) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Function to expand abbreviations and create search variations
function expandSearchTerm(term) {
  const lower = term.toLowerCase().trim();
  const variations = [lower];
  
  // Check if it's a known abbreviation
  if (COLLEGE_ABBREVIATIONS[lower]) {
    variations.push(COLLEGE_ABBREVIATIONS[lower]);
  }
  
  // Also check if any abbreviation maps to this term
  Object.entries(COLLEGE_ABBREVIATIONS).forEach(([abbr, full]) => {
    if (full.includes(lower) || lower.includes(abbr)) {
      variations.push(abbr, full);
    }
  });
  
  return [...new Set(variations)]; // Remove duplicates
}

// Function to sort schools by quality (selectivity, reputation)
function sortByQuality(schools) {
  return schools.sort((a, b) => {
    // Primary: Admission rate (lower = more selective = better)
    const rateA = a['latest.admissions.admission_rate.overall'];
    const rateB = b['latest.admissions.admission_rate.overall'];
    
    // If both have admission rates, sort by selectivity
    if (rateA !== null && rateA !== undefined && rateB !== null && rateB !== undefined) {
      return rateA - rateB; // Lower rate = more selective
    }
    
    // If only one has rate, prioritize it
    if (rateA !== null && rateA !== undefined) return -1;
    if (rateB !== null && rateB !== undefined) return 1;
    
    // Secondary: SAT scores (higher = better)
    const satA = (a['latest.admissions.sat_scores.midpoint.math'] || 0) + 
                 (a['latest.admissions.sat_scores.midpoint.critical_reading'] || 0);
    const satB = (b['latest.admissions.sat_scores.midpoint.math'] || 0) + 
                 (b['latest.admissions.sat_scores.midpoint.critical_reading'] || 0);
    
    if (satA > 0 && satB > 0) {
      return satB - satA; // Higher SAT = better
    }
    
    // Tertiary: ACT scores
    const actA = a['latest.admissions.act_scores.midpoint.cumulative'] || 0;
    const actB = b['latest.admissions.act_scores.midpoint.cumulative'] || 0;
    
    if (actA > 0 && actB > 0) {
      return actB - actA; // Higher ACT = better
    }
    
    // If all else equal, keep original order
    return 0;
  });
}

export default function Explore() {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState('name'); // 'major', 'name', 'location'
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let schools = [];
      const searchVariations = expandSearchTerm(searchTerm);

      if (searchMode === 'name') {
        // Search by school name
        let allSchools = [];
        
        // Detect if search term (or its expansion) contains a state name
        // First expand abbreviations, then check for state names
        const searchLower = searchTerm.toLowerCase().trim();
        let detectedState = null;
        
        // Check all search variations (including expanded abbreviations) for state names
        for (const variation of searchVariations) {
          for (const [stateName, stateAbbr] of Object.entries(STATE_NAMES)) {
            if (variation.includes(stateName)) {
              detectedState = stateAbbr;
              break;
            }
          }
          if (detectedState) break;
        }
        
        // If we detected a state, search by state first (much faster and more reliable)
        if (detectedState) {
          console.log(`Detected state ${detectedState} in search term, searching by state first`);
          const maxPages = 3; // Only need a few pages when filtering by state
          
          for (let page = 0; page < maxPages; page++) {
            const result = await fetchSchools({ state: detectedState }, { page, maxResults: 100 });
            
            // Filter by name using all variations
            // Check if search term looks like an abbreviation (2-4 uppercase letters)
            const isAbbreviation = /^[A-Z]{2,4}$/i.test(searchTerm.trim());
            const hasAbbreviationMapping = COLLEGE_ABBREVIATIONS[searchLower];
            const fullName = hasAbbreviationMapping ? COLLEGE_ABBREVIATIONS[searchLower] : null;
            
            const filtered = result.schools.filter(school => {
              const name = school['school.name'] || '';
              const nameLower = name.toLowerCase();
              
              // If we have a full name from abbreviation mapping, prioritize exact match
              if (fullName && nameLower.includes(fullName)) {
                return true;
              }
              
              // If it looks like an abbreviation, check if it matches by initials
              if (isAbbreviation && matchesAbbreviation(searchTerm.trim(), name)) {
                return true;
              }
              
              // Check if any variation matches
              const matchesVariation = searchVariations.some(variation => nameLower.includes(variation));
              
              // For abbreviations, be more strict
              if (isAbbreviation && !hasAbbreviationMapping) {
                // Only match if abbreviation matches by initials
                return matchesAbbreviation(searchTerm.trim(), name);
              }
              
              // Also check if the original search term appears in the name
              const matchesAbbreviation = nameLower.includes(searchLower) || 
                                         name.split(/\s+/).some(word => word.toLowerCase().startsWith(searchLower));
              return matchesVariation || matchesAbbreviation;
            });
            
            allSchools.push(...filtered);
            
            // If we found enough matches, stop early
            if (allSchools.length >= 20) {
              break;
            }
            
            // If API has no more pages, stop
            if (!result.hasMore) {
              break;
            }
            
            if (page < maxPages - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        } else {
          // No state detected - use searchTerm (slower, need more pages)
          const maxPages = 10; // Search more pages for general name searches
          
          // Try searching with the expanded term first (e.g., "washington state university" for "wsu")
          const primarySearchTerm = searchVariations.length > 1 ? searchVariations[1] : searchTerm.trim();
          
          for (let page = 0; page < maxPages; page++) {
            // Use the expanded term for API search
            const result = await fetchSchools({ searchTerm: primarySearchTerm }, { page, maxResults: 100 });
            
            // Filter by name using all variations
            // Check if search term looks like an abbreviation (2-4 uppercase letters)
            const isAbbreviation = /^[A-Z]{2,4}$/i.test(searchTerm.trim());
            const hasAbbreviationMapping = COLLEGE_ABBREVIATIONS[searchLower];
            const fullName = hasAbbreviationMapping ? COLLEGE_ABBREVIATIONS[searchLower] : null;
            
            const filtered = result.schools.filter(school => {
              const name = school['school.name'] || '';
              const nameLower = name.toLowerCase();
              
              // If we have a full name from abbreviation mapping, prioritize exact match
              if (fullName && nameLower.includes(fullName)) {
                return true;
              }
              
              // If it looks like an abbreviation, check if it matches by initials
              if (isAbbreviation && matchesAbbreviation(searchTerm.trim(), name)) {
                return true;
              }
              
              // Check if any variation matches
              const matchesVariation = searchVariations.some(variation => nameLower.includes(variation));
              
              // For abbreviations, be more strict
              if (isAbbreviation && !hasAbbreviationMapping) {
                // Only match if abbreviation matches by initials
                return matchesAbbreviation(searchTerm.trim(), name);
              }
              
              // Also check if the original search term appears in the name
              const matchesAbbreviation = nameLower.includes(searchLower) || 
                                         name.split(/\s+/).some(word => word.toLowerCase().startsWith(searchLower));
              return matchesVariation || matchesAbbreviation;
            });
            
            allSchools.push(...filtered);
            
            // If we found enough matches, stop early
            if (allSchools.length >= 20) {
              break;
            }
            
            // If no matches on this page and we've checked a few pages, try original term
            if (filtered.length === 0 && page >= 3 && primarySearchTerm !== searchTerm.trim()) {
              // Try with original term as fallback
              const fallbackResult = await fetchSchools({ searchTerm: searchTerm.trim() }, { page: 0, maxResults: 100 });
              const fallbackFiltered = fallbackResult.schools.filter(school => {
                const name = (school['school.name'] || '').toLowerCase();
                return searchVariations.some(variation => name.includes(variation));
              });
              allSchools.push(...fallbackFiltered);
              break;
            }
            
            // If API has no more pages, stop
            if (!result.hasMore) {
              break;
            }
            
            // Small delay between pages to avoid rate limiting
            if (page < maxPages - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
        
        // Sort by quality and limit to top 10
        schools = sortByQuality(allSchools).slice(0, 10);
      } else if (searchMode === 'location') {
        // Search by city, state, or region
        // First, check if it's a state abbreviation or name
        const detectedState = detectState(searchTerm);
        let allSchools = [];
        const maxPages = 3;
        
        if (detectedState) {
          // Use state filter for better performance
          console.log(`Detected state: ${detectedState} for search term: ${searchTerm}`);
          for (let page = 0; page < maxPages; page++) {
            const result = await fetchSchools({ state: detectedState }, { page, maxResults: 100 });
            allSchools.push(...result.schools);
            
            if (allSchools.length >= 20 || !result.hasMore) {
              break;
            }
            
            if (page < maxPages - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        } else {
          // Search by city or region name
          for (let page = 0; page < maxPages; page++) {
            const result = await fetchSchools({ searchTerm: searchTerm.trim() }, { page, maxResults: 100 });
            allSchools.push(...result.schools);
            
            if (allSchools.length >= 20 || !result.hasMore) {
              break;
            }
            
            if (page < maxPages - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
        
        // Sort by quality and limit to top 10
        schools = sortByQuality(allSchools).slice(0, 10);
      } else if (searchMode === 'major') {
        // Search by major - fetch only first 2 pages for speed
        let allSchools = [];
        const maxPages = 2;
        
        for (let page = 0; page < maxPages; page++) {
          const result = await fetchSchools({}, { page, maxResults: 100 });
          allSchools.push(...result.schools);
          
          if (!result.hasMore) {
            break;
          }
          
          if (page < maxPages - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        // Sort by quality and limit to top 10
        schools = sortByQuality(allSchools).slice(0, 10);
      }

      setResults(schools);
      if (schools.length === 0) {
        setError('No schools found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-0 sm:px-0.5 md:px-1 lg:px-2 pt-1 sm:pt-2 pb-2 sm:pb-4">
      <div className="w-full max-w-6xl">
        <Card glassmorphic={true}>
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:text-white/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-white">Explore Schools</h1>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Search Mode Selection */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={searchMode === 'name' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSearchMode('name');
                  setSearchTerm('');
                  setResults([]);
                  setError(null);
                }}
                className="flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                School Name
              </Button>
              <Button
                variant={searchMode === 'major' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSearchMode('major');
                  setSearchTerm('');
                  setResults([]);
                  setError(null);
                }}
                className="flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Major
              </Button>
              <Button
                variant={searchMode === 'location' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSearchMode('location');
                  setSearchTerm('');
                  setResults([]);
                  setError(null);
                }}
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Location
              </Button>
            </div>

            {/* Search Input */}
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder={
                  searchMode === 'name'
                    ? 'Enter school name (e.g., Harvard, MIT)'
                    : searchMode === 'major'
                    ? 'Enter major (e.g., Computer Science, Engineering)'
                    : 'Enter city, state, or region (e.g., Boston, MA or Northeast)'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                glassmorphic={true}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>

            {/* Info Message for Major Search */}
            {searchMode === 'major' && (
              <div className="mb-4 p-3 rounded-lg bg-info/20 border border-info/30 text-sm text-white/90">
                <p>
                  <strong>Note:</strong> Full major filtering is coming soon. Currently showing top schools by selectivity.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-white">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div className="space-y-4">
                <div className="text-white/80 text-sm mb-4">
                  Found {results.length} {results.length === 1 ? 'school' : 'schools'}
                </div>
                <div className="grid gap-4">
                  {results.map((school) => (
                    <CollegeCard
                      key={school.id}
                      school={school}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && !error && (
              <EmptyState
                title="Start Exploring"
                description={
                  searchMode === 'name'
                    ? 'Enter a school name to search'
                    : searchMode === 'major'
                    ? 'Enter a major to find top schools'
                    : 'Enter a city, state, or region to search'
                }
                icon={Search}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

