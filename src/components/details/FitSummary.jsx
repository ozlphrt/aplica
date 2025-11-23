/**
 * Fit Summary Component
 * Summary of why this college is a good fit
 */
import { Card, CardContent } from '../ui/card';
import { generateFitSummary } from '../../utils/fit-calculator';
import useStudentProfileStore from '../../stores/studentProfileStore';
import { Sparkles } from 'lucide-react';

export default function FitSummary({ school }) {
  const { answers } = useStudentProfileStore();
  const summary = generateFitSummary(school, answers);

  return (
    <Card glassmorphic={true} className="border-2 border-white/10 overflow-hidden">
      <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-600/30 flex items-center justify-center border border-primary-400/30">
            <Sparkles className="w-6 h-6 text-primary-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Why This Is A Good Fit For You</h2>
        </div>
        <div className="pl-16">
          <p className="text-white/90 text-lg leading-relaxed font-normal tracking-wide">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

