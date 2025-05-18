import chroma from 'chroma-js';

/**
 * Represents counts of different emotion states
 */
export type EmotionCounts = {
  peaceful: number;
  urge: number;
  tookOver: number;
};

/**
 * Generates a color based on the proportions of different emotion states
 * 
 * @param counts The counts of different emotion states
 * @returns A hex color string representing the blended emotion
 */
export function getEmotionColor({ peaceful, urge, tookOver }: EmotionCounts): string {
  const total = peaceful + urge + tookOver;

  if (total === 0) return '#E5E7EB'; // No data → light gray

  // Emotion base colors
  const peacefulColor = chroma('#10B981');   // Green
  const urgeColor = chroma('#F59E0B');       // Orange
  const tookOverColor = chroma('#EF4444');   // Red

  // Compute emotion ratios
  const peacefulRatio = peaceful / total;
  const urgeRatio = urge / total;
  const tookOverRatio = tookOver / total;

  // First blend: peaceful and urge (based on their combined proportion)
  const puTotal = peaceful + urge;
  let puBlend = peacefulColor;
  if (puTotal > 0) {
    puBlend = chroma.mix(peacefulColor, urgeColor, urge / puTotal, 'lab');
  }

  // Then blend with tookOver
  const finalBlend = chroma.mix(puBlend, tookOverColor, tookOverRatio, 'lab');

  // Adjust intensity: darken based on total count
  const maxTotal = 12; // tune this if your data varies more or less
  const normalizedTotal = Math.min(total / maxTotal, 1);

  const adjusted = finalBlend.luminance(0.9 - normalizedTotal * 0.6); // darker with more activity

  return adjusted.hex();
} 