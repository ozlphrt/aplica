/**
 * Results Page
 * Displays college matches after questionnaire completion
 */
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Pencil, ArrowUpDown, Filter, X } from 'lucide-react';
import useStudentProfileStore from '../stores/studentProfileStore';
import { generateMatches } from '../lib/matching-algorithm';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Input } from '../components/ui/input';
import CollegeCard from '../components/results/CollegeCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function Results() {
  const navigate = useNavigate();
  const { answers } = useStudentProfileStore();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTier, setSelectedTier] = useState('all');
  const [sortBy, setSortBy] = useState('fitScore'); // fitScore, admissionRate, cost, name
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [showFilters, setShowFilters] = useState(false);
  const [costFilter, setCostFilter] = useState({ min: '', max: '' });
  const [stateFilter, setStateFilter] = useState('');
  const [selectedForComparison, setSelectedForComparison] = useState(new Set());

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        const result = await generateMatches(answers, { limit: 50 });
        setMatches(result.matches || []);
        if (result.warnings && result.warnings.length > 0) {
          console.warn('Matching warnings:', result.warnings);
        }
      } catch (err) {
        console.error('Error loading matches:', err);
        setError(err.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [answers]);

  // Calculate tier distribution
  const tierCounts = {
    all: matches.length,
    reach: matches.filter(m => m.academicTier === 'reach').length,
    target: matches.filter(m => m.academicTier === 'target').length,
    safety: matches.filter(m => m.academicTier === 'safety').length,
  };

  // Apply filters and sorting
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = matches;
    
    // Tier filter
    if (selectedTier !== 'all') {
      filtered = filtered.filter(m => m.academicTier === selectedTier);
    }
    
    // Cost filter
    if (costFilter.min || costFilter.max) {
      filtered = filtered.filter(school => {
        const cost = school['latest.cost.attendance.academic_year'] || 
                    school['latest.cost.avg_net_price.overall'] ||
                    school['latest.cost.tuition.in_state'] ||
                    school['latest.cost.tuition.out_of_state'];
        if (!cost) return true; // Include schools with missing cost data
        if (costFilter.min && cost < parseInt(costFilter.min)) return false;
        if (costFilter.max && cost > parseInt(costFilter.max)) return false;
        return true;
      });
    }
    
    // State filter
    if (stateFilter) {
      filtered = filtered.filter(school => school['school.state'] === stateFilter);
    }
    
    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'fitScore':
          aValue = a.fitScore || 0;
          bValue = b.fitScore || 0;
          break;
        case 'admissionRate':
          aValue = a['latest.admissions.admission_rate.overall'] || 1;
          bValue = b['latest.admissions.admission_rate.overall'] || 1;
          break;
        case 'cost':
          aValue = a['latest.cost.attendance.academic_year'] || 
                  a['latest.cost.avg_net_price.overall'] ||
                  a['latest.cost.tuition.in_state'] ||
                  a['latest.cost.tuition.out_of_state'] || 999999;
          bValue = b['latest.cost.attendance.academic_year'] || 
                  b['latest.cost.avg_net_price.overall'] ||
                  b['latest.cost.tuition.in_state'] ||
                  b['latest.cost.tuition.out_of_state'] || 999999;
          break;
        case 'name':
          aValue = (a['school.name'] || '').toLowerCase();
          bValue = (b['school.name'] || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });
    
    return sorted;
  }, [matches, selectedTier, sortBy, sortOrder, costFilter, stateFilter]);
  
  // Get unique states for filter dropdown
  const availableStates = useMemo(() => {
    const states = new Set();
    matches.forEach(school => {
      const state = school['school.state'];
      if (state) states.add(state);
    });
    return Array.from(states).sort();
  }, [matches]);
  
  const toggleComparison = (schoolId) => {
    const newSet = new Set(selectedForComparison);
    if (newSet.has(schoolId)) {
      newSet.delete(schoolId);
    } else {
      if (newSet.size < 3) { // Limit to 3 schools for comparison
        newSet.add(schoolId);
      }
    }
    setSelectedForComparison(newSet);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <LoadingSpinner />
            <p className="text-white/70 mt-4">Finding your matches...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <p className="text-error mb-4">{error}</p>
            <Button variant="primary" onClick={() => navigate('/profile')}>
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Card glassmorphic={true} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Your College Matches</h1>
              <p className="text-white/70 text-sm">
                Found {matches.length} {matches.length === 1 ? 'match' : 'matches'} based on your profile
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all hover:scale-105 hover:shadow-lg group"
              title="Edit Profile"
            >
              <User className="w-10 h-10 text-white group-hover:text-primary-300 transition-colors" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 group-hover:bg-primary-400 transition-colors">
                <Pencil className="w-4.5 h-4.5 text-white" />
              </div>
            </button>
          </div>
        </Card>
      </div>

      {matches.length === 0 ? (
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <EmptyState
              title="No matches found"
              description="Try adjusting your preferences or expanding your search criteria."
              action={
                <Button variant="primary" onClick={() => navigate('/profile')}>
                  Update Profile
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card glassmorphic={true} className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Mobile: Full width, Desktop: Auto */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Sort Controls */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial">
                <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 flex-shrink-0" />
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                  options={[
                    { value: 'fitScore', label: 'Fit Score' },
                    { value: 'admissionRate', label: 'Admission Rate' },
                    { value: 'cost', label: 'Cost' },
                    { value: 'name', label: 'Name' },
                  ]}
                  className="flex-1 sm:w-40"
                  glassmorphic={true}
                />
                <Button
                  variant="ghost"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-white/70 hover:text-white text-xs sm:text-sm whitespace-nowrap"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                  <span className="hidden sm:inline ml-1">{sortOrder === 'asc' ? 'Low to High' : 'High to Low'}</span>
                </Button>
              </div>
              
              {/* Filter Toggle */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {selectedForComparison.size > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Store selected IDs in sessionStorage for comparison page
                      const selectedIds = Array.from(selectedForComparison);
                      sessionStorage.setItem('comparisonSchools', JSON.stringify(selectedIds));
                      // For now, navigate to first school - could create dedicated comparison page
                      if (selectedIds.length > 0) {
                        navigate(`/college/${selectedIds[0]}`);
                      }
                    }}
                  >
                    Compare ({selectedForComparison.size})
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-white/70 hover:text-white"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Cost Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={costFilter.min}
                      onChange={(e) => setCostFilter({ ...costFilter, min: e.target.value })}
                      className="flex-1"
                      glassmorphic={true}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={costFilter.max}
                      onChange={(e) => setCostFilter({ ...costFilter, max: e.target.value })}
                      className="flex-1"
                      glassmorphic={true}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">State</label>
                  <Select
                    value={stateFilter}
                    onValueChange={setStateFilter}
                    options={[
                      { value: '', label: 'All States' },
                      ...availableStates.map(state => ({ value: state, label: state }))
                    ]}
                    className="w-full"
                    glassmorphic={true}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCostFilter({ min: '', max: '' });
                      setStateFilter('');
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
            </div>
          </Card>

          {/* Tier Filter Tiles - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedTier('all')}
              className={`p-6 rounded-xl transition-all ${
                selectedTier === 'all' 
                  ? 'bg-white/20 border-2 border-white/40 shadow-lg scale-[1.02]' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-left">
                <div className="text-sm text-white/70 mb-1">All Schools</div>
                <div className={`text-3xl font-bold ${
                  selectedTier === 'all' ? 'text-white' : 'text-white/90'
                }`}>
                  {tierCounts.all}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedTier('reach')}
              className={`p-6 rounded-xl transition-all ${
                selectedTier === 'reach' 
                  ? 'bg-reach-light/30 border-2 border-reach-light/60 shadow-lg scale-[1.02]' 
                  : 'bg-white/5 border border-white/10 hover:bg-reach-light/10 hover:border-reach-light/30'
              }`}
            >
              <div className="text-left">
                <div className="text-sm text-white/70 mb-1">Reach</div>
                <div className={`text-3xl font-bold ${
                  selectedTier === 'reach' ? 'text-reach-light' : 'text-white/90'
                }`}>
                  {tierCounts.reach}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedTier('target')}
              className={`p-6 rounded-xl transition-all ${
                selectedTier === 'target' 
                  ? 'bg-target-light/30 border-2 border-target-light/60 shadow-lg scale-[1.02]' 
                  : 'bg-white/5 border border-white/10 hover:bg-target-light/10 hover:border-target-light/30'
              }`}
            >
              <div className="text-left">
                <div className="text-sm text-white/70 mb-1">Target</div>
                <div className={`text-3xl font-bold ${
                  selectedTier === 'target' ? 'text-target-light' : 'text-white/90'
                }`}>
                  {tierCounts.target}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedTier('safety')}
              className={`p-6 rounded-xl transition-all ${
                selectedTier === 'safety' 
                  ? 'bg-safety-light/30 border-2 border-safety-light/60 shadow-lg scale-[1.02]' 
                  : 'bg-white/5 border border-white/10 hover:bg-safety-light/10 hover:border-safety-light/30'
              }`}
            >
              <div className="text-left">
                <div className="text-sm text-white/70 mb-1">Safety</div>
                <div className={`text-3xl font-bold ${
                  selectedTier === 'safety' ? 'text-safety-light' : 'text-white/90'
                }`}>
                  {tierCounts.safety}
                </div>
              </div>
            </button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-white/60">
            Showing {filteredAndSortedMatches.length} of {matches.length} schools
            {selectedTier !== 'all' && ` (${selectedTier} tier)`}
          </div>

          {/* College List */}
          <div>
            <div className="space-y-4">
              {filteredAndSortedMatches.map((school, index) => {
                const schoolId = school.id || school['id'];
                const isSelected = selectedForComparison.has(schoolId);
                return (
                  <div key={schoolId || index} className="relative">
                    {isSelected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-full bg-primary-500 rounded-l-lg z-10" />
                    )}
                    <CollegeCard 
                      school={school}
                      onClick={() => {
                        if (schoolId) {
                          navigate(`/college/${schoolId}`);
                        }
                      }}
                      onSelect={() => toggleComparison(schoolId)}
                      isSelected={isSelected}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

