
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { AssistantConfig } from '../types';
import { useAuth } from './useAuth';

interface AssistantsContextType {
    assistants: AssistantConfig[];
    addAssistant: (assistant: Omit<AssistantConfig, 'id' | 'userId'>) => void;
    deleteAssistant: (id: string) => void;
    getAssistantById: (id: string) => AssistantConfig | undefined;
}

const AssistantsContext = createContext<AssistantsContextType | undefined>(undefined);

export const AssistantsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [assistants, setAssistants] = useState<AssistantConfig[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            try {
                const storedAssistants = localStorage.getItem(`chat-proxy-assistants_${user.id}`);
                if (storedAssistants) {
                    setAssistants(JSON.parse(storedAssistants));
                } else {
                    setAssistants([]);
                }
            } catch (error) {
                console.error("Failed to parse assistants from localStorage", error);
                setAssistants([]);
            }
        } else {
            setAssistants([]);
        }
    }, [user]);

    const saveAssistants = useCallback((newAssistants: AssistantConfig[]) => {
        if (user) {
            localStorage.setItem(`chat-proxy-assistants_${user.id}`, JSON.stringify(newAssistants));
            setAssistants(newAssistants);
        }
    },[user]);

    const addAssistant = useCallback((assistantData: Omit<AssistantConfig, 'id' | 'userId'>) => {
        if (user) {
            const newAssistant: AssistantConfig = {
                ...assistantData,
                id: `asst_cfg_${new Date().getTime()}`,
                userId: user.id,
            };
            const updatedAssistants = [...assistants, newAssistant];
            saveAssistants(updatedAssistants);
        }
    }, [assistants, saveAssistants, user]);

    const deleteAssistant = useCallback((id: string) => {
        const updatedAssistants = assistants.filter(a => a.id !== id);
        saveAssistants(updatedAssistants);
    }, [assistants, saveAssistants]);
    
    const getAssistantById = useCallback((id: string): AssistantConfig | undefined => {
        // In a real app, this might fetch from a backend. Here we simulate across all users' local storage.
        try {
            const allKeys = Object.keys(localStorage);
            const assistantKeys = allKeys.filter(key => key.startsWith('chat-proxy-assistants_'));
            for (const key of assistantKeys) {
                const storedData = localStorage.getItem(key);
                if (storedData) {
                    const userAssistants: AssistantConfig[] = JSON.parse(storedData);
                    const found = userAssistants.find(a => a.id === id);
                    if (found) return found;
                }
            }
        } catch (e) {
            console.error("Error searching for assistant:", e);
        }
        return undefined;
    }, []);

    return (
        <AssistantsContext.Provider value={{ assistants, addAssistant, deleteAssistant, getAssistantById }}>
            {children}
        </AssistantsContext.Provider>
    );
};

export const useAssistants = () => {
    const context = useContext(AssistantsContext);
    if (context === undefined) {
        throw new Error('useAssistants must be used within an AssistantsProvider');
    }
    return context;
};
