'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function FinGPTChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hi! I am VaultMind 🤖. Ask me anything about your cashflow, budgets, or if you can afford a new purchase!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
    const history = messages.map(m => ({ sender: m.sender, text: m.text }));
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { message: userMessage.text, history });
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: res.data.text };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Sorry, I am having trouble connecting to the brain right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 transition-all ${isOpen ? 'scale-0' : 'scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all relative"
        >
          <MessageSquare size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-primary-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary-800 rounded-lg"><Bot size={20} /></div>
                <div>
                  <h3 className="font-bold">VaultMind</h3>
                  <p className="text-xs text-primary-200">Your AI Financial Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 p-2 rounded-full transition-colors flex items-center justify-center shadow-sm"
                title="Close chat"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-success/10 text-success'}`}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white shadow-sm border border-gray-100 rounded-tl-sm text-gray-700 text-sm leading-relaxed'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                    <motion.div className="w-2 h-2 bg-gray-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-gray-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 bg-gray-300 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 px-4 py-2 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask VaultMind..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="text-primary-600 disabled:text-gray-300 transition-colors ml-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
