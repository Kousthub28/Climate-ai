import React, { useState } from 'react';
import { posterAPI } from '../../services/api';
import { Button } from '../ui/button';

const ClimatePosterDesigner = () => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');
    try {
      const res = await posterAPI.generatePoster(prompt);
      setImageUrl(res.data.imageUrl);
    } catch (err) {
      setError('Failed to generate poster. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 170,
            right: 20,
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
          title="Open Climate GenAI Designer"
        >
          🧬
        </button>
      )}
      {/* Designer Modal/Popup */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1001,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.16)',
          padding: 32,
          width: 420,
          maxWidth: '95vw',
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
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#2563eb' }}>Climate GenAI Designer</h2>
          <div style={{ color: '#4b5563', marginBottom: 18, fontSize: 15, textAlign: 'center' }}>
            Generate banners, posters, or flyers for climate campaigns. Try prompts like:<br />
            <em>"Design a poster about water saving for kids"</em>
          </div>
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your climate poster..."
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
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            style={{ width: '100%', marginBottom: 10 }}
          >
            {loading ? 'Generating...' : 'Generate Poster'}
          </Button>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          {imageUrl && (
            <div style={{ marginTop: 18, width: '100%', textAlign: 'center' }}>
              <img
                src={imageUrl}
                alt="Generated Climate Poster"
                style={{
                  maxWidth: '100%',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                  marginBottom: 8,
                }}
              />
              <div style={{ color: '#2563eb', fontWeight: 500, fontSize: 15 }}>Right-click to save your poster!</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ClimatePosterDesigner; 