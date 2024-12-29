import { create } from 'zustand';
import { userRepository } from '../data/repositories/userRepository';
import type { User, UserProfile } from '../types';

// Initial admin user
const ADMIN_USER: User = {
  id: 'kkkk1111',
  loginId: 'kkkk1111',
  name: '管理者',
  email: 'admin@example.com',
  role: 'admin',
  points: 0,
  status: 'active',
  joinedAt: new Date().toISOString(),
  totalEarned: 0,
};

// Initial worker user
const INITIAL_WORKER: User = {
  id: 'kkkk2222',
  loginId: 'kkkk2222',
  name: 'kan',
  email: 'kan@example.com',
  role: 'worker',
  points: 0,
  status: 'active',
  joinedAt: new Date().toISOString(),
  totalEarned: 0,
};

interface AuthState {
  user: User | null;
  users: Record<string, User>;
  isAuthenticated: boolean;
  customIcon?: string;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User & { profile: UserProfile }>) => void;
  updateIcon: (base64: string) => void;
  updateAvatar: (avatarUrl: string) => void;
  updatePoints: (points: number) => void;
  updateUserPoints: (userId: string, points: number) => void;
  getUser: (userId: string) => User | null;
  registerUser: (userData: { loginId: string; password: string; name: string; email: string }) => User;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // Initialize with admin and worker users
  const initialUsers = { 
    [ADMIN_USER.id]: ADMIN_USER,
    [INITIAL_WORKER.id]: INITIAL_WORKER
  };
  userRepository.save(ADMIN_USER);
  userRepository.save(INITIAL_WORKER);

  return {
    user: null,
    users: initialUsers,
    isAuthenticated: false,
    customIcon: undefined,

    login: (userData) => {
      const updatedUser = {
        ...userData,
        lastLogin: new Date().toISOString(),
      };
      userRepository.save(updatedUser);
      set({
        user: updatedUser,
        users: { ...get().users, [updatedUser.id]: updatedUser },
        isAuthenticated: true,
      });
    },

    logout: () => {
      set({ user: null, isAuthenticated: false });
    },

    updateProfile: (updates) => {
      const { user } = get();
      if (!user) return;

      const updatedUser = { ...user, ...updates };
      userRepository.save(updatedUser);
      set({
        user: updatedUser,
        users: { ...get().users, [user.id]: updatedUser },
      });
    },

    updateIcon: (base64) => {
      set({ customIcon: base64 });
    },

    updateAvatar: (avatarUrl) => {
      const { user } = get();
      if (!user) return;

      const updatedUser = { ...user, avatarUrl };
      userRepository.save(updatedUser);
      set({
        user: updatedUser,
        users: { ...get().users, [user.id]: updatedUser },
      });
    },

    updatePoints: (points) => {
      const { user } = get();
      if (!user) return;

      const updatedUser = {
        ...user,
        points,
        totalEarned: user.totalEarned + Math.max(0, points - user.points),
      };
      userRepository.save(updatedUser);
      set({
        user: updatedUser,
        users: { ...get().users, [user.id]: updatedUser },
      });
    },

    updateUserPoints: (userId, points) => {
      const user = userRepository.getById(userId);
      if (!user) return;

      const updatedUser = {
        ...user,
        points: Math.max(0, points),
        totalEarned: user.totalEarned + Math.max(0, points - user.points),
      };
      userRepository.save(updatedUser);
      set({
        users: { ...get().users, [userId]: updatedUser },
        user: get().user?.id === userId ? updatedUser : get().user,
      });
    },

    getUser: (userId) => userRepository.getById(userId),

    registerUser: (userData) => {
      const newUser: User = {
        id: userData.loginId,
        loginId: userData.loginId,
        name: userData.name,
        email: userData.email,
        points: 0,
        status: 'active',
        joinedAt: new Date().toISOString(),
        totalEarned: 0,
        role: 'worker',
      };

      userRepository.save(newUser);
      set({ users: { ...get().users, [newUser.id]: newUser } });
      return newUser;
    },

    reset: () => {
      userRepository.save(ADMIN_USER);
      userRepository.save(INITIAL_WORKER);
      set({
        user: null,
        users: { 
          [ADMIN_USER.id]: ADMIN_USER,
          [INITIAL_WORKER.id]: INITIAL_WORKER
        },
        isAuthenticated: false,
        customIcon: undefined,
      });
    },
  };
});