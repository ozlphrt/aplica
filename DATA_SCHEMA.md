# Database Schema & Data Dictionary

**⚠️ Architecture Note:** This application uses **live College Scorecard API calls** instead of a local SQLite database. The schema below documents the API response structure and how we normalize it for our application. This documentation serves as a reference for data structure, not an actual database schema.

**API Endpoint:** https://api.data.gov/ed/collegescorecard/v1/schools  
**Documentation:** https://collegescorecard.ed.gov/data/documentation/

---

## Overview
This document defines the data structure for Aplica. The app now uses live College Scorecard API calls to access comprehensive data on 6,000+ US four-year institutions. The schema below reflects the API response format and how we normalize it for use in the application.

**Previous Architecture**: SQLite database (`colleges_vYYYY_MM.db`)  
**Current Architecture**: Live API calls with localStorage caching (24-hour TTL)  
**Primary Key**: `unitid` (IPEDS Unit ID) used across all data structures

## Data Sources

| Source | Update Frequency | Coverage | Reliability |
|--------|------------------|----------|-------------|
| College Scorecard API | Annual | All schools | High |
| IPEDS | Annual | All schools | High |
| Common Data Set (CDS) | Annual | ~500 top schools | Medium (manual) |
| US News Rankings | Annual | Ranked schools | Medium |
| Manual Curation | Ongoing | Policy changes | Variable |

## Core Tables

### schools
Primary table containing all institutional data.
```sql
CREATE TABLE schools (
    -- Identity
    unitid INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    url TEXT,
    latitude REAL,
    longitude REAL,
    
    -- Basic Characteristics
    control TEXT,              -- 'Public', 'Private nonprofit', 'Private for-profit'
    size INTEGER,              -- Undergraduate enrollment
    setting TEXT,              -- 'City', 'Suburb', 'Town', 'Rural'
    locale_code INTEGER,       -- IPEDS locale code (12 categories)
    religious_affiliation TEXT,
    historically_black BOOLEAN DEFAULT 0,
    tribal_college BOOLEAN DEFAULT 0,
    women_only BOOLEAN DEFAULT 0,
    men_only BOOLEAN DEFAULT 0,
    
    -- Admissions Statistics
    admit_rate REAL,           -- Overall admission rate (0.0 to 1.0)
    yield_rate REAL,           -- % of admitted students who enroll
    
    -- SAT Scores (out of 1600 total: 800 math + 800 EBRW)
    sat_math_25 INTEGER,       -- 25th percentile math (200-800)
    sat_math_75 INTEGER,       -- 75th percentile math (200-800)
    sat_ebrw_25 INTEGER,       -- 25th percentile reading/writing (200-800)
    sat_ebrw_75 INTEGER,       -- 75th percentile reading/writing (200-800)
    
    -- ACT Scores
    act_composite_25 INTEGER,  -- 25th percentile composite (1-36)
    act_composite_75 INTEGER,  -- 75th percentile composite (1-36)
    act_english_25 INTEGER,
    act_english_75 INTEGER,
    act_math_25 INTEGER,
    act_math_75 INTEGER,
    
    -- Testing Policy
    test_optional BOOLEAN DEFAULT 0,
    test_blind BOOLEAN DEFAULT 0,
    test_required BOOLEAN DEFAULT 1,
    
    -- Financial Data
    cost_attendance INTEGER,          -- Annual sticker price
    tuition_in_state INTEGER,         -- In-state tuition (public schools)
    tuition_out_state INTEGER,        -- Out-of-state tuition (public schools)
    tuition_private INTEGER,          -- Private school tuition
    room_board INTEGER,               -- Room and board costs
    books_supplies INTEGER,           -- Estimated books/supplies
    other_expenses INTEGER,           -- Personal expenses, transportation
    
    -- Net Price by Income Bracket (after average financial aid)
    net_price_0_30k INTEGER,          -- Household income $0-30k
    net_price_30_48k INTEGER,         -- Household income $30-48k
    net_price_48_75k INTEGER,         -- Household income $48-75k
    net_price_75_110k INTEGER,        -- Household income $75-110k
    net_price_110k_plus INTEGER,      -- Household income $110k+
    
    -- Financial Aid Availability
    meets_full_need BOOLEAN DEFAULT 0,    -- Meets 100% demonstrated need
    pct_need_met REAL,                    -- Average % of need met
    pct_receiving_aid REAL,               -- % receiving any financial aid
    pct_receiving_fed_loans REAL,         -- % with federal loans
    pct_receiving_pell REAL,              -- % with Pell grants (low income)
    
    -- Merit Aid
    avg_merit_aid INTEGER,                -- Average merit scholarship amount
    pct_receiving_merit REAL,             -- % receiving merit aid
    merit_aid_available BOOLEAN DEFAULT 1,
    
    -- Academic Outcomes
    retention_rate REAL,              -- % returning after freshman year
    graduation_rate_4yr REAL,         -- % graduating in 4 years
    graduation_rate_6yr REAL,         -- % graduating in 6 years
    
    -- Career Outcomes
    median_earnings_6yr INTEGER,      -- Median earnings 6 years after entry
    median_earnings_10yr INTEGER,     -- Median earnings 10 years after entry
    employment_rate REAL,             -- % employed within 1 year
    
    -- Academic Resources
    student_faculty_ratio INTEGER,    -- Students per faculty member
    pct_faculty_fulltime REAL,        -- % of faculty full-time
    pct_classes_under_20 REAL,        -- % of classes with <20 students
    pct_classes_over_50 REAL,         -- % of classes with 50+ students
    
    -- Student Body Demographics
    pct_women REAL,
    pct_white REAL,
    pct_black REAL,
    pct_hispanic REAL,
    pct_asian REAL,
    pct_international REAL,
    pct_first_generation REAL,        -- First in family to attend college
    
    -- Campus Life
    campus_housing_available BOOLEAN DEFAULT 1,
    pct_students_on_campus REAL,     -- % living on campus
    greek_life_available BOOLEAN,
    pct_in_greek_life REAL,
    ncaa_division TEXT,               -- 'I', 'II', 'III', or NULL
    
    -- Special Designations
    research_university BOOLEAN DEFAULT 0,
    liberal_arts_college BOOLEAN DEFAULT 0,
    land_grant BOOLEAN DEFAULT 0,
    
    -- Data Quality Metadata
    data_year INTEGER,                -- Most recent data year
    completeness_score REAL,          -- 0-100, calculated field
    last_updated TEXT,                -- ISO date of last update
    
    -- Indexes for common queries
    CHECK (admit_rate >= 0 AND admit_rate <= 1),
    CHECK (completeness_score >= 0 AND completeness_score <= 100)
);

-- Indexes for performance
CREATE INDEX idx_schools_state ON schools(state);
CREATE INDEX idx_schools_control ON schools(control);
CREATE INDEX idx_schools_size ON schools(size);
CREATE INDEX idx_schools_admit_rate ON schools(admit_rate);
CREATE INDEX idx_schools_setting ON schools(setting);
CREATE INDEX idx_schools_cost ON schools(cost_attendance);
```

**Field Notes:**

**Identity Fields:**
- `unitid`: IPEDS Unit ID, stable identifier across years
- `name`: Official institution name
- `state`: Two-letter state code (e.g., 'CA', 'NY', 'TX')

**Admissions Statistics:**
- All rates stored as decimals: 0.25 = 25%
- SAT scores: Each section 200-800, total possible 1600
- ACT scores: Composite and sections on 1-36 scale
- 25th/75th percentile: Middle 50% of enrolled students

**Financial Data:**
- All costs in US dollars (integers)
- Net prices are averages, not guarantees
- Income brackets from FAFSA categories
- Merit aid data where available (many schools don't report)

**Outcomes:**
- Retention rate: Critical indicator of student satisfaction
- 4-year graduation: True on-time completion
- 6-year graduation: Standard federal reporting metric
- Earnings: Median for all graduates, not by major

**Completeness Score Calculation:**
```sql
-- Calculated as percentage of non-null important fields
-- Weighted by importance: admission stats (30%), financial (30%), 
-- outcomes (20%), academics (20%)
```

### programs
Academic programs and majors offered by each institution.
```sql
CREATE TABLE programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unitid INTEGER NOT NULL,
    cip_code TEXT NOT NULL,           -- Classification of Instructional Programs
    cip_2digit TEXT,                  -- Major category (e.g., '11' for CS)
    cip_4digit TEXT,                  -- Subcategory (e.g., '11.07' for CS)
    cip_6digit TEXT,                  -- Specific program (e.g., '11.0701' for CS)
    program_name TEXT NOT NULL,
    program_category TEXT,            -- Human-readable category
    degree_level TEXT,                -- 'Bachelors', 'Masters', 'Doctorate'
    annual_completions INTEGER,       -- Graduates per year (0 if new program)
    program_length_years INTEGER,     -- Expected years to complete
    distance_education BOOLEAN DEFAULT 0,
    
    FOREIGN KEY (unitid) REFERENCES schools(unitid) ON DELETE CASCADE
);

CREATE INDEX idx_programs_unitid ON programs(unitid);
CREATE INDEX idx_programs_cip2 ON programs(cip_2digit);
CREATE INDEX idx_programs_cip4 ON programs(cip_4digit);
CREATE INDEX idx_programs_cip6 ON programs(cip_6digit);
CREATE INDEX idx_programs_category ON programs(program_category);
```

**Common CIP Code Categories:**

| CIP 2-Digit | Category | Examples |
|-------------|----------|----------|
| 01 | Agriculture | Agronomy, Animal Science |
| 03 | Natural Resources | Environmental Science, Forestry |
| 09 | Communication | Journalism, Digital Media |
| 11 | Computer Science | CS, Information Systems |
| 13 | Education | Elementary Ed, Special Ed |
| 14 | Engineering | Mechanical, Electrical, Civil |
| 16 | Foreign Languages | Spanish, French, Linguistics |
| 23 | English | Literature, Creative Writing |
| 24 | Liberal Arts | General Studies |
| 26 | Biological Sciences | Biology, Biochemistry, Neuroscience |
| 27 | Mathematics | Pure Math, Applied Math, Statistics |
| 30 | Multi/Interdisciplinary | Cognitive Science, Sustainability |
| 40 | Physical Sciences | Physics, Chemistry, Geology |
| 42 | Psychology | Clinical, Cognitive, Developmental |
| 45 | Social Sciences | Economics, Sociology, Political Science |
| 50 | Visual/Performing Arts | Art, Music, Theater, Dance |
| 52 | Business | Management, Finance, Marketing, Accounting |
| 54 | History | General History, American History |

**Program Name Standardization:**
```javascript
// Map common variations to standard names
const programNameMap = {
  'Computer and Information Sciences': 'Computer Science',
  'Business Administration and Management': 'Business Administration',
  'Registered Nursing': 'Nursing',
  // ... etc
};
```

### program_rankings
Curated program strength data from various sources.
```sql
CREATE TABLE program_rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unitid INTEGER NOT NULL,
    cip_2digit TEXT,                  -- Major category being ranked
    program_name TEXT,                -- Human-readable program name
    ranking_source TEXT NOT NULL,     -- 'US News', 'QS', 'THE', 'NRC', etc.
    ranking_type TEXT,                -- 'National', 'Regional', 'Global'
    rank INTEGER,                     -- Numeric rank (lower is better)
    score REAL,                       -- Normalized score 0-100 (higher is better)
    total_ranked INTEGER,             -- Total programs ranked in this category
    percentile REAL,                  -- Percentile rank (0-100, higher is better)
    year INTEGER NOT NULL,
    last_updated TEXT,
    
    FOREIGN KEY (unitid) REFERENCES schools(unitid) ON DELETE CASCADE,
    CHECK (score >= 0 AND score <= 100),
    CHECK (percentile >= 0 AND percentile <= 100)
);

CREATE INDEX idx_rankings_unitid ON program_rankings(unitid);
CREATE INDEX idx_rankings_cip ON program_rankings(cip_2digit);
CREATE INDEX idx_rankings_source ON program_rankings(ranking_source);
CREATE INDEX idx_rankings_year ON program_rankings(year);
```

**Ranking Sources:**
- **US News**: Most widely referenced, updated annually
- **QS World University Rankings**: Global perspective
- **Times Higher Education (THE)**: Research-focused
- **NRC (National Research Council)**: Graduate programs (PhD)
- **Manual curation**: Faculty publications, research funding, notable alumni

**Score Normalization:**
```javascript
// Convert various ranking systems to 0-100 scale
function normalizeRankingScore(rank, totalRanked, source) {
  // Linear normalization: #1 = 100, last = 0
  const percentile = ((totalRanked - rank) / (totalRanked - 1)) * 100;
  return Math.max(0, Math.min(100, percentile));
}
```

### admission_factors
Importance of various admission criteria (from Common Data Set Section C).
```sql
CREATE TABLE admission_factors (
    unitid INTEGER NOT NULL,
    factor TEXT NOT NULL,             -- Standard factor name
    importance TEXT NOT NULL,         -- Importance level
    notes TEXT,                       -- Additional context
    data_year INTEGER,
    
    PRIMARY KEY (unitid, factor),
    FOREIGN KEY (unitid) REFERENCES schools(unitid) ON DELETE CASCADE,
    CHECK (importance IN ('Very Important', 'Important', 'Considered', 'Not Considered'))
);

CREATE INDEX idx_factors_unitid ON admission_factors(unitid);
CREATE INDEX idx_factors_factor ON admission_factors(factor);
```

**Standard Admission Factors:**

| Factor | Description | Common Importance |
|--------|-------------|-------------------|
| rigor_secondary_record | Course difficulty (AP/IB/Honors) | Very Important |
| class_rank | Class rank percentile | Important |
| gpa | Academic GPA | Very Important |
| standardized_tests | SAT/ACT scores | Varies (test-optional trend) |
| application_essay | Personal statement quality | Important |
| recommendations | Teacher/counselor letters | Important |
| interview | Admission interview | Considered |
| extracurricular | Activities outside classroom | Important |
| talent_ability | Special skills (music, art, athletics) | Considered |
| character_personal_qualities | Character, maturity, leadership | Important |
| first_generation | First in family to attend college | Considered |
| alumni_relation | Legacy status | Considered |
| geographical_residence | State/region diversity | Considered |
| state_residency | In-state vs out-of-state (public) | Very Important |
| religious_affiliation | Religious commitment (religious schools) | Varies |
| volunteer_work | Community service | Considered |
| work_experience | Paid employment | Considered |
| level_of_interest | Demonstrated interest (visits, emails) | Varies widely |

**Importance Definitions:**
- **Very Important**: Major factor in admission decisions
- **Important**: Significant consideration
- **Considered**: Reviewed but less weight
- **Not Considered**: Not factored into decisions

### early_admission
Early Decision (ED) and Early Action (EA) data.
```sql
CREATE TABLE early_admission (
    unitid INTEGER PRIMARY KEY,
    
    -- Early Decision (binding)
    ed_available BOOLEAN DEFAULT 0,
    ed_deadline TEXT,                 -- ISO date format 'YYYY-MM-DD'
    ed_notification TEXT,             -- ISO date format
    ed_applicants INTEGER,            -- Number of ED applicants
    ed_admits INTEGER,                -- Number admitted ED
    ed_admit_rate REAL,               -- ED admission rate
    ed_binding BOOLEAN DEFAULT 1,     -- Always binding
    
    -- Early Decision 2 (some schools offer)
    ed2_available BOOLEAN DEFAULT 0,
    ed2_deadline TEXT,
    ed2_notification TEXT,
    
    -- Early Action (non-binding)
    ea_available BOOLEAN DEFAULT 0,
    ea_deadline TEXT,
    ea_notification TEXT,
    ea_applicants INTEGER,
    ea_admits INTEGER,
    ea_admit_rate REAL,
    ea_restrictive BOOLEAN DEFAULT 0, -- Restrictive/Single-Choice EA
    
    -- Regular Decision
    rd_deadline TEXT,
    rd_notification TEXT,
    
    -- Rolling Admission
    rolling_admission BOOLEAN DEFAULT 0,
    
    data_year INTEGER,
    last_updated TEXT,
    
    FOREIGN KEY (unitid) REFERENCES schools(unitid) ON DELETE CASCADE,
    CHECK (ed_admit_rate >= 0 AND ed_admit_rate <= 1),
    CHECK (ea_admit_rate >= 0 AND ea_admit_rate <= 1)
);
```

**Application Round Notes:**
- **Early Decision**: Binding commitment, typically 15-20% higher acceptance rate
- **Early Decision 2**: Second ED round for students deferred/rejected from ED1
- **Early Action**: Non-binding, get decision early
- **Restrictive EA**: Can only apply EA to one school (but non-binding)
- **Regular Decision**: Standard application round
- **Rolling**: Applications reviewed as received, no fixed deadline

**ED Advantage Calculation:**
```javascript
// Typical ED boost in acceptance probability
function calculateEDAdvantage(school) {
  if (!school.ed_available) return 0;
  
  const rdRate = school.admit_rate;
  const edRate = school.ed_admit_rate;
  
  // ED typically 1.5-2x better odds
  return edRate / rdRate;
}
```

### school_notes
Manually curated intelligence and policy information.
```sql
CREATE TABLE school_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unitid INTEGER NOT NULL,
    category TEXT NOT NULL,           -- Note category
    subcategory TEXT,                 -- Optional subcategory
    content TEXT NOT NULL,            -- The actual note/information
    source TEXT,                      -- URL or 'manual' or 'counselor'
    confidence TEXT DEFAULT 'verified', -- Confidence level
    date_added TEXT NOT NULL,         -- ISO date
    date_verified TEXT,               -- Last verification date
    added_by TEXT,                    -- 'admin', 'counselor', specific user
    
    FOREIGN KEY (unitid) REFERENCES schools(unitid) ON DELETE CASCADE,
    CHECK (confidence IN ('verified', 'likely', 'rumored', 'outdated'))
);

CREATE INDEX idx_notes_unitid ON school_notes(unitid);
CREATE INDEX idx_notes_category ON school_notes(category);
CREATE INDEX idx_notes_confidence ON school_notes(confidence);
```

**Note Categories:**

**demonstrated_interest**
```
Examples:
- "Tracks campus visits, interviews, and email engagement"
- "Does not consider demonstrated interest"
- "Recommends visiting campus before applying"
```

**major_declaration**
```
Examples:
- "Direct admission to engineering required at application"
- "Students apply to specific school within university"
- "All students admitted undeclared, declare sophomore year"
- "Competitive declaration for CS major after freshman year"
```

**yield_protection**
```
Examples:
- "Known to waitlist overqualified applicants"
- "Demonstrated interest critical for high-stat applicants"
- "Less likely to admit students with significantly higher stats"
```

**application_tips**
```
Examples:
- "Supplemental essays are critical"
- "Interview highly recommended for borderline candidates"
- "Common App activities list heavily weighted"
```

**financial_aid_notes**
```
Examples:
- "Does not meet full need for international students"
- "Merit aid typically requires separate application"
- "Known for strong financial aid for middle class"
```

**special_programs**
```
Examples:
- "Honors college requires separate application by Dec 1"
- "Direct admit to medical school for qualified students"
- "5-year BS/MS program available"
```

**transfer_policies**
```
Examples:
- "Competitive transfer to engineering (15% acceptance)"
- "Community college articulation agreements"
- "Must have 30 credits to transfer"
```

### major_categories
Lookup table for CIP code human-readable names.
```sql
CREATE TABLE major_categories (
    cip_code TEXT PRIMARY KEY,        -- '11', '14', '26', etc.
    category_name TEXT NOT NULL,      -- 'Computer Science', 'Engineering'
    description TEXT,                 -- Brief description
    common_careers TEXT,              -- Comma-separated career paths
    avg_starting_salary INTEGER,     -- National average for category
    growth_outlook TEXT               -- 'High', 'Medium', 'Low' growth
);
```

**Sample Data:**
```sql
INSERT INTO major_categories VALUES
('11', 'Computer & Information Sciences', 
 'Study of computers, algorithms, and information processing',
 'Software Engineer, Data Scientist, Systems Analyst',
 75000, 'High'),
 
('14', 'Engineering',
 'Application of science and math to design and build structures, machines, and systems',
 'Mechanical Engineer, Electrical Engineer, Civil Engineer',
 70000, 'High'),
 
('26', 'Biological & Biomedical Sciences',
 'Study of living organisms and life processes',
 'Research Scientist, Biotechnologist, Healthcare Professional',
 50000, 'Medium');
```

## Common Query Patterns

### Find schools by major with good admission odds
```sql
SELECT s.*, p.program_name
FROM schools s
JOIN programs p ON s.unitid = p.unitid
WHERE p.cip_2digit = '11'  -- Computer Science
  AND s.admit_rate > 0.30
  AND s.sat_math_25 <= 700  -- Student's SAT math
  AND s.sat_math_75 >= 650
ORDER BY s.admit_rate DESC
LIMIT 20;
```

### Calculate net price for student's income bracket
```sql
SELECT 
    name,
    state,
    CASE 
        WHEN :income < 30000 THEN net_price_0_30k
        WHEN :income < 48000 THEN net_price_30_48k
        WHEN :income < 75000 THEN net_price_48_75k
        WHEN :income < 110000 THEN net_price_75_110k
        ELSE net_price_110k_plus
    END as estimated_net_price,
    cost_attendance
FROM schools
WHERE estimated_net_price IS NOT NULL
  AND estimated_net_price <= :max_budget
ORDER BY estimated_net_price;
```

### Find schools with strong programs in specific field
```sql
SELECT s.*, pr.rank, pr.score
FROM schools s
JOIN program_rankings pr ON s.unitid = pr.unitid
WHERE pr.cip_2digit = '14'  -- Engineering
  AND pr.ranking_source = 'US News'
  AND pr.rank <= 50
  AND s.state = 'CA'
ORDER BY pr.rank;
```

### Get complete school profile
```sql
SELECT 
    s.*,
    GROUP_CONCAT(DISTINCT p.program_name) as programs,
    COUNT(DISTINCT p.id) as program_count
FROM schools s
LEFT JOIN programs p ON s.unitid = p.unitid
WHERE s.unitid = :school_id
GROUP BY s.unitid;
```

### Find schools with specific admission factors importance
```sql
SELECT s.name, s.state, af.factor, af.importance
FROM schools s
JOIN admission_factors af ON s.unitid = af.unitid
WHERE af.factor = 'demonstrated_interest'
  AND af.importance = 'Very Important'
ORDER BY s.admit_rate;
```

### Schools with ED advantage
```sql
SELECT 
    s.name,
    s.admit_rate as regular_rate,
    ea.ed_admit_rate,
    (ea.ed_admit_rate - s.admit_rate) as ed_advantage
FROM schools s
JOIN early_admission ea ON s.unitid = ea.unitid
WHERE ea.ed_available = 1
  AND ea.ed_admit_rate > s.admit_rate * 1.2  -- At least 20% higher
ORDER BY ed_advantage DESC;
```

## Data Completeness Scoring

### Completeness Score Algorithm
```javascript
function calculateCompletenessScore(school) {
  const weights = {
    // Critical admission data (40%)
    hasAdmitRate: 10,
    hasSATScores: 10,
    hasACTScores: 5,
    hasTestPolicy: 5,
    hasYieldRate: 5,
    hasAdmissionFactors: 5,
    
    // Financial data (30%)
    hasCostData: 10,
    hasNetPrices: 15,
    hasMeritAidInfo: 5,
    
    // Outcome data (20%)
    hasRetentionRate: 5,
    hasGraduationRates: 10,
    hasEarningsData: 5,
    
    // Academic data (10%)
    hasFacultyRatio: 3,
    hasClassSizes: 3,
    hasProgramData: 4
  };
  
  let score = 0;
  
  if (school.admit_rate !== null) score += weights.hasAdmitRate;
  if (school.sat_math_25 && school.sat_math_75) score += weights.hasSATScores;
  // ... check all fields
  
  return Math.round(score);
}
```

## Data Update Process

### Annual Update Workflow
1. **Fetch College Scorecard** (September, when new data released)
```bash
   python pipeline/scripts/fetch_scorecard.py
```

2. **Download IPEDS** (October, when finalized)
```bash
   python pipeline/scripts/fetch_ipeds.py
```

3. **Scrape CDS** (November-December, as schools publish)
```bash
   python pipeline/scripts/scrape_cds.py
```

4. **Merge and Clean**
```bash
   python pipeline/scripts/merge_and_clean.py
```

5. **Build Database**
```bash
   python pipeline/scripts/build_database.py
   # Output: colleges_v2024_11.db
```

6. **Validate**
   - Check completeness scores
   - Validate referential integrity
   - Test common queries
   - Compare to previous version

7. **Deploy**
   - Upload to CDN
   - Update version number in app
   - Test download and initialization

### Quarterly Updates
- Minor fixes and corrections
- New school notes from counselor feedback
- Updated policy changes (test-optional, etc.)
- Incremental version: v2024_11_1, v2024_11_2

## Data Quality Checks

### Validation Rules
```sql
-- Check for orphaned programs
SELECT COUNT(*) FROM programs p
LEFT JOIN schools s ON p.unitid = s.unitid
WHERE s.unitid IS NULL;

-- Check for invalid rates (should be 0-1)
SELECT COUNT(*) FROM schools
WHERE admit_rate < 0 OR admit_rate > 1;

-- Check for impossible SAT scores
SELECT COUNT(*) FROM schools
WHERE sat_math_25 > sat_math_75
   OR sat_ebrw_25 > sat_ebrw_75;

-- Check for missing critical data
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN admit_rate IS NULL THEN 1 ELSE 0 END) as missing_admit_rate,
    SUM(CASE WHEN cost_attendance IS NULL THEN 1 ELSE 0 END) as missing_cost
FROM schools;
```

### Data Quality Metrics
```javascript
const qualityMetrics = {
  totalSchools: 6000,
  targetCompleteness: 80,  // Average completeness score
  criticalFieldCoverage: {
    admitRate: 95,           // % of schools with data
    testScores: 85,
    costData: 98,
    netPrices: 80,
    graduationRates: 90
  }
};
```

## Database Versioning

### Version Format
`vYYYY_MM[_PATCH]`
- **YYYY**: Year (e.g., 2024)
- **MM**: Month (e.g., 11 for November)
- **PATCH**: Optional patch number for minor updates

### Version Metadata Table
```sql
CREATE TABLE database_metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

INSERT INTO database_metadata VALUES
('version', '2024.11'),
('build_date', '2024-11-15'),
('scorecard_year', '2023'),
('ipeds_year', '2023'),
('total_schools', '6247'),
('avg_completeness', '82.3');
```

## File Size Optimization

### Compression Strategies
- Use INTEGER instead of TEXT for numeric values
- Index only frequently queried columns
- Normalize repeated strings (state names, categories)
- Remove unnecessary whitespace from TEXT fields
- VACUUM database after building

### Expected Sizes
- Uncompressed: ~35MB
- SQLite optimized: ~25MB
- Gzip compressed: ~15MB
- Served to users: 15MB (compressed in transit)

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Next Review**: Before database build process begins  
**Maintained By**: Data Team