import sirenAlertSound from '../assets/siren-alert.wav';
import emergencySirenSound from '../assets/emergency-siren.wav';

class NotificationService {
  constructor() {
    this.permission = null;
    this.audioContext = null;
    this.isPlaying = false;
    this.currentAudio = null;
    this.init();
  }

  async init() {
    // Request notification permission
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }

    // Initialize audio context
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Show browser notification
  showNotification(title, options = {}) {
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    }
    return null;
  }

  // Play alert sound
  async playAlertSound(severity = 'medium') {
    if (this.isPlaying) {
      this.stopAlertSound();
    }

    try {
      const soundFile = severity === 'high' || severity === 'critical' 
        ? emergencySirenSound 
        : sirenAlertSound;

      this.currentAudio = new Audio(soundFile);
      this.currentAudio.volume = 0.7;
      this.currentAudio.loop = severity === 'high' || severity === 'critical';
      
      this.isPlaying = true;
      await this.currentAudio.play();

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
      };

      // Auto stop after 30 seconds for looping sounds
      if (this.currentAudio.loop) {
        setTimeout(() => {
          this.stopAlertSound();
        }, 30000);
      }
    } catch (error) {
      console.error('Error playing alert sound:', error);
      this.isPlaying = false;
    }
  }

  // Stop alert sound
  stopAlertSound() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  // Show weather alert with sound and notification
  showWeatherAlert(alert) {
    const { title, message, severity, type } = alert;
    
    // Show browser notification
    this.showNotification(title, {
      body: message,
      tag: `weather-alert-${type}`,
      requireInteraction: severity === 'high' || severity === 'critical',
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });

    // Play alert sound
    this.playAlertSound(severity);

    // Show visual alert (this will be handled by the component)
    this.showVisualAlert(alert);
  }

  // Show visual alert overlay
  showVisualAlert(alert) {
    const event = new CustomEvent('weatherAlert', {
      detail: alert
    });
    window.dispatchEvent(event);
  }

  // Create persistent notification for severe alerts
  createPersistentAlert(alert) {
    const alertElement = document.createElement('div');
    alertElement.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${
      alert.severity === 'high' || alert.severity === 'critical'
        ? 'bg-red-50 border-red-500 text-red-800'
        : alert.severity === 'medium'
        ? 'bg-orange-50 border-orange-500 text-orange-800'
        : 'bg-yellow-50 border-yellow-500 text-yellow-800'
    }`;

    alertElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 ${
            alert.severity === 'high' || alert.severity === 'critical'
              ? 'text-red-400'
              : alert.severity === 'medium'
              ? 'text-orange-400'
              : 'text-yellow-400'
          }" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium">${alert.title}</h3>
          <p class="mt-1 text-sm">${alert.message}</p>
          <div class="mt-3 flex space-x-2">
            <button class="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
              Dismiss
            </button>
            <button class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700" onclick="window.location.href='/alerts'">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(alertElement);

    // Auto remove after 60 seconds for non-critical alerts
    if (alert.severity !== 'high' && alert.severity !== 'critical') {
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.remove();
        }
      }, 60000);
    }
  }

  // Check for new alerts periodically
  startAlertMonitoring(checkInterval = 300000) { // 5 minutes
    setInterval(async () => {
      try {
        // This would typically call your API to check for new alerts
        // For now, we'll simulate with a random chance
        if (Math.random() < 0.1) { // 10% chance every 5 minutes
          const mockAlert = this.generateMockAlert();
          this.showWeatherAlert(mockAlert);
        }
      } catch (error) {
        console.error('Error checking for alerts:', error);
      }
    }, checkInterval);
  }

  // Generate mock alert for testing
  generateMockAlert() {
    const alertTypes = [
      {
        type: 'thunderstorm',
        title: 'Severe Thunderstorm Warning',
        message: 'Severe thunderstorms with heavy rain and strong winds expected.',
        severity: 'medium',
        icon: '⛈️'
      },
      {
        type: 'heat_wave',
        title: 'Extreme Heat Warning',
        message: 'Dangerous heat levels expected. Stay hydrated and avoid outdoor activities.',
        severity: 'high',
        icon: '🌡️'
      },
      {
        type: 'flood',
        title: 'Flash Flood Alert',
        message: 'Flash flooding possible. Avoid low-lying areas and flooded roads.',
        severity: 'high',
        icon: '🌊'
      },
      {
        type: 'air_quality',
        title: 'Air Quality Alert',
        message: 'Air quality is unhealthy. Limit outdoor activities.',
        severity: 'medium',
        icon: '🌫️'
      }
    ];

    return alertTypes[Math.floor(Math.random() * alertTypes.length)];
  }

  // Request notification permission
  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission;
    }
    return 'denied';
  }

  // Check if notifications are supported and permitted
  isNotificationSupported() {
    return 'Notification' in window && this.permission === 'granted';
  }

  // Test alert system
  testAlert(severity = 'medium') {
    const testAlert = {
      type: 'test',
      title: 'Test Weather Alert',
      message: 'This is a test of the weather alert system. All systems are functioning normally.',
      severity,
      icon: '🧪'
    };

    this.showWeatherAlert(testAlert);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

