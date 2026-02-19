import { NavLink } from 'react-router-dom';
import { MdDashboard, MdTask, MdEditNote, MdBarChart, MdLogout, MdAdminPanelSettings, MdRecordVoiceOver, MdSchedule, MdStickyNote2 } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import ThemePicker from '../common/ThemePicker';
import './Sidebar.css';

const employeeNavItems = [
  { path: '/', icon: <MdDashboard />, label: 'Dashboard' },
  { path: '/tasks', icon: <MdTask />, label: 'Tasks' },
  { path: '/daily-log', icon: <MdEditNote />, label: 'Daily Log' },
  { path: '/standup', icon: <MdRecordVoiceOver />, label: 'Standup' },
  { path: '/timesheet', icon: <MdSchedule />, label: 'Timesheet' },
  { path: '/notes', icon: <MdStickyNote2 />, label: 'Notes' },
  { path: '/reports', icon: <MdBarChart />, label: 'Reports' },
];

const adminNavItems = [
  { path: '/admin', icon: <MdAdminPanelSettings />, label: 'Admin Dashboard' },
  { path: '/', icon: <MdDashboard />, label: 'Dashboard' },
  { path: '/tasks', icon: <MdTask />, label: 'Tasks' },
  { path: '/daily-log', icon: <MdEditNote />, label: 'Daily Log' },
  { path: '/standup', icon: <MdRecordVoiceOver />, label: 'Standup' },
  { path: '/timesheet', icon: <MdSchedule />, label: 'Timesheet' },
  { path: '/notes', icon: <MdStickyNote2 />, label: 'Notes' },
  { path: '/reports', icon: <MdBarChart />, label: 'Reports' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>DailyTaskVerse</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <ThemePicker />
        <button className="logout-btn" onClick={logout}>
          <MdLogout /> Logout
        </button>
      </div>
    </aside>
  );
}
