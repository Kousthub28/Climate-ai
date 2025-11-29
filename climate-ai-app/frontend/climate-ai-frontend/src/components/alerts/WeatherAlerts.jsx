import React, { useEffect, useState, useRef } from 'react';

function WeatherAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualMessage, setManualMessage] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [manualError, setManualError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  
  // Alert sound states
  const [soundHistory, setSoundHistory] = useState([]);
  const [soundTypes, setSoundTypes] = useState({});
  const [testLocation, setTestLocation] = useState({ lat: 40.7128, lng: -74.0060, name: 'New York' });
  const [testAlertType, setTestAlertType] = useState('rain');
  const [testResult, setTestResult] = useState(null);
  
  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioRef = useRef(null);
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Siren sound URLs - using actual sound files from public folder
  const sirenSounds = {
    rain: '/sounds/rain-siren.wav',
    flood: '/sounds/flood-siren.wav', 
    heatwave: '/sounds/heat-siren.wav',
    storm: '/sounds/storm-siren.wav',
    tornado: '/sounds/tornado-siren.wav'
  };

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

  // Real-time alert monitoring
  useEffect(() => {
    const checkForNewAlerts = async () => {
      try {
        const res = await fetch('/api/alerts/check-weather-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testLocation)
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          // Check for new alerts that should trigger sounds
          const newAlerts = data.data.filter(alert => 
            !activeAlerts.some(existing => 
              existing.timestamp === alert.timestamp && existing.type === alert.type
            )
          );
          
          if (newAlerts.length > 0 && audioEnabled) {
            newAlerts.forEach(alert => {
              playSirenSound(alert.type, alert);
            });
            setActiveAlerts(prev => [...prev, ...newAlerts]);
          }
        }
      } catch (err) {
        console.error('Error checking for new alerts:', err);
      }
    };

    const alertInterval = setInterval(checkForNewAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(alertInterval);
  }, [activeAlerts, audioEnabled, testLocation]);

  // Audio functions
  const playSirenSound = (alertType, alertData) => {
    if (!audioEnabled) return;
    
    try {
      // Try to play the sound file first
      const audio = new Audio(sirenSounds[alertType]);
      audio.volume = 0.7;
      audio.loop = true;
      
      // Set current alert
      setCurrentAlert(alertData);
      setIsPlaying(true);
      audioRef.current = audio;
      
      // Play the sound
      audio.play().catch(err => {
        console.log('Sound file not found, generating siren sound...');
        // Fallback to generated siren sound
        generateSirenSound(alertType, alertData);
      });
      
      // Stop after 10 seconds
      setTimeout(() => {
        stopSirenSound();
      }, 10000);
      
    } catch (err) {
      console.error('Error creating audio:', err);
      // Fallback to generated siren sound
      generateSirenSound(alertType, alertData);
    }
  };

  const generateSirenSound = (alertType, alertData) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Different frequencies for different alert types
      const frequencies = {
        rain: [800, 1000],
        flood: [600, 800],
        heatwave: [1000, 1200],
        storm: [700, 900],
        tornado: [500, 700]
      };
      
      const freq = frequencies[alertType] || [800, 1000];
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
      
      // Create siren effect by alternating frequencies
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
      oscillator.frequency.setValueAtTime(freq[1], audioContext.currentTime + 0.5);
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime + 1);
      oscillator.frequency.setValueAtTime(freq[1], audioContext.currentTime + 1.5);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 10); // Fade out
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 10);
      
      // Set current alert
      setCurrentAlert(alertData);
      setIsPlaying(true);
      
      // Stop after 10 seconds
      setTimeout(() => {
        stopSirenSound();
      }, 10000);
      
    } catch (err) {
      console.error('Error generating siren sound:', err);
      // If all else fails, just show the alert without sound
      setCurrentAlert(alertData);
      setIsPlaying(false);
    }
  };

  const stopSirenSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentAlert(null);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      stopSirenSound();
    }
  };

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

  // Alert sound functions
  const fetchSoundHistory = async () => {
    try {
      const res = await fetch('/api/alerts/sound-history');
      const data = await res.json();
      if (data.success) {
        setSoundHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching sound history:', err);
    }
  };

  const fetchSoundTypes = async () => {
    try {
      const res = await fetch('/api/alerts/sound-types');
      const data = await res.json();
      if (data.success) {
        setSoundTypes(data.data);
      }
    } catch (err) {
      console.error('Error fetching sound types:', err);
    }
  };

  const testAlertSound = async () => {
    try {
      const res = await fetch('/api/alerts/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testAlertType,
          location: testLocation
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data.data);
        // Play the siren sound immediately
        playSirenSound(testAlertType, data.data);
        fetchSoundHistory(); // Refresh history
      }
    } catch (err) {
      console.error('Error testing alert sound:', err);
    }
  };

  const checkWeatherAlerts = async () => {
    try {
      const res = await fetch('/api/alerts/check-weather-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLocation)
      });
      const data = await res.json();
      if (data.success) {
        alert(`🔍 Weather alert check completed! Found ${data.data.length} alerts.`);
        fetchSoundHistory(); // Refresh history
      }
    } catch (err) {
      console.error('Error checking weather alerts:', err);
    }
  };

  // Load sound types on component mount
  useEffect(() => {
    fetchSoundTypes();
  }, []);

  return (
    <section style={{ maxWidth: 600, margin: '2em auto', padding: '2em', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      {/* Live Alert Display */}
      {currentAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#dc2626',
          color: 'white',
          padding: '1em',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
          animation: 'pulse 1s infinite',
          maxWidth: '300px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2em' }}>🚨</span>
            <strong>LIVE ALERT</strong>
            {isPlaying && <span style={{ fontSize: '1.2em' }}>🔊</span>}
          </div>
          <div style={{ fontSize: '0.9em', marginBottom: '8px' }}>
            <strong>{currentAlert.type.toUpperCase()}</strong> in {currentAlert.location}
          </div>
          <div style={{ fontSize: '0.8em', marginBottom: '8px' }}>
            {currentAlert.message}
          </div>
          <button
            onClick={stopSirenSound}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8em'
            }}
          >
            Stop Siren
          </button>
        </div>
      )}

      {/* Audio Controls */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px', 
        background: '#1f2937', 
        color: 'white', 
        padding: '0.8em', 
        borderRadius: '8px', 
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <button
          onClick={toggleAudio}
          style={{
            background: audioEnabled ? '#10b981' : '#ef4444',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8em'
          }}
        >
          {audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
        </button>
        {isPlaying && (
          <span style={{ fontSize: '0.8em', color: '#fbbf24' }}>
            🔊 Playing Siren
          </span>
        )}
      </div>

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

      {/* Alert Sound System */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '2em', marginTop: '2em' }}>
        <h3 style={{ fontSize: '1.1em', marginBottom: 10 }}>🚨 Alert Sound System</h3>
        
        {/* Alert Sound Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={checkWeatherAlerts}
            style={{ padding: '0.5em 1em', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            🔍 Check Weather Alerts
          </button>
          <button
            onClick={fetchSoundHistory}
            style={{ padding: '0.5em 1em', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            📋 View Sound History
          </button>
        </div>

        {/* Test Alert Sound */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: '1em', marginBottom: 8 }}>Test Alert Sound:</h4>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <select
              value={testAlertType}
              onChange={e => setTestAlertType(e.target.value)}
              style={{ padding: '0.5em', borderRadius: 4, border: '1px solid #ccc', minWidth: '120px' }}
            >
              <option value="rain">🌧️ Rain Alert</option>
              <option value="flood">🌊 Flood Alert</option>
              <option value="heatwave">🔥 Heat Wave Alert</option>
              <option value="storm">⛈️ Storm Alert</option>
              <option value="tornado">🌪️ Tornado Alert</option>
            </select>
            <input
              type="text"
              value={testLocation.name}
              onChange={e => setTestLocation({...testLocation, name: e.target.value})}
              placeholder="Location name"
              style={{ padding: '0.5em', borderRadius: 4, border: '1px solid #ccc', width: '120px' }}
            />
            <input
              type="number"
              value={testLocation.lat}
              onChange={e => setTestLocation({...testLocation, lat: parseFloat(e.target.value)})}
              placeholder="Latitude"
              style={{ padding: '0.5em', borderRadius: 4, border: '1px solid #ccc', width: '100px' }}
            />
            <input
              type="number"
              value={testLocation.lng}
              onChange={e => setTestLocation({...testLocation, lng: parseFloat(e.target.value)})}
              placeholder="Longitude"
              style={{ padding: '0.5em', borderRadius: 4, border: '1px solid #ccc', width: '100px' }}
            />
            <button
              onClick={testAlertSound}
              style={{ padding: '0.5em 1em', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              🔊 Test Sound
            </button>
          </div>
        </div>

        {/* Sound Types Info */}
        {Object.keys(soundTypes).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: '1em', marginBottom: 8 }}>Available Alert Sounds:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              {Object.entries(soundTypes).map(([type, info]) => (
                <div key={type} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '0.8em',
                  fontSize: '0.9em'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {info.emoji} {info.name}
                  </div>
                  <div style={{ color: '#64748b' }}>{info.description}</div>
                  <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>
                    Sound: {info.sound}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>
                    Severity: {info.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 6, padding: '1em', marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Test Result for {testResult.location}:</h4>
            <div style={{ fontSize: '0.9em' }}>
              <p><strong>Alert Type:</strong> {testResult.type.toUpperCase()}</p>
              <p><strong>Severity:</strong> {testResult.severity}</p>
              <p><strong>Weather:</strong> {testResult.weather.condition}</p>
              <p><strong>Temperature:</strong> {testResult.weather.temperature.toFixed(1)}°C</p>
              <p><strong>Sound File:</strong> {soundTypes[testResult.type]?.sound}</p>
            </div>
          </div>
        )}

        {/* Sound Alert History */}
        {soundHistory.length > 0 && (
          <div style={{ marginTop: '1em' }}>
            <h4 style={{ fontSize: '1em', marginBottom: 8 }}>Recent Sound Alerts:</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {soundHistory.map((alert, idx) => (
                <div key={idx} style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  padding: '0.8em',
                  marginBottom: 8,
                  fontSize: '0.9em'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {soundTypes[alert.type]?.emoji || '🚨'} {alert.location} - {new Date(alert.sentAt || alert.timestamp).toLocaleString()}
                  </div>
                  <div><strong>Type:</strong> {alert.type.toUpperCase()}</div>
                  <div><strong>Severity:</strong> {alert.severity}</div>
                  <div><strong>Weather:</strong> {alert.weather.condition}</div>
                  <div><strong>Sound:</strong> {alert.soundFile}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ color: '#888', fontSize: '0.9em', marginTop: '1em' }}>
          💡 The alert sound system automatically monitors weather conditions every 10 seconds and plays siren sounds directly in your browser when alerts are triggered.
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  );
}

export default WeatherAlerts;

