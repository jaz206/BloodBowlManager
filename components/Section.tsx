
import React, { useState } from 'react';
import type { Rule } from '../types';
import RuleItem from './RuleItem';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';

interface SectionProps {
  title: string;
  rules: Rule[];
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, rules, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-4 sm:p-5 text-left bg-slate-800 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-amber-400">{title}</h2>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 sm:p-5 border-t border-slate-700">
          <ul className="space-y-4 list-none">
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