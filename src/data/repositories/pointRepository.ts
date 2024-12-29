import { storage } from '../storage/base';
import { PointTransaction, pointTransactionSchema } from '../schema';

const POINTS_KEY = 'points';

export class PointRepository {
  private static instance: PointRepository;

  private constructor() {}

  static getInstance(): PointRepository {
    if (!PointRepository.instance) {
      PointRepository.instance = new PointRepository();
    }
    return PointRepository.instance;
  }

  getAll(): PointTransaction[] {
    return storage.get<PointTransaction[]>(POINTS_KEY) || [];
  }

  add(transaction: Omit<PointTransaction, 'id' | 'timestamp'>): PointTransaction {
    const transactions = this.getAll();
    const newTransaction: PointTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...transaction
    };
    const validatedTransaction = pointTransactionSchema.parse(newTransaction);
    transactions.unshift(validatedTransaction);
    storage.set(POINTS_KEY, transactions);
    return validatedTransaction;
  }

  getByWorkerId(workerId: string): PointTransaction[] {
    return this.getAll().filter(t => t.workerId === workerId);
  }

  clear(): void {
    storage.set(POINTS_KEY, []);
  }
}

export const pointRepository = PointRepository.getInstance();