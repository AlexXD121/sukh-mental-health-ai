import { useState, useRef, useEffect, useCallback } from 'react';

export default function Mainbox() {
  const [messages, setMessages] = useState([
    {
      text: "Hi, I'm Sukh. How can I support your mind today? 🌿",
      sender: 'ai',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = useCallback(async () => {
    if (input.trim() === '') return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const aiResponse = {
        text: data.reply,
        sender: 'ai',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Oops! Something went wrong. Please try again later.",
          sender: 'ai',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input]);

  return (
    <main
      className="font-poppins flex-1 flex flex-col p-3 overflow-hidden"
      role="region"
      aria-live="polite"
      aria-label="Chat conversation"
    >
      <div className="flex-1 overflow-y-auto space-y-4 mb-2 px-2 max-w-full">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            role="article"
            aria-label={`${msg.sender === 'user' ? 'You' : 'Sukh'} said: ${msg.text}`}
            className={`
              max-w-[80%] md:max-w-[60%] px-5 py-3 rounded-2xl shadow-md text-sm
              flex flex-col break-words
              ${
                msg.sender === 'user'
                  ? `self-end bg-blue-600 text-white
                     rounded-br-none
                     animate-slideInRight
                     focus:outline-none focus:ring-2 focus:ring-blue-400`
                  : `self-start bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     rounded-bl-none
                     animate-slideInLeft
                     focus:outline-none focus:ring-2 focus:ring-purple-400`
              }
            `}
            tabIndex={0}
          >
            <span>{msg.text}</span>
            <time className="text-xs opacity-70 mt-1 text-gray-700 dark:text-gray-300 self-end">
              {formatTime(msg.timestamp)}
            </time>
          </div>
        ))}

        {isTyping && (
          <div
            className="self-start bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl px-5 py-3 text-sm shadow-md animate-pulse flex items-center gap-2"
            aria-live="assertive"
          >
            <svg
              className="w-5 h-5 text-purple-600 animate-bounce"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="4" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="20" cy="12" r="2" />
            </svg>
            Sukh is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t pt-2 px-2"
        role="search"
        aria-label="Message input form"
      >
        <input
          type="text"
          ref={inputRef}
          className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600
            transition text-black dark:text-white bg-white dark:bg-gray-800"
          placeholder="Type something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label="Chat message input"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={input.trim() === ''}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm
            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          aria-label="Send message"
        >
          Send
        </button>
      </form>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease forwards;
        }
      `}</style>
    </main>
  );
}
