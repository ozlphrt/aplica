# Development Phases & Implementation Roadmap

## Overview
This document outlines the complete development process for Aplica from initial setup to MVP launch. Each phase includes specific tasks, dependencies, success criteria, and estimated timelines.

**Total Estimated Timeline:** 12 weeks (3 months)  
**Development Approach:** Iterative, with working features at end of each phase  
**Testing Strategy:** Continuous testing throughout, formal testing in Phase 6

---

## Phase 0: Setup & Infrastructure (Week 1)

### Goals
- Development environment configured
- Core technologies installed and verified
- Project structure established
- Version control initialized

### Tasks

#### 0.1: Project Initialization
```bash
# Create React + Vite project
npm create vite@latest aplica -- --template react
cd aplica
npm install

# Install core dependencies
npm install react-router-dom zustand sql.js
npm install tailwindcss postcss autoprefixer
npm install lucide-react recharts
npm install -D @tailwindcss/forms

# Initialize Tailwind
npx tailwindcss init -p
```

#### 0.2: Configure Tailwind & Design System
- Set up `tailwind.config.js` with custom colors
- Create `globals.css` with base styles
- Test responsive breakpoints

#### 0.3: Project Structure
```
src/
  components/
    student/
    results/
    details/
    shared/
    ui/
  lib/
  stores/
  utils/
  hooks/
  styles/
  data/
```

#### 0.4: Git Repository
```bash
git init
git add .
git commit -m "Initial project setup"
# Create GitHub repository and push
```

#### 0.5: Setup Data Pipeline Environment
```bash
# Create Python virtual environment
cd pipeline
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install requests pandas sqlite3 beautifulsoup4 lxml
```

### Success Criteria
- ✅ App runs on `localhost` with Vite dev server
- ✅ Tailwind classes work correctly
- ✅ Project structure matches specification
- ✅ Python environment ready for data work

### Deliverables
- Working development environment
- Project repository on GitHub
- README with setup instructions

---

## Phase 1: Data Pipeline & Database (Weeks 2-3)

### Goals
- Fetch data from College Scorecard API
- Download and process IPEDS data
- Build SQLite database with complete schema
- Validate data quality

### Tasks

#### 1.1: College Scorecard Data Fetch
**File:** `pipeline/scripts/fetch_scorecard.py`
```python
# Cursor prompt:
"""
Create a Python script to fetch college data from the College Scorecard API.
Use API key: X31ro6MZh8qeLHAncmv1cie0BUBJIezbytNCfGea
Fetch all 4-year institutions with required fields:
- School identity (name, location, URL)
- Admissions data (rates, test scores)
- Financial data (cost, net prices)
- Outcomes (graduation, earnings)
Save to CSV in pipeline/raw/
"""
```

**Testing:**
- Verify ~6,000 schools fetched
- Check all expected fields present
- Validate data types

#### 1.2: IPEDS Data Integration
**File:** `pipeline/scripts/fetch_ipeds.py`
```python
# Cursor prompt:
"""
Download IPEDS datasets for:
- HD (Directory information)
- ADM (Admissions)
- SFA (Student Financial Aid)
- GR (Graduation Rates)
- C_A (Completions by program)

Process and merge with Scorecard data on UNITID.
Save merged data to pipeline/processed/
"""
```

#### 1.3: Database Schema Creation
**File:** `pipeline/scripts/build_database.py`
```python
# Cursor prompt:
"""
Create SQLite database with schema from DATA_SCHEMA.md.
Tables: schools, programs, program_rankings, admission_factors, 
        early_admission, school_notes, major_categories

Include all indexes for performance.
Populate with data from pipeline/processed/
Calculate completeness scores for each school.
Output: pipeline/output/colleges_v2024_11.db
"""
```

#### 1.4: Data Quality Validation
```python
# Cursor prompt:
"""
Create validation script that checks:
- Required fields completeness (admit_rate, cost_attendance)
- Data type correctness
- Value ranges (rates 0-1, SAT 400-1600, etc.)
- Referential integrity (foreign keys)
- Calculate and report completeness distribution
Generate data quality report.
"""
```

### Success Criteria
- ✅ Database file created (~20MB)
- ✅ All 6,000+ schools present
- ✅ Average completeness score >70%
- ✅ All validation checks pass
- ✅ Sample queries return expected results

### Deliverables
- `colleges_v2024_11.db` file
- Data quality report
- ETL pipeline scripts (reusable for updates)

### Testing Queries
```sql
-- Verify school count
SELECT COUNT(*) FROM schools;

-- Check data completeness
SELECT 
    AVG(completeness_score) as avg_completeness,
    MIN(completeness_score) as min_completeness,
    MAX(completeness_score) as max_completeness
FROM schools;

-- Test program links
SELECT COUNT(*) FROM programs WHERE unitid NOT IN (SELECT unitid FROM schools);

-- Sample data inspection
SELECT name, city, state, admit_rate, cost_attendance 
FROM schools 
WHERE state = 'CA' 
LIMIT 10;
```

---

## Phase 2: Core App Foundation (Week 4)

### Goals
- Basic app structure and routing
- Database loading in browser
- Layout components
- Navigation

### Tasks

#### 2.1: Database Integration
**File:** `src/lib/database.js`
```javascript
// Cursor prompt:
"""
Create database module using sql.js:
1. Load SQLite database from /data/colleges.db
2. Initialize on app startup
3. Provide query functions:
   - getSchools(filters)
   - getSchoolById(unitid)
   - getSchoolPrograms(unitid)
4. Error handling and loading states
5. Cache in IndexedDB for offline use
"""
```

#### 2.2: Database Context Provider
**File:** `src/lib/DatabaseProvider.jsx`
```javascript
// Cursor prompt:
"""
Create React context for database access:
- Load database on mount
- Provide db, loading, error states
- Wrap entire app
- Show loading spinner while database initializes
"""
```

#### 2.3: Routing Setup
**File:** `src/App.jsx`
```javascript
// Cursor prompt:
"""
Set up React Router with HashRouter:
Routes:
  / - Welcome page
  /profile - Student questionnaire
  /matches - Results list
  /college/:unitid - College detail page

Include shared Layout component.
"""
```

#### 2.4: Layout Components
**Files:** 
- `src/components/shared/Layout.jsx`
- `src/components/shared/Navigation.jsx`
```javascript
// Cursor prompt:
"""
Create Layout component with:
- Top navigation bar
- Mobile-responsive hamburger menu
- Main content area
- Footer

Navigation items:
- Home, Profile, Matches (conditional)
"""
```

### Success Criteria
- ✅ Database loads successfully in browser
- ✅ Routing works (all pages accessible)
- ✅ Navigation functional on mobile and desktop
- ✅ Can query database and display results

### Deliverables
- Working app shell with routing
- Database accessible throughout app
- Responsive navigation

---

## Phase 3: Student Profile Questionnaire (Weeks 5-6)

### Goals
- Complete adaptive questionnaire
- Profile state management
- Progress tracking
- Data persistence

### Tasks

#### 3.1: Profile Store
**File:** `src/stores/studentProfileStore.js`
```javascript
// Cursor prompt:
"""
Create Zustand store for student profile with:
- answers object (all question responses)
- completeness scores (tier 1, 2, 3, overall)
- Actions: setAnswer, clearProfile, calculateCompleteness
- Persist to localStorage
- Load from localStorage on mount
"""
```

#### 3.2: Question Flow Logic
**File:** `src/lib/questionnaire-logic.js`
```javascript
// Cursor prompt:
"""
Implement questionnaire logic from STUDENT_PROFILE.md:
- Define all questions (tier 1, 2, 3)
- Conditional branching rules
- Validation functions
- Calculate profile completeness
- Determine which questions to show based on answers
"""
```

#### 3.3: Question Components
**File:** `src/components/student/QuestionCard.jsx`
```javascript
// Cursor prompt:
"""
Create QuestionCard component that:
- Displays question based on type (number, select, radio, checkbox, currency)
- Handles validation
- Shows help text and errors
- Skip button (if applicable)
- Continue button
Dynamically renders input component based on question.component field.
"""
```

#### 3.4: Questionnaire Page
**File:** `src/pages/Profile.jsx`
```javascript
// Cursor prompt:
"""
Create Profile page with:
- Progress bar at top (sticky)
- Current question displayed
- Navigation between questions
- Save progress automatically
- "See Matches" button when Tier 1 complete
- Show tier completeness indicators
"""
```

#### 3.5: Progress Indicator
**File:** `src/components/student/ProgressIndicator.jsx`
```javascript
// Cursor prompt:
"""
Create progress component showing:
- Overall progress bar
- Tier 1, 2, 3 completion percentages
- Motivational message based on progress
- Visual indicators (checkmarks for completed tiers)
"""
```

### Success Criteria
- ✅ All questions display correctly
- ✅ Conditional logic works (questions show/hide appropriately)
- ✅ Validation prevents invalid inputs
- ✅ Progress persists on page reload
- ✅ Can complete questionnaire and reach 100%

### Deliverables
- Fully functional adaptive questionnaire
- Profile data persisted locally
- Smooth user experience with clear progress

### Testing Checklist
- [ ] Complete questionnaire from start to finish
- [ ] Test conditional questions (e.g., SAT score only if tests taken)
- [ ] Test validation (invalid GPA, SAT out of range)
- [ ] Refresh page mid-questionnaire (should resume)
- [ ] Test on mobile (touch interactions, keyboard)

---

## Phase 4: Matching Algorithm Implementation (Weeks 7-8)

### Goals
- Implement complete matching algorithm
- Generate school recommendations
- Calculate fit scores
- Build balanced lists

### Tasks

#### 4.1: Algorithm Core
**File:** `src/lib/matching-algorithm.js`
```javascript
// Cursor prompt:
"""
Implement matching algorithm from MATCHING_ALGORITHM.md:

Phase 1: Hard filters (program, geography, size, setting, deal-breakers)
Phase 2: Academic classification (reach/target/safety)
Phase 3: Financial assessment (net price, merit aid, affordability)
Phase 4: Fit scoring (academic, financial, environmental, outcomes)
Phase 5: Balanced list construction

Use constants from ALGORITHM_CONSTANTS.md.
Return object with: recommendedList, reaches, targets, safeties, warnings.
"""
```

#### 4.2: Financial Calculator
**File:** `src/lib/financial-calculator.js`
```javascript
// Cursor prompt:
"""
Create financial calculator module:
- estimateNetPrice(school, studentProfile)
- estimateMeritAid(school, studentProfile)
- assessFinancialFit(school, studentProfile)
- calculateFinancialFitScore(school, profile)

Use income brackets, in-state discounts, merit aid logic.
"""
```

#### 4.3: Matching Store
**File:** `src/stores/matchingStore.js`
```javascript
// Cursor prompt:
"""
Create Zustand store for matching results:
- matches: array of matched schools
- balance: reach/target/safety counts
- warnings: array of warning objects
- filters: current filter state
- sortBy: current sort option

Actions:
- generateMatches(studentProfile, db)
- updateFilters(newFilters)
- updateSort(sortOption)
"""
```

#### 4.4: Algorithm Testing
**File:** `src/lib/__tests__/matching-algorithm.test.js`
```javascript
// Cursor prompt:
"""
Create tests for matching algorithm:
- Test with diverse student profiles
- Verify academic classification accuracy
- Check financial calculations
- Ensure balanced list construction
- Validate warnings generation

Use test profiles from ALGORITHM_CONSTANTS.md.
"""
```

### Success Criteria
- ✅ Algorithm generates matches for all test profiles
- ✅ Lists are properly balanced (reach/target/safety)
- ✅ Financial assessment accurate within 20%
- ✅ Fit scores calculated correctly
- ✅ At least one financial safety included
- ✅ Appropriate warnings generated

### Deliverables
- Complete matching algorithm
- Financial calculator
- Test suite with passing tests
- Performance optimized (runs in <2 seconds)

### Test Cases
```javascript
// Test profile 1: High-achieving, need-based
const profile1 = {
  gpa: 3.9,
  sat_score: 1480,
  household_income: '48_75k',
  max_annual_budget: 25000,
  intended_majors: ['computer_science'],
  state_residence: 'CA',
};

// Expected: Mix of selective schools with strong financial aid
// Should include: UCs, privates that meet need, merit opportunities

// Test profile 2: Average student, budget-conscious
const profile2 = {
  gpa: 3.3,
  sat_score: 1150,
  household_income: '30_48k',
  max_annual_budget: 15000,
  intended_majors: ['business'],
  state_residence: 'TX',
};

// Expected: In-state publics, regional schools, community college pathway
// Must have: Affordable options, at least 2 financial safeties
```

---

## Phase 5: Results UI & Visualization (Weeks 9-10)

### Goals
- Display matched schools
- Visualize fit scores
- Show list balance
- Enable filtering and sorting

### Tasks

#### 5.1: College Card Component
**File:** `src/components/results/CollegeCard.jsx`
```javascript
// Cursor prompt:
"""
Create CollegeCard component from UI_COMPONENTS.md:
- School name, location, control
- Academic tier badge
- Overall fit score with progress bar
- Key stats grid (admission %, cost, size, setting)
- Warning banner if unaffordable
- Click to view details
Mobile-responsive, touch-friendly.
"""
```

#### 5.2: Fit Score Breakdown
**File:** `src/components/results/FitScoreBreakdown.jsx`
```javascript
// Cursor prompt:
"""
Create visualization of fit score breakdown:
- Bar chart showing 4 dimensions (academic, financial, environmental, outcomes)
- Score values and weights displayed
- Use Recharts
- Tooltips with explanations
- Mobile-responsive
"""
```

#### 5.3: List Balance Component
**File:** `src/components/results/ListBalance.jsx`
```javascript
// Cursor prompt:
"""
Create list balance visualization:
- Pie chart showing reach/target/safety distribution
- Counts for each tier
- Balance indicator (well-balanced vs needs adjustment)
- Recommendations if imbalanced
- Use Recharts
"""
```

#### 5.4: Results Page
**File:** `src/pages/Matches.jsx`
```javascript
// Cursor prompt:
"""
Create Matches page from UI_COMPONENTS.md:
- Header with match count
- Warning banners at top
- Sidebar with list balance and tier filters (sticky on desktop)
- Main area with college cards
- Filter by tier (all, reach, target, safety)
- Sort options (fit score, admission chance, cost)
- Responsive layout (stacked on mobile, sidebar on desktop)
"""
```

#### 5.5: Filter & Sort Panel
**File:** `src/components/results/FilterPanel.jsx`
```javascript
// Cursor prompt:
"""
Create filter panel (expandable on mobile):
- Academic tier filter (checkboxes)
- Cost range slider
- Location filter (by state/region)
- Size filter
- Setting filter
- Apply/Clear buttons
Updates matchingStore when applied.
"""
```

### Success Criteria
- ✅ All matched schools display correctly
- ✅ Fit scores visualized clearly
- ✅ List balance shown accurately
- ✅ Filtering works (updates list in real-time)
- ✅ Sorting works (by fit, admission %, cost)
- ✅ Responsive on all screen sizes
- ✅ Performance good with 50+ schools

### Deliverables
- Complete results page with all features
- Interactive visualizations
- Filtering and sorting functional
- Warning system working

---

## Phase 6: College Detail Page (Week 10)

### Goals
- Comprehensive school information
- Detailed fit analysis
- Financial breakdown
- Programs and outcomes

### Tasks

#### 6.1: College Detail Layout
**File:** `src/pages/CollegeDetail.jsx`
```javascript
// Cursor prompt:
"""
Create college detail page from UI_COMPONENTS.md:
- Hero section (name, location, academic tier)
- Quick stats (admission rate, cost, size, grad rate)
- Tabbed content:
  - Overview: Fit scores, campus info
  - Admissions: Stats, your chances, requirements
  - Financial: Cost breakdown, aid estimation
  - Programs: Available majors, rankings
  - Outcomes: Grad rates, employment, earnings
Responsive, mobile-friendly tabs.
"""
```

#### 6.2: Admissions Profile Component
**File:** `src/components/details/AdmissionsProfile.jsx`
```javascript
// Cursor prompt:
"""
Create admissions profile display:
- Acceptance rate
- Test score ranges (25th-75th percentile)
- Your positioning (where you fall in range)
- Visual representation (scatter plot or bar chart)
- Admission probability estimate
- ED/EA availability and rates
- Important admission factors (from admission_factors table)
"""
```

#### 6.3: Financial Breakdown Component
**File:** `src/components/details/FinancialBreakdown.jsx`
```javascript
// Cursor prompt:
"""
Create detailed financial breakdown:
- Sticker price
- Estimated net price for your income
- Merit aid likelihood and estimated amount
- 4-year total cost estimate
- Comparison to your budget
- Financial aid policies (meets need, etc.)
- Cost breakdown chart (tuition, room/board, other)
"""
```

#### 6.4: Programs List Component
**File:** `src/components/details/ProgramsList.jsx`
```javascript
// Cursor prompt:
"""
Display programs offered:
- List of majors by category
- Highlight student's intended majors
- Show program rankings if available
- Annual completions (popularity indicator)
- Degree levels offered
- Search/filter functionality
"""
```

#### 6.5: Outcomes Metrics Component
**File:** `src/components/details/OutcomesMetrics.jsx`
```javascript
// Cursor prompt:
"""
Show outcomes data:
- Retention rate (visual indicator)
- 4-year and 6-year graduation rates
- Median earnings (6-year, 10-year)
- Employment rate
- Comparison to similar schools
- ROI calculation
- Charts showing trends
"""
```

### Success Criteria
- ✅ All school data displays correctly
- ✅ Tabs work smoothly (client-side routing)
- ✅ Financial estimates accurate
- ✅ Your positioning clearly visualized
- ✅ Programs searchable and filterable
- ✅ Responsive on mobile

### Deliverables
- Complete college detail page
- All sub-components functional
- Rich data visualization
- Mobile-optimized experience

---

## Phase 7: Polish & Optimization (Week 11)

### Goals
- Performance optimization
- Error handling
- Accessibility improvements
- PWA features
- Cross-browser testing

### Tasks

#### 7.1: Performance Optimization
```javascript
// Tasks:
- Implement React.lazy for code splitting
- Optimize database queries (use indexes)
- Memoize expensive calculations
- Optimize re-renders (React.memo, useMemo)
- Compress database file
- Enable gzip compression on hosting
```

**Target Metrics:**
- Initial load: <3 seconds
- Time to interactive: <5 seconds
- Database load: <2 seconds
- Matching algorithm: <2 seconds
- Lighthouse performance score: >90

#### 7.2: Error Handling
```javascript
// Cursor prompt:
"""
Implement comprehensive error handling:
- Error boundaries for each major section
- Database loading errors (show retry button)
- Network errors (for data updates)
- Invalid profile data (validation errors)
- User-friendly error messages
- Error logging (console for MVP)
"""
```

#### 7.3: Accessibility (WCAG 2.1 AA)
```javascript
// Checklist:
- Keyboard navigation (tab order, focus indicators)
- Screen reader compatibility (ARIA labels)
- Color contrast ratios (4.5:1 for text)
- Form labels and error associations
- Skip links
- Focus management (modals, navigation)
- Test with screen reader (VoiceOver, NVDA)
```

#### 7.4: PWA Features
**File:** `vite.config.js` + `public/manifest.json`
```javascript
// Cursor prompt:
"""
Configure PWA with vite-plugin-pwa:
- Service worker for offline caching
- App manifest (name, icons, theme)
- Install prompt
- Cache strategies:
  - App shell: cache-first
  - Database: cache-first with background update
  - API calls: network-first
Icons: 192x192, 512x512
"""
```

#### 7.5: Cross-Browser Testing
```
Test browsers:
- Chrome (primary)
- Safari (iOS, macOS)
- Firefox
- Edge

Test devices:
- iPhone (Safari)
- Android phone (Chrome)
- iPad (Safari)
- Desktop (all browsers)

Focus areas:
- Layout consistency
- Touch interactions
- Form inputs (especially on mobile)
- Database loading
- Navigation
```

### Success Criteria
- ✅ Lighthouse scores: Performance >90, Accessibility >90, Best Practices >90
- ✅ Works offline (after initial load)
- ✅ No console errors
- ✅ Keyboard navigation complete
- ✅ Screen reader friendly
- ✅ Works on all test browsers/devices

### Deliverables
- Optimized app (fast loading, smooth interactions)
- PWA installable on mobile
- Accessible to users with disabilities
- Cross-browser compatible

---

## Phase 8: Testing & Bug Fixes (Week 12)

### Goals
- Comprehensive testing
- Bug identification and fixes
- User acceptance testing
- Documentation

### Tasks

#### 8.1: Functional Testing
**Test Plans:**

**Questionnaire Testing**
- [ ] Complete questionnaire from start to finish
- [ ] Test all question types (number, select, radio, checkbox, currency)
- [ ] Verify conditional logic (questions appear/disappear correctly)
- [ ] Test validation (invalid inputs rejected)
- [ ] Test skip functionality (Tier 2/3 questions)
- [ ] Test progress persistence (refresh mid-questionnaire)
- [ ] Test edit functionality (go back and change answers)

**Matching Algorithm Testing**
- [ ] Test with 10+ diverse student profiles
- [ ] Verify academic classification (reach/target/safety)
- [ ] Check financial calculations accuracy
- [ ] Confirm list balance (proper distribution)
- [ ] Validate warnings (generated appropriately)
- [ ] Test edge cases (extreme budgets, perfect scores, etc.)

**Results Page Testing**
- [ ] All matched schools display
- [ ] Filtering works (by tier, cost, location, etc.)
- [ ] Sorting works (fit score, admission %, cost)
- [ ] Fit score visualizations accurate
- [ ] List balance chart correct
- [ ] Warnings display properly
- [ ] Click to detail page works

**Detail Page Testing**
- [ ] All school data displays correctly
- [ ] Tabs work (Overview, Admissions, Financial, Programs, Outcomes)
- [ ] Financial estimates reasonable
- [ ] Admissions profile accurate
- [ ] Programs list complete
- [ ] Outcomes metrics display

#### 8.2: User Acceptance Testing
**Recruit 5-10 Test Users:**
- High school students (current juniors/seniors)
- Parents
- School counselors

**Tasks for Users:**
1. Complete profile questionnaire
2. Review matched schools
3. Explore detail pages
4. Provide feedback on:
   - Ease of use
   - Clarity of information
   - Match quality
   - Missing features
   - Bugs encountered

**Feedback Collection:**
- Google Form survey
- Screen recordings (with permission)
- Follow-up interviews

#### 8.3: Bug Tracking & Fixes
**Setup Bug Tracker:**
- Use GitHub Issues
- Label priority: Critical, High, Medium, Low
- Assign to sprints

**Common Bug Categories:**
- UI layout issues
- Calculation errors
- Data loading problems
- Navigation bugs
- Mobile-specific issues

**Bug Fix Process:**
1. Reproduce bug
2. Document steps to reproduce
3. Fix and test
4. Deploy to test environment
5. Verify fix
6. Close issue

#### 8.4: Documentation
**Create Documentation:**

**README.md**
```markdown
# Aplica
**Apply with clarity**

## For Users
- What the app does
- How to use it
- Privacy policy
- Contact/feedback

## For Developers
- Setup instructions
- Project structure
- Key technologies
- Development workflow
- Deployment process
```

**CONTRIBUTING.md** (if open source)
```markdown
- How to contribute
- Code style guide
- Pull request process
- Issue reporting
```

**CHANGELOG.md**
```markdown
# Changelog

## v1.0.0 (2024-11-XX)
### Features
- Adaptive student questionnaire
- Comprehensive matching algorithm
- Interactive results visualization
- Detailed college profiles

### Data
- 6,000+ US colleges
- College Scorecard + IPEDS data
- 2023-2024 admission cycle
```

### Success Criteria
- ✅ All critical bugs fixed
- ✅ High/medium bugs addressed or documented for future
- ✅ User feedback positive (>4/5 average rating)
- ✅ Documentation complete
- ✅ Ready for production deployment

### Deliverables
- Bug-free (or minimal known issues) app
- User testing feedback report
- Complete documentation
- Deployment-ready codebase

---

## Deployment (Post-Week 12)

### Hosting Options

#### Option 1: GitHub Pages (Recommended for MVP)
**Pros:** Free, simple, automatic deploys
**Cons:** Static only (no backend), GitHub dependency

**Steps:**
```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# Deploy
npm run deploy
```

**Database Hosting:**
- Host `colleges.db` on GitHub Releases
- Or use GitHub Pages itself (as static file)
- Update path in code to CDN URL

#### Option 2: Vercel
**Pros:** Excellent performance, easy deploys, preview deployments
**Cons:** None for this use case

**Steps:**
1. Connect GitHub repository to Vercel
2. Configure build settings (Vite)
3. Deploy automatically on push to main
4. Host database file in public/ folder or external CDN

#### Option 3: Netlify
**Pros:** Similar to Vercel, good CDN
**Cons:** None for this use case

### Database Updates

**Quarterly Update Process:**
1. Run data pipeline scripts
2. Generate new database file with version number
3. Upload to hosting (GitHub Releases or CDN)
4. Update app to reference new version
5. Clear service worker cache (force update)

### Analytics (Optional)

**Privacy-Respecting Analytics:**
- Plausible Analytics (paid but privacy-focused)
- Simple Analytics
- Self-hosted Matomo

**Metrics to Track:**
- Page views
- Questionnaire completion rate
- Average matches generated
- Popular filters/sorts
- Device breakdown (mobile vs desktop)

---

## Post-MVP Enhancements (Future Phases)

### Phase 9: Counselor Features (Future)
- Counselor dashboard
- Student management
- Override recommendations
- Notes and tracking
- Export functionality

### Phase 10: Enhanced Data (Future)
- Common Data Set scraping (top 500 schools)
- ED/EA acceptance rates
- Demonstrated interest flags
- School-specific application tips
- More program ranking sources

### Phase 11: User Accounts (Future)
- Optional account creation
- Save multiple profiles
- Track application progress
- Share lists with counselors/parents
- Comparison tools

### Phase 12: Advanced Features (Future)
- AI-powered essay suggestions
- Application timeline management
- Scholarship matching
- Virtual campus tours integration
- Alumni network connections

---

## Risk Management

### Technical Risks

**Risk:** Database too large for browser
**Mitigation:** 
- Compress database aggressively
- Lazy load non-critical data
- Use IndexedDB for storage
**Status:** Mitigated (tested at 20MB, acceptable)

**Risk:** Algorithm too slow
**Mitigation:**
- Optimize queries with indexes
- Memoize expensive calculations
- Use web workers if needed
**Status:** Mitigated (runs in <2 seconds)

**Risk:** Mobile performance issues
**Mitigation:**
- Mobile-first design
- Test on real devices early
- Progressive enhancement
**Status:** Monitoring

### Data Risks

**Risk:** API changes or discontinuation
**Mitigation:**
- Download and store data locally
- Document data sources thoroughly
- Plan for manual updates if needed
**Status:** Mitigated

**Risk:** Data accuracy issues
**Mitigation:**
- Validate data programmatically
- Completeness scoring
- User feedback mechanism
- Regular updates
**Status:** Ongoing monitoring

### User Risks

**Risk:** Users over-rely on algorithm
**Mitigation:**
- Clear disclaimers
- Encourage counselor review
- Provide reasoning for recommendations
- Education about admission uncertainty
**Status:** Addressed in UI

**Risk:** Financial estimates inaccurate
**Mitigation:**
- Use ranges, not point estimates
- Clear disclaimers about estimates
- Link to net price calculators
- Conservative assumptions
**Status:** Mitigated

---

## Success Metrics (3 Months Post-Launch)

### Usage Metrics
- **Target:** 500+ users complete questionnaire
- **Target:** 1,000+ sessions
- **Target:** 70%+ questionnaire completion rate
- **Target:** 50%+ return to view matches

### Quality Metrics
- **Target:** >80% users satisfied with matches (survey)
- **Target:** <5% report major bugs
- **Target:** >4/5 average rating
- **Target:** 90%+ of lists properly balanced

### Technical Metrics
- **Target:** <3 second initial load time
- **Target:** <5 second time to interactive
- **Target:** >95% uptime
- **Target:** <1% error rate

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 0: Setup | 1 week | Dev environment, project structure |
| 1: Data | 2 weeks | Database with 6,000+ schools |
| 2: Foundation | 1 week | App shell, routing, database loading |
| 3: Questionnaire | 2 weeks | Complete adaptive questionnaire |
| 4: Algorithm | 2 weeks | Matching algorithm, fit scoring |
| 5: Results UI | 2 weeks | Results page, visualizations |
| 6: Detail Page | 1 week | College detail page |
| 7: Polish | 1 week | Optimization, PWA, accessibility |
| 8: Testing | 1 week | User testing, bug fixes |
| **Total** | **12 weeks** | **Production-ready MVP** |

---

## Development Best Practices

### With Cursor AI

**Effective Prompting:**
- Reference specific markdown files: "Following DATA_SCHEMA.md..."
- Be specific about requirements
- Include expected behavior and edge cases
- Request error handling explicitly
- Ask for tests when appropriate

**Example Prompt:**
```
Following MATCHING_ALGORITHM.md, implement the academic classification 
function that determines reach/target/safety based on student SAT scores 
relative to school's 25th-75th percentile range. Use constants from 
ALGORITHM_CONSTANTS.md. Include edge case handling for test-optional 
schools. Add JSDoc comments.
```

### Code Review Checklist
- [ ] Follows patterns in markdown specs
- [ ] Uses constants from ALGORITHM_CONSTANTS.md
- [ ] Includes error handling
- [ ] Mobile-responsive
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Performance optimized
- [ ] No console errors
- [ ] Tested on multiple browsers

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/questionnaire-ui
# ... make changes ...
git commit -m "feat: implement adaptive questionnaire UI"
git push origin feature/questionnaire-ui
# Create PR, review, merge
```

**Commit Message Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `style:` Formatting, no code change
- `docs:` Documentation only
- `test:` Adding tests
- `chore:` Maintenance tasks

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Project Status**: Planning Phase  
**Next Milestone**: Phase 0 completion  
**Maintained By**: Project Lead