'use client';

import React from 'react';

export type TagStatus = 'new' | 'assigned' | 'cleared' | 'high' | 'medium' | 'low';

export interface StatusTagProps {
  status: TagStatus;
  size?: 'sm' | 'md';
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-[#482929] text-[#ff9999]',
  high: 'bg-[#482929] text-[#ff9999]',
  assigned: 'bg-[#43351c] text-[#f4bd50]',
  medium: 'bg-[#43351c] text-[#f4bd50]',
  cleared: 'bg-[#1b3d30] text-[#55d7a0]',
  low: 'bg-[#1b3d30] text-[#55d7a0]',
};

const DEFAULT_LABELS: Record<string, string> = {
  new: 'New',
  high: 'HIGH',
  assigned: 'Reviewing',
  medium: 'MEDIUM',
  cleared: 'Resolved',
  low: 'Resolved',
};

export default function StatusTag({
  status = 'new',
  size = 'md',
  label,
  children,
  className = '',
}: StatusTagProps) {
  const colorClasses = STATUS_STYLES[status] || STATUS_STYLES.new;
  const displayText =
    children ?? (label !== undefined ? label : (DEFAULT_LABELS[status] || status));

  const sizeClasses =
    size === 'sm'
      ? 'px-[6px] py-[3px] text-[9px] max-[680px]:px-[5px] max-[680px]:py-[2px] max-[680px]:text-[8px]'
      : 'px-2 py-[5px] text-[10px] max-[680px]:px-[6px] max-[680px]:py-[5px] max-[680px]:text-[9px]';

  return (
    <span
      className={`tag ml-auto rounded-full font-[800] whitespace-nowrap inline-flex items-center justify-center ${sizeClasses} ${colorClasses} ${className}`}
    >
      {displayText}
    </span>
  );
}

export { StatusTag };
