import React, { useState, useEffect } from 'react';
import { Objective, KeyResult } from '../types/okr';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface OKRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objective: Partial<Objective>) => void;
  objective: Objective | null;
  categories: string[];
  isDarkMode?: boolean;
}

interface KeyResultFormData extends Omit<Partial<KeyResult>, 'startDate' | 'endDate'> {
  startDate: Date | null;
  endDate: Date | null;
}

export const OKRModal: React.FC<OKRModalProps> = ({
  isOpen,
  onClose,
  onSave,
  objective,
  categories,
  isDarkMode = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [keyResults, setKeyResults] = useState<KeyResultFormData[]>([{
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    startDate: null,
    endDate: null
  }]);

  useEffect(() => {
    if (objective) {
      setTitle(objective.title);
      setDescription(objective.description);
      setCategory(objective.category);
      setStartDate(new Date(objective.startDate));
      setEndDate(new Date(objective.endDate));
      setKeyResults(objective.keyResults.map(kr => ({
        ...kr,
        startDate: new Date(kr.startDate),
        endDate: new Date(kr.endDate)
      })));
    } else {
      // Reset form when creating new objective
      setTitle('');
      setDescription('');
      setCategory('');
      setStartDate(null);
      setEndDate(null);
      setKeyResults([{
        description: '',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        startDate: null,
        endDate: null
      }]);
    }
  }, [objective]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    onSave({
      title,
      description,
      category,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      keyResults: keyResults.map(kr => ({
        ...kr,
        startDate: kr.startDate?.toISOString() || startDate.toISOString(),
        endDate: kr.endDate?.toISOString() || endDate.toISOString()
      })) as KeyResult[]
    });
    onClose();
  };

  const addKeyResult = () => {
    setKeyResults([...keyResults, {
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      startDate: null,
      endDate: null
    }]);
  };

  const updateKeyResult = (index: number, field: keyof KeyResultFormData, value: any) => {
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

            {/* Category Selector */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={`w-full rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="yyyy-MM-dd"
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
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="yyyy-MM-dd"
                  required
                  minDate={startDate || undefined}
                  className={`w-full rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>

            {/* Key Results */}
            <div className="space-y-4">
              {keyResults.map((kr, index) => (
                <div key={index} className="relative p-4 border rounded-lg">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Description
                        </label>
                        <input
                          type="text"
                          value={kr.description}
                          onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                          required
                          className={`w-full rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Target Value
                        </label>
                        <input
                          type="number"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResult(index, 'targetValue', parseFloat(e.target.value))}
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
                          Unit
                        </label>
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          required
                          className={`w-full rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Start Date
                        </label>
                        <DatePicker
                          selected={kr.startDate}
                          onChange={(date: Date | null) => updateKeyResult(index, 'startDate', date)}
                          dateFormat="yyyy-MM-dd"
                          required
                          minDate={startDate || undefined}
                          maxDate={kr.endDate || endDate || undefined}
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
                        <DatePicker
                          selected={kr.endDate}
                          onChange={(date: Date | null) => updateKeyResult(index, 'endDate', date)}
                          dateFormat="yyyy-MM-dd"
                          required
                          minDate={kr.startDate || startDate || undefined}
                          maxDate={endDate || undefined}
                          className={`w-full rounded-lg ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                    </div>
                  </div>

                  {keyResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyResult(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={addKeyResult}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Add Key Result
              </button>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
