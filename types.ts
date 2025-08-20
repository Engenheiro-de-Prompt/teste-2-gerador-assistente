
export interface User {
    id: string;
    email: string;
}

export interface AssistantConfig {
    id: string;
    name: string;
    assistantId: string;
    apiKey: string;
    userId: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}
