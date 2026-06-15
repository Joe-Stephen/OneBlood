export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isFuture = (date: Date): boolean => date > new Date();
export const isPast   = (date: Date): boolean => date < new Date();

export const toISOString = (date: Date): string => date.toISOString();
