/**
 * Gauge/Dial Component
 * Circular gauge showing recommended ranges and current value
 */
import React from 'react';

export default function Gauge({ 
  value,           // Current value (my list count)
  min,             // Minimum value
  max,             // Maximum value
  ideal,           // Ideal recommended value
  recommendedMin,  // Recommended minimum
  recommendedMax,  // Recommended maximum
  size = 120       // Size of the gauge
}) {
  const center = size / 2;
  const radius = size / 2 - 10;
  const strokeWidth = 8;
  
  // Calculate angles (0° = top, 180° = bottom)
  // We'll use 270° arc (from -135° to 135°)
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = 270;
  
  // Convert value to angle
  const valueToAngle = (val) => {
    if (max === min) return startAngle + totalAngle / 2; // Center if no range
    const normalized = Math.max(0, Math.min(1, (val - min) / (max - min)));
    return startAngle + (normalized * totalAngle);
  };
  
  // Convert angle to point on circle
  const angleToPoint = (angle) => {
    const rad = (angle * Math.PI) / 180;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);
    return { x, y };
  };
  
  // Calculate positions
  const idealAngle = valueToAngle(ideal);
  const minAngle = valueToAngle(recommendedMin);
  const maxAngle = valueToAngle(recommendedMax);
  const valueAngle = valueToAngle(value);
  
  // Get points for arc
  const idealPoint = angleToPoint(idealAngle);
  const minPoint = angleToPoint(minAngle);
  const maxPoint = angleToPoint(maxAngle);
  const valuePoint = angleToPoint(valueAngle);
  
  // Create arc path for recommended range (green)
  const createArcPath = (start, end) => {
    const startPt = angleToPoint(start);
    const endPt = angleToPoint(end);
    const angleDiff = end - start;
    const largeArc = Math.abs(angleDiff) > 180 ? 1 : 0;
    const sweep = angleDiff > 0 ? 1 : 0;
    return `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${endPt.x} ${endPt.y}`;
  };
  
  // Create color-coded arc segments
  const createColorCodedArc = () => {
    const segments = 20; // Number of segments for smooth gradient
    const arcSegments = [];
    
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      const angle1 = minAngle + (maxAngle - minAngle) * t1;
      const angle2 = minAngle + (maxAngle - minAngle) * t2;
      
      // Calculate position in range (0 = min, 1 = max)
      const pos1 = recommendedMin + (recommendedMax - recommendedMin) * t1;
      const pos2 = recommendedMin + (recommendedMax - recommendedMin) * t2;
      const midPos = (pos1 + pos2) / 2;
      
      // Calculate distance from ideal (normalized 0-1)
      const maxDist = Math.max(
        Math.abs(recommendedMax - ideal),
        Math.abs(recommendedMin - ideal)
      );
      const distFromIdeal = Math.abs(midPos - ideal);
      const normalizedDist = maxDist > 0 ? Math.min(1, distFromIdeal / maxDist) : 0;
      
      // Interpolate color: green (0) to red (1)
      const red = Math.round(34 + (239 - 34) * normalizedDist);
      const green = Math.round(197 - (197 - 68) * normalizedDist);
      const blue = Math.round(94 - (94 - 68) * normalizedDist);
      const color = `rgba(${red}, ${green}, ${blue}, 0.8)`;
      
      const segmentPath = createArcPath(angle1, angle2);
      arcSegments.push({ path: segmentPath, color });
    }
    
    return arcSegments;
  };
  
  // Background arc (gray)
  const backgroundArc = createArcPath(startAngle, endAngle);
  
  // Color-coded arc segments
  const colorCodedArcSegments = createColorCodedArc();
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Color-coded arc for recommended range - green near ideal, red farther */}
        {colorCodedArcSegments.map((segment, idx) => (
          <path
            key={idx}
            d={segment.path}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="drop-shadow-[0_0_4px_currentColor]"
          />
        ))}
        
        {/* Value indicator - circle on the arc (only show if value > 0) */}
        {(value != null && value > 0) && (
          <circle
            cx={valuePoint.x}
            cy={valuePoint.y}
            r={8}
            fill="rgba(100, 116, 139, 1)"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth={2}
            className="drop-shadow-[0_0_12px_rgba(100,116,139,1)]"
          />
        )}
      </svg>
      
      {/* Center text showing value */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-white">{value != null ? value : 0}</div>
          <div className="text-xs text-white/60">in list</div>
        </div>
      </div>
      
      {/* Min and Max labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-1">
        <div className="text-[10px] text-white/50 font-medium">Min: {recommendedMin}</div>
        <div className="text-[10px] text-white/50 font-medium">Max: {recommendedMax}</div>
      </div>
    </div>
  );
}

