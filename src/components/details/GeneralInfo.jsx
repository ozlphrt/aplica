/**
 * General Information Component
 * General information about the school
 */
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Users, GraduationCap, Building2 } from 'lucide-react';

export default function GeneralInfo({ school }) {
  const name = school['school.name'] || 'Unknown College';
  const city = school['school.city'] || '';
  const state = school['school.state'] || '';
  const location = [city, state].filter(Boolean).join(', ');
  const size = school['latest.student.size'];
  const ownership = school['latest.school.ownership'];
  const locale = school['latest.school.locale'];
  const gradRate = school['latest.completion.completion_rate_4yr_150nt'] || 
                   school['latest.completion.completion_rate_6yr_150nt'];
  const admitRate = school['latest.admissions.admission_rate.overall'];
  const academicTier = school.academicTier || 'target';

  const formatSize = (size) => {
    if (!size) return 'N/A';
    if (size < 1000) return `${size}`;
    if (size < 10000) return `${(size / 1000).toFixed(1)}K`;
    return `${(size / 1000).toFixed(0)}K`;
  };

  const getOwnershipLabel = (ownership) => {
    if (ownership === 1) return 'Public';
    if (ownership === 2) return 'Private nonprofit';
    if (ownership === 3) return 'Private for-profit';
    return 'Unknown';
  };

  const getLocaleLabel = (locale) => {
    if (locale >= 11 && locale <= 13) return 'City';
    if (locale >= 21 && locale <= 23) return 'Suburban';
    if (locale >= 31 && locale <= 33) return 'Town';
    if (locale >= 41 && locale <= 43) return 'Rural';
    return 'Unknown';
  };

  const tierColors = {
    reach: 'bg-red-500/20 text-red-300 border-red-500/30',
    target: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    safety: 'bg-green-500/20 text-green-300 border-green-500/30',
  };

  return (
    <Card glassmorphic={true} className="border-2 border-white/10 overflow-hidden">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-white mb-8">General Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          {location && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Location</div>
                  <div className="text-white font-semibold text-lg">{location}</div>
                </div>
              </div>
            </div>
          )}

          {/* Size */}
          {size && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-400/30 flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Student Body Size</div>
                  <div className="text-white font-semibold text-lg">{formatSize(size)} students</div>
                </div>
              </div>
            </div>
          )}

          {/* Ownership */}
          {ownership && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-400/30 flex-shrink-0">
                  <Building2 className="w-5 h-5 text-green-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Institution Type</div>
                  <div className="text-white font-semibold text-lg">{getOwnershipLabel(ownership)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Setting */}
          {locale && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-400/30 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Campus Setting</div>
                  <div className="text-white font-semibold text-lg">{getLocaleLabel(locale)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Admission Rate */}
          {admitRate !== null && admitRate !== undefined && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center border border-yellow-400/30 flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Admission Rate</div>
                  <div className="text-white font-semibold text-lg">{(admitRate * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Graduation Rate */}
          {gradRate !== null && gradRate !== undefined && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Graduation Rate</div>
                  <div className="text-white font-semibold text-lg">{(gradRate * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Tier */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="text-xs text-white/60 uppercase tracking-wide">Academic Classification</div>
              <Badge className={`${tierColors[academicTier] || tierColors.target} text-sm px-4 py-1.5 border font-semibold`}>
                {academicTier.charAt(0).toUpperCase() + academicTier.slice(1)} School
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

