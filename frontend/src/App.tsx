import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import InputArea from './components/InputArea';
import UserMessage from './components/UserMessage';
import AssistantMessage from './components/AssistantMessage';
import { Sun, Moon, Settings } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  fileName?: string;
  fileUrl?: string;
  fileType?: 'audio' | 'video';
  transcription?: string;
  summary?: string;
  showTranscription?: boolean;
  status?: 'uploading' | 'processing';
};

type ModelSettings = {
  whisperModel: string;
  translatorModel: string;
  maxTokens: number;
  temperature: number;
};

type Theme = 'light' | 'dark';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<ModelSettings>({
    whisperModel: 'base',
    translatorModel: 'Qwen/Qwen1.5-14B-Chat',
    maxTokens: 10000,
    temperature: 0.7,
  });
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  const handleFile = async (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type.startsWith('audio') ? 'audio' : 'video';

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      fileName: file.name,
      fileUrl,
      fileType,
      status: 'uploading',
    };
    setMessages((prev) => [...prev, userMessage]);
    setProcessing(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('whisper_model', settings.whisperModel);
    formData.append('translator_model', settings.translatorModel);
    formData.append('max_tokens', String(settings.maxTokens));
    formData.append('temperature', String(settings.temperature));

    try {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id ? { ...m, status: 'processing' } : m
        )
      );

      const response = await axios.post('/api/process-media', formData);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        transcription: response.data.transcription,
        summary: response.data.summary,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        summary: err.response?.data?.detail || 'Error processing the file.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-xl font-bold">TLH;DR</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'user' ? (
                  <UserMessage
                    fileName={msg.fileName}
                    fileUrl={msg.fileUrl}
                    fileType={msg.fileType}
                  />
                ) : (
                  <AssistantMessage
                    summary={msg.summary}
                    transcription={msg.transcription}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
            <div className="flex-1">
              <InputArea onFile={handleFile} processing={processing} />
            </div>
            <AudioRecorder onFile={handleFile} disabled={processing} />
          </div>
        </main>

        <aside
          className={`bg-white dark:bg-gray-800 p-4 transition-all duration-300 shadow-lg ${
            sidebarOpen
              ? 'w-80 border-l border-gray-200 dark:border-gray-700'
              : 'w-0'
          }`}
          style={{ visibility: sidebarOpen ? 'visible' : 'hidden' }}
        >
          <div
            className={`transition-opacity duration-200 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h2 className="text-lg font-semibold mb-4">⚙️ Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                  Whisper Model
                </label>
                <select
                  className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
                  value={settings.whisperModel}
                  onChange={(e) =>
                    setSettings({ ...settings, whisperModel: e.target.value })
                  }
                >
                  <option value="base">base</option>
                  <option value="small">small</option>
                  <option value="medium">medium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                  Translator Model
                </label>
                <select
                  className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
                  value={settings.translatorModel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      translatorModel: e.target.value,
                    })
                  }
                >
                  <option value="Qwen/Qwen1.5-14B-Chat">Qwen 1.5-14B</option>
                  <option value="microsoft/Phi-3-mini-4k-instruct">
                    Microsoft Phi 3 mini
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                  Max Tokens
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
                  value={settings.maxTokens}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxTokens: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                  Temperature
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  value={settings.temperature}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      temperature: Number(e.target.value),
                    })
                  }
                />
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {settings.temperature}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;