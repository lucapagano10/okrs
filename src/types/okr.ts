export interface Milestone {
  date: Date;
  targetValue: number;
  description?: string;
}

export type KeyResultStatus = 'not-started' | 'in-progress' | 'completed' | 'at-risk' | 'overdue';
export type ObjectiveStatus = 'not-started' | 'in-progress' | 'completed' | 'at-risk';

export interface KeyResult {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  objectiveId: string;
  status?: KeyResultStatus;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  keyResults: KeyResult[];
  userId: string;
  status?: ObjectiveStatus;
}

export type TimePeriod = 'current-quarter' | 'next-quarter' | 'all';

export interface TimeGroup {
  label: string;
  status: 'past' | 'current' | 'future';
  startDate: Date;
  endDate: Date;
  objectives: Objective[];
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

  if (kr.progress >= 100) return 'completed';
  if (now > kr.endDate) return 'overdue';
  if (kr.progress === 0) return 'not-started';

  const totalDuration = kr.endDate.getTime() - kr.startDate.getTime();
  const elapsed = now.getTime() - kr.startDate.getTime();
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

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const calculateDaysRemaining = (endDate: Date): number => {
  const now = new Date();
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
