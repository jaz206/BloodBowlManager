
import React, { useState } from 'react';
import type { Rule } from '../../types';
import RuleItem from '../oracle/RuleItem';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import ChevronUpIcon from '../icons/ChevronUpIcon';

interface SectionProps {
  title: string;
  rules: Rule[];
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, rules, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="bento-card border-white/5 overflow-hidden group/section">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-premium focus:outline-none"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-display font-black text-white italic uppercase tracking-tighter group-hover/section:text-premium-gold transition-colors">{title}</h2>
        <div className={`p-2 rounded-lg bg-white/5 border border-white/10 transition-transform duration-300 ${isOpen ? 'rotate-180 text-premium-gold border-premium-gold/30' : 'text-slate-500'}`}>
          <ChevronDownIcon />
        </div>
      </button>
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden bg-black/20`}
      >
        <div className="p-6 border-t border-white/5">
          <ul className="space-y-6 list-none">
            {rules.map((rule, index) => (
              <RuleItem key={index} rule={rule} listType="numeric" index={index} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Section;