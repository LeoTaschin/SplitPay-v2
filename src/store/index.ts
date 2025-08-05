import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Debt, Group, AppState } from '../types';

interface StoreState extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setDebts: (debts: Debt[]) => void;
  addDebt: (debt: Debt) => void;
  updateDebt: (debtId: string, updates: Partial<Debt>) => void;
  removeDebt: (debtId: string) => void;
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  removeGroup: (groupId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  debts: [],
  groups: [],
  isLoading: false,
  error: null,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setDebts: (debts) => set({ debts }),

      addDebt: (debt) => set((state) => ({
        debts: [...state.debts, debt],
      })),

      updateDebt: (debtId, updates) => set((state) => ({
        debts: state.debts.map((debt) =>
          debt.id === debtId ? { ...debt, ...updates } : debt
        ),
      })),

      removeDebt: (debtId) => set((state) => ({
        debts: state.debts.filter((debt) => debt.id !== debtId),
      })),

      setGroups: (groups) => set({ groups }),

      addGroup: (group) => set((state) => ({
        groups: [...state.groups, group],
      })),

      updateGroup: (groupId, updates) => set((state) => ({
        groups: state.groups.map((group) =>
          group.id === groupId ? { ...group, ...updates } : group
        ),
      })),

      removeGroup: (groupId) => set((state) => ({
        groups: state.groups.filter((group) => group.id !== groupId),
      })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'splitpay-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        debts: state.debts,
        groups: state.groups,
      }),
    }
  )
);

// Selectors para melhor performance
export const useUser = () => useStore((state) => state.user);
export const useDebts = () => useStore((state) => state.debts);
export const useGroups = () => useStore((state) => state.groups);
export const useLoading = () => useStore((state) => state.isLoading);
export const useError = () => useStore((state) => state.error);

// Selectors específicos
export const useDebtsAsCreditor = () => useStore((state) => 
  state.debts.filter((debt) => debt.owedTo === state.user?.id)
);

export const useDebtsAsDebtor = () => useStore((state) => 
  state.debts.filter((debt) => debt.owedBy === state.user?.id)
);

export const useTotalToReceive = () => useStore((state) => 
  state.debts
    .filter((debt) => debt.owedTo === state.user?.id && !debt.isPaid)
    .reduce((total, debt) => total + debt.amount, 0)
);

export const useTotalToPay = () => useStore((state) => 
  state.debts
    .filter((debt) => debt.owedBy === state.user?.id && !debt.isPaid)
    .reduce((total, debt) => total + debt.amount, 0)
); 