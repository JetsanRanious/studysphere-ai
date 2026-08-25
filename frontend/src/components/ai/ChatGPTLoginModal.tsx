import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Bot, Key, CheckCircle2, ShieldCheck, ExternalLink, Zap } from 'lucide-react';
import { useChatGPT } from '../../contexts/ChatGPTContext';
import { useToast } from '../../contexts/ToastContext';

interface ChatGPTLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatGPTLoginModal: React.FC<ChatGPTLoginModalProps> = ({ isOpen, onClose }) => {
  const { isGPTConnected, gptKey, connectGPT, disconnectGPT } = useChatGPT();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const { showToast } = useToast();

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim().startsWith('sk-')) {
      showToast('Invalid API Key format. Must start with sk-', 'error');
      return;
    }
    connectGPT(apiKey, model);
    showToast('Successfully connected to ChatGPT!', 'success');
    setApiKey('');
    onClose();
  };

  const handleDisconnect = () => {
    disconnectGPT();
    showToast('ChatGPT disconnected', 'info');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect ChatGPT" maxWidth="sm">
      {isGPTConnected ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">ChatGPT is Connected</h3>
          <p className="text-sm text-slate-500 mb-6 px-4">
            StudySphere AI is actively powered by your OpenAI account. Your key is stored securely in your browser.
          </p>
          <div className="flex flex-col space-y-3 px-6">
            <Button variant="outline" onClick={onClose} className="w-full">Continue Studying</Button>
            <button 
              onClick={handleDisconnect}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Disconnect & Remove Key
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="space-y-5">
          <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">Unlock AI Superpowers</p>
              <p className="text-[11px] text-blue-700">Connect to GPT-4o for document chat, quizzes, and smart study plans.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>OpenAI API Key</span>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center">
                Get a key <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Model Preference</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="gpt-4o">GPT-4o (Best Quality)</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Faster, Cheaper)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
            </select>
          </div>

          <div className="flex items-center text-[10px] text-slate-500">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-slate-400" />
            Your API key is never saved on our servers. It is stored securely in your local browser storage.
          </div>

          <Button type="submit" variant="primary" className="w-full">
            <Zap className="w-4 h-4 mr-1.5" /> Connect to ChatGPT
          </Button>
        </form>
      )}
    </Modal>
  );
};
