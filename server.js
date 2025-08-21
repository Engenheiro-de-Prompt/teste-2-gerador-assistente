import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3000;

// Armazenamento em memória para as configurações.
// Em um ambiente de produção, isso seria um banco de dados.
const assistantConfigs = {};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint para criar e registrar um assistente, e retornar o código de embed
app.post('/api/create-embed', async (req, res) => {
    const { apiKey, assistantId, name, description, model } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'OpenAI API Key is required.' });
    }

    let finalAssistantId = assistantId;
    const openai = new OpenAI({ apiKey });

    try {
        // Se não for fornecido um ID, cria um novo assistente
        if (!finalAssistantId) {
            if (!name || !description) {
                return res.status(400).json({ error: 'Name and description are required to create a new assistant.' });
            }
            const newAssistant = await openai.beta.assistants.create({
                name: name,
                instructions: description,
                tools: [{ type: 'code_interpreter' }, { type: 'file_search' }],
                model: model || 'gpt-4o', // Usa o modelo fornecido ou um padrão
            });
            finalAssistantId = newAssistant.id;
        } else {
            // Opcional: Verificar se o assistente existente é válido
            await openai.beta.assistants.retrieve(finalAssistantId);
        }

        const configId = uuidv4();
        assistantConfigs[configId] = {
            apiKey: apiKey,
            assistantId: finalAssistantId,
        };

        const embedCode = `<script src="http://localhost:${port}/embed.js" data-config-id="${configId}" defer></script>`;
        const chatUrl = `http://localhost:${port}/chat.html?configId=${configId}`;

        console.log(`Configuration created: ${configId} for assistant ${finalAssistantId}`);

        res.json({
            success: true,
            message: 'Assistant configured successfully!',
            configId: configId,
            embedCode: embedCode,
            chatUrl: chatUrl,
        });

    } catch (error) {
        console.error('Error configuring assistant:', error.message);
        res.status(500).json({ error: 'Failed to configure assistant. Please check your API key and Assistant ID.' });
    }
});

// Endpoint de proxy para o chat
app.post('/api/chat/:configId/message', async (req, res) => {
    const { configId } = req.params;
    const { message, threadId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message content is required.' });
    }

    const config = assistantConfigs[configId];
    if (!config) {
        return res.status(404).json({ error: 'Configuration for this assistant could not be found. Please check the embed code.' });
    }

    const { apiKey, assistantId } = config;
    const openai = new OpenAI({ apiKey });

    try {
        const currentThreadId = threadId || (await openai.beta.threads.create()).id;

        // Adiciona a mensagem do usuário à thread
        await openai.beta.threads.messages.create(currentThreadId, {
            role: 'user',
            content: message,
        });

        // Cria e aguarda a execução (run)
        const run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
            assistant_id: assistantId,
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(currentThreadId);
            // A resposta do assistente é a primeira mensagem na lista (mais recente)
            const assistantResponse = messages.data[0].content[0].text.value;

            res.json({
                success: true,
                response: assistantResponse,
                threadId: currentThreadId,
            });
        } else {
            console.error('Run did not complete successfully:', run.status);
            res.status(500).json({ error: `Run finished with status: ${run.status}` });
        }
    } catch (error) {
        console.error('Error during chat processing:', error.message);
        res.status(500).json({ error: 'An error occurred while processing the chat message.' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
