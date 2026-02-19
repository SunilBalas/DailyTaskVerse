import { useState, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight, MdAccessTime, MdCheckCircle, MdFileDownload } from 'react-icons/md';
import { dashboardApi, exportApi } from '../services/api';
import { todayIST } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import './Timesheet.css';

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Timesheet() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimesheet();
  }, [weekStart]);

  const loadTimesheet = async () => {
    try {
      setLoading(true);
      const dateStr = weekStart.toISOString().split('T')[0];
      const { data } = await dashboardApi.timesheet(dateStr);
      setData(data);
    } catch (err) {
      toast.error('Failed to load timesheet');
    } finally {
      setLoading(false);
    }
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToCurrentWeek = () => {
    setWeekStart(getWeekStart(new Date()));
  };

  const isCurrentWeek = () => {
    const current = getWeekStart(new Date());
    return weekStart.getTime() === current.getTime();
  };

  const formatDateShort = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' });
  };

  const getBarWidth = (hours) => {
    if (!hours) return 0;
    return Math.min((hours / 10) * 100, 100);
  };

  const getBarColor = (hours) => {
    if (!hours) return 'var(--surface-border)';
    if (hours >= 8) return 'var(--status-success)';
    if (hours >= 6) return 'var(--cosmic-primary)';
    if (hours >= 4) return 'var(--status-warning)';
    return 'var(--status-error)';
  };

  const handleExport = async () => {
    try {
      const dateStr = weekStart.toISOString().split('T')[0];
      const response = await exportApi.timesheet(dateStr);
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a'); a.href = url; a.download = `timesheet_${dateStr}.xlsx`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Timesheet exported');
    } catch { toast.error('Failed to export timesheet'); }
  };

  if (loading) return <div className="loading">Loading timesheet...</div>;

  const weekLabel = data
    ? `${formatDateShort(data.weekStart)} - ${formatDateShort(data.weekEnd)}`
    : '';

  return (
    <div className="timesheet-page">
      <div className="page-header">
        <h1 className="page-title">Weekly Timesheet</h1>
        <button className="btn-add btn-secondary" onClick={handleExport}>
          <MdFileDownload /> Export
        </button>
      </div>

      <div className="timesheet-nav">
        <button className="btn-icon-text" onClick={prevWeek}><MdChevronLeft /> Previous</button>
        <div className="week-label">
          <span className="week-dates">{weekLabel}</span>
          {!isCurrentWeek() && (
            <button className="btn-today" onClick={goToCurrentWeek}>Today</button>
          )}
        </div>
        <button className="btn-icon-text" onClick={nextWeek}>Next <MdChevronRight /></button>
      </div>

      <div className="timesheet-summary">
        <div className="summary-card">
          <MdAccessTime className="summary-icon" />
          <div>
            <span className="summary-value">{data?.totalHours || 0}h</span>
            <span className="summary-label">Total Hours</span>
          </div>
        </div>
        <div className="summary-card">
          <MdCheckCircle className="summary-icon completed-icon" />
          <div>
            <span className="summary-value">
              {data?.days?.reduce((sum, d) => sum + d.tasksCompleted, 0) || 0}
            </span>
            <span className="summary-label">Tasks Completed</span>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon avg-icon">~</span>
          <div>
            <span className="summary-value">
              {data?.days ? (data.totalHours / 5).toFixed(1) : 0}h
            </span>
            <span className="summary-label">Avg / Workday</span>
          </div>
        </div>
      </div>

      <div className="timesheet-grid">
        {data?.days?.map((day) => {
          const isWeekend = ['Sat', 'Sun'].includes(day.dayName);
          const isToday = new Date(day.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) === todayIST();
          return (
            <div key={day.date} className={`timesheet-row ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}>
              <div className="row-date">
                <span className="row-day">{day.dayName}</span>
                <span className="row-date-num">{formatDateShort(day.date)}</span>
              </div>
              <div className="row-bar-container">
                <div
                  className="row-bar"
                  style={{
                    width: `${getBarWidth(day.hoursSpent)}%`,
                    background: getBarColor(day.hoursSpent)
                  }}
                />
                <span className="row-hours">
                  {day.hoursSpent != null ? `${day.hoursSpent}h` : '-'}
                </span>
              </div>
              <div className="row-tasks">
                {day.tasksCompleted > 0 && (
                  <span className="tasks-badge">
                    <MdCheckCircle /> {day.tasksCompleted}
                  </span>
                )}
              </div>
              <div className="row-log">
                {day.logContent ? (
                  <span className="log-snippet">{day.logContent.replace(/<[^>]*>/g, '').substring(0, 60)}{day.logContent.length > 60 ? '...' : ''}</span>
                ) : (
                  <span className="no-log">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
