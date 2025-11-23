/**
 * Common Academic Majors
 * List of popular majors for filtering
 */

export const MAJOR_CATEGORIES = [
  { value: '', label: 'All Majors' },
  { value: 'computer-science', label: 'Computer Science', cip: '11' },
  { value: 'engineering', label: 'Engineering', cip: '14' },
  { value: 'business', label: 'Business', cip: '52' },
  { value: 'biology', label: 'Biology', cip: '26' },
  { value: 'psychology', label: 'Psychology', cip: '42' },
  { value: 'nursing', label: 'Nursing', cip: '51' },
  { value: 'education', label: 'Education', cip: '13' },
  { value: 'communications', label: 'Communications', cip: '09' },
  { value: 'political-science', label: 'Political Science', cip: '45' },
  { value: 'economics', label: 'Economics', cip: '45' },
  { value: 'english', label: 'English', cip: '23' },
  { value: 'history', label: 'History', cip: '23' },
  { value: 'mathematics', label: 'Mathematics', cip: '27' },
  { value: 'chemistry', label: 'Chemistry', cip: '40' },
  { value: 'physics', label: 'Physics', cip: '40' },
  { value: 'art', label: 'Art', cip: '50' },
  { value: 'music', label: 'Music', cip: '50' },
  { value: 'architecture', label: 'Architecture', cip: '04' },
  { value: 'pre-med', label: 'Pre-Medicine', cip: '26' },
  { value: 'pre-law', label: 'Pre-Law', cip: '22' },
];

/**
 * Get major options for dropdown
 */
export function getMajorOptions() {
  return MAJOR_CATEGORIES;
}

/**
 * Get CIP code for a major
 */
export function getCipCode(majorValue) {
  const major = MAJOR_CATEGORIES.find(m => m.value === majorValue);
  return major ? major.cip : null;
}

/**
 * Get major label by value
 */
export function getMajorLabel(majorValue) {
  const major = MAJOR_CATEGORIES.find(m => m.value === majorValue);
  return major ? major.label : majorValue;
}

