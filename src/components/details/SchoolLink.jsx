/**
 * School Link Component
 * Link to school's official website
 */
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';

export default function SchoolLink({ school }) {
  const schoolUrl = school['school.school_url'] || school.school_url;
  
  if (!schoolUrl) {
    return null;
  }

  // Ensure URL has protocol
  const url = schoolUrl.startsWith('http') ? schoolUrl : `https://${schoolUrl}`;

  return (
    <Card glassmorphic={true} className="border-2 border-white/10 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-600/30 flex items-center justify-center border border-primary-400/30">
            <ExternalLink className="w-6 h-6 text-primary-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">School Website</h2>
        </div>
        <div className="pl-16 space-y-4">
          <Button
            variant="primary"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            Visit Official Website
          </Button>
          <p className="text-white/60 text-sm font-mono bg-white/5 px-4 py-2 rounded-lg border border-white/10 inline-block">
            {url}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

