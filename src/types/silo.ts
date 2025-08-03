// Silo system types for temperature monitoring

export interface Silo {
  num: number;
  temp: number;
}

export interface SiloGroup {
  topRow?: Silo[];
  middleRow?: Silo[];
  bottomRow?: Silo[];
  row1?: Silo[];
  row2?: Silo[];
  row3?: Silo[];
  row4?: Silo[];
  row5?: Silo[];
}

export type ReadingMode = 'none' | 'manual' | 'auto';

export type TemperatureColor = 'green' | 'yellow' | 'pink' | 'beige';

export interface ReadingState {
  mode: ReadingMode;
  isReading: boolean;
  readingSilo: number | null;
  autoReadProgress: number;
}

export interface SiloSystemState {
  selectedSilo: number;
  selectedTemp: number;
  hoveredSilo: Silo | null;
  tooltipPosition: { x: number; y: number };
  readingState: ReadingState;
}

export interface TooltipPosition {
  x: number;
  y: number;
}