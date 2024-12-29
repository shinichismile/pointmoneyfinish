import { storage } from '../storage/base';
import { WithdrawalRequest, withdrawalRequestSchema } from '../schema';

const WITHDRAWALS_KEY = 'withdrawals';

export class WithdrawalRepository {
  private static instance: WithdrawalRepository;

  private constructor() {}

  static getInstance(): WithdrawalRepository {
    if (!WithdrawalRepository.instance) {
      WithdrawalRepository.instance = new WithdrawalRepository();
    }
    return WithdrawalRepository.instance;
  }

  getAll(): WithdrawalRequest[] {
    return storage.get<WithdrawalRequest[]>(WITHDRAWALS_KEY) || [];
  }

  add(request: Omit<WithdrawalRequest, 'id' | 'timestamp' | 'status'>): WithdrawalRequest {
    const requests = this.getAll();
    const newRequest: WithdrawalRequest = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...request
    };
    const validatedRequest = withdrawalRequestSchema.parse(newRequest);
    requests.unshift(validatedRequest);
    storage.set(WITHDRAWALS_KEY, requests);
    return validatedRequest;
  }

  update(id: string, updates: Partial<WithdrawalRequest>): void {
    const requests = this.getAll();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return;

    const updatedRequest = { ...requests[index], ...updates };
    const validatedRequest = withdrawalRequestSchema.parse(updatedRequest);
    requests[index] = validatedRequest;
    storage.set(WITHDRAWALS_KEY, requests);
  }

  getByWorkerId(workerId: string): WithdrawalRequest[] {
    return this.getAll().filter(r => r.workerId === workerId);
  }

  getPending(): WithdrawalRequest[] {
    return this.getAll().filter(r => r.status === 'pending');
  }

  clear(): void {
    storage.set(WITHDRAWALS_KEY, []);
  }
}

export const withdrawalRepository = WithdrawalRepository.getInstance();