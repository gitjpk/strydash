'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Monitor, Map, Brain, Download, CheckCircle, Server } from 'lucide-react';
import { getPreferences, savePreferences, type Language, type Theme, type MapProvider, type AIModel, type AIInstanceType } from '@/lib/preferences';
import { usePreferences } from '@/components/PreferencesProvider';

export default function SettingsPage() {
  const { t } = usePreferences();
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [mapProvider, setMapProvider] = useState<MapProvider>('leaflet');
  const [aiModel, setAIModel] = useState<AIModel>('mistral');
  const [aiInstanceType, setAIInstanceType] = useState<AIInstanceType>('local');
  const [aiRemoteUrl, setAIRemoteUrl] = useState<string>('');
  const [downloadedModels, setDownloadedModels] = useState<Set<AIModel>>(new Set());
  const [downloadingModel, setDownloadingModel] = useState<AIModel | null>(null);
  const [saved, setSaved] = useState(false);
  const [checkingModels, setCheckingModels] = useState(true);

  useEffect(() => {
    const prefs = getPreferences();
    setLanguage(prefs.language);
    setTheme(prefs.theme);
    setMapProvider(prefs.mapProvider || 'leaflet');
    setAIModel(prefs.aiModel || 'mistral');
    setAIInstanceType(prefs.aiInstanceType || 'local');
    setAIRemoteUrl(prefs.aiRemoteUrl || '');
    
    // Apply theme
    if (prefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check which models are actually available in Ollama (only for local instance)
    const checkModels = async () => {
      if (prefs.aiInstanceType === 'local' || !prefs.aiInstanceType) {
        try {
          const response = await fetch('/api/models');
          const data = await response.json();
          if (data.models) {
            setDownloadedModels(new Set(data.models));
          }
        } catch (error) {
          console.error('Error checking models:', error);
        }
      }
      setCheckingModels(false);
    };
    
    checkModels();
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    savePreferences({ language: newLanguage, theme, mapProvider, aiModel, aiInstanceType, aiRemoteUrl: aiRemoteUrl || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Reload to apply language changes
    window.location.reload();
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    savePreferences({ language, theme: newTheme, mapProvider, aiModel, aiInstanceType, aiRemoteUrl: aiRemoteUrl || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Apply theme immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleMapProviderChange = (newMapProvider: MapProvider) => {
    setMapProvider(newMapProvider);
    savePreferences({ language, theme, mapProvider: newMapProvider, aiModel, aiInstanceType, aiRemoteUrl: aiRemoteUrl || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAIInstanceTypeChange = (newType: AIInstanceType) => {
    setAIInstanceType(newType);
    savePreferences({ language, theme, mapProvider, aiModel, aiInstanceType: newType, aiRemoteUrl: aiRemoteUrl || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoteUrlChange = (newUrl: string) => {
    setAIRemoteUrl(newUrl);
    savePreferences({ language, theme, mapProvider, aiModel, aiInstanceType, aiRemoteUrl: newUrl || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAIModelChange = async (newAIModel: AIModel) => {
    // Check if model needs to be downloaded
    if (!downloadedModels.has(newAIModel)) {
      setDownloadingModel(newAIModel);
      
      try {
        const response = await fetch('/api/models', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: newAIModel }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to pull model:', errorData);
          alert(language === 'en' 
            ? `Failed to download model: ${errorData.error || 'Unknown error'}`
            : `Échec du téléchargement du modèle: ${errorData.error || 'Erreur inconnue'}`);
          setDownloadingModel(null);
          return;
        }
        
        const updatedModels = new Set(downloadedModels);
        updatedModels.add(newAIModel);
        setDownloadedModels(updatedModels);
      } catch (error) {
        console.error('Error pulling model:', error);
        alert(language === 'en'
          ? 'Failed to download model. Make sure Ollama is running.'
          : 'Échec du téléchargement du modèle. Assurez-vous qu\'Ollama est en cours d\'exécution.');
      } finally {
        setDownloadingModel(null);
      }
    }
    
    setAIModel(newAIModel);
    savePreferences({ language, theme, mapProvider, aiModel: newAIModel, aiInstanceType, aiRemoteUrl: aiRemoteUrl || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your application preferences
          </p>
        </div>

        {/* Success message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm">
            ✓ {t('settings.saveSettings')}
          </div>
        )}

        {/* Site Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Site Settings</h2>
          </div>

          {/* Language */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Language</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  language === 'en'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => handleLanguageChange('fr')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  language === 'fr'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                🇫🇷 Français
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Theme</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          {/* Map Provider */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Map className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Map Provider</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleMapProviderChange('leaflet')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  mapProvider === 'leaflet'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                🗺️ OpenStreetMap (Leaflet)
              </button>
              <button
                onClick={() => handleMapProviderChange('maplibre')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  mapProvider === 'maplibre'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                🌐 MapLibre GL JS
              </button>
            </div>
          </div>

          {/* AI Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">{t('settings.aiSettings')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('settings.aiSettingsDesc')}</p>
              </div>
            </div>

            {/* Instance Type Selection */}
            <div className="mb-4">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleAIInstanceTypeChange('local')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    aiInstanceType === 'local'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  🖥️ {t('settings.localInstance')}
                </button>
                <button
                  onClick={() => handleAIInstanceTypeChange('remote')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    aiInstanceType === 'remote'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  🌐 {t('settings.remoteInstance')}
                </button>
              </div>
            </div>

            {/* Local Instance - Model Selection */}
            {aiInstanceType === 'local' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => handleAIModelChange('mistral')}
                disabled={downloadingModel === 'mistral'}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left relative ${
                  aiModel === 'mistral'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                } ${downloadingModel === 'mistral' ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Mistral 7B</div>
                    <div className="text-xs opacity-70">Default, Balanced</div>
                  </div>
                  {downloadingModel === 'mistral' ? (
                    <Download className="w-4 h-4 animate-bounce" />
                  ) : downloadedModels.has('mistral') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Download className="w-4 h-4 opacity-40" />
                  )}
                </div>
              </button>
              <button
                onClick={() => handleAIModelChange('llama3.1')}
                disabled={downloadingModel === 'llama3.1'}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left relative ${
                  aiModel === 'llama3.1'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                } ${downloadingModel === 'llama3.1' ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Llama 3.1 8B</div>
                    <div className="text-xs opacity-70">Powerful</div>
                  </div>
                  {downloadingModel === 'llama3.1' ? (
                    <Download className="w-4 h-4 animate-bounce" />
                  ) : downloadedModels.has('llama3.1') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Download className="w-4 h-4 opacity-40" />
                  )}
                </div>
              </button>
              <button
                onClick={() => handleAIModelChange('phi3')}
                disabled={downloadingModel === 'phi3'}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left relative ${
                  aiModel === 'phi3'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                } ${downloadingModel === 'phi3' ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Phi-3</div>
                    <div className="text-xs opacity-70">Compact & Fast</div>
                  </div>
                  {downloadingModel === 'phi3' ? (
                    <Download className="w-4 h-4 animate-bounce" />
                  ) : downloadedModels.has('phi3') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Download className="w-4 h-4 opacity-40" />
                  )}
                </div>
              </button>
              <button
                onClick={() => handleAIModelChange('gemma2')}
                disabled={downloadingModel === 'gemma2'}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left relative ${
                  aiModel === 'gemma2'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                } ${downloadingModel === 'gemma2' ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Gemma 2</div>
                    <div className="text-xs opacity-70">Google Model</div>
                  </div>
                  {downloadingModel === 'gemma2' ? (
                    <Download className="w-4 h-4 animate-bounce" />
                  ) : downloadedModels.has('gemma2') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Download className="w-4 h-4 opacity-40" />
                  )}
                </div>
              </button>
              <button
                onClick={() => handleAIModelChange('qwen2.5')}
                disabled={downloadingModel === 'qwen2.5'}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left relative ${
                  aiModel === 'qwen2.5'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                } ${downloadingModel === 'qwen2.5' ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Qwen 2.5</div>
                    <div className="text-xs opacity-70">Alibaba Model</div>
                  </div>
                  {downloadingModel === 'qwen2.5' ? (
                    <Download className="w-4 h-4 animate-bounce" />
                  ) : downloadedModels.has('qwen2.5') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Download className="w-4 h-4 opacity-40" />
                  )}
                </div>
              </button>
            </div>
            )}

            {/* Remote Instance - URL Input */}
            {aiInstanceType === 'remote' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    {t('settings.remoteServerUrl')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={aiRemoteUrl}
                      onChange={(e) => handleRemoteUrlChange(e.target.value)}
                      placeholder={t('settings.remoteUrlPlaceholder')}
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('settings.remoteUrlDesc')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
