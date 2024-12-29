import { storage } from '../storage/base';
import { User, userSchema } from '../schema';

const USERS_KEY = 'users';

export class UserRepository {
  private static instance: UserRepository;

  private constructor() {}

  static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  getAll(): Record<string, User> {
    return storage.get<Record<string, User>>(USERS_KEY) || {};
  }

  getById(id: string): User | null {
    const users = this.getAll();
    return users[id] || null;
  }

  save(user: User): void {
    const users = this.getAll();
    const validatedUser = userSchema.parse(user);
    users[user.id] = validatedUser;
    storage.set(USERS_KEY, users);
  }

  update(id: string, updates: Partial<User>): void {
    const users = this.getAll();
    const existingUser = users[id];
    if (!existingUser) return;

    const updatedUser = { ...existingUser, ...updates };
    const validatedUser = userSchema.parse(updatedUser);
    users[id] = validatedUser;
    storage.set(USERS_KEY, users);
  }

  remove(id: string): void {
    const users = this.getAll();
    delete users[id];
    storage.set(USERS_KEY, users);
  }
}

export const userRepository = UserRepository.getInstance();