import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdAccessTime, MdFileDownload } from 'react-icons/md';
import { dailyLogApi, exportApi } from '../services/api';
import { todayIST, nowTimeIST, plusOneHourIST } from '../utils/dateUtils';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import './DailyLog.css';

export default function DailyLog() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [form, setForm] = useState({ logDate: todayIST(), fromTime: nowTimeIST(), toTime: plusOneHourIST(), content: '' });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data } = await dailyLogApi.getAll({ page, pageSize });
      setLogs(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      toast.error('Failed to load daily logs');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingLog(null);
    setForm({ logDate: todayIST(), fromTime: nowTimeIST(), toTime: plusOneHourIST(), content: '' });
    setModalOpen(true);
  };

  const openEdit = (log) => {
    setEditingLog(log);
    setForm({
      logDate: log.logDate.split('T')[0],
      fromTime: log.fromTime || '',
      toTime: log.toTime || '',
      content: log.content
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fromTime = form.fromTime || null;
      const toTime = form.toTime || null;
      if (editingLog) {
        await dailyLogApi.update(editingLog.id, { fromTime, toTime, content: form.content });
        toast.success('Log updated');
      } else {
        await dailyLogApi.create({ logDate: form.logDate, fromTime, toTime, content: form.content });
        toast.success('Log created');
      }
      setModalOpen(false);
      loadLogs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save log');
    }
  };

  const handleDelete = async () => {
    try {
      await dailyLogApi.delete(deleteId);
      toast.success('Log deleted');
      setDeleteId(null);
      loadLogs();
    } catch (err) {
      toast.error('Failed to delete log');
      setDeleteId(null);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportApi.dailyLogs();
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'daily_logs.xlsx'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Daily logs exported');
    } catch { toast.error('Failed to export daily logs'); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="dailylog-page">
      <div className="page-header">
        <h1 className="page-title">Daily Work Log</h1>
        <div className="header-actions">
          <button className="btn-add btn-secondary" onClick={handleExport}>
            <MdFileDownload /> Export
          </button>
          <button className="btn-add" onClick={openCreate}>
            <MdAdd /> New Entry
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : (
        <>
          <div className="log-list">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="log-card">
                  <div className="log-date">
                    <span className="log-day">{new Date(log.logDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' })}</span>
                    <span className="log-date-num">{new Date(log.logDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' })}</span>
                    <span className="log-month">{new Date(log.logDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="log-body">
                    <div className="log-meta">
                      {(log.fromTime || log.toTime) && (
                        <span className="log-time-badge">
                          <MdAccessTime /> {log.fromTime || '--:--'} – {log.toTime || '--:--'}
                        </span>
                      )}
                    </div>
                    <div className="log-content" dangerouslySetInnerHTML={{ __html: log.content }} />
                  </div>
                  <div className="log-actions">
                    <button className="btn-icon btn-edit" onClick={() => openEdit(log)}><MdEdit /></button>
                    <button className="btn-icon btn-delete" onClick={() => setDeleteId(log.id)}><MdDelete /></button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No daily logs yet. Start logging your work!</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingLog ? 'Edit Log Entry' : 'New Log Entry'}>
        <form onSubmit={handleSubmit} className="log-form">
          <div className="form-row form-row-3">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.logDate} onChange={(e) => setForm({ ...form, logDate: e.target.value })} required disabled={!!editingLog} />
            </div>
            <div className="form-group">
              <label>From</label>
              <input type="time" value={form.fromTime} onChange={(e) => setForm({ ...form, fromTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>To</label>
              <input type="time" value={form.toTime} onChange={(e) => setForm({ ...form, toTime: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>What did you work on today?</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required placeholder="Describe your work, accomplishments, blockers..." />
          </div>
          <button type="submit" className="btn-primary">
            {editingLog ? 'Update Entry' : 'Save Entry'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Log Entry"
        message="Are you sure you want to delete this log entry? This action cannot be undone."
      />
    </div>
  );
}
