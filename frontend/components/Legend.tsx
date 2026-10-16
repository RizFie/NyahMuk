import React from 'react';

export interface LegendProps {
  className?: string;
}

export default function Legend({ className = '' }: LegendProps) {
  const items = [
    { label: 'High risk', color: '#e94b4b' },
    { label: 'Medium risk', color: '#eda72a' },
    { label: 'Lower risk', color: '#19885d' },
  ];

  return (
    <div
      className={`legend flex flex-wrap gap-[13px] mt-[13px] text-[#a1b9b0] text-[11px] max-[680px]:gap-[9px] max-[680px]:text-[10px] ${className}`}
    >
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center">
          <span
            className="inline-block w-[9px] h-[9px] mr-[5px] rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export { Legend };
