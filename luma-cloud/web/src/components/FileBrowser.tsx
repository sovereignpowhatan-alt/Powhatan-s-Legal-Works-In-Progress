import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

type FileItem = { key: string; size: number; lastModified: string };

type Props = { token: string | null };

export const FileBrowser: React.FC<Props> = ({ token }) => {
  const { t } = useTranslation();
  const [prefix, setPrefix] = useState('');
  const [dirs, setDirs] = useState<{ prefix: string }[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const refresh = async (p = prefix) => {
    if (!token) return;
    const { data } = await axios.get('/api/files/list', { params: { prefix: p }, headers: authHeaders });
    setDirs(data.dirs);
    setFiles(data.files);
    setPrefix(p);
  };

  useEffect(() => {
    if (token) refresh('');
  }, [token]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append('file', f);
    form.append('key', `${prefix}${f.name}`);
    await axios.post('/api/files/upload', form, { headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' } });
    await refresh();
    e.currentTarget.value = '';
  };

  const download = async (key: string) => {
    const { data } = await axios.get('/api/files/download', { params: { key }, headers: authHeaders });
    window.open(data.url, '_blank');
  };

  const enterDir = (p: string) => refresh(p);
  const upDir = () => {
    const parts = prefix.split('/').filter(Boolean);
    parts.pop();
    const up = parts.length ? parts.join('/') + '/' : '';
    refresh(up);
  };

  if (!token) return <div style={{ padding: 12 }}>{t('login')} to view {t('files')}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderBottom: '1px solid #eee' }}>
        <button onClick={upDir}>⬆</button>
        <div style={{ fontFamily: 'monospace' }}>{'/' + prefix}</div>
        <div style={{ marginLeft: 'auto' }}>
          <input type="file" onChange={onUpload} />
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Size</th>
              <th style={{ padding: 8 }}>Modified</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {dirs.map((d) => {
              const name = d.prefix.slice(prefix.length).replace(/\/$/, '');
              return (
                <tr key={d.prefix}>
                  <td style={{ padding: 8, cursor: 'pointer', color: '#2563eb' }} onClick={() => enterDir(d.prefix)}>📁 {name}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              );
            })}
            {files.map((f) => {
              const name = f.key.slice(prefix.length);
              return (
                <tr key={f.key}>
                  <td style={{ padding: 8 }}>📄 {name}</td>
                  <td style={{ padding: 8 }}>{f.size}</td>
                  <td style={{ padding: 8 }}>{new Date(f.lastModified).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => download(f.key)}>Download</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};