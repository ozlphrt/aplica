# Aplica
**Apply with clarity**

Data-driven college matching application to help students, parents, and counselors find best-fit schools based on comprehensive academic, financial, and personal fit criteria.

## Setup

1. Clone the repository

2. Install dependencies: `npm install`

3. Copy `.env.example` to `.env` and add your College Scorecard API key

4. Run development server: `npm run dev`

### Getting a College Scorecard API Key

Register at: https://api.data.gov/signup/

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **sql.js** - SQLite in browser
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Project Structure

```
aplica/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utilities and helpers
│   ├── stores/        # Zustand stores
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # CSS files
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
└── package.json       # Dependencies
```

## Development

See DEVELOPMENT_PHASES.md for the complete development roadmap.

## License

MIT

