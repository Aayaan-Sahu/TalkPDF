import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SendIcon = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={24} height={24}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l16-8-16-8v6l10 2-10 2v6z" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const BackIcon = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={28} height={28}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const TypingIndicator = () => (
  <div className="flex items-end gap-2 animate-fade-in-up">
    <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl shadow max-w-[70%] flex items-center">
      <div className="flex space-x-1">
        <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  </div>
);

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const ChatWithPdf: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      // Fetch relevant chunks first
      const queryRes = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });
      const { relevant } = await queryRes.json();
      // Send to /api/answer
      const answerRes = await fetch('http://localhost:8000/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          chunks: relevant,
          history: [...messages, userMessage],
        }),
      });
      const { answer } = await answerRes.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-gray-900">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-3 border-b bg-white/80 backdrop-blur z-10 animate-fade-in-down duration-700">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => navigate('/')}
          aria-label="Back"
        >
          <BackIcon className="h-7 w-7 text-gray-700" />
        </button>
        <span className="text-2xl font-bold tracking-tight text-primary">TalkPDF</span>
        <div style={{ width: 40 }} /> {/* Spacer for symmetry */}
      </nav>
      {/* Chat Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-end overflow-y-auto px-2 md:px-0 py-8 bg-white animate-fade-in-up">
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-muted-foreground text-center mt-12 animate-fade-in-up">Start the conversation by asking a question about your PDF.</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[70%] shadow ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-all`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Input Area */}
      <div className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center gap-2 border-t bg-white animate-fade-in-up">
        <input
          className="flex-1 px-4 py-3 rounded-2xl border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary text-lg shadow-sm transition"
          type="text"
          placeholder="Ask something about your PDF..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="p-3 rounded-full bg-gray-900 text-white shadow hover:bg-gray-700 transition flex items-center justify-center disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          {loading ? <Spinner /> : <SendIcon className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};

export default ChatWithPdf; 