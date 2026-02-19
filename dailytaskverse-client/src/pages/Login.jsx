import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

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
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              autoComplete="off"
              required
            />
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
