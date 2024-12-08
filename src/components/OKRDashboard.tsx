import React, { useState, useEffect } from 'react';
import { Objective, groupObjectivesByTime, ObjectiveStatus, KeyResultStatus } from '../types/okr';
import { CreateObjectiveForm } from './CreateObjectiveForm';
import { CategoryManager } from './CategoryManager';
import { ConfirmationModal } from './ConfirmationModal';
import { TimeGroupView } from './TimeGroupView';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OKRDashboardProps {
  isDarkMode?: boolean;
}

export const OKRDashboard: React.FC<OKRDashboardProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

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
          startDate: new Date(obj.start_date),
          endDate: new Date(obj.end_date),
          progress: obj.progress,
          userId: obj.user_id,
          status: obj.status as ObjectiveStatus,
          keyResults: obj.key_results.map((kr: any) => ({
            id: kr.id,
            description: kr.description,
            targetValue: kr.target_value,
            currentValue: kr.current_value,
            unit: kr.unit,
            startDate: new Date(kr.start_date),
            endDate: new Date(kr.end_date),
            progress: kr.progress,
            objectiveId: kr.objective_id,
            status: kr.status as KeyResultStatus
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

  const handleAddObjective = async (objective: Omit<Objective, 'id' | 'progress' | 'userId' | 'status'>) => {
    if (!user?.id) return;

    try {
      const { data: newObjective, error: objectiveError } = await supabase
        .from('objectives')
        .insert([{
          title: objective.title,
          description: objective.description,
          category: objective.category,
          start_date: objective.startDate.toISOString(),
          end_date: objective.endDate.toISOString(),
          progress: 0,
          user_id: user.id,
          status: 'not-started'
        }])
        .select()
        .single();

      if (objectiveError) throw objectiveError;

      if (newObjective) {
        const keyResultPromises = objective.keyResults.map(kr =>
          supabase
            .from('key_results')
            .insert([{
              description: kr.description,
              target_value: kr.targetValue,
              current_value: 0,
              unit: kr.unit,
              start_date: kr.startDate.toISOString(),
              end_date: kr.endDate.toISOString(),
              progress: 0,
              objective_id: newObjective.id,
              status: 'not-started'
            }])
        );

        await Promise.all(keyResultPromises);
        await fetchObjectives();
      }
    } catch (error) {
      console.error('Error adding objective:', error);
    }
    setIsFormOpen(false);
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
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    try {
      await supabase.from('objectives').delete().eq('id', id);
      await fetchObjectives();
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const handleAddCategory = async (name: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_categories')
        .insert({
          name,
          user_id: user.id
        });
      await fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete && user) {
      try {
        // Delete all objectives in this category
        await supabase
          .from('objectives')
          .delete()
          .eq('category', categoryToDelete)
          .eq('user_id', user.id);

        // Delete the category
        await supabase
          .from('user_categories')
          .delete()
          .eq('name', categoryToDelete)
          .eq('user_id', user.id);

        await fetchObjectives();
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleEditObjective = async (objective: Omit<Objective, 'id' | 'progress' | 'userId' | 'status'>) => {
    if (!user?.id || !editingObjective) return;

    try {
      const { error: objectiveError } = await supabase
        .from('objectives')
        .update({
          title: objective.title,
          description: objective.description,
          category: objective.category,
          start_date: objective.startDate.toISOString(),
          end_date: objective.endDate.toISOString(),
        })
        .eq('id', editingObjective.id)
        .eq('user_id', user.id);

      if (objectiveError) throw objectiveError;

      // Delete existing key results
      await supabase
        .from('key_results')
        .delete()
        .eq('objective_id', editingObjective.id);

      // Add new key results
      const keyResultPromises = objective.keyResults.map(kr =>
        supabase
          .from('key_results')
          .insert({
            description: kr.description,
            target_value: kr.targetValue,
            current_value: kr.currentValue || 0,
            unit: kr.unit,
            start_date: kr.startDate.toISOString(),
            end_date: kr.endDate.toISOString(),
            progress: kr.progress || 0,
            objective_id: editingObjective.id,
            status: kr.status || 'not-started'
          })
      );

      await Promise.all(keyResultPromises);
      await fetchObjectives();
      setEditingObjective(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const timeGroups = groupObjectivesByTime(objectives);

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              OKR Dashboard
            </h1>
          </div>
          <div className="flex gap-4">
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              isDarkMode={isDarkMode}
            />
            <button
              onClick={() => setIsFormOpen(true)}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Add Objective
            </button>
          </div>
        </div>

        {timeGroups.length > 0 ? (
          timeGroups.map(group => (
            <TimeGroupView
              key={group.label}
              group={group}
              onEdit={(objectiveId) => {
                const objective = objectives.find(obj => obj.id === objectiveId);
                if (objective) {
                  setEditingObjective(objective);
                  setIsFormOpen(true);
                }
              }}
              onDelete={handleDeleteObjective}
              onUpdateProgress={handleUpdateProgress}
              isDarkMode={isDarkMode}
            />
          ))
        ) : (
          <div className={`flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
          }`}>
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">No objectives found</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className={`mt-4 font-medium ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Create your first objective
            </button>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`relative w-full max-w-4xl rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <CreateObjectiveForm
                onSubmit={editingObjective ? handleEditObjective : handleAddObjective}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingObjective(null);
                }}
                initialObjective={editingObjective}
                isDarkMode={isDarkMode}
                availableCategories={categories}
              />
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDeleteCategory}
          title="Delete Category"
          message={`Are you sure you want to delete this category? This will also delete all objectives in this category.`}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
