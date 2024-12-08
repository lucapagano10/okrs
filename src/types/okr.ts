export interface Milestone {
  date: Date;
  targetValue: number;
  description?: string;
}

export type KeyResultStatus = 'not-started' | 'in-progress' | 'completed' | 'at-risk' | 'overdue';
export type ObjectiveStatus = 'not-started' | 'in-progress' | 'completed' | 'at-risk';

export interface KeyResult {
  id?: string;
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

export interface Objective {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: ObjectiveStatus;
  user_id: string;
  keyResults: KeyResult[];
  created_at?: string;
  updated_at?: string;
}

export type TimePeriod = 'current-quarter' | 'next-quarter' | 'all';

export interface TimeGroup {
  label: string;
  startDate: Date;
  endDate: Date;
  objectives: Objective[];
  status: 'past' | 'current' | 'future';
  progress: number;
}

export const getStatus = (progress: number): ObjectiveStatus => {
  if (progress === 0) return 'not-started';
  if (progress >= 100) return 'completed';
  if (progress < 30) return 'at-risk';
  return 'in-progress';
};

export const getKeyResultStatus = (kr: KeyResult): KeyResultStatus => {
  const now = new Date();
  const endDate = new Date(kr.endDate);
  const startDate = new Date(kr.startDate);

  if (kr.progress >= 100) return 'completed';
  if (now > endDate) return 'overdue';
  if (kr.progress === 0) return 'not-started';

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const expectedProgress = (elapsed / totalDuration) * 100;

  if (kr.progress < expectedProgress - 20) return 'at-risk';
  return 'in-progress';
};

export const getDateStatus = (startDate: Date, endDate: Date): 'future' | 'current' | 'past' => {
  const now = new Date();
  if (now < startDate) return 'future';
  if (now > endDate) return 'past';
  return 'current';
};

export const getMilestoneStatus = (milestone: Milestone, currentValue: number): 'upcoming' | 'achieved' | 'missed' => {
  const now = new Date();
  if (now < milestone.date) return 'upcoming';
  return currentValue >= milestone.targetValue ? 'achieved' : 'missed';
};

export const getQuarterFromDate = (date: Date): number => {
  return Math.floor(date.getMonth() / 3) + 1;
};

export const getQuarterDates = (year: number, quarter: number): { start: Date; end: Date } => {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return { start, end };
};

export const getCurrentQuarter = (): { year: number; quarter: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    quarter: getQuarterFromDate(now),
  };
};

export const getNextQuarter = (): { year: number; quarter: number } => {
  const { year, quarter } = getCurrentQuarter();
  if (quarter === 4) {
    return { year: year + 1, quarter: 1 };
  }
  return { year, quarter: quarter + 1 };
};

export const formatQuarter = (year: number, quarter: number): string => {
  return `Q${quarter} ${year}`;
};

export const isInTimeRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

export const formatDateRange = (startDateStr: string, endDateStr: string): string => {
  return `${formatDate(startDateStr)} - ${formatDate(endDateStr)}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const calculateDaysRemaining = (endDateStr: string): number => {
  const now = new Date();
  const endDate = new Date(endDateStr);
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const groupObjectivesByTime = (objectives: Objective[]): TimeGroup[] => {
  const now = new Date();
  const groups: TimeGroup[] = [];

  objectives.forEach(objective => {
    const startDate = new Date(objective.startDate);
    const endDate = new Date(objective.endDate);
    const quarterStart = new Date(startDate.getFullYear(), Math.floor(startDate.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(endDate.getFullYear(), Math.floor(endDate.getMonth() / 3) * 3 + 2, 31);

    let group = groups.find(g =>
      g.startDate.getTime() === quarterStart.getTime() &&
      g.endDate.getTime() === quarterEnd.getTime()
    );

    if (!group) {
      group = {
        label: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear()}`,
        status: quarterEnd < now ? 'past' : quarterStart > now ? 'future' : 'current',
        startDate: quarterStart,
        endDate: quarterEnd,
        objectives: [],
        progress: 0,
      };
      groups.push(group);
    }

    group.objectives.push(objective);
  });

  // Calculate progress for each group
  groups.forEach(group => {
    if (group.objectives.length > 0) {
      group.progress = group.objectives.reduce((sum, obj) => sum + obj.progress, 0) / group.objectives.length;
    }
  });

  // Sort groups by date
  return groups.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

// Default categories
export const DEFAULT_CATEGORIES = [
  'career',
  'health',
  'learning',
  'personal',
  'finance',
  'relationships',
] as const;

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];

// Type guards
export const isValidObjective = (obj: any): obj is Objective => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.startDate === 'string' &&
    typeof obj.endDate === 'string' &&
    typeof obj.progress === 'number' &&
    typeof obj.user_id === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.keyResults)
  );
};

export const isValidKeyResult = (kr: any): kr is KeyResult => {
  return (
    typeof kr === 'object' &&
    kr !== null &&
    typeof kr.description === 'string' &&
    typeof kr.targetValue === 'number' &&
    typeof kr.currentValue === 'number' &&
    typeof kr.unit === 'string' &&
    typeof kr.startDate === 'string' &&
    typeof kr.endDate === 'string' &&
    typeof kr.progress === 'number' &&
    typeof kr.status === 'string'
  );
};

// Debug utilities
export const validateObjective = (obj: any): string[] => {
  const errors: string[] = [];
  if (!obj) {
    errors.push('Objective is null or undefined');
    return errors;
  }

  if (typeof obj !== 'object') {
    errors.push('Objective is not an object');
    return errors;
  }

  if (typeof obj.title !== 'string') errors.push('title must be a string');
  if (typeof obj.description !== 'string') errors.push('description must be a string');
  if (typeof obj.category !== 'string') errors.push('category must be a string');
  if (typeof obj.startDate !== 'string') errors.push('startDate must be a string');
  if (typeof obj.endDate !== 'string') errors.push('endDate must be a string');
  if (typeof obj.progress !== 'number') errors.push('progress must be a number');
  if (typeof obj.user_id !== 'string') errors.push('user_id must be a string');
  if (typeof obj.status !== 'string') errors.push('status must be a string');
  if (!Array.isArray(obj.keyResults)) errors.push('keyResults must be an array');

  return errors;
};

export const validateKeyResult = (kr: any): string[] => {
  const errors: string[] = [];
  if (!kr) {
    errors.push('KeyResult is null or undefined');
    return errors;
  }

  if (typeof kr !== 'object') {
    errors.push('KeyResult is not an object');
    return errors;
  }

  if (typeof kr.description !== 'string') errors.push('description must be a string');
  if (typeof kr.targetValue !== 'number') errors.push('targetValue must be a number');
  if (typeof kr.currentValue !== 'number') errors.push('currentValue must be a number');
  if (typeof kr.unit !== 'string') errors.push('unit must be a string');
  if (typeof kr.startDate !== 'string') errors.push('startDate must be a string');
  if (typeof kr.endDate !== 'string') errors.push('endDate must be a string');
  if (typeof kr.progress !== 'number') errors.push('progress must be a number');
  if (typeof kr.status !== 'string') errors.push('status must be a string');

  return errors;
};
