import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type Props = { token: string | null };

export const ChatAssistant: React.FC<Props> = ({ token }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState<'ollama' | 'openai' | 'openrouter'>('ollama');

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const send = async () => {
    if (!token || !input.trim()) return;
    const next = [...messages, { role: 'user' as const, content: input }];
    setMessages(next);
    setInput('');
    const { data } = await axios.post(
      '/api/llm/chat',
      { provider, messages: next },
      { headers: { ...authHeaders } }
    );
    setMessages([...next, { role: 'assistant', content: data.content }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #eee' }}>
        <strong>{t('assistant')}</strong>
        <select value={provider} onChange={(e) => setProvider(e.target.value as any)} style={{ marginLeft: 'auto' }}>
          <option value="ollama">Ollama (local)</option>
          <option value="openai">OpenAI</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{m.role === 'user' ? 'You' : 'Luma'}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid #eee' }}>
        <input
          placeholder={t('chat_placeholder')!}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          style={{ flex: 1 }}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
};