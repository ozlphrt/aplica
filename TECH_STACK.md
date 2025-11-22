# Technology Stack & Development Standards

## Overview
This document defines the complete technology stack, development patterns, and code conventions for Aplica. All development should follow these standards for consistency and maintainability.

## Core Technologies

### Frontend Framework
**React 18+ with Vite**
- **Version**: React 18.2+, Vite 5+
- **Rationale**: 
  - Fast development with hot module replacement
  - Excellent Cursor AI support and code generation
  - Modern React features (hooks, concurrent rendering)
  - Vite provides optimal build performance
- **Build target**: ES2020+ (modern browsers only)
- **Bundle optimization**: Code splitting by route

### Language
**JavaScript (ES6+)**
- Standard JavaScript for faster development with Cursor AI
- Optional: Migrate to TypeScript in future for type safety
- Use JSDoc comments for critical functions if type hints needed

### Database
**sql.js (SQLite compiled to WebAssembly)**
- **Version**: sql.js 1.8+
- **Size**: ~500KB library + ~20MB data file
- **Loading**: Lazy load database on app initialization
- **Storage**: IndexedDB for persistence between sessions
- **Updates**: Download new database file when version changes

**Why sql.js?**
- Runs entirely in browser (no backend needed)
- Full SQL query capabilities
- Excellent performance for read-heavy workload
- Offline-first architecture
- Simple deployment (just static files)

### UI Framework & Styling

**Tailwind CSS**
- **Version**: 3.4+
- **Approach**: Utility-first CSS
- **Mobile-first**: All styles default to mobile, use breakpoints for larger screens
- **Custom config**: Extend with app-specific colors and spacing

**shadcn/ui**
- **Purpose**: Pre-built accessible components
- **Customization**: Full control over component code (not a dependency)
- **Components to use**:
  - Button, Card, Dialog, Select, Input, Textarea
  - Progress, Slider, RadioGroup, Checkbox
  - Alert, Badge, Tabs, Accordion
- **Installation**: Copy components as needed (not npm install)

**Icons: Lucide React**
- **Version**: 0.263+
- **Style**: Consistent, modern, lightweight
- **Usage**: Import only icons actually used

### Data Visualization
**Recharts**
- **Version**: 2.10+
- **Chart types needed**:
  - Bar chart (for fit score breakdowns)
  - Radar chart (for multi-dimensional fit visualization)
  - Pie chart (for list balance: reach/target/safety)
  - Scatter plot (for showing student vs. school positioning)
- **Mobile optimization**: Responsive sizing, touch-friendly tooltips

### State Management
**Zustand**
- **Version**: 4.4+
- **Rationale**: Simpler than Redux, sufficient for app needs
- **Stores to create**:
  - `studentProfileStore`: Current questionnaire answers
  - `matchingStore`: Current recommendations and filters
  - `databaseStore`: Database connection status and metadata

**React Context**
- **Use for**: Database access throughout component tree
- **Provider**: Wrap app with DatabaseProvider at root level

### Routing
**React Router**
- **Version**: 6.20+
- **Router type**: HashRouter (for GitHub Pages compatibility)
- **Route structure**:
```
  / → Landing/Welcome
  /profile → Student questionnaire
  /matches → Results list
  /college/:unitid → Individual college detail
  /about → App information
```

### PWA (Progressive Web App)
**Vite PWA Plugin**
- **Version**: 0.17+
- **Capabilities**:
  - Service worker for offline functionality
  - App manifest for installability
  - Cache strategies for static assets and database
- **Offline support**:
  - Core app functions work without internet
  - Database cached locally
  - Only data updates require connection

### Local Storage
**Browser APIs**
- **localStorage**: Student profile persistence (JSON serialized)
- **IndexedDB**: Database file storage (binary)
- **sessionStorage**: Temporary state (current filters, sort orders)

## File Structure
```
aplica/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/                 # App icons (various sizes)
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── student/
│   │   │   ├── ProfileQuestionnaire.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── ProgressIndicator.jsx
│   │   │   ├── ProfileSummary.jsx
│   │   │   └── AdaptiveBranching.jsx
│   │   ├── results/
│   │   │   ├── CollegeList.jsx
│   │   │   ├── CollegeCard.jsx
│   │   │   ├── FitScoreBreakdown.jsx
│   │   │   ├── ListBalance.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   └── SortControls.jsx
│   │   ├── details/
│   │   │   ├── CollegeDetail.jsx
│   │   │   ├── AdmissionsProfile.jsx
│   │   │   ├── FinancialBreakdown.jsx
│   │   │   ├── ProgramsList.jsx
│   │   │   ├── OutcomesMetrics.jsx
│   │   │   └── CampusInfo.jsx
│   │   ├── shared/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── WarningBanner.jsx
│   │   └── ui/                # shadcn components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── input.jsx
│   │       └── ...
│   ├── lib/
│   │   ├── database.js        # sql.js wrapper and queries
│   │   ├── matching-algorithm.js
│   │   ├── financial-calculator.js
│   │   ├── questionnaire-logic.js
│   │   └── data-loader.js     # Database download/update logic
│   ├── stores/
│   │   ├── studentProfileStore.js
│   │   ├── matchingStore.js
│   │   └── databaseStore.js
│   ├── utils/
│   │   ├── constants.js       # All magic numbers and thresholds
│   │   ├── helpers.js         # General utility functions
│   │   ├── formatters.js      # Currency, percentage, number formatting
│   │   └── validators.js      # Input validation functions
│   ├── hooks/
│   │   ├── useDatabase.js     # Database access hook
│   │   ├── useStudentProfile.js
│   │   ├── useMatching.js
│   │   └── useMediaQuery.js   # Responsive breakpoint detection
│   ├── data/
│   │   └── README.md          # Note: actual .db file loaded at runtime
│   ├── styles/
│   │   └── globals.css        # Global styles and Tailwind imports
│   ├── App.jsx                # Root component
│   ├── main.jsx               # Entry point
│   └── vite-env.d.ts          # Vite type declarations
├── pipeline/                   # Separate: not included in app bundle
│   ├── scripts/
│   │   ├── fetch_scorecard.py
│   │   ├── fetch_ipeds.py
│   │   ├── scrape_cds.py
│   │   ├── merge_and_clean.py
│   │   └── build_database.py
│   ├── raw/                   # gitignored
│   ├── processed/             # gitignored
│   ├── output/
│   │   └── colleges_vYYYY_MM.db
│   ├── requirements.txt
│   └── README.md
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Code Conventions

### Naming Standards

**Components**
- PascalCase for component names and files
- Example: `ProfileQuestionnaire.jsx`, `CollegeCard.jsx`

**Functions and Variables**
- camelCase for functions and variables
- Example: `calculateFitScore()`, `studentProfile`

**Constants**
- UPPER_SNAKE_CASE for constants
- Example: `MAX_BUDGET`, `DEFAULT_WEIGHT_ACADEMIC`

**CSS Classes**
- Use Tailwind utilities exclusively
- No custom CSS classes unless absolutely necessary
- If custom needed, use kebab-case: `college-card-hover`

**Files and Folders**
- Lowercase with hyphens for non-component files
- Example: `matching-algorithm.js`, `financial-calculator.js`

### Component Structure
```javascript
// Standard component template
import { useState, useEffect } from 'react';
import { ComponentDependency } from './path';

/**
 * Brief description of component purpose
 * @param {Object} props - Component props
 * @param {string} props.propName - Description of prop
 */
export default function ComponentName({ propName }) {
  // 1. Hooks (state, effects, custom hooks)
  const [localState, setLocalState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 2. Derived values and computations
  const derivedValue = computeValue(localState);
  
  // 3. Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // 4. Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} />;
  
  // 5. Main render
  return (
    <div className="container-classes">
      {/* Component JSX */}
    </div>
  );
}
```

### Import Order
```javascript
// 1. React and hooks
import { useState, useEffect } from 'react';

// 2. External libraries
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

// 3. Internal utilities and stores
import { useDatabase } from '@/hooks/useDatabase';
import { useStudentProfile } from '@/stores/studentProfileStore';

// 4. Local components
import QuestionCard from './QuestionCard';

// 5. Assets and styles (if any)
import './styles.css';
```

### JSDoc Comments

Use for complex functions and algorithms:
```javascript
/**
 * Calculate academic fit score for a school
 * @param {Object} school - School data from database
 * @param {Object} studentProfile - Student academic profile
 * @param {number} studentProfile.gpa - Student GPA (0-4.0)
 * @param {number} studentProfile.sat - SAT score (400-1600)
 * @returns {number} Fit score (0-100)
 */
function calculateAcademicFit(school, studentProfile) {
  // Implementation
}
```

## Styling Guidelines

### Tailwind Usage

**Mobile-First Approach**
```jsx
// Base styles apply to mobile, breakpoints scale up
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Title
  </h1>
</div>
```

**Breakpoints**
- `sm:` 640px and up (large phones)
- `md:` 768px and up (tablets)
- `lg:` 1024px and up (laptops)
- `xl:` 1280px and up (desktops)

**Common Patterns**
```jsx
// Card component
<Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">

// Button primary
<Button className="bg-blue-600 hover:bg-blue-700 text-white">

// Input field
<Input className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">

// Container with max width
<div className="container mx-auto max-w-7xl px-4">
```

### Color Palette (Extend Tailwind)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
}
```

## Database Access Patterns

### Using the Database Hook
```javascript
import { useDatabase } from '@/hooks/useDatabase';

function MyComponent() {
  const { db, loading, error } = useDatabase();
  
  useEffect(() => {
    if (!db) return;
    
    const fetchData = async () => {
      const results = await db.exec(`
        SELECT * FROM schools 
        WHERE state = 'CA' 
        LIMIT 10
      `);
      // Process results
    };
    
    fetchData();
  }, [db]);
}
```

### Query Functions (in lib/database.js)
```javascript
/**
 * All database queries should go through these functions
 * for consistency and error handling
 */

// Get schools by criteria
export async function getSchools(db, filters) {
  // Build and execute query
}

// Get single school detail
export async function getSchoolById(db, unitid) {
  // Query implementation
}

// Get programs for a school
export async function getSchoolPrograms(db, unitid) {
  // Query implementation
}
```

## State Management Patterns

### Zustand Store Example
```javascript
// stores/studentProfileStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStudentProfile = create(
  persist(
    (set, get) => ({
      // State
      answers: {},
      completeness: 0,
      
      // Actions
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      
      clearProfile: () =>
        set({ answers: {}, completeness: 0 }),
      
      calculateCompleteness: () => {
        const answers = get().answers;
        // Calculate and set completeness
      },
    }),
    {
      name: 'student-profile', // localStorage key
    }
  )
);
```

## Performance Optimization

### Code Splitting
```javascript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const CollegeDetail = lazy(() => import('./components/details/CollegeDetail'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CollegeDetail />
    </Suspense>
  );
}
```

### Memoization
```javascript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  // Memoize callbacks passed to children
  const handleClick = useCallback(() => {
    // Handle event
  }, [dependencies]);
}
```

### Database Query Optimization
- Use indexes on frequently queried columns
- Limit result sets with LIMIT clause
- Use prepared statements for repeated queries
- Cache common queries in memory (with invalidation)

## Error Handling

### Error Boundary Component
```javascript
// components/shared/ErrorBoundary.jsx
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    console.error('Error caught:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling
```javascript
async function fetchData() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    // Show user-friendly error message
    throw new Error('Failed to load data. Please try again.');
  }
}
```

## Testing Strategy (Future)

### Unit Tests
- Use Vitest (comes with Vite)
- Test utility functions in isolation
- Test algorithm correctness

### Component Tests
- Use React Testing Library
- Test user interactions
- Test conditional rendering

### Integration Tests
- Test database queries
- Test matching algorithm end-to-end
- Test data flow through components

## Deployment

### Build Process
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```
# .env.local (not committed)
VITE_DATABASE_URL=https://yourdomain.com/data/colleges_v2024_11.db
VITE_DATABASE_VERSION=2024.11
```

### Hosting Options
1. **GitHub Pages** (Recommended for MVP)
   - Free hosting
   - Automatic deploys from main branch
   - Use HashRouter for client-side routing

2. **Vercel**
   - Zero-config deployment
   - Automatic SSL
   - Preview deployments for PRs

3. **Netlify**
   - Similar to Vercel
   - Good CDN performance
   - Easy redirects configuration

## Development Workflow

### With Cursor AI

**Component Creation Prompt Template**
```
Create a React component called [ComponentName] that:
- [List specific requirements]
- Uses Tailwind CSS for styling
- Follows mobile-first design
- Includes proper PropTypes or JSDoc
- Handles loading and error states
```

**Algorithm Implementation Prompt Template**
```
Implement a function that:
- [Describe input and output]
- [List algorithm steps]
- Include JSDoc documentation
- Add error handling
- Optimize for performance
```

### Git Workflow
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/[name]**: Feature development
- **fix/[name]**: Bug fixes

### Commit Messages
```
feat: Add college list filtering
fix: Resolve database loading issue
refactor: Simplify matching algorithm
docs: Update API documentation
style: Format code with Prettier
test: Add tests for financial calculator
```

## Browser Support

### Target Browsers
- Chrome/Edge 90+ (85% of users)
- Safari 14+ (iOS and macOS)
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Android)

### Not Supporting
- Internet Explorer (discontinued)
- Very old mobile browsers (>3 years old)

### Progressive Enhancement
- Core functionality works on all target browsers
- Enhanced features for modern browsers (e.g., better animations)
- Graceful degradation for edge cases

## Accessibility

### WCAG 2.1 Level AA Compliance
- Proper heading hierarchy (h1, h2, h3)
- Sufficient color contrast (4.5:1 for text)
- Keyboard navigation support
- Screen reader compatible
- Focus indicators visible
- Form labels and error messages

### Semantic HTML
```jsx
// Use semantic elements
<nav>, <main>, <article>, <section>, <aside>

// Proper button vs link usage
<button onClick={handleClick}>Action</button>
<a href="/about">Learn More</a>

// Form accessibility
<label htmlFor="gpa">GPA</label>
<input id="gpa" type="number" aria-describedby="gpa-help" />
<span id="gpa-help">Enter your current GPA</span>
```

## Security Considerations

### Data Sanitization
- Sanitize all user inputs before display
- Validate numeric ranges
- Escape SQL parameters (sql.js handles this)

### No Sensitive Data
- No authentication = no passwords to protect
- Student data stays local (never transmitted)
- No tracking or analytics in MVP

### Content Security Policy
```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'wasm-unsafe-eval';
               style-src 'self' 'unsafe-inline';">
```

## Documentation Standards

### README.md Must Include
- Quick start guide
- Installation instructions
- Development setup
- Build and deployment process
- Contributing guidelines
- License information

### Code Documentation
- Complex algorithms: JSDoc with examples
- Utility functions: Parameter and return types
- Components: Props description
- Constants: Explanation of values and rationale

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Maintained By**: Development Team  
**Next Review**: Before major feature additions