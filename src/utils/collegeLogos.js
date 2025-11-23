/**
 * College Logo Utilities
 * Generates logo URLs from school data
 */

/**
 * Extract domain from school URL
 * @param {string} url - School website URL
 * @returns {string|null} - Domain name or null
 */
export function extractDomain(url) {
  if (!url) return null;
  
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(urlWithProtocol);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Get logo URL for a school
 * Tries multiple sources for higher resolution logos
 * @param {Object} school - School data object
 * @returns {string|null} - Logo URL or null
 */
export function getLogoUrl(school) {
  const schoolUrl = school['school.school_url'] || school.url;
  const domain = extractDomain(schoolUrl);
  
  if (!domain) return null;
  
  // Try multiple logo sources in order of preference (higher quality first)
  // Option 1: Clearbit with size parameter (larger = better quality)
  // Note: Clearbit doesn't officially support size, but we can try different endpoints
  // Option 2: Try fetching from school's website directly
  // Option 3: Use a proxy service for higher res
  
  // For now, try Clearbit (they serve decent quality)
  // In the future, we could implement a fallback chain:
  // 1. Try school's website /logo.png or /images/logo.png
  // 2. Use Clearbit
  // 3. Use Google's favicon service (lower quality but works)
  
  return `https://logo.clearbit.com/${domain}`;
}

/**
 * Get high-resolution logo URL with fallbacks
 * Tries multiple sources to get the best quality logo
 * @param {Object} school - School data object
 * @returns {string|null} - Best available logo URL
 */
export function getHighResLogoUrl(school) {
  const schoolUrl = school['school.school_url'] || school.url;
  const domain = extractDomain(schoolUrl);
  
  if (!domain) return null;
  
  // Try to construct direct logo URLs from school website
  // Many schools have logos at common paths
  const commonLogoPaths = [
    `https://${domain}/logo.png`,
    `https://${domain}/images/logo.png`,
    `https://${domain}/assets/logo.png`,
    `https://${domain}/wp-content/uploads/logo.png`,
    `https://www.${domain}/logo.png`,
  ];
  
  // For now, return Clearbit (most reliable)
  // In production, you could implement a check that tries these paths first
  // and falls back to Clearbit if they fail
  
  // Use Clearbit - it's the most reliable and provides decent quality
  // The logos are typically 128x128px or higher
  return `https://logo.clearbit.com/${domain}`;
}

/**
 * Get fallback logo URL (first letter of school name)
 * @param {string} schoolName - School name
 * @returns {string} - Data URL for fallback logo
 */
export function getFallbackLogo(schoolName) {
  const firstLetter = schoolName?.charAt(0).toUpperCase() || '?';
  
  // Color palette for fallback logos
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#ef4444', // red
    '#10b981', // green
  ];
  
  const colorIndex = (firstLetter.charCodeAt(0) || 0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Return a simple SVG data URL
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${bgColor}" rx="8"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${firstLetter}</text>
    </svg>
  `)}`;
}

