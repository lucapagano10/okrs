import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ImportFromSheetsProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface Objective {
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: 'not-started';
  user_id: string;
}

interface KeyResult {
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: 'not-started';
  objective_id: string;
}

type ObjectiveKeyResults = Record<number, Array<Omit<KeyResult, 'progress' | 'status' | 'objective_id'>>>;

export const ImportFromSheets: React.FC<ImportFromSheetsProps> = ({
  isOpen,
  onClose,
  isDarkMode = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const bulkImport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      // Create main objectives
      const objectives: Omit<Objective, 'id'>[] = [
        {
          title: "Successfully launch key products in Q1",
          description: "Ensure successful platform product delivery market-wise",
          category: "Product Launch",
          start_date: "2024-01-01",
          end_date: "2025-02-15",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Fully operational integration with Alpaca",
          description: "Complete Alpaca integration for spot trading",
          category: "Integration",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Risk Management in Spot Product",
          description: "Design comprehensive risk management system",
          category: "Risk Management",
          start_date: "2024-01-01",
          end_date: "2025-01-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Borrow rate system implementation",
          description: "Implement short selling functionality",
          category: "Trading",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Market structure economics",
          description: "Define fee structures and economics",
          category: "Business",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        }
      ];

      // Insert objectives
      const { data: createdObjectives, error: objError } = await supabase
        .from('objectives')
        .insert(objectives)
        .select();

      if (objError) throw objError;
      if (!createdObjectives) throw new Error('No objectives created');

      // Map of objectives to their key results
      const objectiveKeyResults: ObjectiveKeyResults = {
        0: [ // First objective
          {
            description: "Validate technical implementations for order execution",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-15"
          },
          {
            description: "Ensure optimal trading experience (UX)",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-15"
          }
        ],
        1: [ // Second objective
          {
            description: "Successfully complete end-to-end testing of API integration",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-31"
          },
          {
            description: "Ensure functionality on short selling operability",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-31"
          }
        ],
        2: [ // Third objective
          {
            description: "Design comprehensive risk management system",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Design BTC collateral management system",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          }
        ],
        3: [ // Fourth objective
          {
            description: "Define borrow rate fee business structure",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Test real-time borrow rate system",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-31"
          },
          {
            description: "Design buy-to-close mechanism",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-15"
          }
        ],
        4: [ // Fifth objective
          {
            description: "Design competitive margin structure",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-15"
          },
          {
            description: "Define borrow rate framework",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Design competitive fee structure",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          }
        ]
      };

      const keyResults: Omit<KeyResult, 'id'>[] = [];

      // Create key results for each objective
      createdObjectives.forEach((objective, index) => {
        const objKeyResults = objectiveKeyResults[index];
        if (objKeyResults) {
          objKeyResults.forEach(kr => {
            keyResults.push({
              ...kr,
              progress: 0,
              status: 'not-started',
              objective_id: objective.id
            });
          });
        }
      });

      // Insert key results
      const { error: krError } = await supabase
        .from('key_results')
        .insert(keyResults);

      if (krError) throw krError;

      onClose();
    } catch (error) {
      console.error('Error in bulk import:', error);
      setError(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsLoading(false);
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
              Import Sample Data
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
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Click the button below to import sample OKRs into your dashboard.
            </p>

            <button
              onClick={bulkImport}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Importing...' : 'Import Sample Data'}
            </button>

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-600'
              }`}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
