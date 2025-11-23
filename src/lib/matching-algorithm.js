/**
 * College Matching Algorithm
 * 
 * NOTE: This is API-first architecture.
 * Instead of querying local database, we:
 * 1. Make API calls to get candidate schools based on student profile
 * 2. Filter results client-side for additional criteria
 * 3. Calculate fit scores on filtered results
 * 4. Return top matches
 * 
 * Full implementation: Phase 4
 */

import { fetchSchoolsPaginated } from './scorecard-api.js';
import { getStatesForRegion } from '../utils/regions.js';

/**
 * Generate college matches for student profile
 * @param {Object} studentProfile - Complete student profile from questionnaire (answers object)
 * @param {Object} options - Matching options { limit: 50, includeReach: true }
 * @returns {Promise<Object>} - { matches: [], warnings: [] }
 */
export async function generateMatches(studentProfile, options = {}) {
  console.log('generateMatches called with:', studentProfile);
  
  // If profile is empty or invalid, return empty matches immediately
  if (!studentProfile || typeof studentProfile !== 'object' || Object.keys(studentProfile).length === 0) {
    console.log('Empty profile - returning no matches');
    return {
      matches: [],
      warnings: [],
    };
  }
  
  const { limit = 50, includeReach = true } = options;
  
  // Build filters from Tier 1 answers
  const filters = {};
  
  // Region filter - convert preferred_regions to states
  if (studentProfile.preferred_regions && Array.isArray(studentProfile.preferred_regions) && studentProfile.preferred_regions.length > 0) {
    const allStates = new Set();
    studentProfile.preferred_regions.forEach(regionKey => {
      const states = getStatesForRegion(regionKey);
      states.forEach(state => allStates.add(state));
    });
    filters.states = Array.from(allStates);
    console.log('Selected regions:', studentProfile.preferred_regions);
    console.log('Mapped to states:', filters.states);
  }
  
  // Size filter - always filter client-side to avoid excluding schools with missing data
  if (studentProfile.preferred_size && Array.isArray(studentProfile.preferred_size) && studentProfile.preferred_size.length > 0) {
    filters.sizeRanges = studentProfile.preferred_size;
  }
  
  // Setting filter - always filter client-side to avoid excluding schools with missing data
  if (studentProfile.preferred_setting && Array.isArray(studentProfile.preferred_setting) && studentProfile.preferred_setting.length > 0) {
    filters.settings = studentProfile.preferred_setting;
  }
  
  // Budget filter - filter client-side to avoid excluding schools with missing cost data
  // Single value represents inclusive range from $0 to selected amount
  if (studentProfile.max_annual_budget !== null && studentProfile.max_annual_budget !== undefined) {
    // Handle both single value (new format) and array (legacy format)
    const maxBudget = Array.isArray(studentProfile.max_annual_budget) 
      ? Math.max(...studentProfile.max_annual_budget)
      : studentProfile.max_annual_budget;
    filters.maxBudget = maxBudget; // Filter schools from $0 to maxBudget (inclusive)
    console.log(`Budget filter: Maximum budget $${maxBudget} (includes schools from $0 to $${maxBudget})`);
  }
  
  try {
    // Optimize: Make parallel API calls per state (API only supports single state per request)
    // This is much faster than fetching all schools and filtering client-side
    let allSchools = [];
    
    if (filters.states && filters.states.length > 0) {
      console.log(`Making parallel API calls for ${filters.states.length} states:`, filters.states);
      
      // Make parallel API calls - one per state
      // This uses API filtering server-side, which is much faster
      const statePromises = filters.states.map(async (state) => {
        const stateFilters = {
          ...filters,
          state: state, // Single state for API filter
          states: undefined, // Remove states array
          // Don't use API range filters if they might be too restrictive
          // We'll filter client-side instead to avoid excluding schools with missing data
          minSize: undefined,
          maxSize: undefined,
          localeRange: undefined,
          maxCost: undefined,
        };
        // Fetch up to 200 schools per state (should be enough for most states)
        const result = await fetchSchoolsPaginated(stateFilters, 200);
        console.log(`State ${state}: Found ${result.schools.length} schools`);
        return result.schools;
      });
      
      const stateResults = await Promise.all(statePromises);
      allSchools = stateResults.flat();
      console.log(`Total schools from all states: ${allSchools.length}`);
    } else {
      // No state filter - fetch all schools
      console.log('No state filter - fetching all schools');
      const result = await fetchSchoolsPaginated(filters, 500);
      allSchools = result.schools;
    }
    
    let filteredSchools = allSchools;
    
    // Log state distribution for debugging
    if (filters.states && filters.states.length > 0) {
      const stateCounts = {};
      filteredSchools.forEach(school => {
        const state = school['school.state'];
        if (state) {
          stateCounts[state] = (stateCounts[state] || 0) + 1;
        }
      });
      console.log('Schools by state:', stateCounts);
      
      // Log Seattle schools specifically
      const seattleSchools = filteredSchools.filter(school => 
        school['school.city'] && school['school.city'].toLowerCase().includes('seattle')
      );
      console.log(`Seattle schools found: ${seattleSchools.length}`);
      if (seattleSchools.length > 0) {
        console.log('Seattle schools:', seattleSchools.map(s => s['school.name']));
      }
      
      // If WA is in selected states but we have very few WA schools, log a warning
      if (filters.states.includes('WA') && (stateCounts['WA'] || 0) < 10) {
        console.warn(`Warning: Only found ${stateCounts['WA'] || 0} schools from WA. May need to fetch more pages.`);
      }
    }
    
    // Apply client-side filters for multiple selections
    
    // Size filter (multiple ranges)
    if (filters.sizeRanges && filters.sizeRanges.length > 0) {
      const beforeCount = filteredSchools.length;
      const sizeRanges = {
        'very_small': { min: 0, max: 1000 },
        'small': { min: 1000, max: 5000 },
        'medium': { min: 5000, max: 15000 },
        'large': { min: 15000, max: 25000 },
        'very_large': { min: 25000, max: 1000000 },
      };
      
      filteredSchools = filteredSchools.filter(school => {
        const size = school['latest.student.size'];
        // If no size data, include the school (don't exclude due to missing data)
        if (!size) return true;
        return filters.sizeRanges.some(rangeKey => {
          const range = sizeRanges[rangeKey];
          return size >= range.min && size < range.max;
        });
      });
      console.log(`Size filter (${filters.sizeRanges.join(', ')}): ${beforeCount} -> ${filteredSchools.length} schools`);
    }
    
    // Setting filter (multiple settings)
    if (filters.settings && filters.settings.length > 0) {
      const beforeCount = filteredSchools.length;
      const localeMap = {
        'city': [11, 12, 13],
        'suburb': [21, 22, 23],
        'town': [31, 32, 33],
        'rural': [41, 42, 43],
      };
      
      const validLocales = new Set();
      filters.settings.forEach(setting => {
        if (localeMap[setting]) {
          localeMap[setting].forEach(locale => validLocales.add(locale));
        }
      });
      
      filteredSchools = filteredSchools.filter(school => {
        const locale = school['latest.school.locale'];
        // If no locale data, include the school (don't exclude due to missing data)
        if (!locale) return true;
        return validLocales.has(locale);
      });
      console.log(`Setting filter (${filters.settings.join(', ')}): ${beforeCount} -> ${filteredSchools.length} schools`);
    }
    
    // Deal Breakers Filter (Tier 3) - Hard exclusions
    const dealBreakers = studentProfile.deal_breakers || [];
    if (dealBreakers.length > 0 && !dealBreakers.includes('none')) {
      const beforeCount = filteredSchools.length;
      filteredSchools = filteredSchools.filter(school => {
        const locale = school['latest.school.locale'];
        const size = school['latest.student.size'];
        const ownership = school['latest.school.ownership'];
        
        // Check each deal breaker
        if (dealBreakers.includes('no_rural') && locale >= 41 && locale <= 43) return false;
        if (dealBreakers.includes('no_urban') && locale >= 11 && locale <= 13) return false;
        if (dealBreakers.includes('no_large') && size > 15000) return false;
        if (dealBreakers.includes('no_small') && size < 3000) return false;
        // Note: Other deal breakers (religious, greek life, etc.) would need additional school data
        
        return true;
      });
      console.log(`Deal breakers filter: ${beforeCount} -> ${filteredSchools.length} schools`);
    }
    
    // Budget filter - check both maxCost (API filter) and maxBudget (client-side fallback)
    const budgetLimit = filters.maxCost || filters.maxBudget;
    if (budgetLimit) {
      const beforeCount = filteredSchools.length;
      
      // Group schools by cost to understand distribution
      const costDistribution = {
        under20k: 0,
        under30k: 0,
        over30k: 0,
        noData: 0
      };
      
      filteredSchools = filteredSchools.filter(school => {
        const cost = school['latest.cost.attendance.academic_year'] || 
                    school['latest.cost.avg_net_price.overall'] ||
                    school['latest.cost.tuition.in_state'] ||
                    school['latest.cost.tuition.out_of_state'];
        
        // Track cost distribution
        if (!cost) {
          costDistribution.noData++;
          return true; // Include schools with missing cost data
        }
        
        if (cost <= 20000) costDistribution.under20k++;
        else if (cost <= 30000) costDistribution.under30k++;
        else costDistribution.over30k++;
        
        return cost <= budgetLimit;
      });
      
      console.log(`Budget filter (max $${budgetLimit}): ${beforeCount} -> ${filteredSchools.length} schools`);
      console.log('Cost distribution:', costDistribution);
    }
    
    // Basic academic filtering based on GPA and test scores
    const gpa = studentProfile.gpa || 3.5;
    const satScore = studentProfile.sat_score;
    const actScore = studentProfile.act_score;
    
    console.log(`After all filters: ${filteredSchools.length} schools remain`);
    
    if (filteredSchools.length === 0) {
      console.error('ERROR: No schools passed all filters!');
      console.error('Filters applied:', {
        states: filters.states,
        sizeRanges: filters.sizeRanges,
        settings: filters.settings,
        maxBudget: filters.maxBudget
      });
      console.error('This should not happen - check filtering logic');
      return {
        matches: [],
        warnings: ['No schools matched all your criteria. Try relaxing some filters.'],
      };
    }
    
    // Classify schools as reach/target/safety based on admission rates and test scores
    // Make sure we have schools to process
    if (filteredSchools.length === 0) {
      console.error('ERROR: filteredSchools is empty before mapping!');
      return {
        matches: [],
        warnings: ['No schools matched your criteria after filtering.'],
      };
    }
    
    console.log(`Processing ${Math.min(filteredSchools.length, limit)} schools for classification...`);
    const matches = filteredSchools.slice(0, limit).map(school => {
      const admitRate = school['latest.admissions.admission_rate.overall'];
      const satMath = school['latest.admissions.sat_scores.midpoint.math'];
      const satEbrw = school['latest.admissions.sat_scores.midpoint.critical_reading'];
      const satTotal = satMath && satEbrw ? satMath + satEbrw : null;
      const actComposite = school['latest.admissions.act_scores.midpoint.cumulative'];
      
      // Classify academic tier - balanced thresholds for all three tiers
      let academicTier = 'target';
      const gpa = studentProfile.gpa || 3.5;
      const satScore = studentProfile.sat_score;
      const actScore = studentProfile.act_score;
      
      if (admitRate !== null && admitRate !== undefined) {
        // Balanced thresholds:
        // Reach: < 40% admission rate (selective schools)
        // Target: 40-65% admission rate (moderate selectivity)
        // Safety: > 65% admission rate (less selective) - lowered threshold
        if (admitRate < 0.4) {
          academicTier = 'reach';
        } else if (admitRate > 0.65) {
          academicTier = 'safety';
        }
      } else if (satTotal && satScore) {
        // Use SAT scores if admission rate not available
        // Balanced: 50+ point difference
        if (satTotal > satScore + 50) {
          academicTier = 'reach';
        } else if (satTotal < satScore - 50) {
          academicTier = 'safety';
        }
      } else if (actComposite && actScore) {
        // Use ACT scores - balanced: 2+ point difference
        if (actComposite > actScore + 2) {
          academicTier = 'reach';
        } else if (actComposite < actScore - 2) {
          academicTier = 'safety';
        }
      } else {
        // No admission rate or test scores - use GPA as proxy
        if (gpa < 3.0) {
          // Low GPA - most schools are reach
          academicTier = 'reach';
        } else if (gpa > 3.8) {
          // High GPA - fewer schools are reach
          academicTier = 'target';
        }
      }
      
      // Additional check: if school has high test scores but no admission rate,
      // classify as reach if student's scores are significantly lower
      if (academicTier === 'target' && satTotal && satScore && satTotal > satScore + 40) {
        academicTier = 'reach';
      }
      if (academicTier === 'target' && actComposite && actScore && actComposite > actScore + 2) {
        academicTier = 'reach';
      }
      
      // Balanced fit score (0-100) with good differentiation
      let fitScore = 35; // Base score - ensures reasonable starting point
      
      // 1. Academic Fit (0-25 points) - Balanced scoring
      if (admitRate !== null && admitRate !== undefined) {
        // Target schools (30-70% admit rate) score highest
        if (admitRate >= 0.3 && admitRate <= 0.7) {
          // Closer to 50% = better target match, but less extreme
          const distanceFromIdeal = Math.abs(admitRate - 0.5);
          fitScore += 25 - (distanceFromIdeal * 30); // 10-25 points
        } else if (admitRate > 0.7) {
          // Safety schools - moderate scoring
          fitScore += 12 + (admitRate - 0.7) * 15; // 12-18 points
        } else {
          // Reach schools - lower but not zero
          fitScore += 8 + (0.3 - admitRate) * 8; // 8-16 points
        }
      } else {
        // No admission rate data - use test scores as proxy
        if (satTotal && satScore) {
          const scoreDiff = Math.abs(satTotal - satScore);
          if (scoreDiff <= 50) fitScore += 22; // Great match
          else if (scoreDiff <= 100) fitScore += 18; // Good match
          else if (scoreDiff <= 150) fitScore += 14; // Fair match
          else fitScore += 10; // Weak match
        } else {
          fitScore += 15; // Neutral score for missing data
        }
      }
      
      // 2. Financial Fit (0-20 points) - Balanced scoring
      const cost = school['latest.cost.attendance.academic_year'] || 
                  school['latest.cost.avg_net_price.overall'] ||
                  school['latest.cost.tuition.in_state'] ||
                  school['latest.cost.tuition.out_of_state'];
      if (cost && filters.maxBudget) {
        const budgetRatio = cost / filters.maxBudget;
        if (budgetRatio <= 0.6) {
          fitScore += 20; // Excellent - well under budget
        } else if (budgetRatio <= 0.8) {
          fitScore += 17; // Very good - comfortably under budget
        } else if (budgetRatio <= 1.0) {
          fitScore += 14; // Good - within budget
        } else if (budgetRatio <= 1.1) {
          fitScore += 8; // Acceptable - slightly over
        } else if (budgetRatio <= 1.2) {
          fitScore += 4; // Tight - moderately over
        } else {
          fitScore += 0; // Over budget
        }
      } else if (cost) {
        // No budget specified - moderate scoring based on cost
        if (cost <= 20000) fitScore += 15;
        else if (cost <= 30000) fitScore += 12;
        else if (cost <= 40000) fitScore += 9;
        else fitScore += 6;
      } else {
        fitScore += 10; // No cost data - neutral
      }
      
      // 3. Outcomes Fit (0-15 points) - Moderate impact
      const gradRate = school['latest.completion.completion_rate_4yr_150nt'] || 
                      school['latest.completion.completion_rate_6yr_150nt'];
      const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
      
      if (gradRate) {
        if (gradRate >= 0.85) fitScore += 9;
        else if (gradRate >= 0.75) fitScore += 7;
        else if (gradRate >= 0.65) fitScore += 5;
        else if (gradRate >= 0.55) fitScore += 3;
        else fitScore += 1;
      }
      
      if (retentionRate) {
        if (retentionRate >= 0.90) fitScore += 6;
        else if (retentionRate >= 0.85) fitScore += 5;
        else if (retentionRate >= 0.80) fitScore += 4;
        else if (retentionRate >= 0.75) fitScore += 2;
        else fitScore += 1;
      }
      
      // 4. Geographic Fit (0-8 points) - Moderate bonus
      if (filters.states && filters.states.includes(school['school.state'])) {
        fitScore += 8; // In preferred region
      } else {
        fitScore += 4; // Not in preferred region (shouldn't happen after filtering)
      }
      
      // 5. Size Fit (0-7 points) - Moderate impact
      const size = school['latest.student.size'];
      if (size && filters.sizeRanges && filters.sizeRanges.length > 0) {
        const sizeRanges = {
          'very_small': { min: 0, max: 1000 },
          'small': { min: 1000, max: 5000 },
          'medium': { min: 5000, max: 15000 },
          'large': { min: 15000, max: 25000 },
          'very_large': { min: 25000, max: 1000000 },
        };
        
        const matchesPreferred = filters.sizeRanges.some(rangeKey => {
          const range = sizeRanges[rangeKey];
          return size >= range.min && size < range.max;
        });
        
        if (matchesPreferred) {
          fitScore += 7; // Perfect size match
        } else {
          fitScore += 3; // Size doesn't match (shouldn't happen after filtering)
        }
      } else if (size) {
        fitScore += 4; // Has size data but no preference
      }
      
      // 6. Setting Fit (0-5 points) - Small bonus
      const locale = school['latest.school.locale'];
      if (locale && filters.settings && filters.settings.length > 0) {
        const localeMap = {
          'city': [11, 12, 13],
          'suburb': [21, 22, 23],
          'town': [31, 32, 33],
          'rural': [41, 42, 43],
        };
        
        const matchesSetting = filters.settings.some(setting => {
          const locales = localeMap[setting];
          return locales && locales.includes(locale);
        });
        
        if (matchesSetting) {
          fitScore += 5; // Perfect setting match
        } else {
          fitScore += 2; // Setting doesn't match
        }
      } else if (locale) {
        fitScore += 3; // Has locale data but no preference
      }
      
      // Tier 3 Preferences (bonus points)
      const extracurricularPriorities = studentProfile.extracurricular_priorities || [];
      const specialPrograms = studentProfile.special_programs || [];
      const campusCulture = studentProfile.campus_culture || [];
      
      // Note: We'd need school data for extracurriculars, programs, and culture
      // For now, we'll add small bonuses if preferences exist (indicating student engagement)
      if (extracurricularPriorities.length > 0 || specialPrograms.length > 0 || campusCulture.length > 0) {
        // Small bonus for students who have Tier 3 preferences (shows engagement)
        fitScore += 2;
      }
      
      // Ensure score is between 0-100
      fitScore = Math.max(0, Math.min(100, Math.round(fitScore)));
      
      return {
        ...school,
        fitScore,
        academicTier,
      };
    });
    
    // Sort by fit score descending
    matches.sort((a, b) => b.fitScore - a.fitScore);
    
    // Log tier distribution for debugging
    const tierDistribution = {
      reach: matches.filter(m => m.academicTier === 'reach').length,
      target: matches.filter(m => m.academicTier === 'target').length,
      safety: matches.filter(m => m.academicTier === 'safety').length,
    };
    console.log('Tier distribution:', tierDistribution);
    
    // ALWAYS ensure balanced distribution - reclassify to ensure all three tiers
    // This ensures we have reach, target, and safety schools regardless of filters
    if (matches.length > 0) {
      const needsReach = tierDistribution.reach === 0;
      const needsSafety = tierDistribution.safety === 0;
      
      // ALWAYS rebalance if we're missing any tier OR if distribution is very unbalanced
      const total = matches.length;
      const expectedReach = Math.max(1, Math.floor(total * 0.25));
      const expectedSafety = Math.max(1, Math.floor(total * 0.25));
      const isUnbalanced = tierDistribution.reach < expectedReach * 0.5 || 
                          tierDistribution.safety < expectedSafety * 0.5;
      
      if (needsReach || needsSafety || isUnbalanced) {
        console.warn('Rebalancing tier distribution...');
        console.log('Before rebalancing:', tierDistribution);
        console.log(`Total schools: ${total}, Expected: ${expectedReach} reach, ${expectedSafety} safety`);
        
        // Sort by admission rate (selectivity) - handle nulls properly
        const sortedBySelectivity = [...matches].sort((a, b) => {
          const aRate = a['latest.admissions.admission_rate.overall'];
          const bRate = b['latest.admissions.admission_rate.overall'];
          
          // Put nulls at the end (less selective)
          if (aRate === null || aRate === undefined) return 1;
          if (bRate === null || bRate === undefined) return -1;
          
          return aRate - bRate; // Lower admission rate = more selective
        });
        
        // Target distribution: ~25% reach, ~50% target, ~25% safety
        // But ensure we always have at least 1 of each if we have enough schools
        // Note: sortedBySelectivity.length === matches.length (it's just a sorted copy)
        let reachCount = Math.max(1, Math.floor(total * 0.25));
        let safetyCount = Math.max(1, Math.floor(total * 0.25));
        
        // If we have few schools, ensure we still have at least 1 of each tier
        if (total >= 3) {
          // Ensure we have at least 1 reach and 1 safety
          reachCount = Math.max(1, reachCount);
          safetyCount = Math.max(1, safetyCount);
          // Make sure we don't exceed total
          if (reachCount + safetyCount >= total) {
            reachCount = Math.max(1, Math.floor(total / 3));
            safetyCount = Math.max(1, Math.floor(total / 3));
          }
        }
        
        console.log(`Total schools: ${total}, Target: ${reachCount} reach, ${safetyCount} safety`);
        console.log('Admission rate range:', {
          min: sortedBySelectivity[0]?.['latest.admissions.admission_rate.overall'],
          max: sortedBySelectivity[total - 1]?.['latest.admissions.admission_rate.overall'],
          median: sortedBySelectivity[Math.floor(total / 2)]?.['latest.admissions.admission_rate.overall']
        });
        
        // Reset all to target first, then reclassify
        matches.forEach(school => {
          school.academicTier = 'target';
        });
        
        // ALWAYS reclassify reach and safety based on target distribution
        // This ensures balanced distribution regardless of initial classification
        
        // Classify most selective as reach (lowest admission rates = most selective)
        const reachSchools = sortedBySelectivity.slice(0, reachCount);
        reachSchools.forEach(school => {
          school.academicTier = 'reach';
        });
        console.log(`Classified ${reachSchools.length} schools as reach`);
        
        // Classify least selective as safety (highest admission rates = least selective)
        // CRITICAL: Always ensure we have safety schools, even if they don't have admission rate data
        // Exclude schools already classified as reach
        const availableForSafety = sortedBySelectivity.filter(s => s.academicTier !== 'reach');
        const schoolsWithRates = availableForSafety.filter(s => 
          s['latest.admissions.admission_rate.overall'] !== null && 
          s['latest.admissions.admission_rate.overall'] !== undefined
        );
        const schoolsWithoutRates = availableForSafety.filter(s => 
          s['latest.admissions.admission_rate.overall'] === null || 
          s['latest.admissions.admission_rate.overall'] === undefined
        );
        
        console.log(`Schools with rates: ${schoolsWithRates.length}, without rates: ${schoolsWithoutRates.length}`);
        
        // Take safety schools from those with HIGHEST rates (least selective)
        // Start from the END of the available array (highest admission rates)
        const safetyFromRates = Math.min(safetyCount, schoolsWithRates.length);
        const safetyFromNoRates = Math.max(0, safetyCount - safetyFromRates);
        
        // Get the LAST schools (highest admission rates = least selective = safety)
        const safetySchools = [
          ...schoolsWithRates.slice(-safetyFromRates), // Last schools with rates
          ...schoolsWithoutRates.slice(-safetyFromNoRates) // Last schools without rates
        ];
        
        // Double-check: if we still don't have enough, take from the end of ALL available schools
        if (safetySchools.length < safetyCount) {
          const remaining = safetyCount - safetySchools.length;
          const additional = availableForSafety
            .filter(s => !safetySchools.includes(s))
            .slice(-remaining);
          safetySchools.push(...additional);
        }
        
        safetySchools.forEach(school => {
          school.academicTier = 'safety';
        });
        
        console.log(`Classified ${safetySchools.length} schools as safety (${safetyFromRates} with rates, ${safetyFromNoRates} without)`);
        console.log('Safety schools:', safetySchools.slice(0, 10).map(s => ({
          name: s['school.name'],
          rate: s['latest.admissions.admission_rate.overall'],
          cost: s['latest.cost.attendance.academic_year'] || s['latest.cost.avg_net_price.overall'],
          tier: s.academicTier
        })));
        
        // Update tier distribution
        const newTierDistribution = {
          reach: matches.filter(m => m.academicTier === 'reach').length,
          target: matches.filter(m => m.academicTier === 'target').length,
          safety: matches.filter(m => m.academicTier === 'safety').length,
        };
        console.log('After rebalancing:', newTierDistribution);
        
        // Verify we still have schools after rebalancing
        if (matches.length === 0) {
          console.error('ERROR: All schools were lost during rebalancing!');
          console.error('This should never happen - there is a bug in the rebalancing logic');
        }
        
        // Show sample of each tier
        if (newTierDistribution.reach > 0) {
          console.log('Sample reach schools:', matches.filter(m => m.academicTier === 'reach').slice(0, 5).map(m => ({
            name: m['school.name'],
            admitRate: m['latest.admissions.admission_rate.overall'],
            tier: m.academicTier
          })));
        }
        if (newTierDistribution.safety > 0) {
          console.log('Sample safety schools:', matches.filter(m => m.academicTier === 'safety').slice(0, 5).map(m => ({
            name: m['school.name'],
            admitRate: m['latest.admissions.admission_rate.overall'],
            tier: m.academicTier
          })));
        }
      }
    }
    
    // Final safety check - ensure we have matches
    if (matches.length === 0) {
      console.error('FINAL ERROR: No matches to return!');
      console.error('This indicates a serious bug in the matching algorithm');
      return {
        matches: [],
        warnings: ['An error occurred while generating matches. Please try again or contact support.'],
      };
    }
    
    return {
      matches,
      warnings: [],
    };
  } catch (error) {
    console.error('Error generating matches:', error);
    console.error('Error stack:', error.stack);
    console.error('Student profile:', studentProfile);
    console.error('Filters:', filters);
    return {
      matches: [],
      warnings: [`Error generating matches: ${error.message}. Please try again or contact support.`],
    };
  }
}

/**
 * Calculate fit score for a single school
 * @param {Object} school - School data
 * @param {Object} studentProfile - Student profile with answers
 * @param {Object} filters - Optional filters (for budget, regions, etc.)
 * @returns {Object} - School with fitScore and academicTier
 */
export function calculateFitScore(school, studentProfile = {}, filters = {}) {
  const admitRate = school['latest.admissions.admission_rate.overall'];
  const satMath = school['latest.admissions.sat_scores.midpoint.math'];
  const satEbrw = school['latest.admissions.sat_scores.midpoint.critical_reading'];
  const satTotal = satMath && satEbrw ? satMath + satEbrw : null;
  const actComposite = school['latest.admissions.act_scores.midpoint.cumulative'];
  
  // Classify academic tier
  let academicTier = 'target';
  const gpa = studentProfile.gpa || 3.5;
  const satScore = studentProfile.sat_score;
  const actScore = studentProfile.act_score;
  
  if (admitRate !== null && admitRate !== undefined) {
    if (admitRate < 0.4) {
      academicTier = 'reach';
    } else if (admitRate > 0.65) {
      academicTier = 'safety';
    }
  } else if (satTotal && satScore) {
    if (satTotal > satScore + 50) {
      academicTier = 'reach';
    } else if (satTotal < satScore - 50) {
      academicTier = 'safety';
    }
  } else if (actComposite && actScore) {
    if (actComposite > actScore + 2) {
      academicTier = 'reach';
    } else if (actComposite < actScore - 2) {
      academicTier = 'safety';
    }
  } else {
    if (gpa < 3.0) {
      academicTier = 'reach';
    } else if (gpa > 3.8) {
      academicTier = 'target';
    }
  }
  
  // Calculate fit score
  let fitScore = 35; // Base score
  
  // 1. Academic Fit (0-25 points)
  if (admitRate !== null && admitRate !== undefined) {
    if (admitRate >= 0.3 && admitRate <= 0.7) {
      const distanceFromIdeal = Math.abs(admitRate - 0.5);
      fitScore += 25 - (distanceFromIdeal * 30);
    } else if (admitRate > 0.7) {
      fitScore += 12 + (admitRate - 0.7) * 15;
    } else {
      fitScore += 8 + (0.3 - admitRate) * 8;
    }
  } else {
    if (satTotal && satScore) {
      const scoreDiff = Math.abs(satTotal - satScore);
      if (scoreDiff <= 50) fitScore += 22;
      else if (scoreDiff <= 100) fitScore += 18;
      else if (scoreDiff <= 150) fitScore += 14;
      else fitScore += 10;
    } else {
      fitScore += 15;
    }
  }
  
  // 2. Financial Fit (0-20 points)
  const cost = school['latest.cost.attendance.academic_year'] || 
              school['latest.cost.avg_net_price.overall'] ||
              school['latest.cost.tuition.in_state'] ||
              school['latest.cost.tuition.out_of_state'];
  const maxBudget = filters.maxBudget || studentProfile.max_annual_budget;
  if (cost && maxBudget) {
    const budgetRatio = cost / maxBudget;
    if (budgetRatio <= 0.6) fitScore += 20;
    else if (budgetRatio <= 0.8) fitScore += 17;
    else if (budgetRatio <= 1.0) fitScore += 14;
    else if (budgetRatio <= 1.1) fitScore += 8;
    else if (budgetRatio <= 1.2) fitScore += 4;
    else fitScore += 0;
  } else if (cost) {
    if (cost <= 20000) fitScore += 15;
    else if (cost <= 30000) fitScore += 12;
    else if (cost <= 40000) fitScore += 9;
    else fitScore += 6;
  } else {
    fitScore += 10;
  }
  
  // 3. Outcomes Fit (0-15 points)
  const gradRate = school['latest.completion.completion_rate_4yr_150nt'] || 
                  school['latest.completion.completion_rate_6yr_150nt'];
  const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
  
  if (gradRate) {
    if (gradRate >= 0.85) fitScore += 9;
    else if (gradRate >= 0.75) fitScore += 7;
    else if (gradRate >= 0.65) fitScore += 5;
    else if (gradRate >= 0.55) fitScore += 3;
    else fitScore += 1;
  }
  
  if (retentionRate) {
    if (retentionRate >= 0.90) fitScore += 6;
    else if (retentionRate >= 0.85) fitScore += 5;
    else if (retentionRate >= 0.80) fitScore += 4;
    else if (retentionRate >= 0.75) fitScore += 2;
    else fitScore += 1;
  }
  
  // 4. Geographic Fit (0-8 points)
  const preferredRegions = studentProfile.preferred_regions || [];
  const schoolState = school['school.state'];
  // Check if school state is in preferred regions (simplified - would need region mapping)
  if (preferredRegions.length > 0) {
    fitScore += 4; // Neutral bonus if preferences exist
  } else {
    fitScore += 4;
  }
  
  // 5. Size Fit (0-7 points)
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
    
    const matchesPreferred = preferredSize.some(rangeKey => {
      const range = sizeRanges[rangeKey];
      return size >= range.min && size < range.max;
    });
    
    if (matchesPreferred) {
      fitScore += 7;
    } else {
      fitScore += 3;
    }
  } else if (size) {
    fitScore += 4;
  }
  
  // 6. Setting Fit (0-5 points)
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
      fitScore += 5;
    } else {
      fitScore += 2;
    }
  } else if (locale) {
    fitScore += 3;
  }
  
  // Tier 3 Preferences bonus
  const extracurricularPriorities = studentProfile.extracurricular_priorities || [];
  const specialPrograms = studentProfile.special_programs || [];
  const campusCulture = studentProfile.campus_culture || [];
  
  if (extracurricularPriorities.length > 0 || specialPrograms.length > 0 || campusCulture.length > 0) {
    fitScore += 2;
  }
  
  // Ensure score is between 0-100
  fitScore = Math.max(0, Math.min(100, Math.round(fitScore)));
  
  return {
    ...school,
    fitScore,
    academicTier,
  };
}
