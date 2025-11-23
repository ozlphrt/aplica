# UI Components & Design System

## Overview
This document defines the complete user interface design system, component library, screen layouts, and interaction patterns for Aplica. All UI follows mobile-first principles with progressive enhancement for larger screens.

**Design Principles:**
- Mobile-first: Design for 320px width minimum
- Progressive disclosure: Show information as needed
- Clear hierarchy: Important info stands out
- Touch-friendly: 44px minimum tap targets
- Fast: Minimal loading states, optimistic UI
- Accessible: WCAG 2.1 AA compliant

## Design System

### Color Palette
```javascript
// tailwind.config.js colors
const colors = {
  // Primary: Blue (trust, education)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',   // Main brand color
    600: '#2563eb',   // Hover states
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Academic tiers
  reach: {
    light: '#fef3c7',   // Amber 100
    DEFAULT: '#f59e0b', // Amber 500
    dark: '#d97706',    // Amber 600
  },
  target: {
    light: '#dcfce7',   // Green 100
    DEFAULT: '#10b981', // Green 500
    dark: '#059669',    // Green 600
  },
  safety: {
    light: '#dbeafe',   // Blue 100
    DEFAULT: '#3b82f6', // Blue 500
    dark: '#2563eb',    // Blue 600
  },
  
  // Financial indicators
  affordable: {
    light: '#d1fae5',   // Emerald 100
    DEFAULT: '#10b981', // Emerald 500
    dark: '#059669',
  },
  expensive: {
    light: '#fee2e2',   // Red 100
    DEFAULT: '#ef4444', // Red 500
    dark: '#dc2626',
  },
  
  // Semantic colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },
  
  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};
```

### Typography
```javascript
// Font families
const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Inter', 'system-ui', 'sans-serif'],
};

// Font sizes (mobile-first)
const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
};

// Font weights
const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

### Spacing Scale
```javascript
// Tailwind default spacing (in rem)
const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

### Breakpoints
```javascript
const screens = {
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
};
```

### Border Radius
```javascript
const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};
```

### Shadows
```javascript
const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};
```

---

## Core Component Library

### Button

**Variants:** Primary, Secondary, Outline, Ghost, Danger
```jsx
// components/ui/button.jsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-600',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
        danger: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-600',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({ variant, size, className, children, ...props }) {
  return (
    <button 
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Usage:**
```jsx
<Button variant="primary" size="lg">Generate Matches</Button>
<Button variant="outline">Edit Profile</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

### Card

**Component for displaying school information, sections, and content blocks**
```jsx
// components/ui/card.jsx
export function Card({ className, children, ...props }) {
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={`p-6 pt-0 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
}
```

**Usage:**
```jsx
<Card>
  <CardHeader>
    <h3 className="text-xl font-semibold">University of California, Berkeley</h3>
  </CardHeader>
  <CardContent>
    <p>Public university in Berkeley, CA</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

### Badge

**For tags, labels, and status indicators**
```jsx
// components/ui/badge.jsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        reach: 'bg-reach-light text-reach-dark',
        target: 'bg-target-light text-target-dark',
        safety: 'bg-safety-light text-safety-dark',
        affordable: 'bg-affordable-light text-affordable-dark',
        expensive: 'bg-expensive-light text-expensive-dark',
        neutral: 'bg-gray-100 text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export function Badge({ variant, className, children, ...props }) {
  return (
    <span className={badgeVariants({ variant, className })} {...props}>
      {children}
    </span>
  );
}
```

**Usage:**
```jsx
<Badge variant="reach">Reach</Badge>
<Badge variant="affordable">Affordable</Badge>
```

### Progress Bar

**For questionnaire completion and loading states**
```jsx
// components/ui/progress.jsx
export function Progress({ value, max = 100, className, showLabel = true }) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={className}>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-2 text-center">
          {percentage}% complete
        </p>
      )}
    </div>
  );
}
```

### Input Fields

**Text, Number, Select, and other form inputs**
```jsx
// components/ui/input.jsx
export function Input({ label, error, helpText, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input 
        className={`
          w-full px-4 py-2.5 rounded-lg border
          ${error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 focus:ring-primary-500'}
          focus:outline-none focus:ring-2
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
}

// Currency input
export function CurrencyInput({ value, onChange, ...props }) {
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawValue ? parseInt(rawValue) : 0);
  };
  
  const displayValue = value ? `$${value.toLocaleString()}` : '';
  
  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
}

// Number input with step controls
export function NumberInput({ value, onChange, min, max, step = 1, ...props }) {
  const increment = () => {
    const newValue = (value || 0) + step;
    if (!max || newValue <= max) {
      onChange(newValue);
    }
  };
  
  const decrement = () => {
    const newValue = (value || 0) - step;
    if (!min || newValue >= min) {
      onChange(newValue);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={decrement}
        className="h-11 w-11 rounded-lg border border-gray-300 hover:bg-gray-50"
        disabled={min !== undefined && value <= min}
      >
        −
      </button>
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="text-center"
        {...props}
      />
      <button
        type="button"
        onClick={increment}
        className="h-11 w-11 rounded-lg border border-gray-300 hover:bg-gray-50"
        disabled={max !== undefined && value >= max}
      >
        +
      </button>
    </div>
  );
}
```

### Select / Dropdown
```jsx
// components/ui/select.jsx
export function Select({ label, options, error, helpText, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <select 
        className={`
          w-full px-4 py-2.5 rounded-lg border
          ${error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 focus:ring-primary-500'}
          focus:outline-none focus:ring-2
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
}
```

### Checkbox Group
```jsx
// components/ui/checkbox-group.jsx
export function CheckboxGroup({ options, value = [], onChange, label, helpText }) {
  const handleChange = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className="space-y-3">
        {options.map(option => (
          <label 
            key={option.value}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => handleChange(option.value)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900 group-hover:text-primary-600">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-gray-500 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      {helpText && (
        <p className="mt-3 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
```

### Radio Group
```jsx
// components/ui/radio-group.jsx
export function RadioGroup({ options, value, onChange, label, helpText }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className="space-y-3">
        {options.map(option => (
          <label 
            key={option.value}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <input
              type="radio"
              name={label}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 h-5 w-5 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900 group-hover:text-primary-600">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-gray-500 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      {helpText && (
        <p className="mt-3 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
```

---

## Application-Specific Components

### College Card

**Main component for displaying college in list view**
```jsx
// components/results/CollegeCard.jsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Users, TrendingUp } from 'lucide-react';

export function CollegeCard({ school, onClick }) {
  const { 
    name, 
    city, 
    state, 
    classification, 
    financialAssessment, 
    fitScores 
  } = school;
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{city}, {state}</span>
            </div>
          </div>
          <Badge variant={classification.academicTier}>
            {classification.academicTier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Fit Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700">Overall Fit</span>
            <span className="text-sm font-semibold text-primary-600">
              {fitScores.composite}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${fitScores.composite}%` }}
            />
          </div>
        </div>
        
        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Admission Chance */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Admission</p>
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(classification.admissionProbability * 100)}%
              </p>
            </div>
          </div>
          
          {/* Cost */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-affordable-light flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-affordable-dark" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. Cost</p>
              <p className="text-sm font-semibold text-gray-900">
                ${(financialAssessment.finalEstimatedCost / 1000).toFixed(0)}k/yr
              </p>
            </div>
          </div>
          
          {/* Size */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Students</p>
              <p className="text-sm font-semibold text-gray-900">
                {(school.size / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
          
          {/* Setting */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Setting</p>
              <p className="text-sm font-semibold text-gray-900">
                {school.setting}
              </p>
            </div>
          </div>
        </div>
        
        {/* Warning if unaffordable */}
        {!financialAssessment.affordable && (
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-xs text-warning-800">
              <span className="font-semibold">Above budget:</span> ${financialAssessment.gapAmount.toLocaleString()} gap
              {financialAssessment.meritAid.likely && ' (merit aid possible)'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Fit Score Breakdown

**Detailed visualization of fit scores**
```jsx
// components/results/FitScoreBreakdown.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function FitScoreBreakdown({ scores, weights }) {
  const data = [
    { dimension: 'Academic', score: scores.academic, weight: weights.academic },
    { dimension: 'Financial', score: scores.financial, weight: weights.financial },
    { dimension: 'Environment', score: scores.environmental, weight: weights.environmental },
    { dimension: 'Outcomes', score: scores.outcomes, weight: weights.outcomes },
  ];
  
  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Fit Score Breakdown</h4>
      
      {/* Bar Chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="dimension" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-sm">{item.dimension}</p>
                      <p className="text-sm text-gray-600">Score: {item.score}/100</p>
                      <p className="text-xs text-gray-500">Weight: {(item.weight * 100).toFixed(0)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Score Details */}
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.dimension} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{item.dimension}</span>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                {item.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### List Balance Indicator

**Shows reach/target/safety distribution**
```jsx
// components/results/ListBalance.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export function ListBalance({ balance }) {
  const data = [
    { name: 'Reach', value: balance.reachCount, color: '#f59e0b' },
    { name: 'Target', value: balance.targetCount, color: '#10b981' },
    { name: 'Safety', value: balance.safetyCount, color: '#3b82f6' },
  ];
  
  const isBalanced = 
    balance.reachCount >= 2 &&
    balance.targetCount >= 3 &&
    balance.safetyCount >= 2;
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900">List Balance</h4>
        {isBalanced ? (
          <Badge variant="target">Well Balanced</Badge>
        ) : (
          <Badge variant="warning">Needs Adjustment</Badge>
        )}
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => `${value}: ${entry.payload.value}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Reach schools:</span>
          <span className={balance.reachCount >= 2 ? 'text-gray-900 font-medium' : 'text-warning-600 font-medium'}>
            {balance.reachCount} {balance.reachCount < 2 && '(add more)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Target schools:</span>
          <span className={balance.targetCount >= 3 ? 'text-gray-900 font-medium' : 'text-warning-600 font-medium'}>
            {balance.targetCount} {balance.targetCount < 3 && '(add more)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Safety schools:</span>
          <span className={balance.safetyCount >= 2 ? 'text-gray-900 font-medium' : 'text-warning-600 font-medium'}>
            {balance.safetyCount} {balance.safetyCount < 2 && '(add more)'}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Question Card

**Displays questions in the adaptive questionnaire**
```jsx
// components/student/QuestionCard.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function QuestionCard({ question, answer, onAnswer, onSkip, canSkip }) {
  const renderInput = () => {
    switch(question.component) {
      case 'NumberInput':
        return (
          <NumberInput
            value={answer}
            onChange={onAnswer}
            {...question.validation}
            label={question.question}
            helpText={question.helpText}
            placeholder={question.placeholder}
          />
        );
      
      case 'Select':
        return (
          <Select
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            options={question.options}
            label={question.question}
            helpText={question.helpText}
          />
        );
      
      case 'RadioGroup':
        return (
          <RadioGroup
            value={answer}
            onChange={onAnswer}
            options={question.options}
            label={question.question}
            helpText={question.helpText}
          />
        );
      
      case 'CheckboxGroup':
        return (
          <CheckboxGroup
            value={answer || []}
            onChange={onAnswer}
            options={question.options}
            label={question.question}
            helpText={question.helpText}
          />
        );
      
      case 'CurrencyInput':
        return (
          <CurrencyInput
            value={answer}
            onChange={onAnswer}
            label={question.question}
            helpText={question.helpText}
            placeholder={question.placeholder}
          />
        );
      
      default:
        return (
          <Input
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            label={question.question}
            helpText={question.helpText}
            placeholder={question.placeholder}
          />
        );
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {renderInput()}
        
        <div className="mt-6 flex items-center justify-between gap-3">
          {canSkip && onSkip && (
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="text-gray-600"
            >
              Skip for now
            </Button>
          )}
          <div className="flex-1" />
          <Button 
            variant="primary"
            disabled={!answer && question.validation?.required}
            onClick={() => {
              // Validation happens here
              // Then move to next question
            }}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Warning Banner

**Display warnings and important alerts**
```jsx
// components/shared/WarningBanner.jsx
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

export function WarningBanner({ type = 'warning', severity = 'medium', message, action }) {
  const config = {
    critical: {
      bg: 'bg-error-50',
      border: 'border-error-200',
      text: 'text-error-800',
      icon: AlertCircle,
      iconColor: 'text-error-600',
    },
    high: {
      bg: 'bg-error-50',
      border: 'border-error-200',
      text: 'text-error-700',
      icon: AlertTriangle,
      iconColor: 'text-error-500',
    },
    medium: {
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      text: 'text-warning-800',
      icon: AlertTriangle,
      iconColor: 'text-warning-600',
    },
    low: {
      bg: 'bg-info-50',
      border: 'border-info-200',
      text: 'text-info-800',
      icon: Info,
      iconColor: 'text-info-600',
    },
    info: {
      bg: 'bg-info-50',
      border: 'border-info-200',
      text: 'text-info-800',
      icon: Info,
      iconColor: 'text-info-600',
    },
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      text: 'text-success-800',
      icon: CheckCircle,
      iconColor: 'text-success-600',
    },
  };
  
  const style = config[severity] || config.medium;
  const Icon = style.icon;
  
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${style.bg} ${style.border}`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        {action && (
          <p className={`text-sm mt-1 ${style.text} opacity-90`}>{action}</p>
        )}
      </div>
    </div>
  );
}
```

---

## Screen Layouts

### 1. Welcome Screen
```jsx
// pages/Welcome.jsx
export default function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Aplica
          </h1>
          <p className="text-xl text-primary-600 font-medium mb-4">
            Apply with clarity
          </p>
          <p className="text-lg text-gray-600">
            Data-driven recommendations based on your academic profile, budget, and preferences
          </p>
        </div>
        
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Answer a few questions</h3>
                <p className="text-sm text-gray-600">Tell us about your academic profile, budget, and preferences</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get personalized matches</h3>
                <p className="text-sm text-gray-600">Our algorithm finds schools that fit you academically and financially</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Build your list</h3>
                <p className="text-sm text-gray-600">Create a balanced college list with reach, target, and safety schools</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/profile')}
            >
              Get Started
            </Button>
            <p className="text-xs text-center text-gray-500">
              Takes 10-15 minutes • Save and continue anytime • Your data stays private
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

### 2. Questionnaire Screen
```jsx
// pages/Profile.jsx
export default function Profile() {
  const { answers, currentQuestion, progress } = useStudentProfile();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Progress value={progress.overall} showLabel={false} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              {progress.overall}% complete
            </span>
            {progress.tier1 === 100 && (
              <Button variant="outline" size="sm">
                See Matches
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Question */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <QuestionCard
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswer={(value) => {/* save answer */}}
          onSkip={() => {/* skip question */}}
          canSkip={currentQuestion.tier !== 1}
        />
      </div>
    </div>
  );
}
```

### 3. Results Screen
```jsx
// pages/Matches.jsx
export default function Matches() {
  const { matches, balance, warnings } = useMatching();
  const [selectedTier, setSelectedTier] = useState('all');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Your College Matches</h1>
          <p className="text-gray-600 mt-1">{matches.length} schools match your profile</p>
        </div>
      </div>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-3">
          {warnings.map((warning, i) => (
            <WarningBanner key={i} {...warning} />
          ))}
        </div>
      )}
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <ListBalance balance={balance} />
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Filter by tier</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedTier('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedTier === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Schools ({matches.length})
                    </button>
                    <button
                      onClick={() => setSelectedTier('reach')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedTier === 'reach' ? 'bg-reach-light text-reach-dark font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Reach ({balance.reachCount})
                    </button>
                    <button
                      onClick={() => setSelectedTier('target')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedTier === 'target' ? 'bg-target-light text-target-dark font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Target ({balance.targetCount})
                    </button>
                    <button
                      onClick={() => setSelectedTier('safety')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedTier === 'safety' ? 'bg-safety-light text-safety-dark font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Safety ({balance.safetyCount})
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* College List */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {matches
                .filter(s => selectedTier === 'all' || s.classification.academicTier === selectedTier)
                .map(school => (
                  <CollegeCard 
                    key={school.unitid}
                    school={school}
                    onClick={() => navigate(`/college/${school.unitid}`)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. College Detail Screen
```jsx
// pages/CollegeDetail.jsx
export default function CollegeDetail() {
  const { unitid } = useParams();
  const { school } = useSchoolDetail(unitid);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {school.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{school.city}, {school.state}</span>
                <span className="mx-2">•</span>
                <span>{school.control}</span>
              </div>
            </div>
            <Badge variant={school.classification.academicTier} className="text-base px-4 py-2">
              {school.classification.academicTier}
            </Badge>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Admission Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(school.admit_rate * 100)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Est. Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(school.financialAssessment.finalEstimatedCost / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {(school.size / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Grad Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(school.graduation_rate_4yr * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="admissions">Admissions</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Fit scores, campus info, etc. */}
          </TabsContent>
          
          <TabsContent value="admissions">
            {/* Admission stats, your chances, requirements */}
          </TabsContent>
          
          <TabsContent value="financial">
            {/* Cost breakdown, financial aid, merit scholarships */}
          </TabsContent>
          
          <TabsContent value="programs">
            {/* Available majors, program rankings */}
          </TabsContent>
          
          <TabsContent value="outcomes">
            {/* Graduation rates, career outcomes, earnings */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

---

## Responsive Patterns

### Mobile (320px - 639px)
- Single column layouts
- Full-width cards
- Stacked navigation
- Collapsible sections
- Bottom sheet modals

### Tablet (640px - 1023px)
- Two column grids
- Side-by-side comparisons
- Tab navigation
- Standard modals

### Desktop (1024px+)
- Three column layouts
- Sidebar navigation
- Hover states
- Larger typography
- More whitespace

---

## Loading States
```jsx
// components/shared/LoadingSpinner.jsx
export function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`} />
    </div>
  );
}

// Full page loading
export function PageLoading({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
```

## Empty States
```jsx
// components/shared/EmptyState.jsx
import { Search, FileQuestion } from 'lucide-react';

export function EmptyState({ title, description, action, icon: Icon = Search }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && action}
    </div>
  );
}
```

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Design System Owner**: UI/UX Team  
**Component Library**: Built with Tailwind CSS + shadcn/ui