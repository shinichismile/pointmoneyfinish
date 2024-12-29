export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'pointmoney_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
      this.notifyChange(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
      this.notifyChange(key, null);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  private notifyChange<T>(key: string, value: T | null): void {
    window.dispatchEvent(
      new CustomEvent('storage', {
        detail: { key: this.getKey(key), value }
      })
    );
  }
}

export const storage = new LocalStorageAdapter();