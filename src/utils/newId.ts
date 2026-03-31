import { create } from "zustand";

type State = {
  count: number;
  increment: () => void;
};

const useZIndexStore = create<State>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));


export function getNextZIndex(): number {
    const { count, increment } = useZIndexStore.getState();

    increment();
    return count;
}