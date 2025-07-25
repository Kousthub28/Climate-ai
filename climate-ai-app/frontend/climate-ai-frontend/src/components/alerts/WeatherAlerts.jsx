import React, { useEffect, useState } from 'react';

function WeatherAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualMessage, setManualMessage] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [manualError, setManualError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  // Polling for real-time updates (every 30 seconds)
  useEffect(() => {
    const fetchAlerts = () => {
      fetch('/api/alerts')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch alerts');
          return res.json();
        })
        .then(data => {
          setAlerts(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual alert trigger (for smoke test)
  const handleManualAlert = async (e) => {
    e.preventDefault();
    if (Date.now() - lastSubmitTime < 1000) return; // Ignore if less than 1s since last submit
    setLastSubmitTime(Date.now());
    setManualSuccess('');
    setManualError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: manualMessage || 'Manual test alert!',
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error('Failed to create alert');
      const data = await res.json();
      setManualSuccess('Alert created! It will appear below.');
      setManualMessage('');
      setTimeout(() => {
        setLoading(true);
        fetch('/api/alerts')
          .then(res => res.json())
          .then(data => {
            setAlerts(data);
            setLoading(false);
          });
      }, 200);
    } catch (err) {
      setManualError('Failed to create alert.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ maxWidth: 600, margin: '2em auto', padding: '2em', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      {/* Telegram Join Link */}
      <div style={{ marginBottom: '2em', textAlign: 'center' }}>
        <a
          href="https://t.me/climate_guardian_bot " // TODO: Replace with your actual Telegram group/channel invite link
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#229ED9', fontWeight: 'bold', fontSize: '1.1em', textDecoration: 'none' }}
        >
          📢 Join our Telegram Alerts Group
        </a>
      </div>

      {/* Recent Alerts Section */}
      <div style={{ marginBottom: '2em' }}>
        <h2 style={{ fontSize: '1.4em', marginBottom: 12 }}>Recent Alerts</h2>
        {loading ? (
          <div>Loading alerts...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>Error: {error}</div>
        ) : alerts.length === 0 ? (
          <div style={{ color: '#888' }}>No alerts yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {alerts.map((alert, idx) => (
              <li key={idx} style={{
                background: '#f7fafc',
                borderLeft: '4px solid #229ED9',
                marginBottom: 16,
                padding: '1em',
                borderRadius: 6,
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
                <div>{alert.message}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Manual Alert (Smoke Test) Section */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '2em' }}>
        <h3 style={{ fontSize: '1.1em', marginBottom: 10 }}>Manual Alert (Smoke Test)</h3>
        <form onSubmit={handleManualAlert} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input
            type="text"
            value={manualMessage}
            onChange={e => setManualMessage(e.target.value)}
            placeholder="Enter alert message"
            style={{ flex: 1, padding: '0.5em', borderRadius: 4, border: '1px solid #ccc', fontSize: '1em' }}
            aria-label="Alert message"
          />
          <button
            type="submit"
            style={{ padding: '0.5em 1.2em', background: '#229ED9', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send'}
          </button>
        </form>
        {manualSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{manualSuccess}</div>}
        {manualError && <div style={{ color: 'red', marginBottom: 8 }}>{manualError}</div>}
        <div style={{ color: '#888', fontSize: '0.95em' }}>
          Use this form to test the alert system. The alert will appear above and (if configured) be sent to Telegram.
        </div>
      </div>
    </section>
  );
}

export default WeatherAlerts;

