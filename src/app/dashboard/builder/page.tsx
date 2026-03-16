'use client';

import { useState } from 'react';
import { Sparkles, Play, Download, Code, Zap } from 'lucide-react';

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('llama3-70b-8192');

  const models: Record<string, string[]> = {
    groq: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'],
    openrouter: ['meta-llama/llama-3-70b-instruct', 'anthropic/claude-3-opus'],
    openai: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'],
    gemini: ['gemini-pro', 'gemini-pro-vision'],
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider,
          model,
          type: 'app',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.content);
      } else {
        alert(data.error || 'Failed to generate app');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('An error occurred while generating the app');
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app.html';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          AI App Builder
        </h1>
        <p className="text-gray-400">
          Describe your app and let AI create it for you
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Generate App
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    setModel(models[e.target.value][0]);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="groq">Groq (Free)</option>
                  <option value="openrouter">OpenRouter (Free)</option>
                  <option value="openai">OpenAI (Premium)</option>
                  <option value="gemini">Gemini (Premium)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {models[provider]?.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  App Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the app you want to build... e.g., 'Create a todo list app with a modern design, dark mode support, and local storage'"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {generating ? 'Generating...' : 'Generate App'}
              </button>
            </div>
          </div>

          <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4">
            <div className="text-sm text-blue-400 font-semibold mb-2">
              <Zap className="w-4 h-4 inline mr-2" />
              Credit Cost
            </div>
            <div className="text-xs text-gray-400">
              {provider === 'openai' || provider === 'gemini' ? (
                <>
                  Premium AI: 300-800 credits per generation
                </>
              ) : (
                <>
                  Free AI: 50-200 credits per generation
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-400" />
            Generated Code
          </h2>

          {generatedCode ? (
            <>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96 mb-4">
                <pre className="text-sm text-green-400 whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handlePreview}
                  className="bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Preview
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                Enter an app description and click generate to see the code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
