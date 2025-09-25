
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Mic, Bot, User } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  loading?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  messages,
  loading = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200">
      {/* Messages Area - Only show if there are messages */}
      {messages.length > 0 && (
        <div className="max-h-60 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-3 ${
                message.role === 'USER' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex space-x-3 max-w-xs lg:max-w-md ${
                  message.role === 'USER' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'USER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {message.role === 'USER' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.role === 'USER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.metadata?.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.metadata.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => onSendMessage(suggestion)}
                          className="block w-full text-left text-xs p-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex space-x-3 justify-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your reports, upload files, or type your message..."
              disabled={loading}
              className="border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Mic className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          Reporting Agent can analyze complex data and provide insights. Please verify important business decisions.
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
