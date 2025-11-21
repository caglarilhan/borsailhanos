export type UserSettings = {
  theme: 'light' | 'dark';
  language: 'TR' | 'EN';
  notifications: boolean;
  timezone: 'Europe/Istanbul' | 'UTC';
  refreshInterval: 5 | 15 | 30;
};

const STORAGE_KEY = 'bistai:userSettings';

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'TR',
  notifications: true,
  timezone: 'Europe/Istanbul',
  refreshInterval: 15,
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function readFromStorage(): UserSettings {
  if (typeof window === 'undefined') return defaultSettings;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

function writeToStorage(settings: UserSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function getUserSettings(): Promise<UserSettings> {
  await delay();
  return readFromStorage();
}

export async function updateUserSettings(
  partial: Partial<UserSettings>
): Promise<UserSettings> {
  await delay();
  const next = { ...readFromStorage(), ...partial };
  writeToStorage(next);
  return next;
}

