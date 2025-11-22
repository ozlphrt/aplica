/**
 * Campus Info Component
 * Campus characteristics and culture
 */
import { Card, CardContent } from '../ui/card';
import { MapPin, Users, Building2, Globe, Home, GraduationCap } from 'lucide-react';
import useStudentProfileStore from '../../stores/studentProfileStore';

export default function CampusInfo({ school }) {
  const { answers } = useStudentProfileStore();
  const size = school['latest.student.size'];
  const locale = school['latest.school.locale'];
  const ownership = school['latest.school.ownership'];
  const city = school['school.city'];
  const state = school['school.state'];
  const preferredSize = answers?.preferred_size || [];
  const preferredSetting = answers?.preferred_setting || [];
  const stateResidence = answers?.state_residence;
  
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

  const getSizeCategory = (size) => {
    if (!size) return 'Unknown';
    if (size < 1000) return 'Very Small';
    if (size < 5000) return 'Small';
    if (size < 15000) return 'Medium';
    if (size < 25000) return 'Large';
    return 'Very Large';
  };

  const formatSize = (size) => {
    if (!size) return 'N/A';
    if (size < 1000) return `${size}`;
    if (size < 10000) return `${(size / 1000).toFixed(1)}K`;
    return `${(size / 1000).toFixed(0)}K`;
  };
  
  // Check if size matches preference
  const sizeMatches = preferredSize.length > 0 && size ? (() => {
    const sizeRanges = {
      'very_small': { min: 0, max: 1000 },
      'small': { min: 1000, max: 5000 },
      'medium': { min: 5000, max: 15000 },
      'large': { min: 15000, max: 25000 },
      'very_large': { min: 25000, max: 1000000 },
    };
    return preferredSize.some(rangeKey => {
      const range = sizeRanges[rangeKey];
      return size >= range.min && size < range.max;
    });
  })() : null;
  
  // Check if setting matches preference
  const settingMatches = preferredSetting.length > 0 && locale ? (() => {
    const localeMap = {
      'city': [11, 12, 13],
      'suburb': [21, 22, 23],
      'town': [31, 32, 33],
      'rural': [41, 42, 43],
    };
    return preferredSetting.some(setting => {
      const locales = localeMap[setting];
      return locales && locales.includes(locale);
    });
  })() : null;

  return (
    <Card glassmorphic={true} className="border-2 border-white/10 overflow-hidden">
      <CardContent className="p-8 pt-8">
        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center border border-purple-400/30">
            <Globe className="w-6 h-6 text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Campus Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          {(city || state) && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Location</div>
                  <div className="text-white font-semibold text-lg">
                    {[city, state].filter(Boolean).join(', ') || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Size */}
          {size && (
            <div className={`p-6 rounded-xl border hover:bg-white/10 transition-all ${
              sizeMatches ? 'bg-green-500/10 border-green-400/30' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-400/30 flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-white/60 uppercase tracking-wide">Student Body Size</div>
                    {sizeMatches && (
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Matches preference</span>
                    )}
                  </div>
                  <div className="text-white font-semibold text-lg">{formatSize(size)} students</div>
                  <div className="text-xs text-white/50 mt-1">{getSizeCategory(size)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Institution Type */}
          {ownership && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
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

          {/* Campus Setting */}
          {locale && (
            <div className={`p-6 rounded-xl border hover:bg-white/10 transition-all ${
              settingMatches ? 'bg-green-500/10 border-green-400/30' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-400/30 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-white/60 uppercase tracking-wide">Campus Setting</div>
                    {settingMatches && (
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Matches preference</span>
                    )}
                  </div>
                  <div className="text-white font-semibold text-lg">{getLocaleLabel(locale)}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* In-State Indicator */}
          {stateResidence && state === stateResidence && ownership === 1 && (
            <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/15 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30 flex-shrink-0">
                  <Home className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/60 uppercase tracking-wide mb-1">Residency Status</div>
                  <div className="text-white font-semibold text-lg">In-State Eligible</div>
                  <div className="text-xs text-blue-300 mt-1">You qualify for in-state tuition rates</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
