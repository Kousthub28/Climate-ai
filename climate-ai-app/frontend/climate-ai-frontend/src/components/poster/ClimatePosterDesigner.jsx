import React, { useState } from 'react';

export default function ClimatePosterDesigner() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setPoster(null);
    const res = await fetch('/api/genai-poster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput: input }),
    });
    const data = await res.json();
    setPoster(data);
    setLoading(false);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 120,
            right: 32,
            zIndex: 1000,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 64,
            height: 64,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            fontSize: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          title="Design Climate Poster"
        >
          🎨
        </button>
      )}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 120,
          right: 32,
          zIndex: 1001,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.16)',
          padding: 32,
          width: 400,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 12,
              right: 16,
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              color: '#888',
              cursor: 'pointer',
            }}
            title="Close"
          >
            ×
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#2563eb' }}>Climate Poster Designer</h2>
          <div style={{ color: '#4b5563', marginBottom: 18, fontSize: 15, textAlign: 'center' }}>
            Describe your poster (e.g., water saving for kids)
          </div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your poster"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              marginBottom: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input}
            style={{
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              padding: '10px 24px',
              border: 'none',
              borderRadius: 8,
              cursor: loading || !input ? 'not-allowed' : 'pointer',
              marginBottom: 10,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Generating...' : 'Generate Poster'}
          </button>
          {poster && (
            <div style={{
              marginTop: 18,
              background: '#f6fef9',
              padding: 16,
              borderRadius: 10,
              width: '100%',
              color: '#1a3a2a',
              fontSize: 15,
              lineHeight: 1.6,
              boxShadow: '0 2px 8px rgba(22,163,74,0.06)',
            }}>
              <img src={poster.imageUrl} alt="Poster" style={{ width: '100%', borderRadius: 8 }} />
              <div style={{ fontWeight: 600, marginTop: 10 }}>{poster.caption}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
} 