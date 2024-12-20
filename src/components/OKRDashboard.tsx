import React, { useState, useEffect } from 'react';
import { Objective, groupObjectivesByTime, ObjectiveStatus, KeyResultStatus } from '../types/okr';
import { TimeGroupView } from './TimeGroupView';
import { TimelineView } from './TimelineView';
import { CalendarView } from './CalendarView';
import { CategoryFilter } from './CategoryFilter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { OKRModal } from './OKRModal';
import { CreateObjectiveForm } from './CreateObjectiveForm';
import { ImportFromSheets } from './ImportFromSheets';
import { ProgressCharts } from './ProgressCharts';

type ViewMode = 'List' | 'Timeline' | 'Calendar';

interface OKRDashboardProps {
  isDarkMode?: boolean;
}

const DashboardOverview: React.FC<{ objectives: Objective[]; isDarkMode: boolean }> = ({ objectives, isDarkMode }) => {
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(obj => obj.progress === 100).length;
  const overallProgress = objectives.reduce((acc, obj) => acc + obj.progress, 0) / (totalObjectives || 1);

  // Group by category
  const categoryStats = objectives.reduce((acc, obj) => {
    acc[obj.category] = (acc[obj.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get upcoming deadlines (within current month)
  const upcomingDeadlines = objectives
    .filter(obj => {
      const deadline = new Date(obj.endDate);
      const today = new Date();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return deadline >= today && deadline <= endOfMonth;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8`}>
      {/* Overall Progress */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Overall Progress
        </h3>
        <div className="mt-2 flex items-baseline">
          <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {Math.round(overallProgress)}%
          </p>
          <p className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ({completedObjectives}/{totalObjectives} completed)
          </p>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Category Breakdown
        </h3>
        <div className="mt-2 space-y-2">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category} className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {category}
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm col-span-1 md:col-span-2`}>
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Upcoming Deadlines
        </h3>
        <div className="mt-2 space-y-2">
          {upcomingDeadlines.slice(0, 3).map(obj => (
            <div key={obj.id} className="flex justify-between items-center">
              <span className={`text-sm truncate flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {obj.title}
              </span>
              <span className={`text-sm ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(obj.endDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {upcomingDeadlines.length === 0 && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No upcoming deadlines in the next 7 days
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const OKRDashboard: React.FC<OKRDashboardProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [viewMode, setViewMode] = useState<ViewMode>('List');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingObjective, setIsCreatingObjective] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Fetch objectives and categories when user changes
  useEffect(() => {
    if (user) {
      fetchObjectives();
      fetchCategories();
    }
  }, [user]);

  // Update filtered objectives when objectives or selected category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredObjectives(objectives.filter(obj => obj.category === selectedCategory));
    } else {
      setFilteredObjectives(objectives);
    }
  }, [objectives, selectedCategory]);

  const fetchObjectives = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  const handleAddCategory = async (name: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_categories')
        .insert([{ name, user_id: user.id }]);

      if (error) throw error;

      await fetchCategories();
      showNotification('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_categories')
        .delete()
        .eq('name', category)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCategories();
      if (selectedCategory === category) {
        setSelectedCategory(null);
      }
      showNotification('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('Failed to delete category', 'error');
    }
  };

  const handleEditObjective = (objectiveId: string) => {
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (objective) {
      setEditingObjective(objective);
    }
  };

  const handleSaveObjective = async (objectiveData: Partial<Objective>) => {
    if (!user?.id) return;

    try {
      if (editingObjective) {
        // Update existing objective
        const { error: objError } = await supabase
          .from('objectives')
          .update({
            title: objectiveData.title || '',
            description: objectiveData.description || '',
            category: objectiveData.category || '',
            start_date: objectiveData.startDate || new Date().toISOString(),
            end_date: objectiveData.endDate || new Date().toISOString(),
            status: 'not-started' as const
          })
          .eq('id', editingObjective.id);

        if (objError) throw objError;

        // Get IDs of key results that should remain
        const updatedKrIds = new Set((objectiveData.keyResults || [])
          .filter(kr => kr.id)
          .map(kr => kr.id));

        // Delete key results that were removed
        const { error: deleteError } = await supabase
          .from('key_results')
          .delete()
          .eq('objective_id', editingObjective.id)
          .not('id', 'in', `(${Array.from(updatedKrIds).join(',')})`);

        if (deleteError) throw deleteError;

        // Update or create key results
        for (const kr of objectiveData.keyResults || []) {
          if (kr.id) {
            // Update existing key result
            const { error: krError } = await supabase
              .from('key_results')
              .update({
                description: kr.description || '',
                target_value: kr.targetValue || 0,
                current_value: kr.currentValue || 0,
                unit: kr.unit || '',
                start_date: kr.startDate || new Date().toISOString(),
                end_date: kr.endDate || new Date().toISOString(),
                status: 'not-started' as const
              })
              .eq('id', kr.id);

            if (krError) throw krError;
          } else {
            // Create new key result
            const { error: krError } = await supabase
              .from('key_results')
              .insert([{
                description: kr.description || '',
                target_value: kr.targetValue || 0,
                current_value: kr.currentValue || 0,
                unit: kr.unit || '',
                objective_id: editingObjective.id,
                start_date: kr.startDate || new Date().toISOString(),
                end_date: kr.endDate || new Date().toISOString(),
                status: 'not-started' as const,
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
            title: objectiveData.title || '',
            description: objectiveData.description || '',
            category: objectiveData.category || '',
            start_date: objectiveData.startDate || new Date().toISOString(),
            end_date: objectiveData.endDate || new Date().toISOString(),
            user_id: user.id,
            progress: 0,
            status: 'not-started' as const
          }])
          .select()
          .single();

        if (objError || !objective) throw objError;

        // Create key results
        for (const kr of objectiveData.keyResults || []) {
          const { error: krError } = await supabase
            .from('key_results')
            .insert([{
              description: kr.description || '',
              target_value: kr.targetValue || 0,
              current_value: kr.currentValue || 0,
              unit: kr.unit || '',
              objective_id: objective.id,
              start_date: kr.startDate || new Date().toISOString(),
              end_date: kr.endDate || new Date().toISOString(),
              progress: 0,
              status: 'not-started' as const
            }]);

          if (krError) throw krError;
        }
      }

      showNotification('Objective saved successfully');
      await fetchObjectives();
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

  const handleUpdateKeyResult = async (objectiveId: string, keyResultId: string, currentValue: number) => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

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

      fetchObjectives();
      showNotification('Progress updated successfully');
    } catch (error) {
      console.error('Error in handleUpdateKeyResult:', error);
      showNotification('Failed to update progress', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateObjective = async (objective: Omit<Objective, 'id' | 'progress' | 'user_id' | 'status'>) => {
    try {
      setIsLoading(true);

      // Transform the data to match database schema
      const objectiveData = {
        title: objective.title,
        description: objective.description,
        category: objective.category,
        start_date: objective.startDate,
        end_date: objective.endDate,
        progress: 0,
        user_id: user?.id || '',
        status: 'not-started' as const
      };

      const { data, error } = await supabase
        .from('objectives')
        .insert([objectiveData])
        .select()
        .single();

      if (error) throw error;

      // Handle key results separately if needed
      if (data) {
        const keyResultsData = objective.keyResults.map(kr => ({
          description: kr.description,
          target_value: kr.targetValue,
          current_value: kr.currentValue,
          unit: kr.unit,
          start_date: kr.startDate,
          end_date: kr.endDate,
          progress: 0,
          objective_id: data.id,
          status: 'not-started' as const
        }));

        const { error: krError } = await supabase
          .from('key_results')
          .insert(keyResultsData);

        if (krError) throw krError;
      }

      setToastMessage('Objective created successfully');
      setToastType('success');
      setShowToast(true);
      setIsCreatingObjective(false);
      await fetchObjectives();
    } catch (error) {
      console.error('Error creating objective:', error);
      setToastMessage('Failed to create objective');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Dashboard Overview */}
          <DashboardOverview objectives={objectives} isDarkMode={isDarkMode} />

          {/* Progress Charts */}
          <ProgressCharts objectives={objectives} isDarkMode={isDarkMode} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreatingObjective(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Add New Objective
              </button>
              <button
                onClick={() => setIsImporting(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Import from Sheets
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center rounded-lg overflow-hidden border ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                {(['List', 'Timeline', 'Calendar'] as const).map((mode: ViewMode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? isDarkMode
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-900'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Main content area */}
          <div className={`rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent text-blue-500"></div>
              </div>
            ) : (
              <>
                {viewMode === 'List' && (
                  <div className="space-y-6">
                    {Object.entries(groupObjectivesByTime(filteredObjectives)).map(([key, group]) => (
                      <TimeGroupView
                        key={key}
                        group={group}
                        onEdit={handleEditObjective}
                        onDelete={handleDeleteObjective}
                        onUpdateProgress={handleUpdateKeyResult}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                )}
                {viewMode === 'Timeline' && (
                  <TimelineView
                    objectives={filteredObjectives}
                    onObjectiveClick={handleEditObjective}
                    isDarkMode={isDarkMode}
                  />
                )}
                {viewMode === 'Calendar' && (
                  <CalendarView
                    objectives={filteredObjectives}
                    onObjectiveClick={handleEditObjective}
                    isDarkMode={isDarkMode}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreatingObjective && (
        <CreateObjectiveForm
          isOpen={isCreatingObjective}
          onSubmit={handleCreateObjective}
          onCancel={() => setIsCreatingObjective(false)}
          availableCategories={categories}
          isDarkMode={isDarkMode}
        />
      )}

      {editingObjective && (
        <OKRModal
          isOpen={!!editingObjective}
          onClose={() => setEditingObjective(null)}
          objective={editingObjective}
          onSave={handleSaveObjective}
          categories={categories}
          isDarkMode={isDarkMode}
        />
      )}

      {isImporting && (
        <ImportFromSheets
          isOpen={isImporting}
          onClose={() => {
            setIsImporting(false);
            fetchObjectives(); // Refresh objectives after import
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          toastType === 'success'
            ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
            : isDarkMode ? 'bg-red-500' : 'bg-red-600'
        } text-white`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};
