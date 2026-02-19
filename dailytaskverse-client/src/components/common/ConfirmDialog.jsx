import { useEffect } from 'react';
import { MdWarningAmber } from 'react-icons/md';
import './ConfirmDialog.css';

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title = 'Delete', message = 'Are you sure? This action cannot be undone.' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <MdWarningAmber />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn confirm-btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
