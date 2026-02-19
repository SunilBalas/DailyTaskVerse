import { useState, useEffect } from 'react';
import { MdPeople, MdToday, MdDateRange, MdTrendingUp, MdTask, MdCheckCircle } from 'react-icons/md';
import { adminApi } from '../services/api';
import { formatDateShortIST, formatDateTimeIST } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, usersRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers(),
      ]);
      setDashboard(dashRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  const cards = [
    { label: 'Total Users', value: dashboard?.totalUsers || 0, icon: <MdPeople />, color: '#1a237e' },
    { label: 'Active Today', value: dashboard?.activeToday || 0, icon: <MdToday />, color: '#2e7d32' },
    { label: 'Active This Week', value: dashboard?.activeThisWeek || 0, icon: <MdDateRange />, color: '#f57f17' },
    { label: 'Total Tasks', value: dashboard?.totalTasks || 0, icon: <MdTask />, color: '#1565c0' },
    { label: 'Completed Tasks', value: dashboard?.completedTasks || 0, icon: <MdCheckCircle />, color: '#7c4dff' },
    { label: 'Productivity', value: `${dashboard?.overallProductivity || 0}%`, icon: <MdTrendingUp />, color: '#c62828' },
  ];

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="admin-stats-grid">
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

      <div className="users-section">
        <h2>All Users</h2>
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="user-name-cell">
                    <div className="table-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>{formatDateShortIST(user.createdAt)}</td>
                  <td>{user.lastLoginAt ? formatDateTimeIST(user.lastLoginAt) : 'Never'}</td>
                  <td>{user.taskCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
