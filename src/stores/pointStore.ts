import { create } from 'zustand';
import { pointRepository } from '../data/repositories/pointRepository';
import type { PointTransaction } from '../types';

interface PointState {
  transactions: PointTransaction[];
  addTransaction: (transaction: Omit<PointTransaction, 'id' | 'timestamp'>) => void;
  clearTransactions: () => void;
}

export const usePointStore = create<PointState>()((set) => ({
  transactions: pointRepository.getAll(),
  
  addTransaction: (transaction) => {
    const newTransaction = pointRepository.add(transaction);
    set({ transactions: pointRepository.getAll() });
  },
  
  clearTransactions: () => {
    pointRepository.clear();
    set({ transactions: [] });
  },
}));