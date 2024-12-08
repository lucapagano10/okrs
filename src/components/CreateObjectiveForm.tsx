import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Objective, KeyResultStatus } from '../types/okr';

interface KeyResultFormData {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: KeyResultStatus;
  objective_id?: string;
}

interface CreateObjectiveFormProps {
  isOpen: boolean;
  onSubmit: (objective: Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'>) => void;
  onCancel: () => void;
  isDarkMode?: boolean;
  availableCategories: string[];
}

export const CreateObjectiveForm: React.FC<CreateObjectiveFormProps> = ({
  isOpen,
  onSubmit,
  onCancel,
  isDarkMode = false,
  availableCategories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(availableCategories.length > 0 ? availableCategories[0] : '');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString());
  const [endDate, setEndDate] = useState<string>(new Date().toISOString());
  const [keyResults, setKeyResults] = useState<KeyResultFormData[]>([{
    id: '1',
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    progress: 0,
    status: 'not-started'
  }]);

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    const dateStr = date.toISOString();
    setStartDate(dateStr);

    // If end date is before start date, update it
    if (new Date(endDate) < date) {
      setEndDate(dateStr);
    }

    // Update key results
    setKeyResults(prevKeyResults =>
      prevKeyResults.map(kr => ({
        ...kr,
        startDate: new Date(kr.startDate) < date ? dateStr : kr.startDate
      }))
    );
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    const dateStr = date.toISOString();
    setEndDate(dateStr);

    // Update key results
    setKeyResults(prevKeyResults =>
      prevKeyResults.map(kr => ({
        ...kr,
        endDate: new Date(kr.endDate) > date ? dateStr : kr.endDate
      }))
    );
  };

  const handleKeyResultStartDateChange = (index: number, date: Date | null) => {
    if (!date) return;
    const startDateObj = new Date(startDate);
    const newDate = date < startDateObj ? startDateObj : date;
    const dateStr = newDate.toISOString();

    setKeyResults(prevKeyResults =>
      prevKeyResults.map((kr, i) =>
        i === index
          ? {
              ...kr,
              startDate: dateStr,
              endDate: new Date(kr.endDate) < newDate ? dateStr : kr.endDate
            }
          : kr
      )
    );
  };

  const handleKeyResultEndDateChange = (index: number, date: Date | null) => {
    if (!date) return;
    const endDateObj = new Date(endDate);
    const newDate = date > endDateObj ? endDateObj : date;
    const dateStr = newDate.toISOString();

    setKeyResults(prevKeyResults =>
      prevKeyResults.map((kr, i) =>
        i === index
          ? {
              ...kr,
              endDate: dateStr,
              startDate: new Date(kr.startDate) > newDate ? dateStr : kr.startDate
            }
          : kr
      )
    );
  };

  const addKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        id: `${keyResults.length + 1}`,
        description: '',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        startDate: startDate,
        endDate: endDate,
        progress: 0,
        status: 'not-started'
      }
    ]);
  };

  const updateKeyResult = (index: number, field: keyof KeyResultFormData, value: string | number | Date) => {
    const updatedKeyResults = keyResults.map((kr, i) =>
      i === index ? { ...kr, [field]: value } : kr
    );
    setKeyResults(updatedKeyResults);
  };

  const removeKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const objective: Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'> = {
      title,
      description,
      category,
      startDate,
      endDate,
      keyResults: keyResults.map((kr, index) => ({
        ...kr,
        id: kr.id || `kr-${index + 1}`,
        startDate: kr.startDate,
        endDate: kr.endDate,
        status: 'not-started' as KeyResultStatus,
        objective_id: undefined
      }))
    };

    onSubmit(objective);
    setTitle('');
    setDescription('');
    setCategory(availableCategories.length > 0 ? availableCategories[0] : '');
    setStartDate(new Date().toISOString());
    setEndDate(new Date().toISOString());
    setKeyResults([{
      id: '1',
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      progress: 0,
      status: 'not-started'
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`p-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Create New Objective</h2>
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Start Date
                  </label>
                  <DatePicker
                    selected={new Date(startDate)}
                    onChange={handleStartDateChange}
                    dateFormat="yyyy-MM-dd"
                    required
                    className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    End Date
                  </label>
                  <DatePicker
                    selected={new Date(endDate)}
                    onChange={handleEndDateChange}
                    dateFormat="yyyy-MM-dd"
                    required
                    minDate={new Date(startDate)}
                    className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    Key Results
                  </h3>
                  <button
                    type="button"
                    onClick={addKeyResult}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Add Key Result
                  </button>
                </div>

                {keyResults.map((kr, index) => (
                  <div key={kr.id} className="space-y-4 p-4 rounded-lg border relative">
                    {keyResults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyResult(index)}
                        className={`absolute top-2 right-2 p-1 rounded-full ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        ×
                      </button>
                    )}

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={kr.description}
                        onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                        required
                        className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Target Value
                        </label>
                        <input
                          type="number"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResult(index, 'targetValue', parseFloat(e.target.value) || 0)}
                          required
                          className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Unit
                        </label>
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          required
                          className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Start Date
                        </label>
                        <DatePicker
                          selected={new Date(kr.startDate)}
                          onChange={(date) => handleKeyResultStartDateChange(index, date)}
                          dateFormat="yyyy-MM-dd"
                          required
                          minDate={new Date(startDate)}
                          maxDate={new Date(endDate)}
                          className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          End Date
                        </label>
                        <DatePicker
                          selected={new Date(kr.endDate)}
                          onChange={(date) => handleKeyResultEndDateChange(index, date)}
                          dateFormat="yyyy-MM-dd"
                          required
                          minDate={new Date(kr.startDate)}
                          maxDate={new Date(endDate)}
                          className={`w-full px-3 py-2 rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Create Objective
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
