/**
 * Questionnaire Logic
 * Question definitions and adaptive branching
 */
import { getRegionOptions } from '../utils/regions.js';

/**
 * Tier 1 Questions - Critical Must-Haves
 */
const TIER_1_QUESTIONS = [
  {
    id: 'gpa',
    tier: 1,
    type: 'number',
    question: 'What\'s your GPA?',
    helpText: 'Enter your cumulative GPA through the most recent completed semester',
    placeholder: '3.5',
    defaultValue: 3.5,
    validation: {
      min: 0,
      max: 6.0,
      required: true,
      errorMessage: 'Please enter a valid GPA between 0 and 6.0',
    },
    component: 'NumberInput',
    step: 0.01,
  },
  {
    id: 'gpa_scale',
    tier: 1,
    type: 'select',
    question: 'Is this GPA weighted or unweighted?',
    helpText: 'Weighted GPAs give extra points for AP/IB/Honors courses',
    options: [
      { value: 'unweighted_4', label: 'Unweighted (4.0 scale)' },
      { value: 'weighted_5', label: 'Weighted (5.0 scale)' },
      { value: 'weighted_6', label: 'Weighted (6.0 scale)' },
      { value: 'other', label: 'Other scale' },
    ],
    validation: {
      required: true,
    },
    component: 'Select',
    conditional: (answers) => answers.gpa !== null && answers.gpa !== undefined,
  },
  {
    id: 'test_taken',
    tier: 1,
    type: 'radio',
    question: 'Have you taken the SAT or ACT?',
    helpText: 'Many schools are test-optional, but scores can help with merit aid',
    options: [
      { value: true, label: 'Yes, I have test scores' },
      { value: false, label: 'No, I haven\'t taken tests yet' },
      { value: 'not_submitting', label: 'Taken but not submitting (test-optional)' },
    ],
    validation: {
      required: true,
    },
    component: 'RadioGroup',
  },
  {
    id: 'sat_score',
    tier: 1,
    type: 'number',
    question: 'What is your SAT score (total)?',
    helpText: 'Total score out of 1600 (Math + Evidence-Based Reading & Writing)',
    placeholder: '1150',
    defaultValue: 1150,
    validation: {
      min: 400,
      max: 1600,
      required: false,
      errorMessage: 'SAT scores range from 400 to 1600',
    },
    component: 'NumberInput',
    step: 10,
    conditional: (answers) => answers.test_taken === true,
  },
  {
    id: 'act_score',
    tier: 1,
    type: 'number',
    question: 'What is your ACT composite score?',
    helpText: 'Composite score out of 36',
    placeholder: '30',
    defaultValue: 30,
    validation: {
      min: 1,
      max: 36,
      required: false,
      errorMessage: 'ACT composite scores range from 1 to 36',
    },
    component: 'NumberInput',
    step: 1,
    conditional: (answers) => answers.test_taken === true && (!answers.sat_score || answers.sat_score === null),
  },
  {
    id: 'intended_majors',
    tier: 1,
    type: 'multi_select',
    question: 'What do you want to study?',
    helpText: 'Select up to 3 majors you\'re considering. You can be undecided.',
    placeholder: 'Search majors...',
    validation: {
      required: true,
      minSelections: 1,
      maxSelections: 3,
      errorMessage: 'Please select at least one major or choose "Undecided"',
    },
    component: 'MultiSelect',
    options: [
      { value: 'undecided', label: 'Undecided / Exploring' },
      { value: 'computer_science', label: 'Computer Science' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'business', label: 'Business' },
      { value: 'biology', label: 'Biology' },
      { value: 'psychology', label: 'Psychology' },
      { value: 'medicine', label: 'Medicine/Pre-Med' },
      { value: 'law', label: 'Law/Pre-Law' },
      { value: 'education', label: 'Education' },
      { value: 'arts', label: 'Arts & Humanities' },
    ],
  },
  {
    id: 'preferred_regions',
    tier: 1,
    type: 'multi_select',
    question: 'Which regions are you interested in?',
    helpText: 'Select up to 3 regions where you\'d like to attend college',
    validation: {
      required: true,
      minSelections: 1,
      maxSelections: 3,
      errorMessage: 'Please select at least one region (max 3)',
    },
    component: 'MultiSelect',
    options: getRegionOptions().map(region => ({
      value: region.value,
      label: region.label,
    })),
  },
  {
    id: 'preferred_size',
    tier: 1,
    type: 'multi_select',
    question: 'What size college do you prefer?',
    helpText: 'Select up to 3 size ranges (based on undergraduate enrollment)',
    validation: {
      required: true,
      minSelections: 1,
      maxSelections: 3,
      errorMessage: 'Please select at least one size range (max 3)',
    },
    component: 'MultiSelect',
    options: [
      { value: 'very_small', label: 'Very Small (under 1,000 students)' },
      { value: 'small', label: 'Small (1,000 - 5,000 students)' },
      { value: 'medium', label: 'Medium (5,000 - 15,000 students)' },
      { value: 'large', label: 'Large (15,000 - 25,000 students)' },
      { value: 'very_large', label: 'Very Large (25,000+ students)' },
    ],
  },
  {
    id: 'preferred_setting',
    tier: 1,
    type: 'multi_select',
    question: 'What type of location do you prefer?',
    helpText: 'Select up to 3 location types (campus setting and surrounding area)',
    validation: {
      required: true,
      minSelections: 1,
      maxSelections: 3,
      errorMessage: 'Please select at least one location type (max 3)',
    },
    component: 'MultiSelect',
    options: [
      { value: 'city', label: 'City (Urban)' },
      { value: 'suburb', label: 'Suburban' },
      { value: 'town', label: 'Town' },
      { value: 'rural', label: 'Rural' },
    ],
  },
  {
    id: 'max_annual_budget',
    tier: 1,
    type: 'select',
    question: 'What is the maximum you can afford per year for college?',
    helpText: 'Select your maximum budget. This includes all sources: savings, family income, loans you\'re willing to take. Schools from $0 up to this amount will be included.',
    validation: {
      required: true,
      errorMessage: 'Please select a budget range',
    },
    component: 'Select',
    options: [
      { value: 10000, label: '$10,000 or less' },
      { value: 20000, label: '$20,000' },
      { value: 30000, label: '$30,000' },
      { value: 40000, label: '$40,000' },
      { value: 50000, label: '$50,000+' },
      { value: 99999, label: 'No limit' },
    ],
  },
];

/**
 * Tier 2 Questions - Important Context
 */
const TIER_2_QUESTIONS = [
  {
    id: 'class_rank_available',
    tier: 2,
    type: 'radio',
    question: 'Does your high school provide class rank?',
    helpText: 'Many schools no longer rank students',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
      { value: 'unknown', label: 'Not sure' },
    ],
    validation: {
      required: false,
    },
    component: 'RadioGroup',
  },
  {
    id: 'class_rank_percentile',
    tier: 2,
    type: 'select',
    question: 'What is your approximate class rank?',
    helpText: 'Top 10% means you\'re in the 90th percentile',
    validation: {
      required: false,
    },
    component: 'Select',
    options: [
      { value: 99, label: 'Top 1% (Valedictorian range)' },
      { value: 97, label: 'Top 3%' },
      { value: 95, label: 'Top 5%' },
      { value: 90, label: 'Top 10%' },
      { value: 85, label: 'Top 15%' },
      { value: 75, label: 'Top 25%' },
      { value: 65, label: 'Top 35%' },
      { value: 50, label: 'Top 50%' },
      { value: 40, label: 'Lower 50%' },
    ],
    conditional: (answers) => answers.class_rank_available === true,
  },
  {
    id: 'ap_courses',
    tier: 2,
    type: 'number',
    question: 'How many AP courses have you taken or are taking?',
    helpText: 'Advanced Placement courses',
    placeholder: '5',
    defaultValue: 0,
    validation: {
      min: 0,
      max: 25,
      required: false,
    },
    component: 'NumberInput',
    step: 1,
  },
  {
    id: 'ib_courses',
    tier: 2,
    type: 'number',
    question: 'How many IB courses have you taken or are taking?',
    helpText: 'International Baccalaureate courses',
    placeholder: '0',
    defaultValue: 0,
    validation: {
      min: 0,
      max: 15,
      required: false,
    },
    component: 'NumberInput',
    step: 1,
  },
  {
    id: 'dual_enrollment',
    tier: 2,
    type: 'number',
    question: 'How many dual enrollment courses have you taken?',
    helpText: 'College courses taken while in high school',
    placeholder: '0',
    defaultValue: 0,
    validation: {
      min: 0,
      max: 20,
      required: false,
    },
    component: 'NumberInput',
    step: 1,
  },
  {
    id: 'honors_courses',
    tier: 2,
    type: 'number',
    question: 'How many honors courses have you taken?',
    helpText: 'Honors-level courses',
    placeholder: '3',
    defaultValue: 0,
    validation: {
      min: 0,
      max: 30,
      required: false,
    },
    component: 'NumberInput',
    step: 1,
  },
  {
    id: 'course_rigor',
    tier: 2,
    type: 'select',
    question: 'How would you describe your course load compared to peers?',
    helpText: 'Consider the difficulty of courses you\'ve chosen',
    validation: {
      required: false,
    },
    component: 'Select',
    options: [
      { value: 'most_rigorous', label: 'Most rigorous available' },
      { value: 'very_rigorous', label: 'Very rigorous' },
      { value: 'rigorous', label: 'Rigorous' },
      { value: 'average', label: 'Average' },
      { value: 'less_rigorous', label: 'Less rigorous' },
    ],
  },
  {
    id: 'household_income',
    tier: 2,
    type: 'select',
    question: 'What is your family\'s annual household income?',
    helpText: 'Used to estimate financial aid eligibility. This information is private and optional.',
    validation: {
      required: false,
    },
    component: 'Select',
    options: [
      { value: 'under_30k', label: 'Under $30,000' },
      { value: '30_48k', label: '$30,000 - $48,000' },
      { value: '48_75k', label: '$48,000 - $75,000' },
      { value: '75_110k', label: '$75,000 - $110,000' },
      { value: '110_150k', label: '$110,000 - $150,000' },
      { value: 'over_150k', label: 'Over $150,000' },
      { value: 'prefer_not_say', label: 'Prefer not to say' },
    ],
  },
  {
    id: 'state_residence',
    tier: 2,
    type: 'select',
    question: 'What state do you currently live in?',
    helpText: 'Used to determine in-state tuition eligibility',
    validation: {
      required: false,
    },
    component: 'Select',
    options: [
      { value: 'AL', label: 'Alabama' },
      { value: 'AK', label: 'Alaska' },
      { value: 'AZ', label: 'Arizona' },
      { value: 'AR', label: 'Arkansas' },
      { value: 'CA', label: 'California' },
      { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' },
      { value: 'DE', label: 'Delaware' },
      { value: 'FL', label: 'Florida' },
      { value: 'GA', label: 'Georgia' },
      { value: 'HI', label: 'Hawaii' },
      { value: 'ID', label: 'Idaho' },
      { value: 'IL', label: 'Illinois' },
      { value: 'IN', label: 'Indiana' },
      { value: 'IA', label: 'Iowa' },
      { value: 'KS', label: 'Kansas' },
      { value: 'KY', label: 'Kentucky' },
      { value: 'LA', label: 'Louisiana' },
      { value: 'ME', label: 'Maine' },
      { value: 'MD', label: 'Maryland' },
      { value: 'MA', label: 'Massachusetts' },
      { value: 'MI', label: 'Michigan' },
      { value: 'MN', label: 'Minnesota' },
      { value: 'MS', label: 'Mississippi' },
      { value: 'MO', label: 'Missouri' },
      { value: 'MT', label: 'Montana' },
      { value: 'NE', label: 'Nebraska' },
      { value: 'NV', label: 'Nevada' },
      { value: 'NH', label: 'New Hampshire' },
      { value: 'NJ', label: 'New Jersey' },
      { value: 'NM', label: 'New Mexico' },
      { value: 'NY', label: 'New York' },
      { value: 'NC', label: 'North Carolina' },
      { value: 'ND', label: 'North Dakota' },
      { value: 'OH', label: 'Ohio' },
      { value: 'OK', label: 'Oklahoma' },
      { value: 'OR', label: 'Oregon' },
      { value: 'PA', label: 'Pennsylvania' },
      { value: 'RI', label: 'Rhode Island' },
      { value: 'SC', label: 'South Carolina' },
      { value: 'SD', label: 'South Dakota' },
      { value: 'TN', label: 'Tennessee' },
      { value: 'TX', label: 'Texas' },
      { value: 'UT', label: 'Utah' },
      { value: 'VT', label: 'Vermont' },
      { value: 'VA', label: 'Virginia' },
      { value: 'WA', label: 'Washington' },
      { value: 'WV', label: 'West Virginia' },
      { value: 'WI', label: 'Wisconsin' },
      { value: 'WY', label: 'Wyoming' },
      { value: 'DC', label: 'District of Columbia' },
    ],
  },
  {
    id: 'financial_aid_need',
    tier: 2,
    type: 'select',
    question: 'How important is financial aid to your college decision?',
    helpText: 'This helps us prioritize schools with strong aid programs',
    validation: {
      required: false,
    },
    component: 'Select',
    options: [
      { value: 'critical', label: 'Critical - I need significant aid' },
      { value: 'very_important', label: 'Very important' },
      { value: 'important', label: 'Important' },
      { value: 'somewhat', label: 'Somewhat important' },
      { value: 'not_important', label: 'Not important' },
    ],
  },
];

/**
 * Tier 3 Questions - Refinement
 */
const TIER_3_QUESTIONS = [
  {
    id: 'extracurricular_priorities',
    tier: 3,
    type: 'multi_select',
    question: 'What activities or opportunities are most important to you?',
    helpText: 'Select up to 5 activities that matter most to you',
    validation: {
      required: false,
      maxSelections: 5,
    },
    component: 'MultiSelect',
    options: [
      { value: 'research', label: 'Undergraduate research opportunities' },
      { value: 'internships', label: 'Internships and co-op programs' },
      { value: 'study_abroad', label: 'Study abroad programs' },
      { value: 'greek_life', label: 'Greek life (fraternities/sororities)' },
      { value: 'd1_sports', label: 'Division I athletics' },
      { value: 'd3_sports', label: 'Division III athletics' },
      { value: 'club_sports', label: 'Club and intramural sports' },
      { value: 'arts_music', label: 'Arts and music programs' },
      { value: 'theater', label: 'Theater and performing arts' },
      { value: 'community_service', label: 'Community service and volunteering' },
      { value: 'student_government', label: 'Student government and leadership' },
      { value: 'entrepreneurship', label: 'Entrepreneurship and startups' },
      { value: 'religious_life', label: 'Religious/spiritual community' },
    ],
  },
  {
    id: 'academic_culture',
    tier: 3,
    type: 'select',
    question: 'What academic environment do you prefer?',
    helpText: 'Choose the type of academic culture that appeals to you',
    validation: {
      required: false,
    },
    component: 'Select',
    defaultValue: 3,
    options: [
      { value: 1, label: 'Highly competitive - Intense, everyone pushing hard' },
      { value: 2, label: 'Competitive - Challenging but supportive' },
      { value: 3, label: 'Balanced - Mix of competition and collaboration' },
      { value: 4, label: 'Collaborative - Students help each other' },
      { value: 5, label: 'Very collaborative - Non-competitive, community-focused' },
    ],
  },
  {
    id: 'post_grad_plans',
    tier: 3,
    type: 'select',
    question: 'What are your plans after graduation?',
    helpText: 'This helps us recommend schools with strong relevant outcomes',
    validation: {
      required: false,
    },
    component: 'Select',
    options: [
      { value: 'workforce', label: 'Enter the workforce directly' },
      { value: 'masters', label: 'Graduate school (Master\'s or PhD)' },
      { value: 'professional', label: 'Professional school (Medical, Law, Business)' },
      { value: 'exploring', label: 'Still exploring my options' },
    ],
    conditional: (answers) => {
      // Show if major suggests specific path (STEM, pre-med, etc.) or always show in Tier 3
      const gradSchoolMajors = ['biology', 'chemistry', 'physics', 'psychology', 'mathematics', 'medicine'];
      const hasScienceMajor = answers.intended_majors?.some(m => 
        gradSchoolMajors.some(gsm => m.toLowerCase().includes(gsm.toLowerCase()))
      );
      // Always show in Tier 3, but could be conditional based on major
      return true;
    },
  },
  {
    id: 'special_programs',
    tier: 3,
    type: 'multi_select',
    question: 'Are any of these programs important to you?',
    helpText: 'Select all that interest you',
    validation: {
      required: false,
    },
    component: 'MultiSelect',
    options: [
      { value: 'honors_college', label: 'Honors college or program' },
      { value: 'living_learning', label: 'Living-learning communities' },
      { value: 'research_uni', label: 'Undergraduate research programs' },
      { value: 'direct_admit', label: 'Direct admission to major (no competitive declaration)' },
      { value: 'bs_ms', label: '5-year BS/MS combined programs' },
      { value: 'co_op', label: 'Cooperative education (co-op)' },
      { value: 'guaranteed_internship', label: 'Guaranteed internships' },
      { value: 'first_year_seminar', label: 'First-year seminars with faculty' },
    ],
  },
  {
    id: 'campus_culture',
    tier: 3,
    type: 'multi_select',
    question: 'What kind of campus culture appeals to you?',
    helpText: 'Select all that resonate',
    validation: {
      required: false,
    },
    component: 'MultiSelect',
    options: [
      { value: 'politically_active', label: 'Politically active and engaged' },
      { value: 'preprofessional', label: 'Pre-professional and career-focused' },
      { value: 'intellectual', label: 'Intellectual and discussion-oriented' },
      { value: 'outdoorsy', label: 'Outdoorsy and athletic' },
      { value: 'artsy', label: 'Artsy and creative' },
      { value: 'party_scene', label: 'Active social and party scene' },
      { value: 'lgbtq_friendly', label: 'LGBTQ+ friendly' },
      { value: 'diverse', label: 'Racially and ethnically diverse' },
      { value: 'religious', label: 'Religious or faith-based community' },
      { value: 'close_knit', label: 'Close-knit and collaborative' },
      { value: 'independent', label: 'Independent and individualistic' },
    ],
  },
  {
    id: 'deal_breakers',
    tier: 3,
    type: 'multi_select',
    question: 'Any absolute deal-breakers?',
    helpText: 'Schools with these characteristics will be excluded',
    validation: {
      required: false,
    },
    component: 'MultiSelect',
    options: [
      { value: 'no_religious', label: 'Religious affiliation' },
      { value: 'no_greek', label: 'Dominant Greek life culture' },
      { value: 'no_rural', label: 'Rural location' },
      { value: 'no_urban', label: 'Urban location' },
      { value: 'no_cold_weather', label: 'Very cold winters' },
      { value: 'no_large', label: 'Large schools (over 15,000)' },
      { value: 'no_small', label: 'Small schools (under 3,000)' },
      { value: 'must_have_major', label: 'Must have my specific major' },
      { value: 'no_single_gender', label: 'Single-gender institutions' },
      { value: 'none', label: 'No deal-breakers' },
    ],
  },
  {
    id: 'weather_preference',
    tier: 3,
    type: 'select',
    question: 'What weather do you prefer?',
    helpText: 'Consider that you\'ll be there for 4 years',
    validation: {
      required: false,
    },
    component: 'Select',
    options: [
      { value: 'warm_year_round', label: 'Warm year-round (Southern California, Florida)' },
      { value: 'hot_summers', label: 'Hot summers, mild winters (Southeast, Southwest)' },
      { value: 'four_seasons', label: 'Four distinct seasons (Northeast, Midwest)' },
      { value: 'mild_year_round', label: 'Mild year-round (Pacific Northwest, Northern California)' },
      { value: 'cold_winters', label: 'Don\'t mind cold winters' },
      { value: 'no_preference', label: 'Weather doesn\'t matter to me' },
    ],
  },
];

/**
 * Check if Tier 2 is 70% complete (required for Tier 3)
 * @param {Object} answers - Current answers
 * @returns {boolean} True if Tier 2 is at least 70% complete
 */
function isTier2SeventyPercentComplete(answers = {}) {
  // Get Tier 2 questions directly to avoid circular dependency
  const tier2Questions = TIER_2_QUESTIONS.filter(q => shouldShowQuestion(q, answers));
  if (tier2Questions.length === 0) return false;
  
  const tier2Answered = tier2Questions.filter(q => {
    const value = answers[q.id];
    return value !== null && value !== undefined && value !== '';
  }).length;
  
  return tier2Answered >= tier2Questions.length * 0.7;
}

/**
 * Get all questions for a tier
 * @param {number} tier - Question tier (1, 2, or 3)
 * @param {Object} answers - Current answers for conditional logic
 * @returns {Array} Array of question objects that should be shown
 */
export function getQuestionsForTier(tier, answers = {}) {
  let questions = [];
  
  if (tier === 1) {
    questions = TIER_1_QUESTIONS;
  } else if (tier === 2) {
    questions = TIER_2_QUESTIONS;
  } else if (tier === 3) {
    // Only show Tier 3 if Tier 2 is at least 70% complete
    if (isTier2SeventyPercentComplete(answers)) {
      questions = TIER_3_QUESTIONS;
    } else {
      questions = [];
    }
  }

  // Filter by conditional logic
  return questions.filter(q => shouldShowQuestion(q, answers));
}

/**
 * Check if question should be shown based on answers
 * @param {Object} question - Question object
 * @param {Object} answers - Current answers
 * @returns {boolean} Whether to show question
 */
export function shouldShowQuestion(question, answers) {
  if (!question.conditional) return true;
  return question.conditional(answers);
}

/**
 * Get all visible questions across all tiers
 * @param {Object} answers - Current answers
 * @returns {Array} All questions that should be shown
 */
export function getAllVisibleQuestions(answers = {}) {
  const tier1 = getQuestionsForTier(1, answers);
  const tier2 = getQuestionsForTier(2, answers);
  const tier3 = getQuestionsForTier(3, answers);
  return [...tier1, ...tier2, ...tier3];
}

/**
 * Calculate profile completeness
 * @param {Object} answers - Student answers
 * @returns {Object} Completeness scores
 */
export function calculateProfileCompleteness(answers) {
  const weights = {
    tier1: 60,
    tier2: 30,
    tier3: 10,
  };

  // Tier 1 questions
  const tier1Questions = getQuestionsForTier(1, answers);
  const tier1Answered = tier1Questions.filter(q => {
    const value = answers[q.id];
    return value !== null && value !== undefined && value !== '';
  });
  const tier1Score = tier1Questions.length > 0
    ? (tier1Answered.length / tier1Questions.length) * weights.tier1
    : 0;

  // Tier 2 questions
  const tier2Questions = getQuestionsForTier(2, answers);
  const tier2Answered = tier2Questions.filter(q => {
    const value = answers[q.id];
    return value !== null && value !== undefined && value !== '';
  });
  const tier2Score = tier2Questions.length > 0
    ? (tier2Answered.length / tier2Questions.length) * weights.tier2
    : 0;

  // Tier 3 questions
  const tier3Questions = getQuestionsForTier(3, answers);
  const tier3Answered = tier3Questions.filter(q => {
    const value = answers[q.id];
    return value !== null && value !== undefined && value !== '';
  });
  const tier3Score = tier3Questions.length > 0
    ? (tier3Answered.length / tier3Questions.length) * weights.tier3
    : 0;

  const overall = Math.round(tier1Score + tier2Score + tier3Score);

  return {
    overall,
    tier1: tier1Questions.length > 0 ? Math.round((tier1Answered.length / tier1Questions.length) * 100) : 0,
    tier2: tier2Questions.length > 0 ? Math.round((tier2Answered.length / tier2Questions.length) * 100) : 0,
    tier3: tier3Questions.length > 0 ? Math.round((tier3Answered.length / tier3Questions.length) * 100) : 0,
    canGenerateMatches: tier1Score === weights.tier1, // All Tier 1 complete
  };
}
