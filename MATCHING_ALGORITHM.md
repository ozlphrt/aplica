# Matching Algorithm & Scoring Logic

## Overview
This document defines the complete college matching algorithm for Aplica that generates personalized recommendations. The algorithm uses a multi-phase approach: filtering incompatible schools, classifying academic fit, assessing financial viability, calculating multi-dimensional fit scores, and constructing balanced lists.

**Algorithm Goals:**
- Accuracy: Recommend schools where student has realistic admission chances
- Financial responsibility: Never recommend unaffordable schools
- Balance: Ensure proper distribution of reach/target/safety schools
- Personalization: Weight fit dimensions based on student priorities
- Transparency: Make reasoning visible and understandable

## Algorithm Phases

### Phase 1: Hard Filters (Elimination)
### Phase 2: Academic Classification (Reach/Target/Safety)
### Phase 3: Financial Viability Assessment
### Phase 4: Multi-Dimensional Fit Scoring
### Phase 5: Balanced List Construction

---

## PHASE 1: Hard Filters

Remove schools that are incompatible with student's requirements.

### Filter 1: Program Availability
```javascript
function filterByProgram(schools, intendedMajors) {
  if (intendedMajors.includes('undecided')) {
    return schools;  // Undecided students can consider all schools
  }
  
  // Get CIP codes for intended majors
  const cipCodes = intendedMajors.map(major => getCIPCode(major));
  
  return schools.filter(school => {
    // School must offer at least one of the student's intended majors
    const schoolPrograms = getSchoolPrograms(school.unitid);
    return cipCodes.some(cip => 
      schoolPrograms.some(p => p.cip_code.startsWith(cip))
    );
  });
}
```

### Filter 2: Geographic Constraints
```javascript
function filterByGeography(schools, profile) {
  const { location_preference, state_residence, preferred_regions } = profile;
  
  // "Anywhere" - no filtering
  if (location_preference.includes('anywhere')) {
    return schools;
  }
  
  // "In-state only"
  if (location_preference.includes('in_state')) {
    return schools.filter(s => s.state === state_residence);
  }
  
  // "Nearby states"
  if (location_preference.includes('nearby_states')) {
    const nearbyStates = getNearbyStates(state_residence);
    return schools.filter(s => 
      s.state === state_residence || nearbyStates.includes(s.state)
    );
  }
  
  // "Regional"
  if (location_preference.includes('regional') && preferred_regions?.length) {
    const regionStates = preferred_regions.flatMap(r => getStatesInRegion(r));
    return schools.filter(s => regionStates.includes(s.state));
  }
  
  return schools;
}

// Helper: Define nearby states
function getNearbyStates(state) {
  const nearbyMap = {
    'CA': ['OR', 'NV', 'AZ'],
    'NY': ['NJ', 'CT', 'PA', 'MA', 'VT'],
    'TX': ['OK', 'LA', 'NM', 'AR'],
    'FL': ['GA', 'AL'],
    'IL': ['WI', 'IN', 'MO', 'IA'],
    // ... complete mapping for all states
  };
  return nearbyMap[state] || [];
}
```

### Filter 3: School Size
```javascript
function filterBySize(schools, sizePreferences) {
  if (!sizePreferences?.length || sizePreferences.includes('no_preference')) {
    return schools;
  }
  
  const sizeRanges = {
    'very_small': { min: 0, max: 1000 },
    'small': { min: 1000, max: 5000 },
    'medium': { min: 5000, max: 15000 },
    'large': { min: 15000, max: 25000 },
    'very_large': { min: 25000, max: 100000 }
  };
  
  return schools.filter(school => {
    return sizePreferences.some(pref => {
      const range = sizeRanges[pref];
      return school.size >= range.min && school.size < range.max;
    });
  });
}
```

### Filter 4: Campus Setting
```javascript
function filterBySetting(schools, settingPreferences) {
  if (!settingPreferences?.length || settingPreferences.includes('no_preference')) {
    return schools;
  }
  
  // Map IPEDS locale codes to our setting categories
  const settingMap = {
    'urban': [11, 12, 13],      // City: Large, Midsize, Small
    'suburban': [21, 22, 23],    // Suburb: Large, Midsize, Small
    'town': [31, 32, 33],        // Town: Fringe, Distant, Remote
    'rural': [41, 42, 43]        // Rural: Fringe, Distant, Remote
  };
  
  const allowedLocaleCodes = settingPreferences
    .filter(s => s !== 'no_preference')
    .flatMap(s => settingMap[s]);
  
  return schools.filter(school => 
    allowedLocaleCodes.includes(school.locale_code)
  );
}
```

### Filter 5: Deal Breakers
```javascript
function filterByDealBreakers(schools, dealBreakers) {
  if (!dealBreakers?.length || dealBreakers.includes('none')) {
    return schools;
  }
  
  return schools.filter(school => {
    // Religious affiliation
    if (dealBreakers.includes('no_religious') && school.religious_affiliation) {
      return false;
    }
    
    // Greek life
    if (dealBreakers.includes('no_greek') && school.pct_in_greek_life > 0.25) {
      return false;
    }
    
    // Rural location
    if (dealBreakers.includes('no_rural') && [41, 42, 43].includes(school.locale_code)) {
      return false;
    }
    
    // Urban location
    if (dealBreakers.includes('no_urban') && [11, 12, 13].includes(school.locale_code)) {
      return false;
    }
    
    // Size constraints
    if (dealBreakers.includes('no_large') && school.size > 15000) {
      return false;
    }
    if (dealBreakers.includes('no_small') && school.size < 3000) {
      return false;
    }
    
    // Single-gender
    if (dealBreakers.includes('no_single_gender') && 
        (school.women_only || school.men_only)) {
      return false;
    }
    
    // Weather (requires adding climate data to schools table)
    if (dealBreakers.includes('no_cold_weather')) {
      const coldStates = ['AK', 'MN', 'ND', 'SD', 'WI', 'MI', 'ME', 'VT', 'NH', 'MT', 'WY'];
      if (coldStates.includes(school.state)) {
        return false;
      }
    }
    
    return true;
  });
}
```

### Filter 6: Minimum Data Completeness
```javascript
function filterByDataQuality(schools) {
  const MIN_COMPLETENESS = 50;  // Require at least 50% data completeness
  
  return schools.filter(school => {
    // Must have critical admission data
    if (!school.admit_rate) return false;
    
    // Must have at least some test score data OR be test-optional
    if (!school.test_optional && !school.sat_math_25 && !school.act_composite_25) {
      return false;
    }
    
    // Must have cost/financial data
    if (!school.cost_attendance && !school.net_price_48_75k) {
      return false;
    }
    
    // Check overall completeness
    return school.completeness_score >= MIN_COMPLETENESS;
  });
}
```

---

## PHASE 2: Academic Classification

Classify schools as Reach, Target, or Safety based on student's academic profile.

### Step 1: Normalize Student Academic Profile
```javascript
function normalizeStudentProfile(profile) {
  // Convert GPA to 4.0 scale for comparison
  let normalizedGPA = profile.gpa;
  if (profile.gpa_scale === 'weighted_5') {
    normalizedGPA = (profile.gpa / 5.0) * 4.0;
  } else if (profile.gpa_scale === 'weighted_6') {
    normalizedGPA = (profile.gpa / 6.0) * 4.0;
  }
  
  // Use SAT or convert ACT to SAT equivalent
  let studentSAT = profile.sat_score;
  if (!studentSAT && profile.act_score) {
    studentSAT = convertACTtoSAT(profile.act_score);
  }
  
  // Calculate academic strength composite
  const academicStrength = calculateAcademicStrength(profile);
  
  return {
    normalizedGPA,
    studentSAT,
    actScore: profile.act_score,
    classRankPercentile: profile.class_rank_percentile,
    courseRigor: profile.course_rigor,
    academicStrength
  };
}

// ACT to SAT conversion table
function convertACTtoSAT(actScore) {
  const conversionTable = {
    36: 1600, 35: 1560, 34: 1520, 33: 1490, 32: 1460,
    31: 1430, 30: 1400, 29: 1370, 28: 1340, 27: 1310,
    26: 1280, 25: 1250, 24: 1220, 23: 1190, 22: 1160,
    21: 1130, 20: 1100, 19: 1070, 18: 1040, 17: 1010,
    16: 980, 15: 950, 14: 920, 13: 890, 12: 860
  };
  return conversionTable[actScore] || 1000;
}

// Academic strength composite (0-100 scale)
function calculateAcademicStrength(profile) {
  let strength = 0;
  
  // GPA component (40 points)
  const gpaScore = (profile.normalizedGPA / 4.0) * 40;
  strength += gpaScore;
  
  // Test score component (30 points)
  if (profile.studentSAT) {
    const testScore = ((profile.studentSAT - 400) / 1200) * 30;
    strength += testScore;
  } else {
    // If no test scores, weight GPA more heavily
    strength += (profile.normalizedGPA / 4.0) * 30;
  }
  
  // Course rigor (20 points)
  const rigorScores = {
    'most_rigorous': 20,
    'very_rigorous': 17,
    'rigorous': 14,
    'average': 10,
    'less_rigorous': 6
  };
  strength += rigorScores[profile.course_rigor] || 10;
  
  // Class rank (10 points)
  if (profile.class_rank_percentile) {
    strength += (profile.class_rank_percentile / 100) * 10;
  } else {
    strength += 7;  // Default if unknown
  }
  
  return Math.round(strength);
}
```

### Step 2: Calculate Academic Positioning
```javascript
function classifyAcademicFit(school, studentProfile) {
  const { normalizedGPA, studentSAT, academicStrength } = studentProfile;
  
  // Handle test-optional schools
  if (school.test_optional && !studentSAT) {
    return classifyByGPAOnly(school, normalizedGPA, academicStrength);
  }
  
  // Calculate student's position in school's enrolled student range
  let testScorePosition = null;
  if (studentSAT && school.sat_math_25 && school.sat_ebrw_25) {
    const schoolSAT25 = school.sat_math_25 + school.sat_ebrw_25;
    const schoolSAT75 = school.sat_math_75 + school.sat_ebrw_75;
    const schoolSATMid = (schoolSAT25 + schoolSAT75) / 2;
    
    // Calculate percentile within school's range
    if (studentSAT < schoolSAT25) {
      testScorePosition = 'below_range';
    } else if (studentSAT > schoolSAT75) {
      testScorePosition = 'above_range';
    } else {
      testScorePosition = 'in_range';
      // More precise: calculate exact percentile
      const percentileInRange = 
        (studentSAT - schoolSAT25) / (schoolSAT75 - schoolSAT25);
      testScorePosition = {
        category: 'in_range',
        percentile: percentileInRange  // 0.0 to 1.0
      };
    }
  }
  
  // Base classification on test scores
  let academicTier;
  
  if (testScorePosition === 'below_range') {
    academicTier = 'reach';
  } else if (testScorePosition === 'above_range') {
    academicTier = 'safety';
  } else if (testScorePosition.category === 'in_range') {
    if (testScorePosition.percentile < 0.35) {
      academicTier = 'reach';
    } else if (testScorePosition.percentile > 0.65) {
      academicTier = 'safety';
    } else {
      academicTier = 'target';
    }
  }
  
  // Adjust for acceptance rate (ultra-selective schools)
  if (school.admit_rate < 0.10) {
    // Under 10% acceptance: everyone is reach or high target
    if (academicTier === 'safety') academicTier = 'target';
    if (academicTier === 'target' && testScorePosition.percentile < 0.75) {
      academicTier = 'reach';
    }
  } else if (school.admit_rate < 0.20) {
    // 10-20% acceptance: adjust safety to target
    if (academicTier === 'safety') academicTier = 'target';
  } else if (school.admit_rate > 0.70) {
    // Over 70% acceptance: adjust reach to target
    if (academicTier === 'reach' && testScorePosition !== 'below_range') {
      academicTier = 'target';
    }
  }
  
  // Calculate admission probability
  const admissionProbability = estimateAdmissionProbability(
    school,
    studentProfile,
    academicTier,
    testScorePosition
  );
  
  return {
    academicTier,
    testScorePosition,
    admissionProbability,
    reasoning: generateAcademicReasoning(school, studentProfile, academicTier)
  };
}
```

### Step 3: Estimate Admission Probability
```javascript
function estimateAdmissionProbability(school, studentProfile, tier, testPosition) {
  // Base probability from acceptance rate
  let probability = school.admit_rate;
  
  // Adjust based on student positioning
  if (tier === 'safety') {
    // Well above average admitted student
    probability = Math.min(probability * 1.5, 0.95);
  } else if (tier === 'reach') {
    // Below average admitted student
    probability = Math.max(probability * 0.5, 0.05);
  }
  
  // Further adjust based on exact test score positioning
  if (testPosition?.percentile !== undefined) {
    // Students at 75th percentile have better odds
    const positionAdjustment = 0.5 + (testPosition.percentile * 0.5);
    probability *= positionAdjustment;
  }
  
  // Adjust for course rigor
  const rigorBoost = {
    'most_rigorous': 1.15,
    'very_rigorous': 1.10,
    'rigorous': 1.05,
    'average': 1.0,
    'less_rigorous': 0.95
  };
  probability *= rigorBoost[studentProfile.courseRigor] || 1.0;
  
  // Adjust for class rank if available
  if (studentProfile.classRankPercentile) {
    if (studentProfile.classRankPercentile >= 95) {
      probability *= 1.1;
    } else if (studentProfile.classRankPercentile >= 90) {
      probability *= 1.05;
    }
  }
  
  // Cap probabilities at reasonable bounds
  return Math.max(0.01, Math.min(0.95, probability));
}
```

### Special Case: Test-Optional Classification
```javascript
function classifyByGPAOnly(school, gpa, academicStrength) {
  // For test-optional applications without scores
  // Use GPA and academic strength composite
  
  // Estimate school's average admitted GPA (if we have it)
  // Otherwise, infer from test scores
  let estimatedSchoolGPA = 3.5;  // Default
  
  if (school.sat_math_75 && school.sat_ebrw_75) {
    const avgSAT = (school.sat_math_75 + school.sat_ebrw_75 + 
                    school.sat_math_25 + school.sat_ebrw_25) / 2;
    // Rough correlation: SAT to GPA
    estimatedSchoolGPA = 2.0 + ((avgSAT - 800) / 800) * 2.0;
  }
  
  let tier;
  if (gpa < estimatedSchoolGPA - 0.3) {
    tier = 'reach';
  } else if (gpa > estimatedSchoolGPA + 0.3) {
    tier = 'safety';
  } else {
    tier = 'target';
  }
  
  // Adjust for selectivity
  if (school.admit_rate < 0.15) {
    if (tier === 'safety') tier = 'target';
    if (tier === 'target') tier = 'reach';
  }
  
  const probability = estimateAdmissionProbability(
    school, 
    { normalizedGPA: gpa, academicStrength }, 
    tier, 
    null
  );
  
  return {
    academicTier: tier,
    testScorePosition: 'test_optional',
    admissionProbability: probability,
    reasoning: `Based on GPA and academic strength (test-optional application)`
  };
}
```

---

## PHASE 3: Financial Viability Assessment

Determine if student can realistically afford each school.

### Step 1: Estimate Net Price
```javascript
function estimateNetPrice(school, studentProfile) {
  const { household_income, state_residence, max_annual_budget } = studentProfile;
  
  // Determine if in-state (for public schools)
  const inState = (school.control === 'Public' && school.state === state_residence);
  
  // Get net price for income bracket
  let baseNetPrice;
  
  switch(household_income) {
    case 'under_30k':
      baseNetPrice = school.net_price_0_30k;
      break;
    case '30_48k':
      baseNetPrice = school.net_price_30_48k;
      break;
    case '48_75k':
      baseNetPrice = school.net_price_48_75k;
      break;
    case '75_110k':
      baseNetPrice = school.net_price_75_110k;
      break;
    case '110_150k':
    case 'over_150k':
      baseNetPrice = school.net_price_110k_plus;
      break;
    default:
      // If income not provided, use median
      baseNetPrice = school.net_price_48_75k || school.cost_attendance;
  }
  
  // If no net price data, use sticker price with estimated discount
  if (!baseNetPrice) {
    baseNetPrice = school.cost_attendance;
    
    // Apply typical discount rates
    if (school.control === 'Private nonprofit') {
      baseNetPrice *= 0.60;  // 40% average discount
    } else if (inState) {
      baseNetPrice *= 0.70;  // Some aid for in-state
    }
  }
  
  // Adjust for in-state at public schools
  if (inState && school.tuition_in_state && school.tuition_out_state) {
    const inStateDiscount = school.tuition_in_state / school.tuition_out_state;
    baseNetPrice *= inStateDiscount;
  }
  
  return Math.round(baseNetPrice);
}
```

### Step 2: Estimate Merit Aid Likelihood
```javascript
function estimateMeritAid(school, studentProfile) {
  if (!school.merit_aid_available || !school.avg_merit_aid) {
    return {
      likely: false,
      estimatedAmount: 0,
      reasoning: 'School does not offer merit aid or data unavailable'
    };
  }
  
  // Merit aid typically given to top 25% of admitted students
  const { normalizedGPA, studentSAT, academicStrength } = studentProfile;
  
  // Calculate if student is in top tier
  let isTopTier = false;
  
  if (studentSAT && school.sat_math_75 && school.sat_ebrw_75) {
    const schoolSAT75 = school.sat_math_75 + school.sat_ebrw_75;
    if (studentSAT >= schoolSAT75) {
      isTopTier = true;
    }
  }
  
  // Also check GPA if student is close
  if (normalizedGPA >= 3.7 && academicStrength >= 85) {
    isTopTier = true;
  }
  
  if (isTopTier) {
    // Estimate merit amount
    let estimatedAmount = school.avg_merit_aid;
    
    // Students well above 75th percentile get more
    if (studentSAT > (school.sat_math_75 + school.sat_ebrw_75) + 100) {
      estimatedAmount *= 1.3;  // 30% more than average
    }
    
    return {
      likely: true,
      estimatedAmount: Math.round(estimatedAmount),
      reasoning: 'Academic profile suggests merit aid eligibility',
      probability: school.pct_receiving_merit || 0.25
    };
  }
  
  return {
    likely: false,
    estimatedAmount: 0,
    reasoning: 'Merit aid typically given to top 25% of admitted students'
  };
}
```

### Step 3: Calculate Financial Fit
```javascript
function assessFinancialFit(school, studentProfile) {
  const { max_annual_budget, financial_aid_need } = studentProfile;
  
  // Estimate net price
  const estimatedNetPrice = estimateNetPrice(school, studentProfile);
  
  // Estimate merit aid
  const meritAid = estimateMeritAid(school, studentProfile);
  
  // Calculate final estimated cost
  let finalCost = estimatedNetPrice;
  if (meritAid.likely) {
    finalCost -= meritAid.estimatedAmount;
  }
  finalCost = Math.max(0, finalCost);
  
  // Determine affordability
  const affordable = finalCost <= max_annual_budget;
  const gapAmount = Math.max(0, finalCost - max_annual_budget);
  const gapPercentage = max_annual_budget > 0 ? 
    (gapAmount / max_annual_budget) * 100 : 0;
  
  // Calculate financial fit score (0-100)
  let financialFitScore = 50;  // Base score
  
  if (affordable) {
    // More affordable = higher score
    const savingsAmount = max_annual_budget - finalCost;
    const savingsPercentage = (savingsAmount / max_annual_budget) * 100;
    financialFitScore = 50 + Math.min(50, savingsPercentage / 2);
  } else {
    // Less affordable = lower score
    financialFitScore = Math.max(0, 50 - (gapPercentage / 2));
  }
  
  // Bonus for schools that meet full need
  if (school.meets_full_need && financial_aid_need === 'critical') {
    financialFitScore += 10;
  }
  
  // Bonus for strong merit aid likelihood
  if (meritAid.likely && meritAid.estimatedAmount > 10000) {
    financialFitScore += 15;
  }
  
  financialFitScore = Math.min(100, Math.round(financialFitScore));
  
  return {
    estimatedNetPrice,
    meritAid,
    finalEstimatedCost: finalCost,
    affordable,
    gapAmount,
    gapPercentage: Math.round(gapPercentage),
    financialFitScore,
    warnings: generateFinancialWarnings(
      affordable,
      gapAmount,
      school,
      studentProfile
    )
  };
}

function generateFinancialWarnings(affordable, gap, school, profile) {
  const warnings = [];
  
  if (!affordable) {
    if (gap > 20000) {
      warnings.push({
        severity: 'high',
        message: `Estimated cost exceeds budget by $${gap.toLocaleString()}. Consider if loans or additional aid are realistic.`
      });
    } else if (gap > 10000) {
      warnings.push({
        severity: 'medium',
        message: `Estimated cost exceeds budget by $${gap.toLocaleString()}. May require loans or additional aid.`
      });
    } else {
      warnings.push({
        severity: 'low',
        message: `Slightly above budget. Gap may be manageable with work-study or small loans.`
      });
    }
  }
  
  if (school.control === 'Public' && school.state !== profile.state_residence) {
    warnings.push({
      severity: 'info',
      message: 'Out-of-state public university. Limited financial aid typically available.'
    });
  }
  
  if (!school.meets_full_need && profile.financial_aid_need === 'critical') {
    warnings.push({
      severity: 'medium',
      message: 'School does not meet full demonstrated financial need.'
    });
  }
  
  return warnings;
}
```

---

## PHASE 4: Multi-Dimensional Fit Scoring

Calculate fit scores across four dimensions: Academic, Financial, Environmental, and Outcomes.

### Dimension 1: Academic Fit (0-100)
```javascript
function calculateAcademicFitScore(school, studentProfile, classification) {
  let score = 50;  // Base score
  
  // 1. Program strength (30 points max)
  const programScore = assessProgramStrength(school, studentProfile.intended_majors);
  score += programScore * 0.3;
  
  // 2. Admission probability sweet spot (25 points max)
  const probScore = scoreProbabilityFit(classification.admissionProbability);
  score += probScore * 0.25;
  
  // 3. Academic environment match (20 points max)
  const envScore = scoreAcademicEnvironment(school, studentProfile);
  score += envScore * 0.20;
  
  // 4. Faculty resources (15 points max)
  const resourceScore = scoreFacultyResources(school);
  score += resourceScore * 0.15;
  
  // 5. Class size preferences (10 points max)
  const classSizeScore = scoreClassSizes(school, studentProfile);
  score += classSizeScore * 0.10;
  
  return Math.min(100, Math.round(score));
}

function assessProgramStrength(school, majors) {
  if (majors.includes('undecided')) return 50;  // Neutral for undecided
  
  // Check if we have ranking data for student's majors
  const rankings = getProgramRankings(school.unitid, majors);
  
  if (!rankings || rankings.length === 0) {
    // No ranking data - use graduation rate in major as proxy
    const gradRate = school.graduation_rate_4yr;
    if (gradRate > 0.70) return 70;
    if (gradRate > 0.50) return 60;
    return 50;
  }
  
  // Use best ranking among student's intended majors
  const bestRanking = Math.min(...rankings.map(r => r.rank));
  const bestPercentile = Math.max(...rankings.map(r => r.percentile));
  
  // Convert to 0-100 score
  if (bestPercentile) return bestPercentile;
  
  // Or convert rank to score
  if (bestRanking <= 10) return 100;
  if (bestRanking <= 25) return 90;
  if (bestRanking <= 50) return 80;
  if (bestRanking <= 100) return 70;
  return 60;
}

function scoreProbabilityFit(probability) {
  // Sweet spot: 30-70% probability (target range)
  if (probability >= 0.30 && probability <= 0.70) {
    return 100;  // Perfect target range
  }
  
  if (probability >= 0.20 && probability < 0.30) {
    return 80;  // Low target / high reach
  }
  
  if (probability > 0.70 && probability <= 0.85) {
    return 80;  // Low safety / high target
  }
  
  if (probability < 0.20) {
    return 50;  // Reach - possible but uncertain
  }
  
  if (probability > 0.85) {
    return 70;  // Safety - good backup
  }
  
  return 60;
}

function scoreAcademicEnvironment(school, profile) {
  let score = 50;
  
  // Match academic culture preference
  if (profile.academic_culture) {
    // 1 = highly competitive, 5 = very collaborative
    const preferredCulture = profile.academic_culture;
    
    // Infer school culture from characteristics
    let schoolCulture = 3;  // Default: balanced
    
    if (school.admit_rate < 0.15) {
      schoolCulture = 1.5;  // Ultra-selective = competitive
    } else if (school.admit_rate < 0.30) {
      schoolCulture = 2.0;  // Selective = somewhat competitive
    } else if (school.admit_rate > 0.70) {
      schoolCulture = 4.0;  // Open admission = less competitive
    }
    
    // Liberal arts colleges tend to be more collaborative
    if (school.liberal_arts_college) {
      schoolCulture += 0.5;
    }
    
    // Calculate distance from preference
    const cultureDifference = Math.abs(preferredCulture - schoolCulture);
    score += Math.max(0, 50 - (cultureDifference * 10));
  }
  
  return Math.min(100, score);
}

function scoreFacultyResources(school) {
  let score = 50;
  
  // Student-faculty ratio (lower is better)
  if (school.student_faculty_ratio) {
    if (school.student_faculty_ratio <= 10) {
      score += 30;
    } else if (school.student_faculty_ratio <= 15) {
      score += 20;
    } else if (school.student_faculty_ratio <= 20) {
      score += 10;
    }
  }
  
  // Full-time faculty percentage
  if (school.pct_faculty_fulltime >= 0.80) {
    score += 20;
  } else if (school.pct_faculty_fulltime >= 0.70) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function scoreClassSizes(school, profile) {
  let score = 50;
  
  // Small classes generally preferred
  if (school.pct_classes_under_20) {
    score += school.pct_classes_under_20 * 40;  // Max 40 points
  }
  
  // Penalize large classes
  if (school.pct_classes_over_50) {
    score -= school.pct_classes_over_50 * 30;  // Max -30 points
  }
  
  return Math.max(0, Math.min(100, score));
}
```

### Dimension 2: Financial Fit (0-100)
```javascript
function calculateFinancialFitScore(school, studentProfile, financialAssessment) {
  // Already calculated in Phase 3
  return financialAssessment.financialFitScore;
}
```

### Dimension 3: Environmental Fit (0-100)
```javascript
function calculateEnvironmentalFitScore(school, studentProfile) {
  let score = 50;  // Base score
  
  // 1. Size match (25 points)
  const sizeScore = scoreSizeMatch(school.size, studentProfile.school_size_preference);
  score += sizeScore * 0.25;
  
  // 2. Setting match (25 points)
  const settingScore = scoreSettingMatch(school.locale_code, studentProfile.setting_preference);
  score += settingScore * 0.25;
  
  // 3. Distance from home (20 points)
  const distanceScore = scoreDistanceMatch(school, studentProfile);
  score += distanceScore * 0.20;
  
  // 4. Campus culture match (20 points)
  const cultureScore = scoreCampusCulture(school, studentProfile);
  score += cultureScore * 0.20;
  
  // 5. Weather preference (10 points)
  const weatherScore = scoreWeatherMatch(school.state, studentProfile.weather_preference);
  score += weatherScore * 0.10;
  
  return Math.min(100, Math.round(score));
}

function scoreSizeMatch(schoolSize, sizePreferences) {
  if (!sizePreferences?.length || sizePreferences.includes('no_preference')) {
    return 100;
  }
  
  // Determine which size category school falls into
  let schoolCategory;
  if (schoolSize < 1000) schoolCategory = 'very_small';
  else if (schoolSize < 5000) schoolCategory = 'small';
  else if (schoolSize < 15000) schoolCategory = 'medium';
  else if (schoolSize < 25000) schoolCategory = 'large';
  else schoolCategory = 'very_large';
  
  // Perfect match
  if (sizePreferences.includes(schoolCategory)) {
    return 100;
  }
  
  // Adjacent size categories (e.g., small vs. medium)
  const adjacentCategories = {
    'very_small': ['small'],
    'small': ['very_small', 'medium'],
    'medium': ['small', 'large'],
    'large': ['medium', 'very_large'],
    'very_large': ['large']
  };
  
  const adjacent = adjacentCategories[schoolCategory] || [];
  if (sizePreferences.some(pref => adjacent.includes(pref))) {
    return 70;  // Close match
  }
  
  return 40;  // Not a match
}

function scoreSettingMatch(localeCode, settingPreferences) {
  if (!settingPreferences?.length || settingPreferences.includes('no_preference')) {
    return 100;
  }
  
  // Determine school's setting
  let schoolSetting;
  if ([11, 12, 13].includes(localeCode)) schoolSetting = 'urban';
  else if ([21, 22, 23].includes(localeCode)) schoolSetting = 'suburban';
  else if ([31, 32, 33].includes(localeCode)) schoolSetting = 'town';
  else if ([41, 42, 43].includes(localeCode)) schoolSetting = 'rural';
  
  // Perfect match
  if (settingPreferences.includes(schoolSetting)) {
    return 100;
  }
  
  // Adjacent settings
  const adjacentSettings = {
    'urban': ['suburban'],
    'suburban': ['urban', 'town'],
    'town': ['suburban', 'rural'],
    'rural': ['town']
  };
  
  const adjacent = adjacentSettings[schoolSetting] || [];
  if (settingPreferences.some(pref => adjacent.includes(pref))) {
    return 70;
  }
  
  return 40;
}

function scoreDistanceMatch(school, profile) {
  // Calculate approximate distance (would need geocoding in production)
  const distance = estimateDistance(
    profile.state_residence,
    school.state,
    school.city
  );
  
  switch(profile.distance_from_home) {
    case 'commute':
      return distance < 30 ? 100 : 20;
    case 'drive_home':
      return distance < 180 ? 100 : distance < 300 ? 70 : 40;
    case 'day_trip':
      return distance < 360 ? 100 : distance < 500 ? 70 : 50;
    case 'in_state':
      return school.state === profile.state_residence ? 100 : 40;
    case 'regional':
      return distance < 800 ? 100 : 60;
    case 'anywhere':
      return 100;  // No preference
    case 'prefer_far':
      return distance > 500 ? 100 : distance > 300 ? 80 : 60;
    default:
      return 100;
  }
}

function scoreCampusCulture(school, profile) {
  if (!profile.campus_culture?.length) return 100;
  
  let matchScore = 50;
  const preferences = profile.campus_culture;
  
  // Match preferences to school characteristics
  preferences.forEach(pref => {
    switch(pref) {
      case 'diverse':
        if ((school.pct_white || 1.0) < 0.60) matchScore += 10;
        break;
      case 'lgbtq_friendly':
        // Would need additional data source
        if (school.setting === 'urban') matchScore += 5;
        break;
      case 'outdoorsy':
        if (['rural', 'town'].includes(school.setting)) matchScore += 10;
        break;
      case 'party_scene':
        if (school.pct_in_greek_life > 0.20) matchScore += 10;
        break;
      case 'religious':
        if (school.religious_affiliation) matchScore += 15;
        break;
      case 'close_knit':
        if (school.size < 5000) matchScore += 10;
        break;
      case 'preprofessional':
        if (school.employment_rate > 0.85) matchScore += 10;
        break;
    }
  });
  
  return Math.min(100, matchScore);
}

function scoreWeatherMatch(state, weatherPref) {
  if (!weatherPref || weatherPref === 'no_preference') return 100;
  
  const weatherMap = {
    'warm_year_round': ['CA', 'FL', 'HI', 'AZ', 'TX'],
    'hot_summers': ['GA', 'SC', 'NC', 'AL', 'MS', 'LA', 'AR', 'OK', 'NM'],
    'four_seasons': ['NY', 'PA', 'NJ', 'MA', 'CT', 'OH', 'MI', 'IL', 'IN', 'WI'],
    'mild_year_round': ['WA', 'OR'],
    'cold_winters': ['MN', 'ND', 'SD', 'MT', 'WY', 'ME', 'VT', 'NH', 'AK']
  };
  
  const matchingStates = weatherMap[weatherPref] || [];
  return matchingStates.includes(state) ? 100 : 60;
}
```

### Dimension 4: Outcomes Fit (0-100)
```javascript
function calculateOutcomesFitScore(school, studentProfile) {
  let score = 50;  // Base score
  
  // 1. Retention rate (30 points) - strong predictor of student satisfaction
  if (school.retention_rate) {
    if (school.retention_rate >= 0.95) score += 30;
    else if (school.retention_rate >= 0.90) score += 25;
    else if (school.retention_rate >= 0.85) score += 20;
    else if (school.retention_rate >= 0.80) score += 15;
    else if (school.retention_rate >= 0.75) score += 10;
    else score += 5;
  }
  
  // 2. Graduation rate (30 points)
  const targetGradRate = studentProfile.post_grad_plans === 'workforce' ?
    school.graduation_rate_4yr : school.graduation_rate_6yr;
  
  if (targetGradRate) {
    if (targetGradRate >= 0.85) score += 30;
    else if (targetGradRate >= 0.75) score += 25;
    else if (targetGradRate >= 0.65) score += 20;
    else if (targetGradRate >= 0.55) score += 15;
    else score += 10;
  }
  
  // 3. Career outcomes (25 points)
  if (studentProfile.post_grad_plans === 'workforce') {
    // Emphasize earnings and employment
    if (school.median_earnings_6yr) {
      if (school.median_earnings_6yr >= 60000) score += 15;
      else if (school.median_earnings_6yr >= 50000) score += 12;
      else if (school.median_earnings_6yr >= 40000) score += 9;
      else score += 6;
    }
    
    if (school.employment_rate) {
      if (school.employment_rate >= 0.90) score += 10;
      else if (school.employment_rate >= 0.85) score += 7;
      else score += 4;
    }
  } else if (studentProfile.post_grad_plans === 'professional' || 
             studentProfile.post_grad_plans === 'masters') {
    // Emphasize research opportunities and grad school placement
    if (school.research_university) score += 15;
    if (school.student_faculty_ratio <= 12) score += 10;
  }
  
  // 4. Value proposition (15 points) - outcomes relative to cost
  const estimatedROI = calculateROI(school, studentProfile);
  if (estimatedROI > 1.5) score += 15;
  else if (estimatedROI > 1.2) score += 12;
  else if (estimatedROI > 1.0) score += 9;
  else if (estimatedROI > 0.8) score += 6;
  else score += 3;
  
  return Math.min(100, Math.round(score));
}

function calculateROI(school, profile) {
  // Simple ROI: (median earnings * 4 years) / (net price * 4 years)
  const fourYearCost = profile.finalEstimatedCost * 4;
  const fourYearEarnings = (school.median_earnings_6yr || 45000) * 4;
  
  if (fourYearCost === 0) return 2.0;  // Free = great ROI
  return fourYearEarnings / fourYearCost;
}
```

### Composite Fit Score
```javascript
function calculateCompositeFitScore(school, studentProfile, classification, financial) {
  // Calculate all dimension scores
  const academicScore = calculateAcademicFitScore(school, studentProfile, classification);
  const financialScore = financial.financialFitScore;
  const environmentalScore = calculateEnvironmentalFitScore(school, studentProfile);
  const outcomesScore = calculateOutcomesFitScore(school, studentProfile);
  
  // Determine weights based on student priorities
  const weights = determineWeights(studentProfile);
  
  // Calculate weighted composite
  const composite = 
    (academicScore * weights.academic) +
    (financialScore * weights.financial) +
    (environmentalScore * weights.environmental) +
    (outcomesScore * weights.outcomes);
  
  return {
    composite: Math.round(composite),
    breakdown: {
      academic: academicScore,
      financial: financialScore,
      environmental: environmentalScore,
      outcomes: outcomesScore
    },
    weights
  };
}

function determineWeights(profile) {
  // Default weights
  let weights = {
    academic: 0.30,
    financial: 0.30,
    environmental: 0.25,
    outcomes: 0.15
  };
  
  // Adjust based on student priorities
  if (profile.financial_aid_need === 'critical') {
    weights.financial = 0.40;
    weights.academic = 0.25;
    weights.environmental = 0.20;
    weights.outcomes = 0.15;
  }
  
  if (profile.post_grad_plans === 'workforce') {
    weights.outcomes = 0.25;
    weights.academic = 0.25;
    weights.financial = 0.30;
    weights.environmental = 0.20;
  }
  
  if (profile.post_grad_plans === 'masters' || profile.post_grad_plans === 'professional') {
    weights.academic = 0.40;
    weights.outcomes = 0.20;
    weights.financial = 0.25;
    weights.environmental = 0.15;
  }
  
  // If no strong location preference, reduce environmental weight
  if (profile.location_preference?.includes('anywhere')) {
    const envReduction = 0.10;
    weights.environmental -= envReduction;
    weights.academic += envReduction / 2;
    weights.outcomes += envReduction / 2;
  }
  
  return weights;
}
```

---

## PHASE 5: Balanced List Construction

Build a final recommended list with proper reach/target/safety distribution.

### Step 1: Filter to Affordable Schools
```javascript
function filterToAffordable(schools) {
  return schools.filter(school => {
    const financial = school.financialAssessment;
    
    // Include if affordable OR high merit aid likelihood
    return financial.affordable || 
           (financial.meritAid.likely && financial.meritAid.estimatedAmount > 10000);
  });
}
```

### Step 2: Sort by Composite Fit
```javascript
function sortByFit(schools) {
  return schools.sort((a, b) => {
    // Primary sort: composite fit score
    if (b.fitScores.composite !== a.fitScores.composite) {
      return b.fitScores.composite - a.fitScores.composite;
    }
    
    // Secondary sort: admission probability (prefer targets)
    const aProbDiff = Math.abs(a.classification.admissionProbability - 0.50);
    const bProbDiff = Math.abs(b.classification.admissionProbability - 0.50);
    return aProbDiff - bProbDiff;
  });
}
```

### Step 3: Build Balanced List
```javascript
function buildBalancedList(schools, studentProfile) {
  const TARGET_LIST_SIZE = {
    reaches: 3,
    targets: 5,
    safeties: 3,
    total: 11
  };
  
  // Separate by tier
  const reaches = schools.filter(s => s.classification.academicTier === 'reach');
  const targets = schools.filter(s => s.classification.academicTier === 'target');
  const safeties = schools.filter(s => s.classification.academicTier === 'safety');
  
  // Select best from each tier
  const selectedReaches = reaches.slice(0, TARGET_LIST_SIZE.reaches);
  const selectedTargets = targets.slice(0, TARGET_LIST_SIZE.targets);
  const selectedSafeties = safeties.slice(0, TARGET_LIST_SIZE.safeties);
  
  // Ensure at least one financial safety
  let financialSafety = selectedSafeties.find(s => 
    s.financialAssessment.finalEstimatedCost < studentProfile.max_annual_budget * 0.80
  );
  
  if (!financialSafety && safeties.length > 0) {
    // Find most affordable safety
    financialSafety = safeties.reduce((cheapest, school) => 
      school.financialAssessment.finalEstimatedCost < 
      cheapest.financialAssessment.finalEstimatedCost ? school : cheapest
    );
    
    // Add if not already in list
    if (!selectedSafeties.includes(financialSafety)) {
      selectedSafeties.push(financialSafety);
    }
  }
  
  // Generate warnings
  const warnings = generateListWarnings({
    reaches: selectedReaches,
    targets: selectedTargets,
    safeties: selectedSafeties,
    financialSafety,
    totalCandidates: schools.length
  }, studentProfile);
  
  return {
    recommendedList: [...selectedReaches, ...selectedTargets, ...selectedSafeties],
    reaches: selectedReaches,
    targets: selectedTargets,
    safeties: selectedSafeties,
    financialSafety,
    listBalance: {
      reachCount: selectedReaches.length,
      targetCount: selectedTargets.length,
      safetyCount: selectedSafeties.length,
      total: selectedReaches.length + selectedTargets.length + selectedSafeties.length
    },
    warnings,
    totalCandidatesConsidered: schools.length
  };
}
```

### Step 4: Generate Warnings and Recommendations
```javascript
function generateListWarnings(list, profile) {
  const warnings = [];
  
  // Check for missing financial safety
  if (!list.financialSafety) {
    warnings.push({
      type: 'no_financial_safety',
      severity: 'critical',
      message: 'No guaranteed affordable school in your list. Add a financial safety.',
      action: 'Find schools where net price is well below your budget'
    });
  }
  
  // Check for insufficient safeties
  if (list.safeties.length < 2) {
    warnings.push({
      type: 'insufficient_safeties',
      severity: 'high',
      message: `Only ${list.safeties.length} safety school(s). Add at least ${2 - list.safeties.length} more.`,
      action: 'Look for schools where your stats are above the 75th percentile'
    });
  }
  
  // Check for no reaches
  if (list.reaches.length === 0) {
    warnings.push({
      type: 'no_reaches',
      severity: 'low',
      message: 'No reach schools selected. Consider adding 1-2 aspirational options.',
      action: 'Look at schools where you\'re in the middle 50% range'
    });
  }
  
  // Check for insufficient targets
  if (list.targets.length < 3) {
    warnings.push({
      type: 'insufficient_targets',
      severity: 'medium',
      message: 'Add more target schools for a balanced list.',
      action: 'Target schools give you the best balance of fit and admission likelihood'
    });
  }
  
  // Check for too many reaches
  if (list.reaches.length > list.targets.length + list.safeties.length) {
    warnings.push({
      type: 'too_many_reaches',
      severity: 'medium',
      message: 'List is reach-heavy. Admission to reaches is uncertain.',
      action: 'Add more target and safety schools to ensure options'
    });
  }
  
  // Check for geographic diversity if student is open
  if (profile.location_preference?.includes('anywhere')) {
    const states = new Set(list.recommendedList.map(s => s.state));
    if (states.size < 4) {
      warnings.push({
        type: 'limited_geographic_diversity',
        severity: 'low',
        message: 'Consider schools in more states for diverse options.',
        action: 'Geographic diversity can mean different opportunities and costs'
      });
    }
  }
  
  // Check for all affordable
  const allAffordable = list.recommendedList.every(s => s.financialAssessment.affordable);
  if (!allAffordable) {
    const unaffordableCount = list.recommendedList.filter(s => 
      !s.financialAssessment.affordable
    ).length;
    
    warnings.push({
      type: 'some_unaffordable',
      severity: 'high',
      message: `${unaffordableCount} school(s) exceed your budget without merit aid.`,
      action: 'Consider likelihood of merit aid or adjust budget expectations'
    });
  }
  
  return warnings;
}
```

---

## Algorithm Constants

All tunable constants in one place for easy adjustment.
```javascript
const ALGORITHM_CONSTANTS = {
  // Academic Classification
  REACH_THRESHOLD_PERCENTILE: 0.25,      // Below 25th percentile = reach
  SAFETY_THRESHOLD_PERCENTILE: 0.75,     // Above 75th percentile = safety
  ULTRA_SELECTIVE_RATE: 0.10,            // Under 10% = everyone reach/high target
  HIGHLY_SELECTIVE_RATE: 0.20,           // 10-20% = adjust safety to target
  OPEN_ADMISSION_RATE: 0.70,             // Over 70% = adjust reach to target
  
  // Probability Estimation
  SAFETY_PROBABILITY_MULTIPLIER: 1.5,    // Safety schools get 1.5x base rate
  REACH_PROBABILITY_MULTIPLIER: 0.5,     // Reach schools get 0.5x base rate
  MAX_PROBABILITY: 0.95,                 // Cap at 95% (nothing is certain)
  MIN_PROBABILITY: 0.05,                 // Floor at 5% (always some chance)
  
  // Course Rigor Adjustments
  RIGOR_MULTIPLIERS: {
    'most_rigorous': 1.15,
    'very_rigorous': 1.10,
    'rigorous': 1.05,
    'average': 1.0,
    'less_rigorous': 0.95
  },
  
  // Class Rank Boosts
  TOP_1_PERCENT_BOOST: 1.15,
  TOP_5_PERCENT_BOOST: 1.10,
  TOP_10_PERCENT_BOOST: 1.05,
  
  // Financial
  MERIT_AID_TOP_PERCENTILE: 0.75,        // Merit aid for students above 75th
  MERIT_AID_SUPER_BOOST: 1.3,            // 30% more aid if well above 75th
  PRIVATE_SCHOOL_AVG_DISCOUNT: 0.60,     // Private schools discount 40% on average
  IN_STATE_PUBLIC_DISCOUNT: 0.70,        // In-state 30% discount vs out-of-state
  
  // Fit Score Weights (default)
  DEFAULT_WEIGHTS: {
    academic: 0.30,
    financial: 0.30,
    environmental: 0.25,
    outcomes: 0.15
  },
  
  // Critical Need Adjustments
  CRITICAL_FINANCIAL_NEED_WEIGHTS: {
    academic: 0.25,
    financial: 0.40,
    environmental: 0.20,
    outcomes: 0.15
  },
  
  // Workforce Focus Adjustments
  WORKFORCE_FOCUSED_WEIGHTS: {
    academic: 0.25,
    financial: 0.30,
    environmental: 0.20,
    outcomes: 0.25
  },
  
  // Graduate School Focus Adjustments
  GRAD_SCHOOL_FOCUSED_WEIGHTS: {
    academic: 0.40,
    financial: 0.25,
    environmental: 0.15,
    outcomes: 0.20
  },
  
  // List Construction
  TARGET_LIST_SIZE: {
    reaches: 3,
    targets: 5,
    safeties: 3,
    total: 11
  },
  
  FINANCIAL_SAFETY_THRESHOLD: 0.80,      // 80% of max budget or less
  MIN_SAFETY_COUNT: 2,
  MIN_TARGET_COUNT: 3,
  
  // Data Quality
  MIN_COMPLETENESS_SCORE: 50,            // Require 50% data completeness
  
  // ACT to SAT Conversion
  ACT_SAT_CONVERSION: {
    36: 1600, 35: 1560, 34: 1520, 33: 1490, 32: 1460,
    31: 1430, 30: 1400, 29: 1370, 28: 1340, 27: 1310,
    26: 1280, 25: 1250, 24: 1220, 23: 1190, 22: 1160,
    21: 1130, 20: 1100, 19: 1070, 18: 1040, 17: 1010,
    16: 980, 15: 950, 14: 920, 13: 890, 12: 860
  }
};
```

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Algorithm Tuning**: Based on counselor best practices and admission data analysis  
**Maintained By**: Algorithm Team