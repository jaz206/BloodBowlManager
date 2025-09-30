
import React from 'react';
import type { Rule } from '../types';
import DiceIcon from './icons/DiceIcon';

interface RuleItemProps {
  rule: Rule;
  listType: 'numeric' | 'alpha' | 'roman';
  index: number;
}

const getListMarker = (type: 'numeric' | 'alpha' | 'roman', index: number): string => {
  switch (type) {
    case 'numeric':
      return `${index + 1}.`;
    case 'alpha':
      return `${String.fromCharCode(97 + index)}.`;
    case 'roman':
      const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
      return `${roman[index] || index + 1}.`;
    default:
      return '';
  }
};

const RuleItem: React.FC<RuleItemProps> = ({ rule, listType, index }) => {
  const getNextListType = (currentType: 'numeric' | 'alpha' | 'roman'): 'alpha' | 'roman' => {
    return currentType === 'numeric' ? 'alpha' : 'roman';
  };

  return (
    <li className="flex flex-col">
      <div className="flex items-start">
        <span className="text-amber-400 font-semibold mr-3 w-6 text-right">{getListMarker(listType, index)}</span>
        <div className="flex-1 text-slate-300">
          <p>
            {rule.text}
            {rule.dice && (
              <span className="inline-flex items-center ml-2 bg-slate-700 text-amber-300 text-xs font-mono px-2 py-0.5 rounded-full">
                <DiceIcon className="w-3 h-3 mr-1.5" />
                {rule.dice}
              </span>
            )}
          </p>
        </div>
      </div>
      {rule.subRules && (
        <ul className="mt-3 ml-8 sm:ml-12 pl-4 border-l-2 border-slate-700 space-y-3">
          {rule.subRules.map((subRule, subIndex) => (
            <RuleItem key={subIndex} rule={subRule} listType={getNextListType(listType)} index={subIndex} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default RuleItem;