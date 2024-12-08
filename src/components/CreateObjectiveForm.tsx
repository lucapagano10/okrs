import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Objective } from '../types/okr';

interface CreateObjectiveFormProps {
  onSubmit: (objective: Omit<Objective, 'id' | 'progress' | 'status'>) => void;
  onCancel: () => void;
  initialObjective?: Objective | null;
  isDarkMode?: boolean;
  availableCategories: string[];
}

interface KeyResultFormData {
  id: string;
  description: string;
  targetValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
}

export const CreateObjectiveForm: React.FC<CreateObjectiveFormProps> = ({
  onSubmit,
  onCancel,
  initialObjective,
  isDarkMode = false,
  availableCategories,
}) => {
  const [title, setTitle] = useState(initialObjective?.title || '');
  const [description, setDescription] = useState(initialObjective?.description || '');
  const [category, setCategory] = useState(initialObjective?.category || availableCategories[0]);
  const [startDate, setStartDate] = useState<Date>(initialObjective?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date>(initialObjective?.endDate || new Date());
  const [keyResults, setKeyResults] = useState<KeyResultFormData[]>(
    initialObjective?.keyResults.map(kr => ({
      id: kr.id,
      description: kr.description,
      targetValue: kr.targetValue,
      unit: kr.unit,
      startDate: kr.startDate,
      endDate: kr.endDate,
    })) || [
      {
        description: '',
        targetValue: 0,
        unit: '',
        id: '1',
        startDate: new Date(),
        endDate: new Date(),
      },
    ]
  );

  useEffect(() => {
    if (initialObjective) {
      setTitle(initialObjective.title);
      setDescription(initialObjective.description);
      setCategory(initialObjective.category);
      setStartDate(initialObjective.startDate);
      setEndDate(initialObjective.endDate);
      setKeyResults(
        initialObjective.keyResults.map(kr => ({
          id: kr.id,
          description: kr.description,
          targetValue: kr.targetValue,
          unit: kr.unit,
          startDate: kr.startDate,
          endDate: kr.endDate,
        }))
      );
    }
  }, [initialObjective]);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
      // Update all key results that start before the new objective start date
      setKeyResults(keyResults.map(kr => ({
        ...kr,
        startDate: kr.startDate < date ? date : kr.startDate,
      })));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date);
      // Update all key results that end after the new objective end date
      setKeyResults(keyResults.map(kr => ({
        ...kr,
        endDate: kr.endDate > date ? date : kr.endDate,
      })));
    }
  };

  const handleKeyResultStartDateChange = (index: number, date: Date | null) => {
    if (date) {
      const newDate = date < startDate ? startDate : date;
      const kr = keyResults[index];
      setKeyResults(keyResults.map((kr, i) =>
        i === index
          ? {
              ...kr,
              startDate: newDate,
              endDate: newDate > kr.endDate ? newDate : kr.endDate,
            }
          : kr
      ));
    }
  };

  const handleKeyResultEndDateChange = (index: number, date: Date | null) => {
    if (date) {
      const newDate = date > endDate ? endDate : date;
      setKeyResults(keyResults.map((kr, i) =>
        i === index
          ? {
              ...kr,
              endDate: newDate,
              startDate: newDate < kr.startDate ? newDate : kr.startDate,
            }
          : kr
      ));
    }
  };

  const addKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        description: '',
        targetValue: 0,
        unit: '',
        id: `${keyResults.length + 1}`,
        startDate: startDate,
        endDate: endDate,
      },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      category,
      startDate,
      endDate,
      keyResults: keyResults.map((kr, index) => ({
        id: kr.id || `kr-${index + 1}`,
        description: kr.description,
        targetValue: kr.targetValue,
        currentValue: 0,
        unit: kr.unit,
        startDate,
        endDate,
        progress: 0,
      })),
    });
  };

  const inputClasses = `w-full rounded-lg border shadow-sm text-sm transition-colors focus:ring-2 focus:ring-opacity-50 ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
  }`;

  const datePickerClasses = `${inputClasses} px-3 py-2`;

  return (
    <div className={`p-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {initialObjective ? 'Edit Objective' : 'Create New Objective'}
        </h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClasses}
                placeholder="What do you want to achieve?"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClasses}
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className={datePickerClasses}
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select start date"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className={datePickerClasses}
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select end date"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClasses} h-[140px] resize-none`}
              placeholder="Describe your objective in detail..."
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Key Results
            </h3>
            <button
              type="button"
              onClick={addKeyResult}
              className={`inline-flex items-center text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Key Result
            </button>
          </div>

          <div className="space-y-4">
            {keyResults.map((kr, index) => (
              <div key={kr.id} className={`group relative grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 p-4 rounded-lg border transition-colors duration-150 hover:bg-opacity-50 ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={kr.description}
                      onChange={(e) => updateKeyResult(index, 'description', e.target.value)}
                      placeholder="How will you measure success?"
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Start Date
                      </label>
                      <DatePicker
                        selected={kr.startDate}
                        onChange={(date) => handleKeyResultStartDateChange(index, date)}
                        selectsStart
                        startDate={kr.startDate}
                        endDate={kr.endDate}
                        minDate={startDate}
                        maxDate={endDate}
                        className={datePickerClasses}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select start date"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        End Date
                      </label>
                      <DatePicker
                        selected={kr.endDate}
                        onChange={(date) => handleKeyResultEndDateChange(index, date)}
                        selectsEnd
                        startDate={kr.startDate}
                        endDate={kr.endDate}
                        minDate={kr.startDate}
                        maxDate={endDate}
                        className={datePickerClasses}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select end date"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Target
                    </label>
                    <input
                      type="number"
                      value={kr.targetValue}
                      onChange={(e) => updateKeyResult(index, 'targetValue', Number(e.target.value))}
                      placeholder="Target"
                      className={`${inputClasses} w-24`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Unit
                    </label>
                    <input
                      type="text"
                      value={kr.unit}
                      onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                      placeholder="Unit"
                      className={`${inputClasses} w-24`}
                      required
                    />
                  </div>
                  {keyResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyResult(index)}
                      className={`mb-[2px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDarkMode
                          ? 'text-red-400 hover:text-red-300 hover:bg-gray-700'
                          : 'text-red-500 hover:text-red-600 hover:bg-gray-100'
                      }`}
                      title="Remove Key Result"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {initialObjective ? 'Save Changes' : 'Create Objective'}
          </button>
        </div>
      </form>
    </div>
  );
};
