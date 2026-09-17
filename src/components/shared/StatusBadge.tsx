import React from 'react';
import { ProjectStatus, STATUS_COLORS } from '@/types';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showDot = true }) => {
  const config = STATUS_COLORS[status] || STATUS_COLORS.ongoing;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-150 ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.main,
        border: `1px solid ${config.main}25`,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.main }}
        />
      )}
      {config.label}
    </span>
  );
};
