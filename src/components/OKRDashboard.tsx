import React, { useState, useEffect } from 'react';
import { Objective, Category, TimeGroup, groupObjectivesByTime } from '../types/okr';
import { ObjectiveCard } from './ObjectiveCard';
import { CreateObjectiveForm } from './CreateObjectiveForm';
import { CategoryManager } from './CategoryManager';
import { ConfirmationModal } from './ConfirmationModal';
import { TimeGroupView } from './TimeGroupView';

const LOCAL_STORAGE_KEYS = {
  OBJECTIVES: 'okrs_objectives',
  CATEGORIES: 'okrs_categories'
};

// Helper function to convert string dates back to Date objects
const rehydrateDates = (objective: any): Objective => ({
  ...objective,
  startDate: new Date(objective.startDate),
  endDate: new Date(objective.endDate),
  keyResults: objective.keyResults.map((kr: any) => ({
    ...kr,
    startDate: new Date(kr.startDate),
    endDate: new Date(kr.endDate)
  }))
});

interface OKRDashboardProps {
  isDarkMode?: boolean;
}

export const OKRDashboard: React.FC<OKRDashboardProps> = ({ isDarkMode = false }) => {
  // Initialize state from localStorage or default values
  const [objectives, setObjectives] = useState<Objective[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.OBJECTIVES);
      if (saved) {
        const parsedObjectives = JSON.parse(saved);
        return Array.isArray(parsedObjectives)
          ? parsedObjectives.map(rehydrateDates)
          : [];
      }
      return [];
    } catch (error) {
      console.error('Error loading objectives from localStorage:', error);
      return [];
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : ['Personal', 'Professional', 'Health', 'Learning'];
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      return ['Personal', 'Professional', 'Health', 'Learning'];
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Save to localStorage whenever objectives or categories change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.OBJECTIVES, JSON.stringify(objectives));
    } catch (error) {
      console.error('Error saving objectives to localStorage:', error);
    }
  }, [objectives]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }, [categories]);

  // Rest of your component code...
