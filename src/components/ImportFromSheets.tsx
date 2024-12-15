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
        },
        {
          title: "Robust market derivatives architecture",
          description: "Ensure complete derivatives infrastructure",
          category: "Architecture",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Risk Management in Derivatives Product",
          description: "Design comprehensive derivatives risk management",
          category: "Risk Management",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Compliance Alignment",
          description: "Ensure all products are compliant with regulations",
          category: "Compliance",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Market Making Framework",
          description: "Design and implement market making strategy",
          category: "Trading",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Liquidity and Price Discovery",
          description: "Design market dynamics for derivatives launch",
          category: "Trading",
          start_date: "2024-01-01",
          end_date: "2025-03-31",
          progress: 0,
          status: 'not-started',
          user_id: userId
        },
        {
          title: "Internal Market Making",
          description: "Establish internal market making capabilities",
          category: "Trading",
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
        0: [ // First objective - Successfully launch key products
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
        1: [ // Second objective - Alpaca integration
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
          },
          {
            description: "Complete market simulation testing",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-31"
          }
        ],
        2: [ // Third objective - Risk Management in Spot
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
        3: [ // Fourth objective - Borrow rate system
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
        4: [ // Fifth objective - Market structure economics
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
        ],
        5: [ // Sixth objective - Derivatives architecture
          {
            description: "Complete product specifications (contract size, tick size, trading hours)",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-05"
          },
          {
            description: "Implement real mark price methodology",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-15"
          },
          {
            description: "Test funding rate cycle mechanism with 8h settlement periods",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-28"
          },
          {
            description: "Set market impact limit on liquidity profiles",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-15"
          },
          {
            description: "Define leverage and margin requirements for each product",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          }
        ],
        6: [ // Seventh objective - Risk Management in Derivatives
          {
            description: "Design insurance fund for perpetuals",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-10"
          },
          {
            description: "Design cross-collateral management system in BTC",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-31"
          },
          {
            description: "Design and implement stress testing",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-20"
          },
          {
            description: "Implement liquidation engine with high margin maintenance",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-10"
          },
          {
            description: "Establish maintenance margin monitoring system",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-03-25"
          }
        ],
        7: [ // Eighth objective - Compliance
          {
            description: "Establish compliant liquidation process",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Complete product documentation and risk disclosures",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Verify trading restrictions alignment with compliance",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-28"
          },
          {
            description: "Define market abuse monitoring requirements",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-28"
          },
          {
            description: "Establish derivatives risk disclosure acknowledgments",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Establish user restriction framework",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          }
        ],
        8: [ // Ninth objective - Market Making Framework
          {
            description: "Define ideal maximum spread & minimum depth requirements",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Design technical requirements for market makers",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-15"
          },
          {
            description: "Design business framework for external market making",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-15"
          }
        ],
        9: [ // Tenth objective - Liquidity and Price Discovery
          {
            description: "Sign agreement with market makers per product",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-15"
          },
          {
            description: "Establish competitive maker/taker fee structure",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Define spread structure according to market conditions",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-28"
          },
          {
            description: "Define market making incentive program",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2024-02-15"
          }
        ],
        10: [ // Eleventh objective - Internal Market Making
          {
            description: "Design internal market making framework and logic flow",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-24"
          },
          {
            description: "Define internal market making business model",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-01-31"
          },
          {
            description: "Define capital ratio needed per transacted volume",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2025-02-28"
          },
          {
            description: "Establish market making activity caps",
            target_value: 100,
            current_value: 0,
            unit: "percentage",
            start_date: "2024-01-01",
            end_date: "2024-03-31"
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
