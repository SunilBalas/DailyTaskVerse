import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MdAccessTime } from 'react-icons/md';
import './CustomTimePicker.css';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const PERIODS = ['AM', 'PM'];

function parse24(val) {
  if (!val) return { hour: 12, minute: 0, period: 'AM' };
  const [hh, mm] = val.split(':').map(Number);
  const period = hh < 12 ? 'AM' : 'PM';
  const hour = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  // Snap minute to nearest 5
  const minute = Math.round(mm / 5) * 5 >= 60 ? 55 : Math.round(mm / 5) * 5;
  return { hour, minute, period };
}

function to24(hour, minute, period) {
  let h24;
  if (period === 'AM') {
    h24 = hour === 12 ? 0 : hour;
  } else {
    h24 = hour === 12 ? 12 : hour + 12;
  }
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatDisplay(val) {
  if (!val) return '';
  const { hour, minute, period } = parse24(val);
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

export default function CustomTimePicker({ value, onChange, placeholder = 'Select time', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState('AM');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  // Sync internal state from value
  useEffect(() => {
    if (value) {
      const parsed = parse24(value);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
    }
  }, [value]);

  // Auto-scroll selected items into view
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      [hourListRef, minuteListRef].forEach(ref => {
        if (ref.current) {
          const sel = ref.current.querySelector('.selected');
          if (sel) sel.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const applyTime = (h, m, p) => {
    onChange(to24(h, m, p));
  };

  const handleHour = (h) => {
    setHour(h);
    applyTime(h, minute, period);
  };

  const handleMinute = (m) => {
    setMinute(m);
    applyTime(hour, m, period);
  };

  const handlePeriod = (p) => {
    setPeriod(p);
    applyTime(hour, minute, p);
  };

  // Position calculation (portal)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 280;
    const dropdownWidth = 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - 8;
    }
    if (left < 8) left = 8;

    setDropdownStyle({
      position: 'fixed',
      left,
      width: dropdownWidth,
      zIndex: 9999,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const dropdown = isOpen && createPortal(
    <div className="ctp-dropdown" ref={dropdownRef} style={dropdownStyle}>
      <div className="ctp-display-row">
        <span className="ctp-current">{hour}:{String(minute).padStart(2, '0')} {period}</span>
      </div>
      <div className="ctp-columns">
        <div className="ctp-column" ref={hourListRef}>
          {HOURS.map(h => (
            <button
              key={h}
              type="button"
              className={`ctp-cell ${h === hour ? 'selected' : ''}`}
              onClick={() => handleHour(h)}
            >
              {String(h).padStart(2, '0')}
            </button>
          ))}
        </div>
        <div className="ctp-divider" />
        <div className="ctp-column" ref={minuteListRef}>
          {MINUTES.map(m => (
            <button
              key={m}
              type="button"
              className={`ctp-cell ${m === minute ? 'selected' : ''}`}
              onClick={() => handleMinute(m)}
            >
              {String(m).padStart(2, '0')}
            </button>
          ))}
        </div>
        <div className="ctp-divider" />
        <div className="ctp-column ctp-period-col">
          {PERIODS.map(p => (
            <button
              key={p}
              type="button"
              className={`ctp-cell ctp-period ${p === period ? 'selected' : ''}`}
              onClick={() => handlePeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="custom-time-picker" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`ctp-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      >
        <span className="ctp-display-text">{value ? formatDisplay(value) : placeholder}</span>
        <MdAccessTime className="ctp-icon" />
      </button>
      {dropdown}
    </div>
  );
}
