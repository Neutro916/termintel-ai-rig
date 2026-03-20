#!/usr/bin/env node

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const os = require('os');

// Configuration
const DEFAULT_PORT = 3001;
const STATIC_FOLDERS = [
  path.join(__dirname, 'build'),
  path.join(__dirname, 'public')
];

// Find first available port starting from startPort
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try next port
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Main function
async function main() {
  console.log('🚀 TermIntel Bridge starting...');
  
  try {
    // Find available port
    const port = await findAvailablePort(DEFAULT_PORT);
    const localIP = getLocalIP();
    
    // Create Express app
    const app = express();
    
    // Serve static files
    let staticFolder = null;
    for (const folder of STATIC_FOLDERS) {
      const fs = require('fs');
      if (fs.existsSync(folder)) {
        staticFolder = folder;
        break;
      }
    }
    
    if (staticFolder) {
      console.log(`📂 Serving static files from: ${staticFolder}`);
      app.use(express.static(staticFolder));
      
      // Fallback to index.html for SPA routing
      app.get(/.*/, (req, res) => {
        res.sendFile(path.join(staticFolder, 'index.html'));
      });
    } else {
      console.warn('⚠️  No static folder found (build or public). Serving minimal response.');
      app.get(/.*/, (req, res) => {
        res.send(`
          <html>
            <head><title>TermIntel Bridge</title></head>
            <body>
              <h1>TermIntel Bridge is running</h1>
              <p>No static files found. Please build the React app first:</p>
              <pre>npm run build</pre>
            </body>
          </html>
        `);
      });
    }
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Create WebSocket server
    const wss = new WebSocket.Server({ server });
    
    // WebSocket connection handler (from backend/server.js)
    wss.on('connection', (ws) => {
      console.log('🔌 Client connected to WebSocket');
      
      let childProcess = null;
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'init') {
            // Initialize a new shell process
            const shellCommand = data.shell || (process.platform === 'win32' ? 'cmd.exe' : 'bash');
            
            // Create the child process
            childProcess = spawn(shellCommand, [], {
              windowsVerbatimArguments: process.platform === 'win32',
              windowsHide: false,
              stdio: ['pipe', 'pipe', 'pipe']
            });
            
            // Handle process output
            childProcess.stdout.on('data', (data) => {
              ws.send(JSON.stringify({
                type: 'output',
                data: data.toString('utf8')
              }));
            });
            
            childProcess.stderr.on('data', (data) => {
              ws.send(JSON.stringify({
                type: 'output',
                data: data.toString('utf8')
              }));
            });
            
            childProcess.on('close', (code) => {
              ws.send(JSON.stringify({
                type: 'exit',
                code: code
              }));
              childProcess = null;
            });
            
            // Send ready signal
            ws.send(JSON.stringify({
              type: 'ready'
            }));
          } 
          else if (data.type === 'input' && childProcess) {
            // Send input to the shell process
            childProcess.stdin.write(data.data);
          }
          else if (data.type === 'resize' && childProcess) {
            // Handle resize (not implemented for simple child_process)
            // Would need pty.js for proper resize support
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      });
      
      ws.on('close', () => {
        console.log('🔌 Client disconnected');
        if (childProcess) {
          childProcess.kill();
          childProcess = null;
        }
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (childProcess) {
          childProcess.kill();
          childProcess = null;
        }
      });
    });
    
    // Start server
    server.listen(port, () => {
      console.log('');
      console.log('✅ TermIntel Bridge Live!');
      console.log(`   Local:   http://localhost:${port}`);
      console.log(`   Network: http://${localIP}:${port}`);
      console.log('');
      console.log('🔗 Paste this into your TermIntel UI to sync:');
      console.log(`   ${localIP}:${port}`);
      console.log('');
      console.log('Press Ctrl+C to stop the bridge.');
    });
    
    // Graceful shutdown
    const shutdown = () => {
      console.log('\n🛑 Shutting down TermIntel Bridge...');
      server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
      });
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (err) {
    console.error('❌ Failed to start TermIntel Bridge:', err);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { findAvailablePort, getLocalIP };