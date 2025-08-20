const API_BASE = 'https://api.openai.com/v1';

const commonHeaders = (apiKey: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'assistants=v2',
});

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error(errorData.error?.message || 'An unknown API error occurred.');
    }
    return response.json();
};

export const createAssistant = async (
    apiKey: string, 
    name: string, 
    instructions: string, 
    model: string = 'gpt-4o'
): Promise<{ id: string }> => {
    const response = await fetch(`${API_BASE}/assistants`, {
        method: 'POST',
        headers: commonHeaders(apiKey),
        body: JSON.stringify({
            name,
            instructions,
            tools: [{ type: "code_interpreter" }], // A default tool
            model,
        }),
    });
    return handleResponse(response);
};

export const createThread = async (apiKey: string): Promise<{ id: string }> => {
    const response = await fetch(`${API_BASE}/threads`, {
        method: 'POST',
        headers: commonHeaders(apiKey),
    });
    return handleResponse(response);
};

export const addMessage = async (apiKey: string, threadId: string, content: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/threads/${threadId}/messages`, {
        method: 'POST',
        headers: commonHeaders(apiKey),
        body: JSON.stringify({
            role: 'user',
            content: content,
        }),
    });
    return handleResponse(response);
};

export const createRun = async (apiKey: string, threadId: string, assistantId: string): Promise<{ id: string }> => {
    const response = await fetch(`${API_BASE}/threads/${threadId}/runs`, {
        method: 'POST',
        headers: commonHeaders(apiKey),
        body: JSON.stringify({
            assistant_id: assistantId,
        }),
    });
    return handleResponse(response);
};

export const getRunStatus = async (apiKey: string, threadId: string, runId: string): Promise<{ status: string }> => {
    const response = await fetch(`${API_BASE}/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: commonHeaders(apiKey),
    });
    return handleResponse(response);
};

export const listMessages = async (apiKey: string, threadId: string): Promise<{ data: any[] }> => {
    const response = await fetch(`${API_BASE}/threads/${threadId}/messages`, {
        method: 'GET',
        headers: commonHeaders(apiKey),
    });
    return handleResponse(response);
};
