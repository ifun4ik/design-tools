export type MapStrategy = 'luminance' | 'opacity';

export interface AsciiSettings {
  color: string;
  backgroundColor: string;
  fontSize: number;      // "Base Font Size"
  gridSpacing: number;   // "Grid Spacing" - determines loop step
  characters: string;
  invert: boolean;
  threshold: number;     // 0 to 255
  mapStrategy: MapStrategy;
  variableSize: boolean; // Toggle for dynamic sizing
}

export interface GenerationResult {
  svgContent: string;
  width: number;
  height: number;
}
