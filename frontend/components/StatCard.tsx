import React from 'react';

export interface StatCardProps {
  title: string;
  icon: string;
  value: string;
  footer: React.ReactNode;
}

export default function StatCard({ title, icon, value, footer }: StatCardProps) {
  return (
    <div className="stat min-w-0 p-[18px] border border-[#2b4940] rounded-[17px] bg-[#142925] max-[680px]:p-[13px]">
      <div className="stat-top flex items-center justify-between gap-2 text-[#a1b9b0] text-xs font-semibold max-[680px]:text-[11px]">
        <span>{title}</span>
        <span className="stat-icon grid place-items-center w-[34px] h-[34px] shrink-0 rounded-[11px] bg-[#1a332d] text-[17px] max-[680px]:w-[29px] max-[680px]:h-[29px]">
          {icon}
        </span>
      </div>
      <div className="num mt-3 mb-[3px] text-[29px] font-[800] tracking-[-1px] text-[#e7f5ef] max-[680px]:text-[25px]">
        {value}
      </div>
      <div className="stat-foot text-[#a1b9b0] text-[11px] leading-[1.5] max-[680px]:text-[10px]">
        {footer}
      </div>
    </div>
  );
}

export { StatCard };
