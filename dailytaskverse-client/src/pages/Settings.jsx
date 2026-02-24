import { useState, useEffect } from 'react';
import { MdSettings, MdLink, MdLinkOff, MdVpnKey, MdVisibility, MdVisibilityOff, MdCheckCircle, MdError, MdFolder } from 'react-icons/md';
import { azureDevOpsApi } from '../services/api';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import './Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ organizationUrl: '', pat: '' });
  const [showPat, setShowPat] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showDisconnect, setShowDisconnect] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await azureDevOpsApi.getSettings();
      setSettings(data);
      if (data.isConnected) {
        setForm({ organizationUrl: data.organizationUrl, pat: '' });
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!form.organizationUrl || !form.pat) {
      toast.error('Please enter both Organization URL and PAT');
      return;
    }
    try {
      setTesting(true);
      const { data } = await azureDevOpsApi.testConnection({
        organizationUrl: form.organizationUrl,
        pat: form.pat,
      });
      if (data.success) {
        toast.success('Connection successful!');
        setConnectionTested(true);
        // Fetch projects
        const projectsRes = await azureDevOpsApi.getProjects({
          organizationUrl: form.organizationUrl,
          pat: form.pat,
        });
        setProjects(projectsRes.data);
        if (settings?.isConnected && settings.selectedProjectIds?.length > 0) {
          setSelectedProjects(
            projectsRes.data
              .filter((p) => settings.selectedProjectIds.includes(p.id))
              .map((p) => ({ id: p.id, name: p.name }))
          );
        }
      } else {
        toast.error('Connection failed. Please check your URL and PAT.');
        setConnectionTested(false);
        setProjects([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Connection test failed');
      setConnectionTested(false);
      setProjects([]);
    } finally {
      setTesting(false);
    }
  };

  const handleToggleProject = (project) => {
    setSelectedProjects((prev) => {
      const exists = prev.find((p) => p.id === project.id);
      if (exists) return prev.filter((p) => p.id !== project.id);
      return [...prev, { id: project.id, name: project.name }];
    });
  };

  const handleSave = async () => {
    if (!connectionTested) {
      toast.error('Please test the connection first');
      return;
    }
    if (selectedProjects.length === 0) {
      toast.error('Please select at least one project');
      return;
    }
    try {
      setSaving(true);
      const { data } = await azureDevOpsApi.saveSettings({
        organizationUrl: form.organizationUrl,
        pat: form.pat,
        selectedProjectIds: selectedProjects.map((p) => p.id),
        selectedProjectNames: selectedProjects.map((p) => p.name),
      });
      setSettings(data);
      setConnectionTested(false);
      setProjects([]);
      setForm({ organizationUrl: data.organizationUrl, pat: '' });
      toast.success('Azure DevOps settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await azureDevOpsApi.deleteSettings();
      setSettings({ isConnected: false });
      setForm({ organizationUrl: '', pat: '' });
      setConnectionTested(false);
      setProjects([]);
      setSelectedProjects([]);
      setShowDisconnect(false);
      toast.success('Disconnected from Azure DevOps');
    } catch (err) {
      toast.error('Failed to disconnect');
      setShowDisconnect(false);
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <MdSettings className="section-icon" />
          <h2>Azure DevOps Connection</h2>
          {settings?.isConnected && (
            <span className="connection-badge connected">
              <MdCheckCircle /> Connected
            </span>
          )}
          {!settings?.isConnected && (
            <span className="connection-badge disconnected">
              <MdError /> Not Connected
            </span>
          )}
        </div>

        {settings?.isConnected && (
          <div className="connected-info">
            <div className="info-row">
              <span className="info-label">Organization</span>
              <span className="info-value">{settings.organizationUrl}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Projects</span>
              <div className="info-projects">
                {settings.selectedProjectNames?.map((name, i) => (
                  <span key={i} className="project-tag">{name}</span>
                ))}
              </div>
            </div>
            <div className="connected-actions">
              <button className="btn-secondary" onClick={() => {
                setForm({ organizationUrl: settings.organizationUrl, pat: '' });
                setSettings({ ...settings, isConnected: false });
              }}>
                <MdLink /> Update Connection
              </button>
              <button className="btn-danger" onClick={() => setShowDisconnect(true)}>
                <MdLinkOff /> Disconnect
              </button>
            </div>
          </div>
        )}

        {!settings?.isConnected && (
          <div className="connection-form">
            <div className="form-group">
              <label>
                <MdLink className="label-icon" />
                Organization URL
              </label>
              <input
                type="url"
                value={form.organizationUrl}
                onChange={(e) => {
                  setForm({ ...form, organizationUrl: e.target.value });
                  setConnectionTested(false);
                  setProjects([]);
                }}
                placeholder="https://dev.azure.com/your-organization"
              />
              <span className="form-hint">Enter your Azure DevOps organization URL</span>
            </div>

            <div className="form-group">
              <label>
                <MdVpnKey className="label-icon" />
                Personal Access Token (PAT)
              </label>
              <div className="pat-input-wrapper">
                <input
                  type={showPat ? 'text' : 'password'}
                  value={form.pat}
                  onChange={(e) => {
                    setForm({ ...form, pat: e.target.value });
                    setConnectionTested(false);
                    setProjects([]);
                  }}
                  placeholder="Enter your PAT"
                />
                <button
                  type="button"
                  className="btn-toggle-pat"
                  onClick={() => setShowPat(!showPat)}
                  title={showPat ? 'Hide PAT' : 'Show PAT'}
                >
                  {showPat ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              <span className="form-hint">Your PAT will be encrypted and stored securely</span>
            </div>

            <button
              className="btn-test"
              onClick={handleTestConnection}
              disabled={testing || !form.organizationUrl || !form.pat}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {connectionTested && projects.length > 0 && (
              <div className="projects-section">
                <h3>
                  <MdFolder className="section-icon-sm" />
                  Select Projects ({selectedProjects.length} selected)
                </h3>
                <div className="projects-list">
                  {projects.map((project) => (
                    <label key={project.id} className="project-item">
                      <input
                        type="checkbox"
                        checked={selectedProjects.some((p) => p.id === project.id)}
                        onChange={() => handleToggleProject(project)}
                      />
                      <div className="project-info">
                        <span className="project-name">{project.name}</span>
                        {project.description && (
                          <span className="project-desc">{project.description}</span>
                        )}
                      </div>
                      <span className={`project-state ${project.state?.toLowerCase()}`}>
                        {project.state}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  className="btn-primary btn-save"
                  onClick={handleSave}
                  disabled={saving || selectedProjects.length === 0}
                >
                  {saving ? 'Saving...' : 'Save & Connect'}
                </button>
              </div>
            )}

            {connectionTested && projects.length === 0 && (
              <div className="empty-projects">
                No projects found. Please check your organization URL and PAT permissions.
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDisconnect}
        onConfirm={handleDisconnect}
        onCancel={() => setShowDisconnect(false)}
        title="Disconnect Azure DevOps"
        message="Are you sure you want to disconnect from Azure DevOps? Your stored credentials will be removed."
      />
    </div>
  );
}
