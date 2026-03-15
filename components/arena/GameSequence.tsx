
import React from 'react';
import { gameSequenceData } from '../../data/gameSequence';
import Section from '../common/Section';

const GameSequence: React.FC = () => {
  return (
    <div className="space-y-4">
      {gameSequenceData.map((section, index) => (
        <Section key={section.title} title={section.title} rules={section.rules} defaultOpen={index === 0} />
      ))}
    </div>
  );
};

export default GameSequence;
