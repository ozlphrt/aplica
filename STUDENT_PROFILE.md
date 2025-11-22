# Student Profile & Adaptive Questionnaire

## Overview
This document defines the complete student profile structure and adaptive questionnaire logic for Aplica. The questionnaire uses a three-tier approach to collect information efficiently while maintaining comprehensiveness.

**Design Philosophy:**
- Start with critical information (Tier 1)
- Progressively reveal more questions based on answers
- Motivate completion without overwhelming
- Allow skipping non-critical questions
- Show progress and completeness

## Questionnaire Tiers

### Tier 1: Critical Must-Haves
Always required. Cannot generate matches without these.

### Tier 2: Important Context
Asked after Tier 1 completion. Significantly improves match quality.

### Tier 3: Refinement
Adaptive based on earlier answers. Fine-tunes recommendations.

## Complete Question Set

### TIER 1 QUESTIONS (Always Required)

#### Q1: Academic Performance - GPA
```javascript
{
  id: 'gpa',
  tier: 1,
  type: 'number',
  question: 'What is your current GPA?',
  helpText: 'Enter your cumulative GPA through the most recent completed semester',
  placeholder: '3.75',
  validation: {
    min: 0,
    max: 5.0,  // Allow for weighted scales
    required: true,
    errorMessage: 'Please enter a valid GPA between 0 and 5.0'
  },
  component: 'NumberInput',
  step: 0.01
}
```

#### Q2: GPA Scale Type
```javascript
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
    { value: 'other', label: 'Other scale' }
  ],
  validation: {
    required: true
  },
  component: 'Select',
  conditional: (answers) => answers.gpa !== null
}
```

#### Q3: Standardized Testing Status
```javascript
{
  id: 'test_taken',
  tier: 1,
  type: 'boolean',
  question: 'Have you taken the SAT or ACT?',
  helpText: 'Many schools are test-optional, but scores can help with merit aid',
  options: [
    { value: true, label: 'Yes, I have test scores' },
    { value: false, label: 'No, I haven\'t taken tests yet' },
    { value: 'not_submitting', label: 'Taken but not submitting (test-optional)' }
  ],
  validation: {
    required: true
  },
  component: 'RadioGroup'
}
```

#### Q4: SAT Score
```javascript
{
  id: 'sat_score',
  tier: 1,
  type: 'number',
  question: 'What is your SAT score (total)?',
  helpText: 'Total score out of 1600 (Math + Evidence-Based Reading & Writing)',
  placeholder: '1350',
  validation: {
    min: 400,
    max: 1600,
    required: false,
    errorMessage: 'SAT scores range from 400 to 1600'
  },
  component: 'NumberInput',
  step: 10,
  conditional: (answers) => answers.test_taken === true
}
```

#### Q5: SAT Score Breakdown (Optional Enhancement)
```javascript
{
  id: 'sat_breakdown',
  tier: 1,
  type: 'composite',
  question: 'SAT section scores (optional, for better matching)',
  helpText: 'Helps us match you with schools that emphasize your strengths',
  fields: [
    {
      id: 'sat_math',
      label: 'Math',
      type: 'number',
      min: 200,
      max: 800,
      placeholder: '680'
    },
    {
      id: 'sat_ebrw',
      label: 'Reading & Writing',
      type: 'number',
      min: 200,
      max: 800,
      placeholder: '670'
    }
  ],
  component: 'CompositeInput',
  conditional: (answers) => answers.sat_score !== null,
  validation: {
    custom: (values) => {
      if (values.sat_math && values.sat_ebrw) {
        return values.sat_math + values.sat_ebrw === answers.sat_score;
      }
      return true;
    },
    errorMessage: 'Section scores must add up to total SAT score'
  }
}
```

#### Q6: ACT Score
```javascript
{
  id: 'act_score',
  tier: 1,
  type: 'number',
  question: 'What is your ACT composite score?',
  helpText: 'Composite score out of 36',
  placeholder: '30',
  validation: {
    min: 1,
    max: 36,
    required: false,
    errorMessage: 'ACT composite scores range from 1 to 36'
  },
  component: 'NumberInput',
  step: 1,
  conditional: (answers) => answers.test_taken === true && !answers.sat_score
}
```

#### Q7: Intended Major(s)
```javascript
{
  id: 'intended_majors',
  tier: 1,
  type: 'search_multi_select',
  question: 'What do you want to study?',
  helpText: 'Select up to 3 majors you\'re considering. You can be undecided.',
  placeholder: 'Search majors... (e.g., Computer Science, Biology)',
  validation: {
    required: true,
    minSelections: 1,
    maxSelections: 3,
    errorMessage: 'Please select at least one major or choose "Undecided"'
  },
  component: 'SearchMultiSelect',
  options: [
    { value: 'undecided', label: 'Undecided / Exploring', category: 'General' },
    // Dynamically populated from major_categories table
  ],
  allowCustom: false,
  searchable: true,
  grouped: true  // Group by category
}
```

#### Q8: Maximum Annual Budget
```javascript
{
  id: 'max_annual_budget',
  tier: 1,
  type: 'currency',
  question: 'What is the maximum you can afford per year for college?',
  helpText: 'Include all sources: savings, family income, loans you\'re willing to take. Be realistic.',
  placeholder: '25000',
  validation: {
    min: 0,
    max: 100000,
    required: true,
    errorMessage: 'Please enter a realistic annual budget'
  },
  component: 'CurrencyInput',
  preset_options: [
    { value: 10000, label: '$10,000 or less' },
    { value: 20000, label: '$20,000' },
    { value: 30000, label: '$30,000' },
    { value: 40000, label: '$40,000' },
    { value: 50000, label: '$50,000+' },
    { value: 99999, label: 'No limit' }
  ]
}
```

#### Q9: State of Residence
```javascript
{
  id: 'state_residence',
  tier: 1,
  type: 'select',
  question: 'What state do you currently live in?',
  helpText: 'This affects in-state tuition at public universities',
  validation: {
    required: true
  },
  component: 'Select',
  options: [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    // ... all 50 states + DC
    { value: 'international', label: 'International (not a US resident)' }
  ],
  searchable: true
}
```

#### Q10: Geographic Preference
```javascript
{
  id: 'location_preference',
  tier: 1,
  type: 'multi_select',
  question: 'Where are you willing to attend college?',
  helpText: 'Select all that apply',
  validation: {
    required: true,
    minSelections: 1
  },
  component: 'CheckboxGroup',
  options: [
    { 
      value: 'in_state', 
      label: 'In my state only',
      description: 'Best for cost savings at public universities'
    },
    { 
      value: 'nearby_states', 
      label: 'My state and nearby states',
      description: 'Within 3-4 hours of home'
    },
    { 
      value: 'regional', 
      label: 'Specific region(s)',
      description: 'Choose regions next'
    },
    { 
      value: 'anywhere', 
      label: 'Anywhere in the US',
      description: 'No geographic restrictions'
    }
  ],
  mutuallyExclusive: ['in_state', 'anywhere']  // Can't select both
}
```

#### Q11: Specific Regions (Conditional)
```javascript
{
  id: 'preferred_regions',
  tier: 1,
  type: 'multi_select',
  question: 'Which regions are you interested in?',
  helpText: 'Select all regions you would consider',
  validation: {
    required: true,
    minSelections: 1
  },
  component: 'CheckboxGroup',
  options: [
    { value: 'northeast', label: 'Northeast', states: 'ME, NH, VT, MA, RI, CT, NY, NJ, PA' },
    { value: 'southeast', label: 'Southeast', states: 'DE, MD, DC, VA, WV, NC, SC, GA, FL' },
    { value: 'midwest', label: 'Midwest', states: 'OH, IN, IL, MI, WI, MN, IA, MO' },
    { value: 'southwest', label: 'Southwest', states: 'TX, OK, AR, LA, NM, AZ' },
    { value: 'west', label: 'West', states: 'CO, UT, NV, CA, OR, WA, ID, MT, WY' },
    { value: 'mountain', label: 'Mountain States', states: 'MT, ID, WY, CO, UT, NV' },
    { value: 'pacific', label: 'Pacific Coast', states: 'CA, OR, WA, HI, AK' }
  ],
  conditional: (answers) => answers.location_preference?.includes('regional')
}
```

### TIER 2 QUESTIONS (Important Context)

#### Q12: Class Rank Availability
```javascript
{
  id: 'class_rank_available',
  tier: 2,
  type: 'boolean',
  question: 'Does your high school provide class rank?',
  helpText: 'Many schools no longer rank students',
  options: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
    { value: 'unknown', label: 'Not sure' }
  ],
  component: 'RadioGroup'
}
```

#### Q13: Class Rank Percentile
```javascript
{
  id: 'class_rank_percentile',
  tier: 2,
  type: 'select',
  question: 'What is your approximate class rank?',
  helpText: 'Top 10% means you\'re in the 90th percentile',
  validation: {
    required: false
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
    { value: 40, label: 'Lower 50%' }
  ],
  conditional: (answers) => answers.class_rank_available === true
}
```

#### Q14: Advanced Coursework
```javascript
{
  id: 'ap_ib_count',
  tier: 2,
  type: 'composite',
  question: 'How many advanced courses have you taken or are taking?',
  helpText: 'Include AP, IB, dual enrollment, or honors courses',
  fields: [
    {
      id: 'ap_courses',
      label: 'AP Courses',
      type: 'number',
      min: 0,
      max: 25,
      placeholder: '5'
    },
    {
      id: 'ib_courses',
      label: 'IB Courses',
      type: 'number',
      min: 0,
      max: 15,
      placeholder: '0'
    },
    {
      id: 'dual_enrollment',
      label: 'Dual Enrollment',
      type: 'number',
      min: 0,
      max: 20,
      placeholder: '0'
    },
    {
      id: 'honors_courses',
      label: 'Honors Courses',
      type: 'number',
      min: 0,
      max: 30,
      placeholder: '3'
    }
  ],
  component: 'CompositeInput'
}
```

#### Q15: Course Rigor Self-Assessment
```javascript
{
  id: 'course_rigor',
  tier: 2,
  type: 'select',
  question: 'How would you describe your course load compared to peers?',
  helpText: 'Consider the difficulty of courses you\'ve chosen',
  component: 'Select',
  options: [
    { 
      value: 'most_rigorous', 
      label: 'Most rigorous available',
      description: 'Took nearly all advanced courses offered'
    },
    { 
      value: 'very_rigorous', 
      label: 'Very rigorous',
      description: 'Took most advanced courses in core subjects'
    },
    { 
      value: 'rigorous', 
      label: 'Rigorous',
      description: 'Took several advanced courses'
    },
    { 
      value: 'average', 
      label: 'Average',
      description: 'Mix of regular and some advanced courses'
    },
    { 
      value: 'less_rigorous', 
      label: 'Less rigorous',
      description: 'Mostly regular courses'
    }
  ]
}
```

#### Q16: Household Income Range
```javascript
{
  id: 'household_income',
  tier: 2,
  type: 'select',
  question: 'What is your family\'s annual household income?',
  helpText: 'Used to estimate financial aid eligibility. This information is private.',
  validation: {
    required: false  // Sensitive, allow skip
  },
  component: 'Select',
  options: [
    { value: 'under_30k', label: 'Under $30,000' },
    { value: '30_48k', label: '$30,000 - $48,000' },
    { value: '48_75k', label: '$48,000 - $75,000' },
    { value: '75_110k', label: '$75,000 - $110,000' },
    { value: '110_150k', label: '$110,000 - $150,000' },
    { value: 'over_150k', label: 'Over $150,000' },
    { value: 'prefer_not_say', label: 'Prefer not to say' }
  ],
  skipable: true
}
```

#### Q17: School Size Preference
```javascript
{
  id: 'school_size_preference',
  tier: 2,
  type: 'multi_select',
  question: 'What size school do you prefer?',
  helpText: 'Select all sizes you would consider',
  component: 'CheckboxGroup',
  options: [
    { 
      value: 'very_small', 
      label: 'Very small (under 1,000 students)',
      description: 'Intimate, everyone knows everyone'
    },
    { 
      value: 'small', 
      label: 'Small (1,000 - 5,000)',
      description: 'Close-knit community, small classes'
    },
    { 
      value: 'medium', 
      label: 'Medium (5,000 - 15,000)',
      description: 'Balance of community and opportunities'
    },
    { 
      value: 'large', 
      label: 'Large (15,000 - 25,000)',
      description: 'Diverse opportunities, big school spirit'
    },
    { 
      value: 'very_large', 
      label: 'Very large (over 25,000)',
      description: 'Big university experience, extensive resources'
    },
    { 
      value: 'no_preference', 
      label: 'No preference',
      description: 'Size doesn\'t matter to me'
    }
  ]
}
```

#### Q18: Campus Setting Preference
```javascript
{
  id: 'setting_preference',
  tier: 2,
  type: 'multi_select',
  question: 'What campus settings appeal to you?',
  helpText: 'Select all that apply',
  component: 'CheckboxGroup',
  options: [
    { 
      value: 'urban', 
      label: 'Urban / City',
      description: 'Major city, public transit, internships nearby',
      examples: 'Boston, NYC, Chicago, LA'
    },
    { 
      value: 'suburban', 
      label: 'Suburban',
      description: 'Near city but campus-focused, car helpful',
      examples: 'Evanston IL, Palo Alto CA'
    },
    { 
      value: 'town', 
      label: 'Small town / College town',
      description: 'Campus is center of community',
      examples: 'Ithaca NY, Chapel Hill NC, Burlington VT'
    },
    { 
      value: 'rural', 
      label: 'Rural',
      description: 'Countryside, tight-knit campus community',
      examples: 'Hanover NH, Grinnell IA'
    },
    { 
      value: 'no_preference', 
      label: 'No strong preference'
    }
  ]
}
```

#### Q19: Distance from Home
```javascript
{
  id: 'distance_from_home',
  tier: 2,
  type: 'select',
  question: 'How far from home are you willing to be?',
  helpText: 'Consider travel costs and frequency of visits',
  component: 'Select',
  options: [
    { value: 'commute', label: 'Commuting distance (under 30 miles)' },
    { value: 'drive_home', label: 'Easy weekend drive (under 3 hours)' },
    { value: 'day_trip', label: 'Day trip possible (3-6 hours)' },
    { value: 'in_state', label: 'Anywhere in my state' },
    { value: 'regional', label: 'Within my region' },
    { value: 'anywhere', label: 'Anywhere in the US' },
    { value: 'prefer_far', label: 'Prefer to be far from home' }
  ]
}
```

#### Q20: Financial Aid Expectations
```javascript
{
  id: 'financial_aid_need',
  tier: 2,
  type: 'select',
  question: 'How important is financial aid to your college decision?',
  helpText: 'This helps us prioritize schools with strong financial aid',
  component: 'Select',
  options: [
    { 
      value: 'critical', 
      label: 'Critical - Cannot attend without significant aid',
      description: 'Will only consider schools that meet financial need'
    },
    { 
      value: 'very_important', 
      label: 'Very important - Need substantial aid',
      description: 'Prefer schools with good financial aid packages'
    },
    { 
      value: 'important', 
      label: 'Important - Aid would help significantly',
      description: 'Hopeful for aid but can manage without'
    },
    { 
      value: 'helpful', 
      label: 'Helpful - Interested in merit scholarships',
      description: 'Not need-based, but merit aid is attractive'
    },
    { 
      value: 'not_important', 
      label: 'Not important - Can pay full cost',
      description: 'Cost is not a limiting factor'
    }
  ]
}
```

### TIER 3 QUESTIONS (Refinement - Adaptive)

#### Q21: Extracurricular Priorities
```javascript
{
  id: 'extracurricular_priorities',
  tier: 3,
  type: 'multi_select_ranked',
  question: 'What activities or opportunities are most important to you?',
  helpText: 'Select up to 5, then drag to rank by importance',
  validation: {
    maxSelections: 5
  },
  component: 'RankedMultiSelect',
  options: [
    { value: 'research', label: 'Undergraduate research opportunities', category: 'Academic' },
    { value: 'internships', label: 'Internships and co-op programs', category: 'Career' },
    { value: 'study_abroad', label: 'Study abroad programs', category: 'Academic' },
    { value: 'greek_life', label: 'Greek life (fraternities/sororities)', category: 'Social' },
    { value: 'd1_sports', label: 'Division I athletics', category: 'Sports' },
    { value: 'd3_sports', label: 'Division III athletics', category: 'Sports' },
    { value: 'club_sports', label: 'Club and intramural sports', category: 'Sports' },
    { value: 'arts_music', label: 'Arts and music programs', category: 'Creative' },
    { value: 'theater', label: 'Theater and performing arts', category: 'Creative' },
    { value: 'community_service', label: 'Community service and volunteering', category: 'Service' },
    { value: 'student_government', label: 'Student government and leadership', category: 'Leadership' },
    { value: 'entrepreneurship', label: 'Entrepreneurship and startups', category: 'Career' },
    { value: 'religious_life', label: 'Religious/spiritual community', category: 'Spiritual' }
  ],
  conditional: (answers) => {
    // Always show in Tier 3
    return true;
  }
}
```

#### Q22: Academic Environment Preference
```javascript
{
  id: 'academic_culture',
  tier: 3,
  type: 'slider',
  question: 'What academic environment do you prefer?',
  helpText: 'Slide to indicate your preference',
  component: 'Slider',
  config: {
    min: 1,
    max: 5,
    step: 1,
    labels: [
      { value: 1, label: 'Highly competitive', description: 'Intense, everyone pushing hard' },
      { value: 2, label: 'Competitive', description: 'Challenging but supportive' },
      { value: 3, label: 'Balanced', description: 'Mix of competition and collaboration' },
      { value: 4, label: 'Collaborative', description: 'Students help each other' },
      { value: 5, label: 'Very collaborative', description: 'Non-competitive, community-focused' }
    ],
    default: 3
  }
}
```

#### Q23: Post-Graduation Plans
```javascript
{
  id: 'post_grad_plans',
  tier: 3,
  type: 'select',
  question: 'What are your plans after graduation?',
  helpText: 'This helps us recommend schools with strong relevant outcomes',
  component: 'Select',
  options: [
    { 
      value: 'workforce', 
      label: 'Enter the workforce directly',
      description: 'Career-focused, want strong job placement'
    },
    { 
      value: 'masters', 
      label: 'Graduate school (Master\'s or PhD)',
      description: 'Research-focused, want grad school preparation'
    },
    { 
      value: 'professional', 
      label: 'Professional school (Medical, Law, Business)',
      description: 'Want strong professional school placement'
    },
    { 
      value: 'exploring', 
      label: 'Still exploring my options',
      description: 'Want flexibility and broad opportunities'
    }
  ],
  conditional: (answers) => {
    // Ask if major suggests specific path (STEM, pre-med, etc.)
    const gradSchoolMajors = ['biology', 'chemistry', 'physics', 'psychology', 'mathematics'];
    const hasScienceMajor = answers.intended_majors?.some(m => 
      gradSchoolMajors.some(gsm => m.includes(gsm))
    );
    return hasScienceMajor || answers.intended_majors?.includes('pre_med');
  }
}
```

#### Q24: Special Programs Interest
```javascript
{
  id: 'special_programs',
  tier: 3,
  type: 'multi_select',
  question: 'Are any of these programs important to you?',
  helpText: 'Select all that interest you',
  component: 'CheckboxGroup',
  options: [
    { value: 'honors_college', label: 'Honors college or program' },
    { value: 'living_learning', label: 'Living-learning communities' },
    { value: 'research_uni', label: 'Undergraduate research programs' },
    { value: 'direct_admit', label: 'Direct admission to major (no competitive declaration)' },
    { value: 'bs_ms', label: '5-year BS/MS combined programs' },
    { value: 'co_op', label: 'Cooperative education (co-op)' },
    { value: 'guaranteed_internship', label: 'Guaranteed internships' },
    { value: 'first_year_seminar', label: 'First-year seminars with faculty' }
  ]
}
```

#### Q25: Campus Culture Preferences
```javascript
{
  id: 'campus_culture',
  tier: 3,
  type: 'multi_select',
  question: 'What kind of campus culture appeals to you?',
  helpText: 'Select all that resonate',
  component: 'CheckboxGroup',
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
    { value: 'independent', label: 'Independent and individualistic' }
  ]
}
```

#### Q26: Deal Breakers
```javascript
{
  id: 'deal_breakers',
  tier: 3,
  type: 'multi_select',
  question: 'Any absolute deal-breakers?',
  helpText: 'Schools with these characteristics will be excluded',
  component: 'CheckboxGroup',
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
    { value: 'none', label: 'No deal-breakers' }
  ]
}
```

#### Q27: Weather Preference
```javascript
{
  id: 'weather_preference',
  tier: 3,
  type: 'select',
  question: 'What weather do you prefer?',
  helpText: 'Consider that you\'ll be there for 4 years',
  component: 'Select',
  options: [
    { value: 'warm_year_round', label: 'Warm year-round (Southern California, Florida)' },
    { value: 'hot_summers', label: 'Hot summers, mild winters (Southeast, Southwest)' },
    { value: 'four_seasons', label: 'Four distinct seasons (Northeast, Midwest)' },
    { value: 'mild_year_round', label: 'Mild year-round (Pacific Northwest, Northern California)' },
    { value: 'cold_winters', label: 'Don\'t mind cold winters' },
    { value: 'no_preference', label: 'Weather doesn\'t matter to me' }
  ]
}
```

## Adaptive Logic Rules

### When to Show Tier 2
```javascript
function shouldShowTier2(answers) {
  // All Tier 1 required questions answered
  const tier1Required = [
    'gpa',
    'gpa_scale',
    'test_taken',
    'intended_majors',
    'max_annual_budget',
    'state_residence',
    'location_preference'
  ];
  
  // Also need SAT or ACT if test_taken is true
  if (answers.test_taken === true) {
    tier1Required.push(answers.sat_score ? 'sat_score' : 'act_score');
  }
  
  return tier1Required.every(q => answers[q] !== null && answers[q] !== undefined);
}
```

### When to Show Tier 3
```javascript
function shouldShowTier3(answers) {
  // Tier 2 at least 70% complete
  const tier2Questions = [
    'class_rank_available',
    'ap_ib_count',
    'course_rigor',
    'household_income',
    'school_size_preference',
    'setting_preference',
    'distance_from_home',
    'financial_aid_need'
  ];
  
  const tier2Answered = tier2Questions.filter(q => 
    answers[q] !== null && answers[q] !== undefined
  ).length;
  
  return tier2Answered >= tier2Questions.length * 0.7;
}
```

### Conditional Question Logic
```javascript
function shouldShowQuestion(question, answers) {
  if (!question.conditional) return true;
  return question.conditional(answers);
}

// Examples of conditional logic:

// Show SAT breakdown only if SAT score entered
(answers) => answers.sat_score !== null

// Show regions only if "regional" selected
(answers) => answers.location_preference?.includes('regional')

// Show class rank percentile only if rank available
(answers) => answers.class_rank_available === true

// Show post-grad plans for science majors
(answers) => {
  const gradSchoolMajors = ['biology', 'chemistry', 'physics'];
  return answers.intended_majors?.some(m => 
    gradSchoolMajors.some(gsm => m.toLowerCase().includes(gsm.toLowerCase()))
  );
}
```

## Profile Completeness Calculation
```javascript
function calculateProfileCompleteness(answers) {
  const weights = {
    tier1: 60,  // Critical information
    tier2: 30,  // Important context
    tier3: 10   // Refinement
  };
  
  // Tier 1 questions (required)
  const tier1Questions = getAllTier1Questions();
  const tier1Answered = tier1Questions.filter(q => {
    if (!shouldShowQuestion(q, answers)) return true;  // Skip conditional
    return answers[q.id] !== null && answers[q.id] !== undefined;
  });
  const tier1Score = (tier1Answered.length / tier1Questions.filter(q => 
    shouldShowQuestion(q, answers)
  ).length) * weights.tier1;
  
  // Tier 2 questions (important)
  const tier2Questions = getAllTier2Questions();
  const tier2Answered = tier2Questions.filter(q => {
    if (!shouldShowQuestion(q, answers)) return true;
    return answers[q.id] !== null && answers[q.id] !== undefined;
  });
  const tier2Score = (tier2Answered.length / tier2Questions.filter(q => 
    shouldShowQuestion(q, answers)
  ).length) * weights.tier2;
  
  // Tier 3 questions (refinement)
  const tier3Questions = getAllTier3Questions();
  const tier3Answered = tier3Questions.filter(q => {
    if (!shouldShowQuestion(q, answers)) return true;
    return answers[q.id] !== null && answers[q.id] !== undefined;
  });
  const tier3Score = (tier3Answered.length / tier3Questions.filter(q => 
    shouldShowQuestion(q, answers)
  ).length) * weights.tier3;
  
  return {
    overall: Math.round(tier1Score + tier2Score + tier3Score),
    tier1: Math.round(tier1Score / weights.tier1 * 100),
    tier2: Math.round(tier2Score / weights.tier2 * 100),
    tier3: Math.round(tier3Score / weights.tier3 * 100),
    canGenerateMatches: tier1Score === weights.tier1  // All Tier 1 complete
  };
}
```

## Data Storage Structure
```javascript
// Student profile stored in localStorage
const studentProfile = {
  // Metadata
  profileId: 'uuid-v4',
  createdAt: '2024-11-15T10:30:00Z',
  lastUpdated: '2024-11-15T11:45:00Z',
  completeness: {
    overall: 85,
    tier1: 100,
    tier2: 88,
    tier3: 60
  },
  
  // Academic
  gpa: 3.75,
  gpa_scale: 'weighted_5',
  test_taken: true,
  sat_score: 1420,
  sat_math: 720,
  sat_ebrw: 700,
  act_score: null,
  class_rank_available: true,
  class_rank_percentile: 90,
  ap_courses: 7,
  ib_courses: 0,
  dual_enrollment: 2,
  honors_courses: 4,
  course_rigor: 'very_rigorous',
  
  // Major & Career
  intended_majors: ['computer_science', 'mathematics'],
  post_grad_plans: 'workforce',
  
  // Financial
  max_annual_budget: 35000,
  household_income: '75_110k',
  financial_aid_need: 'very_important',
  
  // Geographic
  state_residence: 'CA',
  location_preference: ['in_state', 'regional'],
  preferred_regions: ['west', 'pacific'],
  distance_from_home: 'day_trip',
  
  // Preferences
  school_size_preference: ['medium', 'large'],
  setting_preference: ['urban', 'suburban'],
  academic_culture: 3,  // Balanced
  weather_preference: 'warm_year_round',
  
  // Activities & Programs
  extracurricular_priorities: [
    { value: 'research', rank: 1 },
    { value: 'internships', rank: 2 },
    { value: 'club_sports', rank: 3 }
  ],
  special_programs: ['honors_college', 'research_uni', 'bs_ms'],
  campus_culture: ['diverse', 'intellectual', 'outdoorsy'],
  
  // Exclusions
  deal_breakers: ['no_religious', 'no_rural']
};
```

## Validation Rules

### GPA Validation
```javascript
function validateGPA(gpa, scale) {
  if (gpa === null || gpa === undefined) return { valid: false, error: 'GPA is required' };
  
  const maxGPA = {
    'unweighted_4': 4.0,
    'weighted_5': 5.0,
    'weighted_6': 6.0,
    'other': 100  // Allow up to 100 for percentage scales
  };
  
  if (gpa < 0) return { valid: false, error: 'GPA cannot be negative' };
  if (gpa > maxGPA[scale]) return { valid: false, error: `GPA exceeds ${scale} maximum` };
  
  return { valid: true };
}
```

### Test Score Validation
```javascript
function validateTestScores(answers) {
  if (answers.test_taken === false || answers.test_taken === 'not_submitting') {
    return { valid: true };
  }
  
  // Must have either SAT or ACT
  if (!answers.sat_score && !answers.act_score) {
    return { 
      valid: false, 
      error: 'Please enter either SAT or ACT score' 
    };
  }
  
  // SAT validation
  if (answers.sat_score) {
    if (answers.sat_score < 400 || answers.sat_score > 1600) {
      return { valid: false, error: 'SAT score must be between 400 and 1600' };
    }
    if (answers.sat_score % 10 !== 0) {
      return { valid: false, error: 'SAT scores are multiples of 10' };
    }
  }
  
  // ACT validation
  if (answers.act_score) {
    if (answers.act_score < 1 || answers.act_score > 36) {
      return { valid: false, error: 'ACT score must be between 1 and 36' };
    }
  }
  
  // SAT breakdown validation
  if (answers.sat_math && answers.sat_ebrw) {
    if (answers.sat_math + answers.sat_ebrw !== answers.sat_score) {
      return { 
        valid: false, 
        error: 'SAT section scores must add up to total score' 
      };
    }
  }
  
  return { valid: true };
}
```

### Budget Validation
```javascript
function validateBudget(budget) {
  if (budget === null || budget === undefined) {
    return { valid: false, error: 'Please enter a maximum budget' };
  }
  
  if (budget < 0) {
    return { valid: false, error: 'Budget cannot be negative' };
  }
  
  if (budget > 0 && budget < 5000) {
    return { 
      valid: true, 
      warning: 'This budget is very low. Consider including all available resources including loans.'
    };
  }
  
  return { valid: true };
}
```

## Progress Indicators

### Visual Progress Components

**Overall Completeness Bar**
```jsx
<div className="w-full bg-gray-200 rounded-full h-3">
  <div 
    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
    style={{ width: `${completeness.overall}%` }}
  />
</div>
<p className="text-sm text-gray-600 mt-2">
  {completeness.overall}% complete
</p>
```

**Tier Indicators**
```jsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Essential Information</span>
    <span className="text-sm text-gray-600">{completeness.tier1}%</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Important Details</span>
    <span className="text-sm text-gray-600">{completeness.tier2}%</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Preferences</span>
    <span className="text-sm text-gray-600">{completeness.tier3}%</span>
  </div>
</div>
```

**Motivation Messages**
```javascript
function getMotivationMessage(completeness) {
  if (completeness.overall === 100) {
    return {
      title: 'Profile Complete! 🎉',
      message: 'You\'re all set. Ready to find your perfect matches?'
    };
  }
  
  if (completeness.tier1 < 100) {
    return {
      title: 'Almost there!',
      message: `Just ${getTier1Remaining()} more questions to see your matches`
    };
  }
  
  if (completeness.tier2 < 70) {
    return {
      title: 'Good start!',
      message: 'Answer a few more questions to get better recommendations'
    };
  }
  
  return {
    title: 'Great progress!',
    message: 'You can see matches now, or answer more questions for refinement'
  };
}
```

## User Experience Flow

### 1. Welcome Screen
- Brief explanation of process
- Estimated time: 10-15 minutes
- Can save and return anytime
- Privacy assurance

### 2. Tier 1 Questions (Essential)
- Linear flow, one question at a time
- Cannot skip required questions
- Progress bar shows completion
- "See matches" button appears when Tier 1 complete

### 3. Tier 2 Questions (Important)
- Can skip questions
- Clear "These help us match you better" messaging
- Option to "See matches now" or continue

### 4. Tier 3 Questions (Refinement)
- Fully optional
- "Refine your matches" framing
- Can always come back to add more

### 5. Profile Summary
- Review all answers
- Edit any section
- Completeness score displayed
- "Generate matches" CTA

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Next Review**: After user testing feedback  
**Maintained By**: Product Team