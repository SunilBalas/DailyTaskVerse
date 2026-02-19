import { useState, useEffect, useRef } from 'react';
import { MdContentCopy, MdCheckCircle, MdArrowForward, MdRefresh, MdWarning, MdSettings, MdSave } from 'react-icons/md';
import { dashboardApi } from '../services/api';
import toast from 'react-hot-toast';
import './Standup.css';

export default function Standup() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dsTime, setDsTime] = useState('10:00');
  const [showPopover, setShowPopover] = useState(false);
  const [configTime, setConfigTime] = useState('10:00');
  const popoverRef = useRef(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false);
      }
    };
    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  const loadConfig = async () => {
    try {
      const { data: config } = await dashboardApi.standupConfig();
      setDsTime(config.standupTime);
      setConfigTime(config.standupTime);
    } catch {}
    await loadStandup();
  };

  const loadStandup = async () => {
    try {
      setLoading(true);
      const { data } = await dashboardApi.standup();
      setData(data);
    } catch {
      toast.error('Failed to load standup data');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      const { data: config } = await dashboardApi.updateStandupConfig({ standupTime: configTime });
      setDsTime(config.standupTime);
      setShowPopover(false);
      toast.success('DS time updated');
      await loadStandup();
    } catch {
      toast.error('Failed to update DS time');
    }
  };

  const generateText = () => {
    if (!data) return '';
    const yesterdayNonImpediment = data.yesterdayTasks.filter(t => !t.isImpediment);
    const todayNonImpediment = data.todayTasks.filter(t => !t.isImpediment);

    let text = `Daily Standup — ${dsTime}\n\n`;

    text += `Yesterday:\n`;
    if (yesterdayNonImpediment.length > 0) {
      yesterdayNonImpediment.forEach(t => {
        text += `  - ${t.title} [${t.priority}] - ${t.status === 'InProgress' ? 'In Progress' : t.status}\n`;
      });
    } else {
      text += `  - No activity logged\n`;
    }

    text += `\nToday:\n`;
    if (todayNonImpediment.length > 0) {
      todayNonImpediment.forEach(t => {
        const status = t.status === 'InProgress' ? 'In Progress' : t.status;
        text += `  - ${t.title} [${t.priority}] - ${status}\n`;
      });
    } else {
      text += `  - No tasks planned yet\n`;
    }

    text += `\nBlockers / Impediments:\n`;
    if (data.impediments.length > 0) {
      data.impediments.forEach(t => {
        text += `  - ${t.title} [${t.priority}] — "${t.impedimentKeyword}"\n`;
      });
    } else {
      text += `  - None\n`;
    }

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateText());
      setCopied(true);
      toast.success('Standup copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (loading) return <div className="loading">Loading standup...</div>;

  const yesterdayNonImpediment = data?.yesterdayTasks.filter(t => !t.isImpediment) || [];
  const todayNonImpediment = data?.todayTasks.filter(t => !t.isImpediment) || [];

  return (
    <div className="standup-page">
      <div className="page-header">
        <h1 className="page-title">Daily Standup</h1>
        <div className="standup-header-actions">
          <div className="ds-popover-wrapper" ref={popoverRef}>
            <button className="btn-icon-text" onClick={() => { setShowPopover(!showPopover); setConfigTime(dsTime); }} title="DS Time Config">
              <MdSettings /> {dsTime}
            </button>
            {showPopover && (
              <div className="ds-popover">
                <label className="ds-popover-label">DS Time (24h)</label>
                <div className="ds-popover-row">
                  <input
                    type="time"
                    className="ds-time-input"
                    value={configTime}
                    onChange={(e) => setConfigTime(e.target.value)}
                  />
                  <button className="btn-save-config" onClick={saveConfig}>
                    <MdSave /> Save
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="btn-icon-text" onClick={loadStandup} title="Refresh">
            <MdRefresh /> Refresh
          </button>
          <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? <><MdCheckCircle /> Copied!</> : <><MdContentCopy /> Copy to Clipboard</>}
          </button>
        </div>
      </div>

      <div className="standup-grid">
        {/* Yesterday Section */}
        <div className="standup-section yesterday">
          <div className="section-header">
            <MdCheckCircle className="section-icon" />
            <h2>Yesterday</h2>
          </div>
          <div className="section-body">
            {yesterdayNonImpediment.length > 0 ? (
              <ul className="standup-list">
                {yesterdayNonImpediment.map((task) => (
                  <li key={task.id} className="standup-item">
                    <div className="item-content">
                      <span className="item-title">{task.title}</span>
                    </div>
                    <div className="item-badges">
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className={`badge status-${task.status.toLowerCase()}`}>
                        {task.status === 'InProgress' ? 'In Progress' : task.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-hint">No tasks in previous window</p>
            )}
          </div>
        </div>

        {/* Today Section */}
        <div className="standup-section today">
          <div className="section-header">
            <MdArrowForward className="section-icon" />
            <h2>Today</h2>
          </div>
          <div className="section-body">
            {todayNonImpediment.length > 0 ? (
              <ul className="standup-list">
                {todayNonImpediment.map((task) => (
                  <li key={task.id} className="standup-item">
                    <div className="item-content">
                      <span className="item-title">{task.title}</span>
                    </div>
                    <div className="item-badges">
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className={`badge status-${task.status.toLowerCase()}`}>
                        {task.status === 'InProgress' ? 'In Progress' : task.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-hint">No active tasks for today</p>
            )}
          </div>
        </div>

        {/* Blockers / Impediments Section */}
        <div className="standup-section blockers">
          <div className="section-header">
            <MdWarning className="section-icon blocker-icon-svg" />
            <h2>Blockers / Impediments</h2>
            {data?.impediments.length > 0 && (
              <span className="impediment-count">{data.impediments.length}</span>
            )}
          </div>
          <div className="section-body">
            {data?.impediments.length > 0 ? (
              <ul className="standup-list">
                {data.impediments.map((task) => (
                  <li key={task.id} className="standup-item impediment">
                    <div className="item-content">
                      <span className="item-title">{task.title}</span>
                      <span className="impediment-keyword">Detected: &ldquo;{task.impedimentKeyword}&rdquo;</span>
                    </div>
                    <div className="item-badges">
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className={`badge status-${task.status.toLowerCase()}`}>
                        {task.status === 'InProgress' ? 'In Progress' : task.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-hint">No blockers or impediments detected</p>
            )}
          </div>
        </div>
      </div>

      <div className="standup-preview">
        <h3>Preview</h3>
        <pre className="preview-text">{generateText()}</pre>
      </div>
    </div>
  );
}
