import React, { useState, useEffect, useRef } from 'react';
import RealTerminal from '../components/RealTerminal';
import MonacoEditor from '../components/MonacoEditor';
import './styles/CLIPage.css';

const CLIPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [activeTab, setActiveTab] = useState('terminal');
  const [editorContent, setEditorContent] = useState(`// TermIntel AI Rig - TypeScript Configuration
// Security Scripts and AI Orchestration

interface AIEndpoint {
  name: string;
  host: string;
  port: number;
  model: string;
  provider: 'ollama' | 'lmstudio' | 'claude';
}

interface TerminalConfig {
  shell: 'bash' | 'zsh' | 'powershell';
  theme: 'navy' | 'dark';
  fontSize: number;
}

// Quick-lock Ollama to only accept requests from your domain
const configureOllama = (): void => {
  const origins = "https://terminal-ai-host.base44.app";
  console.log(\`Setting OLLAMA_ORIGINS=\${origins}\`);
  // ollama serve
};

// Setup SSH tunnel to Kali box
const setupSSHTunnel = (user: string, host: string): void => {
  console.log(\`ssh -N -R 11434:localhost:11434 \${user}@\${host}\`);
};

// Main initialization
const initializeTermIntel = async (): Promise<void> => {
  console.log('Initializing TermIntel v2...');
  configureOllama();
  setupSSHTunnel('user', 'kali-box');
};

export { configureOllama, setupSSHTunnel, initializeTermIntel };
export type { AIEndpoint, TerminalConfig };
`);
  const [editorLanguage, setEditorLanguage] = useState('typescript');
  const terminalRef = useRef(null);
  const wsRef = useRef(null);

  const handleWebSocketReady = (ws) => {
    wsRef.current = ws;
    setIsConnected(true);
    setConnectionStatus('Connected');
    
    ws.addEventListener('close', () => {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });
  };

  useEffect(() => {
    if (terminalRef.current && activeTab === 'terminal') {
      terminalRef.current.focus();
    }
  }, [activeTab]);

  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="cli-page">
      <header className="cli-header">
        <div className="header-left">
          <span className="terminal-icon">⌘</span>
          <h1>CLI_TERMINAL</h1>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● ONLINE' : '○ OFFLINE'}
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className={`tab-button ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => handleTabChange('terminal')}
          >
            Terminal
          </button>
          <button 
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => handleTabChange('editor')}
          >
            Editor
          </button>
          <button 
            className={`tab-button ${activeTab === 'scripts' ? 'active' : ''}`}
            onClick={() => handleTabChange('scripts')}
          >
            Scripts
          </button>
        </div>
      </header>
      
      <main className="cli-main">
        {activeTab === 'terminal' && (
          <div className="terminal-container">
            <RealTerminal onWebSocketReady={handleWebSocketReady} />
          </div>
        )}
        
        {activeTab === 'editor' && (
          <div className="editor-container">
            <div className="editor-toolbar">
              <select 
                value={editorLanguage}
                onChange={(e) => setEditorLanguage(e.target.value)}
                className="language-select"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="bash">Bash/Shell</option>
                <option value="json">JSON</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
              </select>
              <button className="toolbar-button">Save</button>
              <button className="toolbar-button">Run</button>
            </div>
            <MonacoEditor
              language={editorLanguage}
              value={editorContent}
              onChange={handleEditorChange}
              height="calc(100% - 50px)"
            />
          </div>
        )}
        
        {activeTab === 'scripts' && (
          <div className="scripts-container">
            <div className="scripts-grid">
              <div className="script-card">
                <h3>🔒 Security Scripts</h3>
                <div className="script-item" onClick={() => {
                  setEditorContent('export OLLAMA_ORIGINS="https://terminal-ai-host.base44.app"\nollama serve');
                  setEditorLanguage('bash');
                  setActiveTab('editor');
                }}>
                  <span className="script-name">Ollama Security Lock</span>
                  <span className="script-desc">Lock Ollama to PWA domain only</span>
                </div>
                <div className="script-item" onClick={() => {
                  setEditorContent('ssh -N -R 11434:localhost:11434 user@kali-box');
                  setEditorLanguage('bash');
                  setActiveTab('editor');
                }}>
                  <span className="script-name">SSH Tunnel to Kali</span>
                  <span className="script-desc">Secure bridge to remote server</span>
                </div>
              </div>
              
              <div className="script-card">
                <h3>🧠 AI Agent Scripts</h3>
                <div className="script-item" onClick={() => {
                  setEditorContent('ollama run tinydolphin');
                  setEditorLanguage('bash');
                  setActiveTab('editor');
                }}>
                  <span className="script-name">Run TinyDolphin</span>
                  <span className="script-desc">Start lightweight AI model</span>
                </div>
                <div className="script-item" onClick={() => {
                  setEditorContent('curl http://localhost:11434/api/tags');
                  setEditorLanguage('bash');
                  setActiveTab('editor');
                }}>
                  <span className="script-name">List Ollama Models</span>
                  <span className="script-desc">Check available AI models</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="cli-footer">
        <div className="footer-info">
          <span>Backend: {window.location.host}</span>
          <span>Shell: bash</span>
          <span>Mode: {activeTab}</span>
        </div>
      </footer>
    </div>
  );
};

export default CLIPage;
