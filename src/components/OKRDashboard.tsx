import React, { useState, useEffect } from 'react';
import { Objective, groupObjectivesByTime, ObjectiveStatus, KeyResultStatus } from '../types/okr';
import { TimeGroupView } from './TimeGroupView';
import { TimeFilter } from './TimeFilter';
import { TimelineView } from './TimelineView';
import { CalendarView } from './CalendarView';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';
import { OKRModal } from './OKRModal';

type ViewMode = 'list' | 'timeline' | 'calendar';

interface OKRDashboardProps {
  isDarkMode?: boolean;
}

export const OKRDashboard: React.FC<OKRDashboardProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'current' | 'past' | 'future'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | undefined>();

  // Fetch objectives and categories when user changes
  useEffect(() => {
    if (user) {
      fetchObjectives();
      fetchCategories();
    }
  }, [user]);

  const fetchObjectives = async () => {
    if (!user?.id) return;

    try {
      const { data: objectives, error } = await supabase
        .from('objectives')
        .select(`
          *,
          key_results (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (objectives) {
        const formattedObjectives: Objective[] = objectives.map(obj => ({
          id: obj.id,
          title: obj.title,
          description: obj.description,
          category: obj.category,
          startDate: obj.start_date,
          endDate: obj.end_date,
          progress: obj.progress,
          status: obj.status as ObjectiveStatus,
          user_id: obj.user_id,
          keyResults: obj.key_results.map(kr => ({
            id: kr.id,
            description: kr.description,
            targetValue: kr.target_value,
            currentValue: kr.current_value,
            unit: kr.unit,
            startDate: kr.start_date,
            endDate: kr.end_date,
            progress: kr.progress,
            status: kr.status as KeyResultStatus,
            objective_id: kr.objective_id
          }))
        }));

        setObjectives(formattedObjectives);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
    }
  };

  const fetchCategories = async () => {
    if (!user?.id) return;

    try {
      const { data: categories, error } = await supabase
        .from('user_categories')
        .select('name')
        .eq('user_id', user.id);

      if (error) throw error;

      if (categories) {
        setCategories(categories.map(c => c.name));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter objectives based on search query, time filter, and category filter
  useEffect(() => {
    let filtered = objectives;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(obj =>
        obj.title.toLowerCase().includes(query) ||
        obj.description.toLowerCase().includes(query) ||
        obj.category.toLowerCase().includes(query) ||
        obj.keyResults.some(kr => kr.description.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(obj => obj.category === categoryFilter);
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(obj => {
        const startDate = new Date(obj.startDate);
        const endDate = new Date(obj.endDate);

        switch (timeFilter) {
          case 'current':
            return startDate <= now && endDate >= now;
          case 'past':
            return endDate < now;
          case 'future':
            return startDate > now;
          default:
            return true;
        }
      });
    }

    setFilteredObjectives(filtered);
  }, [timeFilter, categoryFilter, objectives, searchQuery]);

  const handleAddObjective = async (objectiveData: {
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    keyResults: {
      description: string;
      targetValue: number;
      currentValue: number;
      unit: string;
      startDate: string;
      endDate: string;
    }[];
  }) => {
    if (!user?.id) return;

    try {
      // First, create the objective
      const objectiveToInsert = {
        title: objectiveData.title,
        description: objectiveData.description,
        category: objectiveData.category,
        start_date: objectiveData.startDate,
        end_date: objectiveData.endDate,
        user_id: user.id,
        progress: 0,
        status: 'not-started' as const
      };

      const { data: objective, error: objError } = await supabase
        .from('objectives')
        .insert([objectiveToInsert])
        .select()
        .single();

      if (objError || !objective) throw objError;

      // Then, create the key results
      for (const kr of objectiveData.keyResults) {
        const keyResultToInsert = {
          description: kr.description,
          target_value: kr.targetValue,
          current_value: kr.currentValue || 0,
          unit: kr.unit,
          start_date: kr.startDate,
          end_date: kr.endDate,
          progress: 0,
          objective_id: objective.id,
          status: 'not-started' as const
        };

        const { error: krError } = await supabase
          .from('key_results')
          .insert([keyResultToInsert]);

        if (krError) throw krError;
      }

      fetchObjectives();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error in handleAddObjective:', error);
    }
  };

  const handleUpdateObjective = async (objectiveData: {
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    keyResults: {
      id?: string;
      description: string;
      targetValue: number;
      currentValue: number;
      unit: string;
      startDate: string;
      endDate: string;
    }[];
  }, selectedObjective: { id: string }) => {
    if (!user?.id) return;

    try {
      // Update objective
      const { error: objError } = await supabase
        .from('objectives')
        .update({
          title: objectiveData.title,
          description: objectiveData.description,
          category: objectiveData.category,
          start_date: objectiveData.startDate,
          end_date: objectiveData.endDate,
          status: 'active' as const
        })
        .eq('id', selectedObjective.id);

      if (objError) throw objError;

      // Update or create key results
      for (const kr of objectiveData.keyResults) {
        if (kr.id) {
          // Update existing key result
          const { error: krError } = await supabase
            .from('key_results')
            .update({
              description: kr.description,
              target_value: kr.targetValue,
              current_value: kr.currentValue || 0,
              unit: kr.unit,
              start_date: kr.startDate,
              end_date: kr.endDate,
              status: 'active' as const
            })
            .eq('id', kr.id);

          if (krError) throw krError;
        } else {
          // Create new key result
          const { error: krError } = await supabase
            .from('key_results')
            .insert([{
              description: kr.description,
              target_value: kr.targetValue,
              current_value: kr.currentValue || 0,
              unit: kr.unit,
              objective_id: selectedObjective.id,
              start_date: kr.startDate,
              end_date: kr.endDate,
              status: 'active' as const,
              progress: 0
            }]);

          if (krError) throw krError;
        }
      }

      fetchObjectives();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const handleEditObjective = (objectiveId: string) => {
    const objective = objectives.find(obj => obj.id === objectiveId);
    setSelectedObjective(objective);
    setIsModalOpen(true);
  };

  const handleCreateObjective = () => {
    setSelectedObjective(undefined);
    setIsModalOpen(true);
  };

  const handleSaveObjective = async (objectiveData: {
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    keyResults: {
      id?: string;
      description: string;
      targetValue: number;
      currentValue: number;
      unit: string;
      startDate: string;
      endDate: string;
    }[];
  }) => {
    if (!user?.id) return;

    try {
      if (selectedObjective) {
        // Update existing objective
        const { error: objError } = await supabase
          .from('objectives')
          .update({
            title: objectiveData.title,
            description: objectiveData.description,
            category: objectiveData.category,
            start_date: objectiveData.startDate,
            end_date: objectiveData.endDate,
            status: 'active' as const
          })
          .eq('id', selectedObjective.id);

        if (objError) throw objError;

        // Update or create key results
        for (const kr of objectiveData.keyResults) {
          if (kr.id) {
            // Update existing key result
            const { error: krError } = await supabase
              .from('key_results')
              .update({
                description: kr.description,
                target_value: kr.targetValue,
                current_value: kr.currentValue || 0,
                unit: kr.unit,
                start_date: kr.startDate,
                end_date: kr.endDate,
                status: 'active' as const
              })
              .eq('id', kr.id);

            if (krError) throw krError;
          } else {
            // Create new key result
            const { error: krError } = await supabase
              .from('key_results')
              .insert([{
                description: kr.description,
                target_value: kr.targetValue,
                current_value: kr.currentValue || 0,
                unit: kr.unit,
                objective_id: selectedObjective.id,
                start_date: kr.startDate,
                end_date: kr.endDate,
                status: 'active' as const,
                progress: 0
              }]);

            if (krError) throw krError;
          }
        }
      } else {
        // Create new objective
        const { data: objective, error: objError } = await supabase
          .from('objectives')
          .insert([{
            title: objectiveData.title,
            description: objectiveData.description,
            category: objectiveData.category,
            start_date: objectiveData.startDate,
            end_date: objectiveData.endDate,
            user_id: user.id,
            progress: 0,
            status: 'active' as const
          }])
          .select()
          .single();

        if (objError || !objective) throw objError;

        // Create key results
        for (const kr of objectiveData.keyResults) {
          const { error: krError } = await supabase
            .from('key_results')
            .insert([{
              description: kr.description,
              target_value: kr.targetValue,
              current_value: kr.currentValue || 0,
              unit: kr.unit,
              objective_id: objective.id,
              start_date: kr.startDate,
              end_date: kr.endDate,
              progress: 0,
              status: 'active' as const
            }]);

          if (krError) throw krError;
        }
      }

      fetchObjectives();
      setIsModalOpen(false);
      showNotification('Objective saved successfully');
    } catch (error) {
      console.error('Error saving objective:', error);
      showNotification('Failed to save objective', 'error');
    }
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (!user?.id) return;

    try {
      // Delete key results first
      const { error: krError } = await supabase
        .from('key_results')
        .delete()
        .eq('objective_id', objectiveId);

      if (krError) throw krError;

      // Then delete the objective
      const { error: objError } = await supabase
        .from('objectives')
        .delete()
        .eq('id', objectiveId)
        .eq('user_id', user.id);

      if (objError) throw objError;

      fetchObjectives();
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const handleUpdateProgress = async (objectiveId: string, keyResultId: string, currentValue: number) => {
    try {
      const keyResult = objectives
        .find(obj => obj.id === objectiveId)
        ?.keyResults.find(kr => kr.id === keyResultId);

      if (keyResult) {
        const progress = (currentValue / keyResult.targetValue) * 100;

        await supabase
          .from('key_results')
          .update({
            current_value: currentValue,
            progress
          })
          .eq('id', keyResultId);

        // Update objective progress
        const objective = objectives.find(obj => obj.id === objectiveId);
        if (objective) {
          const updatedKeyResults = objective.keyResults.map(kr =>
            kr.id === keyResultId ? { ...kr, currentValue, progress } : kr
          );
          const overallProgress = updatedKeyResults.reduce((sum, kr) => sum + kr.progress, 0) / updatedKeyResults.length;

          await supabase
            .from('objectives')
            .update({ progress: overallProgress })
            .eq('id', objectiveId);

          await fetchObjectives();
          showNotification('Progress updated successfully');
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      showNotification('Failed to update progress', 'error');
    }
  };

  const handleAddCategory = async (name: string) => {
    if (!user?.id) return;

    // Validate category name
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) return;

    // Check if category already exists
    if (categories.includes(trimmedName)) {
      showNotification('Category already exists', 'error');
      return;
    }

    try {
      await supabase
        .from('user_categories')
        .insert({
          name: trimmedName,
          user_id: user.id
        });
      await fetchCategories();
      showNotification('Category added successfully');
      setNewCategoryInput('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async (category: string) => {
    if (!user) return;
    try {
      // Delete all objectives in this category
      await supabase
        .from('objectives')
        .delete()
        .eq('category', category)
        .eq('user_id', user.id);

      // Delete the category
      await supabase
        .from('user_categories')
        .delete()
        .eq('name', category)
        .eq('user_id', user.id);

      await fetchCategories();
      await fetchObjectives();
      setShowDeleteModal(false);
      showNotification('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('Failed to delete category', 'error');
    }
  };

  const groupedObjectives = groupObjectivesByTime(filteredObjectives);

  // Get category counts
  const categoryCounts = objectives.reduce((acc, obj) => {
    acc[obj.category] = (acc[obj.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdateKeyResult = async (objectiveId: string, keyResultId: string, currentValue: number) => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    console.log('Updating key result:', { objectiveId, keyResultId, currentValue });

    try {
      // First get the key result to calculate progress
      const { data: keyResult, error: krError } = await supabase
        .from('key_results')
        .select('target_value')
        .eq('id', keyResultId)
        .single();

      if (krError) {
        console.error('Error fetching key result:', krError);
        throw krError;
      }

      if (!keyResult) {
        console.error('No key result found with ID:', keyResultId);
        throw new Error('Key result not found');
      }

      const progress = (currentValue / keyResult.target_value) * 100;
      console.log('Calculated progress:', progress);

      const { error } = await supabase
        .from('key_results')
        .update({
          current_value: currentValue,
          progress
        })
        .eq('id', keyResultId)
        .eq('objective_id', objectiveId);

      if (error) {
        console.error('Error updating key result:', error);
        throw error;
      }

      console.log('Successfully updated key result');
      fetchObjectives();
    } catch (error) {
      console.error('Error in handleUpdateKeyResult:', error);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all transform ${
          toastType === 'success'
            ? isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
            : isDarkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
        }`}>
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">My OKRs</h1>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg overflow-hidden border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-900'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-900'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? isDarkMode
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-900'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Calendar
              </button>
            </div>
            <button
              onClick={handleCreateObjective}
              className={`px-4 py-2 rounded-lg font-medium ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Add New Objective
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search objectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            {viewMode === 'list' && (
              <TimeFilter
                selectedFilter={timeFilter}
                onFilterChange={setTimeFilter}
                isDarkMode={isDarkMode}
              />
            )}
          </div>

          {/* Category Labels */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Add Category Button/Input */}
            <div className="relative">
              {isAddingCategory ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddCategory(newCategoryInput);
                  }}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="New category..."
                    autoFocus
                    className={`w-32 px-3 py-1 rounded-l-full text-sm transition-all outline-none ${
                      isDarkMode
                        ? 'bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-700'
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    } border-2 border-r-0 ${
                      isDarkMode ? 'border-gray-700 focus:border-blue-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsAddingCategory(false);
                        setNewCategoryInput('');
                      }
                    }}
                    onBlur={() => {
                      if (!newCategoryInput.trim()) {
                        setIsAddingCategory(false);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className={`px-2 py-1 rounded-r-full text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:text-white border-2 border-l-0 border-gray-700'
                        : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-l-0 border-gray-200'
                    }`}
                  >
                    Add
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } border-2 border-transparent hover:border-gray-200 flex items-center gap-1`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Category</span>
                </button>
              )}
            </div>

            {/* All Categories Label */}
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                categoryFilter === 'all'
                  ? isDarkMode
                    ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                    : 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                categoryFilter === 'all'
                  ? 'bg-white bg-opacity-20'
                  : isDarkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-200'
              }`}>
                {objectives.length}
              </span>
            </button>

            {/* Category Labels */}
            {categories.map(category => (
              <div key={category} className="group relative">
                <button
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    categoryFilter === category
                      ? isDarkMode
                        ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                        : 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2'
                      : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    categoryFilter === category
                      ? 'bg-white bg-opacity-20'
                      : isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}>
                    {categoryCounts[category] || 0}
                  </span>
                </button>

                {/* Delete Button - Shows on Hover */}
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className={`absolute -right-2 -top-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDarkMode
                      ? 'bg-gray-700 text-red-400 hover:bg-gray-600 hover:text-red-300'
                      : 'bg-white text-red-500 hover:text-red-600 shadow-sm'
                  }`}
                  title="Delete Category"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent"></div>
          </div>
        ) : filteredObjectives.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {searchQuery || categoryFilter !== 'all' ? (
              <>
                <h3 className="text-xl font-medium mb-2">No matching objectives found</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Try adjusting your search or filter criteria
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium mb-2">No objectives yet</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click "Add New Objective" to get started
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              groupedObjectives.map((group) => (
                <TimeGroupView
                  key={`${group.startDate.toISOString()}-${group.endDate.toISOString()}`}
                  group={group}
                  onEdit={handleEditObjective}
                  onDelete={handleDeleteObjective}
                  onUpdateProgress={handleUpdateProgress}
                  isDarkMode={isDarkMode}
                />
              ))
            )}
            {viewMode === 'timeline' && (
              <TimelineView
                objectives={filteredObjectives}
                onEditObjective={handleEditObjective}
                isDarkMode={isDarkMode}
              />
            )}
            {viewMode === 'calendar' && (
              <CalendarView
                objectives={filteredObjectives}
                onEditObjective={handleEditObjective}
                isDarkMode={isDarkMode}
              />
            )}
          </>
        )}
      </div>

      {/* Existing modals and forms */}
      <OKRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveObjective}
        objective={selectedObjective}
        isDarkMode={isDarkMode}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (categoryToDelete) {
            confirmDeleteCategory(categoryToDelete);
            setCategoryToDelete(null);
          }
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? All objectives in this category will also be deleted."
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
