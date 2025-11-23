# Aplica - Project Overview
**Apply with clarity**

## Purpose
Data-driven college matching application to help students, parents, and counselors find best-fit schools based on comprehensive academic, financial, and personal fit criteria.

## Target Users

### Primary Users
- **High school juniors and seniors** exploring college options
- **Parents** helping their children navigate the college search process

### Secondary Users
- **Overloaded high school counselors** managing large student caseloads
- **Inexperienced counselors** new to college admissions guidance

### Goal
Make inexperienced and overloaded counselors as effective as expensive, experienced independent counselors through data-driven recommendations and algorithmic support.

## Core Features (MVP)

### 1. Adaptive Student Profile Questionnaire
- Three-tier question system (critical → important → refinement)
- Conditional branching based on previous answers
- Progressive disclosure to avoid overwhelming users
- Profile completeness tracking and motivation

### 2. Comprehensive College Database
- 6,000+ US four-year institutions
- Admissions statistics (acceptance rates, test score ranges)
- Financial data (net prices by income bracket, merit aid patterns)
- Programs offered and strength indicators
- Outcome metrics (graduation rates, career earnings)
- Curated intelligence on policies and special considerations

### 3. Multi-Factor Matching Algorithm
- **Academic fit**: GPA, test scores, course rigor, admission probability
- **Financial fit**: Net price estimation, merit aid likelihood, affordability assessment
- **Environmental fit**: Size, setting, location, campus culture
- **Outcomes fit**: Graduation rates, career placement, alumni networks

### 4. Balanced College List Generation
- **Reach schools** (2-3): Below 25th percentile, competitive admission
- **Target schools** (4-5): Within middle 50% range, reasonable probability
- **Safety schools** (2-3): Above 75th percentile, high acceptance rate
- **Financial safety**: At least one guaranteed affordable option
- Automatic list balance validation and warnings

### 5. Financial Viability Assessment
- Income-based net price estimation using College Scorecard data
- In-state vs. out-of-state cost differentiation
- Merit aid probability based on student academic positioning
- Gap analysis (estimated cost vs. budget)
- Clear affordability flags for each school

### 6. Fit Scoring System
- Multi-dimensional scoring across all fit criteria
- Weighted composite scores balancing all factors
- Transparent score breakdowns showing why schools match
- Comparison tools to evaluate trade-offs between schools

## Success Criteria

### Recommendation Quality
- Generate properly balanced lists (proper reach/target/safety distribution)
- No unaffordable schools recommended (financial reality check)
- High relevance of program offerings to student interests
- Strong alignment with stated preferences and priorities

### User Satisfaction
- Students find schools they hadn't considered but fit well
- Parents understand financial reality before application
- Counselors validate or improve upon algorithmic recommendations
- Reduction in "surprise" rejections or financial aid disappointments

### Better Outcomes
- More informed college decisions than generic search tools
- Higher application success rates (acceptances to applications ratio)
- Better financial fit (fewer students unable to afford admitted schools)
- Increased student satisfaction with final enrollment choice

## Non-Goals (Out of Scope for MVP)

### Features Explicitly Excluded
- ❌ User accounts and authentication
- ❌ Essay writing assistance or review
- ❌ Application deadline tracking and reminders
- ❌ Multi-user collaboration (counselor-student-parent coordination)
- ❌ Separate parent vs. student views with different permissions
- ❌ Document storage (transcripts, essays, recommendation letters)
- ❌ College application submission or status tracking
- ❌ Scholarship search and matching
- ❌ Campus visit planning and scheduling
- ❌ Direct messaging with colleges or counselors
- ❌ Peer comparison or social features
- ❌ SAT/ACT prep or practice tests

### Rationale
MVP focuses exclusively on the college search and list-building phase. Application management and collaboration features can be added in future iterations based on user feedback and demand.

## Technical Approach

### Architecture
- **Progressive Web App (PWA)**: Mobile-first, installable, works offline
- **Local-first data**: SQLite database runs entirely in browser
- **No backend required**: Eliminates infrastructure costs and complexity
- **Static hosting**: Deploy to GitHub Pages, Vercel, or Netlify
- **Periodic updates**: Download new database versions when available

### Data Strategy
- **Primary source**: College Scorecard API (US Department of Education)
- **Enhancement**: IPEDS data for additional institutional details
- **Manual curation**: Common Data Set information for top 500 schools
- **Update frequency**: Annual major updates, quarterly minor updates
- **Database size**: ~20MB compressed, acceptable for modern mobile devices

### User Data
- **Storage**: Browser localStorage for student profiles
- **Privacy**: All data stays on user's device
- **Portability**: Export/import capability for sharing with counselors
- **No tracking**: No analytics or user behavior monitoring in MVP

## Development Philosophy

### Build for Real Users
- Prioritize accuracy over novelty
- Clear communication over jargon
- Practical guidance over theoretical perfection
- Data-driven insights over opinions

### Respect User Context
- Mobile-first (students use phones extensively)
- Low-friction onboarding (start using immediately)
- Progressive complexity (simple start, depth available)
- Graceful degradation (works without complete data)

### Enable Better Decisions
- Transparent reasoning (show why recommendations made)
- Multiple perspectives (academic, financial, fit, outcomes)
- Honest assessment (realistic chances, not false hope)
- Actionable insights (what to do next, not just information)

## Success Metrics (Post-Launch)

### Usage Metrics
- Profile completion rate (% who finish tier 1 questions)
- Time to first recommendation (how quickly users get value)
- List modification rate (how often users adjust algorithmic results)
- Return visit rate (do users come back to refine searches)

### Quality Metrics
- Recommendation diversity (are we showing unexpected but good fits?)
- Financial accuracy (do estimated costs match actual aid offers?)
- Balance validation (what % of lists need rebalancing?)
- User satisfaction scores (if we add feedback mechanism)

### Outcome Metrics (Long-term)
- Application success rate (acceptances per application)
- Financial fit outcomes (can students afford admitted schools?)
- Enrollment satisfaction (happy with final choice?)
- Counselor adoption rate (do counselors recommend the tool?)

## Timeline Expectations

### MVP Development
- **Weeks 1-3**: Data pipeline and database construction
- **Weeks 4-5**: App foundation and routing
- **Weeks 6-7**: Adaptive questionnaire implementation
- **Weeks 8-9**: Matching algorithm and scoring
- **Weeks 10-11**: Results display and visualization
- **Week 12**: Testing, refinement, deployment

### Post-MVP Priorities
1. Counselor dashboard and override capabilities
2. Enhanced data curation (more CDS integration)
3. Improved financial aid modeling
4. User feedback and rating system
5. Export/sharing functionality enhancements

## Risk Factors

### Data Quality Risks
- **Incomplete data**: Not all schools provide complete information
- **Lagging data**: 1-2 year delay in some official statistics
- **Changing policies**: Schools modify admissions criteria between updates
- **Mitigation**: Completeness scoring, clear data age indicators, conservative estimates

### Algorithm Risks
- **Oversimplification**: Can't capture every nuance of admissions
- **False precision**: Probability estimates are estimates, not guarantees
- **Changing landscape**: Test-optional policies shift statistical meaning
- **Mitigation**: Clear disclaimers, range estimates, counselor override capability

### User Experience Risks
- **Analysis paralysis**: Too many options can overwhelm
- **Over-reliance**: Algorithm can't replace human judgment
- **Misaligned expectations**: Students may want different results
- **Mitigation**: Balanced lists by default, transparent reasoning, edit capabilities

## Competitive Landscape

### Existing Tools
- **Naviance**: School-based, scattergram focus, limited to school data
- **College Board Big Future**: Broad search, less personalized matching
- **Niche**: Social/review focus, less algorithmic rigor
- **Common App**: Application management, not search/matching
- **Independent counselors**: Expensive ($2,000-$10,000), high-touch

### Our Differentiation
- **Data-driven matching**: More rigorous than basic search filters
- **Financial reality**: Upfront affordability assessment, not afterthought
- **Balanced lists**: Automatic reach/target/safety validation
- **Counselor-grade**: Professional-quality recommendations, free access
- **Mobile-first**: Designed for how students actually search
- **Local-first**: Privacy-respecting, works offline, no account needed

## Future Vision (Beyond MVP)

### Enhanced Features
- Counselor collaboration workspace
- Application timeline and deadline management
- Essay prompt aggregation and brainstorming tools
- Alumni network connection facilitation
- Campus visit optimization and scheduling
- Scholarship matching integration

### Platform Expansion
- API for school counseling offices
- Integration with existing counselor platforms
- White-label version for educational consultants
- International university database expansion

### AI Enhancement
- Natural language profile building ("tell me about yourself")
- Essay topic suggestion based on school fit
- Interview preparation customized by school
- Personalized campus visit question generation

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Foundation document for Cursor AI development context