import { create } from "zustand";

type State = {
  count: number;
  increment: () => void;
};

const useZIndexStore = create<State>((set) => ({
  count: 1,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

export function getNextZIndex(): number {
  const state = useZIndexStore.getState();
  const oldIndex = state.count;
  state.increment();
  return oldIndex;
}