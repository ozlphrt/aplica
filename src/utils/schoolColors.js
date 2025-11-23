/**
 * School Colors Utility
 * Provides school brand colors for visual enhancements
 */

/**
 * School color mappings by common name patterns or IDs
 * Format: { pattern: { primary: '#hex', secondary: '#hex' } }
 */
const SCHOOL_COLORS = {
  // Washington State University
  'washington state': { primary: '#981e32', secondary: '#5e6a71', name: 'Crimson' },
  'wsu': { primary: '#981e32', secondary: '#5e6a71', name: 'Crimson' },
  'washington state university': { primary: '#981e32', secondary: '#5e6a71', name: 'Crimson' },
  
  // University of Washington
  'university of washington': { primary: '#4b2e83', secondary: '#b7a57a', name: 'Purple' },
  'uw': { primary: '#4b2e83', secondary: '#b7a57a', name: 'Purple' },
  
  // Common patterns - add more as needed
  'stanford': { primary: '#8c1515', secondary: '#2e2d29', name: 'Cardinal Red' },
  'harvard': { primary: '#a51c30', secondary: '#4d4d4d', name: 'Crimson' },
  'mit': { primary: '#a31f34', secondary: '#8a8b8c', name: 'Cardinal Red' },
  'berkeley': { primary: '#003262', secondary: '#fdb515', name: 'Berkeley Blue' },
  'ucla': { primary: '#2774ae', secondary: '#ffd100', name: 'UCLA Blue' },
  'usc': { primary: '#990012', secondary: '#ffcc00', name: 'Cardinal' },
  'texas': { primary: '#bf5700', secondary: '#ffffff', name: 'Burnt Orange' },
  'michigan': { primary: '#00274c', secondary: '#ffcb05', name: 'Maize and Blue' },
  'ohio state': { primary: '#bb0000', secondary: '#666666', name: 'Scarlet' },
  'alabama': { primary: '#9e1b32', secondary: '#ffffff', name: 'Crimson' },
};

/**
 * Get school colors by name
 * @param {string} schoolName - School name
 * @returns {Object|null} - { primary, secondary, name } or null
 */
export function getSchoolColors(schoolName) {
  if (!schoolName) return null;
  
  const normalizedName = schoolName.toLowerCase().trim();
  
  // Check for exact matches first
  if (SCHOOL_COLORS[normalizedName]) {
    return SCHOOL_COLORS[normalizedName];
  }
  
  // Check for partial matches
  for (const [pattern, colors] of Object.entries(SCHOOL_COLORS)) {
    if (normalizedName.includes(pattern) || pattern.includes(normalizedName.split(' ')[0])) {
      return colors;
    }
  }
  
  return null;
}

/**
 * Get school color overlay style to enhance/preserve brand colors
 * @param {string} schoolName - School name
 * @returns {Object} - Style object with overlay properties
 */
export function getSchoolColorOverlay(schoolName) {
  const colors = getSchoolColors(schoolName);
  if (!colors) return null;
  
  // Check if this is WSU (crimson school)
  const isWSU = colors.primary === '#981e32';
  
  if (isWSU) {
    // For WSU, use a more direct color tint to preserve crimson
    return {
      background: `linear-gradient(135deg, ${colors.primary}50 0%, ${colors.primary}30 100%)`,
      mixBlendMode: 'color', // Color blend mode preserves hue and saturation
      opacity: 0.4,
    };
  }
  
  // For other schools, use a subtle overlay
  return {
    background: `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.secondary || colors.primary}15 100%)`,
    mixBlendMode: 'color-dodge',
    opacity: 0.6,
  };
}

/**
 * Get CSS filter to enhance school colors in logo
 * @param {string} schoolName - School name
 * @returns {string} - CSS filter string
 */
export function getSchoolColorFilter(schoolName) {
  const colors = getSchoolColors(schoolName);
  if (!colors) return 'contrast(1.1) saturate(1.1)';
  
  // Check if this is WSU (crimson school)
  const isWSU = colors.primary === '#981e32';
  
  if (isWSU) {
    // For WSU crimson - stronger saturation and contrast to preserve red tones
    // Reduce brightness slightly to deepen the crimson
    return 'contrast(1.2) saturate(1.6) brightness(0.92)';
  }
  
  // For other crimson/red schools
  if (colors.primary.includes('981e32') || colors.primary.includes('a51c30') || colors.primary.includes('990012')) {
    return 'contrast(1.15) saturate(1.4) brightness(0.95)';
  }
  
  return 'contrast(1.1) saturate(1.2)';
}

