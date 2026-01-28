import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Dropzone from './components/Dropzone';
import Status from './components/Status';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  fileName?: string;
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

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<ModelSettings>({
    whisperModel: 'base',
    translatorModel: 'Qwen/Qwen1.5-14B-Chat',
    maxTokens: 10000,
    temperature: 0.7,
  });

  // Scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  const handleFile = async (file: File) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      fileName: file.name,
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
        showTranscription: false,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        summary:
          err.response?.data?.detail || 'Error processing the file.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setProcessing(false);
    }
  };

  const toggleTranscription = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, showTranscription: !m.showTranscription } : m
      )
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex">
      {/* SIDEBAR */}
      <div
        className={`bg-gray-800 p-4 transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-14'
        }`}
      >
        <button
          className="mb-4 text-sm bg-gray-700 px-2 py-1 rounded"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '⮜' : '⮞'}
        </button>

        {sidebarOpen && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">⚙️ Settings</h2>

            {/* Whisper Model */}
            <div>
              <label className="block text-sm mb-1">Whisper Model</label>
              <select
                className="w-full bg-gray-700 p-2 rounded"
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

            {/* Translator Model */}
            <div>
              <label className="block text-sm mb-1">Translator Model</label>
              <select
                className="w-full bg-gray-700 p-2 rounded"
                value={settings.translatorModel}
                onChange={(e) =>
                  setSettings({ ...settings, translatorModel: e.target.value })
                }
              >
                <option value="Qwen/Qwen1.5-14B-Chat">
                  Qwen 1.5-14B
                </option>
                <option value="microsoft/Phi-3-mini-4k-instruct">Microsoft Phi 3 mini</option>
              </select>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm mb-1">Max Tokens</label>
              <input
                type="number"
                className="w-full bg-gray-700 p-2 rounded"
                value={settings.maxTokens}
                onChange={(e) =>
                  setSettings({ ...settings, maxTokens: Number(e.target.value) })
                }
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm mb-1">Temperature</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-gray-700 p-2 rounded"
                value={settings.temperature}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperature: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col bg-gray-900 text-white">
      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl p-4 rounded-2xl shadow-md ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'
              }`}
            >
              {msg.role === 'user' && (
                <>
                  <p className="font-semibold mb-1">📎 {msg.fileName}</p>
                  {/*msg.status && <Status status={msg.status} />*/}
                </>
              )}

              {msg.role === 'assistant' && (
                <>
                  {msg.summary && (
                    <>
                      <h3 className="font-semibold mb-1">Summary:</h3>
                      <p className="text-sm whitespace-pre-wrap">{msg.summary}</p>
                    </>
                  )}
                  {msg.transcription && (
                    <div className="mt-2">
                      <button
                        className="text-xs text-blue-400 underline"
                        onClick={() => toggleTranscription(msg.id)}
                      >
                        {msg.showTranscription ? 'Hide transcription' : 'Show transcription'}
                      </button>
                      {msg.showTranscription && (
                        <pre className="text-xs bg-gray-700 p-2 rounded mt-1 whitespace-pre-wrap">
                          {msg.transcription}
                        </pre>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        {!processing && <Dropzone onFile={handleFile} compact />}
        {processing && <Status status="processing" />}
      </div>
      </div>
    </div>
  );
}

export default App;