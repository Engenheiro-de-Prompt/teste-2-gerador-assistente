import React, { useState } from 'react';
import { useAssistants } from '../hooks/useAssistants';
import type { AssistantConfig } from '../types';
import CodeBlock from '../components/CodeBlock';
import { PlusIcon, TrashIcon } from '../components/icons';
import * as openai from '../services/openai';

// Helper function to generate the embed code for the user to copy
const getEmbedCode = (assistantConfigId: string) => {
    const embedUrl = `${window.location.origin}${window.location.pathname}#/embed/${assistantConfigId}`;
    return `<div id="ai-chat-widget-container"></div>
<script>
    (function() {
        const container = document.getElementById('ai-chat-widget-container');
        if (!container) { console.error('Chat widget container not found.'); return; }

        const position = 'fixed';

        const iframe = document.createElement('iframe');
        iframe.id = 'ai-chat-iframe';
        iframe.src = '${embedUrl}';
        iframe.style.cssText = \`position: \${position}; bottom: 90px; right: 20px; width: min(400px, 90vw); height: min(600px, 70vh); border: none; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95) translateY(10px); opacity: 0; transition: all 0.3s ease-in-out; pointer-events: none; z-index: 9998;\`;

        const button = document.createElement('button');
        button.id = 'ai-chat-button';
        button.setAttribute('aria-label', 'Toggle Chat');
        button.style.cssText = \`position: \${position}; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 50%; background-color: #4f46e5; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 9999; transition: transform 0.2s;\`;
        
        const chatIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        button.innerHTML = chatIcon;
        
        container.appendChild(iframe);
        container.appendChild(button);

        let isOpen = false;
        button.onclick = () => {
            isOpen = !isOpen;
            if (isOpen) {
                iframe.style.transform = 'scale(1) translateY(0)';
                iframe.style.opacity = '1';
                iframe.style.pointerEvents = 'auto';
                button.innerHTML = closeIcon;
            } else {
                iframe.style.transform = 'scale(0.95) translateY(10px)';
                iframe.style.opacity = '0';
                iframe.style.pointerEvents = 'none';
                button.innerHTML = chatIcon;
            }
        };
        button.onmouseover = () => { if (!isOpen) button.style.transform = 'scale(1.1)'; };
        button.onmouseout = () => { button.style.transform = 'scale(1)'; };
    })();
</script>`;
};

// Helper function to generate a full HTML page for the srcDoc preview iframe
const getPreviewHtml = (assistantConfigId: string) => {
    const embedCode = getEmbedCode(assistantConfigId)
        .replace("id=\"ai-chat-widget-container\"", "id=\"ai-chat-widget-container\" style=\"width: 100%; height: 100%; position: relative;\"")
        .replace(/position: 'fixed'/g, "position: 'absolute'");

    return `<!DOCTYPE html>
<html>
<head><style>body { margin: 0; overflow: hidden; }</style></head>
<body>${embedCode}</body>
</html>`;
};


const DashboardPage: React.FC = () => {
    const { assistants, addAssistant, deleteAssistant } = useAssistants();
    const [selectedAssistant, setSelectedAssistant] = useState<AssistantConfig | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Form state
    const [mode, setMode] = useState<'register' | 'create'>('register');
    const [name, setName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [assistantId, setAssistantId] = useState('');
    const [instructions, setInstructions] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const resetForm = () => {
        setName('');
        setApiKey('');
        setAssistantId('');
        setInstructions('');
        setError('');
        setIsLoading(false);
        setShowAddForm(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (mode === 'register') {
                if (!name || !assistantId || !apiKey) throw new Error("All fields are required for registering.");
                addAssistant({ name, assistantId, apiKey });
            } else { // create mode
                if (!name || !instructions || !apiKey) throw new Error("All fields are required for creating.");
                const newAssistant = await openai.createAssistant(apiKey, name, instructions);
                addAssistant({ name, assistantId: newAssistant.id, apiKey });
            }
            resetForm();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const embedCode = selectedAssistant ? getEmbedCode(selectedAssistant.id) : '';
    const previewHtml = selectedAssistant ? getPreviewHtml(selectedAssistant.id) : '';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">My Assistants</h1>
                {!showAddForm && (
                    <button onClick={() => setShowAddForm(true)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New Assistant
                    </button>
                )}
            </div>

            {showAddForm && (
                 <div className="p-6 bg-gray-800 rounded-lg mb-6">
                    <div className="flex border-b border-gray-700 mb-4">
                        <button onClick={() => setMode('register')} className={`px-4 py-2 text-sm font-medium ${mode === 'register' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400'}`}>Register Existing</button>
                        <button onClick={() => setMode('create')} className={`px-4 py-2 text-sm font-medium ${mode === 'create' ? 'border-b-2 border-indigo-400 text-white' : 'text-gray-400'}`}>Create New</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <input type="text" placeholder="Your Name for this Assistant" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
                        
                        {mode === 'register' ? (
                            <input type="text" placeholder="OpenAI Assistant ID (asst_...)" value={assistantId} onChange={e => setAssistantId(e.target.value)} required className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
                        ) : (
                            <textarea placeholder="Instructions (e.g., You are a helpful assistant...)" value={instructions} onChange={e => setInstructions(e.target.value)} required rows={3} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        )}

                        <input type="password" placeholder="OpenAI API Key (sk_...)" value={apiKey} onChange={e => setApiKey(e.target.value)} required className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
                        
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-medium" disabled={isLoading}>Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium disabled:bg-indigo-800 disabled:cursor-not-allowed" disabled={isLoading}>
                                {isLoading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Assistant' : 'Save Assistant')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-gray-800 rounded-lg p-4 h-fit">
                    <h2 className="text-lg font-semibold mb-3">Assistants ({assistants.length})</h2>
                    <ul className="space-y-2">
                        {assistants.map(asst => (
                            <li key={asst.id} onClick={() => setSelectedAssistant(asst)}
                                className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${selectedAssistant?.id === asst.id ? 'bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                <span className="truncate pr-2">{asst.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); deleteAssistant(asst.id); if(selectedAssistant?.id === asst.id) setSelectedAssistant(null); }} className="text-gray-400 hover:text-white flex-shrink-0">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                         {assistants.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No assistants found.</p>}
                    </ul>
                </div>

                <div className="md:col-span-2 bg-gray-800 rounded-lg p-6">
                    {selectedAssistant ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">{selectedAssistant.name}</h2>
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-300">Embed Code</h3>
                                <p className="text-sm text-gray-400 mb-2">Paste this snippet just before the closing `&lt;/body&gt;` tag in your HTML file.</p>
                                <CodeBlock code={embedCode} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-300">Live Preview</h3>
                                <p className="text-sm text-gray-400 mb-4">This is an exact preview of the embedded widget.</p>
                                <div className="relative h-96 bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
                                   <iframe
                                        srcDoc={previewHtml}
                                        title="Chat Preview"
                                        className="w-full h-full border-none"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[30rem]">
                            <p className="text-gray-400 text-center">{assistants.length > 0 ? 'Select an assistant to see details and get the embed code.' : 'Create or register your first assistant to get started.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
