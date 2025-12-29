import React, { useState, useEffect } from 'react';
import { BillData } from '../types';

interface DataSimulatorProps {
  data: BillData[];
  onDataChange: (data: BillData[]) => void;
}

const DataSimulator: React.FC<DataSimulatorProps> = ({ data, onDataChange }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2));
  }, [data]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setJsonText(newVal);
    try {
      const parsed = JSON.parse(newVal);
      if (Array.isArray(parsed)) {
        onDataChange(parsed);
        setError(null);
      } else {
        setError('Data must be an array of objects.');
      }
    } catch (err) {
      setError('Invalid JSON format.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Mock Data Source</h2>
        <p className="text-sm text-slate-500">Simulate Excel Import by editing JSON below.</p>
      </div>
      
      <div className="flex-1 relative">
        <textarea
          value={jsonText}
          onChange={handleTextChange}
          className={`w-full h-full p-4 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'}`}
          spellCheck={false}
        />
        {error && (
          <div className="absolute bottom-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-medium shadow-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSimulator;