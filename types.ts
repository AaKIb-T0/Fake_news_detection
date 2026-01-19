// types.ts
export enum FactCheckStatus {
  REAL = 'REAL',
  FAKE = 'FAKE',
  UNVERIFIED = 'UNVERIFIED',
  ERROR = 'ERROR',
  INITIAL = 'INITIAL', // For initial state before any check
}

export interface Source {
  title: string;
  url: string;
}

export interface FactCheckResult {
  status: FactCheckStatus;
  explanation: string;
  sources: Source[];
}