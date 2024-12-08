import React, { useState, useEffect } from 'react';
import { Objective, KeyResult } from '../types/okr';

interface OKRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objective: Partial<Objective>) => void;
  objective: Objective | null;
  isDarkMode?: boolean;
}

export const OKRModal: React.FC<OKRModalProps> = ({
  isOpen,
  onClose,
  onSave,
  objective,
  isDarkMode = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyResults, setKeyResults] = useState<Partial<KeyResult>[]>([{
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    startDate: '',
    endDate: ''
  }]);

  useEffect(() => {
    if (objective) {
      setTitle(objective.title);
      setDescription(objective.description);
      setCategory(objective.category);
      setStartDate(objective.startDate);
      setEndDate(objective.endDate);
      setKeyResults(objective.keyResults);
    } else {
      // Reset form when creating new objective
      setTitle('');
      setDescription('');
      setCategory('');
      setStartDate('');
      setEndDate('');
      setKeyResults([{
        description: '',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        startDate: '',
        endDate: ''
      }]);
    }
  }, [objective]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      category,
      startDate,
      endDate,
      keyResults: keyResults as KeyResult[]
    });
    onClose();
  };

  const addKeyResult = () => {
    setKeyResults([...keyResults, {
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      startDate,
      endDate
    }]);
  };

  const updateKeyResult = (index: number, field: keyof KeyResult, value: string | number) => {
    const updatedKRs = [...keyResults];
    updatedKRs[index] = { ...updatedKRs[index], [field]: value };
    setKeyResults(updatedKRs);
  };

  const removeKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {objective ? 'Edit Objective' : 'Create New Objective'}
            </h2>
            <button
              type="button"
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

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={`w-full rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className={`w-full rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className={`w-full rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>

            {/* Key Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Key Results
                </label>
                <button
                  type="button"
                  onClick={addKeyResult}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add Key Result
                </button>
              </div>
              <div className="space-y-4">
                {keyResults.map((kr, index) => (
                  <div key={index} className="relative">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={kr.description}
                          onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                          placeholder="Description"
                          required
                          className={`w-full rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResult(index, 'targetValue', Number(e.target.value))}
                          placeholder="Target"
                          required
                          className={`w-full rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          required
                          className={`w-full rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {keyResults.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeKeyResult(index)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {objective ? 'Save Changes' : 'Create Objective'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
