/**
 * Validators
 * Input validation functions
 */

/**
 * Validate GPA
 * @param {number} gpa - GPA value
 * @param {string} scale - GPA scale type
 * @returns {Object} Validation result
 */
export function validateGPA(gpa, scale) {
  if (gpa === null || gpa === undefined) {
    return { valid: false, error: 'GPA is required' };
  }
  
  const maxGPA = {
    'unweighted_4': 4.0,
    'weighted_5': 5.0,
    'weighted_6': 6.0,
  };
  
  if (gpa < 0 || gpa > (maxGPA[scale] || 100)) {
    return { valid: false, error: `GPA must be between 0 and ${maxGPA[scale] || 100}` };
  }
  
  return { valid: true };
}

/**
 * Validate SAT score
 * @param {number} score - SAT score
 * @returns {Object} Validation result
 */
export function validateSAT(score) {
  if (score === null || score === undefined) return { valid: true };
  
  if (score < 400 || score > 1600) {
    return { valid: false, error: 'SAT scores range from 400 to 1600' };
  }
  
  return { valid: true };
}

/**
 * Validate ACT score
 * @param {number} score - ACT score
 * @returns {Object} Validation result
 */
export function validateACT(score) {
  if (score === null || score === undefined) return { valid: true };
  
  if (score < 1 || score > 36) {
    return { valid: false, error: 'ACT scores range from 1 to 36' };
  }
  
  return { valid: true };
}

