/**
 * Outcomes Metrics Component
 * Shows graduation rates, earnings, employment
 */
import { Card, CardContent } from '../ui/card';
import { GraduationCap, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function OutcomesMetrics({ school }) {
  const gradRate4yr = school['latest.completion.completion_rate_4yr_150nt'];
  const gradRate6yr = school['latest.completion.completion_rate_6yr_150nt'];
  const retentionRate = school['latest.student.retention_rate.four_year.full_time'];
  const earnings6yr = school['latest.earnings.6_yrs_after_entry.median'];
  const earnings10yr = school['latest.earnings.10_yrs_after_entry.median'];
  
  // Calculate ROI estimate (simplified)
  const estimatedCost = school['latest.cost.avg_net_price.overall'] || 
                        school['latest.cost.attendance.academic_year'];
  const fourYearCost = estimatedCost ? estimatedCost * 4 : null;
  const roi6yr = earnings6yr && fourYearCost ? earnings6yr - fourYearCost : null;
  const roi10yr = earnings10yr && fourYearCost ? (earnings10yr * 6) - fourYearCost : null;
  
  // Assess graduation rate quality
  const getGradRateQuality = (rate) => {
    if (!rate) return null;
    if (rate >= 0.85) return { label: 'Excellent', color: 'text-green-400' };
    if (rate >= 0.75) return { label: 'Strong', color: 'text-blue-400' };
    if (rate >= 0.65) return { label: 'Good', color: 'text-yellow-400' };
    if (rate >= 0.55) return { label: 'Moderate', color: 'text-orange-400' };
    return { label: 'Below Average', color: 'text-red-400' };
  };
  
  const gradRateQuality = gradRate6yr ? getGradRateQuality(gradRate6yr) : 
                          gradRate4yr ? getGradRateQuality(gradRate4yr) : null;
  
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <Card glassmorphic={true} className="border-2 border-white/10 overflow-hidden">
      <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 flex items-center justify-center border border-orange-400/30">
            <TrendingUp className="w-6 h-6 text-orange-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Outcomes & Career Metrics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graduation Rates */}
          {(gradRate4yr !== null && gradRate4yr !== undefined) || (gradRate6yr !== null && gradRate6yr !== undefined) ? (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-300" />
                  <h3 className="text-lg font-semibold text-white">Graduation Rates</h3>
                </div>
                {gradRateQuality && (
                  <span className={`text-xs font-semibold ${gradRateQuality.color}`}>
                    {gradRateQuality.label}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {gradRate4yr !== null && gradRate4yr !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">4-Year Rate</span>
                      <span className="text-xl font-bold text-white">{(gradRate4yr * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${gradRate4yr * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/50 mt-1">Students graduating in 4 years</div>
                  </div>
                )}
                {gradRate6yr !== null && gradRate6yr !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">6-Year Rate</span>
                      <span className="text-xl font-bold text-white">{(gradRate6yr * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${gradRate6yr * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/50 mt-1">Students graduating within 6 years</div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Retention Rate */}
          {retentionRate !== null && retentionRate !== undefined && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-300" />
                <h3 className="text-lg font-semibold text-white">Retention Rate</h3>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-white mb-1">{(retentionRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-white/60">Students returning after freshman year</div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                <div 
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${retentionRate * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Earnings */}
          {earnings6yr && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-300" />
                <h3 className="text-lg font-semibold text-white">Median Earnings</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">6 Years After Entry</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(earnings6yr)}</div>
                  <div className="text-xs text-white/50 mt-1">Annual median salary</div>
                </div>
                {earnings10yr && (
                  <div>
                    <div className="text-sm text-white/60 mb-1">10 Years After Entry</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(earnings10yr)}</div>
                    <div className="text-xs text-white/50 mt-1">Annual median salary</div>
                  </div>
                )}
                {roi6yr && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="text-sm text-white/60 mb-1">Estimated ROI (6 years)</div>
                    <div className={`text-lg font-bold ${roi6yr > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(roi6yr)}
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      Earnings minus 4-year cost
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
