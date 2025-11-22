/**
 * College Card Component
 * Individual college card in results list
 */
import { Badge } from '../ui/badge';
import { Plus, Check, Square, CheckSquare } from 'lucide-react';
import useSavedCollegesStore from '../../stores/savedCollegesStore';
import { getHighResLogoUrl, getFallbackLogo } from '../../utils/collegeLogos';
import { getSchoolColorFilter } from '../../utils/schoolColors';
import { useState } from 'react';

export default function CollegeCard({ school, onClick, onSelect, isSelected = false }) {
  // Use id field from API (maps to unitid/IPEDS Unit ID)
  const schoolId = school.id || school['id'];
  const { isSaved, toggleSave } = useSavedCollegesStore();
  const saved = schoolId ? isSaved(schoolId) : false;
  const [logoError, setLogoError] = useState(false);

  const handleSaveClick = (e) => {
    e.stopPropagation(); // Prevent card onClick
    toggleSave(schoolId);
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const name = school['school.name'] || 'Unknown College';
  const logoUrl = getHighResLogoUrl(school);
  const fallbackLogo = getFallbackLogo(name);
  const colorFilter = getSchoolColorFilter(name);
  const city = school['school.city'] || '';
  const state = school['school.state'] || '';
  const location = [city, state].filter(Boolean).join(', ');
  const fitScore = school.fitScore || 0;
  const academicTier = school.academicTier || 'target';
  const admitRate = school['latest.admissions.admission_rate.overall'];
  const cost = school['latest.cost.attendance.academic_year'] || 
               school['latest.cost.avg_net_price.overall'] ||
               school['latest.cost.tuition.in_state'] ||
               school['latest.cost.tuition.out_of_state'];
  const size = school['latest.student.size'];

  const tierColors = {
    reach: 'bg-red-500/20 text-red-300 border-red-500/30',
    target: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    safety: 'bg-green-500/20 text-green-300 border-green-500/30',
  };

  const formatCost = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const formatSize = (size) => {
    if (!size) return 'N/A';
    if (size < 1000) return `${size}`;
    if (size < 10000) return `${(size / 1000).toFixed(1)}K`;
    return `${(size / 1000).toFixed(0)}K`;
  };

  const handleSelectClick = (e) => {
    e.stopPropagation(); // Prevent card onClick
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div 
      className={`glass-card rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01] relative ${
        isSelected ? 'ring-2 ring-primary-500/50 bg-primary-500/5' : ''
      }`}
      onClick={onClick}
    >
      {/* Comparison Checkbox */}
      {onSelect && (
        <button
          onClick={handleSelectClick}
          className={`absolute top-3 left-3 p-1.5 rounded-md transition-all z-20 ${
            isSelected
              ? 'bg-primary-500/40 text-primary-200 hover:bg-primary-500/50'
              : 'bg-white/20 text-white/60 hover:bg-white/30 hover:text-white'
          }`}
          title={isSelected ? 'Remove from comparison' : 'Add to comparison (max 3)'}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      )}
      
      {/* Top row: Logo, Badge, Fit Score */}
      <div className="flex items-center justify-between gap-3 mb-2">
        {/* Logo */}
        <div className="flex-shrink-0">
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="w-12 h-12 rounded-lg object-contain bg-white/5 p-1.5 border border-white/10"
              style={{
                filter: colorFilter,
              }}
              onError={handleLogoError}
            />
          ) : (
            <img
              src={fallbackLogo}
              alt={`${name} initial`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>
        
        {/* Badge and Fit Score */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <Badge className={`${tierColors[academicTier] || tierColors.target} text-xs px-2 py-0.5`}>
            {academicTier.charAt(0).toUpperCase() + academicTier.slice(1)}
          </Badge>
          <div className="text-right">
            <div className="text-xl font-bold text-white leading-none">{fitScore}</div>
            <div className="text-[10px] text-white/50 leading-tight">Fit</div>
          </div>
        </div>
      </div>

      {/* College Name */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-white leading-tight">{name}</h3>
        {location && (
          <p className="text-white/60 text-xs mt-0.5">{location}</p>
        )}
      </div>

      {/* Stats - inline compact layout */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-white/10 text-xs">
        {admitRate !== null && admitRate !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">Admit:</span>
            <span className="text-white font-medium">{(admitRate * 100).toFixed(1)}%</span>
          </div>
        )}
        {cost && (
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">Cost:</span>
            <span className="text-white font-medium">{formatCost(cost)}</span>
          </div>
        )}
        {size && (
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">Size:</span>
            <span className="text-white font-medium">{formatSize(size)}</span>
          </div>
        )}
        {school['latest.completion.completion_rate_4yr_150nt'] !== null && school['latest.completion.completion_rate_4yr_150nt'] !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">Grad:</span>
            <span className="text-white font-medium">{(school['latest.completion.completion_rate_4yr_150nt'] * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      {/* Save button - bottom right corner */}
      <button
        onClick={handleSaveClick}
        className={`absolute bottom-3 right-3 p-1.5 rounded-md transition-all z-20 ${
          saved
            ? 'bg-green-500/40 text-green-200 hover:bg-green-500/50 shadow-lg backdrop-blur-sm'
            : 'bg-white/30 text-white hover:bg-white/40 shadow-md backdrop-blur-sm'
        }`}
        title={saved ? 'Remove from my list' : 'Save to my list'}
      >
        {saved ? (
          <Check className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

