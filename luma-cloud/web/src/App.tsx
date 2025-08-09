import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FileBrowser } from './components/FileBrowser';
import { ChatAssistant } from './components/ChatAssistant';
import { LanguageToggle } from './components/LanguageToggle';

function colorfulGradient() {
  return {
    background: 'linear-gradient(135deg, #ff4ecd 0%, #2dd4bf 50%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text' as const,
    color: 'transparent',
  };
}

export const App: React.FC = () => {
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
  }, [token]);

  const login = async () => {
    const { data } = await axios.post('/auth/login', { username, password });
    setToken(data.token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>
          <span style={colorfulGradient()}>{t('app_title')}</span>
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageToggle />
          {token ? (
            <button onClick={logout}>{t('logout')}</button>
          ) : (
            <>
              <input placeholder={t('username')!} value={username} onChange={(e) => setUsername(e.target.value)} />
              <input placeholder={t('password')!} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={login}>{t('login')}</button>
            </>
          )}
        </div>
      </header>
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 12, flex: 1, padding: 12 }}>
        <section style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          <FileBrowser token={token} />
        </section>
        <aside style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          <ChatAssistant token={token} />
        </aside>
      </main>
    </div>
  );
};