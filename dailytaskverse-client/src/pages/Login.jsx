import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import './Login.css';

const RECENT_EMAILS_KEY = 'recentEmails';
const MAX_RECENT_EMAILS = 5;

function getRecentEmails() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_EMAILS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecentEmail(email) {
  const emails = getRecentEmails().filter(e => e !== email);
  emails.unshift(email);
  localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(emails.slice(0, MAX_RECENT_EMAILS)));
}

function removeRecentEmail(email) {
  const emails = getRecentEmails().filter(e => e !== email);
  localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(emails));
  return emails;
}

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const [recentEmails, setRecentEmails] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    setRecentEmails(getRecentEmails());
  }, []);

  const filteredEmails = recentEmails.filter(email =>
    email.toLowerCase().includes(form.email.toLowerCase())
  );

  const handleEmailFocus = () => {
    if (filteredEmails.length > 0) setShowSuggestions(true);
  };

  const handleEmailBlur = (e) => {
    if (suggestionsRef.current?.contains(e.relatedTarget)) return;
    setShowSuggestions(false);
  };

  const handleSelectEmail = (email) => {
    setForm({ ...form, email });
    setShowSuggestions(false);
  };

  const handleRemoveEmail = (e, email) => {
    e.stopPropagation();
    const updated = removeRecentEmail(email);
    setRecentEmails(updated);
    if (updated.length === 0) setShowSuggestions(false);
    emailInputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (isRegister) {
        result = await register(form.name, form.email, form.password);
        toast.success('Account created successfully!');
      } else {
        result = await login(form.email, form.password);
        toast.success('Welcome back!');
      }
      saveRecentEmail(form.email);
      setRecentEmails(getRecentEmails());
      navigate(result.user?.role === 'Admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>DailyTaskVerse</h1>
          <p>Internal Office Productivity Tool</p>
        </div>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          <div className="form-group email-field-wrapper">
            <label>Email</label>
            <input
              ref={emailInputRef}
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={handleEmailFocus}
              onBlur={handleEmailBlur}
              placeholder="Enter your email"
              autoComplete="off"
              required
            />
            {showSuggestions && filteredEmails.length > 0 && (
              <div className="email-suggestions" ref={suggestionsRef}>
                {filteredEmails.map((email) => (
                  <button
                    key={email}
                    type="button"
                    className="email-suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectEmail(email)}
                  >
                    <span className="suggestion-email">{email}</span>
                    <span
                      className="remove-email-btn"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleRemoveEmail(e, email)}
                    >
                      <FiX size={14} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p className="toggle-auth">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>

      </div>
    </div>
  );
}
