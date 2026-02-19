import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdCheckCircle, MdFilterList, MdRepeat, MdFileDownload, MdNotificationsActive, MdClose, MdFlag, MdCategory, MdSchedule, MdNotifications, MdCalendarToday, MdAccessTime } from 'react-icons/md';
import { taskApi, exportApi } from '../services/api';
import { formatDateShortIST, todayIST } from '../utils/dateUtils';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CustomSelect from '../components/common/CustomSelect';
import CustomDatePicker from '../components/common/CustomDatePicker';
import CustomTimePicker from '../components/common/CustomTimePicker';
import toast from 'react-hot-toast';
import './Tasks.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ status: '', priority: '', category: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Pending', category: '', isRecurring: false, recurrencePattern: '', dueDate: todayIST(), reminder: '', customReminderDate: '', customReminderTime: '' });

  const categories = ['Development', 'Meetings', 'Code Review', 'Documentation', 'Testing', 'Design', 'Planning', 'Bug Fix', 'DevOps', 'Other'];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Pending', label: 'Pending', dot: '#f59e0b' },
    { value: 'InProgress', label: 'In Progress', dot: '#3b82f6' },
    { value: 'Completed', label: 'Completed', dot: '#10b981' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'Low', label: 'Low', dot: '#10b981' },
    { value: 'Medium', label: 'Medium', dot: '#f59e0b' },
    { value: 'High', label: 'High', dot: '#ef4444' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c, label: c })),
  ];

  const hasActiveFilters = filter.status || filter.priority || filter.category;
  const activeFilterCount = [filter.status, filter.priority, filter.category].filter(Boolean).length;

  const clearFilters = () => {
    setFilter({ status: '', priority: '', category: '' });
    setPage(1);
  };
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    loadTasks();
  }, [page, filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = { page, pageSize };
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.category) params.category = filter.category;
      const { data } = await taskApi.getAll(params);
      setTasks(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', priority: 'Medium', status: 'Pending', category: '', isRecurring: false, recurrencePattern: '', dueDate: todayIST(), reminder: '', customReminderDate: '', customReminderTime: '' });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      category: task.category || '',
      isRecurring: task.isRecurring || false,
      recurrencePattern: task.recurrencePattern || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      reminder: task.reminderAt ? 'custom' : '',
      customReminderDate: task.reminderAt ? task.reminderAt.slice(0, 10) : '',
      customReminderTime: task.reminderAt ? task.reminderAt.slice(11, 16) : '',
    });
    setModalOpen(true);
  };

  const computeReminderAt = () => {
    if (!form.reminder) return null;
    if (form.reminder === 'custom') {
      if (!form.customReminderDate) return null;
      const time = form.customReminderTime || '09:00';
      return `${form.customReminderDate}T${time}`;
    }
    if (!form.dueDate) return null;
    const due = new Date(form.dueDate + 'T09:00:00');
    const offsets = { '1h': 1/24, '1d': 1, '3d': 3 };
    const days = offsets[form.reminder];
    if (!days) return null;
    due.setDate(due.getDate() - Math.floor(days));
    if (days < 1) due.setHours(due.getHours() - 1);
    return due.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reminderAt = computeReminderAt();
      const payload = { ...form, dueDate: form.dueDate || null, reminderAt };
      delete payload.reminder;
      delete payload.customReminderDate;
      delete payload.customReminderTime;
      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        toast.success('Task updated');
      } else {
        await taskApi.create(payload);
        toast.success('Task created');
      }
      setModalOpen(false);
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await taskApi.complete(id);
      toast.success('Task marked as completed');
      loadTasks();
    } catch (err) {
      toast.error('Failed to complete task');
    }
  };

  const handleDelete = async () => {
    try {
      await taskApi.delete(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
      loadTasks();
    } catch (err) {
      toast.error('Failed to delete task');
      setDeleteId(null);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      if (filter.category) params.category = filter.category;
      const response = await exportApi.tasks(params);
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'tasks.xlsx'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Tasks exported');
    } catch { toast.error('Failed to export tasks'); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <div className="header-actions">
          <button className="btn-add btn-secondary" onClick={handleExport}>
            <MdFileDownload /> Export
          </button>
          <button className="btn-add" onClick={openCreate}>
            <MdAdd /> New Task
          </button>
        </div>
      </div>

      <div className="filters">
        <MdFilterList className="filter-icon" />
        <CustomSelect
          value={filter.status}
          onChange={(val) => { setFilter({ ...filter, status: val }); setPage(1); }}
          options={statusOptions}
          placeholder="All Status"
        />
        <CustomSelect
          value={filter.priority}
          onChange={(val) => { setFilter({ ...filter, priority: val }); setPage(1); }}
          options={priorityOptions}
          placeholder="All Priority"
        />
        <CustomSelect
          value={filter.category}
          onChange={(val) => { setFilter({ ...filter, category: val }); setPage(1); }}
          options={categoryOptions}
          placeholder="All Categories"
        />
        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={clearFilters} title="Clear all filters">
            <MdClose />
            <span>Clear{activeFilterCount > 1 ? ` (${activeFilterCount})` : ''}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <>
          <div className="task-list">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-main">
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-badges">
                        <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <span className={`badge status-${task.status.toLowerCase()}`}>{task.status}</span>
                        {task.category && <span className="badge badge-category">{task.category}</span>}
                        {task.isRecurring && <span className="badge badge-recurring"><MdRepeat /> {task.recurrencePattern}</span>}
                        {task.reminderAt && new Date(task.reminderAt) > new Date() && (
                          <span className="badge badge-reminder"><MdNotificationsActive /> Reminder</span>
                        )}
                      </div>
                    </div>
                    {task.description && <p className="task-desc">{task.description}</p>}
                    {task.dueDate && (
                      <span className="task-due">Due: {formatDateShortIST(task.dueDate)}</span>
                    )}
                  </div>
                  <div className="task-actions">
                    {task.status !== 'Completed' && (
                      <button className="btn-icon btn-complete" onClick={() => handleComplete(task.id)} title="Mark Complete">
                        <MdCheckCircle />
                      </button>
                    )}
                    <button className="btn-icon btn-edit" onClick={() => openEdit(task)} title="Edit">
                      <MdEdit />
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => setDeleteId(task.id)} title="Delete">
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No tasks found. Create your first task!</p>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={500} placeholder="What needs to be done?" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} maxLength={4000} placeholder="Add details (optional)" />
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <MdFlag className="form-section-icon" />
              <span>Priority & Category</span>
            </div>
            <div className="form-row form-row-3">
              <div className="form-group">
                <label>Priority</label>
                <CustomSelect
                  value={form.priority}
                  onChange={(val) => setForm({ ...form, priority: val })}
                  options={[
                    { value: 'Low', label: 'Low', dot: '#10b981' },
                    { value: 'Medium', label: 'Medium', dot: '#f59e0b' },
                    { value: 'High', label: 'High', dot: '#ef4444' },
                  ]}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <CustomSelect
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val })}
                  options={[
                    { value: '', label: 'None' },
                    ...categories.map(c => ({ value: c, label: c, icon: <MdCategory style={{ color: 'var(--cosmic-primary)', fontSize: '0.85rem' }} /> })),
                  ]}
                  placeholder="Select category"
                />
              </div>
              {editingTask && (
                <div className="form-group">
                  <label>Status</label>
                  <CustomSelect
                    value={form.status}
                    onChange={(val) => setForm({ ...form, status: val })}
                    options={[
                      { value: 'Pending', label: 'Pending', dot: '#f59e0b' },
                      { value: 'InProgress', label: 'In Progress', dot: '#3b82f6' },
                      { value: 'Completed', label: 'Completed', dot: '#10b981' },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <MdCalendarToday className="form-section-icon" />
              <span>Schedule</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <CustomDatePicker value={form.dueDate} onChange={(val) => setForm({ ...form, dueDate: val })} placeholder="Pick a date" />
              </div>
              <div className="form-group">
                <label>Remind Me</label>
                <CustomSelect
                  value={form.reminder}
                  onChange={(val) => setForm({ ...form, reminder: val })}
                  options={[
                    { value: '', label: 'No Reminder' },
                    ...(form.dueDate ? [
                      { value: '1h', label: '1 hour before due', icon: <MdAccessTime style={{ color: '#f59e0b', fontSize: '0.85rem' }} /> },
                      { value: '1d', label: '1 day before due', icon: <MdSchedule style={{ color: '#3b82f6', fontSize: '0.85rem' }} /> },
                      { value: '3d', label: '3 days before due', icon: <MdSchedule style={{ color: '#10b981', fontSize: '0.85rem' }} /> },
                    ] : []),
                    { value: 'custom', label: 'Custom date/time', icon: <MdNotifications style={{ color: '#8b5cf6', fontSize: '0.85rem' }} /> },
                  ]}
                  placeholder="No Reminder"
                />
              </div>
            </div>
            {form.reminder === 'custom' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Reminder Date</label>
                  <CustomDatePicker value={form.customReminderDate} onChange={(val) => setForm({ ...form, customReminderDate: val })} placeholder="Pick date" />
                </div>
                <div className="form-group">
                  <label>Reminder Time</label>
                  <CustomTimePicker value={form.customReminderTime} onChange={(val) => setForm({ ...form, customReminderTime: val })} placeholder="Pick time" />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group form-group-inline">
                <label className="toggle-label" onClick={() => setForm({ ...form, isRecurring: !form.isRecurring, recurrencePattern: !form.isRecurring ? 'Daily' : '' })}>
                  <span className={`toggle-switch ${form.isRecurring ? 'active' : ''}`}>
                    <span className="toggle-knob" />
                  </span>
                  Recurring Task
                </label>
              </div>
              {form.isRecurring && (
                <div className="form-group">
                  <label>Repeat</label>
                  <CustomSelect
                    value={form.recurrencePattern}
                    onChange={(val) => setForm({ ...form, recurrencePattern: val })}
                    options={[
                      { value: 'Daily', label: 'Daily', icon: <MdRepeat style={{ color: '#3b82f6', fontSize: '0.85rem' }} /> },
                      { value: 'Weekly', label: 'Weekly', icon: <MdRepeat style={{ color: '#8b5cf6', fontSize: '0.85rem' }} /> },
                      { value: 'Monthly', label: 'Monthly', icon: <MdRepeat style={{ color: '#10b981', fontSize: '0.85rem' }} /> },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}
