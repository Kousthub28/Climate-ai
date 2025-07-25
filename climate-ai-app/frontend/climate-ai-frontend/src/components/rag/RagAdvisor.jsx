import React, { useState } from 'react';
import { askGreenPolicyRAG } from '../../services/ragService';

const RagAdvisor = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const result = await askGreenPolicyRAG(question);
      setAnswer(result);
    } catch (err) {
      setError('Error: ' + err.message);
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
            bottom: 96,
            right: 20,
            zIndex: 1000,
            background: '#16a34a',
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
          title="Ask Climate AI"
        >
          🌱
        </button>
      )}
      {/* Advisor Modal/Popup */}
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
          width: 380,
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
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1a3a2a' }}>Green Policy RAG Advisor</h2>
          <div style={{ color: '#4b5563', marginBottom: 18, fontSize: 15, textAlign: 'center' }}>
            Ask any climate, urban, or sustainability question and get an evidence-based answer from Climate AI.
          </div>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Type your climate policy question..."
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
            onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question}
            style={{
              background: '#16a34a',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              padding: '10px 24px',
              border: 'none',
              borderRadius: 8,
              cursor: loading || !question ? 'not-allowed' : 'pointer',
              marginBottom: 10,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Asking...' : 'Ask Climate AI'}
          </button>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          {answer && (
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
              <strong>Answer:</strong>
              <div style={{ marginTop: 6 }}>{answer}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RagAdvisor; 