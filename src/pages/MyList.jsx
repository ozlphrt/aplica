/**
 * My List Page
 * Displays user's saved colleges
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import useSavedCollegesStore from '../stores/savedCollegesStore';
import { fetchSchoolsPaginated } from '../lib/scorecard-api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import CollegeCard from '../components/results/CollegeCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function MyList() {
  const navigate = useNavigate();
  const { savedCollegeIds, clearAll } = useSavedCollegesStore();
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
        setSavedColleges(colleges.filter(Boolean));
      } catch (err) {
        console.error('Error loading saved colleges:', err);
        setError(err.message || 'Failed to load saved colleges');
      } finally {
        setLoading(false);
      }
    }

    loadSavedColleges();
  }, [savedCollegeIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
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
        <Card glassmorphic={true} className="p-4">
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

