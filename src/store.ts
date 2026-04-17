import { create } from 'zustand';
import { STUDENTS, TODAY } from './data';

type State = {
  selectedId: number;
  cursor: string;          // YYYY-MM-DD timeline cursor
  isPlaying: boolean;      // for Growth Reel
  playSpeed: 1 | 2 | 4;
  setSelected: (id: number) => void;
  setCursor: (d: string) => void;
  resetCursor: () => void; // cursor back to today
  setPlaying: (p: boolean) => void;
  setSpeed: (s: 1 | 2 | 4) => void;
};

export const useStore = create<State>((set) => ({
  selectedId: STUDENTS[0].id,
  cursor: TODAY,
  isPlaying: false,
  playSpeed: 1,
  setSelected: (id) => set({ selectedId: id }),
  setCursor: (d) => set({ cursor: d }),
  resetCursor: () => set({ cursor: TODAY }),
  setPlaying: (p) => set({ isPlaying: p }),
  setSpeed: (s) => set({ playSpeed: s }),
}));

/** Derived selectors */
export const useSelectedStudent = () => {
  const id = useStore(s => s.selectedId);
  return STUDENTS.find(s => s.id === id) ?? STUDENTS[0];
};

/** Sorted ㄱ→ㅎ */
export const sortedStudents = () =>
  [...STUDENTS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
