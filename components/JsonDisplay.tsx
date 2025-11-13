
import React from 'react';
import type { ReferenceDescription } from '../types';

interface JsonDisplayProps {
  data: ReferenceDescription;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  return (
    <div className="w-full bg-brand-surface rounded-lg p-4 max-h-96 overflow-y-auto">
      <pre className="text-sm text-brand-text whitespace-pre-wrap">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};

export default JsonDisplay;
