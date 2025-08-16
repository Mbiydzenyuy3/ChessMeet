// utils/formatters.ts
/**
 * Format a timestamp into readable date/time
 */
export const formatDateTime = (timestamp: string | number | Date) => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Format player score as "Wins - Losses - Draws"
 */
export const formatScore = (wins: number, losses: number, draws: number) => {
  return `${wins}W - ${losses}L - ${draws}D`;
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
