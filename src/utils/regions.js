/**
 * US Regions and State Mappings
 * Maps regions to their constituent states
 */

export const REGIONS = {
  'pacific-northwest': {
    name: 'Pacific Northwest',
    states: ['WA', 'OR', 'ID', 'AK'],
    abbreviation: 'PNW'
  },
  'west-coast': {
    name: 'West Coast',
    states: ['CA', 'WA', 'OR'],
    abbreviation: 'West Coast'
  },
  'southwest': {
    name: 'Southwest',
    states: ['AZ', 'NM', 'NV', 'UT', 'CO'],
    abbreviation: 'Southwest'
  },
  'mountain-west': {
    name: 'Mountain West',
    states: ['MT', 'WY', 'CO', 'ID', 'UT', 'NV'],
    abbreviation: 'Mountain West'
  },
  'midwest': {
    name: 'Midwest',
    states: ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'MN', 'MO', 'ND', 'SD', 'NE', 'KS'],
    abbreviation: 'Midwest'
  },
  'south': {
    name: 'South',
    states: ['TX', 'OK', 'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'WV', 'VA', 'NC', 'SC', 'GA', 'FL'],
    abbreviation: 'South'
  },
  'southeast': {
    name: 'Southeast',
    states: ['NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'TN', 'KY'],
    abbreviation: 'Southeast'
  },
  'mid-atlantic': {
    name: 'Mid-Atlantic',
    states: ['NY', 'NJ', 'PA', 'DE', 'MD', 'DC', 'VA', 'WV'],
    abbreviation: 'Mid-Atlantic'
  },
  'northeast': {
    name: 'Northeast',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
    abbreviation: 'Northeast'
  },
  'new-england': {
    name: 'New England',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'],
    abbreviation: 'New England'
  },
};

export const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

/**
 * Get states for a region
 */
export function getStatesForRegion(regionKey) {
  if (!regionKey) return [];
  const region = REGIONS[regionKey];
  return region ? region.states : [];
}

/**
 * Get all region options for dropdown
 */
export function getRegionOptions() {
  return Object.entries(REGIONS).map(([key, region]) => ({
    value: key,
    label: `${region.name} (${region.abbreviation})`,
    states: region.states
  }));
}

/**
 * Check if a state is in a region
 */
export function isStateInRegion(state, regionKey) {
  const states = getStatesForRegion(regionKey);
  return states.includes(state);
}

