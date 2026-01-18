/**
 * Simple utility functions to convert between Record<number, T> and Array<T>
 * Used for JSON serialization of game data
 */

/**
 * Convert a Record of items/npcs keyed by ID to an array
 */
export function recordToArray<T extends { id: number }>(record: Record<number, T>): T[] {
  return Object.values(record);
}

/**
 * Convert an array of items/npcs to a Record keyed by ID
 */
export function arrayToRecord<T extends { id: number }>(array: T[]): Record<number, T> {
  const record: Record<number, T> = {};
  for (const item of array) {
    record[item.id] = item;
  }
  return record;
}
