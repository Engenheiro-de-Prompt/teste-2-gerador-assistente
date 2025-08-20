
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssistants } from '../hooks/useAssistants';
import type { AssistantConfig } from '../types';
import ChatWindow from '../components/ChatWindow';

const EmbedWrapperPage: React.FC = () => {
    const { assistantId } = useParams<{ assistantId: string }>();
    const { getAssistantById } = useAssistants();
    const [config, setConfig] = useState<AssistantConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (assistantId) {
            const foundConfig = getAssistantById(assistantId);
            if (foundConfig) {
                setConfig(foundConfig);
            } else {
                setError('Configuration for this assistant could not be found. Please check the embed code.');
            }
        }
    }, [assistantId, getAssistantById]);

    if (error) {
        return <div className="flex items-center justify-center h-screen bg-red-900 text-white p-4">{error}</div>;
    }

    if (!config) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading Chat...</div>;
    }
    
    // The ChatWindow is designed to be embedded, so it's rendered directly
    return (
        <div className="h-screen w-screen">
             <ChatWindow 
                apiKey={config.apiKey} 
                assistantId={config.assistantId} 
                onClose={() => { /* In iframe, close does nothing */}}
            />
        </div>
    );
};

export default EmbedWrapperPage;
