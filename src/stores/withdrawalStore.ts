import { create } from 'zustand';
import { withdrawalRepository } from '../data/repositories/withdrawalRepository';
import type { WithdrawalRequest } from '../types';

interface WithdrawalState {
  requests: WithdrawalRequest[];
  addRequest: (request: Omit<WithdrawalRequest, 'id' | 'timestamp' | 'status'>) => void;
  updateStatus: (
    id: string,
    status: WithdrawalRequest['status'],
    adminId: string,
    adminName: string,
    comment?: string
  ) => void;
  getRequestsByWorkerId: (workerId: string) => WithdrawalRequest[];
  getPendingRequests: () => WithdrawalRequest[];
  clearRequests: () => void;
}

export const useWithdrawalStore = create<WithdrawalState>()((set, get) => ({
  requests: withdrawalRepository.getAll(),
  
  addRequest: (request) => {
    const newRequest = withdrawalRepository.add(request);
    set({ requests: withdrawalRepository.getAll() });
  },
  
  updateStatus: (id, status, adminId, adminName, comment) => {
    withdrawalRepository.update(id, {
      status,
      adminComment: comment,
      processedAt: new Date().toISOString(),
      processedBy: {
        id: adminId,
        name: adminName,
      },
    });
    set({ requests: withdrawalRepository.getAll() });
  },
  
  getRequestsByWorkerId: (workerId) => 
    withdrawalRepository.getByWorkerId(workerId),
  
  getPendingRequests: () => 
    withdrawalRepository.getPending(),
  
  clearRequests: () => {
    withdrawalRepository.clear();
    set({ requests: [] });
  },
}));