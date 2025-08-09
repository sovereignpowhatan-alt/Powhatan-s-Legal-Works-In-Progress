import fetch from 'node-fetch';
import { config } from '../config.js';
export async function chat(opts) {
    switch (opts.provider) {
        case 'ollama':
            return chatOllama(opts.model || 'phi3:mini', opts.messages);
        case 'openai':
            return chatOpenAI('https://api.openai.com/v1/chat/completions', config.llm.openai, opts.model || 'gpt-4o-mini', opts.messages);
        case 'openrouter':
            return chatOpenAI('https://openrouter.ai/api/v1/chat/completions', config.llm.openrouter, opts.model || 'openrouter/auto', opts.messages);
        default:
            throw new Error('Provider not implemented in this demo');
    }
}
async function chatOllama(model, messages) {
    const resp = await fetch(`${config.llm.ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages }),
    });
    if (!resp.ok)
        throw new Error(`Ollama error: ${resp.status}`);
    const json = (await resp.json());
    const text = json.message?.content || json.response || '';
    return { content: text };
}
async function chatOpenAI(endpoint, apiKey, model, messages) {
    if (!apiKey)
        throw new Error('Missing API key');
    const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages }),
    });
    if (!resp.ok)
        throw new Error(`OpenAI-like error: ${resp.status}`);
    const json = (await resp.json());
    const text = json.choices?.[0]?.message?.content || '';
    return { content: text };
}
