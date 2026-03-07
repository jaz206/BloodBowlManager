
import React from 'react';
import type { Rule } from '../../types';
import DiceIcon from '../icons/DiceIcon';

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
    <li className="flex flex-col group/rule transition-premium">
      <div className="flex items-start">
        <span className="font-display font-black text-premium-gold mr-4 w-8 text-right italic text-lg leading-tight opacity-50 group-hover/rule:opacity-100 transition-opacity">{getListMarker(listType, index)}</span>
        <div className="flex-1 text-white/90">
          <p className="font-medium leading-relaxed">
            {rule.text}
            {rule.dice && (
              <span className="inline-flex items-center ml-3 bg-premium-gold/10 text-premium-gold border border-premium-gold/20 text-[10px] font-display font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
                <DiceIcon className="w-3.5 h-3.5 mr-2 opacity-50" />
                {rule.dice}
              </span>
            )}
          </p>
        </div>
      </div>
      {rule.subRules && (
        <ul className="mt-4 ml-12 pl-6 border-l border-white/10 space-y-4">
          {rule.subRules.map((subRule, subIndex) => (
            <RuleItem key={subIndex} rule={subRule} listType={getNextListType(listType)} index={subIndex} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default RuleItem;