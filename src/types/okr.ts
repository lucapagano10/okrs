export interface Milestone {
  date: Date;
  targetValue: number;
  description?: string;
}

export interface KeyResult {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status?: 'not-started' | 'in-progress' | 'completed' | 'at-risk' | 'overdue';
  milestones?: Milestone[];
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
  status?: 'not-started' | 'in-progress' | 'completed' | 'at-risk';
}

export type TimePeriod = 'current-quarter' | 'next-quarter' | 'all';

export interface TimeGroup {
  label: string;
  startDate: Date;
  endDate: Date;
  objectives: Objective[];
  progress: number;
  status: 'current' | 'future' | 'past';
}

export const getStatus = (progress: number): Objective['status'] => {
  if (progress === 0) return 'not-started';
  if (progress >= 100) return 'completed';
  if (progress < 30) return 'at-risk';
  return 'in-progress';
};

export const getKeyResultStatus = (kr: KeyResult): KeyResult['status'] => {
  const now = new Date();

  if (kr.progress >= 100) return 'completed';
  if (now > kr.endDate && kr.progress < 100) return 'overdue';
  if (kr.progress === 0) return 'not-started';

  // Check if the key result is at risk based on time and progress
  const totalDuration = kr.endDate.getTime() - kr.startDate.getTime();
  const elapsedDuration = now.getTime() - kr.startDate.getTime();
  const expectedProgress = (elapsedDuration / totalDuration) * 100;

  if (kr.progress < expectedProgress * 0.7) return 'at-risk';
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

export const groupObjectivesByTime = (
  objectives: Objective[],
  period: TimePeriod
): TimeGroup[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const { quarter: currentQuarter } = getCurrentQuarter();
  const { year: nextQuarterYear, quarter: nextQuarter } = getNextQuarter();

  let groups: TimeGroup[] = [];

  switch (period) {
    case 'current-quarter': {
      const { start, end } = getQuarterDates(currentYear, currentQuarter);
      const filteredObjectives = objectives.filter(obj =>
        isInTimeRange(obj.startDate, start, end)
      );
      if (filteredObjectives.length > 0) {
        groups.push({
          label: formatQuarter(currentYear, currentQuarter),
          startDate: start,
          endDate: end,
          objectives: filteredObjectives,
          progress: calculateGroupProgress(filteredObjectives),
          status: 'current'
        });
      }
      break;
    }
    case 'next-quarter': {
      const { start, end } = getQuarterDates(nextQuarterYear, nextQuarter);
      const filteredObjectives = objectives.filter(obj =>
        isInTimeRange(obj.startDate, start, end)
      );
      if (filteredObjectives.length > 0) {
        groups.push({
          label: formatQuarter(nextQuarterYear, nextQuarter),
          startDate: start,
          endDate: end,
          objectives: filteredObjectives,
          progress: calculateGroupProgress(filteredObjectives),
          status: 'future'
        });
      }
      break;
    }
    case 'all': {
      // Group by year and quarter
      const objectivesByYearQuarter = new Map<string, Objective[]>();

      objectives.forEach(obj => {
        const year = obj.startDate.getFullYear();
        const quarter = getQuarterFromDate(obj.startDate);
        const key = `${year}-${quarter}`;

        if (!objectivesByYearQuarter.has(key)) {
          objectivesByYearQuarter.set(key, []);
        }
        objectivesByYearQuarter.get(key)!.push(obj);
      });

      // Sort by date and create groups
      Array.from(objectivesByYearQuarter.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, objectives]) => {
          const [year, quarter] = key.split('-').map(Number);
          const { start, end } = getQuarterDates(year, quarter);
          const status = getDateStatus(start, end);

          groups.push({
            label: formatQuarter(year, quarter),
            startDate: start,
            endDate: end,
            objectives,
            progress: calculateGroupProgress(objectives),
            status
          });
        });
      break;
    }
  }

  return groups;
};

const calculateGroupProgress = (objectives: Objective[]): number => {
  if (objectives.length === 0) return 0;
  return objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length;
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
