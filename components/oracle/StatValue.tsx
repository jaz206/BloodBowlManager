import React from 'react';

interface StatValueProps {
  value: string | number | null | undefined;
  className?: string;
}

const StatValue: React.FC<StatValueProps> = ({ value, className = '' }) => {
  const raw = value == null || value === 'undefined' || value === 'null' ? '—' : String(value);
  const hasPlus = raw.endsWith('+');
  const numeric = hasPlus ? raw.slice(0, -1) : raw;

  return (
    <span
      className={`inline-flex min-w-[2.9ch] items-center justify-center gap-0.5 font-black not-italic tabular-nums text-[#2b1d12] text-[1.15rem] leading-none tracking-tight ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      <span className="leading-none">{numeric}</span>
      {hasPlus && <span className="leading-none">+</span>}
    </span>
  );
};

export default StatValue;
