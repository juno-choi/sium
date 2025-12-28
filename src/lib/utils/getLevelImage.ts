/**
 * Get the appropriate image filename based on character level.
 * Uses level thresholds: 1, 10, 20
 * 
 * @param level - Current character level
 * @param levelImages - Object mapping level thresholds to image filenames
 * @returns Image filename for the current level tier, or null if not found
 */
export function getLevelImage(
    level: number,
    levelImages?: Record<string, string> | null
): string | null {
    if (!levelImages) return null;

    // Level thresholds in descending order
    const thresholds = [20, 10, 1];

    for (const threshold of thresholds) {
        if (level >= threshold && levelImages[String(threshold)]) {
            return levelImages[String(threshold)];
        }
    }

    // Fallback to level 1 image if exists
    return levelImages['1'] || null;
}
