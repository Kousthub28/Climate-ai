import React, { useState, useEffect, useRef } from 'react';
// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  Lightbulb,
  CloudRain,
  Leaf,
  TrendingUp,
  Building,
  BarChart,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { chatAPI } from '../../services/api';
import { chartAPI } from '../../services/api';
import { Bar } from 'react-chartjs-2';
import '../../App.css';

const ChatBot = ({ compact = false, context }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load initial suggestions
    loadSuggestions();
    
    // Add welcome message
    setMessages([{
      id: 1,
      type: 'bot',
      content: `Hello ${user?.profile?.firstName || 'there'}! I'm your Climate AI assistant. I can help you with weather information, climate analysis, carbon footprint tracking, urban planning insights, and sustainability advice. What would you like to know?`,
      timestamp: new Date(),
      confidence: 1.0,
      source: 'System'
    }]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatAPI.getSuggestions();
      const suggestions = response.data?.data?.suggestions;
      if (Array.isArray(suggestions)) {
        setSuggestions(suggestions.slice(0, 6));
      } else {
        setSuggestions([]); // fallback to empty array
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]); // fallback to empty array
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await chatAPI.sendMessage(message, {}, conversationHistory);
      const { response: botResponse, confidence, source, suggestions: newSuggestions, actions } = response.data.data;

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        confidence,
        source,
        suggestions: newSuggestions,
        actions
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (newSuggestions) {
        setSuggestions(newSuggestions.slice(0, 6));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        confidence: 0,
        source: 'Error Handler'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendChartPrompt = async () => {
    setIsChartLoading(true);
    setChartError(null);
    // Dummy data for demonstration; replace with real user/city data as needed
    const userData = { carbon: 120 };
    const cityData = { carbon: 90 };
    const question = 'Show me a chart of my carbon footprint vs. city average';
    try {
      const res = await chartAPI.generateChartSpec(userData, cityData, question);
      const { chartConfig, explanation } = res.data;
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          type: 'bot',
          content: (
            <div>
              <Bar data={chartConfig.data} options={chartConfig.options} />
              <div className="mt-2 text-sm">{explanation}</div>
            </div>
          ),
          timestamp: new Date(),
          confidence: 1.0,
          source: 'AI Chart'
        }
      ]);
    } catch (error) {
      setChartError('Failed to generate chart.');
    } finally {
      setIsChartLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleActionClick = (action) => {
    // Handle different action types
    switch (action.type) {
      case 'weather_check':
        sendMessage('Check the current weather for my location');
        break;
      case 'carbon_calculator':
        sendMessage('Help me calculate my carbon footprint');
        break;
      case 'climate_analysis':
        sendMessage('Show me climate analysis for my area');
        break;
      case 'urban_analysis':
        sendMessage('Analyze urban sustainability metrics');
        break;
      default:
        sendMessage(`Help me with ${action.label.toLowerCase()}`);
    }
  };

  const getActionIcon = (iconName) => {
    const icons = {
      'cloud-rain': CloudRain,
      'leaf': Leaf,
      'trending-up': TrendingUp,
      'building': Building,
      'bar-chart': BarChart,
      'alert-triangle': AlertTriangle,
      'calendar': Calendar,
      'lightbulb': Lightbulb,
    };
    return icons[iconName] || MessageCircle;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={compact ? "h-full w-full" : "min-h-screen bg-gray-50 dark:bg-gray-900 p-6"}>
      <div className={compact ? "h-full w-full" : "max-w-4xl mx-auto"}>
        <Card className={compact ? "h-full w-full flex flex-col" : "h-[calc(100vh-8rem)]"}>
          <CardHeader className={compact ? "border-b p-2" : "border-b"}>
            <CardTitle className="flex items-center space-x-2 text-base">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span>Climate AI Assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={compact ? "p-0 flex flex-col h-full" : "p-0 flex flex-col h-full"}>
            {/* Messages Area */}
            <ScrollArea className={compact ? "flex-1 px-2 py-2" : "flex-1 p-4"} style={compact ? { maxHeight: '320px', minHeight: '200px' } : {}}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${
                      message.type === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`inline-block p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {typeof message.content === 'string' ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          // Defensive check for chart rendering
                          message.content && message.content.props && message.content.props.children && message.content.props.children[0] && message.content.props.children[0].props && message.content.props.children[0].props.data && message.content.props.children[0].props.data.labels ?
                            message.content
                          : <div className="text-red-500 text-xs">Chart data is not available or invalid.</div>
                        )}
                      </div>
                      <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
                        message.type === 'user' ? 'justify-end' : ''
                      }`}>
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {message.confidence !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(message.confidence * 100)}% confidence
                          </Badge>
                        )}
                        {message.source && (
                          <Badge variant="outline" className="text-xs">
                            {message.source}
                          </Badge>
                        )}
                      </div>
                      {/* Action Buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action, index) => {
                            const IconComponent = getActionIcon(action.icon);
                            return (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleActionClick(action)}
                                className="text-xs"
                              >
                                <IconComponent className="h-3 w-3 mr-1" />
                                {action.label}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-500">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {isChartLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-500">Generating chart...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {chartError && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-200 dark:bg-red-700 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
                          <span className="text-sm text-red-500">{chartError}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {/* Suggestions */}
            {suggestions.length > 0 && !compact && (
              <div className="border-t p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs"
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {/* Input Area */}
            <div className={compact ? "border-t p-2" : "border-t p-4"}>
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about weather, climate, carbon footprint, or sustainability..."
                  disabled={isLoading}
                  className="flex-1"
                  style={compact ? { fontSize: '0.95rem', padding: '0.5rem' } : {}}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendChartPrompt}
                  disabled={isChartLoading}
                >
                  {isChartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart className="h-4 w-4 mr-1" />} Generate AI Chart
                </Button>
                {chartError && <div className="text-xs text-red-500">{chartError}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatBot;

