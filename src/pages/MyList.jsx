/**
 * My List Page
 * Displays user's saved colleges
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import useSavedCollegesStore from '../stores/savedCollegesStore';
import useStudentProfileStore from '../stores/studentProfileStore';
import { fetchSchoolsPaginated } from '../lib/scorecard-api';
import { calculateFitScore } from '../lib/matching-algorithm';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import CollegeCard from '../components/results/CollegeCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function MyList() {
  const navigate = useNavigate();
  const { savedCollegeIds, clearAll } = useSavedCollegesStore();
  const { answers } = useStudentProfileStore();
  const [savedColleges, setSavedColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSavedColleges() {
      if (savedCollegeIds.length === 0) {
        setSavedColleges([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        // Use the same logic as App.jsx to ensure consistency
        const collegesWithFitScores = colleges
          .filter(Boolean)
          .map(college => {
            // Determine academicTier based ONLY on admission rate (most reliable and consistent)
            const admitRate = college['latest.admissions.admission_rate.overall'];
            let academicTier = 'target'; // default
            if (admitRate !== null && admitRate !== undefined) {
              if (admitRate < 0.4) {
                academicTier = 'reach';
              } else if (admitRate > 0.65) {
                academicTier = 'safety';
              } else {
                academicTier = 'target';
              }
            }
            
            // Calculate fit score
            const result = calculateFitScore(college, answers || {});
            
            // ALWAYS override academicTier with admission-rate-based determination
            result.academicTier = academicTier;
            
            return result;
          });
        setSavedColleges(collegesWithFitScores);
      } catch (err) {
        console.error('Error loading saved colleges:', err);
        setError(err.message || 'Failed to load saved colleges');
      } finally {
        setLoading(false);
      }
    }

    loadSavedColleges();
  }, [savedCollegeIds, answers]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-0 sm:px-0.5 md:px-1 lg:px-2 xl:px-3 py-1 sm:py-2 md:py-3 lg:py-4 xl:py-6">
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <LoadingSpinner />
            <p className="text-white/70 mt-4">Loading your saved colleges...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Card glassmorphic={true} className="p-2 sm:p-3 md:p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-400" />
                My Saved Colleges
              </h1>
              <p className="text-white/70 text-sm">
                {savedColleges.length} {savedColleges.length === 1 ? 'college saved' : 'colleges saved'}
              </p>
            </div>
            {savedColleges.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all saved colleges?')) {
                    clearAll();
                    setSavedColleges([]);
                  }
                }}
                className="text-white/70 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </Card>
      </div>

      {savedColleges.length === 0 ? (
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <EmptyState
              title="No saved colleges yet"
              description="Start exploring colleges and save your favorites to build your list."
              action={
                <Button variant="primary" onClick={() => navigate('/results')}>
                  Browse Colleges
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedColleges.map((school, index) => {
            const schoolId = school.id || school['id'];
            return (
              <CollegeCard
                key={schoolId || index}
                school={school}
                onClick={() => {
                  if (schoolId) {
                    navigate(`/college/${schoolId}`);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

