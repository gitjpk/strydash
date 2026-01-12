export type Language = 'en' | 'fr';
export type Theme = 'light' | 'dark';
export type MapProvider = 'leaflet' | 'maplibre';
export type AIModel = 'mistral' | 'llama3.1' | 'phi3' | 'gemma2' | 'qwen2.5';

export interface Preferences {
  language: Language;
  theme: Theme;
  mapProvider: MapProvider;
  aiModel: AIModel;
  startDate?: string;
}

export const defaultPreferences: Preferences = {
  language: 'en',
  theme: 'light',
  mapProvider: 'leaflet',
  aiModel: 'mistral',
  startDate: undefined,
};

// Client-side only functions
export function getPreferences(): Preferences {
  if (typeof window === 'undefined') return defaultPreferences;
  
  const stored = localStorage.getItem('preferences');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultPreferences;
    }
  }
  return defaultPreferences;
}

export function savePreferences(preferences: Preferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('preferences', JSON.stringify(preferences));
}
