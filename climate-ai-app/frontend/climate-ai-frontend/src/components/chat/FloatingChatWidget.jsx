import React, { useState } from 'react';
import ChatBot from './ChatBot';
import { MessageCircle } from 'lucide-react';

const FloatingChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Open AI Chat"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      {/* Chat Window */}
      {open && (
        <div className="fixed z-50 bottom-20 right-6 w-80 max-w-[95vw] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: '480px' }}>
          <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
            <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">AI Chat</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 rounded focus:outline-none">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatBot compact={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget; 