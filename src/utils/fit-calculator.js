/**
 * Fit Score Calculator
 * Calculates detailed fit scores for each criteria
 */

import { getStatesForRegion } from './regions';

/**
 * Calculate detailed fit scores for a school
 * @param {Object} school - School data object
 * @param {Object} studentProfile - Student profile answers
 * @returns {Object} - Detailed fit scores breakdown
 */
export function calculateDetailedFitScores(school, studentProfile = {}) {
  const scores = {
    academic: 0,
    financial: 0,
    environmental: 0,
    outcomes: 0,
    overall: 0,
  };

  const details = {
    academic: { score: 0, max: 25, reasons: [] },
    financial: { score: 0, max: 20, reasons: [] },
    environmental: { score: 0, max: 20, reasons: [] },
    outcomes: { score: 0, max: 15, reasons: [] },
  };

  // Academic Fit (0-25 points)
  const academicTier = school.academicTier || 'target';
  const admitRate = school['latest.admissions.admission_rate.overall'];
  const gpa = studentProfile.gpa || 3.5;
  const satScore = studentProfile.sat_score;
  const actScore = studentProfile.act_score;
  
  // Tier 2: Class rank and course rigor
  const classRankPercentile = studentProfile.class_rank_percentile;
  const courseRigor = studentProfile.course_rigor;
  const apCourses = studentProfile.ap_courses || 0;
  const ibCourses = studentProfile.ib_courses || 0;
  const dualEnrollment = studentProfile.dual_enrollment || 0;
  const honorsCourses = studentProfile.honors_courses || 0;
  const totalAdvancedCourses = apCourses + ibCourses + dualEnrollment + honorsCourses;
  
  let baseAcademicScore = 0;
  
  if (admitRate !== null && admitRate !== undefined) {
    if (admitRate >= 0.3 && admitRate <= 0.7) {
      const distanceFromIdeal = Math.abs(admitRate - 0.5);
      baseAcademicScore = 25 - (distanceFromIdeal * 30);
      baseAcademicScore = Math.max(10, Math.min(25, baseAcademicScore));
      details.academic.reasons.push(`Admission rate of ${Math.round(admitRate * 100)}% aligns with your academic profile`);
    } else if (admitRate > 0.7) {
      baseAcademicScore = 12 + (admitRate - 0.7) * 15;
      details.academic.reasons.push(`High acceptance rate of ${Math.round(admitRate * 100)}%`);
    } else {
      baseAcademicScore = 8 + (0.3 - admitRate) * 8;
      details.academic.reasons.push(`Selective school with ${Math.round(admitRate * 100)}% admission rate`);
    }
  } else {
    // Use test scores as proxy
    const satMath = school['latest.admissions.sat_scores.midpoint.math'];
    const satEbrw = school['latest.admissions.sat_scores.midpoint.critical_reading'];
    const satTotal = satMath && satEbrw ? satMath + satEbrw : null;
    const actComposite = school['latest.admissions.act_scores.midpoint.cumulative'];
    
    if (satTotal && satScore) {
      const scoreDiff = Math.abs(satTotal - satScore);
      if (scoreDiff <= 50) baseAcademicScore = 22;
      else if (scoreDiff <= 100) baseAcademicScore = 18;
      else if (scoreDiff <= 150) baseAcademicScore = 14;
      else baseAcademicScore = 10;
      details.academic.reasons.push(`SAT scores align with school's typical range`);
    } else if (actComposite && actScore) {
      const scoreDiff = Math.abs(actComposite - actScore);
      if (scoreDiff <= 2) baseAcademicScore = 22;
      else if (scoreDiff <= 4) baseAcademicScore = 18;
      else baseAcademicScore = 14;
      details.academic.reasons.push(`ACT scores align with school's typical range`);
    } else {
      baseAcademicScore = 15;
      details.academic.reasons.push(`Academic match based on profile`);
    }
  }
  
  // Apply Tier 2 boosts
  let academicMultiplier = 1.0;
  
  // Class rank boost
  if (classRankPercentile !== null && classRankPercentile !== undefined) {
    if (classRankPercentile >= 99) {
      academicMultiplier = 1.15;
      details.academic.reasons.push(`Your Top 1% class rank (${classRankPercentile}th percentile) significantly strengthens your application`);
    } else if (classRankPercentile >= 95) {
      academicMultiplier = 1.10;
      details.academic.reasons.push(`Your Top 5% class rank (${classRankPercentile}th percentile) strengthens your application`);
    } else if (classRankPercentile >= 90) {
      academicMultiplier = 1.05;
      details.academic.reasons.push(`Your Top 10% class rank (${classRankPercentile}th percentile) supports your application`);
    } else if (classRankPercentile >= 75) {
      academicMultiplier = 1.02;
      details.academic.reasons.push(`Your Top 25% class rank (${classRankPercentile}th percentile) is a positive factor`);
    } else if (classRankPercentile >= 50) {
      details.academic.reasons.push(`Your class rank (${classRankPercentile}th percentile) is considered`);
    }
  }
  
  // Course rigor multiplier
  const rigorMultipliers = {
    'most_rigorous': 1.15,
    'very_rigorous': 1.10,
    'rigorous': 1.05,
    'average': 1.0,
    'less_rigorous': 0.95,
  };
  const rigorLabels = {
    'most_rigorous': 'most rigorous',
    'very_rigorous': 'very rigorous',
    'rigorous': 'rigorous',
    'average': 'average',
    'less_rigorous': 'less rigorous',
  };
  if (courseRigor && rigorMultipliers[courseRigor]) {
    academicMultiplier *= rigorMultipliers[courseRigor];
    details.academic.reasons.push(`Your ${rigorLabels[courseRigor]} course load (compared to peers) demonstrates ${courseRigor === 'most_rigorous' || courseRigor === 'very_rigorous' ? 'strong' : courseRigor === 'rigorous' ? 'solid' : 'adequate'} academic preparation`);
  }
  
  // Advanced coursework boost - break down by type
  if (totalAdvancedCourses > 0) {
    const courseBreakdown = [];
    if (apCourses > 0) courseBreakdown.push(`${apCourses} AP`);
    if (ibCourses > 0) courseBreakdown.push(`${ibCourses} IB`);
    if (dualEnrollment > 0) courseBreakdown.push(`${dualEnrollment} dual enrollment`);
    if (honorsCourses > 0) courseBreakdown.push(`${honorsCourses} honors`);
    
    if (totalAdvancedCourses >= 10) {
      academicMultiplier *= 1.08;
      details.academic.reasons.push(`Strong advanced coursework: ${courseBreakdown.join(', ')} courses (${totalAdvancedCourses} total) enhance your profile`);
    } else if (totalAdvancedCourses >= 6) {
      academicMultiplier *= 1.05;
      details.academic.reasons.push(`Good advanced coursework: ${courseBreakdown.join(', ')} courses (${totalAdvancedCourses} total) strengthen your application`);
    } else if (totalAdvancedCourses >= 3) {
      academicMultiplier *= 1.02;
      details.academic.reasons.push(`Your advanced coursework: ${courseBreakdown.join(', ')} courses (${totalAdvancedCourses} total) is considered`);
    } else {
      details.academic.reasons.push(`Your advanced coursework: ${courseBreakdown.join(', ')} courses`);
    }
  }
  
  // Apply multiplier and cap at max
  details.academic.score = Math.min(25, baseAcademicScore * academicMultiplier);

  // Financial Fit (0-20 points)
  // Tier 2: Use income-based net price if available
  const householdIncome = studentProfile.household_income;
  const stateResidence = studentProfile.state_residence;
  const financialAidNeed = studentProfile.financial_aid_need;
  const schoolState = school['school.state'];
  
  // Determine which cost to use (prefer income-based net price)
  let cost = null;
  let costType = 'sticker';
  
  const incomeLabels = {
    'under_30k': 'under $30,000',
    '30_48k': '$30,000-$48,000',
    '48_75k': '$48,000-$75,000',
    '75_110k': '$75,000-$110,000',
    '110_150k': '$110,000-$150,000',
    'over_150k': 'over $150,000',
  };
  
  if (householdIncome && householdIncome !== 'prefer_not_say') {
    // Map income brackets to net price fields
    const incomeNetPriceMap = {
      'under_30k': school['latest.cost.net_price.private_by_income_level.0_30000'],
      '30_48k': school['latest.cost.net_price.private_by_income_level.30001_48000'],
      '48_75k': school['latest.cost.net_price.private_by_income_level.48001_75000'],
      '75_110k': school['latest.cost.net_price.private_by_income_level.75001_110000'],
      'over_150k': school['latest.cost.net_price.private_by_income_level.110001_plus'],
    };
    
    if (incomeNetPriceMap[householdIncome]) {
      cost = incomeNetPriceMap[householdIncome];
      costType = 'net_price';
      details.financial.reasons.push(`Using net price for your household income (${incomeLabels[householdIncome]}) - more accurate than sticker price`);
    } else if (householdIncome) {
      details.financial.reasons.push(`Your household income (${incomeLabels[householdIncome]}) is considered for financial aid eligibility`);
    }
  }
  
  // Fallback to in-state/out-of-state tuition if state matches
  if (!cost && stateResidence && schoolState === stateResidence) {
    cost = school['latest.cost.tuition.in_state'] || school['latest.cost.attendance.academic_year'];
    if (cost) {
      costType = 'in_state';
      details.financial.reasons.push(`In-state tuition applies (you're a ${stateResidence} resident)`);
    }
  } else if (stateResidence && schoolState && schoolState !== stateResidence) {
    details.financial.reasons.push(`Out-of-state tuition applies (you're a ${stateResidence} resident)`);
  }
  
  // Final fallback to general cost
  if (!cost) {
    cost = school['latest.cost.attendance.academic_year'] || 
           school['latest.cost.avg_net_price.overall'] ||
           school['latest.cost.tuition.out_of_state'] ||
           school['latest.cost.tuition.in_state'];
  }
  
  const maxBudget = studentProfile.max_annual_budget;
  
  if (cost && maxBudget) {
    const budgetRatio = cost / maxBudget;
    if (budgetRatio <= 0.6) {
      details.financial.score = 20;
      details.financial.reasons.push(`Well within your budget (${Math.round((1 - budgetRatio) * 100)}% under)`);
    } else if (budgetRatio <= 0.8) {
      details.financial.score = 17;
      details.financial.reasons.push(`Comfortably within your budget`);
    } else if (budgetRatio <= 1.0) {
      details.financial.score = 14;
      details.financial.reasons.push(`Fits your budget`);
    } else if (budgetRatio <= 1.1) {
      details.financial.score = 8;
      details.financial.reasons.push(`Slightly over budget (${Math.round((budgetRatio - 1) * 100)}% over)`);
    } else if (budgetRatio <= 1.2) {
      details.financial.score = 4;
      details.financial.reasons.push(`Moderately over budget`);
    } else {
      details.financial.score = 0;
      details.financial.reasons.push(`Significantly over budget`);
    }
    
    // Boost for schools that meet full need if financial aid is critical
    const aidNeedLabels = {
      'critical': 'critical',
      'very_important': 'very important',
      'important': 'important',
      'somewhat': 'somewhat important',
      'not_important': 'not important',
    };
    
    if (financialAidNeed && financialAidNeed !== 'not_important') {
      details.financial.reasons.push(`Financial aid is ${aidNeedLabels[financialAidNeed]} to you`);
      
      if (financialAidNeed === 'critical' && school['latest.aid.median_debt.completers.overall'] !== null) {
        const meetsFullNeed = school['latest.aid.median_debt.completers.overall'] < 10000; // Low debt suggests good aid
        if (meetsFullNeed) {
          details.financial.score = Math.min(20, details.financial.score + 3);
          details.financial.reasons.push(`Strong financial aid program (critical for your needs)`);
        }
      }
    }
  } else if (cost) {
    if (cost <= 20000) {
      details.financial.score = 15;
      details.financial.reasons.push(`Affordable option`);
    } else if (cost <= 30000) {
      details.financial.score = 12;
      details.financial.reasons.push(`Moderate cost`);
    } else if (cost <= 40000) {
      details.financial.score = 9;
      details.financial.reasons.push(`Higher cost`);
    } else {
      details.financial.score = 6;
      details.financial.reasons.push(`Expensive option`);
    }
  } else {
    details.financial.score = 10;
    details.financial.reasons.push(`Cost information not available`);
  }

  // Environmental Fit (0-20 points) - Geographic + Size + Setting + Tier 3
  let envScore = 0;
  const envReasons = [];
  
  // Geographic (0-8 points)
  const preferredRegions = studentProfile.preferred_regions || [];
  if (schoolState && preferredRegions.length > 0) {
    const allPreferredStates = new Set();
    preferredRegions.forEach(region => {
      const states = getStatesForRegion(region);
      states.forEach(state => allPreferredStates.add(state));
    });
    if (allPreferredStates.has(schoolState)) {
      envScore += 8;
      envReasons.push(`Located in your preferred region`);
    } else {
      envScore += 4;
    }
  } else {
    envScore += 4;
  }
  
  // Tier 2: Boost for in-state preference
  if (stateResidence && schoolState === stateResidence) {
    envScore += 2;
    envReasons.push(`In-state school (reduces costs and travel)`);
  }
  
  // Tier 3: Weather preference (if available)
  const weatherPreference = studentProfile.weather_preference;
  if (weatherPreference && weatherPreference !== 'no_preference' && schoolState) {
    // Note: This is a simplified check - would need state-to-weather mapping for accuracy
    // For now, we'll just note if weather preference exists
    // Could enhance with actual climate data later
  }
  
  // Size (0-7 points)
  const size = school['latest.student.size'];
  const preferredSize = studentProfile.preferred_size || [];
  if (size && preferredSize.length > 0) {
    const sizeRanges = {
      'very_small': { min: 0, max: 1000 },
      'small': { min: 1000, max: 5000 },
      'medium': { min: 5000, max: 15000 },
      'large': { min: 15000, max: 25000 },
      'very_large': { min: 25000, max: 1000000 },
    };
    const matchesSize = preferredSize.some(rangeKey => {
      const range = sizeRanges[rangeKey];
      return size >= range.min && size < range.max;
    });
    if (matchesSize) {
      envScore += 7;
      envReasons.push(`Matches your preferred school size`);
    } else {
      envScore += 3;
    }
  } else if (size) {
    envScore += 4;
  }
  
  // Setting (0-5 points)
  const locale = school['latest.school.locale'];
  const preferredSetting = studentProfile.preferred_setting || [];
  if (locale && preferredSetting.length > 0) {
    const localeMap = {
      'city': [11, 12, 13],
      'suburb': [21, 22, 23],
      'town': [31, 32, 33],
      'rural': [41, 42, 43],
    };
    const matchesSetting = preferredSetting.some(setting => {
      const locales = localeMap[setting];
      return locales && locales.includes(locale);
    });
    if (matchesSetting) {
      envScore += 5;
      envReasons.push(`Matches your preferred campus setting`);
    } else {
      envScore += 2;
    }
  } else if (locale) {
    envScore += 3;
  }
  
  details.environmental.score = envScore;
  details.environmental.max = 20;
  details.environmental.reasons = envReasons.length > 0 ? envReasons : ['Environmental fit based on preferences'];

  // Outcomes Fit (0-15 points)
  const gradRate = school['latest.completion.completion_rate_4yr_150nt'] || 
                   school['latest.completion.completion_rate_6yr_150nt'];
  const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
  
  if (gradRate) {
    if (gradRate >= 0.85) {
      details.outcomes.score += 9;
      details.outcomes.reasons.push(`Excellent graduation rate of ${Math.round(gradRate * 100)}%`);
    } else if (gradRate >= 0.75) {
      details.outcomes.score += 7;
      details.outcomes.reasons.push(`Strong graduation rate of ${Math.round(gradRate * 100)}%`);
    } else if (gradRate >= 0.65) {
      details.outcomes.score += 5;
      details.outcomes.reasons.push(`Good graduation rate of ${Math.round(gradRate * 100)}%`);
    } else if (gradRate >= 0.55) {
      details.outcomes.score += 3;
      details.outcomes.reasons.push(`Moderate graduation rate of ${Math.round(gradRate * 100)}%`);
    } else {
      details.outcomes.score += 1;
    }
  }
  
  if (retentionRate) {
    if (retentionRate >= 0.90) {
      details.outcomes.score += 6;
      details.outcomes.reasons.push(`Excellent retention rate of ${Math.round(retentionRate * 100)}%`);
    } else if (retentionRate >= 0.85) {
      details.outcomes.score += 5;
      details.outcomes.reasons.push(`Strong retention rate of ${Math.round(retentionRate * 100)}%`);
    } else if (retentionRate >= 0.80) {
      details.outcomes.score += 4;
    } else if (retentionRate >= 0.75) {
      details.outcomes.score += 2;
    } else {
      details.outcomes.score += 1;
    }
  }
  
  if (details.outcomes.reasons.length === 0) {
    details.outcomes.reasons.push(`Outcomes data not available`);
  }

  // Calculate overall score (weighted average)
  const totalMax = details.academic.max + details.financial.max + details.environmental.max + details.outcomes.max;
  const totalScore = details.academic.score + details.financial.score + details.environmental.score + details.outcomes.score;
  details.overall = Math.round((totalScore / totalMax) * 100);

  return {
    scores: {
      academic: Math.round((details.academic.score / details.academic.max) * 100),
      financial: Math.round((details.financial.score / details.financial.max) * 100),
      environmental: Math.round((details.environmental.score / details.environmental.max) * 100),
      outcomes: Math.round((details.outcomes.score / details.outcomes.max) * 100),
      overall: details.overall,
    },
    details,
  };
}

/**
 * Generate fit summary text
 */
export function generateFitSummary(school, studentProfile = {}) {
  if (!school) return 'A solid match based on your profile';
  
  const reasons = [];
  
  // Academic fit
  const academicTier = school.academicTier || 'target';
  const admitRate = school['latest.admissions.admission_rate.overall'];
  
  if (academicTier === 'target' && admitRate !== null && admitRate !== undefined) {
    const admitPercent = Math.round(admitRate * 100);
    reasons.push(`Strong academic match with ${admitPercent}% admission rate`);
  } else if (academicTier === 'safety') {
    reasons.push('Excellent safety school with high acceptance probability');
  } else if (academicTier === 'reach') {
    reasons.push('Competitive reach school worth considering');
  }
  
  // Financial fit
  const cost = school['latest.cost.attendance.academic_year'] || 
               school['latest.cost.avg_net_price.overall'] ||
               school['latest.cost.tuition.in_state'] ||
               school['latest.cost.tuition.out_of_state'];
  const maxBudget = studentProfile.max_annual_budget;
  
  if (cost && maxBudget) {
    const budgetRatio = cost / maxBudget;
    if (budgetRatio <= 0.8) {
      reasons.push('Well within your budget');
    } else if (budgetRatio <= 1.0) {
      reasons.push('Fits your budget');
    }
  } else if (cost && cost <= 20000) {
    reasons.push('Affordable option');
  }
  
  // Geographic fit
  const schoolState = school['school.state'];
  const preferredRegions = studentProfile.preferred_regions || [];
  
  if (schoolState && preferredRegions.length > 0) {
    const allPreferredStates = new Set();
    preferredRegions.forEach(region => {
      const states = getStatesForRegion(region);
      states.forEach(state => allPreferredStates.add(state));
    });
    if (allPreferredStates.has(schoolState)) {
      reasons.push('Located in your preferred region');
    }
  }
  
  // Size fit
  const size = school['latest.student.size'];
  const preferredSize = studentProfile.preferred_size || [];
  
  if (size && preferredSize.length > 0) {
    const sizeRanges = {
      'very_small': { min: 0, max: 1000 },
      'small': { min: 1000, max: 5000 },
      'medium': { min: 5000, max: 15000 },
      'large': { min: 15000, max: 25000 },
      'very_large': { min: 25000, max: 1000000 },
    };
    const matchesSize = preferredSize.some(rangeKey => {
      const range = sizeRanges[rangeKey];
      return size >= range.min && size < range.max;
    });
    if (matchesSize) {
      reasons.push('Matches your preferred school size');
    }
  }
  
  // Setting fit
  const locale = school['latest.school.locale'];
  const preferredSetting = studentProfile.preferred_setting || [];
  
  if (locale && preferredSetting.length > 0) {
    const localeMap = {
      'city': [11, 12, 13],
      'suburb': [21, 22, 23],
      'town': [31, 32, 33],
      'rural': [41, 42, 43],
    };
    const matchesSetting = preferredSetting.some(setting => {
      const locales = localeMap[setting];
      return locales && locales.includes(locale);
    });
    if (matchesSetting) {
      reasons.push('Matches your preferred campus setting');
    }
  }
  
  // Outcomes fit
  const gradRate = school['latest.completion.completion_rate_4yr_150nt'] || 
                   school['latest.completion.completion_rate_6yr_150nt'];
  
  if (gradRate && gradRate >= 0.80) {
    reasons.push('Strong graduation rate');
  }
  
  if (reasons.length === 0) {
    return 'A solid match based on your profile';
  }
  
  const prioritizedReasons = reasons.slice(0, 3).join(', ');
  return prioritizedReasons + '.';
}

