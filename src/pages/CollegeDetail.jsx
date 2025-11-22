/**
 * College Detail Page
 * Shows comprehensive information about a specific college
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import { fetchSchoolsPaginated } from '../lib/scorecard-api';
import useStudentProfileStore from '../stores/studentProfileStore';
import { getHighResLogoUrl, getFallbackLogo } from '../utils/collegeLogos';
import { getSchoolColorFilter } from '../utils/schoolColors';
import FitSummary from '../components/details/FitSummary';
import ScoreBreakdown from '../components/details/ScoreBreakdown';
import SchoolLink from '../components/details/SchoolLink';
import GeneralInfo from '../components/details/GeneralInfo';
import AdmissionsProfile from '../components/details/AdmissionsProfile';
import FinancialBreakdown from '../components/details/FinancialBreakdown';
import OutcomesMetrics from '../components/details/OutcomesMetrics';
import CampusInfo from '../components/details/CampusInfo';

export default function CollegeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { answers } = useStudentProfileStore();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    async function loadSchool() {
      try {
        setLoading(true);
        // Fetch school by ID
        const schoolId = parseInt(id);
        if (isNaN(schoolId)) {
          setError('Invalid school ID');
          return;
        }
        
        const result = await fetchSchoolsPaginated({ id: schoolId }, 1);
        
        if (result.schools && result.schools.length > 0) {
          let loadedSchool = result.schools[0];
          
          // If we have student profile, calculate fit scores directly
          if (answers && Object.keys(answers).length > 0) {
            try {
              // Calculate fit scores for this specific school
              const { calculateDetailedFitScores } = await import('../utils/fit-calculator');
              const { scores } = calculateDetailedFitScores(loadedSchool, answers);
              
              // Calculate academic tier
              const admitRate = loadedSchool['latest.admissions.admission_rate.overall'];
              let academicTier = 'target';
              if (admitRate !== null && admitRate !== undefined) {
                if (admitRate < 0.4) {
                  academicTier = 'reach';
                } else if (admitRate > 0.65) {
                  academicTier = 'safety';
                }
              }
              
              loadedSchool = {
                ...loadedSchool,
                fitScore: scores.overall,
                academicTier,
              };
            } catch (err) {
              console.warn('Could not calculate fit scores:', err);
            }
          }
          
          setSchool(loadedSchool);
        } else {
          setError('School not found');
        }
      } catch (err) {
        console.error('Error loading school:', err);
        setError(err.message || 'Failed to load school details');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSchool();
    }
  }, [id, answers]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <LoadingSpinner />
            <p className="text-white/70 mt-4">Loading college details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <EmptyState
              title="College not found"
              description={error || "The college you're looking for doesn't exist or couldn't be loaded."}
              action={
                <Button variant="primary" onClick={() => navigate('/results')}>
                  Back to Results
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const name = school['school.name'] || 'Unknown College';
  const city = school['school.city'] || '';
  const state = school['school.state'] || '';
  const location = [city, state].filter(Boolean).join(', ');
  const logoUrl = getHighResLogoUrl(school);
  const fallbackLogo = getFallbackLogo(name);
  const colorFilter = getSchoolColorFilter(name);

  const fitScore = school.fitScore || 0;
  const academicTier = school.academicTier || 'target';
  const admitRate = school['latest.admissions.admission_rate.overall'];
  
  const tierColors = {
    reach: 'bg-red-500/20 text-red-200 border-red-500/40',
    target: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
    safety: 'bg-green-500/20 text-green-200 border-green-500/40',
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/results')}
        className="mb-2 hover:bg-white/10 transition-all"
      >
        ← Back to Results
      </Button>

      {/* College Header - Enhanced */}
      <Card glassmorphic={true} className="overflow-hidden border-2 border-white/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-start gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logoUrl && !logoError ? (
                <div className="w-24 h-24 rounded-full border-2 border-white/30 bg-white/10 p-2 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className="w-full h-full rounded-full object-contain"
                    style={{ filter: colorFilter }}
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-white/30 bg-white/10 p-2 flex items-center justify-center">
                  <img
                    src={fallbackLogo}
                    alt={`${name} initial`}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="w-full">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white leading-tight mb-3 break-words">{name}</h1>
                {academicTier && (
                  <Badge className={`${tierColors[academicTier] || tierColors.target} text-sm px-3 py-1 border rounded-full font-semibold whitespace-nowrap inline-block`}>
                    {academicTier.charAt(0).toUpperCase() + academicTier.slice(1)}
                  </Badge>
                )}
              </div>
              {location && (
                <p className="text-white/70 text-xl mb-6">{location}</p>
              )}
              {answers && Object.keys(answers).length > 0 && fitScore > 0 && (
                <div className="flex items-start gap-8 mt-6">
                  <div>
                    <div className="text-sm text-white/60 mb-1">Overall Fit Score</div>
                    <div className="text-3xl font-bold text-white">{fitScore}</div>
                  </div>
                  {admitRate !== null && admitRate !== undefined && (
                    <div className="pl-8 border-l border-white/20">
                      <div className="text-sm text-white/60 mb-1">Admission Rate</div>
                      <div className="text-2xl font-semibold text-white">{(admitRate * 100).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section A: Summary of why it's a good fit */}
      {answers && Object.keys(answers).length > 0 && (
        <FitSummary school={school} />
      )}

      {/* Section B: Overall score breakdown and detailed scores */}
      {answers && Object.keys(answers).length > 0 && (
        <ScoreBreakdown school={school} />
      )}

      {/* Section C: Link to school URL */}
      <SchoolLink school={school} />

      {/* Section D: Admissions Profile */}
      {answers && Object.keys(answers).length > 0 && (
        <AdmissionsProfile school={school} />
      )}

      {/* Section E: Financial Breakdown */}
      <FinancialBreakdown school={school} />

      {/* Section F: Outcomes Metrics */}
      <OutcomesMetrics school={school} />

      {/* Section G: Campus Information */}
      <CampusInfo school={school} />

      {/* Section H: General information about school */}
      <GeneralInfo school={school} />
    </div>
  );
}

