import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import '../styles/RealTerminal.css';

const RealTerminal = ({ onWebSocketReady }) => {
  const terminalRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      // Initialize terminal
      terminalInstanceRef.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: `'Courier New', Courier, monospace`,
        theme: {
          background: '#000',
          foreground: '#0f0',
          cursor: '#0f0',
        },
      });

      // Initialize and apply fit addon
      fitAddonRef.current = new FitAddon();
      terminalInstanceRef.current.loadAddon(fitAddonRef.current);
      
      // Attach to DOM
      terminalInstanceRef.current.open(terminalRef.current);
      
      // Fit to container
      fitAddonRef.current.fit();
      
      // Handle resize
      const handleResize = () => fitAddonRef.current.fit();
      window.addEventListener('resize', handleResize);
      
      // Connect to WebSocket server (backend on port 8081)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8081`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        terminalInstanceRef.current.writeln('Connected to TermIntel Backend');
        terminalInstanceRef.current.writeln('Initializing shell...\r\n');
        
        // Initialize shell
        wsRef.current.send(JSON.stringify({
          type: 'init',
          shell: 'cmd.exe'
        }));
        
        if (onWebSocketReady) {
          onWebSocketReady(wsRef.current);
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'output':
              terminalInstanceRef.current.write(data.data);
              break;
            case 'ready':
              terminalInstanceRef.current.writeln('Shell ready. Type commands below.\r\n');
              break;
            case 'exit':
              terminalInstanceRef.current.writeln(`\r\n[Process exited with code ${data.code}]\r\n`);
              break;
            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        terminalInstanceRef.current.writeln('\r\n[WebSocket connection error]\r\n');
      };
      
      wsRef.current.onclose = () => {
        terminalInstanceRef.current.writeln('\r\n[Disconnected from server]\r\n');
      };
      
      // Handle data from terminal (user input)
      terminalInstanceRef.current.onData((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'input',
            data: data
          }));
        }
      });
      
      // Focus terminal
      terminalInstanceRef.current.focus();
      
      return () => {
        terminalInstanceRef.current.dispose();
        window.removeEventListener('resize', handleResize);
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [onWebSocketReady]);

  return <div ref={terminalRef} className="real-terminal" />;
};

export default RealTerminal;
