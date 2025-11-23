import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import Layout from './components/shared/Layout';
import { Card, CardHeader, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import ProfileQuestionnaire from './components/student/ProfileQuestionnaire';
import Results from './pages/Results';
import CollegeDetail from './pages/CollegeDetail';
import MyList from './pages/MyList';
import useStudentProfileStore from './stores/studentProfileStore';
import useSavedCollegesStore from './stores/savedCollegesStore';
import { generateMatches } from './lib/matching-algorithm';
import { calculateFitScore } from './lib/matching-algorithm';
import { calculateProfileCompleteness } from './lib/questionnaire-logic';
import { fetchSchoolsPaginated } from './lib/scorecard-api';
import Gauge from './components/ui/gauge';
// LiveAPISearch component available for background use but not displayed

function HomePage() {
  const navigate = useNavigate();
  const { answers } = useStudentProfileStore();
  const { savedCollegeIds } = useSavedCollegesStore();
  const [matches, setMatches] = useState([]);
  const [savedColleges, setSavedColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  
  useEffect(() => {
    async function loadMatches() {
      // Always clear matches first to prevent stale data
      setMatches([]);
      setLoading(false);
      
      // Only load matches if user has completed profile (has answers)
      if (!answers || Object.keys(answers).length === 0) {
        return;
      }
      
      // Use the same completeness check as the questionnaire
      // Only generate matches if Tier 1 is complete (canGenerateMatches = true)
      const completeness = calculateProfileCompleteness(answers);
      if (!completeness.canGenerateMatches) {
        return;
      }
      
      try {
        setLoading(true);
        const result = await generateMatches(answers, { limit: 50 });
        // Double-check: if result is empty or invalid, don't set matches
        if (result && result.matches && Array.isArray(result.matches) && result.matches.length > 0) {
          setMatches(result.matches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Error loading matches for home screen:', err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadMatches();
  }, [answers]);
  
  // Load saved colleges
  useEffect(() => {
    async function loadSavedColleges() {
      if (savedCollegeIds.length === 0) {
        setSavedColleges([]);
        setLoadingSaved(false);
        return;
      }

      try {
        setLoadingSaved(true);
        // First, try to get tier from matches if available (for consistency)
        const matchTierMap = new Map();
        matches.forEach(match => {
          if (match.id) {
            matchTierMap.set(match.id, match.academicTier);
          }
        });
        
        // Fetch each saved college by ID
        const collegePromises = savedCollegeIds.map(async (id) => {
          try {
            const result = await fetchSchoolsPaginated({ id: parseInt(id) }, 1);
            return result.schools[0];
          } catch (err) {
            console.error(`Error loading college ${id}:`, err);
            return null;
          }
        });

        const colleges = await Promise.all(collegePromises);
        // Calculate fit scores and academic tiers for each college
        const collegesWithFitScores = colleges
          .filter(Boolean)
          .map(college => {
            // First, check if we have the tier from matches (most reliable for consistency)
            const matchTier = matchTierMap.get(college.id);
            
            // Determine academicTier based ONLY on admission rate (most reliable and consistent)
            // This ensures the tier matches what's shown in the UI
            const admitRate = college['latest.admissions.admission_rate.overall'];
            let academicTier = 'target'; // default
            
            // Use match tier if available, otherwise use admission rate
            if (matchTier) {
              academicTier = matchTier;
            } else if (admitRate !== null && admitRate !== undefined) {
              if (admitRate < 0.4) {
                // Less than 40% = Reach (highly selective)
                academicTier = 'reach';
              } else if (admitRate > 0.65) {
                // More than 65% = Safety (less selective)
                academicTier = 'safety';
              } else {
                // Between 40% and 65% = Target
                academicTier = 'target';
              }
            }
            
            // Calculate fit score (but don't let it override tier)
            const result = calculateFitScore(college, answers || {});
            
            // ALWAYS override academicTier with our determination (from matches or admission rate)
            // This ensures consistency regardless of student profile
            result.academicTier = academicTier;
            
            return result;
          });
        setSavedColleges(collegesWithFitScores);
      } catch (err) {
        console.error('Error loading saved colleges:', err);
        setSavedColleges([]);
      } finally {
        setLoadingSaved(false);
      }
    }

    loadSavedColleges();
  }, [savedCollegeIds, answers, matches]);
  
  // Calculate counts from matches
  const reachMatches = matches.filter(m => m.academicTier === 'reach').length;
  const targetMatches = matches.filter(m => m.academicTier === 'target').length;
  const safetyMatches = matches.filter(m => m.academicTier === 'safety').length;
  
  // Calculate counts from saved colleges (My List)
  // Use useMemo to ensure counts are recalculated when savedColleges changes
  const { reachSaved, targetSaved, safetySaved } = useMemo(() => {
    const reach = savedColleges.filter(m => m?.academicTier === 'reach');
    const target = savedColleges.filter(m => m?.academicTier === 'target');
    const safety = savedColleges.filter(m => m?.academicTier === 'safety');
    
    return {
      reachSaved: reach.length,
      targetSaved: target.length,
      safetySaved: safety.length
    };
  }, [savedColleges]);
  
  console.log('Saved counts:', { reachSaved, targetSaved, safetySaved });
  
  // Calculate total counts
  const totalMatches = reachMatches + targetMatches + safetyMatches;
  const totalSaved = reachSaved + targetSaved + safetySaved;
  
  // Target counts (ideal list recommendations)
  const idealReach = 3;  // Ideal: 3
  const idealTarget = 5;  // Ideal: 5
  const idealSafety = 3;  // Ideal: 3
  const idealTotal = 11;  // Ideal total: 11
  
  const maxReach = 5;  // Maximum: 5
  const maxTarget = 8;  // Maximum: 8
  const maxSafety = 5;  // Maximum: 5
  const maxTotal = 15;  // Maximum: 15
  
  const minReach = 1;  // Minimum: 1 (recommended for balanced list)
  const minTarget = 3;  // Minimum: 3
  const minSafety = 2;  // Minimum: 2
  const minTotal = 5;  // Minimum: 5
  
  // Calculate gauge ranges
  // Max = max(recommended max, number of matches) - whichever is bigger
  // Min = min(recommended min, number of matches) - whichever is smaller, but at least 0
  const reachGaugeMax = Math.max(maxReach, reachMatches);
  const reachGaugeMin = Math.min(minReach, reachMatches);
  const targetGaugeMax = Math.max(maxTarget, targetMatches);
  const targetGaugeMin = Math.min(minTarget, targetMatches);
  const safetyGaugeMax = Math.max(maxSafety, safetyMatches);
  const safetyGaugeMin = Math.min(minSafety, safetyMatches);
  const totalGaugeMax = Math.max(maxTotal, totalMatches);
  const totalGaugeMin = Math.min(minTotal, totalMatches);
  
  // Ensure gauge min/max are valid (min < max, with at least 1 unit difference)
  // Also ensure min is at least 0
  const safeReachGaugeMin = Math.max(0, Math.min(reachGaugeMin, reachGaugeMax - 1));
  const safeTargetGaugeMin = Math.max(0, Math.min(targetGaugeMin, targetGaugeMax - 1));
  const safeSafetyGaugeMin = Math.max(0, Math.min(safetyGaugeMin, safetyGaugeMax - 1));
  const safeTotalGaugeMin = Math.max(0, Math.min(totalGaugeMin, totalGaugeMax - 1));
  

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-0 sm:px-0.5 md:px-1 lg:px-2 pt-1 sm:pt-2 pb-2 sm:pb-4">
      <div className="w-full max-w-[100%]">
        {/* Welcome Card */}
        <Card glassmorphic={true}>
          <CardContent className="text-center pt-6">
            {/* Recommended List Information */}
            <div className="mb-4 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-left mb-2">
                <p className="text-sm sm:text-base text-white font-bold mb-3">Recommended List</p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm">
                  {/* Header Row */}
                  <div className="font-bold text-white"></div>
                  <div className="font-bold text-white text-center">Reach</div>
                  <div className="font-bold text-white text-center">Target</div>
                  <div className="font-bold text-white text-center">Safety</div>
                  
                  {/* Minimum Row */}
                  <div className="text-white/90 font-semibold">Minimum</div>
                  <div className="text-white text-center">1</div>
                  <div className="text-white text-center">3</div>
                  <div className="text-white text-center">2</div>
                  
                  {/* Ideal Row */}
                  <div className="text-white/90 font-semibold">Ideal</div>
                  <div className="text-white text-center">3</div>
                  <div className="text-white text-center">5</div>
                  <div className="text-white text-center">3</div>
                  
                  {/* Maximum Row */}
                  <div className="text-white/90 font-semibold">Maximum</div>
                  <div className="text-white text-center">5</div>
                  <div className="text-white text-center">8</div>
                  <div className="text-white text-center">5</div>
                </div>
              </div>
            </div>
            
            {/* College List Categories - 2x2 matrix */}
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
              {/* Reach Card */}
              <Card 
                glassmorphic={true} 
                className="p-3 sm:p-4 md:p-5 min-h-[180px] flex flex-col cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => navigate('/results?tier=reach')}
              >
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-2">Reach</h3>
                  <div className="flex justify-center mb-2">
                    <Gauge
                      value={reachSaved}
                      min={safeReachGaugeMin}
                      max={reachGaugeMax}
                      ideal={idealReach}
                      recommendedMin={minReach}
                      recommendedMax={maxReach}
                      size={100}
                    />
                  </div>
                  <div className="text-xs text-white/60">
                    <p>{reachMatches} matched</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight mt-1">Highly selective schools</p>
                </div>
              </Card>

              {/* Target Card */}
              <Card 
                glassmorphic={true} 
                className="p-3 sm:p-4 md:p-5 min-h-[180px] flex flex-col cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => navigate('/results?tier=target')}
              >
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-2">Target</h3>
                  <div className="flex justify-center mb-2">
                    <Gauge
                      value={targetSaved}
                      min={safeTargetGaugeMin}
                      max={targetGaugeMax}
                      ideal={idealTarget}
                      recommendedMin={minTarget}
                      recommendedMax={maxTarget}
                      size={100}
                    />
                  </div>
                  <div className="text-xs text-white/60">
                    <p>{targetMatches} matched</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight mt-1">Good match schools</p>
                </div>
              </Card>

              {/* Safety Card */}
              <Card 
                glassmorphic={true} 
                className="p-3 sm:p-4 md:p-5 min-h-[180px] flex flex-col cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => navigate('/results?tier=safety')}
              >
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-2">Safety</h3>
                  <div className="flex justify-center mb-2">
                    <Gauge
                      value={safetySaved}
                      min={safeSafetyGaugeMin}
                      max={safetyGaugeMax}
                      ideal={idealSafety}
                      recommendedMin={minSafety}
                      recommendedMax={maxSafety}
                      size={100}
                    />
                  </div>
                  <div className="text-xs text-white/60">
                    <p>{safetyMatches} matched</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight mt-1">Backup options</p>
                </div>
              </Card>

              {/* Total Card */}
              <Card 
                glassmorphic={true} 
                className="p-3 sm:p-4 md:p-5 min-h-[180px] flex flex-col cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => navigate('/results?tier=all')}
              >
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-2">Total</h3>
                  <div className="flex justify-center mb-2">
                    <Gauge
                      value={totalSaved}
                      min={safeTotalGaugeMin}
                      max={totalGaugeMax}
                      ideal={idealTotal}
                      recommendedMin={minTotal}
                      recommendedMax={maxTotal}
                      size={100}
                    />
                  </div>
                  <div className="text-xs text-white/60">
                    <p>{totalMatches} matched</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight mt-1">All colleges</p>
                </div>
              </Card>
            </div>
          </CardContent>
          
          <CardFooter className="justify-center">
            {savedColleges.length > 0 ? (
              <Button 
                variant="primary" 
                size="lg" 
                className="shadow-lg"
                onClick={() => navigate('/my-list')}
              >
                View My List
              </Button>
            ) : matches.length > 0 ? (
              <Button 
                variant="primary" 
                size="lg" 
                className="shadow-lg"
                onClick={() => navigate('/results')}
              >
                View Matches
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                className="shadow-lg"
                onClick={() => navigate('/profile')}
              >
                Get Started
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfileQuestionnaire />} />
        <Route path="/results" element={<Results />} />
        <Route path="/college/:id" element={<CollegeDetail />} />
        <Route path="/my-list" element={<MyList />} />
      </Routes>
    </Layout>
  );
}

export default App;
