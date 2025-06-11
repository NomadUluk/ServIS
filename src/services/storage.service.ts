class StorageService {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.error('Failed to set item in localStorage');
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error('Failed to remove item from localStorage');
    }
  }
}

export const storage = new StorageService(); 