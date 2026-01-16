'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import { usePreferences } from '@/components/PreferencesProvider';
import { getPreferences } from '@/lib/preferences';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function StrAIdPage() {
  const { t } = usePreferences();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('mistral');
  const [remoteModelName, setRemoteModelName] = useState<string | null>(null);
  const [isRemoteInstance, setIsRemoteInstance] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModelInfo = async () => {
      // Load the selected model from preferences
      const prefs = getPreferences();
      const model = prefs.aiModel || 'mistral';
      const isRemote = prefs.aiInstanceType === 'remote';
      setCurrentModel(model);
      setIsRemoteInstance(isRemote);
      
      // If remote instance, try to detect the model
      if (isRemote && prefs.aiRemoteUrl && prefs.remoteServerType) {
        try {
          const response = await fetch('/api/remote-model', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              remoteUrl: prefs.aiRemoteUrl, 
              remoteServerType: prefs.remoteServerType 
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.modelName) {
              setRemoteModelName(data.modelName);
              console.log(`StrAId using remote model: ${data.modelName}`);
              
              // Update preferences with the detected model name
              const { savePreferences } = await import('@/lib/preferences');
              savePreferences({ ...prefs, remoteModelName: data.modelName });
            }
          }
        } catch (error) {
          console.error('Error detecting remote model:', error);
          // Fall back to stored model name if detection fails
          if (prefs.remoteModelName) {
            setRemoteModelName(prefs.remoteModelName);
          }
        }
      } else if (isRemote && prefs.remoteModelName) {
        // Use stored model name if available
        setRemoteModelName(prefs.remoteModelName);
        console.log(`StrAId using remote model: ${prefs.remoteModelName}`);
      } else {
        console.log(`StrAId using model: ${model}`);
      }
      
      console.log(`StrAId instance type: ${prefs.aiInstanceType || 'local'}`);
      if (prefs.aiRemoteUrl) {
        console.log(`StrAId remote URL: ${prefs.aiRemoteUrl}`);
      }
      setModelLoaded(true);
    };
    
    loadModelInfo();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Get preferences to check for remote URL
      const prefs = getPreferences();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: currentModel,
          remoteUrl: prefs.aiInstanceType === 'remote' ? prefs.aiRemoteUrl : undefined,
          remoteServerType: prefs.aiInstanceType === 'remote' ? prefs.remoteServerType : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.ollamaNotRunning) {
          const prefs = getPreferences();
          throw new Error(prefs.language === 'en' 
            ? 'Ollama is not running. Please start Ollama first.'
            : 'Ollama n\'est pas en cours d\'exécution. Veuillez démarrer Ollama d\'abord.');
        }
        
        if (errorData.needsPull) {
          const prefs = getPreferences();
          throw new Error(prefs.language === 'en'
            ? `Model ${currentModel} needs to be downloaded. Please download it from Settings first.`
            : `Le modèle ${currentModel} doit être téléchargé. Veuillez le télécharger depuis les paramètres d'abord.`);
        }
        
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('straid.title')}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-13">
            {modelLoaded ? (
              isRemoteInstance && remoteModelName ? (
                <span>
                  Using <span className="font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs">{remoteModelName}</span>
                </span>
              ) : (
                `Using ${currentModel}`
              )
            ) : (
              t('straid.modelLoading')
            )}
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500 dark:text-purple-400" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Welcome to StrAId!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Ask me anything about your running data, training patterns, or get personalized recommendations.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                <Loader className="w-5 h-5 animate-spin text-purple-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('straid.placeholder')}
              disabled={isLoading || !modelLoaded}
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm sm:text-base"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !modelLoaded}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{t('straid.send')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
