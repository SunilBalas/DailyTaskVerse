import { useTheme } from '../../context/ThemeContext';
import './ThemePicker.css';

export default function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="theme-picker">
      <span className="theme-picker-label">Theme</span>
      <div className="theme-picker-options">
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-dot ${theme === t.id ? 'active' : ''}`}
            style={{ '--dot-color': t.color }}
            onClick={() => setTheme(t.id)}
            title={t.name}
            aria-label={`Switch to ${t.name} theme`}
          />
        ))}
      </div>
    </div>
  );
}
