/**
 * Financial Breakdown Component
 * Detailed cost and aid information
 */
import { Card, CardContent } from '../ui/card';
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import useStudentProfileStore from '../../stores/studentProfileStore';

export default function FinancialBreakdown({ school }) {
  const { answers } = useStudentProfileStore();
  
  const stickerPrice = school['latest.cost.attendance.academic_year'];
  const netPrice = school['latest.cost.avg_net_price.overall'];
  const tuitionInState = school['latest.cost.tuition.in_state'];
  const tuitionOutState = school['latest.cost.tuition.out_of_state'];
  const maxBudget = answers?.max_annual_budget;
  const householdIncome = answers?.household_income;
  const stateResidence = answers?.state_residence;
  const financialAidNeed = answers?.financial_aid_need;
  const schoolState = school['school.state'];
  const ownership = school['latest.school.ownership'];
  
  const isInState = ownership === 1 && schoolState === stateResidence;
  
  // Get income-based net price if available
  let incomeBasedNetPrice = null;
  if (householdIncome && householdIncome !== 'prefer_not_say') {
    const incomeNetPriceMap = {
      'under_30k': school['latest.cost.net_price.private_by_income_level.0_30000'],
      '30_48k': school['latest.cost.net_price.private_by_income_level.30001_48000'],
      '48_75k': school['latest.cost.net_price.private_by_income_level.48001_75000'],
      '75_110k': school['latest.cost.net_price.private_by_income_level.75001_110000'],
      'over_150k': school['latest.cost.net_price.private_by_income_level.110001_plus'],
    };
    incomeBasedNetPrice = incomeNetPriceMap[householdIncome];
  }
  
  // Determine best cost estimate
  const cost = incomeBasedNetPrice || 
               (isInState ? tuitionInState : null) ||
               stickerPrice || 
               netPrice || 
               tuitionOutState;
  
  // Calculate estimated net price
  let estimatedNetPrice = cost;
  let netPriceSource = 'sticker_price';
  
  if (incomeBasedNetPrice) {
    estimatedNetPrice = incomeBasedNetPrice;
    netPriceSource = 'income_based';
  } else if (netPrice) {
    estimatedNetPrice = netPrice;
    netPriceSource = 'average_net_price';
  } else if (householdIncome && cost && householdIncome !== 'prefer_not_say') {
    // Rough estimate based on income bracket
    const discount = householdIncome === 'under_30k' ? 0.5 :
                     householdIncome === '30_48k' ? 0.4 :
                     householdIncome === '48_75k' ? 0.3 :
                     householdIncome === '75_110k' ? 0.2 :
                     0.1;
    estimatedNetPrice = cost * (1 - discount);
    netPriceSource = 'estimated';
  }
  
  const budgetRatio = maxBudget ? estimatedNetPrice / maxBudget : null;
  const isAffordable = budgetRatio ? estimatedNetPrice <= maxBudget : null;
  const gapAmount = maxBudget && estimatedNetPrice > maxBudget ? estimatedNetPrice - maxBudget : 0;
  const savingsAmount = maxBudget && estimatedNetPrice < maxBudget ? maxBudget - estimatedNetPrice : 0;
  
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/30 flex items-center justify-center border border-green-400/30">
            <DollarSign className="w-6 h-6 text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Financial Breakdown</h2>
        </div>

        <div className="space-y-6">
          {/* Cost Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stickerPrice && (
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-white/60 mb-2">Sticker Price</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(stickerPrice)}</div>
                <div className="text-xs text-white/50 mt-1">Full cost before aid</div>
              </div>
            )}
            
            {estimatedNetPrice && (
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  <div className="text-sm text-white/60">Estimated Net Price</div>
                </div>
                <div className="text-2xl font-bold text-white">{formatCurrency(estimatedNetPrice)}</div>
                <div className="text-xs text-white/50 mt-1">
                  {netPriceSource === 'income_based' ? 'Based on your income bracket' :
                   netPriceSource === 'average_net_price' ? 'Average net price (all students)' :
                   netPriceSource === 'estimated' ? 'Estimated after aid' :
                   'After estimated aid'}
                </div>
                {stickerPrice && estimatedNetPrice < stickerPrice && (
                  <div className="text-xs text-green-400 mt-1">
                    Saves {formatCurrency(stickerPrice - estimatedNetPrice)} vs sticker price
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Budget Comparison */}
          {maxBudget && estimatedNetPrice && (
            <div className={`p-6 rounded-xl border ${
              isAffordable 
                ? 'bg-green-500/10 border-green-400/30' 
                : 'bg-red-500/10 border-red-400/30'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                {isAffordable ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-lg font-semibold text-white">
                  {isAffordable ? 'Within Your Budget' : 'Over Your Budget'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">Your Budget</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(maxBudget)}</div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Estimated Cost</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(estimatedNetPrice)}</div>
                </div>
              </div>
              
              {isAffordable ? (
                <div className="text-green-300 font-semibold">
                  You have {formatCurrency(savingsAmount)} remaining per year
                </div>
              ) : (
                <div className="text-red-300 font-semibold">
                  {formatCurrency(gapAmount)} over budget per year
                </div>
              )}
              {financialAidNeed && financialAidNeed !== 'not_important' && (
                <div className="mt-3 text-xs text-white/60">
                  Financial aid is {financialAidNeed === 'critical' ? 'critical' : 'important'} to you - 
                  {isAffordable ? ' this school fits your needs' : ' consider schools with stronger aid programs'}
                </div>
              )}
            </div>
          )}

          {/* Tuition Breakdown */}
          {(tuitionInState || tuitionOutState) && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Tuition Rates</h3>
              <div className="space-y-3">
                {tuitionInState && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">In-State</span>
                      {isInState && (
                        <span className="ml-2 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">You qualify</span>
                      )}
                    </div>
                    <span className="text-white font-semibold">{formatCurrency(tuitionInState)}</span>
                  </div>
                )}
                {tuitionOutState && (
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Out-of-State</span>
                    <span className="text-white font-semibold">{formatCurrency(tuitionOutState)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4-Year Total */}
          {estimatedNetPrice && (
            <div className="p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
              <div className="text-sm text-white/60 mb-2">Estimated 4-Year Total Cost</div>
              <div className="text-3xl font-bold text-white">{formatCurrency(estimatedNetPrice * 4)}</div>
              <div className="text-xs text-white/50 mt-1">Based on estimated net price per year</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
