import React, { useState } from 'react';
import { Objective, KeyResult } from '../types/okr';

interface ImportFromSheetsProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (objectives: Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'>[]) => Promise<void>;
  categories: string[];
  isDarkMode?: boolean;
}

export const ImportFromSheets: React.FC<ImportFromSheetsProps> = ({
  isOpen,
  onClose,
  onImport,
  categories,
  isDarkMode = false,
}) => {
  const [data, setData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseData = (text: string) => {
    try {
      // Split into lines and filter out empty lines
      const lines = text.trim().split('\n').filter(line => line.trim());
      const objectives: Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'>[] = [];
      let currentObjective: Partial<Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'>> | null = null;

      for (const line of lines) {
        const cells = line.split('\t');
        const now = new Date().toISOString();

        // If first cell is not empty, it's an objective
        if (cells[0].trim()) {
          // Save previous objective if exists
          if (currentObjective && currentObjective.title && currentObjective.keyResults?.length) {
            objectives.push(currentObjective as Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'>);
          }

          // Start new objective
          const startDate = cells[3]?.trim() || now;
          const endDate = cells[4]?.trim() || now;

          currentObjective = {
            title: cells[0].trim(),
            description: cells[1]?.trim() || '',
            category: cells[2]?.trim() || categories[0],
            startDate,
            endDate,
            keyResults: []
          };
        } else if (cells[1]?.trim() && currentObjective) {
          // It's a key result
          const startDate = currentObjective.startDate || now;
          const endDate = currentObjective.endDate || now;

          currentObjective.keyResults = currentObjective.keyResults || [];
          currentObjective.keyResults.push({
            description: cells[1].trim(),
            targetValue: parseFloat(cells[2]?.trim() || '0'),
            currentValue: 0,
            unit: cells[3]?.trim() || '',
            startDate,
            endDate,
            progress: 0,
            status: 'not-started'
          });
        }
      }

      // Add last objective
      if (currentObjective && currentObjective.title && currentObjective.keyResults?.length) {
        objectives.push(currentObjective as Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'>);
      }

      if (!objectives.length) {
        throw new Error('No valid objectives found in the data');
      }

      return objectives;
    } catch (error) {
      throw new Error('Failed to parse data. Please make sure it matches the expected format.');
    }
  };

  const handleImport = async () => {
    try {
      setError(null);
      const objectives = parseData(data);
      await onImport(objectives);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import data');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Import from Google Sheets
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Expected Format:
              </h3>
              <pre className={`text-xs whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Objective Title    Description    Category    Start Date    End Date
                    Key Result 1    Target Value    Unit
                    Key Result 2    Target Value    Unit
                Next Objective    Description    Category    Start Date    End Date
                    Key Result 1    Target Value    Unit
              </pre>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Paste your data here:
              </label>
              <textarea
                value={data}
                onChange={(e) => setData(e.target.value)}
                rows={10}
                className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Copy and paste your data from Google Sheets here..."
              />
            </div>

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-600'
              }`}>
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
