import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdPushPin, MdFileDownload, MdTitle, MdNotes } from 'react-icons/md';
import { noteApi, exportApi } from '../services/api';
import { formatDateTimeIST } from '../utils/dateUtils';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import './Notes.css';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const { data } = await noteApi.getAll();
      setNotes(data);
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingNote(null);
    setForm({ title: '', content: '', isPinned: false });
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, isPinned: note.isPinned });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await noteApi.update(editingNote.id, form);
        toast.success('Note updated');
      } else {
        await noteApi.create(form);
        toast.success('Note created');
      }
      setModalOpen(false);
      loadNotes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save note');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await noteApi.update(note.id, { title: note.title, content: note.content, isPinned: !note.isPinned });
      loadNotes();
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    try {
      await noteApi.delete(deleteId);
      toast.success('Note deleted');
      setDeleteId(null);
      loadNotes();
    } catch (err) {
      toast.error('Failed to delete note');
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr) => formatDateTimeIST(dateStr);

  const handleExport = async () => {
    try {
      const response = await exportApi.notes();
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'notes.xlsx'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Notes exported');
    } catch { toast.error('Failed to export notes'); }
  };

  if (loading) return <div className="loading">Loading notes...</div>;

  return (
    <div className="notes-page">
      <div className="page-header">
        <h1 className="page-title">Notes</h1>
        <div className="header-actions">
          <button className="btn-add btn-secondary" onClick={handleExport}>
            <MdFileDownload /> Export
          </button>
          <button className="btn-add" onClick={openCreate}>
            <MdAdd /> New Note
          </button>
        </div>
      </div>

      <div className="notes-grid">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className={`note-card ${note.isPinned ? 'pinned' : ''}`}>
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <button
                  className={`btn-pin ${note.isPinned ? 'active' : ''}`}
                  onClick={() => handleTogglePin(note)}
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <MdPushPin />
                </button>
              </div>
              <div className="note-content">{note.content}</div>
              <div className="note-footer">
                <span className="note-date">{formatDate(note.updatedAt)}</span>
                <div className="note-actions">
                  <button className="btn-icon btn-edit" onClick={() => openEdit(note)}><MdEdit /></button>
                  <button className="btn-icon btn-delete" onClick={() => setDeleteId(note.id)}><MdDelete /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-message">No notes yet. Create your first note!</p>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingNote ? 'Edit Note' : 'New Note'}>
        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} placeholder="Note title..." />
          </div>
          <div className="form-section">
            <div className="form-section-header">
              <MdNotes className="form-section-icon" />
              <span>Content</span>
            </div>
            <div className="form-group">
              <label>Write your note</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} required placeholder="Write your note here..." />
            </div>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
            />
            Pin this note
          </label>
          <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
            {editingNote ? 'Update Note' : 'Save Note'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />
    </div>
  );
}
