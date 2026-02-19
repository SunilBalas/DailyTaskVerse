import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from '../common/NotificationBell';
import './AppLayout.css';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <header className="top-bar">
          <div className="top-bar-right">
            <NotificationBell />
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
