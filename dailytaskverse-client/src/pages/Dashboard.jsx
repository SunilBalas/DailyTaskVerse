import { useState, useEffect } from 'react';
import { MdTask, MdCheckCircle, MdPending, MdTrendingUp } from 'react-icons/md';
import { dashboardApi } from '../services/api';
import { formatDateShortIST } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await dashboardApi.get();
      setData(data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Tasks', value: data?.totalTasks || 0, icon: <MdTask />, color: '#1a237e' },
    { label: 'Completed', value: data?.completedTasks || 0, icon: <MdCheckCircle />, color: '#2e7d32' },
    { label: 'Pending', value: data?.pendingTasks || 0, icon: <MdPending />, color: '#f57f17' },
    { label: 'Productivity', value: `${data?.productivityPercentage || 0}%`, icon: <MdTrendingUp />, color: '#7c4dff' },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {data?.recentActivity?.length > 0 ? (
            data.recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className={`activity-status status-${item.status.toLowerCase()}`}>{item.status}</div>
                <div className="activity-title">{item.title}</div>
                <div className="activity-time">{formatDateShortIST(item.timestamp)}</div>
              </div>
            ))
          ) : (
            <p className="empty-message">No recent activity. Start by creating a task!</p>
          )}
        </div>
      </div>
    </div>
  );
}
