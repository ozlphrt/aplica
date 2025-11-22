/**
 * Live API Search Component
 * Search schools using live College Scorecard API with filters
 */
import { useState } from 'react';
import { useScorecardAPI } from '../../hooks/useScorecardAPI';
import { getRegionOptions, getStatesForRegion } from '../../utils/regions';
import { getMajorOptions } from '../../utils/majors';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Badge } from '../ui/badge';

export default function LiveAPISearch() {
  const { schools, total, loading, error, searchPaginated } = useScorecardAPI();
  const [filters, setFilters] = useState({
    region: '',
    size: '',
    setting: '',
    control: '',
    maxCost: '',
    major: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState(null);
  const regionOptions = getRegionOptions();
  const majorOptions = getMajorOptions();

  const handleSearch = async () => {
    const apiFilters = {
      ...filters,
      maxCost: filters.maxCost ? parseInt(filters.maxCost) : undefined,
      searchTerm: searchTerm.trim() || undefined, // Add search term to filters
    };
    
    // Convert region to states if region is selected
    if (filters.region) {
      apiFilters.states = getStatesForRegion(filters.region);
      delete apiFilters.region; // Remove region, use states instead
      console.log('Region converted to states:', apiFilters.states);
    }
    
    // Remove empty filters
    Object.keys(apiFilters).forEach(key => {
      if (apiFilters[key] === '' || 
          apiFilters[key] === undefined ||
          (Array.isArray(apiFilters[key]) && apiFilters[key].length === 0)) {
        delete apiFilters[key];
      }
    });

    console.log('Searching with filters:', apiFilters);
    // If searching by name/city, fetch more results to find matches
    // The API will fetch many pages until it finds matches
    const maxResults = searchTerm.trim() ? 200 : 100;
    setProgress({ page: 0, totalFound: 0, rawCount: 0, target: maxResults });
    await searchPaginated(apiFilters, maxResults, (progressData) => {
      setProgress(progressData);
    });
    setProgress(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card glassmorphic={true}>
        <CardHeader>
          <h2 className="text-2xl font-bold text-white">Live API Search</h2>
          <p className="text-white/70 mt-2">
            Search colleges using live College Scorecard API data
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              glassmorphic={true}
              placeholder="Search by school name, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-1"
            />
            <Button 
              variant="primary" 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-white/5 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Region
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              >
                <option value="">All Regions</option>
                {regionOptions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Major
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={filters.major}
                onChange={(e) => setFilters({ ...filters, major: e.target.value })}
              >
                {majorOptions.map(major => (
                  <option key={major.value} value={major.value}>
                    {major.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Size
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              >
                <option value="">All Sizes</option>
                <option value="small">Small (&lt;5,000)</option>
                <option value="medium">Medium (5,000-15,000)</option>
                <option value="large">Large (&gt;15,000)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Setting
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={filters.setting}
                onChange={(e) => setFilters({ ...filters, setting: e.target.value })}
              >
                <option value="">All Settings</option>
                <option value="city">City</option>
                <option value="suburb">Suburban</option>
                <option value="town">Town</option>
                <option value="rural">Rural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Control
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={filters.control}
                onChange={(e) => setFilters({ ...filters, control: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="public">Public</option>
                <option value="private-nonprofit">Private Nonprofit</option>
                <option value="private-for-profit">Private For-Profit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Max Cost ($)
              </label>
              <Input
                glassmorphic={true}
                type="number"
                placeholder="50000"
                value={filters.maxCost}
                onChange={(e) => setFilters({ ...filters, maxCost: e.target.value })}
              />
            </div>
          </div>

          {/* Test Button - Fetch without filters */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                console.log('Testing API without filters...');
                setProgress({ page: 0, totalFound: 0, rawCount: 0, target: 50 });
                await searchPaginated({}, 50, (progressData) => {
                  setProgress(progressData);
                });
                setProgress(null);
              }}
              disabled={loading}
            >
              Test API (No Filters)
            </Button>
          </div>

          {/* Status */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="mt-4 text-white/70">Fetching from API...</span>
              {progress && (
                <div className="mt-4 text-sm text-white/60">
                  <p>Page {progress.page} • Found {progress.totalFound} schools</p>
                  {progress.rawCount > 0 && (
                    <p className="text-xs text-white/50 mt-1">
                      {progress.rawCount} schools on this page
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 font-semibold">Error: {error}</p>
              <p className="text-red-200/80 text-sm mt-2">
                Check browser console for detailed logs.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && schools.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Results ({total} schools)
                </h3>
                <div className="flex gap-2 items-center">
                  <Badge variant="neutral">{total} found</Badge>
                  {total >= 100 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        const apiFilters = {
                          ...filters,
                          maxCost: filters.maxCost ? parseInt(filters.maxCost) : undefined,
                        };
                        if (filters.region) {
                          apiFilters.states = getStatesForRegion(filters.region);
                          delete apiFilters.region;
                        }
                        Object.keys(apiFilters).forEach(key => {
                          if (apiFilters[key] === '' || (Array.isArray(apiFilters[key]) && apiFilters[key].length === 0)) {
                            delete apiFilters[key];
                          }
                        });
                        setProgress({ page: 0, totalFound: total, rawCount: 0, target: 500 });
                        await searchPaginated(apiFilters, 500, (progressData) => {
                          setProgress(progressData);
                        });
                        setProgress(null);
                      }}
                      disabled={loading}
                    >
                      Load More (up to 500)
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white">
                          {school['school.name'] || 'Unknown'}
                        </h4>
                        <p className="text-sm text-white/70">
                          {school['school.city']}, {school['school.state']}
                        </p>
                        {school['latest.student.size'] && (
                          <p className="text-xs text-white/60 mt-1">
                            Size: {school['latest.student.size'].toLocaleString()} students
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-white/60">
                        {school['latest.admissions.admission_rate.overall'] !== null && (
                          <p>
                            Admit: {(school['latest.admissions.admission_rate.overall'] * 100).toFixed(1)}%
                          </p>
                        )}
                        {school['latest.cost.attendance.academic_year'] && (
                          <p>
                            Cost: ${school['latest.cost.attendance.academic_year'].toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && schools.length === 0 && !error && (
            <p className="text-white/60 text-center py-8">
              No schools found. Try adjusting your filters or search term.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

