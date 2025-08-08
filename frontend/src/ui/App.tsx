import React, { useCallback, useRef, useState } from 'react';

function buildApiUrl(baseUrl: string | undefined, path: string): string {
  const normalizedBase = (baseUrl ?? '').replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function useSse(url: string | null) {
  const [data, setData] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const start = useCallback(() => {
    if (!url) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource(url);
    eventSourceRef.current = es;
    setData('');
    es.onmessage = (ev) => {
      setData((prev) => prev + ev.data.replace(/\\n/g, '\n'));
    };
    es.onerror = () => {
      es.close();
    };
  }, [url]);

  const stop = useCallback(() => {
    eventSourceRef.current?.close();
  }, []);

  return { data, start, stop };
}

export function App() {
  const [cmd, setCmd] = useState<string>('docker ps');
  const [running, setRunning] = useState(false);
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;
  const apiPath = cmd ? `/api/exec?cmd=${encodeURIComponent(cmd)}` : null;
  const sse = useSse(apiPath ? buildApiUrl(backendBaseUrl, apiPath) : null);

  const onRun = useCallback(() => {
    setRunning(true);
    sse.start();
  }, [sse]);

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}>
      <h1>Terminal-like UI</h1>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="git status | docker ps"
          style={{ flex: 1, padding: '0.5rem', fontFamily: 'inherit' }}
        />
        <button onClick={onRun} disabled={!cmd} style={{ padding: '0.5rem 1rem' }}>Run</button>
      </div>
      <div style={{ marginTop: '1rem', background: '#0a0a0a', color: '#e2e8f0', padding: '1rem', borderRadius: 8, minHeight: 240, whiteSpace: 'pre-wrap' }}>
        {sse.data || (running ? 'Running…' : 'Output will appear here')}
      </div>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Allowed binaries: git, docker (configurable via ALLOWED_BINARIES)</p>
    </div>
  );
}

