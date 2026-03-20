const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the React build app
app.use(express.static(path.join(__dirname, '../build')));

// Catch-all to serve index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  let childProcess = null;
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'init') {
      // Initialize a new shell process
      const shellCommand = data.shell || 'cmd.exe';
      
      // Create the child process
      childProcess = spawn(shellCommand, [], {
        windowsVerbatimArguments: true,
        windowsHide: false
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
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
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

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
