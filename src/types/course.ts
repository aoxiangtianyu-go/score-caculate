export interface Course {
  name: string;
  term: string;
  score: number;
  locked: boolean;
  credit: number;
}

export type LoadState = 'Normal' | 'Initialized' | 'Recovered';

export interface LoadResult {
  courses: Course[];
  state: LoadState | { Recovered: string };
}
