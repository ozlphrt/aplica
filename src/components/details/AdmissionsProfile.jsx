/**
 * Admissions Profile Component
 * Shows admission statistics and student positioning
 */
import { Card, CardContent } from '../ui/card';
import { TrendingUp, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import useStudentProfileStore from '../../stores/studentProfileStore';

export default function AdmissionsProfile({ school }) {
  const { answers } = useStudentProfileStore();
  
  const admitRate = school['latest.admissions.admission_rate.overall'];
  const satMath = school['latest.admissions.sat_scores.midpoint.math'];
  const satEbrw = school['latest.admissions.sat_scores.midpoint.critical_reading'];
  const satTotal = satMath && satEbrw ? satMath + satEbrw : null;
  const actComposite = school['latest.admissions.act_scores.midpoint.cumulative'];
  
  const studentGPA = answers?.gpa;
  const studentSAT = answers?.sat_score;
  const studentACT = answers?.act_score;
  const classRankPercentile = answers?.class_rank_percentile;
  const courseRigor = answers?.course_rigor;
  const academicTier = school.academicTier || 'target';
  
  // Calculate admission probability with Tier 2 factors
  let admissionProbability = null;
  let probabilityReason = '';
  
  if (admitRate !== null && admitRate !== undefined) {
    admissionProbability = admitRate;
    probabilityReason = 'Based on overall admission rate';
    
    // Adjust based on test scores
    if (satTotal && studentSAT) {
      const scoreDiff = satTotal - studentSAT;
      if (scoreDiff <= 50) {
        admissionProbability = Math.min(0.95, admitRate * 1.2);
        probabilityReason = 'Your SAT score is within typical range';
      } else if (scoreDiff <= 100) {
        admissionProbability = Math.min(0.90, admitRate * 1.1);
        probabilityReason = 'Your SAT score is close to typical range';
      } else if (scoreDiff > 150) {
        admissionProbability = Math.max(0.05, admitRate * 0.7);
        probabilityReason = 'Your SAT score is below typical range';
      }
    } else if (actComposite && studentACT) {
      const scoreDiff = actComposite - studentACT;
      if (scoreDiff <= 1) {
        admissionProbability = Math.min(0.95, admitRate * 1.2);
        probabilityReason = 'Your ACT score is within typical range';
      } else if (scoreDiff <= 2) {
        admissionProbability = Math.min(0.90, admitRate * 1.1);
        probabilityReason = 'Your ACT score is close to typical range';
      } else if (scoreDiff > 3) {
        admissionProbability = Math.max(0.05, admitRate * 0.7);
        probabilityReason = 'Your ACT score is below typical range';
      }
    }
    
    // Apply Tier 2 boosts
    if (classRankPercentile >= 90) {
      admissionProbability = Math.min(0.95, admissionProbability * 1.1);
      probabilityReason += ' + Top 10% class rank boost';
    }
    if (courseRigor === 'most_rigorous' || courseRigor === 'very_rigorous') {
      admissionProbability = Math.min(0.95, admissionProbability * 1.05);
      probabilityReason += ' + Rigorous coursework';
    }
  } else if (satTotal && studentSAT) {
    const scoreDiff = satTotal - studentSAT;
    if (scoreDiff <= 50) admissionProbability = 0.70;
    else if (scoreDiff <= 100) admissionProbability = 0.50;
    else if (scoreDiff <= 150) admissionProbability = 0.30;
    else admissionProbability = 0.15;
    probabilityReason = 'Estimated based on SAT score comparison';
  } else if (actComposite && studentACT) {
    const scoreDiff = actComposite - studentACT;
    if (scoreDiff <= 1) admissionProbability = 0.70;
    else if (scoreDiff <= 2) admissionProbability = 0.50;
    else if (scoreDiff <= 3) admissionProbability = 0.30;
    else admissionProbability = 0.15;
    probabilityReason = 'Estimated based on ACT score comparison';
  }
  
  // Determine academic tier label
  const tierLabels = {
    'reach': 'Reach School',
    'target': 'Target School',
    'safety': 'Safety School'
  };

  return (
    <Card glassmorphic={true} className="border-2 border-white/10 overflow-hidden">
      <CardContent className="p-8 pt-8">
        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center border border-blue-400/30">
            <Target className="w-6 h-6 text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admissions Profile</h2>
        </div>

        <div className="space-y-6">
          {/* Admission Rate */}
          {admitRate !== null && admitRate !== undefined && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-white">Admission Rate</span>
                <span className="text-3xl font-bold text-white">{(admitRate * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mt-3">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${admitRate * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Test Scores */}
          {(satTotal || actComposite) && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Test Score Ranges</h3>
              <div className="space-y-4">
                {satTotal && (
                  <div>
                    <div className="text-sm text-white/60 mb-2">SAT Total Score</div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-white font-semibold">
                          {satTotal - 50} - {satTotal + 50}
                        </div>
                        <div className="text-xs text-white/50 mt-1">Typical range</div>
                      </div>
                      {studentSAT && (
                        <div className="text-right">
                          <div className="text-white font-bold text-lg">{studentSAT}</div>
                          <div className={`text-xs mt-1 ${
                            studentSAT >= satTotal - 50 && studentSAT <= satTotal + 50 
                              ? 'text-green-400' 
                              : studentSAT > satTotal + 50 
                                ? 'text-blue-400' 
                                : 'text-yellow-400'
                          }`}>
                            {studentSAT >= satTotal - 50 && studentSAT <= satTotal + 50 
                              ? 'Within range' 
                              : studentSAT > satTotal + 50 
                                ? 'Above range' 
                                : 'Below range'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {actComposite && (
                  <div>
                    <div className="text-sm text-white/60 mb-2">ACT Composite</div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-white font-semibold">
                          {actComposite - 2} - {actComposite + 2}
                        </div>
                        <div className="text-xs text-white/50 mt-1">Typical range</div>
                      </div>
                      {studentACT && (
                        <div className="text-right">
                          <div className="text-white font-bold text-lg">{studentACT}</div>
                          <div className={`text-xs mt-1 ${
                            studentACT >= actComposite - 2 && studentACT <= actComposite + 2 
                              ? 'text-green-400' 
                              : studentACT > actComposite + 2 
                                ? 'text-blue-400' 
                                : 'text-yellow-400'
                          }`}>
                            {studentACT >= actComposite - 2 && studentACT <= actComposite + 2 
                              ? 'Within range' 
                              : studentACT > actComposite + 2 
                                ? 'Above range' 
                                : 'Below range'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Academic Tier */}
          {academicTier && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/60 mb-1">Academic Classification</div>
                  <div className={`text-xl font-bold ${
                    academicTier === 'reach' ? 'text-red-300' :
                    academicTier === 'target' ? 'text-yellow-300' :
                    'text-green-300'
                  }`}>
                    {tierLabels[academicTier] || academicTier}
                  </div>
                </div>
                {admitRate !== null && admitRate !== undefined && (
                  <div className="text-right">
                    <div className="text-sm text-white/60 mb-1">Admission Rate</div>
                    <div className="text-xl font-semibold text-white">{(admitRate * 100).toFixed(1)}%</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admission Probability */}
          {admissionProbability !== null && (
            <div className="p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-primary-300" />
                <span className="text-base font-semibold text-white">Your Admission Probability</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-white">
                  {Math.round(admissionProbability * 100)}%
                </span>
                <span className="text-white/60">chance</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <div 
                  className={`h-full rounded-full transition-all ${
                    admissionProbability >= 0.7 ? 'bg-green-500' :
                    admissionProbability >= 0.5 ? 'bg-yellow-500' :
                    admissionProbability >= 0.3 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${admissionProbability * 100}%` }}
                />
              </div>
              {probabilityReason && (
                <div className="text-xs text-white/60 mt-2">{probabilityReason}</div>
              )}
              {admissionProbability < 0.3 && (
                <div className="mt-3 flex items-start gap-2 text-sm text-yellow-300">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>This is a reach school. Consider strengthening your application with strong essays and recommendations.</span>
                </div>
              )}
              {admissionProbability >= 0.7 && (
                <div className="mt-3 flex items-start gap-2 text-sm text-green-300">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Strong match - you have a good chance of admission.</span>
                </div>
              )}
            </div>
          )}

          {/* GPA Info */}
          {studentGPA && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/60 mb-1">Your GPA</div>
                  <div className="text-2xl font-bold text-white">{studentGPA.toFixed(2)}</div>
                </div>
                {admitRate !== null && admitRate !== undefined && (
                  <div className="text-right">
                    <div className="text-sm text-white/60 mb-1">Admission Rate</div>
                    <div className="text-xl font-semibold text-white">{(admitRate * 100).toFixed(1)}%</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
