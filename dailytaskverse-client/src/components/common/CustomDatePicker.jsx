import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MdChevronLeft, MdChevronRight, MdCalendarToday } from 'react-icons/md';
import './CustomDatePicker.css';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CustomDatePicker({ value, onChange, placeholder = 'Select date', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Parse selected date from YYYY-MM-DD
  const selected = value ? (() => {
    const [y, m, d] = value.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  })() : null;

  // Sync view to selected date when opening
  useEffect(() => {
    if (isOpen) {
      if (selected) {
        setViewYear(selected.year);
        setViewMonth(selected.month);
      } else {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
      }
    }
  }, [isOpen]);

  const formatDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCalendarDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const pm = viewMonth === 0 ? 11 : viewMonth - 1;
      const py = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({ day: daysInPrevMonth - i, month: pm, year: py, isOther: true });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month: viewMonth, year: viewYear, isOther: false });
    }

    // Next month leading days
    const remaining = 42 - days.length;
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, month: nm, year: ny, isOther: true });
    }

    return days;
  };

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const isToday = (d) => d.day === todayDay && d.month === todayMonth && d.year === todayYear;
  const isSelected = (d) => selected && d.day === selected.day && d.month === selected.month && d.year === selected.year;

  const selectDay = (d) => {
    const mm = String(d.month + 1).padStart(2, '0');
    const dd = String(d.day).padStart(2, '0');
    onChange(`${d.year}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const goToday = () => {
    const mm = String(todayMonth + 1).padStart(2, '0');
    const dd = String(todayDay).padStart(2, '0');
    onChange(`${todayYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const clearDate = () => {
    onChange('');
    setIsOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Position calculation (portal)
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 360;
    const dropdownWidth = 300;
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

  const calendarDays = getCalendarDays();

  const dropdown = isOpen && createPortal(
    <div className="cdp-dropdown" ref={dropdownRef} style={dropdownStyle}>
      <div className="cdp-header">
        <button type="button" className="cdp-nav-btn" onClick={prevMonth}>
          <MdChevronLeft />
        </button>
        <span className="cdp-month-year">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" className="cdp-nav-btn" onClick={nextMonth}>
          <MdChevronRight />
        </button>
      </div>
      <div className="cdp-days-header">
        {DAYS.map(d => <span key={d} className="cdp-day-label">{d}</span>)}
      </div>
      <div className="cdp-days-grid">
        {calendarDays.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`cdp-day ${d.isOther ? 'other' : ''} ${isToday(d) ? 'today' : ''} ${isSelected(d) ? 'selected' : ''}`}
            onClick={() => selectDay(d)}
          >
            {d.day}
          </button>
        ))}
      </div>
      <div className="cdp-footer">
        <button type="button" className="cdp-footer-btn" onClick={goToday}>Today</button>
        <button type="button" className="cdp-footer-btn cdp-clear" onClick={clearDate}>Clear</button>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="custom-date-picker" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`cdp-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      >
        <span className="cdp-display">{value ? formatDisplay(value) : placeholder}</span>
        <MdCalendarToday className="cdp-icon" />
      </button>
      {dropdown}
    </div>
  );
}
