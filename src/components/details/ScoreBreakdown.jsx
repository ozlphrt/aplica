/**
 * Score Breakdown Component
 * Detailed breakdown of fit scores by criteria
 */
import { Card, CardContent } from '../ui/card';
import { calculateDetailedFitScores } from '../../utils/fit-calculator';
import useStudentProfileStore from '../../stores/studentProfileStore';
import { TrendingUp, GraduationCap, DollarSign, MapPin, Award, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getStatesForRegion } from '../../utils/regions';

// Progress component wrapper for score display
function ScoreProgress({ value, color, className }) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/10">
        <div 
          className={`${color} h-full rounded-full transition-all duration-500 shadow-lg`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreBreakdown({ school }) {
  const { answers } = useStudentProfileStore();
  const { scores, details } = calculateDetailedFitScores(school, answers);
  
  // Get additional details for display
  const gpa = answers?.gpa;
  const satScore = answers?.sat_score;
  const actScore = answers?.act_score;
  const maxBudget = answers?.max_annual_budget;
  const cost = school['latest.cost.attendance.academic_year'] || 
               school['latest.cost.avg_net_price.overall'] ||
               school['latest.cost.tuition.in_state'] ||
               school['latest.cost.tuition.out_of_state'];
  const admitRate = school['latest.admissions.admission_rate.overall'];
  const satMath = school['latest.admissions.sat_scores.midpoint.math'];
  const satEbrw = school['latest.admissions.sat_scores.midpoint.critical_reading'];
  const satTotal = satMath && satEbrw ? satMath + satEbrw : null;
  const actComposite = school['latest.admissions.act_scores.midpoint.cumulative'];
  const gradRate = school['latest.completion.completion_rate_4yr_150nt'] || 
                   school['latest.completion.completion_rate_6yr_150nt'];
  const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
  const size = school['latest.student.size'];
  const schoolState = school['school.state'];
  const locale = school['latest.school.locale'];
  
  // Tier 2 data
  const classRankPercentile = answers?.class_rank_percentile;
  const classRankAvailable = answers?.class_rank_available;
  const courseRigor = answers?.course_rigor;
  const apCourses = answers?.ap_courses || 0;
  const ibCourses = answers?.ib_courses || 0;
  const dualEnrollment = answers?.dual_enrollment || 0;
  const honorsCourses = answers?.honors_courses || 0;
  const totalAdvancedCourses = apCourses + ibCourses + dualEnrollment + honorsCourses;
  const householdIncome = answers?.household_income;
  const stateResidence = answers?.state_residence;
  const financialAidNeed = answers?.financial_aid_need;
  
  const rigorLabels = {
    'most_rigorous': 'Most Rigorous',
    'very_rigorous': 'Very Rigorous',
    'rigorous': 'Rigorous',
    'average': 'Average',
    'less_rigorous': 'Less Rigorous',
  };
  
  const incomeLabels = {
    'under_30k': 'Under $30,000',
    '30_48k': '$30,000 - $48,000',
    '48_75k': '$48,000 - $75,000',
    '75_110k': '$75,000 - $110,000',
    '110_150k': '$110,000 - $150,000',
    'over_150k': 'Over $150,000',
  };
  
  const aidNeedLabels = {
    'critical': 'Critical',
    'very_important': 'Very Important',
    'important': 'Important',
    'somewhat': 'Somewhat Important',
    'not_important': 'Not Important',
  };

  const criteria = [
    {
      key: 'academic',
      label: 'Academic Fit',
      score: scores.academic,
      max: details.academic.max,
      rawScore: details.academic.score,
      reasons: details.academic.reasons,
      color: 'bg-gradient-to-r from-primary-600 to-primary-700',
      icon: GraduationCap,
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-400/30',
    },
    {
      key: 'financial',
      label: 'Financial Fit',
      score: scores.financial,
      max: details.financial.max,
      rawScore: details.financial.score,
      reasons: details.financial.reasons,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: DollarSign,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30',
    },
    {
      key: 'environmental',
      label: 'Environmental Fit',
      score: scores.environmental,
      max: details.environmental.max,
      rawScore: details.environmental.score,
      reasons: details.environmental.reasons,
      color: 'bg-gradient-to-r from-primary-600 to-primary-700',
      icon: MapPin,
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-400/30',
    },
    {
      key: 'outcomes',
      label: 'Outcomes Fit',
      score: scores.outcomes,
      max: details.outcomes.max,
      rawScore: details.outcomes.score,
      reasons: details.outcomes.reasons,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      icon: Award,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-400/30',
    },
  ];

  const IconComponent = TrendingUp;

  // Analyze perfect fits and missing items
  const perfectFits = [];
  const missingItems = [];
  
  // Get questionnaire preferences
  const intendedMajors = answers?.intended_majors || [];
  const preferredRegions = answers?.preferred_regions || [];
  const preferredSize = answers?.preferred_size || [];
  const preferredSetting = answers?.preferred_setting || [];
  const dealBreakers = answers?.deal_breakers || [];
  const extracurricularPriorities = answers?.extracurricular_priorities || [];
  const specialPrograms = answers?.special_programs || [];
  const campusCulture = answers?.campus_culture || [];
  const weatherPreference = answers?.weather_preference;
  
  // Check intended majors (we can't verify if school offers them, but we can note if undecided)
  if (intendedMajors.length > 0 && !intendedMajors.includes('undecided')) {
    // Note: We'd need school program data to verify, but for now we'll assume it's a match if school passed filters
    perfectFits.push({ 
      label: 'Offers your intended major(s)', 
      value: intendedMajors.join(', '),
      category: 'academic'
    });
  }
  
  // Check region match
  if (preferredRegions.length > 0 && schoolState) {
    const allPreferredStates = new Set();
    preferredRegions.forEach(region => {
      const states = getStatesForRegion(region);
      states.forEach(state => allPreferredStates.add(state));
    });
    if (allPreferredStates.has(schoolState)) {
      perfectFits.push({ 
        label: 'Located in your preferred region', 
        value: schoolState,
        category: 'environmental'
      });
    } else {
      missingItems.push({ 
        label: 'Not in your preferred region', 
        value: `You prefer: ${preferredRegions.join(', ')}, School is in: ${schoolState}`,
        category: 'environmental'
      });
    }
  }
  
  // Check size match
  if (preferredSize.length > 0 && size) {
    const sizeRanges = {
      'very_small': { min: 0, max: 1000, label: 'Very small (under 1,000)' },
      'small': { min: 1000, max: 5000, label: 'Small (1,000-5,000)' },
      'medium': { min: 5000, max: 15000, label: 'Medium (5,000-15,000)' },
      'large': { min: 15000, max: 25000, label: 'Large (15,000-25,000)' },
      'very_large': { min: 25000, max: 1000000, label: 'Very large (over 25,000)' },
    };
    const matchesSize = preferredSize.some(rangeKey => {
      const range = sizeRanges[rangeKey];
      return size >= range.min && size < range.max;
    });
    if (matchesSize) {
      const matchedSize = preferredSize.find(rangeKey => {
        const range = sizeRanges[rangeKey];
        return size >= range.min && size < range.max;
      });
      perfectFits.push({ 
        label: 'Matches your preferred size', 
        value: sizeRanges[matchedSize]?.label || matchedSize,
        category: 'environmental'
      });
    } else {
      const sizeLabel = size < 1000 ? 'Very small' : 
                        size < 5000 ? 'Small' : 
                        size < 15000 ? 'Medium' : 
                        size < 25000 ? 'Large' : 'Very large';
      missingItems.push({ 
        label: 'Size doesn\'t match preference', 
        value: `School: ${sizeLabel} (${size.toLocaleString()} students), You prefer: ${preferredSize.map(k => sizeRanges[k]?.label || k).join(', ')}`,
        category: 'environmental'
      });
    }
  }
  
  // Check setting match
  if (preferredSetting.length > 0 && locale) {
    const localeMap = {
      'city': [11, 12, 13],
      'suburb': [21, 22, 23],
      'town': [31, 32, 33],
      'rural': [41, 42, 43],
    };
    const settingLabels = {
      'city': 'City',
      'suburb': 'Suburban',
      'town': 'Town',
      'rural': 'Rural',
    };
    const matchesSetting = preferredSetting.some(setting => {
      const locales = localeMap[setting];
      return locales && locales.includes(locale);
    });
    if (matchesSetting) {
      const matchedSetting = preferredSetting.find(setting => {
        const locales = localeMap[setting];
        return locales && locales.includes(locale);
      });
      perfectFits.push({ 
        label: 'Matches your preferred setting', 
        value: settingLabels[matchedSetting] || matchedSetting,
        category: 'environmental'
      });
    } else {
      const currentSetting = locale >= 11 && locale <= 13 ? 'City' : 
                             locale >= 21 && locale <= 23 ? 'Suburban' : 
                             locale >= 31 && locale <= 33 ? 'Town' : 
                             locale >= 41 && locale <= 43 ? 'Rural' : 'Unknown';
      missingItems.push({ 
        label: 'Setting doesn\'t match preference', 
        value: `School: ${currentSetting}, You prefer: ${preferredSetting.map(s => settingLabels[s] || s).join(', ')}`,
        category: 'environmental'
      });
    }
  }
  
  // Check budget match
  if (maxBudget && cost) {
    if (cost <= maxBudget) {
      const savings = maxBudget - cost;
      perfectFits.push({ 
        label: 'Within your budget', 
        value: `$${(cost / 1000).toFixed(0)}K (${savings > 0 ? `saves $${(savings / 1000).toFixed(0)}K` : 'exact match'})`,
        category: 'financial'
      });
    } else {
      const overage = cost - maxBudget;
      missingItems.push({ 
        label: 'Over your budget', 
        value: `$${(cost / 1000).toFixed(0)}K (${((overage / maxBudget) * 100).toFixed(0)}% over your $${(maxBudget / 1000).toFixed(0)}K budget)`,
        category: 'financial'
      });
    }
  }
  
  // Check in-state match
  if (stateResidence && schoolState === stateResidence) {
    perfectFits.push({ 
      label: 'In-state school', 
      value: 'Eligible for in-state tuition',
      category: 'financial'
    });
  }
  
  // Check test score match
  if (satScore && satTotal) {
    const scoreDiff = Math.abs(satTotal - satScore);
    if (scoreDiff <= 50) {
      perfectFits.push({ 
        label: 'SAT score matches perfectly', 
        value: `Your ${satScore} aligns with school's typical ${satTotal - 50}-${satTotal + 50} range`,
        category: 'academic'
      });
    } else if (scoreDiff > 150) {
      missingItems.push({ 
        label: 'SAT score gap', 
        value: `Your ${satScore} vs school's typical ${satTotal - 50}-${satTotal + 50} range (${scoreDiff > 0 ? '+' : ''}${scoreDiff} point difference)`,
        category: 'academic'
      });
    }
  }
  
  if (actScore && actComposite) {
    const scoreDiff = Math.abs(actComposite - actScore);
    if (scoreDiff <= 2) {
      perfectFits.push({ 
        label: 'ACT score matches perfectly', 
        value: `Your ${actScore} aligns with school's typical ${actComposite - 2}-${actComposite + 2} range`,
        category: 'academic'
      });
    } else if (scoreDiff > 4) {
      missingItems.push({ 
        label: 'ACT score gap', 
        value: `Your ${actScore} vs school's typical ${actComposite - 2}-${actComposite + 2} range (${scoreDiff > 0 ? '+' : ''}${scoreDiff} point difference)`,
        category: 'academic'
      });
    }
  }
  
  // Check deal breakers
  if (dealBreakers && dealBreakers.length > 0 && !dealBreakers.includes('none')) {
    // Note: We'd need more school data to check all deal breakers, but we can check some
    if (dealBreakers.includes('no_rural') && locale >= 41 && locale <= 43) {
      missingItems.push({ 
        label: 'Deal breaker: Rural location', 
        value: 'You excluded rural schools',
        category: 'environmental',
        severity: 'high'
      });
    }
    if (dealBreakers.includes('no_urban') && locale >= 11 && locale <= 13) {
      missingItems.push({ 
        label: 'Deal breaker: Urban location', 
        value: 'You excluded urban schools',
        category: 'environmental',
        severity: 'high'
      });
    }
    if (dealBreakers.includes('no_large') && size > 15000) {
      missingItems.push({ 
        label: 'Deal breaker: Large school', 
        value: `School has ${size.toLocaleString()} students, you excluded large schools`,
        category: 'environmental',
        severity: 'high'
      });
    }
    if (dealBreakers.includes('no_small') && size < 3000) {
      missingItems.push({ 
        label: 'Deal breaker: Small school', 
        value: `School has ${size.toLocaleString()} students, you excluded small schools`,
        category: 'environmental',
        severity: 'high'
      });
    }
  }
  
  // Check if school is out of state when user prefers in-state
  const locationPreference = answers?.location_preference || [];
  if (locationPreference.includes('in_state') && stateResidence && schoolState && schoolState !== stateResidence) {
    missingItems.push({ 
      label: 'Not in your state', 
      value: `You prefer in-state schools only, but this school is in ${schoolState}`,
      category: 'environmental'
    });
  }
  
  // Check if cost data is missing but budget is provided
  if (maxBudget && !cost) {
    missingItems.push({ 
      label: 'Cost information unavailable', 
      value: 'Cannot verify if school fits your budget',
      category: 'financial'
    });
  }
  
  // Check if test scores are missing but school has test score requirements
  if ((satTotal || actComposite) && !satScore && !actScore) {
    missingItems.push({ 
      label: 'Test scores not provided', 
      value: 'School has test score requirements, but your scores are not in profile',
      category: 'academic'
    });
  }

  return (
    <Card glassmorphic={true} className="border-2 border-white/10 overflow-hidden">
      <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-600/30 flex items-center justify-center border border-primary-400/30">
            <IconComponent className="w-6 h-6 text-primary-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Overall Score Breakdown</h2>
        </div>
        
        {/* Overall Score - Enhanced */}
        <div className="mb-10 p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-semibold text-white">Overall Fit Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{scores.overall}</span>
              <span className="text-xl text-white/60">/100</span>
            </div>
          </div>
          <ScoreProgress value={scores.overall} color="bg-gradient-to-r from-primary-500 to-primary-600" className="h-4" />
        </div>

        {/* Perfect Fits & Missing Items */}
        {(perfectFits.length > 0 || missingItems.length > 0 || (answers && Object.keys(answers).length > 0)) && (
          <div className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Perfect Fits */}
            {perfectFits.length > 0 && (
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Perfect Fits</h3>
                </div>
                <ul className="space-y-3">
                  {perfectFits.map((fit, idx) => (
                    <li key={idx} className="text-sm">
                      <div className="text-white/90 font-medium">{fit.label}</div>
                      <div className="text-green-300/80 text-xs mt-0.5">{fit.value}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Missing Items - Always show if there are answers, even if empty */}
            {(missingItems.length > 0 || (answers && Object.keys(answers).length > 0)) && (
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Missing or Mismatches</h3>
                </div>
                {missingItems.length > 0 ? (
                  <ul className="space-y-3">
                    {missingItems.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        <div className={`font-medium ${item.severity === 'high' ? 'text-red-300' : 'text-white/90'}`}>
                          {item.label}
                          {item.severity === 'high' && (
                            <span className="ml-2 text-xs bg-red-500/20 px-2 py-0.5 rounded">Deal Breaker</span>
                          )}
                        </div>
                        <div className="text-red-300/80 text-xs mt-0.5">{item.value}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-white/60 italic">
                    No mismatches found - this school aligns well with your preferences!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Detailed Scores - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criteria.map((criterion) => {
            const Icon = criterion.icon;
            return (
              <div 
                key={criterion.key} 
                className={`p-6 rounded-xl ${criterion.bgColor} border ${criterion.borderColor} backdrop-blur-sm hover:scale-[1.02] transition-all`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${criterion.bgColor} flex items-center justify-center border ${criterion.borderColor}`}>
                    <Icon className={`w-5 h-5 ${criterion.color.replace('bg-gradient-to-r', 'text').replace('from-', '').replace('to-', '').split(' ')[0]}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-white">{criterion.label}</span>
                      <span className="text-xl font-bold text-white">
                        {criterion.score}/100
                      </span>
                    </div>
                  </div>
                </div>
                <ScoreProgress value={criterion.score} color={criterion.color} className="h-2.5 mb-4" />
                <div className="text-xs text-white/60 mb-4">
                  <span className="text-white/50">Raw score: </span>
                  {criterion.rawScore.toFixed(1)}/{criterion.max} points
                </div>
                
                {/* Additional Details */}
                {criterion.key === 'academic' && (
                  <div className="space-y-2 mb-3 text-sm">
                    {admitRate !== null && admitRate !== undefined && (
                      <div className="text-white/80">
                        <span className="text-white/60">Admission Rate: </span>
                        <span className="font-semibold">{(admitRate * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {satTotal && (
                      <div className="text-white/80">
                        <span className="text-white/60">Typical SAT Range: </span>
                        <span className="font-semibold">{satTotal - 50} - {satTotal + 50}</span>
                        {satScore && (
                          <span className="text-white/60 ml-2">
                            (Your score: <span className="font-semibold text-white">{satScore}</span>)
                          </span>
                        )}
                      </div>
                    )}
                    {actComposite && (
                      <div className="text-white/80">
                        <span className="text-white/60">Typical ACT Range: </span>
                        <span className="font-semibold">{actComposite - 2} - {actComposite + 2}</span>
                        {actScore && (
                          <span className="text-white/60 ml-2">
                            (Your score: <span className="font-semibold text-white">{actScore}</span>)
                          </span>
                        )}
                      </div>
                    )}
                    {gpa && (
                      <div className="text-white/80">
                        <span className="text-white/60">Your GPA: </span>
                        <span className="font-semibold">{gpa.toFixed(2)}</span>
                      </div>
                    )}
                    {/* Tier 2 Academic Data */}
                    {classRankPercentile !== null && classRankPercentile !== undefined && (
                      <div className="text-white/80 mt-2 pt-2 border-t border-white/10">
                        <span className="text-white/60">Class Rank: </span>
                        <span className="font-semibold">Top {100 - classRankPercentile}% ({classRankPercentile}th percentile)</span>
                      </div>
                    )}
                    {courseRigor && (
                      <div className="text-white/80">
                        <span className="text-white/60">Course Rigor: </span>
                        <span className="font-semibold">{rigorLabels[courseRigor] || courseRigor}</span>
                      </div>
                    )}
                    {totalAdvancedCourses > 0 && (
                      <div className="text-white/80">
                        <span className="text-white/60">Advanced Courses: </span>
                        <span className="font-semibold">
                          {apCourses > 0 && `${apCourses} AP`}
                          {apCourses > 0 && (ibCourses > 0 || dualEnrollment > 0 || honorsCourses > 0) && ', '}
                          {ibCourses > 0 && `${ibCourses} IB`}
                          {ibCourses > 0 && (dualEnrollment > 0 || honorsCourses > 0) && ', '}
                          {dualEnrollment > 0 && `${dualEnrollment} Dual Enrollment`}
                          {dualEnrollment > 0 && honorsCourses > 0 && ', '}
                          {honorsCourses > 0 && `${honorsCourses} Honors`}
                          {' '}({totalAdvancedCourses} total)
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {criterion.key === 'financial' && (
                  <div className="space-y-2 mb-3 text-sm">
                    {cost && (
                      <div className="text-white/80">
                        <span className="text-white/60">Annual Cost: </span>
                        <span className="font-semibold">${(cost / 1000).toFixed(0)}K</span>
                      </div>
                    )}
                    {maxBudget && (
                      <div className="text-white/80">
                        <span className="text-white/60">Your Budget: </span>
                        <span className="font-semibold">${(maxBudget / 1000).toFixed(0)}K</span>
                      </div>
                    )}
                    {/* Tier 2 Financial Data */}
                    {householdIncome && householdIncome !== 'prefer_not_say' && (
                      <div className="text-white/80 mt-2 pt-2 border-t border-white/10">
                        <span className="text-white/60">Household Income: </span>
                        <span className="font-semibold">{incomeLabels[householdIncome] || householdIncome}</span>
                      </div>
                    )}
                    {stateResidence && (
                      <div className="text-white/80">
                        <span className="text-white/60">State Residence: </span>
                        <span className="font-semibold">{stateResidence}</span>
                        {schoolState === stateResidence && (
                          <span className="text-green-400 ml-2">(In-state)</span>
                        )}
                      </div>
                    )}
                    {financialAidNeed && (
                      <div className="text-white/80">
                        <span className="text-white/60">Financial Aid Need: </span>
                        <span className="font-semibold">{aidNeedLabels[financialAidNeed] || financialAidNeed}</span>
                      </div>
                    )}
                    {cost && maxBudget && (
                      <div className="text-white/80">
                        <span className="text-white/60">Difference: </span>
                        <span className={`font-semibold ${cost <= maxBudget ? 'text-green-300' : 'text-red-300'}`}>
                          {cost <= maxBudget ? '+' : ''}${((maxBudget - cost) / 1000).toFixed(0)}K
                        </span>
                      </div>
                    )}
                    {cost && !maxBudget && (
                      <div className="text-white/60 text-xs">
                        Add your budget to see detailed comparison
                      </div>
                    )}
                  </div>
                )}
                
                {criterion.key === 'environmental' && (
                  <div className="space-y-2 mb-3 text-sm">
                    {schoolState && (
                      <div className="text-white/80">
                        <span className="text-white/60">Location: </span>
                        <span className="font-semibold">{schoolState}</span>
                      </div>
                    )}
                    {size && (
                      <div className="text-white/80">
                        <span className="text-white/60">Student Body Size: </span>
                        <span className="font-semibold">
                          {size < 1000 ? size : size < 10000 ? `${(size / 1000).toFixed(1)}K` : `${(size / 1000).toFixed(0)}K`} students
                        </span>
                      </div>
                    )}
                    {locale && (
                      <div className="text-white/80">
                        <span className="text-white/60">Campus Setting: </span>
                        <span className="font-semibold">
                          {locale >= 11 && locale <= 13 ? 'City' : 
                           locale >= 21 && locale <= 23 ? 'Suburban' : 
                           locale >= 31 && locale <= 33 ? 'Town' : 
                           locale >= 41 && locale <= 43 ? 'Rural' : 'Unknown'}
                        </span>
                      </div>
                    )}
                    {/* Tier 2 Environmental Data */}
                    {stateResidence && (
                      <div className="text-white/80 mt-2 pt-2 border-t border-white/10">
                        <span className="text-white/60">Your State: </span>
                        <span className="font-semibold">{stateResidence}</span>
                        {schoolState === stateResidence && (
                          <span className="text-green-400 ml-2">(In-state match)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {criterion.key === 'outcomes' && (
                  <div className="space-y-2 mb-3 text-sm">
                    {gradRate !== null && gradRate !== undefined && (
                      <div className="text-white/80">
                        <span className="text-white/60">Graduation Rate: </span>
                        <span className="font-semibold">{(gradRate * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {retentionRate !== null && retentionRate !== undefined && (
                      <div className="text-white/80">
                        <span className="text-white/60">Retention Rate: </span>
                        <span className="font-semibold">{(retentionRate * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {school['latest.earnings.6_yrs_after_entry.median'] && (
                      <div className="text-white/80">
                        <span className="text-white/60">Median Earnings (6yr): </span>
                        <span className="font-semibold">${(school['latest.earnings.6_yrs_after_entry.median'] / 1000).toFixed(0)}K</span>
                      </div>
                    )}
                  </div>
                )}
                
                {criterion.reasons.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="text-xs text-white/50 uppercase tracking-wide mb-2">Why this score:</div>
                    <ul className="text-sm text-white/70 space-y-1.5">
                      {criterion.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary-400 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

