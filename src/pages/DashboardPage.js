import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/DashboardPage.css';

const DashboardPage = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'ollama',
    host: 'localhost',
    port: '11434',
    model: ''
  });
  const [testing, setTesting] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('aiEndpoints');
    if (saved) {
      setEndpoints(JSON.parse(saved));
    }
  }, []);

  const saveEndpoints = (newEndpoints) => {
    setEndpoints(newEndpoints);
    localStorage.setItem('aiEndpoints', JSON.stringify(newEndpoints));
  };

  const handleAdd = () => {
    setEditingEndpoint(null);
    setFormData({
      name: '',
      provider: 'ollama',
      host: 'localhost',
      port: '11434',
      model: ''
    });
    setShowModal(true);
  };

  const handleEdit = (endpoint) => {
    setEditingEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      provider: endpoint.provider,
      host: endpoint.host,
      port: endpoint.port,
      model: endpoint.model || ''
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.host || !formData.port) return;

    const endpointData = {
      id: editingEndpoint?.id || Date.now().toString(),
      ...formData,
      port: parseInt(formData.port) || 11434
    };

    if (editingEndpoint) {
      saveEndpoints(endpoints.map(ep => ep.id === editingEndpoint.id ? endpointData : ep));
    } else {
      saveEndpoints([...endpoints, endpointData]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this endpoint?')) {
      saveEndpoints(endpoints.filter(ep => ep.id !== id));
    }
  };

  const testConnection = async (endpoint) => {
    setTesting(endpoint.id);
    try {
      let url;
      if (endpoint.provider === 'ollama') {
        url = `http://${endpoint.host}:${endpoint.port}/api/tags`;
      } else if (endpoint.provider === 'lmstudio') {
        url = `http://${endpoint.host}:${endpoint.port}/v1/models`;
      } else {
        url = `http://${endpoint.host}:${endpoint.port}`;
      }

      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        alert(`✅ ${endpoint.name} is online!`);
      } else {
        alert(`⚠️ ${endpoint.name} responded with status ${response.status}`);
      }
    } catch (error) {
      alert(`❌ ${endpoint.name} connection failed: ${error.message}`);
    }
    setTesting(null);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>TermIntel Dashboard</h1>
        <div className="header-actions">
          <Link to="/CLI" className="nav-button">
            <span className="icon">⌘</span> CLI Terminal
          </Link>
        </div>
      </header>
      
      <div className="endpoints-section">
        <div className="section-header">
          <h2>AI Endpoints</h2>
          <button className="add-btn" onClick={handleAdd}>+ Add</button>
        </div>
        
        {endpoints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <h3>NO_ENDPOINTS_CONFIGURED</h3>
            <p>Add your first Ollama, LM Studio, or Claude API endpoint</p>
            <button className="add-first-btn" onClick={handleAdd}>Add Endpoint</button>
          </div>
        ) : (
          <div className="endpoints-grid">
            {endpoints.map(endpoint => (
              <div key={endpoint.id} className="endpoint-card">
                <div className="endpoint-header">
                  <span className={`provider-badge ${endpoint.provider}`}>
                    {endpoint.provider}
                  </span>
                  <div className="endpoint-actions">
                    <button onClick={() => testConnection(endpoint)} disabled={testing === endpoint.id}>
                      {testing === endpoint.id ? '...' : 'Ping'}
                    </button>
                    <button onClick={() => handleEdit(endpoint)}>Edit</button>
                    <button onClick={() => handleDelete(endpoint.id)} className="delete-btn">×</button>
                  </div>
                </div>
                <h3>{endpoint.name}</h3>
                <p className="endpoint-url">{endpoint.host}:{endpoint.port}</p>
                {endpoint.model && <p className="endpoint-model">Model: {endpoint.model}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/CLI" className="action-card">
            <h3>CLI Terminal</h3>
            <p>Run commands, Ollama, SSH tunnels</p>
          </Link>
          <Link to="/Terminal" className="action-card">
            <h3>AI Chat</h3>
            <p>Chat with your AI models</p>
          </Link>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingEndpoint ? 'Edit Endpoint' : 'Add Endpoint'}</h2>
            
            <div className="form-group">
              <label>Name</label>
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="My Ollama"
              />
            </div>

            <div className="form-group">
              <label>Provider</label>
              <select 
                value={formData.provider}
                onChange={e => setFormData({...formData, provider: e.target.value, port: e.target.value === 'ollama' ? '11434' : e.target.value === 'lmstudio' ? '1234' : '443'})}
              >
                <option value="ollama">Ollama</option>
                <option value="lmstudio">LM Studio</option>
                <option value="claude">Claude API</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Host</label>
                <input 
                  value={formData.host}
                  onChange={e => setFormData({...formData, host: e.target.value})}
                  placeholder="localhost"
                />
              </div>
              <div className="form-group">
                <label>Port</label>
                <input 
                  value={formData.port}
                  onChange={e => setFormData({...formData, port: e.target.value})}
                  placeholder="11434"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Model (optional)</label>
              <input 
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
                placeholder="llama2, mistral, etc."
              />
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
