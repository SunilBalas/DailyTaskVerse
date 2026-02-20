import { useState, useEffect, useRef } from 'react';
import { MdLogout } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import ThemePicker from './ThemePicker';
import './ProfileMenu.css';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-menu" ref={ref}>
      <button className="profile-trigger" onClick={() => setOpen(!open)}>
        <span className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <div className="profile-avatar-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <span className="profile-name">{user?.name}</span>
              <span className="profile-role">{user?.role}</span>
            </div>
          </div>
          <div className="profile-section">
            <ThemePicker />
          </div>
          <div className="profile-section">
            <button className="profile-logout-btn" onClick={logout}>
              <MdLogout /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
