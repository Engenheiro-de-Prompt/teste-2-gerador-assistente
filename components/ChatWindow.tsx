import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import * as openai from '../services/openai';
import { SendIcon, CloseIcon, BotIcon } from './icons';

interface ChatWindowProps {
    apiKey: string;
    assistantId: string;
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ apiKey, assistantId, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [threadId, setThreadId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const initializeThread = async () => {
            try {
                const thread = await openai.createThread(apiKey);
                setThreadId(thread.id);
                setMessages([{ id: 'init', role: 'assistant', content: 'Hello! How can I assist you today?' }]);
            } catch (error) {
                console.error("Failed to initialize chat thread:", error);
                setMessages([{ id: 'error_init', role: 'assistant', content: 'Sorry, I couldn\'t connect to the assistant.' }]);
            }
        };
        initializeThread();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey, assistantId]);
    
    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading || !threadId) return;

        const userMessage: ChatMessage = { id: `msg_${Date.now()}`, role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            await openai.addMessage(apiKey, threadId, input);
            const run = await openai.createRun(apiKey, threadId, assistantId);

            let status = 'in_progress';
            while (status !== 'completed') {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const runStatus = await openai.getRunStatus(apiKey, threadId, run.id);
                status = runStatus.status;
                if (status === 'failed' || status === 'cancelled' || status === 'expired') {
                    throw new Error(`Run ended with status: ${status}`);
                }
            }

            const responseMessages = await openai.listMessages(apiKey, threadId);
            const assistantMessages = responseMessages.data
                .filter(m => m.role === 'assistant' && m.run_id === run.id)
                .map((m): ChatMessage => ({
                    id: m.id,
                    role: 'assistant',
                    content: m.content[0].type === 'text' ? m.content[0].text.value : 'Unsupported content type',
                }))
                .reverse(); // API returns newest first

            setMessages(prev => [...prev, ...assistantMessages]);

        } catch (error) {
            console.error("Error during chat:", error);
            const errorMessage: ChatMessage = { id: `err_${Date.now()}`, role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, threadId, apiKey, assistantId]);
    
    return (
        <div className="flex flex-col h-full w-full bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
            <header className="flex items-center justify-between p-4 bg-gray-900 text-white">
                <div className="flex items-center">
                    <BotIcon className="w-6 h-6 text-indigo-400 mr-2" />
                    <h3 className="font-semibold text-lg">AI Assistant</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-gray-700 text-gray-200">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-0"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-700">
                <div className="flex items-center bg-gray-700 rounded-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent p-3 text-white placeholder-gray-400 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="p-3 text-indigo-400 disabled:text-gray-500 disabled:cursor-not-allowed hover:text-indigo-300">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;