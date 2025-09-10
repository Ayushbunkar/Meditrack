import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Use import.meta.env for Vite projects
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Set this in your .env file as VITE_GEMINI_API_KEY

  const handleToggle = () => {
    setOpen((prev) => !prev);
    setError('');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!GEMINI_API_KEY) {
      setError('Gemini API key is not set. Please set REACT_APP_GEMINI_API_KEY in your .env file.');
      return;
    }
    setLoading(true);
    setError('');
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            ...newMessages.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            }))
          ]
        }),
      });
      if (!res.ok) {
        throw new Error('API error. Please check your Gemini API key or try again later.');
      }
      const data = await res.json();
      const assistantMsg = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      setMessages([...newMessages, { role: 'assistant', content: assistantMsg }]);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="rounded-full shadow-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl focus:outline-none border border-indigo-500/30 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white transition"
        aria-label="Open AI Assistant"
        style={{ boxShadow: '0 4px 24px 0 rgba(99,102,241,0.35)' }}
      >
        🤖
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="mt-3 sm:mt-4 bg-[#1e1e1e]/95 backdrop-blur-md text-[#e5e5e5] rounded-2xl shadow-2xl p-4 sm:p-6 w-72 sm:w-96 border border-neutral-800 flex flex-col"
            style={{ maxWidth: '95vw', height: '32rem', maxHeight: '90vh' }}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🤖</span>
              <span className="font-bold text-lg text-white">AI Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto mb-2 bg-[#232323]/60 rounded p-2" style={{ minHeight: '10rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl max-w-[80%] text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[#18181b] text-[#e5e5e5]'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mb-2 flex justify-start">
                  <div className="px-3 py-2 rounded-xl bg-[#18181b] text-[#e5e5e5] text-sm animate-pulse">Thinking...</div>
                </div>
              )}
            </div>
            {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
            <div className="flex items-center gap-2">
              <textarea
                className="flex-1 rounded-xl bg-[#232323] border border-neutral-700 px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={1}
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={loading}
                style={{ minHeight: '2.2rem', maxHeight: '6rem' }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="rounded-xl px-4 py-2 font-semibold shadow bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white transition disabled:opacity-60"
              >
                Send
              </button>
              <button
                onClick={handleToggle}
                className="ml-2 px-3 py-2 rounded-xl font-semibold shadow bg-neutral-800 hover:bg-neutral-700 text-white transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatAssistant;
