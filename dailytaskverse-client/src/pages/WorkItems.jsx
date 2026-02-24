import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MdRefresh, MdSearch, MdClose, MdFilterList, MdExpandMore, MdExpandLess,
  MdBugReport, MdTask, MdAssignment, MdSwapHoriz,
  MdComment, MdPerson, MdSchedule, MdFolder, MdSettings
} from 'react-icons/md';
import { azureDevOpsApi } from '../services/api';
import toast from 'react-hot-toast';
import './WorkItems.css';

const WORK_ITEM_STATES = ['New', 'Active', 'Resolved', 'Closed'];
const WORK_ITEM_TYPES = ['Requirement', 'Change Request', 'Bug', 'Task'];

const typeIcons = {
  Requirement: <MdAssignment />,
  'Change Request': <MdSwapHoriz />,
  Bug: <MdBugReport />,
  Task: <MdTask />,
};

const stateColors = {
  New: 'state-new',
  Active: 'state-active',
  Resolved: 'state-resolved',
  Closed: 'state-closed',
};

const typeColors = {
  Requirement: 'type-requirement',
  'Change Request': 'type-changerequest',
  Bug: 'type-bug',
  Task: 'type-task',
};

export default function WorkItems() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workItems, setWorkItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [filter, setFilter] = useState({ projectName: '', state: '', type: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const searchTimer = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await azureDevOpsApi.getSettings();
      setSettings(data);
      if (data.isConnected && data.selectedProjectNames?.length > 0) {
        setFilter((f) => ({ ...f, projectName: data.selectedProjectNames[0] }));
      }
    } catch (err) {
      toast.error('Failed to load Azure DevOps settings');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkItems = useCallback(async (currentFilter) => {
    try {
      setLoadingItems(true);
      const params = {};
      if (currentFilter.projectName) params.projectName = currentFilter.projectName;
      if (currentFilter.state) params.state = currentFilter.state;
      if (currentFilter.type) params.type = currentFilter.type;
      if (currentFilter.search) params.search = currentFilter.search;

      const { data } = await azureDevOpsApi.getWorkItems(params);
      setWorkItems(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load work items');
      setWorkItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (settings?.isConnected && filter.projectName) {
      loadWorkItems(filter);
    }
  }, [settings, filter, loadWorkItems]);

  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilter((f) => ({ ...f, search: val }));
    }, 400);
  };

  const handleExpand = async (workItem) => {
    if (expandedId === workItem.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(workItem.id);

    if (!comments[workItem.id]) {
      try {
        setLoadingComments((prev) => ({ ...prev, [workItem.id]: true }));
        const { data } = await azureDevOpsApi.getComments(workItem.projectName, workItem.id);
        setComments((prev) => ({ ...prev, [workItem.id]: data }));
      } catch (err) {
        toast.error('Failed to load comments');
        setComments((prev) => ({ ...prev, [workItem.id]: [] }));
      } finally {
        setLoadingComments((prev) => ({ ...prev, [workItem.id]: false }));
      }
    }
  };

  const handleRefresh = () => {
    setComments({});
    setExpandedId(null);
    loadWorkItems(filter);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilter((f) => ({ ...f, state: '', type: '', search: '' }));
  };

  const activeFilterCount = [filter.state, filter.type, filter.search].filter(Boolean).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!settings?.isConnected) {
    return (
      <div className="workitems-page">
        <div className="page-header">
          <h1 className="page-title">Work Items</h1>
        </div>
        <div className="not-connected">
          <MdSettings className="not-connected-icon" />
          <h2>Azure DevOps Not Connected</h2>
          <p>Connect to Azure DevOps in the Settings page to view your work items.</p>
          <Link to="/settings" className="btn-primary">Go to Settings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="workitems-page">
      <div className="page-header">
        <h1 className="page-title">Work Items</h1>
        <div className="header-actions">
          <button className="btn-add btn-secondary" onClick={handleRefresh} disabled={loadingItems}>
            <MdRefresh className={loadingItems ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="filters">
        <MdFilterList className="filter-icon" />

        {settings.selectedProjectNames?.length > 1 && (
          <select
            className="filter-select"
            value={filter.projectName}
            onChange={(e) => setFilter((f) => ({ ...f, projectName: e.target.value }))}
          >
            {settings.selectedProjectNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}

        <select
          className="filter-select"
          value={filter.state}
          onChange={(e) => setFilter((f) => ({ ...f, state: e.target.value }))}
        >
          <option value="">All States</option>
          {WORK_ITEM_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filter.type}
          onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">All Types</option>
          {WORK_ITEM_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="filter-search">
          <MdSearch className="filter-search-icon" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search work items..."
            className="filter-search-input"
          />
        </div>

        {activeFilterCount > 0 && (
          <button className="btn-clear-filters" onClick={clearFilters} title="Clear filters">
            <MdClose />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {loadingItems && workItems.length === 0 && (
        <div className="loading">Loading work items...</div>
      )}

      {!loadingItems && workItems.length === 0 && (
        <p className="empty-message">No work items found for the selected filters.</p>
      )}

      <div className="workitems-list">
        {workItems.map((wi) => (
          <div key={`${wi.projectName}-${wi.id}`} className={`workitem-card ${expandedId === wi.id ? 'expanded' : ''}`}>
            <div className="workitem-header" onClick={() => handleExpand(wi)}>
              <span className="wi-id">#{wi.id}</span>
              <span className={`wi-type-badge ${typeColors[wi.workItemType] || ''}`}>
                {typeIcons[wi.workItemType] || null}
                {wi.workItemType}
              </span>
              <span className="wi-title">{wi.title}</span>
              <span className={`wi-state-badge ${stateColors[wi.state] || ''}`}>{wi.state}</span>
              <span className="wi-expand-icon">
                {expandedId === wi.id ? <MdExpandLess /> : <MdExpandMore />}
              </span>
            </div>

            {expandedId === wi.id && (
              <div className="workitem-details">
                <div className="wi-detail-grid">
                  {wi.assignedTo && (
                    <div className="wi-detail-item">
                      <MdPerson className="detail-icon" />
                      <span className="detail-label">Assigned To</span>
                      <span className="detail-value">{wi.assignedTo}</span>
                    </div>
                  )}
                  {wi.areaPath && (
                    <div className="wi-detail-item">
                      <MdFolder className="detail-icon" />
                      <span className="detail-label">Area Path</span>
                      <span className="detail-value">{wi.areaPath}</span>
                    </div>
                  )}
                  {wi.iterationPath && (
                    <div className="wi-detail-item">
                      <MdRefresh className="detail-icon" />
                      <span className="detail-label">Iteration</span>
                      <span className="detail-value">{wi.iterationPath}</span>
                    </div>
                  )}
                  {wi.changedDate && (
                    <div className="wi-detail-item">
                      <MdSchedule className="detail-icon" />
                      <span className="detail-label">Last Updated</span>
                      <span className="detail-value">{formatDate(wi.changedDate)}</span>
                    </div>
                  )}
                </div>

                <div className="wi-comments-section">
                  <h4>
                    <MdComment className="comment-section-icon" />
                    Discussions
                  </h4>

                  {loadingComments[wi.id] && (
                    <div className="comments-loading">Loading discussions...</div>
                  )}

                  {!loadingComments[wi.id] && comments[wi.id]?.length === 0 && (
                    <p className="comments-empty">No discussions found for this work item.</p>
                  )}

                  {!loadingComments[wi.id] && comments[wi.id]?.length > 0 && (
                    <div className="comments-list">
                      {comments[wi.id].map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-meta">
                            <span className="comment-author">
                              <MdPerson className="comment-author-icon" />
                              {comment.createdBy}
                            </span>
                            <span className="comment-date">{formatDate(comment.createdDate)}</span>
                          </div>
                          <div
                            className="comment-text"
                            dangerouslySetInnerHTML={{ __html: comment.text }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
