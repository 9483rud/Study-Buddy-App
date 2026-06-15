// User-specific data storage utilities

export function saveUserData<T>(userId: string, key: string, data: T): void {
  try {
    localStorage.setItem(`${key}_${userId}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

export function loadUserData<T>(userId: string, key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(`${key}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  }
  return defaultValue;
}

export function deleteUserData(userId: string, key: string): void {
  localStorage.removeItem(`${key}_${userId}`);
}