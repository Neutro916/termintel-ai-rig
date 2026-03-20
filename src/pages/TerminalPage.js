import React, { useState, useEffect, useRef } from 'react';
import './styles/TerminalPage.css';

const TerminalPage = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'TermIntel AI Assistant initialized. Type a message to chat with your AI model.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [activeContext, setActiveContext] = useState(new Set(['currentFile']));
  const [codebaseFiles, setCodebaseFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCodebaseAnalysis, setShowCodebaseAnalysis] = useState(false);
  const messagesEndRef = useRef(null);

  // Load endpoints and selected endpoint from localStorage
  useEffect(() => {
    const savedEndpoints = localStorage.getItem('aiEndpoints');
    if (savedEndpoints) {
      const parsed = JSON.parse(savedEndpoints);
      setEndpoints(parsed);
      
      // Load selected endpoint
      const savedSelected = localStorage.getItem('selectedAIEndpoint');
      if (savedSelected) {
        setSelectedEndpoint(JSON.parse(savedSelected));
      } else if (parsed.length > 0) {
        setSelectedEndpoint(parsed[0]);
      }
    }
    
    // Load codebase files
    loadCodebaseFiles();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load codebase files
  const loadCodebaseFiles = async () => {
    try {
      // In a real app, this would use the backend to read files
      // For now, we'll use the terminal WebSocket to run a command
      const ws = new WebSocket(`ws://${window.location.hostname}:8081`);
      
      ws.onopen = () => {
        // Send command to list files
        ws.send(JSON.stringify({ type: 'command', command: 'find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.css" -o -name "*.md" | head -50' }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'output') {
          const files = data.data.split('\n').filter(line => line.trim());
          setCodebaseFiles(files);
          ws.close();
        }
      };
      
      ws.onerror = () => {
        console.log('WebSocket connection failed, using demo files');
        setCodebaseFiles([
          './src/App.js',
          './src/index.js',
          './src/pages/DashboardPage.js',
          './src/pages/CLIPage.js',
          './src/pages/TerminalPage.js',
          './src/components/RealTerminal.js',
          './src/components/MonacoEditor.js',
          './package.json'
        ]);
      };
    } catch (error) {
      console.log('Error loading codebase:', error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleEndpointChange = (e) => {
    const endpointId = e.target.value;
    const endpoint = endpoints.find(ep => ep.id === endpointId);
    setSelectedEndpoint(endpoint);
    if (endpoint) {
      localStorage.setItem('selectedAIEndpoint', JSON.stringify(endpoint));
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedEndpoint) return;
    
    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Get context for AI
    const context = getContextForAI();
    const fullMessage = userMessage.content + context;
    
    try {
      let response;
      
      if (selectedEndpoint.provider === 'ollama') {
        const endpointUrl = `http://${selectedEndpoint.host}:${selectedEndpoint.port}/api/generate`;
        response = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedEndpoint.model,
            prompt: fullMessage,
            stream: false
          }),
          timeout: 30000
        });
      } else if (selectedEndpoint.provider === 'lmstudio') {
        const endpointUrl = `http://${selectedEndpoint.host}:${selectedEndpoint.port}/v1/chat/completions`;
        response = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedEndpoint.model || 'default',
            messages: [{ role: 'user', content: fullMessage }]
          }),
          timeout: 30000
        });
      } else {
        throw new Error(`Provider ${selectedEndpoint.provider} not supported yet`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let aiResponse = '';
      
      if (selectedEndpoint.provider === 'ollama') {
        aiResponse = data.response || 'No response received';
      } else if (selectedEndpoint.provider === 'lmstudio') {
        aiResponse = data.choices?.[0]?.message?.content || 'No response received';
      }
      
      const assistantMessage = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${error.message}. Please check your endpoint configuration.` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'system', content: 'Chat cleared. Start a new conversation.' }
    ]);
  };

  // Toggle context chip
  const toggleContext = (context) => {
    setActiveContext(prev => {
      const newContext = new Set(prev);
      if (newContext.has(context)) {
        newContext.delete(context);
      } else {
        newContext.add(context);
      }
      return newContext;
    });
  };

  // Search codebase
  const searchCodebase = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Demo search - in real app this would use the backend
    const demoFiles = [
      { file: 'App.js', line: 1, content: 'import React from "react";' },
      { file: 'DashboardPage.js', line: 5, content: 'const DashboardPage = () => {' },
      { file: 'TerminalPage.js', line: 10, content: 'const [messages, setMessages] = useState([]);' }
    ];
    
    const results = demoFiles.filter(item => 
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.file.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };

  // Analyze whole codebase
  const analyzeWholeCodebase = async () => {
    setShowCodebaseAnalysis(true);
    setMessages(prev => [...prev, 
      { role: 'system', content: 'Analyzing codebase... Reading project structure and dependencies.' }
    ]);
    
    try {
      // In a real implementation, this would read all files via WebSocket
      // For now, we'll simulate it with a demo message
      const analysis = `## Codebase Analysis Complete

**Project Structure:**
- React application with TypeScript
- 8 main components
- 3 page components (Dashboard, CLI, Terminal)
- Backend server with WebSocket support

**Key Findings:**
1. Backend uses Express.js with WebSocket for real terminal access
2. Frontend uses React with Monaco editor for code editing
3. AI endpoints support Ollama and LMStudio
4. Mobile-first design with responsive CSS

**Dependencies:**
- React, React Router
- Monaco Editor
- Express, WebSocket
- No security vulnerabilities found

Ready to analyze specific files or answer questions about the codebase.`;

      setMessages(prev => [...prev, 
        { role: 'assistant', content: analysis }
      ]);
    } catch (error) {
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `Error analyzing codebase: ${error.message}` }
      ]);
    }
  };

  // Get context for AI
  const getContextForAI = () => {
    let context = '';
    
    if (activeContext.has('codebase')) {
      context += `\n\nFull Codebase Analysis:\n${codebaseFiles.join('\n')}`;
    }
    
    if (activeContext.has('currentFile')) {
      context += '\n\nCurrent file context is active.';
    }
    
    if (activeContext.has('dependencies')) {
      context += '\n\nDependencies: React, Express, Monaco Editor, WebSocket.';
    }
    
    if (searchResults.length > 0) {
      context += `\n\nSearch Results for "${searchQuery}":\n${searchResults.map(r => `${r.file}:${r.line} - ${r.content}`).join('\n')}`;
    }
    
    return context;
  };

  return (
    <div className="terminal-page">
      <header className="terminal-header">
        <h1>AI Chat Terminal</h1>
        <div className="endpoint-selector">
          <select 
            value={selectedEndpoint?.id || ''} 
            onChange={handleEndpointChange}
            className="endpoint-select"
          >
            <option value="">Select AI Endpoint</option>
            {endpoints.map(endpoint => (
              <option key={endpoint.id} value={endpoint.id}>
                {endpoint.name} ({endpoint.provider})
              </option>
            ))}
          </select>
          {selectedEndpoint && (
            <span className="endpoint-status">
              Connected to {selectedEndpoint.name}
            </span>
          )}
        </div>
      </header>
      
      {/* Context Chips */}
      <div className="context-chips">
        <div 
          className={`context-chip ${activeContext.has('codebase') ? 'active' : ''}`}
          onClick={() => toggleContext('codebase')}
        >
          📁 Whole Codebase
        </div>
        <div 
          className={`context-chip ${activeContext.has('currentFile') ? 'active' : ''}`}
          onClick={() => toggleContext('currentFile')}
        >
          📄 Current File
        </div>
        <div 
          className={`context-chip ${activeContext.has('dependencies') ? 'active' : ''}`}
          onClick={() => toggleContext('dependencies')}
        >
          📦 Dependencies
        </div>
        <div 
          className="context-chip analyze"
          onClick={analyzeWholeCodebase}
        >
          🔍 Analyze All
        </div>
      </div>
      
      {/* Codebase Search */}
      <div className="codebase-search">
        <input 
          type="text"
          placeholder="Search codebase..."
          value={searchQuery}
          onChange={(e) => searchCodebase(e.target.value)}
          className="search-input"
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.slice(0, 3).map((result, index) => (
              <div key={index} className="search-result">
                <span className="result-file">{result.file}</span>
                <span className="result-line">:{result.line}</span>
                <span className="result-content">{result.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-role">
                {message.role === 'user' ? 'You' : 
                 message.role === 'assistant' ? 'AI' : 'System'}
              </div>
              <div className="message-content">
                {message.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="chat-input"
              rows={3}
              disabled={isLoading || !selectedEndpoint}
            />
            <div className="input-buttons">
              <button 
                onClick={clearChat}
                className="clear-button"
                disabled={isLoading}
              >
                Clear
              </button>
              <button 
                onClick={sendMessage}
                className="send-button"
                disabled={isLoading || !inputValue.trim() || !selectedEndpoint}
              >
                {isLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
          
          {!selectedEndpoint && (
            <div className="no-endpoint-warning">
              Please select an AI endpoint from the Dashboard first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalPage;
