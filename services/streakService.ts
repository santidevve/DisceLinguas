const STREAK_STORAGE_KEY = 'lingua_reader_streak_v2';

export interface Streak {
  count: number;
  lastCompleted: number | null; // Timestamp of the last completed lesson
}

const isSameDay = (ts1: number, ts2: number): boolean => {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const isYesterday = (ts1: number, ts2: number): boolean => {
  const yesterday = new Date(ts1);
  yesterday.setDate(yesterday.getDate() - 1);
  const d2 = new Date(ts2);
  
  return yesterday.getFullYear() === d2.getFullYear() &&
         yesterday.getMonth() === d2.getMonth() &&
         yesterday.getDate() === d2.getDate();
};

type StreakData = Map<string, Streak>;


export const streakService = {
  getStreak: (language: string): Streak => {
    try {
      const storedStreaks = localStorage.getItem(STREAK_STORAGE_KEY);
      if (storedStreaks) {
        const streakMap: StreakData = new Map(JSON.parse(storedStreaks));
        const langStreak = streakMap.get(language);

        if (langStreak) {
          // Check if streak should be reset due to inactivity
          if (langStreak.lastCompleted && !isSameDay(Date.now(), langStreak.lastCompleted) && !isYesterday(Date.now(), langStreak.lastCompleted)) {
              return { count: 0, lastCompleted: null };
          }
          return langStreak;
        }
      }
    } catch (error) {
      console.error("Failed to load streak from localStorage:", error);
    }
    return { count: 0, lastCompleted: null };
  },

  updateStreak: (language: string): Streak => {
    let allStreaks: StreakData = new Map();
    try {
        const storedStreaks = localStorage.getItem(STREAK_STORAGE_KEY);
        if (storedStreaks) {
            allStreaks = new Map(JSON.parse(storedStreaks));
        }
    } catch (error) {
        console.error("Error parsing stored streaks:", error);
    }

    const currentStreak = streakService.getStreak(language);
    const now = Date.now();

    let newStreak: Streak;

    if (!currentStreak.lastCompleted) {
      // First lesson ever for this language
      newStreak = { count: 1, lastCompleted: now };
    } else if (isSameDay(now, currentStreak.lastCompleted)) {
      // Another lesson on the same day, don't increment
      newStreak = { ...currentStreak, lastCompleted: now };
    } else if (isYesterday(now, currentStreak.lastCompleted)) {
      // Consecutive day
      newStreak = { count: currentStreak.count + 1, lastCompleted: now };
    } else {
      // Missed a day or more, reset
      newStreak = { count: 1, lastCompleted: now };
    }

    allStreaks.set(language, newStreak);

    try {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(Array.from(allStreaks.entries())));
    } catch (error) {
      console.error("Failed to save streak to localStorage:", error);
    }
    
    return newStreak;
  },
};
